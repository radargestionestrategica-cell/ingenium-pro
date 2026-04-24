'use client';
import { useState, useEffect } from 'react';
import {
  ProyectoData,
  PROYECTO_VACIO,
  guardarProyecto,
  leerProyecto,
  limpiarProyecto,
} from '@/lib/proyecto';

// ═══════════════════════════════════════════════════════════════
//  BANNER DE PROYECTO ACTIVO — INGENIUM PRO v8.1
//  Componente colapsable. Se agrega encima de cualquier módulo.
//  El ingeniero carga los datos UNA VEZ.
//  Todos los módulos que lo importen los leen automáticamente.
//  No modifica ningún módulo existente.
// ═══════════════════════════════════════════════════════════════

const INDUSTRIAS = [
  'Petróleo / Gas', 'Perforación', 'Minería', 'Represas',
  'Acueductos / Hidráulica', 'MMO / Construcción', 'Vialidad', 'Arquitectura',
];

const NORMAS = [
  'ASME B31.8', 'ASME B31.4', 'ASME B31.3', 'API 5L',
  'AWWA M11', 'AISC 360', 'AASHTO 93', 'ASCE 7-22',
  'CIRSOC 201', 'NSR-10', 'NCh 170', 'NTE E.060',
];

const ZONAS = [
  { v: 'zona0', l: 'Zona 0 / Div.1 — Continua' },
  { v: 'zona1', l: 'Zona 1 / Div.1 — Ocasional' },
  { v: 'zona2', l: 'Zona 2 / Div.2 — Infrecuente' },
];

const PAISES = [
  'Argentina', 'Chile', 'Colombia', 'México', 'Perú',
  'Venezuela', 'Brasil', 'Uruguay', 'Ecuador', 'Bolivia',
];

const NPS_LISTA = [
  '0.5','0.75','1','1.5','2','2.5','3',
  '4','6','8','10','12','14','16','18','20','24',
];

const MATERIALES = [
  'API 5L Grado B','API 5L X42','API 5L X52',
  'API 5L X60','API 5L X65','API 5L X70','API 5L X80',
  'ASTM A106 Gr.B','ASTM A36',
];

// ── Estilos base ──────────────────────────────────────────────
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
const g3: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
  gap: 10, marginBottom: 10,
};

