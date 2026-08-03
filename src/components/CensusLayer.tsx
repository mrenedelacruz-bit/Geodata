import { useEffect, useState } from 'react';
import { Circle, Polygon, Popup } from 'react-leaflet';
import { getCensusSectors, powerColor, powerLabel } from '../data/census';
import { loadBarrios, classifyBarrio } from '../lib/barrios';
import type { BarrioFeature } from '../lib/barrios';
import type { CensusSector } from '../data/census';

interface Props {
  location: string;
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

// La clasificación (con su corrección del sesgo del registro SIUBEN) vive en
// lib/barrios.ts (classifyBarrio) para que capa, score y paneles coincidan.

export default function CensusLayer({ location }: Props) {
  const official = OFFICIAL_BARRIOS.has(location);
  const [barrios, setBarrios] = useState<BarrioFeature[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!official) {
      setBarrios(null);
      return;
    }
    let cancelled = false;
    setBarrios(null);
    setFailed(false);
    loadBarrios(location).then((idx) => {
      if (cancelled) return;
      if (idx) setBarrios(idx.list);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [location, official]);

  // Mientras cargan los barrios oficiales no se pinta nada (evita el parpadeo
  // de los círculos aproximados); estos quedan solo como respaldo si falla la red.
  if (official && !barrios && !failed) return null;

  if (official && barrios) {
    return (
      <>
        {barrios.map((b, i) => {
          const cat = classifyBarrio(b);
          return (
            <Polygon
              key={i}
              // LatLng[][][]: cada anillo es un polígono independiente (multiparte),
              // no un agujero — Leaflet interpreta LatLng[][] como exterior+agujeros.
              positions={b.r.map((ring) => [ring])}
              pathOptions={{
                color: '#475569',
                weight: 0.4,
                opacity: 0.5,
                fillColor: cat.color,
                fillOpacity: 0.35,
              }}
            >
              <Popup>
                <div style={{ fontSize: '12px', minWidth: '200px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{b.n}</div>
                  <div>Municipio: {b.m}</div>
                  <div>
                    Categoría: <strong style={{ color: cat.color }}>{cat.label}</strong>
                  </div>
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
          );
        })}
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
