'use client';

const BG    = '#020609';
const GOLD  = '#E8A020';
const GREEN = '#22c55e';
const PANEL = '#0a0f1e';
const BORD  = 'rgba(99,102,241,0.15)';
const RED   = '#ef4444';

const PLANES = [
  {
    id:         'pro',
    nombre:     'Pro',
    icon:       '⚡',
    precio:     'USD 79',
    periodo:    '/mes',
    badge:      'MÁS POPULAR',
    badgeColor: GOLD,
    destacado:  true,
    features: [
      '1 usuario',
      '15 módulos de ingeniería',
      'PDF + QR verificable + Excel + DXF',
      'IA análisis normativo ilimitado',
      'Historial ilimitado de cálculos',
      'Soporte prioritario por email',
    ],
  },
  {
    id:         'team',
    nombre:     'Team',
    icon:       '👥',
    precio:     'USD 199',
    periodo:    '/mes',
    badge:      'HASTA 3 USUARIOS',
    badgeColor: '#6366f1',
    destacado:  false,
    features: [
      'Hasta 3 usuarios',
      'Todo lo del plan Pro',
      'Historial compartido de proyectos',
      'Panel de administración de equipo',
      'Exportación masiva de informes',
      'Factura electrónica',
    ],
  },
  {
    id:         'enterprise',
    nombre:     'Enterprise',
    icon:       '🏢',
    precio:     'A consultar',
    periodo:    '',
    badge:      'ILIMITADO',
    badgeColor: '#94a3b8',
    destacado:  false,
    features: [
      'Usuarios ilimitados',
      'Módulos de cálculo personalizados',
      'Integración API REST propia',
      'SLA de uptime garantizado',
      'Capacitación in-company',
      'Soporte técnico 24/7',
    ],
  },
];

export default function PagarPage() {
  const payoneerUrls: Record<string, string | undefined> = {
    pro:  process.env.NEXT_PUBLIC_PAYONEER_PRO_URL,
    team: process.env.NEXT_PUBLIC_PAYONEER_TEAM_URL,
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
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 300 }}>Ω</span>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* BANNER DEMO EXPIRADA */}
        <div style={{
          marginBottom: 48, padding: '20px 28px',
          background: 'rgba(239,68,68,0.06)',
          border: `1px solid rgba(239,68,68,0.25)`,
          borderRadius: 16,
          display: 'flex', alignItems: 'flex-start', gap: 16,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>⏳</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: RED, marginBottom: 6 }}>
              Tu demo expiró. Elegí tu plan para continuar.
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              Accedés con el mismo email de tu registro. Una vez que confirmemos el pago activamos tu plan en minutos.
            </div>
          </div>
        </div>

        {/* TÍTULO */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', margin: '0 0 12px', lineHeight: 1.1 }}>
            Elegí tu plan
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Precios en USD — procesados por Payoneer
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
              <div style={{ marginBottom: 20, marginTop: 4 }}>
                <span style={{
                  fontSize: 36, fontWeight: 900,
                  color: plan.destacado ? GOLD : '#f1f5f9',
                }}>
                  {plan.precio}
                </span>
                {plan.periodo && (
                  <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>
                    {plan.periodo}
                  </span>
                )}
              </div>

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

              {/* BOTÓN PAYONEER */}
              {plan.id === 'enterprise' ? (
                <a
                  href="mailto:contacto@ingeniumpro.store?subject=Solicitud%20Enterprise%20INGENIUM%20PRO"
                  style={{
                    marginTop: 'auto', display: 'block', width: '100%',
                    textAlign: 'center', padding: '13px 20px', borderRadius: 12,
                    fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    color: '#a5b4fc', textDecoration: 'none', boxSizing: 'border-box',
                  }}
                >
                  Solicitar cotización
                </a>
              ) : payoneerUrls[plan.id] ? (
                <a
                  href={payoneerUrls[plan.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 'auto', display: 'block', width: '100%',
                    textAlign: 'center', padding: '13px 20px', borderRadius: 12,
                    fontWeight: 800, fontSize: 14,
                    background: plan.destacado
                      ? `linear-gradient(135deg,${GOLD},#c47a10)`
                      : 'rgba(232,160,32,0.1)',
                    border: plan.destacado ? 'none' : `1px solid rgba(232,160,32,0.3)`,
                    color: plan.destacado ? BG : GOLD,
                    textDecoration: 'none', boxSizing: 'border-box',
                  }}
                >
                  Pagar con Payoneer
                </a>
              ) : (
                <button
                  disabled
                  style={{
                    marginTop: 'auto', display: 'block', width: '100%',
                    textAlign: 'center', padding: '13px 20px', borderRadius: 12,
                    fontWeight: 800, fontSize: 14, cursor: 'default',
                    background: 'rgba(99,102,241,0.05)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    color: '#334155', opacity: 0.5, boxSizing: 'border-box',
                  }}
                >
                  Disponible próximamente
                </button>
              )}
            </div>
          ))}
        </div>

        {/* NOTA ACCESO */}
        <div style={{
          marginTop: 40, padding: '20px 28px',
          background: PANEL, borderRadius: 16, border: `1px solid ${BORD}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
            Accedés con el mismo email de tu registro.
          </div>
          <div style={{ fontSize: 12, color: '#334155' }}>
            Una vez confirmado el pago, activamos tu plan manualmente en el horario de atención.
            Contacto: <span style={{ color: GOLD }}>contacto@ingeniumpro.store</span>
          </div>
        </div>

      </div>
    </div>
  );
}
