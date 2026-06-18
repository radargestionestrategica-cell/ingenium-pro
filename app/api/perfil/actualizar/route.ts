import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const { matricula, dni } = await req.json();

    if (matricula !== undefined && typeof matricula !== 'string') {
      return NextResponse.json({ ok: false, error: 'matricula debe ser texto' }, { status: 400 });
    }
    if (dni !== undefined && typeof dni !== 'string') {
      return NextResponse.json({ ok: false, error: 'dni debe ser texto' }, { status: 400 });
    }

    const usuario = await prisma.usuario.update({
      where: { id: payload.id },
      data: {
        ...(matricula !== undefined ? { matricula } : {}),
        ...(dni !== undefined ? { dni } : {}),
      },
      select: { id: true, matricula: true, dni: true },
    });

    return NextResponse.json({ ok: true, usuario });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error interno' }, { status: 500 });
  }
}
