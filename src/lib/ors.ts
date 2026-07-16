/**
 * Key de OpenRouteService inyectada en tiempo de build vía la variable de
 * entorno VITE_ORS_API_KEY (ver .env.example). En producción se inyecta
 * desde el secreto de GitHub Actions ORS_API_KEY (deploy-pages.yml); en
 * local, desde un .env.local que el usuario crea (nunca comiteado).
 *
 * A diferencia de TomTom, OpenRouteService no ofrece restricción de key por
 * dominio (HTTP referrer) — la key queda expuesta en el bundle sin
 * mitigación posible en una app sin backend. El riesgo se acepta porque el
 * plan gratuito solo bloquea temporalmente al agotar la cuota diaria, sin
 * cargos ni facturación.
 */
export function getOrsApiKey(): string | undefined {
  const key = import.meta.env.VITE_ORS_API_KEY;
  return key && key.length > 0 ? key : undefined;
}
