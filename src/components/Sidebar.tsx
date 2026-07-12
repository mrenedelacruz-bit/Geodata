import { BUSINESS_CATEGORIES } from '../data/categories';
import type { BusinessCategory, GridCell } from '../types';
import SearchBox from './SearchBox';
import type { LatLon } from '../types';

interface PointAnalysis {
  point: LatLon;
  label: string;
  score: number | null;
  competitorCount: number;
  anchorScore: number;
  nearby: { anchor: string; count: number }[];
}

interface Props {
  category: BusinessCategory;
  onCategoryChange: (c: BusinessCategory) => void;
  grid: GridCell[];
  loading: boolean;
  error: string | null;
  poiCount: number;
  onSearchSelect: (p: LatLon, label: string) => void;
  onSelectCell: (cell: GridCell) => void;
  pointAnalysis: PointAnalysis | null;
}

export default function Sidebar({
  category,
  onCategoryChange,
  grid,
  loading,
  error,
  poiCount,
  onSearchSelect,
  onSelectCell,
  pointAnalysis,
}: Props) {
  const topZones = [...grid].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <aside className="sidebar">
      <h1>Asesor de Ubicación · Santo Domingo</h1>
      <p className="subtitle">
        Encuentra las mejores zonas para tu negocio combinando POIs, densidad comercial y competencia,
        usando datos abiertos de OpenStreetMap.
      </p>

      <SearchBox onSelect={onSearchSelect} />

      <label className="field">
        <span>Tipo de negocio</span>
        <select
          value={category.id}
          onChange={(e) => {
            const next = BUSINESS_CATEGORIES.find((c) => c.id === e.target.value);
            if (next) onCategoryChange(next);
          }}
        >
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </label>

      {loading && <p className="status">Cargando datos de OpenStreetMap para Santo Domingo…</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && <p className="status">{poiCount.toLocaleString('es-DO')} puntos de interés cargados</p>}

      {pointAnalysis && (
        <div className="panel">
          <h2>Punto seleccionado</h2>
          <p className="point-label" style={{
            fontSize: '16px',
            fontWeight: pointAnalysis.label.startsWith('Punto') ? '400' : '600',
            color: pointAnalysis.label.startsWith('Punto') ? '#666' : '#111827'
          }}>
            {pointAnalysis.label}
          </p>

          {pointAnalysis.score !== null && (
            <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px', borderLeft: '3px solid #0ea5e9' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '4px' }}>
                Score: {pointAnalysis.score}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Score de la zona (demanda por anclas menos competencia)
              </div>
            </div>
          )}

          <ul className="stat-list">
            <li>
              <strong>{pointAnalysis.anchorScore.toFixed(1)}</strong> demanda (POIs atractivos cercanos)
            </li>
            <li>
              <strong>{pointAnalysis.competitorCount}</strong> {category.competitorLabel.toLowerCase()} en radio de búsqueda
            </li>
          </ul>
          {pointAnalysis.nearby.length > 0 && (
            <>
              <p style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '10px', marginBottom: '6px' }}>Recursos cercanos:</p>
              <ul className="anchor-list">
                {pointAnalysis.nearby.slice(0, 5).map((n) => (
                  <li key={n.anchor}>
                    {n.anchor}: {n.count}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="panel">
        <h2>Top 10 zonas recomendadas</h2>
        <p className="hint">para {category.label.toLowerCase()}</p>
        <ol className="zone-list">
          {topZones.map((cell) => (
            <li key={`${cell.row}_${cell.col}`} onClick={() => onSelectCell(cell)}>
              <span className="score-pill" style={{ background: `hsl(${(cell.score / 100) * 120}, 70%, 45%)` }}>
                {cell.score}
              </span>
              <span>
                {cell.center.lat.toFixed(4)}, {cell.center.lon.toFixed(4)} · {cell.competitorCount} competidores cerca
              </span>
            </li>
          ))}
        </ol>
      </div>

      <footer>
        <p>
          Datos: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>{' '}
          contributors (ODbL). El puntaje es un modelo aproximado (demanda por anclas cercanas menos densidad de
          competencia); no sustituye un estudio de mercado formal. La densidad poblacional usa zonas residenciales de
          OSM como proxy — sustitúyela por cifras oficiales de la ONE cuando estén disponibles.
        </p>
      </footer>
    </aside>
  );
}
