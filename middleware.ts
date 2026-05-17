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

// Consulta el plan y estado activo reales desde Neon vía HTTP query API.
// Si falla (red, timeout, etc.) devuelve null → el middleware usa el plan del token.
async function getDBPlan(userId: string): Promise<{ plan: string; activo: boolean } | null> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  try {
    const hostMatch = databaseUrl.match(/^postgres(?:ql)?:\/\/[^@]+@([^/?]+)/);
    if (!hostMatch) return null;
    const host = hostMatch[1];
    const connString = databaseUrl.split('?')[0];

    const res = await fetch(`https://${host}/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': connString,
      },
      body: JSON.stringify({
        query: 'SELECT plan, activo FROM "Usuario" WHERE id = $1 LIMIT 1',
        params: [userId],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const row = json.rows?.[0];
    if (!row) return null;
    return { plan: String(row.plan ?? 'trial'), activo: row.activo !== false };
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
    const db = await getDBPlan(payload.id);
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
