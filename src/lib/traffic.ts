import type { BBox, LatLon } from '../types';

export interface TrafficWay {
  id: number;
  coords: LatLon[];
  tags: Record<string, string>;
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export async function fetchTrafficWays(bbox: BBox): Promise<TrafficWay[]> {
  const query = `
    [bbox:${bbox.south},${bbox.west},${bbox.north},${bbox.east}];
    (
      way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"];
    );
    out geom;
  `;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: query,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const ways: TrafficWay[] = [];

    if (data.elements) {
      for (const way of data.elements) {
        if (way.type === 'way' && way.geometry) {
          ways.push({
            id: way.id,
            coords: way.geometry.map((point: { lat: number; lon: number }) => ({
              lat: point.lat,
              lon: point.lon,
            })),
            tags: way.tags || {},
          });
        }
      }
    }

    return ways;
  } catch (error) {
    console.error('Error fetching traffic ways:', error);
    return [];
  }
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
  // Rojo fuerte para autopistas, naranja para vías principales
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
    weight: weight,
    opacity: 0.7,
  };
}
