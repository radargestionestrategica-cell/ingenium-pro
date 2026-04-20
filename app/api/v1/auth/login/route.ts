import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

function hashPassword(p: string): string {
  return crypto.createHash('sha256').update(p + 'ingenium_salt_2026').digest('hex');
}

function generarToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHash('sha256').update(data + 'ingenium_jwt_2026').digest('hex');
  return `${data}.${sig}`;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || usuario.password !== hashPassword(password)) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }
    if (!usuario.activo) {
      return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 });
    }
    const token = generarToken({ id: usuario.id, email: usuario.email });
    return NextResponse.json({
      success: true, token,
      usuario: { id: usuario.id, nombre: usuario.nombre, empresa: usuario.empresa, plan: usuario.plan },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Error de autenticacion' }, { status: 500 });
  }
}