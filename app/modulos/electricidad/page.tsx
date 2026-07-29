import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ampacidad, caída de tensión y cortocircuito — INGENIUM PRO',
  description:
    'Calibre por ampacidad NEC Tabla 310.16, caída de tensión IEC 60364-5-52, cortocircuito IEC 60909-0 ' +
    'y áreas peligrosas IEC 60079-10-1. PDF sellado, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/electricidad',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloElectricidadPage() {
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
            Módulo Electricidad
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Calculadora eléctrica online: ampacidad, caída de tensión y cortocircuito
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cálculo eléctrico normativo para instalaciones industriales: selección de calibre de conductor,
            verificación de caída de tensión, corriente de cortocircuito y clasificación de áreas peligrosas,
            con informe sellado y verificable.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El módulo reúne cuatro cálculos de una instalación eléctrica de baja y media tensión: selección de
            calibre de cable por ampacidad, verificación de caída de tensión, corriente de cortocircuito y
            clasificación de áreas peligrosas. Cada cálculo parte de los datos de la instalación (corriente de
            diseño, longitud, tensión, potencia del transformador, tipo de atmósfera) y devuelve el resultado con
            la referencia normativa aplicada y un semáforo de riesgo.
          </p>
        </section>

        {/* AMPACIDAD */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Selección de calibre por ampacidad</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            La ampacidad admisible del conductor se toma de la Tabla 310.16 del NEC (conductores a 75 °C en
            conduit) y se ajusta con los factores de corrección de temperatura ambiente y de agrupamiento de
            NEC 310.15(B) y NEC 310.15(C). El módulo selecciona el calibre cuya ampacidad corregida es mayor o
            igual a la corriente de diseño.
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD }}>
            I_admisible × f_temp × f_agrup ≥ I_diseño
          </div>
        </section>

        {/* CAÍDA DE TENSIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Caída de tensión</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            La caída de tensión se calcula a partir de la resistividad del conductor, la longitud del circuito y
            la corriente, y se compara con los límites recomendados. El NEC 210.19(A) trata el 3% / 5% como Nota
            Informativa 4 (recomendación, no requisito). La IEC 60364-5-52 Anexo G recomienda 3% para iluminación
            y 5% para otros usos. En Argentina, la AEA 90364-7-771 cláusula 771.13.b establece límites
            obligatorios: 3% para iluminación, 5% para motores en régimen y 15% en arranque.
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD }}>
            ΔV% = (√3 × I × L × (R·cosφ + X·senφ)) / V_nom × 100
          </div>
        </section>

        {/* CORTOCIRCUITO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Corriente de cortocircuito</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            La corriente de cortocircuito trifásica se calcula según el método de la IEC 60909-0:2016, a partir
            de la tensión nominal y la impedancia total del circuito hasta el punto de falla.
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD }}>
            Ik&quot; = c × Un / (√3 × Zk)
          </div>
          <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.7, marginTop: 12 }}>
            Donde c es el factor de tensión (1.0–1.1), Un la tensión nominal y Zk la impedancia total de
            cortocircuito.
          </p>
        </section>

        {/* ÁREAS PELIGROSAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Clasificación de áreas peligrosas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            El módulo orienta la clasificación de áreas con atmósferas explosivas según la IEC 60079-10-1 (Zonas
            0, 1 y 2) y la API RP 500 4a ed. 2023 (Divisiones 1 y 2). Las Divisiones 1 y 2 se definen en el
            NEC 500.5(B). La clasificación definitiva requiere un estudio de riesgo firmado por un profesional
            habilitado; este cálculo es orientativo.
          </p>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20 }}>
            <li>NEC Tabla 310.16 con correcciones de NEC 310.15(B) y NEC 310.15(C) — ampacidad del conductor.</li>
            <li>NEC 210.19(A) Nota Informativa 4 e IEC 60364-5-52 Anexo G (3% / 5%) — caída de tensión recomendada.</li>
            <li>AEA 90364-7-771 cláusula 771.13.b (3% iluminación, 5% motores en régimen, 15% en arranque) — obligatoria en Argentina.</li>
            <li>IEC 60909-0:2016 — corriente de cortocircuito.</li>
            <li>IEC 60079-10-1 y API RP 500 4a ed. 2023, con Divisiones 1 y 2 definidas en NEC 500.5(B) — áreas peligrosas.</li>
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
            <a href="/modulos/arquitectura" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Arquitectura Técnica →</a>
            <a href="/modulos/soldadura" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Soldadura →</a>
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
