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
    // Corredor costero y municipios de la provincia: Luperón/Villa Isabela al
    // oeste, San Felipe de Puerto Plata al centro, Sosúa/Cabarete al este y
    // Gaspar Hernández en el límite oriental. (La ciudad de Puerto Plata está
    // en lon ≈ -70.69; Sosúa ≈ -70.51; Cabarete ≈ -70.41.)
    bbox: {
      south: 19.55,
      west: -71.1,
      north: 19.95,
      east: -70.25,
    },
    // Centrado en San Felipe de Puerto Plata (centro histórico / Playa Dorada).
    center: { lat: 19.778, lon: -70.66 },
  },
  'la-altagracia': {
    id: 'la-altagracia',
    label: 'La Altagracia',
    title: 'Asesor de Ubicación · La Altagracia',
    // Provincia completa: Higüey (cabecera, interior) al oeste, el polo
    // turístico Punta Cana/Bávaro/Verón/Uvero Alto al este, y Bayahibe/San
    // Rafael del Yuma al sur. (Higüey ≈ -68.71; Bávaro ≈ -68.40; Bayahibe ≈ -68.84.)
    bbox: {
      south: 18.3,
      west: -68.95,
      north: 18.85,
      east: -68.3,
    },
    // Centrado entre Higüey y el corredor turístico (Verón).
    center: { lat: 18.63, lon: -68.55 },
  },
};

export function getLocation(id: string): LocationConfig {
  return LOCATIONS[id] || LOCATIONS['santo-domingo'];
}
