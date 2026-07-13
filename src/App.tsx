import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { BUSINESS_CATEGORIES } from './data/categories';
import { fetchOsmPOIs } from './lib/overpass';
import { computeGrid, scoreAtPoint, findPoiAtPoint, SANTO_DOMINGO_BBOX } from './lib/grid';
import { fetchTrafficWays } from './lib/traffic';
import { MANUAL_POIS } from './data/manualPois';
import type { GridCell, LatLon, OsmPOI, TrafficWay } from './types';
import './App.css';

export default function App() {
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

  useEffect(() => {
    Promise.all([
      fetchOsmPOIs(SANTO_DOMINGO_BBOX),
      fetchTrafficWays(SANTO_DOMINGO_BBOX),
    ])
      .then(([poiData, trafficData]) => {
        setPois([...poiData, ...MANUAL_POIS]);
        setTrafficWays(trafficData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error desconocido'))
      .finally(() => setLoading(false));
  }, []);

  const grid = useMemo(() => (pois.length ? computeGrid(pois, category) : []), [pois, category]);

  const competitors = useMemo(() => pois.filter((p) => category.matchesCompetitor(p.tags)), [pois, category]);

  const pointAnalysis = useMemo(() => {
    if (!selectedPoint || !pois.length) return null;
    const result = scoreAtPoint(pois, category, selectedPoint.point);
    const { lat, lon } = selectedPoint.point;
    const cell = grid.find(
      (c) =>
        lat >= c.bounds[0][0] && lat < c.bounds[1][0] && lon >= c.bounds[0][1] && lon < c.bounds[1][1],
    );
    return { point: selectedPoint.point, label: selectedPoint.label, score: cell?.score ?? null, ...result };
  }, [selectedPoint, pois, category, grid]);

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
        />
      </main>
    </div>
  );
}
