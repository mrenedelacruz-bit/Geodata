import type { OsmPOI } from '../types';

/**
 * POIs confirmados por fuentes externas (prensa, directorios, reporte del
 * usuario) que aún no están mapeados en OpenStreetMap. Se fusionan con los
 * datos de Overpass en tiempo de carga. Usar IDs negativos para no colisionar
 * con IDs reales de OSM.
 *
 * Agregar aquí establecimientos verificados de La Altagracia (Higüey, Punta
 * Cana, Bávaro, Bayahibe…) con coordenadas confirmadas por el usuario,
 * siguiendo el mismo patrón usado en Puerto Plata.
 */
export const MANUAL_POIS: OsmPOI[] = [
  {
    id: -101,
    // Confirmada por el usuario (18.559553454353296, -68.38498218881195) — cerca aeropuerto PUJ.
    lat: 18.559553454353296,
    lon: -68.38498218881195,
    tags: {
      amenity: 'fuel',
      name: 'United Petroleum',
      brand: 'United Petroleum',
      'addr:city': 'Punta Cana',
      source: 'manual:reportada por el usuario — coordenadas confirmadas (cerca Aeropuerto Internacional de Punta Cana)',
    },
  },
];
