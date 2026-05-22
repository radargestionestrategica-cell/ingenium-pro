import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint interno: solo accesible desde el middleware via Authorization Bearer JWT_SECRET.
// Devuelve { plan, activo } real desde la BD para un userId dado.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${process.env.JWT_SECRET ?? 'ingenium_jwt_2026'}`;
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
      select: { plan: true, activo: true, createdAt: true },
    });
    if (!usuario) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ plan: usuario.plan, activo: usuario.activo, createdAt: usuario.createdAt });
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
