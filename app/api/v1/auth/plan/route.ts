import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/jwt-secret';

// Endpoint interno: solo accesible desde el middleware via Authorization Bearer JWT_SECRET.
// Devuelve { plan, activo } real desde la BD para un userId dado.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${getJwtSecret()}`;
  if (auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { plan: true, activo: true, createdAt: true, planElegido: true, demoStartAt: true },
    });
    if (!usuario) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({
      plan:        usuario.plan,
      activo:      usuario.activo,
      createdAt:   usuario.createdAt,
      planElegido: usuario.planElegido,
      demoStartAt: usuario.demoStartAt,
    });
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
