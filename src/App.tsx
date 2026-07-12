import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { BUSINESS_CATEGORIES } from './data/categories';
import { fetchOsmPOIs } from './lib/overpass';
import { computeGrid, scoreAtPoint, SANTO_DOMINGO_BBOX } from './lib/grid';
import type { GridCell, LatLon, OsmPOI } from './types';
import './App.css';

export default function App() {
  const [pois, setPois] = useState<OsmPOI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ point: LatLon; label: string } | null>(null);

  useEffect(() => {
    fetchOsmPOIs(SANTO_DOMINGO_BBOX)
      .then((data) => setPois(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Error desconocido'))
      .finally(() => setLoading(false));
  }, []);

  const grid = useMemo(() => (pois.length ? computeGrid(pois, category) : []), [pois, category]);

  const competitors = useMemo(() => pois.filter((p) => category.matchesCompetitor(p.tags)), [pois, category]);

  const pointAnalysis = useMemo(() => {
    if (!selectedPoint || !pois.length) return null;
    const result = scoreAtPoint(pois, category, selectedPoint.point);
    return { point: selectedPoint.point, label: selectedPoint.label, ...result };
  }, [selectedPoint, pois, category]);

  function handleMapClick(p: LatLon) {
    setSelectedPoint({ point: p, label: `Punto (${p.lat.toFixed(4)}, ${p.lon.toFixed(4)})` });
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
          onMapClick={handleMapClick}
          selectedCell={selectedCell}
          onSelectCell={handleSelectCell}
        />
      </main>
    </div>
  );
}
