'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { useState } from 'react';

// ── CARGA DE VIENTO — ASCE 7-22 Cap.27 / CIRSOC 102 ─────────
function calcCargaViento(
  V_mph: number,
  h_m: number,
  categoria: string,
  uso: string,
  Kd: number,
  Cp_barlovento: number,
  Cp_sotavento: number,
) {
  if (V_mph <= 0 || h_m <= 0) return null;

  const IwMap: Record<string, number> = { I: 0.87, II: 1.0, III: 1.15, IV: 1.15 };
  const Iw = IwMap[uso] ?? 1.0;

  const alphaMap: Record<string, number> = { B: 7.0, C: 9.5, D: 11.5 };
  const zgMap:   Record<string, number>  = { B: 365.76, C: 274.32, D: 213.36 };
  const alpha = alphaMap[categoria] ?? 9.5;
  const zg    = zgMap[categoria]    ?? 274.32;
  const z_ft  = h_m * 3.281;
  const Kz    = 2.01 * Math.pow(Math.max(z_ft, 15) / zg, 2 / alpha);

  const qz_psf           = 0.00256 * Kz * Kd * V_mph * V_mph * Iw;
  const qz_kPa           = (qz_psf * 47.88) / 1000;
  const p_barlovento_kPa = qz_kPa * Cp_barlovento;
  const p_sotavento_kPa  = qz_kPa * Math.abs(Cp_sotavento);
  const p_total_kPa      = p_barlovento_kPa + p_sotavento_kPa;
  const V_kmh            = V_mph * 1.60934;
  const riesgo: 'LOW' | 'MEDIUM' | 'HIGH' =
    p_total_kPa > 3.0 ? 'HIGH' : p_total_kPa > 1.5 ? 'MEDIUM' : 'LOW';

  return {
    Kz:               +Kz.toFixed(3),
    qz_kPa:           +qz_kPa.toFixed(3),
    qz_psf:           +qz_psf.toFixed(2),
    p_barlovento_kPa: +p_barlovento_kPa.toFixed(3),
    p_sotavento_kPa:  +p_sotavento_kPa.toFixed(3),
    p_total_kPa:      +p_total_kPa.toFixed(3),
    V_kmh:            +V_kmh.toFixed(1),
    Iw,
    riesgo,
  };
}

// ── ILUMINACIÓN NATURAL — IRAM 11601 / ASHRAE 62.1 ───────────
function calcIluminacion(
  ancho_m: number,
  largo_m: number,
  alto_m: number,
  A_ventanas_m2: number,
  tau_vidrio: number,
  uso_local: string,
) {
  if (ancho_m <= 0 || largo_m <= 0 || alto_m <= 0) return null;

  const A_piso = ancho_m * largo_m;
  const FLD    = (A_ventanas_m2 * tau_vidrio * 0.85) / A_piso * 100;

  const FLD_reqMap: Record<string, number> = {
    residencial: 1.5, oficinas: 2.0, educacion: 2.5,
    comercial: 1.5, industrial: 3.0, hospitalario: 2.0,
  };
  const FLD_req           = FLD_reqMap[uso_local] ?? 2.0;
  const RVP               = (A_ventanas_m2 / A_piso) * 100;
  const personas_est      = +(A_piso * 0.1).toFixed(0);
  const Q_ventilacion_m3h = +(personas_est * 10 * 3.6).toFixed(0);
  const renovaciones_h    = +(Q_ventilacion_m3h / (A_piso * alto_m)).toFixed(1);
  const ok_fld  = FLD >= FLD_req;
  const ok_rvp  = RVP >= 15 && RVP <= 40;
  const riesgo: 'LOW' | 'MEDIUM' | 'HIGH' =
    !ok_fld && !ok_rvp ? 'HIGH' : !ok_fld || !ok_rvp ? 'MEDIUM' : 'LOW';

  return {
    FLD: +FLD.toFixed(2), FLD_req,
    RVP: +RVP.toFixed(1),
    Q_ventilacion_m3h, renovaciones_h, personas_est,
    ok_fld, ok_rvp, riesgo,
    A_piso: +A_piso.toFixed(1),
  };
}

