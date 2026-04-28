// app/page.tsx
// INGENIUM PRO — Landing pública profesional
// Enfoque: claridad comercial + trazabilidad técnica + acceso profesional

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'INGENIUM Pro | Plataforma técnica de cálculo, auditoría y documentación',
  description:
    'Plataforma profesional para cálculo técnico, auditoría IA, trazabilidad, firma QR y exportación PDF, Excel y DXF en sectores industriales, infraestructura, energía, minería y obras complejas.',
};

const BG = '#020609';
const BG2 = '#040c12';
const PANEL = '#0a0f1e';
const GOLD = '#E8A020';
const GOLD2 = '#c47a10';
const GREEN = '#22c55e';
const GRAY = '#64748b';
const LIGHT = '#94a3b8';
const WHITE = '#f1f5f9';

const sectores = [
  'Petróleo y gas',
  'Minería',
  'Represas y obras hidráulicas',
  'Vialidad e infraestructura',
  'Cañerías e integridad',
  'Soldadura industrial',
  'Arquitectura técnica',
  'Mantenimiento industrial',
];

const modulos = [
  ['01', 'Petróleo & Gas', 'MAOP · Barlow · Factor E-T · riesgo operativo · trazabilidad del cálculo', 'ASME B31.8 · API 5L · API 1104', GOLD],
  ['02', 'Perforación', 'Lodo · ECD · gradiente de fractura · escenarios críticos · control técnico', 'API RP 13D · API RP 7G · DNV', GOLD],
  ['03', 'Hidráulica', 'Darcy-Weisbach · Joukowsky · golpe de ariete · pérdidas de carga', 'AWWA M11 · ASME B31.3', '#38bdf8'],
  ['04', 'Geotecnia', 'Capacidad portante · estabilidad · nivel freático · análisis de condición', 'Meyerhof · Bishop · CIRSOC 101', '#a3e635'],
  ['05', 'Electricidad Industrial', 'Calibre · cortocircuito · factor de potencia · áreas peligrosas · iluminación', 'NEC · IEC 60228 · API RP 500', '#facc15'],
  ['06', 'Soldadura', 'Electrodos · heat input · carbono equivalente · precalentamiento · registro', 'AWS D1.1 · ASME Sec. IX · API 1104', '#f97316'],
  ['07', 'Represas & Presas', 'Filtraciones · estabilidad · carga hidráulica · escenarios de control', 'USACE EM 1110-2 · ICOLD', '#38bdf8'],
  ['08', 'Vialidad', 'Pavimento flexible · pavimento rígido · estructura · cargas · criterio vial', 'AASHTO Guide 1993 · Manual DG-2018', GRAY],
  ['09', 'Mantenimiento Técnico', 'Activos · materiales · operaciones · vida útil · historial y seguimiento', 'ISO 55001 · NFPA 70B · API 510', '#a78bfa'],
  ['10', 'Válvulas Industriales', 'Clase · brida · Cv · compatibilidad · condición de servicio · documentación', 'ASME B16.34 · ISA 75.01 · NACE MR0175', GREEN],
  ['11', 'Ingeniería Civil', 'Vigas · columnas · perfiles · cargas · verificación estructural inicial', 'AISC 360 · ACI 318 · CIRSOC 301', LIGHT],
  ['12', 'Arquitectura Técnica', 'Viento · sismo · cargas · documentación técnica · criterio de diseño', 'ASCE 7-22 · CIRSOC 103 · NSR-10', '#e879f9'],
  ['13', 'Minería', 'RMR · UCS · ventilación · voladura · riesgos geotécnicos y operativos', 'Bieniawski · MSHA · ISO', '#fb923c'],
  ['14', 'Cañerías e Integridad', 'Hoop stress · B31G · vida remanente · integridad mecánica · riesgo', 'ASME B31.8 · ASME B31.4 · API 579', GREEN],
  ['15', 'Térmica', 'LMTD · intercambiadores · dilatación · transferencia · condición térmica', 'TEMA · ASME Sec. VIII · Kern', '#f87171'],
];

