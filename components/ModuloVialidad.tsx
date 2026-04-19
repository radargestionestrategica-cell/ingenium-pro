'use client';
import { useState } from 'react';

// Diseno pavimento flexible - AASHTO 93
// Referencia: AASHTO Guide for Design of Pavement Structures 1993
function calcPavimento(
  W18: number, // ESAL - Numero ejes equivalentes 18 kips
  R: number, // Confiabilidad (%)
  So: number, // Desviacion estandar combinada
  PSI_i: number, // Serviciabilidad inicial (tipico 4.2)
  PSI_f: number, // Serviciabilidad final (tipico 2.5 urbano, 2.0 rural)
  MR_psi: number, // Modulo resiliente subrasante (psi)
  a1: number, // Coef. capa 1 carpeta asfaltica
  a2: number, // Coef. capa 2 base granular
  a3: number, // Coef. capa 3 subbase
  m2: number, // Coef. drenaje base
  m3: number // Coef. drenaje subbase
) {
  if (W18 <= 0 || MR_psi <= 0) return null;

  // Factor de confiabilidad Zr (tabla AASHTO)
  const ZR_map: Record<number, number> = {
    50: 0, 60: -0.253, 70: -0.524, 75: -0.674,
    80: -0.842, 85: -1.037, 90: -1.282, 95: -1.645, 99: -2.327
  };
  const Zr = ZR_map[R] ?? -1.282;

  // DPSI
  const dPSI = PSI_i - PSI_f;
  if (dPSI <= 0) return null;

  // Numero estructural requerido SN (ecuacion AASHTO 93)
  // log10(W18) = Zr*So + 9.36*log10(SN+1) - 0.20 + log10(dPSI/4.2)/(0.4+1094/(SN+1)^5.19) + 2.32*log10(MR) - 8.07
  // Resolucion iterativa
  let SN = 3.0;
  for (let iter = 0; iter < 100; iter++) {
    const f1 = Zr * So;
    const f2 = 9.36 * Math.log10(SN + 1);
    const f3 = -0.20;
    const f4 = Math.log10(dPSI / 4.2) / (0.4 + 1094 / Math.pow(SN + 1, 5.19));
    const f5 = 2.32 * Math.log10(MR_psi) - 8.07;
    const W18_calc = Math.pow(10, f1 + f2 + f3 + f4 + f5);
    if (Math.abs(W18_calc - W18) / W18 < 0.001) break;
    SN = W18_calc > W18 ? SN - 0.01 : SN + 0.01;
    if (SN < 0.5) SN = 0.5;
    if (SN > 15) { SN = 15; break; }
  }

  // Espesores de capas (D1, D2, D3) en pulgadas
  const D1 = SN / (a1);
  const D2 = Math.max(0, (SN - a1 * D1) / (a2 * m2));
  const D3 = Math.max(0, (SN - a1 * D1 - a2 * m2 * D2) / (a3 * m3));

  // Conversion a cm
  const D1_cm = D1 * 2.54;
  const D2_cm = D2 * 2.54;
  const D3_cm = D3 * 2.54;

  const riesgo = SN > 6 ? 'HIGH' : SN > 4 ? 'MEDIUM' : 'LOW';

  return {
    SN: +SN.toFixed(2),
    D1_cm: +D1_cm.toFixed(1), D2_cm: +D2_cm.toFixed(1), D3_cm: +D3_cm.toFixed(1),
    D1_pulg: +D1.toFixed(2), D2_pulg: +D2.toFixed(2), D3_pulg: +D3.toFixed(2),
    riesgo, Zr: +Zr.toFixed(3)
  };
}

