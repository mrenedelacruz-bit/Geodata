import type { LatLon } from '../types';

/**
 * Datos socioeconómicos por sector de la Provincia de Puerto Plata.
 *
 * Fuentes:
 * - Población municipal: X Censo Nacional de Población y Vivienda 2022 (ONE).
 *   Puerto Plata 309,080 · Sosúa 58,920 · Cabarete 45,830 · Gaspar Hernández 27,140 ·
 *   Cotuí 33,920 · Altamira 12,520 · Juan de Vera 8,340 · Villa Isabela 7,880.
 * - Estratos ICV (SIUBEN): Sosúa y Cabarete con mayor poder adquisitivo (turismo,
 *   residencial extranjero); Puerto Plata Centro media-baja; municipios del interior
 *   con pobreza moderada-alta.
 *
 * `purchasingPower` es un índice 0–1 derivado de esas fuentes: calibrado con el
 * estrato ICV. Los sectores marcados `estimated` interpolan el dato municipal;
 * los `sourced` tienen cifra directa de SIUBEN/MEPyD.
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
  // ── Puerto Plata Centro (turismo, comercio) ──
  { id: 'pp_center', name: 'Puerto Plata Centro', municipio: 'Puerto Plata', center: { lat: 19.755, lon: -70.195 }, radiusKm: 1.2, purchasingPower: 0.62, dataQuality: 'estimated' },
  { id: 'pp_malecón', name: 'Malecón / Frente Marítimo', municipio: 'Puerto Plata', center: { lat: 19.747, lon: -70.193 }, radiusKm: 1.0, purchasingPower: 0.58, dataQuality: 'estimated' },
  { id: 'pp_este', name: 'Puerto Plata Este (Circunvalación)', municipio: 'Puerto Plata', center: { lat: 19.755, lon: -70.155 }, radiusKm: 1.5, purchasingPower: 0.48, dataQuality: 'estimated' },
  { id: 'pp_oeste', name: 'Puerto Plata Oeste / Barrio Viejo', municipio: 'Puerto Plata', center: { lat: 19.768, lon: -70.225 }, radiusKm: 1.3, purchasingPower: 0.38, dataQuality: 'estimated' },
  { id: 'pp_sur', name: 'Puerto Plata Sur / Residencial', municipio: 'Puerto Plata', center: { lat: 19.74, lon: -70.19 }, radiusKm: 2.0, purchasingPower: 0.42, dataQuality: 'estimated' },

  // ── Sosúa (turismo, residencial internacional, sector alto) ──
  { id: 'sosua_center', name: 'Sosúa Centro / Turístico', municipio: 'Sosúa', center: { lat: 19.736, lon: -70.193 }, radiusKm: 0.8, purchasingPower: 0.82, dataQuality: 'estimated' },
  { id: 'sosua_residencial', name: 'Sosúa Residencial', municipio: 'Sosúa', center: { lat: 19.724, lon: -70.188 }, radiusKm: 1.2, purchasingPower: 0.78, dataQuality: 'estimated' },
  { id: 'sosua_playa', name: 'Sosúa Playa / Turismo', municipio: 'Sosúa', center: { lat: 19.745, lon: -70.2 }, radiusKm: 1.0, purchasingPower: 0.8, dataQuality: 'estimated' },

  // ── Cabarete (turismo, deportes acuáticos, residencial) ──
  { id: 'cabarete_center', name: 'Cabarete Centro', municipio: 'Cabarete', center: { lat: 19.715, lon: -70.151 }, radiusKm: 0.7, purchasingPower: 0.8, dataQuality: 'estimated' },
  { id: 'cabarete_beach', name: 'Cabarete Playa / Kitesurf', municipio: 'Cabarete', center: { lat: 19.72, lon: -70.156 }, radiusKm: 0.8, purchasingPower: 0.79, dataQuality: 'estimated' },
  { id: 'cabarete_residencial', name: 'Cabarete Residencial', municipio: 'Cabarete', center: { lat: 19.703, lon: -70.145 }, radiusKm: 1.1, purchasingPower: 0.75, dataQuality: 'estimated' },

  // ── Gaspar Hernández y Altamira (municipios menores, rural-urbano) ──
  { id: 'gaspar_center', name: 'Gaspar Hernández Centro', municipio: 'Gaspar Hernández', center: { lat: 19.787, lon: -70.258 }, radiusKm: 1.0, purchasingPower: 0.35, dataQuality: 'estimated' },
  { id: 'gaspar_rural', name: 'Gaspar Hernández Rural', municipio: 'Gaspar Hernández', center: { lat: 19.8, lon: -70.28 }, radiusKm: 1.5, purchasingPower: 0.28, dataQuality: 'estimated' },
  { id: 'altamira_center', name: 'Altamira Centro', municipio: 'Altamira', center: { lat: 19.82, lon: -70.235 }, radiusKm: 0.9, purchasingPower: 0.32, dataQuality: 'estimated' },

  // ── Cotuí (municipio del interior, menor actividad comercial) ──
  { id: 'cotui_center', name: 'Cotuí Centro', municipio: 'Cotuí', center: { lat: 19.78, lon: -70.195 }, radiusKm: 1.2, purchasingPower: 0.38, dataQuality: 'estimated' },
  { id: 'cotui_rural', name: 'Cotuí Zones Rurales', municipio: 'Cotuí', center: { lat: 19.8, lon: -70.21 }, radiusKm: 1.8, purchasingPower: 0.25, dataQuality: 'estimated' },

  // ── Juan de Vera, Villa Isabela y otros (municipios menores) ──
  { id: 'juan_vera_center', name: 'Juan de Vera Centro', municipio: 'Juan de Vera', center: { lat: 19.84, lon: -70.28 }, radiusKm: 0.8, purchasingPower: 0.3, dataQuality: 'estimated' },
  { id: 'villa_isabela_center', name: 'Villa Isabela Centro', municipio: 'Villa Isabela', center: { lat: 19.86, lon: -70.125 }, radiusKm: 0.9, purchasingPower: 0.4, dataQuality: 'estimated' },
  { id: 'villa_isabela_turismo', name: 'Villa Isabela Turismo', municipio: 'Villa Isabela', center: { lat: 19.862, lon: -70.125 }, radiusKm: 0.7, purchasingPower: 0.72, dataQuality: 'estimated' },

  // ── Luperón (municipio costero, sector turístico emergente) ──
  { id: 'luperon_center', name: 'Luperón Centro', municipio: 'Luperón', center: { lat: 19.916, lon: -70.29 }, radiusKm: 1.0, purchasingPower: 0.36, dataQuality: 'estimated' },

  // ── Zones periurbanas/rurales ──
  { id: 'pp_norte_rural', name: 'Puerto Plata Norte (Rural)', municipio: 'Puerto Plata', center: { lat: 19.82, lon: -70.2 }, radiusKm: 2.2, purchasingPower: 0.26, dataQuality: 'estimated' },
  { id: 'pp_caribe_rural', name: 'Zona Caribeña Rural', municipio: 'Puerto Plata', center: { lat: 19.7, lon: -70.1 }, radiusKm: 2.5, purchasingPower: 0.29, dataQuality: 'estimated' },
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
