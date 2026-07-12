import { useMemo } from 'react';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import type { GridCell } from '../types';

interface Props {
  grid: GridCell[];
}

export default function HeatmapLayerComponent({ grid }: Props) {
  const heatmapData = useMemo(
    () =>
      grid.map((cell) => [
        cell.center.lat,
        cell.center.lon,
        cell.score / 100, // Normalize to 0-1
      ]) as [number, number, number][],
    [grid]
  );

  return (
    <HeatmapLayer
      points={heatmapData}
      longitudeExtractor={(point: [number, number, number]) => point[1]}
      latitudeExtractor={(point: [number, number, number]) => point[0]}
      intensityExtractor={(point: [number, number, number]) => point[2]}
      radius={40}
      blur={15}
      maxZoom={18}
      gradient={{
        0.0: '#2166AC',
        0.25: '#92C5DE',
        0.5: '#F7F7F7',
        0.75: '#F4A582',
        1.0: '#B2182B',
      }}
    />
  );
}
