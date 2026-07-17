import type { OsmPOI } from '../types';

/**
 * POIs confirmados por fuentes externas (prensa, directorios, reporte del
 * usuario) que aún no están mapeados en OpenStreetMap. Se fusionan con los
 * datos de Overpass en tiempo de carga. Usar IDs negativos para no colisionar
 * con IDs reales de OSM.
 *
 * Vacío por ahora: agregar aquí establecimientos verificados de La Romana
 * (La Romana, Villa Hermosa, Casa de Campo…) con coordenadas confirmadas por
 * el usuario, siguiendo el mismo patrón usado en Puerto Plata.
 */
export const MANUAL_POIS: OsmPOI[] = [];
