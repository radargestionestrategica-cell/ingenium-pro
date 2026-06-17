import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const { id } = await params;

    const calculo = await prisma.calculo.findUnique({ where: { id } });
    if (!calculo) {
      return NextResponse.json({ ok: false, error: 'Cálculo no encontrado' }, { status: 404 });
    }
    if (calculo.usuarioId !== payload.id) {
      return NextResponse.json({ ok: false, error: 'No autorizado para borrar este cálculo' }, { status: 403 });
    }

    await prisma.calculo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error interno' }, { status: 500 });
  }
}
