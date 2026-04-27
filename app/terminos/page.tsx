// app/terminos/page.tsx
// INGENIUM PRO v8.1 — Protocolo de Exención de Responsabilidad
// Página pública — sin login requerido

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const GRAY  = '#64748b';
const GREEN = '#22c55e';
const BORD  = 'rgba(232,160,32,0.15)';

export default function TerminosPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{ background: PANEL, borderBottom: `1px solid ${BORD}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: GOLD, fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>INGENIUM PRO</span>
          <span style={{ color: GOLD, fontSize: 22, fontWeight: 300 }}>Ω</span>
        </a>
      </header>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* TÍTULO */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: 3, marginBottom: 12, textTransform: 'uppercase' }}>
            Documento Legal · Versión 1.0 · Vigencia: 27 de abril de 2026
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.2 }}>
            Protocolo de Exención de Responsabilidad Técnica y Legal
          </h1>
          <div style={{ fontSize: 13, color: GRAY }}>
            INGENIUM PRO Ω — Blindaje Integral · RADAR Gestión Estratégica · Silvana Belén Colombo
          </div>
        </div>

        <Seccion numero="1" titulo="Naturaleza del Software">
          <p>
            INGENIUM PRO Ω es una herramienta tecnológica de soporte computacional basada en algoritmos
            de ingeniería y auditoría avanzada. Su propósito es facilitar el procesamiento de datos
            complejos en los sectores de petróleo, minería, perforación, represas, vialidad, ingeniería
            civil e industria en general.
          </p>
          <p style={{ marginTop: 12 }}>
            <strong style={{ color: GOLD }}>Bajo ninguna circunstancia el software reemplaza el juicio,
            la supervisión o la firma de un profesional matriculado y habilitado por ley.</strong>
          </p>
        </Seccion>

        <Seccion numero="2" titulo="Asunción Total de Riesgo por el Usuario">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 14px', background: 'rgba(232,160,32,0.08)', color: GOLD, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: '8px 0 0 0' }}>ÁREA</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', background: 'rgba(232,160,32,0.08)', color: GOLD, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: '0 8px 0 0' }}>OBLIGACIÓN DEL USUARIO</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Integridad de Datos', 'El usuario es el único responsable por la exactitud, veracidad y pertinencia de los datos de entrada (inputs) suministrados al sistema.'],
                ['Validación Técnica', 'Todo resultado, cálculo, plano o informe generado DEBE ser revisado, validado y refrendado por un profesional responsable antes de su ejecución material.'],
                ['Uso de Resultados', 'La aplicación práctica de los cálculos en yacimientos, obras civiles o plantas industriales corre por cuenta y riesgo exclusivo del cliente.'],
                ['Normativa Aplicable', 'El usuario es responsable de verificar que los parámetros ingresados cumplen con la normativa local vigente en su jurisdicción.'],
              ].map(([area, oblig], i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 14px', color: GREEN, fontWeight: 600, fontSize: 12, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{area}</td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8', lineHeight: 1.6 }}>{oblig}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Seccion>

        <Seccion numero="3" titulo="Exención de Responsabilidad">
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            INGENIUM PRO, sus desarrolladores, propietarios y representantes legales{' '}
            <strong style={{ color: '#f1f5f9' }}>no serán responsables bajo ninguna figura jurídica
            (civil, penal, comercial o administrativa)</strong> por:
          </p>
          <ul style={{ margin: '16px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Errores de cálculo derivados de datos de entrada incorrectos o incompletos.',
              'Fallas estructurales, operativas o accidentes en el sitio de aplicación de los resultados.',
              'Pérdidas económicas, lucro cesante o daños emergentes derivados del uso de la plataforma.',
              'Contingencias ambientales o sanciones regulatorias vinculadas a proyectos procesados con el software.',
              'Decisiones técnicas tomadas sin la supervisión de un profesional habilitado.',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13, color: '#94a3b8' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }}>✗</span>
                {item}
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion numero="4" titulo="Sistema de Verificación Criptográfica (Hash / QR)">
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            La plataforma utiliza verificación mediante códigos QR y algoritmos{' '}
            <strong style={{ color: GREEN }}>SHA-256</strong> para garantizar la integridad del
            documento en el momento de su emisión.
          </p>
          <div style={{ marginTop: 16, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: GREEN, fontWeight: 700, marginBottom: 6 }}>
              ✓ QUÉ CERTIFICA ESTE SISTEMA
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Que el documento fue emitido por INGENIUM PRO con exactamente esos datos en esa fecha.
              El hash no puede ser alterado sin invalidar la verificación.
            </div>
          </div>
          <div style={{ marginTop: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginBottom: 6 }}>
              ✗ QUÉ NO CERTIFICA ESTE SISTEMA
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              La idoneidad técnica de los datos ingresados por el usuario ni la correcta aplicación
              de los resultados en campo.
            </div>
          </div>
        </Seccion>

        <Seccion numero="5" titulo="Indemnidad">
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            El Cliente se compromete a mantener indemne a INGENIUM PRO frente a cualquier reclamo,
            demanda o acción legal interpuesta por terceros que surja de la utilización de los informes
            o cálculos generados por la plataforma.
          </p>
        </Seccion>

        <Seccion numero="6" titulo="Aceptación de Términos">
          <div style={{ background: 'rgba(232,160,32,0.08)', border: `1px solid ${BORD}`, borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, margin: '0 0 10px' }}>
              Al utilizar los servicios de INGENIUM PRO Ω, el usuario manifiesta haber leído,
              comprendido y aceptado incondicionalmente los términos de este protocolo.
            </p>
            <p style={{ color: GRAY, fontSize: 12, margin: 0 }}>
              Esta aceptación opera desde el primer uso de la plataforma, sin necesidad de firma
              manuscrita, conforme a la legislación argentina de comercio electrónico (Ley 25.506
              de Firma Digital) y normativas internacionales equivalentes.
            </p>
          </div>
        </Seccion>

        {/* FOOTER */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid rgba(255,255,255,0.06)`, textAlign: 'center', color: GRAY, fontSize: 11 }}>
          <div>INGENIUM PRO v8.1 · RADAR Gestión Estratégica · Silvana Belén Colombo</div>
          <div style={{ marginTop: 4 }}>ingeniumpro.store · silvana@radargestion.com · © 2026</div>
          <div style={{ marginTop: 8 }}>
            <a href="/" style={{ color: GOLD, textDecoration: 'none', marginRight: 16 }}>Inicio</a>
            <a href="/planes" style={{ color: GOLD, textDecoration: 'none', marginRight: 16 }}>Planes</a>
            <a href="/Login" style={{ color: GOLD, textDecoration: 'none' }}>Iniciar sesión</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Seccion({ numero, titulo, children }: { numero: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${GOLD},#c47a10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#020609', flexShrink: 0 }}>
          {numero}
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f1f5f9' }}>{titulo}</h2>
      </div>
      <div style={{ paddingLeft: 40, fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
} 