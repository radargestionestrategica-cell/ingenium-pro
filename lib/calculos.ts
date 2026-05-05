// Fórmulas de cálculo puras — sin React, sin efectos secundarios.
// Son la misma matemática que usan los componentes Modulo*.tsx.
// Exportadas aquí para poder testearlas de forma aislada.

// ── MAOP — ASME B31.8 §A842.221 ─────────────────────────────────
// Pared delgada (t/OD < 0.10): Barlow modificado
// Pared gruesa (t/OD > 0.15): Lamé (tensión de aro en cilindro grueso)
// Transición (0.10–0.15): interpolación lineal
export function calcMAOP(
  OD: number, t: number, SMYS: number,
  F = 0.72, E = 1.0, T_op = 20,
) {
  if (OD <= 0 || t <= 0 || SMYS <= 0 || t >= OD / 2) return null;
  const T_factor =
    T_op <= 120 ? 1.0 :
    T_op <= 150 ? 0.967 :
    T_op <= 175 ? 0.933 :
    T_op <= 200 ? 0.900 : 0.867;
  const ratio = t / OD;
  const ro = OD / 2, ri = ro - t;
  const Pb = (2 * SMYS * t * F * E * T_factor) / OD;
  const Pl = SMYS * F * E * T_factor * (ro ** 2 - ri ** 2) / (ro ** 2 + ri ** 2);
  const P =
    ratio > 0.15 ? Pl :
    ratio > 0.10 ? Pb * (1 - (ratio - 0.10) / 0.05) + Pl * (ratio - 0.10) / 0.05 :
    Pb;
  const reg =
    ratio > 0.15 ? 'PARED GRUESA — Lamé' :
    ratio > 0.10 ? 'TRANSICIÓN' :
    'PARED DELGADA — Barlow';
  const risk =
    P > 10 ? 'CRITICAL' : P > 7 ? 'HIGH' : P > 4 ? 'MEDIUM' : 'LOW';
  return {
    P:        +P.toFixed(3),
    bar:      +(P * 10).toFixed(2),
    psi:      +(P * 145.04).toFixed(0),
    ratio:    +(ratio * 100).toFixed(2),
    T_factor: +T_factor.toFixed(3),
    reg, risk,
  };
}

