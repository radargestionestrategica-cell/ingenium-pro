import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Telemetría de activos con predicción de falla de taludes Fukuzono online — INGENIUM PRO',
  description:
    'Módulo de telemetría de activos geotécnicos: carga de lecturas de campo (nivel y desplazamiento superficial), ' +
    'Factor de Seguridad de talud automático por Bishop simplificado con búsqueda del círculo crítico, predicción ' +
    'de fecha de falla por velocidad inversa de Fukuzono (1985) con su advertencia de aplicabilidad, e informes ' +
    'sellados con hash SHA-256 y QR de verificación pública.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/telemetria',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

export default function ModuloTelemetriaPage() {
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
            Módulo Telemetría
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Telemetría de activos con predicción de falla de taludes Fukuzono online
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cargá lecturas de campo de tus activos geotécnicos (piletas, taludes, terraplenes) y obtené en cada
            lectura el Factor de Seguridad del talud por Bishop simplificado, con búsqueda automática del círculo
            de falla crítico, y una predicción temprana de la fecha de falla a partir de la velocidad de
            desplazamiento superficial, con informe sellado y verificable.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El módulo registra dos tipos de <strong style={{ color: '#f1f5f9' }}>lecturas de campo</strong> por
            activo: el <strong style={{ color: '#f1f5f9' }}>nivel medido</strong> (metros) y el{' '}
            <strong style={{ color: '#f1f5f9' }}>desplazamiento superficial</strong> (milímetros) con su fecha.
            Cada lectura queda archivada en el historial del activo con su sello criptográfico.
          </p>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            A partir del nivel medido, el material del suelo (cohesión, ángulo de fricción, peso específico) y la
            geometría del talud, el motor de cálculo recorre una grilla de centros y radios de círculo de falla,
            calcula el <strong style={{ color: '#f1f5f9' }}>Factor de Seguridad</strong> de cada uno por el método
            simplificado de Bishop sobre 20 dovelas, y refina la búsqueda alrededor del mínimo para reportar el
            círculo más crítico. Opcionalmente incorpora un coeficiente sísmico pseudoestático (kh) según la zona
            sísmica configurada para el activo, reportando también el FS sísmico.
          </p>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            A partir de la serie de lecturas de desplazamiento superficial, el módulo estima una{' '}
            <strong style={{ color: '#f1f5f9' }}>fecha probable de falla del talud</strong> por el método de
            velocidad inversa de Fukuzono (1985): ajusta una recta a la inversa de la velocidad de desplazamiento
            en el tramo final de la serie y proyecta el punto donde esa recta cruza cero.
          </p>
        </section>

        {/* FÓRMULAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Fórmulas aplicadas</h2>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 10 }}>
            <strong style={{ color: '#f1f5f9' }}>Factor de Seguridad del talud</strong> — método simplificado de Bishop (1955):
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            FS = Σ[(c·b + (W − u·b)·tan(φ)) / mα] / Σ[W·sin(α) + kh·W·(brazo/R)]
          </div>
          <ul style={{ fontSize: 14, color: LIGHT, lineHeight: 2, paddingLeft: 20, marginBottom: 24 }}>
            <li><strong style={{ color: '#f1f5f9' }}>c, φ</strong>: cohesión (kPa) y ángulo de fricción interna del suelo (grados).</li>
            <li><strong style={{ color: '#f1f5f9' }}>W, u</strong>: peso de cada dovela y presión de poros en su base, según el nivel medido en la lectura.</li>
            <li><strong style={{ color: '#f1f5f9' }}>mα</strong>: factor de corrección de Bishop, resuelto por iteración hasta converger (tolerancia 0.001).</li>
            <li><strong style={{ color: '#f1f5f9' }}>kh</strong>: coeficiente sísmico pseudoestático opcional, calculado a partir de la PGA de la zona sísmica del activo.</li>
          </ul>

          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 10 }}>
            <strong style={{ color: '#f1f5f9' }}>Predicción de falla</strong> — velocidad inversa de Fukuzono (1985):
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 14, color: GOLD, marginBottom: 16 }}>
            1/v = a + b·t  →  t_falla = −a / b
          </div>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            La velocidad de desplazamiento (v) entre lecturas consecutivas se suaviza por media móvil de 3 puntos.
            Se identifica el tramo final donde la velocidad crece de forma consecutiva y se ajusta por mínimos
            cuadrados una recta a la inversa de esa velocidad en función del tiempo. La fecha de falla es el punto
            donde esa recta corta el eje del tiempo. El método sólo reporta una fecha estimada cuando hay al menos
            5 lecturas totales y un tramo de al menos 3 puntos con velocidad acelerante y pendiente negativa; en
            cualquier otro caso el resultado es &quot;datos insuficientes&quot; o &quot;sin tendencia de falla
            detectable&quot;.
          </p>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Método de Bishop simplificado (1955) para el Factor de Seguridad del talud, análisis pseudoestático
            USACE EM 1110-2-1902 para el coeficiente sísmico, y método de velocidad inversa de Fukuzono (1985)
            &quot;A new method for predicting the failure time of a slope&quot; para la predicción de fecha de
            falla.
          </p>
        </section>

        {/* ADVERTENCIA DE APLICABILIDAD */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Advertencia de aplicabilidad</h2>
          <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid #dc2626', borderRadius: 8, padding: 18 }}>
            <p style={{ fontSize: 14, color: '#f87171', lineHeight: 1.8, margin: 0, fontWeight: 700 }}>
              La predicción de falla por velocidad inversa de Fukuzono sólo es válida cuando el desplazamiento
              superficial muestra una tendencia acelerante sostenida. Con datos insuficientes, desplazamiento
              estable o desacelerante, el módulo no reporta una fecha de falla. La fecha estimada es una
              proyección estadística sobre la tendencia observada, no una certeza, y en ningún caso reemplaza el
              monitoreo instrumental continuo ni el criterio de un profesional habilitado.
            </p>
          </div>
        </section>

        {/* EXPORTACIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Informe sellado y exportación</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Cada lectura queda archivada en el historial del activo con un sello SHA-256 verificable, y se puede
            exportar como PDF con código QR de verificación pública o como planilla Excel con la serie completa de
            lecturas, el Factor de Seguridad y el estado de la predicción de falla.
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
            <a href="/modulos/mineria" style={{ display: 'block', background: PANEL, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textDecoration: 'none', color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Minería →</a>
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
