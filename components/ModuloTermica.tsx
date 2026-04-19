'use client';
import { useState } from 'react';

// Intercambiador de calor - Metodo LMTD
// Referencia: ASME VIII Div.1 + Kern (1950) Process Heat Transfer
function calcIntercambiador(
  Q_kW: number, // Calor transferido (kW)
  T_hot_in: number, // Temperatura entrada fluido caliente (C)
  T_hot_out: number, // Temperatura salida fluido caliente (C)
  T_cold_in: number, // Temperatura entrada fluido frio (C)
  T_cold_out: number, // Temperatura salida fluido frio (C)
  U_Wm2K: number, // Coeficiente global transferencia (W/m2.K)
  tipo: string // 'contracorriente' o 'paralelo'
) {
  if (Q_kW <= 0 || U_Wm2K <= 0) return null;
  if (T_hot_in <= T_hot_out || T_cold_out <= T_cold_in) return null;

  // LMTD segun tipo de flujo
  let dT1: number, dT2: number;
  if (tipo === 'contracorriente') {
    dT1 = T_hot_in - T_cold_out;
    dT2 = T_hot_out - T_cold_in;
  } else {
    dT1 = T_hot_in - T_cold_in;
    dT2 = T_hot_out - T_cold_out;
  }

  if (dT1 <= 0 || dT2 <= 0) return null;

  const LMTD = dT1 === dT2 ? dT1 : (dT1 - dT2) / Math.log(dT1 / dT2);

  // Area requerida
  const Q_W = Q_kW * 1000;
  const A_m2 = Q_W / (U_Wm2K * LMTD);

  // Eficiencia termica
  const Q_max = Math.min(
    (T_hot_in - T_cold_in),
    (T_hot_in - T_cold_in)
  );
  const efectividad = (T_hot_in - T_hot_out) / (T_hot_in - T_cold_in);

  // Verificacion presion de diseno ASME VIII (simplificada)
  const riesgo = A_m2 > 500 ? 'HIGH' : A_m2 > 200 ? 'MEDIUM' : 'LOW';

  return {
    LMTD: +LMTD.toFixed(2),
    A_m2: +A_m2.toFixed(2),
    dT1: +dT1.toFixed(1),
    dT2: +dT2.toFixed(1),
    efectividad: +(efectividad * 100).toFixed(1),
    riesgo
  };
}

// Dilatacion termica de tuberias - ASME B31.3
// Referencia: ASME B31.3-2022 Appendix C
function calcDilatacion(
  L_m: number, // Longitud tuberia (m)
  T1_C: number, // Temperatura instalacion (C)
  T2_C: number, // Temperatura operacion (C)
  material: string, // Material tuberia
  restringido: boolean,// Extremos restringidos
  OD_mm: number, // Diametro exterior (mm)
  t_mm: number // Espesor pared (mm)
) {
  if (L_m <= 0) return null;

  // Coeficientes expansion termica ASME B31.3 Appendix C (10^-6 /C)
  const alphaDB: Record<string, number> = {
    acero_carbono: 11.7,
    acero_inox_304: 17.2,
    acero_inox_316: 16.0,
    cobre: 17.0,
    aluminio: 23.6,
    hdpe: 150.0,
  };

  // Modulo elasticidad (GPa)
  const E_DB: Record<string, number> = {
    acero_carbono: 200,
    acero_inox_304: 193,
    acero_inox_316: 193,
    cobre: 110,
    aluminio: 69,
    hdpe: 0.8,
  };

  const alpha = alphaDB[material] || 11.7;
  const E_GPa = E_DB[material] || 200;
  const dT = T2_C - T1_C;
  const dL_mm = alpha * 1e-6 * L_m * Math.abs(dT) * 1000;

  // Tension termica si esta restringido (ASME B31.3 S302)
  const sigma_MPa = restringido ? E_GPa * 1000 * alpha * 1e-6 * Math.abs(dT) : 0;

  // Longitud lira en U (formula empirica)
  const D_m = OD_mm / 1000;
  const L_lira_m = t_mm > 0 && OD_mm > 0
    ? Math.sqrt(3 * E_GPa * 1e9 * D_m * (dL_mm / 1000) / (200e6))
    : 0;

  // Limite tension admisible acero A36 = 150 MPa
  const sigma_adm = 150;
  const riesgo = sigma_MPa > 200 ? 'CRITICAL' : sigma_MPa > sigma_adm ? 'HIGH' : sigma_MPa > 100 ? 'MEDIUM' : 'LOW';

  return {
    dL_mm: +dL_mm.toFixed(1),
    sigma_MPa: +sigma_MPa.toFixed(1),
    L_lira_m: +L_lira_m.toFixed(2),
    dT: +dT.toFixed(1),
    alpha,
    riesgo,
    ok: sigma_MPa <= sigma_adm || !restringido
  };
}

