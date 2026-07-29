import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora de perforación online — BHP, gradiente de fractura y reología API RP 13D — INGENIUM PRO',
  description:
    'Calculadora de perforación online: presión de fondo (BHP), gradiente de fractura (Eaton), peso de lodo ' +
    'y ECD, y reología del lodo (Bingham, Power Law, Herschel-Bulkley) según API RP 13D, con verificación de ' +
    'limpieza del pozo, informe PDF sellado, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/perforacion',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloPerforacionPage() {
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
            Módulo Perforación
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calculadora de perforación online: BHP, gradiente de fractura y reología
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo normativo de perforación: presión de fondo, ventana de lodo, densidad equivalente de
            circulación y reología del fluido según API RP 13D, con informe sellado y verificable.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El módulo reúne los cálculos de hidráulica de perforación: presión hidrostática de fondo (BHP),
            gradiente de fractura de la formación, peso de lodo y densidad equivalente de circulación (ECD), y la
            reología del fluido con la verificación de limpieza del pozo. Cada cálculo parte de los datos del pozo
            (profundidad, densidad de lodo, gradientes, lecturas del viscosímetro, caudal y geometría) y devuelve
            el resultado con la referencia normativa aplicada y un semáforo de riesgo.
          </p>
        </section>

        {/* BHP / FRACTURA / ECD */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Presión de fondo, fractura y ECD</h2>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: GOLD, marginBottom: 16, lineHeight: 1.8 }}>
            BHP = 0.052 · MW · TVD<br />
            G_frac = (ν / (1 − ν)) · (G_ob − 0.433) + 0.433<br />
            ECD = MW + ΔP_anular / 0.052
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>BHP</strong>: presión hidrostática de fondo (psi), con MW en ppg y TVD en pies (0.052 = constante de conversión de campo).</li>
            <li><strong style={{ color: '#f1f5f9' }}>Gradiente de fractura</strong>: método de Eaton (1969), con ν el módulo de Poisson y 0.433 psi/ft el gradiente del agua dulce.</li>
            <li><strong style={{ color: '#f1f5f9' }}>ECD</strong>: densidad equivalente de circulación, que suma la pérdida de presión anular al peso de lodo estático.</li>
          </ul>
        </section>

        {/* REOLOGÍA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Reología del lodo (API RP 13D)</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            A partir de las lecturas del viscosímetro (R600, R300, R6, R3) el módulo caracteriza el fluido con
            tres modelos reológicos según API RP 13D:
          </p>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Bingham Plastic</strong>: VP = R600 − R300; YP = R300 − VP.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Power Law</strong>: n = 0.5·log₁₀(R300/R3); k = 5.11·R300 / 511ⁿ.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Herschel-Bulkley</strong>: τy = 2·R3 − R6; n = 3.32·log₁₀((R600−τy)/(R300−τy)); k = (R300−τy) / 511ⁿ.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Limpieza del pozo</strong>: velocidad de deslizamiento de recortes por la correlación de Moore (1974) y concentración de recortes en el anular (CCA).</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas y referencias aplicadas</h2>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li>API RP 13D — reología del fluido de perforación e hidráulica del pozo.</li>
            <li>API RP 7G — sarta de perforación.</li>
            <li>Eaton (1969), Journal of Petroleum Technology — gradiente de fractura.</li>
            <li>Moore (1974), Drilling Practices Manual — velocidad de deslizamiento de recortes.</li>
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
            <a href="/modulos/petroleo-gas" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Petróleo &amp; Gas — MAOP →</a>
            <a href="/modulos/canerias" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Cañerías &amp; Integridad →</a>
            <a href="/modulos/valvulas" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Válvulas Industriales →</a>
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
