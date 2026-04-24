'use client';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
//  MÓDULO CAÑERÍAS E INTEGRIDAD DE DUCTOS — INGENIUM PRO v8.0
//  NORMATIVAS VERIFICADAS 100% REALES:
//  ASME B31.8-2020 §841.1.1 · ASME B31.4-2019 §403.2.1
//  API 579-1/ASME FFS-1 · Joukowsky (1898)
// ═══════════════════════════════════════════════════════════════

const COLOR = '#f97316';

// SMYS API 5L — ASME B31.8 Appendix D Table D1 — VERIFICADOS
const GRADOS: Record<string, { smys_psi: number; smys_mpa: number; label: string }> = {
  'GR_B': { smys_psi: 35000, smys_mpa: 241, label: 'API 5L Grado B' },
  'X42':  { smys_psi: 42000, smys_mpa: 290, label: 'API 5L X42' },
  'X46':  { smys_psi: 46000, smys_mpa: 317, label: 'API 5L X46' },
  'X52':  { smys_psi: 52000, smys_mpa: 359, label: 'API 5L X52' },
  'X56':  { smys_psi: 56000, smys_mpa: 386, label: 'API 5L X56' },
  'X60':  { smys_psi: 60000, smys_mpa: 414, label: 'API 5L X60' },
  'X65':  { smys_psi: 65000, smys_mpa: 448, label: 'API 5L X65' },
  'X70':  { smys_psi: 70000, smys_mpa: 483, label: 'API 5L X70' },
  'X80':  { smys_psi: 80000, smys_mpa: 552, label: 'API 5L X80' },
  'A106B':{ smys_psi: 35000, smys_mpa: 241, label: 'ASTM A106 Gr.B' },
};

// FACTOR F — B31.8 Tabla 841.1.6-1 — VERIFICADO
const FACT_F: Record<string, { F: number; desc: string }> = {
  'C1D1': { F: 0.80, desc: 'Clase 1 Div.1 — zona remota muy despoblada' },
  'C1D2': { F: 0.72, desc: 'Clase 1 Div.2 — ≤10 estructuras/milla' },
  'C2':   { F: 0.60, desc: 'Clase 2 — zona suburbana, 10–46 estructuras/milla' },
  'C3':   { F: 0.50, desc: 'Clase 3 — zona urbana, >46 estructuras/milla' },
  'C4':   { F: 0.40, desc: 'Clase 4 — edificios 4+ pisos, alta densidad' },
};

// FACTOR E — B31.8 Tabla 841.1.7-1 — VERIFICADO
const FACT_E: Record<string, { E: number; desc: string }> = {
  'SML':  { E: 1.00, desc: 'Seamless / Sin costura' },
  'ERW1': { E: 1.00, desc: 'ERW post-1970 (alta frecuencia, aprobado)' },
  'ERW0': { E: 0.80, desc: 'ERW pre-1970 (baja frecuencia)' },
  'FBW':  { E: 0.60, desc: 'Furnace Butt Weld' },
};

// FACTOR T temperatura — B31.8 Tabla 841.1.8-1 — VERIFICADO
// Solo aplica a B31.8 (gas). B31.4 (líquido) no usa T.
const factorT = (tempC: number): number => {
  const tempF = tempC * 9 / 5 + 32;
  if (tempF <= 250) return 1.000;
  if (tempF <= 300) return 0.967;
  if (tempF <= 350) return 0.933;
  if (tempF <= 400) return 0.900;
  return 0.867;
};

// FLUIDOS para Joukowsky — propiedades reales verificadas
const FLUIDOS: Record<string, { nombre: string; rho: number; K: number }> = {
  agua:          { nombre: 'Agua',                    rho: 1000, K: 2.15e9 },
  agua_prod:     { nombre: 'Agua de producción',      rho: 1060, K: 2.10e9 },
  crudo_liviano: { nombre: 'Crudo liviano (>35°API)', rho: 820,  K: 1.50e9 },
  crudo_pesado:  { nombre: 'Crudo pesado (<25°API)',  rho: 920,  K: 1.40e9 },
  gasoil:        { nombre: 'Gas oil / Diesel',        rho: 850,  K: 1.55e9 },
  nafta:         { nombre: 'Nafta / Gasolina',        rho: 720,  K: 1.10e9 },
};

const E_ACERO = 207e9; // Pa — módulo de Young acero carbono

type Sub = 'espesor' | 'hoop' | 'ariete' | 'cierre' | 'remanente';

