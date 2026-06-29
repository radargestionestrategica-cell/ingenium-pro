import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';
import { hashCalculation } from '@/lib/cripto';

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const b = await req.json();
    if (!b.activoId || !b.magnitud || b.valor === undefined || !b.unidad || !b.fuente) {
      return NextResponse.json(
        { ok: false, error: 'activoId, magnitud, valor, unidad y fuente son obligatorios' },
        { status: 400 },
      );
    }

    const hash = hashCalculation({
      activoId: b.activoId,
      magnitud: b.magnitud,
      valor: b.valor,
      unidad: b.unidad,
      fuente: b.fuente,
      usuarioId: payload.id,
    });

    const lectura = await prisma.lecturaTelemetria.create({
      data: {
        activoId: b.activoId,
        magnitud: b.magnitud,
        valor: b.valor,
        unidad: b.unidad,
        fuente: b.fuente,
        usuarioId: payload.id,
        hash,
        factorSeguridad: typeof b.factorSeguridad === 'number' ? b.factorSeguridad : null,
      },
    });

    return NextResponse.json({ ok: true, lectura });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const activoId = req.nextUrl.searchParams.get('activoId');
    if (!activoId) {
      return NextResponse.json({ ok: false, error: 'activoId es obligatorio' }, { status: 400 });
    }

    const activo = await prisma.activoTelemetria.findFirst({ where: { id: activoId, usuarioId: payload.id } });
    if (!activo) return NextResponse.json({ ok: false, error: 'Activo no encontrado' }, { status: 403 });

    const lecturas = await prisma.lecturaTelemetria.findMany({
      where: { activoId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ok: true, total: lecturas.length, data: lecturas });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 },
    );
  }
}
