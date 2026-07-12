export interface LatLon {
  lat: number;
  lon: number;
}

export interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface OsmPOI {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

export interface BusinessCategory {
  id: string;
  label: string;
  icon: string;
  competitorLabel: string;
  matchesCompetitor: (tags: Record<string, string>) => boolean;
  anchorWeights?: Record<string, number>;
}

export interface AnchorSignal {
  id: string;
  label: string;
  weight: number;
  matches: (tags: Record<string, string>) => boolean;
}

export interface GridCell {
  row: number;
  col: number;
  center: LatLon;
  bounds: [[number, number], [number, number]];
  competitorCount: number;
  anchorScore: number;
  score: number;
}
