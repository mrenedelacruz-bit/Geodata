import { useState } from 'react';
import { geocodeAddress, type GeocodeResult } from '../lib/geocode';
import type { LatLon } from '../types';

interface Props {
  onSelect: (point: LatLon, label: string) => void;
  locationLabel: string;
}

export default function SearchBox({ onSelect, locationLabel }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await geocodeAddress(query, locationLabel);
      setResults(res);
      if (res.length === 0) setError('No se encontraron resultados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al geocodificar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-box">
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar dirección, sector o punto de referencia…"
        />
        <button type="submit" disabled={loading}>
          {loading ? '…' : 'Buscar'}
        </button>
      </form>
      {error && <p className="search-error">{error}</p>}
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect({ lat: r.lat, lon: r.lon }, r.displayName);
                setResults([]);
                setQuery(r.displayName);
              }}
            >
              {r.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
