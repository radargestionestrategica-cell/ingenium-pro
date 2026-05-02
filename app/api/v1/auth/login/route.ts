import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

function hashPassword(password: string): string {
  const salt = process.env.JWT_SALT;
  if (!salt) throw new Error('JWT_SALT not configured');
  return crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

function generarToken(payload: object): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto
    .createHash('sha256')
    .update(data + secret)
    .digest('hex');
  return `${data}.${sig}`;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const limited = rateLimit(`login:${ip}`, 10, 60_000);
  if (limited) return limited;

  try {
    const body = await req.json();

    const email = typeof body.email === 'string'
      ? body.email.trim().toLowerCase()
      : '';

    const password = typeof body.password === 'string'
      ? body.password
      : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || usuario.password !== hashPassword(password)) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    if (!usuario.activo) {
      return NextResponse.json(
        { error: 'Cuenta desactivada' },
        { status: 403 }
      );
    }

    const token = generarToken({
      id: usuario.id,
      email: usuario.email,
      plan: usuario.plan,
      demoExpira: Date.now() + 259_200_000,
    });

    return NextResponse.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        empresa: usuario.empresa,
        pais: usuario.pais,
        plan: usuario.plan,
        activo: usuario.activo,
        createdAt: usuario.createdAt,
      },
    });
  } catch (err) {
    console.error('[api/v1/auth/login] Error:', err);

    return NextResponse.json(
      { error: 'Error de autenticación' },
      { status: 500 }
    );
  }
}