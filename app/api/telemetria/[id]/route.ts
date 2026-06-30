import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const { id } = await params;
    const b = await req.json();

    const data: Record<string, number | string> = {};

    if (b.cohesion !== undefined) {
      if (typeof b.cohesion !== 'number' || b.cohesion < 0 || b.cohesion > 500)
        return NextResponse.json({ ok: false, error: 'cohesion debe estar entre 0 y 500' }, { status: 400 });
      data.cohesion = b.cohesion;
    }
    if (b.friccionGrados !== undefined) {
      if (typeof b.friccionGrados !== 'number' || b.friccionGrados < 0 || b.friccionGrados > 50)
        return NextResponse.json({ ok: false, error: 'friccionGrados debe estar entre 0 y 50' }, { status: 400 });
      data.friccionGrados = b.friccionGrados;
    }
    if (b.pesoEspecifico !== undefined) {
      if (typeof b.pesoEspecifico !== 'number' || b.pesoEspecifico < 10 || b.pesoEspecifico > 25)
        return NextResponse.json({ ok: false, error: 'pesoEspecifico debe estar entre 10 y 25' }, { status: 400 });
      data.pesoEspecifico = b.pesoEspecifico;
    }

    if (b.tipoRevestimiento !== undefined) {
      const vals = ['revestida', 'sin_revestir'];
      if (typeof b.tipoRevestimiento !== 'string' || !vals.includes(b.tipoRevestimiento))
        return NextResponse.json({ ok: false, error: 'tipoRevestimiento debe ser revestida o sin_revestir' }, { status: 400 });
      data.tipoRevestimiento = b.tipoRevestimiento;
    }

    if (b.pesoEspecificoHormigon !== undefined) {
      if (typeof b.pesoEspecificoHormigon !== 'number' || b.pesoEspecificoHormigon < 10 || b.pesoEspecificoHormigon > 30)
        return NextResponse.json({ ok: false, error: 'pesoEspecificoHormigon debe estar entre 10 y 30' }, { status: 400 });
      data.pesoEspecificoHormigon = b.pesoEspecificoHormigon;
    }
    if (b.coeficienteFriccionBase !== undefined) {
      if (typeof b.coeficienteFriccionBase !== 'number' || b.coeficienteFriccionBase < 0 || b.coeficienteFriccionBase > 2)
        return NextResponse.json({ ok: false, error: 'coeficienteFriccionBase debe estar entre 0 y 2' }, { status: 400 });
      data.coeficienteFriccionBase = b.coeficienteFriccionBase;
    }
    if (b.permeabilidadRevestimiento !== undefined) {
      if (typeof b.permeabilidadRevestimiento !== 'number' || b.permeabilidadRevestimiento < 0 || b.permeabilidadRevestimiento > 0.0001)
        return NextResponse.json({ ok: false, error: 'permeabilidadRevestimiento debe estar entre 0 y 0.0001' }, { status: 400 });
      data.permeabilidadRevestimiento = b.permeabilidadRevestimiento;
    }

    if (b.pais !== undefined) {
      if (typeof b.pais !== 'string')
        return NextResponse.json({ ok: false, error: 'pais debe ser texto' }, { status: 400 });
      data.pais = b.pais;
    }
    if (b.zonaSismica !== undefined) {
      if (typeof b.zonaSismica !== 'string')
        return NextResponse.json({ ok: false, error: 'zonaSismica debe ser texto' }, { status: 400 });
      data.zonaSismica = b.zonaSismica;
    }

    if (Object.keys(data).length === 0)
      return NextResponse.json({ ok: false, error: 'No hay campos válidos para actualizar' }, { status: 400 });

    const activo = await prisma.activoTelemetria.updateMany({
      where: { id, usuarioId: payload.id },
      data,
    });

    if (activo.count === 0)
      return NextResponse.json({ ok: false, error: 'Activo no encontrado' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 },
    );
  }
}

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
