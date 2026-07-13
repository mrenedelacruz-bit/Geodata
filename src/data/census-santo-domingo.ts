import type { LatLon } from '../types';

/**
 * Datos socioeconómicos por sector del Gran Santo Domingo.
 *
 * Fuentes:
 * - Población municipal: X Censo Nacional de Población y Vivienda 2022 (ONE).
 *   DN 1,029,110 · SD Este 1,029,117 · SD Norte 674,274 · SD Oeste 410,578 ·
 *   Los Alcarrizos 336,307 · Pedro Brand 92,973.
 * - Pobreza por barrio (DN): SIUBEN 2022 / MEPyD. Circ. 3: La Zurza 66.2%,
 *   Gualey 66.5%, Domingo Savio 65%, Capotillo 62.5%. DN promedio: 27% hogares
 *   pobres. Provincia SD: 6.4% pobreza extrema + 36.6% moderada (SIUBEN 2021).
 * - Estratos ICV (SIUBEN): ICV-4 = estrato alto (Piantini, Naco, Bella Vista,
 *   Los Cacicazgos, Paraíso), ICV-1/2 = pobreza extrema/moderada.
 *
 * `purchasingPower` es un índice 0–1 derivado de esas fuentes: 1 − tasa de
 * pobreza del sector, calibrado con el estrato ICV. Los sectores marcados
 * `estimated` interpolan el dato municipal/circunscripcional; los `sourced`
 * tienen cifra directa de SIUBEN/MEPyD.
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
  // ── Distrito Nacional · Polígono Central (ICV-4, estrato alto) ──
  { id: 'piantini', name: 'Piantini / Serrallés', municipio: 'Distrito Nacional', center: { lat: 18.472, lon: -69.929 }, radiusKm: 1.2, purchasingPower: 0.95, dataQuality: 'sourced' },
  { id: 'naco', name: 'Naco', municipio: 'Distrito Nacional', center: { lat: 18.478, lon: -69.922 }, radiusKm: 1.0, purchasingPower: 0.93, dataQuality: 'sourced' },
  { id: 'paraiso', name: 'Paraíso / Los Restauradores', municipio: 'Distrito Nacional', center: { lat: 18.464, lon: -69.941 }, radiusKm: 1.0, purchasingPower: 0.92, dataQuality: 'sourced' },
  { id: 'bella_vista', name: 'Bella Vista', municipio: 'Distrito Nacional', center: { lat: 18.452, lon: -69.938 }, radiusKm: 1.1, purchasingPower: 0.9, dataQuality: 'sourced' },
  { id: 'cacicazgos', name: 'Los Cacicazgos / Mirador Sur', municipio: 'Distrito Nacional', center: { lat: 18.448, lon: -69.952 }, radiusKm: 1.3, purchasingPower: 0.9, dataQuality: 'sourced' },
  { id: 'evaristo', name: 'Evaristo Morales / Julieta', municipio: 'Distrito Nacional', center: { lat: 18.479, lon: -69.938 }, radiusKm: 1.0, purchasingPower: 0.85, dataQuality: 'estimated' },
  { id: 'millon', name: 'El Millón / Los Prados', municipio: 'Distrito Nacional', center: { lat: 18.465, lon: -69.958 }, radiusKm: 1.2, purchasingPower: 0.82, dataQuality: 'estimated' },
  { id: 'arroyo_hondo', name: 'Arroyo Hondo / Los Ríos', municipio: 'Distrito Nacional', center: { lat: 18.497, lon: -69.962 }, radiusKm: 1.8, purchasingPower: 0.78, dataQuality: 'estimated' },

  // ── Distrito Nacional · Centro-este ──
  { id: 'gazcue', name: 'Gazcue', municipio: 'Distrito Nacional', center: { lat: 18.463, lon: -69.905 }, radiusKm: 1.0, purchasingPower: 0.75, dataQuality: 'estimated' },
  { id: 'zona_universitaria', name: 'Zona Universitaria', municipio: 'Distrito Nacional', center: { lat: 18.459, lon: -69.917 }, radiusKm: 0.9, purchasingPower: 0.7, dataQuality: 'estimated' },
  { id: 'zona_colonial', name: 'Zona Colonial / Ciudad Nueva', municipio: 'Distrito Nacional', center: { lat: 18.473, lon: -69.885 }, radiusKm: 1.0, purchasingPower: 0.68, dataQuality: 'estimated' },

  // ── Distrito Nacional · Circunscripciones 2 y 3 ──
  { id: 'cristo_rey', name: 'Cristo Rey / La Agustina', municipio: 'Distrito Nacional', center: { lat: 18.495, lon: -69.932 }, radiusKm: 1.2, purchasingPower: 0.38, dataQuality: 'estimated' },
  { id: 'villa_juana', name: 'Villa Juana / Villa Consuelo', municipio: 'Distrito Nacional', center: { lat: 18.489, lon: -69.902 }, radiusKm: 1.1, purchasingPower: 0.4, dataQuality: 'estimated' },
  { id: 'villas_agricolas', name: 'Villas Agrícolas / Ens. Luperón', municipio: 'Distrito Nacional', center: { lat: 18.5, lon: -69.905 }, radiusKm: 1.0, purchasingPower: 0.32, dataQuality: 'estimated' },
  { id: 'capotillo', name: 'Capotillo / Simón Bolívar', municipio: 'Distrito Nacional', center: { lat: 18.504, lon: -69.915 }, radiusKm: 1.0, purchasingPower: 0.2, povertyRate: 62.5, dataQuality: 'sourced' },
  { id: 'zurza', name: 'La Zurza', municipio: 'Distrito Nacional', center: { lat: 18.51, lon: -69.926 }, radiusKm: 0.8, purchasingPower: 0.15, povertyRate: 66.2, dataQuality: 'sourced' },
  { id: 'gualey', name: 'Gualey / Los Guandules', municipio: 'Distrito Nacional', center: { lat: 18.498, lon: -69.892 }, radiusKm: 0.9, purchasingPower: 0.15, povertyRate: 66.5, dataQuality: 'sourced' },
  { id: 'domingo_savio', name: 'Domingo Savio / La Ciénaga', municipio: 'Distrito Nacional', center: { lat: 18.492, lon: -69.886 }, radiusKm: 0.9, purchasingPower: 0.16, povertyRate: 65, dataQuality: 'sourced' },
  { id: 'honduras', name: 'Honduras / 30 de Mayo', municipio: 'Distrito Nacional', center: { lat: 18.443, lon: -69.965 }, radiusKm: 1.0, purchasingPower: 0.45, dataQuality: 'estimated' },

  // ── Santo Domingo Este (1,029,117 hab · Censo 2022) ──
  { id: 'ens_ozama', name: 'Ensanche Ozama', municipio: 'SD Este', center: { lat: 18.478, lon: -69.868 }, radiusKm: 1.3, purchasingPower: 0.55, dataQuality: 'estimated' },
  { id: 'alma_rosa', name: 'Alma Rosa / Ens. Isabelita', municipio: 'SD Este', center: { lat: 18.484, lon: -69.852 }, radiusKm: 1.4, purchasingPower: 0.55, dataQuality: 'estimated' },
  { id: 'los_mina', name: 'Los Mina', municipio: 'SD Este', center: { lat: 18.497, lon: -69.865 }, radiusKm: 1.3, purchasingPower: 0.35, dataQuality: 'estimated' },
  { id: 'invivienda', name: 'Invivienda / San Isidro', municipio: 'SD Este', center: { lat: 18.487, lon: -69.805 }, radiusKm: 2.0, purchasingPower: 0.45, dataQuality: 'estimated' },
  { id: 'cancino', name: 'Cancino / Charles de Gaulle', municipio: 'SD Este', center: { lat: 18.51, lon: -69.825 }, radiusKm: 1.8, purchasingPower: 0.33, dataQuality: 'estimated' },

  // ── Santo Domingo Norte (674,274 hab · Censo 2022) ──
  { id: 'villa_mella', name: 'Villa Mella', municipio: 'SD Norte', center: { lat: 18.545, lon: -69.9 }, radiusKm: 2.0, purchasingPower: 0.32, dataQuality: 'estimated' },
  { id: 'sabana_perdida', name: 'Sabana Perdida', municipio: 'SD Norte', center: { lat: 18.548, lon: -69.858 }, radiusKm: 1.8, purchasingPower: 0.3, dataQuality: 'estimated' },
  { id: 'guaricano', name: 'El Guaricano', municipio: 'SD Norte', center: { lat: 18.562, lon: -69.92 }, radiusKm: 1.5, purchasingPower: 0.25, dataQuality: 'estimated' },
  { id: 'higuero', name: 'El Higüero / La Victoria (sur)', municipio: 'SD Norte', center: { lat: 18.585, lon: -69.96 }, radiusKm: 2.2, purchasingPower: 0.33, dataQuality: 'estimated' },

  // ── Santo Domingo Oeste (410,578 hab · Censo 2022) ──
  { id: 'herrera', name: 'Herrera / Las Palmas', municipio: 'SD Oeste', center: { lat: 18.485, lon: -69.97 }, radiusKm: 1.6, purchasingPower: 0.42, dataQuality: 'estimated' },
  { id: 'manoguayabo', name: 'Manoguayabo', municipio: 'SD Oeste', center: { lat: 18.51, lon: -70.0 }, radiusKm: 1.8, purchasingPower: 0.35, dataQuality: 'estimated' },
  { id: 'engombe', name: 'Engombe / Bayona', municipio: 'SD Oeste', center: { lat: 18.458, lon: -69.992 }, radiusKm: 1.6, purchasingPower: 0.38, dataQuality: 'estimated' },

  // ── Los Alcarrizos (336,307 hab) y Pedro Brand (92,973 hab) ──
  { id: 'alcarrizos', name: 'Los Alcarrizos', municipio: 'Los Alcarrizos', center: { lat: 18.517, lon: -70.033 }, radiusKm: 2.2, purchasingPower: 0.3, dataQuality: 'estimated' },
  { id: 'pantoja', name: 'Pantoja', municipio: 'Los Alcarrizos', center: { lat: 18.503, lon: -70.008 }, radiusKm: 1.4, purchasingPower: 0.45, dataQuality: 'estimated' },
  { id: 'pedro_brand', name: 'Pedro Brand', municipio: 'Pedro Brand', center: { lat: 18.56, lon: -70.09 }, radiusKm: 2.5, purchasingPower: 0.28, dataQuality: 'estimated' },
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
    // Prioriza el sector cuyo borde queda relativamente más cerca.
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

export function powerLabel(power: number): string {
  if (power >= 0.8) return 'Alto (ICV-4)';
  if (power >= 0.6) return 'Medio-alto (ICV-3/4)';
  if (power >= 0.45) return 'Medio (ICV-3)';
  if (power >= 0.28) return 'Medio-bajo (ICV-2/3)';
  return 'Bajo (ICV-1/2)';
}

export function powerColor(power: number): string {
  if (power >= 0.8) return '#1b5e20';
  if (power >= 0.6) return '#43a047';
  if (power >= 0.45) return '#fbc02d';
  if (power >= 0.28) return '#f57c00';
  return '#d32f2f';
}
