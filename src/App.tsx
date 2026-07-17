import { useEffect, useMemo, useRef, useState } from 'react';
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

const METERS_PER_DEG_LAT = 111_320;

/** Distancia en metros entre dos puntos (aproximación plana, suficiente a escala urbana). */
function distanceMeters(a: LatLon, b: LatLon): number {
  const dLat = (a.lat - b.lat) * METERS_PER_DEG_LAT;
  const dLon = (a.lon - b.lon) * METERS_PER_DEG_LAT * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/**
 * Estado inicial desde los parámetros de la URL, para que un enlace copiado
 * reproduzca el mismo análisis: ?cat=<rubro>&lat=..&lon=..&milat=..&milon=..&capas=a,b,c
 */
function initialParams() {
  const p = new URLSearchParams(window.location.search);
  const category = BUSINESS_CATEGORIES.find((c) => c.id === p.get('cat')) ?? BUSINESS_CATEGORIES[0];
  const lat = Number(p.get('lat'));
  const lon = Number(p.get('lon'));
  const point =
    Number.isFinite(lat) && Number.isFinite(lon) && p.has('lat') && p.has('lon')
      ? { point: { lat, lon }, label: `Punto (${lat.toFixed(4)}, ${lon.toFixed(4)})` }
      : null;
  const milat = Number(p.get('milat'));
  const milon = Number(p.get('milon'));
  const myLocation =
    Number.isFinite(milat) && Number.isFinite(milon) && p.has('milat') && p.has('milon')
      ? { lat: milat, lon: milon }
      : null;
  const capas = p.get('capas')?.split(',') ?? ['competencia'];
  return {
    category,
    point,
    myLocation,
    showHeatmap: capas.includes('calor'),
    showGrid: capas.includes('cuadricula'),
    showCompetitors: capas.includes('competencia'),
    showCensus: capas.includes('censo'),
  };
}

export default function App({ location }: AppProps) {
  const [initial] = useState(initialParams);
  const [pois, setPois] = useState<OsmPOI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(initial.category);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ point: LatLon; label: string } | null>(initial.point);
  const [myLocation, setMyLocation] = useState<LatLon | null>(initial.myLocation);
  const [comparisonCells, setComparisonCells] = useState<GridCell[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(initial.showHeatmap);
  const [showGrid, setShowGrid] = useState(initial.showGrid);
  const [showCompetitors, setShowCompetitors] = useState(initial.showCompetitors);
  const [showCensus, setShowCensus] = useState(initial.showCensus);

  const locationConfig = getLocation(location);
  const prevLocation = useRef(location);

  // Mantiene la URL sincronizada con el análisis actual para poder compartirla.
  // replaceState (no pushState) para no llenar el historial del navegador.
  useEffect(() => {
    const p = new URLSearchParams();
    if (category.id !== BUSINESS_CATEGORIES[0].id) p.set('cat', category.id);
    if (selectedPoint) {
      p.set('lat', selectedPoint.point.lat.toFixed(6));
      p.set('lon', selectedPoint.point.lon.toFixed(6));
    }
    if (myLocation) {
      p.set('milat', myLocation.lat.toFixed(6));
      p.set('milon', myLocation.lon.toFixed(6));
    }
    const capas = [
      showHeatmap && 'calor',
      showGrid && 'cuadricula',
      showCompetitors && 'competencia',
      showCensus && 'censo',
    ]
      .filter(Boolean)
      .join(',');
    if (capas !== 'competencia') p.set('capas', capas);
    const qs = p.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
  }, [category, selectedPoint, myLocation, showHeatmap, showGrid, showCompetitors, showCensus]);

  useEffect(() => {
    // Al cambiar de ciudad (no en el primer montaje, para respetar el estado
    // que venga en la URL compartida), descartar el análisis de la anterior.
    if (prevLocation.current !== location) {
      prevLocation.current = location;
      setSelectedCell(null);
      setSelectedPoint(null);
      setMyLocation(null);
      setComparisonCells([]);
    }
    setLoading(true);
    setError(null);
    setPois([]);
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

  // Análisis fijo en "mi ubicación" (independiente del punto seleccionado).
  const myAnalysis = useMemo(() => {
    if (!myLocation || !pois.length) return null;
    const result = scoreAtPoint(pois, category, myLocation);
    const cell = grid.find(
      (c) =>
        myLocation.lat >= c.bounds[0][0] &&
        myLocation.lat < c.bounds[1][0] &&
        myLocation.lon >= c.bounds[0][1] &&
        myLocation.lon < c.bounds[1][1],
    );
    const sector = sectorAt(myLocation, location);
    return { score: cell?.score ?? null, sector, ...result };
  }, [myLocation, pois, category, grid, location]);

  // Competidores del rubro ordenados por distancia a mi ubicación.
  const nearestCompetitors = useMemo(() => {
    if (!myLocation) return [];
    return competitors
      .map((poi) => ({ poi, distance: distanceMeters(myLocation, poi) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
  }, [myLocation, competitors]);

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
        myLocation={myLocation}
        onSetMyLocation={setMyLocation}
        myAnalysis={myAnalysis}
        nearestCompetitors={nearestCompetitors}
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
          myLocation={myLocation}
          nearestCompetitors={nearestCompetitors}
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
