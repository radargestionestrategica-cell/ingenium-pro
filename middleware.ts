import { NextRequest, NextResponse } from 'next/server';

async function verifyToken(token: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, sig] = parts;
  if (!data || !sig) return false;

  const secret = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', encoder.encode(data + secret));
  const expected = Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return sig === expected;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ip_auth')?.value;

  if (!token || !(await verifyToken(token))) {
    const loginUrl = new URL('/Login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
