import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora MAOP ASME B31.8 online — INGENIUM PRO',
  description:
    'Calculadora online de MAOP (Máxima Presión Operativa Admisible) para cañerías de petróleo y gas: ' +
    'cálculo normativo de petróleo y gas según ASME B31.8 §841.11, fórmula de Barlow, materiales API 5L, ' +
    'informe PDF sellado con hash SHA-256 y QR de verificación pública, más exportación Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/petroleo-gas',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloPetroleoGasPage() {
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
            Módulo Petróleo &amp; Gas
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calculadora MAOP ASME B31.8 online
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo normativo de petróleo y gas: obtené la Máxima Presión Operativa Admisible (MAOP) de una
            cañería según ASME B31.8 §841.11, con informe sellado y verificable, en un flujo de trabajo profesional.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El módulo calcula la MAOP de una cañería de acero a partir del diámetro exterior, el espesor de pared,
            el grado de material (API 5L), la clase de ubicación, el tipo de junta longitudinal y la temperatura
            de operación. Según la relación espesor/diámetro (t/OD), aplica automáticamente el régimen que
            corresponde: fórmula de Barlow para pared delgada (t/OD ≤ 10%), una interpolación lineal en la zona
            de transición (10%–15%), o la fórmula de Lamé para pared gruesa (t/OD &gt; 15%) como criterio
            conservador adicional, fuera del alcance estricto de B31.8.
          </p>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El resultado se expresa en MPa, bar y psi, junto con la relación t/OD, el régimen de cálculo aplicado
            y un semáforo de riesgo operativo.
          </p>
        </section>

        {/* FÓRMULA DE BARLOW */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Fórmula de Barlow aplicada</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            Para pared delgada, la MAOP se calcula con la fórmula de Barlow modificada de ASME B31.8:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            Pb = (2 × SMYS × t × F × E × T) / OD
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>SMYS</strong>: tensión mínima de fluencia especificada del material (MPa), según grado API 5L (X42 a X80).</li>
            <li><strong style={{ color: '#f1f5f9' }}>t</strong>: espesor de pared de la cañería (mm).</li>
            <li><strong style={{ color: '#f1f5f9' }}>F</strong>: factor de diseño según clase de ubicación — de 0.72 en zona rural (Clase 1) a 0.40 en zonas de alta densidad (Clase 4).</li>
            <li><strong style={{ color: '#f1f5f9' }}>E</strong>: factor de eficiencia de junta longitudinal — 1.00 para cañería sin costura o ERW posterior a 1970, 0.80 para ERW anterior a 1970 o soldada en espiral.</li>
            <li><strong style={{ color: '#f1f5f9' }}>T</strong>: factor de reducción por temperatura de operación, según la Tabla 841.1.18-1 de ASME B31.8 (1.0 hasta 120 °C, decreciente por encima).</li>
            <li><strong style={{ color: '#f1f5f9' }}>OD</strong>: diámetro exterior de la cañería (mm).</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            ASME B31.8 Sec. 841.11 (fórmula de presión de diseño), Tabla 841.1.18-1 de ASME B31.8 (factor de
            reducción por temperatura) y materiales según API 5L. Para relaciones t/OD superiores al 15%, se
            suma la ecuación de Lamé como verificación conservadora adicional.
          </p>
        </section>

        {/* EJEMPLO NUMÉRICO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ejemplo numérico</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Cañería API 5L X65 (SMYS = 448 MPa), OD = 323.9 mm, espesor t = 9.5 mm, Clase 1 — zona rural
            (F = 0.72), junta ERW posterior a 1970 (E = 1.00), temperatura de operación 20 °C (T = 1.0):
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9 }}>
            t/OD = 9.5 / 323.9 = 2.93% → régimen pared delgada (Barlow)<br />
            Pb = (2 × 448 × 9.5 × 0.72 × 1.00 × 1.0) / 323.9<br />
            <span style={{ color: GOLD }}>MAOP ≈ 18.92 MPa ≈ 189.21 bar ≈ 2744 psi</span>
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
            <a href="/modulos/canerias" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Cañerías &amp; Integridad →</a>
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
