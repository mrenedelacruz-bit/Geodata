export type { CensusSector } from './census-santo-domingo';
export { powerLabel, powerColor } from './census-santo-domingo';

import * as SD from './census-santo-domingo';
import * as PP from './census-puerto-plata';
import * as LA from './census-la-altagracia';
import * as SC from './census-san-cristobal';
import * as ST from './census-santiago';
import * as LV from './census-la-vega';
import * as LR from './census-la-romana';

interface CensusModule {
  CENSUS_SECTORS: SD.CensusSector[];
  sectorAt: (point: { lat: number; lon: number }) => SD.CensusSector | null;
  purchasingPowerAt: (point: { lat: number; lon: number }) => number;
}

const MODULES: Record<string, CensusModule> = {
  'santo-domingo': SD,
  'puerto-plata': PP,
  'la-altagracia': LA,
  'san-cristobal': SC,
  'santiago': ST,
  'la-vega': LV,
  'la-romana': LR,
};

function moduleFor(location: string): CensusModule {
  return MODULES[location] ?? SD;
}

/**
 * Cifras definitivas del X Censo Nacional de Población y Vivienda 2022 —
 * Informe General (ONE, ajustado por la Encuesta de Control de Cobertura y
 * Calidad). Santo Domingo suma la provincia Santo Domingo (2,769,588) y el
 * Distrito Nacional (1,029,110) porque el módulo cubre el Gran Santo Domingo.
 * urbanPct = % de la población en zona urbana, del mismo informe.
 */
export interface Census2022 {
  population: number;
  urbanPct: number;
  /** Hogares en viviendas particulares ocupadas (Cuadro 10, Vol. I). */
  hogares: number;
  /** Promedio de personas por hogar (Cuadro 10, Vol. I). */
  avgHogar: number;
  /** Población de 10 años y más ocupada (Cuadro 5, Vol. V). */
  ocupados: number;
  /** Empleadores/patronos — densidad empresarial (Cuadro 5, Vol. V). */
  empleadores: number;
  /** Tasa media anual de crecimiento 2010-2022, % (Cuadro 4, Informe General). */
  growthPct: number;
}

const CENSUS_2022: Record<string, Census2022> = {
  'santo-domingo': {
    population: 3_798_698,
    urbanPct: 87,
    hogares: 1_305_361,
    avgHogar: 2.9,
    ocupados: 1_786_196,
    empleadores: 104_446,
    growthPct: 1.08, // combinado prov. SD (1.30) + DN (0.54)
  },
  'puerto-plata': {
    population: 338_355,
    urbanPct: 58,
    hogares: 125_047,
    avgHogar: 2.7,
    ocupados: 154_261,
    empleadores: 11_503,
    growthPct: 0.43,
  },
  'la-altagracia': {
    population: 446_060,
    urbanPct: 77,
    hogares: 172_419,
    avgHogar: 2.6,
    ocupados: 211_644,
    empleadores: 14_073,
    growthPct: 4.18, // la provincia de mayor crecimiento del país
  },
  'san-cristobal': {
    population: 688_828,
    urbanPct: 52,
    hogares: 223_003,
    avgHogar: 3.1,
    ocupados: 299_041,
    empleadores: 15_243,
    growthPct: 1.6,
  },
  'santiago': {
    population: 1_074_679,
    urbanPct: 73,
    hogares: 376_703,
    avgHogar: 2.8,
    ocupados: 529_049,
    empleadores: 38_209,
    growthPct: 0.92,
  },
  'la-vega': {
    population: 442_719,
    urbanPct: 48,
    hogares: 153_581,
    avgHogar: 2.9,
    ocupados: 203_962,
    empleadores: 15_311,
    growthPct: 0.98,
  },
  'la-romana': {
    population: 287_914,
    urbanPct: 95,
    hogares: 96_383,
    avgHogar: 3.0,
    ocupados: 139_659,
    empleadores: 6_263,
    growthPct: 1.34,
  },
};

export function census2022For(location: string): Census2022 | null {
  return CENSUS_2022[location] ?? null;
}

/**
 * Incidencia de pobreza monetaria general por región, 2025 — Portal
 * Interactivo de Pobreza (PIP, ONE/MEPyD), indicador 1.1.4. La región es la
 * máxima desagregación territorial que publica el PIP.
 */
export interface RegionalPoverty {
  region: string;
  povertyPct: number;
}

const POVERTY_2025: Record<string, RegionalPoverty> = {
  'santo-domingo': { region: 'Metropolitana (Ozama)', povertyPct: 22.0 },
  'puerto-plata': { region: 'Cibao Norte', povertyPct: 11.3 },
  'santiago': { region: 'Cibao Norte', povertyPct: 11.3 },
  'la-vega': { region: 'Cibao Sur', povertyPct: 9.7 },
  'san-cristobal': { region: 'Valdesia', povertyPct: 10.0 },
  'la-altagracia': { region: 'Yuma', povertyPct: 13.5 },
  'la-romana': { region: 'Yuma', povertyPct: 13.5 },
};

export function regionalPovertyFor(location: string): RegionalPoverty | null {
  return POVERTY_2025[location] ?? null;
}

export function getCensusSectors(location: string): SD.CensusSector[] {
  return moduleFor(location).CENSUS_SECTORS;
}

export function sectorAt(point: { lat: number; lon: number }, location: string): SD.CensusSector | null {
  return moduleFor(location).sectorAt(point);
}

export function purchasingPowerAt(point: { lat: number; lon: number }, location: string): number {
  return moduleFor(location).purchasingPowerAt(point);
}
