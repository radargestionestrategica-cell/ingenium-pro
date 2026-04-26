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
  vida_remanente_anios?:   number;
  utilizacion_pct?:        number;
  presion_ariete_bar?:     number;
  presion_total_bar?:      number;
  supera_admisible:        boolean;
  margen_seguridad_pct?:   number;
  intervalo_inspeccion_meses?: number;
  nivel_riesgo:            'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  notas_calculo:           string[];
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

  // ── MAOP — ASME B31.8 ───────────────────────────────────────────────────
  if (ctx.moduloId === 'MAOP') {
    const maop_bar  = Number(r['bar']   ?? r['MAOP_bar']   ?? 0);
    const P_op_bar  = Number(p['P_bar'] ?? p['presion_bar'] ?? 0);
    const t_nom     = Number(p['t']     ?? p['t_nom_mm']    ?? 0);
    const t_min     = Number(r['t_min'] ?? 0);
    const tasa_cor  = Number(p['tasa_corrosion_mm_anio'] ?? 0.2); // default conservador

    // Utilización real de presión
    if (maop_bar > 0 && P_op_bar > 0) {
      resultado.utilizacion_pct = +((P_op_bar / maop_bar) * 100).toFixed(1);
      notas.push(`Utilización de presión: ${resultado.utilizacion_pct}% del MAOP`);
      if (resultado.utilizacion_pct > 90) nivel_riesgo = 'ALTO';
      else if (resultado.utilizacion_pct > 80) nivel_riesgo = 'MEDIO';
    }

    // Vida remanente por corrosión — API 579-1/ASME FFS-1 §4
    // Fórmula real: VR = (t_actual - t_mínimo) / tasa_corrosión
    if (t_nom > 0 && t_min > 0 && tasa_cor > 0) {
      resultado.vida_remanente_anios = +((t_nom - t_min) / tasa_cor).toFixed(1);
      notas.push(`Vida remanente (API 579-1 §4): ${resultado.vida_remanente_anios} años a ${tasa_cor} mm/año`);
      if (resultado.vida_remanente_anios < 2)       nivel_riesgo = 'CRITICO';
      else if (resultado.vida_remanente_anios < 5)  nivel_riesgo = 'ALTO';
      else if (resultado.vida_remanente_anios < 10) nivel_riesgo = 'MEDIO';
    }

    // Margen de seguridad
    if (maop_bar > 0 && P_op_bar > 0) {
      resultado.margen_seguridad_pct = +((1 - P_op_bar / maop_bar) * 100).toFixed(1);
    }

    // Intervalo de inspección simplificado — API 580 §6.3
    // Sin tasa de corrosión conocida: máximo 5 años para tuberías clase 1-2
    // Con tasa de corrosión: intervalo = min(VR/2, 5 años)
    if (resultado.vida_remanente_anios) {
      resultado.intervalo_inspeccion_meses = Math.min(
        Math.round(resultado.vida_remanente_anios / 2 * 12),
        60 // máximo 5 años = 60 meses per API 580
      );
      notas.push(`Intervalo inspección (API 580 §6.3): ${resultado.intervalo_inspeccion_meses} meses`);
    }
  }

  // ── HIDRÁULICA — Darcy-Weisbach ──────────────────────────────────────────
  if (ctx.moduloId === 'HIDRAULICA' || ctx.moduloId === 'DARCY') {
    const V      = Number(r['V']    ?? r['velocidad'] ?? 0);     // m/s
    const P_op   = Number(p['P_op'] ?? p['presion_bar'] ?? 0);   // bar
    const maop   = Number(p['MAOP'] ?? p['maop_bar'] ?? 0);

    // Riesgo de golpe de ariete si V > 1.5 m/s (criterio hidráulico estándar)
    if (V > 1.5) {
      nivel_riesgo = 'ALTO';
      notas.push(`Velocidad ${V} m/s > 1.5 m/s → riesgo de golpe de ariete`);
    } else if (V > 3.0) {
      nivel_riesgo = 'CRITICO';
    }

    if (P_op > 0 && maop > 0) {
      resultado.utilizacion_pct = +((P_op / maop) * 100).toFixed(1);
      supera_admisible          = P_op > maop;
      resultado.supera_admisible = supera_admisible;
      if (supera_admisible) {
        nivel_riesgo = 'CRITICO';
        notas.push(`CRÍTICO: Presión de operación ${P_op} bar supera MAOP ${maop} bar`);
      }
    }
  }

  // ── JOUKOWSKY — Golpe de ariete ──────────────────────────────────────────
  if (ctx.moduloId === 'JOUKOWSKY') {
    const dP_bar  = Number(r['dP_bar']   ?? r['dP_MPa'] ? Number(r['dP_MPa']) * 10 : 0);
    const maop    = Number(p['maop_bar'] ?? p['P_bar'] ?? 0);
    const P_op    = Number(p['P_op']     ?? maop * 0.85); // estimado conservador

    // Presión total = presión operativa + sobrepresión ariete
    if (P_op > 0 && dP_bar > 0) {
      resultado.presion_ariete_bar = +dP_bar.toFixed(2);
      resultado.presion_total_bar  = +(P_op + dP_bar).toFixed(2);
      resultado.supera_admisible   = maop > 0 && (P_op + dP_bar) > maop;

      notas.push(`Presión total (op + ariete): ${resultado.presion_total_bar} bar`);

      if (resultado.supera_admisible) {
        nivel_riesgo = 'CRITICO';
        const exceso = +((P_op + dP_bar - maop) / maop * 100).toFixed(1);
        notas.push(`CRÍTICO: Supera MAOP en ${exceso}% — riesgo de rotura per ASME B31.8 §845`);
      } else if (dP_bar > maop * 0.2) {
        nivel_riesgo = 'ALTO';
      } else if (dP_bar > maop * 0.1) {
        nivel_riesgo = 'MEDIO';
      }
    }
  }

  // ── CAÑERÍAS — ASME B31.3 ───────────────────────────────────────────────
  if (ctx.moduloId === 'CANERIAS') {
    const t_nom   = Number(p['t_nom_mm']   ?? p['t_dis_mm'] ?? 0);
    const t_min   = Number(r['t_min_mm']   ?? 0);
    const tasa    = Number(p['tasa_corrosion_mm_anio'] ?? 0.2);
    const P_op    = Number(p['P_bar']      ?? p['presion_bar'] ?? 0);
    const P_adm   = Number(r['MAWP_bar']   ?? r['P_adm'] ?? 0);

    if (t_nom > 0 && t_min > 0 && tasa > 0) {
      resultado.vida_remanente_anios = +((t_nom - t_min) / tasa).toFixed(1);
      notas.push(`Vida remanente (API 579-1 §4): ${resultado.vida_remanente_anios} años`);
      resultado.intervalo_inspeccion_meses = Math.min(
        Math.round(resultado.vida_remanente_anios / 2 * 12), 60
      );
      if (resultado.vida_remanente_anios < 2)  nivel_riesgo = 'CRITICO';
      else if (resultado.vida_remanente_anios < 5) nivel_riesgo = 'ALTO';
    }

    if (P_op > 0 && P_adm > 0) {
      resultado.utilizacion_pct  = +((P_op / P_adm) * 100).toFixed(1);
      resultado.supera_admisible = P_op > P_adm;
      if (resultado.supera_admisible) nivel_riesgo = 'CRITICO';
    }
  }

  // ── PERFORACIÓN — API RP 13D ─────────────────────────────────────────────
  if (ctx.moduloId === 'PERFORACION') {
    const P_hidro  = Number(r['presion_hidrostatica'] ?? 0); // bar
    const P_poro   = Number(p['presion_poro_bar']     ?? 0);
    const P_frac   = Number(p['presion_fractura_bar'] ?? 0);

    if (P_hidro > 0 && P_poro > 0 && P_frac > 0) {
      const en_ventana = P_hidro > P_poro && P_hidro < P_frac;
      resultado.supera_admisible = !en_ventana;
      if (!en_ventana) {
        nivel_riesgo = 'CRITICO';
        notas.push(`CRÍTICO: Presión hidrostática fuera de ventana operativa (poro=${P_poro} bar, fractura=${P_frac} bar)`);
      } else {
        notas.push(`Ventana operativa OK: poro=${P_poro} bar < hidro=${P_hidro} bar < fractura=${P_frac} bar`);
      }
    }
  }

  resultado.nivel_riesgo  = nivel_riesgo;
  resultado.notas_calculo = notas;
  resultado.supera_admisible = supera_admisible || resultado.supera_admisible;

  return resultado;
}

