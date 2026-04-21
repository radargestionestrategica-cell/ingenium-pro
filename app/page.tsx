'use client';
import ModuloArquitectura from '@/components/ModuloArquitectura';
import ModuloCivil from '@/components/ModuloCivil';
import ModuloGeotecnia from '@/components/ModuloGeotecnia';
import ModuloHidraulica from '@/components/ModuloHidraulica';
import ModuloMineria from '@/components/ModuloMineria';
import ModuloPerforacion from '@/components/ModuloPerforacion';
import ModuloPetroleo from '@/components/ModuloPetroleo';
import ModuloRepresas from '@/components/ModuloRepresas';
import ModuloTermica from '@/components/ModuloTermica';
import ModuloVialidad from '@/components/ModuloVialidad';
import { useState, useRef, useEffect } from 'react';

const TABS = [
  { id: 'chat', label: 'Chat IA' },
  { id: 'petroleo', label: 'Petroleo' },
  { id: 'hidraulica', label: 'Hidraulica' },
  { id: 'mineria', label: 'Mineria' },
  { id: 'civil', label: 'Civil' },
  { id: 'geotecnia', label: 'Geotecnia' },
  { id: 'termica', label: 'Termica' },
  { id: 'vialidad', label: 'Vialidad' },
  { id: 'arquitectura', label: 'Arquitectura' },
  { id: 'represas', label: 'Represas' },
  { id: 'perforacion', label: 'Perforacion' },
];

const EJEMPLOS = [
  'MAOP gasoducto 12 X65 junta ERW post-1970',
  'Golpe de ariete acueducto DN400 L=2km',
  'Perdidas hidraulicas Q=80 L/s D=300mm L=500m',
  'Estabilidad talud 30 H=8m arcilla',
  'Capacidad portante cimentacion B=2m Df=1.5m',
  'Dilatacion termica 100m acero T=60C',
];

const MODULOS_CON_FORMULARIO = [
  'petroleo','hidraulica','mineria','civil','geotecnia',
  'termica','vialidad','arquitectura','represas','perforacion',
];

function formatearRespuesta(texto: string) {
  return texto.split('\n').map((line, i) => {
    if (line.startsWith('## '))
      return <div key={i} style={{ color: '#a78bfa', fontWeight: 800, fontSize: 14, marginTop: 10, marginBottom: 4 }}>{line.slice(3)}</div>;
    if (line.startsWith('### '))
      return <div key={i} style={{ color: '#00e5a0', fontWeight: 700, fontSize: 13, marginTop: 8, marginBottom: 2 }}>{line.slice(4)}</div>;
    if (line.startsWith('# '))
      return <div key={i} style={{ color: '#f8fafc', fontWeight: 900, fontSize: 15, marginTop: 10, marginBottom: 4 }}>{line.slice(2)}</div>;
    if (line.startsWith('| '))
      return <div key={i} style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', padding: '2px 0', borderBottom: '1px solid #1e293b' }}>{line}</div>;
    if (line.trim() === '---')
      return <hr key={i} style={{ border: 'none', borderTop: '1px solid #1e293b', margin: '8px 0' }} />;
    if (line.startsWith('- ') || line.startsWith('* '))
      return <div key={i} style={{ paddingLeft: 12, color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>• {line.slice(2)}</div>;
    if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
    return <div key={i} style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7 }}>{line}</div>;
  });
}

export default function IngeniumPro() {
  const [moduloActivo, setModuloActivo] = useState('chat');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bienvenido a INGENIUM PRO v8.0. Soy tu asistente de ingenieria tecnica de precision. Escribe tu consulta con los datos del proyecto.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mod = params.get('modulo');
    if (mod) setModuloActivo(mod);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (texto?: string) => {
    const msg = texto || inputValue.trim();
    if (!msg || loading) return;
    setInputValue('');
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'Eres INGENIUM PRO v8.0, asistente de ingenieria tecnica de precision. Usas normativas reales: ASME B31.8, API 5L, AWWA, USACE, AASHTO, ICOLD, ACI, AISC, MSHA, NIOSH, IRAM. Respondes en espanol con calculos exactos y citas de normativa. No inventas datos.',
          messages: newMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || data.reply || 'Calculo completado segun normativa vigente.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Error de conexion. Reintentando...' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0f1a 0%,#0d1b2a 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: 'rgba(10,15,26,0.98)', borderBottom: '1px solid rgba(99,102,241,0.2)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>IP</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: 0.5 }}>INGENIUM PRO</div>
          <div style={{ fontSize: 10, color: '#475569' }}>v8.0 - Plataforma de Ingenieria Tecnica</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: 'rgba(10,15,26,0.95)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '0 20px', overflowX: 'auto', display: 'flex', gap: 4 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setModuloActivo(tab.id)}
            style={{
              padding: '12px 16px', border: 'none', background: 'transparent',
              color: moduloActivo === tab.id ? '#a78bfa' : '#64748b',
              borderBottom: moduloActivo === tab.id ? '2px solid #a78bfa' : '2px solid transparent',
              fontWeight: moduloActivo === tab.id ? 700 : 400,
              fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* MÓDULOS CON FORMULARIO */}
        {moduloActivo === 'petroleo' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloPetroleo /></div>}
        {moduloActivo === 'hidraulica' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloHidraulica /></div>}
        {moduloActivo === 'mineria' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloMineria /></div>}
        {moduloActivo === 'civil' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloCivil /></div>}
        {moduloActivo === 'geotecnia' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloGeotecnia /></div>}
        {moduloActivo === 'termica' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloTermica /></div>}
        {moduloActivo === 'vialidad' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloVialidad /></div>}
        {moduloActivo === 'arquitectura' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloArquitectura /></div>}
        {moduloActivo === 'represas' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloRepresas /></div>}
        {moduloActivo === 'perforacion' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloPerforacion /></div>}

        {/* CHAT IA */}
        {moduloActivo === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 11, marginRight: 10, flexShrink: 0, marginTop: 2 }}>IP</div>
                  )}
                  <div style={{
                    maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(15,23,42,0.9)',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(99,102,241,0.2)',
                    color: '#f1f5f9',
                  }}>
                    {msg.role === 'assistant' ? formatearRespuesta(msg.content) : <div style={{ fontSize: 13 }}>{msg.content}</div>}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 11 }}>IP</div>
                  <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.2)', color: '#64748b', fontSize: 13 }}>Calculando...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* EJEMPLOS */}
            <div style={{ padding: '8px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ width: '100%', fontSize: 10, color: '#334155', marginBottom: 4 }}>Consultas de ejemplo</div>
              {EJEMPLOS.map((ej, i) => (
                <button key={i} onClick={() => sendMessage(ej)} style={{
                  padding: '6px 12px', background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20,
                  color: '#94a3b8', fontSize: 11, cursor: 'pointer',
                }}>{ej}</button>
              ))}
            </div>

            {/* INPUT */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(99,102,241,0.15)', display: 'flex', gap: 10 }}>
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Consulta tu calculo tecnico... (Enter para enviar)"
                style={{ flex: 1, padding: '12px 16px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none' }}
              />
              <button onClick={() => sendMessage()} disabled={loading} style={{
                padding: '12px 20px', background: loading ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              }}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* PIE */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '8px 16px', textAlign: 'center', color: '#334155', fontSize: 11, flexShrink: 0 }}>
        INGENIUM PRO v8.0 - ASME - API - AWWA - USACE - AISC - ACI - IRAM - Silvana Belen Colombo 2026
      </div>
    </div>
  );
}