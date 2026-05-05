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
