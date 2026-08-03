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
  /** % de población en zona urbana (Cuadro 2, Vol. III). */
  urbanPct?: number;
  /** % hogares pobres ICV-1+2 sobre categorizados (SIUBEN Open Data, ICV_BARRIOS). */
  icvPoorPct?: number;
  /** % hogares en estrato alto ICV-4 (SIUBEN Open Data, ICV_BARRIOS). */
  icvHighPct?: number;
  dms?: { name: string; population: number }[];
}

const MUNICIPIOS_2022: Record<string, MunicipioPop[]> = {
  'santo-domingo': [
    { name: 'Distrito Nacional (Sto. Dgo. de Guzmán)', population: 1_029_110, viviendas: 363_153, urbanPct: 100, icvPoorPct: 25.9, icvHighPct: 33.6 },
    {
      name: 'Santo Domingo Este',
      population: 1_029_117,
      viviendas: 349_199,
      urbanPct: 85,
      icvPoorPct: 22.9,
      icvHighPct: 36.5,
      dms: [{ name: 'San Luis', population: 67_273 }],
    },
    {
      name: 'Santo Domingo Norte',
      population: 674_274,
      viviendas: 223_492,
      urbanPct: 86,
      icvPoorPct: 32.8,
      icvHighPct: 25.6,
      dms: [{ name: 'La Victoria', population: 86_013 }],
    },
    { name: 'Santo Domingo Oeste', population: 410_578, viviendas: 142_564, urbanPct: 78, icvPoorPct: 21.1, icvHighPct: 37.2 },
    {
      name: 'Los Alcarrizos',
      population: 336_307,
      viviendas: 111_414,
      urbanPct: 84,
      icvPoorPct: 27.8,
      icvHighPct: 33.4,
      dms: [
        { name: 'Pantoja', population: 61_564 },
        { name: 'Palmarejo-Villa Linda', population: 19_567 },
      ],
    },
    {
      name: 'Boca Chica',
      population: 167_040,
      viviendas: 56_168,
      urbanPct: 63,
      icvPoorPct: 40.4,
      icvHighPct: 16.7,
      dms: [{ name: 'La Caleta', population: 84_310 }],
    },
    {
      name: 'Pedro Brand',
      population: 92_973,
      viviendas: 30_982,
      urbanPct: 83,
      icvPoorPct: 45.2,
      icvHighPct: 18.0,
      dms: [
        { name: 'La Guáyiga', population: 42_151 },
        { name: 'La Cuaba', population: 11_768 },
      ],
    },
    { name: 'San Antonio de Guerra', population: 59_299, viviendas: 20_659, urbanPct: 29, icvPoorPct: 56.5, icvHighPct: 14.7 },
  ],
  'puerto-plata': [
    { name: 'Puerto Plata', population: 162_093, viviendas: 58_937, urbanPct: 84, icvPoorPct: 40.5, icvHighPct: 18.1 },
    {
      name: 'Sosúa',
      population: 56_982,
      viviendas: 20_874,
      urbanPct: 29,
      icvPoorPct: 38.6,
      icvHighPct: 15.8,
      dms: [{ name: 'Cabarete', population: 16_148 }],
    },
    { name: 'Imbert', population: 22_925, viviendas: 8_773, urbanPct: 32, icvPoorPct: 56.0, icvHighPct: 9.9 },
    { name: 'Villa Montellano', population: 20_753, viviendas: 7_675, urbanPct: 56, icvPoorPct: 43.0, icvHighPct: 24.4 },
    { name: 'Villa Isabela', population: 20_278, viviendas: 6_970, urbanPct: 40, icvPoorPct: 63.8, icvHighPct: 7.4 },
    { name: 'Altamira', population: 17_676, viviendas: 7_127, urbanPct: 25, icvPoorPct: 69.5, icvHighPct: 9.8 },
    { name: 'Luperón', population: 17_577, viviendas: 6_467, urbanPct: 35, icvPoorPct: 64.1, icvHighPct: 11.0 },
    { name: 'Los Hidalgos', population: 13_605, viviendas: 4_796, urbanPct: 24, icvPoorPct: 66.0, icvHighPct: 7.9 },
    { name: 'Guananico', population: 6_466, viviendas: 2_434, urbanPct: 41, icvPoorPct: 63.3, icvHighPct: 11.5 },
  ],
  'la-altagracia': [
    {
      name: 'Higüey',
      population: 415_084,
      viviendas: 158_512,
      urbanPct: 79,
      icvPoorPct: 53.0,
      icvHighPct: 15.5,
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
      urbanPct: 48,
      icvPoorPct: 69.1,
      icvHighPct: 9.1,
      dms: [{ name: 'Bayahíbe', population: 5_618 }],
    },
  ],
  'san-cristobal': [
    {
      name: 'San Cristóbal',
      population: 277_793,
      viviendas: 88_000,
      urbanPct: 62,
      icvPoorPct: 44.6,
      icvHighPct: 20.9,
      dms: [
        { name: 'Hatillo', population: 33_256 },
        { name: 'Hato Damas', population: 15_557 },
      ],
    },
    {
      name: 'Bajos de Haina',
      population: 159_888,
      viviendas: 52_938,
      urbanPct: 52,
      icvPoorPct: 36.1,
      icvHighPct: 20.8,
      dms: [
        { name: 'El Carril', population: 33_758 },
        { name: 'Quita Sueño', population: 25_603 },
      ],
    },
    {
      name: 'Villa Altagracia',
      population: 97_620,
      viviendas: 31_900,
      urbanPct: 53,
      icvPoorPct: 54.4,
      icvHighPct: 13.2,
      dms: [
        { name: 'San José del Puerto', population: 17_940 },
        { name: 'La Cuchilla', population: 10_247 },
      ],
    },
    {
      name: 'Yaguate',
      population: 51_489,
      viviendas: 16_179,
      urbanPct: 20,
      icvPoorPct: 58.9,
      icvHighPct: 11.6,
      dms: [{ name: 'Doña Ana', population: 16_586 }],
    },
    { name: 'San Gregorio de Nigua', population: 38_272, viviendas: 12_410, urbanPct: 46, icvPoorPct: 60.4, icvHighPct: 9.8 },
    {
      name: 'Cambita Garabitos',
      population: 31_684,
      viviendas: 10_361,
      urbanPct: 53,
      icvPoorPct: 60.4,
      icvHighPct: 16.3,
      dms: [{ name: 'Cambita El Pueblecito', population: 10_861 }],
    },
    { name: 'Sabana Grande de Palenque', population: 18_304, viviendas: 5_646, urbanPct: 32, icvPoorPct: 38.0, icvHighPct: 18.6 },
    { name: 'Los Cacaos', population: 13_778, viviendas: 3_963, urbanPct: 24, icvPoorPct: 82.1, icvHighPct: 4.0 },
  ],
  'santiago': [
    {
      name: 'Santiago de los Caballeros',
      population: 771_748,
      viviendas: 270_496,
      urbanPct: 84,
      icvPoorPct: 29.1,
      icvHighPct: 28.1,
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
      urbanPct: 55,
      icvPoorPct: 36.8,
      icvHighPct: 19.1,
      dms: [{ name: 'Canca La Piedra', population: 13_427 }],
    },
    { name: 'Bisonó (Navarrete)', population: 49_367, viviendas: 17_111, urbanPct: 76, icvPoorPct: 48.2, icvHighPct: 13.2 },
    {
      name: 'Puñal',
      population: 46_090,
      viviendas: 15_524,
      urbanPct: 23,
      icvPoorPct: 28.2,
      icvHighPct: 24.5,
      dms: [{ name: 'Canabacoa', population: 12_505 }],
    },
    { name: 'Villa González', population: 42_198, viviendas: 14_354, urbanPct: 42, icvPoorPct: 45.1, icvHighPct: 14.5 },
    { name: 'San José de Las Matas', population: 37_411, viviendas: 12_893, urbanPct: 28, icvPoorPct: 54.9, icvHighPct: 10.4 },
    {
      name: 'Licey al Medio',
      population: 30_103,
      viviendas: 9_724,
      urbanPct: 69,
      icvPoorPct: 31.7,
      icvHighPct: 22.3,
      dms: [{ name: 'Las Palomas', population: 14_666 }],
    },
    { name: 'Jánico', population: 14_385, viviendas: 5_172, urbanPct: 24, icvPoorPct: 70.1, icvHighPct: 7.5 },
    { name: 'Sabana Iglesia', population: 14_018, viviendas: 5_165, urbanPct: 35, icvPoorPct: 48.4, icvHighPct: 11.1 },
    { name: 'Baitoa', population: 11_690, viviendas: 3_905, urbanPct: 17 },
  ],
  'la-vega': [
    {
      name: 'Concepción de La Vega',
      population: 282_055,
      viviendas: 95_448,
      urbanPct: 47,
      icvPoorPct: 43.9,
      icvHighPct: 16.2,
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
      urbanPct: 53,
      icvPoorPct: 50.8,
      icvHighPct: 15.0,
      dms: [{ name: 'Tireo', population: 14_868 }],
    },
    {
      name: 'Jarabacoa',
      population: 65_059,
      viviendas: 23_262,
      urbanPct: 49,
      icvPoorPct: 45.9,
      icvHighPct: 16.6,
      dms: [{ name: 'Buena Vista', population: 13_760 }],
    },
    {
      name: 'Jima Abajo',
      population: 29_289,
      viviendas: 9_953,
      urbanPct: 45,
      icvPoorPct: 52.9,
      icvHighPct: 11.9,
      dms: [{ name: 'Rincón', population: 12_207 }],
    },
  ],
  'la-romana': [
    {
      name: 'La Romana',
      population: 153_241,
      viviendas: 53_263,
      urbanPct: 98,
      icvPoorPct: 33.1,
      icvHighPct: 30.5,
      dms: [{ name: 'Caleta', population: 14_003 }],
    },
    {
      name: 'Villa Hermosa',
      population: 117_445,
      viviendas: 37_018,
      urbanPct: 98,
      icvPoorPct: 47.1,
      icvHighPct: 16.0,
      dms: [{ name: 'Cumayasa', population: 15_433 }],
    },
    { name: 'Guaymate', population: 17_228, viviendas: 5_215, urbanPct: 45, icvPoorPct: 76.2, icvHighPct: 7.4 },
  ],
};

export function municipiosFor(location: string): MunicipioPop[] {
  return MUNICIPIOS_2022[location] ?? [];
}
