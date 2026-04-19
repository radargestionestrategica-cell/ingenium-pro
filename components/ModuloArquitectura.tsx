'use client';
import { useState } from 'react';

// Cargas de viento - ASCE 7-22 Metodo simplificado
// Referencia: ASCE 7-22 Capitulo 27 + CIRSOC 102
function calcCargaViento(
  V_mph: number, // Velocidad basica viento (mph)
  h_m: number, // Altura edificio (m)
  categoria: string, // Categoria exposicion (B, C, D)
  uso: string, // Categoria uso (I, II, III, IV)
  Kd: number, // Factor direccionalidad
  Cp_barlovento: number, // Coef. presion barlovento
  Cp_sotavento: number // Coef. presion sotavento
) {
  if (V_mph <= 0 || h_m <= 0) return null;

  // Factor de importancia Iw (ASCE 7-22 Tabla 1.5-2)
  const IwMap: Record<string, number> = { I: 0.87, II: 1.0, III: 1.15, IV: 1.15 };
  const Iw = IwMap[uso] || 1.0;

  // Factor exposicion Kz a altura h (ASCE 7-22 Tabla 26.10-1)
  const alphaMap: Record<string, number> = { B: 7.0, C: 9.5, D: 11.5 };
  const zgMap: Record<string, number> = { B: 365.76, C: 274.32, D: 213.36 };
  const alpha = alphaMap[categoria] || 9.5;
  const zg = zgMap[categoria] || 274.32;
  const z_ft = h_m * 3.281;
  const Kz = 2.01 * Math.pow(Math.max(z_ft, 15) / zg, 2 / alpha);

  // Presion de velocidad qz (ASCE 7-22 Ec. 26.10-1)
  const qz_psf = 0.00256 * Kz * Kd * V_mph * V_mph * Iw;
  const qz_Pa = qz_psf * 47.88;
  const qz_kPa = qz_Pa / 1000;

  // Presion neta de diseno
  const p_barlovento_kPa = qz_kPa * Cp_barlovento;
  const p_sotavento_kPa = qz_kPa * Math.abs(Cp_sotavento);
  const p_total_kPa = p_barlovento_kPa + p_sotavento_kPa;

  const riesgo = p_total_kPa > 3.0 ? 'HIGH' : p_total_kPa > 1.5 ? 'MEDIUM' : 'LOW';

  return {
    Kz: +Kz.toFixed(3), qz_kPa: +qz_kPa.toFixed(3),
    qz_psf: +qz_psf.toFixed(2),
    p_barlovento_kPa: +p_barlovento_kPa.toFixed(3),
    p_sotavento_kPa: +p_sotavento_kPa.toFixed(3),
    p_total_kPa: +p_total_kPa.toFixed(3),
    Iw, riesgo
  };
}

// Iluminacion natural - Metodo simplificado + Coeficiente luz diurna
// Referencia: IRAM 11601 + ASHRAE 90.1
function calcIluminacion(
  ancho_m: number, // Ancho local (m)
  largo_m: number, // Largo local (m)
  alto_m: number, // Alto local (m)
  A_ventanas_m2: number, // Area total ventanas (m2)
  tau_vidrio: number, // Transmitancia vidrio (0-1)
  uso_local: string // Tipo de uso
) {
  if (ancho_m <= 0 || largo_m <= 0 || alto_m <= 0) return null;

  const A_piso = ancho_m * largo_m;
  const A_paredes = 2 * (ancho_m + largo_m) * alto_m;
  const A_total = A_piso + A_paredes + ancho_m * largo_m; // piso + paredes + techo

  // Factor de luz diurna (FLD) segun IRAM 11601
  const FLD = (A_ventanas_m2 * tau_vidrio * 0.85) / A_piso * 100;

  // Requisitos FLD por uso (IRAM 11601)
  const FLD_reqMap: Record<string, number> = {
    residencial: 1.5, oficinas: 2.0, educacion: 2.5,
    comercial: 1.5, industrial: 3.0, hospitalario: 2.0
  };
  const FLD_req = FLD_reqMap[uso_local] || 2.0;

  // Relacion ventana/piso (RVP) - recomendado 15-25%
  const RVP = (A_ventanas_m2 / A_piso) * 100;

  // Renovaciones de aire (ASHRAE 62.1)
  // Caudal minimo 10 L/s por persona, densidad tipica 0.1 pers/m2
  const personas_est = A_piso * 0.1;
  const Q_ventilacion_m3h = personas_est * 10 * 3.6;
  const renovaciones_h = Q_ventilacion_m3h / (A_piso * alto_m);

  const ok_fld = FLD >= FLD_req;
  const ok_rvp = RVP >= 15 && RVP <= 40;
  const riesgo = !ok_fld && !ok_rvp ? 'HIGH' : !ok_fld || !ok_rvp ? 'MEDIUM' : 'LOW';

  return {
    FLD: +FLD.toFixed(2), FLD_req,
    RVP: +RVP.toFixed(1),
    Q_ventilacion_m3h: +Q_ventilacion_m3h.toFixed(0),
    renovaciones_h: +renovaciones_h.toFixed(1),
    personas_est: +personas_est.toFixed(0),
    ok_fld, ok_rvp, riesgo,
    A_piso: +A_piso.toFixed(1)
  };
}

