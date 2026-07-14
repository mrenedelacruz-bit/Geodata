import type { LatLon } from '../types';

/**
 * Datos socioeconómicos por sector de la Provincia de La Altagracia.
 *
 * Fuentes:
 * - Población provincial: X Censo Nacional de Población y Vivienda 2022 (ONE) —
 *   provincia La Altagracia ≈ 355,600 hab. Municipios: Higüey (cabecera,
 *   incluye Verón-Punta Cana como distrito municipal), San Rafael del Yuma,
 *   Boca de Yuma.
 * - Estratos ICV (SIUBEN): el polo turístico Punta Cana/Bávaro/Cap Cana
 *   concentra el mayor poder adquisitivo del país (resorts, residencial de
 *   lujo, turismo internacional); el centro de Higüey es medio; los barrios
 *   populares de Higüey y las zonas rurales del interior (San Rafael del
 *   Yuma, Boca de Yuma) tienen pobreza moderada-alta.
 *
 * `purchasingPower` es un índice 0–1 calibrado con el estrato ICV. Todos los
 * sectores de esta provincia están marcados `estimated`: interpolan el
 * estrato municipal/turístico, pendientes de cifra directa SIUBEN por barrio.
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
  // ── Higüey (cabecera provincial) ──
  { id: 'higuey_centro', name: 'Centro Histórico / Basílica', municipio: 'Higüey', center: { lat: 18.614, lon: -68.708 }, radiusKm: 1.0, purchasingPower: 0.5, dataQuality: 'estimated' },
  { id: 'higuey_urbanizaciones', name: 'Urbanizaciones Norte (Los Cocos / Restauración)', municipio: 'Higüey', center: { lat: 18.625, lon: -68.7 }, radiusKm: 1.1, purchasingPower: 0.55, dataQuality: 'estimated' },
  { id: 'higuey_barrios_sur', name: 'Barrios del Sur (Cuesta del Rayo / Buenos Aires)', municipio: 'Higüey', center: { lat: 18.6, lon: -68.715 }, radiusKm: 1.4, purchasingPower: 0.32, dataQuality: 'estimated' },
  { id: 'higuey_salvaleon', name: 'Salvaleón de Higüey / vía Aeropuerto', municipio: 'Higüey', center: { lat: 18.605, lon: -68.685 }, radiusKm: 1.2, purchasingPower: 0.4, dataQuality: 'estimated' },

  // ── Verón–Punta Cana (distrito municipal turístico) ──
  { id: 'veron_centro', name: 'Verón Centro', municipio: 'Verón-Punta Cana', center: { lat: 18.617, lon: -68.505 }, radiusKm: 1.3, purchasingPower: 0.42, dataQuality: 'estimated' },
  { id: 'punta_cana_resorts', name: 'Punta Cana Resorts (zona hotelera)', municipio: 'Verón-Punta Cana', center: { lat: 18.567, lon: -68.401 }, radiusKm: 1.5, purchasingPower: 0.9, dataQuality: 'estimated' },
  { id: 'cap_cana', name: 'Cap Cana', municipio: 'Verón-Punta Cana', center: { lat: 18.478, lon: -68.42 }, radiusKm: 1.5, purchasingPower: 0.95, dataQuality: 'estimated' },
  { id: 'bavaro_centro', name: 'Bávaro Centro (Los Corales)', municipio: 'Verón-Punta Cana', center: { lat: 18.682, lon: -68.42 }, radiusKm: 1.3, purchasingPower: 0.62, dataQuality: 'estimated' },
  { id: 'bavaro_resorts', name: 'Bávaro Resorts / Playa Bávaro', municipio: 'Verón-Punta Cana', center: { lat: 18.7, lon: -68.4 }, radiusKm: 1.3, purchasingPower: 0.85, dataQuality: 'estimated' },
  { id: 'uvero_alto', name: 'Uvero Alto', municipio: 'Verón-Punta Cana', center: { lat: 18.76, lon: -68.35 }, radiusKm: 1.4, purchasingPower: 0.75, dataQuality: 'estimated' },
  { id: 'los_veteranos', name: 'Los Veteranos / Barrio Nuevo', municipio: 'Verón-Punta Cana', center: { lat: 18.64, lon: -68.46 }, radiusKm: 1.2, purchasingPower: 0.3, dataQuality: 'estimated' },

  // ── Bayahibe / La Romana limítrofe (turismo) ──
  { id: 'bayahibe', name: 'Bayahibe Pueblo', municipio: 'Higüey', center: { lat: 18.383, lon: -68.844 }, radiusKm: 1.2, purchasingPower: 0.68, dataQuality: 'estimated' },
  { id: 'dominicus', name: 'Dominicus / Costa de Bayahibe', municipio: 'Higüey', center: { lat: 18.375, lon: -68.82 }, radiusKm: 1.2, purchasingPower: 0.82, dataQuality: 'estimated' },

  // ── San Rafael del Yuma y Boca de Yuma (interior/costa sur) ──
  { id: 'san_rafael_yuma', name: 'San Rafael del Yuma Centro', municipio: 'San Rafael del Yuma', center: { lat: 18.438, lon: -68.663 }, radiusKm: 1.2, purchasingPower: 0.3, dataQuality: 'estimated' },
  { id: 'boca_yuma', name: 'Boca de Yuma', municipio: 'San Rafael del Yuma', center: { lat: 18.363, lon: -68.548 }, radiusKm: 1.0, purchasingPower: 0.32, dataQuality: 'estimated' },
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
