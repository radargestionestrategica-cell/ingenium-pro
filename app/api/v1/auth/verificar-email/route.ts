export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    const usuario = await prisma.usuario.findFirst({
      where: { tokenVerificacion: token },
    });

    if (!usuario || !usuario.tokenVerificacionExpira || usuario.tokenVerificacionExpira < new Date()) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
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
    return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: 500 });
  }
}
