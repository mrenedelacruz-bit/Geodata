import { ANCHOR_SIGNALS } from '../data/categories';
import { purchasingPowerAt } from '../data/census';
import { getLocation } from '../data/locations';
import { METERS_PER_DEG_LAT, distanceMeters, metersPerDegLon } from './geo';
import { barrioPowerAt } from './barrios';
import type { BarrioIndex } from './barrios';
import type { BBox, BusinessCategory, GridCell, LatLon, OsmPOI, SaturationLevel } from '../types';

/** Cliente objetivo: modula cómo el nivel socioeconómico pondera la demanda. */
export type TargetSegment = 'todos' | 'premium' | 'medio' | 'masivo';

/**
 * Multiplicador socioeconómico de la demanda según el cliente objetivo.
 * 'todos' es el comportamiento clásico (±30%); 'premium' premia estrato alto,
 * 'medio' hace pico en poder medio y 'masivo' favorece zonas populares densas.
 */
function segmentMultiplier(power: number, target: TargetSegment): number {
  switch (target) {
    case 'premium':
      return 0.4 + 1.2 * power;
    case 'medio':
      return Math.max(0.4, 1.15 - 0.9 * Math.abs(power - 0.55));
    case 'masivo':
      return 1.25 - 0.5 * power;
    default:
      return 0.7 + 0.6 * power;
  }
}

const CELL_METERS = 450;

export function buildGridDims(bbox: BBox) {
  const centerLat = (bbox.south + bbox.north) / 2;
  const latStep = CELL_METERS / METERS_PER_DEG_LAT;
  const lonStep = CELL_METERS / metersPerDegLon(centerLat);
  const rows = Math.ceil((bbox.north - bbox.south) / latStep);
  const cols = Math.ceil((bbox.east - bbox.west) / lonStep);
  return { latStep, lonStep, rows, cols };
}

/**
 * Nivel de saturación de la celda según su propia proporción competidores/demanda
 * (no se compara contra el promedio del área). Sin competidores siempre es
 * oportunidad; con competidores pero sin demanda cercana, siempre saturado.
 */
function saturationLevelOf(competitorCount: number, anchorScore: number): SaturationLevel {
  if (competitorCount === 0) return 'oportunidad';
  const ratio = competitorCount / Math.max(anchorScore, 1);
  if (ratio <= 0.5) return 'oportunidad';
  if (ratio <= 1.2) return 'moderado';
  return 'saturado';
}

function cellKeyOf(lat: number, lon: number, bbox: BBox, latStep: number, lonStep: number) {
  const row = Math.floor((lat - bbox.south) / latStep);
  const col = Math.floor((lon - bbox.west) / lonStep);
  return { row, col };
}

/** Aporte precomputado de un POI: se evalúa una sola vez por cambio de rubro. */
interface PoiContribution {
  isCompetitor: boolean;
  anchorWeight: number;
}

/**
 * Buckets con el aporte de cada POI ya evaluado. Cada POI cae en la vecindad
 * 3×3 de varias celdas, así que sin esto los matchers (incluidos los regex de
 * marcas GLP) se ejecutarían hasta 9 veces por POI en cada cambio de rubro.
 */
function bucketContributions(
  pois: OsmPOI[],
  category: BusinessCategory,
  bbox: BBox,
  latStep: number,
  lonStep: number,
) {
  const weights = category.anchorWeights || {};
  const buckets = new Map<string, PoiContribution[]>();
  for (const poi of pois) {
    let anchorWeight = 0;
    for (const anchor of ANCHOR_SIGNALS) {
      if (anchor.matches(poi.tags)) {
        anchorWeight += weights[anchor.id] ?? anchor.weight;
      }
    }
    const contribution: PoiContribution = {
      isCompetitor: category.matchesCompetitor(poi.tags),
      anchorWeight,
    };
    const { row, col } = cellKeyOf(poi.lat, poi.lon, bbox, latStep, lonStep);
    const key = `${row}_${col}`;
    const arr = buckets.get(key);
    if (arr) arr.push(contribution);
    else buckets.set(key, [contribution]);
  }
  return buckets;
}

