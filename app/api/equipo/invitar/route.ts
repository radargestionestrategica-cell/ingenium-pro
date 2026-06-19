export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

const LIMITE_MIEMBROS = 3;

function htmlInvitacion(tituloOwner: string, link: string, ctaTexto: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#0f172a;padding:32px 40px;text-align:center;border-bottom:1px solid #334155;">
            <span style="font-size:28px;font-weight:900;letter-spacing:2px;color:#f59e0b;">INGENIUM PRO</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 16px;font-size:22px;color:#f1f5f9;font-weight:700;">Te invitaron a un equipo</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.6;">
              ${tituloOwner} te invitó a formar parte de su equipo en INGENIUM PRO.
            </p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr><td align="center">
                <a href="${link}" style="display:inline-block;background:#f59e0b;color:#0f172a;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">
                  ${ctaTexto}
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #334155;">
            <p style="margin:0;font-size:12px;color:#475569;line-height:1.8;">
              <strong style="color:#64748b;">INGENIUM PRO · RADAR Gestión Estratégica</strong>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: false, error: 'Email requerido' }, { status: 400 });
    }
    const emailInvitado = email.toLowerCase().trim();

    const owner = await prisma.usuario.findUnique({
      where:  { id: payload.id },
      select: { id: true, nombre: true, email: true, plan: true },
    });
    if (!owner) return respuestaNoAutorizado();

    if (owner.plan !== 'team') {
      return NextResponse.json({ ok: false, error: 'Esta función requiere plan Team' }, { status: 403 });
    }

    if (emailInvitado === owner.email.toLowerCase()) {
      return NextResponse.json({ ok: false, error: 'No podés invitarte a ti mismo' }, { status: 400 });
    }

    // 1. Crear el equipo automáticamente si el dueño todavía no tiene uno
    let equipo = await prisma.equipo.findFirst({ where: { ownerId: owner.id } });
    if (!equipo) {
      equipo = await prisma.equipo.create({
        data: { nombre: `Equipo de ${owner.nombre || owner.email}`, ownerId: owner.id },
      });
    }

    // 2. Validar límite de 3 (miembros ya unidos + invitaciones pendientes)
    const [totalMiembros, totalPendientes] = await Promise.all([
      prisma.usuario.count({ where: { equipoId: equipo.id, id: { not: owner.id } } }),
      prisma.invitacionEquipo.count({ where: { equipoId: equipo.id, estado: 'pendiente' } }),
    ]);
    if (totalMiembros + totalPendientes >= LIMITE_MIEMBROS) {
      return NextResponse.json({ ok: false, error: `El equipo ya alcanzó el máximo de ${LIMITE_MIEMBROS} miembros` }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const tituloOwner = owner.nombre || owner.email;

    const invitado = await prisma.usuario.findUnique({ where: { email: emailInvitado } });

    // 3a. Email SIN cuenta → invitación pendiente con token, link a /register
    if (!invitado) {
      const yaPendiente = await prisma.invitacionEquipo.findFirst({
        where: { email: emailInvitado, equipoId: equipo.id, estado: 'pendiente' },
      });
      if (yaPendiente) {
        return NextResponse.json({ ok: false, error: 'Ya hay una invitación pendiente para ese email' }, { status: 400 });
      }

      const token = crypto.randomBytes(32).toString('hex');
      await prisma.invitacionEquipo.create({
        data: { email: emailInvitado, equipoId: equipo.id, token },
      });

      const link = `https://ingeniumpro.store/register?invitacion=${token}`;

      await resend.emails.send({
        from:    'INGENIUM PRO <noreply@ingeniumpro.store>',
        to:      emailInvitado,
        subject: 'Te invitaron a un equipo — INGENIUM PRO',
        html:    htmlInvitacion(tituloOwner, link, 'Crear mi cuenta'),
      });

      return NextResponse.json({ ok: true, mensaje: 'Invitación enviada — el usuario debe crear su cuenta' });
    }

    // 3b. Email CON cuenta → se agrega directo al equipo
    if (invitado.equipoId === equipo.id) {
      return NextResponse.json({ ok: false, error: 'Ese usuario ya es miembro de este equipo' }, { status: 400 });
    }
    if (invitado.equipoId) {
      return NextResponse.json({ ok: false, error: 'Ese usuario ya pertenece a otro equipo' }, { status: 400 });
    }

    await prisma.usuario.update({
      where: { id: invitado.id },
      data:  { equipoId: equipo.id },
    });

    await resend.emails.send({
      from:    'INGENIUM PRO <noreply@ingeniumpro.store>',
      to:      invitado.email,
      subject: 'Te invitaron a un equipo — INGENIUM PRO',
      html:    htmlInvitacion(tituloOwner, 'https://ingeniumpro.store/equipo', 'Ver mi equipo'),
    });

    return NextResponse.json({ ok: true, mensaje: 'Invitación enviada' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error interno' }, { status: 500 });
  }
}
