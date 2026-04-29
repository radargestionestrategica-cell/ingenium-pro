// app/verify/[hash]/page.tsx
// INGENIUM PRO v8.1 — Verificación pública por hash
// Server Component — no requiere login
// Alcance actual real: verifica existencia del hash en base de datos y muestra el cálculo asociado.
// No promete HMAC completo porque el modelo actual no tiene campo firma.

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    hash: string;
  };
}

type CalculoVerificacion = Prisma.CalculoGetPayload<{
  include: {
    user: {
      select: {
        nombre: true;
        empresa: true;
        pais: true;
      };
    };
  };
}>;

function decodificarHash(hash: string): string {
  try {
    return decodeURIComponent(hash || '').trim();
  } catch {
    return '';
  }
}

function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(fecha);
}

function esObjetoPlano(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function formatearValor(valor: unknown): string {
  if (valor === null || valor === undefined) return '—';

  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number') return Number.isFinite(valor) ? String(valor) : '—';
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';

  try {
    return JSON.stringify(valor, null, 2);
  } catch {
    return String(valor);
  }
}

function TablaDatos({
  titulo,
  datos,
}: {
  titulo: string;
  datos: unknown;
}) {
  const registros: Array<[string, unknown]> = esObjetoPlano(datos)
    ? Object.entries(datos)
    : [['valor', datos]];

  return (
    <section className="card">
      <h2>{titulo}</h2>

      {registros.length === 0 ? (
        <p className="muted">Sin datos registrados.</p>
      ) : (
        <div className="table">
          {registros.map(([clave, valor]) => (
            <div className="row" key={clave}>
              <div className="key">{clave}</div>
              <div className="value">
                <pre>{formatearValor(valor)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function VerifyPage({ params }: PageProps) {
  const hashLimpio = decodificarHash(params.hash);

  let calculo: CalculoVerificacion | null = null;
  let errorConsulta = false;

  try {
    if (hashLimpio) {
      calculo = await prisma.calculo.findUnique({
        where: { hash: hashLimpio },
        include: {
          user: {
            select: {
              nombre: true,
              empresa: true,
              pais: true,
            },
          },
        },
      });
    }
  } catch (error) {
    console.error('[verify/hash] Error al consultar cálculo:', error);
    errorConsulta = true;
  }

  return (
    <main className="page">
      <style>{`
        :root {
          --bg: #020609;
          --panel: #08111d;
          --gold: #E8A020;
          --green: #22c55e;
          --red: #ef4444;
          --white: #f8fafc;
          --light: #cbd5e1;
          --muted: #94a3b8;
          --dim: #64748b;
          --line: rgba(255,255,255,.09);
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: var(--bg);
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 50% 0%, rgba(232,160,32,.12), transparent 34%),
            linear-gradient(180deg, #020609, #040c12);
          color: var(--white);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 42px 20px;
        }

        .wrap {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 34px;
        }

        .mark {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--gold), #c47a10);
          color: #020609;
          display: grid;
          place-items: center;
          font-weight: 950;
          font-size: 20px;
        }

        .brand-title {
          font-size: 16px;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .brand-sub {
          margin-top: 4px;
          color: var(--gold);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .hero {
          border: 1px solid rgba(232,160,32,.18);
          background: linear-gradient(180deg, rgba(11,20,35,.96), rgba(5,12,20,.98));
          border-radius: 26px;
          padding: 32px;
          box-shadow: 0 24px 90px rgba(0,0,0,.35);
          margin-bottom: 18px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 18px;
          letter-spacing: .4px;
        }

        .status.ok {
          color: var(--green);
          border: 1px solid rgba(34,197,94,.25);
          background: rgba(34,197,94,.08);
        }

        .status.err {
          color: var(--red);
          border: 1px solid rgba(239,68,68,.25);
          background: rgba(239,68,68,.08);
        }

        h1 {
          margin: 0 0 12px;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.05;
          letter-spacing: -1px;
        }

        h2 {
          margin: 0 0 16px;
          color: var(--gold);
          font-size: 17px;
          font-weight: 950;
          letter-spacing: .3px;
        }

        p {
          margin: 0;
        }

        .muted {
          color: var(--muted);
          line-height: 1.7;
          font-size: 14px;
        }

        .hashbox {
          margin-top: 20px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid var(--line);
          background: rgba(2,6,9,.5);
          color: var(--light);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .card {
          border: 1px solid var(--line);
          background: rgba(8,17,29,.88);
          border-radius: 22px;
          padding: 24px;
          margin-bottom: 18px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 18px;
        }

        .item {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .item:last-child {
          border-bottom: 0;
        }

        .label {
          color: var(--dim);
          font-size: 12px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: .5px;
        }

        .text {
          color: var(--light);
          font-size: 14px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .table {
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          overflow: hidden;
        }

        .row {
          display: grid;
          grid-template-columns: 190px 1fr;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .row:last-child {
          border-bottom: 0;
        }

        .key {
          padding: 12px;
          color: var(--dim);
          background: rgba(255,255,255,.025);
          font-size: 12px;
          font-weight: 850;
          overflow-wrap: anywhere;
        }

        .value {
          padding: 12px;
          color: var(--light);
          font-size: 13px;
          overflow-x: auto;
        }

        pre {
          margin: 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .alert {
          margin-top: 18px;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(239,68,68,.28);
          background: rgba(239,68,68,.08);
          color: #fecaca;
          line-height: 1.6;
          font-size: 14px;
        }

        .notice {
          margin-top: 18px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(232,160,32,.16);
          background: rgba(232,160,32,.055);
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .footer {
          margin-top: 22px;
          color: var(--dim);
          font-size: 12px;
          line-height: 1.7;
          text-align: center;
        }

        .footer a {
          color: var(--gold);
          text-decoration: none;
          font-weight: 800;
        }

        @media(max-width: 720px) {
          .hero,
          .card {
            padding: 22px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .item {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="wrap">
        <header className="brand">
          <div className="mark">Ω</div>
          <div>
            <div className="brand-title">INGENIUM PRO</div>
            <div className="brand-sub">Verificación técnica documental</div>
          </div>
        </header>

        <section className="hero">
          {errorConsulta ? (
            <>
              <div className="status err">Error de consulta</div>
              <h1>No se pudo verificar el cálculo</h1>
              <p className="muted">
                La página existe, pero hubo un problema al consultar la base de datos.
                Revisá la conexión de producción y las variables asociadas a PostgreSQL.
              </p>
              <div className="hashbox">{hashLimpio || 'Hash vacío'}</div>
            </>
          ) : calculo ? (
            <>
              <div className="status ok">✓ Registro encontrado</div>
              <h1>Cálculo registrado en INGENIUM Pro</h1>
              <p className="muted">
                Este hash existe en la base de datos de INGENIUM Pro y está asociado a un cálculo guardado.
                La información mostrada corresponde al registro disponible para verificación documental.
              </p>

              <div className="hashbox">{calculo.hash || hashLimpio}</div>

              {calculo.alerta && (
                <div className="alert">
                  <strong>Alerta técnica detectada:</strong>
                  <br />
                  {calculo.alertaMsg || 'El cálculo fue marcado con alerta.'}
                </div>
              )}

              <div className="notice">
                Alcance actual de verificación: existencia del hash y datos asociados en base de datos.
                La validación HMAC completa requiere incorporar campo de firma en el modelo de datos.
              </div>
            </>
          ) : (
            <>
              <div className="status err">Registro no encontrado</div>
              <h1>Hash no verificado</h1>
              <p className="muted">
                No se encontró un cálculo asociado a este hash. Puede tratarse de un enlace incompleto,
                un QR inválido o un registro que todavía no está disponible en la base de datos.
              </p>

              <div className="hashbox">{hashLimpio || 'Hash vacío'}</div>
            </>
          )}
        </section>

        {calculo && (
          <>
            <section className="card">
              <h2>Datos principales</h2>

              <div className="item">
                <div className="label">ID</div>
                <div className="text">{calculo.id}</div>
              </div>

              <div className="item">
                <div className="label">Tipo</div>
                <div className="text">{calculo.tipo || '—'}</div>
              </div>

              <div className="item">
                <div className="label">Módulo</div>
                <div className="text">{calculo.moduloId || '—'}</div>
              </div>

              <div className="item">
                <div className="label">Submódulo</div>
                <div className="text">{calculo.submodulo || '—'}</div>
              </div>

              <div className="item">
                <div className="label">Activo</div>
                <div className="text">{calculo.activoNombre || '—'}</div>
              </div>

              <div className="item">
                <div className="label">Normativa</div>
                <div className="text">{calculo.normativa || '—'}</div>
              </div>

              <div className="item">
                <div className="label">Usuario</div>
                <div className="text">{calculo.user?.nombre || calculo.usuario || '—'}</div>
              </div>

              <div className="item">
                <div className="label">Empresa</div>
                <div className="text">{calculo.user?.empresa || '—'}</div>
              </div>

              <div className="item">
                <div className="label">País</div>
                <div className="text">{calculo.user?.pais || '—'}</div>
              </div>

              <div className="item">
                <div className="label">Fecha</div>
                <div className="text">{formatearFecha(calculo.createdAt)}</div>
              </div>
            </section>

            <div className="grid">
              <TablaDatos titulo="Parámetros de entrada" datos={calculo.parametros} />
              <TablaDatos titulo="Resultado calculado" datos={calculo.resultado} />
            </div>
          </>
        )}

        <footer className="footer">
          INGENIUM Pro · RADAR Gestión Estratégica · Verificación pública por hash.
          <br />
          Esta verificación no reemplaza la revisión de un profesional competente.{' '}
          <a href="/terminos">Ver términos</a>
        </footer>
      </div>
    </main>
  );
}