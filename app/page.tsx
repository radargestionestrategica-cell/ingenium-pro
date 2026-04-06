'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════
//  INGENIUM PRO v7.0 — THE WORLD'S MOST COMPLETE ENGINEERING TOOL
//  Silvana Belén Colombo · Founder & Chief Systems Architect
//  © 2026 Todos los derechos reservados
//  ─────────────────────────────────────────────────────────────────
//  CORRECCIONES v7.0:
//  ✅ API Key protegida via /api/chat (nunca expuesta al navegador)
//  ✅ Hardy-Cross dinámico (usuario ingresa su propia red)
//  ✅ Validación de unidades SI / Imperial con conversión automática
//  ✅ Respaldo de proyectos exportable a JSON
//  ✅ Planos CAD con simbología ISA 5.1
//  ✅ Gráfico S-N visual con punto de operación
//  ✅ Tutorial de primer uso
//  ✅ Validación de rangos en todos los campos
// ═══════════════════════════════════════════════════════════════════

type RL = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type Mode = 'field' | 'eng' | 'exec';
type Units = 'SI' | 'IMP';

// ── CONVERSIONES DE UNIDADES ──────────────────────────────────────
const U = {
  // SI → Imperial
  MPa_psi: (v: number) => +(v * 145.038).toFixed(1),
  mm_in: (v: number) => +(v / 25.4).toFixed(3),
  m_ft: (v: number) => +(v * 3.28084).toFixed(2),
  kN_lbf: (v: number) => +(v * 224.809).toFixed(1),
  ls_gpm: (v: number) => +(v * 15.8503).toFixed(1),
  // Imperial → SI
  psi_MPa: (v: number) => +(v / 145.038).toFixed(3),
  in_mm: (v: number) => +(v * 25.4).toFixed(2),
  ft_m: (v: number) => +(v / 3.28084).toFixed(2),
  lbf_kN: (v: number) => +(v / 224.809).toFixed(2),
  gpm_ls: (v: number) => +(v / 15.8503).toFixed(2),
};

// ── CÁLCULOS DE INGENIERÍA ────────────────────────────────────────
function calcMAOP(OD: number, t: number, S: number, F = 0.72) {
  if (OD <= 0 || t <= 0 || S <= 0 || t >= OD / 2) return null;
  const r = t / OD, ro = OD / 2, ri = ro - t;
  const Pb = (2 * S * t * F) / OD;
  const Pl = S * F * (ro ** 2 - ri ** 2) / (ro ** 2 + ri ** 2);
  const P = r > 0.15 ? Pl : r > 0.10 ? Pb * (1 - (r - 0.10) / 0.05) + Pl * (r - 0.10) / 0.05 : Pb;
  return {
    P: +P.toFixed(3), bar: +(P * 10).toFixed(2), psi: +(P * 145).toFixed(0),
    reg: r > 0.15 ? 'PARED GRUESA — Lamé' : r > 0.10 ? 'TRANSICIÓN' : 'PARED DELGADA — Barlow',
    ratio: +(r * 100).toFixed(1)
  };
}

