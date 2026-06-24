'use client';

import { useState, useEffect } from 'react';

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const GREEN = '#22c55e';
const BORD  = 'rgba(99,102,241,0.15)';

const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px',
  background: '#0a0f1e',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: 8, color: '#f1f5f9',
  fontSize: 12, outline: 'none', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 9, fontWeight: 700,
  color: '#475569', marginBottom: 4, letterSpacing: 0.5,
  textTransform: 'uppercase',
};
const g2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr',
  gap: 10, marginBottom: 10,
};

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

interface ActivoTelemetria {
  id: string;
  nombre: string;
  tipoActivo: string;
  geometriaJson: string;
  createdAt: string;
}

interface Proyecto {
  id: string;
  nombre: string;
}

interface GeometriaPileta {
  largoCoronamiento: number;
  anchoCoronamiento: number;
  profundidad: number;
  talud: number;
}

const GEOMETRIA_VACIA: GeometriaPileta = {
  largoCoronamiento: 0,
  anchoCoronamiento: 0,
  profundidad: 0,
  talud: 2,
};

export default function TelemetriaPage() {
  const [nombre, setNombre] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [geometria, setGeometria] = useState<GeometriaPileta>(GEOMETRIA_VACIA);
  const [activos, setActivos] = useState<ActivoTelemetria[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargarActivos = async () => {
    try {
      const res = await fetch('/api/telemetria', { credentials: 'include', headers: ipAuthHeader() });
      const json = await res.json();
      if (json?.ok) setActivos(json.data);
    } catch {
      // best-effort
    }
  };

  const cargarProyectos = async () => {
    try {
      const res = await fetch('/api/proyectos', { credentials: 'include', headers: ipAuthHeader() });
      const json = await res.json();
      if (json?.ok) setProyectos(json.data);
    } catch {
      // best-effort
    }
  };

  useEffect(() => { cargarActivos(); cargarProyectos(); }, []);

  const upd = (campo: keyof GeometriaPileta, valor: number) => {
    setGeometria(prev => ({ ...prev, [campo]: valor }));
  };

  const guardar = async () => {
    if (!nombre) {
      setMensaje('Ingresá un nombre para el activo');
      return;
    }
    setGuardando(true);
    setMensaje('');
    try {
      const res = await fetch('/api/telemetria', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...ipAuthHeader() },
        body: JSON.stringify({
          nombre,
          tipoActivo: 'pileta',
          geometriaJson: JSON.stringify(geometria),
          proyectoId: proyectoId || null,
        }),
      });
      const json = await res.json();
      if (json?.ok) {
        setMensaje('✅ Activo creado');
        setNombre('');
        setProyectoId('');
        setGeometria(GEOMETRIA_VACIA);
        cargarActivos();
      } else {
        setMensaje('No se pudo crear el activo. Revisá los datos e intentá de nuevo.');
      }
    } catch {
      setMensaje('No se pudo crear el activo. Revisá los datos e intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

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
        <span style={{ color: '#334155', fontSize: 13 }}>Telemetría</span>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* TÍTULO */}
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>📡 Telemetría — Activos</h1>
        <p style={{ fontSize: 12, color: '#475569', marginBottom: 16 }}>
          Cargá un activo de tipo pileta troncopiramidal con su geometría.
        </p>

        {/* CABECERA EXPLICATIVA */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          marginBottom: 24,
        }}>
          {[
            { icono: '💡', titulo: 'Para qué es', texto: 'Convierte una medición real de campo en un cálculo normativo auditable y sellado.' },
            { icono: '🚀', titulo: 'Cómo se usa', texto: 'Cargás la geometría de la pileta una vez, después el nivel medido, y la plataforma calcula y sella el resultado con firma SHA-256.' },
            { icono: '📐', titulo: 'Normas', texto: 'Fórmula del prismatoide para volumen, USACE EM 1110-2-1902 para estabilidad de talud, empuje hidrostático clásico.' },
            { icono: '📊', titulo: 'Qué calcula', texto: 'Volumen actual, capacidad restante, cantidad de camiones, empuje sobre la pared y factor de seguridad del talud.' },
            { icono: '🔗', titulo: 'Con qué módulos se cruza', texto: 'Las lecturas alimentan Hidráulica y Represas mediante la Inteligencia Cruzada.' },
          ].map(s => (
            <div key={s.titulo} style={{
              border: `1px solid ${BORD}`, borderRadius: 12,
              background: 'rgba(7,13,26,0.8)', padding: 14,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                {s.icono} {s.titulo}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                {s.texto}
              </div>
            </div>
          ))}
        </div>

        {/* FORMULARIO */}
        <div style={{
          border: `1px solid ${BORD}`, borderRadius: 12,
          background: 'rgba(7,13,26,0.8)', padding: 16, marginBottom: 32,
        }}>
          <div style={g2}>
            <div>
              <label style={lbl}>Nombre del activo</label>
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                style={inp}
                placeholder="Ej: Pileta API VMN-03"
              />
            </div>
            <div>
              <label style={lbl}>Proyecto</label>
              <select value={proyectoId} onChange={e => setProyectoId(e.target.value)} style={inp}>
                <option value="" style={{ background: '#0a0f1e' }}>Sin proyecto, cálculo rápido</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#0a0f1e' }}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={g2}>
            <div>
              <label style={lbl}>Coronamiento — largo (m)</label>
              <input
                value={geometria.largoCoronamiento || ''}
                onChange={e => upd('largoCoronamiento', parseFloat(e.target.value) || 0)}
                style={inp} type="number" min="0" step="0.1"
              />
            </div>
            <div>
              <label style={lbl}>Coronamiento — ancho (m)</label>
              <input
                value={geometria.anchoCoronamiento || ''}
                onChange={e => upd('anchoCoronamiento', parseFloat(e.target.value) || 0)}
                style={inp} type="number" min="0" step="0.1"
              />
            </div>
          </div>

          <div style={g2}>
            <div>
              <label style={lbl}>Profundidad (m)</label>
              <input
                value={geometria.profundidad || ''}
                onChange={e => upd('profundidad', parseFloat(e.target.value) || 0)}
                style={inp} type="number" min="0" step="0.1"
              />
            </div>
            <div>
              <label style={lbl}>Talud (horizontal por 1 vertical)</label>
              <input
                value={geometria.talud || ''}
                onChange={e => upd('talud', parseFloat(e.target.value) || 0)}
                style={inp} type="number" min="0" step="0.1"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={guardar} disabled={guardando} style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              border: 'none', borderRadius: 8, color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: guardando ? 'default' : 'pointer',
              opacity: guardando ? 0.6 : 1,
            }}>
              💾 {guardando ? 'Guardando…' : 'Crear activo'}
            </button>
            {mensaje && (
              <span style={{ fontSize: 12, color: mensaje.startsWith('✅') ? GREEN : '#f87171', fontWeight: 600 }}>
                {mensaje}
              </span>
            )}
          </div>
        </div>

        {/* LISTA DE ACTIVOS */}
        <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: '#94a3b8' }}>Activos cargados</h2>
        {activos.length === 0 ? (
          <div style={{ fontSize: 12, color: '#475569', padding: 12, background: '#0a0f1e', borderRadius: 8 }}>
            No hay activos cargados todavía.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activos.map(a => (
              <div key={a.id} style={{
                border: `1px solid ${BORD}`, borderRadius: 10,
                background: '#0a0f1e', padding: '10px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{a.nombre}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{a.tipoActivo}</div>
                </div>
                <div style={{ fontSize: 10, color: '#334155' }}>
                  {new Date(a.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
