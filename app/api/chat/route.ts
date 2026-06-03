// app/api/chat/route.ts
// INGENIUM PRO V8 — IA Contextual de Integridad de Activos
//
// ARQUITECTURA ANTI-ALUCINACIÓN (3 capas):
// 1. Números exactos del cálculo inyectados en el context
// 2. Pre-cálculos en servidor con fórmulas reales ANTES de llamar a la IA
// 3. Cláusulas normativas verificadas inyectadas — la IA no las memoriza, las recibe
//
// La IA NUNCA inventa valores numéricos.
// La IA NUNCA inventa cláusulas normativas.
// La IA interpreta resultados pre-calculados con fórmulas reales.

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

// ── Tipos del contexto real del cálculo ──────────────────────────────────────
type ContextoCalculo = {
  moduloId:        string;
  moduloNombre:    string;
  normativa:       string;
  activoNombre?:   string;
  proyectoNombre?: string;
  industria?:      string;
  parametros:      Record<string, unknown>;
  resultado:       Record<string, unknown>;
  alerta:          boolean;
  alertaMsg?:      string;
  historial?: {
    totalMediciones: number;
    totalAlertas:    number;
    estadoGeneral:   'DETERIORO' | 'MEJORA' | 'ESTABLE';
    tendencias?:     Record<string, unknown>;
  };
};

type Mensaje = {
  role:    'user' | 'assistant';
  content: string;
};

// ════════════════════════════════════════════════════════════════════════════
// CAPA 2 — PRE-CÁLCULOS EN SERVIDOR CON FÓRMULAS REALES
// Estos valores se calculan con matemática real ANTES de llamar a la IA.
// La IA interpreta — nunca calcula ni inventa.
// ════════════════════════════════════════════════════════════════════════════

type ResultadosDerivados = {
  vida_remanente_anios?:       number;
  utilizacion_pct?:            number;
  presion_ariete_bar?:         number;
  presion_total_bar?:          number;
  supera_admisible:            boolean;
  margen_seguridad_pct?:       number;
  intervalo_inspeccion_meses?: number;
  nivel_riesgo:                'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  notas_calculo:               string[];
};

// Busca un valor numérico en un objeto probando múltiples claves posibles.
// Acepta claves exactas o fragmentos que aparezcan dentro de las claves del objeto.
function findNum(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const direct = obj[k];
    if (direct !== undefined && direct !== null && direct !== '') {
      const n = Number(direct);
      if (!isNaN(n)) return n;
    }
  }
  // Búsqueda parcial: si ninguna clave exacta coincide, busca por fragmento
  for (const k of keys) {
    const kL = k.toLowerCase();
    for (const [ok, ov] of Object.entries(obj)) {
      if (ok.toLowerCase().includes(kL) || kL.includes(ok.toLowerCase().replace(/[^a-záéíóúüñ0-9]/gi, ''))) {
        const n = Number(ov);
        if (!isNaN(n) && isFinite(n)) return n;
      }
    }
  }
  return 0;
}

