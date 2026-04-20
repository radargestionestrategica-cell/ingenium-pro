import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'ingenium_salt_2026').digest('hex');
}

function generarToken(usuario: { id: string; email: string }): string {
  const payload = JSON.stringify({ id: usuario.id, email: usuario.email, ts: Date.now() });
  const firma = crypto.createHash('sha256').update(payload + 'ingenium_jwt_2026').digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + firma;
}

export async function POST(req: Request) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y password requeridos' }, { status: 400 });
    }
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }
    if (!usuario.activo) {
      return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 });
    }
    if (usuario.password !== hashPassword(password)) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }
    const token = generarToken({ id: usuario.id, email: usuario.email });
    return NextResponse.json({
      success: true, token,
      usuario: { id: usuario.id, nombre: usuario.nombre, empresa: usuario.empresa, plan: usuario.plan }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Error de autenticacion' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}