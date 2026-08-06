import { useEffect, useState } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';

/**
 * Aforos vehiculares del INTRANT (Gran Santo Domingo, 2017-2019): conteos
 * REALES por intersección con volúmenes por banda horaria. La banda activa
 * la elige el usuario en el control de capas; cada estación se dibuja
 * escalada y coloreada por su volumen en esa banda.
 */

export interface AforoStation {
  id: number;
  n: string;
  f: string | null;
  lat: number;
  lon: number;
  prec: 'via' | 'int';
  pAM: number | null;
  hAM: string | null;
  pPM: number | null;
  hPM: string | null;
  tot: number | null;
  lig: number | null;
  pes: number | null;
  mot: number | null;
  /** Volumen veh/h por banda horaria (clave = hora de inicio, "7".."18"). */
  b: Record<string, number>;
}

/** Bandas disponibles en el dataset (hora de inicio → etiqueta). */
export const AFORO_BANDS: { hour: string; label: string }[] = [
  { hour: '7', label: '7:00 – 8:00 (pico AM)' },
  { hour: '8', label: '8:00 – 9:00' },
  { hour: '9', label: '9:00 – 10:00' },
  { hour: '10', label: '10:00 – 11:00' },
  { hour: '15', label: '15:00 – 16:00' },
  { hour: '16', label: '16:00 – 17:00' },
  { hour: '17', label: '17:00 – 18:00 (pico PM)' },
  { hour: '18', label: '18:00 – 19:00' },
];

let cache: Promise<AforoStation[] | null> | null = null;
export function loadAforos(): Promise<AforoStation[] | null> {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}data/aforos-gsd.json`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((data) => {
        // No cachear el fallo: permite reintentar al volver a activar la capa.
        if (data === null) cache = null;
        return data;
      });
  }
  return cache;
}

/** Escala de volumen: verde (fluido) → ámbar → rojo (cargado), como un semáforo vial. */
function volColor(v: number, max: number): string {
  const t = Math.min(1, v / Math.max(1, max));
  const hue = 120 - t * 120; // 120 verde → 0 rojo
  return `hsl(${hue}, 75%, 42%)`;
}

interface Props {
  location: string;
  hour: string;
}

/**
 * 32 de las 48 estaciones comparten coordenada exacta con otra (geocodificadas
 * al mismo punto de la avenida): sin separación, unos marcadores tapan a otros
 * y quedan inclicables. Se aplica un desplazamiento determinista pequeño
 * (~70 m en círculo) a las estaciones de cada grupo duplicado — solo visual;
 * el popup ya advierte que la coordenada es aproximada sobre la vía.
 */
function spreadDuplicates(stations: AforoStation[]): AforoStation[] {
  const groups = new Map<string, AforoStation[]>();
  for (const s of stations) {
    const key = `${s.lat}_${s.lon}`;
    const g = groups.get(key);
    if (g) g.push(s);
    else groups.set(key, [s]);
  }
  const out: AforoStation[] = [];
  for (const g of groups.values()) {
    if (g.length === 1) {
      out.push(g[0]);
      continue;
    }
    g.forEach((s, i) => {
      const angle = (2 * Math.PI * i) / g.length;
      const rM = 70;
      out.push({
        ...s,
        lat: s.lat + (rM * Math.sin(angle)) / 111_320,
        lon: s.lon + (rM * Math.cos(angle)) / (111_320 * Math.cos((s.lat * Math.PI) / 180)),
      });
    });
  }
  return out;
}

export default function AforosLayer({ location, hour }: Props) {
  const [stations, setStations] = useState<AforoStation[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAforos().then((data) => {
      if (!cancelled) setStations(data ? spreadDuplicates(data) : null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // El dataset del INTRANT cubre el Gran Santo Domingo.
  if (location !== 'santo-domingo' || !stations) return null;

  const withData = stations.filter((s) => s.b[hour] !== undefined);
  const max = Math.max(1, ...withData.map((s) => s.b[hour]));
  const bandLabel = AFORO_BANDS.find((b) => b.hour === hour)?.label ?? hour;

  return (
    <>
      {stations.map((s) => {
        const v = s.b[hour];
        const has = v !== undefined;
        return (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lon]}
            radius={has ? 6 + (v / max) * 14 : 5}
            pathOptions={
              has
                ? { color: '#ffffff', weight: 1.5, fillColor: volColor(v, max), fillOpacity: 0.85 }
                : { color: '#94a3b8', weight: 1, fillColor: '#cbd5e1', fillOpacity: 0.5, dashArray: '3 3' }
            }
          >
            <Popup>
              <div style={{ fontSize: '12px', minWidth: '220px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🚥 {s.n}</div>
                {has ? (
                  <div>
                    Banda {bandLabel}: <strong>{v.toLocaleString('es-DO')} veh/h</strong>
                  </div>
                ) : (
                  <div style={{ color: '#6b7280' }}>Sin conteo en la banda {bandLabel}</div>
                )}
                {s.pAM !== null && (
                  <div>
                    Pico AM: {s.pAM.toLocaleString('es-DO')} veh/h ({s.hAM})
                  </div>
                )}
                {s.pPM !== null && (
                  <div>
                    Pico PM: {s.pPM.toLocaleString('es-DO')} veh/h ({s.hPM})
                  </div>
                )}
                {s.tot !== null && <div>Total del día aforado: {s.tot.toLocaleString('es-DO')} veh</div>}
                {s.lig !== null && (
                  <div style={{ fontSize: '11px', color: '#4b5563' }}>
                    {s.lig}% ligeros · {s.pes}% pesados · {s.mot}% motos
                  </div>
                )}
                <div style={{ marginTop: '5px', fontSize: '10px', color: '#7a8a99' }}>
                  Aforo INTRANT {s.f ? `(${s.f})` : '(2017-2019)'}
                  {s.prec === 'via' && ' · coordenada aproximada sobre la vía'}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