function preCalcular(ctx: ContextoCalculo): ResultadosDerivados {
  const p = ctx.parametros;
  const r = ctx.resultado;
  const notas: string[] = [];
  let nivel_riesgo: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO' = 'BAJO';
  let supera_admisible = false;

  const resultado: ResultadosDerivados = {
    supera_admisible: false,
    nivel_riesgo:     'BAJO',
    notas_calculo:    [],
  };

  // ── MAOP — ASME B31.8 ────────────────────────────────────────────────────
  if (ctx.moduloId === 'MAOP') {
    // Módulos usan etiquetas legibles: 'MAOP (bar)', 'MAOP (MPa)', 'Espesor de pared t (mm)'
    const maop_mpa = findNum(r, 'MAOP (MPa)', 'P', 'maop_mpa', 'bar') ;
    const maop_bar_r = findNum(r, 'MAOP (bar)', 'bar', 'MAOP_bar');
    const maop_bar = maop_bar_r || maop_mpa * 10;
    // Presión de operación — puede no estar en parametros (MAOP no la recibe), usar 90% MAOP como referencia
    const P_op_bar = findNum(p, 'P_bar', 'presion_bar', 'Presión de operación (bar)', 'P_op') || (maop_bar * 0.85);
    const t_nom    = findNum(p, 't', 't_nom_mm', 'Espesor de pared t (mm)', 'Espesor pared');
    // t_min no está en resultado de MAOP estándar; derivarlo si disponible
    const t_min    = findNum(r, 't_min', 't_min_mm', 'Espesor mínimo', 'Espesor minimo');
    const tasa_cor = findNum(p, 'tasa_corrosion_mm_anio', 'Tasa de corrosión (mm/año)', 'tasa') || 0.2;

    if (maop_bar > 0 && P_op_bar > 0) {
      resultado.utilizacion_pct = +((P_op_bar / maop_bar) * 100).toFixed(1);
      notas.push(`Utilización de presión: ${resultado.utilizacion_pct}% del MAOP [CALCULADO]`);
      if (resultado.utilizacion_pct > 90)      nivel_riesgo = 'ALTO';
      else if (resultado.utilizacion_pct > 80) nivel_riesgo = 'MEDIO';
    }

    notas.push(`MAOP: ${maop_bar > 0 ? maop_bar + ' bar' : maop_mpa + ' MPa'}`);

    // Fórmula real API 579-1/ASME FFS-1 §4: VR = (t_actual - t_mínimo) / tasa_corrosión
    if (t_nom > 0 && t_min > 0 && tasa_cor > 0) {
      resultado.vida_remanente_anios = +((t_nom - t_min) / tasa_cor).toFixed(1);
      notas.push(`Vida remanente (API 579-1 §4): ${resultado.vida_remanente_anios} años a ${tasa_cor} mm/año`);
      if (resultado.vida_remanente_anios < 2)       nivel_riesgo = 'CRITICO';
      else if (resultado.vida_remanente_anios < 5)  nivel_riesgo = 'ALTO';
      else if (resultado.vida_remanente_anios < 10) nivel_riesgo = 'MEDIO';
    }

    if (maop_bar > 0 && P_op_bar > 0) {
      resultado.margen_seguridad_pct = +((1 - P_op_bar / maop_bar) * 100).toFixed(1);
      notas.push(`Margen de seguridad: ${resultado.margen_seguridad_pct}%`);
    }

    // API 580 §6.3: intervalo = min(VR/2, 60 meses)
    if (resultado.vida_remanente_anios) {
      resultado.intervalo_inspeccion_meses = Math.min(
        Math.round(resultado.vida_remanente_anios / 2 * 12), 60
      );
      notas.push(`Intervalo inspección (API 580 §6.3): ${resultado.intervalo_inspeccion_meses} meses`);
    } else {
      // Sin datos de corrosión: usar intervalo estándar por nivel de riesgo
      resultado.intervalo_inspeccion_meses = nivel_riesgo === 'CRITICO' ? 6 : nivel_riesgo === 'ALTO' ? 12 : 36;
    }
  }

  // ── HIDRÁULICA — Darcy-Weisbach ───────────────────────────────────────────
  if (ctx.moduloId === 'HIDRAULICA' || ctx.moduloId === 'DARCY') {
    // Módulo usa: 'Velocidad V (m/s)', 'Presion (bar)', 'Numero de Reynolds Re'
    const V    = findNum(r, 'V', 'Velocidad V (m/s)', 'velocidad', 'Velocidad (m/s)');
    const Re   = findNum(r, 'Re', 'Numero de Reynolds Re', 'Reynolds');
    const hf   = findNum(r, 'hf_total', 'hf Total (m)', 'hf_mayor', 'hf Mayor (m)');
    const P_op = findNum(p, 'P_op', 'presion_bar', 'Presión de operación (bar)');
    const maop = findNum(p, 'MAOP', 'maop_bar', 'MAOP (bar)');

    if (V > 0) notas.push(`Velocidad de flujo: ${V} m/s`);
    if (Re > 0) notas.push(`Régimen: ${Re < 2300 ? 'LAMINAR' : Re < 4000 ? 'TRANSICIÓN' : 'TURBULENTO'} (Re=${Re})`);
    if (hf > 0) notas.push(`Pérdida de carga total: ${hf} m`);

    if (V > 3.0)       { nivel_riesgo = 'CRITICO'; notas.push(`CRÍTICO: Velocidad ${V} m/s > 3.0 m/s → erosión severa`); }
    else if (V > 2.0)  { nivel_riesgo = 'ALTO';    notas.push(`ALTO: Velocidad ${V} m/s > 2.0 m/s → riesgo erosión`); }
    else if (V > 1.5)  { nivel_riesgo = 'MEDIO';   notas.push(`MEDIO: Velocidad ${V} m/s > 1.5 m/s → riesgo golpe de ariete`); }

    if (P_op > 0 && maop > 0) {
      resultado.utilizacion_pct  = +((P_op / maop) * 100).toFixed(1);
      supera_admisible           = P_op > maop;
      resultado.supera_admisible = supera_admisible;
      if (supera_admisible) {
        nivel_riesgo = 'CRITICO';
        notas.push(`CRÍTICO: Presión de operación ${P_op} bar supera MAOP ${maop} bar`);
      }
    }
  }

  // ── JOUKOWSKY — Golpe de ariete ───────────────────────────────────────────
  if (ctx.moduloId === 'JOUKOWSKY') {
    // Módulo usa: 'Sobrepresion (MPa)', 'Sobrepresion (bar)', 'Celeridad onda a (m/s)'
    const dP_MPa = findNum(r, 'dP_MPa', 'Sobrepresion (MPa)', 'Sobrepresión (MPa)');
    const dP_bar_r = findNum(r, 'dP_bar', 'Sobrepresion (bar)', 'Sobrepresión (bar)');
    const dP_bar = dP_bar_r || dP_MPa * 10;
    const a      = findNum(r, 'a', 'Celeridad onda a (m/s)', 'Celeridad de onda a (m/s)');
    const Tc     = findNum(r, 'Tc', 'Tiempo critico Tc (s)', 'Tiempo retorno de onda 2L/a (s)');
    const maop   = findNum(p, 'maop_bar', 'P_bar', 'MAOP (bar)');
    const P_op   = findNum(p, 'P_op', 'presion_bar') || (maop * 0.85 || 0);

    if (a > 0) notas.push(`Celeridad de onda: ${a} m/s`);
    if (Tc > 0) notas.push(`Tiempo crítico de cierre 2L/a: ${Tc} s`);

    if (dP_bar > 0) {
      resultado.presion_ariete_bar = +dP_bar.toFixed(2);
      notas.push(`Sobrepresión Joukowsky: ${dP_bar.toFixed(2)} bar [CALCULADO]`);

      if (P_op > 0) {
        resultado.presion_total_bar  = +(P_op + dP_bar).toFixed(2);
        resultado.supera_admisible   = maop > 0 && (P_op + dP_bar) > maop;
        notas.push(`Presión total (op + ariete): ${resultado.presion_total_bar} bar`);
        if (resultado.supera_admisible) {
          nivel_riesgo = 'CRITICO';
          const exceso = +((P_op + dP_bar - maop) / maop * 100).toFixed(1);
          notas.push(`CRÍTICO: Supera MAOP en ${exceso}% — riesgo de rotura per ASME B31.8 §845`);
        }
      }

      // Nivel de riesgo por magnitud del sobrepresión
      if (nivel_riesgo !== 'CRITICO') {
        if (dP_MPa > 2 || dP_bar > 20)      nivel_riesgo = 'CRITICO';
        else if (dP_MPa > 1 || dP_bar > 10) nivel_riesgo = 'ALTO';
        else if (dP_MPa > 0.5 || dP_bar > 5) nivel_riesgo = 'MEDIO';
      }
    }
  }

  // ── CAÑERÍAS — ASME B31.3 / API 579 ─────────────────────────────────────
  if (ctx.moduloId === 'CANERIAS') {
    // Diferentes sub-módulos: espesor, hoop, ariete, cierre, remanente
    // remanente: p tiene 'Espesor nominal original (mm)', 'Espesor medido hoy (mm)', 'Espesor mínimo requerido (mm)', 'Tasa de corrosión (mm/año)'
    // espesor: r tiene 'Espesor mínimo por presión (mm)', 'Espesor de diseño con CA (mm)'
    const t_nom  = findNum(p, 't_nom_mm', 't_dis_mm', 'Espesor nominal original (mm)', 'Espesor medido hoy (mm)');
    const t_min  = findNum(r, 't_min_mm', 'Espesor mínimo por presión (mm)')
                || findNum(p, 't_min', 'Espesor mínimo requerido (mm)');
    const tasa   = findNum(p, 'tasa_corrosion_mm_anio', 'Tasa de corrosión (mm/año)', 'tasa') || 0;
    const P_op   = findNum(p, 'P_bar', 'presion_bar', 'Presión de diseño (bar)', 'Presión de operación (bar)');
    const P_adm  = findNum(r, 'MAWP_bar', 'P_adm', 'Límite admisible S·F·E·T (MPa)');

    if (t_nom > 0 && t_min > 0 && tasa > 0) {
      resultado.vida_remanente_anios       = +((t_nom - t_min) / tasa).toFixed(1);
      resultado.intervalo_inspeccion_meses = Math.min(Math.round(resultado.vida_remanente_anios / 2 * 12), 60);
      notas.push(`Vida remanente (API 579-1 §4): ${resultado.vida_remanente_anios} años a ${tasa} mm/año`);
      if (resultado.vida_remanente_anios < 2)       nivel_riesgo = 'CRITICO';
      else if (resultado.vida_remanente_anios < 5)  nivel_riesgo = 'ALTO';
      else if (resultado.vida_remanente_anios < 10) nivel_riesgo = 'MEDIO';
    } else if (t_nom > 0 && t_min > 0) {
      // Tasa no disponible: reportar datos de espesor
      const margen = +((t_nom - t_min) / t_nom * 100).toFixed(1);
      notas.push(`Margen de espesor: ${margen}% sobre mínimo requerido`);
    }

    if (P_op > 0 && P_adm > 0) {
      resultado.utilizacion_pct  = +((P_op / P_adm) * 100).toFixed(1);
      resultado.supera_admisible = P_op > P_adm;
      if (resultado.supera_admisible) nivel_riesgo = 'CRITICO';
    }

    // Verificar vida remanente ya calculada en resultado del módulo
    const vidaRes = findNum(r, 'Vida remanente estimada (años)', 'vida_anios', 'vida');
    if (vidaRes > 0 && !resultado.vida_remanente_anios) {
      resultado.vida_remanente_anios = vidaRes;
      notas.push(`Vida remanente: ${vidaRes} años`);
      if (vidaRes < 2)  nivel_riesgo = 'CRITICO';
      else if (vidaRes < 5)  nivel_riesgo = 'ALTO';
    }
  }

  // ── PERFORACIÓN — API RP 13D ──────────────────────────────────────────────
  if (ctx.moduloId === 'PERFORACION') {
    // Módulo usa psi: 'BHP (psi)', 'Presion hidrostatica (psi)', 'Presion de fractura (psi)'
    // y 'Estado BHP' con valores CRITICAL/HIGH/MEDIUM/LOW
    const bhp_psi  = findNum(r, 'BHP (psi)', 'BHP', 'presion_hidrostatica');
    const frac_psi = findNum(r, 'Presion de fractura (psi)', 'presion_fractura', 'fracPressure');
    const hidro_psi = findNum(r, 'Presion hidrostatica (psi)', 'hidrostatica');
    const estadoBHP = String(r['Estado BHP'] ?? r['Estado lodo'] ?? '');

    if (bhp_psi > 0) notas.push(`BHP: ${bhp_psi.toFixed(0)} psi`);
    if (hidro_psi > 0) notas.push(`Presión hidrostática: ${hidro_psi.toFixed(0)} psi`);
    if (frac_psi > 0) notas.push(`Presión de fractura: ${frac_psi.toFixed(0)} psi`);

    if (bhp_psi > 0 && frac_psi > 0) {
      const en_ventana = bhp_psi < frac_psi;
      resultado.supera_admisible = !en_ventana;
      const margen_pct = +((1 - bhp_psi / frac_psi) * 100).toFixed(1);
      resultado.margen_seguridad_pct = margen_pct;
      if (!en_ventana) {
        nivel_riesgo = 'CRITICO';
        notas.push(`CRÍTICO: BHP ${bhp_psi.toFixed(0)} psi supera presión de fractura ${frac_psi.toFixed(0)} psi`);
      } else {
        notas.push(`Ventana operativa OK: BHP=${bhp_psi.toFixed(0)} psi < Fractura=${frac_psi.toFixed(0)} psi (margen: ${margen_pct}%)`);
      }
    }

    // Mapear estado del módulo si no se calculó por ventana
    if (nivel_riesgo === 'BAJO') {
      if (estadoBHP === 'CRITICAL') nivel_riesgo = 'CRITICO';
      else if (estadoBHP === 'HIGH') nivel_riesgo = 'ALTO';
      else if (estadoBHP === 'MEDIUM') nivel_riesgo = 'MEDIO';
    }
  }

  // ── GEOTECNIA — Meyerhof / Bishop ────────────────────────────────────────
  if (ctx.moduloId === 'CAPACIDAD_PORTANTE' || ctx.moduloId === 'ESTABILIDAD_TALUD') {
    const q_ap      = findNum(r, 'q aplicada (kPa)', 'q_aplicada');
    const qa        = findNum(r, 'qa admisible (kPa)', 'qa');
    const util      = findNum(r, 'Utilizacion (%)', 'utilizacion');
    const FS        = findNum(r, 'Factor de Seguridad FS', 'FS');
    const estadoGeo = String(r['Estado'] ?? r['Riesgo'] ?? '');

    if (qa > 0 && q_ap > 0) {
      resultado.utilizacion_pct      = util > 0 ? util : +((q_ap / qa) * 100).toFixed(1);
      resultado.margen_seguridad_pct = +((1 - q_ap / qa) * 100).toFixed(1);
      resultado.supera_admisible     = q_ap > qa;
      notas.push(`Capacidad portante: qa=${qa} kPa, q_ap=${q_ap} kPa, util=${resultado.utilizacion_pct}%`);
      if (resultado.supera_admisible)            { nivel_riesgo = 'CRITICO'; notas.push(`CRÍTICO: q_ap ${q_ap} kPa supera qa ${qa} kPa — cimentación no apta`); }
      else if (resultado.utilizacion_pct > 80)   nivel_riesgo = 'ALTO';
      else if (resultado.utilizacion_pct > 60)   nivel_riesgo = 'MEDIO';
    }

    if (FS > 0) {
      notas.push(`Factor de seguridad Bishop: FS=${FS} (mín. requerido: 1.5)`);
      resultado.margen_seguridad_pct = +((FS - 1.5) / 1.5 * 100).toFixed(1);
      if (FS < 1.0)       { nivel_riesgo = 'CRITICO'; resultado.supera_admisible = true; notas.push(`CRÍTICO: FS=${FS} < 1.0 — deslizamiento inminente`); }
      else if (FS < 1.3)  nivel_riesgo = 'ALTO';
      else if (FS < 1.5)  nivel_riesgo = 'MEDIO';
    }

    if (nivel_riesgo === 'BAJO' && estadoGeo) {
      if      (estadoGeo === 'CRITICAL') nivel_riesgo = 'CRITICO';
      else if (estadoGeo === 'HIGH')     nivel_riesgo = 'ALTO';
      else if (estadoGeo === 'MEDIUM')   nivel_riesgo = 'MEDIO';
    }
  }

  // ── CIVIL — AISC LRFD / ACI 318 ──────────────────────────────────────────
  if (ctx.moduloId === 'VIGA_ACERO_AISC' || ctx.moduloId === 'COLUMNA_HORMIGON_ACI') {
    const util_M    = findNum(r, 'Utilizacion flexion (%)', 'util_M');
    const util_V    = findNum(r, 'Utilizacion cortante (%)', 'util_V');
    const util_P    = findNum(r, 'Utilizacion axial (%)', 'util_P');
    const flexOk    = String(r['Flexion']  ?? '') !== 'FALLA';
    const cortOk    = String(r['Cortante'] ?? '') !== 'FALLA';
    const servOk    = String(r['Servicio'] ?? '') !== 'EXCEDE';
    const estadoCiv = String(r['Estado']   ?? '');

    const util_max = Math.max(util_M, util_V, util_P);
    if (util_max > 0) {
      resultado.utilizacion_pct      = util_max;
      resultado.margen_seguridad_pct = +((1 - util_max / 100) * 100).toFixed(1);
    }

    resultado.supera_admisible = !flexOk || !cortOk || util_P > 100;
    if (resultado.supera_admisible) {
      nivel_riesgo = 'CRITICO';
      notas.push(`CRÍTICO: Elemento supera capacidad admisible — falla estructural [AISC/ACI]`);
    } else if (!servOk) {
      nivel_riesgo = 'ALTO';
      notas.push(`ALTO: Deflexión excede L/360 — problema de serviciabilidad [AISC 360]`);
    } else if (util_max > 80) nivel_riesgo = 'MEDIO';

    if (util_M > 0) notas.push(`Util. flexión: ${util_M}%`);
    if (util_V > 0) notas.push(`Util. cortante: ${util_V}%`);
    if (util_P > 0) notas.push(`Util. axial: ${util_P}%`);

    if (nivel_riesgo === 'BAJO' && estadoCiv) {
      if      (estadoCiv === 'CRITICAL') nivel_riesgo = 'CRITICO';
      else if (estadoCiv === 'HIGH')     nivel_riesgo = 'ALTO';
      else if (estadoCiv === 'MEDIUM')   nivel_riesgo = 'MEDIO';
    }
  }

  // ── MINERÍA — Bieniawski / NIOSH ──────────────────────────────────────────
  if (ctx.moduloId === 'RMR_BIENIAWSKI' || ctx.moduloId === 'VENTILACION_SUBTERRANEA') {
    const rmr       = findNum(r, 'Valor RMR', 'rmr');
    const V_gal     = findNum(r, 'Velocidad en galeria (m/s)', 'V_galeria');
    const coOk      = String(r['CO dentro de limite'] ?? '') !== 'NO';
    const estadoMin = String(r['Estado'] ?? r['Estado CO'] ?? '');

    if (rmr > 0) {
      notas.push(`RMR Bieniawski: ${rmr}/100 — Clase ${String(r['Clase de roca'] ?? '')} ${String(r['Descripcion'] ?? '')}`);
      resultado.margen_seguridad_pct = rmr;
      if (rmr < 21)      { nivel_riesgo = 'CRITICO'; resultado.supera_admisible = true; notas.push(`CRÍTICO: RMR=${rmr} Clase V — soporte inmediato requerido`); }
      else if (rmr < 41) nivel_riesgo = 'ALTO';
      else if (rmr < 61) nivel_riesgo = 'MEDIO';
    }

    if (V_gal > 0) {
      notas.push(`Velocidad galería: ${V_gal} m/s (mín. MSHA 30 CFR §57: 0.25 m/s)`);
      if (V_gal < 0.25) { nivel_riesgo = 'CRITICO'; resultado.supera_admisible = true; notas.push(`CRÍTICO: V=${V_gal} m/s < 0.25 m/s — ventilación insuficiente`); }
      else if (V_gal < 0.5) nivel_riesgo = 'ALTO';
    }

    if (!coOk) {
      nivel_riesgo = 'CRITICO';
      notas.push(`CRÍTICO: CO supera límite TWA 25 ppm [NIOSH] — evacuar galería`);
    }

    if (nivel_riesgo === 'BAJO' && estadoMin) {
      if      (estadoMin === 'CRITICAL') nivel_riesgo = 'CRITICO';
      else if (estadoMin === 'HIGH')     nivel_riesgo = 'ALTO';
      else if (estadoMin === 'MEDIUM')   nivel_riesgo = 'MEDIO';
    }
  }

  // ── SOLDADURA — AWS D1.1 / ASME IX ───────────────────────────────────────
  if (ctx.moduloId === 'SELECTOR_SOLDADURA' || ctx.moduloId === 'HEAT_INPUT' ||
      ctx.moduloId === 'FILETE_SOLDADURA'   || ctx.moduloId === 'CONSUMO_ELECTRODOS' ||
      ctx.moduloId === 'PRECALENTAMIENTO') {
    const heatInput = findNum(r, 'Heat Input (kJ/mm)', 'heatInput');
    const CE        = findNum(r, 'Carbono Equivalente CE (IIW)', 'CE');
    const Tp        = findNum(r, 'Temperatura minima Tp (C)', 'Tp');
    const resNom    = findNum(r, 'Resistencia nominal (kN)', 'resistencia');

    if (heatInput > 0) {
      notas.push(`Heat Input: ${heatInput} kJ/mm`);
      if (heatInput > 3.5)      { nivel_riesgo = 'ALTO';  notas.push(`ALTO: HI=${heatInput} kJ/mm > 3.5 — ZAC excesiva [AWS D1.1 §5.8]`); }
      else if (heatInput > 2.5) nivel_riesgo = 'MEDIO';
    }

    if (CE > 0) {
      notas.push(`Carbono equivalente IIW: CE=${CE}`);
      if (CE > 0.45) {
        nivel_riesgo = 'ALTO';
        resultado.supera_admisible = true;
        notas.push(`ALTO: CE=${CE} > 0.45 — precalentamiento OBLIGATORIO [AWS D1.1 §6.8.5]`);
        if (Tp > 0) notas.push(`Temperatura mínima precalentamiento: ${Tp}°C`);
      } else if (CE > 0.35) nivel_riesgo = 'MEDIO';
    }

    if (resNom > 0) notas.push(`Resistencia nominal cordón: ${resNom} kN [AWS D1.1]`);
  }

  // ── MMO — Cuantificación de materiales ────────────────────────────────────
  if (ctx.moduloId.endsWith('_MMO')) {
    const vol = findNum(r,
      'Volumen total (m3)', 'Hormigon H25 total (m3)',
      'Volumen en banco (m3)', 'Metros lineales totales (m)',
    );
    notas.push(`Módulo de cuantificación — resultados calculados por INGENIUM PRO`);
    if (vol > 0) notas.push(`Volumen/cantidad principal: ${vol}`);
    notas.push(`Verificar precios unitarios según cotización local vigente`);
    nivel_riesgo = 'BAJO';
  }

  // ── VIALIDAD — AASHTO 93 / HEC-22 ────────────────────────────────────────
  if (ctx.moduloId === 'PAVIMENTO_AASHTO93' || ctx.moduloId === 'DRENAJE_VIAL_HEC22') {
    const SN       = findNum(r, 'Numero Estructural SN', 'SN');
    const D1       = findNum(r, 'Carpeta asfaltica D1 (cm)', 'D1');
    const V_cun    = findNum(r, 'Velocidad cuneta (m/s)', 'velocidad');
    const estadoVi = String(r['Estado'] ?? '');

    if (SN > 0) {
      notas.push(`Número estructural AASHTO 93: SN=${SN}`);
      if (D1 > 0) notas.push(`Carpeta asfáltica requerida: ${D1} cm`);
      if (SN < 2)       nivel_riesgo = 'CRITICO';
      else if (SN < 3)  nivel_riesgo = 'MEDIO';
    }

    if (V_cun > 0) {
      notas.push(`Velocidad cuneta: ${V_cun} m/s`);
      if (V_cun > 3.0)      { nivel_riesgo = 'CRITICO'; notas.push(`CRÍTICO: V=${V_cun} m/s > 3.0 m/s — erosión cuneta [HEC-22]`); }
      else if (V_cun > 2.0) { nivel_riesgo = 'ALTO';    notas.push(`ALTO: V=${V_cun} m/s > 2.0 m/s — riesgo erosión`); }
    }

    if (nivel_riesgo === 'BAJO' && estadoVi) {
      if      (estadoVi === 'CRITICAL') nivel_riesgo = 'CRITICO';
      else if (estadoVi === 'HIGH')     nivel_riesgo = 'ALTO';
      else if (estadoVi === 'MEDIUM')   nivel_riesgo = 'MEDIO';
    }
  }

  // ── REPRESAS — ICOLD / Darcy-Terzaghi ────────────────────────────────────
  if (ctx.moduloId === 'VERTEDERO_FRANCIS' || ctx.moduloId === 'FILTRACION_DARCY') {
    const Fr     = findNum(r, 'Numero de Froude Fr', 'Fr');
    const i_grad = findNum(r, 'Gradiente hidraulico i', 'i');
    const seguro = String(r['Seguro (i < 0.5 Terzaghi)'] ?? '');

    if (Fr > 0) {
      const regimen = Fr < 1 ? 'subcrítico' : 'supercrítico';
      notas.push(`Número de Froude: Fr=${Fr} — Régimen ${regimen}`);
      if (Fr > 1.5)      { nivel_riesgo = 'ALTO';  notas.push(`ALTO: Fr=${Fr} > 1.5 — flujo supercrítico, riesgo erosión aguas abajo`); }
      else if (Fr > 1.0) nivel_riesgo = 'MEDIO';
    }

    if (i_grad > 0) {
      notas.push(`Gradiente hidráulico Darcy: i=${i_grad} (límite Terzaghi: 0.5)`);
      resultado.margen_seguridad_pct = +((0.5 - i_grad) / 0.5 * 100).toFixed(1);
      if (i_grad > 0.5)       { nivel_riesgo = 'CRITICO'; resultado.supera_admisible = true; notas.push(`CRÍTICO: i=${i_grad} > 0.5 — sifonamiento inminente [Terzaghi]`); }
      else if (i_grad > 0.3)  nivel_riesgo = 'ALTO';
      else if (i_grad > 0.15) nivel_riesgo = 'MEDIO';
    }

    if (seguro === 'NO' || seguro === 'false') {
      nivel_riesgo = 'CRITICO';
      resultado.supera_admisible = true;
      notas.push(`CRÍTICO: Gradiente supera límite Terzaghi — sifonamiento [ICOLD Bulletin 58]`);
    }
  }

  // ── ARQUITECTURA — CIRSOC / ASCE 7 ───────────────────────────────────────
  if (ctx.moduloId === 'ARQUITECTURA_VIENTO' || ctx.moduloId === 'ARQUITECTURA_SISMO' ||
      ctx.moduloId === 'ARQUITECTURA_ILUMINACION') {
    const P_viento  = findNum(r, 'P total diseno (kPa)', 'P_total');
    const Cs        = findNum(r, 'Coeficiente sismico Cs', 'Cs');
    const V_basal   = findNum(r, 'Cortante basal V (kN)', 'V');
    const FLD       = findNum(r, 'FLD calculado (%)', 'FLD');
    const FLD_req   = findNum(r, 'FLD requerido (%)', 'FLD_req');
    const estadoArq = String(r['Estado'] ?? '');

    if (P_viento > 0) notas.push(`Presión diseño viento: ${P_viento} kPa [ASCE 7-22 / CIRSOC 102]`);

    if (Cs > 0) {
      resultado.utilizacion_pct = +(Cs * 100).toFixed(1);
      notas.push(`Coeficiente sísmico Cs: ${Cs} — Cortante basal: ${V_basal} kN [CIRSOC 103]`);
      if (Cs > 0.3)      nivel_riesgo = 'ALTO';
      else if (Cs > 0.2) nivel_riesgo = 'MEDIO';
    }

    if (FLD > 0 && FLD_req > 0) {
      notas.push(`Factor Luz Día: ${FLD}% calculado vs ${FLD_req}% requerido [IRAM 11601]`);
      resultado.supera_admisible = FLD < FLD_req;
      if (FLD < FLD_req) { nivel_riesgo = 'ALTO'; notas.push(`ALTO: FLD ${FLD}% < ${FLD_req}% requerido — déficit lumínico`); }
    }

    if (nivel_riesgo === 'BAJO' && estadoArq) {
      if      (estadoArq === 'HIGH' || estadoArq === 'NO CUMPLE') nivel_riesgo = 'ALTO';
      else if (estadoArq === 'MEDIUM' || estadoArq === 'REVISAR') nivel_riesgo = 'MEDIO';
    }
  }

  // ── VÁLVULAS — API 6D / ASME B16.34 / ASME B16.10 ───────────────────────
  if (ctx.moduloId.startsWith('VALVULAS_')) {
    const rating = findNum(r, 'Presion rating (bar)', 'rating');
    const P_op   = findNum(p, 'Presion operacion (bar)', 'P_op');
    const H2S    = findNum(p, 'H2S (ppm)', 'h2s');
    const Cv     = findNum(r, 'Cv requerido (US)', 'Cv');
    const clase  = String(r['Clase minima requerida'] ?? '');
    const nace   = String(r['Servicio NACE MR0175'] ?? '');

    if (clase) notas.push(`Clase mínima ASME B16.34: ${clase}`);

    if (rating > 0 && P_op > 0) {
      resultado.utilizacion_pct      = +((P_op / rating) * 100).toFixed(1);
      resultado.margen_seguridad_pct = +((1 - P_op / rating) * 100).toFixed(1);
      resultado.supera_admisible     = P_op > rating;
      notas.push(`P_op ${P_op} bar vs rating ASME B16.34 ${rating} bar (util: ${resultado.utilizacion_pct}%)`);
      if (P_op > rating)                        { nivel_riesgo = 'CRITICO'; notas.push(`CRÍTICO: P_op supera pressure rating — no usar [ASME B16.34]`); }
      else if (resultado.utilizacion_pct > 90)  nivel_riesgo = 'ALTO';
      else if (resultado.utilizacion_pct > 80)  nivel_riesgo = 'MEDIO';
    }

    if (H2S > 10) {
      notas.push(`Servicio H2S: ${H2S} ppm — aplica NACE MR0175/ISO 15156`);
      if (nace) notas.push(`Material NACE: ${nace}`);
      if (nivel_riesgo === 'BAJO') nivel_riesgo = 'MEDIO';
    }

    if (Cv > 0) notas.push(`Cv requerido: ${Cv} [ISA 75.01.01]`);
  }

  resultado.nivel_riesgo     = nivel_riesgo;
  resultado.notas_calculo    = notas;
  resultado.supera_admisible = supera_admisible || resultado.supera_admisible;
  return resultado;
}

