import { useRef, useState } from 'react';
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
  const [broken, setBroken] = useState(false);
  const loadedAny = useRef(false);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!apiKey) return null;

  function scheduleErrorCheck() {
    // Si en 4s desde el primer error no cargó ningún tile con éxito, algo
    // está mal (key inválida, dominio no autorizado, endpoint incorrecto) —
    // se avisa en pantalla sin depender de herramientas de desarrollador
    // (útil en tablets/celulares donde no hay acceso a la pestaña Network).
    if (errorTimer.current) return;
    errorTimer.current = setTimeout(() => {
      if (!loadedAny.current) setBroken(true);
    }, 4000);
  }

  return (
    <>
      <TileLayer
        url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${apiKey}`}
        attribution='Tráfico: &copy; <a href="https://www.tomtom.com" target="_blank" rel="noreferrer">TomTom</a>'
        opacity={0.95}
        className="tomtom-traffic-tiles"
        eventHandlers={{
          tileload: () => {
            loadedAny.current = true;
            setBroken(false);
          },
          tileerror: scheduleErrorCheck,
        }}
      />
      {broken && (
        <div className="tomtom-error-banner">
          ⚠ No se pudo cargar el tráfico en vivo de TomTom. Verifica que la API key esté activa,
          tenga el producto "Traffic API" habilitado, y que el dominio restringido incluya este sitio.
        </div>
      )}
    </>
  );
}
