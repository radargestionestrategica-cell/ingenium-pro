import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Espesor mínimo y vida remanente de cañerías — INGENIUM PRO',
  description:
    'Cálculo de espesor mínimo por presión (ASME B31.8/B31.4, Barlow), hoop stress y vida remanente ' +
    'por corrosión según API 579-1. PDF sellado, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/canerias',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Espesor mínimo y vida remanente de cañerías — INGENIUM PRO',
  description:
    'Cálculo de espesor mínimo por presión (ASME B31.8/B31.4, Barlow), hoop stress y vida remanente ' +
    'por corrosión según API 579-1. PDF sellado, Excel y DXF.',
  url: 'https://ingeniumpro.store/modulos/canerias',
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

export default function ModuloCaneriasPage() {
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
            Módulo Cañerías e Integridad de Ductos
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Cálculo de espesor mínimo y vida remanente de cañerías online
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo normativo de integridad: obtené el espesor mínimo de pared por presión de diseño según
            ASME B31.8/B31.4 y estimá la vida remanente de una cañería a partir de una medición de espesor,
            con informe sellado y verificable, en un flujo de trabajo profesional.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El módulo calcula el espesor mínimo de pared requerido por presión de diseño (fórmula de Barlow
            de ASME B31.8 para gas o ASME B31.4 para líquidos), el hoop stress asociado, y estima la vida
            remanente de una cañería en servicio dividiendo el margen de espesor disponible (espesor medido
            menos espesor mínimo requerido) por la tasa de corrosión medida, clasificando el estado de
            integridad según ese margen. El mismo módulo incluye además golpe de ariete (Joukowsky) y tiempo
            crítico de cierre de válvula.
          </p>
        </section>

        {/* FÓRMULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Fórmulas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            Espesor mínimo por presión (Barlow):
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            t_min = (P × D) / (2 × S × F × E × T) — ASME B31.8 §841.1.1 (gas)<br />
            t_min = (P × D) / (2 × S × F × E) — ASME B31.4 §403.2.1 (líquidos, F = 0.72 fijo, sin T)
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20, marginBottom: 16 }}>
            <li><strong style={{ color: '#f1f5f9' }}>P</strong>: presión de diseño.</li>
            <li><strong style={{ color: '#f1f5f9' }}>D</strong>: diámetro exterior de la cañería.</li>
            <li><strong style={{ color: '#f1f5f9' }}>S</strong>: SMYS del material (grado API 5L o ASTM A106).</li>
            <li><strong style={{ color: '#f1f5f9' }}>F</strong>: factor de clase de ubicación (0.80 a 0.40 según densidad poblacional).</li>
            <li><strong style={{ color: '#f1f5f9' }}>E</strong>: factor de junta longitudinal (1.00 sin costura/ERW post-1970, hasta 0.60 Furnace Butt Weld).</li>
            <li><strong style={{ color: '#f1f5f9' }}>T</strong>: factor de temperatura (solo B31.8; 1.0 hasta 250 °F, decreciente por encima).</li>
          </ul>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            Vida remanente estimada, a partir de una medición de espesor en campo:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD }}>
            Vida remanente (años) = (t_medido − t_mínimo) / tasa de corrosión (mm/año)
          </div>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            ASME B31.8-2020 §841.1.1 y ASME B31.4-2019 §403.2.1 para espesor mínimo por presión, materiales
            según API 5L y ASTM A106, y clasificación del estado de integridad por vida remanente orientada
            por API 579-1/ASME FFS-1 e inspección periódica API 570.
          </p>
        </section>

        {/* EJEMPLO NUMÉRICO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ejemplo numérico</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Cañería de gas API 5L X65 (SMYS = 65 000 psi), OD = 273.1 mm, presión de diseño 80 bar, Clase 1
            Div. 2 (F = 0.72), junta ERW posterior a 1970 (E = 1.00), 60 °C, tolerancia de corrosión CA = 1.6 mm:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9, marginBottom: 20 }}>
            t_min = (80 bar × 273.1 mm) / (2 × 65 000 psi × 0.72 × 1.00 × 1.0)<br />
            <span style={{ color: GOLD }}>t_mínimo ≈ 3.39 mm · t_diseño (con CA) ≈ 4.99 mm · Hoop stress ≈ 322.7 MPa</span>
          </div>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Vida remanente con espesor nominal 9.3 mm, espesor medido hoy 7.8 mm, espesor mínimo requerido
            5.5 mm y tasa de corrosión 0.2 mm/año:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9 }}>
            Vida remanente = (7.8 − 5.5) / 0.2<br />
            <span style={{ color: GOLD }}>Vida remanente ≈ 11.5 años — EN SERVICIO NORMAL (60.5% de espesor disponible)</span>
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
            <a href="/modulos/petroleo-gas" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Petróleo &amp; Gas — MAOP →</a>
            <a href="/modulos/valvulas" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Válvulas Industriales →</a>
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
