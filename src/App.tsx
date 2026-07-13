import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { BUSINESS_CATEGORIES } from './data/categories';
import { fetchOsmPOIs } from './lib/overpass';
import { computeGrid, scoreAtPoint, findPoiAtPoint } from './lib/grid';
import { fetchTrafficWays } from './lib/traffic';
import { getManualPOIs } from './data/manualPois';
import { sectorAt } from './data/census';
import { getLocation } from './data/locations';
import type { GridCell, LatLon, OsmPOI, TrafficWay } from './types';
import './App.css';

interface AppProps {
  location: string;
}

export default function App({ location }: AppProps) {
  const [pois, setPois] = useState<OsmPOI[]>([]);
  const [trafficWays, setTrafficWays] = useState<TrafficWay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ point: LatLon; label: string } | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showCompetitors, setShowCompetitors] = useState(true);
  const [showCensus, setShowCensus] = useState(false);

  const locationConfig = getLocation(location);

  useEffect(() => {
    Promise.all([
      fetchOsmPOIs(locationConfig.bbox),
      fetchTrafficWays(locationConfig.bbox),
    ])
      .then(([poiData, trafficData]) => {
        setPois([...poiData, ...getManualPOIs(location)]);
        setTrafficWays(trafficData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error desconocido'))
      .finally(() => setLoading(false));
  }, [location, locationConfig.bbox]);

  const grid = useMemo(() => (pois.length ? computeGrid(pois, category, location) : []), [pois, category, location]);

  const competitors = useMemo(() => pois.filter((p) => category.matchesCompetitor(p.tags)), [pois, category]);

  const pointAnalysis = useMemo(() => {
    if (!selectedPoint || !pois.length) return null;
    const result = scoreAtPoint(pois, category, selectedPoint.point);
    const { lat, lon } = selectedPoint.point;
    const cell = grid.find(
      (c) =>
        lat >= c.bounds[0][0] && lat < c.bounds[1][0] && lon >= c.bounds[0][1] && lon < c.bounds[1][1],
    );
    const sector = sectorAt(selectedPoint.point, location);
    return { point: selectedPoint.point, label: selectedPoint.label, score: cell?.score ?? null, sector, ...result };
  }, [selectedPoint, pois, category, grid, location]);

  function handleMapClick(p: LatLon) {
    const poi = findPoiAtPoint(pois, p);
    const label = poi?.tags.name || `Punto (${p.lat.toFixed(4)}, ${p.lon.toFixed(4)})`;
    setSelectedPoint({ point: p, label });
    setSelectedCell(null);
  }

  function handleSearchSelect(p: LatLon, label: string) {
    setSelectedPoint({ point: p, label });
    setSelectedCell(null);
  }

  function handleSelectCell(cell: GridCell) {
    setSelectedCell(cell);
    setSelectedPoint({ point: cell.center, label: `Zona (${cell.center.lat.toFixed(4)}, ${cell.center.lon.toFixed(4)})` });
  }

  return (
    <div className="layout">
      <Sidebar
        title={locationConfig.title}
        category={category}
        onCategoryChange={setCategory}
        grid={grid}
        loading={loading}
        error={error}
        poiCount={pois.length}
        onSearchSelect={handleSearchSelect}
        onSelectCell={handleSelectCell}
        pointAnalysis={pointAnalysis}
      />
      <main className="map-area">
        <MapView
          location={location}
          grid={grid}
          category={category}
          competitors={competitors}
          trafficWays={trafficWays}
          onMapClick={handleMapClick}
          selectedCell={selectedCell}
          onSelectCell={handleSelectCell}
          showHeatmap={showHeatmap}
          onHeatmapToggle={setShowHeatmap}
          showGrid={showGrid}
          onGridToggle={setShowGrid}
          showTraffic={showTraffic}
          onTrafficToggle={setShowTraffic}
          showCompetitors={showCompetitors}
          onCompetitorsToggle={setShowCompetitors}
          showCensus={showCensus}
          onCensusToggle={setShowCensus}
        />
      </main>
    </div>
  );
}
