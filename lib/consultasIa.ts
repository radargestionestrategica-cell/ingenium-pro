import { prisma } from '@/lib/prisma';

const UN_MES_MS = 30 * 24 * 60 * 60 * 1000;

export const TOPES_POR_PLAN: Record<string, number> = {
  demo:   10,
  modulo: 70,
  duo:    130,
  pro:    550,
  team:   1500,
};

export async function puedeUsarIa(usuarioId: string): Promise<boolean> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { plan: true, consultasIaUsadas: true, consultasIaResetEn: true },
  });
  if (!usuario) return false;

  const tope = TOPES_POR_PLAN[usuario.plan] ?? TOPES_POR_PLAN.demo;

  const ahora = new Date();
  const pasoUnMes = !usuario.consultasIaResetEn
    || ahora.getTime() - usuario.consultasIaResetEn.getTime() >= UN_MES_MS;

  const usadas = pasoUnMes ? 0 : usuario.consultasIaUsadas;
  return usadas < tope;
}

export async function registrarConsultaIa(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { consultasIaUsadas: true, consultasIaResetEn: true },
  });

  const ahora = new Date();
  const pasoUnMes = !usuario?.consultasIaResetEn
    || ahora.getTime() - usuario.consultasIaResetEn.getTime() >= UN_MES_MS;

  if (pasoUnMes) {
    return prisma.usuario.update({
      where: { id: usuarioId },
      data: { consultasIaUsadas: 1, consultasIaResetEn: ahora },
    });
  }

  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { consultasIaUsadas: { increment: 1 } },
  });
}
