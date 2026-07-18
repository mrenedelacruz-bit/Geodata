import type { LatLon } from '../types';

export const METERS_PER_DEG_LAT = 111_320;

export function metersPerDegLon(lat: number): number {
  return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

/** Distancia en metros entre dos puntos (aproximación plana, suficiente a escala urbana). */
export function distanceMeters(a: LatLon, b: LatLon): number {
  const dLat = (a.lat - b.lat) * METERS_PER_DEG_LAT;
  const dLon = (a.lon - b.lon) * metersPerDegLon(a.lat);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/** "350 m" o "1.2 km". */
export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}
