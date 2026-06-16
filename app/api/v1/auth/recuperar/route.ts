export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const limited = rateLimit(`recuperar:${ip}`, 5, 60_000);
  if (limited) return limited;

  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 3_600_000);

    await prisma.usuario.update({
      where: { email: usuario.email },
      data:  { resetToken: token, resetTokenExpira: expira },
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const link = `https://ingeniumpro.store/reset/${token}`;

    await resend.emails.send({
      from:    'INGENIUM PRO <noreply@ingeniumpro.store>',
      to:      usuario.email,
      subject: 'Restablecer tu contraseña — INGENIUM PRO',
      html:    `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:32px 40px;text-align:center;border-bottom:1px solid #334155;">
            <span style="font-size:28px;font-weight:900;letter-spacing:2px;color:#f59e0b;">INGENIUM PRO</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 16px;font-size:22px;color:#f1f5f9;font-weight:700;">Restablecer tu contraseña</h2>
            <p style="margin:0 0 16px;font-size:15px;color:#94a3b8;line-height:1.6;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en INGENIUM PRO.
              Si fuiste vos, hacé clic en el botón de abajo para continuar.
            </p>
            <p style="margin:0 0 32px;font-size:14px;color:#64748b;line-height:1.6;">
              ⚠️ Este enlace es de <strong style="color:#f59e0b;">un solo uso</strong> y vence en <strong style="color:#f59e0b;">1 hora</strong>.
            </p>

            <!-- Button -->
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center">
                  <a href="${link}"
                     style="display:inline-block;background:#f59e0b;color:#0f172a;font-size:16px;font-weight:700;
                            text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">
                    Restablecer contraseña
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:32px 0 0;font-size:13px;color:#475569;line-height:1.6;">
              Si no podés hacer clic en el botón, copiá y pegá este enlace en tu navegador:
            </p>
            <p style="margin:6px 0 0;font-size:12px;word-break:break-all;">
              <a href="${link}" style="color:#f59e0b;text-decoration:none;">${link}</a>
            </p>

            <hr style="border:none;border-top:1px solid #334155;margin:32px 0;">

            <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
              Si no solicitaste restablecer tu contraseña, ignorá este mensaje. Tu cuenta permanece segura.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #334155;">
            <p style="margin:0;font-size:12px;color:#475569;line-height:1.8;">
              <strong style="color:#64748b;">INGENIUM PRO · RADAR Gestión Estratégica</strong><br>
              <a href="mailto:radargestionestrategica@gmail.com"
                 style="color:#f59e0b;text-decoration:none;">radargestionestrategica@gmail.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Recuperar error:', err);
    return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: 500 });
  }
}