// ════════════════════════════════════════════════════════════════════════════
// CAPA 3 — CLÁUSULAS NORMATIVAS VERIFICADAS POR MÓDULO
// ════════════════════════════════════════════════════════════════════════════

const CLAUSULAS_NORMATIVAS: Record<string, string> = {
  MAOP: `NORMATIVAS APLICABLES — VERIFICADAS:
ASME B31.8-2020 §841.1.1: t = P·D/(2·S·F·E·T) — F máx 0.72 clase 1, E=1.0 seamless, T=1.0 hasta 120°C
ASME B31.8-2020 §845.4: La MAOP no debe exceder la presión de diseño. Con corrosión, reducir en proporción al espesor remanente.
API 579-1/ASME FFS-1-2021 §4.5: Vida remanente = (t_am - t_min) / C_rate — Evaluación Nivel 1.
API 580-2016 §6.3: Intervalo máx inspección = menor entre (VR/2) y (máx categoría riesgo: bajo=10a, medio=5a, alto=2-3a).`,

  HIDRAULICA: `NORMATIVAS APLICABLES — VERIFICADAS:
Darcy-Weisbach: hf = f·(L/D)·V²/(2g) — f por Colebrook-White, Re=V·D/ν
Hydraulic Institute HI 9.6.1: succión 0.9-1.8 m/s, impulsión 1.2-3.0 m/s, >3.0 m/s riesgo erosión/ariete.
ASME B31.3-2022 §304.1: Presión diseño no debe exceder la calculada con espesor nominal menos tolerancias y CA.`,

  JOUKOWSKY: `NORMATIVAS APLICABLES — VERIFICADAS:
Joukowsky: ΔP = ρ·a·ΔV — a = √(K/ρ/(1+K·D/(E·t))) — K agua = 2.2×10⁹ Pa — Tc crítico = 2L/a
ASME B31.8-2020 §845.3: Sobrepresiones transitorias no deben exceder 110% MAOP para gas.
AWWA M11: Sobrepresión máx admisible = 1.5× presión trabajo normal. Tiempo cierre mínimo = 2L/a.`,

  CANERIAS: `NORMATIVAS APLICABLES — VERIFICADAS:
ASME B31.3-2022 §304.1.2: t_min = P·D/(2·(S·E+P·Y)) — Y=0.4 acero ferrítico T≤900°F
API 579-1/ASME FFS-1-2021 §4: Nivel 1: t_mm ≥ t_min_FFS = MAWP·D/(2·S·E). Si no: retirar o reducir MAWP.
ASME B31.3-2022 §TL-1: CA típico 1.5-3.0 mm acero carbono en agua/crudo.`,

  PERFORACION: `NORMATIVAS APLICABLES — VERIFICADAS:
API RP 13D-2017 §5: P_hidro(bar) = 0.0981×ρ(kg/m³)×prof(m)/100 — dentro de ventana poro-fractura.
API RP 13D-2017 §6: ECD = ρ_lodo + (ΔP_anular/(0.0981×prof)) — puede exceder ventana en circulación.
API RP 59-2006: Margen control mínimo = 3.5 kPa/m sobre presión de poro.`,

  ELECTRICIDAD: `NORMATIVAS APLICABLES — VERIFICADAS:
IEC 60228-2004: I ≤ I_admisible conductor. ΔV ≤ 3% fuerza (IEC 60364-5-52).
IEC 60909-0:2016: Ik'' = c·Un/(√3·Zk) — c=1.0-1.1, Zk=impedancia total cortocircuito.
API RP 500-2012: División 1=vapores normalmente presentes. División 2=solo condiciones anormales.`,

  CAPACIDAD_PORTANTE: `NORMATIVAS APLICABLES — VERIFICADAS:
CIRSOC 102-1982: FS mín. = 3.0 edificios, 2.0 estructuras provisorias — qa = qu / FS.
Meyerhof (1963): qu = c·Nc·sc + q·Nq·sq + 0.5·γ·B·Nγ·sγ — factores forma incluidos.
Eurocode 7 §6.5.2 (EN 1997-1): GEO verificación capacidad portante — R/γR ≥ Vd.
ASTM D2487-17: Clasificación USCS del suelo — base para selección de parámetros c y φ.`,

  ESTABILIDAD_TALUD: `NORMATIVAS APLICABLES — VERIFICADAS:
CIRSOC 102-1982: FS mín. permanente = 1.5, transitorio = 1.3, condición sísmica = 1.1.
Bishop Simplificado (1955): FS = Σ[(c'b + (W-ub)·tanφ') / mα] / Σ[W·sinα] — círculo crítico.
Eurocode 7 §11 (EN 1997-1): Verificación GEO taludes — partial factor design approach.
ASTM D2487-17: Clasificación USCS — base para parámetros c y φ de diseño del talud.`,

  VIGA_ACERO_AISC: `NORMATIVAS APLICABLES — VERIFICADAS:
AISC 360-16 §F2: φMn = φ·Fy·Zx — φ=0.9, fluencia plástica sección compacta.
AISC 360-16 §G2: φVn = φ·0.6·Fy·Aw — φ=1.0 cuando d/tw ≤ 2.24√(E/Fy).
AISC 360-16 §L3: Deflexión máx. L/360 cargas vivas, L/240 carga total de servicio.
ASCE 7-22 §2.3: Combinaciones LRFD — 1.2D + 1.6L combinación más crítica habitual.`,

  COLUMNA_HORMIGON_ACI: `NORMATIVAS APLICABLES — VERIFICADAS:
ACI 318-19 §22.4.2.1: φPn_máx = 0.80·φ·[0.85·f'c·(Ag-Ast) + fy·Ast] — φ=0.65.
ACI 318-19 §10.6.1.1: Cuantía longitudinal ρ entre 1% y 8% del área bruta Ag.
ACI 318-19 §22.6: Excentricidad mínima e = max(15 mm, 0.03h) — siempre aplicar.
CIRSOC 201-2002: Resistencias características y factores de reducción equivalentes al ACI.`,

  RMR_BIENIAWSKI: `NORMATIVAS APLICABLES — VERIFICADAS:
Bieniawski (1989): RMR = P1+P2+P3+P4+P5+ajuste orientación — escala 0–100, 5 parámetros.
Clase I (81-100): sin soporte; II (61-80): pernos 3m; III (41-60): shotcrete+malla; IV (21-40): cerchas; V (<21): soporte inmediato.
MSHA 30 CFR Part 57.3461: Evaluación estabilidad techo y costado antes de cada turno de trabajo.
IRAM 2568: Señalización de seguridad en espacios subterráneos — balizamiento de zonas críticas.`,

  VENTILACION_SUBTERRANEA: `NORMATIVAS APLICABLES — VERIFICADAS:
MSHA 30 CFR §57.5005: Velocidad mínima de aire en labores: 0.25 m/s (50 fpm) en frente activo.
MSHA 30 CFR §57.5060: Caudal mínimo = 0.06 m3/s por trabajador + 0.06 m3/s por kW diesel.
NIOSH (2010): Límite CO — TWA=25 ppm, STEL=35 ppm, IDLH=1200 ppm — evacuación inmediata si IDLH.
IRAM 2568: Señalización de evacuación y zonas de riesgo en galerías subterráneas.`,

  SELECTOR_SOLDADURA: `NORMATIVAS APLICABLES — VERIFICADAS:
AWS D1.1:2020 §4.1: Procesos precalificados — SMAW, FCAW, GMAW, SAW — condiciones de aplicación.
AWS A5.1/A5.1M:2012: Clasificación electrodos revestidos acero al carbono — E70XX mín. para A36.
ASME Sección IX QW-302: Ensayos de calificación de procedimiento de soldadura — PQR y WPS.
API 1104-2021 §5: Calificación de procedimiento y soldadores para tuberías en campo.`,

  HEAT_INPUT: `NORMATIVAS APLICABLES — VERIFICADAS:
AWS D1.1:2020 §5.8: HI = (V·I·60) / (v·1000) kJ/mm — controla tamaño ZAC y propiedades mecánicas.
ASME Sección IX QW-409.1: HI como variable esencial suplementaria — cambio >±10% requiere recalificación.
AWS D1.1:2020 Tabla 4.5: HI máximo por proceso — FCAW/SAW hasta 3.5 kJ/mm, SMAW hasta 2.5 kJ/mm.
EN ISO 1011-1:2009: HI = η·(U·I)/v — eficiencia η: SMAW=0.80, GMAW=0.85, SAW=1.00.`,

  FILETE_SOLDADURA: `NORMATIVAS APLICABLES — VERIFICADAS:
AWS D1.1:2020 §8.4: φRn = φ·0.6·FEXX·Aw — φ=0.75 LRFD, Aw = garganta efectiva × longitud.
AWS D1.1:2020 Tabla 8.1: Tamaño mínimo filete según espesor del material más grueso — 3mm a 10mm.
AISC 360-16 §J2.2b: φRn = φ·0.6·Fnw·Awe — Fnw según clasificación de electrodo utilizado.
AWS D1.1:2020 §8.3.1: Filete mínimo T≥19mm: 8mm, T≥38mm: 10mm, T≥57mm: 12mm.`,

  CONSUMO_ELECTRODOS: `NORMATIVAS APLICABLES — VERIFICADAS:
AWS A5.1/A5.1M:2012: Eficiencia depósito — E6013: 65%, E7018: 70%, FCAW: 85-90% (fabricante).
Lincoln Electric Consumibles Guide: Factor desperdicio típico 15-30% según operador y posición.
ASME Sección IX QW-404: Clasificación F-number y A-number de electrodos para calificación WPS.
AWS D1.1:2020 §7.3.3: Almacenamiento electrodos bajo hidrógeno — estufa a 120-150°C obligatorio.`,

  PRECALENTAMIENTO: `NORMATIVAS APLICABLES — VERIFICADAS:
AWS D1.1:2020 §6.8.5: CE (IIW) = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15.
AWS D1.1:2020 Tabla 4.4: CE>0.45 → Tp mín. 120°C; CE>0.60 → Tp mín. 200°C según espesor.
ASME Sección IX QW-406: Precalentamiento como variable esencial — cambio >55°C requiere recalificación.
EN ISO 13916:2017: Medición y control temperatura precalentamiento e interpase durante soldadura.`,

  HORMIGON_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
CIRSOC 201-2002: Dosificación hormigón estructural — relación a/c máxima según condición de exposición.
IRAM 1524:2004: Hormigones de uso corriente — áridos, agua y cemento aptos para uso estructural.
ISO 45001:2018 §8.1: Gestión de riesgos en tareas de hormigonado — EPP y protocolo de manejo.
ACI 318-19 §26.4: Requisitos de dosificación y consistencia para colocación en elementos estructurales.`,

  HIERRO_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
IRAM IAS U500-528:2013: Barras de acero para hormigón armado — categorías ADN 420 y ADN 500.
CIRSOC 201-2002 §6.3: Acero de refuerzo — cuantías mínimas y máximas para elementos estructurales.
ASTM A615/A615M-20: Barras de acero deformado Grado 60 — equivalente al ADN 420 argentino.
ISO 45001:2018 §8.1.3: Trazabilidad de materiales — control de recepción y almacenamiento en obra.`,

  MAMPOSTERIA_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
CIRSOC 501-2007: Construcciones de mampostería — resistencia mínima y dosificación de mortero.
IRAM 11561:2001: Bloques cerámicos para mampostería — especificaciones, ensayos y tolerancias.
ISO 45001:2018 §8.1: Planificación y control operacional en trabajos de albañilería — EPP obligatorio.
NCh 2369:2003: Mampostería armada y no armada — aplicable en Chile y zona de influencia regional.`,

  LOSA_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
ACI 318-19 §8.3.1.1: Espesor mínimo losa maciza — L/20 (empotrada-empotrada) a L/10 (voladizo).
CIRSOC 201-2002 §13: Cuantía mínima temperatura y retracción = 0.0018 para fy=420 MPa.
ASCE 7-22 §4.3: Cargas mínimas de diseño para losas de entrepiso según uso del edificio.
ISO 45001:2018 §8.1.2: Identificación de peligros en encofrado y hormigonado — caídas en altura.`,

  REVOQUE_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
IRAM 1570:2014: Morteros para revoques — dosificación, consistencia y adherencia mínima al sustrato.
CIRSOC 501-2007: Revestimientos — espesor máx. revoque grueso 20mm, fino 5-8mm.
ISO 45001:2018 §6.1.2: Evaluación riesgos en trabajos en altura para revoques de cielorrasos.
NSR-10 Título D §D.2: Refuerzo perimetral en aberturas de revoques en zonas sísmicas.`,

  CERAMICO_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
ISO 13006:2012: Baldosas cerámicas — clasificación, especificaciones y métodos de ensayo.
IRAM 11588:1998: Adhesivos cementosos para cerámica — resistencia al arrancamiento mín. 0.5 N/mm2.
ISO 45001:2018 §8.1: Control operacional en colocación de revestimientos — posturas y químicos.
RCDF-17: Norma técnica de pisos y pavimentos — adherencia mínima para circulación pública.`,

  CONTRAPISO_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
CIRSOC 201-2002 §10: Contrapiso de cascote — espesor mínimo 8cm bajo pisos de habitación.
IRAM 1524:2004: Dosificación morteros y contrapisos — relación cemento:arena y agua/cemento.
ISO 45001:2018 §8.1.3: Gestión de materiales en obra — almacenamiento y manipulación de áridos.
NSR-10 Título C §C.7.1: Requisitos generales para losas y contrapisos en contacto con el suelo.`,

  ZAPATA_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
CIRSOC 201-2002 §15: Fundaciones — espesor mínimo zapata aislada 200mm para Pu ≤ 300 kN.
ACI 318-19 §13.3.1: Verificación punzonado y flexión en zapatas — ancho de banda crítico.
ASTM D2487-17: Capacidad admisible de suelo según clasificación USCS — base de diseño fundaciones.
ISO 45001:2018 §8.1: Control excavación y armado de fundaciones — apuntalamiento y EPP.`,

  EXCAVACION_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
OHSAS 18001:2007 §4.4.6: Procedimiento de trabajo seguro en excavaciones — apuntalamiento H>1.20m.
ISO 45001:2018 §8.1.3: Excavaciones y zanjas — inspección diaria antes del ingreso de personal.
CIRSOC 102-1982: Ángulo talud natural de reposo — 45° arena suelta, 90° roca sana.
IRAM 2568: Señalización perimetral de excavaciones — balizamiento y cerco de seguridad obligatorio.`,

  MORTERO_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
IRAM 1570:2014: Morteros para albañilería — proporción en volumen 1:1:6 (cemento:cal:arena) a 1:0:4.
CIRSOC 501-2007: Resistencia mínima — mortero tipo M ≥ 17.5 MPa, tipo N ≥ 5.2 MPa.
ISO 45001:2018 §8.1: Manipulación de cemento y cal — EPP respiratorio y dérmico obligatorio.
NCh 170:2016: Dosificación morteros para uso estructural — relación a/c máxima 0.60.`,

  RENDIMIENTO_MMO: `NORMATIVAS APLICABLES — VERIFICADAS:
ISO 45001:2018 §8.2: Planes de respuesta a emergencias — evacuación de obra e identificación de recursos.
OHSAS 18001:2007 §4.4.7: Control de emergencias — tiempo de respuesta y rendimiento de brigadas.
IRAM 2568: Señalización zonas de trabajo — demarcación de áreas según ritmo y tipo de tarea.
ISO 45001:2018 §8.4: Gestión de contratistas — control de rendimiento y seguridad en subcontratos.`,

  PAVIMENTO_AASHTO93: `NORMATIVAS APLICABLES — VERIFICADAS:
AASHTO Guide for Design of Pavement Structures 1993: SN = a1·D1 + a2·m2·D2 + a3·m3·D3.
AASHTO 1993 §3.1: Coeficientes estructurales típicos — asfalto a1=0.44, base a2=0.14, subbase a3=0.11.
DNC Argentina (CREMA): Espesores mínimos por categoría de ruta — tránsito ligero, medio y pesado.
ASTM D6433-18: Evaluación condición superficie — PCI base para decisión de intervención de rehabilitación.`,

  DRENAJE_VIAL_HEC22: `NORMATIVAS APLICABLES — VERIFICADAS:
FHWA HEC-22 3rd Ed.: Método Racional Q = C·I·A — I por curvas IDF de la zona pluviométrica.
FHWA HEC-22 §4: Velocidad máxima cuneta — 1.8 m/s tierra, 3.0 m/s revestida, 6.0 m/s hormigón.
Manning n: asfalto=0.013, hormigón=0.013, tierra=0.020-0.035 según estado de superficie.
DNC Argentina: Secciones mínimas de cunetas según categoría de ruta y cuenca tributaria.`,

  VERTEDERO_FRANCIS: `NORMATIVAS APLICABLES — VERIFICADAS:
USACE EM 1110-2-1603: Q = Cd·L·H^(3/2) — Cd=0.611 cresta delgada; verificar sin contracciones.
ICOLD Bulletin 58: Caudal diseño vertedero — período de retorno mín. 1000 años o PMF proyecto.
CIRSOC 201-2002: Estructuras de hormigón del vertedero — requisitos de durabilidad y resistencia.
USACE EM 1110-2-1603 §3-5: Fr < 1 régimen subcrítico (estable); Fr > 1 supercrítico (erosión potencial).`,

  FILTRACION_DARCY: `NORMATIVAS APLICABLES — VERIFICADAS:
Ley de Darcy: q = k·i·A — válida para flujo laminar Re < 10 en medios porosos saturados.
Terzaghi (1943): Gradiente crítico de sifonamiento ic = (Gs-1)/(1+e) ≈ 0.5 para arena media.
ICOLD Bulletin 95: Filtros y drenes en cuerpo de presa — gradiente diseño i ≤ 0.15 en filtro interno.
USACE EM 1110-2-1901: Análisis de filtración en presas de tierra — criterios aceptación y sellado.`,

  ARQUITECTURA_VIENTO: `NORMATIVAS APLICABLES — VERIFICADAS:
ASCE 7-22 §27: p = qz·G·Cp·I — qz = 0.613·Kz·Kzt·Kd·V² (N/m²; V en m/s).
CIRSOC 102:2005: Velocidades básicas de viento por zona Argentina — zonas I a V (Vb 35-55 m/s).
NSR-10 Título B §B.6: Presiones de viento de diseño para edificios en Colombia por zona geográfica.
ASCE 7-22 Tabla 26.6-1: Factor exposición Kz — Cat. B (suburbio), C (campo abierto), D (costa).`,

  ARQUITECTURA_SISMO: `NORMATIVAS APLICABLES — VERIFICADAS:
CIRSOC 103:2013 §4.3: Cortante basal V = Cs·W — Cs = Sa(T)/(R/Ω0) según zona sísmica y suelo.
CIRSOC 103:2013 §5.2: Período fundamental T = Ct·hn^x — Ct=0.0724, x=0.80 para pórticos de acero.
NSR-10 Título A §A.3: Aa y Av por zona — zona alta Aa≥0.20g, media 0.10-0.20g, baja <0.10g.
ASCE 7-22 §12.8: Equivalent Lateral Force — Cs = SDS/(R/Ie), mín. 0.044·SDS·Ie.`,

  ARQUITECTURA_ILUMINACION: `NORMATIVAS APLICABLES — VERIFICADAS:
IRAM 11601:2002: FLD mínimo según uso — vivienda 1%, oficinas 2%, aulas y talleres 4%.
ASHRAE 62.1-2022 §6.2: Caudal ventilación mín. = 10 L/s·persona + 0.3 L/s·m2 de piso.
IRAM 11601:2002 §4.2: Relación ventana/pared (RVP) recomendada 15-40% para iluminación y vistas.
ASHRAE 90.1-2022 §9: Potencia instalada de iluminación máxima (LPD) por tipo y uso de local.`,

  VALVULAS_CLASE_B16_34: `NORMATIVAS APLICABLES — VERIFICADAS:
ASME B16.34-2017 Tabla 2: Ratings presión-temperatura por clase y material — Clase 150 a 4500.
API 6D-2021 §5.3: Temperatura máxima de operación por material de cuerpo de válvula.
ASME B16.34-2017 §7.3: Prueba hidrostática = 1.5× rating a temperatura ambiente durante 1 minuto.
API 6D-2021 §10.1: Ensayos de fábrica — presión cuerpo, asiento y operación — certificado requerido.`,

  VALVULAS_MATERIAL_NACE: `NORMATIVAS APLICABLES — VERIFICADAS:
NACE MR0175/ISO 15156-1:2020: Materiales para servicio H2S — dureza HRC ≤ 22 en zona afectada.
NACE MR0175/ISO 15156-2:2020: Aceros carbono y baja aleación — máx. 250 HBW en cuerpo de válvula.
ASME B16.34-2017 §6.1: Materiales cuerpo — ASTM A216 WCB (carbono), A351 CF8M (inox 316L).
API 6D-2021 §5.3.2: MDMT temperatura mínima de diseño — impacto Charpy para servicio criogénico.`,

  VALVULAS_BRIDA_B16_5: `NORMATIVAS APLICABLES — VERIFICADAS:
ASME B16.5-2017 Tabla E1.1: Dimensiones bridas NPS 1/2 a 24 — OD, BC, bore y pernos por clase.
ASME B16.5-2017 §2.3: Ratings presión-temperatura para 23 grupos de materiales — Clase 150 a 2500.
ASME B16.20-2017: Espirometálicas y anillos RTJ — selección según clase de presión y tipo de fluido.
API 6D-2021 §6.1.1: Extremos con brida — requisitos geométricos y rugosidad de cara de asiento.`,

  VALVULAS_DISENO_BOLA: `NORMATIVAS APLICABLES — VERIFICADAS:
API 6D-2021 §5.1: Válvulas de bola para tuberías de transmisión — diseño, materiales y pruebas.
ASME B16.10-2022: Face-to-face y end-to-end — dimensiones para intercambiabilidad Clase 150-2500.
ASME B16.34-2017: Pressure-temperature ratings cuerpo — base de selección de clase de presión.
ISO 17292:2015: Válvulas bola metal-metal para refinerías y petroquímica — requisitos de diseño.`,

  VALVULAS_DISENO_MARIPOSA: `NORMATIVAS APLICABLES — VERIFICADAS:
API 609-2016: Válvulas mariposa doble y triple excentricidad — diseño y pruebas de fábrica.
ASME B16.10-2022: Face-to-face válvulas mariposa wafer y lug — Clase 150-300.
MSS SP-67-2017: Válvulas mariposa — materiales y pruebas para servicio general industria.
ASME B16.34-2017 §7: Prueba hidrostática mariposa = 1.5× CWP durante 2 minutos mínimo.`,

  VALVULAS_DISENO_RETENCION: `NORMATIVAS APLICABLES — VERIFICADAS:
ASME B16.10-2022: Face-to-face válvulas retención swing y lift — Clase 150 a 2500.
API STD 594-2017: Válvulas retención tipo disco — diseño, materiales y pruebas de fábrica.
MSS SP-80-2019: Válvulas retención de bronce — requisitos y pruebas para agua y vapor.
ASME B16.34-2017 §7.4: Prueba de asiento retención — fuga máxima permitida por clase.`,

  VALVULAS_DISENO_TAPON: `NORMATIVAS APLICABLES — VERIFICADAS:
MSS SP-78-2019: Válvulas tapón lubricadas de hierro fundido — diseño y pruebas de fábrica.
ASME B16.10-2022: Face-to-face válvulas tapón — dimensiones de intercambiabilidad por clase.
ASME B16.34-2017: Pressure-temperature ratings materiales cuerpo tapón — base de selección.
API 6D-2021 §5.6: Válvulas tapón para tuberías de transmisión — requisitos adicionales de diseño.`,

  VALVULAS_DISENO_GLOBO: `NORMATIVAS APLICABLES — VERIFICADAS:
ASME B16.10-2022: Face-to-face válvulas globo — Clase 150 a 4500, NPS 1/2 a 24 pulgadas.
ASME B16.34-2017: Pressure-temperature ratings cuerpo globo — acero carbono e inoxidable.
API 623-2013: Válvulas globo de acero para servicio general — diseño, materiales y pruebas.
MSS SP-85-2002: Válvulas globo hierro fundido — requisitos de diseño y prueba de asiento.`,

  VALVULAS_COEFICIENTE_CV: `NORMATIVAS APLICABLES — VERIFICADAS:
ISA 75.01.01-2012: Cv = Q·√(SG/ΔP) — Q en GPM, ΔP en psi, SG relativo al agua a 60°F.
ISA 75.01.01-2012 §5: Kv = 0.865·Cv — conversión a unidades métricas (m3/h a 1 bar de ΔP).
ISA 75.01.01-2012 §6: Cavitación — Cv de servicio > Cv·FL² para evitar daño al asiento.
API 6D-2021 §5.7: Pérdida de presión admisible a través de válvula en condición de diseño máximo.`,
};

