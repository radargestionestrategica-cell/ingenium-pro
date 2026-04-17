import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SignupSchema } from '@/lib/validators';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = SignupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password, name, company, country, license } = validation.data;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        name,
        company,
        country,
        license,
        rol: 'user',
      },
    });

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    await db.suscripcion.create({
      data: {
        usuario_id: user.id,
        plan: 'trial',
        precio_mensual: 0,
        calculos_limite: 10,
        usuarios_limite: 1,
        estado: 'activo',
        fecha_renovacion: trialEndDate,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Error en servidor' },
      { status: 500 }
    );
  }
}