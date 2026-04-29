'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import { useState } from 'react';

interface ResultadoVertedero {
  Q: number; // m³/s
  v: number; // m/s
  Fr: number; // Froude
  tipo: string;
  normativa: string;
}

interface ResultadoFiltracion {
  q: number; // m²/s por metro lineal
  gradiente: number;
  seguro: boolean;
  normativa: string;
}

function calcularVertedero(L: number, H: number, Cd: number): ResultadoVertedero {
  // Fórmula de Francis — USACE EM 1110-2-1603
  const g = 9.81;
  const Q = Cd * L * Math.pow(H, 1.5) * Math.sqrt(2 * g);
  const A = L * H;
  const v = Q / A;
  const Fr = v / Math.sqrt(g * H);
  const tipo = Fr < 1 ? 'Flujo subcrítico' : Fr > 1 ? 'Flujo supercrítico' : 'Flujo crítico';
  return {
    Q: Math.round(Q * 1000) / 1000,
    v: Math.round(v * 1000) / 1000,
    Fr: Math.round(Fr * 1000) / 1000,
    tipo,
    normativa: 'USACE EM 1110-2-1603 · ICOLD Bulletin 58',
  };
}

function calcularFiltracion(H: number, k: number, L: number, d: number): ResultadoFiltracion {
  // Ley de Darcy — USACE EM 1110-2-1901
  const gradiente = H / L;
  const q = k * gradiente * d;
  const seguro = gradiente < 0.5; // Gradiente crítico según Terzaghi
  return {
    q: Math.round(q * 1e6) / 1e6,
    gradiente: Math.round(gradiente * 1000) / 1000,
    seguro,
    normativa: 'USACE EM 1110-2-1901 · Ley de Darcy · Terzaghi',
  };
}

