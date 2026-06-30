import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';
import { generarPDF } from '@/lib/generarPDF';

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const { lecturaId } = await req.json();
    if (!lecturaId) return NextResponse.json({ ok: false, error: 'lecturaId es obligatorio' }, { status: 400 });

    const lectura = await prisma.lecturaTelemetria.findFirst({
      where: { id: lecturaId },
      include: { activo: { include: { usuario: true } } },
    });

    if (!lectura || lectura.activo.usuarioId !== payload.id)
      return NextResponse.json({ ok: false, error: 'Lectura no encontrada' }, { status: 403 });

    if (!lectura.hash)
      return NextResponse.json({ ok: false, error: 'Esta lectura no tiene sello criptográfico' }, { status: 400 });

    if (lectura.factorSeguridad == null)
      return NextResponse.json({ ok: false, error: 'Esta lectura no tiene factor de seguridad calculado. Guardá primero los datos de material del suelo.' }, { status: 400 });

    const { activo } = lectura;
    const usuario = activo.usuario;

    let geometria: Record<string, unknown> = {};
    try { geometria = JSON.parse(activo.geometriaJson); } catch { /* best-effort */ }

    const parametros: Record<string, unknown> = {
      'Activo': activo.nombre,
      'Tipo': activo.tipoActivo,
      'Nivel medido (m)': lectura.valor,
      ...geometria,
      ...(activo.cohesion != null        ? { 'Cohesión (kPa)': activo.cohesion } : {}),
      ...(activo.friccionGrados != null   ? { 'Fricción interna (°)': activo.friccionGrados } : {}),
      ...(activo.pesoEspecifico != null   ? { 'Peso específico (kN/m³)': activo.pesoEspecifico } : {}),
      ...(activo.tipoRevestimiento        ? { 'Tipo de revestimiento': activo.tipoRevestimiento } : {}),
      ...(activo.pais                     ? { 'País sísmico': activo.pais } : {}),
      ...(activo.zonaSismica              ? { 'Zona sísmica': activo.zonaSismica } : {}),
    };

    const resultado: Record<string, unknown> = {
      'Nivel medido': `${lectura.valor} ${lectura.unidad}`,
      'Factor de seguridad estático (Bishop)': lectura.factorSeguridad.toFixed(3),
      'Norma': 'USACE EM 1110-2-1902 · Bishop Simplificado',
      'Sello SHA-256': lectura.hash,
    };

    const fs = lectura.factorSeguridad;
    const alerta = fs < 1.3;

    const buffer = await generarPDF({
      hash:          lectura.hash,
      moduloNombre:  'Telemetría — Pileta',
      submodulo:     activo.tipoActivo,
      activoNombre:  activo.nombre,
      normativa:     'USACE EM 1110-2-1902 · Método de Bishop Simplificado',
      ingeniero:     usuario.nombre,
      email:         usuario.email,
      empresa:       usuario.empresa,
      pais:          usuario.pais,
      matricula:     usuario.matricula ?? undefined,
      dni:           usuario.dni ?? undefined,
      fecha:         lectura.createdAt,
      parametros,
      resultado,
      alerta,
      alertaMsg:     alerta ? `Factor de seguridad crítico: ${fs.toFixed(3)} (mínimo recomendado: 1.5)` : undefined,
    });

    const filename = `telemetria-${activo.nombre.replace(/\s+/g, '-')}-${lectura.id.slice(0, 8)}.pdf`;
    return new NextResponse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
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
