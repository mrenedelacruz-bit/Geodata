import type { OsmPOI } from '../types';
import { MANUAL_POIS as SD_POIS } from './manualPois-santo-domingo';
import { MANUAL_POIS as PP_POIS } from './manualPois-puerto-plata';
import { MANUAL_POIS as LA_POIS } from './manualPois-la-altagracia';

function getManualPOIs(location: string) {
  if (location === 'puerto-plata') {
    return PP_POIS;
  }
  if (location === 'la-altagracia') {
    return LA_POIS;
  }
  return SD_POIS;
}

const METERS_PER_DEG_LAT = 111_320;

function distMeters(a: OsmPOI, b: OsmPOI): number {
  const dLat = (a.lat - b.lat) * METERS_PER_DEG_LAT;
  const dLon = (a.lon - b.lon) * METERS_PER_DEG_LAT * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/** Mismo tipo de establecimiento según su etiqueta principal. */
function sameKind(a: OsmPOI, b: OsmPOI): boolean {
  return (
    (a.tags.amenity !== undefined && a.tags.amenity === b.tags.amenity) ||
    (a.tags.shop !== undefined && a.tags.shop === b.tags.shop)
  );
}

/**
 * Fusiona los POIs de OSM con los manuales de la ubicación, descartando el
 * manual si OSM ya tiene un establecimiento del mismo tipo a menos de 150 m
 * (evita contar dos veces la misma estación cuando alguien la mapea en OSM).
 */
export function mergeManualPois(osmPois: OsmPOI[], location: string): OsmPOI[] {
  const manual = getManualPOIs(location).filter(
    (m) => !osmPois.some((p) => sameKind(m, p) && distMeters(m, p) < 150),
  );
  return [...osmPois, ...manual];
}
