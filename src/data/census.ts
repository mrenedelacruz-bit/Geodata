export type { CensusSector } from './census-santo-domingo';
export { powerLabel, powerColor } from './census-santo-domingo';

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