const EXPOSICIONES = [
  { id: 'B', label: 'B — Terreno urbano y suburbano, bosques' },
  { id: 'C', label: 'C — Campo abierto, llanuras (mas comun)' },
  { id: 'D', label: 'D — Costa maritima, lagos grandes' },
];

const USOS_EDIFICIO = [
  { id: 'I', label: 'I — Riesgo bajo (depósitos, graneros)' },
  { id: 'II', label: 'II — Riesgo normal (viviendas, oficinas)' },
  { id: 'III', label: 'III — Riesgo alto (escuelas, hospitales)' },
  { id: 'IV', label: 'IV — Riesgo esencial (bomberos, emergencias)' },
];

const USOS_LOCAL = [
  { id: 'residencial', label: 'Residencial — FLD req. 1.5%' },
  { id: 'oficinas', label: 'Oficinas — FLD req. 2.0%' },
  { id: 'educacion', label: 'Educacion — FLD req. 2.5%' },
  { id: 'comercial', label: 'Comercial — FLD req. 1.5%' },
  { id: 'industrial', label: 'Industrial — FLD req. 3.0%' },
  { id: 'hospitalario', label: 'Hospitalario — FLD req. 2.0%' },
];

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<string, string> = {
  LOW: 'CUMPLE', MEDIUM: 'REVISAR', HIGH: 'NO CUMPLE', CRITICAL: 'CRITICO'
};

