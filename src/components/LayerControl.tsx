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
  return (
    <div className="layer-control">
      <h3>Capas</h3>

      <label className="layer-checkbox">
        <input
          type="checkbox"
          checked={showHeatmap}
          onChange={(e) => onHeatmapToggle(e.target.checked)}
        />
        <span>🔥 Mapa de calor</span>
      </label>

      <label className="layer-checkbox">
        <input
          type="checkbox"
          checked={showGrid}
          onChange={(e) => onGridToggle(e.target.checked)}
        />
        <span>📊 Cuadrícula</span>
      </label>

      <label className="layer-checkbox">
        <input
          type="checkbox"
          checked={showTraffic}
          onChange={(e) => onTrafficToggle(e.target.checked)}
        />
        <span>🛣️ Análisis de tráfico</span>
      </label>

      <label className="layer-checkbox">
        <input
          type="checkbox"
          checked={showCompetitors}
          onChange={(e) => onCompetitorsToggle(e.target.checked)}
        />
        <span>🎯 Puntos de competencia</span>
      </label>
    </div>
  );
}
