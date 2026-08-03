/**
 * Población por municipio — X Censo Nacional de Población y Vivienda 2022,
 * Cuadro 4 del Volumen I (ONE): "Población por sexo, según provincia,
 * municipio y distrito municipal de residencia". Cifras definitivas.
 *
 * Cada municipio incluye sus distritos municipales (DM) de 10,000+ habitantes
 * (más excepciones de interés comercial, p. ej. Bayahíbe). La población del
 * municipio ya incluye la de sus DM.
 */

export interface MunicipioPop {
  name: string;
  population: number;
  dms?: { name: string; population: number }[];
}

const MUNICIPIOS_2022: Record<string, MunicipioPop[]> = {
  'santo-domingo': [
    { name: 'Distrito Nacional (Sto. Dgo. de Guzmán)', population: 1_029_110 },
    {
      name: 'Santo Domingo Este',
      population: 1_029_117,
      dms: [{ name: 'San Luis', population: 67_273 }],
    },
    {
      name: 'Santo Domingo Norte',
      population: 674_274,
      dms: [{ name: 'La Victoria', population: 86_013 }],
    },
    { name: 'Santo Domingo Oeste', population: 410_578 },
    {
      name: 'Los Alcarrizos',
      population: 336_307,
      dms: [
        { name: 'Pantoja', population: 61_564 },
        { name: 'Palmarejo-Villa Linda', population: 19_567 },
      ],
    },
    {
      name: 'Boca Chica',
      population: 167_040,
      dms: [{ name: 'La Caleta', population: 84_310 }],
    },
    {
      name: 'Pedro Brand',
      population: 92_973,
      dms: [
        { name: 'La Guáyiga', population: 42_151 },
        { name: 'La Cuaba', population: 11_768 },
      ],
    },
    { name: 'San Antonio de Guerra', population: 59_299 },
  ],
  'puerto-plata': [
    { name: 'Puerto Plata', population: 162_093 },
    {
      name: 'Sosúa',
      population: 56_982,
      dms: [{ name: 'Cabarete', population: 16_148 }],
    },
    { name: 'Imbert', population: 22_925 },
    { name: 'Villa Montellano', population: 20_753 },
    { name: 'Villa Isabela', population: 20_278 },
    { name: 'Altamira', population: 17_676 },
    { name: 'Luperón', population: 17_577 },
    { name: 'Los Hidalgos', population: 13_605 },
    { name: 'Guananico', population: 6_466 },
  ],
  'la-altagracia': [
    {
      name: 'Higüey',
      population: 415_084,
      dms: [
        { name: 'Verón Punta Cana', population: 138_919 },
        { name: 'La Otra Banda', population: 31_858 },
        { name: 'Las Lagunas de Nisibón', population: 10_074 },
      ],
    },
    {
      name: 'San Rafael del Yuma',
      population: 30_976,
      dms: [{ name: 'Bayahíbe', population: 5_618 }],
    },
  ],
  'san-cristobal': [
    {
      name: 'San Cristóbal',
      population: 277_793,
      dms: [
        { name: 'Hatillo', population: 33_256 },
        { name: 'Hato Damas', population: 15_557 },
      ],
    },
    {
      name: 'Bajos de Haina',
      population: 159_888,
      dms: [
        { name: 'El Carril', population: 33_758 },
        { name: 'Quita Sueño', population: 25_603 },
      ],
    },
    {
      name: 'Villa Altagracia',
      population: 97_620,
      dms: [
        { name: 'San José del Puerto', population: 17_940 },
        { name: 'La Cuchilla', population: 10_247 },
      ],
    },
    {
      name: 'Yaguate',
      population: 51_489,
      dms: [{ name: 'Doña Ana', population: 16_586 }],
    },
    { name: 'San Gregorio de Nigua', population: 38_272 },
    {
      name: 'Cambita Garabitos',
      population: 31_684,
      dms: [{ name: 'Cambita El Pueblecito', population: 10_861 }],
    },
    { name: 'Sabana Grande de Palenque', population: 18_304 },
    { name: 'Los Cacaos', population: 13_778 },
  ],
  'santiago': [
    {
      name: 'Santiago de los Caballeros',
      population: 771_748,
      dms: [
        { name: 'Santiago Oeste', population: 105_487 },
        { name: 'San Francisco de Jacagua', population: 47_223 },
        { name: 'Hato del Yaque', population: 34_458 },
        { name: 'La Canela', population: 20_214 },
      ],
    },
    {
      name: 'Tamboril',
      population: 57_669,
      dms: [{ name: 'Canca La Piedra', population: 13_427 }],
    },
    { name: 'Bisonó (Navarrete)', population: 49_367 },
    {
      name: 'Puñal',
      population: 46_090,
      dms: [{ name: 'Canabacoa', population: 12_505 }],
    },
    { name: 'Villa González', population: 42_198 },
    { name: 'San José de Las Matas', population: 37_411 },
    {
      name: 'Licey al Medio',
      population: 30_103,
      dms: [{ name: 'Las Palomas', population: 14_666 }],
    },
    { name: 'Jánico', population: 14_385 },
    { name: 'Sabana Iglesia', population: 14_018 },
    { name: 'Baitoa', population: 11_690 },
  ],
  'la-vega': [
    {
      name: 'Concepción de La Vega',
      population: 282_055,
      dms: [
        { name: 'Río Verde Arriba', population: 24_381 },
        { name: 'Don Juan Rodríguez', population: 13_017 },
        { name: 'Tavera', population: 12_425 },
        { name: 'El Ranchito', population: 10_660 },
      ],
    },
    {
      name: 'Constanza',
      population: 66_316,
      dms: [{ name: 'Tireo', population: 14_868 }],
    },
    {
      name: 'Jarabacoa',
      population: 65_059,
      dms: [{ name: 'Buena Vista', population: 13_760 }],
    },
    {
      name: 'Jima Abajo',
      population: 29_289,
      dms: [{ name: 'Rincón', population: 12_207 }],
    },
  ],
  'la-romana': [
    {
      name: 'La Romana',
      population: 153_241,
      dms: [{ name: 'Caleta', population: 14_003 }],
    },
    {
      name: 'Villa Hermosa',
      population: 117_445,
      dms: [{ name: 'Cumayasa', population: 15_433 }],
    },
    { name: 'Guaymate', population: 17_228 },
  ],
};

export function municipiosFor(location: string): MunicipioPop[] {
  return MUNICIPIOS_2022[location] ?? [];
}
