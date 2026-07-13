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

    // Normaliza contra el mejor score; exponente 1.5 conserva el "velo" urbano
    // de valores medios (profundidad de campo continuo, estilo PuntoExpress p.4)
    // a la vez que separa los núcleos de mayor potencial.
    const maxScore = grid.reduce((m, c) => Math.max(m, c.score), 1);
    const points = grid
      .filter((cell) => cell.score > 0)
      .map((cell) => [cell.center.lat, cell.center.lon, (cell.score / maxScore) ** 1.5] as [number, number, number]);

    // Campo continuo: radio/blur grandes fusionan las celdas de 450m en una
    // superficie orgánica; max alto comprime la acumulación para que el área
    // urbana media quede en azules claros/medios y solo los núcleos saturen
    // a azul marino. Calibrado visualmente contra el heatmap de referencia.
    // OJO: maxZoom aquí NO es el zoom máximo del mapa — leaflet.heat atenúa la
    // intensidad por 2^(maxZoom - zoom); con 18 el mapa a zoom 12 quedaba a 1/64
    // de intensidad (heatmap invisible). 12 = intensidad plena al zoom inicial.
    const heatLayer = L.heatLayer(points, {
      radius: 35,
      blur: 28,
      maxZoom: 12,
      max: 8,
      minOpacity: 0.06,
      gradient: {
        0.1: '#dbeffc',
        0.3: '#a5ddf5',
        0.5: '#4db8e8',
        0.68: '#1585c8',
        0.82: '#0B5FA5',
        0.95: '#083A66',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [grid, map]);

  return null;
}
