/**
 * Caché en localStorage para respuestas de Overpass.
 *
 * Overpass limita peticiones por IP: recargar la página relanzaba las dos
 * consultas pesadas (POIs + vías) y la segunda visita en pocos minutos
 * recibía 429. Con esta caché, las recargas dentro del TTL no tocan la red,
 * y si Overpass falla se usa la copia vencida como respaldo (mejor datos de
 * ayer que un error).
 */

const TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

interface Envelope<T> {
  t: number;
  v: T;
}

export function readCache<T>(key: string): { value: T; stale: boolean } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope<T>;
    if (typeof env.t !== 'number' || env.v === undefined) return null;
    return { value: env.v, stale: Date.now() - env.t > TTL_MS };
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  const env: Envelope<T> = { t: Date.now(), v: value };
  try {
    localStorage.setItem(key, JSON.stringify(env));
  } catch {
    // Cuota llena (los datos de OSM pueden pesar varios MB): liberamos las
    // entradas de esta app y reintentamos una vez; si no cabe, seguimos sin caché.
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith('osm_')) localStorage.removeItem(k);
      }
      localStorage.setItem(key, JSON.stringify(env));
    } catch {
      /* sin caché */
    }
  }
}
