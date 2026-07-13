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

    // Normaliza contra el mejor score del grid para usar todo el rango del gradiente.
    const maxScore = grid.reduce((m, c) => Math.max(m, c.score), 1);
    const points = grid
      .filter((cell) => cell.score > 0)
      .map((cell) => [cell.center.lat, cell.center.lon, cell.score / maxScore] as [number, number, number]);

    // Rampa monocroma azul (estilo PuntoExpress): claro casi transparente en
    // zonas frías → azul marino oscuro en zonas de mayor potencial.
    const heatLayer = L.heatLayer(points, {
      radius: 35,
      blur: 22,
      maxZoom: 18,
      max: 1.0,
      minOpacity: 0.05,
      gradient: {
        0.0: '#e8f7ff',
        0.3: '#87D4F1',
        0.55: '#16A5E6',
        0.75: '#0B5FA5',
        1.0: '#083A66',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [grid, map]);

  return null;
}
