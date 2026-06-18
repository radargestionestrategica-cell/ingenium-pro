import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const usuario = await prisma.usuario.findUnique({
      where:  { id: payload.id },
      select: { equipoId: true },
    });

    const equipo = await prisma.equipo.findFirst({
      where: { OR: [{ ownerId: payload.id }, { id: usuario?.equipoId ?? undefined }] },
      include: {
        owner:    { select: { id: true, nombre: true, email: true } },
        miembros: { select: { id: true, nombre: true, email: true } },
      },
    });

    return NextResponse.json({ ok: true, equipo });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error interno' }, { status: 500 });
  }
}
