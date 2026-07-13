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

    // Normaliza contra el mejor score y eleva al cuadrado: suprime la "alfombra"
    // de valores medios y hace resaltar los núcleos de mayor potencial.
    const maxScore = grid.reduce((m, c) => Math.max(m, c.score), 1);
    const points = grid
      .filter((cell) => cell.score > 0)
      .map((cell) => [cell.center.lat, cell.center.lon, (cell.score / maxScore) ** 2] as [number, number, number]);

    // Rampa monocroma azul (estilo PuntoExpress): claro casi transparente en
    // zonas frías → azul marino oscuro en zonas de mayor potencial.
    // OJO: maxZoom aquí NO es el zoom máximo del mapa — leaflet.heat atenúa la
    // intensidad por 2^(maxZoom - zoom); con 18 el mapa a zoom 12 quedaba a 1/64
    // de intensidad (heatmap invisible). 12 = intensidad plena al zoom inicial.
    const heatLayer = L.heatLayer(points, {
      radius: 20,
      blur: 15,
      maxZoom: 12,
      max: 4,
      minOpacity: 0.05,
      gradient: {
        0.15: '#c9eafb',
        0.35: '#87D4F1',
        0.55: '#16A5E6',
        0.72: '#0B5FA5',
        0.9: '#083A66',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [grid, map]);

  return null;
}
