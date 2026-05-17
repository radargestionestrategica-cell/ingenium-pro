import { NextRequest, NextResponse } from 'next/server';

type Payload = { id?: string; plan?: string; demoExpira?: number };

async function verifyToken(token: string): Promise<Payload | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;

  const secret  = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const buf = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const expected = Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (sig !== expected) return null;

  try {
    return JSON.parse(atob(data)) as Payload;
  } catch {
    return null;
  }
}

// Consulta el plan y estado activo reales llamando al endpoint interno /api/v1/auth/plan.
// Ese endpoint corre en Node.js runtime y usa Prisma — funciona en Vercel producción.
// Si falla (timeout, error de red) devuelve null → el middleware usa el plan del token.
async function getDBPlan(
  userId: string,
  requestUrl: string,
): Promise<{ plan: string; activo: boolean } | null> {
  try {
    const url = new URL('/api/v1/auth/plan', requestUrl);
    url.searchParams.set('id', userId);
    const secret = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return { plan: String(json.plan ?? 'trial'), activo: json.activo !== false };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ip_auth')?.value;

  const loginUrl = new URL('/Login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);

  if (!token) return NextResponse.redirect(loginUrl);

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.redirect(loginUrl);

  // Plan real desde la BD; si falla, se usa el del token como respaldo
  let plan = payload.plan;
  let activo = true;

  if (payload.id) {
    const db = await getDBPlan(payload.id, request.url);
    if (db) {
      plan = db.plan;
      activo = db.activo;
    }
  }

  // Cuenta desactivada → fuera
  if (!activo) {
    return NextResponse.redirect(new URL('/planes', request.url));
  }

  // Planes pagos: siempre pasan, sin chequeo de demo
  if (plan === 'enterprise' || plan === 'pro' || plan === 'team' || plan === 'duo' || plan === 'modulo') {
    return NextResponse.next();
  }

  // Demo / trial: verificar expiración
  if (
    (plan === 'demo' || plan === 'trial') &&
    typeof payload.demoExpira === 'number' &&
    Date.now() > payload.demoExpira
  ) {
    return NextResponse.redirect(new URL('/planes?demo=expired', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
