import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const b = await req.json();
    if (!b.nombre || !b.tipoActivo || !b.geometriaJson) {
      return NextResponse.json(
        { ok: false, error: 'nombre, tipoActivo y geometriaJson son obligatorios' },
        { status: 400 },
      );
    }

    const activo = await prisma.activoTelemetria.create({
      data: {
        nombre: b.nombre,
        tipoActivo: b.tipoActivo,
        geometriaJson: b.geometriaJson,
        proyectoId: b.proyectoId ?? null,
        usuarioId: payload.id,
      },
    });

    return NextResponse.json({ ok: true, activo });
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
    const activos = await prisma.activoTelemetria.findMany({
      where: { usuarioId: payload.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ok: true, total: activos.length, data: activos });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 },
    );
  }
}
