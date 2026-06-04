'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BG     = '#020609';
const PANEL  = '#0a0f1e';
const GOLD   = '#E8A020';
const GREEN  = '#22c55e';
const INDIGO = '#6366f1';
const BORD   = 'rgba(99,102,241,0.15)';

const NIVEL_COLOR: Record<string, string> = {
  CRITICO: '#dc2626',
  ALTO:    '#f97316',
  MEDIO:   '#E8A020',
  BAJO:    '#22c55e',
};

const NIVEL_BG: Record<string, string> = {
  CRITICO: 'rgba(220,38,38,0.07)',
  ALTO:    'rgba(249,115,22,0.07)',
  MEDIO:   'rgba(232,160,32,0.07)',
  BAJO:    'rgba(34,197,94,0.07)',
};

interface RiesgoDetectado {
  id:          string;
  nivel:       'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  titulo:      string;
  descripcion: string;
  modulos:     string[];
  normativa:   string;
  accion:      string;
  evidencia:   Record<string, unknown>;
}

interface AnalisisResponse {
  ok:         boolean;
  totalSnaps: number;
  riesgos:    RiesgoDetectado[];
  analisisIA: string | null;
  generadoEn: string;
}

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function CrucePage() {
  const router = useRouter();
  const [loading,    setLoading]    = useState(true);
  const [loadingIA,  setLoadingIA]  = useState(false);
  const [error,      setError]      = useState('');
  const [data,       setData]       = useState<AnalisisResponse | null>(null);

  const cargar = async (conIA = false) => {
    if (conIA) setLoadingIA(true); else setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/cruce/analizar${conIA ? '?ia=1' : ''}`, {
        credentials: 'include',
        headers:     ipAuthHeader(),
      });
      if (res.status === 401) { router.push('/Login'); return; }
      if (!res.ok) throw new Error('Error al analizar');
      const json = await res.json() as AnalisisResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión');
    } finally {
      setLoading(false);
      setLoadingIA(false);
    }
  };

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = data ? {
    CRITICO: data.riesgos.filter(r => r.nivel === 'CRITICO').length,
    ALTO:    data.riesgos.filter(r => r.nivel === 'ALTO').length,
    MEDIO:   data.riesgos.filter(r => r.nivel === 'MEDIO').length,
    BAJO:    data.riesgos.filter(r => r.nivel === 'BAJO').length,
  } : null;

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{
        height: 56, background: PANEL,
        borderBottom: `1px solid ${BORD}`,
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      }}>
        <a href="/dashboard" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
          ← Dashboard
        </a>
        <span style={{ color: GOLD, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>INGENIUM PRO</span>
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 300 }}>Ω</span>
        <span style={{ color: '#334155', fontSize: 13 }}>Inteligencia Cruzada</span>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* TÍTULO */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: INDIGO, marginBottom: 10, textTransform: 'uppercase' as const }}>
            Análisis Multi-Módulo
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', margin: '0 0 10px', lineHeight: 1.1 }}>
            Inteligencia Cruzada
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 580, margin: 0, lineHeight: 1.6 }}>
            Detección determinística de riesgos que emergen de la interacción entre módulos.
            Cada alerta se basa en tus cálculos reales — sin alucinaciones.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 80, color: '#475569' }}>
            <div style={{ fontSize: 28, marginBottom: 14, color: INDIGO }}>⟳</div>
            <div style={{ fontSize: 14 }}>Analizando historial de cálculos...</div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{
            padding: '16px 20px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, color: '#f87171', marginBottom: 24, fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {data && !loading && (
          <>
            {/* CONTADORES POR NIVEL */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {(['CRITICO', 'ALTO', 'MEDIO', 'BAJO'] as const).map(nivel => (
                <div key={nivel} style={{
                  background: NIVEL_BG[nivel],
                  border:     `1px solid ${NIVEL_COLOR[nivel]}35`,
                  borderRadius: 14, padding: '16px 20px', textAlign: 'center' as const,
                }}>
                  <div style={{ fontSize: 34, fontWeight: 900, color: NIVEL_COLOR[nivel] }}>
                    {counts?.[nivel] ?? 0}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: NIVEL_COLOR[nivel], letterSpacing: 1.5, marginTop: 4 }}>
                    {nivel}
                  </div>
                </div>
              ))}
            </div>

            {/* META + BOTÓN IA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#475569', fontSize: 12 }}>
                {data.totalSnaps} cálculos analizados · {data.riesgos.length} interacción{data.riesgos.length !== 1 ? 'es' : ''} detectada{data.riesgos.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => cargar(true)}
                disabled={loadingIA}
                style={{
                  padding: '9px 20px', borderRadius: 10, border: 'none',
                  background: loadingIA
                    ? 'rgba(99,102,241,0.2)'
                    : `linear-gradient(135deg,${INDIGO},#4f46e5)`,
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: loadingIA ? 'wait' : 'pointer',
                  opacity: loadingIA ? 0.7 : 1,
                  transition: 'opacity .2s',
                }}
              >
                {loadingIA ? '⟳ Analizando...' : '✦ Análisis IA profundo'}
              </button>
            </div>

            {/* SIN RIESGOS */}
            {data.riesgos.length === 0 && (
              <div style={{
                textAlign: 'center' as const, padding: '60px 24px',
                background: PANEL, borderRadius: 16, border: `1px solid ${BORD}`,
              }}>
                <div style={{ fontSize: 42, marginBottom: 16 }}>✓</div>
                <div style={{ color: GREEN, fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
                  Sin riesgos cruzados detectados
                </div>
                <div style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>
                  {data.totalSnaps === 0
                    ? 'No hay cálculos guardados. Realizá cálculos en los módulos y guardá los resultados para activar el análisis cruzado.'
                    : 'Los módulos calculados no presentan interacciones de riesgo según las 10 reglas activas.'}
                </div>
              </div>
            )}

            {/* LISTA DE RIESGOS */}
            {data.riesgos.map(r => (
              <div key={r.id} style={{
                background:   NIVEL_BG[r.nivel],
                border:       `1px solid ${NIVEL_COLOR[r.nivel]}30`,
                borderLeft:   `4px solid ${NIVEL_COLOR[r.nivel]}`,
                borderRadius: 14, padding: '20px 22px', marginBottom: 14,
              }}>
                {/* Header riesgo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
                    <span style={{
                      fontSize: 10, fontWeight: 900, letterSpacing: 1.5,
                      color: NIVEL_COLOR[r.nivel],
                      background: `${NIVEL_COLOR[r.nivel]}18`,
                      padding: '3px 12px', borderRadius: 20,
                    }}>
                      {r.nivel}
                    </span>
                    <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>{r.id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                    {r.modulos.map(m => (
                      <span key={m} style={{
                        fontSize: 9, fontWeight: 700, color: INDIGO,
                        background: 'rgba(99,102,241,0.1)',
                        padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' as const,
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
                  {r.titulo}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, marginBottom: 12 }}>
                  {r.descripcion}
                </div>

                {/* Evidencia — valores reales que dispararon la regla */}
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7, marginBottom: 12 }}>
                  {Object.entries(r.evidencia).map(([k, v]) => (
                    <span key={k} style={{
                      fontSize: 11, fontWeight: 700,
                      color: NIVEL_COLOR[r.nivel],
                      background: `${NIVEL_COLOR[r.nivel]}12`,
                      padding: '3px 11px', borderRadius: 20,
                    }}>
                      {k}: {typeof v === 'number' ? v : String(v)}
                    </span>
                  ))}
                </div>

                {/* Normativa */}
                <div style={{
                  fontSize: 11, color: '#475569', lineHeight: 1.6,
                  borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: 10, marginBottom: 10,
                }}>
                  <span style={{ fontWeight: 700, color: '#64748b' }}>Normativa: </span>
                  {r.normativa}
                </div>

                {/* Acción recomendada */}
                <div style={{
                  fontSize: 12, color: '#e2e8f0', lineHeight: 1.6,
                  background: 'rgba(0,0,0,0.18)', borderRadius: 8, padding: '10px 14px',
                }}>
                  <span style={{ fontWeight: 800, color: GREEN }}>▸ Acción: </span>
                  {r.accion}
                </div>
              </div>
            ))}

            {/* ANÁLISIS IA */}
            {data.analisisIA && (
              <div style={{
                marginTop: 24,
                background: 'rgba(99,102,241,0.05)',
                border: `1px solid rgba(99,102,241,0.2)`,
                borderRadius: 16, padding: '24px 26px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ color: INDIGO, fontSize: 18 }}>✦</span>
                  <span style={{ color: INDIGO, fontWeight: 800, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' as const }}>
                    Análisis IA — basado en tus datos reales
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-wrap' as const }}>
                  {data.analisisIA}
                </div>
                <div style={{ marginTop: 14, fontSize: 11, color: '#334155' }}>
                  ✓ La IA usa exclusivamente los riesgos detectados por reglas determinísticas — no inventa valores ni normativas.
                </div>
              </div>
            )}

            {/* FOOTER */}
            <div style={{
              marginTop: 28, padding: '12px 18px',
              background: PANEL, borderRadius: 12, border: `1px solid ${BORD}`,
              fontSize: 11, color: '#1e3a5f', lineHeight: 1.6,
            }}>
              Análisis generado: {new Date(data.generadoEn).toLocaleString('es-AR')} ·
              Reglas activas: 10 · 100% determinístico ·
              Sin alucinaciones en la detección base
            </div>
          </>
        )}
      </div>
    </div>
  );
}
