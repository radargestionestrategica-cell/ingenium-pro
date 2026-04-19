'use client';
import { useState } from 'react';

// Diseno de vigas de acero - AISC LRFD 360-16
// Referencia: AISC Steel Construction Manual 15th Edition
function calcVigaAcero(
  Mu_kNm: number, // Momento ultimo factorizado (kN.m)
  Vu_kN: number, // Cortante ultimo factorizado (kN)
  L_m: number, // Longitud viga (m)
  perfil: string // Perfil seleccionado
) {
  if (Mu_kNm <= 0 || L_m <= 0) return null;

  // Propiedades perfiles W (AISC) - valores reales
  const PERFILES: Record<string, { Sx: number; Zx: number; Ix: number; d: number; tw: number; bf: number; tf: number; A: number; peso: number }> = {
    'W150x13': { Sx: 80.1, Zx: 91.8, Ix: 6.84e6, d: 148, tw: 4.3, bf: 100, tf: 4.9, A: 1670, peso: 13.1 },
    'W200x22': { Sx: 194, Zx: 222, Ix: 20.0e6, d: 206, tw: 6.2, bf: 102, tf: 8.0, A: 2860, peso: 22.5 },
    'W250x28': { Sx: 308, Zx: 351, Ix: 40.1e6, d: 260, tw: 6.4, bf: 102, tf: 10.0, A: 3620, peso: 28.4 },
    'W310x39': { Sx: 547, Zx: 628, Ix: 84.8e6, d: 310, tw: 5.8, bf: 165, tf: 9.7, A: 4960, peso: 38.9 },
    'W360x51': { Sx: 794, Zx: 895, Ix: 141e6, d: 355, tw: 7.2, bf: 171, tf: 11.6, A: 6450, peso: 50.6 },
    'W410x67': { Sx: 1200, Zx: 1350, Ix: 245e6, d: 410, tw: 8.8, bf: 178, tf: 14.4, A: 8560, peso: 67.1 },
    'W460x82': { Sx: 1610, Zx: 1840, Ix: 370e6, d: 460, tw: 9.9, bf: 191, tf: 16.0, A: 10400, peso: 82.0 },
    'W530x101': { Sx: 2080, Zx: 2370, Ix: 554e6, d: 533, tw: 10.9,bf: 210, tf: 16.9, A: 12900, peso: 101 },
  };

  const p = PERFILES[perfil] || PERFILES['W310x39'];
  const Fy = 250; // A36 steel MPa
  const phi_b = 0.9;
  const phi_v = 1.0;

  // Momento nominal plastico (AISC F2-1)
  const Mp_kNm = (Fy * p.Zx) / 1e6;
  const phi_Mn = phi_b * Mp_kNm;

  // Cortante nominal (AISC G2-1)
  const Aw = p.d * p.tw; // mm2
  const Vn_kN = (0.6 * Fy * Aw) / 1000;
  const phi_Vn = phi_v * Vn_kN;

  // Deflexion (L/360 para cargas vivas)
  const E = 200000; // MPa
  const w_kNm = (8 * Mu_kNm) / (L_m * L_m);
  const delta_mm = (5 * w_kNm * Math.pow(L_m * 1000, 4)) / (384 * E * p.Ix);
  const delta_limite = (L_m * 1000) / 360;

  const util_M = (Mu_kNm / phi_Mn) * 100;
  const util_V = (Vu_kN / phi_Vn) * 100;
  const ok_M = Mu_kNm <= phi_Mn;
  const ok_V = Vu_kN <= phi_Vn;
  const ok_D = delta_mm <= delta_limite;

  const riesgo = (!ok_M || !ok_V) ? 'CRITICAL' : (!ok_D) ? 'HIGH' : util_M > 80 ? 'MEDIUM' : 'LOW';

  return {
    phi_Mn: +phi_Mn.toFixed(1), phi_Vn: +phi_Vn.toFixed(1),
    util_M: +util_M.toFixed(1), util_V: +util_V.toFixed(1),
    delta_mm: +delta_mm.toFixed(1), delta_limite: +delta_limite.toFixed(1),
    ok_M, ok_V, ok_D, riesgo,
    peso_kg: +(p.peso * L_m).toFixed(0),
    Mp_kNm: +Mp_kNm.toFixed(1)
  };
}

