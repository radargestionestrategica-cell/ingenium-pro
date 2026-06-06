// app/page.tsx  — INGENIUM PRO v8.1 — Landing enterprise-grade

import type { Metadata } from 'next';
import ModulosCarrusel from '@/components/ModulosCarrusel';
import ExportacionCarrusel from '@/components/ExportacionCarrusel';

export const metadata: Metadata = {
  title: 'INGENIUM Pro | Plataforma de cálculo técnico, auditoría IA y documentación profesional',
  description:
    'Plataforma profesional con 15 módulos técnicos, 130+ normativas internacionales, auditoría IA, exportación PDF/Excel/DXF y trazabilidad QR. Petróleo, minería, civil, electricidad, soldadura y más.',
  keywords: 'ingeniería industrial, cálculo MAOP, ASME B31.8, API 6D, válvulas industriales, DXF CAD ingeniería, plataforma ingeniería online',
};

const BG    = '#020609';
const BG2   = '#040c12';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const GOLD2 = '#c47a10';
const GREEN = '#22c55e';
const CYAN  = '#38bdf8';
const GRAY  = '#64748b';
const LIGHT = '#94a3b8';
const WHITE = '#f1f5f9';

const NORMAS = [
  'ASME B31.3','ASME B31.4','ASME B31.8','ASME B16.34','ASME B16.5',
  'ASME Sec.VIII','ASME Sec.IX','API 5L','API 579','API 1104',
  'API RP 13D','API RP 500','API RP 54','API 510','API 6D',
  'IEC 60228','IEC 60364','IEC 60909','IEC 60079','IEC 60076',
  'NACE MR0175','ISO 15156','AWS D1.1','AISC 360-16','ACI 318-19',
  'AASHTO 93','ASCE 7-22','CIRSOC 101','CIRSOC 201','CIRSOC 301',
  'NEC 2023','TEMA','USACE EM','ICOLD','ISA 75.01',
  'Bieniawski 89','MSHA 30 CFR','Bishop 1955','HEC-22','EN 12464',
];

const modulos = [
  { n:'01', nombre:'Petróleo & Gas',       desc:'MAOP · Barlow · factor E-T · riesgo operativo',               norma:'ASME B31.8 · API 5L · API 1104',    color: GOLD,    icon:'🛢️', calcs:8  },
  { n:'02', nombre:'Perforación',           desc:'BHP · ECD · gradiente fractura · peso lodo',                  norma:'API RP 13D · API RP 7G',            color: GOLD,    icon:'⛏️', calcs:3  },
  { n:'03', nombre:'Hidráulica',            desc:'Darcy-Weisbach · golpe ariete · Colebrook-White',             norma:'AWWA M11 · ASME B31.3',             color: CYAN,    icon:'💧', calcs:2  },
  { n:'04', nombre:'Cañerías & Integridad', desc:'Hoop stress · B31G · vida remanente · integridad',           norma:'ASME B31.8 · ASME B31.4 · API 579', color: GREEN,   icon:'🔩', calcs:5  },
  { n:'05', nombre:'Electricidad',          desc:'Calibre · cortocircuito · FP · áreas peligrosas · iluminación', norma:'NEC 2023 · IEC 60228 · IEC 60909', color:'#facc15',icon:'⚡', calcs:8  },
  { n:'06', nombre:'Soldadura',             desc:'Heat input · CE · precalentamiento · consumo electrodos',     norma:'AWS D1.1 · ASME Sec.IX · API 1104', color:'#f97316',icon:'🔥', calcs:5  },
  { n:'07', nombre:'Represas & Presas',     desc:'Vertederos · filtraciones · carga hidráulica',                norma:'USACE EM 1110-2 · ICOLD Bulletin',  color: CYAN,    icon:'🌊', calcs:2  },
  { n:'08', nombre:'Vialidad',              desc:'Pavimento AASHTO · drenaje HEC-22 · método racional',        norma:'AASHTO 93 · HEC-22 FHWA',           color: GRAY,    icon:'🛣️', calcs:2  },
  { n:'09', nombre:'MMO',                   desc:'Hormigón · mampostería · revoque · losas · morteros',         norma:'CIRSOC 201 · ACI 318-19',           color:'#a78bfa',icon:'🔧', calcs:11 },
  { n:'10', nombre:'Válvulas Industriales', desc:'Clase B16.34 · NACE · brida B16.5 + DXF · coef. Cv',        norma:'ASME B16.34 · ISA 75.01 · NACE',    color: GREEN,   icon:'⚙️', calcs:4  },
  { n:'11', nombre:'Ingeniería Civil',      desc:'Vigas LRFD · columnas ACI · perfiles · verificación',        norma:'AISC 360-16 · ACI 318-19 · ASCE',   color: LIGHT,   icon:'🏗️', calcs:2  },
  { n:'12', nombre:'Arquitectura Técnica',  desc:'Cargas viento · sismo · iluminación natural',               norma:'ASCE 7-22 · CIRSOC 103 · NSR-10',   color:'#e879f9',icon:'🏛️', calcs:2  },
  { n:'13', nombre:'Minería',               desc:'RMR Bieniawski · UCS · ventilación subterránea',             norma:'Bieniawski 89 · NIOSH · MSHA',      color:'#fb923c',icon:'⛏️', calcs:2  },
  { n:'14', nombre:'Térmica',               desc:'LMTD · intercambiadores · dilatación · coef. global',       norma:'TEMA · ASME Sec.VIII · Kern 1950',   color:'#f87171',icon:'🌡️', calcs:2  },
  { n:'15', nombre:'Geotecnia',             desc:'Capacidad portante · estabilidad talud · Bishop',            norma:'Meyerhof 63 · Bishop 55 · CIRSOC',   color:'#a3e635',icon:'🌍', calcs:2  },
];

const flujo = [
  { n:'01', title:'Datos técnicos',     desc:'El usuario ingresa parámetros del activo, obra, componente o escenario a analizar.',              color: CYAN  },
  { n:'02', title:'Cálculo normativo',  desc:'El módulo ejecuta cálculos con fórmulas identificables, criterios técnicos y referencias reales.', color: GOLD  },
  { n:'03', title:'Auditoría IA',       desc:'La IA revisa resultados, detecta inconsistencias y marca puntos que requieren revisión profesional.', color: GREEN },
  { n:'04', title:'Informe trazable',   desc:'Resultado exportado en PDF, Excel o DXF con historial, fecha, versión y verificación QR.',          color:'#e879f9'},
];

const diferenciales = [
  { icon:'QR',  title:'Trazabilidad QR',           desc:'Cada informe incluye identificación, fecha, versión y hash de control. El QR permite verificar autenticidad y origen del resultado en tiempo real.',        color: GREEN   },
  { icon:'IA',  title:'Auditoría técnica IA',       desc:'La IA analiza resultados generados por los módulos, detecta relaciones entre variables críticas e identifica riesgos, inconsistencias o puntos de revisión.', color: GOLD    },
  { icon:'DXF', title:'Exportación DXF para CAD',  desc:'Bridas, geometrías y planos técnicos exportados en DXF compatible con AutoCAD, FreeCAD y cualquier sistema CAD profesional. Listo para planos oficiales.',    color: CYAN    },
  { icon:'XLS', title:'Excel editable y trazable', desc:'No una captura estática: planillas con fórmulas, tablas y registros reutilizables para que el equipo continúe el análisis con los datos del módulo.',          color:'#a3e635'},
  { icon:'PDF', title:'Informe profesional PDF',    desc:'Resumen ejecutivo, criterio aplicado, semáforo de riesgo, datos de entrada, resultados y observaciones técnicas. Listo para auditoría y presentación.',       color:'#e879f9'},
  { icon:'STD', title:'130+ normativas reales',     desc:'Módulos diseñados sobre ASME, API, IEC, NACE, AISC, ACI, AASHTO, AWS y más. Sin inventar datos, sin ocultar el origen. Fórmulas verificables en cada cálculo.', color:'#f97316'},
];

