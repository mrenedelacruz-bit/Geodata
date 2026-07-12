declare module 'leaflet.heat';

declare namespace L {
  function heatLayer(
    latlngs: [number, number, number][],
    options?: {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      max?: number;
      gradient?: Record<string, string>;
    }
  ): import('leaflet').Layer;
}
