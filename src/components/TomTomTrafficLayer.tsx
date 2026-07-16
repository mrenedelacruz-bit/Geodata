import { TileLayer } from 'react-leaflet';
import { getTomTomApiKey } from '../lib/tomtom';

/**
 * Capa raster de flujo de tráfico en vivo (TomTom Traffic Flow API).
 * Verde = flujo libre, amarillo = moderado, rojo = congestionado.
 * Se superpone al mapa base; no requiere ninguna llamada adicional por POI,
 * es un tile layer igual que el mapa base de OpenStreetMap.
 */
export default function TomTomTrafficLayer() {
  const apiKey = getTomTomApiKey();
  if (!apiKey) return null;

  return (
    <TileLayer
      url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${apiKey}`}
      attribution='Tráfico: &copy; <a href="https://www.tomtom.com" target="_blank" rel="noreferrer">TomTom</a>'
      opacity={0.95}
      className="tomtom-traffic-tiles"
    />
  );
}