const industrias = [
  { sector:'Petróleo & Gas',            uso:'Verificación de MAOP, selección de clase de válvulas, integridad de cañerías, clasificación de áreas peligrosas y documentación de soldadura.',                   color: GOLD    },
  { sector:'Minería Subterránea',       uso:'Clasificación geomecánica RMR, diseño de ventilación, cálculo de lodo en perforación, iluminación de galerías y selección de material NACE.',                     color:'#fb923c'},
  { sector:'Represas & Hidráulica',     uso:'Cálculo de vertederos, filtraciones por Darcy, golpe de ariete, estabilidad de talud y diseño de iluminación según USACE y ICOLD.',                               color: CYAN    },
  { sector:'Vialidad & Infraestructura',uso:'Diseño de pavimento AASHTO 93, drenaje vial HEC-22, dimensionamiento de vigas y columnas AISC/ACI y carga de viento según ASCE 7-22.',                           color: GRAY    },
  { sector:'Electricidad Industrial',   uso:'Calibre de cable NEC/IEC, corriente de cortocircuito IEC 60909, corrección FP, clasificación áreas peligrosas y dimensionamiento de transformadores IEC 60076.',  color:'#facc15'},
  { sector:'Civil & Arquitectura',      uso:'Análisis estructural de vigas LRFD, columnas hormigón ACI 318, cargas de viento ASCE 7-22, sismo y documentación técnica exportable para auditoría.',             color: LIGHT   },
];

const planes = [
  { nombre:'Demo',          precio:'Gratis',          periodo:'3 días',   color: GRAY,  bajada:'Conocer la plataforma sin compromiso.',                       features:['Acceso completo de prueba','Todos los módulos','PDF · Excel · DXF','Sin tarjeta de crédito'],                                                     href:'/register',  cta:'Comenzar demo gratuito',  destacado:false },
  { nombre:'Módulo único',  precio:'ARS $45.000',     periodo:'/mes',     color: CYAN,  bajada:'1 módulo a elección. Ideal para uso puntual.',                 features:['1 módulo a elección','Usuario único','PDF · Excel · DXF · QR','Soporte por email'],                                                             href:'/planes/modulo-unico',                                                                                                                              cta:'Contratar',               destacado:false },
  { nombre:'Dúo',           precio:'ARS $80.000',     periodo:'/mes',     color: GREEN, bajada:'2 módulos a elección. Más versatilidad a mejor precio.',       features:['2 módulos a elección','Usuario único','PDF · Excel · DXF · QR','Soporte por email'],                                                             href:'/planes/duo',                                                                                                                                       cta:'Contratar',               destacado:false },
  { nombre:'Pro',           precio:'ARS $350.000',    periodo:'/mes',     color: GOLD,  bajada:'Todos los módulos para el profesional independiente.',          features:['1 usuario','Todos los módulos técnicos','Historial ilimitado','PDF · Excel · DXF · QR','Auditoría IA','Verificación SHA-256'],                    href:'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=7977d5695fec4f99be5cc3e56c7b9428',                                         cta:'Activar Pro',             destacado:true,  paypalHref:'https://www.paypal.me/ingeniumpro/255' },
  { nombre:'Team',          precio:'ARS $1.000.000',  periodo:'/mes',     color: CYAN,  bajada:'Hasta 3 usuarios. Proyectos compartidos y trazabilidad.',       features:['Hasta 3 usuarios','Todos los módulos','Proyectos compartidos','Dashboard de equipo','Soporte prioritario'],                                      href:'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=a82fae7648024090a3b6dc195d136ccd',                                         cta:'Activar Team',            destacado:false, paypalHref:'https://www.paypal.me/ingeniumpro/750' },
  { nombre:'Enterprise',    precio:'Solicitar',       periodo:'cotización',color: GRAY, bajada:'Usuarios ilimitados, módulos personalizados e integración API.', features:['Usuarios ilimitados','Módulos configurables','API de integración','Soporte dedicado 24/7','Capacitación inicial','Contrato con factura'],          href:'mailto:radargestionestrategica@gmail.com?subject=Plan Enterprise INGENIUM PRO',                                                                      cta:'Solicitar cotización',    destacado:false },
];

const faqs = [
  ['¿INGENIUM Pro reemplaza al ingeniero matriculado?','No. La plataforma potencia el criterio profesional: ordena datos, ejecuta cálculos verificables, documenta decisiones y genera trazabilidad. La responsabilidad técnica y legal siempre corresponde al profesional habilitado que utiliza la plataforma.'],
  ['¿Qué diferencia a INGENIUM Pro de una calculadora web?','Integra cálculo, normativas reales verificables, auditoría IA, historial de resultados, exportación PDF/Excel/DXF y trazabilidad QR en un flujo único. No es solo un resultado: es una decisión técnica documentada y auditable.'],
  ['¿Puedo usar los resultados en informes oficiales?','Los resultados son técnicamente trazables, con normativa, fórmulas y criterios identificables. Para informes oficiales o responsabilidad profesional, deben ser revisados y firmados por el profesional habilitado correspondiente.'],
  ['¿Funciona para equipos de ingeniería o consultoras?','Sí. Los planes Team y Enterprise están pensados para equipos con proyectos compartidos, dashboard común y gestión de activos. Ideal para consultoras, áreas de mantenimiento y empresas con necesidad de documentación técnica sistemática.'],
];

