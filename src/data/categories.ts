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
  },
  {
    id: 'cafeteria',
    label: 'Cafetería',
    icon: '☕',
    competitorLabel: 'Cafeterías',
    matchesCompetitor: (t) => has(t, 'amenity', ['cafe']),
  },
  {
    id: 'farmacia',
    label: 'Farmacia',
    icon: '💊',
    competitorLabel: 'Farmacias',
    matchesCompetitor: (t) => has(t, 'amenity', ['pharmacy']),
  },
  {
    id: 'supermercado',
    label: 'Supermercado / Colmado',
    icon: '🛒',
    competitorLabel: 'Supermercados y colmados',
    matchesCompetitor: (t) => has(t, 'shop', ['supermarket', 'convenience', 'grocery']),
  },
  {
    id: 'salon_belleza',
    label: 'Salón de belleza / Barbería',
    icon: '💈',
    competitorLabel: 'Salones y barberías',
    matchesCompetitor: (t) => has(t, 'shop', ['hairdresser', 'beauty']),
  },
  {
    id: 'gimnasio',
    label: 'Gimnasio',
    icon: '🏋️',
    competitorLabel: 'Gimnasios',
    matchesCompetitor: (t) => has(t, 'leisure', ['fitness_centre']),
  },
  {
    id: 'ferreteria',
    label: 'Ferretería',
    icon: '🔧',
    competitorLabel: 'Ferreterías',
    matchesCompetitor: (t) => has(t, 'shop', ['hardware', 'doityourself']),
  },
  {
    id: 'panaderia',
    label: 'Panadería / Repostería',
    icon: '🥖',
    competitorLabel: 'Panaderías y reposterías',
    matchesCompetitor: (t) => has(t, 'shop', ['bakery', 'pastry', 'confectionery']),
  },
  {
    id: 'lavanderia',
    label: 'Lavandería',
    icon: '🧺',
    competitorLabel: 'Lavanderías',
    matchesCompetitor: (t) => has(t, 'shop', ['laundry', 'dry_cleaning']),
  },
  {
    id: 'clinica_dental',
    label: 'Clínica dental',
    icon: '🦷',
    competitorLabel: 'Clínicas dentales',
    matchesCompetitor: (t) => has(t, 'amenity', ['dentist']),
  },
  {
    id: 'gasolinera',
    label: 'Estación de combustibles',
    icon: '⛽',
    competitorLabel: 'Estaciones de combustibles',
    matchesCompetitor: (t) => has(t, 'amenity', ['fuel']),
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
