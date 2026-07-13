# Asesor de Ubicación — Santo Domingo

App interactiva para ayudar a decidir dónde ubicar un negocio en el Gran Santo Domingo, República
Dominicana, combinando geodata abierta: POIs de OpenStreetMap, geocodificación y un modelo simple
de puntuación por competencia/demanda sobre una cuadrícula del área metropolitana.

## Cómo funciona

- **Datos en vivo desde el navegador**: al abrir la app, se consulta la API de Overpass
  (OpenStreetMap) para traer comercios, oficinas, bancos, universidades, centros de salud, paradas
  de transporte y zonas residenciales dentro del área de Santo Domingo. No hay backend ni claves de
  API que configurar.
- **Cuadrícula de puntuación**: el mapa se divide en celdas de ~450 m. Para el tipo de negocio
  elegido, cada celda recibe un puntaje 0–100 = demanda cercana (anclas ponderadas: oficinas,
  malls, universidades, bancos, transporte, zonas residenciales) menos saturación de competidores
  del mismo rubro.
- **Búsqueda de direcciones**: usa Nominatim (OpenStreetMap) para geocodificar y saltar a un punto
  exacto, mostrando el desglose de competencia/demanda en un radio de 500 m.
- **Clic en el mapa**: analiza cualquier punto igual que la búsqueda por dirección.

## Correr localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Se necesita conexión normal a internet (sin restricciones de red)
para que carguen los tiles del mapa, Overpass y Nominatim.

## Datos y limitaciones

- Fuente de POIs y anclas: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
  (licencia ODbL). La cobertura depende de qué tan mapeada esté cada zona en OSM.
- **Demografía/censo**: no existe una API pública sencilla para el Censo 2022 de la ONE, así que la
  app usa como *proxy* la densidad de zonas residenciales (`landuse=residential`) de OSM. Si tienes
  cifras oficiales de la ONE por sector/barrio, puedes:
  1. Añadir un archivo `public/data/censo-one.json` con población por sector.
  2. Ponderar `src/lib/grid.ts` (`computeGrid`) para usar esos datos en vez del proxy de OSM.
- El puntaje es un modelo aproximado orientativo, no un estudio de mercado ni de factibilidad.

## Extender

- **Nuevas categorías de negocio**: agrega entradas en `src/data/categories.ts`
  (`BUSINESS_CATEGORIES`), con un predicado que identifique competidores por sus tags OSM.
- **Nuevas señales de demanda/accesibilidad**: agrega entradas en `ANCHOR_SIGNALS` (mismo archivo).
- **Cambiar el área cubierta**: ajusta `SANTO_DOMINGO_BBOX` en `src/lib/grid.ts`.
- **Tamaño de celda**: constante `CELL_METERS` en `src/lib/grid.ts`.

## Stack

React + TypeScript + Vite, Leaflet / react-leaflet para el mapa, Overpass API y Nominatim para los
datos geoespaciales.
# Deployment trigger
