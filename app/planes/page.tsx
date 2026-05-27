'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BG     = '#020609';
const GOLD   = '#E8A020';
const GREEN  = '#22c55e';
const PANEL  = '#0a0f1e';
const INDIGO = '#6366f1';
const BORD   = 'rgba(99,102,241,0.15)';

const PLANES = [
  {
    id:          'Demo',
    nombre:      'Demo',
    icon:        'Ω',
    precio:      'Gratis',
    periodo:     '3 días',
    badge:       'SIN TARJETA',
    badgeColor:  GREEN,
    destacado:   false,
    descripcion: 'Acceso completo a todos los módulos durante 3 días. Ideal para evaluar la plataforma sin compromiso.',
    features: [
      '15 módulos de ingeniería',
      'PDF verificable con QR',
      'Excel con fórmulas reales',
      'DXF para AutoCAD / FreeCAD',
      'Análisis de IA anti-alucinación',
      'Sin tarjeta de crédito',
    ],
    cta: 'Probar gratis',
  },
  {
    id:          'Pro',
    nombre:      'Pro',
    icon:        '⚡',
    precio:      'USD 79',
    periodo:     '/mes',
    badge:       'MÁS POPULAR',
    badgeColor:  GOLD,
    destacado:   true,
    descripcion: 'Todos los módulos para el ingeniero independiente que necesita informes profesionales verificables.',
    features: [
      '1 usuario',
      '15 módulos de ingeniería',
      'PDF + QR verificable + Excel + DXF',
      'IA análisis normativo ilimitado',
      'Historial ilimitado de cálculos',
      'Verificación digital SHA-256',
      'Soporte prioritario por email',
    ],
    cta: 'Activar Pro',
  },
  {
    id:          'Team',
    nombre:      'Team',
    icon:        '👥',
    precio:      'USD 199',
    periodo:     '/mes',
    badge:       'HASTA 3 USUARIOS',
    badgeColor:  INDIGO,
    destacado:   false,
    descripcion: 'Para equipos de ingeniería que trabajan en proyectos compartidos con trazabilidad centralizada.',
    features: [
      'Hasta 3 usuarios',
      'Todo lo del plan Pro',
      'Historial compartido de proyectos',
      'Panel de administración de equipo',
      'Exportación masiva de informes',
      'Factura electrónica',
    ],
    cta: 'Activar Team',
  },
  {
    id:          'Enterprise',
    nombre:      'Enterprise',
    icon:        '🏢',
    precio:      'A consultar',
    periodo:     '',
    badge:       'ILIMITADO',
    badgeColor:  '#94a3b8',
    destacado:   false,
    descripcion: 'Para empresas e instituciones con múltiples equipos, módulos personalizados e integración propia.',
    features: [
      'Usuarios ilimitados',
      'Módulos de cálculo personalizados',
      'Integración API REST propia',
      'SLA de uptime garantizado',
      'Capacitación in-company',
      'Soporte técnico 24/7',
    ],
    cta: 'Solicitar cotización',
  },
];

