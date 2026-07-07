export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token: rawToken } = await req.json();
    const token = typeof rawToken === 'string' ? rawToken.trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    const usuario = await prisma.usuario.findFirst({
      where: { tokenVerificacion: token },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Token no encontrado' }, { status: 400 });
    }

    if (!usuario.tokenVerificacionExpira || usuario.tokenVerificacionExpira < new Date()) {
      return NextResponse.json({ error: 'El enlace de verificación venció' }, { status: 400 });
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data:  {
        emailVerificado:         true,
        tokenVerificacion:       null,
        tokenVerificacionExpira: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Verificar email error:', err);
    return NextResponse.json({ error: 'Error interno al procesar la verificación' }, { status: 500 });
  }
}