// Drenaje vial - Metodo Racional + cuneta triangular
// Referencia: HEC-22 FHWA + AASHTO Drainage Manual
function calcDrenajeVial(
  A_ha: number, // Area cuenca (ha)
  C: number, // Coef. escorrentia
  I_mm_h: number, // Intensidad lluvia (mm/h)
  L_cuneta: number, // Longitud cuneta (m)
  Z1: number, // Talud lado 1 cuneta (H:V)
  Z2: number, // Talud lado 2 cuneta (H:V)
  n: number, // Manning cuneta
  S: number // Pendiente longitudinal (m/m)
) {
  if (A_ha <= 0 || I_mm_h <= 0) return null;

  // Caudal metodo racional (m3/s)
  const Q_m3s = C * I_mm_h * A_ha / 360;

  // Capacidad cuneta triangular (Manning)
  // Q = (1/n) * (Z1+Z2)/2 * y^(8/3) * S^0.5 * K
  // Resolucion para y (tirante)
  let y = 0.3; // tirante inicial
  for (let i = 0; i < 100; i++) {
    const A_c = 0.5 * (Z1 + Z2) * y * y;
    const P_c = y * (Math.sqrt(1 + Z1 * Z1) + Math.sqrt(1 + Z2 * Z2));
    const Rh = A_c / P_c;
    const Q_c = (1 / n) * A_c * Math.pow(Rh, 2 / 3) * Math.sqrt(S);
    if (Math.abs(Q_c - Q_m3s) / Q_m3s < 0.005) break;
    y = Q_c < Q_m3s ? y + 0.005 : y - 0.005;
    if (y < 0.01) y = 0.01;
    if (y > 2) { y = 2; break; }
  }

  const A_cuneta = 0.5 * (Z1 + Z2) * y * y;
  const V_cuneta = Q_m3s / A_cuneta;
  const T_superficie = (Z1 + Z2) * y;

  // Verificacion velocidad erosion (HEC-22: max 1.5 m/s cuneta sin revestir)
  const v_max = 1.5;
  const riesgo = V_cuneta > 3.0 ? 'CRITICAL' : V_cuneta > v_max ? 'HIGH' : V_cuneta > 1.0 ? 'MEDIUM' : 'LOW';

  return {
    Q_m3s: +Q_m3s.toFixed(4),
    Q_lps: +(Q_m3s * 1000).toFixed(2),
    y_m: +y.toFixed(3),
    V_cuneta: +V_cuneta.toFixed(3),
    T_superficie: +T_superficie.toFixed(3),
    riesgo,
    ok_velocidad: V_cuneta <= v_max
  };
}

const CONFIABILIDAD = [
  { val: 50, label: 'R=50% — Caminos rurales secundarios' },
  { val: 70, label: 'R=70% — Caminos rurales principales' },
  { val: 80, label: 'R=80% — Colectoras urbanas' },
  { val: 85, label: 'R=85% — Arterias urbanas' },
  { val: 90, label: 'R=90% — Autopistas rurales' },
  { val: 95, label: 'R=95% — Autopistas urbanas' },
];

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<string, string> = {
  LOW: 'APTO', MEDIUM: 'REVISAR', HIGH: 'REFORZAR', CRITICAL: 'CRITICO'
};

