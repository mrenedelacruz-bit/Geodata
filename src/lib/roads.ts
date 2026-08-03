import type { BBox, LatLon } from '../types';
import { readCache, writeCache } from './osmCache';
import { METERS_PER_DEG_LAT, metersPerDegLon } from './geo';

/**
 * Vías principales de OSM (autopistas, troncales, primarias y secundarias)
 * para el índice de EXPOSICIÓN VEHICULAR: cuánto flujo de vehículos "ve" un
 * punto según su cercanía a la jerarquía vial. Es un proxy gratuito del
 * tráfico real (correlaciona con los aforos) mientras se integran conteos
 * oficiales (peajes RD Vial, aforos INTRANT/MOPC).
 */

export type RoadClass = 'motorway' | 'trunk' | 'primary' | 'secondary';

export interface MajorRoad {
  cls: RoadClass;
  name: string | null;
  pts: [number, number][];
  /** [minLat, minLon, maxLat, maxLon] con margen, para descarte rápido. */
  box: [number, number, number, number];
}

export interface RoadIndex {
  list: MajorRoad[];
}

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

/** Peso de flujo por clase de vía (aprox. proporción de tránsito que porta). */
const CLASS_WEIGHT: Record<RoadClass, number> = {
  motorway: 1.0,
  trunk: 0.92,
  primary: 0.75,
  secondary: 0.5,
};

export const CLASS_LABEL: Record<RoadClass, string> = {
  motorway: 'autopista',
  trunk: 'carretera troncal',
  primary: 'avenida principal',
  secondary: 'vía secundaria',
};

/** Radio máximo (m) al que una vía aporta exposición. */
const MAX_DIST_M = 600;

/** Decimación: conservar vértices separados ≥ ~70 m (reduce el peso en caché). */
function decimate(geometry: { lat: number; lon: number }[]): [number, number][] {
  const out: [number, number][] = [];
  let last: { lat: number; lon: number } | null = null;
  for (let i = 0; i < geometry.length; i++) {
    const g = geometry[i];
    if (last) {
      const dLat = (g.lat - last.lat) * METERS_PER_DEG_LAT;
      const dLon = (g.lon - last.lon) * metersPerDegLon(g.lat);
      if (i < geometry.length - 1 && dLat * dLat + dLon * dLon < 70 * 70) continue;
    }
    out.push([Math.round(g.lat * 1e5) / 1e5, Math.round(g.lon * 1e5) / 1e5]);
    last = g;
  }
  return out;
}

function boxOf(pts: [number, number][], marginM: number): [number, number, number, number] {
  let minLat = 90, minLon = 180, maxLat = -90, maxLon = -180;
  for (const [lat, lon] of pts) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }
  const mLat = marginM / METERS_PER_DEG_LAT;
  const mLon = marginM / metersPerDegLon((minLat + maxLat) / 2);
  return [minLat - mLat, minLon - mLon, maxLat + mLat, maxLon + mLon];
}

interface OverpassWay {
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
}

export async function fetchMajorRoads(bbox: BBox): Promise<RoadIndex | null> {
  const cacheKey = `osm_roads_v1_${bbox.south}_${bbox.west}_${bbox.north}_${bbox.east}`;
  const cached = readCache<MajorRoad[]>(cacheKey);
  if (cached && !cached.stale) return { list: cached.value };

  const b = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  const query = `[out:json][timeout:90];
way["highway"~"^(motorway|trunk|primary|secondary)$"](${b});
out geom tags;`;

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const json = await res.json();
      const list: MajorRoad[] = [];
      for (const el of (json.elements ?? []) as OverpassWay[]) {
        const cls = el.tags?.highway as RoadClass | undefined;
        if (!cls || !(cls in CLASS_WEIGHT) || !el.geometry || el.geometry.length < 2) continue;
        const pts = decimate(el.geometry);
        if (pts.length < 2) continue;
        list.push({
          cls,
          name: el.tags?.name ?? el.tags?.ref ?? null,
          pts,
          box: boxOf(pts, MAX_DIST_M),
        });
      }
      writeCache(cacheKey, list);
      return { list };
    } catch {
      /* siguiente endpoint */
    }
  }
  return cached ? { list: cached.value } : null;
}

/** Distancia punto-segmento en metros (aprox. equirectangular local). */
function distToSegmentM(p: LatLon, a: [number, number], b: [number, number]): number {
  const mLon = metersPerDegLon(p.lat);
  const px = p.lon * mLon, py = p.lat * METERS_PER_DEG_LAT;
  const ax = a[1] * mLon, ay = a[0] * METERS_PER_DEG_LAT;
  const bx = b[1] * mLon, by = b[0] * METERS_PER_DEG_LAT;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
  const ex = ax + t * dx - px, ey = ay + t * dy - py;
  return Math.sqrt(ex * ex + ey * ey);
}

export interface VehicularExposure {
  /** 0-1: cercanía ponderada a la jerarquía vial. */
  index: number;
  label: 'Alta' | 'Media' | 'Baja' | 'Mínima';
  color: string;
  nearest: { name: string | null; clsLabel: string; distM: number } | null;
}

/**
 * Exposición vehicular en un punto: la mejor contribución (peso de clase ×
 * decaimiento con la distancia, 1.0 a ≤80 m → 0 a 600 m) más un pequeño bono
 * si convergen varias vías principales (intersecciones/corredores).
 */
export function exposureAt(idx: RoadIndex, point: LatLon): VehicularExposure {
  let best = 0;
  let others = 0;
  let nearest: VehicularExposure['nearest'] = null;
  let nearestD = Infinity;
  for (const road of idx.list) {
    const [a, b, c, d] = road.box;
    if (point.lat < a || point.lat > c || point.lon < b || point.lon > d) continue;
    let minD = Infinity;
    for (let i = 0; i + 1 < road.pts.length; i++) {
      const dist = distToSegmentM(point, road.pts[i], road.pts[i + 1]);
      if (dist < minD) minD = dist;
    }
    if (minD > MAX_DIST_M) continue;
    const decay = minD <= 80 ? 1 : 1 - (minD - 80) / (MAX_DIST_M - 80);
    const contrib = CLASS_WEIGHT[road.cls] * decay;
    if (contrib > best) {
      others += best;
      best = contrib;
    } else {
      others += contrib;
    }
    if (minD < nearestD) {
      nearestD = minD;
      nearest = { name: road.name, clsLabel: CLASS_LABEL[road.cls], distM: Math.round(minD) };
    }
  }
  const index = Math.min(1, best + Math.min(0.15, others * 0.05));
  const label = index >= 0.7 ? 'Alta' : index >= 0.4 ? 'Media' : index >= 0.15 ? 'Baja' : 'Mínima';
  const color = index >= 0.7 ? '#16a34a' : index >= 0.4 ? '#d97706' : index >= 0.15 ? '#dc2626' : '#6b7280';
  return { index, label, color, nearest };
}
