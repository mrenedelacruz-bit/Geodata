import { useMemo, useState } from 'react';
import { BUSINESS_CATEGORIES } from '../data/categories';
import {
  powerLabel,
  powerColor,
  sectorAt,
  census2022For,
  regionalPovertyFor,
  icvCategoryOf,
  siubenIcvFor,
  NATIONAL_POVERTY,
  type CensusSector,
} from '../data/census';
import { saturationLabel, saturationColor } from '../lib/saturation';
import { municipiosFor } from '../data/census2022-municipios';
import { formatDistance } from '../lib/geo';
import { openPrintReport } from '../lib/report';
import { powerFromBarrio } from '../lib/barrios';
import type { BarrioFeature, BarrioIndex } from '../lib/barrios';
import { dgiiCountFor, DGII_CUTOFF } from '../data/dgii';
import { formatRD, SATURATION_META, CATCHMENT_MINUTES } from '../lib/market';
import type { MarketAnalysis, SavedSpot, TravelMode } from '../lib/market';
import type { TargetSegment } from '../lib/grid';
import type { BusinessCategory, GridCell, LatLon, OsmPOI } from '../types';
import SearchBox from './SearchBox';

const TARGET_LABELS: Record<TargetSegment, string> = {
  todos: 'Todos los públicos',
  premium: 'Premium (estrato alto)',
  medio: 'Clase media',
  masivo: 'Masivo / popular',
};

interface MyAnalysis {
  score: number | null;
  sector: CensusSector | null;
  competitorCount: number;
  anchorScore: number;
  nearby: { anchor: string; count: number }[];
}

