// app/api/admin/backfill-firma/route.ts
// ENDPOINT TEMPORAL — backfill de firma HMAC-SHA256 para Calculo con firma null.
// Solo owner. No recalcula hash, no toca ninguna otra columna. Borrar despues de usar.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';
import { signHash } from '@/lib/cripto';

const OWNER_EMAIL = 'colombosilvanabelen@gmail.com';

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  if (payload.email?.toLowerCase() !== OWNER_EMAIL) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
  }

  try {
    const pendientes = await prisma.calculo.findMany({
      where: { firma: null },
      select: { id: true, hash: true },
    });

    let corregidos = 0;
    let sinHash = 0;

    for (const c of pendientes) {
      if (!c.hash) { sinHash++; continue; } // sin hash no se puede firmar, no se toca
      const firma = signHash(c.hash);
      await prisma.calculo.update({ where: { id: c.id }, data: { firma } });
      corregidos++;
    }

    const restantesConFirmaNull = await prisma.calculo.count({ where: { firma: null } });

    return NextResponse.json({ ok: true, corregidos, sinHash, restantesConFirmaNull });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 },
    );
  }
}
