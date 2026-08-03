import { useEffect, useState } from 'react';
import { Circle, Polygon, Popup } from 'react-leaflet';
import { getCensusSectors, powerColor, powerLabel } from '../data/census';
import type { CensusSector } from '../data/census';

interface Props {
  location: string;
}

/** Barrio oficial SIUBEN: nombre, municipio, hogares, % pobres, % ICV-4, anillos. */
interface Barrio {
  n: string;
  m: string;
  h: number;
  p: number | null;
  a: number | null;
  r: [number, number][][];
}

/**
 * Provincias con cartografía oficial de barrios (SIUBEN Open Data,
 * INGRESO_BARRIOS geometrías + ICV_BARRIOS atributos, unidos por código).
 * Cobertura completa: las 7 provincias de la app.
 */
const OFFICIAL_BARRIOS = new Set([
  'santo-domingo',
  'puerto-plata',
  'la-altagracia',
  'san-cristobal',
  'santiago',
  'la-vega',
  'la-romana',
]);

/** Verde (poca pobreza) → rojo (mucha), por % de hogares pobres ICV-1+2. */
function poorColor(p: number | null): string {
  if (p === null) return '#94a3b8';
  const hue = Math.max(0, Math.min(120, 120 - (p / 85) * 120));
  return `hsl(${hue}, 65%, 42%)`;
}

export default function CensusLayer({ location }: Props) {
  const official = OFFICIAL_BARRIOS.has(location);
  const [barrios, setBarrios] = useState<Barrio[] | null>(null);

  useEffect(() => {
    if (!official) {
      setBarrios(null);
      return;
    }
    let cancelled = false;
    setBarrios(null);
    fetch(`${import.meta.env.BASE_URL}data/barrios/${location}.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setBarrios(data);
      })
      .catch(() => {
        if (!cancelled) setBarrios(null);
      });
    return () => {
      cancelled = true;
    };
  }, [location, official]);

  if (official && barrios) {
    return (
      <>
        {barrios.map((b, i) => (
          <Polygon
            key={i}
            positions={b.r}
            pathOptions={{
              color: '#475569',
              weight: 0.4,
              opacity: 0.5,
              fillColor: poorColor(b.p),
              fillOpacity: 0.3,
            }}
          >
            <Popup>
              <div style={{ fontSize: '12px', minWidth: '200px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{b.n}</div>
                <div>Municipio: {b.m}</div>
                <div>{b.h.toLocaleString('es-DO')} hogares en el registro SIUBEN</div>
                {b.p !== null && (
                  <div>
                    Hogares pobres (ICV-1+2): <strong>{b.p}%</strong>
                  </div>
                )}
                {b.a !== null && <div>Estrato alto (ICV-4): {b.a}%</div>}
                <div style={{ marginTop: '5px', fontSize: '10px', color: '#7a8a99' }}>
                  Barrio oficial · SIUBEN Open Data (ICV_BARRIOS)
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}
      </>
    );
  }

  const sectors = getCensusSectors(location);
  return (
    <>
      {sectors.map((s: CensusSector) => (
        <Circle
          key={s.id}
          center={[s.center.lat, s.center.lon]}
          radius={s.radiusKm * 1000}
          pathOptions={{
            color: powerColor(s.purchasingPower),
            weight: 1.5,
            fillColor: powerColor(s.purchasingPower),
            fillOpacity: 0.18,
            dashArray: s.dataQuality === 'estimated' ? '6 6' : undefined,
          }}
        >
          <Popup>
            <div style={{ fontSize: '12px', minWidth: '200px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{s.name}</div>
              <div>Municipio: {s.municipio}</div>
              <div>
                Poder adquisitivo: <strong>{powerLabel(s.purchasingPower)}</strong> ({Math.round(s.purchasingPower * 100)}/100)
              </div>
              {s.povertyRate !== undefined && (
                <div>Hogares pobres: {s.povertyRate}% (SIUBEN/MEPyD)</div>
              )}
              <div style={{ marginTop: '5px', fontSize: '10px', color: '#7a8a99' }}>
                {s.dataQuality === 'sourced'
                  ? 'Cifra directa SIUBEN/MEPyD · Censo ONE 2022'
                  : 'Estimación derivada del estrato ICV municipal (borde punteado)'}
              </div>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
}