const MATERIALES_TERM = [
  { id: 'acero_carbono', label: 'Acero al carbono — alpha=11.7' },
  { id: 'acero_inox_304', label: 'Acero inox 304 — alpha=17.2' },
  { id: 'acero_inox_316', label: 'Acero inox 316 — alpha=16.0' },
  { id: 'cobre', label: 'Cobre — alpha=17.0' },
  { id: 'aluminio', label: 'Aluminio — alpha=23.6' },
  { id: 'hdpe', label: 'HDPE — alpha=150.0' },
];

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<string, string> = {
  LOW: 'SEGURO', MEDIUM: 'MONITOREAR', HIGH: 'REVISAR', CRITICAL: 'DETENER'
};

export default function ModuloTermica() {
  const [tab, setTab] = useState<'int' | 'dil'>('dil');

  // Intercambiador
  const [Q_kW, setQ_kW] = useState('500');
  const [T_hi, setT_hi] = useState('120');
  const [T_ho, setT_ho] = useState('60');
  const [T_ci, setT_ci] = useState('20');
  const [T_co, setT_co] = useState('80');
  const [U_val, setU_val] = useState('500');
  const [tipo, setTipo] = useState('contracorriente');
  const [resInt, setResInt] = useState<ReturnType<typeof calcIntercambiador>>(null);

  // Dilatacion
  const [L, setL] = useState('100');
  const [T1, setT1] = useState('20');
  const [T2, setT2] = useState('80');
  const [mat, setMat] = useState('acero_carbono');
  const [restringido, setRestringido] = useState(false);
  const [OD, setOD] = useState('219.1');
  const [t_esp, setT_esp] = useState('8.18');
  const [resDil, setResDil] = useState<ReturnType<typeof calcDilatacion>>(null);
  const [error, setError] = useState('');

  const calcInt = () => {
    setError('');
    const r = calcIntercambiador(
      parseFloat(Q_kW), parseFloat(T_hi), parseFloat(T_ho),
      parseFloat(T_ci), parseFloat(T_co), parseFloat(U_val), tipo
    );
    if (!r) { setError('Verificar temperaturas — fluido caliente debe ser mayor que frio en todo el recorrido.'); return; }
    setResInt(r);
  };

  const calcDil = () => {
    setError('');
    const r = calcDilatacion(
      parseFloat(L), parseFloat(T1), parseFloat(T2),
      mat, restringido, parseFloat(OD), parseFloat(t_esp)
    );
    if (!r) { setError('Verificar datos.'); return; }
    setResDil(r);
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
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#ef4444,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌡️</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Termica</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Intercambiadores ASME VIII + Dilatacion ASME B31.3</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: ASME VIII Div.1 | ASME B31.3-2022 Appendix C | Kern 1950 | TEMA Standards
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'dil', label: 'Dilatacion Termica' },
            { id: 'int', label: 'Intercambiador LMTD' }
          ].map(t2 => (
            <button key={t2.id} onClick={() => setTab(t2.id as 'int' | 'dil')}
              style={{ flex: 1, padding: 10, background: tab === t2.id ? '#ef4444' : '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontWeight: tab === t2.id ? 800 : 400, cursor: 'pointer', fontSize: 13 }}>
              {t2.label}
            </button>
          ))}
        </div>

        {/* DILATACION */}
        {tab === 'dil' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Dilatacion Termica — ASME B31.3
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Longitud tuberia L (m)', val: L, set: setL },
                { label: 'Temperatura instalacion T1 (C)', val: T1, set: setT1 },
                { label: 'Temperatura operacion T2 (C)', val: T2, set: setT2 },
                { label: 'Diametro exterior OD (mm)', val: OD, set: setOD },
                { label: 'Espesor pared t (mm)', val: t_esp, set: setT_esp },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Material</label>
              <select value={mat} onChange={e => setMat(e.target.value)}
                style={{ ...inputStyle, fontSize: 14 }}>
                {MATERIALES_TERM.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <input type="checkbox" checked={restringido} onChange={e => setRestringido(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <label style={{ color: '#94a3b8', fontSize: 13, cursor: 'pointer' }} onClick={() => setRestringido(!restringido)}>
                Extremos restringidos (calcular tension termica)
              </label>
            </div>
            {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button onClick={calcDil} style={{ width: '100%', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR DILATACION TERMICA
            </button>
          </div>
        )}

        {/* INTERCAMBIADOR */}
        {tab === 'int' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Intercambiador de Calor — Metodo LMTD
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Calor transferido Q (kW)', val: Q_kW, set: setQ_kW },
                { label: 'T entrada caliente (C)', val: T_hi, set: setT_hi },
                { label: 'T salida caliente (C)', val: T_ho, set: setT_ho },
                { label: 'T entrada frio (C)', val: T_ci, set: setT_ci },
                { label: 'T salida frio (C)', val: T_co, set: setT_co },
                { label: 'Coef. global U (W/m2.K)', val: U_val, set: setU_val },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Tipo de flujo</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ ...inputStyle, fontSize: 14 }}>
                <option value="contracorriente">Contracorriente (mas eficiente)</option>
                <option value="paralelo">Paralelo (flujos en igual direccion)</option>
              </select>
            </div>
            {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button onClick={calcInt} style={{ width: '100%', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR AREA DE INTERCAMBIO
            </button>
          </div>
        )}

        {/* RESULTADOS DILATACION */}
        {tab === 'dil' && resDil && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resDil.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Dilatacion Termica</div>
              <div style={{ background: riskColor[resDil.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>{riskLabel[resDil.riesgo]}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Dilatacion libre dL', value: resDil.dL_mm + ' mm' },
                { label: 'Delta T', value: resDil.dT + ' C' },
                { label: 'Alpha material', value: resDil.alpha + ' x10-6/C' },
                { label: 'Tension termica', value: resDil.sigma_MPa + ' MPa' },
                { label: 'Longitud lira U', value: resDil.L_lira_m + ' m' },
                { label: 'Estado', value: resDil.ok ? 'APTO' : 'REQUIERE LIRA' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resDil.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#ef4444', marginBottom: 4, fontWeight: 700 }}>FORMULA ASME B31.3:</div>
              dL = alpha x L x dT | sigma = E x alpha x dT (si restringido)
              <div style={{ marginTop: 4, color: '#475569' }}>ASME B31.3-2022 Appendix C | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* RESULTADOS INTERCAMBIADOR */}
        {tab === 'int' && resInt && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resInt.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Intercambiador</div>
              <div style={{ background: riskColor[resInt.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>{riskLabel[resInt.riesgo]}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'LMTD', value: resInt.LMTD + ' K' },
                { label: 'Area requerida A', value: resInt.A_m2 + ' m2' },
                { label: 'dT extremo 1', value: resInt.dT1 + ' C' },
                { label: 'dT extremo 2', value: resInt.dT2 + ' C' },
                { label: 'Efectividad', value: resInt.efectividad + '%' },
                { label: 'Tipo flujo', value: tipo },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resInt.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#ef4444', marginBottom: 4, fontWeight: 700 }}>FORMULA LMTD:</div>
              Q = U x A x LMTD | A = Q / (U x LMTD)
              <div style={{ marginTop: 4, color: '#475569' }}>ASME VIII Div.1 | TEMA | Kern 1950 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
