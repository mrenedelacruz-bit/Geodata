import { getTomTomApiKey } from './tomtom';
import type { LatLon } from '../types';

interface TomTomReachableRangeResponse {
  reachableRange?: {
    boundary?: { latitude: number; longitude: number }[];
  };
}

/**
 * Calcula la zona alcanzable en auto desde un punto en un tiempo dado
 * (TomTom Calculate Reachable Range API). Devuelve el polígono límite en
 * lat/lon. Lanza un error descriptivo si la key no está configurada, si
 * TomTom responde con error (producto no habilitado, sin cobertura para el
 * punto, etc.) o si la respuesta no trae un polígono usable — el llamador
 * decide cómo mostrarlo (banner, mensaje en el panel, etc.).
 */
export async function fetchReachableRange(point: LatLon, timeBudgetSeconds: number): Promise<LatLon[]> {
  const apiKey = getTomTomApiKey();
  if (!apiKey) throw new Error('La API key de TomTom no está configurada en este despliegue.');

  // traffic=true: usa condiciones de tráfico reales al calcular el alcance
  // en vez de asumir velocidad libre ideal (que sobreestima el área,
  // sobre todo con congestión o vías rurales/no pavimentadas).
  const url = `https://api.tomtom.com/routing/1/calculateReachableRange/${point.lat},${point.lon}/json?key=${apiKey}&timeBudgetInSec=${timeBudgetSeconds}&travelMode=car&traffic=true`;
  const res = await fetch(url);
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.detailedError?.message || body?.error?.description || '';
    } catch {
      /* respuesta no era JSON; se reporta solo el status */
    }
    throw new Error(`TomTom respondió ${res.status}${detail ? `: ${detail}` : ''}`);
  }

  const json: TomTomReachableRangeResponse = await res.json();
  const boundary = json.reachableRange?.boundary;
  if (!boundary || boundary.length === 0) {
    throw new Error('TomTom no devolvió una zona de alcance para este punto (posible falta de cobertura de vías en la zona).');
  }
  return boundary.map((p) => ({ lat: p.latitude, lon: p.longitude }));
}
