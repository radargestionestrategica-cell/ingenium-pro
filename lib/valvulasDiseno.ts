// lib/valvulasDiseno.ts
// Pestaña Diseño de Válvulas (y Brida): tablas dimensionales y armado del
// resultado + dxfParams. Fuente única para components/ModuloValvulas.tsx;
// testeable sin React (lib/__tests__/calculos.test.ts).
//
// Regla de los DXF de Diseño: toda cifra impresa sale de una tabla de este
// archivo (o de lib/valvulasB1634) o se informa como "no disponible –
// requiere tabla verificada". Las proporciones solo dibujan formas.

import {
  ratingB1634, calcPruebaHidrostaticaB1634, duracionPruebaB1634, dnDesdeNPS,
} from './valvulasB1634';

export const NO_DISPONIBLE = 'no disponible – requiere tabla verificada';
export const FUENTE_B165 = 'ASME B16.5 – fuente secundaria, pendiente de cotejo';

// ─── Bridas — ASME B16.5 (fuente secundaria) ─────────────────────
// OD=diámetro exterior brida | BC=círculo de pernos | n=número pernos
// db=diámetro pernos | bore=ID de caño Schedule 40 (supuesto, NO es una
// dimensión de B16.5 — solo se usa para dibujar formas, nunca como cota).
// TODAS EN PULGADAS — fuente: ASME B16.5 Tables / Engineering Toolbox (secundaria, pendiente de cotejo)
export type FlangeData = { OD: number; BC: number; n: number; db: number; bore: number };
export const B165: Record<string, Record<string, FlangeData>> = {
  '150': {
    '0.5':  { OD: 3.50,  BC: 2.375, n: 4,  db: 0.500, bore: 0.622  },
    '0.75': { OD: 3.875, BC: 2.750, n: 4,  db: 0.500, bore: 0.824  },
    '1':    { OD: 4.250, BC: 3.125, n: 4,  db: 0.500, bore: 1.049  },
    '1.5':  { OD: 5.000, BC: 3.875, n: 4,  db: 0.500, bore: 1.610  },
    '2':    { OD: 6.000, BC: 4.750, n: 4,  db: 0.625, bore: 2.067  },
    '2.5':  { OD: 7.000, BC: 5.500, n: 4,  db: 0.625, bore: 2.469  },
    '3':    { OD: 7.500, BC: 6.000, n: 4,  db: 0.625, bore: 3.068  },
    '4':    { OD: 9.000, BC: 7.500, n: 8,  db: 0.625, bore: 4.026  },
    '6':    { OD: 11.00, BC: 9.500, n: 8,  db: 0.750, bore: 6.065  },
    '8':    { OD: 13.50, BC: 11.750,n: 8,  db: 0.750, bore: 7.981  },
    '10':   { OD: 16.00, BC: 14.250,n: 12, db: 0.875, bore: 10.020 },
    '12':   { OD: 19.00, BC: 17.000,n: 12, db: 0.875, bore: 11.938 },
  },
  '300': {
    '0.5':  { OD: 3.750, BC: 2.625, n: 4,  db: 0.500, bore: 0.622  },
    '0.75': { OD: 4.625, BC: 3.250, n: 4,  db: 0.625, bore: 0.824  },
    '1':    { OD: 4.875, BC: 3.500, n: 4,  db: 0.625, bore: 1.049  },
    '1.5':  { OD: 6.125, BC: 4.500, n: 4,  db: 0.750, bore: 1.610  },
    '2':    { OD: 6.500, BC: 5.000, n: 8,  db: 0.625, bore: 2.067  },
    '2.5':  { OD: 7.500, BC: 5.875, n: 8,  db: 0.750, bore: 2.469  },
    '3':    { OD: 8.250, BC: 6.625, n: 8,  db: 0.750, bore: 3.068  },
    '4':    { OD: 10.00, BC: 7.875, n: 8,  db: 0.875, bore: 4.026  },
    '6':    { OD: 12.50, BC: 10.625,n: 12, db: 0.875, bore: 6.065  },
    '8':    { OD: 15.00, BC: 13.000,n: 12, db: 1.000, bore: 7.981  },
    '10':   { OD: 17.50, BC: 15.250,n: 16, db: 1.125, bore: 10.020 },
    '12':   { OD: 20.50, BC: 17.750,n: 16, db: 1.250, bore: 11.938 },
  },
  '600': {
    '0.5':  { OD: 3.750, BC: 2.625, n: 4,  db: 0.500, bore: 0.622  },
    '0.75': { OD: 4.625, BC: 3.250, n: 4,  db: 0.625, bore: 0.824  },
    '1':    { OD: 4.875, BC: 3.500, n: 4,  db: 0.625, bore: 1.049  },
    '1.5':  { OD: 6.125, BC: 4.500, n: 4,  db: 0.750, bore: 1.610  },
    '2':    { OD: 6.500, BC: 5.000, n: 8,  db: 0.625, bore: 2.067  },
    '2.5':  { OD: 7.500, BC: 5.875, n: 8,  db: 0.750, bore: 2.469  },
    '3':    { OD: 8.250, BC: 6.625, n: 8,  db: 0.750, bore: 3.068  },
    '4':    { OD: 10.750,BC: 8.500, n: 8,  db: 0.875, bore: 4.026  },
    '6':    { OD: 14.000,BC: 11.500,n: 12, db: 1.000, bore: 6.065  },
    '8':    { OD: 16.500,BC: 13.750,n: 12, db: 1.125, bore: 7.981  },
    '10':   { OD: 20.000,BC: 17.000,n: 16, db: 1.250, bore: 10.020 },
    '12':   { OD: 22.000,BC: 19.250,n: 20, db: 1.250, bore: 11.938 },
  },
  '900': {
    '2':    { OD: 8.500, BC: 6.500, n: 8,  db: 0.875, bore: 2.067  },
    '2.5':  { OD: 9.625, BC: 7.500, n: 8,  db: 1.000, bore: 2.469  },
    '3':    { OD: 9.500, BC: 7.500, n: 8,  db: 0.875, bore: 3.068  },
    '4':    { OD: 11.500,BC: 9.250, n: 8,  db: 1.125, bore: 4.026  },
    '6':    { OD: 15.000,BC: 12.500,n: 12, db: 1.125, bore: 6.065  },
    '8':    { OD: 18.500,BC: 15.500,n: 12, db: 1.375, bore: 7.981  },
    '10':   { OD: 21.500,BC: 18.500,n: 16, db: 1.375, bore: 10.020 },
    '12':   { OD: 24.000,BC: 21.000,n: 20, db: 1.375, bore: 11.938 },
  },
};

