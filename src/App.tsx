import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { BUSINESS_CATEGORIES } from './data/categories';
import { fetchOsmPOIs } from './lib/overpass';
import { computeGrid, scoreAtPoint, findPoiAtPoint } from './lib/grid';
import { mergeManualPois } from './data/manualPois';
import { sectorAt } from './data/census';
import { getLocation } from './data/locations';
import type { GridCell, LatLon, OsmPOI } from './types';
import './App.css';

interface AppProps {
  location: string;
}

export default function App({ location }: AppProps) {
  const [pois, setPois] = useState<OsmPOI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ point: LatLon; label: string } | null>(null);
  const [comparisonCells, setComparisonCells] = useState<GridCell[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showCompetitors, setShowCompetitors] = useState(true);
  const [showCensus, setShowCensus] = useState(false);

  const locationConfig = getLocation(location);

  useEffect(() => {
    // Al cambiar de ciudad, descartar todo el estado de la anterior para no
    // mostrar sus datos mientras cargan los nuevos.
    setLoading(true);
    setError(null);
    setPois([]);
    setSelectedCell(null);
    setSelectedPoint(null);
    setComparisonCells([]);
    let cancelled = false;
    fetchOsmPOIs(locationConfig.bbox)
      .then((poiData) => {
        if (cancelled) return;
        setPois(mergeManualPois(poiData, location));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location, locationConfig.bbox]);

  // Los scores de la comparación dependen del rubro: al cambiarlo dejan de
  // ser comparables y se vacía la selección.
  useEffect(() => {
    setComparisonCells([]);
  }, [category]);

  const grid = useMemo(() => (pois.length ? computeGrid(pois, category, location) : []), [pois, category, location]);

  const competitors = useMemo(() => pois.filter((p) => category.matchesCompetitor(p.tags)), [pois, category]);

  // Totales por rubro para toda la ciudad activa, sin importar el rubro
  // seleccionado en el selector principal.
  const categoryTotals = useMemo(
    () => BUSINESS_CATEGORIES.map((c) => ({ category: c, count: pois.filter((p) => c.matchesCompetitor(p.tags)).length })),
    [pois],
  );

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

  function handleToggleComparison(cell: GridCell) {
    setComparisonCells((prev) => {
      const isAlreadySelected = prev.some((c) => c.row === cell.row && c.col === cell.col);
      if (isAlreadySelected) {
        return prev.filter((c) => !(c.row === cell.row && c.col === cell.col));
      }
      if (prev.length < 2) {
        return [...prev, cell];
      }
      return prev;
    });
  }

  return (
    <div className="layout">
      <Sidebar
        title={locationConfig.title}
        locationLabel={locationConfig.label}
        category={category}
        onCategoryChange={setCategory}
        grid={grid}
        loading={loading}
        error={error}
        poiCount={pois.length}
        onSearchSelect={handleSearchSelect}
        onSelectCell={handleSelectCell}
        pointAnalysis={pointAnalysis}
        comparisonCells={comparisonCells}
        onToggleComparison={handleToggleComparison}
        location={location}
        categoryTotals={categoryTotals}
      />
      <main className="map-area">
        <MapView
          location={location}
          grid={grid}
          category={category}
          competitors={competitors}
          onMapClick={handleMapClick}
          selectedCell={selectedCell}
          onSelectCell={handleSelectCell}
          comparisonCells={comparisonCells}
          showHeatmap={showHeatmap}
          onHeatmapToggle={setShowHeatmap}
          showGrid={showGrid}
          onGridToggle={setShowGrid}
          showCompetitors={showCompetitors}
          onCompetitorsToggle={setShowCompetitors}
          showCensus={showCensus}
          onCensusToggle={setShowCensus}
        />
      </main>
    </div>
  );
}