const SUBS: { id: Sub; label: string; icon: string }[] = [
  { id: 'espesor',   label: 'Espesor pared',    icon: '📐' },
  { id: 'hoop',      label: 'Hoop Stress',       icon: '⚙️' },
  { id: 'ariete',    label: 'Golpe de ariete',   icon: '💥' },
  { id: 'cierre',    label: 'Cierre válvula',    icon: '🚨' },
  { id: 'remanente', label: 'Vida remanente',    icon: '📊' },
];

// ── Estilos base ──────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', background: '#0a0f1e',
  border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10,
  color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b',
  marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase',
};
const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 };
const g3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 };
const g4: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 };

function Tit({ t }: { t: string }) {
  return <div style={{ fontSize: 11, color: COLOR, fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' as const }}>{t}</div>;
}
function Btn({ onClick, text }: { onClick: () => void; text: string }) {
  return <button onClick={onClick} style={{ width: '100%', padding: '13px 0', marginBottom: 20, background: `linear-gradient(135deg,${COLOR},#ea580c)`, border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(249,115,22,0.4)' }}>{text}</button>;
}
function Info({ t }: { t: string }) {
  return <div style={{ fontSize: 12, color: '#475569', marginBottom: 12, padding: '8px 12px', background: 'rgba(249,115,22,0.05)', borderRadius: 8 }}>{t}</div>;
}
function Warn({ t, rojo }: { t: string; rojo?: boolean }) {
  const c = rojo ? '#ef4444' : '#f59e0b';
  return <div style={{ fontSize: 11, color: c, padding: '8px 12px', background: rojo ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${rojo ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)'}`, borderRadius: 8, marginTop: 8 }}>{t}</div>;
}
function ErrBox({ t }: { t: string }) {
  return <div style={{ padding: '10px 16px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>{t}</div>;
}
function Card({ label, val, sub, color }: { label: string; val: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 4, letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: color || COLOR }}>{val}</div>
      {sub && <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function ResBox({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  const bg = ok === undefined ? 'rgba(249,115,22,0.08)' : ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
  const br = ok === undefined ? 'rgba(249,115,22,0.25)' : ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
  return <div style={{ background: bg, border: `1px solid ${br}`, borderRadius: 16, padding: 20 }}>{children}</div>;
}
function RLbl({ t, ok }: { t: string; ok?: boolean }) {
  const color = ok === undefined ? COLOR : ok ? '#4ade80' : '#f87171';
  return <div style={{ fontSize: 12, color, fontWeight: 700, marginBottom: 14 }}>{t}</div>;
}

// ─────────────────────────────────────────────────────────────
export default function ModuloCanerias() {
  const [sub, setSub] = useState<Sub>('espesor');
  const [err, setErr] = useState('');
  const R = () => setErr('');

  // ── Estado espesor ────────────────────────────────────────
  const [eCod, setEcod] = useState<'B318'|'B314'>('B318');
  const [eDmm, setEdmm] = useState('273.1');
  const [ePbar, setEpbar] = useState('80');
  const [eGrado, setEgrado] = useState('X65');
  const [eClase, setEclase] = useState('C1D2');
  const [eJunta, setEjunta] = useState('ERW1');
  const [eTempC, setEtempC] = useState('60');
  const [eCA, setEca] = useState('1.6');
  const [resEsp, setResEsp] = useState<null|{
    t_min_mm:number; t_dis_mm:number; sigma_h_mpa:number;
    F:number; E:number; T:number; S_mpa:number; norma:string;
  }>(null);

  // ── Estado hoop ───────────────────────────────────────────
  const [hDmm, setHdmm] = useState('273.1');
  const [hTmm, setHtmm] = useState('9.3');
  const [hPbar, setHpbar] = useState('80');
  const [hGrado, setHgrado] = useState('X65');
  const [hClase, setHclase] = useState('C1D2');
  const [hJunta, setHjunta] = useState('ERW1');
  const [resHoop, setResHoop] = useState<null|{
    sigma_h_mpa:number; allow_mpa:number; uso_pct:number; ok:boolean;
  }>(null);

  // ── Estado ariete ─────────────────────────────────────────
  const [aDmm, setAdmm] = useState('273.1');
  const [aTmm, setAtmm] = useState('9.3');
  const [aLm, setAlm] = useState('2000');
  const [aVms, setAvms] = useState('1.5');
  const [aFluido, setAfluido] = useState('agua');
  const [resAr, setResAr] = useState<null|{
    a_ms:number; dP_bar:number; dP_psi:number; t_ret_s:number;
  }>(null);

  // ── Estado cierre ─────────────────────────────────────────
  const [cDmm, setCdmm] = useState('273.1');
  const [cTmm, setCtmm] = useState('9.3');
  const [cLm, setClm] = useState('2000');
  const [cVms, setCvms] = useState('1.5');
  const [cPbar, setCpbar] = useState('80');
  const [cFluido, setCfluido] = useState('agua');
  const [cGrado, setCgrado] = useState('X65');
  const [cTcierreS, setCtcierreS] = useState('5');
  const [resCi, setResCi] = useState<null|{
    a_ms:number; t_seg_s:number; t_ing_s:number;
    ok:boolean; dP_bar:number; P_total_bar:number; riesgo:string;
  }>(null);

  // ── Estado remanente ──────────────────────────────────────
  const [rTnom, setRtnom] = useState('9.3');
  const [rTmed, setRtmed] = useState('7.8');
  const [rTmin, setRtmin] = useState('5.5');
  const [rCorr, setRcorr] = useState('0.2');
  const [resRem, setResRem] = useState<null|{
    vida_anios:number; estado:string; rec:string; riesgo:string;
  }>(null);

  // ── CÁLCULO 1 — ESPESOR ───────────────────────────────────
  // B31.8 §841.1.1: t = P·D / (2·S·F·E·T)
  // B31.4 §403.2.1: t = P·D / (2·S·F·E)  F=0.72 fijo, sin T
  const calcEspesor = () => {
    R(); setResEsp(null);
    const D = parseFloat(eDmm), P_bar = parseFloat(ePbar);
    const CA = parseFloat(eCA), TempC = parseFloat(eTempC);
    if ([D, P_bar, CA, TempC].some(n => isNaN(n) || n < 0)) { setErr('Valores inválidos'); return; }

    const D_in  = D / 25.4;
    const P_psi = P_bar * 14.5038;
    const g     = GRADOS[eGrado];
    const S_psi = g.smys_psi;
    const F     = eCod === 'B318' ? FACT_F[eClase].F : 0.72;
    const E     = FACT_E[eJunta].E;
    const T     = eCod === 'B318' ? factorT(TempC) : 1.0;
    const norma = eCod === 'B318' ? 'ASME B31.8-2020 §841.1.1' : 'ASME B31.4-2019 §403.2.1';

    const t_min_in  = (P_psi * D_in) / (2 * S_psi * F * E * T);
    const t_min_mm  = Math.round(t_min_in * 25.4 * 100) / 100;
    const t_dis_mm  = Math.round((t_min_mm + CA) * 100) / 100;

    // Hoop stress con t_min — Barlow
    const sigma_h_psi = (P_psi * D_in) / (2 * t_min_in);
    const sigma_h_mpa = Math.round(sigma_h_psi * 0.006895 * 10) / 10;

    setResEsp({ t_min_mm, t_dis_mm, sigma_h_mpa, F, E, T, S_mpa: g.smys_mpa, norma });
  };

  // ── CÁLCULO 2 — HOOP STRESS (Barlow) ─────────────────────
  // σ_h = (P × D_ext) / (2 × t)
  // Límite: S × F × E × T — B31.8 §841.1.1
  const calcHoop = () => {
    R(); setResHoop(null);
    const D = parseFloat(hDmm), t = parseFloat(hTmm), P_bar = parseFloat(hPbar);
    if ([D, t, P_bar].some(n => isNaN(n) || n <= 0)) { setErr('Valores inválidos'); return; }
    if (t >= D / 2) { setErr('Espesor ≥ radio exterior — verificar datos'); return; }

    const D_in  = D / 25.4;
    const t_in  = t / 25.4;
    const P_psi = P_bar * 14.5038;
    const g     = GRADOS[hGrado];
    const F     = FACT_F[hClase].F;
    const E     = FACT_E[hJunta].E;

    const sigma_h_psi  = (P_psi * D_in) / (2 * t_in);
    const sigma_h_mpa  = Math.round(sigma_h_psi * 0.006895 * 10) / 10;
    const allow_psi    = g.smys_psi * F * E;
    const allow_mpa    = Math.round(allow_psi * 0.006895 * 10) / 10;
    const uso_pct      = Math.round((sigma_h_psi / allow_psi) * 1000) / 10;

    setResHoop({ sigma_h_mpa, allow_mpa, uso_pct, ok: sigma_h_psi <= allow_psi });
  };

  // ── CÁLCULO 3 — GOLPE DE ARIETE (Joukowsky) ──────────────
  // ΔP = ρ × a × Δv
  // a  = √(K/ρ) / √(1 + K·D_int/(E_acero·t))
  const calcAriete = () => {
    R(); setResAr(null);
    const D = parseFloat(aDmm), t = parseFloat(aTmm);
    const L = parseFloat(aLm), v = parseFloat(aVms);
    if ([D, t, L, v].some(n => isNaN(n) || n <= 0)) { setErr('Valores inválidos'); return; }
    if (t >= D / 2) { setErr('Espesor inválido'); return; }

    const fl      = FLUIDOS[aFluido];
    const D_int_m = (D - 2 * t) / 1000;
    const t_m     = t / 1000;

    const a      = Math.sqrt(fl.K / fl.rho) / Math.sqrt(1 + (fl.K * D_int_m) / (E_ACERO * t_m));
    const dP_pa  = fl.rho * a * v;
    const dP_bar = Math.round(dP_pa / 1e5 * 10) / 10;
    const dP_psi = Math.round(dP_pa / 6894.76);
    const t_ret  = Math.round((2 * L / a) * 100) / 100;

    setResAr({ a_ms: Math.round(a * 10) / 10, dP_bar, dP_psi, t_ret_s: t_ret });
  };

  // ── CÁLCULO 4 — TIEMPO CIERRE SEGURO ─────────────────────
  // Cierre seguro si t_cierre ≥ 2L/a (onda regresa antes del cierre)
  // Si t_cierre < 2L/a → ΔP_máx = ρ·a·v (cierre instantáneo)
  const calcCierre = () => {
    R(); setResCi(null);
    const D = parseFloat(cDmm), t = parseFloat(cTmm);
    const L = parseFloat(cLm), v = parseFloat(cVms);
    const P_bar = parseFloat(cPbar), tc = parseFloat(cTcierreS);
    if ([D, t, L, v, P_bar, tc].some(n => isNaN(n) || n <= 0)) { setErr('Valores inválidos'); return; }
    if (t >= D / 2) { setErr('Espesor inválido'); return; }

    const fl      = FLUIDOS[cFluido];
    const D_int_m = (D - 2 * t) / 1000;
    const t_m     = t / 1000;

    const a       = Math.sqrt(fl.K / fl.rho) / Math.sqrt(1 + (fl.K * D_int_m) / (E_ACERO * t_m));
    const t_seg_s = Math.round((2 * L / a) * 100) / 100;
    const ok      = tc >= t_seg_s;

    // Si cierre rápido (tc < t_seg): ΔP máximo. Si lento: ΔP proporcional.
    const factor  = ok ? (t_seg_s / tc) : 1.0;
    const dP_bar  = Math.round((fl.rho * a * v * factor) / 1e5 * 10) / 10;
    const P_total = Math.round((P_bar + dP_bar) * 10) / 10;

    const g       = GRADOS[cGrado];
    const lim_bar = g.smys_mpa * 10 * FACT_F['C1D2'].F; // referencia conservadora
    let riesgo    = '';
    if (!ok && P_total > lim_bar)
      riesgo = '❌ CRÍTICO — Presión total supera límite B31.8. Riesgo real de rotura de cañería.';
    else if (!ok)
      riesgo = '⚠️ ALTO — Cierre rápido genera golpe de ariete significativo. Aumentar tiempo de cierre.';
    else
      riesgo = '✅ SEGURO — Tiempo de cierre dentro del límite de Joukowsky. Presión controlada.';

    setResCi({ a_ms: Math.round(a * 10) / 10, t_seg_s, t_ing_s: tc, ok, dP_bar, P_total_bar: P_total, riesgo });
  };

  // ── CÁLCULO 5 — VIDA REMANENTE (API 579 / ASME FFS-1) ────
  // Vida remanente = (t_medido - t_mínimo_req) / tasa_corrosión
  const calcRemanente = () => {
    R(); setResRem(null);
    const t_nom = parseFloat(rTnom), t_med = parseFloat(rTmed);
    const t_min = parseFloat(rTmin), corr  = parseFloat(rCorr);
    if ([t_nom, t_med, t_min, corr].some(n => isNaN(n) || n <= 0)) { setErr('Valores inválidos'); return; }
    if (t_med > t_nom) { setErr('Espesor medido no puede superar el nominal'); return; }
    if (t_min >= t_nom) { setErr('Espesor mínimo debe ser menor que el nominal'); return; }

    const vida = Math.max(0, Math.round(((t_med - t_min) / corr) * 10) / 10);
    const pct  = ((t_med - t_min) / (t_nom - t_min)) * 100;

    let estado = '', rec = '', riesgo = '';

    if (t_med <= t_min) {
      estado = 'FUERA DE SERVICIO'; riesgo = '❌ CRÍTICO';
      rec = 'Espesor medido ya alcanzó el mínimo requerido. Retiro inmediato del servicio. API 579 Nivel 2 obligatorio.';
    } else if (pct < 20) {
      estado = 'REEMPLAZO URGENTE'; riesgo = '🔴 MUY ALTO';
      rec = `Vida remanente: ${vida} años. Programar reemplazo inmediato. Reducir presión al 80% como medida transitoria. API 579 Nivel 2.`;
    } else if (pct < 50) {
      estado = 'INTERVENCIÓN PRÓXIMA'; riesgo = '⚠️ ALTO';
      rec = `Vida remanente: ${vida} años. Inspección en 12 meses. Evaluar inhibidor de corrosión. API 579 Nivel 1.`;
    } else {
      estado = 'EN SERVICIO NORMAL'; riesgo = '✅ BAJO';
      rec = `Vida remanente: ${vida} años. Continuar inspecciones periódicas API 570. Próxima en ${Math.min(5, Math.round(vida / 2))} años.`;
    }

    setResRem({ vida_anios: vida, estado, rec, riesgo });
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ padding: 24, color: '#f1f5f9', fontFamily: 'Inter,sans-serif', maxWidth: 960, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(249,115,22,0.05))', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 16, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🔧</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Cañerías e Integridad de Ductos</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Espesor pared · Hoop Stress · Golpe de ariete · Cierre seguro de válvula · Vida remanente</div>
          <div style={{ fontSize: 11, color: COLOR, marginTop: 4 }}>ASME B31.8-2020 · ASME B31.4-2019 · API 579/ASME FFS-1 · Joukowsky</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', background: '#0a0f1e', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid rgba(249,115,22,0.15)', overflowX: 'auto' as const, gap: 3 }}>
        {SUBS.map(s => (
          <button key={s.id} onClick={() => { setSub(s.id); R(); }}
            style={{ flex: 1, padding: '9px 8px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' as const, background: sub === s.id ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'transparent', color: sub === s.id ? '#fff' : '#475569', boxShadow: sub === s.id ? '0 4px 12px rgba(249,115,22,0.4)' : 'none' }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {err && <ErrBox t={err} />}

      {/* ══ ESPESOR DE PARED ══ */}
      {sub === 'espesor' && (
        <div>
          <Tit t="Espesor mínimo de pared — ASME B31.8 §841.1.1 / B31.4 §403.2.1" />

          <div style={g2}>
            <div><label style={lbl}>Código de diseño</label>
              <select value={eCod} onChange={e => setEcod(e.target.value as 'B318'|'B314')} style={inp}>
                <option value="B318" style={{ background: '#0a0f1e' }}>ASME B31.8 — Transmisión de Gas</option>
                <option value="B314" style={{ background: '#0a0f1e' }}>ASME B31.4 — Transporte de Líquidos / Petróleo</option>
              </select>
            </div>
            <div><label style={lbl}>Material — Grado API 5L</label>
              <select value={eGrado} onChange={e => setEgrado(e.target.value)} style={inp}>
                {Object.entries(GRADOS).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.label} — SMYS {v.smys_mpa} MPa ({v.smys_psi.toLocaleString()} psi)</option>)}
              </select>
            </div>
            <div><label style={lbl}>Diámetro exterior OD (mm)</label>
              <input value={eDmm} onChange={e => setEdmm(e.target.value)} style={inp} type="number" min="10" step="0.1" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>4"=114.3 · 6"=168.3 · 8"=219.1 · 10"=273.1 · 12"=323.9 mm</div>
            </div>
            <div><label style={lbl}>Presión de diseño (bar)</label>
              <input value={ePbar} onChange={e => setEpbar(e.target.value)} style={inp} type="number" min="1" step="1" />
            </div>
            <div><label style={lbl}>{eCod === 'B318' ? 'Clase de ubicación' : 'Clase ubicación (B31.4: F=0.72 fijo)'}</label>
              <select value={eClase} onChange={e => setEclase(e.target.value)} style={{ ...inp, opacity: eCod === 'B314' ? 0.4 : 1 }} disabled={eCod === 'B314'}>
                {Object.entries(FACT_F).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.desc} — F={v.F}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Junta longitudinal (factor E)</label>
              <select value={eJunta} onChange={e => setEjunta(e.target.value)} style={inp}>
                {Object.entries(FACT_E).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.desc} — E={v.E}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Temperatura de diseño (°C)</label>
              <input value={eTempC} onChange={e => setEtempC(e.target.value)} style={{ ...inp, opacity: eCod === 'B314' ? 0.4 : 1 }} type="number" step="1" disabled={eCod === 'B314'} />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>{eCod === 'B314' ? 'B31.4: sin factor T (opera <120°C)' : 'B31.8: T aplica a >120°C (250°F)'}</div>
            </div>
            <div><label style={lbl}>Tolerancia corrosión CA (mm)</label>
              <input value={eCA} onChange={e => setEca(e.target.value)} style={inp} type="number" min="0" step="0.1" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Típico: 1.6 mm (1/16") agua · 3.2 mm (1/8") crudo</div>
            </div>
          </div>

          <Info t={eCod === 'B318' ? 'B31.8 §841.1.1: t_min = (P × D) / (2 × S × F × E × T) | S = SMYS | F = clase ubicación | E = junta | T = temperatura' : 'B31.4 §403.2.1: t_min = (P × D) / (2 × S × F × E) | F = 0.72 fijo | Sin factor T | t_diseño = t_min + CA'} />
          <Btn onClick={calcEspesor} text="Calcular espesor mínimo" />

          {resEsp && (
            <ResBox>
              <RLbl t={`RESULTADO — ${resEsp.norma}`} />
              <div style={g4}>
                <Card label="Espesor mínimo (presión)" val={`${resEsp.t_min_mm} mm`} sub="t_min por presión" />
                <Card label="Espesor de diseño (con CA)" val={`${resEsp.t_dis_mm} mm`} sub="t_min + Corrosión" color="#4ade80" />
                <Card label="Hoop Stress (Barlow)" val={`${resEsp.sigma_h_mpa} MPa`} sub={`SMYS = ${resEsp.S_mpa} MPa`} />
                <Card label="Factores aplicados" val={`F=${resEsp.F} E=${resEsp.E} T=${resEsp.T}`} sub={eCod === 'B318' ? 'B31.8' : 'B31.4'} />
              </div>
              <Info t="Seleccioná el espesor comercial estándar (API 5L / ASME B36.10M) inmediatamente superior al espesor de diseño." />
              <Warn t="⚠️ Este cálculo es de referencia. El diseño definitivo requiere ingeniero matriculado, análisis de cargas externas, pandeo y verificación ante códigos locales." />
            </ResBox>
          )}
        </div>
      )}

      {/* ══ HOOP STRESS ══ */}
      {sub === 'hoop' && (
        <div>
          <Tit t="Estrés Circunferencial (Hoop Stress) — Barlow / ASME B31.8 §841.1.1" />
          <Info t="Verificación: la cañería existente con su espesor real soporta la presión de operación. σ_h = (P × D_ext) / (2 × t)" />

          <div style={g3}>
            <div><label style={lbl}>Diámetro exterior OD (mm)</label>
              <input value={hDmm} onChange={e => setHdmm(e.target.value)} style={inp} type="number" min="10" step="0.1" />
            </div>
            <div><label style={lbl}>Espesor real de pared (mm)</label>
              <input value={hTmm} onChange={e => setHtmm(e.target.value)} style={inp} type="number" min="1" step="0.1" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Espesor medido por UT o especificado en plano</div>
            </div>
            <div><label style={lbl}>Presión de operación (bar)</label>
              <input value={hPbar} onChange={e => setHpbar(e.target.value)} style={inp} type="number" min="1" step="1" />
            </div>
            <div><label style={lbl}>Grado API 5L</label>
              <select value={hGrado} onChange={e => setHgrado(e.target.value)} style={inp}>
                {Object.entries(GRADOS).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.label}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Clase de ubicación (F)</label>
              <select value={hClase} onChange={e => setHclase(e.target.value)} style={inp}>
                {Object.entries(FACT_F).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>F={v.F} — {v.desc}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Junta longitudinal (E)</label>
              <select value={hJunta} onChange={e => setHjunta(e.target.value)} style={inp}>
                {Object.entries(FACT_E).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>E={v.E} — {v.desc}</option>)}
              </select>
            </div>
          </div>

          <Btn onClick={calcHoop} text="Verificar hoop stress" />

          {resHoop && (
            <ResBox ok={resHoop.ok}>
              <RLbl t={resHoop.ok ? '✅ CAÑERÍA APTA — Estrés dentro del límite B31.8' : '❌ ESTRÉS SUPERA LÍMITE — Reducir presión o aumentar espesor'} ok={resHoop.ok} />
              <div style={g3}>
                <Card label="Hoop Stress real σ_h" val={`${resHoop.sigma_h_mpa} MPa`} color={resHoop.ok ? '#4ade80' : '#ef4444'} />
                <Card label="Límite admisible S·F·E" val={`${resHoop.allow_mpa} MPa`} />
                <Card label="Factor de uso" val={`${resHoop.uso_pct}%`} color={resHoop.uso_pct > 100 ? '#ef4444' : resHoop.uso_pct > 85 ? '#f59e0b' : '#4ade80'} sub="Máximo admisible: 100%" />
              </div>
              {!resHoop.ok && <Warn t="Reducir presión de operación o reemplazar tramo por cañería de mayor espesor. Inspección de integridad obligatoria." rojo />}
            </ResBox>
          )}
        </div>
      )}

      {/* ══ GOLPE DE ARIETE ══ */}
      {sub === 'ariete' && (
        <div>
          <Tit t="Golpe de ariete — Joukowsky (1898) · Celeridad de onda real" />
          <Info t="ΔP = ρ × a × Δv (cierre instantáneo) | a = √(K/ρ) / √(1 + K·D_int/(E_acero·t))" />

          <div style={g2}>
            <div><label style={lbl}>Tipo de fluido</label>
              <select value={aFluido} onChange={e => setAfluido(e.target.value)} style={inp}>
                {Object.entries(FLUIDOS).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.nombre} — ρ={v.rho} kg/m³</option>)}
              </select>
            </div>
            <div><label style={lbl}>Diámetro exterior OD (mm)</label>
              <input value={aDmm} onChange={e => setAdmm(e.target.value)} style={inp} type="number" min="10" step="0.1" />
            </div>
            <div><label style={lbl}>Espesor de pared (mm)</label>
              <input value={aTmm} onChange={e => setAtmm(e.target.value)} style={inp} type="number" min="1" step="0.1" />
            </div>
            <div><label style={lbl}>Longitud del tramo (m)</label>
              <input value={aLm} onChange={e => setAlm(e.target.value)} style={inp} type="number" min="10" step="10" />
            </div>
            <div><label style={lbl}>Velocidad de flujo (m/s)</label>
              <input value={aVms} onChange={e => setAvms(e.target.value)} style={inp} type="number" min="0.1" step="0.1" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Típico: agua 1–3 m/s · petróleo 0.5–2 m/s</div>
            </div>
          </div>

          <Btn onClick={calcAriete} text="Calcular golpe de ariete" />

          {resAr && (
            <ResBox>
              <RLbl t="RESULTADO — GOLPE DE ARIETE MÁXIMO (cierre instantáneo)" />
              <div style={g4}>
                <Card label="Celeridad de onda a" val={`${resAr.a_ms} m/s`} sub="Velocidad de onda de presión" />
                <Card label="Sobrepresión ΔP" val={`${resAr.dP_bar} bar`} color="#ef4444" sub={`${resAr.dP_psi.toLocaleString()} psi`} />
                <Card label="Tiempo retorno onda" val={`${resAr.t_ret_s} s`} sub="2L/a — onda ida y vuelta" />
              </div>
              <Warn t={`⚠️ Esta es la sobrepresión para cierre INSTANTÁNEO. Si el tiempo de cierre de la válvula es mayor a ${resAr.t_ret_s} s, la sobrepresión real es menor. Usá el sub-módulo "Cierre válvula" para calcularlo con tu tiempo real.`} />
            </ResBox>
          )}
        </div>
      )}

      {/* ══ CIERRE DE VÁLVULA ══ */}
      {sub === 'cierre' && (
        <div>
          <Tit t="Tiempo de cierre seguro de válvula — Joukowsky / ASME B31.8" />
          <Info t="Si t_cierre ≥ 2L/a → la onda de presión vuelve antes que cierre → presión controlada. Si t_cierre < 2L/a → golpe de ariete máximo." />

          <div style={g2}>
            <div><label style={lbl}>Tipo de fluido</label>
              <select value={cFluido} onChange={e => setCfluido(e.target.value)} style={inp}>
                {Object.entries(FLUIDOS).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.nombre}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Grado de cañería</label>
              <select value={cGrado} onChange={e => setCgrado(e.target.value)} style={inp}>
                {Object.entries(GRADOS).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.label}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Diámetro exterior OD (mm)</label>
              <input value={cDmm} onChange={e => setCdmm(e.target.value)} style={inp} type="number" min="10" step="0.1" />
            </div>
            <div><label style={lbl}>Espesor de pared (mm)</label>
              <input value={cTmm} onChange={e => setCtmm(e.target.value)} style={inp} type="number" min="1" step="0.1" />
            </div>
            <div><label style={lbl}>Longitud del tramo (m)</label>
              <input value={cLm} onChange={e => setClm(e.target.value)} style={inp} type="number" min="10" step="10" />
            </div>
            <div><label style={lbl}>Velocidad de flujo (m/s)</label>
              <input value={cVms} onChange={e => setCvms(e.target.value)} style={inp} type="number" min="0.1" step="0.1" />
            </div>
            <div><label style={lbl}>Presión de operación (bar)</label>
              <input value={cPbar} onChange={e => setCpbar(e.target.value)} style={inp} type="number" min="1" step="1" />
            </div>
            <div><label style={lbl}>Tiempo de cierre de válvula (s)</label>
              <input value={cTcierreS} onChange={e => setCtcierreS(e.target.value)} style={inp} type="number" min="0.1" step="0.5" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Actuador eléctrico típico: 30–120 s · Cierre manual: variable</div>
            </div>
          </div>

          <Btn onClick={calcCierre} text="Verificar tiempo de cierre" />

          {resCi && (
            <ResBox ok={resCi.ok}>
              <RLbl t={resCi.ok ? '✅ CIERRE SEGURO — Dentro del límite de Joukowsky' : '❌ CIERRE PELIGROSO — Generará golpe de ariete'} ok={resCi.ok} />
              <div style={g4}>
                <Card label="Celeridad de onda" val={`${resCi.a_ms} m/s`} />
                <Card label="Tiempo mínimo seguro" val={`${resCi.t_seg_s} s`} sub="= 2L/a" color={resCi.ok ? '#4ade80' : '#ef4444'} />
                <Card label="Sobrepresión estimada" val={`${resCi.dP_bar} bar`} color={resCi.ok ? COLOR : '#ef4444'} />
                <Card label="Presión total resultante" val={`${resCi.P_total_bar} bar`} color={resCi.ok ? '#4ade80' : '#ef4444'} sub="P_oper + ΔP_ariete" />
              </div>
              <div style={{ fontSize: 12, padding: '10px 14px', background: '#0a0f1e', borderRadius: 8, color: '#f1f5f9', marginTop: 8 }}>
                <span style={{ color: COLOR, fontWeight: 700 }}>Diagnóstico: </span>{resCi.riesgo}
              </div>
            </ResBox>
          )}
        </div>
      )}

      {/* ══ VIDA REMANENTE ══ */}
      {sub === 'remanente' && (
        <div>
          <Tit t="Vida remanente de cañería — API 579-1/ASME FFS-1 · API 570" />
          <Info t="Evaluación de aptitud para el servicio (Fitness-For-Service). Vida remanente = (t_medido − t_mínimo) / tasa de corrosión anual." />

          <div style={g2}>
            <div><label style={lbl}>Espesor nominal original (mm)</label>
              <input value={rTnom} onChange={e => setRtnom(e.target.value)} style={inp} type="number" min="1" step="0.1" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Espesor de fabricación según especificación original</div>
            </div>
            <div><label style={lbl}>Espesor medido hoy (mm)</label>
              <input value={rTmed} onChange={e => setRtmed(e.target.value)} style={inp} type="number" min="0.5" step="0.1" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Medición por ultrasonido UT en campo — punto mínimo</div>
            </div>
            <div><label style={lbl}>Espesor mínimo requerido (mm)</label>
              <input value={rTmin} onChange={e => setRtmin(e.target.value)} style={inp} type="number" min="0.5" step="0.1" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>t_min calculado por B31.8 o B31.4 según presión de diseño</div>
            </div>
            <div><label style={lbl}>Tasa de corrosión (mm/año)</label>
              <input value={rCorr} onChange={e => setRcorr(e.target.value)} style={inp} type="number" min="0.01" step="0.01" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Agua prod. sin trat.: 0.5–2 mm/año · Con inhibidor: 0.1–0.3 mm/año</div>
            </div>
          </div>

          <Btn onClick={calcRemanente} text="Calcular vida remanente" />

          {resRem && (
            <ResBox ok={resRem.vida_anios > 5}>
              <RLbl t={`RESULTADO — ${resRem.estado}`} ok={resRem.vida_anios > 5} />
              <div style={g3}>
                <Card
                  label="Vida remanente estimada"
                  val={resRem.vida_anios > 0 ? `${resRem.vida_anios} años` : 'Agotada'}
                  color={resRem.vida_anios > 10 ? '#4ade80' : resRem.vida_anios > 3 ? '#f59e0b' : '#ef4444'}
                />
                <Card label="Estado de integridad" val={resRem.estado} color={resRem.vida_anios > 5 ? COLOR : '#ef4444'} />
                <Card label="Nivel de riesgo" val={resRem.riesgo} />
              </div>
              <div style={{ fontSize: 12, padding: '10px 14px', background: '#0a0f1e', borderRadius: 8, color: '#f1f5f9', marginTop: 8, lineHeight: 1.6 }}>
                <span style={{ color: COLOR, fontWeight: 700 }}>Recomendación API 579: </span>{resRem.rec}
              </div>
              <Warn t="⚠️ La evaluación de vida remanente requiere inspección física API 570 por inspector certificado. Este cálculo es orientativo basado en los datos ingresados." />
            </ResBox>
          )}
        </div>
      )}
    </div>
  );
} 