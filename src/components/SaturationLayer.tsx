import { useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import type { GridCell } from '../types';
import { saturationLabel, saturationColor } from '../lib/saturation';

interface Props {
  grid: GridCell[];
}

export default function SaturationLayer({ grid }: Props) {
  const markers = useMemo(
    () =>
      grid
        .filter((cell) => cell.anchorScore > 0 || cell.competitorCount > 0)
        .map((cell) => (
          <CircleMarker
            key={`${cell.row}_${cell.col}`}
            center={[cell.center.lat, cell.center.lon]}
            radius={7}
            pathOptions={{
              color: '#ffffff',
              weight: 1,
              fillColor: saturationColor(cell.saturationLevel),
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div style={{ fontSize: '12px', minWidth: '140px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {saturationLabel(cell.saturationLevel)}
                </div>
                <div>📊 Demanda: {Math.round(cell.anchorScore)}</div>
                <div>🏢 Competencia: {cell.competitorCount}</div>
              </div>
            </Popup>
          </CircleMarker>
        )),
    [grid],
  );

  return <>{markers}</>;
}
