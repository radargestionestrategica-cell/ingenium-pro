import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limit';

// Verifica la contraseña contra bcrypt (nuevo) o SHA-256 (legacy).
// Si el hash es legacy, lo migra a bcrypt automáticamente.
async function verificarPassword(
  password: string,
  stored: string,
  usuarioId: string,
): Promise<boolean> {
  // Hash bcrypt — formato $2b$ o $2a$
  if (stored.startsWith('$2')) {
    return bcrypt.compare(password, stored);
  }

  // Hash legacy SHA-256 — migrar en el acto
  const salt = process.env.JWT_SALT ?? 'ingenium_salt_2026';
  const legacy = crypto.createHash('sha256').update(password + salt).digest('hex');
  if (legacy !== stored) return false;

  // Migración silenciosa a bcrypt (costo 12)
  const nuevoHash = await bcrypt.hash(password, 12);
  await prisma.usuario.update({
    where:  { id: usuarioId },
    data:   { password: nuevoHash },
  }).catch(() => {/* no bloquear el login si la migración falla */});

  return true;
}

function generarToken(payload: object): string {
  const secret = process.env.JWT_SECRET ?? 'ingenium_jwt_2026';
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return `${data}.${sig}`;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const limited = rateLimit(`login:${ip}`, 10, 60_000);
  if (limited) return limited;

  try {
    const body = await req.json();

    const email    = typeof body.email    === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !(await verificarPassword(password, usuario.password, usuario.id))) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    if (!usuario.activo) {
      return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 });
    }

    const planFinal = usuario.plan ?? 'pro';
    const token = generarToken({
      id:         usuario.id,
      email:      usuario.email,
      plan:       planFinal,
      ...((planFinal === 'demo' || planFinal === 'trial') ? { demoExpira: usuario.createdAt.getTime() + 259_200_000 } : {}),
    });

    const response = NextResponse.json({
      success: true,
      token,
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
    console.error('[api/v1/auth/login] Error:', err);
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 });
  }
}
