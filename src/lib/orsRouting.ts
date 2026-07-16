import { getOrsApiKey } from './ors';
import type { LatLon } from '../types';

interface OrsIsochroneResponse {
  features?: {
    geometry?: {
      type?: string;
      coordinates?: number[][][];
    };
  }[];
}

/**
 * Calcula la zona alcanzable en auto desde un punto en un tiempo dado
 * (OpenRouteService Isochrones API, sobre datos de OpenStreetMap). Devuelve
 * el polígono límite en lat/lon. Lanza un error descriptivo si la key no
 * está configurada, si ORS responde con error (cuota agotada, sin cobertura
 * para el punto, etc.) o si la respuesta no trae un polígono usable — el
 * llamador decide cómo mostrarlo.
 */
export async function fetchReachableRange(point: LatLon, timeBudgetSeconds: number): Promise<LatLon[]> {
  const apiKey = getOrsApiKey();
  if (!apiKey) throw new Error('La API key de OpenRouteService no está configurada en este despliegue.');

  const res = await fetch('https://api.openrouteservice.org/v2/isochrones/driving-car', {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locations: [[point.lon, point.lat]],
      range: [timeBudgetSeconds],
      range_type: 'time',
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error?.message || body?.error || '';
    } catch {
      /* respuesta no era JSON; se reporta solo el status */
    }
    throw new Error(`OpenRouteService respondió ${res.status}${detail ? `: ${detail}` : ''}`);
  }

  const json: OrsIsochroneResponse = await res.json();
  const ring = json.features?.[0]?.geometry?.coordinates?.[0];
  if (!ring || ring.length === 0) {
    throw new Error('OpenRouteService no devolvió una zona de alcance para este punto (posible falta de cobertura de vías en la zona).');
  }
  return ring.map(([lon, lat]) => ({ lat, lon }));
}
