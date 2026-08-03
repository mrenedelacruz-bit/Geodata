import { useMemo, useState } from 'react';
import { geocodeAddress, type GeocodeResult } from '../lib/geocode';
import type { BarrioIndex } from '../lib/barrios';
import type { LatLon } from '../types';

interface Props {
  onSelect: (point: LatLon, label: string) => void;
  locationLabel: string;
  barrioIndex: BarrioIndex | null;
}

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function SearchBox({ onSelect, locationLabel, barrioIndex }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coincidencias locales instantáneas contra los barrios oficiales SIUBEN.
  const barrioMatches = useMemo(() => {
    const q = norm(query.trim());
    if (!barrioIndex || q.length < 3) return [];
    const out: { label: string; point: LatLon }[] = [];
    for (let i = 0; i < barrioIndex.list.length && out.length < 6; i++) {
      const b = barrioIndex.list[i];
      if (norm(b.n).includes(q)) {
        out.push({ label: `${b.n} (${b.m})`, point: barrioIndex.centroids[i] });
      }
    }
    return out;
  }, [query, barrioIndex]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await geocodeAddress(query, locationLabel);
      setResults(res);
      if (res.length === 0 && barrioMatches.length === 0) setError('No se encontraron resultados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al geocodificar');
    } finally {
      setLoading(false);
    }
  }

  function pick(point: LatLon, label: string) {
    onSelect(point, label);
    setResults([]);
    setQuery(label);
  }

  return (
    <div className="search-box">
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar barrio, dirección o punto de referencia…"
        />
        <button type="submit" disabled={loading}>
          {loading ? '…' : 'Buscar'}
        </button>
      </form>
      {error && <p className="search-error">{error}</p>}
      {(barrioMatches.length > 0 || results.length > 0) && (
        <ul className="search-results">
          {barrioMatches.map((b, i) => (
            <li key={`b${i}`} onClick={() => pick(b.point, b.label)}>
              🏘️ {b.label}
            </li>
          ))}
          {results.map((r, i) => (
            <li key={i} onClick={() => pick({ lat: r.lat, lon: r.lon }, r.displayName)}>
              {r.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
