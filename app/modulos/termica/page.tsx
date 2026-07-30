import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Intercambiadores LMTD y dilatación térmica — INGENIUM PRO',
  description:
    'Cálculo de intercambiadores de calor por LMTD (ASME VIII, TEMA, Kern 1950) y dilatación térmica ' +
    'de cañerías según ASME B31.3 Appendix C. PDF, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/termica',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Intercambiadores LMTD y dilatación térmica — INGENIUM PRO',
  description:
    'Cálculo de intercambiadores de calor por LMTD (ASME VIII, TEMA, Kern 1950) y dilatación térmica ' +
    'de cañerías según ASME B31.3 Appendix C. PDF, Excel y DXF.',
  url: 'https://ingeniumpro.store/modulos/termica',
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

export default function ModuloTermicaPage() {
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
            Módulo Térmica
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Intercambiadores LMTD y dilatación térmica
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Dos cálculos térmicos de proceso: área de intercambio de calor por el método de la diferencia
            media logarítmica de temperatura (LMTD), y dilatación térmica de cañerías con verificación de
            tensión si los extremos están restringidos.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El módulo calcula el área requerida de un intercambiador de calor a partir del calor a
            transferir, las temperaturas de entrada y salida de ambos fluidos y el coeficiente global de
            transferencia, en flujo contracorriente o paralelo. También calcula la dilatación libre de una
            cañería entre dos temperaturas, y si los extremos están restringidos, la tensión térmica
            resultante y una longitud de referencia de lira en U, para 6 materiales: acero al carbono, acero
            inoxidable 304 y 316, cobre, aluminio y HDPE.
          </p>
        </section>

        {/* FÓRMULA LMTD */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Fórmula LMTD aplicada</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            El área de intercambio se obtiene de la ecuación de diseño térmico, con la diferencia media
            logarítmica de temperatura entre los dos extremos del intercambiador:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            Q = U × A × LMTD &nbsp;→&nbsp; A = Q / (U × LMTD)
          </div>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            En contracorriente, LMTD se calcula con ΔT₁ = T<sub>caliente,in</sub> − T<sub>frío,out</sub> y
            ΔT₂ = T<sub>caliente,out</sub> − T<sub>frío,in</sub>; en flujo paralelo, con ambas temperaturas de
            entrada y ambas de salida.
          </p>
        </section>

        {/* FÓRMULA DILATACIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Fórmula de dilatación térmica aplicada</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            Según ASME B31.3-2022 Appendix C, la dilatación libre y la tensión térmica si el tramo está
            restringido:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            ΔL = α × L × ΔT &nbsp;·&nbsp; σ = E × α × ΔT (si está restringido)
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Acero al carbono</strong>: α = 11.7×10⁻⁶/°C, E = 200 GPa.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Acero inoxidable 304</strong>: α = 17.2×10⁻⁶/°C, E = 193 GPa.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Acero inoxidable 316</strong>: α = 16.0×10⁻⁶/°C, E = 193 GPa.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Cobre</strong>: α = 17.0×10⁻⁶/°C, E = 110 GPa.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Aluminio</strong>: α = 23.6×10⁻⁶/°C, E = 69 GPa.</li>
            <li><strong style={{ color: '#f1f5f9' }}>HDPE</strong>: α = 150.0×10⁻⁶/°C, E = 0.8 GPa.</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Método LMTD y correlaciones de Kern para la estimación térmica. La verificación mecánica debe
            realizarse según ASME VIII y TEMA cuando corresponda.
          </p>
        </section>

        {/* EJEMPLO NUMÉRICO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ejemplo numérico</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Intercambiador en contracorriente: Q = 500 kW, fluido caliente de 120 °C a 60 °C, fluido frío de
            20 °C a 80 °C, U = 500 W/m²·K:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9, marginBottom: 16 }}>
            ΔT₁ = 120 − 80 = 40 °C &nbsp;·&nbsp; ΔT₂ = 60 − 20 = 40 °C → LMTD = 40 K<br />
            A = 500 000 / (500 × 40) = <span style={{ color: GOLD }}>25 m²</span><br />
            Efectividad = (120 − 60) / (120 − 20) = 60% &nbsp;·&nbsp; Estado: LOW
          </div>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Cañería de acero al carbono, L = 100 m, de 20 °C a 80 °C, extremos restringidos, OD = 219.1 mm,
            e = 8.18 mm:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9 }}>
            ΔL = 11.7×10⁻⁶ × 100 × 60 × 1000 = <span style={{ color: GOLD }}>70.2 mm</span><br />
            σ = 200 000 × 11.7×10⁻⁶ × 60 = <span style={{ color: GOLD }}>140.4 MPa</span> → Estado: MEDIUM (admisible A36 = 150 MPa)<br />
            Longitud de referencia de lira en U ≈ 6.79 m
          </div>
        </section>

        {/* EXPORTACIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Informe sellado y exportación</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Cada cálculo se puede exportar como PDF sellado con hash SHA-256 y código QR de verificación
            pública, como planilla Excel con parámetros y resultados, y como archivo DXF con los datos de
            diseño para uso en CAD.
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
            <a href="/modulos/petroleo-gas" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Petróleo &amp; Gas — MAOP →</a>
            <a href="/modulos/canerias" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Cañerías &amp; Integridad →</a>
            <a href="/modulos/perforacion" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Perforación →</a>
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