export default function PlanesPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const elegirPlan = async (planId: string) => {
    if (planId === 'Enterprise') {
      window.location.href = 'mailto:contacto@ingeniumpro.store?subject=Solicitud%20Enterprise%20INGENIUM%20PRO';
      return;
    }

    setLoadingPlan(planId);
    setError(null);

    try {
      const res = await fetch('/api/planes/elegir', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planId }),
      });

      if (res.ok) {
        router.push('/dashboard');
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push('/Login');
        return;
      }
      setError((data as { error?: string }).error ?? 'Error al elegir plan. Intentá de nuevo.');
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{
        height: 56, background: PANEL,
        borderBottom: `1px solid ${BORD}`,
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      }}>
        <span style={{ color: GOLD, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>INGENIUM PRO</span>
        <span style={{ color: GOLD, fontSize: 22, fontWeight: 300 }}>Ω</span>
        <div style={{ flex: 1 }} />
        <a
          href="/Login"
          style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}
        >
          ← Iniciar sesión
        </a>
      </header>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* TÍTULO */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: INDIGO, marginBottom: 12, textTransform: 'uppercase' }}>
            Plataforma de Ingeniería Técnica Verificable
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f1f5f9', margin: '0 0 16px', lineHeight: 1.1 }}>
            Elegí tu plan
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
            Cálculos verificables, informes profesionales con QR y análisis de IA.
            Empezá gratis 3 días, sin tarjeta de crédito.
          </p>
        </div>

        {/* ERROR GLOBAL */}
        {error && (
          <div style={{
            marginBottom: 32, padding: '14px 20px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, textAlign: 'center',
            fontSize: 13, color: '#f87171',
          }}>
            {error}
          </div>
        )}

        {/* GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}>
          {PLANES.map(plan => {
            const isLoading = loadingPlan === plan.id;
            const anyLoading = loadingPlan !== null;

            return (
              <div
                key={plan.id}
                style={{
                  background: plan.destacado
                    ? 'linear-gradient(160deg,rgba(232,160,32,0.07),rgba(232,160,32,0.02))'
                    : PANEL,
                  border: plan.destacado
                    ? '1.5px solid rgba(232,160,32,0.45)'
                    : `1px solid ${BORD}`,
                  borderRadius: 20,
                  padding: '36px 24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {/* BADGE */}
                <div style={{
                  position: 'absolute', top: -13, left: 24,
                  background: plan.badgeColor, color: BG,
                  fontSize: 9, fontWeight: 900,
                  padding: '3px 12px', borderRadius: 20, letterSpacing: 1.5,
                }}>
                  {plan.badge}
                </div>

                {/* ÍCONO + NOMBRE */}
                <div style={{ fontSize: 26, marginBottom: 8 }}>{plan.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', marginBottom: 4 }}>
                  {plan.nombre}
                </div>

                {/* PRECIO */}
                <div style={{ marginBottom: 14, marginTop: 4 }}>
                  <span style={{
                    fontSize: 34, fontWeight: 900,
                    color: plan.destacado ? GOLD : plan.id === 'Demo' ? GREEN : '#f1f5f9',
                  }}>
                    {plan.precio}
                  </span>
                  {plan.periodo && (
                    <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>
                      {plan.periodo}
                    </span>
                  )}
                </div>

                {/* DESCRIPCIÓN */}
                <p style={{
                  fontSize: 12, color: '#64748b', lineHeight: 1.6,
                  margin: '0 0 20px', minHeight: 48,
                }}>
                  {plan.descripcion}
                </p>

                {/* DIVIDER */}
                <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', marginBottom: 20 }} />

                {/* FEATURES */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#94a3b8' }}>
                      <span style={{ color: GREEN, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => elegirPlan(plan.id)}
                  disabled={anyLoading}
                  style={{
                    marginTop: 'auto',
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    padding: '13px 20px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: anyLoading ? 'not-allowed' : 'pointer',
                    transition: 'opacity .2s',
                    opacity: anyLoading && !isLoading ? 0.4 : 1,
                    border: 'none',
                    background: plan.destacado
                      ? `linear-gradient(135deg,${GOLD},#c47a10)`
                      : plan.id === 'Demo'
                        ? `linear-gradient(135deg,${GREEN},#16a34a)`
                        : plan.id === 'Enterprise'
                          ? 'rgba(99,102,241,0.1)'
                          : 'rgba(232,160,32,0.1)',
                    color: plan.destacado || plan.id === 'Demo'
                      ? BG
                      : plan.id === 'Enterprise'
                        ? '#a5b4fc'
                        : GOLD,
                    boxSizing: 'border-box',
                    ...(plan.id === 'Enterprise' ? { border: '1px solid rgba(99,102,241,0.25)' } : {}),
                  }}
                >
                  {isLoading ? '...' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 40, textAlign: 'center', fontSize: 12, color: '#1e3a5f', lineHeight: 1.8 }}>
          Precios en USD procesados por Payoneer. Activación manual en horario de atención.{' '}
          <a href="/terminos" style={{ color: '#334155', textDecoration: 'none' }}>Términos y condiciones</a>
          <br />
          Consultas: <span style={{ color: GOLD }}>contacto@ingeniumpro.store</span>
        </div>
      </div>
    </div>
  );
}
