import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LoginSchema } from '@/lib/validators';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { ultimo_login: new Date() },
    });

    const token = signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          rol: user.rol,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en servidor' },
      { status: 500 }
    );
  }
}