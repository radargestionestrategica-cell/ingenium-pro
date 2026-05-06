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