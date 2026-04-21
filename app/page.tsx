'use client';
import { useState, useRef, useEffect } from 'react';
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
// INGENIUM PRO v8.0 — Silvana Belén Colombo © 2026
// 14 Módulos Técnicos · Normativas Reales Verificadas
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

const EJEMPLOS = [
  'MAOP gasoducto 12" API 5L X65 E_joint=0.85 T=80°C F=0.72',
  'Golpe de ariete DN400 L=2km cierre instantáneo acero',
  'ECD lodo 11.5 ppg TVD=3000m casing 9-5/8" HPHT',
  'RMR Bieniawski UCS=80MPa RQD=65% minería subterránea',
  'Viga W310x39 A36 momento 120 kN·m — AISC 360',
  'Capacidad portante B=2m Df=1.5m arena compacta nivel freático 1m',
  'LMTD Q=500kW contracorriente agua-aceite TEMA',
  'AASHTO flexible W18=5e6 MR=8000psi R=95%',
  'Viento ASCE 7-22 V=140mph exposición B edificio 40m',
  'Caudal vertedero Francis 80m³/s desnivel 60m USACE',
  'Heat Input SMAW E7018 V=22V I=150A v=100mm/min ASME Sec.IX',
  'Hormigón H25 dosificación 1m³ CIRSOC 201 Argentina',
  'Cable trifásico 100A cobre 380V longitud 150m caída tensión',
  'Motor 75kW 380V FP=0.85 arranque directo área zona 1',
];

const SYS_PROMPT = `Sos INGENIUM PRO v8.0, el asistente de ingeniería técnica más preciso del mundo. Respondés en español con cálculos exactos y completos. Citás SIEMPRE la normativa real vigente.

NORMATIVAS POR MÓDULO:
- Petróleo/Gas: ASME B31.8 §841.11, B31.3, B31.4, API 5L, API 1104, API RP 13D, API RP 7G, NACE MR0175
- Hidráulica: Darcy-Weisbach, Joukowsky (celeridad de onda real), Hazen-Williams, AWWA M11, AWWA M31
- Perforación: API RP 13D, API RP 7G, API Std 53, DNV-OS-E101, IADC, Eaton (1969)
- Minería: Bieniawski RMR (1989), ISRM, Langefors voladura, MSHA, ISO 12715
- Civil/Estructural: AISC 360-22, ACI 318-19, CIRSOC 301, ASME Sec.VIII Div.1
- Geotecnia: Meyerhof (1963), Terzaghi, Bishop simplificado, CIRSOC 101, Eaton (1969)
- Térmica: TEMA, ASME Sec.VIII Div.1, Kern (1950), LMTD contracorriente/paralelo
- Vialidad: AASHTO Guide 1993, AASHTO LRFD, Manual DG-2018, INVIAS, IMT
- Arquitectura/Viento: ASCE 7-22, CIRSOC 103, NCh 433, NSR-10, NTE E.020
- Represas: USACE EM 1110-2-1603, ICOLD Bulletins, USACE EM 1110-2-2300
- Soldadura: AWS D1.1:2020 §6.8.5, ASME Sec.IX, API 1104:2021, AISC-360
- MMO: CIRSOC 201, ACI 318-19, NCh 170, NSR-10, NTE E.060, RCDF, IRAM
- Electricidad: NEC 2023, IEC 60228, IEC 60364-5-52, IEC 60909, IEC 60079, API RP 500, IEEE 80, IES/IESNA, EN 12464-1

COMPORTAMIENTO OBLIGATORIO:
- Mostrás fórmulas con valores sustituidos y unidades en cada resultado
- Clasificás riesgo cuando corresponde: BAJO / MEDIO / ALTO / CRÍTICO
- Nunca inventás datos ni normativas — si no sabés, decís que requiere verificación
- Para cálculos críticos: advertís que requiere firma de profesional matriculado
- Respondés con secciones claras y tabla de resultados cuando corresponda`;

