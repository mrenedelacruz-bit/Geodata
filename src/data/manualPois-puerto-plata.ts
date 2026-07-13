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
    // Confirmada por el usuario (19.761884, -70.521804) — Calle Benigno Lantigua 2.
    lat: 19.761884,
    lon: -70.521804,
    tags: {
      shop: 'gas',
      name: 'United Gas Sosúa',
      brand: 'United Gas',
      'addr:street': 'Calle Benigno Lantigua 2',
      'addr:city': 'Sosúa',
      source: 'manual:reportada por el usuario — coordenadas confirmadas (Calle Benigno Lantigua 2)',
    },
  },
];
