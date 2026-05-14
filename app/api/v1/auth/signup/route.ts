import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const limited = rateLimit(`signup:${ip}`, 5, 60_000);
  if (limited) return limited;

  try {
    const { email, password, nombre, empresa, pais, matricula, dni } = await req.json();

    if (!email || !password || !nombre || !empresa) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    // bcrypt costo 12 — ~250ms en servidor moderno, resistente a GPU
    const passwordHash = await bcrypt.hash(password, 12);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: passwordHash,
        nombre,
        empresa,
        pais:      pais       || 'Argentina',
        matricula: matricula  || '',
        dni:       dni        || '',
        plan:      'demo',
      },
    });

    return NextResponse.json({ success: true, id: usuario.id, nombre: usuario.nombre });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}