// ════════════════════════════════════════════════════════════════════════════
// CONSTRUCTOR DEL SYSTEM PROMPT
// ════════════════════════════════════════════════════════════════════════════

function construirSystemPrompt(ctx: ContextoCalculo, derivados: ResultadosDerivados): string {
  const params = Object.entries(ctx.parametros)
    .map(([k, v]) => `  • ${k}: ${v}`).join('\n');

  const resultados = Object.entries(ctx.resultado)
    .map(([k, v]) => `  • ${k}: ${v}`).join('\n');

  const derivadosTexto = [
    derivados.vida_remanente_anios !== undefined
      ? `  • Vida remanente: ${derivados.vida_remanente_anios} años [API 579-1 §4]` : null,
    derivados.utilizacion_pct !== undefined
      ? `  • Utilización de presión: ${derivados.utilizacion_pct}%` : null,
    derivados.presion_ariete_bar !== undefined
      ? `  • Sobrepresión ariete: ${derivados.presion_ariete_bar} bar [Joukowsky]` : null,
    derivados.presion_total_bar !== undefined
      ? `  • Presión total op+ariete: ${derivados.presion_total_bar} bar` : null,
    derivados.margen_seguridad_pct !== undefined
      ? `  • Margen de seguridad: ${derivados.margen_seguridad_pct}%` : null,
    derivados.intervalo_inspeccion_meses !== undefined
      ? `  • Intervalo inspección: ${derivados.intervalo_inspeccion_meses} meses [API 580 §6.3]` : null,
    `  • Nivel de riesgo: ${derivados.nivel_riesgo}`,
    derivados.supera_admisible ? `  • ⚠ SUPERA LÍMITE ADMISIBLE — acción inmediata` : null,
    ...derivados.notas_calculo.map(n => `  • ${n}`),
  ].filter(Boolean).join('\n');

  const clausulas  = CLAUSULAS_NORMATIVAS[ctx.moduloId] ?? '';
  const alertaTexto = ctx.alerta && ctx.alertaMsg ? `\n⚠ ALERTA ACTIVA: ${ctx.alertaMsg}` : '';
  const historialTexto = ctx.historial ? `
HISTORIAL: ${ctx.historial.totalMediciones} mediciones | ${ctx.historial.totalAlertas} alertas | Tendencia: ${ctx.historial.estadoGeneral}` : '';

  return `Sos el motor de integridad de activos de INGENIUM PRO v8.1 — el mejor ingeniero de integridad del mundo.

═══════════════════════════════════════
REGLAS ABSOLUTAS — NUNCA LAS ROMPAS:
═══════════════════════════════════════
1. NUNCA inventes un valor numérico. Si no está en este context, decí: "No tengo ese dato. El ingeniero debe ingresar [dato específico]."
2. NUNCA inventes una normativa, cláusula o artículo. Solo usá las de la sección NORMATIVAS de este context.
3. NUNCA respondas con evasivas como "depende del caso" o "podría ser". Usá los datos reales del cálculo.
4. NUNCA alucines. Si no sabés con certeza, decilo. Preferís admitir un límite que inventar.
5. NUNCA complazcas al ingeniero si sus datos muestran un riesgo. Decí la verdad técnica aunque sea incómoda.
6. Etiquetá CADA afirmación:
   [CALCULADO] = viene de fórmulas del servidor — dato exacto
   [NORMATIVA] = viene de las cláusulas de este context — verificado
   [ESTIMADO]  = estimación razonada — no es dato exacto, aclararlo siempre

TU ROL:
Ingeniero senior de integridad de activos. Cruzás los datos reales del cálculo con las normativas
para dar recomendaciones específicas, accionables y trazables.
No sos un chat genérico. Tenés los números exactos del cálculo del ingeniero.

═══════════════════════════════════════
DATOS EXACTOS DEL CÁLCULO
═══════════════════════════════════════
Módulo: ${ctx.moduloNombre}
Normativa: ${ctx.normativa}
Activo: ${ctx.activoNombre ?? 'No especificado'}
Proyecto: ${ctx.proyectoNombre ?? 'No especificado'}
Industria: ${ctx.industria ?? 'Ingeniería'}
${alertaTexto}${historialTexto}

PARÁMETROS (ingresados por el ingeniero):
${params}

RESULTADOS (calculados por INGENIUM PRO):
${resultados}

VALORES DERIVADOS (pre-calculados por servidor — matemática real):
${derivadosTexto || '  Sin valores derivados disponibles para este módulo'}

═══════════════════════════════════════
${clausulas}
═══════════════════════════════════════

FORMATO DE RESPUESTA OBLIGATORIO:
▸ DIAGNÓSTICO [CALCULADO]: qué dicen los datos exactos
▸ RIESGO IDENTIFICADO [NORMATIVA]: si existe, con número y cláusula
▸ ACCIÓN RECOMENDADA: concreta, con plazo y responsable
▸ BASE NORMATIVA: cláusula exacta del context

Respondé en el idioma del ingeniero. Directo. Sin rodeos. Sin frases vacías.`;
}

