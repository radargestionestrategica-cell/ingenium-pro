import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const { id } = await params;
    const activo = await prisma.activoTelemetria.findFirst({
      where: { id, usuarioId: payload.id },
    });
    if (!activo) {
      return NextResponse.json({ ok: false, error: 'Activo no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, activo });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 },
    );
  }
}
