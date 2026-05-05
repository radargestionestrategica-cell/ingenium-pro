import { NextResponse } from 'next/server';

// ── In-memory fallback (desarrollo / sin credenciales Redis) ──────
type Entry = { count: number; resetTime: number };
const store = new Map<string, Entry>();

function inMemoryLimit(
  key: string, maxRequests: number, windowMs: number,
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
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  entry.count++;
  return null;
}

// ── Redis (Upstash) — persiste entre cold starts en serverless ────
// Se activa solo cuando están presentes UPSTASH_REDIS_REST_URL y
// UPSTASH_REDIS_REST_TOKEN. Sin ellos, cae al in-memory de arriba.
let redisLimiter: ((key: string, max: number, windowMs: number) => Promise<NextResponse | null>) | null = null;

async function initRedis() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) return;

  try {
    const { Redis }     = await import('@upstash/redis');
    const { Ratelimit } = await import('@upstash/ratelimit');

    const redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    redisLimiter = async (key: string, max: number, windowMs: number) => {
      const rl = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, `${windowMs / 1000} s`),
        prefix:  'rl:ingenium',
      });

      const { success, reset } = await rl.limit(key);
      if (success) return null;

      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intentá más tarde.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      );
    };
  } catch {
    // Upstash no disponible — continúa con in-memory
  }
}

// Inicializar Redis de forma lazy (solo una vez, en caliente)
let _initPromise: Promise<void> | null = null;

export async function rateLimitAsync(
  key: string, maxRequests = 20, windowMs = 60_000,
): Promise<NextResponse | null> {
  if (!_initPromise) _initPromise = initRedis();
  await _initPromise;

  if (redisLimiter) {
    return redisLimiter(key, maxRequests, windowMs);
  }
  return inMemoryLimit(key, maxRequests, windowMs);
}

// ── API síncrona — backward-compatible con el código existente ────
// Usa in-memory cuando se llama de forma síncrona.
// Las rutas nuevas deben preferir rateLimitAsync().
export function rateLimit(
  key: string, maxRequests = 20, windowMs = 60_000,
): NextResponse | null {
  return inMemoryLimit(key, maxRequests, windowMs);
}
