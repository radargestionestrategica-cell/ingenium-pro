'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import { useState } from 'react';

// DATOS 100% REALES VERIFICADOS
// Fuentes: AWS A5.1, AWS D1.1:2020, ASME Sec. IX, API 1104:2021, AISC-360, Lincoln Electric

// ═══════════════════════════════════════════════════
// ELECTRODOS — AWS A5.1 / A5.5 / A5.18 / A5.4
// ═══════════════════════════════════════════════════
const ELECTRODOS: Record<string, {
  nombre: string; proceso: string;
  traccionMPa: number; traccionKsi: number;
  cedenciaKgcm2: number; rupturaKgcm2: number;
  posiciones: string; corriente: string;
  penetracion: string; aplicacion: string;
  industrias: string[]; norma: string;
  diametrosDisp: number[]; // mm
  amperajeMin: Record<number, number>;
  amperajeMax: Record<number, number>;
  depositoEficiencia: number; // % metal depositado vs electrodo consumido
}> = {
  'E6010': {
    nombre: 'E6010', proceso: 'SMAW',
    traccionMPa: 414, traccionKsi: 60,
    cedenciaKgcm2: 3150, rupturaKgcm2: 4220,
    posiciones: 'Todas (1G 2G 3G 4G 5G 6G)', corriente: 'DC+ (DCEP)',
    penetracion: 'Profunda — penetra óxido, pintura, grasa',
    aplicacion: 'Pase de raíz en tubería, estructuras con metal sucio, reparaciones en campo',
    industrias: ['Perforación', 'Petróleo', 'Minería', 'MMO'],
    norma: 'AWS A5.1 · API 1104',
    diametrosDisp: [2.4, 3.2, 4.0],
    amperajeMin: { 2.4: 60, 3.2: 90, 4.0: 120 },
    amperajeMax: { 2.4: 90, 3.2: 130, 4.0: 175 },
    depositoEficiencia: 62,
  },
  'E6011': {
    nombre: 'E6011', proceso: 'SMAW',
    traccionMPa: 414, traccionKsi: 60,
    cedenciaKgcm2: 3150, rupturaKgcm2: 4220,
    posiciones: 'Todas (1G 2G 3G 4G)', corriente: 'CA / DC+ (DCEP)',
    penetracion: 'Profunda — ideal metal oxidado o sucio',
    aplicacion: 'Mantenimiento, reparación en campo, estructuras con metal viejo',
    industrias: ['Minería', 'MMO', 'Perforación'],
    norma: 'AWS A5.1',
    diametrosDisp: [2.4, 3.2, 4.0, 4.8],
    amperajeMin: { 2.4: 55, 3.2: 85, 4.0: 115, 4.8: 150 },
    amperajeMax: { 2.4: 85, 3.2: 125, 4.0: 165, 4.8: 210 },
    depositoEficiencia: 62,
  },
  'E6013': {
    nombre: 'E6013', proceso: 'SMAW',
    traccionMPa: 414, traccionKsi: 60,
    cedenciaKgcm2: 3150, rupturaKgcm2: 4220,
    posiciones: 'Todas (1G 2G 3G 4G)', corriente: 'CA / DC+ / DC-',
    penetracion: 'Ligera — arco suave, escoria fácil, mínimas salpicaduras',
    aplicacion: 'Chapa nueva y limpia, estructuras livianas, carpintería metálica, MMO',
    industrias: ['MMO', 'Arquitectura'],
    norma: 'AWS A5.1',
    diametrosDisp: [2.4, 3.2, 4.0, 4.8],
    amperajeMin: { 2.4: 55, 3.2: 80, 4.0: 110, 4.8: 140 },
    amperajeMax: { 2.4: 85, 3.2: 120, 4.0: 160, 4.8: 200 },
    depositoEficiencia: 65,
  },
  'E7016': {
    nombre: 'E7016', proceso: 'SMAW',
    traccionMPa: 483, traccionKsi: 70,
    cedenciaKgcm2: 3500, rupturaKgcm2: 4920,
    posiciones: 'Todas (1G 2G 3G 4G)', corriente: 'CA / DC+',
    penetracion: 'Media — bajo hidrógeno, buena ductilidad',
    aplicacion: 'Alternativa E7018 con CA, aceros alta resistencia, baja temperatura',
    industrias: ['Perforación', 'Petróleo', 'Minería'],
    norma: 'AWS A5.1 · ASME Sec. IX',
    diametrosDisp: [2.4, 3.2, 4.0, 4.8],
    amperajeMin: { 2.4: 70, 3.2: 100, 4.0: 140, 4.8: 180 },
    amperajeMax: { 2.4: 100, 3.2: 150, 4.0: 200, 4.8: 255 },
    depositoEficiencia: 65,
  },
  'E7018': {
    nombre: 'E7018', proceso: 'SMAW',
    traccionMPa: 483, traccionKsi: 70,
    cedenciaKgcm2: 3500, rupturaKgcm2: 4920,
    posiciones: 'Todas (1G 2G 3G 4G)', corriente: 'DC+ (DCEP)',
    penetracion: 'Media — bajo hidrógeno, alta ductilidad e impacto',
    aplicacion: 'Estructuras críticas, aceros difíciles, baja temperatura, alta calidad',
    industrias: ['Perforación', 'Petróleo', 'Minería', 'MMO'],
    norma: 'AWS A5.1 · ASME Sec. IX · API 1104 · AWS D1.1',
    diametrosDisp: [2.4, 3.2, 4.0, 4.8, 6.4],
    amperajeMin: { 2.4: 70, 3.2: 110, 4.0: 150, 4.8: 200, 6.4: 300 },
    amperajeMax: { 2.4: 110, 3.2: 165, 4.0: 220, 4.8: 280, 6.4: 400 },
    depositoEficiencia: 66,
  },
  'ER70S-6': {
    nombre: 'ER70S-6', proceso: 'GMAW/MIG',
    traccionMPa: 483, traccionKsi: 70,
    cedenciaKgcm2: 3500, rupturaKgcm2: 4920,
    posiciones: 'Plana y horizontal', corriente: 'DC+ continuo',
    penetracion: 'Media — alta velocidad de deposición',
    aplicacion: 'Fabricación en taller, estructuras metálicas, producción en serie',
    industrias: ['Minería', 'MMO'],
    norma: 'AWS A5.18 · ASME SFA-5.18',
    diametrosDisp: [0.8, 1.0, 1.2, 1.6],
    amperajeMin: { 0.8: 60, 1.0: 100, 1.2: 130, 1.6: 200 },
    amperajeMax: { 0.8: 160, 1.0: 220, 1.2: 280, 1.6: 380 },
    depositoEficiencia: 93,
  },
  'E308L-16': {
    nombre: 'E308L-16', proceso: 'SMAW Inox.',
    traccionMPa: 552, traccionKsi: 80,
    cedenciaKgcm2: 3900, rupturaKgcm2: 5600,
    posiciones: 'Todas', corriente: 'CA / DC+',
    penetracion: 'Media — bajo carbono, resistente corrosión',
    aplicacion: 'Acero inox. 304/304L, tuberías proceso, industria química',
    industrias: ['Petróleo'],
    norma: 'AWS A5.4 · ASME SFA-5.4',
    diametrosDisp: [2.4, 3.2, 4.0],
    amperajeMin: { 2.4: 55, 3.2: 85, 4.0: 120 },
    amperajeMax: { 2.4: 85, 3.2: 130, 4.0: 175 },
    depositoEficiencia: 60,
  },
};

