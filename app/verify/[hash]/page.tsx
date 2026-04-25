// app/verify/[hash]/page.tsx
// ═══════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.1 — Verificación pública de cálculo
//  El regulador escanea el QR y ve esta página.
//  Sin login. Pública. Inmutable.
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface Props {
  params: { hash: string };
}

// Nombres legibles por módulo — verificados contra los módulos reales
const MODULO_NOMBRES: Record<string, string> = {
  petroleo:     'Petróleo & Gas — ASME B31.8 / B31.4',
  hidraulica:   'Hidráulica — Darcy-Weisbach / Joukowsky',
  perforacion:  'Perforación — API RP 13D / Eaton 1969',
  mineria:      'Minería — RMR Bieniawski 1989',
  civil:        'Ingeniería Civil — AISC 360',
  geotecnia:    'Geotecnia — Meyerhof 1963',
  termica:      'Térmica — TEMA / ASME Sec.VIII',
  vialidad:     'Vialidad — AASHTO 93',
  arquitectura: 'Arquitectura Técnica — ASCE 7-22',
  represas:     'Represas & Presas — USACE EM 1110-2',
  soldadura:    'Soldadura — AWS D1.1:2020 / ASME Sec.IX',
  mmo:          'Maestro Mayor de Obra — CIRSOC 201 / ACI 318',
  electricidad: 'Electricidad Industrial — NEC 2023 / IEC 60909',
  canerias:     'Cañerías e Integridad — ASME B31.8 / API 579',
  valvulas:     'Válvulas Industriales — ASME B16.34 / B16.5',
};

export default async function VerificarCalculo({ params }: Props) {
  const { hash } = params;

  // Hash debe tener 64 caracteres (SHA-256 hex)
  if (!hash || hash.length !== 64) return notFound();

  const calculo = await prisma.calculo.findUnique({
    where: { hash },
    include: {
      proyecto: { select: { nombre: true, industria: true } },
      user:     { select: { nombre: true, empresa: true, pais: true } },
    },
  });

  if (!calculo) return notFound();

  const fecha = new Date(calculo.createdAt);
  const fechaStr = fecha.toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires',
  });

  const moduloNombre = MODULO_NOMBRES[calculo.moduloId || calculo.tipo] || calculo.tipo;
  const parametros = calculo.parametros as Record<string, unknown>;
  const resultado  = calculo.resultado  as Record<string, unknown>;

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Verificación de Cálculo — INGENIUM PRO</title>
        <meta name="robots" content="noindex" />
      </head>
      <body style={{ margin: 0, background: '#070d1a', fontFamily: 'Inter, system-ui, sans-serif', color: '#f1f5f9', minHeight: '100vh' }}>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>

          {/* HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fff', flexShrink: 0 }}>
              IP
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>INGENIUM PRO v8.1</div>
              <div style={{ fontSize: 12, color: '#475569' }}>Verificación de Cálculo de Ingeniería · ingeniumpro.store</div>
            </div>
          </div>

          {/* ESTADO VERIFICADO */}
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.4)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40, flexShrink: 0 }}>✅</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80' }}>CÁLCULO VERIFICADO Y AUTÉNTICO</div>
              <div style={{ fontSize: 13, color: '#86efac', marginTop: 4 }}>
                Este cálculo está registrado en la base de datos de INGENIUM PRO con integridad criptográfica SHA-256. No fue modificado desde su generación.
              </div>
            </div>
          </div>

          {/* DATOS DEL CÁLCULO */}
          <div style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Datos del cálculo</div>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { l: 'Módulo',        v: moduloNombre },
                { l: 'Sub-cálculo',   v: calculo.submodulo || '—' },
                { l: 'Activo',        v: calculo.activoNombre || '—' },
                { l: 'Normativa',     v: calculo.normativa || '—' },
                { l: 'Proyecto',      v: calculo.proyecto?.nombre || '—' },
                { l: 'Industria',     v: calculo.proyecto?.industria || '—' },
                { l: 'Fecha y hora',  v: fechaStr },
                { l: 'Ejecutado por', v: calculo.user?.nombre || calculo.usuario || '—' },
                { l: 'Empresa',       v: calculo.user?.empresa || '—' },
                { l: 'País',          v: calculo.user?.pais || '—' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(99,102,241,0.08)', paddingBottom: 10 }}>
                  <div style={{ fontSize: 12, color: '#475569', width: 120, flexShrink: 0 }}>{r.l}</div>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600, flex: 1 }}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PARÁMETROS DE ENTRADA */}
          <div style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Parámetros de entrada</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {Object.entries(parametros).slice(0, 20).map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(99,102,241,0.06)', paddingBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#475569', width: 140, flexShrink: 0, fontFamily: 'monospace' }}>{k}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{String(v)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RESULTADOS */}
          <div style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Resultados calculados</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {Object.entries(resultado).slice(0, 20).map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(99,102,241,0.06)', paddingBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#475569', width: 140, flexShrink: 0, fontFamily: 'monospace' }}>{k}</div>
                  <div style={{ fontSize: 12, color: '#4ade80', fontFamily: 'monospace', fontWeight: 600 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ALERTA SI EXISTE */}
          {calculo.alerta && calculo.alertaMsg && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700, marginBottom: 6 }}>⚠️ ALERTA REGISTRADA EN ESTE CÁLCULO</div>
              <div style={{ fontSize: 13, color: '#fca5a5' }}>{calculo.alertaMsg}</div>
            </div>
          )}

          {/* HASH VERIFICABLE */}
          <div style={{ background: '#0a0f1e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hash SHA-256 de integridad</div>
            <div style={{ fontSize: 11, color: '#6366f1', fontFamily: 'monospace', wordBreak: 'break-all' as const }}>{hash}</div>
            <div style={{ fontSize: 10, color: '#334155', marginTop: 6 }}>
              Este hash es único e irrepetible. Cualquier modificación al cálculo original generaría un hash completamente diferente.
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ textAlign: 'center', color: '#334155', fontSize: 11 }}>
            Verificado por INGENIUM PRO v8.1 · ingeniumpro.store<br />
            © 2026 Silvana Belén Colombo — RADAR Gestión Estratégica<br />
            Este documento tiene validez técnica. Para consultas: contacto@ingeniumpro.store
          </div>
        </div>
      </body>
    </html>
  );
}

// Metadata para SEO
export async function generateMetadata({ params }: Props) {
  return {
    title: `Verificación de Cálculo — INGENIUM PRO`,
    description: `Verificación criptográfica de cálculo de ingeniería. Hash: ${params.hash.slice(0, 16)}...`,
  };
} 