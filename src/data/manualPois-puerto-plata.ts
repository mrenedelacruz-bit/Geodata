import type { OsmPOI } from '../types';

/**
 * POIs confirmados por fuentes externas (prensa, sitios oficiales) que aún no
 * están mapeados en OpenStreetMap. Se fusionan con los datos de Overpass en
 * tiempo de carga. Usar IDs negativos para no colisionar con IDs reales de OSM.
 *
 * Por ahora no hay POIs manuales confirmados para Puerto Plata — agregar aquí
 * cuando exista una fuente verificable (prensa, sitio oficial, coordenadas
 * confirmadas por el usuario), igual que se hizo en Santo Domingo.
 */
export const MANUAL_POIS: OsmPOI[] = [];
