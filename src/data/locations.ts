import type { BBox, LatLon } from '../types';

export interface LocationConfig {
  id: string;
  label: string;
  title: string;
  bbox: BBox;
  center: LatLon;
}

export const LOCATIONS: Record<string, LocationConfig> = {
  'santo-domingo': {
    id: 'santo-domingo',
    label: 'Santo Domingo',
    title: 'Asesor de Ubicación · Santo Domingo',
    bbox: {
      south: 18.4,
      west: -70.15,
      north: 18.62,
      east: -69.75,
    },
    center: { lat: 18.4861, lon: -69.9312 },
  },
  'puerto-plata': {
    id: 'puerto-plata',
    label: 'Puerto Plata',
    title: 'Asesor de Ubicación · Puerto Plata',
    bbox: {
      south: 19.65,
      west: -70.35,
      north: 19.88,
      east: -70.02,
    },
    center: { lat: 19.765, lon: -70.195 },
  },
};

export function getLocation(id: string): LocationConfig {
  return LOCATIONS[id] || LOCATIONS['santo-domingo'];
}
