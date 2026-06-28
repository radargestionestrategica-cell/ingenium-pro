'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calcularPileta, calcularEstabilidadPared } from '@/lib/telemetria-calculo';
import { buscarFSCritico } from '@/lib/bishop-buscador';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const BORD  = 'rgba(99,102,241,0.15)';

const SUELOS = [
  { label: 'Valores propios',  key: 'propio',         c: null, f: null, p: null   },
  { label: 'Arena suelta',     key: 'arena_suelta',   c: 0,    f: 30,   p: 17     },
  { label: 'Arena densa',      key: 'arena_densa',    c: 0,    f: 38,   p: 19     },
  { label: 'Grava',            key: 'grava',          c: 0,    f: 38,   p: 20     },
  { label: 'Limo',             key: 'limo',           c: 8,    f: 28,   p: 19     },
  { label: 'Arcilla blanda',   key: 'arcilla_blanda', c: 18,   f: 22,   p: 17.5   },
  { label: 'Arcilla media',    key: 'arcilla_media',  c: 35,   f: 24,   p: 18.5   },
  { label: 'Arcilla dura',     key: 'arcilla_dura',   c: 70,   f: 25,   p: 19.5   },
] as const;

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
  cohesion?: number;
  friccionGrados?: number;
  pesoEspecifico?: number;
}

interface ActivoTelemetria {
  id: string;
  nombre: string;
  tipoActivo: string;
  geometriaJson: string;
  cohesion: number | null;
  friccionGrados: number | null;
  pesoEspecifico: number | null;
  tipoRevestimiento: string | null;
  proyectoId: string | null;
  createdAt: string;
}

interface LecturaHistorial {
  id: string;
  magnitud: string;
  valor: number;
  unidad: string;
  fuente: string;
  hash: string | null;
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
  const [historial, setHistorial] = useState<LecturaHistorial[]>([]);
  const [tipoSuelo, setTipoSuelo] = useState<string>('propio');
  const [cohesionSuelo, setCohesionSuelo] = useState<number | null>(null);
  const [friccionSuelo, setFriccionSuelo] = useState<number | null>(null);
  const [pesoSuelo, setPesoSuelo] = useState<number | null>(null);
  const [guardandoMaterial, setGuardandoMaterial] = useState(false);
  const [mensajeMaterial, setMensajeMaterial] = useState('');
  const [tipoRevestimiento, setTipoRevestimiento] = useState<string>('sin_revestir');

  useEffect(() => {
    if (activo?.tipoRevestimiento) setTipoRevestimiento(activo.tipoRevestimiento);
  }, [activo]);

  const [resultados, setResultados] = useState<{
    volumenActual: number; capacidadRestante: number; camiones30m3: number;
    empujeHidrostatico: number; factorSeguridadDeslizamiento: number; nivel: number;
    hash: string; norma?: string;
  } | null>(null);