interface PointAnalysis extends MyAnalysis {
  point: LatLon;
  label: string;
  barrio: BarrioFeature | null;
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
  target: TargetSegment;
  onTargetChange: (t: TargetSegment) => void;
  barrioIndex: BarrioIndex | null;
  myLocation: LatLon | null;
  onSetMyLocation: (p: LatLon | null) => void;
  myAnalysis: MyAnalysis | null;
  nearestCompetitors: { poi: OsmPOI; distance: number }[];
  market: MarketAnalysis | null;
  marketMode: TravelMode;
  onMarketModeChange: (m: TravelMode) => void;
  marketMinutes: number;
  onMarketMinutesChange: (m: number) => void;
  savedSpots: SavedSpot[];
  onSaveSpot: () => void;
  onRemoveSpot: (id: number) => void;
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
  target,
  onTargetChange,
  barrioIndex,
  myLocation,
  onSetMyLocation,
  myAnalysis,
  nearestCompetitors,
  market,
  marketMode,
  onMarketModeChange,
  marketMinutes,
  onMarketMinutesChange,
  savedSpots,
  onSaveSpot,
  onRemoveSpot,
}: Props) {
  // Ordenar toda la cuadrícula (miles de celdas) solo cuando cambie, no en cada render.
  const topZones = useMemo(() => [...grid].sort((a, b) => b.score - a.score).slice(0, 10), [grid]);
  const totalAllCategories = useMemo(() => categoryTotals.reduce((sum, t) => sum + t.count, 0), [categoryTotals]);
  const [linkCopied, setLinkCopied] = useState(false);

  const census2022 = census2022For(location);
  const municipios = municipiosFor(location);

  // Top barrios oficiales: por estrato alto (ICV-4) y por score del rubro
  // (celda de la cuadrícula donde cae el centroide). Mínimo 100 hogares.
  const topBarrios = useMemo(() => {
    if (!barrioIndex) return null;
    const withMeta = barrioIndex.list
      .map((b, i) => {
        const c = barrioIndex.centroids[i];
        const cell = grid.find(
          (g) =>
            c.lat >= g.bounds[0][0] && c.lat < g.bounds[1][0] && c.lon >= g.bounds[0][1] && c.lon < g.bounds[1][1],
        );
        return { b, centroid: c, score: cell?.score ?? 0 };
      })
      .filter((x) => x.b.h >= 100);
    const byStratum = [...withMeta]
      .filter((x) => x.b.a !== null)
      .sort((x, y) => (y.b.a ?? 0) - (x.b.a ?? 0))
      .slice(0, 5);
    const byScore = [...withMeta].sort((x, y) => y.score - x.score).slice(0, 5);
    return { byStratum, byScore };
  }, [barrioIndex, grid]);
  const poverty = regionalPovertyFor(location);
  const siubenIcv = siubenIcvFor(location);

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
      census2022,
      municipios,
      poverty,
      siubenIcv,
      targetLabel: target !== 'todos' ? TARGET_LABELS[target] : null,
      market,
      savedSpots,
      topBarrios: topBarrios
        ? {
            byScore: topBarrios.byScore.map(({ b, score }) => ({ name: b.n, muni: b.m, score })),
            byStratum: topBarrios.byStratum.map(({ b }) => ({ name: b.n, muni: b.m, aPct: Math.round(b.a ?? 0) })),
          }
        : null,
    });
  }

  return (
    <aside className="sidebar">
      <h1>{title}</h1>
      <p className="subtitle">
        Encuentra las mejores zonas para tu negocio combinando POIs, densidad comercial y competencia,
        usando datos abiertos de OpenStreetMap.
      </p>

      <SearchBox onSelect={onSearchSelect} locationLabel={locationLabel} barrioIndex={barrioIndex} />

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

      <label className="field">
        <span>Cliente objetivo (opcional)</span>
        <select value={target} onChange={(e) => onTargetChange(e.target.value as TargetSegment)}>
          {(Object.keys(TARGET_LABELS) as TargetSegment[]).map((t) => (
            <option key={t} value={t}>
              {TARGET_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      {target !== 'todos' && (
        <p style={{ fontSize: '10px', color: '#9ca3af', margin: '-6px 0 10px' }}>
          El score prioriza zonas con nivel socioeconómico afín a "{TARGET_LABELS[target]}" (barrios ICV SIUBEN).
        </p>
      )}

      {loading && <p className="status">Cargando datos de OpenStreetMap para {locationLabel}…</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && <p className="status">{poiCount.toLocaleString('es-DO')} puntos de interés cargados</p>}
      {census2022 && (
        <div className="status" style={{ marginTop: '-6px', lineHeight: 1.6 }}>
          <div>
            👥 {census2022.population.toLocaleString('es-DO')} hab. · {census2022.urbanPct}% urbana ·{' '}
            {census2022.growthPct >= 0 ? '+' : ''}
            {census2022.growthPct}%/año
          </div>
          <div>
            🏠 {census2022.hogares.toLocaleString('es-DO')} hogares ({census2022.avgHogar} pers.) · 💼{' '}
            {census2022.ocupados.toLocaleString('es-DO')} ocupados
          </div>
          {poverty && (
            <div>
              📉 Pobreza monetaria {poverty.povertyPct}% (región {poverty.region}, 2025) · nacional{' '}
              {NATIONAL_POVERTY.pct}% ({NATIONAL_POVERTY.period})
            </div>
          )}
          {siubenIcv && (
            <div>
              🏚️ {siubenIcv.pobres.toLocaleString('es-DO')} hogares en pobreza ICV (SIUBEN) ·{' '}
              {siubenIcv.pctHogares}% de los hogares
            </div>
          )}
          <div style={{ fontSize: '10px', color: '#9ca3af' }}>
            Censo ONE 2022 · PIP ONE/MEPyD 2025 · Hacienda y Economía 2026 · SIUBEN Open Data
          </div>
        </div>
      )}

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
            <button className="btn-remove" onClick={() => onSetMyLocation(null)}>
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

      {savedSpots.length > 0 && (
        <div className="panel" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0 }}>⚖️ Comparador de ubicaciones</h2>
            <button className="btn-remove" onClick={() => savedSpots.forEach((s) => onRemoveSpot(s.id))}>
              Limpiar
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '3px 4px', borderBottom: '1px solid #e5e7eb' }}></th>
                  {savedSpots.map((s, i) => (
                    <th key={s.id} style={{ textAlign: 'center', padding: '3px 4px', borderBottom: '1px solid #e5e7eb' }}>
                      <span
                        style={{
                          display: 'inline-block', width: '18px', height: '18px', lineHeight: '18px',
                          borderRadius: '50%', background: '#f59e0b', color: '#fff', fontWeight: 700, fontSize: '11px',
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <div style={{ fontSize: '9px', fontWeight: 400, color: '#6b7280', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }}>
                        {s.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  ['Score', (s: SavedSpot) => (s.score !== null ? String(s.score) : '—')],
                  ['Barrio', (s: SavedSpot) => s.barrio ?? '—'],
                  ['Hogares en captación', (s: SavedSpot) => s.market.households?.toLocaleString('es-DO') ?? '—'],
                  ['Demanda/mes', (s: SavedSpot) => (s.market.demandRD !== null ? formatRD(s.market.demandRD) : '—')],
                  ['Competencia', (s: SavedSpot) => String(s.market.competitorsIn)],
                  [
                    'Saturación',
                    (s: SavedSpot) => (s.market.saturation ? SATURATION_META[s.market.saturation].label : '—'),
                  ],
                  ['Cuota Huff', (s: SavedSpot) => (s.market.huffShare !== null ? `${Math.round(s.market.huffShare * 100)}%` : '—')],
                  [
                    'Ventas potenciales/mes',
                    (s: SavedSpot) => (s.market.salesPotentialRD !== null ? formatRD(s.market.salesPotentialRD) : '—'),
                  ],
                ] as [string, (s: SavedSpot) => string][]).map(([label, fn]) => (
                  <tr key={label}>
                    <td style={{ padding: '3px 4px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{label}</td>
                    {savedSpots.map((s) => (
                      <td key={s.id} style={{ padding: '3px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>
                        {fn(s)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td></td>
                  {savedSpots.map((s) => (
                    <td key={s.id} style={{ padding: '4px', textAlign: 'center' }}>
                      <button className="btn-remove" onClick={() => onRemoveSpot(s.id)}>
                        Quitar
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '9.5px', color: '#9ca3af', margin: '4px 0 0' }}>
            Captación de {savedSpots[0].market.minutes} min{' '}
            {savedSpots[0].market.mode === 'walk' ? 'a pie' : 'en carro'} al momento de guardar cada punto. Los
            puntos guardados se marcan A/B/C en el mapa.
          </p>
        </div>
      )}

      {comparisonCells.length > 0 && (
        <div className="panel" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ margin: 0 }}>Comparación de zonas</h2>
            <button
              className="btn-remove"
              onClick={() => {
                comparisonCells.forEach(onToggleComparison);
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
                  <button className="btn-remove full" onClick={() => onToggleComparison(cell)}>
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

          {market && (
            <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0fdfa', borderRadius: '6px', border: '1px solid #ccfbf1', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong>🎯 Análisis de mercado</strong>
                <span style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => onMarketModeChange('walk')}
                    style={{
                      padding: '2px 7px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                      border: '1px solid ' + (marketMode === 'walk' ? '#0b5fa5' : '#d1d5db'),
                      background: marketMode === 'walk' ? '#e0f2fe' : '#fff',
                      fontWeight: marketMode === 'walk' ? 700 : 400,
                    }}
                  >
                    🚶 pie
                  </button>
                  <button
                    onClick={() => onMarketModeChange('car')}
                    style={{
                      padding: '2px 7px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                      border: '1px solid ' + (marketMode === 'car' ? '#0b5fa5' : '#d1d5db'),
                      background: marketMode === 'car' ? '#e0f2fe' : '#fff',
                      fontWeight: marketMode === 'car' ? 700 : 400,
                    }}
                  >
                    🚗 carro
                  </button>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {CATCHMENT_MINUTES.map((m) => (
                  <button
                    key={m}
                    onClick={() => onMarketMinutesChange(m)}
                    style={{
                      flex: 1, padding: '2px 0', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                      border: '1px solid ' + (marketMinutes === m ? '#0b5fa5' : '#d1d5db'),
                      background: marketMinutes === m ? '#e0f2fe' : '#fff',
                      fontWeight: marketMinutes === m ? 700 : 400,
                    }}
                  >
                    {m} min
                  </button>
                ))}
              </div>
              <div style={{ lineHeight: 1.7 }}>
                <div>
                  Captación estimada: <strong>{(market.radiusM / 1000).toLocaleString('es-DO', { maximumFractionDigits: 1 })} km</strong>{' '}
                  a la redonda ({marketMinutes} min {marketMode === 'walk' ? 'a pie' : 'en carro'})
                </div>
                {market.households !== null && (
                  <div>
                    🏠 <strong>{market.households.toLocaleString('es-DO')}</strong> hogares
                    {market.populationEst !== null && <> · ~{market.populationEst.toLocaleString('es-DO')} personas</>}
                  </div>
                )}
                {market.demandRD !== null && (
                  <div>
                    💰 Demanda del rubro: <strong>{formatRD(market.demandRD)}/mes</strong>
                  </div>
                )}
                <div>
                  🏢 <strong>{market.competitorsIn}</strong> {category.competitorLabel.toLowerCase()} en la captación
                  {market.saturation !== null && market.per10k !== null && market.provincialPer10k !== null && (
                    <>
                      {' '}
                      <span
                        style={{
                          fontSize: '9.5px', fontWeight: 700, color: '#fff', borderRadius: '8px', padding: '1px 7px',
                          background: SATURATION_META[market.saturation].color,
                        }}
                      >
                        {SATURATION_META[market.saturation].label}
                      </span>
                      <span style={{ display: 'block', fontSize: '10px', color: '#6b7280' }}>
                        {market.per10k.toFixed(1)} /10k hab. vs. {market.provincialPer10k.toFixed(1)} promedio provincial
                      </span>
                    </>
                  )}
                </div>
                {market.huffShare !== null && (
                  <div>
                    📈 Cuota de captura (Huff): <strong>{Math.round(market.huffShare * 100)}%</strong>
                    {market.salesPotentialRD !== null && (
                      <> · ventas potenciales <strong>{formatRD(market.salesPotentialRD)}/mes</strong></>
                    )}
                  </div>
                )}
                {market.overlaps.length > 0 && market.overlaps[0].overlapPct > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontWeight: 700 }}>Solape de captación (canibalización):</span>
                    {market.overlaps
                      .filter((o) => o.overlapPct > 0)
                      .map((o, i) => (
                        <span key={i} style={{ display: 'block', fontSize: '11px', color: '#6b7280' }}>
                          {o.name} — {formatDistance(o.distanceM)} · <strong>{o.overlapPct}%</strong> de solape
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <button
                onClick={onSaveSpot}
                disabled={savedSpots.length >= 3}
                style={{
                  width: '100%', marginTop: '8px', padding: '5px 10px', fontSize: '11.5px', fontWeight: 600,
                  background: savedSpots.length >= 3 ? '#e5e7eb' : '#fffbeb',
                  color: savedSpots.length >= 3 ? '#9ca3af' : '#b45309',
                  border: '1px solid ' + (savedSpots.length >= 3 ? '#d1d5db' : '#fde68a'),
                  borderRadius: '6px', cursor: savedSpots.length >= 3 ? 'not-allowed' : 'pointer',
                }}
              >
                ⚖️ Guardar en el comparador ({savedSpots.length}/3)
              </button>
              <p style={{ fontSize: '9.5px', color: '#9ca3af', margin: '6px 0 0' }}>
                Captación aproximada (círculo equivalente por velocidad media urbana, no red vial). Demanda: hogares
                × gasto estimado del rubro (ENGIH aprox.) ajustado por nivel socioeconómico. Huff: atractividad
                igual entre locales, fricción distancia². Cifras orientativas.
              </p>
            </div>
          )}

          {pointAnalysis.barrio && (
            <div style={{ marginBottom: '10px', padding: '8px 10px', backgroundColor: '#faf5ff', borderRadius: '6px', border: '1px solid #e9d5ff', fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                🏘️ {pointAnalysis.barrio.n} · {pointAnalysis.barrio.m}
              </div>
              <div>{pointAnalysis.barrio.h.toLocaleString('es-DO')} hogares en el registro SIUBEN</div>
              {pointAnalysis.barrio.p !== null && (
                <div>
                  Hogares pobres (ICV-1+2): <strong>{pointAnalysis.barrio.p}%</strong>
                  {pointAnalysis.barrio.a !== null && <> · estrato alto (ICV-4): {pointAnalysis.barrio.a}%</>}
                </div>
              )}
              <div style={{ fontSize: '10px', color: '#7a8a99', marginTop: '3px' }}>
                Barrio oficial · SIUBEN Open Data (ICV_BARRIOS){' '}
                {powerFromBarrio(pointAnalysis.barrio) !== null && '· usado por el score'}
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
              <div>
                Estrato ICV-3 (aprox.):{' '}
                <strong>
                  {icvCategoryOf(pointAnalysis.sector.purchasingPower).cat} ·{' '}
                  {icvCategoryOf(pointAnalysis.sector.purchasingPower).label}
                </strong>
              </div>
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
                <span style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#0ea5e9',
                      background: '#e0f2fe',
                      borderRadius: '10px',
                      padding: '1px 9px',
                      minWidth: '28px',
                      display: 'inline-block',
                      textAlign: 'center',
                    }}
                  >
                    {count.toLocaleString('es-DO')}
                  </span>
                  {census2022 && (
                    <span style={{ display: 'block', fontSize: '9px', color: '#9ca3af' }}>
                      {((count / census2022.population) * 10000).toFixed(1)} /10k hab.
                      {dgiiCountFor(c.id) !== null && (
                        <> · RNC país: {dgiiCountFor(c.id)!.toLocaleString('es-DO')}</>
                      )}
                    </span>
                  )}
                </span>
              </li>
            ))}
        </ul>
        <p style={{ fontSize: '9.5px', color: '#9ca3af', marginTop: '4px' }}>
          "RNC país" = contribuyentes activos del rubro a nivel nacional (DGII, listado RNC al {DGII_CUTOFF}).
          El conteo local proviene de OpenStreetMap y es la submuestra mapeada.
        </p>
      </div>

      {topBarrios && (topBarrios.byStratum.length > 0 || topBarrios.byScore.length > 0) && (
        <div className="panel">
          <h2>Top barrios oficiales</h2>
          <p className="hint">SIUBEN Open Data · clic para analizar el barrio</p>
          {topBarrios.byScore.length > 0 && (
            <>
              <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '6px 0 4px' }}>
                Mejor score para {category.label.toLowerCase()}:
              </p>
              <ol className="zone-list">
                {topBarrios.byScore.map(({ b, centroid, score }) => (
                  <li key={`s_${b.n}_${b.m}`} onClick={() => onSearchSelect(centroid, `${b.n} (${b.m})`)}>
                    <span className="score-pill" style={{ background: `hsl(${(score / 100) * 120}, 70%, 45%)` }}>
                      {score}
                    </span>
                    <span>
                      {b.n} · {b.m}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
          {topBarrios.byStratum.length > 0 && (
            <>
              <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '10px 0 4px' }}>
                Mayor estrato alto (ICV-4):
              </p>
              <ol className="zone-list">
                {topBarrios.byStratum.map(({ b, centroid }) => (
                  <li key={`a_${b.n}_${b.m}`} onClick={() => onSearchSelect(centroid, `${b.n} (${b.m})`)}>
                    <span
                      className="score-pill"
                      style={{ background: '#6d28d9' }}
                      title="% de hogares en estrato alto ICV-4"
                    >
                      {Math.round(b.a ?? 0)}%
                    </span>
                    <span>
                      {b.n} · {b.m}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}

      {municipios.length > 0 && (
        <div className="panel">
          <h2>Población por municipio</h2>
          <p className="hint">Censo ONE 2022, cifras definitivas (Cuadro 4, Vol. I)</p>
          <ul className="totals-list">
            {municipios.map((m) => (
              <li key={m.name} style={{ padding: '4px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{m.name}</span>
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0ea5e9', display: 'block' }}>
                      {m.population.toLocaleString('es-DO')}
                    </span>
                    {m.viviendas !== undefined && (
                      <span style={{ fontSize: '9.5px', color: '#9ca3af', display: 'block' }}>
                        {m.viviendas.toLocaleString('es-DO')} viv.
                        {m.urbanPct !== undefined ? ` · ${m.urbanPct}% urb.` : ''}
                      </span>
                    )}
                    {m.icvPoorPct !== undefined && (
                      <span style={{ fontSize: '9.5px', color: '#9ca3af', display: 'block' }}>
                        ICV: {m.icvPoorPct}% pobres · {m.icvHighPct}% alto
                        {m.ivaccHighPct !== undefined ? ` · 🌀${m.ivaccHighPct}%` : ''}
                      </span>
                    )}
                  </span>
                </div>
                {m.dms && (
                  <ul style={{ listStyle: 'none', margin: '2px 0 0', padding: '0 0 0 14px' }}>
                    {m.dms.map((dm) => (
                      <li
                        key={dm.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          color: '#6b7280',
                          padding: '1px 0',
                        }}
                      >
                        <span>└ {dm.name} (DM)</span>
                        <span>{dm.population.toLocaleString('es-DO')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: '9.5px', color: '#9ca3af', marginTop: '4px' }}>
            La población del municipio incluye la de sus distritos municipales (se listan los DM de 10 mil+
            habitantes y polos de interés).
          </p>
        </div>
      )}

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
          contributors (ODbL). Población: X Censo Nacional 2022 (ONE). Pobreza por sector: % oficial de hogares
          pobres ICV del barrio (SIUBEN Open Data, ICV_BARRIOS) donde hay cifra directa — el panel lo indica; el
          resto usa estimación alineada al modelo ICV-3. El puntaje es un modelo aproximado (demanda por anclas
          ajustada por poder adquisitivo, menos densidad de competencia); no sustituye un estudio de mercado formal.
        </p>
      </footer>
    </aside>
  );
}
