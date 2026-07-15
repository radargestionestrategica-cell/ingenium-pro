import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inteligencia Cruzada entre cálculos de ingeniería — INGENIUM PRO',
  description:
    'Motor de Inteligencia Cruzada: 10 reglas determinísticas que cruzan los cálculos guardados de distintos ' +
    'módulos de un mismo proyecto (MAOP, hidráulica, geotecnia, soldadura, estructuras, minería) y detectan ' +
    'riesgos combinados con normativa real citada — erosión-corrosión, SCC, deslizamiento, sifonamiento y más. ' +
    'Sin IA que invente valores: cada alerta traza a datos reales del historial.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/inteligencia-cruzada',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

const REGLAS: { id: string; titulo: string; normativa: string }[] = [
  { id: 'CRUCE-001', titulo: 'Erosión-corrosión: presión elevada + velocidad alta', normativa: 'API RP 14E, 5ª ed. (1991): V_e = C/√ρ_m' },
  { id: 'CRUCE-002', titulo: 'Golpe de ariete sobre cañería al límite de espesor', normativa: 'AWWA M11 · ASME B31.3 §302.2.4 · umbrales: criterio conservador de la plataforma' },
  { id: 'CRUCE-003', titulo: 'Riesgo SCC: servicio H₂S + Carbono Equivalente elevado en soldadura', normativa: 'NACE MR0175/ISO 15156-2:2020 cl. 7.3' },
  { id: 'CRUCE-004', titulo: 'Talud inestable próximo a excavación profunda', normativa: 'Práctica geotécnica estándar (FS mín. 1.5) · ISO 45001:2018 cláusula 8.1' },
  { id: 'CRUCE-005', titulo: 'Fundación al límite + columna con alta carga axial', normativa: 'ACI 318-19 §13.3 · CIRSOC 201-2005 §15' },
  { id: 'CRUCE-006', titulo: 'Roca muy fracturada + ventilación deficiente', normativa: 'DS 024-2016-EM (Perú): V_min = 0.33 m/s (20 m/min), 25 m/min con ANFO' },
  { id: 'CRUCE-007', titulo: 'Demanda sísmica alta: verificar elementos resistentes', normativa: 'INPRES-CIRSOC 103 Parte I (2013) · ASCE 7-22 §12.8' },
  { id: 'CRUCE-008', titulo: 'Dilatación térmica significativa en tubería de pared delgada', normativa: 'ASME B31.3 §319 · umbrales: criterio conservador de la plataforma' },
  { id: 'CRUCE-009', titulo: 'Gradiente hidráulico + excavación profunda → sifonamiento', normativa: 'Terzaghi (1943) · USACE EM 1110-2-1901 · umbrales: criterio conservador de la plataforma' },
  { id: 'CRUCE-010', titulo: 'Carga de viento alta en zona con pavimento de bajo SN', normativa: 'ASCE 7-22 §27 · AASHTO 1993 · umbrales: criterio conservador de la plataforma' },
]

export default function ModuloInteligenciaCruzadaPage() {
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
            Módulo Inteligencia Cruzada
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Inteligencia Cruzada entre cálculos de ingeniería
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Un motor de 10 reglas determinísticas cruza los cálculos que ya guardaste en distintos módulos de un
            mismo proyecto y detecta combinaciones de riesgo que ningún módulo aislado puede ver por sí solo —
            cada alerta cita normativa real y traza a valores exactos de tu historial.
          </p>
        </div>

        {/* QUÉ HACE */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué hace</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El motor toma los <strong style={{ color: '#f1f5f9' }}>últimos 100 cálculos guardados</strong> del
            usuario, ordenados del más reciente al más antiguo, y busca el cálculo más reciente de cada tipo
            relevante (MAOP, hidráulica, golpe de ariete, cañerías, perforación, soldadura, estabilidad de
            taludes, excavación, capacidad portante, columnas de hormigón, RMR, ventilación subterránea, sismo,
            vigas de acero, dilatación térmica, filtración, viento y pavimento).
          </p>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Sobre esos pares de cálculos aplica <strong style={{ color: '#f1f5f9' }}>10 reglas 100% determinísticas,
            sin IA</strong>: cada regla evalúa umbrales numéricos reales tomados de los parámetros y resultados
            guardados, y sólo dispara una alerta si ambos cálculos existen en el historial y superan el umbral
            definido. Cada alerta incluye su nivel de severidad (BAJO, MEDIO, ALTO o CRÍTICO), la evidencia
            numérica exacta que la disparó, la normativa aplicable y la acción recomendada.
          </p>
        </section>

        {/* LAS 10 REGLAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Las 10 reglas de cruce</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REGLAS.map(r => (
              <div key={r.id} style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 0.5, marginBottom: 4 }}>{r.id}</div>
                <div style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 700, marginBottom: 4 }}>{r.titulo}</div>
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>{r.normativa}</div>
              </div>
            ))}
          </div>
        </section>

        {/* EJEMPLO REAL */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ejemplo — CRUCE-001</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Si el historial contiene un cálculo de MAOP y uno de pérdida de carga por Darcy-Weisbach en el mismo
            proyecto, y la presión (MAOP) supera 40 bar mientras la velocidad de flujo supera 2.0 m/s, se dispara
            la regla de erosión-corrosión:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9 }}>
            <span style={{ color: GOLD }}>Nivel: ALTO</span> (CRÍTICO si MAOP &gt; 70 bar y V &gt; 3.0 m/s)<br />
            Título: Erosión-corrosión: presión elevada + velocidad alta<br />
            Normativa: API RP 14E, 5ª edición (1991): V_e = C/√ρ_m — C=100 servicio continuo, C=125 servicio
            intermitente (fluidos sin sólidos); con corrosión controlada por inhibidor o aleaciones, C=150–200.
            Umbrales 40 bar y 2 m/s: criterio conservador de la plataforma.<br />
            Acción: Verificar protección anticorrosión activa. Reducir velocidad a &lt; 2.0 m/s o tratar con
            inhibidor. Inspección PIG en 6 meses.
          </div>
        </section>

        {/* MOTOR Y CAPA DE IA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Motor determinístico + capa de IA restringida</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            La detección de riesgos es siempre 100% determinística: las 10 reglas se evalúan con código, no con
            IA, así que no hay alucinaciones en los valores ni en las normas citadas.
          </p>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Opcionalmente, sobre los riesgos ya detectados, una capa de IA contextual puede priorizarlos y
            relacionarlos entre sí — pero opera bajo reglas absolutas: nunca inventa un valor numérico, nunca
            inventa una normativa o cláusula, y sólo puede citar los valores y normas ya incluidos en cada riesgo
            detectado por el motor determinístico. Si no existe una relación real entre dos riesgos, no la infiere.
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
