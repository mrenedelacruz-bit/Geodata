declare module 'react-leaflet-heatmap-layer-v3' {
  import { ReactNode } from 'react';

  interface HeatmapLayerProps<T> {
    points: T[];
    longitudeExtractor: (point: T) => number;
    latitudeExtractor: (point: T) => number;
    intensityExtractor: (point: T) => number;
    radius?: number;
    blur?: number;
    maxZoom?: number;
    gradient?: Record<string | number, string>;
  }

  export function HeatmapLayer<T>(props: HeatmapLayerProps<T>): ReactNode;
}
