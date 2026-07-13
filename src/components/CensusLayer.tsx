import { Circle, Popup } from 'react-leaflet';
import { getCensusSectors, powerColor, powerLabel } from '../data/census';
import type { CensusSector } from '../data/census';

interface Props {
  location: string;
}

export default function CensusLayer({ location }: Props) {
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
