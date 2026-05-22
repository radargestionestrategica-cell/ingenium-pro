import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

function verifyToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, sig] = parts;
  if (!data || !sig) return false;
  const secret = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';
  const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return sig === expected;
}

// Expone el token del cookie httpOnly al cliente tras verificar su firma.
// Usado por AuthGuard como fallback cuando localStorage fue limpiado.
export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)ip_auth=([^;]+)/);
  const token = match?.[1];

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  return NextResponse.json({ token });
}
