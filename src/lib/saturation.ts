import type { SaturationLevel } from '../types';

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
