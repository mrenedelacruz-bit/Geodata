import { census2022For, purchasingPowerAt, POVERTY_CONTEXT_2025 } from '../data/census';
import { distanceMeters } from './geo';
import type { VehicularExposure } from './roads';
import { barrioAt, barrioAreaKm2, powerFromBarrio } from './barrios';
import type { BarrioFeature, BarrioIndex } from './barrios';
import type { BusinessCategory, LatLon, OsmPOI } from '../types';

/**
 * Análisis de mercado del punto seleccionado: área de captación estimada
 * (isócrona aproximada), hogares y demanda dentro de ella, cuota de captura
 * (modelo gravitacional de Huff), saturación relativa y solape de captación
 * con los competidores existentes (canibalización).
 */

export type TravelMode = 'walk' | 'car';

/**
 * Radio de captación estimado en metros: velocidad media urbana dividida por
 * un factor de desvío de la trama vial (~1.3, la relación típica entre
 * distancia por calle y línea recta). A pie 4.5 km/h; en carro 20 km/h de
 * velocidad efectiva urbana con tráfico. Es una isócrona APROXIMADA (círculo
 * equivalente), no un cálculo sobre la red vial.
 */
export function catchmentRadiusM(mode: TravelMode, minutes: number): number {
  const metersPerMin = mode === 'walk' ? 4500 / 60 : 20000 / 60;
  return Math.round((metersPerMin * minutes) / 1.3);
}

export const CATCHMENT_MINUTES = [5, 10, 15];

/**
 * Fracción del gasto mensual del hogar que captura cada rubro — estimaciones
 * propias alineadas a la estructura de gasto de los hogares dominicanos
 * (ENGIH/BCRD, aprox.). null = rubro B2B o de compra esporádica donde la
 * proyección de gasto de hogares del entorno no aplica.
 */
const SPEND_SHARE: Record<string, number | null> = {
  gasolinera: 0.045,
  estacion_gas: 0.02,
  restaurante: 0.055,
  cafeteria: 0.015,
  farmacia: 0.035,
  supermercado: 0.18,
  salon_belleza: 0.015,
  gimnasio: 0.008,
  ferreteria: 0.02,
  panaderia: 0.02,
  lavanderia: 0.006,
  clinica_dental: 0.012,
  dealer_vehiculos: null,
  tienda_repuestos: 0.012,
  taller_automotriz: 0.018,
  neumaticos: 0.008,
  transporte_carga: null,
  transporte_pasajeros: 0.03,
};

export type MarketSaturation = 'oportunidad' | 'moderado' | 'saturado';

export interface CompetitorOverlap {
  name: string;
  distanceM: number;
  /** % del área de captación propia que se solapa con la del competidor. */
  overlapPct: number;
}

export interface MarketAnalysis {
  mode: TravelMode;
  minutes: number;
  radiusM: number;
  /** Hogares estimados dentro de la captación (calibrado al censo 2022). */
  households: number | null;
  populationEst: number | null;
  avgPower: number | null;
  /** Demanda potencial del rubro en RD$/mes dentro de la captación. */
  demandRD: number | null;
  competitorsIn: number;
  /** Competidores por 10k habitantes en la captación vs. promedio provincial. */
  per10k: number | null;
  provincialPer10k: number | null;
  saturation: MarketSaturation | null;
  /** Cuota de captura del punto según modelo de Huff (0-1). */
  huffShare: number | null;
  /** Ventas potenciales = demanda × cuota Huff, RD$/mes. */
  salesPotentialRD: number | null;
  overlaps: CompetitorOverlap[];
}

/**
 * Factor de calibración provincial: hogares del censo 2022 / hogares del
 * registro SIUBEN. Escala los hogares registrados de cada barrio al total
 * real de hogares de la provincia (el registro no es un censo).
 */
const calibCache = new WeakMap<BarrioIndex, number>();
function calibrationFactor(idx: BarrioIndex, location: string): number {
  const hit = calibCache.get(idx);
  if (hit !== undefined) return hit;
  const census = census2022For(location);
  let siubenTotal = 0;
  for (const b of idx.list) siubenTotal += b.h;
  const f = census && siubenTotal > 0 ? census.hogares / siubenTotal : 1;
  calibCache.set(idx, f);
  return f;
}

/** Área de solape entre dos círculos de igual radio R a distancia d (lente). */
function equalCircleOverlapPct(radiusM: number, distM: number): number {
  if (distM >= 2 * radiusM) return 0;
  const r = radiusM;
  const lens = 2 * r * r * Math.acos(distM / (2 * r)) - (distM / 2) * Math.sqrt(4 * r * r - distM * distM);
  return Math.min(100, Math.round((lens / (Math.PI * r * r)) * 100));
}

