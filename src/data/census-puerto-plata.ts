import type { LatLon } from '../types';

/**
 * Datos socioeconómicos por sector de la Provincia de Puerto Plata.
 *
 * Fuentes:
 * - Población provincial: X Censo Nacional de Población y Vivienda 2022 (ONE) —
 *   provincia Puerto Plata ≈ 321,600 hab. Municipios: San Felipe de Puerto Plata
 *   (cabecera), Sosúa (con los distritos Cabarete y Sabaneta de Yásica), Imbert,
 *   Luperón, Altamira, Villa Isabela, Villa Montellano, Guananico, Los Hidalgos.
 * - Estratos ICV (SIUBEN): los polos turísticos (Playa Dorada, Cofresí, El Batey
 *   de Sosúa, Cabarete) concentran el mayor poder adquisitivo (turismo y
 *   residencial extranjero); el centro de la ciudad es medio; los barrios
 *   populares (Los Charamicos, barrios del sur de la ciudad) y los municipios
 *   del interior tienen pobreza moderada-alta.
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
  // ── San Felipe de Puerto Plata (cabecera provincial) ──
  { id: 'pp_centro', name: 'Centro Histórico / Parque Central', municipio: 'Puerto Plata', center: { lat: 19.797, lon: -70.687 }, radiusKm: 0.9, purchasingPower: 0.55, dataQuality: 'estimated' },
  { id: 'pp_malecon', name: 'Malecón / Long Beach', municipio: 'Puerto Plata', center: { lat: 19.8, lon: -70.677 }, radiusKm: 0.8, purchasingPower: 0.58, dataQuality: 'estimated' },
  { id: 'pp_bella_vista', name: 'Bella Vista / Urbanizaciones Este', municipio: 'Puerto Plata', center: { lat: 19.788, lon: -70.672 }, radiusKm: 1.0, purchasingPower: 0.6, dataQuality: 'estimated' },
  { id: 'pp_barrios_sur', name: 'Barrios del Sur (San Marcos / Padre Las Casas)', municipio: 'Puerto Plata', center: { lat: 19.78, lon: -70.7 }, radiusKm: 1.5, purchasingPower: 0.35, dataQuality: 'estimated' },
  { id: 'playa_dorada', name: 'Playa Dorada / Costa Dorada', municipio: 'Puerto Plata', center: { lat: 19.771, lon: -70.628 }, radiusKm: 1.2, purchasingPower: 0.85, dataQuality: 'estimated' },
  { id: 'cofresi', name: 'Cofresí / Costambar', municipio: 'Puerto Plata', center: { lat: 19.78, lon: -70.727 }, radiusKm: 1.2, purchasingPower: 0.78, dataQuality: 'estimated' },
  { id: 'maimon', name: 'Maimón / Amber Cove', municipio: 'Puerto Plata', center: { lat: 19.799, lon: -70.758 }, radiusKm: 1.2, purchasingPower: 0.5, dataQuality: 'estimated' },

  // ── Sosúa (turismo y residencial internacional) ──
  { id: 'sosua_batey', name: 'Sosúa El Batey (centro turístico)', municipio: 'Sosúa', center: { lat: 19.752, lon: -70.512 }, radiusKm: 0.9, purchasingPower: 0.8, dataQuality: 'estimated' },
  { id: 'sosua_charamicos', name: 'Los Charamicos', municipio: 'Sosúa', center: { lat: 19.746, lon: -70.523 }, radiusKm: 0.7, purchasingPower: 0.35, dataQuality: 'estimated' },
  { id: 'sosua_abajo', name: 'Sosúa Abajo / residencial', municipio: 'Sosúa', center: { lat: 19.757, lon: -70.535 }, radiusKm: 1.0, purchasingPower: 0.62, dataQuality: 'estimated' },

  // ── Cabarete (distrito de Sosúa · turismo deportivo) ──
  { id: 'cabarete_playa', name: 'Cabarete Centro / Playa (kitesurf)', municipio: 'Cabarete (Sosúa)', center: { lat: 19.758, lon: -70.409 }, radiusKm: 1.0, purchasingPower: 0.78, dataQuality: 'estimated' },
  { id: 'cabarete_loma', name: 'Callejón de la Loma / Islabón', municipio: 'Cabarete (Sosúa)', center: { lat: 19.75, lon: -70.42 }, radiusKm: 0.8, purchasingPower: 0.4, dataQuality: 'estimated' },
  { id: 'sabaneta_yasica', name: 'Sabaneta de Yásica', municipio: 'Sosúa', center: { lat: 19.705, lon: -70.403 }, radiusKm: 1.2, purchasingPower: 0.3, dataQuality: 'estimated' },

  // ── Villa Montellano (corredor Puerto Plata–Sosúa) ──
  { id: 'montellano', name: 'Villa Montellano', municipio: 'Villa Montellano', center: { lat: 19.758, lon: -70.559 }, radiusKm: 1.2, purchasingPower: 0.32, dataQuality: 'estimated' },

  // ── Municipios del interior y oeste ──
  { id: 'imbert', name: 'Imbert Centro', municipio: 'Imbert', center: { lat: 19.755, lon: -70.83 }, radiusKm: 1.2, purchasingPower: 0.35, dataQuality: 'estimated' },
  { id: 'altamira', name: 'Altamira Centro', municipio: 'Altamira', center: { lat: 19.699, lon: -70.84 }, radiusKm: 1.2, purchasingPower: 0.3, dataQuality: 'estimated' },
  { id: 'guananico', name: 'Guananico', municipio: 'Guananico', center: { lat: 19.726, lon: -70.918 }, radiusKm: 1.0, purchasingPower: 0.27, dataQuality: 'estimated' },
  { id: 'luperon', name: 'Luperón Centro / Marina', municipio: 'Luperón', center: { lat: 19.89, lon: -70.962 }, radiusKm: 1.2, purchasingPower: 0.36, dataQuality: 'estimated' },
  { id: 'los_hidalgos', name: 'Los Hidalgos', municipio: 'Los Hidalgos', center: { lat: 19.737, lon: -71.034 }, radiusKm: 1.1, purchasingPower: 0.28, dataQuality: 'estimated' },
  { id: 'villa_isabela', name: 'Villa Isabela', municipio: 'Villa Isabela', center: { lat: 19.817, lon: -71.067 }, radiusKm: 1.2, purchasingPower: 0.28, dataQuality: 'estimated' },

  // ── Límite oriental de la provincia ──
  { id: 'gaspar_hernandez', name: 'Gaspar Hernández Centro', municipio: 'Gaspar Hernández', center: { lat: 19.627, lon: -70.276 }, radiusKm: 1.2, purchasingPower: 0.3, dataQuality: 'estimated' },
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
