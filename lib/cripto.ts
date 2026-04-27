// lib/cripto.ts
// INGENIUM PRO v8.1 — Firma criptográfica real
// SHA-256 + HMAC-SHA256 con clave secreta del servidor
// Node.js crypto nativo — sin dependencias externas

import crypto from 'crypto';

// ── Hash SHA-256 del objeto de cálculo ──────────────────────────
// Usado para identificar unívocamente el cálculo
export function hashCalculation(data: object): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

// ── Firma HMAC-SHA256 con clave secreta del servidor ────────────
// La clave CRIPTO_SECRET debe estar en .env y NUNCA exponerse
// Si el hash fue alterado, la firma no coincide → INVÁLIDO
export function signHash(hash: string): string {
  const secret = process.env.CRIPTO_SECRET;
  if (!secret) {
    throw new Error('CRIPTO_SECRET no definido en variables de entorno');
  }
  return crypto
    .createHmac('sha256', secret)
    .update(hash)
    .digest('hex');
}

// ── Verificar firma — usado en app/verify/[hash] ─────────────────
// Compara la firma guardada en BD con la recalculada
// Retorna true solo si el hash no fue modificado
export function verifySignature(hash: string, firma: string): boolean {
  const secret = process.env.CRIPTO_SECRET;
  if (!secret) return false;
  const firmaEsperada = crypto
    .createHmac('sha256', secret)
    .update(hash)
    .digest('hex');
  // Comparación segura contra timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(firma, 'hex'),
    Buffer.from(firmaEsperada, 'hex')
  );
}

// ── UUID único para cada cálculo ─────────────────────────────────
export function generateCalculationId(): string {
  return crypto.randomUUID();
} 