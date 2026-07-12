export interface GeocodeResult {
  displayName: string;
  lat: number;
  lon: number;
}

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    q: `${query}, Santo Domingo, República Dominicana`,
    format: 'json',
    limit: '6',
    countrycodes: 'do',
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Nominatim respondió ${res.status}`);
  const json = await res.json();
  return (json as Array<{ display_name: string; lat: string; lon: string }>).map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }));
}
