/**
 * Registro Nacional de Contribuyentes (RNC) — DGII, listado público de
 * contribuyentes actualizado al 1 de agosto de 2026 (785,221 registros;
 * 389,308 activos). Conteo NACIONAL de contribuyentes ACTIVOS por actividad
 * económica, curado a las actividades minoristas/de servicio que corresponden
 * a cada rubro de la app (se excluyen fabricación y mayoristas puros, salvo
 * donde el rubro los incluye). El listado público no trae dirección, por lo
 * que sirve como referencia de tamaño real del mercado formal — no para el
 * mapa. La cifra local de OpenStreetMap es la submuestra mapeada.
 */

export const DGII_CUTOFF = '1 ago 2026';
export const DGII_ACTIVOS_TOTAL = 389_308;

/** Contribuyentes activos a nivel nacional por rubro de la app. */
export const DGII_BY_CATEGORY: Record<string, number> = {
  gasolinera: 767, // venta al por menor de combustible (incl. estaciones de servicio)
  estacion_gas: 204, // fraccionamiento y distribución de GLP + gas en garrafas
  restaurante: 3_044, // restaurantes y cantinas + comida rápida
  cafeteria: 779,
  farmacia: 3_031, // venta al por menor de productos farmacéuticos
  supermercado: 625, // venta al por menor en supermercados
  salon_belleza: 6_734, // peluquería + tratamiento de belleza
  gimnasio: 488,
  ferreteria: 2_267, // venta al por menor de artículos de ferretería
  panaderia: 1_280, // elaboración + venta al por menor de pan
  lavanderia: 183,
  clinica_dental: 4_077, // servicios odontológicos
  dealer_vehiculos: 5_231, // venta de vehículos nuevos + usados
  tienda_repuestos: 4_659, // partes/piezas/accesorios de vehículos (mayor + menor)
  taller_automotriz: 2_638, // mantenimiento y reparación del motor; mecánica integral
  neumaticos: 678, // llantas de goma y tubos + cubiertas
  transporte_carga: 1_847,
  transporte_pasajeros: 1_670, // pasajeros n.c.p. + turismo
};

/**
 * Colmados con RNC activo (colmados + colmadones). Contraste con la
 * estimación gremial de FENACERD (~65,000 colmados en el país): la mayoría
 * del canal opera fuera del registro formal.
 */
export const DGII_COLMADOS = 7_185;

export function dgiiCountFor(categoryId: string): number | null {
  return DGII_BY_CATEGORY[categoryId] ?? null;
}
