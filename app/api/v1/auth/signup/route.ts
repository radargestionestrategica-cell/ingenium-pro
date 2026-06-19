export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limit';
import { getJwtSecret } from '@/lib/jwt-secret';

function generarToken(payload: object): string {
  const secret = getJwtSecret();
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return `${data}.${sig}`;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const limited = rateLimit(`signup:${ip}`, 5, 60_000);
  if (limited) return limited;

  try {
    const { email, password, nombre, empresa, pais, matricula, dni, invitacion } = await req.json();

    if (!email || !password || !nombre || !empresa) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let invitacionPendiente: { id: string; equipoId: string } | null = null;
    if (invitacion && typeof invitacion === 'string') {
      const inv = await prisma.invitacionEquipo.findUnique({ where: { token: invitacion } });
      if (inv && inv.estado === 'pendiente') {
        invitacionPendiente = { id: inv.id, equipoId: inv.equipoId };
      }
    }

    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: passwordHash,
        nombre,
        empresa,
        pais:        pais      || 'Argentina',
        matricula:   matricula || '',
        dni:         dni       || '',
        plan:        invitacionPendiente ? 'team' : 'demo',
        demoStartAt: new Date(),
        planElegido: invitacionPendiente ? true : false,
        ...(invitacionPendiente ? { equipoId: invitacionPendiente.equipoId } : {}),
      },
    });

    if (invitacionPendiente) {
      await prisma.invitacionEquipo.update({
        where: { id: invitacionPendiente.id },
        data:  { estado: 'aceptada' },
      });
    }

    const token = generarToken({
      id:          usuario.id,
      email:       usuario.email,
      plan:        usuario.plan,
      planElegido: usuario.planElegido,
      ...(invitacionPendiente ? {} : { demoExpira: usuario.createdAt.getTime() + 259_200_000 }),
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
      secure:   true,
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    });

    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}
