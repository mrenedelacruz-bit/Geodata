import type { OsmPOI } from '../types';

/**
 * POIs confirmados por fuentes externas (prensa, directorios, reporte del
 * usuario) que aún no están mapeados en OpenStreetMap. Se fusionan con los
 * datos de Overpass en tiempo de carga. Usar IDs negativos para no colisionar
 * con IDs reales de OSM.
 *
 * Las coordenadas marcadas "estimada" están ancladas a la vía/zona conocida
 * (Carretera 5 en Sosúa) y deben ajustarse con coordenadas exactas de Google
 * Maps confirmadas por el usuario, como se hizo en Santo Domingo.
 */
export const MANUAL_POIS: OsmPOI[] = [
  {
    id: -101,
    // Estimada: entrada de El Batey, Carretera 5, Sosúa.
    lat: 19.7508,
    lon: -70.5147,
    tags: {
      amenity: 'fuel',
      name: 'Texaco Sosúa',
      brand: 'Texaco',
      'addr:city': 'Sosúa',
      source: 'manual:directorios (reportada por el usuario) — coordenadas estimadas sobre la Carretera 5, pendientes de confirmación',
    },
  },
  {
    id: -102,
    // Estimada: Carretera 5, zona Los Charamicos / entrada oeste de Sosúa.
    lat: 19.7452,
    lon: -70.5245,
    tags: {
      shop: 'gas',
      name: 'Tropigas Sosúa',
      brand: 'Tropigas',
      'addr:city': 'Sosúa',
      source: 'manual:directorios (reportada por el usuario) — coordenadas estimadas sobre la Carretera 5, pendientes de confirmación',
    },
  },
  {
    id: -103,
    // Estimada: corredor Sosúa–Cabarete (Carretera 5).
    lat: 19.753,
    lon: -70.487,
    tags: {
      shop: 'gas',
      name: 'United Gas Sosúa',
      brand: 'United Gas',
      'addr:city': 'Sosúa',
      source: 'manual:directorios (reportada por el usuario) — coordenadas estimadas sobre el corredor Sosúa–Cabarete, pendientes de confirmación',
    },
  },
];
