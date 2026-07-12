import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { GridCell } from '../types';

interface Props {
  grid: GridCell[];
}

export default function HeatmapLayerComponent({ grid }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!grid.length) return;

    const points = grid
      .filter((cell) => cell.score > 0)
      .map((cell) => [cell.center.lat, cell.center.lon, cell.score / 100] as [number, number, number]);

    const heatLayer = L.heatLayer(points, {
      radius: 35,
      blur: 20,
      maxZoom: 18,
      max: 1.0,
      gradient: {
        0.0: '#2166AC',
        0.25: '#92C5DE',
        0.5: '#F7F7F7',
        0.75: '#F4A582',
        1.0: '#B2182B',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [grid, map]);

  return null;
}