// ── DARCY-WEISBACH — ISO 4006 / Swamee-Jain ──────────────────────
// Q en L/s, D en mm, L en m, rugosidad en mm, K_menor adimensional
export function calcDarcyWeisbach(
  Q: number, D: number, L: number,
  rugosidad: number, K_menor: number,
) {
  if (Q <= 0 || D <= 0 || L <= 0) return null;
  const D_m = D / 1000;
  const A   = Math.PI / 4 * D_m * D_m;
  const V   = (Q / 1000) / A;
  const nu  = 1.004e-6;                           // cinemática agua 20°C
  const Re  = V * D_m / nu;
  const er  = (rugosidad / 1000) / D_m;           // rugosidad relativa
  const f   = Re < 2300
    ? 64 / Re
    : 0.25 / Math.pow(Math.log10(er / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2);
  const hf_mayor = f * (L / D_m) * V * V / (2 * 9.81);
  const hf_menor = K_menor * V * V / (2 * 9.81);
  const hf_total = hf_mayor + hf_menor;
  const dP_Pa    = 998 * 9.81 * hf_total;
  const regimen  = Re < 2300 ? 'LAMINAR' : Re < 4000 ? 'TRANSICION' : 'TURBULENTO';
  const riesgo   = V > 3 ? 'CRITICAL' : V > 2 ? 'HIGH' : V > 1.5 ? 'MEDIUM' : 'LOW';
  return {
    V:        +V.toFixed(3),
    Re:       +Re.toFixed(0),
    f:        +f.toFixed(6),
    hf_mayor: +hf_mayor.toFixed(3),
    hf_menor: +hf_menor.toFixed(3),
    hf_total: +hf_total.toFixed(3),
    dP_Pa:    +dP_Pa.toFixed(0),
    dP_bar:   +(dP_Pa / 1e5).toFixed(4),
    dP_mca:   +hf_total.toFixed(3),
    regimen, riesgo,
  };
}

// ── GOLPE DE ARIETE — Joukowsky ───────────────────────────────────
// Q en L/s, D en mm, t_mm espesor pared, L longitud m,
// E_GPa módulo elástico, dV cambio de velocidad m/s
export function calcGolpeAriete(
  Q: number, D: number, t_mm: number,
  L: number, E_GPa: number, dV: number,
) {
  if (Q <= 0 || D <= 0 || L <= 0) return null;
  const D_m   = D / 1000;
  const t_m   = t_mm / 1000;
  const K_agua = 2.2e9;                           // módulo volumétrico agua
  const E      = E_GPa * 1e9;
  const rho    = 998;
  const a      = Math.sqrt(K_agua / rho / (1 + K_agua * D_m / (E * t_m)));
  const dP_MPa = rho * a * dV / 1e6;
  const Tc     = 2 * L / a;
  const riesgo =
    dP_MPa > 2 ? 'CRITICAL' : dP_MPa > 1 ? 'HIGH' : dP_MPa > 0.5 ? 'MEDIUM' : 'LOW';
  return {
    a:       +a.toFixed(0),
    dP_MPa:  +dP_MPa.toFixed(3),
    dP_bar:  +(dP_MPa * 10).toFixed(2),
    Tc:      +Tc.toFixed(2),
    riesgo,
  };
}

// ── COEFICIENTE Cv — ISA 75.01.01 ────────────────────────────────
// Q en m³/h, ΔP en bar, SG adimensional (1.0 = agua)
// Cv = Q(GPM) × √(SG / ΔP_psi) · Kv = Cv / 1.1561
export function calcCv(Q_m3h: number, DP_bar: number, SG = 1.0) {
  if (Q_m3h <= 0 || DP_bar <= 0 || SG <= 0) return null;
  const Q_gpm  = Q_m3h  * 4.40287;
  const DP_psi = DP_bar * 14.5038;
  const Cv = Math.round(Q_gpm * Math.sqrt(SG / DP_psi) * 100) / 100;
  const Kv = Math.round(Cv / 1.1561 * 100) / 100;
  return { Cv, Kv };
}

// ── PERFORACIÓN — API RP 13D ──────────────────────────────────────
// TVD en pies, mudWeight en ppg, cuttingsLoad en psi
export function calcBHP(TVD: number, mudWeight: number, cuttingsLoad = 0) {
  if (TVD <= 0 || mudWeight <= 0) return null;
  const hydrostaticPsi = 0.052 * mudWeight * TVD;
  const bhp = hydrostaticPsi + cuttingsLoad;
  const risk =
    bhp > 10000 ? 'CRITICAL' : bhp > 7000 ? 'HIGH' : bhp > 4000 ? 'MEDIUM' : 'LOW';
  return { hydrostaticPsi: +hydrostaticPsi.toFixed(1), bhp: +bhp.toFixed(1), risk };
}

// overburdenGrad en psi/ft, resultado en psi/ft y psi
export function calcFractureGradient(
  depth: number, overburdenGrad: number, poissonRatio = 0.25,
) {
  if (depth <= 0 || overburdenGrad <= 0) return null;
  const nu = poissonRatio;
  const fracGrad = (nu / (1 - nu)) * (overburdenGrad - 0.433) + 0.433;
  const fracPressure = fracGrad * depth;
  return {
    fracGrad:     +fracGrad.toFixed(3),
    fracPressure: +fracPressure.toFixed(0),
  };
}

// porePresGrad en ppg, safetyFactor en ppg
export function calcMudWeight(porePresGrad: number, safetyFactor = 0.5) {
  if (porePresGrad <= 0) return null;
  const mudWeight = porePresGrad + safetyFactor;
  const ecd = +(mudWeight * 1.02).toFixed(2);
  const risk =
    mudWeight > 18 ? 'CRITICAL' : mudWeight > 15 ? 'HIGH' : mudWeight > 12 ? 'MEDIUM' : 'LOW';
  return { mudWeight: +mudWeight.toFixed(2), ecd, risk };
}

// ── GEOTECNIA — Meyerhof (1963) ───────────────────────────────────
type SueloId = 'arena_suelta'|'arena_compacta'|'arcilla_blanda'|'arcilla_media'|'arcilla_firme'|'grava';
const SUELOS: Record<SueloId, { Nq:number; Nc:number; Ng:number; c:number; gamma:number }> = {
  arena_suelta:   { Nq:10.66, Nc:25.80, Ng:9.70,  c:0,   gamma:16 },
  arena_compacta: { Nq:33.30, Nc:46.12, Ng:48.03, c:0,   gamma:18 },
  arcilla_blanda: { Nq:1.00,  Nc:5.14,  Ng:0.00,  c:20,  gamma:17 },
  arcilla_media:  { Nq:1.00,  Nc:5.14,  Ng:0.00,  c:50,  gamma:18 },
  arcilla_firme:  { Nq:1.00,  Nc:5.14,  Ng:0.00,  c:100, gamma:19 },
  grava:          { Nq:33.30, Nc:46.12, Ng:48.03, c:0,   gamma:20 },
};

// B, L en m; Df profundidad cimentación m; Q_kN carga aplicada kN;
// FS factor de seguridad; Dw profundidad napa m
export function calcCapacidadPortante(
  suelo: SueloId, B: number, L: number, Df: number,
  Q_kN: number, FS = 3, Dw = 99,
) {
  if (B <= 0 || L <= 0 || Df < 0 || Q_kN <= 0 || FS <= 0) return null;
  const s = SUELOS[suelo];
  if (!s) return null;
  const A  = B * L;
  const sc = 1 + 0.2 * (B / L);
  const sq = 1 + 0.1 * (B / L);
  const sg = 1 - 0.4 * (B / L);
  const gamma_ef = Dw < Df ? s.gamma / 2 : s.gamma;
  const q  = s.gamma * Df;
  const qu = s.c * s.Nc * sc + q * s.Nq * sq + 0.5 * gamma_ef * B * s.Ng * sg;
  const qa = qu / FS;
  const q_aplicada = Q_kN / A;
  const ok = q_aplicada <= qa;
  return {
    qu:          +qu.toFixed(1),
    qa:          +qa.toFixed(1),
    q_aplicada:  +q_aplicada.toFixed(1),
    ok,
  };
}

// ── TÉRMICA — LMTD ───────────────────────────────────────────────
// Q en kW, temperaturas en °C, U en W/(m²·K)
export function calcIntercambiador(
  Q_kW: number,
  T_hot_in: number, T_hot_out: number,
  T_cold_in: number, T_cold_out: number,
  U_Wm2K: number,
  tipo: 'contracorriente' | 'paralelo' = 'contracorriente',
) {
  if (Q_kW <= 0 || U_Wm2K <= 0) return null;
  const dT1 = tipo === 'contracorriente'
    ? T_hot_in  - T_cold_out
    : T_hot_in  - T_cold_in;
  const dT2 = tipo === 'contracorriente'
    ? T_hot_out - T_cold_in
    : T_hot_out - T_cold_out;
  if (dT1 <= 0 || dT2 <= 0) return null;
  const LMTD = Math.abs(dT1 - dT2) < 0.01
    ? dT1
    : (dT1 - dT2) / Math.log(dT1 / dT2);
  const A_m2 = (Q_kW * 1000) / (U_Wm2K * LMTD);
  const efectividad = ((T_hot_in - T_hot_out) / (T_hot_in - T_cold_in)) * 100;
  return {
    LMTD:        +LMTD.toFixed(2),
    A_m2:        +A_m2.toFixed(2),
    efectividad: +efectividad.toFixed(1),
  };
}

// alpha_1e6 en µm/(m·°C), L_m en m, E_GPa en GPa (para sigma si restringido)
export function calcDilatacionLineal(
  L_m: number, T1_C: number, T2_C: number,
  alpha_1e6: number, restringido = false, E_GPa = 200,
) {
  if (L_m <= 0 || alpha_1e6 <= 0) return null;
  const dT    = Math.abs(T2_C - T1_C);
  const alpha = alpha_1e6 * 1e-6;
  const dL_mm = alpha * L_m * dT * 1000;
  const sigma_MPa = restringido ? E_GPa * 1000 * alpha * dT : 0;
  const risk =
    sigma_MPa > 300 ? 'CRITICAL' : sigma_MPa > 200 ? 'HIGH' :
    sigma_MPa > 100 ? 'MEDIUM'   : dL_mm > 50 ? 'MEDIUM' : 'LOW';
  return {
    dL_mm:     +dL_mm.toFixed(2),
    sigma_MPa: +sigma_MPa.toFixed(1),
    risk,
  };
}

// ── CIVIL — ACI 318-19 ────────────────────────────────────────────
// Pu en kN, Mu en kN·m, b/h en mm, As en mm², fc/fy en MPa
export function calcColumnaHormigon(
  Pu_kN: number, Mu_kNm: number,
  b_mm: number, h_mm: number,
  As_mm2: number, fc_MPa: number, fy_MPa: number,
) {
  if (b_mm <= 0 || h_mm <= 0 || fc_MPa <= 0 || fy_MPa <= 0 || As_mm2 < 0) return null;
  const Ag      = b_mm * h_mm;
  const rho     = As_mm2 / Ag;
  const Pn_max  = 0.80 * (0.85 * fc_MPa * (Ag - As_mm2) + fy_MPa * As_mm2);
  const phi_Pn  = +(0.65 * Pn_max / 1000).toFixed(1);   // kN
  const ok_P    = Pu_kN <= phi_Pn;
  const ok_rho  = rho >= 0.01 && rho <= 0.08;
  const riesgo  =
    !ok_P   ? 'CRITICAL' :
    !ok_rho ? 'HIGH'     :
    Pu_kN / phi_Pn > 0.9 ? 'HIGH' :
    Pu_kN / phi_Pn > 0.7 ? 'MEDIUM' : 'LOW';
  return { phi_Pn, ok_P, ok_rho, rho: +(rho * 100).toFixed(2), riesgo };
}

// ── MINERÍA — RMR Bieniawski 1989 ────────────────────────────────
type CondicionFisura = 'muy_buena'|'buena'|'moderada'|'pobre'|'muy_pobre';
type AguaRoca        = 'seco'|'humedo'|'mojado'|'goteo'|'flujo';
type OrientacionRMR  = 'muy_favorable'|'favorable'|'moderada'|'desfavorable'|'muy_desfavorable';

function rmrP1(ucs: number) {
  return ucs > 250 ? 15 : ucs > 100 ? 12 : ucs > 50 ? 7 : ucs > 25 ? 4 : ucs > 5 ? 2 : 1;
}
function rmrP2(rqd: number) {
  return rqd > 90 ? 20 : rqd > 75 ? 17 : rqd > 50 ? 13 : rqd > 25 ? 8 : 3;
}
function rmrP3(espaciado_mm: number) {
  return espaciado_mm > 2000 ? 20 : espaciado_mm > 600 ? 15 : espaciado_mm > 200 ? 10 : espaciado_mm > 60 ? 8 : 5;
}
const P4_MAP: Record<CondicionFisura, number> = {
  muy_buena:15, buena:12, moderada:10, pobre:6, muy_pobre:0,
};
const P5_MAP: Record<AguaRoca, number> = {
  seco:15, humedo:10, mojado:7, goteo:4, flujo:0,
};
const ADJ_MAP: Record<OrientacionRMR, number> = {
  muy_favorable:0, favorable:-2, moderada:-5, desfavorable:-10, muy_desfavorable:-12,
};

export function calcRMR(
  ucs: number, rqd: number, espaciado_mm: number,
  condicion: CondicionFisura, agua: AguaRoca, orientacion: OrientacionRMR,
) {
  const p1  = rmrP1(ucs);
  const p2  = rmrP2(rqd);
  const p3  = rmrP3(espaciado_mm);
  const p4  = P4_MAP[condicion]   ?? 0;
  const p5  = P5_MAP[agua]        ?? 0;
  const adj = ADJ_MAP[orientacion] ?? 0;
  const rmr = p1 + p2 + p3 + p4 + p5 + adj;
  const clase =
    rmr >= 81 ? 'I' : rmr >= 61 ? 'II' : rmr >= 41 ? 'III' : rmr >= 21 ? 'IV' : 'V';
  const riesgo =
    rmr >= 61 ? 'LOW' : rmr >= 41 ? 'MEDIUM' : rmr >= 21 ? 'HIGH' : 'CRITICAL';
  return { rmr, clase, riesgo, p1, p2, p3, p4, p5, adj };
}

// trabajadores: personas; equipos_diesel_kW: potencia total diesel kW
// longitud en m; seccion_m2 en m²; gases_ppm: CO medido ppm
export function calcVentilacion(
  trabajadores: number, equipos_diesel_kW: number,
  longitud: number, seccion_m2: number, gases_ppm: number,
) {
  if (seccion_m2 <= 0 || longitud <= 0) return null;
  const Q_req = Math.max(trabajadores * 0.06 + equipos_diesel_kW * 0.06, 0.25);
  const V     = Q_req / seccion_m2;
  const co_ok = gases_ppm < 25;
  const riesgo =
    !co_ok ? 'CRITICAL' :
    V < 0.25 ? 'HIGH' : V < 0.5 ? 'MEDIUM' : 'LOW';
  return {
    Q_req: +Q_req.toFixed(2),
    V:     +V.toFixed(3),
    co_ok,
    riesgo,
  };
}

// ── SOLDADURA — ASME Sec. IX / AWS D1.1 ──────────────────────────
// V voltios, I amperios, vel_mmmin velocidad mm/min, eta eficiencia térmica
export function calcHeatInputSoldadura(
  V: number, I: number, vel_mmmin: number, eta: number,
) {
  if (V <= 0 || I <= 0 || vel_mmmin <= 0 || eta <= 0) return null;
  const hi = (V * I * 60 * eta) / (vel_mmmin * 1000);
  const riesgo =
    hi > 3.5 ? 'HIGH' : hi > 2.5 ? 'MEDIUM' : 'LOW';
  return { hi: +hi.toFixed(3), riesgo };
}

// C, Mn, Cr, Mo, Ni en % en peso (IIW formula)
export function calcCarbonoEquivalente(
  C: number, Mn: number, Cr: number, Mo: number, Ni: number,
) {
  if (C < 0 || Mn < 0 || Cr < 0 || Mo < 0 || Ni < 0) return null;
  const CE = C + Mn / 6 + (Cr + Mo) / 5 + Ni / 15;
  const grupo =
    CE < 0.35 ? 'I' : CE < 0.45 ? 'II' : CE < 0.60 ? 'III' : 'IV';
  return { CE: +CE.toFixed(3), grupo };
}

// ── ELECTRICIDAD — NEC Art. 430 / IEC 60947 ──────────────────────
// P en kW, V en V (fase-fase), FP factor de potencia, eta eficiencia
export function calcMotorTrifasico(
  P_kW: number, V: number, FP: number, eta: number,
) {
  if (P_kW <= 0 || V <= 0 || FP <= 0 || eta <= 0) return null;
  const Pelec = P_kW / eta;
  const Inom  = (Pelec * 1000) / (Math.sqrt(3) * V * FP);
  const Iarr  = 6 * Inom;
  return {
    Pelec: +Pelec.toFixed(2),
    Inom:  +Inom.toFixed(1),
    Iarr:  +Iarr.toFixed(0),
  };
}

// P en kW, Vp tensión primario V, Vs tensión secundario V
export function calcTransformadorElect(
  P_kW: number, FP: number, eta: number, Vp: number, Vs: number,
) {
  if (P_kW <= 0 || FP <= 0 || eta <= 0 || Vp <= 0 || Vs <= 0) return null;
  const S    = P_kW / (FP * eta);
  const Ip   = (S * 1000) / (Math.sqrt(3) * Vp);
  const Is   = (S * 1000) / (Math.sqrt(3) * Vs);
  const Iarr = 10 * Is;
  return {
    S:    +S.toFixed(1),
    Ip:   +Ip.toFixed(2),
    Is:   +Is.toFixed(1),
    Iarr: +Iarr.toFixed(0),
  };
}

// ── CAÑERÍAS — ASME B31.4 / API 579-1 ───────────────────────────
// D_mm diámetro exterior mm, P_bar presión bar, SMYS_MPa MPa
// F factor diseño, E efic. costura, T factor temperatura, CA_mm sobreancho mm
export function calcEspesorParedCaneria(
  D_mm: number, P_bar: number, SMYS_MPa: number,
  F = 0.72, E = 1.0, T = 1.0, CA_mm = 1.6,
) {
  if (D_mm <= 0 || P_bar <= 0 || SMYS_MPa <= 0) return null;
  const D_in    = D_mm / 25.4;
  const P_psi   = P_bar * 14.5038;
  const S_psi   = SMYS_MPa * 145.038;
  const t_min_in = (P_psi * D_in) / (2 * S_psi * F * E * T);
  const t_min_mm = +(t_min_in * 25.4).toFixed(2);
  const t_dis_mm = +(t_min_mm + CA_mm).toFixed(2);
  return { t_min_mm, t_dis_mm };
}

// sigma_h en MPa, allow en MPa
export function calcHoopStressBarlow(
  D_mm: number, t_mm: number, P_bar: number,
  SMYS_MPa: number, F = 0.72, E = 1.0, T = 1.0,
) {
  if (D_mm <= 0 || t_mm <= 0 || P_bar <= 0 || SMYS_MPa <= 0) return null;
  const P_MPa   = P_bar / 10;
  const sigma_h = (P_MPa * D_mm) / (2 * t_mm);
  const allow   = SMYS_MPa * F * E * T;
  const ok      = sigma_h <= allow;
  const ratio   = +(sigma_h / allow * 100).toFixed(1);
  return { sigma_h: +sigma_h.toFixed(2), allow: +allow.toFixed(2), ok, ratio };
}

// t en mm, corr en mm/año
export function calcVidaRemanente(
  t_nom: number, t_med: number, t_min: number, corr: number,
) {
  if (t_nom <= 0 || t_med < 0 || t_min < 0 || corr <= 0) return null;
  if (t_med <= t_min) return { vida: 0, pct: 0, estado: 'FUERA DE SERVICIO' };
  const vida = (t_med - t_min) / corr;
  const pct  = ((t_med - t_min) / (t_nom - t_min)) * 100;
  const estado =
    vida > 10 ? 'EN SERVICIO NORMAL' :
    vida > 5  ? 'MONITOREO INTENSIVO' :
    vida > 2  ? 'INTERVENCIÓN PROGRAMADA' :
    'REEMPLAZO URGENTE';
  return { vida: +vida.toFixed(1), pct: +pct.toFixed(1), estado };
}
