// app/api/calculos/exportar/route.ts
// INGENIUM PRO v8.1 — Exportación PDF y Excel
// Corrección quirúrgica:
// - Mantiene POST existente.
// - Agrega GET compatible con BotonesExportar actual.
// - Permite exportar por calculoId sin exigir usuarioId.
// - No modifica Prisma schema, módulos, login, pagos ni dashboard.

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generarExcel } from '@/lib/generarEXCEL';
import { generarPDF } from '@/lib/generarPDF';
import type { RegistroHistorial } from '@/lib/generarEXCEL';

const prisma = new PrismaClient();

type FormatoExportacion = 'excel' | 'pdf';

type SolicitudExportacion = {
  calculoId?: string;
  usuarioId?: string;
  proyectoId?: string;
  tipo?: string;
  formato?: FormatoExportacion;
};

type CalcConRel = {
  id: string;
  tipo: string;
  moduloId: string | null;
  submodulo: string | null;
  activoNombre: string | null;
  parametros: unknown;
  resultado: unknown;
  normativa: string | null;
  hash: string | null;
  alerta: boolean;
  alertaMsg: string | null;
  usuario: string;
  usuarioId: string | null;
  proyectoId: string | null;
  createdAt: Date;
  user: {
    nombre: string;
    empresa: string;
    pais: string;
  } | null;
  proyecto: {
    nombre: string;
    industria: string;
  } | null;
};

const MODULO_NOMBRES: Record<string, string> = {
  MAOP: 'Petróleo y Gas — ASME B31.8',
  PERFORACION: 'Perforación — API RP 13D',
  HIDRAULICA: 'Hidráulica — Darcy-Weisbach / Hazen-Williams',
  JOUKOWSKY: 'Golpe de Ariete — Joukowsky',
  BISHOP: 'Estabilidad de Taludes — Bishop Simplificado',
  DARCY: 'Hidráulica — Darcy-Weisbach',
  THERMAL: 'Dilatación Térmica — ASME B31.3',
  ELECTRICIDAD: 'Electricidad — NEC / IEC 60228 / IEC 60909',
  SOLDADURA: 'Soldadura — AWS D1.1 / ASME IX',
  MMO: 'Mantenimiento Mayor de Operaciones',
  CANERIAS: 'Cañerías — ASME B31.3',
  VALVULAS: 'Válvulas — API 600 / ISA 75',
  ESTRUCTURAL: 'Estructural — CIRSOC 101 / AISC 360',
  GEOTECNIA: 'Geotecnia — ASTM D1586 / Eurocode 7',
};

const INCLUDE = {
  user: {
    select: {
      nombre: true,
      empresa: true,
      pais: true,
    },
  },
  proyecto: {
    select: {
      nombre: true,
      industria: true,
    },
  },
};

function limpiarTexto(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined;
  const limpio = valor.trim();
  return limpio.length > 0 ? limpio : undefined;
}

function normalizarFormato(valor: unknown): FormatoExportacion {
  return valor === 'pdf' ? 'pdf' : 'excel';
}

function obtenerNombreModulo(calc: CalcConRel): string {
  const clave = calc.moduloId ?? calc.tipo;
  return MODULO_NOMBRES[clave] ?? calc.tipo;
}

function obtenerNumero(parametros: Record<string, unknown>, claves: string[]): number | undefined {
  for (const clave of claves) {
    const valor = parametros[clave];
    if (typeof valor === 'number' && Number.isFinite(valor)) return valor;
  }

  return undefined;
}

