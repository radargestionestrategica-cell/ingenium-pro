import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora Cv de válvulas online — INGENIUM PRO',
  description:
    'Calculadora del coeficiente Cv y Kv de válvulas industriales (líquidos) según ISA-75.01.01-2012 / IEC 60534-2-1, clase ASME B16.34 ' +
    'y material NACE MR0175. Informe PDF sellado, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/valvulas',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Calculadora Cv de válvulas online — INGENIUM PRO',
  description:
    'Calculadora del coeficiente Cv y Kv de válvulas industriales (líquidos) según ISA-75.01.01-2012 / IEC 60534-2-1, clase ASME B16.34 ' +
    'y material NACE MR0175. Informe PDF sellado, Excel y DXF.',
  url: 'https://ingeniumpro.store/modulos/valvulas',
  applicationCategory: 'EngineeringApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  author: {
    '@type': 'Organization',
    name: 'INGENIUM PRO',
    url: 'https://ingeniumpro.store',
  },
  offers: {
    '@type': 'Offer',
    price: '45000',
    priceCurrency: 'ARS',
    url: 'https://ingeniumpro.store/planes/modulo-unico',
    availability: 'https://schema.org/InStock',
  },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloValvulasPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            Módulo Válvulas Industriales
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calculadora Cv de válvulas industriales online
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo normativo de válvulas: obtené el coeficiente de flujo Cv y Kv para dimensionar una válvula
            de control en servicio líquido según ISA-75.01.01-2012 / IEC 60534-2-1, con informe sellado y verificable, en un flujo de trabajo profesional.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El módulo calcula el coeficiente de flujo Cv (y su equivalente métrico Kv) que debe tener una válvula
            de control en servicio líquido a partir del caudal de diseño, las presiones manométricas de entrada
            y salida (P1, P2) y la gravedad específica del fluido, aceptando unidades en m³/h o GPM para caudal y
            en bar o psi para presión. Si se informan FL, Pv y Pc, verifica si el flujo está estrangulado. Según
            el Cv obtenido, orienta sobre el tipo de válvula de control recomendado. El cálculo para gas o vapor
            todavía no está disponible.
          </p>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El mismo módulo incluye además la selección de clase de presión requerida por ASME B16.34,
            selección de material según NACE MR0175/ISO 15156, dimensiones de brida por ASME B16.5-2017 y
            planos de diseño cara-a-cara (F2F) por tipo de válvula.
          </p>
        </section>

        {/* FÓRMULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Fórmula de Cv aplicada</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            El coeficiente de flujo se calcula con las ecuaciones de dimensionamiento de ISA-75.01.01-2012 / IEC 60534-2-1 para líquidos:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            Kv = Q(m³/h) × √(SG / ΔP(bar))<br />
            Cv = Kv / 0,865 ≈ 1,156 × Kv<br />
            Estrangulado si ΔP ≥ ΔPmax = FL² × (P1 − FF × Pv), FF = 0,96 − 0,28 × √(Pv / Pc)
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Q</strong>: caudal de diseño (1 m³/h = 4.40287 GPM).</li>
            <li><strong style={{ color: '#f1f5f9' }}>ΔP</strong>: P1 − P2. Las presiones se ingresan manométricas y se convierten a absolutas sumando 1,01325 bar.</li>
            <li><strong style={{ color: '#f1f5f9' }}>SG</strong>: gravedad específica del fluido respecto al agua.</li>
            <li><strong style={{ color: '#f1f5f9' }}>FL, Pv, Pc</strong>: factor de recuperación de presión, presión de vapor y presión crítica (opcionales). Si faltan, el estrangulamiento se informa como no verificado.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Kv</strong>: equivalente métrico de Cv, usado en IEC 60534.</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            ISA-75.01.01-2012 / IEC 60534-2-1 (ecuaciones de dimensionamiento de válvulas de control, servicio líquido) para el coeficiente Cv/Kv y la verificación de flujo estrangulado.
            El módulo también aplica ASME B16.34 (clase de presión, tablas P-T, prueba hidrostática de carcasa), ASME B16.5-2017
            (dimensiones de brida), NACE MR0175/ISO 15156 (selección de material en servicio ácido) y API 6D
            (diseño de válvulas de bola).
          </p>
        </section>

        {/* EJEMPLO NUMÉRICO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ejemplo numérico</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Caudal Q = 50 m³/h, P1 = 5 barg, P2 = 3 barg (ΔP = 2 bar), gravedad específica SG = 0.85:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9 }}>
            Kv = 50 × √(0.85 / 2) = 32.60<br />
            Cv = 32.60 / 0,865<br />
            <span style={{ color: GOLD }}>Cv ≈ 37.68 · Kv ≈ 32.60</span><br />
            Rango estándar — válvula de control globo o ball de control.
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
            <a href="/modulos/perforacion" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Perforación →</a>
            <a href="/modulos/canerias" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Cañerías &amp; Integridad →</a>
            <a href="/modulos/termica" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Térmica →</a>
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
