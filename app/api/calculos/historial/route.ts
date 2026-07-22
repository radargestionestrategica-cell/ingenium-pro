import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const p    = req.nextUrl.searchParams;
    const pid  = p.get('proyectoId');
    const tip  = p.get('tipo');
    const act  = p.get('activoNombre');

    const data = await prisma.calculo.findMany({
      where: {
        usuarioId: payload.id,
        ...(pid ? { proyectoId:   pid } : {}),
        ...(tip ? { tipo:         tip } : {}),
        ...(act ? { activoNombre: act } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take:    100,
    });

    // Orden cronológico (mas antiguo primero) para calcular tendencias/estado
    const cronologico = [...data].reverse();

    const totalMediciones = data.length;
    const totalAlertas    = data.filter(c => c.alerta).length;

    // ── Tendencias por parámetro numérico (evolución primero → último) ──────
    const clavesNumericas = new Set<string>();
    for (const c of cronologico) {
      const resultado = c.resultado as Record<string, unknown> | null;
      for (const [k, v] of Object.entries(resultado ?? {})) {
        if (typeof v === 'number' && Number.isFinite(v)) clavesNumericas.add(k);
      }
    }

    const tendencias: Record<string, string> = {};
    for (const clave of clavesNumericas) {
      const valores = cronologico
        .map(c => (c.resultado as Record<string, unknown> | null)?.[clave])
        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
      if (valores.length < 2) continue;

      const primero = valores[0];
      const ultimo  = valores[valores.length - 1];
      const variacionPct = primero !== 0 ? ((ultimo - primero) / Math.abs(primero)) * 100 : 0;
      tendencias[clave] = `${primero} → ${ultimo} (${variacionPct >= 0 ? '+' : ''}${variacionPct.toFixed(1)}%)`;
    }

    // ── Estado general: proporción de alertas, mitad reciente vs mitad anterior ──
    let estadoGeneral: 'DETERIORO' | 'MEJORA' | 'ESTABLE' = 'ESTABLE';
    if (totalMediciones >= 4) {
      const mitad          = Math.floor(totalMediciones / 2);
      const mitadAnterior  = cronologico.slice(0, mitad);
      const mitadReciente  = cronologico.slice(-mitad);
      const propAnterior   = mitadAnterior.filter(c => c.alerta).length / mitadAnterior.length;
      const propReciente   = mitadReciente.filter(c => c.alerta).length / mitadReciente.length;

      if (propReciente > propAnterior) estadoGeneral = 'DETERIORO';
      else if (propReciente < propAnterior) estadoGeneral = 'MEJORA';
    }

    return NextResponse.json({
      ok: true,
      total: data.length,
      data,
      totalMediciones,
      totalAlertas,
      tendencias,
      estadoGeneral,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 },
    );
  }
}
