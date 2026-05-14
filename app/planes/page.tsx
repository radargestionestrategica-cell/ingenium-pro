'use client';

import { useState, useEffect } from 'react'

const BG    = '#020609';
const GOLD  = '#E8A020';
const GREEN = '#22c55e';
const PANEL = '#0a0f1e';
const INDIGO = '#6366f1';
const BORD  = 'rgba(99,102,241,0.15)';

const PAYPAL_URLS: Record<string, string> = {
  pro:  'https://www.paypal.me/ingeniumpro/255',
  team: 'https://www.paypal.me/ingeniumpro/750',
}

const PLANES = [
  {
    id:        'demo',
    nombre:    'Demo',
    icon:      'Ω',
    precio:    'Gratis',
    periodo:   '3 días',
    badge:     'SIN TARJETA',
    badgeColor: GREEN,
    destacado: false,
    descripcion: 'Acceso completo a todos los módulos durante 3 días. Ideal para evaluar la plataforma antes de suscribirte.',
    features: [
      '15 módulos de ingeniería',
      'PDF verificable con QR',
      'Excel con fórmulas reales',
      'DXF para AutoCAD / FreeCAD',
      'Análisis de IA anti-alucinación',
      'Sin tarjeta de crédito',
    ],
    cta:     'Probar gratis',
    ctaHref: '/register',
  },
  {
    id:        'modulo',
    nombre:    'Módulo único',
    icon:      '◎',
    precio:    'ARS $45.000',
    periodo:   '/mes',
    badge:     '1 MÓDULO',
    badgeColor: '#06b6d4',
    destacado: false,
    descripcion: '1 módulo a elección. Ideal para quienes necesitan una herramienta específica de forma recurrente.',
    features: [
      '1 módulo a elección',
      'Usuario único',
      'PDF verificable con QR',
      'Excel con fórmulas reales',
      'DXF para AutoCAD / FreeCAD',
      'Soporte por email',
    ],
    cta:     'Contratar',
    ctaHref: '/planes/modulo-unico',
  },
  {
    id:        'duo',
    nombre:    'Dúo',
    icon:      '⬡',
    precio:    'ARS $80.000',
    periodo:   '/mes',
    badge:     '2 MÓDULOS',
    badgeColor: GREEN,
    destacado: false,
    descripcion: '2 módulos a elección. Más versatilidad a mejor precio para el profesional con necesidades diversas.',
    features: [
      '2 módulos a elección',
      'Usuario único',
      'PDF verificable con QR',
      'Excel con fórmulas reales',
      'DXF para AutoCAD / FreeCAD',
      'Soporte por email',
    ],
    cta:     'Contratar',
    ctaHref: '/planes/duo',
  },
  {
    id:        'pro',
    nombre:    'Pro',
    icon:      '⚡',
    precio:    'ARS $350.000',
    periodo:   '/mes',
    badge:     'MÁS POPULAR',
    badgeColor: GOLD,
    destacado: true,
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
    cta:     'Activar Pro',
    ctaHref: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=7977d5695fec4f99be5cc3e56c7b9428',
    ctaTarget: '_blank',
  },
  {
    id:        'team',
    nombre:    'Team',
    icon:      '👥',
    precio:    'ARS $1.000.000',
    periodo:   '/mes',
    badge:     'HASTA 3 USUARIOS',
    badgeColor: INDIGO,
    destacado: false,
    descripcion: 'Para equipos de ingeniería que trabajan en proyectos compartidos y necesitan trazabilidad centralizada.',
    features: [
      'Hasta 3 usuarios',
      'Todo lo del plan Pro',
      'Historial compartido de proyectos',
      'Panel de administración de equipo',
      'Exportación masiva de informes',
      'Onboarding dedicado',
      'Factura electrónica',
    ],
    cta:     'Activar Team',
    ctaHref: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=a82fae7648024090a3b6dc195d136ccd',
    ctaTarget: '_blank',
  },
  {
    id:        'enterprise',
    nombre:    'Enterprise',
    icon:      '🏢',
    precio:    'Solicitar',
    periodo:   'cotización',
    badge:     'ILIMITADO',
    badgeColor: '#94a3b8',
    destacado: false,
    descripcion: 'Para empresas e instituciones con múltiples equipos, módulos personalizados e integración con sistemas propios.',
    features: [
      'Usuarios ilimitados',
      'Módulos de cálculo personalizados',
      'Integración API REST propia',
      'SLA de uptime garantizado',
      'Capacitación in-company',
      'Soporte técnico 24/7',
      'Contrato con factura A',
    ],
    cta:     'Solicitar cotización',
    ctaHref: '',
  },
];

