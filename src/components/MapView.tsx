import { useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import type { BusinessCategory, GridCell, LatLon, OsmPOI, TrafficWay } from '../types';
import { SANTO_DOMINGO_CENTER } from '../lib/grid';
import HeatmapLayerComponent from './HeatmapLayer';
import TrafficLayer from './TrafficLayer';
import LayerControl from './LayerControl';

function scoreColor(score: number): string {
  // 0 (red, saturated) -> 100 (green, oportunidad)
  const hue = Math.max(0, Math.min(120, (score / 100) * 120));
  return `hsl(${hue}, 70%, 45%)`;
}

function ClickHandler({ onClick }: { onClick: (p: LatLon) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

interface Props {
  grid: GridCell[];
  category: BusinessCategory;
  competitors: OsmPOI[];
  trafficWays: TrafficWay[];
  onMapClick: (p: LatLon) => void;
  selectedCell: GridCell | null;
  onSelectCell: (cell: GridCell) => void;
  showHeatmap: boolean;
  onHeatmapToggle: (show: boolean) => void;
  showGrid: boolean;
  onGridToggle: (show: boolean) => void;
  showTraffic: boolean;
  onTrafficToggle: (show: boolean) => void;
  showCompetitors: boolean;
  onCompetitorsToggle: (show: boolean) => void;
}

export default function MapView({
  grid,
  category,
  competitors,
  trafficWays,
  onMapClick,
  selectedCell,
  onSelectCell,
  showHeatmap,
  onHeatmapToggle,
  showGrid,
  onGridToggle,
  showTraffic,
  onTrafficToggle,
  showCompetitors,
  onCompetitorsToggle,
}: Props) {
  const competitorMarkers = useMemo(
    () =>
      competitors.map((poi) => {
        const isManual = poi.tags.source?.startsWith('manual:');
        return (
          <CircleMarker
            key={poi.id}
            center={[poi.lat, poi.lon]}
            radius={4}
            pathOptions={
              isManual
                ? { color: '#0B5FA5', weight: 2, fillColor: '#16A5E6', fillOpacity: 0.95 }
                : { color: '#1e1e1e', weight: 1, fillColor: '#ffffff', fillOpacity: 0.9 }
            }
          >
            <Popup>
              <div style={{ fontSize: '12px', minWidth: isManual ? '200px' : undefined }}>
                <div>
                  {category.icon} {poi.tags.name ?? category.competitorLabel}
                </div>
                {isManual && (
                  <div style={{ marginTop: '6px', padding: '6px 8px', background: '#fff8ee', borderRadius: '4px', fontSize: '10.5px', color: '#b45309' }}>
                    ⚠ Agregado manualmente (fuente: prensa/sitio oficial) — aún no está en
                    OpenStreetMap. Ubicación estimada, sujeta a verificación.
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      }),
    [competitors, category],
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={[SANTO_DOMINGO_CENTER.lat, SANTO_DOMINGO_CENTER.lon]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onClick={onMapClick} />
        {showHeatmap && <HeatmapLayerComponent grid={grid} />}
        {showTraffic && <TrafficLayer ways={trafficWays} />}
        {showGrid &&
          grid
            .filter((cell) => cell.anchorScore > 0 || cell.competitorCount > 0)
            .map((cell) => (
            <Rectangle
              key={`${cell.row}_${cell.col}`}
              bounds={cell.bounds}
              pathOptions={{
                color: selectedCell === cell ? '#111827' : 'transparent',
                weight: selectedCell === cell ? 2 : 0,
                fillColor: scoreColor(cell.score),
                fillOpacity: 0.38,
              }}
              eventHandlers={{ click: () => onSelectCell(cell) }}
            >
              <Popup>
                <div style={{ fontSize: '12px', minWidth: '160px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Score: {cell.score}</div>
                  <div>📊 Demanda: {Math.round(cell.anchorScore)}</div>
                  <div>🏢 Competencia: {cell.competitorCount}</div>
                </div>
              </Popup>
            </Rectangle>
          ))}
        {showCompetitors && competitorMarkers}
      </MapContainer>
      <LayerControl
        showHeatmap={showHeatmap}
        onHeatmapToggle={onHeatmapToggle}
        showGrid={showGrid}
        onGridToggle={onGridToggle}
        showTraffic={showTraffic}
        onTrafficToggle={onTrafficToggle}
        showCompetitors={showCompetitors}
        onCompetitorsToggle={onCompetitorsToggle}
      />
    </div>
  );
}