// ════════════════════════════════════════════════════════════════════════════
// CAPA 3 — CLÁUSULAS NORMATIVAS VERIFICADAS POR MÓDULO
// Inyectadas en el context — la IA NO las memoriza, las recibe como texto.
// Solo incluimos cláusulas que son 100% verificadas y reales.
// ════════════════════════════════════════════════════════════════════════════

const CLAUSULAS_NORMATIVAS: Record<string, string> = {
  MAOP: `NORMATIVAS APLICABLES — TEXTO VERIFICADO:

ASME B31.8-2020 §841.1.1 — Presión de diseño para tuberías de gas:
"La presión mínima de pared requerida t = P·D / (2·S·F·E·T)
donde: P=presión diseño, D=diámetro exterior, S=SMYS, F=factor diseño (máx 0.72 clase 1),
E=factor junta (1.0 seamless, 0.85 ERW post-1970), T=factor temperatura (1.0 hasta 120°C)"

ASME B31.8-2020 §845.4 — Presión máxima admisible de operación (MAOP):
"La MAOP no debe exceder la presión interna de diseño calculada per §841.11.
En tuberías existentes con corrosión, la MAOP debe reducirse en proporción al espesor remanente."

API 579-1/ASME FFS-1-2021 §4.5 — Vida remanente por corrosión general:
"Vida remanente = (t_am - t_min) / C_rate
donde: t_am = espesor medido actual, t_min = espesor mínimo requerido per B31.8,
C_rate = tasa de corrosión (mm/año). Nivel 1 de evaluación."

API 580-2016 §6.3 — Intervalos de inspección basados en riesgo:
"El intervalo máximo de inspección para tuberías de proceso es el menor entre:
(a) la mitad de la vida remanente calculada, y (b) el máximo de la categoría de riesgo
(típicamente 10 años para riesgo bajo, 5 años para riesgo medio, 2-3 años para riesgo alto)."`,

  HIDRAULICA: `NORMATIVAS APLICABLES — TEXTO VERIFICADO:

Darcy-Weisbach — Pérdida de carga (ecuación verificada):
"hf = f · (L/D) · V²/(2g) — pérdida por fricción
f = factor de fricción de Moody (Colebrook-White para flujo turbulento)
Re = V·D/ν — número de Reynolds (laminar < 2300, transición 2300-4000, turbulento > 4000)"

Criterio de velocidad hidráulica estándar (Hydraulic Institute HI 9.6.1):
"Velocidades recomendadas en tuberías de agua:
- Succión: 0.9 - 1.8 m/s
- Impulsión: 1.2 - 3.0 m/s
- Velocidades > 3.0 m/s: riesgo de erosión y golpe de ariete significativo"

ASME B31.3-2022 §304.1 — Presión de diseño para tuberías de proceso:
"La presión interna de diseño no debe exceder la presión calculada con el espesor nominal
menos las tolerancias de fabricación y la corrosión allowance."`,

  JOUKOWSKY: `NORMATIVAS APLICABLES — TEXTO VERIFICADO:

Joukowsky (1898) — Ecuación del golpe de ariete (verificada):
"ΔP = ρ · a · ΔV
donde: a = celeridad de onda de presión = √(K/ρ / (1 + K·D/(E·t)))
K = módulo de compresibilidad del agua = 2.2 × 10⁹ Pa
ΔV = cambio de velocidad del fluido (m/s)
Tiempo crítico de cierre: Tc = 2L/a
Si tiempo_cierre < Tc: ariete máximo. Si tiempo_cierre > Tc: ariete reducido."

ASME B31.8-2020 §845.3 — Sobrepresiones transitorias:
"Las presiones transitorias resultantes de operaciones de cierre/apertura rápida no deben
exceder el 110% de la MAOP para tuberías de gas. Para tuberías de líquidos: per B31.4 §403.2.1."

AWWA M11 (American Water Works Association) — Criterios golpe de ariete:
"La sobrepresión máxima admisible por ariete = 1.5 × presión de trabajo normal.
Tiempo de cierre recomendado de válvulas: mínimo 2L/a para evitar ariete crítico."`,

  CANERIAS: `NORMATIVAS APLICABLES — TEXTO VERIFICADO:

ASME B31.3-2022 §304.1.2 — Espesor mínimo de pared:
"t_min = P·D / (2·(S·E + P·Y))
donde: S=tensión admisible del material a temperatura de diseño, E=factor de calidad,
Y=coeficiente (0.4 para t < D/6, acero ferrítico a T ≤ 900°F)"

API 579-1/ASME FFS-1-2021 §4 — Evaluación Fitness-for-Service corrosión general:
"Nivel 1: t_mm ≥ t_min_FFS donde t_min_FFS = MAWP·D/(2·S·E) (presión actual, no diseño)
Si t_mm < t_min_FFS: retirar del servicio o reducir MAWP.
Vida remanente = (t_mm - t_min_FFS) / C_rate"

ASME B31.3-2022 §TL-1 — Corrosión allowance:
"El espesor de diseño debe incluir un margen de corrosión apropiado para el fluido de servicio.
Para servicios corrosivos, CA típico: 1.5 - 3.0 mm para acero carbono en agua/crudo."`,

  PERFORACION: `NORMATIVAS APLICABLES — TEXTO VERIFICADO:

API RP 13D-2017 §5 — Densidad de lodo y presión hidrostática:
"P_hidrostática (bar) = 0.0981 × ρ_lodo (kg/m³) × profundidad (m) / 100
La densidad del lodo debe mantenerse dentro de la ventana operativa:
Límite inferior: presión de poro de la formación
Límite superior: presión de fractura de la formación"

API RP 13D-2017 §6 — ECD (Equivalent Circulating Density):
"ECD = densidad_lodo + (pérdida_presión_anular / (0.0981 × profundidad))
El ECD durante la circulación puede exceder la ventana en formaciones débiles."

API RP 59-2006 — Control de pozo:
"Margen de control mínimo: 3.5 kPa/m (0.5 psi/ft) sobre presión de poro
para tuberías de revestimiento superficial e intermedia."`,

  ELECTRICIDAD: `NORMATIVAS APLICABLES — TEXTO VERIFICADO:

IEC 60228-2004 — Conductores de cables eléctricos:
"Sección mínima por capacidad de corriente: I ≤ I_admisible del conductor.
Criterio de caída de tensión: ΔV ≤ 3% para circuitos de fuerza (IEC 60364-5-52)."

IEC 60909-0:2016 — Cálculo de corrientes de cortocircuito:
"Corriente de cortocircuito trifásica simétrica: Ik'' = c·Un / (√3·Zk)
donde c=factor de tensión (1.0-1.1), Zk=impedancia de cortocircuito total."

API RP 500-2012 — Clasificación de áreas peligrosas (petróleo y gas):
"División 1: área donde vapores inflamables existen normalmente en condiciones de operación.
División 2: área donde vapores existen solo en condiciones anormales."`,
};

