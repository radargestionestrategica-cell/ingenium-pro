import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cómputo de materiales de obra — CIRSOC 201 — INGENIUM PRO',
  description:
    'Cómputo de materiales de obra: dosificación de hormigón y mampostería según CIRSOC 201, con datos ' +
    'reales de 7 países de Latinoamérica. PDF sellado, Excel y DXF.',
  alternates: {
    canonical: 'https://ingeniumpro.store/modulos/mmo',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Cómputo de materiales de obra — CIRSOC 201 — INGENIUM PRO',
  description:
    'Cómputo de materiales de obra: dosificación de hormigón y mampostería según CIRSOC 201, con datos ' +
    'reales de 7 países de Latinoamérica. PDF sellado, Excel y DXF.',
  url: 'https://ingeniumpro.store/modulos/mmo',
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

export default function ModuloMMOPage() {
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
            Módulo MMO — Maestro Mayor de Obra
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Cómputo y dosificación de materiales de obra
          </h1>
          <p style={{ fontSize: 16, color: LIGHT, lineHeight: 1.8 }}>
            Cómputo y dosificación de materiales para 11 rubros de obra — hormigón, hierro, mampostería,
            losa, revoque, cerámico, contrapiso, zapata, excavación, mortero y rendimientos — con datos
            reales de marcas y normativa por país.
          </p>
        </div>

        {/* QUÉ CALCULA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Qué calcula</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            El módulo cubre 11 sub-herramientas de obra: dosificación de <strong style={{ color: '#f1f5f9' }}>hormigón</strong> (grados
            H-13 a H-30), peso de <strong style={{ color: '#f1f5f9' }}>hierro</strong> ADN 420 por diámetro, cómputo de <strong style={{ color: '#f1f5f9' }}>mampostería</strong> (ladrillo
            soga, tizón o bloque) con verificación de tensión admisible, predimensionado de <strong style={{ color: '#f1f5f9' }}>losa</strong>,
            <strong style={{ color: '#f1f5f9' }}> revoque</strong> grueso/fino, <strong style={{ color: '#f1f5f9' }}>cerámico</strong> de piso, <strong style={{ color: '#f1f5f9' }}>contrapiso</strong>, <strong style={{ color: '#f1f5f9' }}>zapata</strong> aislada,
            volumen de <strong style={{ color: '#f1f5f9' }}>excavación</strong>, <strong style={{ color: '#f1f5f9' }}>mortero</strong> por proporción y <strong style={{ color: '#f1f5f9' }}>rendimientos</strong> de
            cuadrilla por tarea.
          </p>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Los datos de materiales (marcas de cemento, medidas de ladrillo, tipo de acero) están verificados
            por país: Argentina, Uruguay, Chile, Colombia, México, Perú y Venezuela.
          </p>
        </section>

        {/* DOSIFICACIÓN DE HORMIGÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Dosificación de hormigón — CIRSOC 201</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 16 }}>
            Cinco grados de hormigón según CIRSOC 201 / ICPA, con cemento, arena, piedra y agua por m³:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 2 }}>
            H-13 (130 kg/cm²) — NO apto estructural, solo limpieza<br />
            H-17 (175 kg/cm²) — contrapisos, veredas, cimientos simples<br />
            H-21 (210 kg/cm²) — columnas, vigas y losas convencionales<br />
            <span style={{ color: GOLD }}>H-25 (250 kg/cm²) — mínimo obligatorio CIRSOC 201 para hormigón armado</span><br />
            H-30 (300 kg/cm²) — estructuras especiales, edificios en altura
          </div>
        </section>

        {/* MAMPOSTERÍA */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Verificación de mampostería — CIRSOC 501-E</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 12 }}>
            Con carga axial y espesor de muro, el módulo verifica la tensión admisible sobre sección bruta
            según CIRSOC 501-E Tabla 6.3: tensión aplicada σ frente a tensión admisible f<sub>a</sub> (0.40 MPa
            para mortero tipo EI, 0.30 MPa para mortero tipo N).
          </p>
        </section>

        {/* NORMAS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Normas aplicadas</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            CIRSOC 201 e IRAM IAS U500-528 (Argentina), UNIT 1050 (Uruguay), NCh 170 / NCh 1508 / NCh 204
            (Chile), NSR-10 / NTC 4205 / NTC 2289 (Colombia), RCDF / NMX-C-414 / ASTM A615 (México),
            NTE E.060 / NTE E.070 (Perú) y COVENIN 1753 / 28 / 1618 (Venezuela). Predimensionado de losa
            según Tabla 7.3.1.1 de ACI 318.
          </p>
        </section>

        {/* EJEMPLO NUMÉRICO */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Ejemplo numérico</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Hormigón H-21, 1 m³, Argentina (bolsa de cemento de 50 kg):
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9, marginBottom: 16 }}>
            Cemento: 340 kg → <span style={{ color: GOLD }}>7 bolsas</span> de 50 kg<br />
            Arena: 640 kg ≈ 0.4 m³<br />
            Piedra partida: 1050 kg ≈ 0.7 m³<br />
            Agua: 190 litros
          </div>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8, marginBottom: 14 }}>
            Mampostería ladrillo soga, 10 m², Argentina:
          </p>
          <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', lineHeight: 1.9 }}>
            Unidades netas: 600 → <span style={{ color: GOLD }}>660 con 10% de desperdicio</span><br />
            Mortero 1:4: 0.25 m³ → 2 bolsas de cemento (50 kg) + 0.26 m³ de arena
          </div>
        </section>

        {/* EXPORTACIÓN */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Informe sellado y exportación</h2>
          <p style={{ fontSize: 15, color: LIGHT, lineHeight: 1.8 }}>
            Cada cómputo se puede exportar como PDF sellado con hash SHA-256 y código QR de verificación
            pública, como planilla Excel con parámetros y resultados, y como archivo DXF con los datos de
            diseño para uso en CAD.
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
