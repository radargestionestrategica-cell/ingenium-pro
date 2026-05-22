import { NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { prisma } from '@/lib/prisma';

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

// Verifica el cookie ip_auth, consulta la BD para obtener el plan real,
// genera un token fresco y actualiza el cookie. Usado por AuthGuard como
// fallback cuando localStorage fue limpiado.
export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)ip_auth=([^;]+)/);
  const rawToken = match?.[1];

  const payload = rawToken ? verifyAndDecode(rawToken) : null;
  if (!payload?.id) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, plan: true, activo: true, createdAt: true },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const planFinal = usuario.plan ?? 'trial';
    const freshToken = generarToken({
      id:    usuario.id,
      email: usuario.email,
      plan:  planFinal,
      ...((planFinal === 'demo' || planFinal === 'trial')
        ? { demoExpira: usuario.createdAt.getTime() + 259_200_000 }
        : {}),
    });

    const response = NextResponse.json({ token: freshToken });
    response.cookies.set('ip_auth', freshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   259_200,
      path:     '/',
    });
    return response;
  } catch {
    // Error de BD — devolver el token original verificado como fallback
    return NextResponse.json({ token: rawToken });
  }
}