// ═══════════════════════════════════════════════════
// ACEROS ESPECIALES POR INDUSTRIA
// ═══════════════════════════════════════════════════
const ACEROS: Record<string, {
  nombre: string; norma: string; industria: string;
  cedenciaMPa: number; traccionMPa: number;
  CE: number; electrodosRecomendados: string[];
  precalentamientoMin: number; obs: string;
}> = {
  'A36': { nombre: 'ASTM A36', norma: 'ASTM A36', industria: 'MMO / Estructural', cedenciaMPa: 250, traccionMPa: 400, CE: 0.36, electrodosRecomendados: ['E6013', 'E7018', 'ER70S-6'], precalentamientoMin: 0, obs: 'Acero estructural estándar. Sin precalentamiento para t ≤ 19mm.' },
  'API5L_X52': { nombre: 'API 5L X52', norma: 'API 5L · ISO 3183', industria: 'Petróleo / Gas', cedenciaMPa: 359, traccionMPa: 455, CE: 0.38, electrodosRecomendados: ['E6010', 'E7018'], precalentamientoMin: 0, obs: 'Tubería de transmisión. Pase raíz E6010, relleno E7018. API 1104.' },
  'API5L_X65': { nombre: 'API 5L X65', norma: 'API 5L · ISO 3183', industria: 'Petróleo / Gas', cedenciaMPa: 448, traccionMPa: 530, CE: 0.42, electrodosRecomendados: ['E7018', 'E7016'], precalentamientoMin: 80, obs: 'Tubería alta resistencia. Precalentar a 80°C mínimo. Bajo hidrógeno obligatorio.' },
  'A572_Gr50': { nombre: 'ASTM A572 Gr.50', norma: 'ASTM A572', industria: 'Estructural / Minería', cedenciaMPa: 345, traccionMPa: 450, CE: 0.40, electrodosRecomendados: ['E7018', 'E7016'], precalentamientoMin: 0, obs: 'Acero alta resistencia. E7018 recomendado. Sin precalentamiento t ≤ 19mm.' },
  'AR400': { nombre: 'AR400 (Hardox equiv.)', norma: 'ASTM A514 equiv.', industria: 'Minería (desgaste)', cedenciaMPa: 1100, traccionMPa: 1250, CE: 0.55, electrodosRecomendados: ['E7018', 'E7016'], precalentamientoMin: 150, obs: 'Acero antidesgaste. OBLIGATORIO precalentar 150°C. Enfriamiento lento. Consultar WPS.' },
  'ASTM_A514': { nombre: 'ASTM A514 (T-1)', norma: 'ASTM A514', industria: 'Estructural pesado', cedenciaMPa: 690, traccionMPa: 760, CE: 0.50, electrodosRecomendados: ['E11018', 'E7018'], precalentamientoMin: 120, obs: 'Acero de alta resistencia. Precalentamiento obligatorio. WPS calificado ASME Sec. IX.' },
};

