// lib/jwt-secret.ts
// Fuente única de verdad del secreto JWT.
// Edge-safe: solo usa process.env. NO importa crypto de Node.
// Si JWT_SECRET no está definido, lanza error en vez de usar un fallback predecible.
let cached: string | null = null;

export function getJwtSecret(): string {
  if (cached) return cached;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'JWT_SECRET no está configurado o es demasiado corto. ' +
      'Definí JWT_SECRET (mínimo 16 caracteres) en las variables de entorno.'
    );
  }
  cached = secret;
  return secret;
}
