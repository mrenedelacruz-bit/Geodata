import type { AnchorSignal, BusinessCategory } from '../types';

const has = (tags: Record<string, string>, key: string, values?: string[]) => {
  const v = tags[key];
  if (v === undefined) return false;
  if (!values) return true;
  return values.includes(v);
};

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: 'restaurante',
    label: 'Restaurante',
    icon: '🍽️',
    competitorLabel: 'Restaurantes',
    matchesCompetitor: (t) => has(t, 'amenity', ['restaurant', 'fast_food']),
    anchorWeights: {
      office: 1.2,
      mall: 2.5,
      university: 1.5,
      health: 0.5,
      bank: 0.8,
      transit: 2.0,
      residential: 1.8,
      retail: 1.0,
    },
  },
  {
    id: 'cafeteria',
    label: 'Cafetería',
    icon: '☕',
    competitorLabel: 'Cafeterías',
    matchesCompetitor: (t) => has(t, 'amenity', ['cafe']),
    anchorWeights: {
      office: 2.0,
      mall: 1.8,
      university: 1.8,
      health: 0.4,
      bank: 1.0,
      transit: 2.2,
      residential: 1.5,
      retail: 0.8,
    },
  },
  {
    id: 'farmacia',
    label: 'Farmacia',
    icon: '💊',
    competitorLabel: 'Farmacias',
    matchesCompetitor: (t) => has(t, 'amenity', ['pharmacy']),
    anchorWeights: {
      office: 1.0,
      mall: 1.5,
      university: 0.8,
      health: 2.0,
      bank: 0.6,
      transit: 1.8,
      residential: 2.2,
      retail: 1.0,
    },
  },
  {
    id: 'supermercado',
    label: 'Supermercado / Colmado',
    icon: '🛒',
    competitorLabel: 'Supermercados y colmados',
    matchesCompetitor: (t) => has(t, 'shop', ['supermarket', 'convenience', 'grocery']),
    anchorWeights: {
      office: 0.8,
      mall: 1.2,
      university: 0.8,
      health: 0.6,
      bank: 0.6,
      transit: 1.5,
      residential: 2.5,
      retail: 1.2,
    },
  },
  {
    id: 'salon_belleza',
    label: 'Salón de belleza / Barbería',
    icon: '💈',
    competitorLabel: 'Salones y barberías',
    matchesCompetitor: (t) => has(t, 'shop', ['hairdresser', 'beauty']),
    anchorWeights: {
      office: 1.2,
      mall: 2.0,
      university: 1.2,
      health: 0.4,
      bank: 0.8,
      transit: 1.5,
      residential: 1.8,
      retail: 1.0,
    },
  },
  {
    id: 'gimnasio',
    label: 'Gimnasio',
    icon: '🏋️',
    competitorLabel: 'Gimnasios',
    matchesCompetitor: (t) => has(t, 'leisure', ['fitness_centre']),
    anchorWeights: {
      office: 1.5,
      mall: 1.8,
      university: 2.0,
      health: 0.6,
      bank: 0.6,
      transit: 1.5,
      residential: 2.0,
      retail: 0.8,
    },
  },
  {
    id: 'ferreteria',
    label: 'Ferretería',
    icon: '🔧',
    competitorLabel: 'Ferreterías',
    matchesCompetitor: (t) => has(t, 'shop', ['hardware', 'doityourself']),
    anchorWeights: {
      office: 0.8,
      mall: 1.0,
      university: 0.6,
      health: 0.3,
      bank: 0.4,
      transit: 1.2,
      residential: 2.5,
      retail: 1.0,
    },
  },
  {
    id: 'panaderia',
    label: 'Panadería / Repostería',
    icon: '🥖',
    competitorLabel: 'Panaderías y reposterías',
    matchesCompetitor: (t) => has(t, 'shop', ['bakery', 'pastry', 'confectionery']),
    anchorWeights: {
      office: 0.8,
      mall: 1.5,
      university: 1.0,
      health: 0.4,
      bank: 0.6,
      transit: 2.0,
      residential: 2.3,
      retail: 1.0,
    },
  },
  {
    id: 'lavanderia',
    label: 'Lavandería',
    icon: '🧺',
    competitorLabel: 'Lavanderías',
    matchesCompetitor: (t) => has(t, 'shop', ['laundry', 'dry_cleaning']),
    anchorWeights: {
      office: 1.0,
      mall: 1.2,
      university: 0.8,
      health: 0.4,
      bank: 0.5,
      transit: 1.8,
      residential: 2.4,
      retail: 0.8,
    },
  },
  {
    id: 'clinica_dental',
    label: 'Clínica dental',
    icon: '🦷',
    competitorLabel: 'Clínicas dentales',
    matchesCompetitor: (t) => has(t, 'amenity', ['dentist']),
    anchorWeights: {
      office: 1.5,
      mall: 1.2,
      university: 1.0,
      health: 1.8,
      bank: 0.8,
      transit: 1.5,
      residential: 1.8,
      retail: 0.8,
    },
  },
  {
    id: 'gasolinera',
    label: 'Estación de combustibles',
    icon: '⛽',
    competitorLabel: 'Estaciones de combustibles',
    matchesCompetitor: (t) => has(t, 'amenity', ['fuel']),
    anchorWeights: {
      office: 1.5,
      mall: 1.0,
      university: 0.6,
      health: 0.4,
      bank: 0.8,
      transit: 3.0,
      residential: 1.8,
      retail: 0.8,
    },
  },
  {
    id: 'estacion_gas',
    label: 'Estación de Gas / GLP',
    icon: '🛢️',
    competitorLabel: 'Estaciones de Gas/GLP',
    matchesCompetitor: (t) => {
      const name = (t.name || '').toLowerCase();
      return (
        (has(t, 'amenity', ['fuel']) && has(t, 'fuel:lpg', ['yes'])) ||
        has(t, 'shop', ['gas']) ||
        name.includes('tropigas') ||
        name.includes('propagas') ||
        name.includes('gasval') ||
        name.includes('comatgas') ||
        name.includes('agagas') ||
        (has(t, 'amenity', ['fuel']) && (name.includes('gas') || name.includes('glp') || name.includes('planta')))
      );
    },
    anchorWeights: {
      office: 1.2,
      mall: 0.8,
      university: 0.5,
      health: 0.3,
      bank: 0.6,
      transit: 2.8,
      residential: 2.0,
      retail: 0.6,
    },
  },
];

export const ANCHOR_SIGNALS: AnchorSignal[] = [
  { id: 'office', label: 'Oficinas', weight: 1.0, matches: (t) => has(t, 'office') },
  { id: 'mall', label: 'Centros comerciales', weight: 2.0, matches: (t) => has(t, 'shop', ['mall', 'department_store']) },
  { id: 'university', label: 'Universidades / colegios', weight: 1.3, matches: (t) => has(t, 'amenity', ['university', 'college', 'school']) },
  { id: 'health', label: 'Hospitales / clínicas', weight: 1.0, matches: (t) => has(t, 'amenity', ['hospital', 'clinic']) },
  { id: 'bank', label: 'Bancos', weight: 1.0, matches: (t) => has(t, 'amenity', ['bank']) },
  { id: 'transit', label: 'Paradas de transporte', weight: 1.4, matches: (t) => has(t, 'highway', ['bus_stop']) },
  { id: 'residential', label: 'Zonas residenciales', weight: 1.2, matches: (t) => has(t, 'landuse', ['residential']) },
  { id: 'retail', label: 'Actividad comercial general', weight: 0.6, matches: (t) => has(t, 'shop') },
];
