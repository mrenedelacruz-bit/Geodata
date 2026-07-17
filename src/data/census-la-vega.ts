import type { LatLon } from '../types';

/**
 * Datos socioeconómicos por sector de la Provincia de La Vega.
 *
 * Fuentes:
 * - Población provincial: X Censo Nacional de Población y Vivienda 2022 (ONE) —
 *   provincia La Vega ≈ 405,000 hab. Municipios: Concepción de La Vega
 *   (cabecera), Constanza, Jarabacoa, Jima Abajo.
 * - Estratos ICV (SIUBEN): el centro de La Vega y sus urbanizaciones son
 *   medios; Jarabacoa combina un centro medio con zonas de villas/turismo de
 *   montaña de mayor poder adquisitivo; Constanza es agrícola con ICV
 *   medio-bajo; las zonas rurales del valle y la cordillera tienen pobreza
 *   moderada-alta.
 *
 * `purchasingPower` es un índice 0–1 calibrado con el estrato ICV. Todos los
 * sectores de esta provincia están marcados `estimated`: interpolan el estrato
 * municipal, pendientes de cifra directa SIUBEN por barrio.
 */
export interface CensusSector {
  id: string;
  name: string;
  municipio: string;
  center: LatLon;
  radiusKm: number;
  /** Índice de poder adquisitivo 0–1 (1 = estrato alto ICV-4). */
  purchasingPower: number;
  /** % de hogares pobres del sector (SIUBEN/MEPyD) si hay cifra directa. */
  povertyRate?: number;
  dataQuality: 'sourced' | 'estimated';
}

export const CENSUS_SECTORS: CensusSector[] = [
  // ── Concepción de La Vega (cabecera provincial) ──
  { id: 'lv_centro', name: 'Centro / Parque Duarte', municipio: 'La Vega', center: { lat: 19.222, lon: -70.529 }, radiusKm: 1.0, purchasingPower: 0.5, dataQuality: 'estimated' },
  { id: 'lv_urbanizaciones', name: 'Urbanizaciones Norte (Villa Rosa / El Mirador)', municipio: 'La Vega', center: { lat: 19.235, lon: -70.52 }, radiusKm: 1.1, purchasingPower: 0.55, dataQuality: 'estimated' },
  { id: 'lv_barrios_sur', name: 'Barrios del Sur (Palmarito / Río Verde)', municipio: 'La Vega', center: { lat: 19.205, lon: -70.54 }, radiusKm: 1.2, purchasingPower: 0.32, dataQuality: 'estimated' },
  { id: 'lv_zona_franca', name: 'Zona Franca / periferia industrial', municipio: 'La Vega', center: { lat: 19.25, lon: -70.55 }, radiusKm: 1.2, purchasingPower: 0.38, dataQuality: 'estimated' },
  { id: 'lv_cutupu', name: 'Cutupú / Rincón', municipio: 'La Vega', center: { lat: 19.28, lon: -70.47 }, radiusKm: 1.3, purchasingPower: 0.28, dataQuality: 'estimated' },

  // ── Jarabacoa (turismo de montaña) ──
  { id: 'jarabacoa_centro', name: 'Jarabacoa Centro', municipio: 'Jarabacoa', center: { lat: 19.117, lon: -70.637 }, radiusKm: 1.1, purchasingPower: 0.5, dataQuality: 'estimated' },
  { id: 'jarabacoa_villas', name: 'Villas y proyectos de montaña', municipio: 'Jarabacoa', center: { lat: 19.14, lon: -70.62 }, radiusKm: 1.4, purchasingPower: 0.68, dataQuality: 'estimated' },
  { id: 'jarabacoa_rural', name: 'Zona rural (Manabao dirección)', municipio: 'Jarabacoa', center: { lat: 19.08, lon: -70.7 }, radiusKm: 1.5, purchasingPower: 0.28, dataQuality: 'estimated' },

  // ── Constanza (valle agrícola de altura) ──
  { id: 'constanza_centro', name: 'Constanza Centro', municipio: 'Constanza', center: { lat: 18.909, lon: -70.746 }, radiusKm: 1.2, purchasingPower: 0.4, dataQuality: 'estimated' },
  { id: 'constanza_valle', name: 'Valle agrícola de Constanza', municipio: 'Constanza', center: { lat: 18.89, lon: -70.72 }, radiusKm: 1.5, purchasingPower: 0.3, dataQuality: 'estimated' },

  // ── Jima Abajo y valle oriental ──
  { id: 'jima_abajo', name: 'Jima Abajo', municipio: 'Jima Abajo', center: { lat: 19.13, lon: -70.37 }, radiusKm: 1.3, purchasingPower: 0.29, dataQuality: 'estimated' },
];

const METERS_PER_DEG_LAT = 111_320;

function distKm(a: LatLon, b: LatLon): number {
  const dLat = (a.lat - b.lat) * METERS_PER_DEG_LAT;
  const dLon = (a.lon - b.lon) * METERS_PER_DEG_LAT * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon) / 1000;
}

/** Poder adquisitivo neutro cuando el punto no cae cerca de ningún sector mapeado. */
export const NEUTRAL_POWER = 0.5;

/**
 * Devuelve el sector censal más cercano a un punto, si el punto cae dentro de
 * (radiusKm × 1.5) de su centro; null fuera de todo sector mapeado.
 */
export function sectorAt(point: LatLon): CensusSector | null {
  let best: CensusSector | null = null;
  let bestScore = Infinity;
  for (const s of CENSUS_SECTORS) {
    const d = distKm(point, s.center);
    if (d > s.radiusKm * 1.5) continue;
    const rel = d / s.radiusKm;
    if (rel < bestScore) {
      bestScore = rel;
      best = s;
    }
  }
  return best;
}

/** Índice de poder adquisitivo 0–1 en un punto (0.5 neutro si no hay sector). */
export function purchasingPowerAt(point: LatLon): number {
  return sectorAt(point)?.purchasingPower ?? NEUTRAL_POWER;
}