function formatearRespuesta(texto: string) {
  return texto.split('\n').map((line, i) => {
    if (line.startsWith('# '))
      return <div key={i} style={{ color: '#f8fafc', fontWeight: 900, fontSize: 15, marginTop: 12, marginBottom: 4, borderBottom: '1px solid #1e293b', paddingBottom: 4 }}>{line.slice(2)}</div>;
    if (line.startsWith('## '))
      return <div key={i} style={{ color: '#a78bfa', fontWeight: 800, fontSize: 14, marginTop: 10, marginBottom: 4 }}>{line.slice(3)}</div>;
    if (line.startsWith('### '))
      return <div key={i} style={{ color: '#00e5a0', fontWeight: 700, fontSize: 13, marginTop: 8, marginBottom: 2 }}>{line.slice(4)}</div>;
    if (line.startsWith('- ') || line.startsWith('* '))
      return <div key={i} style={{ paddingLeft: 12, color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>• {line.slice(2)}</div>;
    if (line.startsWith('| '))
      return <div key={i} style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', padding: '2px 0', borderBottom: '1px solid #0f172a' }}>{line}</div>;
    if (line.trim() === '---')
      return <hr key={i} style={{ border: 'none', borderTop: '1px solid #1e293b', margin: '8px 0' }} />;
    if (line.trim() === '')
      return <div key={i} style={{ height: 7 }} />;
    return <div key={i} style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7 }}>{line}</div>;
  });
}