  useEffect(() => {
    if (!activo) return;
    fetch(`/api/telemetria/lecturas?activoId=${activo.id}`, { credentials: 'include', headers: ipAuthHeader() })
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json?.ok && Array.isArray(json.data)) {
          const ordenado = [...json.data as LecturaHistorial[]].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setHistorial(ordenado);
        }
      })
      .catch(() => {});
  }, [activo]);

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

  const guardarMaterial = async () => {
    if (!activo) return;
    setGuardandoMaterial(true);
    setMensajeMaterial('');
    try {
      const res = await fetch(`/api/telemetria/${activo.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...ipAuthHeader() },
        body: JSON.stringify({ cohesion: cohesionSuelo, friccionGrados: friccionSuelo, pesoEspecifico: pesoSuelo, tipoRevestimiento }),
      });
      const json = await res.json();
      if (json?.ok) {
        setMensajeMaterial('✅ Material guardado.');
        const r2 = await fetch(`/api/telemetria/${activo.id}`, { credentials: 'include', headers: ipAuthHeader() });
        const j2 = await r2.json();
        if (j2?.ok) setActivo(j2.activo);
      } else {
        setMensajeMaterial(json?.error ?? 'Error al guardar.');
      }
    } catch {
      setMensajeMaterial('Error de conexión.');
    } finally {
      setGuardandoMaterial(false);
    }
  };

  const guardarLectura = async () => {
    const valor = parseFloat(nivelMedido);
    if (!activo || isNaN(valor)) {
      setMensajeLectura('Ingresá un valor numérico válido para el nivel.');
      return;
    }
    setGuardandoLectura(true);
    setMensajeLectura('');
    const fsPreview = geometria ? calcularEstabilidadPared(valor, 9.81, 30, geometria.talud).factorSeguridadDeslizamiento : null;
    try {
      const res = await fetch('/api/telemetria/lecturas', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...ipAuthHeader() },
        body: JSON.stringify({ activoId: activo.id, magnitud: 'nivel', valor, unidad: 'm', fuente: 'manual', factorSeguridad: fsPreview }),
      });
      const json = await res.json();
      if (json?.ok) {
        setMensajeLectura('✅ Lectura guardada y sellada con éxito.');
        if (geometria) {
          const r1 = calcularPileta(geometria, valor);
          const r2 = calcularEstabilidadPared(valor, 9.81, 30, geometria.talud);
          setResultados({ volumenActual: r1.volumenActual, capacidadRestante: r1.capacidadRestante, camiones30m3: r1.camiones30m3, empujeHidrostatico: r2.empujeHidrostatico, factorSeguridadDeslizamiento: r2.factorSeguridadDeslizamiento, nivel: valor, hash: json.lectura?.hash ?? '', norma: `${r1.norma} · ${r2.norma}` });
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
              const c    = activo?.cohesion;
              const fric = activo?.friccionGrados;
              const peso = activo?.pesoEspecifico;
              const tieneMaterial = c != null && fric != null && peso != null;
              const fsTalud = (tieneMaterial && geometria)
                ? buscarFSCritico(geometria.profundidad, geometria.talud, c!, fric!, peso!, tipoRevestimiento === 'revestida' ? null : resultados.nivel)
                : null;
              const color = fsTalud != null ? (fsTalud >= 1.5 ? '#4ade80' : fsTalud >= 1.3 ? '#facc15' : '#f87171') : '#475569';
              const label = fsTalud != null ? (fsTalud >= 1.5 ? 'SEGURO' : fsTalud >= 1.3 ? 'ALERTA' : 'CRÍTICO') : '';
              return (
                <div style={{ border: `1px solid ${BORD}`, borderRadius: 12, background: 'rgba(7,13,26,0.8)', padding: 16, marginTop: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                    📊 Resultados — nivel {resultados.nivel.toFixed(2)} m
                  </div>
                  <div style={{ fontSize: 9, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Contenido y estructura del activo</div>
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
                  <div style={{ fontSize: 9, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 14, marginBottom: 8 }}>Integridad estructural</div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Tipo de suelo</div>
                    <select
                      value={tipoSuelo}
                      onChange={e => {
                        const key = e.target.value;
                        setTipoSuelo(key);
                        const s = SUELOS.find(x => x.key === key);
                        setCohesionSuelo(s?.c ?? null);
                        setFriccionSuelo(s?.f ?? null);
                        setPesoSuelo(s?.p ?? null);
                      }}
                      style={{
                        background: '#0a0f1e', border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: 8, color: '#f1f5f9', fontSize: 12, padding: '7px 10px',
                        outline: 'none', width: '100%', cursor: 'pointer',
                      }}
                    >
                      {SUELOS.map(s => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Tipo de revestimiento</div>
                    <select
                      value={tipoRevestimiento}
                      onChange={e => setTipoRevestimiento(e.target.value)}
                      style={{ background: '#0a0f1e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#f1f5f9', fontSize: 12, padding: '7px 10px', outline: 'none', width: '100%', cursor: 'pointer' }}
                    >
                      <option value="revestida">Revestida (membrana u hormigón)</option>
                      <option value="sin_revestir">Sin revestir (excavación en tierra)</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                    {([
                      { l: 'Cohesión (kPa)',          val: cohesionSuelo, set: setCohesionSuelo },
                      { l: 'Fricción (°)',             val: friccionSuelo, set: setFriccionSuelo },
                      { l: 'Peso espec. (kN/m³)',      val: pesoSuelo,     set: setPesoSuelo     },
                    ] as { l: string; val: number | null; set: (v: number | null) => void }[]).map(f => (
                      <div key={f.l}>
                        <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 3 }}>{f.l}</div>
                        <input
                          type="number" step="0.1"
                          value={f.val ?? ''}
                          onChange={e => f.set(e.target.value === '' ? null : parseFloat(e.target.value))}
                          style={{ width: '100%', padding: '7px 8px', background: '#0a0f1e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#f1f5f9', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={guardarMaterial}
                    disabled={guardandoMaterial}
                    style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, cursor: guardandoMaterial ? 'default' : 'pointer', opacity: guardandoMaterial ? 0.6 : 1, marginBottom: 12 }}
                  >
                    {guardandoMaterial ? 'Guardando…' : '💾 Guardar material del suelo'}
                  </button>
                  {mensajeMaterial && (
                    <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 600, color: mensajeMaterial.startsWith('✅') ? '#4ade80' : '#f87171' }}>{mensajeMaterial}</div>
                  )}
                  {!tieneMaterial ? (
                    <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>
                      Faltan datos de material del suelo para el factor de seguridad de talud.
                    </div>
                  ) : (
                    <>
                      <div style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
                        <div style={{ fontSize: 11, fontWeight: 700, color }}>
                          Factor de seguridad del talud: {fsTalud!.toFixed(3)} — {label}
                        </div>
                      </div>
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                        <div style={{ fontSize: 9, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Norma aplicada</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'ui-monospace,SFMono-Regular,monospace', wordBreak: 'break-all', fontWeight: 700 }}>USACE EM 1110-2-1902 · Método de Bishop Simplificado</div>
                      </div>
                    </>
                  )}
                  {resultados.hash && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                      <div style={{ fontSize: 9, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Sello SHA-256 verificable</div>
                      <div style={{ fontSize: 10, color: '#475569', fontFamily: 'ui-monospace,SFMono-Regular,monospace', wordBreak: 'break-all' }}>{resultados.hash}</div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* EVOLUCIÓN DEL NIVEL */}
            <div style={{ border: `1px solid ${BORD}`, borderRadius: 12, background: 'rgba(7,13,26,0.8)', padding: 16, marginTop: 16 }}>
              <div style={{ fontSize: 9, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Evolución del nivel en el tiempo</div>
              {historial.length >= 2 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={historial.map(l => ({ fecha: new Date(l.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }), nivel: l.valor }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, fontSize: 11, color: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="nivel" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ fontSize: 12, color: '#475569' }}>Se necesitan al menos dos lecturas para ver la evolución.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
