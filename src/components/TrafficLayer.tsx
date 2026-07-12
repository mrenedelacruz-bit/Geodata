import { useMemo } from 'react';
import { Polyline, Popup } from 'react-leaflet';
import type { TrafficWay } from '../lib/traffic';
import { getHighwayStyle } from '../lib/traffic';

interface Props {
  ways: TrafficWay[];
}

export default function TrafficLayer({ ways }: Props) {
  const polylines = useMemo(
    () =>
      ways.map((way) => (
        <Polyline
          key={way.id}
          positions={way.coords.map((c) => [c.lat, c.lon]) as [number, number][]}
          pathOptions={getHighwayStyle(way.tags)}
        >
          <Popup>
            <div style={{ fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {way.tags.name || way.tags.highway}
              </div>
              <div>Tipo: {way.tags.highway}</div>
            </div>
          </Popup>
        </Polyline>
      )),
    [ways]
  );

  return <>{polylines}</>;
}
