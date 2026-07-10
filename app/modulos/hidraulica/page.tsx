import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cálculo de golpe de ariete y pérdida de carga online — INGENIUM PRO',
  description:
    'Cálculo normativo de hidráulica de cañerías: pérdida de carga por fricción con Darcy-Weisbach y ' +
    'Swamee-Jain (aproximación de Colebrook-White), y sobrepresión transitoria por golpe de ariete según ' +
    'Joukowsky (1898) y AWWA M11. Informe PDF sellado con hash SHA-256 y QR de verificación pública, más ' +
    'exportación Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/hidraulica',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloHidraulicaPage() {
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
            Módulo Hidráulica
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Cálculo de golpe de ariete y pérdida de carga online
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo normativo de hidráulica: obtené la pérdida de carga por fricción de una cañería a presión
            y la sobrepresión transitoria por golpe de ariete ante un cierre de válvula, con informe sellado
            y verificable, en un flujo de trabajo profesional.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El módulo tiene dos cálculos. El primero obtiene la pérdida de carga hidráulica (Darcy-Weisbach) de
            una cañería a partir del caudal, el diámetro interno, la longitud, el material (rugosidad) y el
            coeficiente de pérdidas menores, determinando velocidad, número de Reynolds, régimen de flujo,
            factor de fricción y caída de presión total. El segundo calcula la sobrepresión transitoria por
            golpe de ariete (Joukowsky) ante un cambio brusco de velocidad, a partir del diámetro, espesor,
            longitud, módulo de elasticidad del material y variación de velocidad, obteniendo la celeridad de
            onda, la sobrepresión y el tiempo crítico de cierre de válvula.
          </p>
        </section>

        {/* FÓRMULAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Fórmulas aplicadas</h2>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            Pérdida de carga por fricción (Darcy-Weisbach), con el factor de fricción resuelto por la
            aproximación explícita de Swamee-Jain a Colebrook-White:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            hf = f × (L / D) × V² / (2g)
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20, marginBottom: 24 }}>
            <li><strong style={{ color: '#f1f5f9' }}>f</strong>: factor de fricción de Darcy, función del número de Reynolds y la rugosidad relativa.</li>
            <li><strong style={{ color: '#f1f5f9' }}>L / D</strong>: longitud de la cañería sobre su diámetro interno.</li>
            <li><strong style={{ color: '#f1f5f9' }}>V</strong>: velocidad media del flujo.</li>
            <li><strong style={{ color: '#f1f5f9' }}>g</strong>: aceleración de la gravedad (9.81 m/s²).</li>
          </ul>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            Sobrepresión por golpe de ariete (ecuación de Joukowsky):
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            ΔP = ρ × a × ΔV
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>ρ</strong>: densidad del fluido (998 kg/m³ para agua).</li>
            <li><strong style={{ color: '#f1f5f9' }}>a</strong>: celeridad de la onda de presión, según el módulo de compresibilidad del fluido y la elasticidad de la cañería (diámetro, espesor y módulo de Young del material).</li>
            <li><strong style={{ color: '#f1f5f9' }}>ΔV</strong>: variación de velocidad del flujo por el cierre de válvula.</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            AWWA M11 para diseño hidráulico de cañerías a presión, Darcy-Weisbach con la aproximación de
            Swamee-Jain a Colebrook-White para el factor de fricción, y Joukowsky (1898) para la sobrepresión
            transitoria por golpe de ariete.
          </p>
        </section>

        {/* EJEMPLO NUMÉRICO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ejemplo numérico</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Pérdida de carga con caudal Q = 80 L/s, diámetro interno D = 300 mm, longitud L = 500 m, acero
            comercial (rugosidad 0.046 mm) y coeficiente de pérdidas menores K = 0.5:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9, marginBottom: 20 }}>
            V ≈ 1.13 m/s · Re ≈ 338 200 (turbulento) · f ≈ 0.0157<br />
            <span style={{ color: GOLD }}>hf ≈ 1.74 m ≈ 0.17 bar de caída de presión — SEGURO</span>
          </div>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Golpe de ariete con el mismo diámetro D = 300 mm, espesor t = 8 mm, longitud L = 500 m, acero
            (E = 200 GPa) y un cambio de velocidad ΔV = 1.5 m/s:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9 }}>
            a ≈ 1249 m/s · ΔP = 998 × 1249 × 1.5<br />
            <span style={{ color: GOLD }}>ΔP ≈ 1.87 MPa ≈ 18.71 bar · Tc ≈ 0.80 s — REVISAR</span>
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
