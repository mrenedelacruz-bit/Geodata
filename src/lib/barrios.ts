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

const areaCache = new WeakMap<BarrioFeature, number>();

/** Área aproximada del barrio en km² (shoelace con corrección de latitud). */
export function barrioAreaKm2(b: BarrioFeature): number {
  const hit = areaCache.get(b);
  if (hit !== undefined) return hit;
  let total = 0;
  for (const ring of b.r) {
    let sum = 0;
    const cos = Math.cos((ring[0][0] * Math.PI) / 180);
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [lat1, lon1] = ring[i];
      const [lat2, lon2] = ring[j];
      sum += lon1 * cos * lat2 - lon2 * cos * lat1;
    }
    total += Math.abs(sum / 2) * 111.32 * 111.32;
  }
  areaCache.set(b, total);
  return total;
}

export type BarrioCategory = 'alto' | 'medio' | 'pobreza' | 'sin-dato';

/**
 * Clasificación socioeconómica del barrio.
 *
 * El registro SIUBEN sobre-representa hogares vulnerables: en barrios de élite
 * casi nadie se registra (Piantini: 22 hogares) mientras en barrios populares
 * consolidados el registro es masivo y muchos alcanzan ICV-4 (que mide
 * condiciones de vida adecuadas, no riqueza — ~29% del país). Por eso "alto
 * ingreso" exige las dos señales de élite: ICV-4 dominante entre los pocos
 * registrados Y baja penetración del registro (<800 hogares SIUBEN/km²).
 */
/**
 * Municipios con distritos de élite consolidados, donde la señal
 * "ICV-4 dominante + baja penetración del registro" es confiable. Fuera de
 * ellos (periferias con suelo abierto que abarata la densidad) se exige
 * evidencia más fuerte para "alto ingreso".
 */
const ELITE_MUNS = new Set(['Santo Domingo De Guzmán', 'Santiago']);

/**
 * Barrios populares donde el suelo abierto (parques, cañadas, lotes rurales)
 * abarata la densidad del registro y la señal automática falla. Validación
 * local: son barrios populares de ingreso bajo, no de ingreso medio.
 */
/**
 * Barrios de élite que las reglas automáticas no alcanzan. Los Cacicazgos:
 * solo 17 hogares SIUBEN en 1 km² (16/km², la penetración más baja del DN,
 * firma de élite) pero <20 categorizados ⇒ sin % oficial. La Julia: sector
 * alto consolidado cuyo registro supera el umbral de densidad popular.
 */
const ALTO_OVERRIDES = new Set([
  'Los Cacicazgos|Santo Domingo De Guzmán',
  'La Julia|Santo Domingo De Guzmán',
  'Julieta Morales|Santo Domingo De Guzmán',
]);

/**
 * Barrios que la regla automática de élite sobreclasifica: pocos hogares
 * registrados y alto % ICV-4 entre ellos, pero validación local dice que son
 * clase media, no alta (edificios/zonas mixtas con poca penetración de
 * registro que no reflejan el nivel real del barrio). Fuerza 'medio' incluso
 * si cumplirían el umbral automático de élite.
 */
const MEDIO_OVERRIDES = new Set([
  'Ciudad Universitaria|Santo Domingo De Guzmán',
  'Gazcue|Santo Domingo De Guzmán',
  'Miraflores|Santo Domingo De Guzmán',
  'Los Jardines|Santo Domingo De Guzmán',
  'San Geronimo|Santo Domingo De Guzmán',
  'Atala|Santo Domingo De Guzmán',
  'General Antonio Duverge|Santo Domingo De Guzmán',
  'Cacique|Santo Domingo De Guzmán',
  'Centro De Los Heroes|Santo Domingo De Guzmán',
  'Miramar|Santo Domingo De Guzmán',
]);

const POPULAR_OVERRIDES = new Set([
  'Los Tres Ojos|Santo Domingo Este',
  'San Isidro Adentro|Santo Domingo Este',
  'Cancino|Santo Domingo Este',
  'Cancino Afuera|Santo Domingo Este',
  'Cancino Adentro|Santo Domingo Este',
]);