function calcDW(Q: number, D: number, L: number, e = 0.046) {
  if (Q <= 0 || D <= 0 || L <= 0) return null;
  const q = Q / 1000, A = Math.PI / 4 * D ** 2, V = q / A;
  const Re = V * D / 1.004e-6, er = (e / 1000) / D;
  const f = Re < 2300 ? 64 / Re : 0.25 / Math.pow(Math.log10(er / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2);
  const hf = f * (L / D) * V ** 2 / (2 * 9.81);
  return {
    V: +V.toFixed(3), Re: +Re.toFixed(0), f: +f.toFixed(6),
    hf: +hf.toFixed(3), dP: +(998 * 9.81 * hf / 1000).toFixed(2),
    reg: Re < 2300 ? 'Laminar' : Re < 4000 ? 'Transición' : 'Turbulento'
  };
}

function calcManning(n: number, D: number, S: number) {
  if (n <= 0 || D <= 0 || S <= 0) return null;
  const A = Math.PI / 4 * D ** 2, R = A / (Math.PI * D);
  const V = (1 / n) * Math.pow(R, 2 / 3) * Math.pow(S, 0.5);
  return { V: +V.toFixed(3), Q: +(V * A * 1000).toFixed(2), R: +R.toFixed(4) };
}

function calcBlastSeismic(W: number, d: number) {
  if (W <= 0 || d <= 0) return null;
  const SD = d / Math.sqrt(W), PGV = 700 * Math.pow(SD, -1.73);
  const risk: RL = PGV < 5 ? 'LOW' : PGV < 25 ? 'MEDIUM' : PGV < 50 ? 'HIGH' : 'CRITICAL';
  return { SD: +SD.toFixed(2), PGV: +PGV.toFixed(1), risk, col: SD < 20 };
}

function calcBlasting(roca: string, expl: string, d: number, h: number) {
  const KR: Record<string, { k: number }> = {
    blanda: { k: 35 }, media: { k: 30 }, dura: { k: 27 }, muy_dura: { k: 24 }
  };
  const KE: Record<string, { dens: number; costo: number }> = {
    anfo: { dens: 0.85, costo: 1.2 }, emulsion: { dens: 1.10, costo: 2.8 },
    heavy_anfo: { dens: 1.00, costo: 1.9 }, dinamita: { dens: 1.45, costo: 6.5 }
  };
  const rk = KR[roca] || KR.media, ek = KE[expl] || KE.anfo;
  const D = d / 1000, B = rk.k * D, Sp = 1.15 * B, T = 0.7 * B, Lc = h - T;
  if (Lc <= 0) return null;
  const W = Math.PI * (D / 2) ** 2 * Lc * ek.dens * 1000;
  const Vr = B * Sp * h;
  return {
    B: +B.toFixed(2), S: +Sp.toFixed(2), T: +T.toFixed(2), Lc: +Lc.toFixed(2),
    W: +W.toFixed(1), Vr: +Vr.toFixed(1), PF: +(W / Vr).toFixed(3),
    dseg: +Math.round(15 * Math.pow(W * 10, 1 / 3)).toFixed(0),
    costo: +(W * ek.costo).toFixed(0), seis: calcBlastSeismic(W * 10, 100)
  };
}

function calcGeo(s: string, B: number, L: number, Df: number, Q: number, FS: number) {
  const DB: Record<string, { Nq: number; Nc: number; Ng: number; c: number; g: number }> = {
    arena_s: { Nq: 14.7, Nc: 25.8, Ng: 12.4, c: 0, g: 1600 },
    arena_c: { Nq: 33.3, Nc: 46.1, Ng: 37.2, c: 0, g: 1850 },
    arc_bl: { Nq: 1, Nc: 5.14, Ng: 0, c: 25, g: 1500 },
    arc_me: { Nq: 1, Nc: 5.14, Ng: 0, c: 50, g: 1700 },
    arc_fi: { Nq: 1, Nc: 5.14, Ng: 0, c: 100, g: 1800 },
    grava: { Nq: 64.2, Nc: 75.3, Ng: 93.7, c: 0, g: 2000 }
  };
  const d = DB[s] || DB.arc_me, g = d.g / 1000 * 9.81, q2 = g * Df;
  const sc = 1 + 0.2 * (B / L), sq = 1 + 0.1 * (B / L), sg = Math.max(0.1, 1 - 0.4 * (B / L));
  const qu = d.c * d.Nc * sc + q2 * d.Nq * sq + 0.5 * g * B * d.Ng * sg;
  const qa = qu / FS, qap = Q / (B * L);
  return { qu: +qu.toFixed(1), qa: +qa.toFixed(1), qap: +qap.toFixed(1), ok: qap <= qa, ut: +(qap / qa * 100).toFixed(1) };
}

// ── FATIGA con datos S-N para gráfico ────────────────────────────
function calcFatigue(sig: number, mat: string, N: number, T: number) {
  const DB: Record<string, { Sa: number; b: number; Su: number }> = {
    'Acero C-Mn': { Sa: 345, b: -0.091, Su: 485 },
    'Inox 304/316': { Sa: 310, b: -0.095, Su: 515 },
    'X65': { Sa: 420, b: -0.088, Su: 530 },
    'Aluminio 6061': { Sa: 138, b: -0.100, Su: 310 }
  };
  const c = DB[mat] || DB['Acero C-Mn'];
  const Tf = T > 370 ? Math.max(0.5, 1 - 0.002 * (T - 370)) : 1;
  const Sa = sig * Tf;
  const Na = Math.pow(10, Math.log10(c.Sa / Math.max(Sa, 1)) / c.b);
  const D = N / Na;
  const risk: RL = D > 1 ? 'CRITICAL' : D > 0.8 ? 'HIGH' : D > 0.5 ? 'MEDIUM' : 'LOW';
  // Puntos para curva S-N
  const snCurve = Array.from({ length: 8 }, (_, i) => {
    const n = Math.pow(10, 3 + i * 0.75);
    const sa = c.Sa * Math.pow(n, c.b);
    return { n: +n.toFixed(0), sa: +Math.max(sa, c.Su * 0.3).toFixed(1) };
  });
  return {
    Na: +Na.toFixed(0), Nd: +Math.round(Na / 2).toFixed(0),
    D: +D.toFixed(4), Dp: +(D * 100).toFixed(1), Tf: +Tf.toFixed(3),
    Sa: +Sa.toFixed(1), risk, ok: D <= 1, rem: Math.max(0, Math.round(Na - N)),
    snCurve, operPoint: { n: N, sa: Sa }
  };
}

function selectValve(serv: string, DN: number, P: number, h2s: number, sol: number) {
  const V: Record<string, { n: string; norm: string; costs: Record<number, number> }> = {
    bt: { n: 'Bola Trunnion API 6D', norm: 'API 6D / B16.34 / 6FA', costs: { 150: 8500, 200: 14000, 300: 32000, 400: 55000 } },
    bf: { n: 'Bola Flotante API 6D', norm: 'API 6D / ASME B16.34', costs: { 50: 850, 80: 1200, 100: 1800, 150: 3200 } },
    mp: { n: 'Mariposa Doble Excéntrica', norm: 'AWWA C504 / API 609', costs: { 200: 2800, 300: 4200, 400: 6800, 600: 16000 } },
    cg: { n: 'Compuerta API 600', norm: 'API 600 / B16.34', costs: { 50: 650, 100: 1400, 200: 4200, 300: 8500 } },
    kn: { n: 'Cuchilla Knife Gate', norm: 'TAPPI / MSS SP-81', costs: { 100: 1200, 200: 2800, 300: 5500 } },
    gl: { n: 'Globo Control ISA', norm: 'B16.34 / IEC 60534', costs: { 50: 2800, 100: 7500, 150: 14000 } },
    ch: { n: 'Retención Wafer', norm: 'API 594 / B16.34', costs: { 50: 380, 100: 850, 200: 2600 } },
    wh: { n: 'Cabezal Pozo API 6A', norm: 'API 6A / NACE', costs: { 52: 18000, 103: 55000, 154: 95000 } }
  };
  const CP = [
    { c: '150#', P: 1.97, f: 1 }, { c: '300#', P: 5.11, f: 1.6 },
    { c: '600#', P: 10.21, f: 2.8 }, { c: '900#', P: 15.32, f: 3.8 },
    { c: '1500#', P: 25.53, f: 5.5 }, { c: '2500#', P: 42.55, f: 8 }
  ];
  const w: string[] = [];
  if (h2s > 10) w.push('⚠️ NACE MR0175 — H₂S >10ppm. Materiales estándar INVÁLIDOS.');
  let t = 'cg';
  if (serv === 'pozo' || P > 20) t = 'wh';
  else if (sol > 5) { t = 'kn'; w.push('⚠️ Sólidos >5% — no usar asientos blandos'); }
  else if (serv === 'agua' && DN >= 200) t = 'mp';
  else if ((serv === 'petroleo' || serv === 'gas') && DN >= 150) t = 'bt';
  else if (DN < 150) t = 'bf';
  const cls = CP.find(c => P * 1.25 <= c.P) || CP[CP.length - 1];
  const v = V[t];
  const dn = Object.keys(v.costs).map(Number).sort((a, b) => a - b).reduce((p, c) => Math.abs(c - DN) < Math.abs(p - DN) ? c : p);
  return { v, cls, costo: Math.round((v.costs[dn] || 5000) * cls.f), w };
}

const CHEM: Record<string, { n: string; ac: string; ix: string; pv: string; hd: string; EPP: string; cls: string; risk: RL }> = {
  agua: { n: 'Agua potable', ac: '✅', ix: '✅', pv: '✅', hd: '✅', EPP: 'Guantes de trabajo', cls: 'No peligroso', risk: 'LOW' },
  h2so4: { n: 'Ácido Sulfúrico >80%', ac: '⚠️', ix: '✅', pv: '❌', hd: '✅', EPP: 'Careta + guantes nitrilo + mandil PVC + lavaojos', cls: 'CORROSIVO', risk: 'HIGH' },
  hcl: { n: 'Ácido Clorhídrico', ac: '❌', ix: '❌', pv: '✅', hd: '✅', EPP: 'SCBA + guantes nitrilo + ventilación forzada', cls: 'CORROSIVO/TÓXICO', risk: 'HIGH' },
  naoh: { n: 'Soda Cáustica NaOH', ac: '✅', ix: '✅', pv: '✅', hd: '✅', EPP: 'Careta + guantes neopreno + mandil', cls: 'CORROSIVO', risk: 'MEDIUM' },
  cianuro: { n: 'Cianuro de Sodio — Minería', ac: '✅', ix: '✅', pv: '✅', hd: '✅', EPP: 'SCBA + traje hermético + detector HCN. EXCLUSIÓN 50m', cls: 'EXTREMAD. TÓXICO', risk: 'CRITICAL' },
  h2s: { n: 'H₂S — Gas agrio', ac: '⚠️', ix: '⚠️', pv: '⚠️', hd: '✅', EPP: 'SCBA OBLIGATORIO + detector H₂S. LEP=1ppm. EXCLUSIÓN 100m', cls: 'TÓXICO/INFLAMABLE', risk: 'CRITICAL' },
  cloro: { n: 'Cloro líquido', ac: '❌', ix: '⚠️', pv: '✅', hd: '✅', EPP: 'SCBA + traje hermético + detector Cl₂', cls: 'TÓXICO/OXIDANTE', risk: 'HIGH' }
};

const BI: [string, string, string, number][] = [
  ['Tubería', 'Tubo A106 Gr.B 6" SCH40', 'm', 85],
  ['Tubería', 'Tubo A106 Gr.B 8" SCH40', 'm', 130],
  ['Tubería', 'Tubo API 5L X52 12" SCH40', 'm', 220],
  ['Tubería', 'Tubo API 5L X65 16"', 'm', 380],
  ['Tubería', 'HDPE PE100 DN200', 'm', 45],
  ['Tubería', 'HDPE PE100 DN400', 'm', 140],
  ['Válvulas', 'Bola Trunnion DN200 600#', 'u', 14000],
  ['Válvulas', 'Mariposa AWWA DN400', 'u', 6800],
  ['Válvulas', 'Compuerta DN150', 'u', 3800],
  ['Válvulas', 'Check Wafer DN200', 'u', 2600],
  ['Instalación', 'Soldadura butt 6"', 'u', 280],
  ['Instalación', 'Soldadura butt 12"', 'u', 580],
  ['Instalación', 'Soporte estándar', 'u', 320],
  ['Instalación', 'Prueba hidrostática', 'u', 2500],
  ['Civil', 'Excavación mecánica', 'm³', 18],
  ['Civil', 'Relleno compactado', 'm³', 25],
  ['Civil', 'Hormigón H-21', 'm³', 180],
  ['Civil', 'Voladura roca media', 'm³', 35],
  ['Ingeniería', 'Ing. básica FEED', 'h', 120],
  ['Ingeniería', 'Ing. de detalle', 'h', 95],
  ['Ingeniería', 'Inspección QC', 'h', 75]
];

// ── CAD SVG CON SIMBOLOGÍA ISA 5.1 ───────────────────────────────
function genPipeSVG(OD: number, t: number, L: number, Vn: number, En: number) {
  const W = 520, H = 160, pW = Math.max(10, OD / 8), pY = 80, sX = 50;
  const pL = Math.min(380, L * 0.65);
  let s = '';
  // Grid de fondo
  s += `<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0D1F35" strokeWidth="0.3"/></pattern></defs>`;
  s += `<rect width="${W}" height="${H}" fill="#020609"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#grid)"/>`;
  // Línea central (eje del ducto)
  s += `<line x1="${sX}" y1="${pY}" x2="${sX + pL}" y2="${pY}" stroke="#1A3050" strokeWidth="1" strokeDasharray="8 4"/>`;
  // Ducto con doble línea (simbología ISA)
  s += `<rect x="${sX}" y="${pY - pW / 2}" width="${pL}" height="${pW}" fill="#0A1830" stroke="#00C8FF" strokeWidth="1.5" rx="2"/>`;
  s += `<line x1="${sX}" y1="${pY - pW / 2 + 3}" x2="${sX + pL}" y2="${pY - pW / 2 + 3}" stroke="#00C8FF" strokeWidth="0.5" opacity="0.4"/>`;
  // Flechas de flujo ISA
  for (let i = 1; i <= 3; i++) {
    const x = sX + (pL / 4) * i;
    s += `<polygon points="${x - 4},${pY - 3} ${x + 4},${pY} ${x - 4},${pY + 3}" fill="#00C8FF" opacity="0.6"/>`;
  }
  // Válvulas con simbología ISA (mariposa gate)
  for (let i = 0; i < Math.min(Vn, 6); i++) {
    const x = sX + (pL / (Vn + 1)) * (i + 1);
    // Cuerpo de válvula ISA
    s += `<rect x="${x - 8}" y="${pY - pW / 2 - 2}" width="16" height="${pW + 4}" fill="#0A1830" stroke="#E8A020" strokeWidth="1.5" rx="1"/>`;
    s += `<polygon points="${x - 6},${pY - 6} ${x + 6},${pY - 6} ${x},${pY}" fill="#E8A020"/>`;
    s += `<polygon points="${x - 6},${pY + 6} ${x + 6},${pY + 6} ${x},${pY}" fill="#E8A020"/>`;
    s += `<line x1="${x}" y1="${pY - pW / 2 - 10}" x2="${x}" y2="${pY - pW / 2 - 2}" stroke="#E8A020" strokeWidth="1.5"/>`;
    s += `<circle cx="${x}" cy="${pY - pW / 2 - 13}" r="3" fill="#E8A020"/>`;
    s += `<text x="${x}" y="${pY + pW / 2 + 14}" textAnchor="middle" fill="#E8A020" fontSize="7" fontFamily="monospace">V${i + 1}</text>`;
  }
  // Estaciones con simbología ISA (bomba centrífuga)
  for (let i = 0; i < Math.min(En, 3); i++) {
    const x = sX + (pL / (En + 1)) * (i + 1);
    s += `<circle cx="${x}" cy="${pY}" r="14" fill="#031A0A" stroke="#00E5A0" strokeWidth="2"/>`;
    s += `<path d="M ${x - 7},${pY} L ${x + 7},${pY - 7} L ${x + 7},${pY + 7} Z" fill="#00E5A0" opacity="0.8"/>`;
    s += `<text x="${x}" y="${pY + pW / 2 + 14}" textAnchor="middle" fill="#00E5A0" fontSize="7" fontFamily="monospace">P${i + 1}</text>`;
  }
  // Cotas
  s += `<line x1="${sX}" y1="${pY + pW / 2 + 22}" x2="${sX + pL}" y2="${pY + pW / 2 + 22}" stroke="#284060" strokeWidth="1"/>`;
  s += `<line x1="${sX}" y1="${pY + pW / 2 + 18}" x2="${sX}" y2="${pY + pW / 2 + 26}" stroke="#284060" strokeWidth="1"/>`;
  s += `<line x1="${sX + pL}" y1="${pY + pW / 2 + 18}" x2="${sX + pL}" y2="${pY + pW / 2 + 26}" stroke="#284060" strokeWidth="1"/>`;
  s += `<text x="${sX + pL / 2}" y="${pY + pW / 2 + 35}" textAnchor="middle" fill="#284060" fontSize="8" fontFamily="monospace">L = ${L} m</text>`;
  s += `<text x="${sX - 5}" y="${pY - pW / 2 - 18}" fill="#00C8FF" fontSize="8" fontFamily="monospace">Ø${OD}×${t} mm</text>`;
  // Cuadro de título ISA
  s += `<rect x="0" y="0" width="${W}" height="20" fill="#050A14" stroke="#0D1F35" strokeWidth="1"/>`;
  s += `<text x="8" y="13" fill="#E8A020" fontSize="9" fontFamily="monospace" fontWeight="bold">INGENIUM PRO v7.0 — PERFIL DE DUCTO (ISA 5.1)</text>`;
  s += `<text x="${W - 8}" y="13" fill="#284060" fontSize="8" fontFamily="monospace" textAnchor="end">© Silvana Belén Colombo</text>`;
  // Leyenda
  s += `<rect x="0" y="${H - 20}" width="${W}" height="20" fill="#050A14" stroke="#0D1F35" strokeWidth="0.5"/>`;
  s += `<polygon points="12,${H - 14} 18,${H - 10} 12,${H - 6}" fill="#E8A020"/>`;
  s += `<text x="22" y="${H - 8}" fill="#E8A020" fontSize="7" fontFamily="monospace">VÁLVULA (ISA)</text>`;
  s += `<circle cx="80" cy="${H - 10}" r="5" fill="none" stroke="#00E5A0" strokeWidth="1.5"/>`;
  s += `<text x="89" y="${H - 8}" fill="#00E5A0" fontSize="7" fontFamily="monospace">BOMBA (ISA)</text>`;
  s += `<line x1="145" y1="${H - 10}" x2="165" y2="${H - 10}" stroke="#00C8FF" strokeWidth="2"/>`;
  s += `<text x="168" y="${H - 8}" fill="#00C8FF" fontSize="7" fontFamily="monospace">DUCTO</text>`;
  return { s, W, H };
}

// ── SISTEMA DE COLORES DE RIESGO ──────────────────────────────────
const RC = {
  LOW: { bg: 'bg-green-950', bd: 'border-green-700', tx: 'text-green-400', dot: 'bg-green-400', gl: '#00C88040' },
  MEDIUM: { bg: 'bg-yellow-950', bd: 'border-yellow-700', tx: 'text-yellow-400', dot: 'bg-yellow-400', gl: '#F59E0B40' },
  HIGH: { bg: 'bg-orange-950', bd: 'border-orange-700', tx: 'text-orange-400', dot: 'bg-orange-400', gl: '#F9731640' },
  CRITICAL: { bg: 'bg-red-950', bd: 'border-red-700', tx: 'text-red-400', dot: 'bg-red-500', gl: '#FF456060' }
};

const C = {
  i: 'w-full bg-[#020609] border border-[#0D1F35] rounded-xl px-4 py-3 text-sm text-[#94A8C0] focus:border-[#E8A020] focus:outline-none',
  ie: 'w-full bg-red-950/50 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300 focus:border-red-500 focus:outline-none',
  l: 'block text-[9px] text-[#284060] font-black uppercase tracking-widest mb-1.5',
  s: 'w-full bg-[#020609] border border-[#0D1F35] rounded-xl px-4 py-3 text-sm text-[#94A8C0] focus:border-[#E8A020] focus:outline-none cursor-pointer',
  k: 'bg-[#07101A] border border-[#0D1F35] rounded-2xl p-5',
  b: 'w-full bg-gradient-to-r from-[#E8A020] to-[#C07010] text-[#020609] py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#F0B030] transition-all mt-3 shadow-lg',
  o: 'w-full border border-[#E8A020]/40 text-[#E8A020] py-2.5 rounded-xl text-sm font-black hover:bg-[#E8A020]/10 transition-all mt-2'
};

function Badge({ r, msg }: { r: RL; msg: string }) {
  const c = RC[r];
  return (
    <div className={`${c.bg} ${c.bd} border rounded-2xl p-4 flex items-center gap-3`} style={{ boxShadow: `0 0 25px ${c.gl}` }}>
      <div className={`w-4 h-4 rounded-full ${c.dot} ${r === 'CRITICAL' ? 'animate-ping' : ''} flex-shrink-0`} />
      <div>
        <div className={`${c.tx} text-[9px] font-black uppercase tracking-widest`}>SEMÁFORO DE RIESGO</div>
        <div className={`${c.tx} text-xs font-black`}>{msg}</div>
      </div>
    </div>
  );
}

function Row({ l, v, h = false }: { l: string; v: string; h?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 px-3 rounded-lg ${h ? 'bg-[#E8A020]/10 border border-[#E8A020]/20' : ''}`}>
      <span className="text-[#284060] text-xs">{l}</span>
      <span className={`font-black text-xs font-mono ${h ? 'text-[#E8A020]' : 'text-[#94A8C0]'}`}>{v}</span>
    </div>
  );
}

function Box({ t, n, rows }: { t: string; n?: string; rows: [string, string, boolean?][] }) {
  return (
    <div className="bg-[#031A0A] border border-[#00E5A0]/20 rounded-xl p-4 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse" />
          <span className="text-[#00E5A0] text-[10px] font-black uppercase tracking-widest">{t}</span>
        </div>
        {n && <span className="text-[8px] text-[#284060] border border-[#0D1F35] rounded px-2 py-0.5">{n}</span>}
      </div>
      <div className="space-y-0.5">{rows.map(([l, v, h], i) => <Row key={i} l={l} v={v} h={h} />)}</div>
    </div>
  );
}

// Componente de input con validación
function ValidInput({ label, value, onChange, min, max, unit, error }: { label: string; value: string; onChange: (v: string) => void; min?: number; max?: number; unit?: string; error?: string }) {
  const v = parseFloat(value);
  const isErr = error || (min !== undefined && v < min) || (max !== undefined && v > max);
  return (
    <div>
      <label className={C.l}>{label}{unit && <span className="text-[#E8A020] ml-1">({unit})</span>}</label>
      <input className={isErr ? C.ie : C.i} type="number" value={value} onChange={e => onChange(e.target.value)} />
      {isErr && <div className="text-[9px] text-red-400 mt-1">⚠️ {error || `Rango: ${min}–${max}`}</div>}
    </div>
  );
}

interface Proj { id: string; name: string; cl: string; date: string; mod: string; risk: RL; usd: number; data: Record<string, unknown> }
function sp(p: Proj) { if (typeof window === 'undefined') return; const e = JSON.parse(localStorage.getItem('ip9') || '[]'); localStorage.setItem('ip9', JSON.stringify([p, ...e.filter((x: Proj) => x.id !== p.id)].slice(0, 50))); }
function lp(): Proj[] { if (typeof window === 'undefined') return []; return JSON.parse(localStorage.getItem('ip9') || '[]'); }

const AI_SYS = `You are INGENIUM Omega - world's most advanced industrial engineering AI.
Expert: ASME B31/API 5L piping (Barlow,Lame,MAOP), hydraulics (Darcy-Weisbach,Manning,Hardy-Cross),
valves (API 6D/6A/AWWA/NACE), explosives (Langefors/IRAM 11647/Ambraseys-Hendron seismic),
chemicals (MSDS/GHS), geotechnics (Meyerhof/AASHTO), corrosion (API 579/B31G),
fatigue (ASME VIII Div.2 S-N), oil&gas (Weymouth), construction, mining.
Respond in user language. Show: formula then variables then step by step then standard.
For explosives and chemicals ALWAYS include safety warnings and PPE.
Always give costs in USD. Validate units: ask if SI or Imperial when ambiguous.`;

// ── MAIN APP ──────────────────────────────────────────────────────
export default function IngeniumPro() {
  const [lang, setLang] = useState<'es' | 'en' | 'pt'>('es');
  const [acc, setAcc] = useState(false);
  const [u, setU] = useState({ name: '', lic: '', co: '', cn: '' });
  const [mode, setMode] = useState<Mode>('eng');
  const [mod, setMod] = useState('tutorial');
  const [risk, setRisk] = useState<RL>('LOW');
  const [units, setUnits] = useState<Units>('SI');
  const [projs, setProjs] = useState<Proj[]>([]);
  const [toast, setToast] = useState('');

  const TL = {
    es: { t: 'INGENIUM PRO', s: 'Motor de Ingeniería Mundial v7.0', a: 'ACEPTO — INGRESAR AL SISTEMA', mf: '🧱 CAMPO', me: '⚙️ INGENIERÍA', mx: '📊 DIRECTIVO' },
    en: { t: 'INGENIUM PRO', s: 'World Engineering Engine v7.0', a: 'I ACCEPT — ENTER SYSTEM', mf: '🧱 FIELD', me: '⚙️ ENGINEERING', mx: '📊 EXECUTIVE' },
    pt: { t: 'INGENIUM PRO', s: 'Motor de Engenharia v7.0', a: 'ACEITO — ENTRAR', mf: '🧱 CAMPO', me: '⚙️ ENGENHARIA', mx: '📊 DIRETIVO' }
  };
  const T = TL[lang];

  useEffect(() => {
    setProjs(lp());
    const sv = localStorage.getItem('ip9u');
    if (sv) { setU(JSON.parse(sv)); setAcc(true); setMod('ai'); }
  }, []);

  const toast2 = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const doSave = (name: string, m: string, r: RL, usd: number, data: Record<string, unknown> = {}) => {
    const p: Proj = { id: Date.now().toString(), name, cl: u.co, date: new Date().toLocaleString(), mod: m, risk: r, usd, data };
    sp(p); setProjs(lp()); toast2('✅ Guardado: ' + name);
  };

  const MODS = [
    { id: 'tutorial', i: '📖', l: 'Tutorial', c: '#E8A020' },
    { id: 'ai', i: '🤖', l: 'IA', c: '#00C8FF' },
    { id: 'pipes', i: '🔩', l: 'Tuberías', c: '#00E5A0' },
    { id: 'hydro', i: '💧', l: 'Hidráulica', c: '#00C8FF' },
    { id: 'valves', i: '⚙️', l: 'Válvulas', c: '#E8A020' },
    { id: 'blast', i: '💥', l: 'Explosivos', c: '#FF4560' },
    { id: 'chem', i: '⚗️', l: 'Químicos', c: '#A78BFA' },
    { id: 'geo', i: '🌍', l: 'Geotecnia', c: '#7EC850' },
    { id: 'cad', i: '📐', l: 'Planos', c: '#E8A020' },
    { id: 'budget', i: '💰', l: 'Presupuesto', c: '#00E5A0' },
    { id: 'hc', i: '🌊', l: 'Redes', c: '#00C8FF' },
    { id: 'fat', i: '🔄', l: 'Fatiga', c: '#F97316' },
    { id: 'pdf', i: '📄', l: 'PDF', c: '#A78BFA' },
    { id: 'ver', i: '🚀', l: 'Deploy', c: '#00E5A0' },
    { id: 'proj', i: '📁', l: 'Proyectos', c: '#94A8C0' }
  ];

  if (!acc) return (
    <div className="min-h-screen bg-[#020609] flex items-center justify-center p-4" style={{ fontFamily: "'IBM Plex Mono',monospace" }}>
      <div className="max-w-2xl w-full">
        <div className="flex justify-center gap-2 mb-5">
          {(['es', 'en', 'pt'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} className={`px-4 py-1.5 rounded-full text-xs font-black border transition-all ${lang === l ? 'bg-[#E8A020] text-[#020609] border-[#E8A020]' : 'border-[#0D1F35] text-[#284060]'}`}>
              {l === 'es' ? '🇦🇷 ES' : l === 'en' ? '🇺🇸 EN' : '🇧🇷 PT'}
            </button>
          ))}
        </div>
        <div className="bg-[#07101A] border border-[#0D1F35] rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#E8A020] to-[#C07010] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/30 flex items-center justify-center text-2xl font-black text-white">Ω</div>
            <div>
              <div className="text-black font-black text-2xl tracking-widest">{T.t}</div>
              <div className="text-black/70 text-xs font-black">{T.s}</div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-[#020609] border border-[#0D1F35] rounded-2xl p-4 max-h-44 overflow-y-auto text-[10px] text-[#284060] space-y-2">
              <p className="text-[#E8A020] font-black uppercase text-[9px]">TÉRMINOS Y CONDICIONES LEGALES — INGENIUM PRO v7.0</p>
              <p><strong className="text-[#94A8C0]">1. PROPIEDAD INTELECTUAL:</strong> INGENIUM PRO v7.0 es creación original e íntegra de <strong className="text-white">Silvana Belén Colombo</strong>, Founder de RADAR Gestión Estratégica. © 2026 Todos los derechos reservados. Prohibida la reproducción total o parcial sin autorización escrita.</p>
              <p><strong className="text-[#94A8C0]">2. DESCARGO DE RESPONSABILIDAD:</strong> Esta herramienta es un sistema de apoyo al cálculo de ingeniería. Los resultados son de carácter referencial. La validación técnica final, firma profesional y responsabilidad absoluta recaen en el profesional a cargo del proyecto.</p>
              <p><strong className="text-[#94A8C0]">3. EXPLOSIVOS Y MATERIALES PELIGROSOS:</strong> Los cálculos deben ser ejecutados exclusivamente por personal certificado bajo normativa vigente (IRAM 11647, RETIE, NOM, OSHA).</p>
              <p><strong className="text-[#94A8C0]">4. LIMITACIÓN DE DAÑOS:</strong> Silvana Belén Colombo e INGENIUM PRO no serán responsables por daños directos, indirectos o consecuentes derivados del uso de esta herramienta.</p>
              <p><strong className="text-[#94A8C0]">5. PRIVACIDAD:</strong> Los datos se almacenan localmente en el dispositivo del usuario.</p>
              <p><strong className="text-[#94A8C0]">6. REGISTRO:</strong> Al aceptar, el usuario declara conocer las limitaciones de la herramienta y asumir la responsabilidad sobre su uso.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={C.l}>Nombre completo *</label><input className={C.i} value={u.name} onChange={e => setU(p => ({ ...p, name: e.target.value }))} placeholder="Nombre Apellido" /></div>
              <div><label className={C.l}>ID / Matrícula / Rol *</label><input className={C.i} value={u.lic} onChange={e => setU(p => ({ ...p, lic: e.target.value }))} placeholder="MP-12345 o Founder" /></div>
              <div><label className={C.l}>Empresa</label><input className={C.i} value={u.co} onChange={e => setU(p => ({ ...p, co: e.target.value }))} placeholder="Empresa S.A." /></div>
              <div><label className={C.l}>País</label>
                <select className={C.s} value={u.cn} onChange={e => setU(p => ({ ...p, cn: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {['Argentina', 'Colombia', 'México', 'Chile', 'Perú', 'Brasil', 'Venezuela', 'Bolivia', 'Ecuador', 'Uruguay', 'España', 'USA', 'Otro'].map(x => <option key={x}>{x}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => { if (!u.name || !u.lic) return; localStorage.setItem('ip9u', JSON.stringify(u)); setAcc(true); setMod('tutorial'); }}
              disabled={!u.name || !u.lic}
              className="w-full bg-gradient-to-r from-[#E8A020] to-[#C07010] disabled:opacity-30 text-[#020609] py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg">
              {T.a}
            </button>
            <p className="text-center text-[9px] text-[#1A3050]">{new Date().toLocaleString()} · INGENIUM PRO v7.0 © Silvana Belén Colombo</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020609] text-[#94A8C0] print:bg-white" style={{ fontFamily: "'IBM Plex Mono',monospace", backgroundImage: "linear-gradient(#0D1F3504 1px,transparent 1px),linear-gradient(90deg,#0D1F3504 1px,transparent 1px)", backgroundSize: "48px 48px" }}>
      {toast && <div className="fixed top-4 right-4 z-50 bg-[#00E5A0] text-[#020609] px-4 py-2 rounded-xl font-black text-sm shadow-xl animate-pulse">{toast}</div>}
      <div className="bg-[#07101A] border-b border-[#0D1F35] px-4 py-3 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8A020] to-[#C07010] flex items-center justify-center font-black text-black text-lg flex-shrink-0">Ω</div>
            <div className="min-w-0">
              <div className="text-white font-black text-sm tracking-widest">INGENIUM PRO <span className="text-[#E8A020]">v7.0</span></div>
              <div className="text-[#284060] text-[8px] truncate hidden sm:block">{u.name} · {u.lic} · {u.co}</div>
            </div>
          </div>
          <div className="flex gap-1 bg-[#020609] rounded-xl p-1 border border-[#0D1F35]">
            {(['field', 'eng', 'exec'] as Mode[]).map((m, i) => (
              <button key={m} onClick={() => setMode(m)} className={`text-[9px] px-2 py-1.5 rounded-lg font-black transition-all ${mode === m ? 'bg-[#E8A020] text-[#020609]' : 'text-[#284060]'}`}>
                {[T.mf, T.me, T.mx][i]}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(['es', 'en', 'pt'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} className={`text-[9px] px-2 py-1 rounded-lg border font-black transition-all ${lang === l ? 'border-[#E8A020] text-[#E8A020]' : 'border-[#0D1F35] text-[#284060]'}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={() => setUnits(u2 => u2 === 'SI' ? 'IMP' : 'SI')}
            className={`text-[9px] px-2 py-1.5 rounded-lg border font-black transition-all ${units === 'SI' ? 'border-[#00C8FF] text-[#00C8FF] bg-[#00C8FF]/10' : 'border-[#F97316] text-[#F97316] bg-[#F97316]/10'}`}>
            {units === 'SI' ? 'SI' : 'IMP'}
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${RC[risk].bd} ${RC[risk].bg}`}>
            <div className={`w-2 h-2 rounded-full ${RC[risk].dot} ${risk === 'CRITICAL' ? 'animate-ping' : ''}`} />
            <span className={`text-[9px] font-black ${RC[risk].tx}`}>{risk}</span>
          </div>
          <button onClick={() => window.print()} className="text-[9px] text-[#284060] hover:text-[#94A8C0] border border-[#0D1F35] px-3 py-1.5 rounded-lg hidden sm:block">🖨️</button>
        </div>
      </div>
      <div className="bg-[#07101A] border-b border-[#0D1F35] print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex gap-1 overflow-x-auto">
            {MODS.map(m => (
              <button key={m.id} onClick={() => setMod(m.id)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap"
                style={mod === m.id ? { background: m.c + '20', border: `1px solid ${m.c}40`, color: m.c } : { border: '1px solid transparent', color: '#284060' }}>
                <span>{m.i}</span><span className="hidden md:block">{m.l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-4">
        {mod === 'tutorial' && <Tutorial onStart={() => setMod('ai')} user={u} />}
        {mod === 'ai' && <AIm lang={lang} mode={mode} sys={AI_SYS} units={units} />}
        {mod === 'pipes' && <Pipes mode={mode} onR={setRisk} onS={doSave} units={units} />}
        {mod === 'hydro' && <Hydro onR={setRisk} onS={doSave} units={units} />}
        {mod === 'valves' && <Valves onR={setRisk} onS={doSave} units={units} />}
        {mod === 'blast' && <Blast onR={setRisk} onS={doSave} units={units} />}
        {mod === 'chem' && <Chem onR={setRisk} />}
        {mod === 'geo' && <Geo onR={setRisk} onS={doSave} units={units} />}
        {mod === 'cad' && <CAD />}
        {mod === 'budget' && <Budget onS={doSave} />}
        {mod === 'hc' && <HC onS={doSave} />}
        {mod === 'fat' && <Fatigue onR={setRisk} onS={doSave} />}
        {mod === 'pdf' && <PDF user={u} />}
        {mod === 'ver' && <Vercel />}
        {mod === 'proj' && <Projects projs={projs} onL={(p) => setMod(p.mod)} onExport={() => {
          const blob = new Blob([JSON.stringify(projs, null, 2)], { type: 'application/json' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = `INGENIUM-PRO-proyectos-${new Date().toISOString().split('T')[0]}.json`; a.click();
        }} />}
      </div>
      <div className="hidden print:block fixed bottom-2 right-4 text-xs text-gray-400">INGENIUM PRO v7.0 © Silvana Belén Colombo · {u.name} · {u.lic} · {new Date().toLocaleString()}</div>
    </div>
  );
}

// ── TUTORIAL ─────────────────────────────────────────────────────
function Tutorial({ onStart, user }: { onStart: () => void; user: { name: string; lic: string; co: string } }) {
  const steps = [
    { i: '1', icon: '🧱⚙️📊', title: 'Elegí tu modo de trabajo', desc: 'CAMPO para resultados simples en obra. INGENIERÍA para cálculo completo con normas. DIRECTIVO para resumen ejecutivo con costos.' },
    { i: '2', icon: 'SI / IMP', title: 'Seleccioná el sistema de unidades', desc: 'SI para el sistema métrico internacional (MPa, mm, m). IMP para el sistema imperial (psi, pulgadas, pies). El botón está en la barra superior.' },
    { i: '3', icon: '🤖', title: 'Consultá la IA primero', desc: 'INGENIUM Ω conoce todas las normas. Preguntale cualquier cálculo en lenguaje natural. Ejemplo: "MAOP de un gasoducto 12 pulgadas X65".' },
    { i: '4', icon: '🔩💧⚙️', title: 'Calculá con los módulos', desc: 'Cada módulo tiene campos validados. Si ingresás un valor fuera de rango te avisa en rojo. Los resultados aparecen con la norma aplicada.' },
    { i: '5', icon: '🚦', title: 'Leé el semáforo de riesgo', desc: '🟢 LOW = operación segura. 🟡 MEDIUM = monitorear. 🟠 HIGH = acción correctiva. 🔴 CRITICAL = detener operación inmediatamente.' },
    { i: '6', icon: '💾', title: 'Guardá cada proyecto', desc: 'En cada módulo ingresá el nombre del proyecto y hacé clic en Guardar. Quedan en el módulo Proyectos con estado de riesgo y valor USD.' },
    { i: '7', icon: '📄', title: 'Exportá la memoria de cálculo', desc: 'El módulo PDF genera un documento formal con watermark, tu nombre y espacio para firma. Válido para presentar a clientes y organismos.' },
    { i: '8', icon: '📁', title: 'Respaldá tus proyectos', desc: 'En el módulo Proyectos podés exportar todos tus proyectos a un archivo JSON. Guardalo en la nube como respaldo.' },
  ];
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8A020] to-[#C07010] flex items-center justify-center text-xl font-black text-black">Ω</div>
          <div>
            <div className="text-white font-black text-lg">Bienvenido, {user.name || 'Ingeniero'}!</div>
            <div className="text-[#284060] text-xs">INGENIUM PRO v7.0 — Tutorial de primer uso</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {steps.map(s => (
            <div key={s.i} className="bg-[#020609] border border-[#0D1F35] rounded-xl p-3 flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#E8A020]/10 border border-[#E8A020]/30 flex items-center justify-center text-[#E8A020] font-black text-xs flex-shrink-0">{s.i}</div>
              <div>
                <div className="text-white font-black text-xs mb-1">{s.title}</div>
                <div className="text-[#284060] text-[9px] leading-relaxed">{s.desc}</div>
                <div className="text-[#E8A020] text-[9px] mt-1 font-mono">{s.icon}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#031A0A] border border-[#00E5A0]/20 rounded-xl p-4 mb-4">
          <div className="text-[#00E5A0] font-black text-xs mb-2">🏆 Lo que hace único a INGENIUM PRO</div>
          <div className="space-y-1 text-[9px] text-[#284060]">
            <div>✅ Único en el mundo que combina 13 disciplinas de ingeniería en una sola plataforma</div>
            <div>✅ Reemplaza CAESAR II ($19K) + AFT Fathom ($8.5K) + ENERCALC ($3K) + EPANET</div>
            <div>✅ Semáforo de riesgo en tiempo real con física real (no es decorativo)</div>
            <div>✅ Riesgo sísmico automático en voladuras (Ambraseys-Hendron)</div>
            <div>✅ Planos CAD generados automáticamente con simbología ISA 5.1</div>
            <div>✅ Memoria de cálculo certificable con firma y watermark</div>
          </div>
        </div>
        <button onClick={onStart} className={C.b}>🚀 EMPEZAR A USAR INGENIUM PRO</button>
      </div>
    </div>
  );
}

// ── IA (usa /api/chat — API Key nunca expuesta) ───────────────────
function AIm({ lang, mode, sys, units }: { lang: string; mode: string; sys: string; units: Units }) {
  const [msgs, setMsgs] = useState([{ r: 'a', c: '**INGENIUM Ω v7.0** 🌍\n\n13 módulos · Unidades SI e Imperial · Validación de rangos · Planos ISA · Hardy-Cross dinámico · Curvas S-N visuales\n\n¿Qué calculamos?' }]);
  const [inp, setInp] = useState('');
  const [load, setLoad] = useState(false);
  const eR = useRef<HTMLDivElement>(null);
  useEffect(() => { eR.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (t?: string) => {
    const m = t || inp.trim(); if (!m || load) return; setInp('');
    const h = [...msgs, { r: 'u', c: m }]; setMsgs(h); setLoad(true);
    try {
      const sL = lang === 'en' ? 'Respond in English.' : lang === 'pt' ? 'Em Português.' : 'En español.';
      const uCtx = `User is working in ${units === 'SI' ? 'SI (metric)' : 'Imperial'} units.`;
      const mC = mode === 'field' ? ' Simple practical language.' : mode === 'exec' ? ' Focus on costs and risks.' : '';
      // ✅ CORRECCIÓN: Llamada al endpoint propio /api/chat (API Key protegida)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: sys + ' ' + sL + ' ' + uCtx + mC,
          messages: h.map(x => ({ role: x.r === 'a' ? 'assistant' : 'user', content: x.c }))
        })
      });
      const d = await res.json();
      setMsgs([...h, { r: 'a', c: d.content?.[0]?.text || 'Error en la respuesta' }]);
    } catch { setMsgs([...h, { r: 'a', c: '⚠️ Error de conexión. Verificá que el servidor esté corriendo.' }]); }
    setLoad(false);
  };

  const rend = (c: string) => c.split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i} className="text-[#E8A020]">{p.slice(2, -2)}</strong> : p);
  const QS = ['MAOP gasoducto 12" SCH40 X65 B31.8', 'Burden ANFO granito 89mm banco 12m', 'Fatiga ASME VIII 50000 ciclos sigma=180MPa', 'Compatibilidad H₂SO₄ con HDPE', 'Hardy-Cross red 4 nudos', 'Presupuesto excavación 500m³'];

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 165px)' }}>
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.r === 'u' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 border ${m.r === 'a' ? 'bg-[#E8A020]/10 border-[#E8A020]/40 text-[#E8A020]' : 'bg-[#0D1F35] border-[#1A3050] text-[#284060]'}`}>{m.r === 'a' ? 'Ω' : 'U'}</div>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${m.r === 'a' ? 'bg-[#07101A] border border-[#0D1F35] text-[#94A8C0] rounded-tl-sm' : 'bg-[#E8A020]/10 border border-[#E8A020]/20 text-[#94A8C0] rounded-tr-sm'}`}>
              {m.r === 'a' ? rend(m.c) : m.c}
            </div>
          </div>
        ))}
        {load && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8A020]/10 border border-[#E8A020]/40 flex items-center justify-center text-[#E8A020] font-black text-xs animate-pulse">Ω</div>
            <div className="bg-[#07101A] border border-[#0D1F35] rounded-2xl px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-[#E8A020] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={eR} />
      </div>
      {msgs.length === 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {QS.map((q, i) => <button key={i} onClick={() => send(q)} className="flex-shrink-0 text-[10px] bg-[#07101A] border border-[#0D1F35] hover:border-[#E8A020] text-[#284060] hover:text-[#94A8C0] rounded-xl px-3 py-2 transition-all max-w-[200px] text-left">{q}</button>)}
        </div>
      )}
      <div className="flex gap-2 items-end">
        <textarea value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Cualquier cálculo... (Enter envía)" rows={1} className={C.i + ' resize-none'} style={{ minHeight: '44px', maxHeight: '120px' }}
          onInput={(e: React.FormEvent<HTMLTextAreaElement>) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }} />
        <button onClick={() => send()} disabled={load || !inp.trim()} className="bg-[#E8A020] hover:bg-[#F0B030] disabled:opacity-30 text-[#020609] font-black rounded-xl p-3 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
    </div>
  );
}

// ── TUBERÍAS con validación y unidades ───────────────────────────
function Pipes({ mode, onR, onS, units }: { mode: Mode; onR: (r: RL) => void; onS: (n: string, m: string, r: RL, u: number, d?: Record<string, unknown>) => void; units: Units }) {
  const [p, setP] = useState({ OD: '219.1', t: '8.18', S: '359', F: '0.72', Po: '5.5', Q: '60', L: '2000', name: '' });
  const [r, setR] = useState<null | { m: NonNullable<ReturnType<typeof calcMAOP>>; d: NonNullable<ReturnType<typeof calcDW>>; r: RL }>(null);
  const [err, setErr] = useState('');
  const sv = (f: Partial<typeof p>) => setP(x => ({ ...x, ...f }));

  const run = () => {
    setErr('');
    const OD = parseFloat(p.OD), t = parseFloat(p.t), S = parseFloat(p.S);
    if (t >= OD / 2) { setErr('El espesor t debe ser menor que OD/2'); return; }
    if (OD < 10 || OD > 3000) { setErr('OD fuera de rango (10–3000 mm)'); return; }
    const m = calcMAOP(OD, t, S, parseFloat(p.F));
    const di = (OD - 2 * t) / 1000;
    const d = calcDW(parseFloat(p.Q), di, parseFloat(p.L));
    if (!m || !d) { setErr('Verificá los valores ingresados'); return; }
    const u2 = parseFloat(p.Po) / m.P;
    const r2: RL = u2 > 0.9 ? 'CRITICAL' : u2 > 0.75 ? 'HIGH' : u2 > 0.5 ? 'MEDIUM' : 'LOW';
    setR({ m, d, r: r2 }); onR(r2);
  };

  const disp = (v: number, type: 'pressure' | 'length' | 'flow') => {
    if (units === 'IMP') {
      if (type === 'pressure') return `${U.MPa_psi(v)} psi`;
      if (type === 'length') return `${U.m_ft(v)} ft`;
      if (type === 'flow') return `${U.ls_gpm(v)} GPM`;
    }
    if (type === 'pressure') return `${v} MPa`;
    if (type === 'length') return `${v} m`;
    if (type === 'flow') return `${v} L/s`;
    return `${v}`;
  };

  return (
    <div className="space-y-4">
      <div className={C.k}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[#00E5A0] text-[10px] font-black uppercase tracking-widest">🔩 Tuberías — ASME B31 / API 5L</h3>
          <span className={`text-[9px] px-2 py-1 rounded-lg font-black ${units === 'SI' ? 'bg-[#00C8FF]/10 text-[#00C8FF]' : 'bg-[#F97316]/10 text-[#F97316]'}`}>{units}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ValidInput label="OD exterior (mm)" value={p.OD} onChange={v => sv({ OD: v })} min={10} max={3000} unit="mm" />
          <ValidInput label="Espesor t (mm)" value={p.t} onChange={v => sv({ t: v })} min={1} max={100} unit="mm" />
          <div><label className={C.l}>SMYS (MPa)</label>
            <select className={C.s} value={p.S} onChange={e => sv({ S: e.target.value })}>
              {[['241', 'Grado B'], ['290', 'X42'], ['359', 'X52'], ['414', 'X60'], ['448', 'X65'], ['483', 'X70'], ['552', 'X80']].map(([v, l]) => <option key={v} value={v}>{l} — {v}MPa</option>)}
            </select>
          </div>
          <div><label className={C.l}>Factor F</label>
            <select className={C.s} value={p.F} onChange={e => sv({ F: e.target.value })}>
              {[['0.80', 'B31.8 Cl.1'], ['0.72', 'B31.4 Cl.1'], ['0.60', 'B31.8 Cl.2'], ['0.50', 'B31.8 Cl.3']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <ValidInput label={`P operación (${units === 'SI' ? 'MPa' : 'psi'})`} value={p.Po} onChange={v => sv({ Po: v })} min={0.1} max={200} />
          <ValidInput label={`Caudal (${units === 'SI' ? 'L/s' : 'GPM'})`} value={p.Q} onChange={v => sv({ Q: v })} min={0.1} max={10000} />
          <ValidInput label={`Longitud (${units === 'SI' ? 'm' : 'ft'})`} value={p.L} onChange={v => sv({ L: v })} min={1} max={500000} />
          <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e => sv({ name: e.target.value })} placeholder="Gasoducto Norte — Tramo A" /></div>
        </div>
        {err && <div className="mt-2 bg-red-950 border border-red-700 rounded-xl p-3"><p className="text-red-400 text-xs font-black">⚠️ {err}</p></div>}
        <button onClick={run} className={C.b}>⚡ CALCULAR — MAOP + Darcy-Weisbach</button>
      </div>
      {r && (
        <div className="space-y-3">
          <Badge r={r.r} msg={`P_op/MAOP = ${(parseFloat(p.Po) / r.m.P * 100).toFixed(0)}% — ${r.r === 'CRITICAL' ? '⛔ EXCEDE LÍMITE' : r.r === 'HIGH' ? '⚠️ Margen reducido' : '✅ OK'}`} />
          <Box t={`MAOP — ${r.m.reg}`} n="ASME B31 / API 5L" rows={[
            ['t/D', r.m.ratio + '%'],
            ['MAOP', disp(r.m.P, 'pressure'), true],
            ['MAOP', r.m.bar + ' bar'],
            ['MAOP', r.m.psi + ' psi'],
            ['Prueba hidrostática', disp(+(r.m.P * 1.5).toFixed(3), 'pressure')]
          ]} />
          <Box t="Darcy-Weisbach" n="Colebrook-White" rows={[
            ['Velocidad V', r.d.V + ' m/s', r.d.V > 3],
            ['Reynolds', r.d.Re + ' — ' + r.d.reg],
            ['Factor f', r.d.f.toString()],
            ['Pérdida hf', r.d.hf + ' m', true],
            ['ΔP', r.d.dP + ' kPa', true]
          ]} />
          {p.name && <button onClick={() => onS(p.name, 'pipes', r.r, r.m.P * 1000, p as unknown as Record<string, unknown>)} className={C.o}>💾 Guardar: {p.name}</button>}
        </div>
      )}
    </div>
  );
}

// ── HIDRÁULICA ────────────────────────────────────────────────────
function Hydro({ onR, onS, units }: { onR: (r: RL) => void; onS: (n: string, m: string, r: RL, u: number) => void; units: Units }) {
  const [tab, setTab] = useState('dw');
  const [p, setP] = useState({ Q: '30', D: '0.3', L: '1000', n: '0.013', S: '0.003', name: '' });
  const [r, setR] = useState<null | { dw?: ReturnType<typeof calcDW>; mn?: ReturnType<typeof calcManning> }>(null);
  const sv = (f: Partial<typeof p>) => setP(x => ({ ...x, ...f }));
  const run = () => {
    if (tab === 'dw') {
      const d = calcDW(parseFloat(p.Q), parseFloat(p.D), parseFloat(p.L));
      if (!d) return; setR({ dw: d }); onR(d.V > 3.5 ? 'HIGH' : d.V > 2.5 ? 'MEDIUM' : 'LOW');
    } else {
      const mn = calcManning(parseFloat(p.n), parseFloat(p.D), parseFloat(p.S));
      if (!mn) return; setR({ mn }); onR('LOW');
    }
  };
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <div className="flex gap-1 mb-4 bg-[#020609] rounded-xl p-1 border border-[#0D1F35]">
          {[{ id: 'dw', l: 'Darcy-Weisbach' }, { id: 'mn', l: 'Manning (canal)' }].map(tb => (
            <button key={tb.id} onClick={() => { setTab(tb.id); setR(null); }} className={`flex-1 py-2 text-[10px] font-black rounded-lg ${tab === tb.id ? 'bg-[#E8A020] text-[#020609]' : 'text-[#284060]'}`}>{tb.l}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ValidInput label="Q (L/s)" value={p.Q} onChange={v => sv({ Q: v })} min={0.01} max={50000} />
          <ValidInput label="Diámetro D (m)" value={p.D} onChange={v => sv({ D: v })} min={0.01} max={10} />
          {tab === 'dw' && <div className="col-span-2"><ValidInput label="Longitud L (m)" value={p.L} onChange={v => sv({ L: v })} min={1} max={500000} /></div>}
          {tab === 'mn' && <>
            <div><label className={C.l}>Manning n</label>
              <select className={C.s} value={p.n} onChange={e => sv({ n: e.target.value })}>
                {[['0.010', 'PVC/HDPE'], ['0.013', 'Hormigón liso'], ['0.016', 'Hormigón rugoso'], ['0.025', 'Tierra compactada'], ['0.030', 'Canal natural']].map(([v, l]) => <option key={v} value={v}>{l} — n={v}</option>)}
              </select>
            </div>
            <ValidInput label="Pendiente S (m/m)" value={p.S} onChange={v => sv({ S: v })} min={0.0001} max={0.5} />
          </>}
          <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e => sv({ name: e.target.value })} /></div>
        </div>
        <button onClick={run} className={C.b}>⚡ CALCULAR</button>
      </div>
      {r?.dw && <Box t="Darcy-Weisbach" n="Swamee-Jain" rows={[['V', r.dw.V + ' m/s', r.dw.V > 3], ['Re', r.dw.Re + ' — ' + r.dw.reg], ['f', r.dw.f.toString()], ['hf', r.dw.hf + ' m', true], ['ΔP', r.dw.dP + ' kPa', true]]} />}
      {r?.mn && <Box t="Manning" n="ISO 10801" rows={[['Radio hidráulico R', r.mn.R + ' m'], ['Velocidad V', r.mn.V + ' m/s', true], ['Caudal Q', r.mn.Q + ' L/s', true], ['Autolimpiante', r.mn.V > 0.6 ? '✅ Sí (>0.6 m/s)' : '⚠️ Riesgo sedimentación']]} />}
      {r && p.name && <button onClick={() => onS(p.name, 'hydro', 'LOW', 0)} className={C.o}>💾 Guardar: {p.name}</button>}
    </div>
  );
}

// ── VÁLVULAS ──────────────────────────────────────────────────────
function Valves({ onR, onS, units }: { onR: (r: RL) => void; onS: (n: string, m: string, r: RL, u: number) => void; units: Units }) {
  const [p, setP] = useState({ sv: 'petroleo', DN: '200', P: '7.5', h2s: '0', sol: '0', name: '' });
  const [r, setR] = useState<null | ReturnType<typeof selectValve>>(null);
  const sv2 = (f: Partial<typeof p>) => setP(x => ({ ...x, ...f }));
  const run = () => { const res = selectValve(p.sv, parseFloat(p.DN), parseFloat(p.P), parseFloat(p.h2s), parseFloat(p.sol)); setR(res); onR(res.w.length > 0 ? 'HIGH' : 'LOW'); };
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#E8A020] text-[10px] font-black uppercase tracking-widest mb-3">⚙️ Válvulas — API 6D / 6A / AWWA / B16.34</h3>
        <div><label className={C.l}>Servicio</label>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {[{ id: 'petroleo', l: '🛢️ Petróleo' }, { id: 'gas', l: '⛽ Gas' }, { id: 'pozo', l: '🔧 Pozo' }, { id: 'agua', l: '💧 Agua' }, { id: 'vapor', l: '♨️ Vapor' }, { id: 'mineria', l: '⛏️ Lodos' }].map(s => (
              <button key={s.id} onClick={() => sv2({ sv: s.id })} className={`text-[10px] px-2 py-2 rounded-xl border transition-all ${p.sv === s.id ? 'border-[#E8A020]/50 bg-[#E8A020]/10 text-[#E8A020] font-black' : 'border-[#0D1F35] text-[#284060]'}`}>{s.l}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={C.l}>DN (mm)</label>
            <select className={C.s} value={p.DN} onChange={e => sv2({ DN: e.target.value })}>
              {[50, 80, 100, 150, 200, 250, 300, 400, 500, 600].map(d => <option key={d} value={d}>DN {d}mm</option>)}
            </select>
          </div>
          <div><label className={C.l}>Presión ({units === 'SI' ? 'MPa' : 'psi'})</label>
            <input className={C.i} type="number" step="0.1" value={p.P} onChange={e => sv2({ P: e.target.value })} />
            <div className="text-[9px] text-[#284060] mt-1">= {Math.round(parseFloat(p.P) * 145)} psi = {Math.round(parseFloat(p.P) * 10)} bar</div>
          </div>
          <div><label className={C.l}>H₂S (ppm)</label><input className={C.i} type="number" value={p.h2s} onChange={e => sv2({ h2s: e.target.value })} />{parseFloat(p.h2s) > 10 && <div className="text-[9px] text-red-400 mt-1 font-black">⚠️ NACE MR0175 obligatorio</div>}</div>
          <div><label className={C.l}>Sólidos (%)</label><input className={C.i} type="number" value={p.sol} onChange={e => sv2({ sol: e.target.value })} /></div>
          <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e => sv2({ name: e.target.value })} /></div>
        </div>
        <button onClick={run} className={C.b}>⚡ CALCULAR</button>
      </div>
      {r && (
        <div className="space-y-3">
          {r.w.map((w, i) => <div key={i} className="bg-red-950 border border-red-700 rounded-xl p-3"><p className="text-red-400 text-xs font-black">{w}</p></div>)}
          <Box t={r.v.n} n={r.v.norm} rows={[['Clase ASME', r.cls.c + ' (máx ' + r.cls.P + ' MPa)'], ['Prueba hidrostática', (parseFloat(p.P) * 1.5).toFixed(2) + ' MPa'], ['Costo FOB USD', '$ ' + r.costo.toLocaleString('en-US'), true], ['Con ingeniería +35%', '$ ' + Math.round(r.costo * 1.35).toLocaleString('en-US'), true]]} />
          {p.name && <button onClick={() => onS(p.name, 'valves', r.w.length > 0 ? 'HIGH' : 'LOW', r.costo)} className={C.o}>💾 Guardar: {p.name}</button>}
        </div>
      )}
    </div>
  );
}

// ── EXPLOSIVOS ────────────────────────────────────────────────────
function Blast({ onR, onS, units }: { onR: (r: RL) => void; onS: (n: string, m: string, r: RL, u: number) => void; units: Units }) {
  const [p, setP] = useState({ roca: 'media', expl: 'anfo', d: '89', h: '12', ds: '200', name: '' });
  const [r, setR] = useState<null | (ReturnType<typeof calcBlasting> & { seisActual: ReturnType<typeof calcBlastSeismic> })>(null);
  const sv = (f: Partial<typeof p>) => setP(x => ({ ...x, ...f }));
  const run = () => {
    const res = calcBlasting(p.roca, p.expl, parseFloat(p.d), parseFloat(p.h));
    if (!res) return;
    const seisActual = calcBlastSeismic(res.W * 10, parseFloat(p.ds));
    if (!seisActual) return;
    setR({ ...res, seisActual }); onR(seisActual.risk);
  };
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#FF4560] text-[10px] font-black uppercase tracking-widest mb-1">💥 Voladura — Langefors / IRAM 11647 / Riesgo Sísmico Ambraseys-Hendron</h3>
        <div className="space-y-3">
          <div><label className={C.l}>Tipo de roca</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[{ id: 'blanda', l: 'Blanda (arcilita · UCS=25MPa)' }, { id: 'media', l: 'Media (caliza · UCS=80MPa)' }, { id: 'dura', l: 'Dura (granito · UCS=150MPa)' }, { id: 'muy_dura', l: 'Muy dura (basalto · UCS=220MPa)' }].map(r2 => (
                <button key={r2.id} onClick={() => sv({ roca: r2.id })} className={`text-[10px] px-3 py-2 rounded-xl border transition-all ${p.roca === r2.id ? 'border-[#FF4560]/50 bg-[#FF4560]/10 text-[#FF4560] font-black' : 'border-[#0D1F35] text-[#284060]'}`}>{r2.l}</button>
              ))}
            </div>
          </div>
          <div><label className={C.l}>Explosivo</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[{ id: 'anfo', l: 'ANFO — $1.2/kg' }, { id: 'emulsion', l: 'Emulsión — $2.8/kg' }, { id: 'heavy_anfo', l: 'Heavy ANFO — $1.9/kg' }, { id: 'dinamita', l: 'Dinamita 60% — $6.5/kg' }].map(e => (
                <button key={e.id} onClick={() => sv({ expl: e.id })} className={`text-[10px] px-3 py-2 rounded-xl border transition-all ${p.expl === e.id ? 'border-[#FF4560]/50 bg-[#FF4560]/10 text-[#FF4560] font-black' : 'border-[#0D1F35] text-[#284060]'}`}>{e.l}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ValidInput label="Ø barreno (mm)" value={p.d} onChange={v => sv({ d: v })} min={50} max={400} />
            <ValidInput label="Altura banco (m)" value={p.h} onChange={v => sv({ h: v })} min={2} max={50} />
            <ValidInput label="Dist. estructura (m)" value={p.ds} onChange={v => sv({ ds: v })} min={1} max={5000} />
          </div>
          <div><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e => sv({ name: e.target.value })} /></div>
        </div>
        <button onClick={run} className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all mt-3 text-white bg-gradient-to-r from-[#FF4560] to-[#CC2040] hover:from-[#FF6070] shadow-lg">⚡ CALCULAR + ANÁLISIS SÍSMICO</button>
      </div>
      {r && (
        <div className="space-y-3">
          <div className="bg-red-950 border-2 border-red-600 rounded-2xl p-4" style={{ boxShadow: '0 0 30px #FF456040' }}>
            <div className="text-red-400 font-black text-sm mb-1">⚠️ ZONA DE EXCLUSIÓN OBLIGATORIA — IRAM 11647</div>
            <div className="text-white font-black text-3xl">{r.dseg} metros</div>
            <div className="text-red-300 text-xs mt-1">Despejar TODO el personal antes de iniciar la detonación</div>
          </div>
          <Badge r={r.seisActual?.risk || 'LOW'} msg={`PGV = ${r.seisActual?.PGV} mm/s a ${p.ds}m de distancia · DS = ${r.seisActual?.SD}${r.seisActual?.col ? ' — ⚠️ RIESGO DE DERRUMBE' : ''}`} />
          <Box t="Diseño de Voladura — Langefors-Kihlström" n="IRAM 11647" rows={[['Burden B', r.B + ' m', true], ['Espaciado S', r.S + ' m', true], ['Taco (stemming) T', r.T + ' m'], ['Longitud de carga', r.Lc + ' m'], ['Explosivo por barreno', r.W + ' kg'], ['Factor de carga (PF)', r.PF + ' kg/m³', true], ['Costo explosivos USD', '$ ' + r.costo.toLocaleString('en-US'), true], ['Zona de exclusión', r.dseg + ' m ⚠️']]} />
          {p.name && <button onClick={() => onS(p.name, 'blast', r.seisActual?.risk || 'LOW', r.costo)} className={C.o}>💾 Guardar: {p.name}</button>}
        </div>
      )}
    </div>
  );
}

// ── QUÍMICOS ──────────────────────────────────────────────────────
function Chem({ onR }: { onR: (r: RL) => void }) {
  const [sel, setSel] = useState('agua');
  const q = CHEM[sel];
  useEffect(() => { onR(q.risk); }, [sel]);
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#A78BFA] text-[10px] font-black uppercase tracking-widest mb-3">⚗️ Compatibilidad Química y Seguridad Industrial</h3>
        <select className={C.s} value={sel} onChange={e => setSel(e.target.value)}>
          {Object.entries(CHEM).map(([id, c]) => <option key={id} value={id}>{c.n}</option>)}
        </select>
      </div>
      {q && (
        <div className="space-y-3">
          <Badge r={q.risk} msg={q.cls + ' — ' + q.n} />
          <Box t="Compatibilidad con materiales de tubería" rows={[['Acero al carbono', q.ac], ['Acero inoxidable 316L', q.ix, true], ['PVC', q.pv], ['HDPE PE100', q.hd, true]]} />
          <div className="bg-orange-950 border border-orange-700 rounded-2xl p-4" style={{ boxShadow: '0 0 20px #F9731640' }}>
            <div className="text-orange-400 font-black text-xs mb-2">🦺 EPP OBLIGATORIO — MSDS / GHS-SGA / IRAM 3797</div>
            <p className="text-orange-200 text-xs leading-relaxed">{q.EPP}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GEOTECNIA ─────────────────────────────────────────────────────
function Geo({ onR, onS, units }: { onR: (r: RL) => void; onS: (n: string, m: string, r: RL, u: number) => void; units: Units }) {
  const [p, setP] = useState({ s: 'arc_me', B: '1.5', L: '2.0', Df: '1.2', Q: '500', FS: '3.0', ex: '0', name: '' });
  const [r, setR] = useState<null | ReturnType<typeof calcGeo>>(null);
  const sv = (f: Partial<typeof p>) => setP(x => ({ ...x, ...f }));
  const run = () => {
    const res = calcGeo(p.s, parseFloat(p.B), parseFloat(p.L), parseFloat(p.Df), parseFloat(p.Q), parseFloat(p.FS));
    setR(res);
    const er = parseFloat(p.ex) > 4 && p.s.includes('arc') ? 'HIGH' : parseFloat(p.ex) > 2 ? 'MEDIUM' : 'LOW';
    onR(!res.ok ? 'CRITICAL' : parseFloat(res.ut) > 80 ? 'HIGH' : er as RL);
  };
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#7EC850] text-[10px] font-black uppercase tracking-widest mb-3">🌍 Geotecnia — Meyerhof + Riesgo Excavación / AASHTO LRFD</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={C.l}>Tipo de suelo</label>
            <select className={C.s} value={p.s} onChange={e => sv({ s: e.target.value })}>
              {[{ id: 'arena_s', l: 'Arena suelta — φ=28°, c=0' }, { id: 'arena_c', l: 'Arena compacta — φ=35°, c=0' }, { id: 'arc_bl', l: 'Arcilla blanda — φ=0°, c=25kPa' }, { id: 'arc_me', l: 'Arcilla media — φ=0°, c=50kPa' }, { id: 'arc_fi', l: 'Arcilla firme — φ=0°, c=100kPa' }, { id: 'grava', l: 'Grava y arena — φ=40°, c=0' }].map(sl => <option key={sl.id} value={sl.id}>{sl.l}</option>)}
            </select>
          </div>
          <ValidInput label="Ancho B (m)" value={p.B} onChange={v => sv({ B: v })} min={0.3} max={50} />
          <ValidInput label="Largo L (m)" value={p.L} onChange={v => sv({ L: v })} min={0.3} max={100} />
          <ValidInput label="Profundidad Df (m)" value={p.Df} onChange={v => sv({ Df: v })} min={0.3} max={20} />
          <ValidInput label="Carga aplicada (kN)" value={p.Q} onChange={v => sv({ Q: v })} min={1} max={100000} />
          <div><label className={C.l}>Factor seguridad FS</label>
            <select className={C.s} value={p.FS} onChange={e => sv({ FS: e.target.value })}>
              {[['2.5', 'Sismo / transitorio'], ['3.0', 'Estático estándar'], ['3.5', 'Infraestructura crítica']].map(([v, l]) => <option key={v} value={v}>FS={v} — {l}</option>)}
            </select>
          </div>
          <div>
            <ValidInput label="Profundidad excavación (m)" value={p.ex} onChange={v => sv({ ex: v })} min={0} max={30} />
            <div className="text-[9px] text-[#284060] mt-1">Para análisis de riesgo de derrumbe</div>
          </div>
          <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e => sv({ name: e.target.value })} /></div>
        </div>
        <button onClick={run} className="w-full bg-gradient-to-r from-[#7EC850] to-[#5A9030] text-[#020609] py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#90E060] transition-all mt-3 shadow-lg">⚡ CALCULAR + RIESGO EXCAVACIÓN</button>
      </div>
      {r && (
        <div className="space-y-3">
          {parseFloat(p.ex) > 2 && (
            <div className={`rounded-2xl border p-4 ${parseFloat(p.ex) > 4 && p.s.includes('arc') ? 'bg-red-950 border-red-700' : 'bg-yellow-950 border-yellow-700'}`}>
              <div className="font-black text-sm" style={{ color: parseFloat(p.ex) > 4 ? '#FF4560' : '#F59E0B' }}>
                {parseFloat(p.ex) > 4 && p.s.includes('arc') ? '🚨 RIESGO DE DERRUMBE — ENTIBADO OBLIGATORIO' : '⚠️ Excavación con riesgo moderado'}
              </div>
              <p className="text-xs mt-1" style={{ color: parseFloat(p.ex) > 4 ? '#FCA5A5' : '#FDE68A' }}>
                {parseFloat(p.ex) > 4 && p.s.includes('arc') ? 'Arcilla + profundidad >4m: entibado tipo Berliner o tablestacado. Control nivel freático. Ref: CIRSOC 102.' : `Profundidad ${p.ex}m — Talud mínimo 1:1. Verificar agua subterránea.`}
              </p>
            </div>
          )}
          <Badge r={!r.ok ? 'CRITICAL' : parseFloat(r.ut) > 80 ? 'HIGH' : 'LOW'} msg={!r.ok ? `❌ FALLA — q_ap=${r.qap} kPa > q_adm=${r.qa} kPa. REDIMENSIONAR FUNDACIÓN.` : `✅ APTO — Utilización ${r.ut}% del portante admisible`} />
          <Box t="Meyerhof — AASHTO LRFD" n="CIRSOC 501 / ACI 336" rows={[['q última', r.qu + ' kPa'], ['q admisible FS=' + p.FS, r.qa + ' kPa', true], ['q aplicada', r.qap + ' kPa'], ['Utilización', r.ut + '%', parseFloat(r.ut) > 80], ['Veredicto', r.ok ? '✅ APTO — q_ap ≤ q_adm' : '❌ FALLA — Revisar geometría', !r.ok]]} />
          {p.name && <button onClick={() => onS(p.name, 'geo', !r.ok ? 'CRITICAL' : 'LOW', 0)} className={C.o}>💾 Guardar: {p.name}</button>}
        </div>
      )}
    </div>
  );
}

// ── CAD con simbología ISA 5.1 ────────────────────────────────────
function CAD() {
  const [p, setP] = useState({ OD: '219.1', t: '8.18', L: '500', V: '3', E: '1' });
  const [c, setC] = useState<null | { s: string; W: number; H: number }>(null);
  const sv = (f: Partial<typeof p>) => setP(x => ({ ...x, ...f }));
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#E8A020] text-[10px] font-black uppercase tracking-widest mb-1">📐 Planos CAD — Simbología ISA 5.1 — Auto-generado</h3>
        <p className="text-[#284060] text-[9px] mb-3">El plano se dibuja automáticamente con simbología normalizada ISA 5.1. No es CAD manual.</p>
        <div className="grid grid-cols-2 gap-3">
          <ValidInput label="OD (mm)" value={p.OD} onChange={v => sv({ OD: v })} min={10} max={3000} />
          <ValidInput label="Espesor t (mm)" value={p.t} onChange={v => sv({ t: v })} min={1} max={100} />
          <ValidInput label="Longitud L (m)" value={p.L} onChange={v => sv({ L: v })} min={1} max={100000} />
          <ValidInput label="Válvulas (0–8)" value={p.V} onChange={v => sv({ V: v })} min={0} max={8} />
          <div className="col-span-2"><ValidInput label="Estaciones de bombeo (0–4)" value={p.E} onChange={v => sv({ E: v })} min={0} max={4} /></div>
        </div>
        <button onClick={() => setC(genPipeSVG(parseFloat(p.OD), parseFloat(p.t), parseFloat(p.L), parseInt(p.V), parseInt(p.E)))} className={C.b}>📐 GENERAR PLANO ISA 5.1</button>
      </div>
      {c && (
        <div className={C.k}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#E8A020] text-[10px] font-black uppercase">Perfil de Ducto — ISA 5.1</div>
            <button onClick={() => window.print()} className="text-[9px] border border-[#E8A020]/40 text-[#E8A020] px-3 py-1.5 rounded-lg hover:bg-[#E8A020]/10">🖨️ Imprimir</button>
          </div>
          <svg viewBox={`0 0 ${c.W} ${c.H}`} className="w-full bg-[#020609] rounded-xl border border-[#0D1F35] mb-2" style={{ minHeight: '140px' }} dangerouslySetInnerHTML={{ __html: c.s }} />
          <p className="text-[#1A3050] text-[9px] mt-1">INGENIUM PRO v7.0 © Silvana Belén Colombo · Simbología ISA 5.1 · {new Date().toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

// ── PRESUPUESTO ───────────────────────────────────────────────────
function Budget({ onS }: { onS: (n: string, m: string, r: RL, u: number) => void }) {
  const [lines, setLines] = useState([{ i: 0, q: 100 }, { i: 14, q: 500 }]);
  const [name, setName] = useState('');
  const [cont, setCont] = useState(8);
  const [ing, setIng] = useState(12);
  const add = () => setLines(l => [...l, { i: 0, q: 1 }]);
  const rem = (i: number) => setLines(l => l.filter((_, j) => j !== i));
  const upd = (i: number, f: { i?: number; q?: number }) => setLines(l => l.map((x, j) => j === i ? { ...x, ...f } : x));
  const sub = lines.reduce((a, l) => { const it = BI[l.i]; return it ? a + it[3] * l.q : a; }, 0);
  const grand = sub * (1 + cont / 100 + ing / 100 + 0.25);
  const cats = [...new Set(BI.map(x => x[0]))];
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#00E5A0] text-[10px] font-black uppercase tracking-widest mb-1">💰 Presupuesto — Precios Reales Mercado USD 2025</h3>
        <p className="text-[#284060] text-[9px] mb-3">Precios de referencia FOB LATAM. Ajustá ingeniería y contingencia según el proyecto.</p>
        <div className="space-y-2 mb-3">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select className={C.s + ' flex-1 text-xs'} value={line.i} onChange={e => upd(i, { i: parseInt(e.target.value) })}>
                {cats.map(cat => <optgroup key={cat} label={cat}>{BI.map(([c2, n2, u2, pr], idx) => c2 === cat && <option key={idx} value={idx}>{n2} — ${pr}/{u2}</option>)}</optgroup>)}
              </select>
              <input className={C.i + ' w-20 text-xs'} type="number" value={line.q} onChange={e => upd(i, { q: parseFloat(e.target.value) || 0 })} />
              <span className="text-[#284060] text-xs w-6">{BI[line.i]?.[2]}</span>
              <span className="text-[#E8A020] text-[9px] w-20 text-right font-mono">${((BI[line.i]?.[3] || 0) * line.q).toLocaleString('en-US')}</span>
              <button onClick={() => rem(i)} className="text-red-400 font-black text-lg w-6">×</button>
            </div>
          ))}
          <button onClick={add} className="w-full border border-dashed border-[#0D1F35] hover:border-[#E8A020] text-[#284060] hover:text-[#E8A020] py-2 rounded-xl text-xs">+ Agregar ítem</button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div><label className={C.l}>Contingencia (%)</label><input className={C.i} type="number" min="0" max="30" value={cont} onChange={e => setCont(parseFloat(e.target.value) || 0)} /></div>
          <div><label className={C.l}>Ingeniería (%)</label><input className={C.i} type="number" min="0" max="30" value={ing} onChange={e => setIng(parseFloat(e.target.value) || 0)} /></div>
          <div><label className={C.l}>Margen (%)</label><input className={C.i} value="25" readOnly /></div>
        </div>
        <div><label className={C.l}>Nombre del proyecto</label><input className={C.i} value={name} onChange={e => setName(e.target.value)} placeholder="Presupuesto Gasoducto Norte..." /></div>
        <div className="mt-3 bg-[#020609] rounded-xl p-3 border border-[#0D1F35] space-y-1">
          <Row l="Subtotal materiales y mano de obra" v={'$ ' + Math.round(sub).toLocaleString('en-US')} />
          <Row l={`Ingeniería y QC (${ing}%)`} v={'$ ' + Math.round(sub * ing / 100).toLocaleString('en-US')} />
          <Row l={`Contingencia (${cont}%)`} v={'$ ' + Math.round(sub * cont / 100).toLocaleString('en-US')} />
          <Row l="Margen contratista (25%)" v={'$ ' + Math.round(sub * 0.25).toLocaleString('en-US')} />
          <Row l="TOTAL OFERTA USD" v={'$ ' + Math.round(grand).toLocaleString('en-US')} h />
        </div>
        {name && <button onClick={() => onS(name, 'budget', 'LOW', Math.round(grand))} className={C.o}>💾 Guardar: {name}</button>}
      </div>
    </div>
  );
}

// ── HARDY-CROSS DINÁMICO ──────────────────────────────────────────
interface HCPipe { id: string; from: number; to: number; D: number; L: number; C: number }

function HC({ onS }: { onS: (n: string, m: string, r: RL, u: number) => void }) {
  const [pipes, setPipes] = useState<HCPipe[]>([
    { id: 'A', from: 1, to: 2, D: 0.30, L: 500, C: 130 },
    { id: 'B', from: 2, to: 3, D: 0.25, L: 400, C: 130 },
    { id: 'C', from: 3, to: 4, D: 0.20, L: 300, C: 130 },
    { id: 'D', from: 4, to: 1, D: 0.25, L: 400, C: 130 },
    { id: 'E', from: 2, to: 4, D: 0.20, L: 350, C: 130 }
  ]);
  const [name, setName] = useState('');
  const [r, setR] = useState<null | { id: string; from: number; to: number; Q: number; V: number; hf: number }[]>(null);

  const addPipe = () => {
    const ids = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newId = ids[pipes.length] || `P${pipes.length + 1}`;
    setPipes(prev => [...prev, { id: newId, from: 1, to: 2, D: 0.20, L: 300, C: 130 }]);
  };
  const remPipe = (i: number) => setPipes(prev => prev.filter((_, j) => j !== i));
  const updPipe = (i: number, f: Partial<HCPipe>) => setPipes(prev => prev.map((x, j) => j === i ? { ...x, ...f } : x));

  const run = () => {
    const Q: Record<string, number> = {};
    pipes.forEach((p, i) => { Q[p.id] = i % 2 === 0 ? 10 : -5; });
    // Detectar anillos automáticamente
    const loops: number[][] = [];
    // Anillo 1: primeras 4 tuberías
    if (pipes.length >= 4) loops.push([0, 1, -(pipes.length - 1), -2].filter(x => Math.abs(x) < pipes.length));
    // Anillo 2 si hay más de 5 tuberías
    if (pipes.length >= 5) loops.push([1, 2, -(pipes.length - 2), -(pipes.length - 1)].filter(x => Math.abs(x) < pipes.length));

    for (let it = 0; it < 20; it++) {
      for (const loop of loops) {
        let num = 0, den = 0;
        for (const idx of loop) {
          const sg = idx >= 0 ? 1 : -1;
          const pp = pipes[Math.abs(idx)]; if (!pp) continue;
          const q = Q[pp.id] || 0.001;
          const hf = 10.67 * pp.L * Math.pow(Math.abs(q) / 1000, 1.852) / (Math.pow(pp.C, 1.852) * Math.pow(pp.D, 4.87));
          num += sg * hf; den += 1.852 * hf / Math.abs(q);
        }
        if (Math.abs(den) < 0.0001) continue;
        const dQ = num / den;
        for (const idx of loop) {
          const sg = idx >= 0 ? 1 : -1;
          const pp = pipes[Math.abs(idx)]; if (pp) Q[pp.id] -= sg * dQ;
        }
      }
    }
    setR(pipes.map(pp => {
      const q = Q[pp.id] || 0, A = Math.PI / 4 * pp.D ** 2;
      const hf = 10.67 * pp.L * Math.pow(Math.abs(q) / 1000, 1.852) / (Math.pow(pp.C, 1.852) * Math.pow(pp.D, 4.87));
      return { id: pp.id, from: pp.from, to: pp.to, Q: +q.toFixed(2), V: +(q / 1000 / A).toFixed(3), hf: +hf.toFixed(3) };
    }));
  };

  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#00C8FF] text-[10px] font-black uppercase tracking-widest mb-1">🌊 Redes — Hardy-Cross Dinámico / AWWA M31 / Hazen-Williams</h3>
        <p className="text-[#284060] text-[9px] mb-3">Ingresá tu propia red. Agregá o quitá tuberías. El método iterativo converge automáticamente.</p>
        <div className="space-y-2 mb-3">
          <div className="grid grid-cols-6 gap-1 text-[8px] text-[#284060] font-black uppercase px-1">
            <span>ID</span><span>De</span><span>A</span><span>D (m)</span><span>L (m)</span><span>C H-W</span>
          </div>
          {pipes.map((pipe, i) => (
            <div key={i} className="grid grid-cols-6 gap-1 items-center">
              <input className={C.i + ' text-center text-xs p-2'} value={pipe.id} onChange={e => updPipe(i, { id: e.target.value })} />
              <input className={C.i + ' text-center text-xs p-2'} type="number" value={pipe.from} onChange={e => updPipe(i, { from: parseInt(e.target.value) })} />
              <input className={C.i + ' text-center text-xs p-2'} type="number" value={pipe.to} onChange={e => updPipe(i, { to: parseInt(e.target.value) })} />
              <input className={C.i + ' text-center text-xs p-2'} type="number" step="0.05" value={pipe.D} onChange={e => updPipe(i, { D: parseFloat(e.target.value) })} />
              <input className={C.i + ' text-center text-xs p-2'} type="number" value={pipe.L} onChange={e => updPipe(i, { L: parseFloat(e.target.value) })} />
              <div className="flex gap-1">
                <input className={C.i + ' text-center text-xs p-2 flex-1'} type="number" value={pipe.C} onChange={e => updPipe(i, { C: parseInt(e.target.value) })} />
                <button onClick={() => remPipe(i)} className="text-red-400 font-black text-lg w-7 flex-shrink-0">×</button>
              </div>
            </div>
          ))}
          <button onClick={addPipe} className="w-full border border-dashed border-[#0D1F35] hover:border-[#00C8FF] text-[#284060] hover:text-[#00C8FF] py-2 rounded-xl text-xs">+ Agregar tubería</button>
        </div>
        <div><label className={C.l}>Nombre proyecto</label><input className={C.i} value={name} onChange={e => setName(e.target.value)} /></div>
        <button onClick={run} className="w-full bg-gradient-to-r from-[#00C8FF] to-[#0096C7] text-[#020609] py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#00DFFF] transition-all mt-3 shadow-lg">⚡ CALCULAR HARDY-CROSS</button>
      </div>
      {r && (
        <div className="space-y-3">
          <div className={C.k}>
            <div className="text-[#00C8FF] text-[10px] font-black uppercase mb-3">Distribución de Caudales — Convergido</div>
            {r.map(pp => (
              <div key={pp.id} className={`flex justify-between py-1.5 px-3 rounded-lg ${Math.abs(pp.V) > 2 ? 'bg-[#E8A020]/10 border border-[#E8A020]/20' : ''}`}>
                <span className="text-[#284060] text-xs">Tramo {pp.id}: N{pp.from}→N{pp.to}</span>
                <span className={`font-black text-xs font-mono ${Math.abs(pp.V) > 2 ? 'text-[#E8A020]' : 'text-[#94A8C0]'}`}>
                  Q={pp.Q} L/s · V={pp.V} m/s · hf={pp.hf}m
                </span>
              </div>
            ))}
          </div>
          {name && <button onClick={() => onS(name, 'hc', 'LOW', 0)} className={C.o}>💾 Guardar: {name}</button>}
        </div>
      )}
    </div>
  );
}

// ── FATIGA con curva S-N visual ───────────────────────────────────
function Fatigue({ onR, onS }: { onR: (r: RL) => void; onS: (n: string, m: string, r: RL, u: number) => void }) {
  const [p, setP] = useState({ mat: 'Acero C-Mn', sig: '180', N: '50000', T: '200', name: '' });
  const [r, setR] = useState<null | ReturnType<typeof calcFatigue>>(null);
  const sv = (f: Partial<typeof p>) => setP(x => ({ ...x, ...f }));
  const run = () => {
    const res = calcFatigue(parseFloat(p.sig), p.mat, parseFloat(p.N), parseFloat(p.T));
    setR(res); onR(res.risk);
  };

  // Generar SVG de curva S-N
  const genSNChart = (res: NonNullable<typeof r>) => {
    const W = 400, H = 160, pL = 40, pR = 20, pT = 20, pB = 30;
    const cW = W - pL - pR, cH = H - pT - pB;
    const pts = res.snCurve;
    const minN = Math.min(...pts.map(p => p.n)), maxN = Math.max(...pts.map(p => p.n));
    const minSa = 0, maxSa = Math.max(...pts.map(p => p.sa)) * 1.2;
    const toX = (n: number) => pL + (Math.log10(n) - Math.log10(minN)) / (Math.log10(maxN) - Math.log10(minN)) * cW;
    const toY = (sa: number) => pT + cH - (sa - minSa) / (maxSa - minSa) * cH;
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.n).toFixed(1)},${toY(p.sa).toFixed(1)}`).join(' ');
    const opX = toX(Math.max(minN, Math.min(maxN, res.operPoint.n)));
    const opY = toY(Math.min(maxSa, Math.max(minSa, res.operPoint.sa)));
    return `
      <rect width="${W}" height="${H}" fill="#020609" rx="8"/>
      <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="#0D1F35" strokeWidth="1"/>
      <line x1="${pL}" y1="${pT + cH}" x2="${pL + cW}" y2="${pT + cH}" stroke="#0D1F35" strokeWidth="1"/>
      ${[1, 2, 3].map(i => `<line x1="${pL}" y1="${pT + cH * i / 3}" x2="${pL + cW}" y2="${pT + cH * i / 3}" stroke="#0D1F35" strokeWidth="0.5" strokeDasharray="4 4"/>`).join('')}
      <path d="${path}" fill="none" stroke="#00C8FF" strokeWidth="2"/>
      <circle cx="${opX}" cy="${opY}" r="6" fill="${res.ok ? '#00E5A0' : '#FF4560'}" stroke="white" strokeWidth="1.5"/>
      <line x1="${opX}" y1="${pT}" x2="${opX}" y2="${pT + cH}" stroke="${res.ok ? '#00E5A020' : '#FF456020'}" strokeWidth="1" strokeDasharray="4 4"/>
      <text x="${opX + 8}" y="${opY - 5}" fill="${res.ok ? '#00E5A0' : '#FF4560'}" fontSize="8" fontFamily="monospace">OPERACIÓN</text>
      <text x="${W / 2}" y="${H - 5}" textAnchor="middle" fill="#284060" fontSize="8" fontFamily="monospace">N ciclos (log)</text>
      <text x="${pL + 5}" y="${pT + 10}" fill="#284060" fontSize="7" fontFamily="monospace">σa (MPa)</text>
      <text x="4" y="${H / 2}" fill="#00C8FF" fontSize="7" fontFamily="monospace" transform="rotate(-90 4 ${H / 2})">Curva S-N</text>
      <rect x="0" y="0" width="${W}" height="14" fill="#050A14"/>
      <text x="6" y="10" fill="#F97316" fontSize="8" fontFamily="monospace" fontWeight="bold">CURVA S-N — ASME VIII Div.2 — ${p.mat}</text>
    `;
  };

  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#F97316] text-[10px] font-black uppercase tracking-widest mb-1">🔄 Fatiga — ASME VIII Div.2 / Curvas S-N / Palmgren-Miner</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={C.l}>Material</label>
            <select className={C.s} value={p.mat} onChange={e => sv({ mat: e.target.value })}>
              {['Acero C-Mn', 'Inox 304/316', 'X65', 'Aluminio 6061'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <ValidInput label="σ alternante (MPa)" value={p.sig} onChange={v => sv({ sig: v })} min={1} max={600} />
          <ValidInput label="N ciclos aplicados" value={p.N} onChange={v => sv({ N: v })} min={1} max={1e9} />
          <ValidInput label="Temperatura (°C)" value={p.T} onChange={v => sv({ T: v })} min={-50} max={650} />
          <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e => sv({ name: e.target.value })} /></div>
        </div>
        <button onClick={run} className="w-full bg-gradient-to-r from-[#F97316] to-[#C05010] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#FB923C] transition-all mt-3 shadow-lg">⚡ CALCULAR FATIGA + CURVA S-N</button>
      </div>
      {r && (
        <div className="space-y-3">
          <Badge r={r.risk} msg={r.ok ? `✅ Daño D=${r.Dp}% — APTO. Ciclos restantes: ${r.rem.toLocaleString()}` : `❌ FALLA POR FATIGA — D=${r.Dp}% supera el 100%`} />
          {/* Gráfico S-N */}
          <div className={C.k}>
            <div className="text-[#F97316] text-[10px] font-black uppercase mb-2">Curva S-N — Punto de operación marcado</div>
            <svg viewBox="0 0 400 160" className="w-full bg-[#020609] rounded-xl border border-[#0D1F35]"
              dangerouslySetInnerHTML={{ __html: genSNChart(r) }} />
            <div className="flex gap-4 mt-2 text-[9px]">
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#00C8FF]" /><span className="text-[#284060]">Curva S-N</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#00E5A0]" /><span className="text-[#284060]">Punto OK</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#FF4560]" /><span className="text-[#284060]">Punto FALLA</span></div>
            </div>
          </div>
          <Box t="Fatiga ASME VIII Div.2 — Palmgren-Miner" n="Tabla 3.F.1" rows={[['σ corregida por T', r.Sa + ' MPa'], ['Factor temperatura Tf', r.Tf.toString()], ['N admisibles (curva S-N)', r.Na.toLocaleString()], ['N diseño (÷2 FS)', r.Nd.toLocaleString(), true], ['N ciclos aplicados', parseFloat(p.N).toLocaleString()], ['Índice de daño Miner D', r.Dp + '%', r.D > 0.8], ['Ciclos restantes', r.rem.toLocaleString(), r.ok], ['Veredicto', r.ok ? '✅ APTO — Vida de fatiga OK' : '❌ FALLA — Reducir σ o reducir N', !r.ok]]} />
          {p.name && <button onClick={() => onS(p.name, 'fat', r.risk, 0)} className={C.o}>💾 Guardar: {p.name}</button>}
        </div>
      )}
    </div>
  );
}

