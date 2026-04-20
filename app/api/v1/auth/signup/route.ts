import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

function hashPassword(p: string): string {
  return crypto.createHash('sha256').update(p + 'ingenium_salt_2026').digest('hex');
}

export async function POST(req: Request) {
  try {
    const { email, password, nombre, empresa, pais } = await req.json();
    if (!email || !password || !nombre || !empresa) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }
    const usuario = await prisma.usuario.create({
      data: { email, password: hashPassword(password), nombre, empresa, pais: pais || 'Argentina' },
    });
    return NextResponse.json({ success: true, id: usuario.id, nombre: usuario.nombre });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}