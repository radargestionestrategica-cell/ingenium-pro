'use client';
import { useState } from 'react';

const BG    = '#020609';
const GOLD  = '#E8A020';
const GREEN = '#22c55e';
const PANEL = '#0a0f1e';
const BORD  = 'rgba(232,160,32,0.15)';
const BLUE  = '#6366f1';

const USD_RATE = 1000;

function fmt(ars: number, moneda: 'ARS' | 'USD'): string {
  if (moneda === 'ARS') return `$${ars.toLocaleString('es-AR')}`;
  return `$${(ars / USD_RATE).toLocaleString('en-US')}`;
}

const PLANES = [
  {
    id:       'demo',
    nombre:   'Demo',
    icon:     '🔍',
    precio:   null,
    precioAn: null,
    badge:    'GRATIS',
    badgeColor: GREEN,
    destacado: false,
    features: [
      '3 días de acceso completo',
      '15 módulos de ingeniería',
      'PDF + Excel + DXF',
      'IA de integridad de activos',
      'Sin tarjeta de crédito',
    ],
    cta: 'Probar ahora',
    ctaHref: '/Login',
  },
  {
    id:       'individual',
    nombre:   'Individual',
    icon:     '👤',
    precio:   350_000,
    precioAn: 3_500_000,
    badge:    'MÁS POPULAR',
    badgeColor: GOLD,
    destacado: true,
    features: [
      '1 usuario',
      '15 módulos de ingeniería',
      'PDF + QR + Excel + DXF CAD',
      'IA anti-alucinación',
      'Historial ilimitado',
      'Verificación digital QR',
      'Soporte prioritario',
    ],
    cta: 'Suscribirse',
    ctaHref: 'mailto:radargestionestrategica@gmail.com?subject=Plan Individual INGENIUM PRO',
  },
  {
    id:       'team',
    nombre:   'Team',
    icon:     '👥',
    precio:   1_000_000,
    precioAn: 10_000_000,
    badge:    '3 USUARIOS',
    badgeColor: BLUE,
    destacado: false,
    features: [
      '3 usuarios incluidos',
      'Todo lo del plan Individual',
      'Panel de administración',
      'Historial compartido',
      'Onboarding dedicado',
      'Factura electrónica',
    ],
    cta: 'Contratar equipo',
    ctaHref: 'mailto:radargestionestrategica@gmail.com?subject=Plan Team INGENIUM PRO',
  },
  {
    id:       'enterprise',
    nombre:   'Enterprise',
    icon:     '🏢',
    precio:   null,
    precioAn: null,
    badge:    'A MEDIDA',
    badgeColor: '#94a3b8',
    destacado: false,
    features: [
      'Usuarios ilimitados',
      'Módulos personalizados',
      'Integración API propia',
      'SLA garantizado',
      'Capacitación in-company',
      'Soporte 24/7',
    ],
    cta: 'Consultar',
    ctaHref: 'mailto:radargestionestrategica@gmail.com?subject=Plan Enterprise INGENIUM PRO',
  },
];