// ─── Face-to-face — ASME B16.10 (según comentario de origen) ─────
// Compuerta (gate), bridada, raised face (mm). Fuente: ASME B16.10-2017 Table 1.
export const F2F_COMPUERTA: Record<string, Record<string, number>> = {
  '150': { '0.5':108,'0.75':117,'1':130,'1.5':159,'2':178,'2.5':216,'3':229,'4':267,'6':356,'8':457,'10':533,'12':610 },
  '300': { '0.5':140,'0.75':152,'1':165,'1.5':197,'2':216,'2.5':254,'3':279,'4':318,'6':419,'8':521,'10':622,'12':711 },
  '600': { '0.5':165,'0.75':190,'1':216,'1.25':229,'1.5':241,'2':292,'2.5':330,'3':356,'4':432,'6':559,'8':660,'10':787,'12':838 },
  '900': { '2':292,'2.5':330,'3':356,'4':406,'6':533,'8':660,'10':787,'12':914 },
};

// Bola (ball), long pattern — ASME B16.10 / API 6D (según comentario de origen).
export const F2F_BOLA: Record<string, Record<string, number>> = {
  '150': { '0.5':108,'0.75':117,'1':127,'1.25':140,'1.5':165,'2':178,'2.5':190,'3':203,'4':229,'6':394,'8':457,'10':533,'12':610 },
  '300': { '0.5':140,'0.75':152,'1':165,'1.25':178,'1.5':190,'2':216,'2.5':241,'3':282,'4':305,'6':403,'8':502,'10':568,'12':648 },
  '600': { '0.5':165,'0.75':190,'1':216,'1.25':229,'1.5':241,'2':292,'2.5':330,'3':356,'4':432,'6':559,'8':660,'10':787,'12':838 },
};

