export type { OsmPOI } from '../types';
export { MANUAL_POIS as SANTO_DOMINGO_POIS } from './manualPois-santo-domingo';
export { MANUAL_POIS as PUERTO_PLATA_POIS } from './manualPois-puerto-plata';

import { MANUAL_POIS as SD_POIS } from './manualPois-santo-domingo';
import { MANUAL_POIS as PP_POIS } from './manualPois-puerto-plata';

export function getManualPOIs(location: string) {
  if (location === 'puerto-plata') {
    return PP_POIS;
  }
  return SD_POIS;
}
