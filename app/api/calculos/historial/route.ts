import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const p   = req.nextUrl.searchParams;
    const pid = p.get('proyectoId');
    const tip = p.get('tipo');

    const data = await prisma.calculo.findMany({
      where: {
        usuarioId: payload.id,
        ...(pid ? { proyectoId: pid } : {}),
        ...(tip ? { tipo:       tip } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take:    100,
    });

    return NextResponse.json({ ok: true, total: data.length, data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 },
    );
  }
}
