import type { BBox, OsmPOI } from '../types';
import { readCache, writeCache } from './osmCache';

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

// Solo las etiquetas que la app usa (matchers de categorías, anclas y popups);
// recortar el resto reduce varias veces el peso del JSON en localStorage.
const KEEP_TAGS = ['amenity', 'shop', 'leisure', 'office', 'highway', 'landuse', 'fuel:lpg', 'name', 'brand', 'source'];

function slimPois(pois: OsmPOI[]): OsmPOI[] {
  return pois.map((p) => {
    const tags: Record<string, string> = {};
    for (const k of KEEP_TAGS) {
      const v = p.tags[k];
      if (v !== undefined) tags[k] = v;
    }
    return { id: p.id, lat: p.lat, lon: p.lon, tags };
  });
}

function buildQuery(bbox: BBox): string {
  const b = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  return `[out:json][timeout:90];
(
  node["amenity"](${b});
  way["amenity"](${b});
  node["shop"](${b});
  way["shop"](${b});
  node["leisure"="fitness_centre"](${b});
  node["office"](${b});
  node["highway"="bus_stop"](${b});
  way["landuse"="residential"](${b});
);
out center tags;`;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export async function fetchOsmPOIs(bbox: BBox): Promise<OsmPOI[]> {
  const cacheKey = `osm_pois_v1_${bbox.south}_${bbox.west}_${bbox.north}_${bbox.east}`;
  const cached = readCache<OsmPOI[]>(cacheKey);
  if (cached && !cached.stale) return cached.value;

  const query = buildQuery(bbox);
  let lastError: unknown;

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) throw new Error(`Overpass respondió ${res.status}`);
      const json = await res.json();
      const elements: OverpassElement[] = json.elements ?? [];
      const pois: OsmPOI[] = [];
      for (const el of elements) {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (lat === undefined || lon === undefined || !el.tags) continue;
        pois.push({ id: el.id, lat, lon, tags: el.tags });
      }
      writeCache(cacheKey, slimPois(pois));
      return pois;
    } catch (err) {
      lastError = err;
    }
  }
  // Todos los endpoints fallaron (rate limit 429, timeout…): mejor servir la
  // copia vencida de la caché que romper la app.
  if (cached) return cached.value;
  throw new Error(
    `No se pudieron obtener datos de OpenStreetMap (Overpass). ${
      lastError instanceof Error ? lastError.message : ''
    } Intenta de nuevo en 1-2 minutos.`,
  );
}
