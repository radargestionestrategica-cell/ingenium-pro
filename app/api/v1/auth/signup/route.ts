import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limit';

function generarToken(payload: object): string {
  const secret = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return `${data}.${sig}`;
}

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
        pais:      pais      || 'Argentina',
        matricula: matricula || '',
        dni:       dni       || '',
        plan:      'demo',
      },
    });

    const token = generarToken({
      id:         usuario.id,
      email:      usuario.email,
      plan:       'demo',
      demoExpira: usuario.createdAt.getTime() + 259_200_000,
    });

    const response = NextResponse.json({
      success:  true,
      token,
      redirect: '/dashboard',
      usuario: {
        id:        usuario.id,
        email:     usuario.email,
        nombre:    usuario.nombre,
        empresa:   usuario.empresa,
        pais:      usuario.pais,
        matricula: usuario.matricula ?? '',
        dni:       usuario.dni ?? '',
        plan:      usuario.plan,
        activo:    usuario.activo,
        createdAt: usuario.createdAt,
      },
    });

    response.cookies.set('ip_auth', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   259_200,
      path:     '/',
    });

    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}
