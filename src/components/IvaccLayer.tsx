import { Polygon, Popup } from 'react-leaflet';
import { MUNICIPIO_BOUNDARIES } from '../data/municipio-boundaries';
import { municipiosFor } from '../data/census2022-municipios';

interface Props {
  location: string;
}

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(.*\)/g, '')
    .trim();
}

/** Nombres de frontera (DES_MUNI) que difieren del nombre en census2022-municipios. */
const ALIASES: Record<string, string> = {
  'santo domingo de guzman': 'distrito nacional',
  'santiago': 'santiago de los caballeros',
  'la vega': 'concepcion de la vega',
  'bisono': 'bisono',
  'cambita garavitos': 'cambita garabitos',
};

/** Ámbar claro (riesgo bajo) → ámbar/rojo oscuro (riesgo alto). Escala 0-65%. */
function riskColor(pct: number): string {
  const t = Math.max(0, Math.min(1, pct / 65));
  const l = 82 - t * 47; // 82% → 35%
  return `hsl(${32 - t * 12}, 88%, ${Math.round(l)}%)`;
}

export default function IvaccLayer({ location }: Props) {
  const boundaries = MUNICIPIO_BOUNDARIES[location] ?? [];
  const municipios = municipiosFor(location);
  const byName = new Map(municipios.map((m) => [norm(m.name), m]));

  return (
    <>
      {boundaries.map((mun) => {
        const key = norm(mun.name);
        const data = byName.get(ALIASES[key] ?? key) ?? [...byName.values()].find((m) => norm(m.name).includes(key));
        const pct = data?.ivaccHighPct;
        if (pct === undefined) return null;
        return mun.rings.map((ring, i) => (
          <Polygon
            key={`ivacc_${mun.name}_${i}`}
            positions={ring}
            pathOptions={{
              color: '#92400e',
              weight: 0.6,
              opacity: 0.5,
              fillColor: riskColor(pct),
              fillOpacity: 0.4,
            }}
          >
            <Popup>
              <div style={{ fontSize: '12px', minWidth: '190px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🌀 {mun.name}</div>
                <div>
                  Hogares con vulnerabilidad climática alta: <strong>{pct}%</strong>
                </div>
                <div style={{ marginTop: '5px', fontSize: '10px', color: '#7a8a99' }}>
                  IVACC · SIUBEN Open Data (huracanes, inundaciones)
                </div>
              </div>
            </Popup>
          </Polygon>
        ));
      })}
    </>
  );
}
