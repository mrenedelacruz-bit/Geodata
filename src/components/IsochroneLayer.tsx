import { useEffect, useState } from 'react';
import { Polygon, Popup } from 'react-leaflet';
import { fetchReachableRange } from '../lib/tomtomRouting';
import type { LatLon } from '../types';

interface Props {
  point: LatLon;
  minutes: number;
  onError: (message: string | null) => void;
}

/**
 * Isócrona de tiempo real de manejo (TomTom Calculate Reachable Range):
 * dibuja el polígono de la zona alcanzable en auto desde el punto
 * seleccionado, considerando la red vial real (no un radio de línea recta).
 */
export default function IsochroneLayer({ point, minutes, onError }: Props) {
  const [boundary, setBoundary] = useState<LatLon[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBoundary(null);
    onError(null);
    fetchReachableRange(point, minutes * 60)
      .then((result) => {
        if (!cancelled) setBoundary(result);
      })
      .catch((err) => {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : 'Error desconocido calculando la zona de alcance.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [point, minutes, onError]);

  if (!boundary) return null;

  return (
    <Polygon
      positions={boundary.map((p) => [p.lat, p.lon]) as [number, number][]}
      pathOptions={{ color: '#7c3aed', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.1, dashArray: '4 4' }}
    >
      <Popup>
        <div style={{ fontSize: '12px' }}>Zona alcanzable en {minutes} min en auto (TomTom)</div>
      </Popup>
    </Polygon>
  );
}