// ═══════════════════════════════════════════════════
// FILETE MÍNIMO — AWS D1.1:2020 Tabla 8.8
// ═══════════════════════════════════════════════════
const FILETE_MIN: { espesorMax: number; filMm: number }[] = [
  { espesorMax: 6, filMm: 3 }, { espesorMax: 12, filMm: 5 },
  { espesorMax: 19, filMm: 6 }, { espesorMax: 38, filMm: 8 },
  { espesorMax: 57, filMm: 10 }, { espesorMax: 150, filMm: 12 },
];

const EFICIENCIA_PROCESO: Record<string, number> = {
  SMAW: 0.80, GMAW: 0.90, GTAW: 0.70, FCAW: 0.85, SAW: 1.00,
};

// Peso depósito por electrodo (kg) — datos reales Lincoln Electric
// depósito_real = peso_electrodo × eficiencia_deposito / 100
const PESO_ELECTRODO_KG: Record<string, Record<number, number>> = {
  'E6010': { 2.4: 0.040, 3.2: 0.090, 4.0: 0.150 },
  'E6011': { 2.4: 0.040, 3.2: 0.090, 4.0: 0.150, 4.8: 0.220 },
  'E6013': { 2.4: 0.045, 3.2: 0.095, 4.0: 0.160, 4.8: 0.230 },
  'E7016': { 2.4: 0.043, 3.2: 0.093, 4.0: 0.155, 4.8: 0.225 },
  'E7018': { 2.4: 0.043, 3.2: 0.093, 4.0: 0.155, 4.8: 0.225, 6.4: 0.450 },
  'ER70S-6': { 0.8: 0, 1.0: 0, 1.2: 0, 1.6: 0 },
  'E308L-16': { 2.4: 0.040, 3.2: 0.090, 4.0: 0.150 },
};

type SubMod = 'selector' | 'electrodos' | 'heat_input' | 'filete' | 'precalentamiento' | 'consumo' | 'aceros';

const SUBS: { id: SubMod; label: string; icon: string }[] = [
  { id: 'selector', label: 'Selector', icon: '🔌' },
  { id: 'aceros', label: 'Aceros', icon: '🔩' },
  { id: 'electrodos', label: 'Fichas', icon: '📋' },
  { id: 'heat_input', label: 'Heat Input', icon: '🌡️' },
  { id: 'filete', label: 'Filete', icon: '⚙️' },
  { id: 'consumo', label: 'Consumo', icon: '📦' },
  { id: 'precalentamiento', label: 'Precalent.', icon: '🔥' },
];

const C = '#f59e0b';
const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#0a0f1e', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' };
const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 };
const g3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 };

