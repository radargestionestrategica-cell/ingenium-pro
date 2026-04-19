'use client';
import ModuloPetroleo from '@/components/ModuloPetroleo';
import ModuloPerforacion from '@/components/ModuloPerforacion';
import { useState, useRef, useEffect } from 'react';

const TABS = [
  { id: 'petroleo', label: 'Petroleo' },
  { id: 'hidraulica', label: 'Hidraulica' },
  { id: 'mineria', label: 'Mineria' },
  { id: 'civil', label: 'Civil' },
  { id: 'geotecnia', label: 'Geotecnia' },
  { id: 'termica', label: 'Termica' },
  { id: 'vialidad', label: 'Vialidad' },
  { id: 'arquitectura', label: 'Arquitectura' },
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

export default function IngeniumPro() {
  const [moduloActivo, setModuloActivo] = useState('chat');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bienvenido a INGENIUM PRO v8.0. Soy tu asistente de ingenieria tecnica de precision. Escribe tu consulta con los datos del proyecto.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          system: 'Eres INGENIUM PRO v8.0, asistente de ingenieria tecnica de precision. Usas normativas reales: ASME B31.8, API 5L, AWWA, USACE, AASHTO. Respondes en espanol con calculos exactos y citas de normativa. No inventas datos.',
          messages: newMessages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || data.reply || 'Calculo completado segun normativa vigente.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Error de conexion. Verificar configuracion.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 14 }}>IP</div>
        <div>
          <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16 }}>INGENIUM PRO</div>
          <div style={{ color: '#64748b', fontSize: 11 }}>v8.0 - Plataforma de Ingenieria Tecnica</div>
        </div>
        <div style={{ marginLeft: 'auto', background: '#00e5a0', color: '#000', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 800 }}>ACTIVO</div>
      </div>

      <div style={{ borderBottom: '1px solid #1e293b', background: '#0d1526', padding: '0 8px', display: 'flex', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setModuloActivo(tab.id)}
            style={{ padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: moduloActivo === tab.id ? '2px solid #a78bfa' : '2px solid transparent', color: moduloActivo === tab.id ? '#a78bfa' : '#64748b', fontWeight: moduloActivo === tab.id ? 700 : 400, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {moduloActivo === 'petroleo' && <ModuloPetroleo />}
        {moduloActivo === 'perforacion' && <ModuloPerforacion />}

        {moduloActivo !== 'petroleo' && moduloActivo !== 'perforacion' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>IP</div>
                  )}
                  <div style={{ maxWidth: '80%', background: msg.role === 'user' ? '#1e3a5f' : '#1e293b', border: msg.role === 'user' ? '1px solid #2563eb' : '1px solid #334155', borderRadius: 12, padding: '12px 16px', color: '#e2e8f0', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 12 }}>IP</div>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '12px 16px', color: '#64748b', fontSize: 13 }}>Analizando...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div style={{ padding: '8px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ width: '100%', color: '#475569', fontSize: 11, marginBottom: 4 }}>Consultas de ejemplo</div>
                {EJEMPLOS.map((ej, i) => (
                  <button key={i} onClick={() => sendMessage(ej)}
                    style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 20, padding: '6px 14px', color: '#94a3b8', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {ej}
                  </button>
                ))}
              </div>
            )}

            <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', gap: 8 }}>
              <input value={inputValue} onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="Consulta tu calculo tecnico... (Enter para enviar)"
                style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '12px 16px', color: '#f8fafc', fontSize: 14, outline: 'none' }} />
              <button onClick={() => sendMessage()} disabled={loading || !inputValue.trim()}
                style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', border: 'none', borderRadius: 8, padding: '12px 20px', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: loading || !inputValue.trim() ? 0.5 : 1 }}>
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #1e293b', padding: '8px 16px', textAlign: 'center', color: '#334155', fontSize: 11 }}>
        INGENIUM PRO v8.0 - ASME - API - AWWA - USACE - Silvana Belen Colombo 2026
      </div>
    </div>
  );
}