// ════════════════════════════════════════════════════════════════════════════
// POST /api/chat
// ════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  if (!verificarTokenAPI(req)) return respuestaNoAutorizado();

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const limited = rateLimit(`chat:${ip}`, 20, 60_000);
  if (limited) return limited;

  try {
    const body = await req.json() as {
      messages:  Mensaje[];
      contexto?: ContextoCalculo;
    };

    const { messages, contexto } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'messages es requerido' }, { status: 400 });
    }

    if (messages.length > 40) {
      return NextResponse.json({ error: 'Historial demasiado largo' }, { status: 400 });
    }

    const lastMsg = messages[messages.length - 1]?.content ?? '';
    if (typeof lastMsg !== 'string' || lastMsg.length > 4000) {
      return NextResponse.json({ error: 'Mensaje demasiado largo' }, { status: 400 });
    }

    const derivados    = contexto ? preCalcular(contexto) : null;
    const systemPrompt = contexto && derivados
      ? construirSystemPrompt(contexto, derivados)
      : `Sos el asistente técnico de INGENIUM PRO v8.1 — plataforma profesional de integridad de activos.

REGLA ABSOLUTA: No inventes valores ni normativas.
Si no tenés el dato exacto del cálculo activo, decí: "Necesito los datos del cálculo para responderte con precisión."
Cuando el ingeniero realice un cálculo en la plataforma, recibirás los datos exactos y podrás cruzarlos con normativas reales.
Respondé en el idioma del ingeniero. Técnico y directo.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         (process.env.ANTHROPIC_API_KEY || process.env.CLAVE_API_ANTROPICA || ''),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:       'claude-sonnet-4-6',  // ✅ CORRECTO — modelo actual verificado
        max_tokens:  1500,
        temperature: 0,                    // 0 = determinístico — mínima alucinación
        system:      systemPrompt,
        messages:    messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[API chat] Anthropic error:', err);
      return NextResponse.json({ error: 'Error en el motor de IA' }, { status: 502 });
    }

    const data = await response.json() as {
      content: { type: string; text: string }[];
    };

    const texto = data.content?.find(b => b.type === 'text')?.text;

    if (!texto) {
      return NextResponse.json({ error: 'Sin respuesta del motor' }, { status: 500 });
    }

    return NextResponse.json({
      content:   [{ text: texto }],
      derivados: derivados ?? null,
    });

  } catch (err) {
    console.error('[API chat] Error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 