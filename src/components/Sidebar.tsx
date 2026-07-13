import { BUSINESS_CATEGORIES } from '../data/categories';
import { powerLabel, powerColor, sectorAt, type CensusSector } from '../data/census';
import { saturationLabel, saturationColor } from '../lib/saturation';
import type { BusinessCategory, GridCell } from '../types';
import SearchBox from './SearchBox';
import type { LatLon } from '../types';

interface PointAnalysis {
  point: LatLon;
  label: string;
  score: number | null;
  sector: CensusSector | null;
  competitorCount: number;
  anchorScore: number;
  nearby: { anchor: string; count: number }[];
}

interface Props {
  title: string;
  locationLabel: string;
  category: BusinessCategory;
  onCategoryChange: (c: BusinessCategory) => void;
  grid: GridCell[];
  loading: boolean;
  error: string | null;
  poiCount: number;
  onSearchSelect: (p: LatLon, label: string) => void;
  onSelectCell: (cell: GridCell) => void;
  pointAnalysis: PointAnalysis | null;
  comparisonCells: GridCell[];
  onToggleComparison: (cell: GridCell) => void;
  location: string;
}

export default function Sidebar({
  title,
  locationLabel,
  category,
  onCategoryChange,
  grid,
  loading,
  error,
  poiCount,
  onSearchSelect,
  onSelectCell,
  pointAnalysis,
  comparisonCells,
  onToggleComparison,
  location,
}: Props) {
  const topZones = [...grid].sort((a, b) => b.score - a.score).slice(0, 10);

  const isInComparison = (cell: GridCell) =>
    comparisonCells.some((c) => c.row === cell.row && c.col === cell.col);

  return (
    <aside className="sidebar">
      <h1>{title}</h1>
      <p className="subtitle">
        Encuentra las mejores zonas para tu negocio combinando POIs, densidad comercial y competencia,
        usando datos abiertos de OpenStreetMap.
      </p>

      <SearchBox onSelect={onSearchSelect} locationLabel={locationLabel} />

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

      {loading && <p className="status">Cargando datos de OpenStreetMap para {locationLabel}…</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && <p className="status">{poiCount.toLocaleString('es-DO')} puntos de interés cargados</p>}

      {comparisonCells.length > 0 && (
        <div className="panel" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ margin: 0 }}>Comparación de zonas</h2>
            <button
              onClick={() => {
                comparisonCells.forEach(onToggleComparison);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Limpiar
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {comparisonCells.map((cell, idx) => {
              const sector = sectorAt(cell.center, location);
              return (
                <div
                  key={`${cell.row}_${cell.col}`}
                  style={{
                    padding: '10px',
                    backgroundColor: '#fafafa',
                    borderRadius: '6px',
                    border: '2px solid #f59e0b',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#111827' }}>
                    Zona {idx + 1}
                  </div>
                  <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0ea5e9' }}>
                      {Math.round(cell.score)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666' }}>Score</div>
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <div>📊 Demanda: <strong>{Math.round(cell.anchorScore)}</strong></div>
                    <div>🏢 Competencia: <strong>{cell.competitorCount}</strong></div>
                  </div>
                  {sector && (
                    <div style={{ paddingTop: '6px', borderTop: '1px solid #e5e7eb', fontSize: '11px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{sector.name}</div>
                      <div style={{ color: powerColor(sector.purchasingPower) }}>
                        {powerLabel(sector.purchasingPower)}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => onToggleComparison(cell)}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '4px',
                      fontSize: '10px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Quitar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                Score de la zona: demanda por anclas × poder adquisitivo, menos competencia
              </div>
            </div>
          )}

          {pointAnalysis.sector && (
            <div style={{ marginBottom: '10px', padding: '8px 10px', backgroundColor: '#f7fafc', borderRadius: '6px', border: '1px solid #e5edf3', fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                📍 {pointAnalysis.sector.name} · {pointAnalysis.sector.municipio}
              </div>
              <div>
                Poder adquisitivo:{' '}
                <strong style={{ color: powerColor(pointAnalysis.sector.purchasingPower) }}>
                  {powerLabel(pointAnalysis.sector.purchasingPower)}
                </strong>
              </div>
              {pointAnalysis.sector.povertyRate !== undefined && (
                <div>Hogares pobres: {pointAnalysis.sector.povertyRate}% (SIUBEN)</div>
              )}
              <div style={{ fontSize: '10px', color: '#7a8a99', marginTop: '3px' }}>
                {pointAnalysis.sector.dataQuality === 'sourced'
                  ? 'Fuente: SIUBEN/MEPyD · Censo ONE 2022'
                  : 'Estimación derivada de estrato ICV municipal'}
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
            <li
              key={`${cell.row}_${cell.col}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingRight: '8px',
                cursor: 'pointer',
                borderLeft: isInComparison(cell) ? '3px solid #f59e0b' : 'none',
                paddingLeft: isInComparison(cell) ? '8px' : '11px',
              }}
            >
              <span onClick={() => onSelectCell(cell)} style={{ flex: 1 }}>
                <span className="score-pill" style={{ background: `hsl(${(cell.score / 100) * 120}, 70%, 45%)` }}>
                  {cell.score}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#fff',
                    background: saturationColor(cell.saturationLevel),
                    borderRadius: '8px',
                    padding: '1px 6px',
                    marginRight: '6px',
                  }}
                >
                  {saturationLabel(cell.saturationLevel)}
                </span>
                <span>
                  {cell.center.lat.toFixed(4)}, {cell.center.lon.toFixed(4)} · {cell.competitorCount} competidores cerca
                </span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComparison(cell);
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  background: isInComparison(cell) ? '#fee2e2' : '#f3f4f6',
                  color: isInComparison(cell) ? '#991b1b' : '#374151',
                  border: isInComparison(cell) ? '1px solid #fecaca' : '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  marginLeft: '6px',
                }}
              >
                {isInComparison(cell) ? '✓' : '+'}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <footer>
        <p>
          Datos: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>{' '}
          contributors (ODbL). Datos socioeconómicos: Censo ONE 2022 y SIUBEN/MEPyD (índice ICV y tasas de pobreza
          por sector; algunos sectores usan estimaciones derivadas del estrato municipal). El puntaje es un modelo
          aproximado (demanda por anclas ajustada por poder adquisitivo, menos densidad de competencia); no sustituye
          un estudio de mercado formal.
        </p>
      </footer>
    </aside>
  );
}
