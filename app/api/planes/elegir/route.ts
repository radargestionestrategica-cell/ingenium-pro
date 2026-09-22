export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verificarToken, generarToken } from '@/lib/auth-token';

const OWNER_EMAIL = 'colombosilvanabelen@gmail.com';

export async function POST(req: Request) {
  // Bearer primero, cookie ip_auth como fallback
  const authHeader  = req.headers.get('authorization') ?? '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  const cookieHeader = req.headers.get('cookie') ?? '';
  const cookieMatch  = cookieHeader.match(/(?:^|;\s*)ip_auth=([^;]+)/);
  const cookieToken  = cookieMatch?.[1] ?? null;

  const rawToken = bearerToken ?? cookieToken;

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

    const now = new Date();

    const usuarioActualizado = plan === 'demo'
      ? await prisma.usuario.update({
          where:  { id: payload.id },
          data:   { planElegido: true, demoStartAt: now },
          select: { plan: true },
        })
      : await prisma.usuario.update({
          where:  { id: payload.id },
          data:   { planElegido: true, plan },
          select: { plan: true },
        });

    // El token siempre refleja el plan real de la BD, nunca el valor pedido en
    // el body: elegir "demo" no toca la columna `plan` (rama de arriba), así
    // que una cuenta que ya tenía un plan pago debe seguir viendo ese plan en
    // su token, no "demo".
    const planReal = usuarioActualizado.plan;

    const token = generarToken({
      id:          payload.id,
      email:       payload.email ?? '',
      plan:        planReal,
      planElegido: true,
      ...((planReal === 'demo' || planReal === 'trial')
        ? { demoExpira: now.getTime() + 259_200_000 }
        : {}),
    });

    const response = NextResponse.json({ ok: true, token });

    response.cookies.set('ip_auth', token, {
      httpOnly: true,
      secure:   true,
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Error al actualizar plan' }, { status: 500 });
  }
}
