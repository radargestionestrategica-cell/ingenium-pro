'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import ModuloPetroleo     from '@/components/ModuloPetroleo';
import ModuloHidraulica   from '@/components/ModuloHidraulica';
import ModuloPerforacion  from '@/components/ModuloPerforacion';
import ModuloMineria      from '@/components/ModuloMineria';
import ModuloCivil        from '@/components/ModuloCivil';
import ModuloGeotecnia    from '@/components/ModuloGeotecnia';
import ModuloTermica      from '@/components/ModuloTermica';
import ModuloVialidad     from '@/components/ModuloVialidad';
import ModuloArquitectura from '@/components/ModuloArquitectura';
import ModuloRepresas     from '@/components/ModuloRepresas';
import ModuloSoldadura    from '@/components/ModuloSoldadura';
import ModuloMMO          from '@/components/ModuloMMO';
import ModuloElectricidad from '@/components/ModuloElectricidad';

const TABS = [
  { id: 'chat',          label: 'Chat IA',       icono: '🤖', color: '#6366f1' },
  { id: 'petroleo',      label: 'Petróleo',       icono: '🛢️',  color: '#f59e0b' },
  { id: 'hidraulica',    label: 'Hidráulica',     icono: '💧',  color: '#06b6d4' },
  { id: 'perforacion',   label: 'Perforación',    icono: '⛏️',  color: '#8b5cf6' },
  { id: 'mineria',       label: 'Minería',        icono: '🪨',  color: '#ef4444' },
  { id: 'civil',         label: 'Civil',          icono: '🏗️',  color: '#3b82f6' },
  { id: 'geotecnia',     label: 'Geotecnia',      icono: '🌍',  color: '#a16207' },
  { id: 'termica',       label: 'Térmica',        icono: '🌡️',  color: '#dc2626' },
  { id: 'vialidad',      label: 'Vialidad',       icono: '🛣️',  color: '#16a34a' },
  { id: 'arquitectura',  label: 'Arquitectura',   icono: '🏛️',  color: '#0891b2' },
  { id: 'represas',      label: 'Represas',       icono: '🏞️',  color: '#0284c7' },
  { id: 'soldadura',     label: 'Soldadura',      icono: '⚡',  color: '#d97706' },
  { id: 'mmo',           label: 'MMO',            icono: '🧱',  color: '#10b981' },
  { id: 'electricidad',  label: 'Electricidad',   icono: '🔋',  color: '#22c55e' },
];

const EJEMPLOS = [
  'MAOP gasoducto 12" API 5L X65 E_joint=0.85 T=80°C F=0.72',
  'Golpe de ariete DN400 L=2km cierre instantáneo acero',
  'ECD lodo 11.5 ppg TVD=3000m casing 9-5/8" HPHT',
  'Viga W310x39 A36 momento 120 kN·m — AISC 360',
  'Cable trifásico 100A cobre 380V longitud 150m caída tensión',
];

