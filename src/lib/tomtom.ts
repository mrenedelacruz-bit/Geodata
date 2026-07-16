/**
 * Key de TomTom inyectada en tiempo de build vía la variable de entorno
 * VITE_TOMTOM_API_KEY (ver .env.example). En producción se inyecta desde el
 * secreto de GitHub Actions TOMTOM_API_KEY (deploy-pages.yml); en local,
 * desde un .env.local que el usuario crea (nunca comiteado).
 *
 * La key queda restringida por dominio (HTTP referrer) del lado de TomTom —
 * necesario porque esta app es sin backend y el bundle es público.
 */
export function getTomTomApiKey(): string | undefined {
  const key = import.meta.env.VITE_TOMTOM_API_KEY;
  return key && key.length > 0 ? key : undefined;
}