// ── Componente ────────────────────────────────────────────────
export default function ProyectoContexto() {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [proyecto, setProyecto] = useState<ProyectoData>(PROYECTO_VACIO);
  const [draft, setDraft] = useState<ProyectoData>(PROYECTO_VACIO);
  const [guardado, setGuardado] = useState(false);
  const [tieneProyecto, setTieneProyecto] = useState(false);

  // Leer proyecto guardado al montar
  useEffect(() => {
    const p = leerProyecto();
    if (p && p.nombre) {
      setProyecto(p);
      setDraft(p);
      setTieneProyecto(true);
    }
  }, []);

  const guardar = () => {
    guardarProyecto(draft);
    setProyecto(draft);
    setTieneProyecto(!!draft.nombre);
    setEditando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const limpiar = () => {
    limpiarProyecto();
    setProyecto(PROYECTO_VACIO);
    setDraft(PROYECTO_VACIO);
    setTieneProyecto(false);
    setEditando(false);
  };

  const upd = (campo: keyof ProyectoData, valor: string | number | null) => {
    setDraft(prev => ({ ...prev, [campo]: valor }));
  };

  // Datos completados (de 6 campos clave)
  const camposCompletos = [
    proyecto.nombre,
    proyecto.fluido,
    proyecto.presion_bar,
    proyecto.temperatura_c,
    proyecto.nps_pulgadas,
    proyecto.material_tuberia,
  ].filter(v => v !== null && v !== '' && v !== 0).length;

  const colorBanner = tieneProyecto ? '#6366f1' : '#334155';

  return (
    <div style={{
      margin: '0 0 16px 0',
      border: `1px solid ${colorBanner}40`,
      borderRadius: 12,
      overflow: 'hidden',
      background: 'rgba(7,13,26,0.8)',
    }}>

      {/* ── CABECERA COLAPSABLE ────────────────────────────── */}
      <div
        onClick={() => setAbierto(!abierto)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', cursor: 'pointer',
          background: tieneProyecto
            ? 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))'
            : 'rgba(15,23,42,0.6)',
          borderBottom: abierto ? `1px solid ${colorBanner}30` : 'none',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: tieneProyecto
            ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e293b',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 13,
        }}>
          {tieneProyecto ? '📁' : '📂'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {tieneProyecto ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa' }}>
                {proyecto.nombre} — {proyecto.industria}
              </div>
              <div style={{ fontSize: 10, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                {[
                  proyecto.fluido && `Fluido: ${proyecto.fluido}`,
                  proyecto.presion_bar && `P: ${proyecto.presion_bar} bar`,
                  proyecto.temperatura_c && `T: ${proyecto.temperatura_c}°C`,
                  proyecto.nps_pulgadas && `NPS: ${proyecto.nps_pulgadas}"`,
                  proyecto.material_tuberia,
                ].filter(Boolean).join(' · ') || 'Sin datos de proceso cargados'}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: '#475569' }}>
              Sin proyecto activo — creá uno para conectar todos los módulos
            </div>
          )}
        </div>

        {tieneProyecto && (
          <div style={{
            fontSize: 9, fontWeight: 700, color: '#6366f1',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20, padding: '2px 8px', flexShrink: 0,
          }}>
            {camposCompletos}/6 datos
          </div>
        )}

        <div style={{ color: '#475569', fontSize: 12, flexShrink: 0 }}>
          {abierto ? '▲' : '▼'}
        </div>
      </div>

      {/* ── PANEL EXPANDIDO ───────────────────────────────── */}
      {abierto && (
        <div style={{ padding: 16 }}>

          {!editando ? (
            // ── VISTA RESUMEN ──────────────────────────────
            <div>
              {tieneProyecto ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: 8, marginBottom: 12,
                }}>
                  {[
                    { l: 'Proyecto',        v: proyecto.nombre || '—' },
                    { l: 'Industria',       v: proyecto.industria },
                    { l: 'Fluido',          v: proyecto.fluido || '—' },
                    { l: 'Presión diseño',  v: proyecto.presion_bar ? `${proyecto.presion_bar} bar` : '—' },
                    { l: 'Temperatura',     v: proyecto.temperatura_c ? `${proyecto.temperatura_c}°C` : '—' },
                    { l: 'NPS tubería',     v: proyecto.nps_pulgadas ? `${proyecto.nps_pulgadas}"` : '—' },
                    { l: 'Material',        v: proyecto.material_tuberia || '—' },
                    { l: 'Norma',           v: proyecto.norma },
                    { l: 'H₂S',            v: `${proyecto.H2S_ppm} ppm` },
                    { l: 'Zona eléctrica',  v: proyecto.zona_electrica },
                    { l: 'País',            v: proyecto.pais },
                    { l: 'Grav. específica',v: `${proyecto.gravedad_especifica}` },
                  ].map((r, i) => (
                    <div key={i} style={{
                      background: '#0a0f1e', borderRadius: 8, padding: '8px 10px',
                    }}>
                      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 2 }}>{r.l}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: r.v === '—' ? '#334155' : '#f1f5f9' }}>{r.v}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  fontSize: 12, color: '#475569', marginBottom: 12,
                  padding: 12, background: '#0a0f1e', borderRadius: 8, lineHeight: 1.6,
                }}>
                  Creá un proyecto para que los módulos compartan datos automáticamente.
                  El ingeniero carga los datos una sola vez y todos los módulos los usan.
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setDraft(proyecto); setEditando(true); }}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    border: 'none', borderRadius: 8, color: '#fff',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                  {tieneProyecto ? '✏️ Editar proyecto' : '➕ Crear proyecto'}
                </button>
                {tieneProyecto && (
                  <button onClick={limpiar} style={{
                    padding: '8px 14px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 8, color: '#f87171',
                    fontSize: 12, cursor: 'pointer',
                  }}>
                    Limpiar
                  </button>
                )}
              </div>
            </div>

          ) : (
            // ── FORMULARIO EDICIÓN ──────────────────────────
            <div>
              <div style={g2}>
                <div>
                  <label style={lbl}>Nombre del proyecto</label>
                  <input
                    value={draft.nombre}
                    onChange={e => upd('nombre', e.target.value)}
                    style={inp}
                    placeholder="Ej: Pozo VMN-03 Etapa 2"
                  />
                </div>
                <div>
                  <label style={lbl}>Industria</label>
                  <select value={draft.industria} onChange={e => upd('industria', e.target.value)} style={inp}>
                    {INDUSTRIAS.map(i => <option key={i} value={i} style={{ background: '#0a0f1e' }}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div style={g3}>
                <div>
                  <label style={lbl}>Fluido</label>
                  <input
                    value={draft.fluido}
                    onChange={e => upd('fluido', e.target.value)}
                    style={inp}
                    placeholder="Ej: Gas natural / Agua"
                  />
                </div>
                <div>
                  <label style={lbl}>Presión diseño (bar)</label>
                  <input
                    value={draft.presion_bar ?? ''}
                    onChange={e => upd('presion_bar', e.target.value ? parseFloat(e.target.value) : null)}
                    style={inp} type="number" min="0" step="0.1"
                  />
                </div>
                <div>
                  <label style={lbl}>Temperatura operación (°C)</label>
                  <input
                    value={draft.temperatura_c ?? ''}
                    onChange={e => upd('temperatura_c', e.target.value ? parseFloat(e.target.value) : null)}
                    style={inp} type="number" step="1"
                  />
                </div>
              </div>

              <div style={g3}>
                <div>
                  <label style={lbl}>NPS tubería (pulgadas)</label>
                  <select value={draft.nps_pulgadas} onChange={e => upd('nps_pulgadas', e.target.value)} style={inp}>
                    <option value="" style={{ background: '#0a0f1e' }}>— Sin datos —</option>
                    {NPS_LISTA.map(n => <option key={n} value={n} style={{ background: '#0a0f1e' }}>{n}"</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Material tubería</label>
                  <select value={draft.material_tuberia} onChange={e => upd('material_tuberia', e.target.value)} style={inp}>
                    <option value="" style={{ background: '#0a0f1e' }}>— Sin datos —</option>
                    {MATERIALES.map(m => <option key={m} value={m} style={{ background: '#0a0f1e' }}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Norma principal</label>
                  <select value={draft.norma} onChange={e => upd('norma', e.target.value)} style={inp}>
                    {NORMAS.map(n => <option key={n} value={n} style={{ background: '#0a0f1e' }}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div style={g3}>
                <div>
                  <label style={lbl}>H₂S (ppm)</label>
                  <input
                    value={draft.H2S_ppm}
                    onChange={e => upd('H2S_ppm', parseFloat(e.target.value) || 0)}
                    style={inp} type="number" min="0" step="10"
                  />
                </div>
                <div>
                  <label style={lbl}>Zona eléctrica</label>
                  <select value={draft.zona_electrica} onChange={e => upd('zona_electrica', e.target.value)} style={inp}>
                    {ZONAS.map(z => <option key={z.v} value={z.v} style={{ background: '#0a0f1e' }}>{z.l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>País</label>
                  <select value={draft.pais} onChange={e => upd('pais', e.target.value)} style={inp}>
                    {PAISES.map(p => <option key={p} value={p} style={{ background: '#0a0f1e' }}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Gravedad específica del fluido (SG)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    value={draft.gravedad_especifica}
                    onChange={e => upd('gravedad_especifica', parseFloat(e.target.value) || 1)}
                    style={{ ...inp, width: 120 }}
                    type="number" min="0.1" step="0.01"
                  />
                  <span style={{ fontSize: 10, color: '#334155' }}>
                    Agua=1.00 · Crudo lig.=0.82 · Gas oil=0.85 · Nafta=0.72
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={guardar} style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', borderRadius: 8, color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                }}>
                  💾 Guardar proyecto
                </button>
                <button onClick={() => setEditando(false)} style={{
                  padding: '10px 16px', background: '#1e293b',
                  border: '1px solid #334155', borderRadius: 8,
                  color: '#94a3b8', fontSize: 12, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
                {guardado && (
                  <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>
                    ✅ Guardado — disponible en todos los módulos
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 