export function computeGrid(
  pois: OsmPOI[],
  category: BusinessCategory,
  location = 'santo-domingo',
  opts: { barrios?: BarrioIndex | null; target?: TargetSegment } = {},
): GridCell[] {
  const { barrios = null, target = 'todos' } = opts;
  const locationConfig = getLocation(location);
  const bbox = locationConfig.bbox;
  const { latStep, lonStep, rows, cols } = buildGridDims(bbox);
  const buckets = bucketContributions(pois, category, bbox, latStep, lonStep);

  const cells: GridCell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let competitorCount = 0;
      let anchorScore = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const bucket = buckets.get(`${row + dr}_${col + dc}`);
          if (!bucket) continue;
          for (const poi of bucket) {
            if (poi.isCompetitor) competitorCount++;
            anchorScore += poi.anchorWeight;
          }
        }
      }
      const south = bbox.south + row * latStep;
      const west = bbox.west + col * lonStep;
      cells.push({
        row,
        col,
        center: { lat: south + latStep / 2, lon: west + lonStep / 2 },
        bounds: [
          [south, west],
          [south + latStep, west + lonStep],
        ],
        competitorCount,
        anchorScore,
        score: 0,
        saturationLevel: saturationLevelOf(competitorCount, anchorScore),
      });
    }
  }

  // reduce en vez de spread: con ~20k celdas, `Math.max(...)` con spread se
  // acerca al límite de argumentos de la pila de llamadas.
  let maxAnchor = 1;
  let maxCompetitor = 1;
  for (const c of cells) {
    if (c.anchorScore > maxAnchor) maxAnchor = c.anchorScore;
    if (c.competitorCount > maxCompetitor) maxCompetitor = c.competitorCount;
  }
  for (const cell of cells) {
    const demand = cell.anchorScore / maxAnchor;
    const saturation = cell.competitorCount / maxCompetitor;
    // Poder adquisitivo de la celda: primero el barrio oficial SIUBEN
    // (punto-en-polígono sobre los polígonos ICV_BARRIOS); si la celda cae
    // fuera de todo barrio o el barrio no tiene cifra, el sector estimado.
    const barrioPower = barrios ? barrioPowerAt(barrios, cell.center) : null;
    const power = barrioPower ?? purchasingPowerAt(cell.center, location);
    const adjustedDemand = demand * segmentMultiplier(power, target);
    cell.score = Math.round(Math.min(100, Math.max(0, adjustedDemand * 100 - saturation * 55)));
  }
  return cells;
}

export function findPoiAtPoint(pois: OsmPOI[], point: LatLon, radiusMeters = 30): OsmPOI | null {
  let closest: OsmPOI | null = null;
  let closestDist = radiusMeters;

  for (const poi of pois) {
    const dist = distanceMeters(poi, point);
    if (dist < closestDist) {
      closestDist = dist;
      closest = poi;
    }
  }
  return closest;
}

export function scoreAtPoint(pois: OsmPOI[], category: BusinessCategory, point: LatLon, radiusMeters = 500) {
  let competitorCount = 0;
  let anchorScore = 0;
  const nearby: { anchor: string; count: number }[] = [];
  const anchorCounts = new Map<string, number>();
  const weights = category.anchorWeights || {};

  for (const poi of pois) {
    if (distanceMeters(poi, point) > radiusMeters) continue;
    if (category.matchesCompetitor(poi.tags)) competitorCount++;
    for (const anchor of ANCHOR_SIGNALS) {
      if (anchor.matches(poi.tags)) {
        const weight = weights[anchor.id] ?? anchor.weight;
        anchorScore += weight;
        anchorCounts.set(anchor.label, (anchorCounts.get(anchor.label) ?? 0) + 1);
      }
    }
  }
  for (const [anchor, count] of anchorCounts) nearby.push({ anchor, count });
  nearby.sort((a, b) => b.count - a.count);
  return { competitorCount, anchorScore, nearby };
}