// ── CORTANTE BASAL — CIRSOC 103:2013 (Método simplificado) ───
// Ref: CIRSOC 103:2013 § 4.2 — Fuerza Lateral Equivalente
// Zonas sísmicas Argentina: Tabla 2.1 CIRSOC 103:2013
// Factores suelo S: Tabla 4.2 CIRSOC 103:2013
// Período empírico: T = Ct × hn^0.75 (§ 5.1)
function calcSismo(
  W_kN: number,
  hn_m: number,
  zona: string,
  suelo: string,
  estructura: string,
  R: number,
) {
  if (W_kN <= 0 || hn_m <= 0 || R <= 0) return null;

  // Período fundamental empírico — CIRSOC 103:2013 § 5.1
  const CtMap: Record<string, number> = {
    portico_acero:    0.085,
    portico_hormigon: 0.075,
    muros:            0.049,
    dual:             0.075,
  };
  const Ct = CtMap[estructura] ?? 0.075;
  const T  = +(Ct * Math.pow(hn_m, 0.75)).toFixed(3);

  // Aceleración de diseño a0 — CIRSOC 103:2013 Tabla 2.1
  const a0Map: Record<string, number> = {
    zona0: 0.00, zona1: 0.05, zona2: 0.10,
    zona3: 0.20, zona4: 0.35, zona5: 0.45,
  };
  const a0 = a0Map[zona] ?? 0.10;

  // Factor de amplificación de suelo S — CIRSOC 103:2013 Tabla 4.2
  const SMap: Record<string, number> = {
    A: 1.0, B: 1.2, C: 1.5, D: 1.8, E: 2.0,
  };
  const S = SMap[suelo] ?? 1.5;

  // Amplificación máxima espectral η = 2.5 (zona de meseta)
  const eta  = 2.5;
  const Tc   = 0.60;  // período de esquina típico (suelo C–D)

  // Coeficiente sísmico Cs (CIRSOC 103:2013 § 4.2.1)
  const Sa   = T <= Tc
    ? a0 * S * eta
    : a0 * S * eta * (Tc / T);
  const Cs   = +(Math.max(Sa / R, a0 / R)).toFixed(4);

  // Cortante basal V
  const V_kN = +(Cs * W_kN).toFixed(1);
  const riesgo: 'LOW' | 'MEDIUM' | 'HIGH' =
    Cs > 0.20 ? 'HIGH' : Cs > 0.10 ? 'MEDIUM' : 'LOW';

  return { T, a0, S, Cs, V_kN, Sa: +Sa.toFixed(4), riesgo };
}

// ── DATOS ESTÁTICOS ───────────────────────────────────────────
const EXPOSICIONES = [
  { id: 'B', label: 'B — Terreno urbano y suburbano, bosques' },
  { id: 'C', label: 'C — Campo abierto, llanuras (más común)' },
  { id: 'D', label: 'D — Costa marítima, lagos grandes' },
];
const USOS_EDIFICIO = [
  { id: 'I',   label: 'I — Riesgo bajo (depósitos, graneros)' },
  { id: 'II',  label: 'II — Riesgo normal (viviendas, oficinas)' },
  { id: 'III', label: 'III — Riesgo alto (escuelas, hospitales)' },
  { id: 'IV',  label: 'IV — Riesgo esencial (bomberos, emergencias)' },
];
const USOS_LOCAL = [
  { id: 'residencial',  label: 'Residencial — FLD req. 1.5%' },
  { id: 'oficinas',     label: 'Oficinas — FLD req. 2.0%' },
  { id: 'educacion',    label: 'Educación — FLD req. 2.5%' },
  { id: 'comercial',    label: 'Comercial — FLD req. 1.5%' },
  { id: 'industrial',   label: 'Industrial — FLD req. 3.0%' },
  { id: 'hospitalario', label: 'Hospitalario — FLD req. 2.0%' },
];
const ZONAS_SISMICAS = [
  { id: 'zona0', label: 'Zona 0 — a₀=0.00g (mínima / sin peligro)' },
  { id: 'zona1', label: 'Zona 1 — a₀=0.05g (baja)' },
  { id: 'zona2', label: 'Zona 2 — a₀=0.10g (moderada)' },
  { id: 'zona3', label: 'Zona 3 — a₀=0.20g (media-alta)' },
  { id: 'zona4', label: 'Zona 4 — a₀=0.35g (alta — Cuyo, NOA)' },
  { id: 'zona5', label: 'Zona 5 — a₀=0.45g (muy alta — Mendoza)' },
];
const TIPOS_SUELO = [
  { id: 'A', label: 'A — Roca dura (S=1.0)' },
  { id: 'B', label: 'B — Roca blanda / suelo muy rígido (S=1.2)' },
  { id: 'C', label: 'C — Suelo rígido a medio (S=1.5)' },
  { id: 'D', label: 'D — Suelo blando (S=1.8)' },
  { id: 'E', label: 'E — Suelo muy blando / arcilla blanda (S=2.0)' },
];
const ESTRUCTURAS = [
  { id: 'portico_acero',    label: 'Pórtico de acero — Ct=0.085' },
  { id: 'portico_hormigon', label: 'Pórtico de hormigón — Ct=0.075' },
  { id: 'muros',            label: 'Muros estructurales / mampostería — Ct=0.049' },
  { id: 'dual',             label: 'Sistema dual (pórtico + muros) — Ct=0.075' },
];

