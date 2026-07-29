import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RMR Bieniawski y ventilación subterránea — INGENIUM PRO',
  description:
    'Clasificación geomecánica RMR de Bieniawski (1989) y ventilación subterránea según DS 024-2016-EM ' +
    '(Perú) y DS 132 (Chile). Informe PDF sellado, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/mineria',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloMineriaPage() {
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
            Módulo Minería
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calculadora de minería online: RMR de Bieniawski y ventilación subterránea
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo normativo para minería subterránea: clasificación geomecánica del macizo rocoso con el
            sistema RMR de Bieniawski y verificación de ventilación de galerías, con informe sellado y
            verificable.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El módulo reúne dos cálculos de minería subterránea: la clasificación geomecánica del macizo rocoso
            por el sistema RMR y la verificación de ventilación de galerías. Cada cálculo parte de los datos de
            campo (parámetros del macizo, número de trabajadores, potencia diésel, dimensiones de la galería) y
            devuelve el resultado con la referencia normativa aplicada y un semáforo de verificación.
          </p>
        </section>

        {/* RMR */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Clasificación geomecánica RMR</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            El índice RMR (Rock Mass Rating) se calcula según Bieniawski (1989) como la suma de seis parámetros
            del macizo rocoso más el ajuste por orientación de discontinuidades:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            RMR = P1 + P2 + P3 + P4 + P5 + ajuste de orientación (escala 0–100)
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>Parámetros</strong>: resistencia de la roca, RQD, espaciado de discontinuidades, condición y estado de las discontinuidades, y presencia de agua.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Clases</strong>: I (81–100, muy buena) a V (&lt;21, muy mala), cada una con su tiempo de auto-sostenimiento y tipo de sostenimiento recomendado.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Referencia</strong>: método de Bieniawski (1989), en el marco de la ISRM (International Society for Rock Mechanics).</li>
          </ul>
        </section>

        {/* VENTILACIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ventilación subterránea</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            La ventilación de galerías se verifica a partir de la velocidad de aire y el caudal requerido según
            los reglamentos de seguridad minera de Perú y Chile:
          </p>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li><strong style={{ color: '#f1f5f9' }}>DS 024-2016-EM (Perú)</strong>: velocidad de aire mínima 20 m/min (0.33 m/s), y 25 m/min cuando se usa ANFO en el frente activo.</li>
            <li><strong style={{ color: '#f1f5f9' }}>DS 132 (Chile)</strong>: caudal mínimo de 3 m³/min por persona más 3 m³/min por HP diésel.</li>
            <li><strong style={{ color: '#f1f5f9' }}>Monóxido de carbono</strong>: límite 25 ppm TWA según ACGIH TLV, adoptado por el DS 024; IDLH 1200 ppm según NIOSH, con evacuación inmediata al alcanzarlo.</li>
          </ul>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li>Bieniawski (1989) — sistema de clasificación RMR; ISRM — marco de referencia geomecánico.</li>
            <li>DS 024-2016-EM (Perú) — velocidad de aire mínima 20 m/min (0.33 m/s), 25 m/min con ANFO.</li>
            <li>DS 132 (Chile) — caudal mínimo 3 m³/min por persona más 3 m³/min por HP diésel.</li>
            <li>ACGIH TLV (adoptado por DS 024) — CO 25 ppm TWA; NIOSH — IDLH 1200 ppm.</li>
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
            <a href="/modulos/geotecnia" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Geotecnia — Estabilidad de taludes →</a>
            <a href="/modulos/telemetria" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Telemetría de activos →</a>
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
