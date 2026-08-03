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
  /** Viviendas particulares ocupadas (Cuadro 7, Vol. I). */
  viviendas?: number;
  dms?: { name: string; population: number }[];
}

const MUNICIPIOS_2022: Record<string, MunicipioPop[]> = {
  'santo-domingo': [
    { name: 'Distrito Nacional (Sto. Dgo. de Guzmán)', population: 1_029_110, viviendas: 363_153 },
    {
      name: 'Santo Domingo Este',
      population: 1_029_117,
      viviendas: 349_199,
      dms: [{ name: 'San Luis', population: 67_273 }],
    },
    {
      name: 'Santo Domingo Norte',
      population: 674_274,
      viviendas: 223_492,
      dms: [{ name: 'La Victoria', population: 86_013 }],
    },
    { name: 'Santo Domingo Oeste', population: 410_578, viviendas: 142_564 },
    {
      name: 'Los Alcarrizos',
      population: 336_307,
      viviendas: 111_414,
      dms: [
        { name: 'Pantoja', population: 61_564 },
        { name: 'Palmarejo-Villa Linda', population: 19_567 },
      ],
    },
    {
      name: 'Boca Chica',
      population: 167_040,
      viviendas: 56_168,
      dms: [{ name: 'La Caleta', population: 84_310 }],
    },
    {
      name: 'Pedro Brand',
      population: 92_973,
      viviendas: 30_982,
      dms: [
        { name: 'La Guáyiga', population: 42_151 },
        { name: 'La Cuaba', population: 11_768 },
      ],
    },
    { name: 'San Antonio de Guerra', population: 59_299, viviendas: 20_659 },
  ],
  'puerto-plata': [
    { name: 'Puerto Plata', population: 162_093, viviendas: 58_937 },
    {
      name: 'Sosúa',
      population: 56_982,
      viviendas: 20_874,
      dms: [{ name: 'Cabarete', population: 16_148 }],
    },
    { name: 'Imbert', population: 22_925, viviendas: 8_773 },
    { name: 'Villa Montellano', population: 20_753, viviendas: 7_675 },
    { name: 'Villa Isabela', population: 20_278, viviendas: 6_970 },
    { name: 'Altamira', population: 17_676, viviendas: 7_127 },
    { name: 'Luperón', population: 17_577, viviendas: 6_467 },
    { name: 'Los Hidalgos', population: 13_605, viviendas: 4_796 },
    { name: 'Guananico', population: 6_466, viviendas: 2_434 },
  ],
  'la-altagracia': [
    {
      name: 'Higüey',
      population: 415_084,
      viviendas: 158_512,
      dms: [
        { name: 'Verón Punta Cana', population: 138_919 },
        { name: 'La Otra Banda', population: 31_858 },
        { name: 'Las Lagunas de Nisibón', population: 10_074 },
      ],
    },
    {
      name: 'San Rafael del Yuma',
      population: 30_976,
      viviendas: 12_220,
      dms: [{ name: 'Bayahíbe', population: 5_618 }],
    },
  ],
  'san-cristobal': [
    {
      name: 'San Cristóbal',
      population: 277_793,
      viviendas: 88_000,
      dms: [
        { name: 'Hatillo', population: 33_256 },
        { name: 'Hato Damas', population: 15_557 },
      ],
    },
    {
      name: 'Bajos de Haina',
      population: 159_888,
      viviendas: 52_938,
      dms: [
        { name: 'El Carril', population: 33_758 },
        { name: 'Quita Sueño', population: 25_603 },
      ],
    },
    {
      name: 'Villa Altagracia',
      population: 97_620,
      viviendas: 31_900,
      dms: [
        { name: 'San José del Puerto', population: 17_940 },
        { name: 'La Cuchilla', population: 10_247 },
      ],
    },
    {
      name: 'Yaguate',
      population: 51_489,
      viviendas: 16_179,
      dms: [{ name: 'Doña Ana', population: 16_586 }],
    },
    { name: 'San Gregorio de Nigua', population: 38_272, viviendas: 12_410 },
    {
      name: 'Cambita Garabitos',
      population: 31_684,
      viviendas: 10_361,
      dms: [{ name: 'Cambita El Pueblecito', population: 10_861 }],
    },
    { name: 'Sabana Grande de Palenque', population: 18_304, viviendas: 5_646 },
    { name: 'Los Cacaos', population: 13_778, viviendas: 3_963 },
  ],
  'santiago': [
    {
      name: 'Santiago de los Caballeros',
      population: 771_748,
      viviendas: 270_496,
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
      viviendas: 19_754,
      dms: [{ name: 'Canca La Piedra', population: 13_427 }],
    },
    { name: 'Bisonó (Navarrete)', population: 49_367, viviendas: 17_111 },
    {
      name: 'Puñal',
      population: 46_090,
      viviendas: 15_524,
      dms: [{ name: 'Canabacoa', population: 12_505 }],
    },
    { name: 'Villa González', population: 42_198, viviendas: 14_354 },
    { name: 'San José de Las Matas', population: 37_411, viviendas: 12_893 },
    {
      name: 'Licey al Medio',
      population: 30_103,
      viviendas: 9_724,
      dms: [{ name: 'Las Palomas', population: 14_666 }],
    },
    { name: 'Jánico', population: 14_385, viviendas: 5_172 },
    { name: 'Sabana Iglesia', population: 14_018, viviendas: 5_165 },
    { name: 'Baitoa', population: 11_690, viviendas: 3_905 },
  ],
  'la-vega': [
    {
      name: 'Concepción de La Vega',
      population: 282_055,
      viviendas: 95_448,
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
      viviendas: 23_773,
      dms: [{ name: 'Tireo', population: 14_868 }],
    },
    {
      name: 'Jarabacoa',
      population: 65_059,
      viviendas: 23_262,
      dms: [{ name: 'Buena Vista', population: 13_760 }],
    },
    {
      name: 'Jima Abajo',
      population: 29_289,
      viviendas: 9_953,
      dms: [{ name: 'Rincón', population: 12_207 }],
    },
  ],
  'la-romana': [
    {
      name: 'La Romana',
      population: 153_241,
      viviendas: 53_263,
      dms: [{ name: 'Caleta', population: 14_003 }],
    },
    {
      name: 'Villa Hermosa',
      population: 117_445,
      viviendas: 37_018,
      dms: [{ name: 'Cumayasa', population: 15_433 }],
    },
    { name: 'Guaymate', population: 17_228, viviendas: 5_215 },
  ],
};

export function municipiosFor(location: string): MunicipioPop[] {
  return MUNICIPIOS_2022[location] ?? [];
}
