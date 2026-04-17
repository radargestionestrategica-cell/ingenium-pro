import crypto from 'crypto';

const PRIVATE_KEY = process.env.CRYPTO_PRIVATE_KEY || '';
const PUBLIC_KEY = process.env.CRYPTO_PUBLIC_KEY || '';

export function hashCalculation(data: Record<string, any>): string {
  const json = JSON.stringify(data);
  return crypto.createHash('sha256').update(json).digest('hex');
}

export function signHash(hash: string): string {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(hash);
  return sign.sign(PRIVATE_KEY, 'base64');
}

export function verifySignature(hash: string, signature: string): boolean {
  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(hash);
    return verify.verify(PUBLIC_KEY, signature, 'base64');
  } catch {
    return false;
  }
}

export function generateCalculationId(): string {
  return `calc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}