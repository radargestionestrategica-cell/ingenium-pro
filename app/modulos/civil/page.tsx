import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Columnas ACI 318-19 y vigas AISC 360-22 — INGENIUM PRO',
  description:
    'Columnas de hormigón armado según ACI 318-19 §22.4.2 y vigas de acero según AISC 360-22 LRFD ' +
    'con combinaciones ASCE 7-22. Informe PDF sellado, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/civil',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Columnas ACI 318-19 y vigas AISC 360-22 — INGENIUM PRO',
  description:
    'Columnas de hormigón armado según ACI 318-19 §22.4.2 y vigas de acero según AISC 360-22 LRFD ' +
    'con combinaciones ASCE 7-22. Informe PDF sellado, Excel y DXF.',
  url: 'https://ingeniumpro.store/modulos/civil',
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

export default function ModuloCivilPage() {
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
            Módulo Civil
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calculadora estructural online: columnas ACI 318-19 y vigas AISC 360-22
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo estructural normativo: capacidad axial de columnas de hormigón armado según ACI 318-19 y
            verificación de vigas de acero según AISC 360-22 LRFD, con informe sellado y verificable.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El módulo reúne dos cálculos estructurales: la capacidad axial de columnas de hormigón armado y la
            verificación de vigas de acero. Cada cálculo parte de los datos de la sección (dimensiones,
            materiales, armadura o perfil, cargas de diseño) y devuelve el resultado con la referencia normativa
            aplicada y un semáforo de verificación.
          </p>
        </section>

        {/* COLUMNAS DE HORMIGÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Columnas de hormigón armado</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            La capacidad axial máxima de una columna con estribos se calcula según ACI 318-19 §22.4.2, con
            factor de reducción φ = 0.65:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            φPn_máx = 0.80 · φ · [0.85 · f&apos;c · (Ag − Ast) + fy · Ast]
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Cuantía longitudinal</strong>: la armadura ρ = Ast / Ag debe quedar entre 1% y 8% del área bruta, según ACI 318-19 §10.6.1.1.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Excentricidad accidental</strong>: se verifica el momento mínimo M2mín = Pu · (15 + 0.03h) en mm, según ACI 318-19 §6.6.4.5.4.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Equivalencia argentina</strong>: el CIRSOC 201-2005 provee resistencias características y factores de reducción equivalentes al ACI.</li>
          </ul>
        </section>

        {/* VIGAS DE ACERO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Vigas de acero</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            Las vigas de acero se verifican por el método LRFD de AISC 360-22, comparando el momento último de
            diseño con la resistencia de la sección. Las combinaciones de carga se toman de ASCE 7-22 §2.3.
          </p>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Resistencia a flexión</strong>: fluencia plástica de la sección compacta con φ = 0.90.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Combinaciones de carga</strong>: ASCE 7-22 §2.3 (LRFD), con 1.2D + 1.6L como combinación crítica habitual.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Equivalencia argentina</strong>: el CIRSOC 301 provee criterios equivalentes para estructuras de acero.</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li>ACI 318-19 §22.4.2 (φ = 0.65) — capacidad axial de columnas de hormigón armado.</li>
            <li>ACI 318-19 §10.6.1.1 — cuantía longitudinal entre 1% y 8%.</li>
            <li>ACI 318-19 §6.6.4.5.4 — momento mínimo por excentricidad accidental.</li>
            <li>CIRSOC 201-2005 — equivalencia argentina para hormigón armado.</li>
            <li>AISC 360-22 LRFD — verificación de vigas de acero.</li>
            <li>ASCE 7-22 §2.3 — combinaciones de carga; CIRSOC 301 — equivalencia argentina para acero.</li>
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
            <a href="/modulos/arquitectura" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Arquitectura Técnica →</a>
            <a href="/modulos/soldadura" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Soldadura →</a>
            <a href="/modulos/electricidad" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Electricidad →</a>
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
