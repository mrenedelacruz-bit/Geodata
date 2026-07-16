# Asesor de Ubicación de Negocios — República Dominicana

App interactiva para ayudar a decidir dónde ubicar un negocio en el **Gran Santo Domingo**, la
**Provincia de Puerto Plata** o la **Provincia de La Altagracia**, combinando geodata abierta: POIs
de OpenStreetMap, datos socioeconómicos (Censo ONE 2022 / SIUBEN) y un modelo de puntuación por
competencia/demanda sobre una cuadrícula del área.

📖 **Manual de usuario**: [docs/Manual-Asesor-de-Ubicacion.pdf](docs/Manual-Asesor-de-Ubicacion.pdf)
(fuente editable en [docs/manual.html](docs/manual.html)).

## Cómo funciona

- **Tres ubicaciones**: rutas `/santo-domingo`, `/puerto-plata` y `/la-altagracia`, con un selector
  en el mapa para cambiar entre ellas. Cada una tiene su propia área de análisis, sectores censales
  y establecimientos verificados manualmente.
- **Datos en vivo desde el navegador**: al abrir la app, se consulta la API de Overpass
  (OpenStreetMap) para traer comercios, oficinas, bancos, universidades, centros de salud, paradas
  de transporte y zonas residenciales dentro del área activa. No hay backend ni claves de API que
  configurar. Los datos se cachean 12 h en localStorage, con respaldo a la copia vencida si
  Overpass falla (rate limit 429, etc.).
- **Cuadrícula de puntuación**: el mapa se divide en celdas de ~450 m. Para el tipo de negocio
  elegido, cada celda recibe un puntaje 0–100 = demanda cercana (anclas ponderadas: oficinas,
  malls, universidades, bancos, transporte, zonas residenciales) × poder adquisitivo del sector
  censal, menos saturación de competidores del mismo rubro.
- **Búsqueda de direcciones**: usa Nominatim (OpenStreetMap) para geocodificar dentro de la ciudad
  activa y saltar a un punto exacto, mostrando el desglose de competencia/demanda en un radio de
  500 m.
- **Clic en el mapa**: analiza cualquier punto igual que la búsqueda por dirección.
- **Comparación de zonas**: hasta 2 zonas del Top 10 lado a lado, resaltadas en el mapa.
- **Totalizador por tipo de negocio**: conteo de establecimientos de cada rubro en toda la ciudad.

## Correr localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/Geodata/`. Se necesita conexión normal a internet (sin restricciones de
red) para que carguen los tiles del mapa, Overpass y Nominatim.

## Datos y limitaciones

- Fuente de POIs y anclas: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
  (licencia ODbL). La cobertura depende de qué tan mapeada esté cada zona en OSM. Los negocios
  reales que aún no están en OSM pueden añadirse a mano en `src/data/manualPois-<ubicación>.ts`
  (con guarda anti-duplicados de 150 m si OSM los mapea después).
- **Demografía/censo**: índice de poder adquisitivo 0–1 por sector censal derivado del estrato ICV
  (SIUBEN/MEPyD) y el Censo ONE 2022, en `src/data/census-<ubicación>.ts`. Los sectores sin cifra
  directa usan estimaciones del estrato municipal (marcadas `estimated`).
- **Tráfico en vivo / isócronas**: se probaron TomTom y OpenRouteService y se descartaron por falta
  de cobertura útil para República Dominicana (detalle en el manual, sección 5).
- El puntaje es un modelo aproximado orientativo, no un estudio de mercado ni de factibilidad.

## Extender

- **Nuevas categorías de negocio**: agrega entradas en `src/data/categories.ts`
  (`BUSINESS_CATEGORIES`), con un predicado que identifique competidores por sus tags OSM.
- **Nuevas señales de demanda/accesibilidad**: agrega entradas en `ANCHOR_SIGNALS` (mismo archivo).
- **Nueva ubicación**: agrega la entrada en `src/data/locations.ts` (bbox + centro), crea
  `census-<id>.ts` y `manualPois-<id>.ts` en `src/data/`, conéctalos en `census.ts` y
  `manualPois.ts`, y añade la ruta en `src/RootApp.tsx` y el enlace en
  `src/components/LocationSwitcher.tsx`.
- **Tamaño de celda**: constante `CELL_METERS` en `src/lib/grid.ts`.

## Despliegue

GitHub Pages vía `.github/workflows/deploy-pages.yml`: cada push a las ramas listadas en el
workflow publica el sitio (el último push gana). Las ramas nuevas deben añadirse tanto al workflow
como a las "Deployment branches" del environment `github-pages` en Settings.

## Stack

React + TypeScript + Vite, Leaflet / react-leaflet para el mapa, Overpass API y Nominatim para los
datos geoespaciales.
