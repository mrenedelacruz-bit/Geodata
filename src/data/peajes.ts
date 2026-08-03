/**
 * Flujo vehicular REAL medido — dataset "Tráfico de las Estaciones de Peaje"
 * (RD Vial / INTRANT, portal de datos abiertos datos.gob.do), serie mensual
 * por estación y categoría de vehículo, corte junio 2026. Agregado aquí a:
 * promedio diario 2025 (año completo), crecimiento del tráfico anual frente
 * al primer año completo disponible, y promedio diario enero-junio 2026.
 * El agregado completo por año está versionado en
 * docs/data/peajes-rd-vial.csv. Las estaciones se asocian a las provincias
 * cuyo corredor sirven (sin coordenadas: el listado oficial no las trae).
 */

export interface PeajeStation {
  name: string;
  corridor: string;
  /** Provincias de la app a cuyo mercado sirve el corredor. */
  provinces: string[];
  /** Vehículos por día, promedio 2025 (año completo). */
  daily2025: number;
  /** Crecimiento % del tráfico anual 2025 vs. baseYear (null si no hay base). */
  growthPct: number | null;
  baseYear: number | null;
  /** Vehículos por día, promedio enero-junio 2026. */
  daily2026: number;
}

export const PEAJES: PeajeStation[] = [
  { name: 'Las Américas', corridor: 'Autopista Las Américas (SD–aeropuerto–Boca Chica)', provinces: ['santo-domingo'], daily2025: 31_873, growthPct: 16.2, baseYear: 2021, daily2026: 33_578 },
  { name: 'Duarte', corridor: 'Autopista Duarte (SD–Cibao)', provinces: ['santo-domingo', 'la-vega'], daily2025: 31_891, growthPct: 70.4, baseYear: 2021, daily2026: 43_860 },
  { name: 'Sánchez', corridor: 'Autopista Sánchez (SD–San Cristóbal–sur)', provinces: ['santo-domingo', 'san-cristobal'], daily2025: 19_702, growthPct: 7.3, baseYear: 2021, daily2026: 21_202 },
  { name: '6 de Noviembre', corridor: 'Autopista 6 de Noviembre (SD–San Cristóbal)', provinces: ['santo-domingo', 'san-cristobal'], daily2025: 17_899, growthPct: 3.8, baseYear: 2021, daily2026: 21_711 },
  { name: 'Ecológica', corridor: 'Autovía Ecológica (Circunvalación SD)', provinces: ['santo-domingo'], daily2025: 4_748, growthPct: null, baseYear: null, daily2026: 11_896 },
  { name: 'Santiago', corridor: 'Circunvalación de Santiago', provinces: ['santiago'], daily2025: 11_777, growthPct: 33.0, baseYear: 2021, daily2026: 12_664 },
  { name: 'Romana', corridor: 'Autovía del Este (SD–La Romana)', provinces: ['la-romana'], daily2025: 15_309, growthPct: 50.1, baseYear: 2021, daily2026: 19_276 },
  { name: 'Coral 1', corridor: 'Autopista del Coral (La Romana–Punta Cana)', provinces: ['la-romana', 'la-altagracia'], daily2025: 18_601, growthPct: 53.6, baseYear: 2021, daily2026: 20_770 },
  { name: 'Coral 2', corridor: 'Autopista del Coral (La Romana–Punta Cana)', provinces: ['la-romana', 'la-altagracia'], daily2025: 17_522, growthPct: 77.4, baseYear: 2021, daily2026: 20_466 },
];

/** Estaciones fuera de las 7 provincias (contexto de corredores nacionales). */
export const PEAJES_OTROS: PeajeStation[] = [
  { name: 'Tramo 1', corridor: 'Autopista Juan Pablo II (SD–Samaná)', provinces: [], daily2025: 19_854, growthPct: 40.7, baseYear: 2021, daily2026: 24_369 },
  { name: 'Tramo 2', corridor: 'Autopista Juan Pablo II (SD–Samaná)', provinces: [], daily2025: 19_430, growthPct: 60.2, baseYear: 2021, daily2026: 22_093 },
  { name: 'Tramo 2B', corridor: 'Autopista Juan Pablo II (SD–Samaná)', provinces: [], daily2025: 14_203, growthPct: 92.8, baseYear: 2021, daily2026: 17_678 },
  { name: 'Naranjal', corridor: 'Autopista Juan Pablo II (SD–Samaná)', provinces: [], daily2025: 8_236, growthPct: 32.0, baseYear: 2022, daily2026: 9_260 },
  { name: 'Marbella', corridor: 'Boulevard Turístico del Atlántico', provinces: [], daily2025: 7_396, growthPct: -33.0, baseYear: 2022, daily2026: 5_977 },
  { name: 'Guaraguao', corridor: 'Boulevard Turístico del Atlántico', provinces: [], daily2025: 5_333, growthPct: 25.0, baseYear: 2022, daily2026: 5_840 },
  { name: 'Catey', corridor: 'Boulevard Turístico del Atlántico (Samaná)', provinces: [], daily2025: 1_806, growthPct: 25.9, baseYear: 2022, daily2026: 2_225 },
  { name: 'Circunv. Azua', corridor: 'Circunvalación de Azua', provinces: [], daily2025: 5_786, growthPct: null, baseYear: null, daily2026: 7_807 },
  { name: 'Baní', corridor: 'Circunvalación de Baní', provinces: [], daily2025: 3_026, growthPct: null, baseYear: null, daily2026: 9_020 },
];

export const PEAJES_CUTOFF = 'jun 2026';

export function peajesFor(location: string): PeajeStation[] {
  return PEAJES.filter((p) => p.provinces.includes(location)).sort((a, b) => b.daily2025 - a.daily2025);
}
