import { useState } from 'react';

interface Props {
  showHeatmap: boolean;
  onHeatmapToggle: (show: boolean) => void;
  showTraffic: boolean;
  onTrafficToggle: (show: boolean) => void;
  showGrid: boolean;
  onGridToggle: (show: boolean) => void;
  showCompetitors: boolean;
  onCompetitorsToggle: (show: boolean) => void;
}

export default function LayerControl({
  showHeatmap,
  onHeatmapToggle,
  showTraffic,
  onTrafficToggle,
  showGrid,
  onGridToggle,
  showCompetitors,
  onCompetitorsToggle,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleLayer = (toggle: (show: boolean) => void, current: boolean) => {
    toggle(!current);
  };

  return (
    <div className="layer-legend">
      <div className="legend-header">
        <span>Capas del mapa</span>
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
              background: 'linear-gradient(135deg, #2166AC 0%, #92C5DE 25%, #F7F7F7 50%, #F4A582 75%, #B2182B 100%)',
            }}
          />
          Mapa de calor
          <div className="chk">{showHeatmap ? '✓' : ''}</div>
        </div>
        <div className="sub">Visualización suave de oportunidades por demanda vs competencia</div>

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
          className={`layer-btn ${showTraffic ? '' : 'off'}`}
          onClick={() => toggleLayer(onTrafficToggle, showTraffic)}
        >
          <div className="swatch" style={{ background: '#d32f2f' }} />
          Análisis de tráfico
          <div className="chk">{showTraffic ? '✓' : ''}</div>
        </div>
        <div className="sub">Red de vías principales (autopistas a secundarias)</div>

        <div
          className={`layer-btn ${showCompetitors ? '' : 'off'}`}
          onClick={() => toggleLayer(onCompetitorsToggle, showCompetitors)}
        >
          <div className="swatch" style={{ background: '#1e1e1e' }} />
          Puntos de competencia
          <div className="chk">{showCompetitors ? '✓' : ''}</div>
        </div>
        <div className="sub">Ubicaciones de competidores en la categoría</div>
      </div>
    </div>
  );
}
