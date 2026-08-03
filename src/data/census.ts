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
interface Census2022 {
  population: number;
  urbanPct: number;
}

const CENSUS_2022: Record<string, Census2022> = {
  'santo-domingo': { population: 3_798_698, urbanPct: 87 },
  'puerto-plata': { population: 338_355, urbanPct: 58 },
  'la-altagracia': { population: 446_060, urbanPct: 77 },
  'san-cristobal': { population: 688_828, urbanPct: 52 },
  'santiago': { population: 1_074_679, urbanPct: 73 },
  'la-vega': { population: 442_719, urbanPct: 48 },
  'la-romana': { population: 287_914, urbanPct: 95 },
};

export function census2022For(location: string): Census2022 | null {
  return CENSUS_2022[location] ?? null;
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