const flujo = [
  ['01', 'Datos técnicos', 'El usuario carga datos del activo, obra, componente o escenario de análisis.'],
  ['02', 'Cálculo y criterio', 'El módulo ejecuta cálculos con fórmulas identificables y criterios técnicos trazables.'],
  ['03', 'Auditoría IA', 'La IA revisa resultados, detecta inconsistencias y marca puntos que requieren revisión profesional.'],
  ['04', 'Informe verificable', 'El resultado se exporta en PDF, Excel o DXF con historial, fecha, versión y verificación QR.'],
];

const diferenciales = [
  ['QR', 'Trazabilidad con QR', 'Cada informe puede incluir identificación, fecha, versión, hash de control y QR de verificación para revisar autenticidad y origen del resultado.', GREEN],
  ['IA', 'IA de auditoría técnica', 'La IA analiza resultados generados por los módulos, detecta relaciones entre variables críticas y ayuda a identificar riesgos, inconsistencias o puntos de revisión.', GOLD],
  ['DXF', 'Exportación técnica', 'Exportación orientada a flujos profesionales: PDF para informe, Excel para continuidad de cálculo y DXF para documentación técnica compatible con CAD.', '#38bdf8'],
  ['XLS', 'Excel editable', 'El objetivo no es entregar una captura estática, sino permitir que el equipo continúe el análisis con fórmulas, tablas y registros reutilizables.', '#a3e635'],
  ['PDF', 'Informe profesional', 'Documentos con resumen ejecutivo, criterio aplicado, semáforo de riesgo, datos de entrada, resultados y observaciones técnicas.', '#e879f9'],
  ['STD', 'Referencias técnicas reconocidas', 'Módulos diseñados sobre criterios, fórmulas y referencias normativas verificables. Sin inventar datos ni ocultar el origen del resultado.', '#f97316'],
];

const planes = [
  {
    nombre: 'Demo',
    precio: 'Gratis',
    periodo: '3 días',
    color: GRAY,
    bajada: 'Para conocer la plataforma antes de contratar.',
    features: ['Acceso de prueba', 'Módulos principales', 'PDF de muestra', 'Excel de muestra', 'Sin tarjeta'],
    href: '/Login',
    cta: 'Comenzar demo',
  },
  {
    nombre: 'Senior',
    precio: 'USD 189',
    periodo: 'mes',
    color: GOLD,
    bajada: 'Para profesionales que necesitan cálculo, auditoría y documentación.',
    features: ['1 usuario profesional', 'Módulos técnicos', 'Historial de proyectos', 'Exportación PDF / Excel / DXF', 'Auditoría IA'],
    href: '/planes',
    cta: 'Solicitar acceso Senior',
    destacado: true,
  },
  {
    nombre: 'Team',
    precio: 'USD 549',
    periodo: 'mes',
    color: GREEN,
    bajada: 'Para equipos técnicos, consultoras y áreas internas.',
    features: ['3 usuarios', 'Proyectos compartidos', 'Dashboard de equipo', 'Gestión de activos', 'Soporte prioritario'],
    href: '/planes',
    cta: 'Solicitar acceso Team',
  },
  {
    nombre: 'Enterprise',
    precio: 'A medida',
    periodo: 'empresa',
    color: '#38bdf8',
    bajada: 'Para compañías que requieren configuración por sector, usuarios y soporte dedicado.',
    features: ['Usuarios múltiples', 'Módulos configurables', 'Soporte dedicado', 'Capacitación inicial', 'Condiciones corporativas'],
    href: 'mailto:silvana@radargestion.com?subject=Solicitud%20Enterprise%20-%20INGENIUM%20Pro',
    cta: 'Solicitar cotización',
  },
];

const faqs = [
  ['¿INGENIUM Pro reemplaza al profesional?', 'No. INGENIUM Pro potencia el criterio profesional: ordena información, ejecuta cálculos, documenta decisiones, genera trazabilidad y ayuda a revisar resultados. La responsabilidad técnica final siempre corresponde al profesional o equipo que utiliza la plataforma.'],
  ['¿Por qué se cobra por acceso?', 'Porque no es una calculadora aislada. Es una plataforma profesional con módulos técnicos, auditoría IA, historial, exportaciones y documentación verificable. Su valor está en ahorrar tiempo, reducir dispersión y mejorar la trazabilidad del trabajo técnico.'],
  ['¿Qué entrega la plataforma?', 'Según el módulo y el plan, puede entregar tablas ejecutivas, resultados técnicos, observaciones de auditoría, informes PDF, planillas Excel y archivos DXF orientados a documentación técnica.'],
  ['¿Puedo usarla en empresas o consultoras?', 'Sí. La plataforma está pensada para profesionales independientes, equipos técnicos, consultoras, áreas de mantenimiento, ingeniería, obra, infraestructura e industrias con necesidad de trazabilidad documental.'],
];

