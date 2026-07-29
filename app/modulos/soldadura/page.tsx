import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cálculo de soldadura AWS D1.1 y ASME IX online — INGENIUM PRO',
  description:
    'Calculadora online de soldadura metalúrgica: selector de electrodo AWS A5.1, calor aportado (heat input) ' +
    'según ASME Sec. IX / AWS D1.1 §6.8.5, resistencia de filete AWS D1.1 / AISC-360 y carbono equivalente con ' +
    'temperatura de precalentamiento según AWS D1.1 y API 1104, informe PDF sellado con hash SHA-256 y QR de ' +
    'verificación pública, más exportación Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/soldadura',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloSoldaduraPage() {
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
            Módulo Soldadura Metalúrgica
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Cálculo de soldadura AWS D1.1 y ASME IX online
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo normativo de soldadura para petróleo, perforación, minería y MMO: seleccioná el electrodo
            correcto, verificá el calor aportado, dimensioná un filete y determiná la temperatura de
            precalentamiento, con informe sellado y verificable, en un flujo de trabajo profesional.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El módulo reúne siete herramientas de soldadura metalúrgica. Un <strong style={{ color: '#f1f5f9' }}>selector
            de electrodo</strong> que recomienda electrodos AWS A5.1/A5.4/A5.18 según industria, material base,
            posición de soldadura y condición del metal (limpio o con óxido/pintura), con fichas técnicas de
            tracción, corriente, posiciones y rango de amperaje por diámetro. Una tabla de{' '}
            <strong style={{ color: '#f1f5f9' }}>aceros especiales</strong> por industria (ASTM A36, API 5L X52/X65,
            A572 Gr.50, AR400, A514) con su carbono equivalente y precalentamiento mínimo.
          </p>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            Un cálculo de <strong style={{ color: '#f1f5f9' }}>calor aportado (heat input)</strong> a partir de
            voltaje, corriente, velocidad de avance y proceso de soldadura, con clasificación de rango óptimo.
            Un dimensionamiento de <strong style={{ color: '#f1f5f9' }}>soldadura de filete</strong> que calcula la
            garganta efectiva y la resistencia nominal, y valida el tamaño mínimo exigido por AWS D1.1 según el
            espesor del material. Una estimación de <strong style={{ color: '#f1f5f9' }}>consumo de electrodos</strong>{' '}
            (metal depositado, electrodo a consumir, varillas y pasadas necesarias). Y un cálculo de{' '}
            <strong style={{ color: '#f1f5f9' }}>carbono equivalente y temperatura de precalentamiento</strong> a
            partir de la composición química del acero, con fórmula IIW o AWS D1.1 a elección.
          </p>
        </section>

        {/* FÓRMULAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Fórmulas aplicadas</h2>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 10 }}>
            <strong style={{ color: '#f1f5f9' }}>Calor aportado (Heat Input)</strong> — ASME Sec. IX / AWS D1.1 §6.8.5:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            HI (kJ/mm) = (V × I × 60 × η) / (v × 1000)
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20, marginBottom: 24 }}>
            <li><strong style={{ color: '#f1f5f9' }}>V, I</strong>: voltaje del arco (V) y corriente (A).</li>
            <li><strong style={{ color: '#f1f5f9' }}>v</strong>: velocidad de avance (mm/min).</li>
            <li><strong style={{ color: '#f1f5f9' }}>η</strong>: eficiencia térmica del proceso — 0.80 SMAW, 0.90 GMAW, 0.70 GTAW, 0.85 FCAW, 1.00 SAW.</li>
          </ul>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 10 }}>
            <strong style={{ color: '#f1f5f9' }}>Resistencia de filete</strong> — AWS D1.1:2020 / AISC-360:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            a = 0.707 × w<br />
            Rn = 0.707 × a × L × 0.6 × Fu
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20, marginBottom: 24 }}>
            <li><strong style={{ color: '#f1f5f9' }}>w</strong>: tamaño de filete (mm), verificado contra el mínimo de la Tabla 8.8 de AWS D1.1 según el espesor de la pieza más gruesa.</li>
            <li><strong style={{ color: '#f1f5f9' }}>L</strong>: longitud de la soldadura (mm).</li>
            <li><strong style={{ color: '#f1f5f9' }}>Fu</strong>: resistencia de ruptura del electrodo (kgf/cm²), según ficha AWS A5.1.</li>
          </ul>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 10 }}>
            <strong style={{ color: '#f1f5f9' }}>Carbono equivalente (CE) y precalentamiento</strong> — AWS D1.1 Tabla 4.2:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            CE (IIW) = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15<br />
            CE (AWS D1.1) = C + (Mn+Si)/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15
          </div>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Según el CE obtenido y el espesor del material, el módulo asigna uno de los cinco grupos de
            precalentamiento de AWS D1.1 y la temperatura mínima entre pasadas correspondiente.
          </p>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            AWS A5.1 (electrodos SMAW), AWS A5.4 (electrodos de acero inoxidable), AWS A5.18 (electrodos GMAW),
            AWS D1.1:2020 (Structural Welding Code — Steel), ASME Sección IX (calificación de procedimientos de
            soldadura), API 1104:2021 (soldadura de cañerías) y AISC-360 (diseño de conexiones soldadas).
          </p>
        </section>

        {/* EJEMPLO NUMÉRICO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ejemplo numérico</h2>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Heat input con proceso SMAW (η = 0.80), voltaje 22 V, corriente 150 A, avance 100 mm/min:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9, marginBottom: 24 }}>
            HI = (22 × 150 × 60 × 0.80) / (100 × 1000)<br />
            <span style={{ color: GOLD }}>HI ≈ 1.584 kJ/mm</span> → rango medio, óptimo para la mayoría de los aceros
          </div>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Filete de w = 6 mm sobre pieza de 10 mm de espesor, longitud 100 mm, electrodo E7018 (Fu = 4920 kgf/cm²):
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9, marginBottom: 24 }}>
            Filete mínimo AWS D1.1 (Tabla 8.8) para t=10mm → 5 mm — 6 mm cumple<br />
            a = 0.707 × 6 = 4.24 mm<br />
            <span style={{ color: GOLD }}>Rn ≈ 12.522 kgf ≈ 122.8 kN</span>
          </div>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Carbono equivalente (IIW) para acero con C=0.20%, Mn=1.00%, resto de aleantes 0%, espesor 20 mm:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9 }}>
            CE = 0.20 + 1.00/6 + 0/5 + 0/15<br />
            <span style={{ color: GOLD }}>CE ≈ 0.367</span> → Grupo II (CE moderado) — precalentar a 65 °C, entre pasadas 65-230 °C
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
            <a href="/modulos/civil" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Ingeniería Civil →</a>
            <a href="/modulos/arquitectura" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Arquitectura Técnica →</a>
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
