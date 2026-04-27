// app/verify/[hash]/page.tsx
// INGENIUM PRO v8.1 — Verificación pública de cálculos
// Server Component — sin login requerido

import { prisma } from '@/lib/prisma';
import { hashCalculation } from '@/lib/cripto';

interface Props {
  params: { hash: string };
}

export default async function VerifyPage({ params }: Props) {
  const { hash } = params;

  const BG    = '#020609';
  const PANEL = '#0a0f1e';
  const GOLD  = '#E8A020';
  const GREEN = '#22c55e';
  const RED   = '#ef4444';
  const GRAY  = '#64748b';

  let calculo: {
    id: string;
    tipo: string;
    moduloId: string | null;
    normativa: string | null;
    activoNombre: string | null;
    alerta: boolean;
    alertaMsg: string | null;
    usuario: string;
    parametros: unknown;
    resultado: unknown;
    createdAt: Date;
    user: { nombre: string; empresa: string; pais: string } | null;
  } | null = null;

  let valido = false;
  let error  = '';

  try {
    calculo = await prisma.calculo.findUnique({
      where: { hash },
      include: {
        user: {
          select: {
            nombre:  true,
            empresa: true,
            pais:    true,
          },
        },
      },
    });

    if (!calculo) {
      error = 'Hash no encontrado. Este documento no fue emitido por INGENIUM PRO o fue eliminado.';
    } else {
      // Verificación: recalcular hash de parametros+resultado y comparar
      const hashRecalculado = hashCalculation({
        tipo:       calculo.tipo,
        parametros: calculo.parametros,
        resultado:  calculo.resultado,
        createdAt:  calculo.createdAt.toISOString(),
      });
      valido = hashRecalculado === hash;
      if (!valido) {
        error = 'El hash no coincide con los datos almacenados. Este documento puede haber sido alterado.';
      }
    }
  } catch {
    error = 'Error al consultar la base de datos. Intentá más tarde.';
  }

  const fecha = calculo
    ? new Date(calculo.createdAt).toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      {/* HEADER */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ color: GOLD, fontWeight: 900, fontSize: 22, letterSpacing: 3 }}>
            INGENIUM PRO <span style={{ fontWeight: 300 }}>Ω</span>
          </div>
        </a>
        <div style={{ color: GRAY, fontSize: 12, marginTop: 4 }}>
          Sistema de Verificación Criptográfica SHA-256
        </div>
      </div>

      {/* CARD */}
      <div style={{ width: '100%', maxWidth: 600, background: PANEL, border: `1px solid ${valido ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 20, padding: 32, boxShadow: `0 0 40px ${valido ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'}` }}>

        {/* ESTADO */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>{valido ? '✅' : '❌'}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: valido ? GREEN : RED }}>
            {valido ? 'CÁLCULO VERIFICADO' : 'NO VERIFICADO'}
          </div>
          <div style={{ fontSize: 13, color: GRAY, marginTop: 6 }}>
            {valido
              ? 'Este cálculo es auténtico y no fue modificado desde su emisión.'
              : error}
          </div>
        </div>

        {/* DATOS — solo si es válido */}
        {calculo && valido && (
          <>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Fila label="Módulo"    valor={calculo.tipo}                       color={GREEN} />
              <Fila label="Normativa" valor={calculo.normativa || '—'}           />
              <Fila label="Activo"    valor={calculo.activoNombre || '—'}        />
              <Fila label="Ingeniero" valor={calculo.user?.nombre  || calculo.usuario} />
              <Fila label="Empresa"   valor={calculo.user?.empresa || '—'}       />
              <Fila label="País"      valor={calculo.user?.pais    || '—'}       />
              <Fila label="Fecha"     valor={fecha}                              />

              {calculo.alerta && calculo.alertaMsg && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: RED, fontWeight: 700 }}>⚠ ALERTA NORMATIVA</div>
                  <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 4 }}>{calculo.alertaMsg}</div>
                </div>
              )}

              {/* Hash */}
              <div>
                <div style={{ fontSize: 10, color: GRAY, fontWeight: 600, letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>
                  Hash SHA-256
                </div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: GOLD, background: '#070d1a', padding: '8px 12px', borderRadius: 8, wordBreak: 'break-all' }}>
                  {hash}
                </div>
              </div>

              {/* Sello */}
              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 700 }}>
                  ✓ Verificación SHA-256 válida — INGENIUM PRO v8.1
                </div>
                <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>
                  Registro inmutable · El hash coincide con los datos almacenados en base de datos
                </div>
              </div>
            </div>
          </>
        )}

        {/* AVISO LEGAL */}
        <div style={{ marginTop: 24, padding: '10px 14px', background: 'rgba(232,160,32,0.05)', border: '1px solid rgba(232,160,32,0.1)', borderRadius: 8 }}>
          <div style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>
            Este sistema certifica la integridad del documento al momento de su emisión.
            No valida la idoneidad técnica de los datos ingresados por el usuario.
            Ver{' '}
            <a href="/terminos" style={{ color: GOLD, textDecoration: 'none' }}>
              Protocolo de Exención de Responsabilidad
            </a>.
          </div>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#1e3a5f' }}>
            ingeniumpro.store · © 2026 RADAR Gestión Estratégica · Silvana Belén Colombo
          </div>
        </div>
      </div>
    </div>
  );
}

function Fila({ label, valor, color }: { label: string; valor: string; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', width: 90, flexShrink: 0, paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: color || '#f1f5f9' }}>
        {valor}
      </div>
    </div>
  );
} 