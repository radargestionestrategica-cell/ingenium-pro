import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora de represas online — vertedero Francis, filtración Darcy y estabilidad — INGENIUM PRO',
  description:
    'Calculadora de represas online: caudal de vertedero por fórmula de Francis (USACE EM 1110-2-1603), ' +
    'filtración por Ley de Darcy (USACE EM 1110-2-1901) y estabilidad de presa de gravedad ' +
    '(USACE EM 1110-2-2200), con informe PDF sellado, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/represas',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloRepresasPage() {
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
            Módulo Represas
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calculadora de represas online: vertedero, filtración y estabilidad
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo hidráulico y estructural para presas: caudal de vertedero por la fórmula de Francis,
            filtración por la Ley de Darcy y estabilidad de presa de gravedad, con informe sellado y verificable.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El módulo reúne tres cálculos de una presa: el caudal de vertedero, la filtración a través del cuerpo
            o la fundación, y la estabilidad de una presa de gravedad. Cada cálculo parte de los datos de la
            estructura (geometría, carga de agua, permeabilidad, pesos específicos, fricción en la base) y
            devuelve el resultado con la referencia normativa aplicada y un semáforo de riesgo.
          </p>
        </section>

        {/* VERTEDERO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Caudal de vertedero (Francis)</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            El caudal de descarga sobre el vertedero se calcula con la fórmula de Francis, donde el coeficiente
            empírico ya incorpora el efecto de la gravedad:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            Q = Cd · L · H^1.5
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Cd</strong>: coeficiente de descarga (valor habitual 1.84 para vertedero de cresta ancha).</li>
            <li><strong style={{ color: '#f1f5f9' }}>L</strong>: longitud del vertedero (m); <strong style={{ color: '#f1f5f9' }}>H</strong>: carga hidráulica sobre la cresta (m).</li>
            <li>Se obtiene además la velocidad y el número de Froude para clasificar el régimen (subcrítico, crítico o supercrítico).</li>
            <li><strong style={{ color: '#f1f5f9' }}>Referencia</strong>: USACE EM 1110-2-1603; caudal de diseño según ICOLD Bulletin 58.</li>
          </ul>
        </section>

        {/* FILTRACIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Filtración (Ley de Darcy)</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            El caudal de filtración por metro lineal se calcula con la Ley de Darcy a partir del gradiente
            hidráulico:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            i = H / L&nbsp;&nbsp;·&nbsp;&nbsp;q = k · i · d
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>i</strong>: gradiente hidráulico (adimensional); <strong style={{ color: '#f1f5f9' }}>k</strong>: permeabilidad (m/s); <strong style={{ color: '#f1f5f9' }}>d</strong>: espesor del estrato (m).</li>
            <li>El gradiente se compara contra un gradiente admisible de diseño, tomado con factor de seguridad 2 sobre el gradiente crítico de Terzaghi (aproximadamente 1.0).</li>
            <li><strong style={{ color: '#f1f5f9' }}>Referencia</strong>: USACE EM 1110-2-1901, Ley de Darcy y criterio de Terzaghi.</li>
          </ul>
        </section>

        {/* ESTABILIDAD */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Estabilidad de presa de gravedad</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            Para una sección triangular con cara vertical aguas arriba, el módulo calcula el empuje hidrostático,
            el peso propio, la subpresión (uplift) en la base, el factor de seguridad al deslizamiento, la
            excentricidad de la resultante y las tensiones en la base.
          </p>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Deslizamiento</strong>: FS mínimo 2.0 cuando la resultante cae en el tercio medio de la base (condición de carga usual, USACE EM 1110-2-2200 Tabla 4-1).</li>
            <li><strong style={{ color: '#f1f5f9' }}>Vuelco</strong>: se verifica por la ubicación de la resultante dentro de la base; el módulo además reporta un FS de vuelco como criterio conservador de plataforma, no como requisito de USACE.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Tensiones</strong>: se controla que la tensión mínima en la base no resulte de tracción (regla del tercio medio).</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li>USACE EM 1110-2-1603 e ICOLD Bulletin 58 — caudal de vertedero (Francis).</li>
            <li>USACE EM 1110-2-1901 y criterio de Terzaghi — filtración (Darcy), con gradiente admisible FS 2 sobre el crítico.</li>
            <li>USACE EM 1110-2-2200 — estabilidad de presa de gravedad, FS mínimo deslizamiento 2.0 con resultante en el tercio medio.</li>
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
            <a href="/modulos/vialidad" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Vialidad →</a>
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
