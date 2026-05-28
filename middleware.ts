import { NextRequest, NextResponse } from 'next/server';

type Payload = { id?: string; email?: string; plan?: string; demoExpira?: number; isOwner?: boolean };

// Rutas públicas — no requieren cookie, deben pasar siempre
const PUBLIC_API = [
  '/api/v1/auth/login',
  '/api/v1/auth/signup',
  '/api/v1/auth/plan',    // llamado internamente por este middleware
  '/api/v1/auth/logout',
  '/api/pagos/webhook',
  '/planes',
];

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

// AbortController en lugar de AbortSignal.timeout() — compatible con Edge Runtime (V8)
async function getDBPlan(
  userId: string,
  requestUrl: string,
): Promise<{ plan: string; activo: boolean; createdAt?: number; planElegido?: boolean; demoStartAt?: number } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const url = new URL('/api/v1/auth/plan', requestUrl);
    url.searchParams.set('id', userId);
    const secret = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${secret}` },
      signal:  controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    return {
      plan:        String(json.plan ?? 'trial'),
      activo:      json.activo !== false,
      createdAt:   json.createdAt   ? new Date(json.createdAt).getTime()   : undefined,
      planElegido: typeof json.planElegido === 'boolean' ? json.planElegido : undefined,
      demoStartAt: json.demoStartAt ? new Date(json.demoStartAt).getTime() : undefined,
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute   = pathname.startsWith('/api/');

  // Bypass rutas de API públicas
  if (PUBLIC_API.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token    = request.cookies.get('ip_auth')?.value;
  const loginUrl = new URL('/Login', request.url);
  loginUrl.searchParams.set('redirect', pathname);

  if (!token) {
    if (isApiRoute) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (isApiRoute) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    return NextResponse.redirect(loginUrl);
  }

  // Bypass owner — acceso irrestricto
  if (payload.isOwner === true || payload.email?.toLowerCase() === 'colombosilvanabelen@gmail.com') {
    return NextResponse.next();
  }

  // Plan real desde la BD
  let plan = payload.plan;
  let activo = true;
  let dbOk = false;
  let dbCreatedAt:  number | undefined;
  let planElegido:  boolean | undefined;
  let dbDemoStart:  number | undefined;

  if (payload.id) {
    const db = await getDBPlan(payload.id, request.url);
    if (db) {
      plan        = db.plan;
      activo      = db.activo;
      dbCreatedAt = db.createdAt;
      planElegido = db.planElegido;
      dbDemoStart = db.demoStartAt;
      dbOk        = true;
    }
  }

  // Cuenta desactivada
  if (dbOk && !activo) {
    if (isApiRoute) return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 });
    return NextResponse.redirect(new URL('/precios', request.url));
  }

  // REGLA 6: planElegido=false → /planes
  if (dbOk && planElegido === false) {
    if (isApiRoute) return NextResponse.json({ error: 'Plan no elegido' }, { status: 403 });
    return NextResponse.redirect(new URL('/planes', request.url));
  }

  // REGLA 4: demo y demoStartAt > 3 días → /planes
  if (dbOk && (plan === 'demo' || plan === 'trial')) {
    const base = dbDemoStart ?? dbCreatedAt;
    if (typeof base === 'number' && Date.now() - base > 259_200_000) {
      if (isApiRoute) return NextResponse.json({ error: 'Demo expirada' }, { status: 403 });
      return NextResponse.redirect(new URL('/planes', request.url));
    }
  }

  // Planes pagos: siempre pasan
  if (plan === 'enterprise' || plan === 'pro' || plan === 'team' || plan === 'duo' || plan === 'modulo') {
    return NextResponse.next();
  }

  // Demo / trial: verificar expiración
  if (plan === 'demo' || plan === 'trial') {
    const expira = (dbOk && typeof dbCreatedAt === 'number')
      ? dbCreatedAt + 259_200_000
      : payload.demoExpira;

    if (typeof expira === 'number' && Date.now() > expira) {
      if (isApiRoute) return NextResponse.json({ error: 'Demo expirada' }, { status: 403 });
      return NextResponse.redirect(new URL('/precios', request.url));
    }

    return NextResponse.next();
  }

  // Plan vacío o desconocido
  if (isApiRoute) return NextResponse.json({ error: 'Plan inválido' }, { status: 403 });
  return NextResponse.redirect(new URL('/precios', request.url));
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
