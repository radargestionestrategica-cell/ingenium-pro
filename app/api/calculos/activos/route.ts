import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const data = await prisma.calculo.findMany({
      where: {
        usuarioId: payload.id,
        activoNombre: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    type ActivoResumen = {
      nombre: string;
      ultimoTipo: string;
      ultimaAlerta: boolean;
      ultimoAlertaMsg: string | null;
      ultimaFecha: Date;
      totalMediciones: number;
    };

    const porActivo = new Map<string, ActivoResumen>();

    // Clave de agrupacion normalizada (minusculas, espacios colapsados) para
    // no duplicar el mismo activo por variaciones de tipeo; el nombre mostrado
    // sigue siendo el original del calculo mas reciente de ese grupo.
    const normalizar = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

    // data viene ordenado desc (mas reciente primero), asi que el primer
    // registro visto por activo es el ultimo cronologicamente.
    for (const c of data) {
      const nombre = c.activoNombre as string;
      const clave = normalizar(nombre);
      const existente = porActivo.get(clave);
      if (!existente) {
        porActivo.set(clave, {
          nombre,
          ultimoTipo: c.tipo,
          ultimaAlerta: c.alerta,
          ultimoAlertaMsg: c.alertaMsg,
          ultimaFecha: c.createdAt,
          totalMediciones: 1,
        });
      } else {
        existente.totalMediciones += 1;
      }
    }

    const activos = Array.from(porActivo.values());

    return NextResponse.json({ ok: true, total: activos.length, data: activos });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 },
    );
  }
}
