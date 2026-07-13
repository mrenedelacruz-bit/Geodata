import { ANCHOR_SIGNALS } from '../data/categories';
import { purchasingPowerAt } from '../data/census';
import type { BBox, BusinessCategory, GridCell, LatLon, OsmPOI } from '../types';

// Cobertura ampliada hasta la Circunvalación de Santo Domingo (Norte/Duarte y Este),
// incluyendo Santo Domingo Este, Norte, Oeste (Los Alcarrizos) y el Distrito Nacional.
export const SANTO_DOMINGO_BBOX: BBox = {
  south: 18.4,
  west: -70.15,
  north: 18.62,
  east: -69.75,
};

export const SANTO_DOMINGO_CENTER: LatLon = { lat: 18.4861, lon: -69.9312 };

const CELL_METERS = 450;
const METERS_PER_DEG_LAT = 111_320;

function metersPerDegLon(lat: number): number {
  return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

export function buildGridDims(bbox: BBox) {
  const centerLat = (bbox.south + bbox.north) / 2;
  const latStep = CELL_METERS / METERS_PER_DEG_LAT;
  const lonStep = CELL_METERS / metersPerDegLon(centerLat);
  const rows = Math.ceil((bbox.north - bbox.south) / latStep);
  const cols = Math.ceil((bbox.east - bbox.west) / lonStep);
  return { latStep, lonStep, rows, cols };
}

function cellKeyOf(lat: number, lon: number, bbox: BBox, latStep: number, lonStep: number) {
  const row = Math.floor((lat - bbox.south) / latStep);
  const col = Math.floor((lon - bbox.west) / lonStep);
  return { row, col };
}

/** Buckets POIs into grid cells for fast neighborhood lookups. */
function bucketPOIs(pois: OsmPOI[], bbox: BBox, latStep: number, lonStep: number) {
  const buckets = new Map<string, OsmPOI[]>();
  for (const poi of pois) {
    const { row, col } = cellKeyOf(poi.lat, poi.lon, bbox, latStep, lonStep);
    const key = `${row}_${col}`;
    const arr = buckets.get(key);
    if (arr) arr.push(poi);
    else buckets.set(key, [poi]);
  }
  return buckets;
}

export function computeGrid(pois: OsmPOI[], category: BusinessCategory, bbox = SANTO_DOMINGO_BBOX): GridCell[] {
  const { latStep, lonStep, rows, cols } = buildGridDims(bbox);
  const buckets = bucketPOIs(pois, bbox, latStep, lonStep);
  const weights = category.anchorWeights || {};

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
            if (category.matchesCompetitor(poi.tags)) competitorCount++;
            for (const anchor of ANCHOR_SIGNALS) {
              if (anchor.matches(poi.tags)) {
                const weight = weights[anchor.id] ?? anchor.weight;
                anchorScore += weight;
              }
            }
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
      });
    }
  }

  const maxAnchor = Math.max(1, ...cells.map((c) => c.anchorScore));
  const maxCompetitor = Math.max(1, ...cells.map((c) => c.competitorCount));
  for (const cell of cells) {
    const demand = cell.anchorScore / maxAnchor;
    const saturation = cell.competitorCount / maxCompetitor;
    // Ajuste socioeconómico (ONE/SIUBEN): el poder adquisitivo del sector
    // modula la demanda en ±30% — power 0.5 es neutro (×1.0), 1.0 → ×1.3,
    // 0.0 → ×0.7. Multiplicativo para que celdas sin demanda sigan en 0.
    const power = purchasingPowerAt(cell.center);
    const adjustedDemand = demand * (0.7 + 0.6 * power);
    cell.score = Math.round(Math.min(100, Math.max(0, adjustedDemand * 100 - saturation * 55)));
  }
  return cells;
}

export function findPoiAtPoint(pois: OsmPOI[], point: LatLon, radiusMeters = 30): OsmPOI | null {
  let closest: OsmPOI | null = null;
  let closestDist = radiusMeters;

  for (const poi of pois) {
    const dLat = (poi.lat - point.lat) * METERS_PER_DEG_LAT;
    const dLon = (poi.lon - point.lon) * metersPerDegLon(point.lat);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
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
    const dLat = (poi.lat - point.lat) * METERS_PER_DEG_LAT;
    const dLon = (poi.lon - point.lon) * metersPerDegLon(point.lat);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist > radiusMeters) continue;
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