export default function IngeniumPro() {
  const [tab, setTab] = useState('chat');
  const [sistemaMedidas, setSistemaMedidas] = useState('SI (m, kg, °C)');
  const [leyendo, setLeyendo] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const [msgs, setMsgs] = useState([{
    role: 'assistant',
    content: '# INGENIUM PRO v8.1\n\nMotor de Auditoría Senior activado. Los resultados se mostrarán en tablas ejecutivas. Cero desarrollo aritmético.'
  }]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('modulo');
    if (m && TABS.find(t => t.id === m)) setTab(m);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]); // Agregué "loading" para que haga auto-scroll al "Analizando..."

  const hablar = (texto: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto.replace(/[$#*_|]/g, ''));
    u.lang = 'es-ES';
    u.onstart = () => setLeyendo(true);
    u.onend = () => setLeyendo(false);
    window.speechSynthesis.speak(u);
  };

  const send = async (texto?: string) => {
    const msg = (texto || input).trim();
    if (!msg || loading) return;
    setInput('');
    const nuevos = [...msgs, { role: 'user', content: msg }];
    setMsgs(nuevos);
    setLoading(true);

    const SYS_PROMPT = `Sos INGENIUM PRO v8.1 — Software de Auditoría Técnica de Alta Gama.
    ORDEN ESTRICTA: El usuario es un Ingeniero Senior. PROHIBIDO mostrar pasos aritméticos, multiplicaciones o sustitución de valores. Sos un software ejecutivo, NO una calculadora escolar.

    ESTRUCTURA DE RESPUESTA OBLIGATORIA:
    1. TABLA EJECUTIVA: Parámetro | Resultado Final | Límite Norma | Estado (✅/❌/⚠️).
    2. VEREDICTO: Dictamen directo (CUMPLE/NO CUMPLE) citando la norma (ASME, API, AISC).
    3. ACCIÓN: Si no cumple, da la solución técnica inmediata.
    4. RESPALDO TEÓRICO: Solo la fórmula base de gobierno en LaTeX (Ej: $$M_n = F_y \\cdot Z_x$$). NUNCA EL PASO A PASO.

    SISTEMA DE UNIDADES: ${sistemaMedidas}.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: SYS_PROMPT, messages: nuevos }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || data.reply || 'Error de red.';
      setMsgs([...nuevos, { role: 'assistant', content: reply }]);
      if (leyendo) hablar(reply);
    } catch {
      setMsgs([...nuevos, { role: 'assistant', content: 'Falla de conexión.' }]);
    } finally {
      setLoading(false);
    }
  };

  const tabActivo = TABS.find(t => t.id === tab);

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', display: 'flex', flexDirection: 'column', fontFamily: 'Inter,-apple-system,sans-serif', color: '#f1f5f9' }}>

      {/* ANIMACIÓN CSS INYECTADA PARA EL LOADER */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse-border { 0% { border-color: rgba(99,102,241,0.3); } 50% { border-color: rgba(99,102,241,0.8); } 100% { border-color: rgba(99,102,241,0.3); } }
      `}} />

      {/* HEADER */}
      <header style={{ background: 'rgba(7,13,26,0.98)', borderBottom: '1px solid rgba(99,102,241,0.25)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#fff', flexShrink: 0 }}>IP</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>INGENIUM PRO v8.1</div>
          <div style={{ fontSize: 10, color: '#475569' }}>Auditoría Senior · © 2026 Silvana Belén Colombo</div>
        </div>
        <select value={sistemaMedidas} onChange={(e) => setSistemaMedidas(e.target.value)}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: 11, padding: '5px 10px', borderRadius: 8, cursor: 'pointer' }}>
          <option value="SI (m, kg, °C)">S. Internacional</option>
          <option value="Imperial (ft, lb, °F)">S. Imperial</option>
        </select>
        <button onClick={() => leyendo ? window.speechSynthesis.cancel() : hablar(msgs[msgs.length-1].content)}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff', padding: '8px', cursor: 'pointer' }}>
          {leyendo ? '🔇' : '🔊'}
        </button>
      </header>

      {/* TABS */}
      <nav style={{ background: 'rgba(7,13,26,0.95)', borderBottom: '1px solid rgba(99,102,241,0.12)', padding: '0 8px', overflowX: 'auto', display: 'flex', gap: 1, scrollbarWidth: 'none', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 11px', border: 'none', background: 'transparent',
            color: tab === t.id ? t.color : '#475569',
            borderBottom: tab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
            fontWeight: tab === t.id ? 700 : 400,
            fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>
            <span style={{ marginRight: 4 }}>{t.icono}</span>{t.label}
          </button>
        ))}
      </nav>

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab !== 'chat' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'petroleo' && <ModuloPetroleo />}
            {tab === 'hidraulica' && <ModuloHidraulica />}
            {tab === 'perforacion' && <ModuloPerforacion />}
            {tab === 'mineria' && <ModuloMineria />}
            {tab === 'civil' && <ModuloCivil />}
            {tab === 'geotecnia' && <ModuloGeotecnia />}
            {tab === 'termica' && <ModuloTermica />}
            {tab === 'vialidad' && <ModuloVialidad />}
            {tab === 'arquitectura' && <ModuloArquitectura />}
            {tab === 'represas' && <ModuloRepresas />}
            {tab === 'soldadura' && <ModuloSoldadura />}
            {tab === 'mmo' && <ModuloMMO />}
            {tab === 'electricidad' && <ModuloElectricidad />}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '90%', padding: '16px 20px', borderRadius: 16,
                    background: m.role === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#0f172a',
                    border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0', fontSize: 13
                  }}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath, remarkGfm]} 
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        table: ({...p}) => <div style={{overflowX: 'auto'}}><table style={{borderCollapse: 'collapse', width: '100%', margin: '15px 0', fontSize: '13px', border: '1px solid #1e293b', borderRadius: '8px'}} {...p}/></div>,
                        th: ({...p}) => <th style={{borderBottom: '2px solid #334155', padding: '12px', background: '#0a0f1e', textAlign: 'left', color: '#a78bfa', fontWeight: 800}} {...p}/>,
                        td: ({...p}) => <td style={{borderBottom: '1px solid #1e293b', padding: '12px'}} {...p}/>,
                        h1: ({...p}) => <h1 style={{fontSize: 18, fontWeight: 900, color: '#fff', borderBottom: '1px solid #1e293b', paddingBottom: 6, marginBottom: 12}} {...p}/>,
                        h2: ({...p}) => <h2 style={{fontSize: 15, fontWeight: 800, color: '#6366f1', marginTop: 18, marginBottom: 10}} {...p}/>,
                        strong: ({...p}) => <strong style={{color: '#f8fafc', fontWeight: 700}} {...p}/>
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {/* === NUEVO: INDICADOR ANIMADO DE "ANALIZANDO" === */}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '12px 20px', borderRadius: 16,
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#a78bfa', fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 10,
                    animation: 'pulse-border 2s infinite'
                  }}>
                    <div style={{ animation: 'spin 1.5s linear infinite', fontSize: 16, display: 'flex', alignItems: 'center' }}>⚙️</div>
                    Analizando parámetros y cruzando normativas...
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div style={{ padding: '6px 12px 8px', borderTop: '1px solid rgba(99,102,241,0.1)', display: 'flex', gap: 5, overflowX: 'auto' }}>
              {EJEMPLOS.map((ej, i) => (
                <button key={i} onClick={() => send(ej)} style={{ padding: '6px 12px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 14, color: '#94a3b8', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>{ej}</button>
              ))}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(99,102,241,0.15)', display: 'flex', gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                style={{ flex: 1, padding: '14px 16px', background: '#0a0f1e', border: '1px solid #334155', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none' }}
                placeholder="Consulta técnica ejecutiva (Ej: Viga W310x39 A36...)" />
              <button onClick={() => send()} style={{ padding: '0 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>→</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}