import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calibración de termocupla y RTD online — INGENIUM PRO',
  description:
    'Linealización de termocupla Tipo K y J (NIST ITS-90), RTD Pt100 y Pt1000 (Callendar-Van Dusen, IEC ' +
    '60751:2022) y verificación de clase de tolerancia de fábrica (IEC 60584-1 / IEC 60751:2022). ' +
    'Informe PDF sellado y Excel.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/instrumentacion',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Calibración de termocupla y RTD online — INGENIUM PRO',
  description:
    'Linealización de termocupla Tipo K y J (NIST ITS-90), RTD Pt100 y Pt1000 (Callendar-Van Dusen, IEC ' +
    '60751:2022) y verificación de clase de tolerancia de fábrica (IEC 60584-1 / IEC 60751:2022). ' +
    'Informe PDF sellado y Excel.',
  url: 'https://ingeniumpro.store/modulos/instrumentacion',
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

export default function ModuloInstrumentacionPage() {
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
            Módulo Electrónica e Instrumentación
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calibración de termocuplas y RTD online: linealización y verificación de tolerancia
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Convierte la señal cruda de un sensor de temperatura (milivoltios de termocupla u ohms de RTD) en
            grados Celsius por los polinomios y ecuaciones normalizadas, y verifica si la lectura cae dentro de
            la clase de tolerancia de fábrica del sensor, con informe sellado y verificable.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El módulo reúne tres capacidades de instrumentación: la linealización de termocupla Tipo K y Tipo J,
            la linealización de RTD Pt100 y Pt1000, y la verificación de la clase de tolerancia de fábrica del
            sensor contra una temperatura de referencia. Cada cálculo devuelve el resultado con la norma aplicada
            y, cuando corresponde, un indicador de dentro/fuera de rango o de tolerancia.
          </p>
        </section>

        {/* TERMOCUPLA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Termocupla Tipo K y Tipo J (NIST ITS-90)</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            La señal medida en milivoltios se convierte a temperatura con el polinomio inverso de la escala
            NIST ITS-90:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            t90 = Σ dᵢ·Eⁱ&nbsp;&nbsp;(i = 0..9, E en mV)
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Tipo K</strong> (Cromel/Alumel): rango 0°C a 500°C.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Tipo J</strong> (Hierro/Constantán): rango 0°C a 760°C.</li>
            <li>El resultado indica si la temperatura calculada cae dentro del rango válido del polinomio para ese tipo.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Referencia</strong>: NIST ITS-90 Thermocouple Database.</li>
          </ul>
        </section>

        {/* RTD */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>RTD Pt100 y Pt1000 (Callendar-Van Dusen)</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            La resistencia medida en ohms se convierte a temperatura con la ecuación de Callendar-Van Dusen de
            IEC 60751:2022. Para temperatura positiva o cero se resuelve en forma cerrada; para temperatura
            negativa se agrega el término cúbico y se resuelve por iteración:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            R = R0·(1 + A·T + B·T²)&nbsp;&nbsp;·&nbsp;&nbsp;T&lt;0: + C·(T−100)·T³, Newton-Raphson a 0.001°C
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>R0</strong>: resistencia a 0°C — 100 Ω (Pt100) o 1000 Ω (Pt1000), misma curva α=0.00385 para ambas.</li>
            <li>Rango de validez: -200°C a 850°C.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Referencia</strong>: IEC 60751:2022 — Callendar-Van Dusen.</li>
          </ul>
        </section>

        {/* TOLERANCIA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Verificación de clase de tolerancia de fábrica</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            A partir de una temperatura esperada (de referencia) y la temperatura medida, el módulo calcula la
            banda de tolerancia permitida por la clase del sensor y determina si la desviación cae dentro de
            esa banda.
          </p>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Termocupla — IEC 60584-1</strong>: Clase 1 ±1.5°C hasta 375°C, luego ±0.004·|t|; Clase 2 ±2.5°C hasta 333°C, luego ±0.0075·|t|.</li>
            <li><strong style={{ color: '#f1f5f9' }}>RTD — IEC 60751:2022</strong>: Clase AA ±(0.10 + 0.0017·|t|), Clase A ±(0.15 + 0.002·|t|), Clase B ±(0.30 + 0.005·|t|), Clase C ±(0.60 + 0.01·|t|).</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li>NIST ITS-90 Thermocouple Database — linealización termocupla Tipo K y Tipo J.</li>
            <li>IEC 60751:2022 — linealización RTD Pt100/Pt1000 y su clase de tolerancia.</li>
            <li>IEC 60584-1 — clase de tolerancia de termocupla.</li>
          </ul>
        </section>

        {/* EXPORTACIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Informe sellado y exportación</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Cada cálculo se puede exportar como PDF sellado con hash SHA-256 y código QR de verificación pública,
            y como planilla Excel con parámetros y resultados.
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
            <a href="/modulos/electricidad" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Electricidad →</a>
            <a href="/modulos/termica" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Térmica →</a>
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
