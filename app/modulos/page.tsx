import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Módulos técnicos de ingeniería — INGENIUM PRO',
  description:
    'Los 15 módulos de cálculo normativo de INGENIUM PRO: petróleo y gas, cañerías, válvulas, perforación, ' +
    'hidráulica, geotecnia, minería, telemetría, electricidad, soldadura, civil, arquitectura, represas, ' +
    'vialidad e inteligencia cruzada. Informe PDF sellado, Excel y DXF en cada módulo.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos',
  },
  robots: { index: true, follow: true },
}

const BG    = '#020609'
const PANEL = '#0a0f1e'
const GOLD  = '#E8A020'
const GRAY  = '#64748b'
const LIGHT = '#94a3b8'
const BORD  = 'rgba(232,160,32,0.15)'

type Modulo = { slug: string; nombre: string; norma: string }

const CLUSTERS: { titulo: string; modulos: Modulo[] }[] = [
  {
    titulo: 'Petróleo, gas & ductos',
    modulos: [
      { slug: 'petroleo-gas', nombre: 'Petróleo & Gas — MAOP', norma: 'ASME B31.8 · API 5L' },
      { slug: 'canerias',     nombre: 'Cañerías & Integridad', norma: 'ASME B31.8/B31.4 · API 579' },
      { slug: 'valvulas',     nombre: 'Válvulas Industriales', norma: 'ISA 75.01.01 · ASME B16.34' },
      { slug: 'perforacion',  nombre: 'Perforación',           norma: 'API RP 13D' },
      { slug: 'termica',      nombre: 'Térmica',                norma: 'ASME VIII · TEMA' },
    ],
  },
  {
    titulo: 'Geomecánica & monitoreo de activos',
    modulos: [
      { slug: 'geotecnia',  nombre: 'Geotecnia — Estabilidad de taludes', norma: 'Bishop 1955 · Meyerhof' },
      { slug: 'telemetria', nombre: 'Telemetría de activos',              norma: 'Fukuzono 1985 · Bishop' },
      { slug: 'mineria',    nombre: 'Minería',                            norma: 'Bieniawski 1989' },
    ],
  },
  {
    titulo: 'Hidráulica & obras hidráulicas',
    modulos: [
      { slug: 'hidraulica', nombre: 'Hidráulica de cañerías', norma: 'Darcy-Weisbach · AWWA M11' },
      { slug: 'represas',   nombre: 'Represas',               norma: 'USACE EM 1110-2' },
      { slug: 'vialidad',   nombre: 'Vialidad',               norma: 'AASHTO 93 · HEC-22' },
    ],
  },
  {
    titulo: 'Estructuras, instalaciones & edificación',
    modulos: [
      { slug: 'civil',         nombre: 'Ingeniería Civil',    norma: 'ACI 318-19 · AISC 360-22' },
      { slug: 'arquitectura',  nombre: 'Arquitectura Técnica', norma: 'ASCE 7-22 · CIRSOC 103' },
      { slug: 'soldadura',     nombre: 'Soldadura',            norma: 'AWS D1.1 · ASME Sec. IX' },
      { slug: 'electricidad',  nombre: 'Electricidad',         norma: 'NEC 310.16 · IEC 60909' },
      { slug: 'mmo',           nombre: 'MMO — Maestro Mayor de Obra', norma: 'CIRSOC 201 · CIRSOC 501-E' },
    ],
  },
  {
    titulo: 'Transversal',
    modulos: [
      { slug: 'inteligencia-cruzada', nombre: 'Inteligencia Cruzada', norma: 'Motor determinístico multi-módulo' },
    ],
  },
]

export default function ModulosIndexPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{ background: PANEL, borderBottom: `1px solid ${BORD}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: GOLD, fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>INGENIUM PRO</span>
          <span style={{ color: GOLD, fontSize: 22, fontWeight: 300 }}>Ω</span>
        </a>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* HERO */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: 3, marginBottom: 12, textTransform: 'uppercase' }}>
            Módulos técnicos
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            15 módulos de cálculo normativo
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8, maxWidth: 720 }}>
            Cada módulo aplica fórmulas y normas identificables — ASME, API, AWS, ACI, AISC, AASHTO, NEC, IEC
            y más — y entrega informe PDF sellado con hash SHA-256 y QR de verificación pública, además de
            exportación Excel y DXF.
          </p>
        </div>

        {/* CLUSTERS */}
        {CLUSTERS.map(cluster => (
          <section key={cluster.titulo} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: GRAY, marginBottom: 16 }}>
              {cluster.titulo}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {cluster.modulos.map(m => (
                <a
                  key={m.slug}
                  href={`/modulos/${m.slug}`}
                  style={{
                    display: 'block',
                    background: PANEL,
                    border: `1px solid ${BORD}`,
                    borderRadius: 12,
                    padding: '18px 20px',
                    textDecoration: 'none',
                    color: '#f1f5f9',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{m.nombre}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: .2, color: GOLD,
                    fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
                  }}>
                    {m.norma}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
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
