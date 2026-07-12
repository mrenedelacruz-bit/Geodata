import { useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import type { BusinessCategory, GridCell, LatLon, OsmPOI } from '../types';
import { SANTO_DOMINGO_CENTER } from '../lib/grid';

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
  onMapClick: (p: LatLon) => void;
  selectedCell: GridCell | null;
  onSelectCell: (cell: GridCell) => void;
}

export default function MapView({ grid, category, competitors, onMapClick, selectedCell, onSelectCell }: Props) {
  const competitorMarkers = useMemo(
    () =>
      competitors.map((poi) => (
        <CircleMarker
          key={poi.id}
          center={[poi.lat, poi.lon]}
          radius={4}
          pathOptions={{ color: '#1e1e1e', weight: 1, fillColor: '#ffffff', fillOpacity: 0.9 }}
        >
          <Popup>
            {category.icon} {poi.tags.name ?? category.competitorLabel}
          </Popup>
        </CircleMarker>
      )),
    [competitors, category],
  );

  return (
    <MapContainer
      center={[SANTO_DOMINGO_CENTER.lat, SANTO_DOMINGO_CENTER.lon]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      preferCanvas
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={onMapClick} />
      {grid.map((cell) => (
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
      {competitorMarkers}
    </MapContainer>
  );
}
