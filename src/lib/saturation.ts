import type { SaturationLevel } from '../types';

/**
 * Color del score 0-100: rojo (saturado/bajo) → verde (oportunidad/alto).
 * Única definición para mapa, pills del panel y reporte.
 */
export function scoreColor(score: number): string {
  const hue = Math.max(0, Math.min(120, (score / 100) * 120));
  return `hsl(${hue}, 70%, 45%)`;
}

export function saturationLabel(level: SaturationLevel): string {
  switch (level) {
    case 'oportunidad':
      return 'Oportunidad';
    case 'moderado':
      return 'Moderado';
    case 'saturado':
      return 'Saturado';
  }
}

export function saturationColor(level: SaturationLevel): string {
  switch (level) {
    case 'oportunidad':
      return '#16a34a';
    case 'moderado':
      return '#eab308';
    case 'saturado':
      return '#dc2626';
  }
}