export default function ModuloArquitectura() {
  const [tab, setTab] = useState<'viento' | 'ilum'>('viento');

  // Viento
  const [V_mph, setV_mph] = useState('115');
  const [h_m, setH_m] = useState('10');
  const [expo, setExpo] = useState('C');
  const [uso_ed, setUso_ed] = useState('II');
  const [Kd, setKd] = useState('0.85');
  const [Cp_bar, setCp_bar] = useState('0.8');
  const [Cp_sot, setCp_sot] = useState('-0.5');
  const [resViento, setResViento] = useState<ReturnType<typeof calcCargaViento>>(null);

  // Iluminacion
  const [ancho, setAncho] = useState('5');
  const [largo, setLargo] = useState('8');
  const [alto, setAlto] = useState('2.7');
  const [A_vent, setA_vent] = useState('4');
  const [tau, setTau] = useState('0.7');
  const [uso_loc, setUso_loc] = useState('oficinas');
  const [resIlum, setResIlum] = useState<ReturnType<typeof calcIluminacion>>(null);
  const [error, setError] = useState('');

  const calcViento = () => {
    setError('');
    const r = calcCargaViento(
      parseFloat(V_mph), parseFloat(h_m), expo, uso_ed,
      parseFloat(Kd), parseFloat(Cp_bar), parseFloat(Cp_sot)
    );
    if (!r) { setError('Verificar datos.'); return; }
    setResViento(r);
  };

  const calcIlum = () => {
    setError('');
    const r = calcIluminacion(
      parseFloat(ancho), parseFloat(largo), parseFloat(alto),
      parseFloat(A_vent), parseFloat(tau), uso_loc
    );
    if (!r) { setError('Verificar dimensiones.'); return; }
    setResIlum(r);
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
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏛️</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Arquitectura</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Cargas Viento ASCE 7 + Iluminacion y Ventilacion IRAM</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: ASCE 7-22 | CIRSOC 102 | IRAM 11601 | ASHRAE 62.1 | ASHRAE 90.1
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'viento', label: 'Cargas de Viento ASCE 7' },
            { id: 'ilum', label: 'Iluminacion y Ventilacion' }
          ].map(t2 => (
            <button key={t2.id} onClick={() => setTab(t2.id as 'viento' | 'ilum')}
              style={{ flex: 1, padding: 10, background: tab === t2.id ? '#8b5cf6' : '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontWeight: tab === t2.id ? 800 : 400, cursor: 'pointer', fontSize: 13 }}>
              {t2.label}
            </button>
          ))}
        </div>

        {/* VIENTO */}
        {tab === 'viento' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Presion de Viento — ASCE 7-22
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Velocidad basica V (mph)', val: V_mph, set: setV_mph },
                { label: 'Altura edificio h (m)', val: h_m, set: setH_m },
                { label: 'Factor Kd (tipico 0.85)', val: Kd, set: setKd },
                { label: 'Cp barlovento (tipico 0.8)', val: Cp_bar, set: setCp_bar },
                { label: 'Cp sotavento (tipico -0.5)', val: Cp_sot, set: setCp_sot },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Categoria exposicion</label>
                <select value={expo} onChange={e => setExpo(e.target.value)} style={{ ...inputStyle, fontSize: 13 }}>
                  {EXPOSICIONES.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Categoria de uso</label>
                <select value={uso_ed} onChange={e => setUso_ed(e.target.value)} style={{ ...inputStyle, fontSize: 13 }}>
                  {USOS_EDIFICIO.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>
            {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button onClick={calcViento} style={{ width: '100%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR CARGA DE VIENTO — ASCE 7
            </button>
          </div>
        )}

        {/* ILUMINACION */}
        {tab === 'ilum' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Iluminacion Natural y Ventilacion — IRAM 11601
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Ancho local (m)', val: ancho, set: setAncho },
                { label: 'Largo local (m)', val: largo, set: setLargo },
                { label: 'Alto local (m)', val: alto, set: setAlto },
                { label: 'Area ventanas (m2)', val: A_vent, set: setA_vent },
                { label: 'Transmitancia vidrio tau', val: tau, set: setTau },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Uso del local</label>
              <select value={uso_loc} onChange={e => setUso_loc(e.target.value)} style={{ ...inputStyle, fontSize: 13 }}>
                {USOS_LOCAL.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
            {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button onClick={calcIlum} style={{ width: '100%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR ILUMINACION Y VENTILACION
            </button>
          </div>
        )}

        {/* RESULTADOS VIENTO */}
        {tab === 'viento' && resViento && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resViento.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Carga de Viento</div>
              <div style={{ background: riskColor[resViento.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>{riskLabel[resViento.riesgo]}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Factor Kz', value: resViento.Kz.toString() },
                { label: 'Presion qz', value: resViento.qz_kPa + ' kPa' },
                { label: 'qz en psf', value: resViento.qz_psf + ' psf' },
                { label: 'P barlovento', value: resViento.p_barlovento_kPa + ' kPa' },
                { label: 'P sotavento', value: resViento.p_sotavento_kPa + ' kPa' },
                { label: 'P total diseno', value: resViento.p_total_kPa + ' kPa' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resViento.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#8b5cf6', marginBottom: 4, fontWeight: 700 }}>ASCE 7-22 Cap. 27:</div>
              qz = 0.00256 x Kz x Kd x V2 x Iw | p = qz x Cp
              <div style={{ marginTop: 4, color: '#475569' }}>Iw={resViento.Iw} | Exposicion {expo} | ASCE 7-22 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* RESULTADOS ILUMINACION */}
        {tab === 'ilum' && resIlum && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resIlum.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Iluminacion Natural</div>
              <div style={{ background: riskColor[resIlum.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>{riskLabel[resIlum.riesgo]}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'FLD calculado', value: resIlum.FLD + '%', ok: resIlum.ok_fld },
                { label: 'FLD requerido', value: resIlum.FLD_req + '%', ok: true },
                { label: 'Relacion V/P (RVP)', value: resIlum.RVP + '%', ok: resIlum.ok_rvp },
                { label: 'Area piso', value: resIlum.A_piso + ' m2', ok: true },
                { label: 'Caudal ventilacion', value: resIlum.Q_ventilacion_m3h + ' m3/h', ok: true },
                { label: 'Renovaciones aire', value: resIlum.renovaciones_h + ' /h', ok: true },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: r.ok ? '#00e5a0' : '#ef4444', fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: resIlum.ok_fld ? '#0a2a1a' : '#2a0a0a', border: `1px solid ${resIlum.ok_fld ? '#00e5a0' : '#dc2626'}`, borderRadius: 8, padding: 12 }}>
                <div style={{ color: resIlum.ok_fld ? '#00e5a0' : '#dc2626', fontWeight: 700, fontSize: 13 }}>
                  {resIlum.ok_fld ? 'FLD CUMPLE IRAM 11601' : 'FLD NO CUMPLE — Aumentar ventanas'}
                </div>
              </div>
              <div style={{ background: resIlum.ok_rvp ? '#0a2a1a' : '#2a0a0a', border: `1px solid ${resIlum.ok_rvp ? '#00e5a0' : '#dc2626'}`, borderRadius: 8, padding: 12 }}>
                <div style={{ color: resIlum.ok_rvp ? '#00e5a0' : '#dc2626', fontWeight: 700, fontSize: 13 }}>
                  {resIlum.ok_rvp ? 'RVP en rango optimo 15-40%' : 'RVP fuera de rango optimo'}
                </div>
              </div>
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#8b5cf6', marginBottom: 4, fontWeight: 700 }}>IRAM 11601 + ASHRAE 62.1:</div>
              FLD = (Av x tau x 0.85) / Apiso x 100
              <div style={{ marginTop: 4, color: '#475569' }}>Personas estimadas: {resIlum.personas_est} | ASHRAE 62.1 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
