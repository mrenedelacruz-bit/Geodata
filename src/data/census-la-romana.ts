import type { LatLon } from '../types';

/**
 * Datos socioeconómicos por sector de la Provincia de La Romana.
 *
 * Fuentes:
 * - Población provincial: X Censo Nacional de Población y Vivienda 2022 (ONE) —
 *   provincia La Romana ≈ 275,000 hab. Municipios: La Romana (cabecera),
 *   Villa Hermosa, Guaymate.
 * - Estratos ICV (SIUBEN): Casa de Campo / Altos de Chavón concentran el mayor
 *   poder adquisitivo del país (resort y residencial de lujo); el centro de La
 *   Romana es medio (industria azucarera, zona franca, puerto de cruceros);
 *   Villa Hermosa y los barrios periféricos son medio-bajos; Guaymate y los
 *   bateyes cañeros del norte tienen pobreza alta.
 *
 * `purchasingPower` es un índice 0–1 calibrado con el estrato ICV. Todos los
 * sectores de esta provincia están marcados `estimated`: interpolan el estrato
 * municipal/turístico, pendientes de cifra directa SIUBEN por barrio.
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
  // ── La Romana ciudad (cabecera provincial) ──
  { id: 'lr_centro', name: 'Centro / Parque Central', municipio: 'La Romana', center: { lat: 18.428, lon: -68.972 }, radiusKm: 1.0, purchasingPower: 0.5, dataQuality: 'estimated' },
  { id: 'lr_buena_vista', name: 'Buena Vista Norte / Sur', municipio: 'La Romana', center: { lat: 18.445, lon: -68.965 }, radiusKm: 1.1, purchasingPower: 0.45, dataQuality: 'estimated' },
  { id: 'lr_barrios_oeste', name: 'Barrios del Oeste (Villa Verde / Piedra Linda)', municipio: 'La Romana', center: { lat: 18.44, lon: -68.995 }, radiusKm: 1.2, purchasingPower: 0.32, dataQuality: 'estimated' },
  { id: 'lr_zona_franca', name: 'Zona Franca / Central Romana', municipio: 'La Romana', center: { lat: 18.445, lon: -69.005 }, radiusKm: 1.2, purchasingPower: 0.38, dataQuality: 'estimated' },
  { id: 'lr_caleta', name: 'Caleta / costa oeste', municipio: 'La Romana', center: { lat: 18.43, lon: -69.04 }, radiusKm: 1.2, purchasingPower: 0.3, dataQuality: 'estimated' },

  // ── Polo turístico de lujo (este) ──
  { id: 'casa_de_campo', name: 'Casa de Campo', municipio: 'La Romana', center: { lat: 18.405, lon: -68.905 }, radiusKm: 1.8, purchasingPower: 0.95, dataQuality: 'estimated' },
  { id: 'altos_chavon', name: 'Altos de Chavón / Marina', municipio: 'La Romana', center: { lat: 18.417, lon: -68.885 }, radiusKm: 1.2, purchasingPower: 0.85, dataQuality: 'estimated' },

  // ── Villa Hermosa (corredor hacia el norte) ──
  { id: 'villa_hermosa', name: 'Villa Hermosa Centro', municipio: 'Villa Hermosa', center: { lat: 18.462, lon: -68.955 }, radiusKm: 1.3, purchasingPower: 0.32, dataQuality: 'estimated' },
  { id: 'cumayasa', name: 'Cumayasa / corredor La Romana–San Pedro', municipio: 'Villa Hermosa', center: { lat: 18.44, lon: -69.07 }, radiusKm: 1.3, purchasingPower: 0.28, dataQuality: 'estimated' },

  // ── Guaymate y bateyes del norte ──
  { id: 'guaymate', name: 'Guaymate Centro', municipio: 'Guaymate', center: { lat: 18.58, lon: -68.98 }, radiusKm: 1.4, purchasingPower: 0.26, dataQuality: 'estimated' },
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