async function buscarCalculos(solicitud: SolicitudExportacion): Promise<CalcConRel[] | Response> {
  const calculoId = limpiarTexto(solicitud.calculoId);
  const usuarioId = limpiarTexto(solicitud.usuarioId);
  const proyectoId = limpiarTexto(solicitud.proyectoId);
  const tipo = limpiarTexto(solicitud.tipo);

  if (calculoId) {
    const calculo = await prisma.calculo.findUnique({
      where: { id: calculoId },
      include: INCLUDE,
    });

    if (!calculo) {
      return NextResponse.json(
        { error: 'Cálculo no encontrado' },
        { status: 404 }
      );
    }

    return [calculo as unknown as CalcConRel];
  }

  if (!usuarioId) {
    return NextResponse.json(
      { error: 'usuarioId es requerido cuando no se envía calculoId' },
      { status: 400 }
    );
  }

  if (proyectoId) {
    const calculos = await prisma.calculo.findMany({
      where: {
        usuarioId,
        proyectoId,
      },
      include: INCLUDE,
      orderBy: {
        createdAt: 'desc',
      },
      take: 500,
    });

    return calculos as unknown as CalcConRel[];
  }

  if (tipo) {
    const calculos = await prisma.calculo.findMany({
      where: {
        usuarioId,
        tipo,
      },
      include: INCLUDE,
      orderBy: {
        createdAt: 'desc',
      },
      take: 200,
    });

    return calculos as unknown as CalcConRel[];
  }

  const calculos = await prisma.calculo.findMany({
    where: {
      usuarioId,
    },
    include: INCLUDE,
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  return calculos as unknown as CalcConRel[];
}

async function generarRespuestaExportacion(solicitud: SolicitudExportacion): Promise<Response> {
  const formato = normalizarFormato(solicitud.formato);
  const calculosOrResponse = await buscarCalculos(solicitud);

  if (calculosOrResponse instanceof Response) {
    return calculosOrResponse;
  }

  const calculos = calculosOrResponse;

  if (calculos.length === 0) {
    return NextResponse.json(
      { error: 'No hay cálculos para exportar' },
      { status: 404 }
    );
  }

  const primero = calculos[0];

  const ingeniero = primero.user?.nombre ?? primero.usuario ?? 'Ingeniero';
  const empresa = primero.user?.empresa ?? 'INGENIUM PRO';
  const pais = primero.user?.pais ?? '';
  const proyecto = primero.proyecto?.nombre ?? 'Sin proyecto';
  const industria = primero.proyecto?.industria ?? 'Ingeniería';
  const fechaArchivo = new Date().toISOString().slice(0, 10);

  if (formato === 'pdf') {
    const calc = calculos[0];
    const parametros = calc.parametros as Record<string, unknown>;
    const resultado = calc.resultado as Record<string, unknown>;

    const buffer = await generarPDF({
      hash: calc.hash ?? '',
      moduloNombre: obtenerNombreModulo(calc),
      submodulo: calc.submodulo ?? undefined,
      activoNombre: calc.activoNombre ?? undefined,
      normativa: calc.normativa ?? undefined,
      proyectoNombre: calc.proyecto?.nombre ?? undefined,
      industria: calc.proyecto?.industria ?? undefined,
      ingeniero,
      empresa,
      pais,
      fecha: calc.createdAt,
      parametros,
      resultado,
      alerta: calc.alerta,
      alertaMsg: calc.alertaMsg ?? undefined,
    });

    const uint8 = new Uint8Array(buffer);
    const activo = (calc.activoNombre ?? calc.tipo ?? 'ACTIVO').replace(/\s+/g, '_');
    const fileName = `INGENIUM_PRO_${activo}_${fechaArchivo}.pdf`;

    return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(uint8.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  }

  const primerParams = primero.parametros as Record<string, unknown>;

  const t_nom_mm = obtenerNumero(primerParams, ['t_nom_mm', 't_dis_mm']);
  const t_min_mm = obtenerNumero(primerParams, ['t_min_mm']);
  const presion_bar = obtenerNumero(primerParams, ['presion_bar', 'P_bar']);

  const historial: RegistroHistorial[] = calculos.map((calc) => ({
    fecha: calc.createdAt,
    submodulo: calc.submodulo ?? calc.tipo,
    activoNombre: calc.activoNombre ?? '—',
    parametros: calc.parametros as Record<string, unknown>,
    resultado: calc.resultado as Record<string, unknown>,
    alerta: calc.alerta,
    alertaMsg: calc.alertaMsg,
    normativa: calc.normativa,
    hash: calc.hash,
    usuario: calc.usuario,
  }));

  const buffer = await generarExcel({
    proyectoNombre: proyecto,
    industria,
    activoNombre: primero.activoNombre ?? '—',
    moduloId: primero.moduloId ?? primero.tipo,
    ingeniero,
    empresa,
    pais,
    normativa: primero.normativa ?? '—',
    historial,
    t_nom_mm,
    t_min_mm,
    presion_bar,
  });

  const uint8 = new Uint8Array(buffer);
  const fileName = `INGENIUM_PRO_${proyecto.replace(/\s+/g, '_')}_${fechaArchivo}.xlsx`;

  return new Response(uint8, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(uint8.byteLength),
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json() as SolicitudExportacion;

    return await generarRespuestaExportacion({
      calculoId: limpiarTexto(body.calculoId),
      usuarioId: limpiarTexto(body.usuarioId),
      proyectoId: limpiarTexto(body.proyectoId),
      tipo: limpiarTexto(body.tipo),
      formato: normalizarFormato(body.formato),
    });
  } catch (error) {
    console.error('[API calculos/exportar][POST]', error);

    return NextResponse.json(
      { error: 'Error interno al generar archivo' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);

    const id = limpiarTexto(searchParams.get('id')) ?? limpiarTexto(searchParams.get('calculoId'));
    const usuarioId = limpiarTexto(searchParams.get('usuarioId'));
    const proyectoId = limpiarTexto(searchParams.get('proyectoId'));

    const tipoParam = limpiarTexto(searchParams.get('tipo'));
    const formatoParam = limpiarTexto(searchParams.get('formato'));

    const tipoEsFormato = tipoParam === 'pdf' || tipoParam === 'excel';

    return await generarRespuestaExportacion({
      calculoId: id,
      usuarioId,
      proyectoId,
      tipo: tipoEsFormato ? undefined : tipoParam,
      formato: normalizarFormato(formatoParam ?? (tipoEsFormato ? tipoParam : undefined)),
    });
  } catch (error) {
    console.error('[API calculos/exportar][GET]', error);

    return NextResponse.json(
      { error: 'Error interno al generar archivo' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}