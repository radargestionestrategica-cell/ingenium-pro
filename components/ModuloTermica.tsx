'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import {
  calcIntercambiador as calcIntercambiadorCore,
  calcDilatacionMaterial as calcDilatacion,
} from '@/lib/calculos';
import { useState } from 'react';

// Intercambiador de calor (LMTD) y dilatacion termica de tuberias (ASME B31.3
// Appendix C) — el calculo vive en @/lib/calculos (fuente unica, con tests):
// validacion de sentido fisico con cambio de fase, Number.isFinite, tabla de
// materiales (alpha y E), lira en U y umbrales de riesgo. calcDilatacion
// devuelve los mismos campos que usan la UI y la exportacion PDF/Excel/DXF.
// Aca solo se adapta "tipo" (string del <select>) a la union tipada de lib.
function calcIntercambiador(
  Q_kW: number, T_hot_in: number, T_hot_out: number,
  T_cold_in: number, T_cold_out: number, U_Wm2K: number,
  tipo: string
) {
  return calcIntercambiadorCore(
    Q_kW, T_hot_in, T_hot_out, T_cold_in, T_cold_out, U_Wm2K,
    tipo === 'paralelo' ? 'paralelo' : 'contracorriente'
  );
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
  const [datosInt, setDatosInt] = useState<DatosExportar | null>(null);

  // Dilatacion
  const [L, setL] = useState('100');
  const [T1, setT1] = useState('20');
  const [T2, setT2] = useState('80');
  const [mat, setMat] = useState('acero_carbono');
  const [restringido, setRestringido] = useState(false);
  const [OD, setOD] = useState('219.1');
  const [t_esp, setT_esp] = useState('8.18');
  const [resDil, setResDil] = useState<ReturnType<typeof calcDilatacion>>(null);
  const [datosDil, setDatosDil] = useState<DatosExportar | null>(null);
  const [error, setError] = useState('');

  const calcInt = () => {
    setError('');
    const r = calcIntercambiador(
      parseFloat(Q_kW), parseFloat(T_hi), parseFloat(T_ho),
      parseFloat(T_ci), parseFloat(T_co), parseFloat(U_val), tipo
    );
    if (!r) { setError('Verificar temperaturas — fluido caliente debe ser mayor que frio en todo el recorrido.'); return; }
    setResInt(r);
    const payload: DatosExportar = {
      tipo: 'INTERCAMBIADOR_LMTD',
      normativa: 'ASME VIII Div.1 | TEMA Standards | Kern 1950',
      parametros: {
        'Calor transferido Q (kW)': Q_kW,
        'T entrada caliente (C)': T_hi,
        'T salida caliente (C)': T_ho,
        'T entrada frio (C)': T_ci,
        'T salida frio (C)': T_co,
        'Coef. global U (W/m2.K)': U_val,
        'Tipo de flujo': tipo,
      },
      resultado: {
        'LMTD (K)': r.LMTD,
        'Area requerida A (m2)': r.A_m2,
        'dT extremo 1 (C)': r.dT1,
        'dT extremo 2 (C)': r.dT2,
        'Efectividad (%)': r.efectividad ?? 'No aplica',
        ...(r.notaEfectividad ? { 'Nota efectividad': r.notaEfectividad } : {}),
        'Estado': r.riesgo,
      },
      nivel:  r.riesgo,
      alerta: r.riesgo === 'HIGH' || r.riesgo === 'CRITICAL',
      dxfParams: {
        D:         219.1,
        t:         8.18,
        L:         parseFloat(Q_kW) / 10,
        dT:        parseFloat(T_hi) - parseFloat(T_ho),
        alpha:     11.7,
        dL:        r.A_m2,
        F_termico: parseFloat(Q_kW),
        material:  tipo,
      },
    };
    setDatosInt(payload);
    publicarResultado(payload);
  };

  const calcDil = () => {
    setError('');
    const r = calcDilatacion(
      parseFloat(L), parseFloat(T1), parseFloat(T2),
      mat, restringido, parseFloat(OD), parseFloat(t_esp)
    );
    if (!r) { setError('Verificar datos.'); return; }
    setResDil(r);
    const matLabel = MATERIALES_TERM.find(m => m.id === mat)?.label ?? mat;
    const payload: DatosExportar = {
      tipo: 'DILATACION_TERMICA',
      normativa: 'ASME B31.3-2022 Appendix C',
      parametros: {
        'Longitud tuberia L (m)': L,
        'Temperatura instalacion T1 (C)': T1,
        'Temperatura operacion T2 (C)': T2,
        'Material': matLabel,
        'Diametro exterior OD (mm)': OD,
        'Espesor pared t (mm)': t_esp,
        'Extremos restringidos': restringido ? 'SI' : 'NO',
      },
      resultado: {
        'Dilatacion libre dL (mm)': r.dL_mm,
        'Delta T (C)': r.dT,
        'Alpha (x10-6/C)': r.alpha,
        'Tension termica (MPa)': r.sigma_MPa,
        'Longitud lira U (m)': r.L_lira_m,
        'Estado': r.estado,
        ...(r.estadoMotivo ? { 'Motivo estado': r.estadoMotivo } : {}),
        'Riesgo': r.riesgo,
        ...(r.advertenciaMaterial ? { 'Advertencia': r.advertenciaMaterial } : {}),
      },
      nivel:  r.riesgo,
      alerta: r.riesgo === 'HIGH' || r.riesgo === 'CRITICAL',
      dxfParams: {
        D:         parseFloat(OD),
        t:         parseFloat(t_esp),
        L:         parseFloat(L),
        dT:        r.dT,
        alpha:     r.alpha,
        dL:        r.dL_mm,
        F_termico: r.sigma_MPa,
        material:  matLabel,
      },
    };
    setDatosDil(payload);
    publicarResultado(payload);
  };

  const inputStyle = {
    width: '100%', background: '#0f172a', border: '1px solid #475569',
    borderRadius: 8, padding: '10px 12px', color: '#f8fafc',
    fontSize: 15, boxSizing: 'border-box' as const
  };

  const datosActivo = tab === 'dil' ? datosDil : datosInt;

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
                { label: 'Estado', value: resDil.estado },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resDil.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            {resDil.estadoMotivo && (
              <div style={{ background: '#0f172a', border: `1px solid ${riskColor[resDil.riesgo]}`, borderRadius: 8, padding: 12, color: '#cbd5e1', fontSize: 13, marginBottom: 16 }}>
                {resDil.estado}: {resDil.estadoMotivo}
              </div>
            )}
            {resDil.advertenciaMaterial && (
              <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 12, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                ⚠️ {resDil.advertenciaMaterial}
              </div>
            )}
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
                { label: 'Efectividad', value: resInt.efectividad === null ? 'No aplica' : resInt.efectividad + '%' },
                { label: 'Tipo flujo', value: tipo },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resInt.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            {resInt.notaEfectividad && (
              <div style={{ background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: 12, color: '#cbd5e1', fontSize: 13, marginBottom: 16 }}>
                ℹ️ {resInt.notaEfectividad}
              </div>
            )}
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#ef4444', marginBottom: 4, fontWeight: 700 }}>FORMULA LMTD:</div>
              Q = U x A x LMTD | A = Q / (U x LMTD)
              <div style={{ marginTop: 4, color: '#475569' }}>ASME VIII Div.1 | TEMA | Kern 1950 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}
        {datosActivo && <BotonesExportar visible={true} datos={datosActivo} />}

      </div>
    </div>
  );
}
