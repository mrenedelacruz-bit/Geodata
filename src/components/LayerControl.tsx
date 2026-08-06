import { useState } from 'react';
import { AFORO_BANDS } from './AforosLayer';
import { PEAJE_YEARS } from './PeajesLayer';
import type { BusinessCategory } from '../types';

interface Props {
  category: BusinessCategory;
  showHeatmap: boolean;
  onHeatmapToggle: (show: boolean) => void;
  showGrid: boolean;
  onGridToggle: (show: boolean) => void;
  showCompetitors: boolean;
  onCompetitorsToggle: (show: boolean) => void;
  showCensus: boolean;
  onCensusToggle: (show: boolean) => void;
  showIvacc: boolean;
  onIvaccToggle: (show: boolean) => void;
  showAforos: boolean;
  onAforosToggle: (show: boolean) => void;
  aforoHour: string;
  onAforoHourChange: (h: string) => void;
  aforosAvailable: boolean;
  showPeajes: boolean;
  onPeajesToggle: (show: boolean) => void;
  peajeYear: string;
  onPeajeYearChange: (y: string) => void;
}

export default function LayerControl({
  category,
  showHeatmap,
  onHeatmapToggle,
  showGrid,
  onGridToggle,
  showCompetitors,
  onCompetitorsToggle,
  showCensus,
  onCensusToggle,
  showIvacc,
  onIvaccToggle,
  showAforos,
  onAforosToggle,
  aforoHour,
  onAforoHourChange,
  aforosAvailable,
  showPeajes,
  onPeajesToggle,
  peajeYear,
  onPeajeYearChange,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleLayer = (toggle: (show: boolean) => void, current: boolean) => {
    toggle(!current);
  };

  return (
    <div className="layer-legend">
      <div className="legend-header">
        <span>Capas · {category.icon} {category.label}</span>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir' : 'Contraer'}
        >
          <span className={`arrow ${collapsed ? 'collapsed' : ''}`}>▼</span>
        </button>
      </div>

      <div className={`legend-body ${collapsed ? 'collapsed' : ''}`}>
        <div
          className={`layer-btn ${showHeatmap ? '' : 'off'}`}
          onClick={() => toggleLayer(onHeatmapToggle, showHeatmap)}
        >
          <div
            className="swatch"
            style={{
              background: 'linear-gradient(135deg, #87D4F1, #083A66)',
            }}
          />
          Mapa de calor
          <div className="chk">{showHeatmap ? '✓' : ''}</div>
        </div>
        <div className="sub">
          Potencial para <strong>{category.label.toLowerCase()}</strong>: azul claro (bajo) → azul
          oscuro (alto). Se recalcula al cambiar la categoría.
        </div>

        <div
          className={`layer-btn ${showGrid ? '' : 'off'}`}
          onClick={() => toggleLayer(onGridToggle, showGrid)}
        >
          <div className="swatch" style={{ background: '#0ea5e9' }} />
          Cuadrícula de análisis
          <div className="chk">{showGrid ? '✓' : ''}</div>
        </div>
        <div className="sub">Celdas de 450m con scores individuales</div>

        <div
          className={`layer-btn ${showCompetitors ? '' : 'off'}`}
          onClick={() => toggleLayer(onCompetitorsToggle, showCompetitors)}
        >
          <div className="swatch" style={{ background: '#1e1e1e' }} />
          Puntos de competencia
          <div className="chk">{showCompetitors ? '✓' : ''}</div>
        </div>
        <div className="sub">{category.competitorLabel} existentes en el mapa</div>

        <div
          className={`layer-btn ${showCensus ? '' : 'off'}`}
          onClick={() => toggleLayer(onCensusToggle, showCensus)}
        >
          <div
            className="swatch"
            style={{ background: 'linear-gradient(135deg, #6d28d9 33%, #14b8a6 33% 66%, #db2777 66%)' }}
          />
          Nivel socioeconómico
          <div className="chk">{showCensus ? '✓' : ''}</div>
        </div>
        <div className="sub">
          Barrios oficiales SIUBEN: <span style={{ color: '#6d28d9', fontWeight: 700 }}>violeta</span> = alto
          ingreso, <span style={{ color: '#0f766e', fontWeight: 700 }}>turquesa</span> = ingreso medio,{' '}
          <span style={{ color: '#e879b9', fontWeight: 700 }}>magenta claro</span> = popular / ingreso bajo,{' '}
          <span style={{ color: '#be185d', fontWeight: 700 }}>magenta oscuro</span> = pobreza. Tono más oscuro =
          mayor grado. Clic en un barrio para el detalle.
        </div>

        <div
          className={`layer-btn ${showIvacc ? '' : 'off'}`}
          onClick={() => toggleLayer(onIvaccToggle, showIvacc)}
        >
          <div
            className="swatch"
            style={{ background: 'linear-gradient(135deg, #fde9c8, #b45309)' }}
          />
          Riesgo climático (IVACC)
          <div className="chk">{showIvacc ? '✓' : ''}</div>
        </div>
        <div className="sub">
          % de hogares con vulnerabilidad alta ante huracanes e inundaciones, por municipio (SIUBEN).
          Ámbar oscuro = mayor riesgo.
        </div>

        {aforosAvailable && (
          <>
            <div
              className={`layer-btn ${showAforos ? '' : 'off'}`}
              onClick={() => toggleLayer(onAforosToggle, showAforos)}
            >
              <div
                className="swatch"
                style={{ background: 'linear-gradient(135deg, #22c55e 33%, #f59e0b 33% 66%, #dc2626 66%)' }}
              />
              Aforos de tráfico (INTRANT)
              <div className="chk">{showAforos ? '✓' : ''}</div>
            </div>
            <div className="sub">
              Conteos vehiculares reales por intersección (Gran Santo Domingo, 2017-2019). El tamaño y color de
              cada punto reflejan el volumen en la banda horaria elegida: verde = menor flujo, rojo = mayor.
            </div>
            {showAforos && (
              <select
                value={aforoHour}
                onChange={(e) => onAforoHourChange(e.target.value)}
                style={{
                  width: '100%',
                  margin: '2px 0 8px',
                  padding: '5px 8px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                }}
              >
                {AFORO_BANDS.map((b) => (
                  <option key={b.hour} value={b.hour}>
                    🕐 {b.label}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <div
          className={`layer-btn ${showPeajes ? '' : 'off'}`}
          onClick={() => toggleLayer(onPeajesToggle, showPeajes)}
        >
          <div
            className="swatch"
            style={{ background: 'linear-gradient(135deg, #bcd7f5, #1e4f8f)' }}
          />
          Peajes RD Vial (por año)
          <div className="chk">{showPeajes ? '✓' : ''}</div>
        </div>
        <div className="sub">
          Tráfico real medido en las 15 estaciones de peaje del país. El tamaño y tono azul de cada estación
          reflejan sus vehículos/día en el año elegido; el popup trae la serie 2021-2026 y el crecimiento.
        </div>
        {showPeajes && (
          <select
            value={peajeYear}
            onChange={(e) => onPeajeYearChange(e.target.value)}
            style={{
              width: '100%',
              margin: '2px 0 8px',
              padding: '5px 8px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
            }}
          >
            {PEAJE_YEARS.map((y) => (
              <option key={y} value={y}>
                📅 {y}{y === '2026' ? ' (ene-jun)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