export default function ModuloRepresas() {
  const [calculo, setCalculo] = useState<'vertedero' | 'filtracion'>('vertedero');

  // Vertedero
  const [L, setL] = useState('10');
  const [H, setH] = useState('2');
  const [Cd, setCd] = useState('1.84');
  const [resV, setResV] = useState<ResultadoVertedero | null>(null);

  // Filtración
  const [Hf, setHf] = useState('5');
  const [k, setK] = useState('0.0001');
  const [Lf, setLf] = useState('20');
  const [d, setD] = useState('1');
  const [resF, setResF] = useState<ResultadoFiltracion | null>(null);

  const [error, setError] = useState('');

  const calcular = () => {
    setError('');
    try {
      if (calculo === 'vertedero') {
        const lv = parseFloat(L);
        const hv = parseFloat(H);
        const cd = parseFloat(Cd);
        if (isNaN(lv) || isNaN(hv) || isNaN(cd) || lv <= 0 || hv <= 0 || cd <= 0) {
          setError('Todos los valores deben ser positivos'); return;
        }
        setResV(calcularVertedero(lv, hv, cd));
      } else {
        const hf = parseFloat(Hf);
        const kv = parseFloat(k);
        const lf = parseFloat(Lf);
        const dv = parseFloat(d);
        if (isNaN(hf) || isNaN(kv) || isNaN(lf) || isNaN(dv) || hf <= 0 || kv <= 0 || lf <= 0 || dv <= 0) {
          setError('Todos los valores deben ser positivos'); return;
        }
        setResF(calcularFiltracion(hf, kv, lf, dv));
      }
    } catch {
      setError('Error en el cálculo. Verificá los datos.');
    }
  };

  return (
    <div style={{ padding: 24, color: '#f1f5f9', fontFamily: 'Inter, sans-serif' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(6,182,212,0.05))',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: 16, padding: 24, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>🌊</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Módulo Represas</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Vertederos (Francis) + Filtración (Darcy) | USACE · ICOLD
          </div>
          <div style={{
            marginTop: 6, fontSize: 11, color: '#06b6d4',
            background: 'rgba(6,182,212,0.1)', padding: '2px 10px',
            borderRadius: 20, display: 'inline-block',
          }}>
            USACE EM 1110-2-1603 · USACE EM 1110-2-1901 · ICOLD Bulletin 58
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{
        display: 'flex', background: '#0a0f1e', borderRadius: 12,
        padding: 4, marginBottom: 24, border: '1px solid rgba(6,182,212,0.15)',
      }}>
        {(['vertedero', 'filtracion'] as const).map(t => (
          <button key={t} onClick={() => { setCalculo(t); setError(''); setResV(null); setResF(null); }}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: calculo === t ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'transparent',
              color: calculo === t ? '#fff' : '#475569',
              boxShadow: calculo === t ? '0 4px 12px rgba(6,182,212,0.4)' : 'none',
            }}>
            {t === 'vertedero' ? 'Vertedero Francis' : 'Filtración Darcy'}
          </button>
        ))}
      </div>

      {/* FORMULARIO VERTEDERO */}
      {calculo === 'vertedero' && (
        <div>
          <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' as const }}>
            Parámetros — Fórmula de Francis
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Longitud vertedero L (m)</label>
              <input value={L} onChange={e => setL(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Carga hidráulica H (m)</label>
              <input value={H} onChange={e => setH(e.target.value)} style={inp} type="number" min="0" step="0.01" />
            </div>
            <div>
              <label style={lbl}>Coef. descarga Cd (Francis=1.84)</label>
              <input value={Cd} onChange={e => setCd(e.target.value)} style={inp} type="number" min="0" step="0.01" />
            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO FILTRACIÓN */}
      {calculo === 'filtracion' && (
        <div>
          <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' as const }}>
            Parámetros — Ley de Darcy
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Carga hidráulica H (m)</label>
              <input value={Hf} onChange={e => setHf(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Conductividad hidráulica k (m/s)</label>
              <input value={k} onChange={e => setK(e.target.value)} style={inp} type="number" min="0" step="0.00001" />
            </div>
            <div>
              <label style={lbl}>Longitud de filtración L (m)</label>
              <input value={Lf} onChange={e => setLf(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Espesor estrato d (m)</label>
              <input value={d} onChange={e => setD(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 16,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', fontSize: 13,
        }}>{error}</div>
      )}

      <button onClick={calcular} style={{
        width: '100%', padding: '13px 0', marginBottom: 24,
        background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
        border: 'none', borderRadius: 12, color: '#fff',
        fontSize: 15, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(6,182,212,0.4)',
      }}>
        Calcular
      </button>

      {/* RESULTADO VERTEDERO */}
      {resV && (
        <div style={{
          background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)',
          borderRadius: 16, padding: 20,
        }}>
          <div style={{ fontSize: 13, color: '#06b6d4', fontWeight: 700, marginBottom: 16 }}>
            RESULTADO — VERTEDERO FRANCIS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Caudal Q', value: `${resV.Q} m³/s` },
              { label: 'Velocidad v', value: `${resV.v} m/s` },
              { label: 'Número de Froude', value: resV.Fr },
              { label: 'Régimen', value: resV.tipo },
            ].map((r, i) => (
              <div key={i} style={{ background: '#0a0f1e', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, textTransform: 'uppercase' as const }}>{r.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#06b6d4' }}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#475569', padding: '8px 12px', background: '#0a0f1e', borderRadius: 8 }}>
            {resV.normativa}
          </div>
        </div>
      )}

      {/* RESULTADO FILTRACIÓN */}
      {resF && (
        <div style={{
          background: resF.seguro ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${resF.seguro ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 16, padding: 20,
        }}>
          <div style={{ fontSize: 13, color: resF.seguro ? '#4ade80' : '#f87171', fontWeight: 700, marginBottom: 16 }}>
            RESULTADO — FILTRACIÓN DARCY · {resF.seguro ? '✅ GRADIENTE SEGURO' : '⚠️ GRADIENTE CRÍTICO'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Caudal filtración q', value: `${resF.q} m²/s` },
              { label: 'Gradiente hidráulico i', value: resF.gradiente },
              { label: 'Estado', value: resF.seguro ? 'Seguro (i < 0.5)' : 'Crítico (i ≥ 0.5)' },
              { label: 'Criterio Terzaghi', value: 'icrit = 0.5' },
            ].map((r, i) => (
              <div key={i} style={{ background: '#0a0f1e', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, textTransform: 'uppercase' as const }}>{r.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: resF.seguro ? '#4ade80' : '#f87171' }}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#475569', padding: '8px 12px', background: '#0a0f1e', borderRadius: 8 }}>
            {resF.normativa}
          </div>
        </div>
      )}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: '#0a0f1e', border: '1px solid rgba(6,182,212,0.2)',
  borderRadius: 10, color: '#f1f5f9', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#64748b', marginBottom: 6, letterSpacing: 0.5,
  textTransform: 'uppercase',
};