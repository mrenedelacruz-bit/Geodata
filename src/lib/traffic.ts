import type { BBox, TrafficWay } from '../types';
import { readCache, writeCache } from './osmCache';

export type { TrafficWay };

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

function buildQuery(bbox: BBox): string {
  const b = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  return `[out:json][timeout:90];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](${b});
);
out geom;`;
}

interface OverpassWay {
  type: string;
  id: number;
  geometry?: { lat: number; lon: number }[];
  tags?: Record<string, string>;
}

export async function fetchTrafficWays(bbox: BBox): Promise<TrafficWay[]> {
  const cacheKey = `osm_traffic_v1_${bbox.south}_${bbox.west}_${bbox.north}_${bbox.east}`;
  const cached = readCache<TrafficWay[]>(cacheKey);
  if (cached && !cached.stale) return cached.value;

  const query = buildQuery(bbox);

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) throw new Error(`Overpass respondió ${res.status}`);
      const json = await res.json();
      const elements: OverpassWay[] = json.elements ?? [];
      const ways: TrafficWay[] = [];
      for (const el of elements) {
        if (el.type !== 'way' || !el.geometry?.length) continue;
        ways.push({
          id: el.id,
          coords: el.geometry.map((p) => ({ lat: p.lat, lon: p.lon })),
          tags: el.tags ?? {},
        });
      }
      // Solo se dibujan estilo/color por highway: guardamos tags mínimos.
      writeCache(
        cacheKey,
        ways.map((w) => ({ ...w, tags: { highway: w.tags.highway ?? '' } })),
      );
      return ways;
    } catch (err) {
      console.error(`Error obteniendo vías desde ${endpoint}:`, err);
    }
  }
  // La capa de tráfico es opcional: usa caché vencida si existe y, si no,
  // no rompemos la app.
  return cached ? cached.value : [];
}

function getTrafficWeight(highway: string): number {
  const weights: Record<string, number> = {
    motorway: 5,
    trunk: 4,
    primary: 3,
    secondary: 2,
    tertiary: 1,
  };
  return weights[highway] || 1;
}

function getTrafficColor(weight: number): string {
  // Rojo fuerte para autopistas, degradando hacia amarillo en vías menores
  const colors: Record<number, string> = {
    5: '#d32f2f',
    4: '#f57c00',
    3: '#fbc02d',
    2: '#fdd835',
    1: '#fff176',
  };
  return colors[weight] || '#fff176';
}

export function getHighwayStyle(tags: Record<string, string>) {
  const highway = tags.highway || '';
  const weight = getTrafficWeight(highway);
  const color = getTrafficColor(weight);

  return {
    color,
    weight,
    opacity: 0.7,
  };
}
