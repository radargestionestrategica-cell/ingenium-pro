import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'ingenium_salt_2026').digest('hex');
}

export async function POST(req: Request) {
  try {
    const { email, password, nombre, empresa, pais } = await req.json();
    if (!email || !password || !nombre || !empresa) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: 'El email ya esta registrado' }, { status: 409 });
    }
    const usuario = await prisma.usuario.create({
      data: { email, password: hashPassword(password), nombre, empresa, pais: pais || 'Argentina' }
    });
    return NextResponse.json({ success: true, id: usuario.id, nombre: usuario.nombre });
  } catch (err) {
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}