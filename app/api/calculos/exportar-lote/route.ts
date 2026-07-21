// app/api/calculos/exportar-lote/route.ts
// INGENIUM PRO — Exportación en lote (Excel, una hoja por cálculo)
// Recibe varios calculoId, arma DatosExcelLote y llama generarExcelLote.
// Node.js runtime — ExcelJS no corre en cliente.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generarExcelLote, type CalculoLote } from '@/lib/generarExcel';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function POST(req: NextRequest): Promise<Response> {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const body = await req.json() as { calculoIds?: unknown };
    const calculoIds = Array.isArray(body.calculoIds)
      ? body.calculoIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : [];

    if (calculoIds.length === 0) {
      return NextResponse.json({ error: 'calculoIds es obligatorio y no puede estar vacío' }, { status: 400 });
    }

    const calculos = await prisma.calculo.findMany({
      where: { id: { in: calculoIds }, usuarioId: payload.id },
      include: {
        user: {
          select: { nombre: true, email: true, empresa: true, pais: true, matricula: true, dni: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (calculos.length === 0) {
      return NextResponse.json({ error: 'No se encontraron cálculos para exportar' }, { status: 404 });
    }

    const primero = calculos[0];
    const usr = primero.user;

    const calculosLote: CalculoLote[] = calculos.map((calc) => ({
      tipo:         calc.moduloId ?? calc.tipo,
      submodulo:    calc.submodulo,
      activoNombre: calc.activoNombre ?? '—',
      parametros:   calc.parametros as Record<string, unknown>,
      resultado:    calc.resultado as Record<string, unknown>,
      alerta:       calc.alerta,
      alertaMsg:    calc.alertaMsg,
      normativa:    calc.normativa,
      hash:         calc.hash,
      usuario:      calc.usuario,
      fecha:        calc.createdAt,
    }));

    const buffer = await generarExcelLote({
      ingeniero:  usr?.nombre    ?? primero.usuario ?? 'Ingeniero',
      email:      usr?.email     ?? '',
      empresa:    usr?.empresa   ?? 'INGENIUM PRO',
      pais:       usr?.pais      ?? '',
      matricula:  usr?.matricula ?? undefined,
      dni:        usr?.dni       ?? undefined,
      calculos:   calculosLote,
    });

    const uint8 = new Uint8Array(buffer);
    const fecha = new Date().toISOString().slice(0, 10);
    const fileName = `INGENIUM_PRO_LOTE_${fecha}.xlsx`;

    return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(uint8.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[API calculos/exportar-lote][POST]', error);
    return NextResponse.json({ error: 'Error interno al generar archivo en lote' }, { status: 500 });
  }
}
