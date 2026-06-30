import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';
import type { RegistroHistorial } from '@/lib/generarExcel';
import { generarExcelTelemetria } from '@/lib/generarExcelTelemetria';
import type { GeometriaActivoTelemetria } from '@/lib/generarExcelTelemetria';

const NORMATIVA = 'USACE EM 1110-2-1902 · Método de Bishop Simplificado';

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const { lecturaId } = await req.json();
    if (!lecturaId) return NextResponse.json({ ok: false, error: 'lecturaId es obligatorio' }, { status: 400 });

    const lectura = await prisma.lecturaTelemetria.findFirst({
      where: { id: lecturaId },
      include: { activo: { include: { usuario: true, proyecto: true } } },
    });

    if (!lectura || lectura.activo.usuarioId !== payload.id)
      return NextResponse.json({ ok: false, error: 'Lectura no encontrada' }, { status: 403 });

    const { activo } = lectura;
    const usuario = activo.usuario;

    const lecturas = await prisma.lecturaTelemetria.findMany({
      where: { activoId: activo.id },
      include: { usuario: true },
      orderBy: { createdAt: 'asc' },
    });

    const historial: RegistroHistorial[] = lecturas.map((l) => {
      const fs = l.factorSeguridad;
      const alerta = fs != null && fs < 1.3;

      return {
        fecha: l.createdAt,
        submodulo: activo.tipoActivo,
        activoNombre: activo.nombre,
        parametros: {
          'Magnitud': l.magnitud,
          'Valor': l.valor,
          'Unidad': l.unidad,
          'Fuente': l.fuente,
        },
        resultado: {
          'Factor de seguridad': fs != null ? fs.toFixed(3) : '—',
        },
        alerta,
        alertaMsg: alerta ? `Factor de seguridad crítico: ${fs!.toFixed(3)} (mínimo recomendado: 1.5)` : null,
        normativa: NORMATIVA,
        hash: l.hash ?? null,
        usuario: l.usuario.nombre,
      };
    });

    let geometria: GeometriaActivoTelemetria | null = null;
    try {
      const g = JSON.parse(activo.geometriaJson);
      geometria = {
        largoCoronamiento: g.largoCoronamiento,
        anchoCoronamiento: g.anchoCoronamiento,
        profundidad: g.profundidad,
        talud: g.talud,
      };
    } catch { /* best-effort */ }

    const buffer = await generarExcelTelemetria({
      proyectoNombre: activo.proyecto?.nombre ?? 'Sin proyecto',
      industria: activo.proyecto?.industria ?? 'Geotecnia',
      activoNombre: activo.nombre,
      moduloId: `Telemetría — ${activo.tipoActivo}`,
      ingeniero: usuario.nombre,
      email: usuario.email,
      empresa: usuario.empresa,
      pais: usuario.pais,
      matricula: usuario.matricula ?? undefined,
      dni: usuario.dni ?? undefined,
      normativa: NORMATIVA,
      historial,
      cohesion: activo.cohesion,
      friccionGrados: activo.friccionGrados,
      pesoEspecifico: activo.pesoEspecifico,
      tipoRevestimiento: activo.tipoRevestimiento,
      geometria,
      paisSismico: activo.pais,
      zonaSismica: activo.zonaSismica,
    });

    const filename = `telemetria-${activo.nombre.replace(/\s+/g, '-')}-${lectura.id.slice(0, 8)}.xlsx`;
    return new NextResponse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 },
    );
  }
}
