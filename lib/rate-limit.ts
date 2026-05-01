import { NextResponse } from 'next/server';

type Entry = { count: number; resetTime: number };
const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  maxRequests = 20,
  windowMs = 60_000
): NextResponse | null {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intentá más tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  entry.count++;
  return null;
}
