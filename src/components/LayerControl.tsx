import { useState } from 'react';
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
  showSaturation: boolean;
  onSaturationToggle: (show: boolean) => void;
  showLiveTraffic: boolean;
  onLiveTrafficToggle: (show: boolean) => void;
  hasLiveTraffic: boolean;
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
  showSaturation,
  onSaturationToggle,
  showLiveTraffic,
  onLiveTrafficToggle,
  hasLiveTraffic,
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
            style={{ background: 'linear-gradient(135deg, #d32f2f, #fbc02d, #1b5e20)' }}
          />
          Nivel socioeconómico
          <div className="chk">{showCensus ? '✓' : ''}</div>
        </div>
        <div className="sub">
          Poder adquisitivo por sector (Censo ONE 2022 + SIUBEN/MEPyD). Verde = alto, rojo = bajo.
          Borde punteado = estimación.
        </div>

        <div
          className={`layer-btn ${showSaturation ? '' : 'off'}`}
          onClick={() => toggleLayer(onSaturationToggle, showSaturation)}
        >
          <div
            className="swatch"
            style={{ background: 'linear-gradient(135deg, #16a34a, #eab308, #dc2626)' }}
          />
          Semáforo de saturación
          <div className="chk">{showSaturation ? '✓' : ''}</div>
        </div>
        <div className="sub">
          Competidores vs. demanda de cada celda: verde = oportunidad, amarillo = moderado, rojo =
          saturado.
        </div>

        <div
          className={`layer-btn ${showLiveTraffic && hasLiveTraffic ? '' : 'off'} ${hasLiveTraffic ? '' : 'disabled'}`}
          onClick={() => hasLiveTraffic && toggleLayer(onLiveTrafficToggle, showLiveTraffic)}
        >
          <div
            className="swatch"
            style={{ background: 'linear-gradient(135deg, #16a34a, #eab308, #dc2626)' }}
          />
          Tráfico vehicular en vivo
          <div className="chk">{showLiveTraffic && hasLiveTraffic ? '✓' : ''}</div>
        </div>
        <div className="sub">
          {hasLiveTraffic
            ? 'Congestión vehicular en tiempo real (TomTom). Verde = fluido, rojo = congestionado.'
            : 'No configurada en este despliegue (falta la API key de TomTom).'}
        </div>
      </div>
    </div>
  );
}
