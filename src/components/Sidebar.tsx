import { useState } from 'react';
import { BUSINESS_CATEGORIES } from '../data/categories';
import { powerLabel, powerColor, sectorAt, type CensusSector } from '../data/census';
import { saturationLabel, saturationColor } from '../lib/saturation';
import { openPrintReport } from '../lib/report';
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

interface MyAnalysis {
  score: number | null;
  sector: CensusSector | null;
  competitorCount: number;
  anchorScore: number;
  nearby: { anchor: string; count: number }[];
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
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
  categoryTotals: { category: BusinessCategory; count: number }[];
  myLocation: LatLon | null;
  onSetMyLocation: (p: LatLon | null) => void;
  myAnalysis: MyAnalysis | null;
  nearestCompetitors: { poi: { id: number; tags: Record<string, string> }; distance: number }[];
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
  categoryTotals,
  myLocation,
  onSetMyLocation,
  myAnalysis,
  nearestCompetitors,
}: Props) {
  const topZones = [...grid].sort((a, b) => b.score - a.score).slice(0, 10);
  const totalAllCategories = categoryTotals.reduce((sum, t) => sum + t.count, 0);
  const [linkCopied, setLinkCopied] = useState(false);

  const isInComparison = (cell: GridCell) =>
    comparisonCells.some((c) => c.row === cell.row && c.col === cell.col);

  function handleCopyLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch(() => {
        // Portapapeles no disponible (contexto inseguro): mostrar la URL para copiar a mano.
        window.prompt('Copia el enlace:', window.location.href);
      });
  }

  function handleExportReport() {
    openPrintReport({
      locationLabel,
      category,
      pointAnalysis,
      topZones,
      categoryTotals,
      poiCount,
    });
  }

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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={handleExportReport}
          disabled={loading || !!error}
          style={{
            flex: 1,
            padding: '7px 10px',
            fontSize: '12px',
            fontWeight: 600,
            background: loading || error ? '#e5e7eb' : '#0b5fa5',
            color: loading || error ? '#9ca3af' : '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || error ? 'not-allowed' : 'pointer',
          }}
        >
          📄 Exportar reporte (PDF)
        </button>
        <button
          onClick={handleCopyLink}
          title="Copia un enlace que reproduce este mismo análisis (ciudad, rubro, punto y capas)"
          style={{
            padding: '7px 10px',
            fontSize: '12px',
            fontWeight: 600,
            background: linkCopied ? '#dcfce7' : '#f3f4f6',
            color: linkCopied ? '#166534' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {linkCopied ? '✓ Copiado' : '🔗 Copiar enlace'}
        </button>
      </div>

      {myLocation && myAnalysis && (
        <div className="panel" style={{ borderLeft: '3px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ margin: 0 }}>📌 Mi ubicación vs. competidores</h2>
            <button
              onClick={() => onSetMyLocation(null)}
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
              Quitar
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 8px' }}>
            {myLocation.lat.toFixed(5)}, {myLocation.lon.toFixed(5)}
          </p>
          <ul className="stat-list">
            {myAnalysis.score !== null && (
              <li>
                <strong>{myAnalysis.score}</strong> score de mi zona
              </li>
            )}
            <li>
              <strong>{myAnalysis.anchorScore.toFixed(1)}</strong> demanda en 500 m
            </li>
            <li>
              <strong>{myAnalysis.competitorCount}</strong> {category.competitorLabel.toLowerCase()} en 500 m
            </li>
            {myAnalysis.sector && (
              <li>
                Poder adquisitivo:{' '}
                <strong style={{ color: powerColor(myAnalysis.sector.purchasingPower) }}>
                  {powerLabel(myAnalysis.sector.purchasingPower)}
                </strong>
              </li>
            )}
          </ul>
          {nearestCompetitors.length > 0 ? (
            <>
              <p style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '10px', marginBottom: '6px' }}>
                {category.competitorLabel} más cercanos:
              </p>
              <ol className="zone-list">
                {nearestCompetitors.map(({ poi, distance }) => (
                  <li key={poi.id} style={{ cursor: 'default' }}>
                    <span
                      style={{
                        minWidth: '58px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: distance < 500 ? '#dc2626' : distance < 1500 ? '#d97706' : '#16a34a',
                        marginRight: '8px',
                      }}
                    >
                      {formatDistance(distance)}
                    </span>
                    <span>{poi.tags.name ?? category.competitorLabel}</span>
                  </li>
                ))}
              </ol>
              <p style={{ fontSize: '9.5px', color: '#9ca3af', marginTop: '4px' }}>
                Distancias en línea recta. Rojo &lt; 500 m · naranja &lt; 1.5 km · verde más lejos. Los 5 más
                cercanos se dibujan en el mapa con líneas punteadas.
              </p>
            </>
          ) : (
            <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px' }}>
              ✓ No hay {category.competitorLabel.toLowerCase()} registrados en esta ciudad.
            </p>
          )}
        </div>
      )}

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

          <button
            onClick={() => onSetMyLocation(pointAnalysis.point)}
            style={{
              width: '100%',
              marginBottom: '10px',
              padding: '6px 10px',
              fontSize: '11.5px',
              fontWeight: 600,
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            📌 Marcar como mi ubicación (comparar vs. competidores)
          </button>

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

      <div className="panel">
        <h2>Totalizador por tipo de negocio</h2>
        <p className="hint">
          {totalAllCategories.toLocaleString('es-DO')} negocios en {locationLabel}, por rubro
        </p>
        <ul className="totals-list">
          {[...categoryTotals]
            .sort((a, b) => b.count - a.count)
            .map(({ category: c, count }) => (
              <li
                key={c.id}
                onClick={() => onCategoryChange(c)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 4px',
                  cursor: 'pointer',
                  fontWeight: c.id === category.id ? 700 : 400,
                  background: c.id === category.id ? '#f0f9ff' : 'transparent',
                  borderRadius: '4px',
                }}
              >
                <span>
                  {c.icon} {c.label}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0ea5e9',
                    background: '#e0f2fe',
                    borderRadius: '10px',
                    padding: '1px 9px',
                    minWidth: '28px',
                    textAlign: 'center',
                  }}
                >
                  {count.toLocaleString('es-DO')}
                </span>
              </li>
            ))}
        </ul>
      </div>

      <footer>
        <p style={{ marginBottom: '8px' }}>
          <a
            href={`${import.meta.env.BASE_URL}manual.pdf`}
            target="_blank"
            rel="noreferrer"
            style={{ fontWeight: 600, fontSize: '12.5px' }}
          >
            📖 Manual de usuario (PDF)
          </a>
        </p>
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