export default function LandingPage() {
  return (
    <main className="page">
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
        body{background:${BG}}
        .page{min-height:100vh;background:${BG};color:${WHITE};font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;overflow-x:hidden}

        /* ── KEYFRAMES ── */
        @keyframes pulse-dot{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.6)}50%{opacity:.8;box-shadow:0 0 0 6px rgba(34,197,94,0)}}
        @keyframes glow-gold{0%,100%{box-shadow:0 0 24px rgba(232,160,32,.25)}50%{box-shadow:0 0 48px rgba(232,160,32,.55),0 0 80px rgba(232,160,32,.12)}}
        @keyframes float-up{0%{transform:translateY(0) scale(1);opacity:0}15%{opacity:.35}85%{opacity:.1}100%{transform:translateY(-80px) scale(.5);opacity:0}}
        @keyframes scanline{0%{background-position:0 0}100%{background-position:0 100%}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes border-spin{0%{border-color:rgba(232,160,32,.8) rgba(232,160,32,.15) rgba(232,160,32,.15) rgba(232,160,32,.15)}25%{border-color:rgba(232,160,32,.15) rgba(232,160,32,.8) rgba(232,160,32,.15) rgba(232,160,32,.15)}50%{border-color:rgba(232,160,32,.15) rgba(232,160,32,.15) rgba(232,160,32,.8) rgba(232,160,32,.15)}75%{border-color:rgba(232,160,32,.15) rgba(232,160,32,.15) rgba(232,160,32,.15) rgba(232,160,32,.8)}}
        @keyframes fade-in-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

        /* ── LAYOUT ── */
        .wrap{max-width:1160px;margin:0 auto;padding:0 32px}

        /* ── HEADER ── */
        .header{position:sticky;top:0;z-index:50;background:rgba(2,6,9,.88);backdrop-filter:blur(24px) saturate(160%);border-bottom:1px solid rgba(232,160,32,.12);transition:background .3s}
        .header-inner{height:64px;display:flex;align-items:center;gap:16px;max-width:1200px;margin:0 auto;padding:0 32px}
        .brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:${WHITE};flex-shrink:0}
        .brand-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,${GOLD},${GOLD2});display:flex;align-items:center;justify-content:center;font-weight:950;font-size:19px;color:${BG};animation:glow-gold 3s ease-in-out infinite;letter-spacing:-.5px}
        .brand-text{display:flex;flex-direction:column}
        .brand-title{font-weight:950;font-size:15px;letter-spacing:2.5px;line-height:1}
        .brand-sub{font-size:8px;color:${GOLD};letter-spacing:3.5px;font-weight:800;margin-top:2px}
        .nav{display:flex;align-items:center;gap:24px;margin-left:auto}
        .nav-link{color:${GRAY};font-size:13px;text-decoration:none;font-weight:600;transition:color .2s;letter-spacing:.2px}
        .nav-link:hover{color:${WHITE}}
        .login-btn{background:linear-gradient(135deg,${GOLD},${GOLD2});border-radius:10px;color:${BG}!important;font-size:13px;font-weight:850;padding:9px 22px;letter-spacing:.4px;transition:opacity .2s}
        .login-btn:hover{opacity:.88}

        /* ── TICKER ── */
        .ticker-wrap{background:rgba(34,197,94,.06);border-top:1px solid rgba(34,197,94,.1);border-bottom:1px solid rgba(34,197,94,.08);overflow:hidden;height:34px;display:flex;align-items:center}
        .ticker-track{display:flex;animation:ticker 38s linear infinite;white-space:nowrap;gap:0}
        .ticker-item{font-size:10px;font-weight:800;color:rgba(34,197,94,.7);letter-spacing:2px;text-transform:uppercase;padding:0 32px}
        .ticker-sep{color:rgba(34,197,94,.3);padding:0 4px}

        /* ── HERO ── */
        .hero{position:relative;padding:96px 0 80px;text-align:center;overflow:hidden}
        .hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(232,160,32,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(232,160,32,.03) 1px,transparent 1px);background-size:64px 64px;pointer-events:none}
        .hero-glow{position:absolute;top:0;left:50%;transform:translateX(-50%);width:900px;height:500px;background:radial-gradient(ellipse at 50% 20%,rgba(232,160,32,.09) 0%,rgba(34,197,94,.04) 30%,transparent 68%);pointer-events:none}
        .hero-badge{display:inline-flex;align-items:center;gap:9px;background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.18);border-radius:999px;padding:8px 20px;font-size:11px;color:${GREEN};font-weight:800;letter-spacing:1.8px;margin-bottom:30px;text-transform:uppercase;position:relative;animation:fade-in-up .8s ease both}
        .dot-live{width:8px;height:8px;border-radius:999px;background:${GREEN};display:inline-block;animation:pulse-dot 2s ease-in-out infinite}
        h1{font-size:clamp(36px,5.5vw,64px);font-weight:950;line-height:1.03;margin:0 0 22px;letter-spacing:-2px;position:relative;animation:fade-in-up .9s ease .1s both}
        .gold-text{background:linear-gradient(135deg,${GOLD} 0%,#f59e0b 50%,#fde68a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hero-copy{font-size:17px;color:${LIGHT};max-width:820px;margin:0 auto 16px;line-height:1.8;position:relative;animation:fade-in-up 1s ease .2s both}
        .hero-note{font-size:13px;color:${GRAY};margin:0 auto 44px;font-style:italic;position:relative;animation:fade-in-up 1s ease .3s both}
        .hero-note strong{color:${GOLD};font-style:normal}
        .actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:56px;position:relative;animation:fade-in-up 1s ease .4s both}
        .btn-primary{background:linear-gradient(135deg,${GREEN},#16a34a);border-radius:13px;font-size:15px;font-weight:800;padding:15px 36px;text-decoration:none;color:#fff;box-shadow:0 6px 32px rgba(34,197,94,.28);transition:transform .18s,box-shadow .18s;letter-spacing:.3px}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 48px rgba(34,197,94,.38)}
        .btn-secondary{background:transparent;border:1px solid rgba(232,160,32,.4);border-radius:13px;font-size:15px;font-weight:800;padding:15px 36px;text-decoration:none;color:${GOLD};transition:background .2s,border-color .2s}
        .btn-secondary:hover{background:rgba(232,160,32,.07);border-color:rgba(232,160,32,.7)}

        /* ── HERO STATS ── */
        .hero-stats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid rgba(255,255,255,.06);border-radius:20px;background:rgba(10,15,30,.6);backdrop-filter:blur(12px);overflow:hidden;animation:fade-in-up 1s ease .5s both}
        .h-stat{padding:24px 20px;text-align:center;border-right:1px solid rgba(255,255,255,.06)}.h-stat:last-child{border-right:none}
        .h-stat-val{font-size:26px;font-weight:950;color:${GOLD};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.5px;line-height:1}
        .h-stat-lbl{font-size:11px;color:${GRAY};margin-top:6px;line-height:1.45}

        /* ── SECCIÓN BASE ── */
        .section{padding:88px 0}.section-alt{background:${BG2}}
        .section-head{text-align:center;margin-bottom:56px}
        .eyebrow{display:inline-block;font-size:10px;color:${GOLD};font-weight:900;letter-spacing:4px;margin-bottom:14px;text-transform:uppercase;padding:5px 14px;border:1px solid rgba(232,160,32,.2);border-radius:999px;background:rgba(232,160,32,.06)}
        .eyebrow.green{color:${GREEN};border-color:rgba(34,197,94,.2);background:rgba(34,197,94,.06)}
        .eyebrow.cyan{color:${CYAN};border-color:rgba(56,189,248,.2);background:rgba(56,189,248,.06)}
        h2{font-size:clamp(28px,3.8vw,42px);font-weight:950;margin:0 0 14px;line-height:1.1;letter-spacing:-.9px;color:${WHITE}}
        .section-sub{color:${LIGHT};font-size:15px;line-height:1.8;max-width:760px;margin:0 auto}

        /* ── PROBLEMA ── */
        .problem-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:40px}
        .problem-card{background:${PANEL};border:1px solid rgba(255,255,255,.055);border-radius:22px;padding:34px;position:relative;overflow:hidden}
        .problem-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
        .problem-card.before::before{background:linear-gradient(90deg,rgba(239,68,68,.7),transparent)}
        .problem-card.after::before{background:linear-gradient(90deg,${GREEN},transparent)}
        .problem-card h3{font-size:19px;font-weight:900;margin:0 0 14px;color:${WHITE}}
        .problem-card p{color:${LIGHT};font-size:14px;line-height:1.82}
        .sector-belt{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin-top:24px}
        .sector-pill{border:1px solid rgba(232,160,32,.2);background:rgba(232,160,32,.05);color:${LIGHT};border-radius:999px;padding:8px 16px;font-size:12px;font-weight:700;transition:border-color .2s}
        .sector-pill:hover{border-color:rgba(232,160,32,.5);color:${GOLD}}

        /* ── NORMAS TICKER GRID ── */
        .normas-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:8px;margin-top:32px}
        .norma-pill{background:rgba(56,189,248,.04);border:1px solid rgba(56,189,248,.12);border-radius:10px;padding:8px 14px;font-size:11px;font-weight:800;color:rgba(56,189,248,.75);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.3px;text-align:center;transition:background .2s,border-color .2s}
        .norma-pill:hover{background:rgba(56,189,248,.1);border-color:rgba(56,189,248,.35);color:${CYAN}}
        .norma-count-box{background:linear-gradient(135deg,rgba(56,189,248,.08),rgba(34,197,94,.06));border:1px solid rgba(56,189,248,.2);border-radius:18px;padding:28px 36px;text-align:center;margin-bottom:32px;display:flex;justify-content:center;gap:48px;flex-wrap:wrap}
        .nc-item{text-align:center}
        .nc-val{font-size:38px;font-weight:950;color:${CYAN};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;line-height:1}
        .nc-lbl{font-size:11px;color:${GRAY};margin-top:6px;letter-spacing:.3px;max-width:120px}

        /* ── WORKFLOW ── */
        .workflow{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;position:relative}
        .flow-connector{position:absolute;top:38px;left:calc(25% - 8px);right:calc(25% - 8px);height:2px;background:linear-gradient(90deg,rgba(232,160,32,.08),rgba(232,160,32,.4),rgba(34,197,94,.4),rgba(34,197,94,.08));pointer-events:none}
        .flow-card{background:${PANEL};border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:28px 22px;position:relative;overflow:hidden;transition:transform .2s,border-color .2s}
        .flow-card:hover{transform:translateY(-3px)}
        .flow-n-wrap{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;position:relative}
        .flow-number{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:17px;font-weight:900;letter-spacing:1px}
        .flow-card h3{margin:0 0 10px;font-size:16px;font-weight:900;color:${WHITE}}
        .flow-card p{margin:0;color:${LIGHT};font-size:13px;line-height:1.72}

        /* ── PREVIEW MOCKUP ── */
        .preview-wrap{background:${PANEL};border:1px solid rgba(232,160,32,.18);border-radius:22px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.55);max-width:900px;margin:0 auto}
        .preview-bar{background:#030812;border-bottom:1px solid rgba(255,255,255,.06);padding:12px 18px;display:flex;align-items:center;gap:8px}
        .preview-dot{width:10px;height:10px;border-radius:999px}
        .preview-title{font-size:11px;color:${GRAY};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-left:10px;letter-spacing:.5px}
        .preview-body{padding:24px;display:grid;grid-template-columns:200px 1fr;gap:0}
        .preview-sidebar{border-right:1px solid rgba(255,255,255,.06);padding-right:16px;display:flex;flex-direction:column;gap:4px}
        .preview-nav-item{padding:8px 12px;border-radius:8px;font-size:11px;color:${GRAY};font-weight:600}
        .preview-nav-item.active{background:rgba(34,197,94,.12);color:${GREEN};border-left:2px solid ${GREEN};font-weight:700}
        .preview-content{padding-left:24px}
        .preview-module-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
        .preview-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,${GOLD},${GOLD2});display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .preview-module-title{font-size:18px;font-weight:900;color:${WHITE}}
        .preview-module-norm{font-size:11px;color:${GRAY};margin-top:2px}
        .preview-inputs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
        .preview-field{background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 12px}
        .preview-field-lbl{font-size:9px;color:${GRAY};text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px;font-weight:700}
        .preview-field-val{font-size:14px;color:${WHITE};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700}
        .preview-btn{background:linear-gradient(135deg,${GOLD},${GOLD2});border-radius:8px;padding:10px 20px;font-size:12px;font-weight:800;color:${BG};width:100%;text-align:center;margin-bottom:16px}
        .preview-results{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .preview-res-card{background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:12px;text-align:center}
        .preview-res-lbl{font-size:9px;color:${GRAY};text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
        .preview-res-val{font-size:16px;font-weight:900;color:${GREEN};font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .preview-res-sub{font-size:9px;color:rgba(34,197,94,.5);margin-top:2px}
        .preview-export-row{display:flex;gap:8px;margin-top:12px}
        .preview-exp-btn{flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px;font-size:10px;font-weight:800;color:${GRAY};text-align:center}
        .preview-exp-btn.pdf{border-color:rgba(239,68,68,.3);color:#f87171;background:rgba(239,68,68,.05)}
        .preview-exp-btn.xls{border-color:rgba(34,197,94,.3);color:${GREEN};background:rgba(34,197,94,.05)}
        .preview-exp-btn.dxf{border-color:rgba(56,189,248,.3);color:${CYAN};background:rgba(56,189,248,.05)}
        .preview-exp-btn.qr{border-color:rgba(232,160,32,.3);color:${GOLD};background:rgba(232,160,32,.05)}
        .preview-norm-tag{background:rgba(0,0,0,.5);border:1px solid rgba(232,160,32,.2);border-radius:6px;padding:6px 10px;font-size:9px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:rgba(232,160,32,.6);margin-top:10px;font-weight:700}

        /* ── MÓDULOS ── */
        .modules-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}
        .module-card{background:${PANEL};border:1px solid rgba(255,255,255,.05);border-radius:16px;padding:20px;display:flex;gap:14px;align-items:flex-start;transition:transform .18s,border-color .2s,box-shadow .2s;position:relative;overflow:hidden}
        .module-card::after{content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s}
        .module-card:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,.35)}
        .module-icon-wrap{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;font-size:18px;background:rgba(255,255,255,.04)}
        .module-num{font-size:9px;font-weight:900;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:${GRAY};letter-spacing:1px;margin-bottom:2px}
        .module-name{font-size:14px;font-weight:900;color:${WHITE};margin-bottom:5px}
        .module-desc{font-size:12px;color:${GRAY};margin-bottom:8px;line-height:1.6}
        .module-footer{display:flex;justify-content:space-between;align-items:center}
        .module-norma{font-size:10px;font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2px;line-height:1.5;flex:1}
        .module-calcs{font-size:9px;color:${GRAY};font-weight:700;white-space:nowrap;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}

        /* ── INDUSTRIAS ── */
        .industrias-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px}
        .ind-card{background:${PANEL};border:1px solid rgba(255,255,255,.05);border-radius:18px;padding:26px;position:relative;overflow:hidden;transition:transform .2s}
        .ind-card:hover{transform:translateY(-3px)}
        .ind-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:3px}
        .ind-sector{font-size:14px;font-weight:900;color:${WHITE};margin-bottom:10px}
        .ind-uso{font-size:13px;color:${LIGHT};line-height:1.75}

        /* ── DIFERENCIALES ── */
        .diff-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:20px}
        .diff-card{background:${PANEL};border:1px solid rgba(255,255,255,.045);border-radius:20px;padding:30px 26px;position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s}
        .diff-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.4)}
        .diff-top{position:absolute;top:0;left:0;right:0;height:3px}
        .diff-icon-box{width:46px;height:46px;border-radius:14px;background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:950;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-bottom:18px}
        .diff-title{font-size:16px;font-weight:900;margin-bottom:10px;color:${WHITE}}
        .diff-desc{font-size:13px;color:${LIGHT};line-height:1.78}

        /* ── TRUST ── */
        .trust-box{background:linear-gradient(135deg,rgba(232,160,32,.07),rgba(34,197,94,.04));border:1px solid rgba(232,160,32,.18);border-radius:24px;padding:38px;margin-top:38px}
        .trust-box h3{font-size:22px;font-weight:950;margin-bottom:12px}
        .trust-list{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px}
        .trust-item{background:rgba(2,6,9,.4);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:18px;color:${LIGHT};font-size:13px;line-height:1.7}
        .trust-item strong{color:${GOLD};display:block;margin-bottom:4px;font-size:12px;letter-spacing:.5px;text-transform:uppercase}

        /* ── PLANES ── */
        .plans-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        .plan-card{background:${PANEL};border:1px solid rgba(255,255,255,.055);border-radius:22px;padding:32px 26px;display:flex;flex-direction:column;position:relative;min-height:460px;transition:transform .2s,box-shadow .2s}
        .plan-card:hover{transform:translateY(-3px)}
        .plan-card.featured{border-color:rgba(232,160,32,.45);box-shadow:0 0 50px rgba(232,160,32,.12)}
        .plan-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,${GOLD},${GOLD2});color:${BG};font-size:9px;font-weight:950;padding:5px 16px;border-radius:999px;letter-spacing:1.5px;white-space:nowrap;text-transform:uppercase}
        .plan-name{font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px}
        .price-row{display:flex;align-items:flex-end;gap:5px;margin-bottom:10px}
        .price{font-size:34px;font-weight:950;color:${WHITE};line-height:1;letter-spacing:-1.2px}
        .period{font-size:12px;color:${GRAY};margin-bottom:5px}
        .plan-sub{color:${GRAY};font-size:12px;line-height:1.7;min-height:52px}
        .plan-divider{height:1px;background:rgba(255,255,255,.055);margin:18px 0}
        .feature-list{list-style:none;display:flex;flex-direction:column;gap:10px;flex:1;margin-bottom:24px}
        .feature-list li{display:flex;gap:10px;font-size:13px;color:${LIGHT};line-height:1.5;align-items:flex-start}
        .check{flex-shrink:0;margin-top:1px}
        .plan-cta{display:block;text-align:center;padding:14px 12px;border-radius:13px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);color:${WHITE};font-weight:850;font-size:13px;text-decoration:none;letter-spacing:.3px;transition:background .2s}
        .plan-cta.featured{background:linear-gradient(135deg,${GOLD},${GOLD2});border:none;color:${BG};box-shadow:0 4px 24px rgba(232,160,32,.3)}
        .plan-cta:not(.featured):hover{background:rgba(255,255,255,.1)}
        .plan-cta-paypal{display:block;text-align:center;padding:12px 12px;margin-top:8px;border-radius:13px;background:#003087;border:none;color:#fff;font-weight:800;font-size:13px;text-decoration:none;letter-spacing:.3px;transition:opacity .2s}
        .plan-cta-paypal:hover{opacity:.85}

        /* ── INTELIGENCIA CRUZADA ── */
        .cruce-flow{display:grid;grid-template-columns:1fr 40px 1fr 40px 1fr;align-items:center;gap:0;margin-top:40px}
        .cruce-arrow{display:flex;align-items:center;justify-content:center;color:rgba(232,160,32,.5);font-size:22px;font-weight:300}
        .cruce-card{background:${PANEL};border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:24px 20px;position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s}
        .cruce-card:hover{transform:translateY(-3px);box-shadow:0 10px 36px rgba(0,0,0,.4)}
        .cruce-top-bar{position:absolute;top:0;left:0;right:0;height:3px;border-radius:18px 18px 0 0}
        .cruce-module{font-size:9px;font-weight:900;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .cruce-calc{font-size:15px;font-weight:900;color:${WHITE};margin-bottom:8px;line-height:1.3}
        .cruce-result{font-size:22px;font-weight:950;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;line-height:1;margin-bottom:6px}
        .cruce-norm{font-size:10px;color:${GRAY};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.3px}
        .cruce-ia-box{margin-top:36px;background:linear-gradient(135deg,rgba(232,160,32,.07),rgba(34,197,94,.05));border:1px solid rgba(232,160,32,.25);border-radius:16px;padding:24px 28px;display:flex;gap:20px;align-items:flex-start}
        .cruce-ia-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,${GOLD},#c47a10);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:950;color:${BG};flex-shrink:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .cruce-ia-title{font-size:13px;font-weight:800;color:${GOLD};margin-bottom:6px;letter-spacing:.3px}
        .cruce-ia-text{font-size:13px;color:#94a3b8;line-height:1.7}
        @media(max-width:640px){.cruce-flow{grid-template-columns:1fr;gap:0}.cruce-arrow{transform:rotate(90deg);height:32px}}

        /* ── FAQ ── */
        .faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .faq-card{background:${PANEL};border:1px solid rgba(255,255,255,.055);border-radius:18px;padding:26px}
        .faq-card h3{font-size:15px;font-weight:900;margin-bottom:10px;color:${WHITE};line-height:1.3}
        .faq-card p{color:${LIGHT};font-size:13px;line-height:1.8}

        /* ── FINAL CTA ── */
        .final-cta{position:relative;overflow:hidden;text-align:center;padding:92px 0}
        .final-cta-bg{position:absolute;inset:0;background:linear-gradient(180deg,${BG2} 0%,${BG} 100%)}
        .final-cta-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:400px;background:radial-gradient(ellipse,rgba(34,197,94,.07) 0%,rgba(232,160,32,.04) 40%,transparent 70%);pointer-events:none}
        .final-inner{max-width:700px;margin:0 auto;position:relative;padding:0 32px}
        .final-inner h2{font-size:clamp(28px,4vw,44px);font-weight:950;line-height:1.08;margin-bottom:18px;letter-spacing:-1px}
        .final-inner p{color:${LIGHT};font-size:15px;line-height:1.8;margin-bottom:38px}
        .disclaimer{max-width:960px;margin:28px auto 0;color:#334155;font-size:11px;line-height:1.8;text-align:center;padding:0 32px}

        /* ── FOOTER ── */
        .footer{border-top:1px solid rgba(255,255,255,.05);padding:36px 0}
        .footer-inner{max-width:1200px;margin:0 auto;padding:0 32px;display:grid;grid-template-columns:1fr auto;gap:32px;align-items:center}
        .footer-brand{display:flex;align-items:center;gap:12px}
        .footer-copy{font-size:12px;color:${GRAY};line-height:1.7}
        .footer-links{display:flex;gap:24px;flex-wrap:wrap;justify-content:flex-end}
        .footer-links a{color:${GRAY};font-size:12px;text-decoration:none;transition:color .2s}
        .footer-links a:hover{color:${WHITE}}
        .footer-links a.gold{color:${GOLD}}

        /* ── RESPONSIVE ── */
        @media(max-width:1000px){
          .nav-link:not(.login-btn){display:none}
          .hero-stats{grid-template-columns:repeat(2,1fr)}
          .h-stat:nth-child(2){border-right:none}
          .h-stat:nth-child(3){border-right:1px solid rgba(255,255,255,.06);border-top:1px solid rgba(255,255,255,.06)}
          .h-stat:nth-child(4){border-top:1px solid rgba(255,255,255,.06)}
          .problem-grid,.faq-grid,.trust-list{grid-template-columns:1fr}
          .workflow{grid-template-columns:repeat(2,1fr)}
          .flow-connector{display:none}
          .plans-grid{grid-template-columns:repeat(2,1fr)}
          .preview-body{grid-template-columns:1fr}
          .preview-sidebar{display:none}
          .preview-content{padding-left:0}
          .footer-inner{grid-template-columns:1fr}
          .footer-links{justify-content:flex-start}
        }
        @media(max-width:640px){
          .wrap{padding:0 18px}
          .header-inner{padding:0 18px}
          .brand-sub{display:none}
          .hero{padding:68px 0 56px}
          .hero-copy{font-size:15px}
          .actions a{width:100%}
          .h-stat{border-right:none!important;border-bottom:1px solid rgba(255,255,255,.06);padding:18px 0}
          .h-stat:last-child{border-bottom:none}
          .hero-stats{border-radius:14px}
          .section{padding:64px 0}
          .workflow,.plans-grid{grid-template-columns:1fr}
          .modules-grid,.diff-grid,.industrias-grid,.normas-grid{grid-template-columns:1fr}
          .normas-grid{grid-template-columns:repeat(2,1fr)}
          .nc-val{font-size:28px}
          .norma-count-box{gap:24px;padding:20px}
          .preview-results{grid-template-columns:1fr 1fr}
          .preview-inputs{grid-template-columns:1fr}
        }
      `}</style>

      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <header className="header">
        <div className="header-inner">
          <a href="/" className="brand" aria-label="INGENIUM Pro">
            <div className="brand-mark">Ω</div>
            <div className="brand-text">
              <div className="brand-title">INGENIUM PRO</div>
              <div className="brand-sub">ENGINEERING INTELLIGENCE PLATFORM</div>
            </div>
          </a>
          <nav className="nav" aria-label="Navegación principal">
            <a href="#problema"     className="nav-link">Problema</a>
            <a href="#modulos"      className="nav-link">Módulos</a>
            <a href="#normas"       className="nav-link">Normativas</a>
            <a href="#diferenciales"className="nav-link">Diferenciales</a>
            <a href="#planes"       className="nav-link">Planes</a>
            <a className="nav-link login-btn" href="/Login">Ingresar →</a>
          </nav>
        </div>
      </header>

      {/* ═══ TICKER ═══════════════════════════════════════════════ */}
      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker-track">
          {[...Array(2)].map((_, rep) => (
            <span key={rep} style={{ display:'flex', gap:0 }}>
              {['ASME B31.8','API 5L','IEC 60909','NACE MR0175','AWS D1.1','AISC 360-16','ACI 318-19','AASHTO 93','API RP 500','USACE EM 1110','ICOLD','ISA 75.01','Bieniawski 89','HEC-22','IEC 60079'].map((n, i) => (
                <span key={i} className="ticker-item">{n}<span className="ticker-sep"> · </span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap">
          <div className="hero-badge">
            <span className="dot-live" aria-hidden="true" />
            Plataforma activa · cálculo · auditoría IA · trazabilidad profesional
          </div>

          <h1>
            Inteligencia técnica para<br />
            <span className="gold-text">ingeniería de alto nivel</span>
          </h1>

          <p className="hero-copy">
            INGENIUM Pro centraliza 15 módulos de cálculo técnico con más de 130 normativas internacionales verificadas,
            auditoría IA, exportación PDF · Excel · DXF y firma QR en un único flujo de trabajo profesional.
            Para ingenieros que necesitan velocidad, precisión y trazabilidad sin concesiones.
          </p>
          <p className="hero-note">
            <strong>Regla profesional:</strong> Si ahorra 2 horas de un ingenieiro senior al mes, ya se pagó solo.
          </p>

          <div className="actions">
            <a href="/register" className="btn-primary">Probar demo profesional →</a>
            <a href="#modulos" className="btn-secondary">Ver módulos técnicos</a>
          </div>

          <div className="hero-stats" aria-label="Indicadores clave de INGENIUM Pro">
            {[
              { val:'15',          lbl:'Módulos técnicos activos' },
              { val:'130+',        lbl:'Normativas internacionales integradas' },
              { val:'PDF·XLS·DXF', lbl:'Formatos de exportación profesional' },
              { val:'IA + QR',     lbl:'Auditoría y trazabilidad verificable' },
            ].map(({ val, lbl }) => (
              <div className="h-stat" key={lbl}>
                <div className="h-stat-val">{val}</div>
                <div className="h-stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEMA ═══════════════════════════════════════════ */}
      <section id="problema" className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Problema real de la industria</div>
            <h2>La ingeniería no falla solo por falta de cálculo.<br />Falla por dispersión y falta de trazabilidad.</h2>
            <p className="section-sub">
              Planillas aisladas, criterios no documentados, informes manuales, versiones perdidas y cálculos sin
              trazabilidad generan pérdida de tiempo, errores críticos y decisiones difíciles de auditar o defender.
            </p>
          </div>

          <div className="problem-grid">
            <article className="problem-card before">
              <h3 style={{ color:'#f87171' }}>Sin INGENIUM Pro: proceso fragmentado</h3>
              <p>
                Un dato se carga en Excel, otro se verifica en PDF, el plano se ajusta en CAD, la norma queda aparte,
                el informe se redacta manualmente y la justificación técnica depende de archivos difíciles de reconstruir.
                Cada revisión cuesta horas. Cada auditoría es una crisis.
              </p>
            </article>
            <article className="problem-card after">
              <h3 style={{ color: GREEN }}>Con INGENIUM Pro: flujo técnico unificado</h3>
              <p>
                La plataforma integra datos, cálculo normativo, criterio técnico, auditoría IA, historial, exportación y
                verificación QR en un único flujo. Cada resultado puede revisarse, justificarse y presentarse con claridad
                profesional en minutos, no en horas.
              </p>
            </article>
          </div>

          <div className="sector-belt" aria-label="Sectores de aplicación">
            {['Petróleo & Gas','Minería Subterránea','Represas & Hidráulica','Vialidad & Infraestructura',
              'Electricidad Industrial','Soldadura Industrial','Ingeniería Civil','Arquitectura Técnica',
              'Cañerías & Integridad','Térmica & Proceso','Mantenimiento Industrial','Geotecnia'].map(s => (
              <span className="sector-pill" key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NORMATIVAS ══════════════════════════════════════════ */}
      <section id="normas" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow cyan">Cobertura normativa</div>
            <h2>130+ normativas internacionales integradas y verificadas</h2>
            <p className="section-sub">
              Cada módulo trabaja sobre fórmulas identificadas y referencias técnicas reales. Sin inventar datos.
              Sin ocultar el origen del cálculo. Transparencia técnica completa en cada resultado.
            </p>
          </div>

          <div className="norma-count-box">
            {[
              { val:'40+', lbl:'Normas ASME y API\nPetróleo, gas, presión, soldadura' },
              { val:'25+', lbl:'Normas IEC y NEC\nElectricidad industrial' },
              { val:'20+', lbl:'Normas AISC, ACI, ASCE\nEstructuras y civil' },
              { val:'45+', lbl:'Normas sectoriales\nHidráulica, vialidad, minería, más' },
            ].map(({ val, lbl }) => (
              <div className="nc-item" key={val}>
                <div className="nc-val">{val}</div>
                <div className="nc-lbl">{lbl}</div>
              </div>
            ))}
          </div>

          <div className="normas-grid" aria-label="Lista de normativas">
            {NORMAS.map(n => <div className="norma-pill" key={n}>{n}</div>)}
          </div>
        </div>
      </section>

      {/* ═══ PREVIEW MOCKUP ══════════════════════════════════════ */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow green">Interfaz profesional</div>
            <h2>Del dato al informe en minutos</h2>
            <p className="section-sub">
              Cada módulo tiene una interfaz clara, con parámetros de entrada técnicos, resultados inmediatos
              y exportación integrada. Sin curvas de aprendizaje. Diseñado por y para ingenieros.
            </p>
          </div>

          <div className="preview-wrap" aria-label="Vista previa del módulo Petróleo — MAOP">
            <div className="preview-bar">
              <div className="preview-dot" style={{ background:'#ef4444' }} />
              <div className="preview-dot" style={{ background:'#f59e0b' }} />
              <div className="preview-dot" style={{ background:'#22c55e' }} />
              <span className="preview-title">INGENIUM PRO v8.1 — Módulo Petróleo / MAOP · ASME B31.8</span>
            </div>
            <div className="preview-body">
              <div className="preview-sidebar">
                {['Petróleo / MAOP','Perforación','Hidráulica','Cañerías','Electricidad','Soldadura','Represas','Vialidad','MMO','Válvulas','Civil','Arquitectura','Minería','Térmica','Geotecnia'].map((m, i) => (
                  <div key={m} className={`preview-nav-item${i === 0 ? ' active' : ''}`}>{m}</div>
                ))}
              </div>
              <div className="preview-content">
                <div className="preview-module-header">
                  <div className="preview-icon">🛢️</div>
                  <div>
                    <div className="preview-module-title">Presión máxima admisible — MAOP</div>
                    <div className="preview-module-norm">ASME B31.8-2022 · API 5L · Factor de diseño E×T×F</div>
                  </div>
                </div>
                <div className="preview-inputs">
                  {[
                    { lbl:'SMYS (psi)', val:'52,000' },
                    { lbl:'Diámetro ext. (in)', val:'16.00' },
                    { lbl:'Espesor pared (in)', val:'0.375' },
                    { lbl:'Factor diseño F', val:'0.72' },
                    { lbl:'Factor junta E', val:'1.00' },
                    { lbl:'Factor temp. T', val:'1.00' },
                  ].map(({ lbl, val }) => (
                    <div key={lbl} className="preview-field">
                      <div className="preview-field-lbl">{lbl}</div>
                      <div className="preview-field-val">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="preview-btn">▶ CALCULAR MAOP — ASME B31.8</div>
                <div className="preview-results">
                  <div className="preview-res-card">
                    <div className="preview-res-lbl">MAOP</div>
                    <div className="preview-res-val">1,404 psi</div>
                    <div className="preview-res-sub">97.2 bar</div>
                  </div>
                  <div className="preview-res-card">
                    <div className="preview-res-lbl">Presión Barlow</div>
                    <div className="preview-res-val">1,950 psi</div>
                    <div className="preview-res-sub">134.5 bar</div>
                  </div>
                  <div className="preview-res-card">
                    <div className="preview-res-lbl">Estado</div>
                    <div className="preview-res-val" style={{ color: GREEN }}>SEGURO</div>
                    <div className="preview-res-sub">Margen: 28%</div>
                  </div>
                </div>
                <div className="preview-export-row">
                  <div className="preview-exp-btn pdf">PDF</div>
                  <div className="preview-exp-btn xls">Excel</div>
                  <div className="preview-exp-btn dxf">DXF</div>
                  <div className="preview-exp-btn qr">QR</div>
                </div>
                <div className="preview-norm-tag">ASME B31.8-2022 § 841.1.1 — Fórmula: MAOP = 2S × t × F × E × T / D</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FLUJO ═══════════════════════════════════════════════ */}
      <section id="flujo" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow green">Flujo profesional</div>
            <h2>Del dato técnico al informe verificable</h2>
            <p className="section-sub">
              INGENIUM Pro está diseñado para que el resultado no sea un número aislado,
              sino una decisión técnica documentada, auditable y exportable en cualquier formato profesional.
            </p>
          </div>

          <div className="workflow">
            <div className="flow-connector" aria-hidden="true" />
            {flujo.map(({ n, title, desc, color }) => (
              <article className="flow-card" key={n}>
                <div className="flow-n-wrap" style={{ background:`${color}12` }}>
                  <span className="flow-number" style={{ color }}>{n}</span>
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MÓDULOS ═════════════════════════════════════════════ */}
      <section id="modulos" className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Cobertura técnica</div>
            <h2>15 módulos para contextos industriales, energéticos e infraestructura</h2>
            <p className="section-sub">
              Cada módulo trabaja con fórmulas identificables, datos de entrada claros, normativas reales y resultados
              trazables. El objetivo es potenciar al profesional, no reemplazar su criterio.
            </p>
          </div>

          <ModulosCarrusel modulos={modulos} />
        </div>
      </section>

      {/* ═══ EXPORTACIÓN ═════════════════════════════════════════ */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Demostración en vivo</div>
            <h2>Así exporta INGENIUM PRO — Válvulas</h2>
            <p className="section-sub">
              Cada módulo genera 4 entregables reales: PDF con QR verificable, Excel con fórmulas editables,
              plano DXF para fabricación y código QR auditable por terceros.
            </p>
          </div>
          <ExportacionCarrusel />
        </div>
      </section>

      {/* ═══ INDUSTRIAS ══════════════════════════════════════════ */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow cyan">Aplicaciones por industria</div>
            <h2>Casos de uso reales en cada sector</h2>
            <p className="section-sub">
              Los módulos están diseñados para escenarios técnicos reales de cada industria,
              con normativas, fórmulas y criterios específicos de cada disciplina.
            </p>
          </div>

          <div className="industrias-grid">
            {industrias.map(({ sector, uso, color }) => (
              <article key={sector} className="ind-card" style={{ borderLeft:`3px solid ${color}` }}>
                <div className="ind-sector" style={{ color }}>{sector}</div>
                <div className="ind-uso">{uso}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DIFERENCIALES ═══════════════════════════════════════ */}
      <section id="diferenciales" className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow green">Diferenciales clave</div>
            <h2>Más que calcular: documentar, auditar y justificar</h2>
            <p className="section-sub">
              La diferencia no está en tener módulos. Está en que cada resultado pueda explicar de dónde salió,
              qué datos usó, qué criterio aplicó y cómo puede verificarse externamente.
            </p>
          </div>

          <div className="diff-grid">
            {diferenciales.map(({ icon, title, desc, color }) => (
              <article key={title} className="diff-card">
                <div className="diff-top" style={{ background:`linear-gradient(90deg,${color},transparent)` }} />
                <div className="diff-icon-box" style={{ color, border:`1px solid ${color}22` }}>{icon}</div>
                <div className="diff-title">{title}</div>
                <div className="diff-desc">{desc}</div>
              </article>
            ))}
          </div>

          <div className="trust-box">
            <h3>La trazabilidad es el verdadero valor técnico diferencial</h3>
            <p style={{ color:LIGHT, lineHeight:1.8, fontSize:14 }}>
              Cada cálculo debe poder responder: qué datos se usaron, qué fórmula intervino, qué criterio técnico
              se aplicó, qué referencia normativa se consideró, quién generó el informe, cuándo fue emitido
              y qué versión del resultado fue documentada.
            </p>
            <div className="trust-list">
              <div className="trust-item">
                <strong>Datos visibles</strong>
                Datos de entrada explícitos, revisables en cualquier momento por el equipo o auditoría externa.
              </div>
              <div className="trust-item">
                <strong>Criterio documentado</strong>
                Resultados acompañados por criterio técnico, observaciones de la IA y normativa aplicada.
              </div>
              <div className="trust-item">
                <strong>Exportación útil</strong>
                PDF para informe, Excel para continuidad de análisis y DXF para documentación técnica CAD-compatible.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INTELIGENCIA CRUZADA ══════════════════════════════ */}
      <section id="cruce" className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow green">Diferenciador único de mercado</div>
            <h2>Inteligencia Cruzada entre módulos</h2>
            <p className="section-sub">
              La IA no analiza cada módulo por separado. Cruza los resultados de distintos módulos para detectar
              riesgos encadenados que un cálculo aislado nunca puede ver. Ninguna otra plataforma del mercado hace esto.
            </p>
          </div>

          <div className="cruce-flow">
            {/* Paso 1 — Válvulas */}
            <article className="cruce-card">
              <div className="cruce-top-bar" style={{ background:'linear-gradient(90deg,#E8A020,transparent)' }} />
              <div className="cruce-module" style={{ color:'#E8A020' }}>Módulo Válvulas</div>
              <div className="cruce-calc">Cierre de válvula de bloqueo</div>
              <div className="cruce-result" style={{ color:'#E8A020' }}>3 s</div>
              <div className="cruce-norm">ASME B16.34 · ISA 75.01</div>
            </article>

            <div className="cruce-arrow" aria-hidden="true">→</div>

            {/* Paso 2 — Hidráulica */}
            <article className="cruce-card">
              <div className="cruce-top-bar" style={{ background:'linear-gradient(90deg,#38bdf8,transparent)' }} />
              <div className="cruce-module" style={{ color:'#38bdf8' }}>Módulo Hidráulica</div>
              <div className="cruce-calc">Golpe de ariete (Joukowsky)</div>
              <div className="cruce-result" style={{ color:'#38bdf8' }}>+47 bar</div>
              <div className="cruce-norm">AWWA M11 · ASME B31.3</div>
            </article>

            <div className="cruce-arrow" aria-hidden="true">→</div>

            {/* Paso 3 — Cañerías */}
            <article className="cruce-card">
              <div className="cruce-top-bar" style={{ background:'linear-gradient(90deg,#ef4444,transparent)' }} />
              <div className="cruce-module" style={{ color:'#ef4444' }}>Módulo Cañerías</div>
              <div className="cruce-calc">Riesgo de sobrepresión</div>
              <div className="cruce-result" style={{ color:'#ef4444' }}>CRÍTICO</div>
              <div className="cruce-norm">ASME B31.8 · API 579</div>
            </article>
          </div>

          <div className="cruce-ia-box">
            <div className="cruce-ia-icon">IA</div>
            <div>
              <div className="cruce-ia-title">Diagnóstico IA cruzado</div>
              <div className="cruce-ia-text">
                El cierre en 3 s genera una sobrepresión transitoria de 47 bar por golpe de ariete (Joukowsky).
                Ese valor supera la presión máxima admisible calculada en el módulo de Cañerías para este diámetro y
                espesor bajo ASME B31.8. Riesgo de falla estructural en el tramo aguas arriba de la válvula.
                Ninguno de los tres módulos, tomado en forma aislada, hubiera detectado este escenario.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PLANES ══════════════════════════════════════════════ */}
      <section id="planes" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Acceso profesional</div>
            <h2>Planes para profesionales y equipos técnicos</h2>
            <p className="section-sub">
              La plataforma se cobra por acceso porque concentra cálculo normativo, documentación, auditoría IA,
              historial y exportación técnica en un flujo profesional unificado.
            </p>
          </div>

          <div className="plans-grid">
            {planes.map(p => (
              <article key={p.nombre} className={`plan-card${p.destacado ? ' featured' : ''}`}>
                {p.destacado && <div className="plan-badge">MÁS ELEGIDO</div>}
                <div className="plan-name" style={{ color:p.color }}>{p.nombre}</div>
                <div className="price-row">
                  <span className="price">{p.precio}</span>
                  <span className="period">/{p.periodo}</span>
                </div>
                <div className="plan-sub">{p.bajada}</div>
                <div className="plan-divider" />
                <ul className="feature-list">
                  {p.features.map(f => (
                    <li key={f}>
                      <span className="check" style={{ color:p.color }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a className={`plan-cta${p.destacado ? ' featured' : ''}`} href={p.href}>{p.cta}</a>
                {'paypalHref' in p && p.paypalHref && (
                  <a className="plan-cta-paypal" href={p.paypalHref} target="_blank" rel="noopener noreferrer">
                    Pagar con PayPal (USD)
                  </a>
                )}
              </article>
            ))}
          </div>

          <p className="disclaimer">
            Pagos internacionales vía Payoneer · MercadoPago disponible para América Latina
            · Sin permanencia mínima · Cancelás cuando querés · Facturación disponible
          </p>
        </div>
      </section>

      {/* ═══ FAQ ═════════════════════════════════════════════════ */}
      <section id="faq" className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow green">Preguntas clave</div>
            <h2>Claridad antes de contratar</h2>
            <p className="section-sub">
              Una plataforma técnica necesita venderse con fuerza, pero también con responsabilidad,
              límites claros y confianza profesional. Sin promesas vagas.
            </p>
          </div>

          <div className="faq-grid">
            {faqs.map(([q, a]) => (
              <article key={q} className="faq-card">
                <h3>{q}</h3>
                <p>{a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══════════════════════════════════════════ */}
      <section className="final-cta">
        <div className="final-cta-bg" aria-hidden="true" />
        <div className="final-cta-glow" aria-hidden="true" />
        <div className="final-inner">
          <h2>
            INGENIUM Pro no reemplaza al profesional.<br />
            <span style={{ color: GOLD }}>Lo hace más rápido, más preciso y más trazable.</span>
          </h2>
          <p>
            Probá la plataforma, revisá los módulos y evaluá si puede ahorrar tiempo,
            ordenar procesos y mejorar la documentación técnica de tu trabajo o equipo.
            Sin tarjeta de crédito. Sin compromiso.
          </p>
          <div className="actions" style={{ marginBottom:0 }}>
            <a href="/register" className="btn-primary">Crear cuenta demo gratuita →</a>
            <a className="btn-secondary">Contactar ventas</a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════ */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <div className="brand-mark" style={{ width:32, height:32, borderRadius:10, fontSize:15 }}>Ω</div>
              <div>
                <div style={{ fontWeight:900, fontSize:13, letterSpacing:2 }}>INGENIUM PRO</div>
                <div style={{ fontSize:10, color:GRAY, letterSpacing:2 }}>RADAR Gestión Estratégica</div>
              </div>
            </div>
            <div className="footer-copy" style={{ marginTop:10 }}>
              © 2026 Silvana Belén Colombo · INGENIUM Pro · Todos los derechos reservados<br />
              Plataforma de cálculo técnico profesional · Río Negro, Argentina
            </div>
          </div>
          <div className="footer-links">
            <a href="#planes">Planes</a>
            <a href="#modulos">Módulos</a>
            <a href="#normas">Normativas</a>
            <a href="/terminos">Términos de uso</a>
            <a href="/privacidad">Privacidad</a>
            <a href="/verify/demo">Verificación QR</a>
            <span className="gold">radargestionestrategica@gmail.com</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
