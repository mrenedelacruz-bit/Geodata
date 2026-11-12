# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

## Comandos

```bash
npm install
npm run dev        # Vite dev server → http://localhost:5173/Geodata/
npm run build      # tsc -b && vite build; postbuild copia index.html→404.html por ubicación y el PDF del manual a dist/
npm run lint       # eslint (flat config: typescript-eslint + react-hooks)
npx tsc --noEmit   # typecheck suelto
```

No hay suite de tests. La app es 100% cliente (sin backend ni claves de API): en el navegador consume tiles de OSM, Overpass y Nominatim en vivo, más los JSON estáticos de `public/data/`.

## Reglas del proyecto (instrucciones permanentes del usuario)

- **Manual**: con CADA cambio de la app, actualizar `docs/manual.html` (bump de versión en los 2 strings: `<div><strong>Versión:</strong> X.Y</div>` y `Manual de Usuario vX.Y`) y regenerar `docs/Manual-Asesor-de-Ubicacion.pdf` con Chromium headless `--print-to-pdf`.
- **Ramas**: sincronizar siempre las 3 ramas en este orden (ff-only): `claude/business-location-advisor-la-altagracia` → `main` → `claude/business-location-advisor-sd-30qgqk`. Deploy de GitHub Pages dispara desde `main`.
- **Monitoreo**: tras el push, vigilar el workflow de Pages hasta verde (la concurrencia "pages" cancela runs intermedios; eso es normal).
- **No inventar datos**: contactos, cifras y coordenadas solo de fuentes reales (OSM, archivos oficiales subidos por el usuario). Si falta un dato, se omite o se pide el archivo.

## Arquitectura

React 19 + TypeScript + Vite, `react-leaflet` (basename `/Geodata/`). `RootApp.tsx` crea una ruta por entrada de `src/data/locations.ts` (7: santo-domingo, puerto-plata, la-altagracia, la-vega, la-romana, san-cristobal, santiago) y un catch-all que redirige a `/santo-domingo` preservando el query string.

**Pipeline por ubicación/rubro** (orquestado en `App.tsx`):
1. `lib/overpass.ts` — POIs de OSM (3 mirrors, caché localStorage vía `lib/osmCache.ts`, clave versionada `osm_pois_v4`; subir la versión al cambiar `KEEP_TAGS` o la query).
2. `data/manualPois.ts` — POIs curados a mano, con dedup de 150 m contra OSM.
3. `data/escuelas.ts` — 3,207 centros MINERD (`public/data/escuelas/*.json`) como POIs sintéticos (id negativo, tag `matricula`); dedup 120 m contra escuelas OSM. `lib/grid.ts` escala su ancla por `sqrt(matrícula/400)` acotado a [0.4, 3].
4. `lib/grid.ts` — malla de 450 m; demanda por anclas (`ANCHOR_SIGNALS` en `data/categories.ts`, 20 rubros) ± nivel socioeconómico, menos penalización por saturación. `cellAt` es O(1) aritmético.
5. `lib/barrios.ts` — clasificación socioeconómica por barrio (polígonos SIUBEN/ICV en `public/data/barrios/*.json`). El orden de evaluación es sagrado: ALTO_OVERRIDES → sin dato → MEDIO_OVERRIDES → élite automática → pobreza → popular (incl. POPULAR_OVERRIDES y MUNI_INGRESO_BAJO) → medio. **Los overrides son ground truth del usuario: nunca quitarlos ni "corregirlos".**
6. `lib/market.ts` — análisis de mercado: radio de captación por minutos (a pie/vehículo), demanda proyectada (Censo 2022 + calibración SIUBEN + `SPEND_SHARE` por rubro), modelo Huff de captación, canibalización A/B/C y saturación vs promedio provincial.
7. `lib/roads.ts` — exposición vehicular por cercanía a la jerarquía vial OSM (caché `osm_roads_v1`).

**Capas de datos oficiales** (todas con patrón "no cachear fallos": si el fetch devuelve null se borra la entrada para permitir reintento):
- `components/AforosLayer.tsx` — 48 aforos INTRANT del Gran Santo Domingo con 8 bandas horarias (selector `hora=`); coordenadas duplicadas se separan ~70 m determinísticamente.
- `components/PeajesLayer.tsx` — 18 estaciones de peaje RD Vial con serie anual (selector `anio=`).
- `components/CensusLayer.tsx` — polígonos de barrios coloreados por clase.

**Datos de referencia** en `src/data/`: `dgii.ts` (totales RNC país por rubro, corte ago 2026), `peajes.ts` (metadatos estaciones), `census.ts` (+ `census-<id>.ts` por ubicación, fallback de poder adquisitivo cuando el punto cae fuera de todo barrio).

**Estado en URL**: `?cat=&lat=&lon=&milat=&milon=&obj=&capas=&hora=&anio=` vía `history.replaceState` — un link compartido reproduce el análisis.

**UI**: `Sidebar.tsx` (análisis, comparador A/B/C, totalizador, reporte imprimible vía `lib/report.ts`) + `MapView.tsx` (mapa, anillos de captación, popups de competidores con teléfono/web solo si existen en OSM).

## Extender

- Rubro nuevo: entrada en `BUSINESS_CATEGORIES` (`src/data/categories.ts`) + su `SPEND_SHARE` en `lib/market.ts` + total RNC en `data/dgii.ts` si existe.
- Ubicación nueva: `locations.ts`, `census-<id>.ts`, `manualPois-<id>.ts`, JSON de barrios y escuelas en `public/data/`, y la ruta en el workflow de Pages.
- Dato oficial nuevo: JSON estático en `public/data/` + loader con caché-que-no-guarda-fallos + capa/selector si aplica.
