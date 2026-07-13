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

    // Normaliza contra el mejor score; exponente 1.3 conserva el "velo" urbano
    // de valores medios (profundidad de campo continuo, estilo PuntoExpress p.4)
    // a la vez que separa los núcleos de mayor potencial. (Bajado de 1.5 para
    // que los grados intermedios del gradiente ampliado sean visibles.)
    const maxScore = grid.reduce((m, c) => Math.max(m, c.score), 1);
    const points = grid
      .filter((cell) => cell.score > 0)
      .map((cell) => [cell.center.lat, cell.center.lon, (cell.score / maxScore) ** 1.3] as [number, number, number]);

    // Campo continuo: radio/blur grandes fusionan las celdas de 450m en una
    // superficie orgánica; max alto comprime la acumulación para que el área
    // urbana media quede en azules claros/medios y solo los núcleos saturen
    // a azul marino. Calibrado visualmente contra el heatmap de referencia.
    // OJO: maxZoom aquí NO es el zoom máximo del mapa — leaflet.heat atenúa la
    // intensidad por 2^(maxZoom - zoom); con 18 el mapa a zoom 12 quedaba a 1/64
    // de intensidad (heatmap invisible). 12 = intensidad plena al zoom inicial.
    // Gradiente de 11 paradas: más grados de intensidad distinguibles entre
    // el velo urbano bajo y los núcleos de mayor potencial.
    const heatLayer = L.heatLayer(points, {
      radius: 35,
      blur: 28,
      maxZoom: 12,
      max: 8,
      minOpacity: 0.06,
      gradient: {
        0.05: '#eef7fd',
        0.15: '#dbeffc',
        0.27: '#b7e2f8',
        0.38: '#8cd1f2',
        0.5: '#55bce9',
        0.6: '#2aa3dc',
        0.7: '#1585c8',
        0.79: '#0e6fb0',
        0.87: '#0B5FA5',
        0.94: '#083A66',
        1.0: '#04223d',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [grid, map]);

  return null;
}