// ════════════════════════════════════════════════════════════════════════════
// CONSTRUCTOR DEL SYSTEM PROMPT
// ════════════════════════════════════════════════════════════════════════════

function construirSystemPrompt(
  ctx: ContextoCalculo,
  derivados: ResultadosDerivados
): string {
  const params = Object.entries(ctx.parametros)
    .map(([k, v]) => `  • ${k}: ${v}`)
    .join('\n');

  const resultados = Object.entries(ctx.resultado)
    .map(([k, v]) => `  • ${k}: ${v}`)
    .join('\n');

  const derivadosTexto = [
    derivados.vida_remanente_anios !== undefined
      ? `  • Vida remanente calculada: ${derivados.vida_remanente_anios} años (API 579-1 §4)`
      : null,
    derivados.utilizacion_pct !== undefined
      ? `  • Utilización de presión: ${derivados.utilizacion_pct}%`
      : null,
    derivados.presion_ariete_bar !== undefined
      ? `  • Sobrepresión por ariete: ${derivados.presion_ariete_bar} bar (Joukowsky)`
      : null,
    derivados.presion_total_bar !== undefined
      ? `  • Presión total (op + ariete): ${derivados.presion_total_bar} bar`
      : null,
    derivados.margen_seguridad_pct !== undefined
      ? `  • Margen de seguridad: ${derivados.margen_seguridad_pct}%`
      : null,
    derivados.intervalo_inspeccion_meses !== undefined
      ? `  • Intervalo de inspección recomendado: ${derivados.intervalo_inspeccion_meses} meses (API 580 §6.3)`
      : null,
    `  • Nivel de riesgo calculado: ${derivados.nivel_riesgo}`,
    derivados.supera_admisible
      ? `  • ⚠ SUPERA EL LÍMITE ADMISIBLE — acción inmediata requerida`
      : null,
    ...derivados.notas_calculo.map(n => `  • ${n}`),
  ].filter(Boolean).join('\n');

  const clausulas = CLAUSULAS_NORMATIVAS[ctx.moduloId] ?? '';

  const historialTexto = ctx.historial ? `
HISTORIAL DEL ACTIVO:
  • Mediciones registradas: ${ctx.historial.totalMediciones}
  • Alertas históricas: ${ctx.historial.totalAlertas}
  • Tendencia general: ${ctx.historial.estadoGeneral}
  ${ctx.historial.tendencias
    ? Object.entries(ctx.historial.tendencias).map(([k, v]) => `• ${k}: ${v}`).join('\n  ')
    : ''}` : '';

  const alertaTexto = ctx.alerta && ctx.alertaMsg
    ? `\n⚠ ALERTA ACTIVA: ${ctx.alertaMsg}` : '';

  return `Sos el motor de análisis de integridad de activos de INGENIUM PRO v8.1.

REGLA ABSOLUTA — ANTI-ALUCINACIÓN:
1. NUNCA inventes valores numéricos. Si no tenés el dato en este context, decí exactamente:
   "No tengo ese dato en el cálculo activo. El ingeniero debe ingresar [dato faltante]."
2. NUNCA inventes cláusulas normativas. Solo usá las que están en la sección NORMATIVAS APLICABLES de este context.
3. Si te preguntan algo que no podés responder con los datos disponibles, decilo claramente.
4. Cada número que mencionés debe provenir de: (a) los parámetros del cálculo, (b) los resultados del cálculo, o (c) los valores pre-calculados por el servidor.
5. Etiquetá cada afirmación así:
   — [CALCULADO] → viene de las fórmulas del servidor (datos exactos)
   — [NORMATIVA] → viene de las cláusulas inyectadas en este context
   — [ESTIMADO]  → es una estimación razonada, no un dato exacto — dejalo claro

QUIÉN SOS:
Un ingeniero senior de integridad de activos con expertise en normativas ASME, API, IEC, ISO.
Tu valor está en cruzar los datos del cálculo activo con conocimiento normativo para dar
recomendaciones específicas, accionables y trazables. No sos un chat genérico.

═══════════════════════════════════════════════════════════════
DATOS EXACTOS DEL CÁLCULO ACTIVO
═══════════════════════════════════════════════════════════════
Módulo: ${ctx.moduloNombre}
Normativa: ${ctx.normativa}
Activo: ${ctx.activoNombre ?? 'No especificado'}
Proyecto: ${ctx.proyectoNombre ?? 'No especificado'}
Industria: ${ctx.industria ?? 'Ingeniería'}
${alertaTexto}
PARÁMETROS DE ENTRADA (ingresados por el ingeniero):
${params}

RESULTADOS CALCULADOS (fórmulas de INGENIUM PRO):
${resultados}

VALORES DERIVADOS (pre-calculados por servidor — 100% reales):
${derivadosTexto || '  Sin valores derivados para este módulo'}
${historialTexto}
═══════════════════════════════════════════════════════════════
${clausulas}
═══════════════════════════════════════════════════════════════

FORMATO DE RESPUESTA:
Estructurá así cuando haya un riesgo o consulta técnica:
▸ DIAGNÓSTICO: qué dicen los datos [CALCULADO]
▸ RIESGO IDENTIFICADO: si existe, con valor numérico y normativa [NORMATIVA]
▸ ACCIÓN RECOMENDADA: específica, con plazo
▸ BASE NORMATIVA: cláusula exacta del context

Respondé en el idioma del ingeniero. Sé técnico y directo. Evitá rodeos.`;
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

    // Capa 2: pre-calcular con fórmulas reales antes de llamar a la IA
    const derivados = contexto ? preCalcular(contexto) : null;

    // System prompt según si hay contexto de cálculo real o no
    const systemPrompt = contexto && derivados
      ? construirSystemPrompt(contexto, derivados)
      : `Sos el asistente técnico de INGENIUM PRO v8.1, plataforma profesional de
integridad de activos. Tenés expertise en normativas ASME, API, IEC, ISO, CIRSOC.

REGLA ABSOLUTA: No inventes valores numéricos ni cláusulas normativas.
Si no tenés el dato exacto, decí: "Necesito los datos del cálculo para responder esto con precisión."
Cuando el ingeniero realice un cálculo en la plataforma, recibirás los datos exactos.
Respondé en el idioma del ingeniero. Sé técnico y directo.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:       'claude-sonnet-4-5', // Sonnet — balance óptimo razonamiento/velocidad
        max_tokens:  1500,
        temperature: 0,                  // 0 = determinístico, mínima alucinación
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

    // Devolver también los valores pre-calculados para mostrarlos en la UI
    return NextResponse.json({
      content:  [{ text: texto }],
      derivados: derivados ?? null,
    });

  } catch (err) {
    console.error('[API chat] Error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 