// Diseno de columnas de hormigon armado - ACI 318-19
// Referencia: ACI 318-19 Capitulo 22
function calcColumnaHormigon(
  Pu_kN: number, // Carga axial ultima (kN)
  Mu_kNm: number, // Momento ultimo (kN.m)
  b_mm: number, // Ancho seccion (mm)
  h_mm: number, // Alto seccion (mm)
  As_mm2: number, // Area acero (mm2)
  fc_MPa: number, // Resistencia hormigon
  fy_MPa: number // Resistencia acero
) {
  if (b_mm <= 0 || h_mm <= 0 || Pu_kN <= 0) return null;

  const phi = 0.65; // Factor reduccion columna
  const Ag = b_mm * h_mm;
  const rho = As_mm2 / Ag;

  // Capacidad axial maxima (ACI 22.4.2.1)
  const Pn_max = 0.80 * (0.85 * fc_MPa * (Ag - As_mm2) + fy_MPa * As_mm2);
  const phi_Pn = phi * Pn_max / 1000; // kN

  // Excentricidad
  const e_mm = Mu_kNm > 0 ? (Mu_kNm * 1e6) / (Pu_kN * 1000) : 0;
  const e_min = Math.max(15, 0.03 * h_mm); // excentricidad minima ACI

  // Verificacion acero minimo y maximo (ACI 10.6.1.1)
  const rho_min = 0.01;
  const rho_max = 0.08;
  const acero_ok = rho >= rho_min && rho <= rho_max;

  const util_P = (Pu_kN / phi_Pn) * 100;
  const ok_P = Pu_kN <= phi_Pn;
  const riesgo = !ok_P ? 'CRITICAL' : !acero_ok ? 'HIGH' : util_P > 80 ? 'MEDIUM' : 'LOW';

  return {
    phi_Pn: +phi_Pn.toFixed(1),
    util_P: +util_P.toFixed(1),
    rho_pct: +(rho * 100).toFixed(2),
    e_mm: +e_mm.toFixed(1), e_min: +e_min.toFixed(1),
    ok_P, acero_ok, riesgo,
    Ag_cm2: +(Ag / 100).toFixed(1)
  };
}

const PERFILES_W = [
  'W150x13', 'W200x22', 'W250x28', 'W310x39',
  'W360x51', 'W410x67', 'W460x82', 'W530x101'
];

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<string, string> = {
  LOW: 'APTO', MEDIUM: 'REVISAR', HIGH: 'NO APTO', CRITICAL: 'FALLA'
};

