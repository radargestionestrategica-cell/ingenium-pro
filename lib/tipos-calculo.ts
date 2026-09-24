// lib/tipos-calculo.ts
// Relación tipo de cálculo → módulo del dashboard, y título de módulo para
// los PDF exportados. Fuente única para app/api/calculos/guardar y
// app/api/calculos/exportar.

import { MODULOS_INTRO } from './modulos-intro';

// tipo real de cálculo -> moduloId canónico del dashboard.
// OJO: guardar/route.ts lo usa para restringir por plan (planes "modulo" y
// "duo"). Cambiar o agregar entradas acá cambia qué puede guardar cada plan.
// (misma agrupación que ya existe como comentarios en components/BotonesExportar.tsx DXF_MAP)
export const TIPO_A_MODULO: Record<string, string> = {
  MAOP: 'petroleo',
  PERFORACION: 'perforacion',
  DARCY_WEISBACH: 'hidraulica', GOLPE_ARIETE: 'hidraulica',
  CANERIAS_ESPESOR: 'canerias', CANERIAS_HOOP: 'canerias', CANERIAS_ARIETE: 'canerias',
  CANERIAS_CIERRE: 'canerias', CANERIAS_REMANENTE: 'canerias',
  ELECTRICIDAD_CABLE: 'electricidad', ELECTRICIDAD_CAIDA_TENSION: 'electricidad',
  ELECTRICIDAD_CORTOCIRCUITO: 'electricidad', ELECTRICIDAD_FACTOR_POTENCIA: 'electricidad',
  ELECTRICIDAD_MOTOR: 'electricidad', ELECTRICIDAD_ILUMINACION: 'electricidad',
  ELECTRICIDAD_AREA_PELIGROSA: 'electricidad', ELECTRICIDAD_TRANSFORMADOR: 'electricidad',
  CAPACIDAD_PORTANTE: 'geotecnia', ESTABILIDAD_TALUD: 'geotecnia',
  SELECTOR_SOLDADURA: 'soldadura', HEAT_INPUT: 'soldadura', FILETE_SOLDADURA: 'soldadura',
  CONSUMO_ELECTRODOS: 'soldadura', PRECALENTAMIENTO: 'soldadura',
  HORMIGON_MMO: 'mmo', HIERRO_MMO: 'mmo', MAMPOSTERIA_MMO: 'mmo', LOSA_MMO: 'mmo',
  REVOQUE_MMO: 'mmo', CERAMICO_MMO: 'mmo', CONTRAPISO_MMO: 'mmo', ZAPATA_MMO: 'mmo',
  EXCAVACION_MMO: 'mmo', MORTERO_MMO: 'mmo', RENDIMIENTO_MMO: 'mmo',
  VALVULAS_CLASE_B16_34: 'valvulas', VALVULAS_MATERIAL_NACE: 'valvulas',
  VALVULAS_BRIDA_B16_5: 'valvulas', VALVULAS_DISENO_BOLA: 'valvulas',
  VALVULAS_DISENO_MARIPOSA: 'valvulas', VALVULAS_DISENO_RETENCION: 'valvulas',
  VALVULAS_DISENO_TAPON: 'valvulas', VALVULAS_DISENO_GLOBO: 'valvulas',
  VALVULAS_COEFICIENTE_CV: 'valvulas',
  VIGA_ACERO_AISC: 'civil', COLUMNA_HORMIGON_ACI: 'civil',
  PAVIMENTO_AASHTO93: 'vialidad', DRENAJE_VIAL_HEC22: 'vialidad',
  VERTEDERO_FRANCIS: 'represas', FILTRACION_DARCY: 'represas',
  RMR_BIENIAWSKI: 'mineria', VENTILACION_SUBTERRANEA: 'mineria',
  DILATACION_TERMICA: 'termica', INTERCAMBIADOR_LMTD: 'termica',
  ARQUITECTURA_VIENTO: 'arquitectura', ARQUITECTURA_SISMO: 'arquitectura',
  ARQUITECTURA_ILUMINACION: 'arquitectura',
};

// Tipos que existen en los módulos pero NO están en TIPO_A_MODULO. Se usan
// SOLO para el título del PDF — no se agregan al mapa de arriba para no
// cambiar la restricción por plan sin una decisión explícita.
const TIPO_A_MODULO_SOLO_TITULO: Record<string, string> = {
  ESTABILIDAD_PRESA_GRAVEDAD: 'represas',
  GISTM_CONFORMIDAD: 'gistm',
  ELECTROMECANICA_FLOTA: 'electromecanica_flota',
};

// moduloId de registros viejos (claves del mapa MODULO_NOMBRES anterior).
const MODULO_LEGADO: Record<string, string> = {
  HIDRAULICA: 'hidraulica', DARCY: 'hidraulica', JOUKOWSKY: 'hidraulica',
  BISHOP: 'geotecnia', THERMAL: 'termica', ESTRUCTURAL: 'civil',
  ELECTRICIDAD: 'electricidad', SOLDADURA: 'soldadura', MMO: 'mmo',
  CANERIAS: 'canerias', VALVULAS: 'valvulas', GEOTECNIA: 'geotecnia',
};

// Módulos sin entrada en MODULOS_INTRO
const TITULO_EXTRA: Record<string, string> = {
  instrumentacion: 'Electrónica de Instrumentación',
};

function moduloDe(clave: string | null | undefined): string | undefined {
  if (!clave) return undefined;
  if (TIPO_A_MODULO[clave]) return TIPO_A_MODULO[clave];
  if (TIPO_A_MODULO_SOLO_TITULO[clave]) return TIPO_A_MODULO_SOLO_TITULO[clave];
  if (clave.startsWith('INSTRUMENTACION_')) return 'instrumentacion';
  if (MODULO_LEGADO[clave]) return MODULO_LEGADO[clave];
  if (MODULOS_INTRO[clave] || TITULO_EXTRA[clave]) return clave;   // ya es un moduloId canónico
  return undefined;
}

// Título del módulo para el PDF. El tipo manda sobre moduloId: al guardar,
// moduloId recibe el tipo (BotonesExportar), así que ambos suelen coincidir.
// Si no se reconoce, se devuelve el tipo tal cual (comportamiento anterior).
export function tituloModuloPDF(tipo: string, moduloId?: string | null): string {
  const modulo = moduloDe(tipo) ?? moduloDe(moduloId);
  if (modulo) return MODULOS_INTRO[modulo]?.titulo.es ?? TITULO_EXTRA[modulo] ?? tipo;
  return moduloId ?? tipo;
}