export default function LandingPage() {
  return (
    <main className="page">
      <style>{`
        html{scroll-behavior:smooth}
        .page{min-height:100vh;background:${BG};color:${WHITE};font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow-x:hidden}
        .wrap{max-width:1120px;margin:0 auto;padding:0 32px}
        .header{position:sticky;top:0;z-index:50;background:rgba(2,6,9,.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(232,160,32,.14)}
        .header-inner{height:66px;display:flex;align-items:center;gap:18px;max-width:1180px;margin:0 auto;padding:0 32px}
        .brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:${WHITE}}
        .brand-mark{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,${GOLD},${GOLD2});display:flex;align-items:center;justify-content:center;font-weight:950;font-size:18px;color:${BG};box-shadow:0 0 32px rgba(232,160,32,.16)}
        .brand-title{font-weight:950;font-size:16px;letter-spacing:2px}
        .brand-sub{font-size:9px;color:${GOLD};letter-spacing:3px;font-weight:850}
        .nav{display:flex;align-items:center;gap:22px;margin-left:auto}
        .nav a{color:${GRAY};font-size:13px;text-decoration:none;font-weight:650}
        .nav a:hover{color:${WHITE}}
        .login-btn{background:linear-gradient(135deg,${GOLD},${GOLD2});border-radius:9px;color:${BG}!important;font-size:13px;font-weight:850!important;padding:9px 20px;letter-spacing:.3px}
        .hero{position:relative;padding:104px 0 78px;text-align:center;overflow:hidden}
        .hero:before{content:'';position:absolute;top:12%;left:50%;transform:translateX(-50%);width:720px;height:360px;background:radial-gradient(ellipse,rgba(232,160,32,.11) 0%,rgba(34,197,94,.04) 35%,transparent 72%);pointer-events:none}
        .badge{display:inline-flex;align-items:center;gap:8px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.14);border-radius:999px;padding:7px 18px;font-size:11px;color:${GREEN};font-weight:800;letter-spacing:1.7px;margin-bottom:28px;text-transform:uppercase;position:relative}
        .dot{width:7px;height:7px;border-radius:999px;background:${GREEN};display:inline-block;box-shadow:0 0 18px rgba(34,197,94,.85)}
        h1{font-size:clamp(38px,6vw,62px);font-weight:950;line-height:1.04;margin:0 0 24px;letter-spacing:-1.7px;position:relative}
        .gradient-text{background:linear-gradient(135deg,${GOLD},#f59e0b,#f8d06a);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .hero-copy{font-size:18px;color:${LIGHT};max-width:780px;margin:0 auto 17px;line-height:1.75;position:relative}
        .hero-note{font-size:13px;color:${GRAY};margin:0 auto 42px;font-style:italic;position:relative}
        .actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:48px;position:relative}
        .btn-primary,.btn-secondary{border-radius:12px;font-size:15px;font-weight:800;padding:15px 34px;text-decoration:none;letter-spacing:.3px}
        .btn-primary{background:linear-gradient(135deg,${GREEN},#16a34a);color:#fff;box-shadow:0 4px 32px rgba(34,197,94,.22)}
        .btn-secondary{background:transparent;border:1px solid rgba(232,160,32,.35);color:${GOLD}}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(255,255,255,.06);padding-top:38px;position:relative}
        .stat{padding:0 24px;border-right:1px solid rgba(255,255,255,.06);text-align:center}.stat:last-child{border-right:none}
        .stat-value{font-size:22px;font-weight:950;color:${GOLD};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.7px}
        .stat-label{font-size:11px;color:${GRAY};margin-top:5px;line-height:1.4}
        .section{padding:82px 0}.section-alt{background:${BG2}}
        .section-head{text-align:center;margin-bottom:54px}
        .eyebrow{font-size:11px;color:${GOLD};font-weight:800;letter-spacing:3px;margin-bottom:12px;text-transform:uppercase}.eyebrow.green{color:${GREEN}}
        h2{font-size:clamp(30px,4vw,40px);font-weight:950;margin:0 0 13px;line-height:1.12;letter-spacing:-.8px}
        .section-sub{color:${GRAY};font-size:15px;line-height:1.75;max-width:740px;margin:0 auto}
        .problem-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}
        .problem-card{background:${PANEL};border:1px solid rgba(255,255,255,.05);border-radius:20px;padding:30px;position:relative;overflow:hidden}
        .problem-card:before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${GOLD},transparent)}
        .problem-card.solution:before{background:linear-gradient(90deg,${GREEN},transparent)}
        .problem-card h3{margin:0 0 13px;font-size:20px;font-weight:900}.problem-card p{margin:0;color:${LIGHT};font-size:14px;line-height:1.8}
        .sector-list{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px;justify-content:center}
        .sector-pill{border:1px solid rgba(232,160,32,.18);background:rgba(232,160,32,.045);color:${LIGHT};border-radius:999px;padding:9px 14px;font-size:12px;font-weight:700}
        .workflow{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .flow-card{background:${PANEL};border:1px solid rgba(255,255,255,.05);border-radius:18px;padding:24px 20px;min-height:185px}
        .flow-number{color:${GOLD};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:900;letter-spacing:2px;margin-bottom:24px}
        .flow-card h3{margin:0 0 10px;font-size:16px;font-weight:900}.flow-card p{margin:0;color:${LIGHT};font-size:13px;line-height:1.7}
        .modules-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(295px,1fr));gap:14px}
        .module-card{background:${PANEL};border:1px solid rgba(255,255,255,.05);border-radius:14px;padding:19px 20px;display:flex;gap:14px;align-items:flex-start;transition:transform .18s ease,border-color .18s ease}
        .module-card:hover{transform:translateY(-2px);border-color:rgba(232,160,32,.18)}
        .module-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;font-size:11px;font-weight:950;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(255,255,255,.04)}
        .module-name{font-size:14px;font-weight:900;color:${WHITE};margin-bottom:5px}.module-desc{font-size:12px;color:${GRAY};margin-bottom:7px;line-height:1.55}
        .module-norma{font-size:10px;font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.25px;line-height:1.5}
        .diff-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}
        .diff-card{background:${PANEL};border:1px solid rgba(255,255,255,.045);border-radius:18px;padding:28px 24px;position:relative;overflow:hidden}
        .diff-bar{position:absolute;top:0;left:0;right:0;height:3px}
        .diff-icon{width:44px;height:44px;border-radius:13px;background:rgba(255,255,255,.045);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:950;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-bottom:16px}
        .diff-title{font-size:16px;font-weight:900;margin-bottom:10px}.diff-desc{font-size:13px;color:${LIGHT};line-height:1.75}
        .trust-box{background:linear-gradient(135deg,rgba(232,160,32,.08),rgba(34,197,94,.05));border:1px solid rgba(232,160,32,.14);border-radius:22px;padding:34px;margin-top:36px}
        .trust-box h3{margin:0 0 14px;font-size:22px;font-weight:950}
        .trust-list{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px}
        .trust-item{background:rgba(2,6,9,.35);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:16px;color:${LIGHT};font-size:13px;line-height:1.65}
        .plans-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        .plan-card{background:${PANEL};border:1px solid rgba(255,255,255,.055);border-radius:20px;padding:30px 24px;display:flex;flex-direction:column;position:relative;min-height:435px}
        .plan-card.featured{border-color:rgba(232,160,32,.45);box-shadow:0 0 42px rgba(232,160,32,.12)}
        .plan-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,${GOLD},${GOLD2});color:${BG};font-size:10px;font-weight:950;padding:5px 14px;border-radius:999px;letter-spacing:1px;white-space:nowrap}
        .plan-name{font-size:11px;font-weight:850;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}
        .price-row{display:flex;align-items:flex-end;gap:5px;margin-bottom:9px}.price{font-size:32px;font-weight:950;color:${WHITE};line-height:1;letter-spacing:-1px}.period{font-size:12px;color:${GRAY};margin-bottom:4px}
        .plan-sub{color:${GRAY};font-size:12px;line-height:1.65;min-height:58px}.line{height:1px;background:rgba(255,255,255,.055);margin:18px 0}
        .feature-list{list-style:none;padding:0;margin:0 0 26px;display:flex;flex-direction:column;gap:10px;flex:1}
        .feature-list li{display:flex;gap:10px;font-size:13px;color:${LIGHT};line-height:1.45}
        .plan-btn{display:block;text-align:center;padding:13px 12px;border-radius:12px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);color:${WHITE};font-weight:850;font-size:13px;text-decoration:none;letter-spacing:.2px}
        .plan-btn.featured{background:linear-gradient(135deg,${GOLD},${GOLD2});border:none;color:${BG}}
        .faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.faq-card{background:${PANEL};border:1px solid rgba(255,255,255,.05);border-radius:18px;padding:24px}
        .faq-card h3{margin:0 0 10px;font-size:16px;font-weight:900}.faq-card p{margin:0;color:${LIGHT};font-size:13px;line-height:1.75}
        .final-cta{position:relative;overflow:hidden;text-align:center;padding:86px 0}.final-cta:before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:560px;height:340px;background:radial-gradient(ellipse,rgba(34,197,94,.08) 0%,transparent 70%);pointer-events:none}
        .final-inner{max-width:680px;margin:0 auto;position:relative;padding:0 32px}
        .disclaimer{max-width:930px;margin:26px auto 0;color:${GRAY};font-size:11px;line-height:1.75;text-align:center}
        .footer{border-top:1px solid rgba(255,255,255,.045);padding:32px}.footer-inner{max-width:1180px;margin:0 auto;display:flex;align-items:center;flex-wrap:wrap;gap:18px;justify-content:space-between}
        .footer-links{display:flex;gap:20px;flex-wrap:wrap}.footer a{color:${GRAY};font-size:12px;text-decoration:none}.footer a:hover{color:${WHITE}}
        @media(max-width:980px){.nav a:not(.login-btn){display:none}.stats{grid-template-columns:repeat(2,1fr);gap:22px 0}.stat:nth-child(2){border-right:none}.problem-grid,.faq-grid{grid-template-columns:1fr}.workflow{grid-template-columns:repeat(2,1fr)}.plans-grid{grid-template-columns:repeat(2,1fr)}.trust-list{grid-template-columns:1fr}}
        @media(max-width:640px){.wrap{padding:0 20px}.header-inner{padding:0 18px}.brand-sub{display:none}.login-btn{padding:8px 14px}.hero{padding:74px 0 58px}.hero-copy{font-size:16px}.actions a{width:100%;box-sizing:border-box}.stats{grid-template-columns:1fr}.stat{border-right:none;border-bottom:1px solid rgba(255,255,255,.06);padding:18px 0}.stat:last-child{border-bottom:none}.section{padding:64px 0}.workflow,.plans-grid{grid-template-columns:1fr}.modules-grid,.diff-grid{grid-template-columns:1fr}.problem-card,.trust-box{padding:24px}.footer-inner{align-items:flex-start;flex-direction:column}}
      `}</style>

      <header className="header">
        <div className="header-inner">
          <a href="/" className="brand" aria-label="INGENIUM Pro">
            <div className="brand-mark">Ω</div>
            <div>
              <div className="brand-title">INGENIUM PRO</div>
              <div className="brand-sub">PLATAFORMA TÉCNICA PROFESIONAL</div>
            </div>
          </a>
          <nav className="nav" aria-label="Navegación principal">
            <a href="#problema">Problema</a>
            <a href="#modulos">Módulos</a>
            <a href="#diferenciales">Diferenciales</a>
            <a href="#planes">Planes</a>
            <a className="login-btn" href="/Login">Ingresar →</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="badge"><span className="dot" /> Plataforma web · cálculo · auditoría · documentación</div>
          <h1>Cálculo, auditoría y documentación técnica<br /><span className="gradient-text">con trazabilidad profesional</span></h1>
          <p className="hero-copy">
            INGENIUM Pro centraliza módulos técnicos, criterios verificables, auditoría IA, firma QR y exportación PDF,
            Excel y DXF para sectores industriales, infraestructura, energía, minería, cañerías, soldadura y obras complejas.
          </p>
          <p className="hero-note">Si ahorra 2 horas de un ingeniero senior al mes, ya se pagó solo.</p>
          <div className="actions">
            <a href="/Login" className="btn-primary">Probar demo profesional →</a>
            <a href="#planes" className="btn-secondary">Ver planes de acceso</a>
          </div>

          <div className="stats" aria-label="Indicadores principales de INGENIUM Pro">
            {[
              ['15', 'Módulos técnicos iniciales'],
              ['PDF · XLSX · DXF', 'Exportación profesional'],
              ['QR', 'Verificación y trazabilidad'],
              ['IA', 'Auditoría técnica asistida'],
            ].map(([value, label]) => (
              <div className="stat" key={label}>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="problema" className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Problema real</div>
            <h2>La ingeniería no falla solo por falta de cálculo. Falla por dispersión.</h2>
            <p className="section-sub">
              Planillas aisladas, criterios no documentados, informes manuales, versiones perdidas, cálculos sin trazabilidad y
              decisiones difíciles de auditar generan pérdida de tiempo, errores y dependencia de procesos informales.
            </p>
          </div>

          <div className="problem-grid">
            <article className="problem-card">
              <h3>Hoy el trabajo técnico queda fragmentado</h3>
              <p>
                Un dato se carga en Excel, otro se revisa en PDF, el plano se ajusta en CAD, la norma queda aparte, el informe se
                redacta manualmente y la justificación técnica depende de archivos difíciles de reconstruir.
              </p>
            </article>
            <article className="problem-card solution">
              <h3>INGENIUM Pro ordena el proceso completo</h3>
              <p>
                La plataforma integra datos, cálculo, criterio técnico, auditoría, historial, exportación y verificación para que
                cada resultado pueda revisarse, justificarse y presentarse con mayor claridad profesional.
              </p>
            </article>
          </div>

          <div className="sector-list" aria-label="Sectores objetivo">
            {sectores.map((sector) => <span className="sector-pill" key={sector}>{sector}</span>)}
          </div>
        </div>
      </section>

      <section id="flujo" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow green">Flujo profesional</div>
            <h2>Del dato técnico al informe verificable</h2>
            <p className="section-sub">
              INGENIUM Pro está pensado para que el resultado no sea solamente un número, sino una decisión técnica documentada,
              revisable y exportable.
            </p>
          </div>

          <div className="workflow">
            {flujo.map(([paso, titulo, desc]) => (
              <article className="flow-card" key={paso}>
                <div className="flow-number">{paso}</div>
                <h3>{titulo}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="modulos" className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Cobertura técnica</div>
            <h2>15 módulos para contextos industriales y de infraestructura</h2>
            <p className="section-sub">
              Cada módulo trabaja con fórmulas identificables, datos de entrada claros, referencias técnicas y resultados
              trazables. El objetivo es asistir al profesional, no reemplazar su criterio.
            </p>
          </div>

          <div className="modules-grid">
            {modulos.map(([icon, nombre, desc, norma, color]) => (
              <article className="module-card" key={nombre} style={{ borderLeft: `3px solid ${color}` }}>
                <div className="module-icon" style={{ color }}>{icon}</div>
                <div>
                  <div className="module-name">{nombre}</div>
                  <div className="module-desc">{desc}</div>
                  <div className="module-norma" style={{ color }}>{norma}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciales" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow green">Diferenciales</div>
            <h2>Más que calcular: documentar, auditar y justificar</h2>
            <p className="section-sub">
              La diferencia no está solamente en tener módulos. Está en que cada resultado pueda explicar de dónde salió, qué datos
              usó, qué criterio aplicó y cómo puede verificarse.
            </p>
          </div>

          <div className="diff-grid">
            {diferenciales.map(([icon, titulo, desc, color]) => (
              <article className="diff-card" key={titulo}>
                <div className="diff-bar" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
                <div className="diff-icon" style={{ color }}>{icon}</div>
                <div className="diff-title">{titulo}</div>
                <div className="diff-desc">{desc}</div>
              </article>
            ))}
          </div>

          <div className="trust-box">
            <h3>La trazabilidad es el verdadero valor técnico</h3>
            <p style={{ margin: 0, color: LIGHT, lineHeight: 1.8, fontSize: 14 }}>
              Cada cálculo debería poder responder qué datos se usaron, qué fórmula intervino, qué criterio técnico se aplicó,
              qué referencia se consideró, quién generó el informe, cuándo se emitió y qué versión del resultado fue documentada.
            </p>
            <div className="trust-list">
              <div className="trust-item">Datos de entrada visibles y revisables.</div>
              <div className="trust-item">Resultados acompañados por criterio técnico y observaciones.</div>
              <div className="trust-item">Exportaciones pensadas para continuidad de trabajo y auditoría.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="planes" className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Acceso profesional</div>
            <h2>Planes pensados para profesionales y equipos técnicos</h2>
            <p className="section-sub">
              La plataforma se cobra por acceso porque concentra cálculo, documentación, auditoría, historial y exportación técnica en
              un flujo profesional.
            </p>
          </div>

          <div className="plans-grid">
            {planes.map((p) => (
              <article className={`plan-card ${p.destacado ? 'featured' : ''}`} key={p.nombre}>
                {p.destacado && <div className="plan-badge">MÁS ELEGIDO</div>}
                <div className="plan-name" style={{ color: p.color }}>{p.nombre}</div>
                <div className="price-row">
                  <span className="price">{p.precio}</span>
                  <span className="period">/{p.periodo}</span>
                </div>
                <div className="plan-sub">{p.bajada}</div>
                <div className="line" />
                <ul className="feature-list">
                  {p.features.map((f) => (
                    <li key={f}><span style={{ color: p.color, flexShrink: 0 }}>✓</span>{f}</li>
                  ))}
                </ul>
                <a className={`plan-btn ${p.destacado ? 'featured' : ''}`} href={p.href}>{p.cta}</a>
              </article>
            ))}
          </div>

          <p className="disclaimer">
            Pagos internacionales vía Payoneer · MercadoPago disponible para LatAm · Cancelás cuando querés
          </p>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow green">Preguntas clave</div>
            <h2>Claridad antes de contratar</h2>
            <p className="section-sub">
              Una plataforma técnica necesita vender con fuerza, pero también con responsabilidad, límites claros y confianza profesional.
            </p>
          </div>

          <div className="faq-grid">
            {faqs.map(([q, a]) => (
              <article className="faq-card" key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta section-alt">
        <div className="final-inner">
          <h2>
            INGENIUM Pro no reemplaza al profesional.
            <br />
            <span style={{ color: GOLD }}>Lo vuelve más rápido, más claro y más trazable.</span>
          </h2>
          <p style={{ color: LIGHT, fontSize: 15, lineHeight: 1.75, margin: '0 0 34px' }}>
            Probá la plataforma, revisá los módulos y evaluá si puede ahorrar tiempo, ordenar procesos y mejorar la documentación
            técnica de tu trabajo o equipo.
          </p>
          <div className="actions" style={{ marginBottom: 0 }}>
            <a href="/Login" className="btn-primary">Crear cuenta demo →</a>
            <a href="mailto:silvana@radargestion.com?subject=Consulta%20INGENIUM%20Pro" className="btn-secondary">Contactar ventas</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-mark" style={{ width: 30, height: 30, borderRadius: 9, fontSize: 14 }}>Ω</div>
            <div style={{ fontSize: 12, color: GRAY }}>
              INGENIUM Pro · RADAR Gestión Estratégica · © 2026 Silvana Belén Colombo
            </div>
          </div>
          <div className="footer-links">
            <a href="#planes">Planes</a>
            <a href="/terminos">Términos</a>
            <a href="/verify/demo">Verificación QR</a>
            <a href="mailto:silvana@radargestion.com" style={{ color: GOLD }}>silvana@radargestion.com</a>
          </div>
        </div>
      </footer>
    </main>
  );
} 