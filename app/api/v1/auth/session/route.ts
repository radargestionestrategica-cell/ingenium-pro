export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

function verifyAndDecode(token: string): { id?: string; email?: string; plan?: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;
  const secret = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';
  const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

function generarToken(payload: object): string {
  const secret = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return `${data}.${sig}`;
}

const DEMO_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)ip_auth=([^;]+)/);
  const rawToken = match?.[1];

  const payload = rawToken ? verifyAndDecode(rawToken) : null;
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
