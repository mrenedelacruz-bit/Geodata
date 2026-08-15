import type { LatLon, OsmPOI } from '../types';
import { distanceMeters } from '../lib/geo';

/**
 * Centros educativos oficiales del MINERD (datos.gob.do, período escolar
 * 2023-2024; para centros sin fila en ese período se usa la de 2022-2023).
 * 3,207 centros en las 7 provincias con coordenadas y matrícula. Alimentan el
 * motor de anclas como POIs sintéticos: el listado oficial es completo,
 * mientras que OSM solo tiene una fracción de las escuelas mapeadas.
 */

export interface Escuela {
  n: string;
  s: 'publico' | 'privado' | 'semioficial';
  /** Matrícula (estudiantes inscritos). */
  m: number;
  lat: number;
  lon: number;
  nv: string;
}

const cache = new Map<string, Promise<Escuela[] | null>>();

export function loadEscuelas(location: string): Promise<Escuela[] | null> {
  let p = cache.get(location);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}data/escuelas/${location}.json`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((data) => {
        // No cachear el fallo: un error de red momentáneo no debe dejar las
        // anclas educativas apagadas hasta recargar.
        if (data === null) cache.delete(location);
        return data;
      });
    cache.set(location, p);
  }
  return p;
}

/** Radio de deduplicación contra escuelas ya mapeadas en OSM. */
const DEDUP_M = 120;

/**
 * Fusiona los centros MINERD con los POIs de OSM: descarta las escuelas de
 * OSM que estén a menos de 120 m de un centro oficial (misma escuela, dos
 * fuentes) y agrega cada centro como POI sintético con su matrícula, para que
 * el motor de anclas pese los colegios grandes más que los pequeños.
 */
export function mergeEscuelas(pois: OsmPOI[], escuelas: Escuela[]): OsmPOI[] {
  const centros: LatLon[] = escuelas;
  const isOsmSchool = (t: Record<string, string>) =>
    t.amenity === 'school' || t.amenity === 'kindergarten';
  const kept = pois.filter((p) => {
    if (!isOsmSchool(p.tags)) return true;
    return !centros.some((e) => distanceMeters(p, e) < DEDUP_M);
  });
  const sintéticos: OsmPOI[] = escuelas.map((e, i) => ({
    // IDs negativos: jamás chocan con los IDs reales de OSM.
    id: -(i + 1),
    lat: e.lat,
    lon: e.lon,
    tags: {
      amenity: 'school',
      name: e.n,
      source: 'minerd',
      matricula: String(e.m),
      sector: e.s,
    },
  }));
  return [...kept, ...sintéticos];
}
