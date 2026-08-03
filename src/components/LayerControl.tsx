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
  showIvacc: boolean;
  onIvaccToggle: (show: boolean) => void;
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
      </div>
    </div>
  );
}
