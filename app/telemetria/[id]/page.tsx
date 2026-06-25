'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calcularPileta, calcularEstabilidadPared } from '@/lib/telemetria-calculo';

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const BORD  = 'rgba(99,102,241,0.15)';

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

interface GeometriaPileta {
  largoCoronamiento: number;
  anchoCoronamiento: number;
  profundidad: number;
  talud: number;
}

interface ActivoTelemetria {
  id: string;
  nombre: string;
  tipoActivo: string;
  geometriaJson: string;
  proyectoId: string | null;
  createdAt: string;
}

export default function FichaActivoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activo, setActivo] = useState<ActivoTelemetria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [nivelMedido, setNivelMedido] = useState('');
  const [guardandoLectura, setGuardandoLectura] = useState(false);
  const [mensajeLectura, setMensajeLectura] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [resultados, setResultados] = useState<{
    volumenActual: number; capacidadRestante: number; camiones30m3: number;
    empujeHidrostatico: number; factorSeguridadDeslizamiento: number; nivel: number;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/telemetria/${id}`, { credentials: 'include', headers: ipAuthHeader() })
      .then(res => {
        if (res.status === 401 || res.status === 403) { router.replace('/Login'); return null; }
        return res.ok ? res.json() : null;
      })
      .then(json => {
        if (!json) return;
        if (json?.ok) setActivo(json.activo);
        else setError('No se pudo cargar el activo.');
      })
      .catch(() => router.replace('/Login'))
      .finally(() => setCargando(false));
  }, [id, router]);

  const guardarLectura = async () => {
    const valor = parseFloat(nivelMedido);
    if (!activo || isNaN(valor)) {
      setMensajeLectura('Ingresá un valor numérico válido para el nivel.');
      return;
    }
    setGuardandoLectura(true);
    setMensajeLectura('');
    try {
      const res = await fetch('/api/telemetria/lecturas', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...ipAuthHeader() },
        body: JSON.stringify({ activoId: activo.id, magnitud: 'nivel', valor, unidad: 'm', fuente: 'manual' }),
      });
      const json = await res.json();
      if (json?.ok) {
        setMensajeLectura('✅ Lectura guardada y sellada con éxito.');
        if (geometria) {
          const r1 = calcularPileta(geometria, valor);
          const r2 = calcularEstabilidadPared(valor, 9.81, 30, geometria.talud);
          setResultados({ volumenActual: r1.volumenActual, capacidadRestante: r1.capacidadRestante, camiones30m3: r1.camiones30m3, empujeHidrostatico: r2.empujeHidrostatico, factorSeguridadDeslizamiento: r2.factorSeguridadDeslizamiento, nivel: valor });
        }
        setNivelMedido('');
        inputRef.current?.focus();
      } else {
        setMensajeLectura('No se pudo guardar la lectura. Intentá de nuevo.');
      }
    } catch {
      setMensajeLectura('Error de conexión. Intentá de nuevo.');
    } finally {
      setGuardandoLectura(false);
    }
  };

  const geometria: GeometriaPileta | null = (() => {
    try { return activo ? JSON.parse(activo.geometriaJson) : null; } catch { return null; }
  })();

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{
        height: 56, background: PANEL,
        borderBottom: `1px solid ${BORD}`,
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      }}>
        <a href="/telemetria" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
          ← Telemetría
        </a>
        <span style={{ color: GOLD, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>INGENIUM PRO</span>
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 300 }}>Ω</span>
        <span style={{ color: '#334155', fontSize: 13 }}>Ficha de activo</span>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        {cargando && <div style={{ fontSize: 12, color: '#475569' }}>Cargando…</div>}
        {error && <div style={{ fontSize: 12, color: '#f87171' }}>{error}</div>}

        {activo && (
          <>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>📡 {activo.nombre}</h1>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 24 }}>
              Tipo: {activo.tipoActivo} · Creado: {new Date(activo.createdAt).toLocaleDateString()}
            </div>

            {geometria && (
              <div style={{
                border: `1px solid ${BORD}`, borderRadius: 12,
                background: 'rgba(7,13,26,0.8)', padding: 16,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Geometría de la pileta
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { l: 'Coronamiento largo', v: `${geometria.largoCoronamiento} m` },
                    { l: 'Coronamiento ancho', v: `${geometria.anchoCoronamiento} m` },
                    { l: 'Profundidad',        v: `${geometria.profundidad} m` },
                    { l: 'Talud (H:V)',        v: `${geometria.talud}:1` },
                  ].map(r => (
                    <div key={r.l} style={{ background: '#0a0f1e', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>{r.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORMULARIO LECTURA */}
            <div style={{
              border: `1px solid ${BORD}`, borderRadius: 12,
              background: 'rgba(7,13,26,0.8)', padding: 16, marginTop: 16,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                📏 Cargar lectura — nivel medido
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  type="number"
                  min="0"
                  step="0.01"
                  value={nivelMedido}
                  onChange={e => setNivelMedido(e.target.value)}
                  placeholder="Ej: 3.20"
                  style={{
                    width: 140, padding: '8px 10px',
                    background: '#0a0f1e', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none',
                  }}
                />
                <span style={{ fontSize: 12, color: '#475569' }}>m</span>
                <button
                  onClick={guardarLectura}
                  disabled={guardandoLectura}
                  style={{
                    padding: '9px 18px',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    border: 'none', borderRadius: 8, color: '#fff',
                    fontSize: 12, fontWeight: 700, cursor: guardandoLectura ? 'default' : 'pointer',
                    opacity: guardandoLectura ? 0.6 : 1,
                  }}
                >
                  {guardandoLectura ? 'Guardando…' : '💾 Guardar lectura'}
                </button>
              </div>
              {mensajeLectura && (
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: mensajeLectura.startsWith('✅') ? '#4ade80' : '#f87171' }}>
                  {mensajeLectura}
                </div>
              )}
            </div>

            {resultados && (() => {
              const fs = resultados.factorSeguridadDeslizamiento;
              const color = fs >= 1.5 ? '#4ade80' : fs >= 1.3 ? '#facc15' : '#f87171';
              const label = fs >= 1.5 ? 'SEGURO' : fs >= 1.3 ? 'ALERTA' : 'CRÍTICO';
              return (
                <div style={{ border: `1px solid ${BORD}`, borderRadius: 12, background: 'rgba(7,13,26,0.8)', padding: 16, marginTop: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                    📊 Resultados — nivel {resultados.nivel.toFixed(2)} m
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {([
                      { l: 'Volumen actual',      v: `${resultados.volumenActual.toFixed(2)} m³` },
                      { l: 'Capacidad restante',  v: `${resultados.capacidadRestante.toFixed(2)} m³` },
                      { l: 'Camiones (30 m³)',    v: String(resultados.camiones30m3) },
                      { l: 'Empuje hidrostático', v: `${resultados.empujeHidrostatico.toFixed(2)} kN/m` },
                    ] as { l: string; v: string }[]).map(r => (
                      <div key={r.l} style={{ background: '#0a0f1e', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>{r.l}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color }}>
                      Factor de seguridad del talud: {fs.toFixed(3)} — {label}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
