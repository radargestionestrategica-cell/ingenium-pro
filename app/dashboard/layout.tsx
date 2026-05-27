import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verificarToken } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

const DEMO_MS     = 3 * 24 * 60 * 60 * 1000; // 3 días en ms
const OWNER_EMAIL = 'colombosilvanabelen@gmail.com';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('ip_auth')?.value;
  if (!token) redirect('/Login');

  const payload = verificarToken(token);
  if (!payload?.id) redirect('/Login');

  // REGLA 1: owner — acceso irrestricto, sin consulta BD
  if (payload.email?.toLowerCase() === OWNER_EMAIL) {
    return <>{children}</>;
  }

  // Consulta BD — datos reales del usuario
  const usuario = await prisma.usuario.findUnique({
    where:  { id: payload.id },
    select: { plan: true, planElegido: true, demoStartAt: true, createdAt: true, activo: true },
  });

  if (!usuario || !usuario.activo) redirect('/Login');

  // REGLA 6: sin plan elegido → /planes
  if (!usuario.planElegido) redirect('/planes');

  // REGLA 4: demo expirada → /pagar
  if (usuario.plan === 'demo') {
    const base = (usuario.demoStartAt ?? usuario.createdAt).getTime();
    if (Date.now() - base >= DEMO_MS) redirect('/pagar');
  }

  // REGLAS 3 y 5: demo activa o plan pago → acceso al dashboard
  return <>{children}</>;
}
