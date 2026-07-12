import type { BBox, OsmPOI } from '../types';

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

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
      return pois;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    `No se pudieron obtener datos de OpenStreetMap (Overpass). ${
      lastError instanceof Error ? lastError.message : ''
    }`,
  );
}
