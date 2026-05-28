export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth-token';

const OWNER_EMAIL = 'colombosilvanabelen@gmail.com';

export async function POST(req: Request) {
  // Leer cookie ip_auth — mismo patrón que session/route.ts
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match        = cookieHeader.match(/(?:^|;\s*)ip_auth=([^;]+)/);
  const rawToken     = match?.[1];

  const payload = rawToken ? verificarToken(rawToken) : null;
  if (!payload?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Owner — bypass total sin tocar BD
  if (payload.email?.toLowerCase() === OWNER_EMAIL) {
    return NextResponse.json({ ok: true });
  }

  let body: { plan?: unknown } = {};
  try { body = await req.json(); } catch { /* body vacío */ }

  const plan = typeof body.plan === 'string' ? body.plan.trim().toLowerCase() : '';
  if (!plan) {
    return NextResponse.json({ error: 'Plan requerido' }, { status: 400 });
  }

  try {
    const { prisma } = await import('@/lib/prisma');

    if (plan === 'demo') {
      await prisma.usuario.update({
        where: { id: payload.id },
        data:  { planElegido: true, demoStartAt: new Date() },
      });
    } else {
      await prisma.usuario.update({
        where: { id: payload.id },
        data:  { planElegido: true, plan },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar plan' }, { status: 500 });
  }
}
