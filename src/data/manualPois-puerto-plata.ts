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
    // Confirmada por el usuario (19.7525, -70.5216) — Carretera Sosúa-Cabarete Km 1, El Batey.
    lat: 19.7525,
    lon: -70.5216,
    tags: {
      amenity: 'fuel',
      name: 'Texaco Colonia Sosúa',
      brand: 'Texaco',
      'addr:street': 'Carretera Sosúa-Cabarete Km 1',
      'addr:city': 'Sosúa',
      source: 'manual:reportada por el usuario — coordenadas confirmadas (Carretera Sosúa-Cabarete Km 1, El Batey)',
    },
  },
  {
    id: -102,
    // Confirmada por el usuario vía Google Maps (19.7719537, -70.4982483).
    lat: 19.7719537,
    lon: -70.4982483,
    tags: {
      shop: 'gas',
      name: 'Tropigas Sosúa',
      brand: 'Tropigas',
      'addr:city': 'Sosúa',
      source: 'manual:reportada por el usuario — coordenadas confirmadas vía Google Maps',
    },
  },
  {
    id: -103,
    // Confirmada por el usuario (19.7548, -70.5244) — Calle Benigno Lantigua 2.
    lat: 19.7548,
    lon: -70.5244,
    tags: {
      shop: 'gas',
      name: 'United Gas Sosúa',
      brand: 'United Gas',
      'addr:street': 'Calle Benigno Lantigua 2',
      'addr:city': 'Sosúa',
      source: 'manual:reportada por el usuario — coordenadas confirmadas (Calle Benigno Lantigua 2)',
    },
  },
  {
    id: -104,
    // Confirmada por el usuario (19.7602, -70.5055) — Carretera Sosúa-Cabarete Km 3.5.
    lat: 19.7602,
    lon: -70.5055,
    tags: {
      amenity: 'fuel',
      name: 'Next Grupo Propagas',
      brand: 'Next',
      'addr:street': 'Carretera Sosúa-Cabarete Km 3.5',
      'addr:city': 'Sosúa',
      source: 'manual:reportada por el usuario — coordenadas confirmadas (Carretera Sosúa-Cabarete Km 3.5)',
    },
  },
  {
    id: -105,
    // Confirmada por el usuario (19.7491, -70.5845) — Sabaneta de Cangrejos.
    lat: 19.7491,
    lon: -70.5845,
    tags: {
      shop: 'gas',
      name: 'Estación de Gas Sabaneta de Cangrejos',
      'addr:city': 'Sabaneta de Cangrejos',
      source: 'manual:reportada por el usuario — coordenadas confirmadas (Sabaneta de Cangrejos)',
    },
  },
  {
    id: -106,
    // Confirmada por el usuario (19.7525, -70.5283) — Carretera Sosúa-Cabarete Km 3½.
    lat: 19.7525,
    lon: -70.5283,
    tags: {
      amenity: 'fuel',
      name: 'Estación Tropimar Grupo Propagas',
      brand: 'Tropimar',
      'addr:street': 'Carretera Sosúa-Cabarete Km 3½',
      'addr:city': 'Sosúa',
      source: 'manual:reportada por el usuario — coordenadas confirmadas (Carretera Sosúa-Cabarete Km 3½)',
    },
  },
];
