// app/api/calculos/exportar/route.ts
// INGENIUM PRO V8 — Exportación Excel y PDF profesional
// Campos: verificados contra schema.prisma real
// Interfaces: verificadas contra generarEXCEL.ts y generarPDF.ts reales

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient }              from '@prisma/client';
import { generarExcel }              from '@/lib/generarEXCEL';
import { generarPDF }                from '@/lib/generarPDF';
import type { RegistroHistorial }    from '@/lib/generarEXCEL';

const prisma = new PrismaClient();

const MODULO_NOMBRES: Record<string, string> = {
  MAOP:         'Petróleo y Gas — ASME B31.8',
  PERFORACION:  'Perforación — API RP 13D',
  HIDRAULICA:   'Hidráulica — Darcy-Weisbach / Hazen-Williams',
  JOUKOWSKY:    'Golpe de Ariete — Joukowsky',
  BISHOP:       'Estabilidad de Taludes — Bishop Simplificado',
  DARCY:        'Hidráulica — Darcy-Weisbach',
  THERMAL:      'Dilatación Térmica — ASME B31.3',
  ELECTRICIDAD: 'Electricidad — NEC / IEC 60228 / IEC 60909',
  SOLDADURA:    'Soldadura — AWS D1.1 / ASME IX',
  MMO:          'Mantenimiento Mayor de Operaciones',
  CANERIAS:     'Cañerías — ASME B31.3',
  VALVULAS:     'Válvulas — API 600 / ISA 75',
  ESTRUCTURAL:  'Estructural — CIRSOC 101 / AISC 360',
  GEOTECNIA:    'Geotecnia — ASTM D1586 / Eurocode 7',
};

// Tipo exacto basado en schema.prisma verificado
type CalcConRel = {
  id:           string;
  tipo:         string;
  moduloId:     string | null;
  submodulo:    string | null;
  activoNombre: string | null;
  parametros:   unknown;
  resultado:    unknown;
  normativa:    string | null;
  hash:         string | null;
  alerta:       boolean;
  alertaMsg:    string | null;
  usuario:      string;
  usuarioId:    string | null;
  proyectoId:   string | null;
  createdAt:    Date;
  user: {
    nombre:  string;
    empresa: string;
    pais:    string;
  } | null;
  proyecto: {
    nombre:    string;
    industria: string;
  } | null;
};

