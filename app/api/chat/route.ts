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
    const maop_bar = Number(r['bar']   ?? r['MAOP_bar']   ?? 0);
    const P_op_bar = Number(p['P_bar'] ?? p['presion_bar'] ?? 0);
    const t_nom    = Number(p['t']     ?? p['t_nom_mm']    ?? 0);
    const t_min    = Number(r['t_min'] ?? 0);
    const tasa_cor = Number(p['tasa_corrosion_mm_anio'] ?? 0.2);

    if (maop_bar > 0 && P_op_bar > 0) {
      resultado.utilizacion_pct = +((P_op_bar / maop_bar) * 100).toFixed(1);
      notas.push(`Utilización de presión: ${resultado.utilizacion_pct}% del MAOP`);
      if (resultado.utilizacion_pct > 90)      nivel_riesgo = 'ALTO';
      else if (resultado.utilizacion_pct > 80) nivel_riesgo = 'MEDIO';
    }

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
    }

    // API 580 §6.3: intervalo = min(VR/2, 60 meses)
    if (resultado.vida_remanente_anios) {
      resultado.intervalo_inspeccion_meses = Math.min(
        Math.round(resultado.vida_remanente_anios / 2 * 12), 60
      );
      notas.push(`Intervalo inspección (API 580 §6.3): ${resultado.intervalo_inspeccion_meses} meses`);
    }
  }

  // ── HIDRÁULICA — Darcy-Weisbach ───────────────────────────────────────────
  if (ctx.moduloId === 'HIDRAULICA' || ctx.moduloId === 'DARCY') {
    const V    = Number(r['V']    ?? r['velocidad']  ?? 0);
    const P_op = Number(p['P_op'] ?? p['presion_bar'] ?? 0);
    const maop = Number(p['MAOP'] ?? p['maop_bar']   ?? 0);

    if (V > 3.0)       { nivel_riesgo = 'CRITICO'; }
    else if (V > 1.5)  { nivel_riesgo = 'ALTO'; notas.push(`Velocidad ${V} m/s > 1.5 m/s → riesgo de golpe de ariete`); }

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
    const dP_bar = Number(r['dP_bar'] ?? (r['dP_MPa'] ? Number(r['dP_MPa']) * 10 : 0));
    const maop   = Number(p['maop_bar'] ?? p['P_bar'] ?? 0);
    const P_op   = Number(p['P_op']     ?? maop * 0.85);

    if (P_op > 0 && dP_bar > 0) {
      resultado.presion_ariete_bar = +dP_bar.toFixed(2);
      resultado.presion_total_bar  = +(P_op + dP_bar).toFixed(2);
      resultado.supera_admisible   = maop > 0 && (P_op + dP_bar) > maop;
      notas.push(`Presión total (op + ariete): ${resultado.presion_total_bar} bar`);

      if (resultado.supera_admisible) {
        nivel_riesgo = 'CRITICO';
        const exceso = +((P_op + dP_bar - maop) / maop * 100).toFixed(1);
        notas.push(`CRÍTICO: Supera MAOP en ${exceso}% — riesgo de rotura per ASME B31.8 §845`);
      } else if (dP_bar > maop * 0.2) nivel_riesgo = 'ALTO';
      else if (dP_bar > maop * 0.1)   nivel_riesgo = 'MEDIO';
    }
  }

  // ── CAÑERÍAS — ASME B31.3 ────────────────────────────────────────────────
  if (ctx.moduloId === 'CANERIAS') {
    const t_nom = Number(p['t_nom_mm'] ?? p['t_dis_mm']  ?? 0);
    const t_min = Number(r['t_min_mm'] ?? 0);
    const tasa  = Number(p['tasa_corrosion_mm_anio'] ?? 0.2);
    const P_op  = Number(p['P_bar']    ?? p['presion_bar'] ?? 0);
    const P_adm = Number(r['MAWP_bar'] ?? r['P_adm']      ?? 0);

    if (t_nom > 0 && t_min > 0 && tasa > 0) {
      resultado.vida_remanente_anios       = +((t_nom - t_min) / tasa).toFixed(1);
      resultado.intervalo_inspeccion_meses = Math.min(Math.round(resultado.vida_remanente_anios / 2 * 12), 60);
      notas.push(`Vida remanente (API 579-1 §4): ${resultado.vida_remanente_anios} años`);
      if (resultado.vida_remanente_anios < 2)       nivel_riesgo = 'CRITICO';
      else if (resultado.vida_remanente_anios < 5)  nivel_riesgo = 'ALTO';
    }

    if (P_op > 0 && P_adm > 0) {
      resultado.utilizacion_pct  = +((P_op / P_adm) * 100).toFixed(1);
      resultado.supera_admisible = P_op > P_adm;
      if (resultado.supera_admisible) nivel_riesgo = 'CRITICO';
    }
  }

  // ── PERFORACIÓN — API RP 13D ──────────────────────────────────────────────
  if (ctx.moduloId === 'PERFORACION') {
    const P_hidro = Number(r['presion_hidrostatica'] ?? 0);
    const P_poro  = Number(p['presion_poro_bar']     ?? 0);
    const P_frac  = Number(p['presion_fractura_bar'] ?? 0);

    if (P_hidro > 0 && P_poro > 0 && P_frac > 0) {
      const en_ventana         = P_hidro > P_poro && P_hidro < P_frac;
      resultado.supera_admisible = !en_ventana;
      if (!en_ventana) {
        nivel_riesgo = 'CRITICO';
        notas.push(`CRÍTICO: Presión hidrostática fuera de ventana operativa (poro=${P_poro} bar, fractura=${P_frac} bar)`);
      } else {
        notas.push(`Ventana operativa OK: poro=${P_poro} bar < hidro=${P_hidro} bar < fractura=${P_frac} bar`);
      }
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
  try {
    const body = await req.json() as {
      messages:  Mensaje[];
      contexto?: ContextoCalculo;
    };

    const { messages, contexto } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'messages es requerido' }, { status: 400 });
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
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
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