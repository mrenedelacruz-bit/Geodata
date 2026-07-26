# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev        # Vite dev server → http://localhost:5173/Geodata/
npm run build       # tsc -b && vite build, then copies index.html→404.html and the manual PDF into dist/
npm run lint         # oxlint
npm run preview      # preview the production build
```

There is no test suite configured in this repo. A normal (unrestricted) internet connection is required during development: the app fetches map tiles, Overpass, and Nominatim data live from the browser, with no backend and no API keys.

## Architecture

This is a client-only React + TypeScript + Vite app (no backend) that scores map areas in Dominican Republic cities/provinces for where to locate a given type of business, using live OpenStreetMap data.

**Routing / multi-location**: `RootApp.tsx` creates one route per entry in `src/data/locations.ts` (`LOCATIONS`, keyed by id: `santo-domingo`, `puerto-plata`, `la-altagracia`, `la-vega`, `la-romana`, `san-cristobal`, `santiago`) and renders `App.tsx` with that `location` id as a prop. Each location has a `bbox` and `center`. `App.tsx` re-fetches POIs and resets the analysis state whenever `location` changes.

**Data pipeline** (all in `App.tsx`, triggered on location/category change):
1. `lib/overpass.ts` `fetchOsmPOIs(bbox)` queries the Overpass API (three mirror endpoints tried in order) for amenities/shops/offices/bus stops/residential landuse/travel agencies inside the bbox, slims tags down to `KEEP_TAGS`, and caches the result in localStorage via `lib/osmCache.ts` (12h TTL, stale-serves-on-failure, key includes bbox and a version prefix that must be bumped whenever the Overpass query's tag set changes).
2. `data/manualPois.ts` `mergeManualPois()` merges in hand-curated `manualPois-<location>.ts` entries, dropping any manual entry that OSM now has within 150m of the same kind (`amenity`/`shop` tag match) to avoid double-counting.
3. `lib/grid.ts` `computeGrid()` divides the location's bbox into a grid of `CELL_METERS` (450m) cells. For the selected `BusinessCategory`, each POI is bucketed by cell once (`bucketContributions`), then each cell aggregates over its 3×3 cell neighborhood: competitor count and anchor score (weighted sum of nearby "demand" signals like offices, malls, transit, banks — weights come from `category.anchorWeights`, defaulting to `ANCHOR_SIGNALS` base weights). Score 0–100 = normalized anchor demand, adjusted ±30% by census purchasing power (`data/census.ts`), minus a saturation penalty from normalized competitor density. `saturationLevelOf()` separately buckets each cell as oportunidad/moderado/saturado based on its own competitor-to-anchor ratio.
4. `scoreAtPoint()` (also in `grid.ts`) does the equivalent single-point analysis (fixed 500m radius) used for address search / map-click / "my location" results, independent of the grid.

**Categories and anchors** (`data/categories.ts`): `BUSINESS_CATEGORIES` defines each business type's `matchesCompetitor` predicate (OSM tag matcher) and per-anchor weight overrides. `ANCHOR_SIGNALS` defines the base demand signals (office, mall, university, health, bank, transit, residential, retail) with default weights and matchers. Fuel categories special-case GLP/gas brands (`GLP_BRANDS`, `isGlpStation`) so a station is never double-counted as both "gasolinera" and "estación de gas".

**Census/purchasing power** (`data/census.ts` + one `census-<location>.ts` module per location): each module exports `CENSUS_SECTORS`, `sectorAt()`, and `purchasingPowerAt()`; `census.ts` dispatches to the right module by location id and falls back to Santo Domingo if a location is unknown. Sectors without direct SIUBEN/Censo ONE data are marked `dataQuality: 'estimated'`.

**URL state sync**: `App.tsx` mirrors the current category/point/"my location"/visible-layers state into the URL query string (`?cat=&lat=&lon=&milat=&milon=&capas=`) via `history.replaceState`, so a shared link reproduces the same analysis.

**UI shell**: `Sidebar.tsx` (category picker, search, analysis panels, comparison, print report via `lib/report.ts`) and `MapView.tsx` (Leaflet map: `HeatmapLayer`, `CensusLayer`, `LayerControl`) are the two halves of the `layout` in `App.css`. `LocationSwitcher.tsx` provides the map control for switching between locations.

**Extending the app** — mirrors the README:
- New business category: add an entry to `BUSINESS_CATEGORIES` in `src/data/categories.ts`.
- New demand/anchor signal: add an entry to `ANCHOR_SIGNALS` in the same file.
- New location: add the bbox/center entry to `src/data/locations.ts`, create `census-<id>.ts` and `manualPois-<id>.ts` in `src/data/`, wire them into `census.ts` and `manualPois.ts`'s dispatch maps, and add the branch's route to the deploy workflow (`.github/workflows/deploy-pages.yml`) and the environment's "Deployment branches" list.
- Grid cell size: `CELL_METERS` constant in `src/lib/grid.ts`.

## Deployment

GitHub Pages via `.github/workflows/deploy-pages.yml`. Only pushes to the branches listed in that workflow's `on.push.branches` trigger a deploy (last push wins); new branches must be added both there and to the `github-pages` environment's "Deployment branches" setting.
