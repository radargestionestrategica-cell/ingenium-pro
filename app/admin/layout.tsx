import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verificarToken } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

const OWNER_EMAIL = 'colombosilvanabelen@gmail.com';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('ip_auth')?.value;
  if (!token) redirect('/Login');

  const payload = verificarToken(token);
  if (!payload?.id) redirect('/Login');

  if (payload.email?.toLowerCase() !== OWNER_EMAIL) redirect('/Login');

  const usuario = await prisma.usuario.findUnique({
    where:  { id: payload.id },
    select: { email: true, activo: true },
  });

  if (!usuario || !usuario.activo) redirect('/Login');
  if (usuario.email?.toLowerCase() !== OWNER_EMAIL) redirect('/Login');

  return <>{children}</>;
}