export default function PlanesPage() {
  const [moneda, setMoneda]   = useState<'ARS' | 'USD'>('ARS');
  const [ciclo,  setCiclo]    = useState<'mensual' | 'anual'>('mensual');

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{ height: 56, background: PANEL, borderBottom: `1px solid ${BORD}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
        <a href="/dashboard" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Dashboard</a>
        <span style={{ color: GOLD, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>INGENIUM PRO</span>
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 300 }}>Ω</span>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* TÍTULO */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: GOLD, margin: 0, letterSpacing: 1 }}>
            Planes y Precios
          </h1>
          <p style={{ color: '#64748b', marginTop: 12, fontSize: 15 }}>
            Calculá con la precisión de INGENIUM PRO — el estándar profesional en integridad de activos.
          </p>

          {/* TOGGLES */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>

            {/* Toggle ARS / USD */}
            <div style={{ display: 'flex', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, overflow: 'hidden' }}>
              {(['ARS', 'USD'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMoneda(m)}
                  style={{ padding: '8px 20px', border: 'none', background: moneda === m ? `rgba(232,160,32,0.15)` : 'transparent', color: moneda === m ? GOLD : '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Toggle Mensual / Anual */}
            <div style={{ display: 'flex', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, overflow: 'hidden' }}>
              {(['mensual', 'anual'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCiclo(c)}
                  style={{ padding: '8px 20px', border: 'none', background: ciclo === c ? `rgba(34,197,94,0.15)` : 'transparent', color: ciclo === c ? GREEN : '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {c === 'anual' ? 'Anual (-17%)' : 'Mensual'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRID DE PLANES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {PLANES.map(plan => {
            const precio = ciclo === 'mensual' ? plan.precio : plan.precioAn;
            const isEnterprise = plan.precio === null && plan.id !== 'demo';

            return (
              <div
                key={plan.id}
                style={{
                  background: plan.destacado ? `linear-gradient(160deg,rgba(232,160,32,0.07),rgba(232,160,32,0.02))` : PANEL,
                  border: plan.destacado ? `1.5px solid rgba(232,160,32,0.4)` : `1px solid ${BORD}`,
                  borderRadius: 18,
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  position: 'relative',
                }}
              >
                {/* BADGE */}
                <div style={{ position: 'absolute', top: -12, left: 24, background: plan.badgeColor, color: BG, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, letterSpacing: 1 }}>
                  {plan.badge}
                </div>

                {/* ÍCONO + NOMBRE */}
                <div style={{ fontSize: 28, marginBottom: 6 }}>{plan.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{plan.nombre}</div>

                {/* PRECIO */}
                <div style={{ marginBottom: 20, marginTop: 8 }}>
                  {plan.id === 'demo' ? (
                    <span style={{ fontSize: 32, fontWeight: 900, color: GREEN }}>Gratis</span>
                  ) : isEnterprise ? (
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#94a3b8' }}>Consultar precio</span>
                  ) : precio !== null ? (
                    <>
                      <span style={{ fontSize: 30, fontWeight: 900, color: GOLD }}>
                        {fmt(precio, moneda)}
                      </span>
                      <span style={{ fontSize: 13, color: '#64748b', marginLeft: 6 }}>
                        {moneda} / {ciclo === 'mensual' ? 'mes' : 'año'}
                      </span>
                    </>
                  ) : null}
                </div>

                {/* FEATURES */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#94a3b8' }}>
                      <span style={{ color: GREEN, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={plan.ctaHref}
                  style={{
                    marginTop: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px 20px',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 14,
                    textDecoration: 'none',
                    background: plan.destacado
                      ? `linear-gradient(135deg,${GOLD},#c47a10)`
                      : plan.id === 'demo'
                        ? `linear-gradient(135deg,${GREEN},#16a34a)`
                        : 'transparent',
                    border: plan.destacado || plan.id === 'demo'
                      ? 'none'
                      : `1px solid ${BORD}`,
                    color: plan.destacado || plan.id === 'demo' ? BG : '#94a3b8',
                  }}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        {/* CONTACTO ENTERPRISE */}
        <div style={{ marginTop: 48, textAlign: 'center', padding: '24px', background: PANEL, borderRadius: 16, border: `1px solid ${BORD}` }}>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
            ¿Necesitás más de 3 usuarios o una solución personalizada?
          </div>
          <a
            href="mailto:radargestionestrategica@gmail.com"
            style={{ color: GOLD, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
          >
            radargestionestrategica@gmail.com
          </a>
        </div>

        {/* FOOTER NOTE */}
        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: '#1e3a5f' }}>
          Todos los precios incluyen IVA. Los precios en USD son orientativos al tipo de cambio del momento.
          Los pagos se procesan a través de MercadoPago.
        </div>
      </div>
    </div>
  );
}
