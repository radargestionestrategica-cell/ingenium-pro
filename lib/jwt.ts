import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET || 'ingenium-secret-2026';

export function signJWT(payload: object): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyJWT(token: string): object | null {
  try {
    return jwt.verify(token, SECRET) as object;
  } catch {
    return null;
  }
}