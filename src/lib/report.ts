import type { BusinessCategory, GridCell } from '../types';
import { NATIONAL_POVERTY, POVERTY_CONTEXT_2025, icvCategoryOf } from '../data/census';
import type { Census2022, CensusSector, RegionalPoverty } from '../data/census';
import type { MunicipioPop } from '../data/census2022-municipios';
import { powerLabel } from '../data/census';
import { saturationLabel } from './saturation';

interface ReportPointAnalysis {
  label: string;
  point: { lat: number; lon: number };
  score: number | null;
  sector: CensusSector | null;
  competitorCount: number;
  anchorScore: number;
  nearby: { anchor: string; count: number }[];
}

interface ReportData {
  locationLabel: string;
  category: BusinessCategory;
  pointAnalysis: ReportPointAnalysis | null;
  topZones: GridCell[];
  categoryTotals: { category: BusinessCategory; count: number }[];
  poiCount: number;
  census2022: Census2022 | null;
  municipios: MunicipioPop[];
  poverty: RegionalPoverty | null;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Abre una ventana con el reporte formateado para imprimir y lanza el diálogo
 * de impresión del navegador ("Guardar como PDF"). Todo se genera en el
 * cliente — sin librerías extra ni backend.
 */
export function openPrintReport(data: ReportData): void {
  const { locationLabel, category, pointAnalysis, topZones, categoryTotals, poiCount, census2022, municipios, poverty } =
    data;
  const fecha = new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });
  const appUrl = window.location.href;

  const puntoHtml = pointAnalysis
    ? `
  <h2>Punto analizado</h2>
  <table>
    <tr><th>Ubicación</th><td>${esc(pointAnalysis.label)} (${pointAnalysis.point.lat.toFixed(5)}, ${pointAnalysis.point.lon.toFixed(5)})</td></tr>
    ${pointAnalysis.score !== null ? `<tr><th>Score de la zona</th><td><strong>${pointAnalysis.score}</strong> / 100</td></tr>` : ''}
    <tr><th>Demanda (POIs atractivos en 500 m)</th><td>${pointAnalysis.anchorScore.toFixed(1)}</td></tr>
    <tr><th>${esc(category.competitorLabel)} en 500 m</th><td>${pointAnalysis.competitorCount}</td></tr>
    ${
      pointAnalysis.sector
        ? `<tr><th>Sector censal</th><td>${esc(pointAnalysis.sector.name)} · ${esc(pointAnalysis.sector.municipio)}</td></tr>
    <tr><th>Poder adquisitivo</th><td>${esc(powerLabel(pointAnalysis.sector.purchasingPower))}${pointAnalysis.sector.dataQuality === 'estimated' ? ' (estimación por estrato municipal)' : ' (SIUBEN/MEPyD)'}</td></tr>
    <tr><th>Estrato ICV-3 (aprox.)</th><td>${esc(icvCategoryOf(pointAnalysis.sector.purchasingPower).cat)} · ${esc(icvCategoryOf(pointAnalysis.sector.purchasingPower).label)} (cortes oficiales Modelo ICV SIUBEN 3, 2024)</td></tr>
    ${pointAnalysis.sector.povertyRate !== undefined ? `<tr><th>Hogares pobres (SIUBEN)</th><td>${pointAnalysis.sector.povertyRate}%</td></tr>` : ''}`
        : ''
    }
  </table>
  ${
    pointAnalysis.nearby.length
      ? `<p class="mini"><strong>Recursos cercanos:</strong> ${pointAnalysis.nearby
          .slice(0, 6)
          .map((n) => `${esc(n.anchor)} (${n.count})`)
          .join(' · ')}</p>`
      : ''
  }`
    : '';

  const zonasHtml = topZones
    .map(
      (z, i) => `<tr>
      <td>${i + 1}</td>
      <td><strong>${z.score}</strong></td>
      <td>${esc(saturationLabel(z.saturationLevel))}</td>
      <td>${z.center.lat.toFixed(4)}, ${z.center.lon.toFixed(4)}</td>
      <td>${z.competitorCount}</td>
    </tr>`,
    )
    .join('');

  const totalesHtml = [...categoryTotals]
    .sort((a, b) => b.count - a.count)
    .map((t) => `<tr><td>${t.category.icon} ${esc(t.category.label)}</td><td>${t.count.toLocaleString('es-DO')}</td></tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Reporte — ${esc(locationLabel)} · ${esc(category.label)}</title>
<style>
  body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #1f2937; font-size: 12px; line-height: 1.5; margin: 24px; }
  h1 { font-size: 20px; color: #0b5fa5; margin: 0 0 2px; }
  h2 { font-size: 14px; color: #0b5fa5; border-bottom: 2px solid #0ea5e9; padding-bottom: 3px; margin: 22px 0 8px; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 11px; }
  th { background: #f0f9ff; text-align: left; padding: 5px 8px; border: 1px solid #d7e8f5; width: 40%; }
  td { border: 1px solid #d7e8f5; padding: 5px 8px; }
  .lista th { background: #0b5fa5; color: #fff; width: auto; }
  .mini { font-size: 10.5px; color: #4b5563; }
  .pie { margin-top: 26px; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 9.5px; color: #7a8a99; }
  a { color: #0b5fa5; word-break: break-all; }
  @media print { body { margin: 10mm; } }
</style>
</head>
<body>
  <h1>Asesor de Ubicación de Negocios</h1>
  <div class="meta">Reporte de análisis · ${esc(locationLabel)} · ${esc(category.icon)} ${esc(category.label)} · ${fecha}</div>
  <div class="meta">${poiCount.toLocaleString('es-DO')} puntos de interés analizados (OpenStreetMap)</div>
  ${
    census2022
      ? `<div class="meta">Censo ONE 2022 (definitivo): ${census2022.population.toLocaleString('es-DO')} habitantes (${census2022.urbanPct}% urbana, crecimiento ${census2022.growthPct >= 0 ? '+' : ''}${census2022.growthPct}%/año 2010-2022) · ${census2022.hogares.toLocaleString('es-DO')} hogares (${census2022.avgHogar} pers./hogar) · ${census2022.ocupados.toLocaleString('es-DO')} ocupados · ${census2022.empleadores.toLocaleString('es-DO')} empleadores</div>`
      : ''
  }
  ${
    poverty
      ? `<div class="meta">Pobreza monetaria general: ${poverty.povertyPct}% en la región ${esc(poverty.region)} (PIP ONE/MEPyD, 2025) · nacional ${NATIONAL_POVERTY.pct}% (${esc(NATIONAL_POVERTY.period)}, Hacienda y Economía)</div>
  <div class="meta">Contexto nacional 2025 (Boletín Anual de Pobreza Monetaria): pobreza general 17.3% (extrema 2.2%) · línea de pobreza RD$${POVERTY_CONTEXT_2025.lineGeneralRD.toLocaleString('es-DO')}/persona/mes (extrema RD$${POVERTY_CONTEXT_2025.lineExtremaRD.toLocaleString('es-DO')}) · ingreso per cápita RD$${POVERTY_CONTEXT_2025.ingresoPerCapitaRD.toLocaleString('es-DO')}/mes · Gini ${POVERTY_CONTEXT_2025.gini}</div>`
      : ''
  }

  ${puntoHtml}

  <h2>Top 10 zonas recomendadas para ${esc(category.label.toLowerCase())}</h2>
  <table class="lista">
    <tr><th>#</th><th>Score</th><th>Saturación</th><th>Centro de la zona (lat, lon)</th><th>Competidores cerca</th></tr>
    ${zonasHtml}
  </table>

  <h2>Totalizador por tipo de negocio en ${esc(locationLabel)}</h2>
  <table class="lista">
    <tr><th>Categoría</th><th>Establecimientos</th></tr>
    ${totalesHtml}
  </table>

  ${
    municipios.length
      ? `<h2>Población por municipio (Censo ONE 2022, cifras definitivas)</h2>
  <table class="lista">
    <tr><th>Municipio</th><th>Población</th><th>Viviendas ocupadas</th><th>% urbana</th></tr>
    ${municipios
      .map(
        (m) =>
          `<tr><td>${esc(m.name)}</td><td>${m.population.toLocaleString('es-DO')}</td><td>${m.viviendas !== undefined ? m.viviendas.toLocaleString('es-DO') : '—'}</td><td>${m.urbanPct !== undefined ? `${m.urbanPct}%` : '—'}</td></tr>` +
          (m.dms ?? [])
            .map(
              (dm) =>
                `<tr><td style="padding-left:22px;color:#6b7280;">└ ${esc(dm.name)} (DM)</td><td style="color:#6b7280;">${dm.population.toLocaleString('es-DO')}</td><td style="color:#6b7280;">—</td><td style="color:#6b7280;">—</td></tr>`,
            )
            .join(''),
      )
      .join('')}
  </table>
  <p class="mini">Fuente: X Censo Nacional de Población y Vivienda 2022 (ONE) — Cuadros 4 y 7 del Volumen I. La población y las viviendas del municipio incluyen las de sus distritos municipales.</p>`
      : ''
  }

  <div class="pie">
    Generado con el Asesor de Ubicación de Negocios — <a href="${esc(appUrl)}">${esc(appUrl)}</a><br>
    Datos: © OpenStreetMap contributors (ODbL) · Población: X Censo Nacional 2022 (ONE) · Poder adquisitivo:
    estimaciones por estrato ICV municipal (SIUBEN/MEPyD). El puntaje es un modelo aproximado (demanda por
    anclas ajustada por poder adquisitivo, menos densidad de competencia); no sustituye un estudio de mercado formal.
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const w = window.open('', '_blank');
  if (!w) return; // bloqueado por el navegador; el botón se pulsó fuera de un gesto
  w.document.write(html);
  w.document.close();
}
