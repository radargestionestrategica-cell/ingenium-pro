export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';
import { aplicarReglasCruceManual } from '@/lib/cruceReglas';
import type { CalculoManual } from '@/lib/cruceReglas';

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const body = await req.json().catch(() => null) as { calculoId1?: string; calculoId2?: string } | null;
    const calculoId1 = body?.calculoId1;
    const calculoId2 = body?.calculoId2;

    if (!calculoId1 || !calculoId2 || typeof calculoId1 !== 'string' || typeof calculoId2 !== 'string') {
      return NextResponse.json({ ok: false, error: 'Se requieren calculoId1 y calculoId2' }, { status: 400 });
    }
    if (calculoId1 === calculoId2) {
      return NextResponse.json({ ok: false, error: 'calculoId1 y calculoId2 deben ser distintos' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    const [reg1, reg2] = await Promise.all([
      prisma.calculo.findUnique({ where: { id: calculoId1 } }),
      prisma.calculo.findUnique({ where: { id: calculoId2 } }),
    ]);

    if (!reg1 || !reg2) {
      return NextResponse.json({ ok: false, error: 'Uno o ambos cálculos no existen' }, { status: 404 });
    }
    if (reg1.usuarioId !== payload.id || reg2.usuarioId !== payload.id) {
      return NextResponse.json({ ok: false, error: 'No autorizado para uno o ambos cálculos' }, { status: 403 });
    }

    const aCalculoManual = (r: typeof reg1): CalculoManual => ({
      id:           r.id,
      tipo:         r.tipo,
      moduloId:     r.moduloId,
      submodulo:    r.submodulo,
      activoNombre: r.activoNombre,
      parametros:   r.parametros as Record<string, unknown>,
      resultado:    r.resultado as Record<string, unknown>,
      alerta:       r.alerta,
      alertaMsg:    r.alertaMsg,
      normativa:    r.normativa,
      createdAt:    r.createdAt.toISOString(),
    });

    const riesgos = aplicarReglasCruceManual(aCalculoManual(reg1), aCalculoManual(reg2));

    return NextResponse.json({
      ok:         true,
      riesgos,
      generadoEn: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[api/cruce/analizar-manual]', err);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
