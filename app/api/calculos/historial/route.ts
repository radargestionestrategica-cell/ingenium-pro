// app/api/calculos/historial/route.ts
// ═══════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.1 — API Historial de Cálculos
//  Recupera el historial de un activo o proyecto.
//  Base del Asset Integrity Management y dashboard de integridad.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const proyectoId   = searchParams.get('proyectoId');
    const usuarioId    = searchParams.get('usuarioId');
    const moduloId     = searchParams.get('moduloId');
    const activoNombre = searchParams.get('activoNombre');
    const soloAlertas  = searchParams.get('soloAlertas') === 'true';
    const limite       = Math.min(parseInt(searchParams.get('limite') || '50'), 200);

    // Al menos uno de estos debe existir
    if (!proyectoId && !usuarioId && !moduloId) {
      return NextResponse.json(
        { error: 'Se requiere proyectoId, usuarioId o moduloId' },
        { status: 400 }
      );
    }

    // ── Construir filtro dinámico ──────────────────────────────
    const where: Record<string, unknown> = {};

    if (proyectoId)   where.proyectoId   = proyectoId;
    if (usuarioId)    where.usuarioId    = usuarioId;
    if (moduloId)     where.moduloId     = moduloId;
    if (activoNombre) where.activoNombre = activoNombre;
    if (soloAlertas)  where.alerta       = true;

    // ── Recuperar cálculos ─────────────────────────────────────
    const calculos = await prisma.calculo.findMany({
      where,
      orderBy: { createdAt: 'asc' }, // cronológico — base del historial
      take: limite,
      select: {
        id:           true,
        moduloId:     true,
        submodulo:    true,
        activoNombre: true,
        normativa:    true,
        hash:         true,
        alerta:       true,
        alertaMsg:    true,
        usuario:      true,
        parametros:   true,
        resultado:    true,
        createdAt:    true,
        proyecto: {
          select: {
            id:       true,
            nombre:   true,
            industria:true,
          },
        },
      },
    });

    if (calculos.length === 0) {
      return NextResponse.json({
        ok: true,
        total: 0,
        alertas: 0,
        calculos: [],
        analisis: null,
      });
    }

    // ── Análisis automático de tendencia ──────────────────────
    // Si hay múltiples cálculos del mismo submodulo y activo,
    // detectamos si el parámetro clave empeoró con el tiempo.
    const analisis = analizarTendencia(calculos);

    const totalAlertas = calculos.filter(c => c.alerta).length;

    return NextResponse.json({
      ok: true,
      total:   calculos.length,
      alertas: totalAlertas,
      calculos,
      analisis,
    });

  } catch (error) {
    console.error('[API calculos/historial]', error);
    return NextResponse.json(
      { error: 'Error interno al recuperar historial' },
      { status: 500 }
    );
  }
}

// ── Análisis de tendencia — sin alucinación ───────────────────
// Lee los resultados reales y detecta si el parámetro clave
// del módulo empeoró entre el primer y el último cálculo.
function analizarTendencia(calculos: Array<{
  moduloId:     string | null;
  submodulo:    string | null;
  activoNombre: string | null;
  resultado:    unknown;
  alerta:       boolean;
  createdAt:    Date;
}>) {
  if (calculos.length < 2) return null;

  const primero = calculos[0];
  const ultimo  = calculos[calculos.length - 1];
  const mod     = primero.moduloId || '';

  // Parámetros clave reales por módulo — verificados
  const PARAMS_CLAVE: Record<string, string[]> = {
    canerias:    ['t_min_mm', 'vida_anios', 'sigma_h_mpa'],
    petroleo:    ['MAOP_bar', 'sigma_h_mpa'],
    hidraulica:  ['dP_bar', 'a_ms'],
    geotecnia:   ['qadm_kpa', 'FS'],
    civil:       ['uso_pct', 'deflexion_mm'],
    soldadura:   ['HI_kJ_mm', 'CE_IIW'],
    electricidad:['caida_v_pct', 'Icc_kA'],
  };

  const params = PARAMS_CLAVE[mod] || [];
  if (params.length === 0) return null;

  const r1 = primero.resultado as Record<string, unknown>;
  const rN = ultimo.resultado  as Record<string, unknown>;

  const tendencias: Array<{
    param:    string;
    inicial:  number;
    actual:   number;
    variacion_pct: number;
    tendencia: 'MEJORA' | 'ESTABLE' | 'DETERIORO';
  }> = [];

  for (const param of params) {
    const v1 = parseFloat(String(r1?.[param] ?? ''));
    const vN = parseFloat(String(rN?.[param] ?? ''));
    if (isNaN(v1) || isNaN(vN)) continue;
    if (v1 === 0) continue;

    const variacion_pct = Math.round(((vN - v1) / Math.abs(v1)) * 1000) / 10;

    // Para vida_anios, t_min_mm, qadm, FS: bajar es deterioro
    // Para uso_pct, dP_bar, caida_v_pct: subir es deterioro
    const deterioroSiSube = ['uso_pct', 'dP_bar', 'caida_v_pct', 'sigma_h_mpa'];
    const esDeterio = deterioroSiSube.includes(param)
      ? variacion_pct > 5
      : variacion_pct < -5;
    const esMejora = deterioroSiSube.includes(param)
      ? variacion_pct < -5
      : variacion_pct > 5;

    tendencias.push({
      param,
      inicial: Math.round(v1 * 100) / 100,
      actual:  Math.round(vN * 100) / 100,
      variacion_pct,
      tendencia: esDeterio ? 'DETERIORO' : esMejora ? 'MEJORA' : 'ESTABLE',
    });
  }

  const hayDeterio = tendencias.some(t => t.tendencia === 'DETERIORO');
  const hayMejora  = tendencias.some(t => t.tendencia === 'MEJORA');

  return {
    modulo:          mod,
    activoNombre:    primero.activoNombre || '—',
    fechaInicio:     primero.createdAt,
    fechaUltimo:     ultimo.createdAt,
    totalMediciones: calculos.length,
    totalAlertas:    calculos.filter(c => c.alerta).length,
    tendencias,
    estadoGeneral:   hayDeterio ? 'DETERIORO' : hayMejora ? 'MEJORA' : 'ESTABLE',
  };
} 