'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// ═══════════════════════════════════════════════════════════════
// INGENIUM PRO v8.1 — ESTRUCTURA PROTEGIDA TOPE DE GAMA
// ═══════════════════════════════════════════════════════════════

interface Usuario {
  nombre: string;
  empresa: string;
  plan: string;
  pais: string;
}

const MODULOS = [
  { id: 'petroleo', titulo: 'Petróleo & Gas', desc: 'MAOP, Barlow, factor E·T, análisis riesgo', icono: '🛢️', color: '#f59e0b', norma: 'ASME B31.8 · API 5L · API 1104' },
  { id: 'hidraulica', titulo: 'Hidráulica', desc: 'Darcy-Weisbach, Joukowsky, golpe de ariete', icono: '💧', color: '#06b6d4', norma: 'AWWA M11 · ASME B31.3' },
  { id: 'perforacion', titulo: 'Perforación', desc: 'Lodo, ECD, gradiente fractura, Eaton', icono: '⛏️', color: '#8b5cf6', norma: 'API RP 13D · API RP 7G · DNV' },
  { id: 'mineria', titulo: 'Minería', desc: 'RMR Bieniawski, UCS, voladura, ventilación', icono: '🪨', color: '#ef4444', norma: 'Bieniawski (1989) · MSHA · ISO' },
  { id: 'civil', titulo: 'Ingeniería Civil', desc: 'Perfiles W, vigas, columnas, cargas', icono: '🏗️', color: '#3b82f6', norma: 'AISC 360 · ACI 318 · CIRSOC 301' },
  { id: 'geotecnia', titulo: 'Geotecnia', desc: 'Portante Meyerhof, Bishop, nivel freático', icono: '🌍', color: '#a16207', norma: 'Meyerhof (1963) · CIRSOC 101' },
  { id: 'termica', titulo: 'Térmica', desc: 'LMTD, intercambiadores, dilatación', icono: '🌡️', color: '#dc2626', norma: 'TEMA · ASME Sec.VIII · Kern (1950)' },
  { id: 'vialidad', titulo: 'Vialidad', desc: 'AASHTO 93, pavimento flexible/rígido', icono: '🛣️', color: '#16a34a', norma: 'AASHTO Guide 1993 · Manual DG-2018' },
  { id: 'arquitectura', titulo: 'Arquitectura Técnica', desc: 'Cargas de viento, sismo, ASCE 7-22', icono: '🏛️', color: '#0891b2', norma: 'ASCE 7-22 · CIRSOC 103 · NSR-10' },
  { id: 'represas', titulo: 'Represas & Presas', desc: 'Francis, Darcy filtraciones, Terzaghi', icono: '🏞️', color: '#0284c7', norma: 'USACE EM 1110-2 · ICOLD' },
  { id: 'soldadura', titulo: 'Soldadura', desc: 'Electrodos, Heat Input, filete, CE precal.', icono: '⚡', color: '#d97706', norma: 'AWS D1.1:2020 · ASME Sec.IX · API 1104' },
  { id: 'mmo', titulo: 'Maestro Mayor de Obra', desc: 'Hormigón, hierro, mampostería, losas, zapata',icono: '🧱', color: '#10b981', norma: 'CIRSOC 201 · ACI 318 · NCh 170 · NSR-10' },
  { id: 'electricidad', titulo: 'Electricidad Industrial',desc: 'Cable, CC, FP, motor, área peligrosa, lux', icono: '🔋', color: '#22c55e', norma: 'NEC 2023 · IEC 60909 · API RP 500 · IEC 60079' },
];

const PLAN_COLOR: Record<string, string> = { trial: '#f59e0b', pro: '#6366f1', enterprise: '#10b981' };
const PLAN_LABEL: Record<string, string> = { trial: 'TRIAL', pro: 'PRO', enterprise: 'ENTERPRISE' };