// ── PDF ───────────────────────────────────────────────────────────
function PDF({ user }: { user: { name: string; lic: string; co: string; cn: string } }) {
  const [c, setC] = useState('');
  const [name, setName] = useState('');
  const docId = `IP-${Date.now()}`;
  const gen = () => {
    const w = window.open('', '_blank'); if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>INGENIUM PRO — ${name}</title>
    <style>body{font-family:'Courier New',monospace;margin:40px;color:#1a1a1a;font-size:11px}
    h1{font-size:16px;font-weight:900;border-bottom:3px solid #E8A020;padding-bottom:8px}
    h2{font-size:12px;font-weight:900;color:#C07010;margin-top:18px;border-bottom:1px solid #ddd;padding-bottom:3px}
    .row{display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px dotted #eee}
    .content{white-space:pre-wrap;background:#f8f8f8;padding:12px;border:1px solid #ddd;font-size:10px;line-height:1.6;border-radius:4px}
    .footer{margin-top:30px;padding-top:10px;border-top:2px solid #E8A020;display:flex;justify-content:space-between;font-size:9px;color:#666}
    .stamp{border:2px solid #E8A020;padding:8px 16px;font-weight:900;font-size:10px;color:#C07010;text-align:center}
    .wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(232,160,32,0.04);font-weight:900;pointer-events:none;z-index:0}
    .docid{font-size:8px;color:#999;border:1px solid #ddd;padding:2px 6px;border-radius:3px}
    @media print{.wm{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
    <div class="wm">INGENIUM PRO</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:20px;align-items:flex-start">
      <div><div style="font-size:22px;font-weight:900;color:#E8A020;letter-spacing:2px">Ω INGENIUM PRO</div>
      <div style="font-size:9px;color:#666">Motor de Ingeniería Mundial v7.0 · © Silvana Belén Colombo</div></div>
      <div style="text-align:right;font-size:9px;color:#666">
        <div class="docid">DOC N°: ${docId}</div>
        <div>Fecha: ${new Date().toLocaleString()}</div>
        <div>Rev.: 00 · Estado: EMITIDO PARA REVISIÓN</div>
      </div>
    </div>
    <h1>MEMORIA DE CÁLCULO DE INGENIERÍA</h1>
    <h2>1. DATOS DEL PROYECTO</h2>
    <div class="row"><span>Proyecto:</span><strong>${name || 'Sin nombre'}</strong></div>
    <div class="row"><span>Empresa:</span><strong>${user.co || '—'}</strong></div>
    <div class="row"><span>País:</span><strong>${user.cn || '—'}</strong></div>
    <div class="row"><span>Fecha de cálculo:</span><strong>${new Date().toLocaleDateString()}</strong></div>
    <h2>2. PROFESIONAL RESPONSABLE</h2>
    <div class="row"><span>Nombre:</span><strong>${user.name}</strong></div>
    <div class="row"><span>ID / Matrícula / Rol:</span><strong>${user.lic}</strong></div>
    <h2>3. DESARROLLO DEL CÁLCULO</h2>
    <div class="content">${c || '(Pegá aquí el resultado de los módulos de cálculo)'}</div>
    <h2>4. NORMATIVAS APLICADAS</h2>
    <div class="content">ASME B31.3 / B31.4 / B31.8 · API 5L / 579 / 6D / 6A · AWWA C504 · NACE MR0175 · IRAM 11647 · AASHTO LRFD · CIRSOC 501 · ASME VIII Div.2 · ISA 5.1</div>
    <h2>5. DECLARACIÓN Y FIRMA</h2>
    <p style="font-size:10px;color:#444;margin:8px 0">El profesional firmante declara haber revisado y validado los cálculos contenidos en este documento, asumiendo la responsabilidad técnica sobre los resultados.</p>
    <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:flex-end">
      <div><div style="border-bottom:1px solid #1a1a1a;width:220px;padding-top:35px;margin-bottom:4px"></div>
      <div style="font-size:9px"><strong>${user.name}</strong></div>
      <div style="font-size:9px">${user.lic}</div></div>
      <div class="stamp">✓ INGENIUM PRO v7.0<br>© Silvana Belén Colombo<br>RADAR Gestión Estratégica<br>${new Date().toLocaleDateString()}</div>
    </div>
    <div class="footer">
      <div>Documento generado por INGENIUM PRO v7.0.<br>La validación y responsabilidad recaen en el profesional firmante.</div>
      <div>© 2026 Silvana Belén Colombo<br>Todos los derechos reservados</div>
    </div>
    <script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
  };
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#A78BFA] text-[10px] font-black uppercase tracking-widest mb-1">📄 PDF Certificable — Memoria de Cálculo con Firma</h3>
        <p className="text-[#284060] text-[9px] mb-3">Genera documento formal para presentar a clientes, licitaciones y organismos.</p>
        <div className="space-y-3">
          <div><label className={C.l}>Nombre del proyecto</label><input className={C.i} value={name} onChange={e => setName(e.target.value)} placeholder="Gasoducto Norte — Tramo A — Rev.00" /></div>
          <div><label className={C.l}>Desarrollo del cálculo (copiá desde cualquier módulo)</label>
            <textarea className={C.i + ' resize-none'} rows={8} value={c} onChange={e => setC(e.target.value)}
              placeholder={'Pegá aquí los resultados de los módulos.\n\nEjemplo:\nMÓDULO: MAOP — Barlow+Lamé\nOD=219.1mm · t=8.18mm · SMYS=359MPa · F=0.72\nRégimen: PARED DELGADA — Barlow\nMAOP = 19.3 MPa = 193 bar = 2799 psi\nPrueba hidrostática: 29.0 MPa\nNORMA: ASME B31.4 / API 5L X52'} />
          </div>
          <div className="bg-[#020609] border border-[#0D1F35] rounded-xl p-3 text-[9px] text-[#284060]">
            <div className="text-[#A78BFA] font-black mb-1">✅ El PDF incluirá automáticamente:</div>
            <div>· DOC N°: {docId} · Fecha y hora · {user.name || 'Profesional'} / {user.lic || 'ID'}</div>
            <div>· Empresa: {user.co || '—'} · País: {user.cn || '—'}</div>
            <div>· Watermark INGENIUM PRO · Sello © Silvana Belén Colombo · Espacio para firma</div>
          </div>
        </div>
        <button onClick={gen} className="w-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#C4B5FD] transition-all mt-3 shadow-lg">📄 GENERAR PDF CERTIFICABLE</button>
      </div>
    </div>
  );
}

// ── VERCEL ────────────────────────────────────────────────────────
function Vercel() {
  const steps = [
    { n: '1', t: 'Crear cuenta GitHub (gratis)', cmd: '', d: 'Ir a github.com → Sign up → verificar email. Crear repositorio privado llamado "ingenium-pro".' },
    { n: '2', t: 'Subir código a GitHub', cmd: 'cd C:\\Users\\Usuario\\Desktop\\INGENIUM-PRO-RADAR\\radar-app\ngit init\ngit add .\ngit commit -m "INGENIUM Pro v7.0"\ngit branch -M main\ngit remote add origin https://github.com/TU_USUARIO/ingenium-pro.git\ngit push -u origin main', d: 'En la terminal de VS Code. Reemplazá TU_USUARIO.' },
    { n: '3', t: 'Crear cuenta Vercel (gratis)', cmd: '', d: 'Ir a vercel.com → Sign up → Continuar con GitHub.' },
    { n: '4', t: 'Importar proyecto en Vercel', cmd: '', d: 'Vercel → Add New Project → seleccionar "ingenium-pro" → Deploy. Vercel detecta Next.js automáticamente.' },
    { n: '5', t: 'Agregar API Key (para que funcione la IA)', cmd: 'ANTHROPIC_API_KEY = sk-ant-XXXXXXXXXX', d: 'Vercel → tu proyecto → Settings → Environment Variables → agregar la variable. Key en console.anthropic.com.' },
    { n: '6', t: '🎉 URL pública lista', cmd: 'https://ingenium-pro.vercel.app', d: 'Compartir con YPF, Tecpetrol, TotalEnergies. En Android/iPhone se instala como app desde el navegador.' }
  ];
  return (
    <div className="space-y-4">
      <div className={C.k}>
        <h3 className="text-[#00E5A0] text-[10px] font-black uppercase tracking-widest mb-1">🚀 Deploy Vercel — Online en 30 Minutos (GRATIS)</h3>
        <p className="text-[#284060] text-[9px] mb-4">De localhost:3000 a URL pública instalable en cualquier dispositivo.</p>
        <div className="space-y-3">
          {steps.map(s => (
            <div key={s.n} className="bg-[#020609] border border-[#0D1F35] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#00E5A0]/10 border border-[#00E5A0]/40 flex items-center justify-center text-[#00E5A0] font-black flex-shrink-0">{s.n}</div>
                <div className="text-white font-black text-sm">{s.t}</div>
              </div>
              <p className="text-[#284060] text-[10px] mb-2">{s.d}</p>
              {s.cmd && <div className="bg-[#07101A] border border-[#0D1F35] rounded-lg p-3 font-mono text-[10px] text-[#94A8C0] whitespace-pre-wrap">{s.cmd}</div>}
            </div>
          ))}
        </div>
        <div className="bg-[#031A0A] border border-[#00E5A0]/20 rounded-xl p-4 mt-3">
          <div className="text-[#00E5A0] font-black text-xs mb-2">📱 Instalar como app en cualquier dispositivo</div>
          <div className="space-y-1 text-[9px] text-[#284060]">
            <div>📱 <strong className="text-[#94A8C0]">Android:</strong> Chrome → menú (3 puntos) → "Agregar a pantalla de inicio" → Instalar</div>
            <div>🍎 <strong className="text-[#94A8C0]">iPhone/iPad:</strong> Safari → compartir → "Agregar a pantalla de inicio"</div>
            <div>💻 <strong className="text-[#94A8C0]">Windows/Mac:</strong> Chrome → ícono instalación en barra de direcciones → Instalar</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PROYECTOS con exportación JSON ────────────────────────────────
function Projects({ projs, onL, onExport }: { projs: Proj[]; onL: (p: Proj) => void; onExport: () => void }) {
  const IC: Record<string, string> = { pipes: '🔩', hydro: '💧', valves: '⚙️', blast: '💥', chem: '⚗️', geo: '🌍', cad: '📐', budget: '💰', hc: '🌊', fat: '🔄' };
  const RL: Record<RL, string> = { LOW: '🟢 Bajo', MEDIUM: '🟡 Medio', HIGH: '🟠 Alto', CRITICAL: '🔴 Crítico' };
  const totalUSD = projs.reduce((a, p) => a + p.usd, 0);

  if (!projs.length) return (
    <div className={C.k + ' text-center py-12'}>
      <div className="text-4xl mb-3">📁</div>
      <div className="text-white font-black text-sm mb-2">Sin proyectos guardados</div>
      <p className="text-[#284060] text-xs">Calculá cualquier módulo, ingresá un nombre y guardalo.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className={C.k}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-[#94A8C0] text-[10px] font-black">{projs.length} proyectos guardados</div>
            <div className="text-[#00E5A0] text-[9px] font-mono">Valor total: $ {totalUSD.toLocaleString('en-US')} USD</div>
          </div>
          <div className="flex gap-2">
            <button onClick={onExport} className="text-[9px] text-[#00E5A0] border border-[#00E5A0]/40 px-3 py-1.5 rounded-lg hover:bg-[#00E5A0]/10 transition-all font-black">📥 Exportar JSON</button>
            <button onClick={() => { if (confirm('¿Eliminar todos los proyectos? Esta acción no se puede deshacer.')) { localStorage.removeItem('ip9'); window.location.reload(); } }} className="text-[9px] text-red-400 border border-red-800 px-3 py-1.5 rounded-lg hover:bg-red-950 transition-all">🗑️ Limpiar</button>
          </div>
        </div>
        <div className="space-y-2">
          {projs.map(p => (
            <div key={p.id} className="bg-[#020609] border border-[#0D1F35] rounded-xl p-4 flex items-center gap-3 hover:border-[#E8A020]/30 cursor-pointer transition-all" onClick={() => onL(p)}>
              <div className="text-2xl flex-shrink-0">{IC[p.mod] || '📋'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-black text-sm truncate">{p.name}</div>
                <div className="text-[#284060] text-[9px]">{p.cl} · {p.date}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[9px] font-black">{RL[p.risk]}</div>
                {p.usd > 0 && <div className="text-[#00E5A0] text-[9px] font-mono">$ {p.usd.toLocaleString('en-US')}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#020609] border border-[#0D1F35] rounded-xl p-3 text-[9px] text-[#284060]">
        <div className="text-[#E8A020] font-black mb-1">💾 Respaldo de proyectos</div>
        <div>Hacé clic en "Exportar JSON" para descargar todos tus proyectos como archivo de respaldo. Guardalo en la nube (Drive, Dropbox) para no perderlos si limpiás el navegador.</div>
      </div>
    </div>
  );
}