/**
 * Municipios enteros de ingreso bajo por validación local: aunque algunos de
 * sus barrios no alcancen el umbral automático de densidad de registro
 * (suelo aún poco poblado, lotificaciones nuevas), el municipio completo es
 * de ingreso bajo. No aplica a barrios ya en ALTO_OVERRIDES ni a los que
 * cruzan el umbral de pobreza extrema (siguen en 'Pobreza', tono oscuro).
 */
const MUNI_INGRESO_BAJO = new Set(['Los Alcarrizos']);

export function classifyBarrio(b: BarrioFeature): { cat: BarrioCategory; label: string; color: string } {
  const p = b.p;
  const a = b.a ?? 60;
  if (ALTO_OVERRIDES.has(`${b.n}|${b.m}`)) {
    const l = 52 - Math.max(0, Math.min(1, (a - 45) / 30)) * 22;
    return { cat: 'alto', label: 'Alto ingreso', color: `hsl(262, 60%, ${Math.round(l)}%)` };
  }
  if (p === null) return { cat: 'sin-dato', label: 'Sin cifra ICV', color: '#94a3b8' };
  if (MEDIO_OVERRIDES.has(`${b.n}|${b.m}`)) {
    const l = 40 + (p / 35) * 28;
    return { cat: 'medio', label: 'Ingreso medio', color: `hsl(180, 45%, ${Math.round(l)}%)` };
  }
  const density = b.h / Math.max(0.05, barrioAreaKm2(b));
  const isAlto =
    !MUNI_INGRESO_BAJO.has(b.m) &&
    (ELITE_MUNS.has(b.m) ? a >= 45 && p < 15 && density < 800 : a >= 55 && p < 12 && density < 600);
  if (isAlto) {
    const l = 52 - Math.min(1, (a - 45) / 30) * 22; // violeta: 52% → 30%
    return { cat: 'alto', label: 'Alto ingreso', color: `hsl(262, 60%, ${Math.round(l)}%)` };
  }
  if (p >= 35) {
    const l = 55 - Math.min(1, (p - 35) / 50) * 25; // magenta oscuro: 55% → 30%
    return { cat: 'pobreza', label: 'Pobreza', color: `hsl(330, 60%, ${Math.round(l)}%)` };
  }
  // Barrio popular consolidado: pobreza moderada, no extrema. La señal es la
  // penetración masiva del registro SIUBEN (≥1.200 hogares/km², o ≥800 con
  // pobreza ICV ≥20%), más la lista de validación local para barrios cuyo
  // suelo abierto engaña a la densidad.
  const isPopular =
    density >= 1200 ||
    (p >= 20 && density >= 800) ||
    POPULAR_OVERRIDES.has(`${b.n}|${b.m}`) ||
    MUNI_INGRESO_BAJO.has(b.m);
  if (isPopular) {
    const l = 74 - (p / 35) * 16; // magenta claro: 74% → 58%
    return { cat: 'pobreza', label: 'Popular / ingreso bajo', color: `hsl(330, 55%, ${Math.round(l)}%)` };
  }
  const l = 40 + (p / 35) * 28; // turquesa: oscuro = media sólida
  return { cat: 'medio', label: 'Ingreso medio', color: `hsl(180, 45%, ${Math.round(l)}%)` };
}

/**
 * Poder adquisitivo 0-1 desde la composición ICV oficial del barrio.
 * Curva logística sobre el % de hogares pobres, calibrada contra sectores
 * conocidos (Piantini ~0.95, Capotillo ~0.27, La Zurza ~0.1), con impulso por
 * % ICV-4. Topes por categoría (corrigen el sesgo de composición del registro
 * SIUBEN): élite hasta 0.97, ingreso medio hasta 0.78 y barrios populares /
 * pobreza hasta 0.55 — un barrio popular consolidado no puede puntuar como
 * uno de clase media aunque sus registrados alcancen ICV-4.
 */
export function powerFromBarrio(b: BarrioFeature): number | null {
  const cat = classifyBarrio(b).cat;
  if (b.p === null) return cat === 'alto' ? 0.92 : null;
  const base = 0.05 + 0.9 / (1 + Math.exp((b.p - 20) / 7));
  const boost = b.a !== null ? Math.min(0.15, b.a * 0.0025) : 0;
  const raw = Math.min(0.97, Math.max(0.05, base + boost));
  const cap = cat === 'alto' ? 0.97 : cat === 'pobreza' ? 0.55 : 0.78;
  return Math.min(cap, raw);
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
