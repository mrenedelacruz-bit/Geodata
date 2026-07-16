import type { LatLon } from '../types';

/**
 * Datos socioeconómicos por sector de la Provincia de San Cristóbal.
 *
 * Fuentes:
 * - Población provincial: X Censo Nacional de Población y Vivienda 2022 (ONE) —
 *   provincia San Cristóbal ≈ 620,000 hab. Municipios: San Cristóbal (cabecera),
 *   Bajos de Haina, Villa Altagracia, Yaguate, San Gregorio de Nigua, Cambita
 *   Garabitos, Sabana Grande de Palenque, Los Cacaos.
 * - Estratos ICV (SIUBEN): el corredor industrial Haina–Nigua–San Cristóbal
 *   (puerto, zona franca, refinería) concentra empleo formal con barrios
 *   obreros de ICV medio-bajo; el centro de San Cristóbal y sus urbanizaciones
 *   son medios; los municipios rurales y de la sierra (Cambita, Los Cacaos)
 *   tienen pobreza moderada-alta.
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
  // ── San Cristóbal (cabecera provincial) ──
  { id: 'sc_centro', name: 'Centro / Parque Colón', municipio: 'San Cristóbal', center: { lat: 18.416, lon: -70.106 }, radiusKm: 1.0, purchasingPower: 0.5, dataQuality: 'estimated' },
  { id: 'sc_madre_vieja', name: 'Madre Vieja Norte y Sur', municipio: 'San Cristóbal', center: { lat: 18.43, lon: -70.12 }, radiusKm: 1.2, purchasingPower: 0.38, dataQuality: 'estimated' },
  { id: 'sc_canastica', name: 'Canastica / Jeringa', municipio: 'San Cristóbal', center: { lat: 18.4, lon: -70.1 }, radiusKm: 1.0, purchasingPower: 0.33, dataQuality: 'estimated' },
  { id: 'sc_urbanizaciones', name: 'Urbanizaciones Norte (Villa Fundación / 5to Centenario)', municipio: 'San Cristóbal', center: { lat: 18.435, lon: -70.1 }, radiusKm: 1.0, purchasingPower: 0.52, dataQuality: 'estimated' },
  { id: 'sc_hato_damas', name: 'Hato Damas / zona agrícola', municipio: 'San Cristóbal', center: { lat: 18.47, lon: -70.13 }, radiusKm: 1.4, purchasingPower: 0.3, dataQuality: 'estimated' },

  // ── Bajos de Haina y Nigua (corredor industrial/portuario) ──
  { id: 'haina_centro', name: 'Haina Centro / Puerto', municipio: 'Bajos de Haina', center: { lat: 18.415, lon: -70.034 }, radiusKm: 1.2, purchasingPower: 0.42, dataQuality: 'estimated' },
  { id: 'haina_barrios', name: 'Barrios de Haina (El Carril / Gringo)', municipio: 'Bajos de Haina', center: { lat: 18.44, lon: -70.05 }, radiusKm: 1.2, purchasingPower: 0.3, dataQuality: 'estimated' },
  { id: 'nigua', name: 'San Gregorio de Nigua', municipio: 'San Gregorio de Nigua', center: { lat: 18.386, lon: -70.087 }, radiusKm: 1.2, purchasingPower: 0.35, dataQuality: 'estimated' },

  // ── Villa Altagracia (norte, Autopista Duarte) ──
  { id: 'villa_altagracia', name: 'Villa Altagracia Centro', municipio: 'Villa Altagracia', center: { lat: 18.672, lon: -70.17 }, radiusKm: 1.4, purchasingPower: 0.35, dataQuality: 'estimated' },
  { id: 'medina', name: 'Medina / San José del Puerto', municipio: 'Villa Altagracia', center: { lat: 18.62, lon: -70.22 }, radiusKm: 1.4, purchasingPower: 0.27, dataQuality: 'estimated' },

  // ── Costa sur y valle ──
  { id: 'yaguate', name: 'Yaguate Centro', municipio: 'Yaguate', center: { lat: 18.335, lon: -70.183 }, radiusKm: 1.3, purchasingPower: 0.3, dataQuality: 'estimated' },
  { id: 'palenque', name: 'Sabana Grande de Palenque / Playa', municipio: 'Sabana Grande de Palenque', center: { lat: 18.272, lon: -70.152 }, radiusKm: 1.3, purchasingPower: 0.32, dataQuality: 'estimated' },

  // ── Sierra (oeste) ──
  { id: 'cambita', name: 'Cambita Garabitos', municipio: 'Cambita Garabitos', center: { lat: 18.451, lon: -70.189 }, radiusKm: 1.3, purchasingPower: 0.29, dataQuality: 'estimated' },
  { id: 'los_cacaos', name: 'Los Cacaos', municipio: 'Los Cacaos', center: { lat: 18.55, lon: -70.26 }, radiusKm: 1.3, purchasingPower: 0.26, dataQuality: 'estimated' },
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