export default function PlanesPage() {
  const [demoExpirado, setDemoExpirado] = useState(false)

  useEffect(() => {
    setDemoExpirado(new URLSearchParams(window.location.search).get('demo') === 'expired')
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{
        height: 56, background: PANEL,
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      }}>
        <a href="/Login" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
          ← Volver
        </a>
        <span style={{ color: GOLD, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>INGENIUM PRO</span>
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 300 }}>Ω</span>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* TÍTULO */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: INDIGO, marginBottom: 12, textTransform: 'uppercase' }}>
            Plataforma de Ingeniería Técnica Verificable
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f1f5f9', margin: '0 0 16px', lineHeight: 1.1 }}>
            Elegí tu plan
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
            Cálculos verificables, informes profesionales con QR y análisis de IA sin alucinaciones.
            Empezá gratis por 3 días, sin tarjeta de crédito.
          </p>
        </div>

        {/* GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}>
          {PLANES.map(plan => (
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
                padding: '32px 24px 28px',
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
                  color: plan.destacado ? GOLD : plan.id === 'demo' ? GREEN : '#f1f5f9',
                }}>
                  {plan.precio}
                </span>
                <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>
                  {plan.periodo}
                </span>
              </div>

              {/* DESCRIPCIÓN */}
              <p style={{
                fontSize: 12, color: '#64748b', lineHeight: 1.6,
                margin: '0 0 20px', minHeight: 52,
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
                onClick={() => { if (plan.ctaHref) window.location.href = plan.ctaHref }}
                style={{
                  marginTop: 'auto',
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '13px 20px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: plan.ctaHref ? 'pointer' : 'default',
                  transition: 'opacity .2s',
                  background: plan.destacado
                    ? `linear-gradient(135deg,${GOLD},#c47a10)`
                    : plan.id === 'demo'
                      ? `linear-gradient(135deg,${GREEN},#16a34a)`
                      : 'rgba(99,102,241,0.1)',
                  border: plan.destacado || plan.id === 'demo'
                    ? 'none'
                    : '1px solid rgba(99,102,241,0.25)',
                  color: plan.destacado || plan.id === 'demo' ? BG : '#a5b4fc',
                  opacity: plan.ctaHref ? 1 : 0.5,
                }}
              >
                {plan.cta}
              </button>

              {(['pro', 'team'] as string[]).includes(plan.id) && (
                <button
                  type="button"
                  onClick={() => { window.location.href = PAYPAL_URLS[plan.id] }}
                  style={{
                    marginTop: 8,
                    display: 'block',
                    width: '100%',
                    padding: '11px 20px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#818cf8',
                    transition: 'opacity .2s',
                  }}
                >
                  Pagar con PayPal (USD {plan.id === 'pro' ? '255' : '750'}/mes)
                </button>
              )}

            </div>
          ))}
        </div>

        {/* BANNER DEMO EXPIRADO — solo si ?demo=expired */}
        {demoExpirado && (
          <div style={{
            marginTop: 48, padding: '20px 28px',
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f87171', marginBottom: 4 }}>
              Tu demo ha expirado
            </div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
              Tu período de prueba gratuita de 3 días ha finalizado. Contratá un plan para seguir usando INGENIUM PRO.
            </div>
          </div>
        )}

        {/* CONTACTO */}
        <div style={{
          marginTop: 28, textAlign: 'center',
          padding: '24px', background: PANEL,
          borderRadius: 16, border: `1px solid ${BORD}`,
        }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
            ¿Necesitás una solución personalizada o tenés dudas sobre los planes?
          </div>
          <span style={{ color: GOLD, fontWeight: 700, fontSize: 15 }}>
            radargestionestrategica@gmail.com
          </span>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: '#1e3a5f', lineHeight: 1.7 }}>
          Los precios están expresados en dólares estadounidenses (USD).
          Los pagos se procesan de forma segura a través de MercadoPago (ARS) o PayPal (USD).{' '}
          <a href="/terminos" style={{ color: '#334155', textDecoration: 'none' }}>Términos y condiciones</a>
        </div>
      </div>
    </div>
  );
}
