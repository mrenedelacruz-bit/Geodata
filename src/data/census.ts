export type { CensusSector } from './census-santo-domingo';
export { CENSUS_SECTORS as SANTO_DOMINGO_SECTORS, NEUTRAL_POWER, sectorAt as sectorAtSD, purchasingPowerAt as purchasingPowerAtSD, powerLabel, powerColor } from './census-santo-domingo';
export { CENSUS_SECTORS as PUERTO_PLATA_SECTORS, NEUTRAL_POWER as PP_NEUTRAL_POWER, sectorAt as sectorAtPP, purchasingPowerAt as purchasingPowerAtPP } from './census-puerto-plata';
export { CENSUS_SECTORS as LA_ALTAGRACIA_SECTORS, NEUTRAL_POWER as LA_NEUTRAL_POWER, sectorAt as sectorAtLA, purchasingPowerAt as purchasingPowerAtLA } from './census-la-altagracia';

import * as SD from './census-santo-domingo';
import * as PP from './census-puerto-plata';
import * as LA from './census-la-altagracia';

export function getCensusSectors(location: string): SD.CensusSector[] {
  if (location === 'puerto-plata') {
    return PP.CENSUS_SECTORS;
  }
  if (location === 'la-altagracia') {
    return LA.CENSUS_SECTORS;
  }
  return SD.CENSUS_SECTORS;
}

export function sectorAt(point: { lat: number; lon: number }, location: string): SD.CensusSector | null {
  if (location === 'puerto-plata') {
    return PP.sectorAt(point);
  }
  if (location === 'la-altagracia') {
    return LA.sectorAt(point);
  }
  return SD.sectorAt(point);
}

export function purchasingPowerAt(point: { lat: number; lon: number }, location: string): number {
  if (location === 'puerto-plata') {
    return PP.purchasingPowerAt(point);
  }
  if (location === 'la-altagracia') {
    return LA.purchasingPowerAt(point);
  }
  return SD.purchasingPowerAt(point);
}