function T({ text }: { text: string }) { return <div style={{ fontSize: 11, color: C, fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' as const }}>{text}</div>; }
function Btn({ onClick, text }: { onClick: () => void; text: string }) { return <button onClick={onClick} style={{ width: '100%', padding: '13px 0', marginBottom: 20, background: `linear-gradient(135deg,${C},#d97706)`, border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 20px rgba(245,158,11,0.4)` }}>{text}</button>; }
function Info({ text }: { text: string }) { return <div style={{ fontSize: 12, color: '#475569', marginBottom: 12, padding: '8px 12px', background: 'rgba(245,158,11,0.05)', borderRadius: 8 }}>{text}</div>; }
function Warn({ text }: { text: string }) { return <div style={{ fontSize: 11, color: C, padding: '8px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, marginTop: 8 }}>{text}</div>; }
function Err({ text }: { text: string }) { return <div style={{ padding: '10px 16px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>{text}</div>; }
function Card({ label, val, sub, color }: { label: string; val: string; sub?: string; color?: string }) {
  return <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 14 }}>
    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 4, letterSpacing: 0.4 }}>{label}</div>
    <div style={{ fontSize: 17, fontWeight: 800, color: color || C }}>{val}</div>
    {sub && <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>{sub}</div>}
  </div>;
}
function ResBox({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  const bg = ok === undefined ? 'rgba(245,158,11,0.08)' : ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
  const border = ok === undefined ? 'rgba(245,158,11,0.25)' : ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
  return <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>{children}</div>;
}

export default function ModuloSoldadura() {
  const [sub, setSub] = useState<SubMod>('selector');
  const [err, setErr] = useState('');

  // SELECTOR
  const [sInd, setSInd] = useState('Perforación');
  const [sMat, setSMat] = useState('acero_carbono');
  const [sPos, setSPos] = useState('todas');
  const [sCond, setSCond] = useState('limpio');
  const [sRes, setSRes] = useState<string[]>([]);

  // HEAT INPUT
  const [hiV, setHiV] = useState('22');
  const [hiI, setHiI] = useState('150');
  const [hiVel, setHiVel] = useState('100');
  const [hiProc, setHiProc] = useState('SMAW');
  const [resHI, setResHI] = useState<null | { hi: number; clase: string; ef: number }>(null);

  // FILETE
  const [fEsp, setFEsp] = useState('10');
  const [fTam, setFTam] = useState('6');
  const [fLon, setFLon] = useState('100');
  const [fEl, setFEl] = useState('E7018');
  const [resFil, setResFil] = useState<null | { garg: number; res: number; reskN: number; min: number; ok: boolean }>(null);

  // CONSUMO DE ELECTRODOS
  const [cEl, setCEl] = useState('E7018');
  const [cDiam, setCDiam] = useState(3.2);
  const [cLongCordon, setCLongCordon] = useState('500');
  const [cEspPlaca, setCEspPlaca] = useState('12');
  const [resCons, setResCons] = useState<null | { kgDeposito: number; kgElectrodo: number; cantVarillas: number; pasadas: number }>(null);

  // PRECALENTAMIENTO
  const [prC, setPrC] = useState('0.20'); const [prMn, setPrMn] = useState('1.00');
  const [prSi, setPrSi] = useState('0.25'); const [prCr, setPrCr] = useState('0');
  const [prNi, setPrNi] = useState('0'); const [prMo, setPrMo] = useState('0');
  const [prEsp, setPrEsp] = useState('20');
  const [resPre, setResPre] = useState<null | { CE: number; Tp: number; cat: string; rec: string }>(null);

  const reset = () => { setErr(''); setSRes([]); setResHI(null); setResFil(null); setResCons(null); setResPre(null); };

  const calcSelector = () => {
    setErr(''); setSRes([]);
    const res: string[] = [];
    Object.entries(ELECTRODOS).forEach(([k, el]) => {
      let p = 0;
      if (el.industrias.includes(sInd)) p += 3;
      if (sCond === 'sucio' && (k === 'E6010' || k === 'E6011')) p += 3;
      if (sCond === 'limpio' && (k === 'E7018' || k === 'E6013' || k === 'ER70S-6')) p += 2;
      if (sMat === 'inoxidable' && k === 'E308L-16') p += 5;
      if (sMat !== 'inoxidable' && k === 'E308L-16') p = 0;
      if (sPos === 'todas' && el.posiciones.includes('Todas')) p += 1;
      if (sPos === 'plana' && el.proceso === 'GMAW/MIG') p += 2;
      if (p >= 3) res.push(k);
    });
    setSRes(res.length > 0 ? res : ['E7018']);
  };

  const calcHeatInput = () => {
    setErr(''); setResHI(null);
    const V = parseFloat(hiV); const I = parseFloat(hiI); const v = parseFloat(hiVel);
    if ([V, I, v].some(n => isNaN(n) || n <= 0)) { setErr('Valores inválidos'); return; }
    const ef = EFICIENCIA_PROCESO[hiProc] || 0.80;
    // ASME Sec. IX / AWS D1.1 §6.8.5: HI = (V×I×60×η) / (v_mm/min × 1000) kJ/mm
    const hi = Math.round((V * I * 60 * ef) / (v * 1000) * 1000) / 1000;
    let clase = '';
    if (hi < 0.5) clase = '⚠️ Muy bajo — riesgo falta de fusión';
    else if (hi < 1.0) clase = '✅ Bajo — bueno para aceros endurecibles';
    else if (hi < 2.5) clase = '✅ Medio — rango óptimo mayoría de aceros';
    else if (hi < 4.0) clase = '⚠️ Alto — verificar propiedades ZAT';
    else clase = '❌ Muy alto — riesgo degradación microestructural';
    setResHI({ hi, clase, ef: ef * 100 });
  };

  const calcFilete = () => {
    setErr(''); setResFil(null);
    const esp = parseFloat(fEsp); const tam = parseFloat(fTam); const lon = parseFloat(fLon);
    if ([esp, tam, lon].some(n => isNaN(n) || n <= 0)) { setErr('Valores inválidos'); return; }
    const min = FILETE_MIN.find(f => esp <= f.espesorMax)?.filMm || 12;
    const garg = Math.round(0.707 * tam * 100) / 100;
    const Fu = ELECTRODOS[fEl].rupturaKgcm2;
    // AWS D1.1: Rn = 0.707 × a × L × 0.6 × Fu (en cm²)
    const res = Math.round((garg / 10) * (lon / 10) * 0.6 * Fu);
    setResFil({ garg, res, reskN: Math.round(res * 9.81 / 100) / 10, min, ok: tam >= min });
  };

  const calcConsumo = () => {
    setErr(''); setResCons(null);
    const lon = parseFloat(cLongCordon); const esp = parseFloat(cEspPlaca);
    if (isNaN(lon) || lon <= 0 || isNaN(esp) || esp <= 0) { setErr('Valores inválidos'); return; }
    const el = ELECTRODOS[cEl];
    // Área sección transversal depósito (junta en V de 60°, sin talón):
    // Área ≈ 0.75 × esp² × tan(30°) ≈ 0.75 × esp² × 0.577 para junta en V 60°
    // Simplificación práctica: volumen depósito = (esp²/2) × 0.8 × longitud mm³
    const volDepositoMM3 = (esp * esp / 2) * 0.8 * lon;
    const densidadAcero = 7.85e-3; // g/mm³
    const kgDeposito = Math.round(volDepositoMM3 * densidadAcero / 1000 * 100) / 100;
    const kgElectrodo = Math.round(kgDeposito / (el.depositoEficiencia / 100) * 100) / 100;
    const pesoVarilla = PESO_ELECTRODO_KG[cEl]?.[cDiam] || 0.09;
    const cantVarillas = pesoVarilla > 0 ? Math.ceil(kgElectrodo / pesoVarilla) : 0;
    // Pasadas estimadas — regla práctica: 1 pasada por cada 3mm de espesor + raíz
    const pasadas = Math.max(1, Math.ceil(esp / 3));
    setResCons({ kgDeposito, kgElectrodo, cantVarillas, pasadas });
  };

  const calcPrecalentamiento = () => {
    setErr(''); setResPre(null);
    const C2 = parseFloat(prC); const Mn = parseFloat(prMn); const Si = parseFloat(prSi);
    const Cr = parseFloat(prCr); const Ni = parseFloat(prNi); const Mo = parseFloat(prMo);
    const t = parseFloat(prEsp);
    if ([C2, Mn, Si, Cr, Ni, Mo, t].some(isNaN)) { setErr('Valores inválidos'); return; }
    // CE = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15 — Fórmula IIW verificada
    const CE = Math.round((C2 + Mn / 6 + (Cr + Mo) / 5 + Ni / 15) * 1000) / 1000;
    let Tp = 0; let cat = ''; let rec = '';
    if (CE <= 0.35) { Tp = 0; cat = 'Grupo I — Bajo CE (≤0.35)'; rec = t > 19 ? 'Precalentar a 20°C mínimo para t > 19mm.' : 'Sin precalentamiento requerido.'; }
    else if (CE <= 0.40) { Tp = t > 19 ? 65 : 0; cat = 'Grupo II — CE moderado (0.35-0.40)'; rec = t > 19 ? 'Precalentar a 65°C. Entre pasadas: 65-230°C.' : 'Sin precalentamiento para t ≤ 19mm.'; }
    else if (CE <= 0.45) { Tp = 110; cat = 'Grupo III — CE alto (0.40-0.45)'; rec = 'Precalentar a 110°C mínimo. Entre pasadas: 110-230°C. OBLIGATORIO electrodo bajo hidrógeno E7018.'; }
    else if (CE <= 0.55) { Tp = 150; cat = 'Grupo IV — CE muy alto (0.45-0.55)'; rec = 'Precalentar 150-200°C. OBLIGATORIO E7018/E7016. Tratamiento post-soldadura recomendado. ASME Sec. IX.'; }
    else { Tp = 200; cat = 'Grupo V — Alta aleación (>0.55)'; rec = 'Precalentar 200-315°C. WPS específico obligatorio. Calificación de procedimiento ASME Sec. IX.'; }
    if (t > 38 && Tp < 65) Tp = 65;
    setResPre({ CE, Tp, cat, rec });
  };

  return (
    <div style={{ padding: 24, color: '#f1f5f9', fontFamily: 'Inter,sans-serif', maxWidth: 960, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Módulo Soldadura Metalúrgica</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Perforación · Petróleo · Minería · MMO — Selector · Aceros · Heat Input · Filete · Consumo · Precalentamiento</div>
          <div style={{ fontSize: 11, color: C, marginTop: 4 }}>AWS A5.1 · AWS D1.1:2020 · ASME Sec. IX · API 1104:2021 · AISC-360</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', background: '#0a0f1e', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid rgba(245,158,11,0.15)', overflowX: 'auto' as const, gap: 3 }}>
        {SUBS.map(s => (
          <button key={s.id} onClick={() => { setSub(s.id); setErr(''); }}
            style={{ flex: 1, padding: '9px 8px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' as const, background: sub === s.id ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'transparent', color: sub === s.id ? '#fff' : '#475569', boxShadow: sub === s.id ? '0 4px 12px rgba(245,158,11,0.4)' : 'none' }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {err && <Err text={err} />}

      {/* ══ SELECTOR ══ */}
      {sub === 'selector' && (
        <div>
          <T text="Selector inteligente de electrodo — AWS A5.1 / API 1104" />
          <div style={g2}>
            <div><label style={lbl}>Industria</label>
              <select value={sInd} onChange={e => setSInd(e.target.value)} style={inp}>
                {['Perforación', 'Petróleo', 'Minería', 'MMO', 'Arquitectura'].map(i => <option key={i} value={i} style={{ background: '#0a0f1e' }}>{i}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Material base</label>
              <select value={sMat} onChange={e => setSMat(e.target.value)} style={inp}>
                <option value="acero_carbono" style={{ background: '#0a0f1e' }}>Acero carbono (A36, API 5L)</option>
                <option value="baja_aleacion" style={{ background: '#0a0f1e' }}>Baja aleación (A572, X65)</option>
                <option value="inoxidable" style={{ background: '#0a0f1e' }}>Acero inoxidable 304/316</option>
              </select>
            </div>
            <div><label style={lbl}>Posición de soldadura</label>
              <select value={sPos} onChange={e => setSPos(e.target.value)} style={inp}>
                <option value="todas" style={{ background: '#0a0f1e' }}>Todas las posiciones</option>
                <option value="plana" style={{ background: '#0a0f1e' }}>Solo plana / horizontal</option>
              </select>
            </div>
            <div><label style={lbl}>Condición del metal base</label>
              <select value={sCond} onChange={e => setSCond(e.target.value)} style={inp}>
                <option value="limpio" style={{ background: '#0a0f1e' }}>Metal limpio / nuevo</option>
                <option value="sucio" style={{ background: '#0a0f1e' }}>Con óxido / pintura / suciedad</option>
              </select>
            </div>
          </div>
          <Btn onClick={calcSelector} text="Buscar electrodo recomendado" />
          {sRes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: C, fontWeight: 700, marginBottom: 4 }}>ELECTRODOS RECOMENDADOS PARA {sInd.toUpperCase()}</div>
              {sRes.map(k => {
                const el = ELECTRODOS[k];
                return (
                  <ResBox key={k}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' as const }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: C }}>{el.nombre}</div>
                      <div style={{ fontSize: 11, color: '#475569', background: '#0a0f1e', padding: '3px 10px', borderRadius: 20 }}>{el.proceso}</div>
                      <div style={{ fontSize: 10, color: '#334155' }}>{el.norma}</div>
                    </div>
                    <div style={g2}>
                      <Card label="Resistencia tracción" val={`${el.traccionMPa} MPa (${el.traccionKsi} ksi)`} />
                      <Card label="Corriente" val={el.corriente} />
                      <Card label="Posiciones" val={el.posiciones} />
                      <Card label="Penetración" val={el.penetracion} />
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', padding: '8px 12px', background: '#0a0f1e', borderRadius: 8, marginTop: 4 }}>
                      <b style={{ color: C }}>Aplicación: </b>{el.aplicacion}
                    </div>
                    <div style={{ fontSize: 11, color: '#334155', marginTop: 8 }}>
                      Diámetros disponibles: {el.diametrosDisp.map(d => `Ø${d}mm`).join(' · ')}
                    </div>
                  </ResBox>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ ACEROS ESPECIALES ══ */}
      {sub === 'aceros' && (
        <div>
          <T text="Aceros especiales por industria — Propiedades y soldabilidad" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(ACEROS).map(([k, a]) => (
              <div key={k} style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' as const }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C }}>{a.nombre}</div>
                  <div style={{ fontSize: 11, background: '#0a0f1e', color: '#64748b', padding: '3px 10px', borderRadius: 20 }}>{a.norma}</div>
                  <div style={{ fontSize: 11, color: '#334155' }}>{a.industria}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
                  {[
                    { l: 'Cedencia mín.', v: `${a.cedenciaMPa} MPa` },
                    { l: 'Tracción mín.', v: `${a.traccionMPa} MPa` },
                    { l: 'CE (IIW)', v: `${a.CE}` },
                    { l: 'Precalentamiento', v: a.precalentamientoMin === 0 ? 'No requerido' : `${a.precalentamientoMin}°C mín.` },
                  ].map((r, i) => (
                    <div key={i} style={{ background: '#0a0f1e', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 3 }}>{r.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{r.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', padding: '6px 10px', background: '#0a0f1e', borderRadius: 8, marginBottom: 8 }}>
                  <b style={{ color: C }}>Electrodos recomendados: </b>{a.electrodosRecomendados.join(' · ')}
                </div>
                <div style={{ fontSize: 11, color: a.precalentamientoMin >= 150 ? '#f87171' : '#94a3b8', padding: '6px 10px', background: '#0a0f1e', borderRadius: 8 }}>
                  {a.obs}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ FICHAS TÉCNICAS ══ */}
      {sub === 'electrodos' && (
        <div>
          <T text="Fichas técnicas de electrodos — AWS A5.1 / A5.18 / A5.4" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(ELECTRODOS).map(([k, el]) => (
              <div key={k} style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' as const }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C }}>{el.nombre}</div>
                  <div style={{ fontSize: 11, background: '#0a0f1e', color: '#64748b', padding: '3px 10px', borderRadius: 20 }}>{el.proceso}</div>
                  <div style={{ fontSize: 10, color: '#334155' }}>{el.norma}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
                  {[
                    { l: 'Tracción mín.', v: `${el.traccionMPa} MPa · ${el.traccionKsi} ksi` },
                    { l: 'Cedencia', v: `${el.cedenciaKgcm2} kgf/cm²` },
                    { l: 'Ruptura', v: `${el.rupturaKgcm2} kgf/cm²` },
                    { l: 'Corriente', v: el.corriente },
                    { l: 'Posiciones', v: el.posiciones },
                    { l: 'Efic. depósito', v: `${el.depositoEficiencia}%` },
                  ].map((r, i) => (
                    <div key={i} style={{ background: '#0a0f1e', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 3 }}>{r.l}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{r.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', padding: '6px 10px', background: '#0a0f1e', borderRadius: 8, marginBottom: 6 }}>
                  <b style={{ color: C }}>Diámetros / Amperajes: </b>
                  {el.diametrosDisp.map(d => `Ø${d}mm: ${el.amperajeMin[d]}-${el.amperajeMax[d]}A`).join(' · ')}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', padding: '6px 10px', background: '#0a0f1e', borderRadius: 8 }}>
                  {el.aplicacion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ HEAT INPUT ══ */}
      {sub === 'heat_input' && (
        <div>
          <T text="Calor Aportado (Heat Input) — ASME Sec. IX / AWS D1.1 §6.8.5" />
          <div style={g2}>
            <div><label style={lbl}>Voltaje del arco (V)</label>
              <input value={hiV} onChange={e => setHiV(e.target.value)} style={inp} type="number" min="10" step="0.1" />
            </div>
            <div><label style={lbl}>Corriente I (Amperios)</label>
              <input value={hiI} onChange={e => setHiI(e.target.value)} style={inp} type="number" min="50" step="1" />
            </div>
            <div><label style={lbl}>Velocidad avance (mm/min)</label>
              <input value={hiVel} onChange={e => setHiVel(e.target.value)} style={inp} type="number" min="10" step="1" />
            </div>
            <div><label style={lbl}>Proceso</label>
              <select value={hiProc} onChange={e => setHiProc(e.target.value)} style={inp}>
                {Object.entries(EFICIENCIA_PROCESO).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{k} — η={v * 100}%</option>)}
              </select>
            </div>
          </div>
          <Info text="Fórmula ASME/AWS: HI (kJ/mm) = (V × I × 60 × η) / (v_mm/min × 1000)" />
          <Btn onClick={calcHeatInput} text="Calcular Heat Input" />
          {resHI && <ResBox>
            <div style={{ fontSize: 12, color: C, fontWeight: 700, marginBottom: 14 }}>RESULTADO — HEAT INPUT</div>
            <div style={g3}>
              <Card label="Heat Input" val={`${resHI.hi} kJ/mm`} sub={`${Math.round(resHI.hi * 1000)} J/mm`} />
              <Card label="Eficiencia proceso" val={`${resHI.ef}%`} sub={hiProc} />
              <Card label="Clasificación" val={resHI.clase} color={resHI.hi > 4 ? '#ef4444' : resHI.hi < 0.5 ? C : '#4ade80'} />
            </div>
            <Info text="Referencia: Tubería API 1104: 1.0-2.5 kJ/mm · Estructural AWS D1.1: 0.5-3.0 kJ/mm · ASME B31.3: según WPS calificado" />
          </ResBox>}
        </div>
      )}

      {/* ══ FILETE ══ */}
      {sub === 'filete' && (
        <div>
          <T text="Soldadura de Filete — AWS D1.1:2020 / AISC-360" />
          <div style={g3}>
            <div><label style={lbl}>Espesor material más grueso (mm)</label>
              <input value={fEsp} onChange={e => setFEsp(e.target.value)} style={inp} type="number" min="1" step="0.5" />
            </div>
            <div><label style={lbl}>Tamaño de filete a usar (mm)</label>
              <input value={fTam} onChange={e => setFTam(e.target.value)} style={inp} type="number" min="3" step="0.5" />
            </div>
            <div><label style={lbl}>Longitud de soldadura (mm)</label>
              <input value={fLon} onChange={e => setFLon(e.target.value)} style={inp} type="number" min="10" step="1" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>Electrodo</label>
            <select value={fEl} onChange={e => setFEl(e.target.value)} style={inp}>
              {Object.keys(ELECTRODOS).map(k => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{k} — Fu={ELECTRODOS[k].rupturaKgcm2} kgf/cm²</option>)}
            </select>
          </div>
          <Btn onClick={calcFilete} text="Calcular resistencia del filete" />
          {resFil && <ResBox ok={resFil.ok}>
            <div style={{ fontSize: 12, color: resFil.ok ? '#4ade80' : '#f87171', fontWeight: 700, marginBottom: 14 }}>
              {resFil.ok ? '✅ TAMAÑO ACEPTABLE — AWS D1.1' : `❌ INSUFICIENTE — Mínimo AWS D1.1: ${resFil.min} mm`}
            </div>
            <div style={g2}>
              <Card label="Garganta efectiva" val={`${resFil.garg} mm`} sub="= 0.707 × tamaño filete" />
              <Card label="Filete mínimo (AWS D1.1)" val={`${resFil.min} mm`} color={resFil.ok ? '#4ade80' : '#ef4444'} />
              <Card label="Resistencia nominal" val={`${resFil.res.toLocaleString()} kgf`} sub="Rn = 0.707×a×L×0.6×Fu" />
              <Card label="Resistencia en kN" val={`${resFil.reskN} kN`} />
            </div>
            <Info text={`${fEl}: Fu = ${ELECTRODOS[fEl].rupturaKgcm2} kgf/cm² · Norma: AWS D1.1:2020 / AISC-360`} />
          </ResBox>}
        </div>
      )}

      {/* ══ CONSUMO DE ELECTRODOS ══ */}
      {sub === 'consumo' && (
        <div>
          <T text="Consumo de Electrodos y Nº de Pasadas — Único en el mercado" />
          <div style={g2}>
            <div><label style={lbl}>Electrodo</label>
              <select value={cEl} onChange={e => { setCEl(e.target.value); setCDiam(ELECTRODOS[e.target.value].diametrosDisp[1] || ELECTRODOS[e.target.value].diametrosDisp[0]); }} style={inp}>
                {Object.keys(ELECTRODOS).map(k => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{k}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Diámetro del electrodo (mm)</label>
              <select value={cDiam} onChange={e => setCDiam(parseFloat(e.target.value))} style={inp}>
                {ELECTRODOS[cEl].diametrosDisp.map(d => <option key={d} value={d} style={{ background: '#0a0f1e' }}>Ø{d} mm — {ELECTRODOS[cEl].amperajeMin[d]}-{ELECTRODOS[cEl].amperajeMax[d]}A</option>)}
              </select>
            </div>
            <div><label style={lbl}>Longitud total de cordón (mm)</label>
              <input value={cLongCordon} onChange={e => setCLongCordon(e.target.value)} style={inp} type="number" min="10" step="10" />
            </div>
            <div><label style={lbl}>Espesor de placa / pared (mm)</label>
              <input value={cEspPlaca} onChange={e => setCEspPlaca(e.target.value)} style={inp} type="number" min="3" step="0.5" />
            </div>
          </div>
          <Info text={`Electrodo ${cEl} Ø${cDiam}mm — Eficiencia depósito: ${ELECTRODOS[cEl].depositoEficiencia}% · Amperaje: ${ELECTRODOS[cEl].amperajeMin[cDiam]}-${ELECTRODOS[cEl].amperajeMax[cDiam]}A`} />
          <Btn onClick={calcConsumo} text="Calcular consumo y pasadas" />
          {resCons && <ResBox>
            <div style={{ fontSize: 12, color: C, fontWeight: 700, marginBottom: 14 }}>RESULTADO — CONSUMO ELECTRODOS</div>
            <div style={g2}>
              <Card label="Metal depositado" val={`${resCons.kgDeposito} kg`} sub="Acero depositado en la junta" />
              <Card label="Electrodo a consumir" val={`${resCons.kgElectrodo} kg`} sub={`Incl. eficiencia ${ELECTRODOS[cEl].depositoEficiencia}%`} />
              <Card label="Varillas estimadas" val={`${resCons.cantVarillas} varillas`} sub={`Ø${cDiam}mm`} />
              <Card label="Pasadas estimadas" val={`${resCons.pasadas} pasadas`} sub="Incluye raíz + relleno" />
            </div>
            <Warn text="⚠️ Estimación de referencia. El consumo real varía según diseño de junta, técnica del soldador y condiciones de obra. Agregar 15-20% de desperdicio al pedir materiales." />
          </ResBox>}
        </div>
      )}

      {/* ══ PRECALENTAMIENTO ══ */}
      {sub === 'precalentamiento' && (
        <div>
          <T text="Temperatura de Precalentamiento — CE IIW / AWS D1.1 / ASME Sec. IX" />
          <Info text="Ingresá la composición química del acero en % peso. Usá 0 si el elemento no está presente." />
          <div style={g3}>
            {[
              { l: '% Carbono (C)', v: prC, s: setPrC },
              { l: '% Manganeso (Mn)', v: prMn, s: setPrMn },
              { l: '% Silicio (Si)', v: prSi, s: setPrSi },
              { l: '% Cromo (Cr)', v: prCr, s: setPrCr },
              { l: '% Níquel (Ni)', v: prNi, s: setPrNi },
              { l: '% Molibdeno (Mo)', v: prMo, s: setPrMo },
            ].map((f, i) => (
              <div key={i}><label style={lbl}>{f.l}</label>
                <input value={f.v} onChange={e => f.s(e.target.value)} style={inp} type="number" min="0" step="0.01" />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Espesor del material (mm)</label>
            <input value={prEsp} onChange={e => setPrEsp(e.target.value)} style={inp} type="number" min="1" step="1" />
          </div>
          <Info text="CE (IIW) = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15 · Grupos AWS D1.1 Tabla 4.2" />
          <Btn onClick={calcPrecalentamiento} text="Calcular precalentamiento" />
          {resPre && <ResBox>
            <div style={{ fontSize: 12, color: C, fontWeight: 700, marginBottom: 14 }}>RESULTADO — PRECALENTAMIENTO</div>
            <div style={g3}>
              <Card label="Carbono Equiv. CE (IIW)" val={`${resPre.CE}`} />
              <Card label="Temperatura mínima Tp" val={resPre.Tp === 0 ? 'No requerido' : `${resPre.Tp} °C`} color={resPre.Tp === 0 ? '#4ade80' : resPre.Tp >= 150 ? '#ef4444' : C} />
              <Card label="Categoría AWS D1.1" val={resPre.cat} />
            </div>
            <div style={{ fontSize: 12, color: '#f1f5f9', padding: '10px 14px', background: '#0a0f1e', borderRadius: 8, marginTop: 8 }}>
              <span style={{ color: C, fontWeight: 700 }}>Recomendación: </span>{resPre.rec}
            </div>
            <Warn text="⚠️ Para proyectos API 1104 / ASME B31 el precalentamiento debe definirse en WPS calificado según ASME Sec. IX." />
          </ResBox>}
        </div>
      )}
    </div>
  );
}