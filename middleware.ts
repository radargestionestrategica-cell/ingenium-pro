import { NextRequest, NextResponse } from 'next/server';

type Payload = { plan?: string; demoExpira?: number };

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

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ip_auth')?.value;

  const loginUrl = new URL('/Login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);

  if (!token) return NextResponse.redirect(loginUrl);

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.redirect(loginUrl);

  // Demo expirado → redirigir a planes
  if (
    (payload.plan === 'demo' || payload.plan === 'trial') &&
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
