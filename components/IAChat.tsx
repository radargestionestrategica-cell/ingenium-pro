'use client';
import { useState, useRef, useEffect } from 'react';
import { DatosExportar } from '@/components/BotonesExportar';
import ReactMarkdown from 'react-markdown';

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

const PANEL = '#0a0f1e';
const INDIGO = '#6366f1';

type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
type Msg = { role: 'user' | 'assistant'; content: string };

const RIESGO_COLOR: Record<NivelRiesgo, string> = {
  BAJO:    '#22c55e',
  MEDIO:   '#E8A020',
  ALTO:    '#f97316',
  CRITICO: '#ef4444',
};

// Mapea datos.tipo/moduloId a los IDs que entiende /api/chat preCalcular()
function resolverModuloId(d: DatosExportar): string {
  const raw = (d.moduloId ?? d.tipo ?? '').toUpperCase();
  if (raw.includes('MAOP') || raw.includes('PETROLEO') || raw.includes('INTEGRIDAD')) return 'MAOP';
  if (raw.includes('JOUKOWSKY') || raw.includes('ARIETE'))  return 'JOUKOWSKY';
  if (raw.includes('HIDRAU') || raw.includes('DARCY'))      return 'HIDRAULICA';
  if (raw.includes('CANERIA'))                              return 'CANERIAS';
  if (raw.includes('PERFOR'))                               return 'PERFORACION';
  if (raw.includes('ELECTR'))                               return 'ELECTRICIDAD';
  return raw;
}

const NOMBRES: Record<string, string> = {
  MAOP:        'Petróleo / MAOP',
  HIDRAULICA:  'Hidráulica',
  JOUKOWSKY:   'Golpe de Ariete',
  CANERIAS:    'Cañerías',
  PERFORACION: 'Perforación',
  ELECTRICIDAD:'Electricidad',
  GEOTECNIA:   'Geotecnia',
  SOLDADURA:   'Soldadura',
  MMO:         'MMO',
  VALVULAS:    'Válvulas',
  CIVIL:       'Civil',
  VIALIDAD:    'Vialidad',
  REPRESAS:    'Represas',
  MINERIA:     'Minería',
  TERMICA:     'Térmica',
  ARQUITECTURA:'Arquitectura',
};

interface Props {
  datos: DatosExportar;
}

