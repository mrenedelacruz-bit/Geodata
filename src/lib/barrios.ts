import type { LatLon } from '../types';

/**
 * Barrios oficiales SIUBEN (geometrías INGRESO_BARRIOS + atributos
 * ICV_BARRIOS, unidos por código). Un módulo compartido para: la capa
 * censal, el motor de score (poder por punto-en-polígono), el buscador
 * y los rankings de barrios.
 */

export interface BarrioFeature {
  /** Nombre oficial del barrio/paraje. */
  n: string;
  /** Municipio. */
  m: string;
  /** Hogares en el registro SIUBEN (incluye no categorizados). */
  h: number;
  /** % hogares pobres ICV-1+2 (null si <20 hogares categorizados). */
  p: number | null;
  /** % hogares estrato alto ICV-4 (null si <20 hogares categorizados). */
  a: number | null;
  /** Anillos [lat, lon]; cada anillo es una parte independiente. */
  r: [number, number][][];
}

export interface BarrioIndex {
  list: BarrioFeature[];
  /** BBox por barrio [minLat, minLon, maxLat, maxLon] para descarte rápido. */
  boxes: [number, number, number, number][];
  centroids: LatLon[];
  /** Caché de poder por celda ("lat_lon" con 4 decimales). */
  powerCache: Map<string, number | null>;
}

const cache = new Map<string, Promise<BarrioIndex | null>>();

function buildIndex(list: BarrioFeature[]): BarrioIndex {
  const boxes: [number, number, number, number][] = [];
  const centroids: LatLon[] = [];
  for (const b of list) {
    let minLat = 90, minLon = 180, maxLat = -90, maxLon = -180;
    let sLat = 0, sLon = 0, n = 0;
    for (const ring of b.r) {
      for (const [lat, lon] of ring) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        sLat += lat; sLon += lon; n++;
      }
    }
    boxes.push([minLat, minLon, maxLat, maxLon]);
    centroids.push({ lat: sLat / n, lon: sLon / n });
  }
  return { list, boxes, centroids, powerCache: new Map() };
}

export function loadBarrios(location: string): Promise<BarrioIndex | null> {
  let p = cache.get(location);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}data/barrios/${location}.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BarrioFeature[] | null) => (data ? buildIndex(data) : null))
      .catch(() => null);
    cache.set(location, p);
  }
  return p;
}

function pointInRing(lat: number, lon: number, ring: [number, number][]): boolean {
  // Ray casting.
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [lat1, lon1] = ring[i];
    const [lat2, lon2] = ring[j];
    if (lon1 > lon !== lon2 > lon && lat < ((lat2 - lat1) * (lon - lon1)) / (lon2 - lon1) + lat1) {
      inside = !inside;
    }
  }
  return inside;
}

export function barrioAt(idx: BarrioIndex, point: LatLon): BarrioFeature | null {
  const { lat, lon } = point;
  for (let i = 0; i < idx.list.length; i++) {
    const [a, b, c, d] = idx.boxes[i];
    if (lat < a || lat > c || lon < b || lon > d) continue;
    for (const ring of idx.list[i].r) {
      if (pointInRing(lat, lon, ring)) return idx.list[i];
    }
  }
  return null;
}

/**
 * Poder adquisitivo 0-1 desde la composición ICV oficial del barrio.
 * Curva logística sobre el % de hogares pobres, calibrada contra sectores
 * conocidos (Piantini ~0.95, Gazcue ~0.8, Capotillo ~0.27, La Zurza ~0.1),
 * con un impulso acotado por el % de estrato alto ICV-4.
 */
export function powerFromBarrio(b: BarrioFeature): number | null {
  if (b.p === null) return null;
  const base = 0.05 + 0.9 / (1 + Math.exp((b.p - 20) / 7));
  const boost = b.a !== null ? Math.min(0.15, b.a * 0.0025) : 0;
  return Math.min(0.97, Math.max(0.05, base + boost));
}

/** Poder en un punto usando barrios oficiales, con caché por celda. */
export function barrioPowerAt(idx: BarrioIndex, point: LatLon): number | null {
  const key = `${point.lat.toFixed(4)}_${point.lon.toFixed(4)}`;
  const hit = idx.powerCache.get(key);
  if (hit !== undefined) return hit;
  const b = barrioAt(idx, point);
  const power = b ? powerFromBarrio(b) : null;
  idx.powerCache.set(key, power);
  return power;
}
