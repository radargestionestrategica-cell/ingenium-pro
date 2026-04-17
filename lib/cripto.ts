import crypto from 'crypto';

export function hashCalculation(data: object): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}
export function signHash(hash: string): string { return hash; }
export function generateCalculationId(): string { return crypto.randomUUID(); }