export default function IAChat({ datos }: Props) {
  const [abierto,     setAbierto]     = useState(false);
  const [mensajes,    setMensajes]    = useState<Msg[]>([]);
  const [input,       setInput]       = useState('');
  const [cargando,    setCargando]    = useState(false);
  const [nivelRiesgo, setNivelRiesgo] = useState<NivelRiesgo | null>(null);
  const [analizado,   setAnalizado]   = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  const construirContexto = () => ({
    moduloId:     resolverModuloId(datos),
    moduloNombre: NOMBRES[resolverModuloId(datos)] ?? datos.tipo,
    normativa:    datos.normativa ?? '',
    activoNombre: datos.activoNombre,
    parametros:   datos.parametros,
    resultado:    datos.resultado,
    alerta: (datos.advertencias?.length ?? 0) > 0
         || datos.matrizRiesgo?.seguridad === 'HIGH'
         || datos.matrizRiesgo?.tecnico   === 'HIGH',
    alertaMsg: datos.advertencias?.[0],
  });

  const enviar = async (texto: string, esInicial = false) => {
    const cola: Msg[] = esInicial
      ? [{ role: 'user', content: texto }]
      : [...mensajes, { role: 'user', content: texto }];

    setMensajes(cola);
    setInput('');
    setCargando(true);

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...ipAuthHeader() },
        body: JSON.stringify({ messages: cola, contexto: construirContexto() }),
      });

      if (!res.ok) throw new Error('api');

      const data = await res.json() as {
        content:   { text: string }[];
        derivados?: { nivel_riesgo?: NivelRiesgo };
      };

      const respuesta = data.content?.[0]?.text ?? 'Sin respuesta del motor.';
      if (data.derivados?.nivel_riesgo) setNivelRiesgo(data.derivados.nivel_riesgo);

      setMensajes(prev => [...prev, { role: 'assistant', content: respuesta }]);
      setAnalizado(true);
    } catch {
      setMensajes(prev => [...prev, {
        role: 'assistant',
        content: '⚠ Error de conexión con el motor de IA. Verificá tu conexión e intentá de nuevo.',
      }]);
    } finally {
      setCargando(false);
    }
  };

  const analizarResultado = () => {
    setAbierto(true);
    if (!analizado && mensajes.length === 0) {
      enviar(
        'Analizá este resultado de ingeniería. Identificá riesgos según normativa, ' +
        'verificá si los valores están dentro de los límites admisibles y ' +
        'dame recomendaciones accionables con plazos y responsables.',
        true,
      );
    }
  };

  const colorBorde = nivelRiesgo
    ? `${RIESGO_COLOR[nivelRiesgo]}44`
    : 'rgba(99,102,241,0.2)';

  return (
    <>
      <style>{`
        @keyframes ia-pulse {
          0%,80%,100% { opacity:.25; transform:scale(.8); }
          40%          { opacity:1;   transform:scale(1);  }
        }
        .ia-dot { width:7px; height:7px; border-radius:50%; background:${INDIGO}; display:inline-block; }
        .ia-dot:nth-child(1){ animation:ia-pulse 1.2s ease-in-out 0s infinite; }
        .ia-dot:nth-child(2){ animation:ia-pulse 1.2s ease-in-out .2s infinite; }
        .ia-dot:nth-child(3){ animation:ia-pulse 1.2s ease-in-out .4s infinite; }
        .ia-msg-ia { font-size:12px; color:#cbd5e1; line-height:1.85; word-break:break-word; }
        .ia-msg-ia p  { margin:4px 0; line-height:1.85; }
        .ia-msg-ia ul { padding-left:16px; margin:6px 0; display:flex; flex-direction:column; gap:3px; }
        .ia-msg-ia ol { padding-left:18px; margin:6px 0; display:flex; flex-direction:column; gap:3px; }
        .ia-msg-ia li { line-height:1.7; }
        .ia-msg-ia b, .ia-msg-ia strong { color:#f1f5f9; font-weight:700; }
        .ia-msg-ia code { background:rgba(99,102,241,0.12); padding:1px 5px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; color:#a5b4fc; }
        .ia-msg-ia blockquote { border-left:3px solid rgba(99,102,241,0.45); padding-left:10px; margin:6px 0; color:#94a3b8; }
        .ia-msg-ia hr { border:none; border-top:1px solid rgba(99,102,241,0.15); margin:10px 0; }
        .ia-input:focus { border-color:${INDIGO} !important; }
      `}</style>

      <div style={{
        marginTop: 14, borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${colorBorde}`,
        background: PANEL,
        transition: 'border-color .3s',
      }}>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div
          onClick={() => analizado ? setAbierto(o => !o) : analizarResultado()}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            borderBottom: abierto ? '1px solid rgba(99,102,241,0.12)' : 'none',
            cursor: 'pointer',
            background: 'rgba(99,102,241,0.05)',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#4338ca)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, boxShadow: '0 0 10px rgba(99,102,241,.4)',
          }}>⚡</div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#f1f5f9', letterSpacing: .5 }}>
              {analizado ? 'ANÁLISIS IA — INGENIUM PRO' : '⚡  ANALIZAR RESULTADO CON IA'}
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>
              Claude Sonnet 4.6 · temperature 0 · normativas pre-verificadas · sin alucinaciones
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {nivelRiesgo && (
              <div style={{
                padding: '3px 10px', borderRadius: 20,
                background: `${RIESGO_COLOR[nivelRiesgo]}18`,
                border: `1px solid ${RIESGO_COLOR[nivelRiesgo]}55`,
                fontSize: 10, fontWeight: 800,
                color: RIESGO_COLOR[nivelRiesgo], letterSpacing: 1,
              }}>
                {nivelRiesgo}
              </div>
            )}
            {cargando && !analizado
              ? <div style={{ display: 'flex', gap: 3, alignItems: 'center', padding: '0 4px' }}>
                  <span className="ia-dot"/><span className="ia-dot"/><span className="ia-dot"/>
                </div>
              : <span style={{ color: '#334155', fontSize: 14 }}>{abierto ? '▲' : '▼'}</span>
            }
          </div>
        </div>

        {/* ── CUERPO ─────────────────────────────────────────── */}
        {abierto && (
          <>
            {/* MENSAJES */}
            <div
              ref={scrollRef}
              style={{ maxHeight: 500, overflowY: 'auto', padding: '16px 16px 4px' }}
            >
              {mensajes.map((m, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  {m.role === 'user' ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{
                        maxWidth: '78%',
                        background: 'rgba(99,102,241,0.10)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '12px 12px 4px 12px',
                        padding: '9px 14px',
                        fontSize: 12, color: '#c7d2fe', lineHeight: 1.6,
                      }}>
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                        background: 'linear-gradient(135deg,#6366f1,#4338ca)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, marginTop: 2,
                      }}>⚡</div>
                      <div style={{ flex: 1 }}>
                        <div className="ia-msg-ia">
                          <ReactMarkdown
                            components={{
                              h1: ({children}) => <div style={{fontSize:14,fontWeight:900,color:'#f1f5f9',margin:'12px 0 4px',paddingBottom:4,borderBottom:'1px solid rgba(99,102,241,0.2)'}}>{children}</div>,
                              h2: ({children}) => <div style={{fontSize:13,fontWeight:800,color:'#f1f5f9',margin:'10px 0 4px',paddingBottom:3,borderBottom:'1px solid rgba(99,102,241,0.12)'}}>{children}</div>,
                              h3: ({children}) => <div style={{fontSize:12,fontWeight:700,color:'#e2e8f0',margin:'8px 0 3px'}}>{children}</div>,
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
                          ⚠️ La IA puede cometer errores. Los resultados deben ser validados por un profesional matriculado antes de su aplicación en obra.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* TYPING INDICATOR */}
              {cargando && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                    background: 'linear-gradient(135deg,#6366f1,#4338ca)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                  }}>⚡</div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span className="ia-dot"/><span className="ia-dot"/><span className="ia-dot"/>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT */}
            <div style={{
              padding: '10px 14px 14px',
              borderTop: '1px solid rgba(99,102,241,0.08)',
              display: 'flex', gap: 8,
            }}>
              <input
                className="ia-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && input.trim() && !cargando) {
                    e.preventDefault();
                    enviar(input.trim());
                  }
                }}
                placeholder="Preguntá sobre este resultado... (Intro para enviar)"
                disabled={cargando}
                style={{
                  flex: 1, padding: '9px 12px',
                  background: '#070d1a',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 8, color: '#f1f5f9', fontSize: 12, outline: 'none',
                  transition: 'border-color .2s',
                }}
              />
              <button
                onClick={() => input.trim() && !cargando && enviar(input.trim())}
                disabled={!input.trim() || cargando}
                style={{
                  padding: '9px 18px', border: 'none', borderRadius: 8,
                  background: input.trim() && !cargando
                    ? 'linear-gradient(135deg,#6366f1,#4338ca)'
                    : 'rgba(99,102,241,0.08)',
                  color: input.trim() && !cargando ? '#fff' : '#334155',
                  fontSize: 13, fontWeight: 800,
                  cursor: input.trim() && !cargando ? 'pointer' : 'not-allowed',
                  transition: 'all .2s',
                }}
              >
                {cargando ? '···' : '→'}
              </button>
            </div>

            {/* DISCLAIMER */}
            <div style={{
              padding: '5px 16px 8px',
              borderTop: '1px solid rgba(99,102,241,0.06)',
              display: 'flex', gap: 14, flexWrap: 'wrap',
              fontSize: 9, color: '#1e3a5f',
            }}>
              <span>⚡ Claude Sonnet 4.6</span>
              <span>🔒 temperature: 0</span>
              <span>📐 Cláusulas normativas inyectadas en contexto</span>
              <span>🧮 Valores derivados pre-calculados en servidor</span>
              <span>🚫 La IA nunca inventa números ni normativas</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
