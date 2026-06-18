import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';
import { TOPES_POR_PLAN } from '@/lib/consultasIa';

const UN_MES_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { plan: true, consultasIaUsadas: true, consultasIaResetEn: true },
    });
    if (!usuario) return respuestaNoAutorizado();

    const tope = TOPES_POR_PLAN[usuario.plan] ?? TOPES_POR_PLAN.demo;

    const ahora = new Date();
    const pasoUnMes = !usuario.consultasIaResetEn
      || ahora.getTime() - usuario.consultasIaResetEn.getTime() >= UN_MES_MS;

    const usadas = pasoUnMes ? 0 : usuario.consultasIaUsadas;
    const restantes = Math.max(tope - usadas, 0);

    return NextResponse.json({ ok: true, plan: usuario.plan, usadas, tope, restantes });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error interno' }, { status: 500 });
  }
}
