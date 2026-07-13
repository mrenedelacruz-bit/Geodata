import type { OsmPOI } from '../types';

/**
 * POIs confirmados por fuentes externas (prensa, sitios oficiales) que aún no
 * están mapeados en OpenStreetMap. Se fusionan con los datos de Overpass en
 * tiempo de carga. Usar IDs negativos para no colisionar con IDs reales de OSM.
 *
 * Coordenadas marcadas como "estimada" están ancladas al punto de referencia
 * geográfico conocido más cercano (ej. el aeropuerto) y deben verificarse/
 * ajustarse con una visita o una fuente georreferenciada más precisa.
 */
export const MANUAL_POIS: OsmPOI[] = [
  {
    id: -1,
    // Estimada: anclada a las coordenadas del Aeropuerto La Isabela (JBQ),
    // en el Enlace 1 de la Circunvalación Santo Domingo, El Higüero.
    lat: 18.5735,
    lon: -69.9838,
    tags: {
      amenity: 'fuel',
      name: 'United Petroleum - Gulf Express Higüero',
      brand: 'Gulf',
      operator: 'United Petroleum',
      'addr:city': 'Santo Domingo Norte',
      description: 'Centro de Servicios Integral Gulf Express, Enlace 1 de la Circunvalación Santo Domingo, El Higüero.',
      source: 'manual:prensa (El Nuevo Diario, Diario Libre, marzo 2024) — no confirmado aún en OSM',
    },
  },
];
