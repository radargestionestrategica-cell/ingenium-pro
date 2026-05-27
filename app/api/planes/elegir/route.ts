export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

const PLANES_VALIDOS = ['Demo', 'Pro', 'Team', 'Enterprise'];

export async function POST(req: Request) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  let body: { plan?: unknown } = {};
  try { body = await req.json(); } catch { /* body vacío */ }

  const plan = typeof body.plan === 'string' ? body.plan : '';
  if (!PLANES_VALIDOS.includes(plan)) {
    return NextResponse.json(
      { error: `Plan inválido. Valores aceptados: ${PLANES_VALIDOS.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const { prisma } = await import('@/lib/prisma');

    await prisma.usuario.update({
      where: { id: payload.id },
      data: {
        planElegido: true,
        ...(plan === 'Demo' ? { demoStartAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar plan' }, { status: 500 });
  }
}
