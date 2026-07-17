import type { BusinessCategory, GridCell } from '../types';
import type { CensusSector } from '../data/census';
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
  const { locationLabel, category, pointAnalysis, topZones, categoryTotals, poiCount } = data;
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

  <div class="pie">
    Generado con el Asesor de Ubicación de Negocios — <a href="${esc(appUrl)}">${esc(appUrl)}</a><br>
    Datos: © OpenStreetMap contributors (ODbL) · Censo ONE 2022 · SIUBEN/MEPyD. El puntaje es un modelo
    aproximado (demanda por anclas ajustada por poder adquisitivo, menos densidad de competencia);
    no sustituye un estudio de mercado formal.
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const w = window.open('', '_blank');
  if (!w) return; // bloqueado por el navegador; el botón se pulsó fuera de un gesto
  w.document.write(html);
  w.document.close();
}
