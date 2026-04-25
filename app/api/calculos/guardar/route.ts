// app/api/calculos/guardar/route.ts
// ═══════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.1 — API Guardar Cálculo
//  Guarda cada cálculo con hash SHA-256 verificable.
//  El hash es la base del QR y la trazabilidad de activos.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      moduloId,
      submodulo,
      activoNombre,
      parametros,
      resultado,
      normativa,
      usuarioId,
      proyectoId,
      usuario,
    } = body;

    // Validación mínima
    if (!moduloId || !parametros || !resultado) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: moduloId, parametros, resultado' },
        { status: 400 }
      );
    }

    // ── Generar hash SHA-256 único por cálculo ─────────────────
    // El hash combina: módulo + parámetros + resultado + timestamp
    // Esto garantiza que dos cálculos idénticos en distinto momento
    // tengan hashes diferentes — trazabilidad real.
    const timestamp = new Date().toISOString();
    const contenidoHash = JSON.stringify({
      moduloId,
      submodulo: submodulo || '',
      parametros,
      resultado,
      timestamp,
      usuario: usuario || 'anonimo',
    });

    const hash = createHash('sha256')
      .update(contenidoHash)
      .digest('hex');

    // ── Detectar alerta automática ─────────────────────────────
    // Si el resultado contiene campos de alerta conocidos,
    // los propagamos al campo alerta del cálculo.
    let alerta = false;
    let alertaMsg = '';

    if (resultado && typeof resultado === 'object') {
      const r = resultado as Record<string, unknown>;

      // Patrones de alerta reales de los módulos existentes
      if (r.riesgo === 'CRÍTICO' || r.riesgo === 'CRITICAL') {
        alerta = true;
        alertaMsg = String(r.alertaMsg || r.riesgo || 'Riesgo crítico detectado');
      } else if (r.ok === false) {
        alerta = true;
        alertaMsg = String(r.alertaMsg || 'Resultado fuera de límite normativo');
      } else if (r.estado === 'FUERA DE SERVICIO') {
        alerta = true;
        alertaMsg = String(r.recomendacion || 'Activo fuera de servicio — intervención requerida');
      } else if (r.vida_anios !== undefined && Number(r.vida_anios) < 2) {
        alerta = true;
        alertaMsg = `Vida remanente crítica: ${r.vida_anios} años`;
      }
    }

    // ── Guardar en base de datos ───────────────────────────────
    const calculo = await prisma.calculo.create({
      data: {
        tipo:         moduloId,
        moduloId:     moduloId,
        submodulo:    submodulo    || null,
        activoNombre: activoNombre || null,
        parametros:   parametros,
        resultado:    resultado,
        normativa:    normativa    || null,
        hash:         hash,
        alerta:       alerta,
        alertaMsg:    alertaMsg    || null,
        usuario:      usuario      || 'anonimo',
        usuarioId:    usuarioId    || null,
        proyectoId:   proyectoId   || null,
      },
    });

    return NextResponse.json({
      ok: true,
      id:    calculo.id,
      hash:  calculo.hash,
      alerta: calculo.alerta,
      alertaMsg: calculo.alertaMsg,
      verifyUrl: `https://ingeniumpro.store/verify/${calculo.hash}`,
      createdAt: calculo.createdAt,
    });

  } catch (error: unknown) {
    console.error('[API calculos/guardar]', error);

    // Error de hash duplicado — extremadamente raro pero posible
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      return NextResponse.json(
        { error: 'Hash duplicado — reintentá en 1 segundo' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno al guardar cálculo' },
      { status: 500 }
    );
  }
} 