export function computeMarket(
  point: LatLon,
  mode: TravelMode,
  minutes: number,
  opts: {
    barrios: BarrioIndex | null;
    competitors: OsmPOI[];
    category: BusinessCategory;
    location: string;
  },
): MarketAnalysis {
  const { barrios, competitors, category, location } = opts;
  const radiusM = catchmentRadiusM(mode, minutes);
  const census = census2022For(location);

  // Muestreo regular del disco de captación (~90 puntos).
  const stepM = radiusM / 5.5;
  const latStep = stepM / 111_320;
  const lonStep = stepM / (111_320 * Math.cos((point.lat * Math.PI) / 180));
  const samples: { p: LatLon; barrio: BarrioFeature | null; power: number }[] = [];
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      const p = { lat: point.lat + i * latStep, lon: point.lon + j * lonStep };
      if (distanceMeters(point, p) > radiusM) continue;
      const barrio = barrios ? barrioAt(barrios, p) : null;
      const power = (barrio ? powerFromBarrio(barrio) : null) ?? purchasingPowerAt(p, location);
      samples.push({ p, barrio, power });
    }
  }

  // Hogares: por barrio tocado, fracción de su área cubierta por la captación
  // (muestras en el barrio / muestras totales × área del disco), escalada al
  // censo con el factor provincial.
  let households: number | null = null;
  let avgPower: number | null = null;
  if (barrios && samples.length) {
    const diskAreaKm2 = (Math.PI * radiusM * radiusM) / 1e6;
    const perBarrio = new Map<BarrioFeature, number>();
    for (const s of samples) {
      if (s.barrio) perBarrio.set(s.barrio, (perBarrio.get(s.barrio) ?? 0) + 1);
    }
    const f = calibrationFactor(barrios, location);
    let total = 0;
    for (const [b, n] of perBarrio) {
      const coveredKm2 = (n / samples.length) * diskAreaKm2;
      const frac = Math.min(1, coveredKm2 / Math.max(0.01, barrioAreaKm2(b)));
      total += b.h * frac * f;
    }
    households = Math.round(total);
    // Poder medio ponderado por densidad de hogares del barrio de cada muestra.
    let wSum = 0;
    let pSum = 0;
    for (const s of samples) {
      const w = s.barrio ? Math.max(1, s.barrio.h / Math.max(0.05, barrioAreaKm2(s.barrio))) : 1;
      wSum += w;
      pSum += s.power * w;
    }
    avgPower = wSum ? pSum / wSum : null;
  }

  const populationEst = households !== null && census ? Math.round(households * census.avgHogar) : null;

  // Demanda: hogares × gasto mensual del hogar en el rubro, modulado por el
  // nivel socioeconómico de la captación (0.5 + poder medio).
  const share = SPEND_SHARE[category.id] ?? null;
  let demandRD: number | null = null;
  if (households !== null && share !== null && census) {
    const householdIncome = POVERTY_CONTEXT_2025.ingresoPerCapitaRD * census.avgHogar;
    const powerFactor = 0.5 + (avgPower ?? 0.5);
    demandRD = Math.round(households * householdIncome * share * powerFactor);
  }

  // Competencia dentro de la captación y saturación vs. promedio provincial.
  const withDist = competitors
    .map((c) => ({ c, d: distanceMeters(point, c) }))
    .sort((a, b) => a.d - b.d);
  const competitorsIn = withDist.filter((x) => x.d <= radiusM).length;
  let per10k: number | null = null;
  let provincialPer10k: number | null = null;
  let saturation: MarketSaturation | null = null;
  if (populationEst !== null && populationEst > 500 && census) {
    per10k = (competitorsIn / populationEst) * 10_000;
    provincialPer10k = (competitors.length / census.population) * 10_000;
    if (provincialPer10k > 0) {
      const ratio = per10k / provincialPer10k;
      saturation = ratio < 0.8 ? 'oportunidad' : ratio <= 1.3 ? 'moderado' : 'saturado';
    } else {
      saturation = 'oportunidad';
    }
  }

  // Huff: cuota de captura del punto frente a los competidores del entorno
  // (hasta 2× el radio), con atractividad igual y fricción distancia².
  const rivals = withDist.filter((x) => x.d <= radiusM * 2).map((x) => x.c);
  let huffShare: number | null = null;
  if (samples.length) {
    let wSum = 0;
    let sSum = 0;
    for (const s of samples) {
      const dNew = Math.max(100, distanceMeters(s.p, point));
      const uNew = 1 / (dNew * dNew);
      let uAll = uNew;
      for (const r of rivals) {
        const d = Math.max(100, distanceMeters(s.p, r));
        uAll += 1 / (d * d);
      }
      const w = s.barrio ? Math.max(1, s.barrio.h / Math.max(0.05, barrioAreaKm2(s.barrio))) : 1;
      wSum += w;
      sSum += (uNew / uAll) * w;
    }
    huffShare = wSum ? sSum / wSum : null;
  }

  const salesPotentialRD =
    demandRD !== null && huffShare !== null ? Math.round(demandRD * huffShare) : null;

  // Canibalización: solape de captación con los 3 competidores más cercanos.
  const overlaps: CompetitorOverlap[] = withDist
    .filter((x) => x.d < 2 * radiusM)
    .slice(0, 3)
    .map((x) => ({
      name: x.c.tags.name ?? category.competitorLabel,
      distanceM: Math.round(x.d),
      overlapPct: equalCircleOverlapPct(radiusM, x.d),
    }));

  return {
    mode,
    minutes,
    radiusM,
    households,
    populationEst,
    avgPower,
    demandRD,
    competitorsIn,
    per10k,
    provincialPer10k,
    saturation,
    huffShare,
    salesPotentialRD,
    overlaps,
  };
}

/** Ubicación guardada en el comparador lado a lado. */
export interface SavedSpot {
  id: number;
  label: string;
  point: LatLon;
  score: number | null;
  barrio: string | null;
  market: MarketAnalysis;
  exposure: VehicularExposure | null;
}

/** RD$ compacto: 1.4 M, 850 mil, 12,500. */
export function formatRD(v: number): string {
  if (v >= 1_000_000) return `RD$${(v / 1_000_000).toLocaleString('es-DO', { maximumFractionDigits: 1 })} MM`;
  if (v >= 100_000) return `RD$${Math.round(v / 1000).toLocaleString('es-DO')} mil`;
  return `RD$${Math.round(v).toLocaleString('es-DO')}`;
}

export const SATURATION_META: Record<MarketSaturation, { label: string; color: string }> = {
  oportunidad: { label: 'Oportunidad', color: '#16a34a' },
  moderado: { label: 'Moderado', color: '#d97706' },
  saturado: { label: 'Saturado', color: '#dc2626' },
};
