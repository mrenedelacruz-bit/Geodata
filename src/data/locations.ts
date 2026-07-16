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
  'san-cristobal': {
    id: 'san-cristobal',
    label: 'San Cristóbal',
    title: 'Asesor de Ubicación · San Cristóbal',
    // Provincia completa: la ciudad de San Cristóbal y Bajos de Haina en el
    // corredor industrial del este, Villa Altagracia al norte (Autopista
    // Duarte), Yaguate/Sabana Grande de Palenque en la costa sur y
    // Cambita/Los Cacaos en la sierra al oeste. (San Cristóbal ≈ -70.11;
    // Haina ≈ -70.03; Villa Altagracia ≈ -70.17.)
    bbox: {
      south: 18.2,
      west: -70.35,
      north: 18.78,
      east: -69.98,
    },
    // Centrado en la ciudad de San Cristóbal (cabecera provincial).
    center: { lat: 18.42, lon: -70.11 },
  },
  'santiago': {
    id: 'santiago',
    label: 'Santiago',
    title: 'Asesor de Ubicación · Santiago',
    // Provincia completa: Santiago de los Caballeros al centro, el corredor
    // Tamboril/Licey/Puñal al este, Villa González y Navarrete (Villa Bisonó)
    // al noroeste, y San José de las Matas/Jánico en la sierra al suroeste.
    // (Santiago ≈ -70.70; Tamboril ≈ -70.61; San José de las Matas ≈ -70.94.)
    bbox: {
      south: 19.15,
      west: -71.15,
      north: 19.65,
      east: -70.45,
    },
    // Centrado en Santiago de los Caballeros (Monumento / centro histórico).
    center: { lat: 19.45, lon: -70.7 },
  },
};

export function getLocation(id: string): LocationConfig {
  return LOCATIONS[id] || LOCATIONS['santo-domingo'];
}
