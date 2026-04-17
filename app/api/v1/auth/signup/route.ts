import { NextRequest, NextResponse } from 'next/server';
import { signJWT } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Datos requeridos: email, password, name' }, { status: 400 });
    }
    const token = signJWT({ email, id: '1', name });
    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: 'Error al crear cuenta' }, { status: 500 });
  }
}