export default function ModuloVialidad() {
  const [tab, setTab] = useState<'pav' | 'dren'>('pav');

  // Pavimento
  const [W18, setW18] = useState('5000000');
  const [R, setR] = useState('90');
  const [So, setSo] = useState('0.45');
  const [PSI_i, setPSI_i] = useState('4.2');
  const [PSI_f, setPSI_f] = useState('2.5');
  const [MR, setMR] = useState('10000');
  const [a1, setA1] = useState('0.44');
  const [a2, setA2] = useState('0.14');
  const [a3, setA3] = useState('0.11');
  const [m2, setM2] = useState('1.0');
  const [m3, setM3] = useState('1.0');
  const [resPav, setResPav] = useState<ReturnType<typeof calcPavimento>>(null);

  // Drenaje
  const [A_ha, setA_ha] = useState('5');
  const [C_val, setC_val] = useState('0.7');
  const [I_val, setI_val] = useState('80');
  const [L_cun, setL_cun] = useState('100');
  const [Z1_val, setZ1_val] = useState('2');
  const [Z2_val, setZ2_val] = useState('4');
  const [n_val, setN_val] = useState('0.016');
  const [S_val, setS_val] = useState('0.01');
  const [resDren, setResDren] = useState<ReturnType<typeof calcDrenajeVial>>(null);
  const [error, setError] = useState('');

  const calcPav = () => {
    setError('');
    const r = calcPavimento(
      parseFloat(W18), parseFloat(R), parseFloat(So),
      parseFloat(PSI_i), parseFloat(PSI_f), parseFloat(MR),
      parseFloat(a1), parseFloat(a2), parseFloat(a3),
      parseFloat(m2), parseFloat(m3)
    );
    if (!r) { setError('Verificar datos — PSI inicial debe ser mayor que PSI final.'); return; }
    setResPav(r);
  };

  const calcDren = () => {
    setError('');
    const r = calcDrenajeVial(
      parseFloat(A_ha), parseFloat(C_val), parseFloat(I_val),
      parseFloat(L_cun), parseFloat(Z1_val), parseFloat(Z2_val),
      parseFloat(n_val), parseFloat(S_val)
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResDren(r);
  };

  const inputStyle = {
    width: '100%', background: '#0f172a', border: '1px solid #475569',
    borderRadius: 8, padding: '10px 12px', color: '#f8fafc',
    fontSize: 14, boxSizing: 'border-box' as const
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#64748b,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛣️</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Vialidad</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Pavimento Flexible AASHTO 93 + Drenaje Vial HEC-22</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: AASHTO 93 | HEC-22 FHWA | AASHTO Drainage Manual | DNV Argentina
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'pav', label: 'Pavimento AASHTO 93' },
            { id: 'dren', label: 'Drenaje Vial HEC-22' }
          ].map(t2 => (
            <button key={t2.id} onClick={() => setTab(t2.id as 'pav' | 'dren')}
              style={{ flex: 1, padding: 10, background: tab === t2.id ? '#64748b' : '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontWeight: tab === t2.id ? 800 : 400, cursor: 'pointer', fontSize: 13 }}>
              {t2.label}
            </button>
          ))}
        </div>

        {/* PAVIMENTO */}
        {tab === 'pav' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Diseno Pavimento Flexible — AASHTO 93
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'ESAL W18 (ejes equiv. 18 kips)', val: W18, set: setW18 },
                { label: 'Modulo resiliente MR (psi)', val: MR, set: setMR },
                { label: 'Serviciabilidad inicial PSI_i', val: PSI_i, set: setPSI_i },
                { label: 'Serviciabilidad final PSI_f', val: PSI_f, set: setPSI_f },
                { label: 'Desv. estandar So', val: So, set: setSo },
                { label: 'Coef. capa 1 asfalto a1', val: a1, set: setA1 },
                { label: 'Coef. capa 2 base a2', val: a2, set: setA2 },
                { label: 'Coef. capa 3 subbase a3', val: a3, set: setA3 },
                { label: 'Coef. drenaje base m2', val: m2, set: setM2 },
                { label: 'Coef. drenaje subbase m3', val: m3, set: setM3 },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Nivel de confiabilidad R</label>
              <select value={R} onChange={e => setR(e.target.value)} style={{ ...inputStyle }}>
                {CONFIABILIDAD.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
              </select>
            </div>
            {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button onClick={calcPav} style={{ width: '100%', background: 'linear-gradient(135deg,#64748b,#334155)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR NUMERO ESTRUCTURAL — AASHTO 93
            </button>
          </div>
        )}

        {/* DRENAJE */}
        {tab === 'dren' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Drenaje Vial — Cuneta Triangular HEC-22
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Area cuenca A (ha)', val: A_ha, set: setA_ha },
                { label: 'Coef. escorrentia C', val: C_val, set: setC_val },
                { label: 'Intensidad lluvia I (mm/h)', val: I_val, set: setI_val },
                { label: 'Longitud cuneta L (m)', val: L_cun, set: setL_cun },
                { label: 'Talud Z1 (H:V)', val: Z1_val, set: setZ1_val },
                { label: 'Talud Z2 (H:V)', val: Z2_val, set: setZ2_val },
                { label: 'Manning n cuneta', val: n_val, set: setN_val },
                { label: 'Pendiente S (m/m)', val: S_val, set: setS_val },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button onClick={calcDren} style={{ width: '100%', background: 'linear-gradient(135deg,#64748b,#334155)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR DRENAJE VIAL
            </button>
          </div>
        )}

        {/* RESULTADOS PAVIMENTO */}
        {tab === 'pav' && resPav && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resPav.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Pavimento</div>
              <div style={{ background: riskColor[resPav.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>{riskLabel[resPav.riesgo]}</div>
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 20, textAlign: 'center' as const, marginBottom: 16 }}>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Numero Estructural Requerido</div>
              <div style={{ color: riskColor[resPav.riesgo], fontSize: 48, fontWeight: 900 }}>SN = {resPav.SN}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Carpeta asfaltica D1', value: resPav.D1_cm + ' cm' },
                { label: 'Base granular D2', value: resPav.D2_cm + ' cm' },
                { label: 'Subbase D3', value: resPav.D3_cm + ' cm' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resPav.riesgo], fontSize: 18, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#94a3b8', marginBottom: 4, fontWeight: 700 }}>AASHTO 93 — Ecuacion empirica iterativa:</div>
              SN = a1*D1 + a2*m2*D2 + a3*m3*D3
              <div style={{ marginTop: 4, color: '#475569' }}>Zr={resPav.Zr} | AASHTO 93 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* RESULTADOS DRENAJE */}
        {tab === 'dren' && resDren && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resDren.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Drenaje Vial</div>
              <div style={{ background: riskColor[resDren.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>{riskLabel[resDren.riesgo]}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Caudal diseno Q', value: resDren.Q_m3s + ' m3/s' },
                { label: 'Caudal', value: resDren.Q_lps + ' L/s' },
                { label: 'Tirante y', value: resDren.y_m + ' m' },
                { label: 'Velocidad cuneta', value: resDren.V_cuneta + ' m/s' },
                { label: 'Ancho superficie T', value: resDren.T_superficie + ' m' },
                { label: 'Velocidad', value: resDren.ok_velocidad ? 'DENTRO LIMITE' : 'EXCEDE 1.5 m/s' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resDren.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#94a3b8', marginBottom: 4, fontWeight: 700 }}>METODO RACIONAL + MANNING:</div>
              Q = C*I*A/360 | Manning cuneta triangular
              <div style={{ marginTop: 4, color: '#475569' }}>HEC-22 FHWA | V max sin revestir: 1.5 m/s | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
