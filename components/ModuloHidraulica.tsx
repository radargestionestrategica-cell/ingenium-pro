'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import { useState } from 'react';

function calcDarcyWeisbach(Q: number, D: number, L: number, rugosidad: number, K_menor: number) {
  if (Q <= 0 || D <= 0 || L <= 0) return null;
  const D_m = D / 1000;
  const A = Math.PI / 4 * D_m * D_m;
  const V = (Q / 1000) / A;
  const nu = 1.004e-6;
  const Re = V * D_m / nu;
  const er = (rugosidad / 1000) / D_m;
  let f: number;
  if (Re < 2300) {
    f = 64 / Re;
  } else {
    f = 0.25 / Math.pow(Math.log10(er / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2);
  }
  const hf_mayor = f * (L / D_m) * V * V / (2 * 9.81);
  const hf_menor = K_menor * V * V / (2 * 9.81);
  const hf_total = hf_mayor + hf_menor;
  const dP_Pa = 998 * 9.81 * hf_total;
  const regimen = Re < 2300 ? 'LAMINAR' : Re < 4000 ? 'TRANSICION' : 'TURBULENTO';
  const riesgo = V > 3 ? 'CRITICAL' : V > 2 ? 'HIGH' : V > 1.5 ? 'MEDIUM' : 'LOW';
  return {
    V: +V.toFixed(3), Re: +Re.toFixed(0), f: +f.toFixed(6),
    hf_mayor: +hf_mayor.toFixed(3), hf_menor: +hf_menor.toFixed(3),
    hf_total: +hf_total.toFixed(3), dP_Pa: +dP_Pa.toFixed(0),
    dP_bar: +(dP_Pa / 1e5).toFixed(4), dP_mca: +hf_total.toFixed(3),
    regimen, riesgo
  };
}

function calcGolpeAriete(Q: number, D: number, t_mm: number, L: number, E_GPa: number, dV: number) {
  if (Q <= 0 || D <= 0 || L <= 0) return null;
  const D_m = D / 1000;
  const t_m = t_mm / 1000;
  const K_agua = 2.2e9;
  const E = E_GPa * 1e9;
  const rho = 998;
  const a = Math.sqrt(K_agua / rho / (1 + K_agua * D_m / (E * t_m)));
  const dP_MPa = rho * a * dV / 1e6;
  const Tc = 2 * L / a;
  const riesgo = dP_MPa > 2 ? 'CRITICAL' : dP_MPa > 1 ? 'HIGH' : dP_MPa > 0.5 ? 'MEDIUM' : 'LOW';
  return {
    a: +a.toFixed(0),
    dP_MPa: +dP_MPa.toFixed(3),
    dP_bar: +(dP_MPa * 10).toFixed(2),
    Tc: +Tc.toFixed(2),
    riesgo
  };
}

const MATERIALES = [
  { label: 'Acero comercial', rugosidad: 0.046 },
  { label: 'Hierro fundido', rugosidad: 0.26 },
  { label: 'PVC / HDPE', rugosidad: 0.0015 },
  { label: 'Hormigon liso', rugosidad: 0.3 },
  { label: 'Acero inoxidable', rugosidad: 0.015 },
  { label: 'Cobre', rugosidad: 0.0015 },
];

const E_MATERIALES = [
  { label: 'Acero (200 GPa)', E: 200 },
  { label: 'PVC (3 GPa)', E: 3 },
  { label: 'HDPE (0.8 GPa)', E: 0.8 },
  { label: 'Hierro fundido (100 GPa)', E: 100 },
];

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<string, string> = {
  LOW: 'SEGURO', MEDIUM: 'MONITOREAR', HIGH: 'REVISAR', CRITICAL: 'DETENER'
};

export default function ModuloHidraulica() {
  const [tab, setTab] = useState<'dw' | 'wh'>('dw');
  const [Q, setQ] = useState('80');
  const [D, setD] = useState('300');
  const [L, setL] = useState('500');
  const [matIdx, setMatIdx] = useState(0);
  const [K, setK] = useState('0.5');
  const [t, setT] = useState('8');
  const [eIdx, setEIdx] = useState(0);
  const [dV, setDV] = useState('1.5');
  const [resDW, setResDW] = useState<ReturnType<typeof calcDarcyWeisbach>>(null);
  const [resWH, setResWH] = useState<ReturnType<typeof calcGolpeAriete>>(null);
  const [error, setError] = useState('');

  const calcularDW = () => {
    setError('');
    const r = calcDarcyWeisbach(
      parseFloat(Q), parseFloat(D), parseFloat(L),
      MATERIALES[matIdx].rugosidad, parseFloat(K)
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResDW(r);
  };

  const calcularWH = () => {
    setError('');
    const r = calcGolpeAriete(
      parseFloat(Q), parseFloat(D), parseFloat(t),
      parseFloat(L), E_MATERIALES[eIdx].E, parseFloat(dV)
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResWH(r);
  };

  const inputStyle = {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #475569',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#f8fafc',
    fontSize: 15,
    boxSizing: 'border-box' as const
  };

  const selectStyle = {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #475569',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#f8fafc',
    fontSize: 14
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              💧
            </div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Hidraulica</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Darcy-Weisbach + Golpe de Ariete (Joukowsky) | AWWA M11</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: AWWA M11 | Darcy-Weisbach | Colebrook-White | Joukowsky 1898 | ASME B31.3
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'dw', label: 'Perdidas Hidraulicas' },
            { id: 'wh', label: 'Golpe de Ariete' }
          ].map(t2 => (
            <button key={t2.id} onClick={() => setTab(t2.id as 'dw' | 'wh')}
              style={{
                flex: 1, padding: '10px',
                background: tab === t2.id ? '#0ea5e9' : '#1e293b',
                border: '1px solid #334155', borderRadius: 8,
                color: 'white', fontWeight: tab === t2.id ? 800 : 400,
                cursor: 'pointer', fontSize: 13
              }}>
              {t2.label}
            </button>
          ))}
        </div>

        {/* DARCY-WEISBACH */}
        {tab === 'dw' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Parametros Darcy-Weisbach
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Caudal Q (L/s)</label>
                <input value={Q} onChange={e => setQ(e.target.value)} style={inputStyle} placeholder="80" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Diametro interno D (mm)</label>
                <input value={D} onChange={e => setD(e.target.value)} style={inputStyle} placeholder="300" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Longitud L (m)</label>
                <input value={L} onChange={e => setL(e.target.value)} style={inputStyle} placeholder="500" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Coef. perdidas menores K</label>
                <input value={K} onChange={e => setK(e.target.value)} style={inputStyle} placeholder="0.5" />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Material de tuberia</label>
              <select value={matIdx} onChange={e => setMatIdx(+e.target.value)} style={selectStyle}>
                {MATERIALES.map((m, i) => (
                  <option key={i} value={i}>{m.label} — rugosidad {m.rugosidad} mm</option>
                ))}
              </select>
            </div>
            {error && (
              <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button onClick={calcularDW}
              style={{ width: '100%', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR PERDIDAS HIDRAULICAS
            </button>
          </div>
        )}

        {/* GOLPE DE ARIETE */}
        {tab === 'wh' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Parametros Golpe de Ariete — Joukowsky
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Caudal Q (L/s)</label>
                <input value={Q} onChange={e => setQ(e.target.value)} style={inputStyle} placeholder="80" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Diametro D (mm)</label>
                <input value={D} onChange={e => setD(e.target.value)} style={inputStyle} placeholder="300" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Longitud L (m)</label>
                <input value={L} onChange={e => setL(e.target.value)} style={inputStyle} placeholder="500" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Espesor pared t (mm)</label>
                <input value={t} onChange={e => setT(e.target.value)} style={inputStyle} placeholder="8" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Cambio velocidad dV (m/s)</label>
                <input value={dV} onChange={e => setDV(e.target.value)} style={inputStyle} placeholder="1.5" />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Material de tuberia</label>
              <select value={eIdx} onChange={e => setEIdx(+e.target.value)} style={selectStyle}>
                {E_MATERIALES.map((m, i) => (
                  <option key={i} value={i}>{m.label}</option>
                ))}
              </select>
            </div>
            {error && (
              <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button onClick={calcularWH}
              style={{ width: '100%', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR GOLPE DE ARIETE
            </button>
          </div>
        )}

        {/* RESULTADOS DW */}
        {tab === 'dw' && resDW && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resDW.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Hidraulicos</div>
              <div style={{ background: riskColor[resDW.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {riskLabel[resDW.riesgo]}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Velocidad', value: resDW.V + ' m/s' },
                { label: 'Reynolds', value: resDW.Re.toLocaleString() },
                { label: 'Regimen', value: resDW.regimen },
                { label: 'hf Mayor', value: resDW.hf_mayor + ' m' },
                { label: 'hf Menor', value: resDW.hf_menor + ' m' },
                { label: 'hf Total', value: resDW.hf_total + ' m' },
                { label: 'Factor f', value: resDW.f.toString() },
                { label: 'Presion', value: resDW.dP_bar + ' bar' },
                { label: 'mca', value: resDW.dP_mca + ' mca' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resDW.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#0ea5e9', marginBottom: 4, fontWeight: 700 }}>FORMULA APLICADA:</div>
              hf = f x (L/D) x V2 / 2g
              <div style={{ marginTop: 4, color: '#475569' }}>
                f={resDW.f} | V={resDW.V} m/s | Re={resDW.Re} | {resDW.regimen}
              </div>
              <div style={{ marginTop: 4, color: '#475569' }}>AWWA M11 | Colebrook-White | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* RESULTADOS WH */}
        {tab === 'wh' && resWH && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resWH.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Golpe de Ariete</div>
              <div style={{ background: riskColor[resWH.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {riskLabel[resWH.riesgo]}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Celeridad onda a', value: resWH.a + ' m/s' },
                { label: 'Sobrepresion', value: resWH.dP_MPa + ' MPa' },
                { label: 'Sobrepresion', value: resWH.dP_bar + ' bar' },
                { label: 'Tiempo critico Tc', value: resWH.Tc + ' s' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resWH.riesgo], fontSize: 18, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#0ea5e9', marginBottom: 4, fontWeight: 700 }}>FORMULA JOUKOWSKY:</div>
              dP = rho x a x dV = 998 x {resWH.a} x {dV} = {resWH.dP_MPa} MPa
              <div style={{ marginTop: 4, color: '#475569' }}>Joukowsky 1898 | AWWA M11 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