// ── ESTILOS ───────────────────────────────────────────────────
const COLOR  = '#8b5cf6';
const BG     = '#020609';
const PANEL  = '#0a0f1e';
const CARD   = '#0f172a';
const BORDER = '#1e293b';

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444',
};
const riskLabel: Record<string, string> = {
  LOW: 'CUMPLE', MEDIUM: 'REVISAR', HIGH: 'NO CUMPLE',
};

const inp: React.CSSProperties = {
  width: '100%', background: CARD, border: '1px solid #334155',
  borderRadius: 8, padding: '10px 12px', color: '#f8fafc',
  fontSize: 14, boxSizing: 'border-box', outline: 'none',
};
const lbl: React.CSSProperties = {
  color: '#94a3b8', fontSize: 11, display: 'block',
  marginBottom: 6, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: 0.4,
};
const g2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16,
};
const g3: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16,
};

type Tab = 'viento' | 'ilum' | 'sismo';

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────
export default function ModuloArquitectura() {
  const [tab, setTab] = useState<Tab>('viento');

  // ── Estado: Viento
  const [V_mph,  setV_mph]  = useState('115');
  const [h_m,    setH_m]    = useState('10');
  const [expo,   setExpo]   = useState('C');
  const [uso_ed, setUso_ed] = useState('II');
  const [Kd,     setKd]     = useState('0.85');
  const [Cp_bar, setCp_bar] = useState('0.8');
  const [Cp_sot, setCp_sot] = useState('-0.5');
  const [resViento,   setResViento]   = useState<ReturnType<typeof calcCargaViento>>(null);
  const [datosViento, setDatosViento] = useState<DatosExportar | null>(null);

  // ── Estado: Iluminación
  const [ancho,   setAncho]   = useState('5');
  const [largo,   setLargo]   = useState('8');
  const [alto,    setAlto]    = useState('2.7');
  const [A_vent,  setA_vent]  = useState('4');
  const [tau,     setTau]     = useState('0.7');
  const [uso_loc, setUso_loc] = useState('oficinas');
  const [resIlum,   setResIlum]   = useState<ReturnType<typeof calcIluminacion>>(null);
  const [datosIlum, setDatosIlum] = useState<DatosExportar | null>(null);

  // ── Estado: Sismo
  const [W_kN,      setW_kN]      = useState('5000');
  const [hn_m,      setHn_m]      = useState('12');
  const [zona,      setZona]      = useState('zona3');
  const [suelo,     setSuelo]     = useState('C');
  const [estr,      setEstr]      = useState('portico_hormigon');
  const [R_red,     setR_red]     = useState('6');
  const [resSismo,   setResSismo]   = useState<ReturnType<typeof calcSismo>>(null);
  const [datosSismo, setDatosSismo] = useState<DatosExportar | null>(null);

  const [error, setError] = useState('');

  // ── CALCULAR VIENTO ──────────────────────────────────────────
  const calcViento = () => {
    setError('');
    const r = calcCargaViento(
      parseFloat(V_mph), parseFloat(h_m), expo, uso_ed,
      parseFloat(Kd), parseFloat(Cp_bar), parseFloat(Cp_sot),
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResViento(r);

    const advertencias: string[] = [];
    if (r.riesgo === 'HIGH') advertencias.push('Presión de diseño > 3.0 kPa — revisión estructural obligatoria.');
    if (r.riesgo === 'MEDIUM') advertencias.push('Presión entre 1.5–3.0 kPa — verificar con análisis detallado.');
    if (parseFloat(h_m) > 30) advertencias.push('Edificios > 30 m requieren análisis dinámico (ASCE 7-22 §26.2).');

    const payload: DatosExportar = {
      tipo:           'ARQUITECTURA_VIENTO',
      normativa:      'ASCE 7-22 Cap.27 / CIRSOC 102',
      nivelPrecision: 2,
      advertencias,
      parametros: {
        'Velocidad V (mph)':        V_mph,
        'Velocidad V (km/h)':       r.V_kmh,
        'Altura h (m)':             h_m,
        'Categoria exposicion':     expo,
        'Categoria uso edificio':   uso_ed,
        'Factor Kd':                Kd,
        'Cp barlovento':            Cp_bar,
        'Cp sotavento':             Cp_sot,
        'Factor importancia Iw':    r.Iw,
      },
      resultado: {
        'Factor de exposicion Kz':   r.Kz,
        'Presion velocidad qz (kPa)': r.qz_kPa,
        'Presion velocidad qz (psf)': r.qz_psf,
        'P barlovento (kPa)':         r.p_barlovento_kPa,
        'P sotavento (kPa)':          r.p_sotavento_kPa,
        'P total diseno (kPa)':       r.p_total_kPa,
        'Estado':                     riskLabel[r.riesgo],
      },
    };
    setDatosViento(payload);
    publicarResultado(payload);
  };

  // ── CALCULAR ILUMINACIÓN ─────────────────────────────────────
  const calcIlum = () => {
    setError('');
    const r = calcIluminacion(
      parseFloat(ancho), parseFloat(largo), parseFloat(alto),
      parseFloat(A_vent), parseFloat(tau), uso_loc,
    );
    if (!r) { setError('Verificar dimensiones del local.'); return; }
    setResIlum(r);

    const advertencias: string[] = [];
    if (!r.ok_fld) advertencias.push(`FLD ${r.FLD}% < ${r.FLD_req}% requerido — aumentar superficie de ventanas.`);
    if (!r.ok_rvp) advertencias.push(`RVP ${r.RVP}% fuera del rango óptimo 15–40% IRAM 11601.`);
    if (r.renovaciones_h < 0.5) advertencias.push('Renovaciones de aire < 0.5/h — considerar ventilación mecánica suplementaria.');

    const payload: DatosExportar = {
      tipo:           'ARQUITECTURA_ILUMINACION',
      normativa:      'IRAM 11601 / ASHRAE 62.1 / ASHRAE 90.1',
      nivelPrecision: 2,
      advertencias,
      parametros: {
        'Ancho (m)':          ancho,
        'Largo (m)':          largo,
        'Alto (m)':           alto,
        'Area ventanas (m2)': A_vent,
        'Transmitancia tau':  tau,
        'Uso local':          uso_loc,
        'Area piso (m2)':     r.A_piso,
      },
      resultado: {
        'FLD calculado (%)':          r.FLD,
        'FLD requerido (%)':          r.FLD_req,
        'RVP (%)':                    r.RVP,
        'Caudal ventilacion (m3/h)':  r.Q_ventilacion_m3h,
        'Renovaciones aire (/h)':     r.renovaciones_h,
        'Personas estimadas':         r.personas_est,
        'FLD cumple':                 r.ok_fld ? 'SI' : 'NO',
        'RVP en rango 15-40%':        r.ok_rvp ? 'SI' : 'NO',
        'Estado':                     riskLabel[r.riesgo],
      },
    };
    setDatosIlum(payload);
    publicarResultado(payload);
  };

  // ── CALCULAR SISMO ───────────────────────────────────────────
  const calcSismo_ = () => {
    setError('');
    const r = calcSismo(
      parseFloat(W_kN), parseFloat(hn_m), zona, suelo, estr, parseFloat(R_red),
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResSismo(r);

    const advertencias: string[] = [
      'Resultado preliminar — método simplificado CIRSOC 103:2013 § 4.2.',
      'La determinación definitiva requiere análisis modal espectral por profesional habilitado.',
    ];
    if (r.riesgo === 'HIGH') advertencias.push('Cs > 0.20 — estructura en zona de alta demanda sísmica. Diseño detallado obligatorio.');
    if (suelo === 'D' || suelo === 'E') advertencias.push('Suelo blando: evaluar posibilidad de licuefacción y análisis de sitio específico.');

    const zonaLabel = ZONAS_SISMICAS.find(z => z.id === zona)?.label ?? zona;
    const sueloLabel = TIPOS_SUELO.find(s => s.id === suelo)?.label ?? suelo;
    const estrLabel  = ESTRUCTURAS.find(e => e.id === estr)?.label ?? estr;

    const payload: DatosExportar = {
      tipo:           'ARQUITECTURA_SISMO',
      normativa:      'CIRSOC 103:2013 — Norma Argentina Construcciones Sismorresistentes',
      nivelPrecision: 1,
      advertencias,
      parametros: {
        'Peso total estructura W (kN)': W_kN,
        'Altura total hn (m)':          hn_m,
        'Zona sismica':                 zonaLabel,
        'Tipo de suelo':                sueloLabel,
        'Sistema estructural':          estrLabel,
        'Factor reduccion R':           R_red,
      },
      resultado: {
        'Periodo fundamental T (s)':    r.T,
        'Aceleracion zona a0 (g)':      r.a0,
        'Factor amplificacion suelo S': r.S,
        'Aceleracion espectral Sa (g)': r.Sa,
        'Coeficiente sismico Cs':       r.Cs,
        'Cortante basal V (kN)':        r.V_kN,
        'Estado':                       riskLabel[r.riesgo],
      },
    };
    setDatosSismo(payload);
    publicarResultado(payload);
  };

  const datosActivo = tab === 'viento' ? datosViento : tab === 'ilum' ? datosIlum : datosSismo;

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '24px 16px', fontFamily: 'Inter,system-ui,sans-serif' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: PANEL, border: '1px solid rgba(139,92,246,.25)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏛️</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: 20, letterSpacing: -.3 }}>Módulo Arquitectura Técnica</div>
              <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Viento ASCE 7-22 · Iluminación IRAM 11601 · Sismo CIRSOC 103:2013</div>
            </div>
          </div>
          <div style={{ background: CARD, borderRadius: 8, padding: '9px 14px', fontSize: 11, color: '#64748b', fontFamily: 'ui-monospace,monospace', letterSpacing: .3 }}>
            ASCE 7-22 · CIRSOC 102 · IRAM 11601 · ASHRAE 62.1 · ASHRAE 90.1 · CIRSOC 103:2013
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: CARD, borderRadius: 12, padding: 4 }}>
          {([
            { id: 'viento', label: 'Carga de Viento',        icon: '🌬️' },
            { id: 'ilum',   label: 'Iluminación / Ventil.',  icon: '💡' },
            { id: 'sismo',  label: 'Cortante Basal',         icon: '🏔️' },
          ] as { id: Tab; label: string; icon: string }[]).map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(''); }}
              style={{ flex: 1, padding: '9px 8px', background: tab === t.id ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'transparent', border: 'none', borderRadius: 9, color: tab === t.id ? '#fff' : '#475569', fontWeight: tab === t.id ? 800 : 500, cursor: 'pointer', fontSize: 12, boxShadow: tab === t.id ? '0 4px 12px rgba(139,92,246,.4)' : 'none', whiteSpace: 'nowrap' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── PANEL VIENTO ── */}
        {tab === 'viento' && (
          <div style={{ background: PANEL, border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <div style={{ color: COLOR, fontWeight: 800, fontSize: 12, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Presión de Viento — ASCE 7-22 Cap.27
            </div>
            <div style={g2}>
              <div>
                <label style={lbl}>Velocidad básica V (mph)</label>
                <input value={V_mph} onChange={e => setV_mph(e.target.value)} style={inp} type="number" min="60" step="5" />
                <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>
                  {!isNaN(parseFloat(V_mph)) ? `≈ ${(parseFloat(V_mph) * 1.60934).toFixed(0)} km/h` : ''}
                </div>
              </div>
              <div>
                <label style={lbl}>Altura edificio h (m)</label>
                <input value={h_m} onChange={e => setH_m(e.target.value)} style={inp} type="number" min="3" step="0.5" />
              </div>
              <div>
                <label style={lbl}>Factor Kd (típico 0.85)</label>
                <input value={Kd} onChange={e => setKd(e.target.value)} style={inp} type="number" step="0.01" min="0.85" max="1" />
              </div>
              <div>
                <label style={lbl}>Cp barlovento (típico 0.8)</label>
                <input value={Cp_bar} onChange={e => setCp_bar(e.target.value)} style={inp} type="number" step="0.05" />
              </div>
              <div>
                <label style={lbl}>Cp sotavento (típico −0.5)</label>
                <input value={Cp_sot} onChange={e => setCp_sot(e.target.value)} style={inp} type="number" step="0.05" />
              </div>
            </div>
            <div style={g2}>
              <div>
                <label style={lbl}>Categoría de exposición</label>
                <select value={expo} onChange={e => setExpo(e.target.value)} style={{ ...inp, fontSize: 12 }}>
                  {EXPOSICIONES.map(ex => <option key={ex.id} value={ex.id} style={{ background: CARD }}>{ex.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Categoría de uso edificio</label>
                <select value={uso_ed} onChange={e => setUso_ed(e.target.value)} style={{ ...inp, fontSize: 12 }}>
                  {USOS_EDIFICIO.map(u => <option key={u.id} value={u.id} style={{ background: CARD }}>{u.label}</option>)}
                </select>
              </div>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '9px 12px', color: '#fca5a5', fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <button onClick={calcViento} style={{ width: '100%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', borderRadius: 10, padding: '13px 0', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', letterSpacing: .3 }}>
              CALCULAR CARGA DE VIENTO — ASCE 7-22
            </button>
          </div>
        )}

        {/* ── PANEL ILUMINACIÓN ── */}
        {tab === 'ilum' && (
          <div style={{ background: PANEL, border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <div style={{ color: COLOR, fontWeight: 800, fontSize: 12, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Iluminación Natural y Ventilación — IRAM 11601
            </div>
            <div style={g2}>
              {[
                { label: 'Ancho local (m)',        val: ancho,  set: setAncho  },
                { label: 'Largo local (m)',          val: largo,  set: setLargo  },
                { label: 'Alto libre local (m)',      val: alto,   set: setAlto   },
                { label: 'Área total ventanas (m²)', val: A_vent, set: setA_vent },
                { label: 'Transmitancia vidrio τ',   val: tau,    set: setTau, step:'0.05' },
              ].map((f, i) => (
                <div key={i}>
                  <label style={lbl}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inp} type="number" step={(f as { step?: string }).step ?? '0.1'} min="0" />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Uso del local</label>
              <select value={uso_loc} onChange={e => setUso_loc(e.target.value)} style={{ ...inp, fontSize: 12 }}>
                {USOS_LOCAL.map(u => <option key={u.id} value={u.id} style={{ background: CARD }}>{u.label}</option>)}
              </select>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '9px 12px', color: '#fca5a5', fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <button onClick={calcIlum} style={{ width: '100%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', borderRadius: 10, padding: '13px 0', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', letterSpacing: .3 }}>
              CALCULAR ILUMINACIÓN Y VENTILACIÓN — IRAM 11601
            </button>
          </div>
        )}

        {/* ── PANEL SISMO ── */}
        {tab === 'sismo' && (
          <div style={{ background: PANEL, border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <div style={{ color: COLOR, fontWeight: 800, fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Cortante Basal Simplificado — CIRSOC 103:2013
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 16, lineHeight: 1.6 }}>
              Fuerza Lateral Equivalente · § 4.2 · Período empírico T = Ct × hn^0.75
            </div>
            <div style={g2}>
              <div>
                <label style={lbl}>Peso total estructura W (kN)</label>
                <input value={W_kN} onChange={e => setW_kN(e.target.value)} style={inp} type="number" min="100" step="100" />
                <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Cargas permanentes + % sobrecarga de uso</div>
              </div>
              <div>
                <label style={lbl}>Altura total hn (m)</label>
                <input value={hn_m} onChange={e => setHn_m(e.target.value)} style={inp} type="number" min="3" step="0.5" />
              </div>
              <div>
                <label style={lbl}>Factor reducción R</label>
                <input value={R_red} onChange={e => setR_red(e.target.value)} style={inp} type="number" min="1" max="12" step="0.5" />
                <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Muros=4 · Dual=6 · Pórtico=8 (CIRSOC 103 Tabla 7.1)</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Zona sísmica (CIRSOC 103:2013 Tabla 2.1)</label>
                <select value={zona} onChange={e => setZona(e.target.value)} style={{ ...inp, fontSize: 12 }}>
                  {ZONAS_SISMICAS.map(z => <option key={z.id} value={z.id} style={{ background: CARD }}>{z.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Tipo de suelo (CIRSOC 103:2013 Tabla 4.2)</label>
                <select value={suelo} onChange={e => setSuelo(e.target.value)} style={{ ...inp, fontSize: 12 }}>
                  {TIPOS_SUELO.map(s => <option key={s.id} value={s.id} style={{ background: CARD }}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Sistema estructural</label>
                <select value={estr} onChange={e => setEstr(e.target.value)} style={{ ...inp, fontSize: 12 }}>
                  {ESTRUCTURAS.map(e => <option key={e.id} value={e.id} style={{ background: CARD }}>{e.label}</option>)}
                </select>
              </div>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '9px 12px', color: '#fca5a5', fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <button onClick={calcSismo_} style={{ width: '100%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', borderRadius: 10, padding: '13px 0', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', letterSpacing: .3 }}>
              CALCULAR CORTANTE BASAL — CIRSOC 103:2013
            </button>
          </div>
        )}

        {/* ── RESULTADOS VIENTO ── */}
        {tab === 'viento' && resViento && (
          <div style={{ background: PANEL, border: `2px solid ${riskColor[resViento.riesgo]}`, borderRadius: 14, padding: 24, marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: 17 }}>Resultados — Carga de Viento</div>
              <div style={{ background: riskColor[resViento.riesgo], color: '#000', borderRadius: 20, padding: '5px 16px', fontWeight: 900, fontSize: 12 }}>
                {riskLabel[resViento.riesgo]}
              </div>
            </div>
            <div style={g3}>
              {[
                { label: 'Factor Kz',       value: resViento.Kz.toString()              },
                { label: 'Presión qz',       value: `${resViento.qz_kPa} kPa`           },
                { label: 'qz (psf)',         value: `${resViento.qz_psf} psf`           },
                { label: 'P barlovento',     value: `${resViento.p_barlovento_kPa} kPa` },
                { label: 'P sotavento',      value: `${resViento.p_sotavento_kPa} kPa`  },
                { label: 'P total diseño',   value: `${resViento.p_total_kPa} kPa`      },
              ].map((r, i) => (
                <div key={i} style={{ background: CARD, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: .4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resViento.riesgo], fontSize: 15, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: CARD, borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#94a3b8', fontFamily: 'ui-monospace,monospace', marginBottom: 12 }}>
              <span style={{ color: COLOR, fontWeight: 700 }}>ASCE 7-22 §26.10-1: </span>
              qz = 0.00256 × Kz × Kd × V² × Iw &nbsp;|&nbsp; p = qz × Cp
              <div style={{ marginTop: 3, color: '#475569' }}>V={resViento.V_kmh} km/h · Iw={resViento.Iw} · Exposición {expo} · {new Date().toLocaleDateString('es-AR')}</div>
            </div>
            {resViento.riesgo !== 'LOW' && (
              <div style={{ background: 'rgba(232,160,32,.06)', border: '1px solid rgba(232,160,32,.2)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#fbbf24' }}>
                ⚠ {resViento.riesgo === 'HIGH' ? 'Presión > 3.0 kPa — revisión estructural completa obligatoria.' : 'Presión entre 1.5–3.0 kPa — verificar con análisis detallado ASCE 7-22.'}
              </div>
            )}
          </div>
        )}

        {/* ── RESULTADOS ILUMINACIÓN ── */}
        {tab === 'ilum' && resIlum && (
          <div style={{ background: PANEL, border: `2px solid ${riskColor[resIlum.riesgo]}`, borderRadius: 14, padding: 24, marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: 17 }}>Resultados — Iluminación Natural</div>
              <div style={{ background: riskColor[resIlum.riesgo], color: '#000', borderRadius: 20, padding: '5px 16px', fontWeight: 900, fontSize: 12 }}>
                {riskLabel[resIlum.riesgo]}
              </div>
            </div>
            <div style={g3}>
              {[
                { label: 'FLD calculado', value: `${resIlum.FLD}%`,                ok: resIlum.ok_fld },
                { label: 'FLD requerido', value: `${resIlum.FLD_req}%`,            ok: true           },
                { label: 'RVP',           value: `${resIlum.RVP}%`,               ok: resIlum.ok_rvp },
                { label: 'Área piso',     value: `${resIlum.A_piso} m²`,          ok: true           },
                { label: 'Ventilación',   value: `${resIlum.Q_ventilacion_m3h} m³/h`, ok: true       },
                { label: 'Renovaciones',  value: `${resIlum.renovaciones_h} /h`,  ok: true           },
              ].map((r, i) => (
                <div key={i} style={{ background: CARD, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: .4 }}>{r.label}</div>
                  <div style={{ color: r.ok ? '#00e5a0' : '#ef4444', fontSize: 15, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={g2}>
              <div style={{ background: resIlum.ok_fld ? 'rgba(0,229,160,.06)' : 'rgba(239,68,68,.06)', border: `1px solid ${resIlum.ok_fld ? '#00e5a0' : '#ef4444'}`, borderRadius: 8, padding: 12 }}>
                <div style={{ color: resIlum.ok_fld ? '#00e5a0' : '#ef4444', fontWeight: 800, fontSize: 12 }}>
                  {resIlum.ok_fld ? '✓ FLD CUMPLE IRAM 11601' : '✗ FLD NO CUMPLE — Ampliar superficie de ventanas'}
                </div>
              </div>
              <div style={{ background: resIlum.ok_rvp ? 'rgba(0,229,160,.06)' : 'rgba(239,68,68,.06)', border: `1px solid ${resIlum.ok_rvp ? '#00e5a0' : '#ef4444'}`, borderRadius: 8, padding: 12 }}>
                <div style={{ color: resIlum.ok_rvp ? '#00e5a0' : '#ef4444', fontWeight: 800, fontSize: 12 }}>
                  {resIlum.ok_rvp ? '✓ RVP en rango óptimo 15–40%' : '✗ RVP fuera de rango óptimo 15–40%'}
                </div>
              </div>
            </div>
            <div style={{ background: CARD, borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#94a3b8', fontFamily: 'ui-monospace,monospace' }}>
              <span style={{ color: COLOR, fontWeight: 700 }}>IRAM 11601 + ASHRAE 62.1: </span>
              FLD = (Av × τ × 0.85) / Apiso × 100
              <div style={{ marginTop: 3, color: '#475569' }}>Personas estimadas: {resIlum.personas_est} · {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* ── RESULTADOS SISMO ── */}
        {tab === 'sismo' && resSismo && (
          <div style={{ background: PANEL, border: `2px solid ${riskColor[resSismo.riesgo]}`, borderRadius: 14, padding: 24, marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: 17 }}>Resultados — Cortante Basal Sísmico</div>
              <div style={{ background: riskColor[resSismo.riesgo], color: '#000', borderRadius: 20, padding: '5px 16px', fontWeight: 900, fontSize: 12 }}>
                {riskLabel[resSismo.riesgo]}
              </div>
            </div>
            <div style={g3}>
              {[
                { label: 'Período T (s)',         value: `${resSismo.T} s`              },
                { label: 'Aceleración zona a₀',   value: `${resSismo.a0}g`              },
                { label: 'Factor suelo S',        value: resSismo.S.toString()          },
                { label: 'Sa espectral',          value: `${resSismo.Sa}g`              },
                { label: 'Coef. sísmico Cs',      value: resSismo.Cs.toString()         },
                { label: 'Cortante basal V',      value: `${resSismo.V_kN} kN`          },
              ].map((r, i) => (
                <div key={i} style={{ background: CARD, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: .4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resSismo.riesgo], fontSize: 15, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: CARD, borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#94a3b8', fontFamily: 'ui-monospace,monospace', marginBottom: 12 }}>
              <span style={{ color: COLOR, fontWeight: 700 }}>CIRSOC 103:2013 § 4.2: </span>
              T = Ct × hn^0.75 &nbsp;|&nbsp; Sa = a0 × S × η &nbsp;|&nbsp; Cs = Sa / R &nbsp;|&nbsp; V = Cs × W
              <div style={{ marginTop: 3, color: '#475569' }}>{new Date().toLocaleDateString('es-AR')}</div>
            </div>
            <div style={{ background: 'rgba(232,160,32,.06)', border: '1px solid rgba(232,160,32,.2)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#fbbf24' }}>
              ⚠ Resultado preliminar — método simplificado de fuerza lateral equivalente. La determinación definitiva requiere análisis modal espectral por profesional habilitado.
            </div>
          </div>
        )}
        {datosActivo && <BotonesExportar visible={true} datos={datosActivo} />}

      </div>
    </div>
  );
}