export default function ModuloCivil() {
  const [tab, setTab] = useState<'viga' | 'col'>('viga');

  // Viga
  const [Mu, setMu] = useState('150');
  const [Vu, setVu] = useState('80');
  const [Lv, setLv] = useState('6');
  const [perfil, setPerfil] = useState('W310x39');
  const [resViga, setResViga] = useState<ReturnType<typeof calcVigaAcero>>(null);

  // Columna
  const [Pu, setPu] = useState('1200');
  const [Mc, setMc] = useState('50');
  const [b, setB] = useState('300');
  const [h, setH] = useState('300');
  const [As, setAs] = useState('1800');
  const [fc, setFc] = useState('25');
  const [fy, setFy] = useState('420');
  const [resCol, setResCol] = useState<ReturnType<typeof calcColumnaHormigon>>(null);
  const [error, setError] = useState('');

  const calcViga = () => {
    setError('');
    const r = calcVigaAcero(parseFloat(Mu), parseFloat(Vu), parseFloat(Lv), perfil);
    if (!r) { setError('Verificar datos.'); return; }
    setResViga(r);
  };

  const calcCol = () => {
    setError('');
    const r = calcColumnaHormigon(
      parseFloat(Pu), parseFloat(Mc), parseFloat(b),
      parseFloat(h), parseFloat(As), parseFloat(fc), parseFloat(fy)
    );
    if (!r) { setError('Verificar datos.'); return; }
    setResCol(r);
  };

  const inputStyle = {
    width: '100%', background: '#0f172a', border: '1px solid #475569',
    borderRadius: 8, padding: '10px 12px', color: '#f8fafc',
    fontSize: 15, boxSizing: 'border-box' as const
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#f97316,#c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏗️</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Civil</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Vigas Acero AISC LRFD + Columnas Hormigon ACI 318</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: AISC 360-16 LRFD | ACI 318-19 | CIRSOC 201 | ASCE 7-22
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[{ id: 'viga', label: 'Vigas Acero AISC' }, { id: 'col', label: 'Columnas Hormigon ACI' }].map(t2 => (
            <button key={t2.id} onClick={() => setTab(t2.id as 'viga' | 'col')}
              style={{ flex: 1, padding: 10, background: tab === t2.id ? '#f97316' : '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontWeight: tab === t2.id ? 800 : 400, cursor: 'pointer', fontSize: 13 }}>
              {t2.label}
            </button>
          ))}
        </div>

        {tab === 'viga' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#f97316', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>Diseno Viga Acero — AISC LRFD</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Momento ultimo Mu (kN.m)', val: Mu, set: setMu },
                { label: 'Cortante ultimo Vu (kN)', val: Vu, set: setVu },
                { label: 'Longitud L (m)', val: Lv, set: setLv },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Perfil W (AISC)</label>
                <select value={perfil} onChange={e => setPerfil(e.target.value)}
                  style={{ ...inputStyle, fontSize: 14 }}>
                  {PERFILES_W.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button onClick={calcViga} style={{ width: '100%', background: 'linear-gradient(135deg,#f97316,#c2410c)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              VERIFICAR VIGA — AISC LRFD
            </button>
          </div>
        )}

        {tab === 'col' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#f97316', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>Diseno Columna Hormigon — ACI 318</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Carga axial Pu (kN)', val: Pu, set: setPu },
                { label: 'Momento Mu (kN.m)', val: Mc, set: setMc },
                { label: 'Ancho b (mm)', val: b, set: setB },
                { label: 'Alto h (mm)', val: h, set: setH },
                { label: 'Area acero As (mm2)', val: As, set: setAs },
                { label: 'Resist. hormigon fc (MPa)', val: fc, set: setFc },
                { label: 'Resist. acero fy (MPa)', val: fy, set: setFy },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button onClick={calcCol} style={{ width: '100%', background: 'linear-gradient(135deg,#f97316,#c2410c)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              VERIFICAR COLUMNA — ACI 318
            </button>
          </div>
        )}

        {tab === 'viga' && resViga && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resViga.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Verificacion Viga {perfil}</div>
              <div style={{ background: riskColor[resViga.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>{riskLabel[resViga.riesgo]}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'phi.Mn capac.', value: resViga.phi_Mn + ' kN.m' },
                { label: 'Util. flexion', value: resViga.util_M + '%' },
                { label: 'Flexion', value: resViga.ok_M ? 'OK' : 'FALLA' },
                { label: 'phi.Vn capac.', value: resViga.phi_Vn + ' kN' },
                { label: 'Util. cortante', value: resViga.util_V + '%' },
                { label: 'Cortante', value: resViga.ok_V ? 'OK' : 'FALLA' },
                { label: 'Deflexion', value: resViga.delta_mm + ' mm' },
                { label: 'Limite L/360', value: resViga.delta_limite + ' mm' },
                { label: 'Servicio', value: resViga.ok_D ? 'OK' : 'EXCEDE' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resViga.riesgo], fontSize: 13, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#f97316', marginBottom: 4, fontWeight: 700 }}>AISC LRFD — Perfil {perfil}:</div>
              phi.Mn = phi x Fy x Zx | phi.Vn = phi x 0.6Fy x Aw
              <div style={{ marginTop: 4, color: '#475569' }}>Peso viga: {resViga.peso_kg} kg | AISC 360-16 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {tab === 'col' && resCol && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resCol.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Verificacion Columna {b}x{h} mm</div>
              <div style={{ background: riskColor[resCol.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>{riskLabel[resCol.riesgo]}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'phi.Pn capacidad', value: resCol.phi_Pn + ' kN' },
                { label: 'Utilizacion axial', value: resCol.util_P + '%' },
                { label: 'Cuantia acero rho', value: resCol.rho_pct + '%' },
                { label: 'Seccion Ag', value: resCol.Ag_cm2 + ' cm2' },
                { label: 'Excentricidad real', value: resCol.e_mm + ' mm' },
                { label: 'Excentricidad min', value: resCol.e_min + ' mm' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resCol.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: resCol.acero_ok ? '#0a1f0a' : '#2a0a0a', border: `1px solid ${resCol.acero_ok ? '#00e5a0' : '#dc2626'}`, borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ color: resCol.acero_ok ? '#00e5a0' : '#dc2626', fontWeight: 700, fontSize: 13 }}>
                Cuantia: {resCol.rho_pct}% — {resCol.acero_ok ? 'Dentro de limites ACI (1% a 8%)' : 'FUERA de limites ACI 318-19'}
              </div>
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#f97316', marginBottom: 4, fontWeight: 700 }}>ACI 318-19 Cap. 22:</div>
              phi.Pn = 0.65 x 0.80 x (0.85fc(Ag-As) + fy.As)
              <div style={{ marginTop: 4, color: '#475569' }}>ACI 318-19 | CIRSOC 201 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
