import * as crypto from 'crypto';

type TokenPayload = {
  id:          string;
  email:       string;
  plan:        string;
  demoExpira?: number;
};

// Verifica HMAC-SHA256 y extrae el payload del token.
// Acepta el token desde el cookie ip_auth o el header Authorization: Bearer.
// Retorna null si el token es inválido, fue alterado o el demo expiró.
export function verificarTokenAPI(req: Request): TokenPayload | null {
  try {
    // 1. Buscar token: primero cookie, luego Authorization header
    const cookieHeader = req.headers.get('cookie') ?? '';
    const cookieMatch  = cookieHeader.match(/(?:^|;\s*)ip_auth=([^;]+)/);
    const authHeader   = req.headers.get('authorization') ?? '';
    const bearerToken  = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const token = cookieMatch?.[1] ?? bearerToken;
    if (!token) return null;

    // 2. Verificar estructura
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, sig] = parts;
    if (!data || !sig) return null;

    // 3. Verificar firma HMAC-SHA256
    const secret   = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';
    const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
    if (sig !== expected) return null;

    // 4. Decodificar payload
    const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8')) as TokenPayload;

    // 5. Verificar expiración del plan demo
    if (
      payload.plan === 'demo' &&
      typeof payload.demoExpira === 'number' &&
      Date.now() > payload.demoExpira
    ) return null;

    return payload;
  } catch {
    return null;
  }
}

export function respuestaNoAutorizado(): Response {
  return new Response(
    JSON.stringify({ error: 'No autorizado' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } },
  );
}
