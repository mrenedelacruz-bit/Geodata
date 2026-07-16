import type { LatLon } from '../types';

/**
 * Datos socioeconómicos por sector de la Provincia de Santiago.
 *
 * Fuentes:
 * - Población provincial: X Censo Nacional de Población y Vivienda 2022 (ONE) —
 *   provincia Santiago ≈ 1,080,000 hab (segunda del país). Municipios:
 *   Santiago de los Caballeros (cabecera), Tamboril, Licey al Medio, Puñal,
 *   Villa González, Villa Bisonó (Navarrete), San José de las Matas, Jánico,
 *   Sabana Iglesia, Baitoa.
 * - Estratos ICV (SIUBEN): el corredor de la Av. 27 de Febrero / Estrella
 *   Sadhalá y los ensanches del este (Los Jardines, Villa Olga, Cerros de
 *   Gurabo, La Trinitaria) concentran el estrato alto del Cibao; el centro
 *   histórico es medio; los barrios populares del oeste y sur (Cienfuegos,
 *   Los Salados, Pekín) y los municipios de la sierra tienen pobreza
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
  // ── Santiago de los Caballeros (cabecera, área metropolitana) ──
  { id: 'stgo_centro', name: 'Centro Histórico / Monumento', municipio: 'Santiago', center: { lat: 19.451, lon: -70.697 }, radiusKm: 1.0, purchasingPower: 0.55, dataQuality: 'estimated' },
  { id: 'stgo_jardines', name: 'Los Jardines Metropolitanos / Villa Olga', municipio: 'Santiago', center: { lat: 19.465, lon: -70.684 }, radiusKm: 1.2, purchasingPower: 0.8, dataQuality: 'estimated' },
  { id: 'stgo_cerros_gurabo', name: 'Cerros de Gurabo / La Trinitaria', municipio: 'Santiago', center: { lat: 19.478, lon: -70.67 }, radiusKm: 1.2, purchasingPower: 0.78, dataQuality: 'estimated' },
  { id: 'stgo_gurabo', name: 'Gurabo / Llanos de Gurabo', municipio: 'Santiago', center: { lat: 19.495, lon: -70.66 }, radiusKm: 1.3, purchasingPower: 0.55, dataQuality: 'estimated' },
  { id: 'stgo_el_embrujo', name: 'El Embrujo / El Despertar', municipio: 'Santiago', center: { lat: 19.432, lon: -70.677 }, radiusKm: 1.0, purchasingPower: 0.62, dataQuality: 'estimated' },
  { id: 'stgo_la_joya', name: 'La Joya / Baracoa', municipio: 'Santiago', center: { lat: 19.458, lon: -70.708 }, radiusKm: 0.9, purchasingPower: 0.42, dataQuality: 'estimated' },
  { id: 'stgo_pekin', name: 'Pekín / Bella Vista', municipio: 'Santiago', center: { lat: 19.438, lon: -70.712 }, radiusKm: 1.0, purchasingPower: 0.34, dataQuality: 'estimated' },
  { id: 'stgo_cienfuegos', name: 'Cienfuegos', municipio: 'Santiago', center: { lat: 19.474, lon: -70.741 }, radiusKm: 1.5, purchasingPower: 0.28, dataQuality: 'estimated' },
  { id: 'stgo_los_salados', name: 'Los Salados / Ensanche Bermúdez', municipio: 'Santiago', center: { lat: 19.459, lon: -70.727 }, radiusKm: 1.1, purchasingPower: 0.3, dataQuality: 'estimated' },
  { id: 'stgo_hato_yaque', name: 'Hato del Yaque', municipio: 'Santiago', center: { lat: 19.47, lon: -70.79 }, radiusKm: 1.3, purchasingPower: 0.27, dataQuality: 'estimated' },
  { id: 'stgo_matanzas', name: 'Aeropuerto del Cibao / Matanzas', municipio: 'Santiago', center: { lat: 19.4, lon: -70.6 }, radiusKm: 1.4, purchasingPower: 0.4, dataQuality: 'estimated' },

  // ── Corredor este (Tamboril / Licey / Puñal) ──
  { id: 'tamboril', name: 'Tamboril Centro', municipio: 'Tamboril', center: { lat: 19.485, lon: -70.61 }, radiusKm: 1.3, purchasingPower: 0.38, dataQuality: 'estimated' },
  { id: 'licey', name: 'Licey al Medio', municipio: 'Licey al Medio', center: { lat: 19.428, lon: -70.598 }, radiusKm: 1.3, purchasingPower: 0.38, dataQuality: 'estimated' },
  { id: 'punal', name: 'Puñal', municipio: 'Puñal', center: { lat: 19.396, lon: -70.628 }, radiusKm: 1.3, purchasingPower: 0.32, dataQuality: 'estimated' },

  // ── Noroeste (Villa González / Navarrete) ──
  { id: 'villa_gonzalez', name: 'Villa González Centro', municipio: 'Villa González', center: { lat: 19.541, lon: -70.789 }, radiusKm: 1.3, purchasingPower: 0.32, dataQuality: 'estimated' },
  { id: 'navarrete', name: 'Navarrete (Villa Bisonó)', municipio: 'Villa Bisonó', center: { lat: 19.565, lon: -70.872 }, radiusKm: 1.3, purchasingPower: 0.33, dataQuality: 'estimated' },

  // ── Sierra (suroeste) ──
  { id: 'sajoma', name: 'San José de las Matas Centro', municipio: 'San José de las Matas', center: { lat: 19.339, lon: -70.943 }, radiusKm: 1.3, purchasingPower: 0.32, dataQuality: 'estimated' },
  { id: 'janico', name: 'Jánico', municipio: 'Jánico', center: { lat: 19.3, lon: -70.79 }, radiusKm: 1.2, purchasingPower: 0.28, dataQuality: 'estimated' },
  { id: 'sabana_iglesia', name: 'Sabana Iglesia', municipio: 'Sabana Iglesia', center: { lat: 19.322, lon: -70.749 }, radiusKm: 1.1, purchasingPower: 0.28, dataQuality: 'estimated' },
  { id: 'baitoa', name: 'Baitoa', municipio: 'Baitoa', center: { lat: 19.335, lon: -70.703 }, radiusKm: 1.1, purchasingPower: 0.29, dataQuality: 'estimated' },
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
