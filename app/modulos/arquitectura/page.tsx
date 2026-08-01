import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Viento ASCE 7-22 e iluminación IRAM 11601 — INGENIUM PRO',
  description:
    'Carga de viento según ASCE 7-22, iluminación natural según IRAM 11601 y cortante basal sísmico ' +
    'según INPRES-CIRSOC 103:2013. Informe PDF sellado, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/arquitectura',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Viento ASCE 7-22 e iluminación IRAM 11601 — INGENIUM PRO',
  description:
    'Carga de viento según ASCE 7-22, iluminación natural según IRAM 11601 y cortante basal sísmico ' +
    'según INPRES-CIRSOC 103:2013. Informe PDF sellado, Excel y DXF.',
  url: 'https://ingeniumpro.store/modulos/arquitectura',
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

export default function ModuloArquitecturaPage() {
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
            Módulo Arquitectura
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calculadora de arquitectura online: viento, iluminación y sismo
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo normativo para edificación: carga de viento según ASCE 7-22, iluminación natural y ventilación
            según IRAM 11601, y cortante basal sísmico según INPRES-CIRSOC 103, con informe sellado y verificable.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El módulo reúne tres cálculos de un edificio: la presión de viento sobre la estructura, la iluminación
            natural y ventilación de un local, y el cortante basal sísmico. Cada cálculo parte de los datos de la
            obra (geometría, uso, categoría de exposición, zona sísmica y tipo de suelo) y devuelve el resultado
            con la referencia normativa aplicada y un semáforo de riesgo.
          </p>
        </section>

        {/* VIENTO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Carga de viento (ASCE 7-22)</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            La presión dinámica del viento se calcula según el Capítulo 27 de ASCE 7-22:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: GOLD, marginBottom: 16, lineHeight: 1.8 }}>
            Kz = 2.01 · (z/zg)^(2/α)<br />
            qz = 0.00256 · Kz · Kd · V² · Iw&nbsp;&nbsp;(psf)<br />
            p_total = qz · (Cp_barlovento + |Cp_sotavento|)
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>V</strong>: velocidad básica del viento (mph); <strong style={{ color: '#f1f5f9' }}>Kz</strong>: coeficiente de exposición según categoría B/C/D; <strong style={{ color: '#f1f5f9' }}>Kd</strong>: factor de direccionalidad.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Iw</strong>: factor de importancia por uso; el resultado se expresa en kPa (conversión 47.88 Pa/psf).</li>
          </ul>
        </section>

        {/* ILUMINACIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Iluminación natural y ventilación (IRAM 11601)</h2>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: GOLD, marginBottom: 16, lineHeight: 1.8 }}>
            FLD = (A_ventanas · τ · 0.85) / A_piso · 100<br />
            RVP = (A_ventanas / A_piso) · 100
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>FLD</strong>: factor de luz de día, comparado contra el mínimo requerido según el uso del local.</li>
            <li><strong style={{ color: '#f1f5f9' }}>RVP</strong>: relación vano/piso, con rango recomendado 15–40%; se estima además el caudal de ventilación y las renovaciones de aire por hora (ASHRAE 62.1).</li>
          </ul>
        </section>

        {/* SISMO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Cortante basal sísmico (INPRES-CIRSOC 103)</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            El cortante en la base se estima por el método espectral de fuerza lateral equivalente (análogo al
            método estático de INPRES-CIRSOC 103:2013):
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: GOLD, marginBottom: 16, lineHeight: 1.8 }}>
            T = Ct · hn^0.75<br />
            Sa = a0 · S · η&nbsp;&nbsp;(o · Tc/T si T &gt; Tc)<br />
            Cs = máx(Sa/R, a0/R)&nbsp;&nbsp;·&nbsp;&nbsp;V = Cs · W
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>a0</strong>: aceleración máxima del suelo por zona sísmica (Mapa de Zonificación Sísmica INPRES, zonas 0 a 4); <strong style={{ color: '#f1f5f9' }}>S</strong>: factor de amplificación de suelo.</li>
            <li><strong style={{ color: '#f1f5f9' }}>R</strong>: factor de reducción por ductilidad; <strong style={{ color: '#f1f5f9' }}>W</strong>: peso sísmico total. El resultado es preliminar: la determinación definitiva requiere análisis modal espectral por profesional habilitado.</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li>ASCE 7-22 Cap. 27 y CIRSOC 102 — carga de viento.</li>
            <li>IRAM 11601, ASHRAE 62.1 y ASHRAE 90.1 — iluminación natural y ventilación.</li>
            <li>INPRES-CIRSOC 103:2013 — cortante basal por fuerza lateral equivalente (método estático).</li>
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
            <a href="/modulos/civil" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Ingeniería Civil →</a>
            <a href="/modulos/mmo" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>MMO — Maestro Mayor de Obra →</a>
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