export default function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargado, setCargado] = useState(false);
  const [leyendo, setLeyendo] = useState(false);
  const [sistemaMedidas, setSistemaMedidas] = useState('SI (m, kg, °C)');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('ingenium_usuario');
    if (!stored) { router.push('/Login'); return; }
    try { setUsuario(JSON.parse(stored)); } catch { router.push('/Login'); }
    finally { setCargado(true); }
  }, [router]);

  const cerrarSesion = () => {
    localStorage.removeItem('ingenium_usuario');
    router.push('/Login');
  };

  const hablarEstado = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const texto = `Hola ${usuario?.nombre.split(' ')[0]}. INGENIUM PRO versión 8.1 está operativa. Motor matemático KaTeX activo y sistema de medidas en ${sistemaMedidas}.`;
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-ES';
    u.onstart = () => setLeyendo(true);
    u.onend = () => setLeyendo(false);
    window.speechSynthesis.speak(u);
  };

  if (!cargado) return (
    <div style={{ minHeight: '100vh', background: '#070d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6366f1', fontSize: 14 }}>Cargando INGENIUM PRO...</div>
    </div>
  );

  if (!usuario) return null;
  const plan = usuario.plan?.toLowerCase() || 'trial';

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', fontFamily: 'Inter, system-ui, sans-serif', color: '#f1f5f9' }}>

      {/* HEADER PROTEGIDO */}
      <header style={{ background: 'rgba(7,13,26,0.98)', borderBottom: '1px solid rgba(99,102,241,0.25)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#fff', flexShrink: 0 }}>IP</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>INGENIUM PRO v8.1</div>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.5px' }}>Auditoría y Precisión Técnica de Alta Gama</div>
        </div>

        {/* SELECTOR DE MEDIDAS */}
        <select value={sistemaMedidas} onChange={(e) => setSistemaMedidas(e.target.value)}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', fontSize: 11, padding: '6px 12px', borderRadius: 8, outline: 'none', cursor: 'pointer' }}>
          <option value="SI (m, kg, °C)">S. Internacional (m, kg, °C)</option>
          <option value="Imperial (ft, lb, °F)">S. Imperial (ft, lb, °F)</option>
        </select>

        {/* BOTÓN DE VOZ ACCESIBILIDAD */}
        <button onClick={leyendo ? () => window.speechSynthesis.cancel() : hablarEstado}
          style={{ padding: '8px', background: leyendo ? '#ef4444' : '#1e293b', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', color: '#fff' }}>
          {leyendo ? '🔇' : '🔊'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{usuario.nombre}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>{usuario.empresa}</div>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 20, background: `${PLAN_COLOR[plan]}20`, border: `1px solid ${PLAN_COLOR[plan]}50`, color: PLAN_COLOR[plan], fontSize: 10, fontWeight: 800 }}>
            {PLAN_LABEL[plan]}
          </div>
          <button onClick={cerrarSesion} style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
            Salir
          </button>
        </div>
      </header>

      {/* CUERPO DEL DASHBOARD */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px' }}>Bienvenido, {usuario.nombre.split(' ')[0]} 👋</h1>
          <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>Cálculos configurados en {sistemaMedidas}. Seleccioná un módulo:</p>
        </div>

        {/* BOTÓN IA CON MOTOR MATEMÁTICO */}
        <div onClick={() => router.push(`/?modulo=chat&sys=${sistemaMedidas}`)}
          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 16, padding: '20px 24px', marginBottom: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#a78bfa' }}>Asistente IA — High-End Math v8.1</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Fórmulas matemáticas reales (LaTeX) y normativas internacionales ASME, API, AISC.</div>
          </div>
          <div style={{ fontSize: 20, color: '#6366f1' }}>→</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {MODULOS.map(m => (
            <div key={m.id} onClick={() => router.push(`/?modulo=${m.id}&sys=${sistemaMedidas}`)}
              style={{ background: 'rgba(15,23,42,0.8)', border: `1px solid ${m.color}20`, borderRadius: 16, padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: m.color, borderRadius: '16px 16px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, border: `1px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{m.icono}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{m.titulo}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>{m.desc}</div>
                  <div style={{ padding: '3px 8px', background: `${m.color}10`, border: `1px solid ${m.color}30`, borderRadius: 8, display: 'inline-block', fontSize: 9, color: m.color, fontWeight: 700 }}>
                    {m.norma}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}