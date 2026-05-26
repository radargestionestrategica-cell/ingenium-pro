export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { generarToken, verificarToken } from '@/lib/auth-token';

const DEMO_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)ip_auth=([^;]+)/);
  const rawToken = match?.[1];

  const payload = rawToken ? verificarToken(rawToken) : null;
  if (!payload?.id) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  try {
    const { prisma } = await import('@/lib/prisma');
    const usuario = await prisma.usuario.findUnique({
      where:  { id: payload.id },
      select: { id: true, email: true, plan: true, activo: true, createdAt: true, demoStartAt: true },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const planFinal = usuario.plan ?? 'trial';

    // Owner — acceso total sin restricción
    if (usuario.email === 'colombosilvanabelen@gmail.com') {
      const freshToken = generarToken({
        id:      usuario.id,
        email:   usuario.email,
        plan:    planFinal,
        isOwner: true,
      });
      return NextResponse.json({ token: freshToken });
    }

    // Demo / trial — verificar expiración desde demoStartAt (fallback: createdAt)
    if (planFinal === 'demo' || planFinal === 'trial') {
      const base = (usuario.demoStartAt ?? usuario.createdAt).getTime();
      if (Date.now() - base >= DEMO_MS) {
        return NextResponse.json(
          { razon: 'DEMO_EXPIRADA', redirigir: '/pagar' },
          { status: 403 },
        );
      }
    }

    const freshToken = generarToken({
      id:    usuario.id,
      email: usuario.email,
      plan:  planFinal,
      ...((planFinal === 'demo' || planFinal === 'trial')
        ? { demoExpira: (usuario.demoStartAt ?? usuario.createdAt).getTime() + DEMO_MS }
        : {}),
    });

    return NextResponse.json({ token: freshToken });
  } catch {
    return NextResponse.json({ token: rawToken });
  }
}
