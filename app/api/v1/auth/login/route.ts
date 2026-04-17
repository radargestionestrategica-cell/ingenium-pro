import { NextRequest, NextResponse } from 'next/server';
import { signJWT } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 });
    }
    const token = signJWT({ email, id: '1' });
    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 });
  }
}