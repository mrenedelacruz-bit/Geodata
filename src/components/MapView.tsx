import { useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, CircleMarker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import type { BusinessCategory, GridCell, LatLon, OsmPOI } from '../types';
import { getLocation } from '../data/locations';
import { formatDistance } from '../lib/geo';
import HeatmapLayerComponent from './HeatmapLayer';
import CensusLayer from './CensusLayer';
import LayerControl from './LayerControl';
import LocationSwitcher from './LocationSwitcher';

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
  location: string;
  grid: GridCell[];
  category: BusinessCategory;
  competitors: OsmPOI[];
  onMapClick: (p: LatLon) => void;
  selectedCell: GridCell | null;
  onSelectCell: (cell: GridCell) => void;
  comparisonCells: GridCell[];
  myLocation: LatLon | null;
  nearestCompetitors: { poi: OsmPOI; distance: number }[];
  showHeatmap: boolean;
  onHeatmapToggle: (show: boolean) => void;
  showGrid: boolean;
  onGridToggle: (show: boolean) => void;
  showCompetitors: boolean;
  onCompetitorsToggle: (show: boolean) => void;
  showCensus: boolean;
  onCensusToggle: (show: boolean) => void;
}

export default function MapView({
  location,
  grid,
  category,
  competitors,
  onMapClick,
  selectedCell,
  onSelectCell,
  comparisonCells,
  myLocation,
  nearestCompetitors,
  showHeatmap,
  onHeatmapToggle,
  showGrid,
  onGridToggle,
  showCompetitors,
  onCompetitorsToggle,
  showCensus,
  onCensusToggle,
}: Props) {
  const locationConfig = getLocation(location);

  const isInComparison = (cell: GridCell) =>
    comparisonCells.some((c) => c.row === cell.row && c.col === cell.col);

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
                    ⚠ Agregado manualmente — aún no está en OpenStreetMap.{' '}
                    {poi.tags.source?.replace(/^manual:/, '')}
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
      <LocationSwitcher currentLocation={location} />
      <MapContainer
        center={[locationConfig.center.lat, locationConfig.center.lon]}
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
        {showCensus && <CensusLayer location={location} />}
        {showGrid &&
          grid
            .filter((cell) => cell.anchorScore > 0 || cell.competitorCount > 0)
            .map((cell) => {
              const selected =
                selectedCell !== null && selectedCell.row === cell.row && selectedCell.col === cell.col;
              const inComparison = isInComparison(cell);
              return (
                <Rectangle
                  key={`${cell.row}_${cell.col}`}
                  bounds={cell.bounds}
                  pathOptions={{
                    color: inComparison ? '#f59e0b' : selected ? '#111827' : 'transparent',
                    weight: inComparison ? 3 : selected ? 2 : 0,
                    dashArray: inComparison ? '5, 5' : undefined,
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
              );
            })}

        {showCompetitors && competitorMarkers}

        {myLocation && (
          <>
            {/* Líneas punteadas hacia los 5 competidores más cercanos, con la distancia. */}
            {nearestCompetitors.slice(0, 5).map(({ poi, distance }) => (
              <Polyline
                key={`vs_${poi.id}`}
                positions={[
                  [myLocation.lat, myLocation.lon],
                  [poi.lat, poi.lon],
                ]}
                pathOptions={{ color: '#dc2626', weight: 1.5, dashArray: '6 6', opacity: 0.7 }}
              >
                <Popup>
                  <div style={{ fontSize: '12px' }}>
                    {poi.tags.name ?? category.competitorLabel} — <strong>{formatDistance(distance)}</strong> de
                    mi ubicación
                  </div>
                </Popup>
              </Polyline>
            ))}
            <CircleMarker
              center={[myLocation.lat, myLocation.lon]}
              radius={9}
              pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#dc2626', fillOpacity: 1 }}
            >
              <Popup>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>📌 Mi ubicación</div>
              </Popup>
            </CircleMarker>
          </>
        )}
      </MapContainer>
      <LayerControl
        category={category}
        showHeatmap={showHeatmap}
        onHeatmapToggle={onHeatmapToggle}
        showGrid={showGrid}
        onGridToggle={onGridToggle}
        showCompetitors={showCompetitors}
        onCompetitorsToggle={onCompetitorsToggle}
        showCensus={showCensus}
        onCensusToggle={onCensusToggle}
      />
    </div>
  );
}
