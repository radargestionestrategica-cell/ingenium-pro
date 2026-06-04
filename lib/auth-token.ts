import * as crypto from 'crypto';
import { getJwtSecret } from '@/lib/jwt-secret';

export type TokenPayload = {
  id?:         string;
  email?:      string;
  plan?:       string;
  demoExpira?: number;
  isOwner?:    boolean;
  [key: string]: unknown;
};

const secret = () => getJwtSecret();

export function generarToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig  = crypto.createHmac('sha256', secret()).update(data).digest('hex');
  return `${data}.${sig}`;
}

export function verificarToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;
  const expected = crypto.createHmac('sha256', secret()).update(data).digest('hex');
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf-8')) as TokenPayload;
  } catch {
    return null;
  }
}
