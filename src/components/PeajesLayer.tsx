import { useEffect, useState } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';

/**
 * Estaciones de peaje RD Vial con su tráfico REAL medido, por año
 * (2021 – jun 2026). El año activo lo elige el usuario en el control de
 * capas; cada estación se dibuja escalada y coloreada por su promedio de
 * vehículos/día en ese año. Coordenadas validadas por el usuario contra el
 * Inventario Vial del MOPC; serie del dataset "Tráfico de las Estaciones de
 * Peaje" (datos.gob.do).
 */

export interface PeajeMapStation {
  n: string;
  c: string;
  lat: number;
  lon: number;
  /** Serie anual: total y promedio diario (2026 = enero-junio). */
  y: Record<string, { t: number; d: number }>;
}

export const PEAJE_YEARS = ['2021', '2022', '2023', '2024', '2025', '2026'];

let cache: Promise<PeajeMapStation[] | null> | null = null;
export function loadPeajes(): Promise<PeajeMapStation[] | null> {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}data/peajes.json`)
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

/** Azul claro (poco flujo) → azul oscuro (corredor cargado): familia propia. */
function volColor(v: number, max: number): string {
  const t = Math.min(1, v / Math.max(1, max));
  return `hsl(215, 75%, ${Math.round(72 - t * 42)}%)`;
}

interface Props {
  year: string;
}

export default function PeajesLayer({ year }: Props) {
  const [stations, setStations] = useState<PeajeMapStation[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPeajes().then((data) => {
      if (!cancelled) setStations(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stations) return null;

  const withData = stations.filter((s) => s.y[year]);
  const max = Math.max(1, ...withData.map((s) => s.y[year].d));

  return (
    <>
      {stations.map((s) => {
        const yd = s.y[year];
        const first = PEAJE_YEARS.find((k) => s.y[k]);
        const growth =
          yd && first && first !== year && s.y[first] ? ((yd.d / s.y[first].d - 1) * 100) : null;
        return (
          <CircleMarker
            key={s.n}
            center={[s.lat, s.lon]}
            radius={yd ? 7 + (yd.d / max) * 15 : 5}
            pathOptions={
              yd
                ? { color: '#ffffff', weight: 1.5, fillColor: volColor(yd.d, max), fillOpacity: 0.9 }
                : { color: '#94a3b8', weight: 1, fillColor: '#cbd5e1', fillOpacity: 0.5, dashArray: '3 3' }
            }
          >
            <Popup>
              <div style={{ fontSize: '12px', minWidth: '230px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>🛂 Peaje {s.n}</div>
                <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '4px' }}>{s.c}</div>
                {yd ? (
                  <div>
                    {year}
                    {year === '2026' ? ' (ene-jun)' : ''}:{' '}
                    <strong>{yd.d.toLocaleString('es-DO')} veh/día</strong>
                    {growth !== null && (
                      <span style={{ color: growth >= 0 ? '#16a34a' : '#dc2626' }}>
                        {' '}
                        ({growth >= 0 ? '+' : ''}
                        {Math.round(growth)}% vs {first})
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#6b7280' }}>Sin operación registrada en {year}</div>
                )}
                <div style={{ marginTop: '4px', fontSize: '11px', lineHeight: 1.6 }}>
                  {PEAJE_YEARS.filter((k) => s.y[k]).map((k) => (
                    <span key={k} style={{ display: 'block', fontWeight: k === year ? 700 : 400 }}>
                      {k}
                      {k === '2026' ? ' (6m)' : ''}: {s.y[k].d.toLocaleString('es-DO')} veh/día
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: '5px', fontSize: '10px', color: '#7a8a99' }}>
                  RD Vial · datos.gob.do · coordenadas validadas (Inventario Vial MOPC)
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
