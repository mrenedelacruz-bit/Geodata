import type { OsmPOI } from '../types';

/**
 * POIs confirmados por fuentes externas (prensa, sitios oficiales) que aún no
 * están mapeados en OpenStreetMap. Se fusionan con los datos de Overpass en
 * tiempo de carga. Usar IDs negativos para no colisionar con IDs reales de OSM.
 *
 * Coordenadas marcadas como "estimada" están ancladas al punto de referencia
 * geográfico conocido más cercano (ej. referencias de Google Maps) y deben
 * verificarse/ajustarse con una visita o una fuente georreferenciada más precisa.
 */
export const MANUAL_POIS: OsmPOI[] = [
  {
    id: -1,
    // Centro comercial / estación de combustibles conocida en Puerto Plata Centro
    lat: 19.755,
    lon: -70.195,
    tags: {
      amenity: 'fuel',
      name: 'Estación de Combustibles Puerto Plata Centro',
      brand: 'Isla',
      operator: 'Distribuidora Isla',
      'addr:city': 'Puerto Plata',
      description: 'Estación de combustibles en zona céntrica de Puerto Plata',
      source: 'manual:referencia local — no confirmado aún en OSM',
    },
  },
];
