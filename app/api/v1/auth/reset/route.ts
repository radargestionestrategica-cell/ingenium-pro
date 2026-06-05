export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 },
      );
    }

    const { prisma } = await import('@/lib/prisma');

    const usuario = await prisma.usuario.findUnique({
      where: { resetToken: token },
    });

    if (!usuario || !usuario.resetTokenExpira || usuario.resetTokenExpira < new Date()) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data:  {
        password:        passwordHash,
        resetToken:      null,
        resetTokenExpira: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset error:', err);
    return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: 500 });
  }
}
