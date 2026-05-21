import { NextRequest, NextResponse } from 'next/server';

type Payload = { id?: string; email?: string; plan?: string; demoExpira?: number };

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
// AbortController en lugar de AbortSignal.timeout() — compatible con Edge Runtime (V8).
async function getDBPlan(
  userId: string,
  requestUrl: string,
): Promise<{ plan: string; activo: boolean } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const url = new URL('/api/v1/auth/plan', requestUrl);
    url.searchParams.set('id', userId);
    const secret = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${secret}` },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    return { plan: String(json.plan ?? 'trial'), activo: json.activo !== false };
  } catch {
    clearTimeout(timer);
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

  // Bypass administrador — acceso irrestricto sin verificar plan ni demoExpira
  if (payload.email?.toLowerCase() === 'colombosilvanabelen@gmail.com') return NextResponse.next();

  // Plan real desde la BD; dbOk indica si la consulta llegó a la BD o no
  let plan = payload.plan;
  let activo = true;
  let dbOk = false;

  if (payload.id) {
    const db = await getDBPlan(payload.id, request.url);
    if (db) {
      plan    = db.plan;
      activo  = db.activo;
      dbOk    = true;
    }
  }

  // Cuenta desactivada (solo si la BD lo confirmó)
  if (dbOk && !activo) {
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
    // BD confirmó que sigue en demo/trial → mostrar página de upgrade
    if (dbOk) return NextResponse.redirect(new URL('/planes?demo=expired', request.url));
    // BD no respondió → el token puede ser obsoleto → forzar re-login para obtener token fresco
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
