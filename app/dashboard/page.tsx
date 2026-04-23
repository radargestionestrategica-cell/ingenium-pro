'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Importación de tus 14 módulos (Protegiendo estructura existente)
import ModuloPetroleo from '@/components/ModuloPetroleo';
import ModuloHidraulica from '@/components/ModuloHidraulica';
import ModuloPerforacion from '@/components/ModuloPerforacion';
import ModuloMineria from '@/components/ModuloMineria';
import ModuloCivil from '@/components/ModuloCivil';
import ModuloGeotecnia from '@/components/ModuloGeotecnia';
import ModuloTermica from '@/components/ModuloTermica';
import ModuloVialidad from '@/components/ModuloVialidad';
import ModuloArquitectura from '@/components/ModuloArquitectura';
import ModuloRepresas from '@/components/ModuloRepresas';
import ModuloSoldadura from '@/components/ModuloSoldadura';
import ModuloMMO from '@/components/ModuloMMO';
import ModuloElectricidad from '@/components/ModuloElectricidad';

// ═══════════════════════════════════════════════════════════════
// INGENIUM PRO v8.1 — CONFIGURACIÓN QUIRÚRGICA
// ═══════════════════════════════════════════════════════════════

const TABS = [
  { id: 'chat', label: 'Chat IA', icono: '🤖', color: '#6366f1' },
  { id: 'petroleo', label: 'Petróleo', icono: '🛢️', color: '#f59e0b' },
  { id: 'hidraulica', label: 'Hidráulica', icono: '💧', color: '#06b6d4' },
  { id: 'perforacion', label: 'Perforación', icono: '⛏️', color: '#8b5cf6' },
  { id: 'mineria', label: 'Minería', icono: '🪨', color: '#ef4444' },
  { id: 'civil', label: 'Civil', icono: '🏗️', color: '#3b82f6' },
  { id: 'geotecnia', label: 'Geotecnia', icono: '🌍', color: '#a16207' },
  { id: 'termica', label: 'Térmica', icono: '🌡️', color: '#dc2626' },
  { id: 'vialidad', label: 'Vialidad', icono: '🛣️', color: '#16a34a' },
  { id: 'arquitectura', label: 'Arquitectura', icono: '🏛️', color: '#0891b2' },
  { id: 'represas', label: 'Represas', icono: '🏞️', color: '#0284c7' },
  { id: 'soldadura', label: 'Soldadura', icono: '⚡', color: '#d97706' },
  { id: 'mmo', label: 'MMO', icono: '🧱', color: '#10b981' },
  { id: 'electricidad', label: 'Electricidad', icono: '🔋', color: '#22c55e' },
];

export default function DashboardPage() {
  const [tab, setTab] = useState('chat');
  const [sistemaMedidas, setSistemaMedidas] = useState('Sistema Internacional (m, kg, °C, km)');
  const [leyendo, setLeyendo] = useState(false);
  
  const bienvenidaTexto = `# INGENIUM PRO v8.1\n\nBienvenido a la plataforma de ingeniería de precisión más avanzada mundialmente.\n\n## Introducción:\nCada módulo integra normativas internacionales verificadas para garantizar datos reales. Esta versión v8.1 incluye motor matemático de alta gama y accesibilidad por voz.\n\nEscribí tu requerimiento técnico para comenzar.`;

  const [msgs, setMsgs] = useState([{ role: 'assistant', content: bienvenidaTexto }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

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
    const val = input.trim();
    if (!val || loading) return;
    setInput('');
    const nuevos = [...msgs, { role: 'user', content: val }];
    setMsgs(nuevos);
    setLoading(true);
    
    const SYS_PROMPT = `Sos INGENIUM PRO v8.1, plataforma TOPE DE GAMA. 
    1. PRECISIÓN: Datos 100% reales.
    2. MATEMÁTICAS: Usá LaTeX ($$fórmula$$) para renderizado profesional.
    3. MEDIDAS: Usá obligatoriamente ${sistemaMedidas}.
    4. EXPERTO: Citá normativas (ASME, API, AISC).`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: SYS_PROMPT, messages: nuevos }),
      });
      const d = await res.json();
      const txt = d.content?.[0]?.text || d.reply || 'Error de procesamiento.';
      setMsgs([...nuevos, { role: 'assistant', content: txt }]);
      if (leyendo) hablar(txt);
    } catch {
      setMsgs([...nuevos, { role: 'assistant', content: 'Falla de conexión.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', display: 'flex', flexDirection: 'column', color: '#f1f5f9' }}>
      
      {/* HEADER TOPE DE GAMA */}
      <header style={{ background: '#0a0f1e', borderBottom: '1px solid #1e293b', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 15, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ padding: '8px 12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 8, fontWeight: 900 }}>IP</div>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 800 }}>INGENIUM PRO v8.1</div>
        
        <select 
          value={sistemaMedidas} 
          onChange={(e) => setSistemaMedidas(e.target.value)}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: 12, padding: '5px', borderRadius: 6 }}
        >
          <option value="Metros, mm, Kg, °C">Sistema Internacional</option>
          <option value="Pies, in, Lb, °F">Sistema Imperial</option>
        </select>

        <button onClick={() => leyendo ? window.speechSynthesis.cancel() : hablar(msgs[msgs.length-1].content)} style={{ background: '#1e293b', border: 'none', cursor: 'pointer', fontSize: 18, color: '#fff' }}>
          {leyendo ? '🔇 Stop' : '🔊 Voz'}
        </button>
      </header>

      {/* NAVEGACIÓN DE MÓDULOS */}
      <nav style={{ display: 'flex', overflowX: 'auto', background: '#070d1a', borderBottom: '1px solid #1e293b' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '12px 15px', background: 'none', border: 'none', color: tab === t.id ? t.color : '#475569', borderBottom: tab === t.id ? `2px solid ${t.color}` : 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600 }}>
            {t.icono} {t.label}
          </button>
        ))}
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'chat' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 15 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ padding: '15px', borderRadius: 15, background: m.role === 'user' ? '#6366f1' : '#0f172a', border: '1px solid #1e293b' }}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div style={{ padding: '15px', borderTop: '1px solid #1e293b', display: 'flex', gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && enviar()} style={{ flex: 1, background: '#0a0f1e', border: '1px solid #334155', borderRadius: 10, padding: '12px', color: '#fff' }} placeholder="Consulta técnica..." />
              <button onClick={enviar} style={{ background: '#6366f1', border: 'none', padding: '10px 20px', borderRadius: 10, color: '#fff', fontWeight: 700 }}>Enviar</button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Renderizado dinámico de módulos existentes */}
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
        )}
      </main>
    </div>
  );
}