// Globo (globe), short pattern — ASME B16.10-2017 Table 1 (según comentario
// de origen). Clase 150 SIN datos: la tabla anterior era una copia de la
// clase 300 → "no disponible" hasta tener la tabla verificada.
export const F2F_GLOBO: Record<string, Record<string, number>> = {
  '300': { '0.5':102,'0.75':102,'1':127,'1.25':140,'1.5':152,'2':178,'2.5':203,'3':216,'4':229,'6':267,'8':292,'10':330,'12':356 },
  '600': { '0.5':127,'0.75':152,'1':178,'1.25':203,'1.5':216,'2':254,'2.5':279,'3':305,'4':356,'6':432,'8':508,'10':584,'12':660 },
  '900': { '2':305,'3':381,'4':457,'6':559,'8':660,'10':787,'12':914 },
};

// Retención Swing — ASME B16.10-2022 + API STD 594 (según comentario de
// origen). Solo clase 600 Swing; 150/300 y Lift/Tilting: no disponible.
export const F2F_RETENCION_SWING: Record<string, Record<string, number>> = {
  '600': { '1.5':241,'2':292,'2.5':330,'3':356,'4':432,'5':508,'6':559,'8':660,'10':787,'12':838,'14':889,'16':991,'18':1092,'20':1194,'22':1295,'24':1397,'26':1448,'28':1600,'30':1651,'36':2083 },
};
// Tapón: la tabla anterior (F2F_TAPON) no distinguía patrón Regular/Venturi/
// Short → se eliminó; F2F del tapón = no disponible en todos los patrones.

export type TipoDisenio = 'compuerta' | 'globo' | 'bola' | 'mariposa' | 'retencion' | 'tapon';

export const CLASES_DISENO: Record<TipoDisenio, string[]> = {
  compuerta: ['150','300','600','900'],
  globo:     ['150','300','600','900'],
  bola:      ['150','300','600'],
  mariposa:  ['150','300'],
  retencion: ['150','300','600'],
  tapon:     ['150','300','600','900'],
};

