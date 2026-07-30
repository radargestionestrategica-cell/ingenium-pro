import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pavimento AASHTO 93 y drenaje HEC-22 — INGENIUM PRO',
  description:
    'Número estructural SN de pavimento flexible por AASHTO 1993 (ESAL W18) y drenaje de cuneta por ' +
    'método Racional + Manning (FHWA HEC-22). PDF, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/vialidad',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Pavimento AASHTO 93 y drenaje HEC-22 — INGENIUM PRO',
  description:
    'Número estructural SN de pavimento flexible por AASHTO 1993 (ESAL W18) y drenaje de cuneta por ' +
    'método Racional + Manning (FHWA HEC-22). PDF, Excel y DXF.',
  url: 'https://ingeniumpro.store/modulos/vialidad',
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

export default function ModuloVialidadPage() {
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
            Módulo Vialidad
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calculadora vial online: pavimento AASHTO 93 y drenaje HEC-22
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo vial normativo: número estructural de pavimento flexible según AASHTO 1993 y verificación
            de drenaje de cuneta por método Racional y Manning, con informe sellado y verificable.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El módulo reúne dos cálculos viales: el número estructural (SN) de un pavimento flexible y el drenaje
            superficial de una cuneta triangular. Cada cálculo parte de los datos de la obra (tránsito, materiales,
            geometría de la cuenca y de la cuneta) y devuelve el resultado con la referencia normativa aplicada y
            un semáforo de riesgo.
          </p>
        </section>

        {/* PAVIMENTO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Pavimento flexible (AASHTO 93)</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            El número estructural requerido SN se obtiene resolviendo iterativamente la ecuación empírica de la
            AASHTO Guide for Design of Pavement Structures 1993:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: GOLD, marginBottom: 16, lineHeight: 1.7 }}>
            log₁₀(W18) = Zr·So + 9.36·log₁₀(SN+1) − 0.20 + log₁₀(ΔPSI/4.2) / (0.4 + 1094/(SN+1)^5.19) + 2.32·log₁₀(MR) − 8.07
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>W18</strong>: tránsito de diseño en ejes equivalentes de 18 kips (ESAL); <strong style={{ color: '#f1f5f9' }}>MR</strong>: módulo resiliente de la subrasante (psi).</li>
            <li><strong style={{ color: '#f1f5f9' }}>Zr, So</strong>: factor de confiabilidad y desviación estándar; <strong style={{ color: '#f1f5f9' }}>ΔPSI</strong>: pérdida de serviciabilidad.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Espesores por capa</strong>: SN = a1·D1 + a2·m2·D2 + a3·m3·D3 (asfalto, base y subbase, con sus coeficientes de capa y de drenaje).</li>
          </ul>
        </section>

        {/* DRENAJE */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Drenaje de cuneta (Racional + Manning)</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            El caudal de aporte se calcula por el método Racional y la capacidad de la cuneta triangular por la
            ecuación de Manning:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            Q = C·I·A / 360&nbsp;&nbsp;·&nbsp;&nbsp;Q = (1/n)·A·Rh^(2/3)·√S
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>C</strong>: coeficiente de escorrentía; <strong style={{ color: '#f1f5f9' }}>I</strong>: intensidad de lluvia (mm/h); <strong style={{ color: '#f1f5f9' }}>A</strong>: área de la cuenca (ha) → Q en m³/s.</li>
            <li><strong style={{ color: '#f1f5f9' }}>n</strong>: rugosidad de Manning; <strong style={{ color: '#f1f5f9' }}>Rh</strong>: radio hidráulico; <strong style={{ color: '#f1f5f9' }}>S</strong>: pendiente. Resuelve el tirante y la velocidad en la cuneta.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Verificación FHWA HEC-22 4th Ed. (2024)</strong>: velocidad de erosión máxima 1.5 m/s en cuneta sin revestir.</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li>AASHTO Guide for Design of Pavement Structures 1993 — número estructural del pavimento flexible.</li>
            <li>Método Racional y ecuación de Manning — caudal y capacidad de la cuneta.</li>
            <li>FHWA HEC-22 4th Ed. (2024) y AASHTO Drainage Manual — verificación del drenaje y velocidad de erosión.</li>
          </ul>
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
            <a href="/modulos/hidraulica" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Hidráulica de cañerías →</a>
            <a href="/modulos/represas" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Represas →</a>
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
