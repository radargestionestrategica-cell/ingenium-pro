'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// ═══════════════════════════════════════════════════════════════
//  IMPORTACIÓN DE MÓDULOS TÉCNICOS (ESTRUCTURA PROTEGIDA)
// ═══════════════════════════════════════════════════════════════
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

export default function DashboardPage() {
  const [tab, setTab] = useState('chat');
  const [sistemaMedidas, setSistemaMedidas] = useState('Sistema Internacional (m, kg, °C)');
  const [leyendo, setLeyendo] = useState(false);
  const [msgs, setMsgs] = useState([{ 
    role: 'assistant', 
    content: '# INGENIUM PRO v8.1\n\nBienvenido a la plataforma de ingeniería de precisión. El motor matemático y de voz están activos.' 
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const hablar = (texto: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto.replace(/[$#*_|]/g, ''));
    u.lang = 'es-ES';
    u.onstart = () => setLeyendo(true);
    u.onend = () => setLeyendo(false);
    window.speechSynthesis.speak(u);
  };

  const enviar = async () => {
    if (!input.trim() || loading) return;
    const nuevos = [...msgs, { role: 'user', content: input }];
    setMsgs(nuevos); setInput(''); setLoading(true);

    const SYS_PROMPT = `Sos INGENIUM PRO v8.1, TOPE DE GAMA. 
    1. USÁ LaTeX ($$fórmula$$) para todas las ecuaciones.
    2. Respondé en base al sistema: ${sistemaMedidas}.
    3. Citá normativas internacionales reales.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: SYS_PROMPT, messages: nuevos }),
      });
      const d = await res.json();
      const txt = d.content?.[0]?.text || d.reply || 'Error en respuesta.';
      setMsgs([...nuevos, { role: 'assistant', content: txt }]);
      if (leyendo) hablar(txt);
    } catch { setMsgs([...nuevos, { role: 'assistant', content: 'Falla de red.' }]); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', color: '#f1f5f9', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* HEADER DE ALTA GAMA */}
      <header style={{ background: 'rgba(10, 15, 30, 0.98)', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 20, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ padding: '8px 12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, fontWeight: 900, fontSize: 14, color: '#fff' }}>IP</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.5px' }}>INGENIUM PRO v8.1</div>
          <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Precision Engineering Platform</div>
        </div>
        
        <select value={sistemaMedidas} onChange={(e) => setSistemaMedidas(e.target.value)}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: 11, padding: '5px 10px', borderRadius: 8, outline: 'none', cursor: 'pointer' }}>
          <option value="S. Internacional (m, kg, °C)">S. Internacional</option>
          <option value="S. Imperial (ft, lb, °F)">S. Imperial</option>
        </select>

        <button onClick={() => leyendo ? window.speechSynthesis.cancel() : hablar(msgs[msgs.length-1].content)}
          style={{ background: leyendo ? '#ef4444' : '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff', padding: '8px 12px', cursor: 'pointer', transition: '0.2s' }}>
          {leyendo ? '🔇' : '🔊'}
        </button>
      </header>

      {/* BARRA DE NAVEGACIÓN */}
      <nav style={{ display: 'flex', overflowX: 'auto', background: '#070d1a', borderBottom: '1px solid #1e293b', scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '16px 20px', background: 'transparent', border: 'none',
            color: tab === t.id ? t.color : '#475569',
            borderBottom: tab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
            fontWeight: tab === t.id ? 700 : 500, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s'
          }}>
            <span style={{ marginRight: '8px' }}>{t.icono}</span>{t.label}
          </button>
        ))}
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'chat' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ 
                    padding: '16px 20px', borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px', 
                    background: m.role === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#0f172a',
                    border: m.role === 'assistant' ? '1px solid rgba(99,102,241,0.1)' : 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}
                      components={{
                        h1: ({...p}) => <h1 style={{fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 10}} {...p}/>,
                        h2: ({...p}) => <h2 style={{fontSize: 15, fontWeight: 800, color: '#a78bfa', marginTop: 12}} {...p}/>,
                        p: ({...p}) => <p style={{fontSize: 13, lineHeight: '1.7', color: '#e2e8f0'}} {...p}/>
                      }}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* INPUT TÉCNICO */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid #1e293b', background: '#0a0f1e', display: 'flex', gap: '12px' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && enviar()} 
                style={{ flex: 1, padding: '14px 18px', borderRadius: 12, background: '#070d1a', border: '1px solid #334155', color: '#fff', fontSize: 13, outline: 'none' }} 
                placeholder="Consultá normativas o realizá cálculos..." />
              <button onClick={enviar} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', padding: '0 25px', borderRadius: 12, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                {loading ? '...' : '→'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'petroleo'     && <ModuloPetroleo />}
            {tab === 'hidraulica'   && <ModuloHidraulica />}
            {tab === 'perforacion'  && <ModuloPerforacion />}
            {tab === 'mineria'      && <ModuloMineria />}
            {tab === 'civil'        && <ModuloCivil />}
            {tab === 'geotecnia'    && <ModuloGeotecnia />}
            {tab === 'termica'      && <ModuloTermica />}
            {tab === 'vialidad'     && <ModuloVialidad />}
            {tab === 'arquitectura' && <ModuloArquitectura />}
            {tab === 'represas'     && <ModuloRepresas />}
            {tab === 'soldadura'    && <ModuloSoldadura />}
            {tab === 'mmo'          && <ModuloMMO />}
            {tab === 'electricidad' && <ModuloElectricidad />}
          </div>
        )}
      </main>
    </div>
  );
}