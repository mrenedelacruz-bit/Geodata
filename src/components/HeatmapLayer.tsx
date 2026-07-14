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

    // Normaliza contra el mejor score; exponente 2.2 (subido de 1.3) empuja los
    // valores medios/bajos hacia abajo con fuerza, para que solo los núcleos
    // reales de potencial destaquen y el resto del área quede claramente más
    // tenue — más contraste entre niveles en vez de un degradado uniforme.
    const maxScore = grid.reduce((m, c) => Math.max(m, c.score), 1);
    const points = grid
      .filter((cell) => cell.score > 0)
      .map((cell) => [cell.center.lat, cell.center.lon, (cell.score / maxScore) ** 2.2] as [number, number, number]);

    // Campo continuo: radio/blur grandes fusionan las celdas de 450m en una
    // superficie orgánica. Calibrado visualmente contra el heatmap de referencia.
    // OJO: maxZoom aquí NO es el zoom máximo del mapa — leaflet.heat atenúa la
    // intensidad por 2^(maxZoom - zoom); con 18 el mapa a zoom 12 quedaba a 1/64
    // de intensidad (heatmap invisible). 12 = intensidad plena al zoom inicial.
    // minOpacity bajado (0.22 -> 0.08) para reducir la intensidad general: las
    // zonas de bajo potencial casi desaparecen en vez de verse siempre visibles.
    // Gradiente reducido a 6 paradas con saltos de color grandes entre ellas
    // (en vez de una transición suave de 11 tonos) para que cada nivel se
    // distinga claramente del contiguo.
    const heatLayer = L.heatLayer(points, {
      radius: 35,
      blur: 28,
      maxZoom: 12,
      max: 8,
      minOpacity: 0.08,
      gradient: {
        0.15: '#d6ecfa',
        0.35: '#8fcdf2',
        0.55: '#3f9fe0',
        0.72: '#0e6fb5',
        0.88: '#08447a',
        1.0: '#02121f',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [grid, map]);

  return null;
}
