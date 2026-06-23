import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const b = await req.json();
    if (!b.nombre) {
      return NextResponse.json({ ok: false, error: 'nombre es obligatorio' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { equipoId: true },
    });
    if (!usuario) return respuestaNoAutorizado();

    const proyecto = await prisma.proyecto.create({
      data: {
        nombre: b.nombre,
        industria: b.industria ?? undefined,
        fluido: b.fluido ?? null,
        presion_bar: b.presion_bar ?? null,
        temp_c: b.temp_c ?? null,
        nps: b.nps ?? null,
        material: b.material ?? null,
        norma: b.norma ?? undefined,
        H2S_ppm: b.H2S_ppm ?? undefined,
        zona_elec: b.zona_elec ?? null,
        pais: b.pais ?? undefined,
        usuarioId: payload.id,
        equipoId: usuario.equipoId,
      },
    });

    return NextResponse.json({ ok: true, proyecto });
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
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { equipoId: true },
    });
    if (!usuario) return respuestaNoAutorizado();

    const proyectos = await prisma.proyecto.findMany({
      where: usuario.equipoId
        ? { OR: [{ equipoId: usuario.equipoId }, { usuarioId: payload.id, equipoId: null }] }
        : { usuarioId: payload.id, equipoId: null },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ok: true, total: proyectos.length, data: proyectos });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 },
    );
  }
}
