import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';
import { hashCalculation, signHash } from '@/lib/cripto';

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

    let fechaLectura: Date | undefined;
    if (b.fecha) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(b.fecha);
      if (!match) {
        return NextResponse.json({ ok: false, error: 'fecha invalida' }, { status: 400 });
      }
      const [, anio, mes, dia] = match;
      // Mediodia local evita que el corrimiento UTC muestre el dia anterior.
      // Elegido especificamente para ser robusto sea cual sea el TZ del runtime de
      // Vercel (UTC por defecto): a las 12:00 ningun huso horario real desplaza la
      // fecha al dia anterior o siguiente, sin necesidad de fijar TZ explicitamente.
      const parsed = new Date(Number(anio), Number(mes) - 1, Number(dia), 12, 0, 0);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ ok: false, error: 'fecha invalida' }, { status: 400 });
      }
      fechaLectura = parsed;
    }

    const hash = hashCalculation({
      activoId: b.activoId,
      magnitud: b.magnitud,
      valor: b.valor,
      unidad: b.unidad,
      fuente: b.fuente,
      usuarioId: payload.id,
      ...(fechaLectura ? { fecha: fechaLectura.toISOString() } : {}),
    });

    const firma = signHash(hash);

    const lectura = await prisma.lecturaTelemetria.create({
      data: {
        activoId: b.activoId,
        magnitud: b.magnitud,
        valor: b.valor,
        unidad: b.unidad,
        fuente: b.fuente,
        usuarioId: payload.id,
        hash,
        firma,
        factorSeguridad: typeof b.factorSeguridad === 'number' ? b.factorSeguridad : null,
        ...(fechaLectura ? { createdAt: fechaLectura } : {}),
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

export async function DELETE(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const lecturaId = req.nextUrl.searchParams.get('id');
    if (!lecturaId) return NextResponse.json({ ok: false, error: 'id es obligatorio' }, { status: 400 });

    const lectura = await prisma.lecturaTelemetria.findFirst({
      where: { id: lecturaId },
      include: { activo: { select: { usuarioId: true } } },
    });
    if (!lectura || lectura.activo.usuarioId !== payload.id)
      return NextResponse.json({ ok: false, error: 'Lectura no encontrada' }, { status: 403 });

    await prisma.lecturaTelemetria.delete({ where: { id: lecturaId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 },
    );
  }
}
