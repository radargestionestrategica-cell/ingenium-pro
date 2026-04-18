'use client';
import { useState } from 'react';

function calcMAOP(OD: number, t: number, SMYS: number, F = 0.72, E = 1.0, T_op = 20) {
  if (OD <= 0 || t <= 0 || SMYS <= 0 || t >= OD / 2) return null;
  const T_factor = T_op <= 120 ? 1.0 : T_op <= 150 ? 0.967 : T_op <= 175 ? 0.933 : T_op <= 200 ? 0.900 : 0.867;
  const ratio = t / OD;
  const ro = OD / 2, ri = ro - t;
  const Pb = (2 * SMYS * t * F * E * T_factor) / OD;
  const Pl = SMYS * F * E * T_factor * (ro ** 2 - ri ** 2) / (ro ** 2 + ri ** 2);
  const P = ratio > 0.15 ? Pl : ratio > 0.10 ? Pb * (1 - (ratio - 0.10) / 0.05) + Pl * (ratio - 0.10) / 0.05 : Pb;
  const reg = ratio > 0.15 ? 'PARED GRUESA — Lamé' : ratio > 0.10 ? 'TRANSICIÓN' : 'PARED DELGADA — Barlow';
  const risk = P > 10 ? 'CRITICAL' : P > 7 ? 'HIGH' : P > 4 ? 'MEDIUM' : 'LOW';
  return {
    P: +P.toFixed(3), bar: +(P * 10).toFixed(2), psi: +(P * 145.04).toFixed(0),
    ratio: +(ratio * 100).toFixed(2), reg, risk,
    T_factor: +T_factor.toFixed(3),
    formula: `P = (2 × ${SMYS} × ${t} × ${F} × ${E} × ${T_factor}) / ${OD}`
  };
}

const MATERIALES = [
  { label: 'API 5L X42', smys: 290 }, { label: 'API 5L X52', smys: 359 },
  { label: 'API 5L X60', smys: 414 }, { label: 'API 5L X65', smys: 448 },
  { label: 'API 5L X70', smys: 483 }, { label: 'API 5L X80', smys: 552 },
];

const CLASES = [
  { label: 'Clase 1 — Zona rural (F=0.72)', F: 0.72 },
  { label: 'Clase 2 — Zona suburbana (F=0.60)', F: 0.60 },
  { label: 'Clase 3 — Zona urbana (F=0.50)', F: 0.50 },
  { label: 'Clase 4 — Zona alta densidad (F=0.40)', F: 0.40 },
];

const JUNTAS = [
  { label: 'Seamless (sin costura) E=1.00', E: 1.00 },
  { label: 'ERW — post-1970 E=1.00', E: 1.00 },
  { label: 'ERW — pre-1970 E=0.80', E: 0.80 },
  { label: 'Soldada espiral E=0.80', E: 0.80 },
  { label: 'Soldada doble arco sumergido E=1.00', E: 1.00 },
];

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<string, string> = {
  LOW: '🟢 SEGURO', MEDIUM: '🟡 MONITOREAR', HIGH: '🟠 REVISAR', CRITICAL: '🔴 DETENER'
};

export default function ModuloPetroleo() {
  const [OD, setOD] = useState('323.9');
  const [t, setT] = useState('9.5');
  const [smysIdx, setSmysIdx] = useState(3);
  const [claseIdx, setClaseIdx] = useState(0);
  const [juntaIdx, setJuntaIdx] = useState(1);
  const [T_op, setT_op] = useState('20');
  const [res, setRes] = useState<ReturnType<typeof calcMAOP>>(null);
  const [error, setError] = useState('');

  const calcular = () => {
    setError('');
    const od = parseFloat(OD), ti = parseFloat(t), top = parseFloat(T_op);
    if (isNaN(od) || isNaN(ti) || isNaN(top)) { setError('Completá todos los campos correctamente.'); return; }
    const r = calcMAOP(od, ti, MATERIALES[smysIdx].smys, CLASES[claseIdx].F, JUNTAS[juntaIdx].E, top);
    if (!r) { setError('Datos fuera de rango. Verificá diámetro y espesor.'); return; }
    setRes(r);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛢️</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Módulo Petróleo & Gas</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>MAOP — Máxima Presión Operativa Admisible · ASME B31.8</div>
            </div>
          </div>
          <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: ASME B31.8 Sec. 841.11 | Fórmula de Barlow modificada + Lamé para pared gruesa | Factores F, E, T reales
          </div>
        </div>

        {/* FORMULARIO */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Parámetros de Diseño</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Diámetro exterior OD (mm)</label>
              <input value={OD} onChange={e => setOD(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f8fafc', fontSize: 15, boxSizing: 'border-box' }}
                placeholder="Ej: 323.9" />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Espesor de pared t (mm)</label>
              <input value={t} onChange={e => setT(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f8fafc', fontSize: 15, boxSizing: 'border-box' }}
                placeholder="Ej: 9.5" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Material — SMYS (MPa)</label>
            <select value={smysIdx} onChange={e => setSmysIdx(+e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f8fafc', fontSize: 14 }}>
              {MATERIALES.map((m, i) => <option key={i} value={i}>{m.label} — {m.smys} MPa</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Clase de ubicación (Factor F)</label>
              <select value={claseIdx} onChange={e => setClaseIdx(+e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f8fafc', fontSize: 13 }}>
                {CLASES.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Tipo de junta (Factor E)</label>
              <select value={juntaIdx} onChange={e => setJuntaIdx(+e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f8fafc', fontSize: 13 }}>
                {JUNTAS.map((j, i) => <option key={i} value={i}>{j.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Temperatura de operación (°C)</label>
            <input value={T_op} onChange={e => setT_op(e.target.value)}
              style={{ width: '50%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f8fafc', fontSize: 15, boxSizing: 'border-box' }}
              placeholder="Ej: 20" />
          </div>

          {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}

          <button onClick={calcular}
            style={{ width: '100%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', borderRadius: 10, padding: '14px 0', color: '#000', fontWeight: 800, fontSize: 16, cursor: 'pointer', letterSpacing: 0.5 }}>
            ⚡ CALCULAR MAOP
          </button>
        </div>

        {/* RESULTADOS */}
        {res && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[res.risk]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados MAOP</div>
              <div style={{ background: riskColor[res.risk], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>{riskLabel[res.risk]}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'MAOP', value: `${res.P} MPa`, sub: 'Presión máxima admisible' },
                { label: 'MAOP', value: `${res.bar} bar`, sub: 'En bar' },
                { label: 'MAOP', value: `${res.psi} psi`, sub: 'En libras/pulg²' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[res.risk], fontSize: 20, fontWeight: 800 }}>{r.value}</div>
                  <div style={{ color: '#475569', fontSize: 10 }}>{r.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>Régimen de cálculo</div>
                <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>{res.reg}</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>Relación t/OD</div>
                <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>{res.ratio}%</div>
              </div>
            </div>

            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#a78bfa', marginBottom: 4, fontWeight: 700 }}>FÓRMULA APLICADA:</div>
              {res.formula}
              <div style={{ marginTop: 8, color: '#64748b' }}>
                F={CLASES[claseIdx].F} | E={JUNTAS[juntaIdx].E} | T_factor={res.T_factor} | SMYS={MATERIALES[smysIdx].smys} MPa
              </div>
              <div style={{ marginTop: 4, color: '#475569' }}>ASME B31.8 Sec. 841.11 — {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