export const NPS_DISENO: Record<TipoDisenio, Record<string, string[]>> = {
  compuerta: {
    '150': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '900': ['2','2.5','3','4','6','8','10','12'],
  },
  globo: {
    '150': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '900': ['2','2.5','3','4','6','8','10','12'],
  },
  bola: {
    '150': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
  },
  mariposa: {
    '150': ['2','2.5','3','4','6','8','10','12'],
    '300': ['2','2.5','3','4','6','8','10','12'],
  },
  retencion: {
    '150': ['1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['1.5','2','2.5','3','4','5','6','8','10','12','14','16','18','20','22','24','26','28','30','36'],
  },
  tapon: {
    '150': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['1','1.25','1.5','2','2.5','3','4','6','8','10','12','14','16','18','20','22','24','26','30','32','34','36'],
    '900': ['8','10','12'],
  },
};

const mm1 = (pulg: number) => Math.round(pulg * 25.4 * 10) / 10;

export function f2fDiseno(tipo: TipoDisenio, clase: string, nps: string, subtipo: string): number | null {
  switch (tipo) {
    case 'compuerta': return F2F_COMPUERTA[clase]?.[nps] ?? null;
    case 'bola':      return F2F_BOLA[clase]?.[nps] ?? null;
    case 'globo':     return F2F_GLOBO[clase]?.[nps] ?? null;
    case 'retencion': return subtipo === 'Swing' ? (F2F_RETENCION_SWING[clase]?.[nps] ?? null) : null;
    case 'mariposa':
    case 'tapon':     return null;
  }
}

export interface EntradaDiseno {
  tipo: TipoDisenio; clase: string; nps: string; material: string;
  estilo: string; subtipo: string; patron: string; proyecto: string;
}

export type ResultadoDiseno =
  | { ok: false; error: string }
  | {
      ok: true;
      f2f_mm: number | null; fd: FlangeData | null; dn: number;
      pruebaBar: number | null; duracionS: number | null; pruebaTxt: string; citaPT: string | null;
      tipo: string; normativa: string;
      parametros: Record<string, unknown>; resultado: Record<string, unknown>; dxfParams: Record<string, unknown>;
    };

export function construirDisenoValvula(e: EntradaDiseno): ResultadoDiseno {
  const { tipo, clase, nps, material, estilo, subtipo, patron, proyecto } = e;

  const dn = dnDesdeNPS(nps);
  if (dn === null) return { ok: false, error: `NPS ${nps}" fuera de la tabla de DN normalizados (ASME B36.10 / ISO 6708).` };

  const fd = B165[clase]?.[nps] ?? null;
  const f2f_mm = f2fDiseno(tipo, clase, nps, subtipo);
  // Datos de brida (OD, BC, pernos) solo para compuerta y bola
  const conBrida = tipo === 'compuerta' || tipo === 'bola';

  const tipoKey = tipo === 'compuerta' ? 'VALVULAS_BRIDA_B16_5'
                : tipo === 'bola'      ? 'VALVULAS_DISENO_BOLA'
                : tipo === 'mariposa'  ? 'VALVULAS_DISENO_MARIPOSA'
                : tipo === 'retencion' ? 'VALVULAS_DISENO_RETENCION'
                : tipo === 'tapon'     ? 'VALVULAS_DISENO_TAPON'
                :                        'VALVULAS_DISENO_GLOBO';
  const normativa = tipo === 'bola'      ? 'ASME B16.34 + ASME B16.10-2018 + API 6D'
                  : tipo === 'compuerta' ? 'ASME B16.34 + ASME B16.10-2018 + API 600'
                  : tipo === 'mariposa'  ? 'API 609 / MSS SP-67 / ASME B16.34'
                  : tipo === 'retencion' ? 'ASME B16.10-2022 + API STD 594'
                  : tipo === 'tapon'     ? 'ASME B16.10-2022 + MSS SP-78'
                  :                        'ASME B16.34 + ASME B16.10-2018';

  // Rating a 38 °C según material (solo WCB y CF8M tienen tabla P-T)
  const matB1634 = material === 'A216 WCB' ? 'WCB' as const
                 : material === 'A351 CF8M' ? 'CF8M' as const : null;
  const r38 = matB1634 ? ratingB1634(matB1634, clase, 38) : null;
  const rating38Bar = r38 && r38.ok ? r38.rating_bar : null;
  const pruebaBar = rating38Bar !== null ? calcPruebaHidrostaticaB1634(rating38Bar) : null;
  const duracionS = duracionPruebaB1634(parseFloat(nps));
  const pruebaTxt =
    pruebaBar !== null ? `${pruebaBar} bar` :
    !matB1634          ? 'no disponible — sin tabla P-T para este material' :
    r38 && !r38.ok     ? `no disponible — ${r38.mensaje}` : 'no disponible';
  const citaPT = r38 && r38.ok ? r38.cita : null;

  const nombreTipo = { compuerta: 'Compuerta', globo: 'Globo', bola: 'Bola', mariposa: 'Mariposa', retencion: 'Retencion', tapon: 'Tapon' }[tipo];

  const parametros: Record<string, unknown> = {
    'NPS (pulg)': nps,
    'DN': dn,
    'Clase de presion': clase,
    'Tipo valvula': tipo,
    ...(tipo === 'mariposa'  ? { 'Estilo': estilo } : {}),
    ...(tipo === 'retencion' ? { 'Subtipo': subtipo } : {}),
    ...(tipo === 'tapon'     ? { 'Patron': patron } : {}),
    'Proyecto': proyecto || 'Sin nombre',
  };

  const resultado: Record<string, unknown> = {
    'F2F ASME B16.10 resultado (mm)': f2f_mm ?? NO_DISPONIBLE,
    'OD (mm)':   fd ? mm1(fd.OD) : NO_DISPONIBLE,
    'BC (mm)':   fd ? mm1(fd.BC) : NO_DISPONIBLE,
    'Numero de pernos': fd ? fd.n : NO_DISPONIBLE,
    ...(fd ? { 'Fuente dimensiones de brida': FUENTE_B165 } : {}),
    'Material cuerpo': `ASTM ${material}`,
    'Prueba hidrostatica carcasa B16.34 §7.1.1 (bar)': pruebaBar ?? `No disponible (${pruebaTxt.replace(/^no disponible — /, '')})`,
    ...(citaPT ? { 'Fuente tabla P-T': citaPT } : {}),
    'Duracion minima prueba B16.34 §7.1.2 (s)': duracionS ?? 'No disponible',
  };

  const dxfParams: Record<string, unknown> = {
    // Claves leídas por exportarDXFBridaB165 / Bola / Mariposa / Retencion / Tapon
    'NPS (pulg)': nps,
    'Clase de presion': clase,
    'Proyecto': proyecto || 'Sin nombre',
    ...(tipo === 'mariposa'  ? { 'Estilo': estilo }   : {}),
    ...(tipo === 'retencion' ? { 'Subtipo': subtipo } : {}),
    ...(tipo === 'tapon'     ? { 'Patron': patron }   : {}),
    f2f_mm,                                               // null → "no disponible"
    ...(conBrida && fd ? {
      od_mm: mm1(fd.OD), bc_mm: mm1(fd.BC), n_pernos: fd.n,
      bore_forma_mm: mm1(fd.bore),                        // solo para dibujar la forma
    } : {}),
    // Claves leídas por exportarDXFValvulas (globo)
    DN: dn, nps,
    tipo: tipo === 'compuerta' ? 'cg' : tipo === 'bola' ? 'bt' : tipo === 'mariposa' ? 'mp'
        : tipo === 'retencion' ? 'ch' : tipo === 'tapon' ? 'cg' : 'gl',
    nombre: `${nombreTipo} NPS ${nps}" Clase ${clase}`,
    clase,
    ...(rating38Bar !== null ? { P_max: rating38Bar / 10 } : {}),
    ...(pruebaBar !== null ? { P_prueba_bar: pruebaBar } : {}),
    ...(duracionS !== null ? { duracion_prueba_s: duracionS } : {}),
    norma: citaPT ? `${normativa} | ${citaPT}` : normativa,
    material: `ASTM ${material}`,
    proyecto: proyecto || undefined,
  };

  return {
    ok: true, f2f_mm, fd, dn, pruebaBar, duracionS, pruebaTxt, citaPT,
    tipo: tipoKey, normativa, parametros, resultado, dxfParams,
  };
}

// ─── Pestaña Brida B16.5 — exportación (pantalla / PDF / Excel / DXF) ─
// Sin "bore": es el ID de caño Sch 40 supuesto, no una dimensión de B16.5.
export function construirBridaB165(clase: string, nps: string, proyecto: string) {
  const fd = B165[clase]?.[nps] ?? null;
  const f2f_mm = F2F_COMPUERTA[clase]?.[nps] ?? null;
  if (!fd) return { fd: null, f2f_mm, payload: null };
  return {
    fd, f2f_mm,
    payload: {
      tipo: 'VALVULAS_BRIDA_B16_5',
      normativa: 'ASME B16.5-2017',
      parametros: {
        'NPS (pulg)': nps,
        'Clase de presion': clase,
        'Proyecto': proyecto || 'Sin nombre',
        'F2F ASME B16.10 (mm)': f2f_mm ?? NO_DISPONIBLE,
      },
      resultado: {
        'OD exterior (pulg)': fd.OD,
        'BC circulo pernos (pulg)': fd.BC,
        'Numero de pernos': fd.n,
        'Diametro perno (pulg)': fd.db,
        'OD (mm)': mm1(fd.OD),
        'BC (mm)': mm1(fd.BC),
        'Fuente dimensiones de brida': FUENTE_B165,
      } as Record<string, unknown>,
    },
  };
}
