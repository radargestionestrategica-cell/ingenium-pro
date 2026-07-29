import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cálculo de estabilidad de taludes método de Bishop online — INGENIUM PRO',
  description:
    'Calculadora online de estabilidad de taludes por el método simplificado de Bishop (1955), con búsqueda ' +
    'automática de círculo de falla crítico según práctica geotécnica estándar (FS mínimo 1.5 para taludes ' +
    'permanentes), más capacidad portante de fundaciones por ' +
    'Meyerhof con nivel freático, informe PDF sellado con hash SHA-256 y QR de verificación pública, más ' +
    'exportación Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/geotecnia',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloGeotecniaPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{ background: PANEL, borderBottom: `1px solid ${BORD}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: GOLD, fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>INGENIUM PRO</span>
          <span style={{ color: GOLD, fontSize: 22, fontWeight: 300 }}>Ω</span>
        </a>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* HERO */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: 3, marginBottom: 12, textTransform: 'uppercase' }}>
            Módulo Geotecnia
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Cálculo de estabilidad de taludes método de Bishop online
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo normativo de geotecnia: obtené el Factor de Seguridad (FS) de un talud por el método
            simplificado de Bishop con búsqueda automática del círculo de falla más crítico, según práctica
            geotécnica estándar (FS mínimo 1.5 para taludes permanentes), con informe sellado y verificable,
            en un flujo de trabajo profesional.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El módulo calcula el <strong style={{ color: '#f1f5f9' }}>Factor de Seguridad de un talud</strong> a
            partir de su altura, el ángulo de inclinación, la cohesión y el ángulo de fricción del suelo, el peso
            específico y el nivel freático. En lugar de evaluar un único círculo de falla, el motor de cálculo
            recorre una grilla de centros (Xc, Yc) y radios (R), calcula el FS de cada círculo con Bishop
            simplificado sobre 20 dovelas, y refina la búsqueda alrededor del mínimo encontrado para reportar el
            círculo de falla más crítico — el de menor FS.
          </p>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El mismo módulo incluye además el cálculo de <strong style={{ color: '#f1f5f9' }}>capacidad portante de
            fundaciones</strong> por el método de Meyerhof: a partir del tipo de suelo, las dimensiones de la
            zapata, la profundidad de desplante, la carga aplicada y el nivel freático, obtiene la capacidad
            portante última (qu), la admisible (qa) y el porcentaje de utilización de la fundación.
          </p>
        </section>

        {/* FÓRMULAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Fórmulas aplicadas</h2>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 10 }}>
            <strong style={{ color: '#f1f5f9' }}>Estabilidad de taludes</strong> — método simplificado de Bishop (1955):
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            FS = Σ[(c·b + (W − u·b)·tan(φ)) / mα] / Σ[W·sin(α)]
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20, marginBottom: 24 }}>
            <li><strong style={{ color: '#f1f5f9' }}>c, φ</strong>: cohesión (kPa) y ángulo de fricción interna del suelo (grados).</li>
            <li><strong style={{ color: '#f1f5f9' }}>b, W</strong>: ancho y peso de cada dovela, calculados a partir de la geometría del talud y el peso específico del suelo.</li>
            <li><strong style={{ color: '#f1f5f9' }}>u</strong>: presión de poros en la base de la dovela, según el nivel freático ingresado.</li>
            <li><strong style={{ color: '#f1f5f9' }}>α</strong>: ángulo de la base de la dovela respecto a la horizontal, según su posición sobre el círculo de falla.</li>
            <li><strong style={{ color: '#f1f5f9' }}>mα</strong>: factor de corrección de Bishop, dependiente del propio FS — se resuelve por iteración hasta converger (tolerancia 0.001).</li>
          </ul>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 10 }}>
            <strong style={{ color: '#f1f5f9' }}>Capacidad portante</strong> — Meyerhof (1963) con nivel freático:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            qu = c·Nc·sc + q·Nq·sq + 0.5·γ·B·Ng·sg
          </div>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            donde Nc, Nq y Ng son los factores de capacidad de carga del suelo, sc/sq/sg son factores de forma de
            la zapata (dependientes de la relación B/L), q es la sobrecarga del suelo sobre el plano de desplante
            y γ el peso específico efectivo, reducido si el nivel freático está por encima de la profundidad de
            desplante.
          </p>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Práctica geotécnica estándar (FS mínimo 1.5 para taludes permanentes), método de Bishop
            simplificado (1955) para estabilidad de taludes, capacidad portante de Meyerhof (1963) y Das (2011,
            Principles of Foundation Engineering) para los factores de capacidad de carga y de forma de zapatas.
          </p>
        </section>

        {/* EJEMPLO NUMÉRICO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ejemplo numérico</h2>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Talud de altura H = 8 m, inclinación β = 35°, cohesión c = 40 kPa, ángulo de fricción φ = 28°, peso
            específico γ = 1800 kg/m³ (17.66 kN/m³), nivel freático a 5 m:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9, marginBottom: 24 }}>
            Búsqueda del círculo crítico sobre grilla de centros y radios, 20 dovelas por círculo<br />
            <span style={{ color: GOLD }}>FS ≈ 2.13</span> → talud ESTABLE, cumple FS mínimo de 1.5 exigido por práctica geotécnica estándar
          </div>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Fundación en arcilla media (c = 50 kPa) de B = 1.5 m × L = 2.0 m, profundidad de desplante Df = 1.2 m,
            carga Q = 500 kN, FS de diseño = 3.0, nivel freático a 10 m:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9 }}>
            qu = 317.1 kPa → qa = qu / 3.0 = 105.7 kPa<br />
            q aplicada = 500 / (1.5×2.0) = 166.7 kPa<br />
            <span style={{ color: GOLD }}>Utilización ≈ 157.7%</span> → fundación NO apta, aumentar B, L o Df
          </div>
        </section>

        {/* EXPORTACIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Informe sellado y exportación</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Cada cálculo se puede exportar como PDF sellado con hash SHA-256 y código QR de verificación pública,
            como planilla Excel con parámetros y resultados, y como archivo DXF con los datos de diseño para uso
            en CAD.
          </p>
        </section>

        {/* AVISO */}
        <div style={{ background: 'rgba(232,160,32,0.06)', border: `1px solid ${BORD}`, borderRadius: 8, padding: '16px 18px', marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: GRAY, lineHeight: 1.7, margin: 0 }}>
            Los resultados requieren revisión de un profesional habilitado.
          </p>
        </div>

        {/* MÓDULOS RELACIONADOS */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Módulos relacionados</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <a href="/modulos/telemetria" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Telemetría de activos →</a>
            <a href="/modulos/mineria" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Minería →</a>
            <a href="/modulos/inteligencia-cruzada" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Inteligencia Cruzada →</a>
          </div>
        </section>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <a href="/planes" style={{
            display: 'inline-block',
            background: `linear-gradient(135deg,${GOLD},#c47a10)`,
            color: BG,
            fontWeight: 800,
            fontSize: 15,
            padding: '14px 32px',
            borderRadius: 12,
            textDecoration: 'none',
            letterSpacing: 0.5,
          }}>
            Probar demo gratuita de 3 días →
          </a>
        </div>

      </div>
    </div>
  )
}
