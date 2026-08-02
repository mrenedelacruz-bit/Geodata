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
 * Población por provincia — X Censo Nacional de Población y Vivienda 2022 (ONE),
 * resultados oficiales. Santo Domingo suma la provincia Santo Domingo
 * (2,769,589) y el Distrito Nacional (1,029,110) porque el módulo cubre el
 * Gran Santo Domingo completo.
 */
const POPULATION_2022: Record<string, number> = {
  'santo-domingo': 3_798_699,
  'puerto-plata': 338_354,
  'la-altagracia': 446_060,
  'san-cristobal': 689_828,
  'santiago': 1_074_648,
  'la-vega': 442_720,
  'la-romana': 287_915,
};

export function populationFor(location: string): number | null {
  return POPULATION_2022[location] ?? null;
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