const INCLUDE = {
  user:     { select: { nombre: true, empresa: true, pais: true } },
  proyecto: { select: { nombre: true, industria: true } },
};

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json() as {
      calculoId?:  string;
      usuarioId?:  string;
      proyectoId?: string;
      tipo?:       string;
      formato?:    'excel' | 'pdf';
    };

    const { calculoId, usuarioId, proyectoId, tipo, formato = 'excel' } = body;

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 });
    }

    let calculos: CalcConRel[] = [];

    if (calculoId) {
      const uno = await prisma.calculo.findUnique({
        where:   { id: calculoId },
        include: INCLUDE,
      });
      if (!uno) {
        return NextResponse.json({ error: 'Cálculo no encontrado' }, { status: 404 });
      }
      calculos = [uno as unknown as CalcConRel];

    } else if (proyectoId) {
      const lista = await prisma.calculo.findMany({
        where:   { usuarioId, proyectoId },
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        take:    500,
      });
      calculos = lista as unknown as CalcConRel[];

    } else if (tipo) {
      const lista = await prisma.calculo.findMany({
        where:   { usuarioId, tipo },
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        take:    200,
      });
      calculos = lista as unknown as CalcConRel[];

    } else {
      const lista = await prisma.calculo.findMany({
        where:   { usuarioId },
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        take:    100,
      });
      calculos = lista as unknown as CalcConRel[];
    }

    if (calculos.length === 0) {
      return NextResponse.json({ error: 'No hay cálculos para exportar' }, { status: 404 });
    }

    const primero   = calculos[0];
    const ingeniero = primero.user?.nombre    ?? 'Ingeniero';
    const empresa   = primero.user?.empresa   ?? 'INGENIUM PRO';
    const pais      = primero.user?.pais      ?? '';
    const proyecto  = primero.proyecto?.nombre    ?? 'Sin proyecto';
    const industria = primero.proyecto?.industria ?? 'Ingeniería';
    const fecha     = new Date().toISOString().slice(0, 10);

    // ── PDF — un solo cálculo ────────────────────────────────────────────────
    if (formato === 'pdf') {
      const calc   = calculos[0];
      const params = calc.parametros as Record<string, unknown>;
      const res    = calc.resultado  as Record<string, unknown>;

      const buffer = await generarPDF({
        hash:           calc.hash         ?? '',
        moduloNombre:   MODULO_NOMBRES[calc.moduloId ?? calc.tipo] ?? calc.tipo,
        submodulo:      calc.submodulo    ?? undefined,
        activoNombre:   calc.activoNombre ?? undefined,
        normativa:      calc.normativa    ?? undefined,
        proyectoNombre: calc.proyecto?.nombre    ?? undefined,
        industria:      calc.proyecto?.industria ?? undefined,
        ingeniero,
        empresa,
        pais,
        fecha:          calc.createdAt,
        parametros:     params,
        resultado:      res,
        alerta:         calc.alerta,
        alertaMsg:      calc.alertaMsg ?? undefined,
      });

      const uint8    = new Uint8Array(buffer);
      const activo   = (calc.activoNombre ?? 'ACTIVO').replace(/\s+/g, '_');
      const fileName = `INGENIUM_PRO_${activo}_${fecha}.pdf`;

      return new Response(uint8, {
        status: 200,
        headers: {
          'Content-Type':        'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length':      String(uint8.byteLength),
          'Cache-Control':       'no-store',
        },
      });
    }

    // ── EXCEL — uno o múltiples cálculos ─────────────────────────────────────
    const primerParams = primero.parametros as Record<string, unknown>;

    const t_nom_mm = typeof primerParams['t_nom_mm'] === 'number' ? primerParams['t_nom_mm'] :
                     typeof primerParams['t_dis_mm'] === 'number' ? primerParams['t_dis_mm'] : undefined;
    const t_min_mm = typeof primerParams['t_min_mm'] === 'number' ? primerParams['t_min_mm'] : undefined;
    const presion_bar = typeof primerParams['presion_bar'] === 'number' ? primerParams['presion_bar'] :
                        typeof primerParams['P_bar']       === 'number' ? primerParams['P_bar']       : undefined;

    const historial: RegistroHistorial[] = calculos.map(calc => ({
      fecha:        calc.createdAt,
      submodulo:    calc.submodulo    ?? calc.tipo,
      activoNombre: calc.activoNombre ?? '—',
      parametros:   calc.parametros   as Record<string, unknown>,
      resultado:    calc.resultado    as Record<string, unknown>,
      alerta:       calc.alerta,
      alertaMsg:    calc.alertaMsg,
      normativa:    calc.normativa,
      hash:         calc.hash,
      usuario:      calc.usuario,
    }));

    const buffer = await generarExcel({
      proyectoNombre: proyecto,
      industria,
      activoNombre:   primero.activoNombre ?? '—',
      moduloId:       primero.moduloId     ?? primero.tipo,
      ingeniero,
      empresa,
      pais,
      normativa:      primero.normativa    ?? '—',
      historial,
      t_nom_mm,
      t_min_mm,
      presion_bar,
    });

    const uint8    = new Uint8Array(buffer);
    const fileName = `INGENIUM_PRO_${proyecto.replace(/\s+/g, '_')}_${fecha}.xlsx`;

    return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length':      String(uint8.byteLength),
        'Cache-Control':       'no-store',
      },
    });

  } catch (error) {
    console.error('[API calculos/exportar]', error);
    return NextResponse.json(
      { error: 'Error interno al generar archivo' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 