export default function IngeniumPro() {
  const [tab, setTab] = useState('chat');
  const [msgs, setMsgs] = useState([{
    role: 'assistant',
    content: '# INGENIUM PRO v8.0\n\nBienvenido a la plataforma de ingeniería técnica más precisa del mundo.\n\n## 14 Módulos activos:\nPetróleo · Hidráulica · Perforación · Minería · Civil · Geotecnia · Térmica · Vialidad · Arquitectura · Represas · Soldadura · MMO · Electricidad\n\n## Normativas verificadas:\nASME · API · AASHTO · ASCE · AISC · AWWA · USACE · AWS · CIRSOC · Bieniawski · NEC · IEC\n\nEscribí tu consulta técnica o seleccioná un ejemplo.'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('modulo');
    if (m && TABS.find(t => t.id === m)) setTab(m);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async (texto?: string) => {
    const msg = (texto || input).trim();
    if (!msg || loading) return;
    setInput('');
    const nuevos = [...msgs, { role: 'user', content: msg }];
    setMsgs(nuevos);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: SYS_PROMPT,
          messages: nuevos.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || data.reply || 'Error al procesar. Reintentá.';
      setMsgs([...nuevos, { role: 'assistant', content: reply }]);
    } catch {
      setMsgs([...nuevos, { role: 'assistant', content: 'Error de conexión. Verificá tu red.' }]);
    } finally {
      setLoading(false);
    }
  };

  const tabActivo = TABS.find(t => t.id === tab);

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', display: 'flex', flexDirection: 'column', fontFamily: 'Inter,-apple-system,sans-serif', color: '#f1f5f9' }}>

      {/* ══ HEADER ══ */}
      <header style={{ background: 'rgba(7,13,26,0.98)', borderBottom: '1px solid rgba(99,102,241,0.25)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#fff', flexShrink: 0 }}>IP</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5 }}>INGENIUM PRO</div>
          <div style={{ fontSize: 10, color: '#475569' }}>v8.0 · 14 Módulos · Normativas Reales · Única en el Mundo</div>
        </div>
        {tabActivo && tab !== 'chat' && (
          <div style={{ fontSize: 11, color: tabActivo.color, background: `${tabActivo.color}15`, padding: '4px 12px', borderRadius: 20, border: `1px solid ${tabActivo.color}40`, fontWeight: 600, flexShrink: 0 }}>
            {tabActivo.icono} {tabActivo.label}
          </div>
        )}
      </header>

      {/* ══ TABS ══ */}
      <nav style={{ background: 'rgba(7,13,26,0.95)', borderBottom: '1px solid rgba(99,102,241,0.12)', padding: '0 8px', overflowX: 'auto', display: 'flex', gap: 1, scrollbarWidth: 'none' as const, flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 11px', border: 'none', background: 'transparent',
            color: tab === t.id ? t.color : '#475569',
            borderBottom: tab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
            fontWeight: tab === t.id ? 700 : 400,
            fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' as const,
            transition: 'all 0.15s', flexShrink: 0,
          }}>
            <span style={{ marginRight: 4 }}>{t.icono}</span>{t.label}
          </button>
        ))}
      </nav>

      {/* ══ CONTENIDO ══ */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {tab === 'petroleo' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloPetroleo /></div>}
        {tab === 'hidraulica' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloHidraulica /></div>}
        {tab === 'perforacion' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloPerforacion /></div>}
        {tab === 'mineria' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloMineria /></div>}
        {tab === 'civil' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloCivil /></div>}
        {tab === 'geotecnia' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloGeotecnia /></div>}
        {tab === 'termica' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloTermica /></div>}
        {tab === 'vialidad' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloVialidad /></div>}
        {tab === 'arquitectura' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloArquitectura /></div>}
        {tab === 'represas' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloRepresas /></div>}
        {tab === 'soldadura' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloSoldadura /></div>}
        {tab === 'mmo' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloMMO /></div>}
        {tab === 'electricidad' && <div style={{ flex: 1, overflowY: 'auto' }}><ModuloElectricidad /></div>}

        {/* ══ CHAT IA ══ */}
        {tab === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 10 }}>
                  {m.role === 'assistant' && (
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#fff', flexShrink: 0, marginTop: 2 }}>IP</div>
                  )}
                  <div style={{
                    maxWidth: '82%', padding: '12px 16px',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                    background: m.role === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(15,23,42,0.95)',
                    border: m.role === 'assistant' ? '1px solid rgba(99,102,241,0.2)' : 'none',
                  }}>
                    {m.role === 'assistant'
                      ? formatearRespuesta(m.content)
                      : <span style={{ fontSize: 13 }}>{m.content}</span>}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#fff' }}>IP</div>
                  <div style={{ padding: '10px 16px', borderRadius: '4px 16px 16px 16px', background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.2)', color: '#64748b', fontSize: 13 }}>
                    Calculando con normativas reales...
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Ejemplos */}
            <div style={{ padding: '6px 12px 8px', borderTop: '1px solid rgba(99,102,241,0.1)', display: 'flex', gap: 5, flexWrap: 'wrap' as const }}>
              <div style={{ width: '100%', fontSize: 10, color: '#334155', marginBottom: 3 }}>CONSULTAS DE EJEMPLO — 14 MÓDULOS</div>
              {EJEMPLOS.map((ej, i) => (
                <button key={i} onClick={() => send(ej)} style={{
                  padding: '4px 10px', background: 'rgba(99,102,241,0.07)',
                  border: '1px solid rgba(99,102,241,0.18)', borderRadius: 14,
                  color: '#94a3b8', fontSize: 10, cursor: 'pointer',
                }}>{ej}</button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(99,102,241,0.15)', display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Consultá tu cálculo técnico con normativa real... (Enter para enviar)"
                style={{ flex: 1, padding: '11px 14px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, color: '#f1f5f9', fontSize: 13, outline: 'none' }}
              />
              <button onClick={() => send()} disabled={loading || !input.trim()} style={{
                padding: '11px 18px',
                background: loading || !input.trim() ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', borderRadius: 12, color: '#fff', fontSize: 15,
                fontWeight: 700, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              }}>→</button>
            </div>
          </div>
        )}
      </main>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid #0f172a', padding: '6px 12px', textAlign: 'center', color: '#1e293b', fontSize: 9, flexShrink: 0 }}>
        INGENIUM PRO v8.0 · ASME · API · AASHTO · ASCE · AISC · AWWA · USACE · AWS D1.1 · NEC · IEC · CIRSOC · NSR-10 · NCh · NTE · Bieniawski RMR © 2026 Silvana Belén Colombo · RADAR Gestión Estratégica
      </footer>
    </div>
  );
}