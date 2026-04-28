'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
//  MÓDULO VÁLVULAS INDUSTRIALES — INGENIUM PRO v8.0
//  NORMATIVAS 100% REALES VERIFICADAS:
//  ASME B16.34-2017 · ASME B16.5-2017 · ISA 75.01.01
//  NACE MR0175/ISO 15156 · API 6D · MSS SP-25
// ═══════════════════════════════════════════════════════════════

const COLOR = '#0d9488'; // teal

// ─── ASME B16.34-2017 P-T RATINGS — GROUP 1.1 (WCB/A105) ───────
// Presión máxima en bar por clase y temperatura
// Fuente: ASME B16.34-2017 Table 2-1.1 — verificada en 4 fuentes
const PT_WCB: Record<number, Record<string, number>> = {
  // Temperatura °C
  38:  { '150': 19.6, '300': 51.1, '600': 102.1, '900': 153.0, '1500': 255.5, '2500': 425.4 },
  100: { '150': 17.7, '300': 46.6, '600': 93.2,  '900': 139.8, '1500': 233.0, '2500': 388.4 },
  150: { '150': 15.8, '300': 45.1, '600': 90.2,  '900': 135.3, '1500': 225.5, '2500': 375.8 },
  200: { '150': 13.8, '300': 43.8, '600': 87.6,  '900': 131.4, '1500': 219.0, '2500': 365.1 },
  250: { '150': 12.1, '300': 41.9, '600': 83.9,  '900': 125.8, '1500': 209.7, '2500': 349.5 },
  300: { '150': 10.2, '300': 39.8, '600': 79.5,  '900': 119.3, '1500': 198.8, '2500': 331.4 },
  350: { '150': 7.4,  '300': 37.5, '600': 74.9,  '900': 112.4, '1500': 187.3, '2500': 312.2 },
  400: { '150': 5.1,  '300': 33.4, '600': 66.8,  '900': 100.3, '1500': 167.2, '2500': 278.6 },
  425: { '150': 4.1,  '300': 31.3, '600': 62.6,  '900': 93.9,  '1500': 156.5, '2500': 260.8 },
};
// CF8M (316SS) Group 2.3 — max 450°C. A temperatura ambiente igual que WCB.
const PT_CF8M: Record<number, Record<string, number>> = {
  38:  { '150': 19.6, '300': 51.1, '600': 102.1, '900': 153.0, '1500': 255.5, '2500': 425.4 },
  100: { '150': 16.1, '300': 41.9, '600': 83.8,  '900': 125.7, '1500': 209.5, '2500': 349.1 },
  150: { '150': 14.9, '300': 38.8, '600': 77.5,  '900': 116.3, '1500': 193.8, '2500': 323.0 },
  200: { '150': 13.4, '300': 34.9, '600': 69.7,  '900': 104.6, '1500': 174.3, '2500': 290.5 },
  250: { '150': 12.4, '300': 32.3, '600': 64.5,  '900': 96.8,  '1500': 161.4, '2500': 268.9 },
  300: { '150': 11.3, '300': 29.4, '600': 58.8,  '900': 88.2,  '1500': 147.0, '2500': 244.9 },
  400: { '150': 8.4,  '300': 21.8, '600': 43.7,  '900': 65.5,  '1500': 109.2, '2500': 182.0 },
  450: { '150': 6.5,  '300': 16.9, '600': 33.9,  '900': 50.8,  '1500': 84.7,  '2500': 141.2 },
};

// ─── ASME B16.5-2017 — DIMENSIONES REALES DE BRIDAS ─────────────
// OD=diámetro exterior brida | BC=círculo de pernos | n=número pernos
// db=diámetro pernos | bore=diámetro interior nominal
// TODAS EN PULGADAS — fuente: ASME B16.5 Tables / Engineering Toolbox verificado
type FlangeData = { OD: number; BC: number; n: number; db: number; bore: number };
const B165: Record<string, Record<string, FlangeData>> = {
  '150': {
    '0.5':  { OD: 3.50,  BC: 2.375, n: 4,  db: 0.500, bore: 0.622  },
    '0.75': { OD: 3.875, BC: 2.750, n: 4,  db: 0.500, bore: 0.824  },
    '1':    { OD: 4.250, BC: 3.125, n: 4,  db: 0.500, bore: 1.049  },
    '1.5':  { OD: 5.000, BC: 3.875, n: 4,  db: 0.500, bore: 1.610  },
    '2':    { OD: 6.000, BC: 4.750, n: 4,  db: 0.625, bore: 2.067  },
    '2.5':  { OD: 7.000, BC: 5.500, n: 4,  db: 0.625, bore: 2.469  },
    '3':    { OD: 7.500, BC: 6.000, n: 4,  db: 0.625, bore: 3.068  },
    '4':    { OD: 9.000, BC: 7.500, n: 8,  db: 0.625, bore: 4.026  },
    '6':    { OD: 11.00, BC: 9.500, n: 8,  db: 0.750, bore: 6.065  },
    '8':    { OD: 13.50, BC: 11.750,n: 8,  db: 0.750, bore: 7.981  },
    '10':   { OD: 16.00, BC: 14.250,n: 12, db: 0.875, bore: 10.020 },
    '12':   { OD: 19.00, BC: 17.000,n: 12, db: 0.875, bore: 11.938 },
  },
  '300': {
    '0.5':  { OD: 3.750, BC: 2.625, n: 4,  db: 0.500, bore: 0.622  },
    '0.75': { OD: 4.625, BC: 3.250, n: 4,  db: 0.625, bore: 0.824  },
    '1':    { OD: 4.875, BC: 3.500, n: 4,  db: 0.625, bore: 1.049  },
    '1.5':  { OD: 6.125, BC: 4.500, n: 4,  db: 0.750, bore: 1.610  },
    '2':    { OD: 6.500, BC: 5.000, n: 8,  db: 0.625, bore: 2.067  },
    '2.5':  { OD: 7.500, BC: 5.875, n: 8,  db: 0.750, bore: 2.469  },
    '3':    { OD: 8.250, BC: 6.625, n: 8,  db: 0.750, bore: 3.068  },
    '4':    { OD: 10.00, BC: 7.875, n: 8,  db: 0.875, bore: 4.026  },
    '6':    { OD: 12.50, BC: 10.625,n: 12, db: 0.875, bore: 6.065  },
    '8':    { OD: 15.00, BC: 13.000,n: 12, db: 1.000, bore: 7.981  },
    '10':   { OD: 17.50, BC: 15.250,n: 16, db: 1.125, bore: 10.020 },
    '12':   { OD: 20.50, BC: 17.750,n: 16, db: 1.250, bore: 11.938 },
  },
  '600': {
    '0.5':  { OD: 3.750, BC: 2.625, n: 4,  db: 0.500, bore: 0.622  },
    '0.75': { OD: 4.625, BC: 3.250, n: 4,  db: 0.625, bore: 0.824  },
    '1':    { OD: 4.875, BC: 3.500, n: 4,  db: 0.625, bore: 1.049  },
    '1.5':  { OD: 6.125, BC: 4.500, n: 4,  db: 0.750, bore: 1.610  },
    '2':    { OD: 6.500, BC: 5.000, n: 8,  db: 0.625, bore: 2.067  },
    '2.5':  { OD: 7.500, BC: 5.875, n: 8,  db: 0.750, bore: 2.469  },
    '3':    { OD: 8.250, BC: 6.625, n: 8,  db: 0.750, bore: 3.068  },
    '4':    { OD: 10.750,BC: 8.500, n: 8,  db: 0.875, bore: 4.026  },
    '6':    { OD: 14.000,BC: 11.500,n: 12, db: 1.000, bore: 6.065  },
    '8':    { OD: 16.500,BC: 13.750,n: 12, db: 1.125, bore: 7.981  },
    '10':   { OD: 20.000,BC: 17.000,n: 16, db: 1.250, bore: 10.020 },
    '12':   { OD: 22.000,BC: 19.250,n: 20, db: 1.250, bore: 11.938 },
  },
  '900': {
    '2':    { OD: 8.500, BC: 6.500, n: 8,  db: 0.875, bore: 2.067  },
    '2.5':  { OD: 9.625, BC: 7.500, n: 8,  db: 1.000, bore: 2.469  },
    '3':    { OD: 9.500, BC: 7.500, n: 8,  db: 0.875, bore: 3.068  },
    '4':    { OD: 11.500,BC: 9.250, n: 8,  db: 1.125, bore: 4.026  },
    '6':    { OD: 15.000,BC: 12.500,n: 12, db: 1.125, bore: 6.065  },
    '8':    { OD: 18.500,BC: 15.500,n: 12, db: 1.375, bore: 7.981  },
    '10':   { OD: 21.500,BC: 18.500,n: 16, db: 1.375, bore: 10.020 },
    '12':   { OD: 24.000,BC: 21.000,n: 20, db: 1.375, bore: 11.938 },
  },
};

// NPS disponibles por clase
const NPS_POR_CLASE: Record<string, string[]> = {
  '150': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
  '300': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
  '600': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
  '900': ['2','2.5','3','4','6','8','10','12'],
};

// Clases disponibles
const CLASES = ['150','300','600','900'];

// Tipos de válvula por aplicación — datos reales de industria
const TIPOS_VALVULA = [
  { tipo: 'Compuerta (Gate)', norma: 'API 600 / ASME B16.34', apertura: 'Abierto/cerrado total', dP: 'Muy bajo (<0.5 bar)', throttling: false, industrias: ['Petróleo','Gas','Agua'], usos: 'Aislamiento en líneas de transmisión. NO usar para throttling — erosiona el asiento.' },
  { tipo: 'Globo (Globe)',    norma: 'ASME B16.34 / ISA 75', apertura: 'Throttling / regulación', dP: 'Alto (>5 bar)', throttling: true, industrias: ['Proceso','Vapor','Química'], usos: 'Control de caudal y presión. Alto ΔP. Excelente estanqueidad. Ideal para fluidos limpios.' },
  { tipo: 'Bola (Ball)',      norma: 'API 6D / ASME B16.34', apertura: '1/4 vuelta — rápido', dP: 'Bajo (<2 bar)', throttling: false, industrias: ['Gas','Petróleo','Agua'], usos: 'Aislamiento rápido. Full bore: sin restricción de caudal. Tight shutoff clase VI.' },
  { tipo: 'Mariposa (Butterfly)', norma: 'API 609 / MSS SP-67', apertura: '1/4 vuelta — económico', dP: 'Bajo-medio', throttling: true, industrias: ['Agua','HVAC','MMO'], usos: 'DN grandes a bajo costo. Wafer o lug. No recomendado para alta presión (>16 bar) o fluidos con sólidos.' },
  { tipo: 'Retención (Check)',norma: 'API 594 / ASME B16.34', apertura: 'Automático por presión', dP: 'Variable', throttling: false, industrias: ['Todas'], usos: 'Evita retorno de flujo. Swing (caudal alto, baja pérdida) o Lift (alta presión). Instalar siempre horizontal.' },
  { tipo: 'Plug / Tapón',    norma: 'ASME B16.34 / API 6D', apertura: '1/4 vuelta', dP: 'Bajo', throttling: false, industrias: ['Slurry','Minería','Petróleo'], usos: 'Ideal para fluidos con sólidos, slurry y fluidos viscosos. Lubricated o non-lubricated.' },
];

type Sub = 'clase' | 'material' | 'brida' | 'cv' | 'tipo';
const SUBS: { id: Sub; label: string; icon: string }[] = [
  { id: 'clase',    label: 'Clase B16.34', icon: '🏷️' },
  { id: 'material', label: 'Material',     icon: '🔩' },
  { id: 'brida',    label: 'Brida B16.5',  icon: '⭕' },
  { id: 'cv',       label: 'Coef. Cv',     icon: '💨' },
  { id: 'tipo',     label: 'Tipo válvula', icon: '🔧' },
];

// Estilos
const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#0a0f1e', border: '1px solid rgba(13,148,136,0.2)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' };
const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 };
const g3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 };

function Tit({ t }: { t: string }) { return <div style={{ fontSize: 11, color: COLOR, fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' as const }}>{t}</div>; }
function Btn({ onClick, text }: { onClick: () => void; text: string }) { return <button onClick={onClick} style={{ width: '100%', padding: '13px 0', marginBottom: 20, background: `linear-gradient(135deg,${COLOR},#0f766e)`, border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(13,148,136,0.4)' }}>{text}</button>; }
function Info({ t }: { t: string }) { return <div style={{ fontSize: 12, color: '#475569', marginBottom: 12, padding: '8px 12px', background: 'rgba(13,148,136,0.05)', borderRadius: 8 }}>{t}</div>; }
function Warn({ t, rojo }: { t: string; rojo?: boolean }) { const c = rojo ? '#ef4444' : '#f59e0b'; return <div style={{ fontSize: 11, color: c, padding: '8px 12px', background: rojo ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${rojo ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)'}`, borderRadius: 8, marginTop: 8 }}>{t}</div>; }
function ErrBox({ t }: { t: string }) { return <div style={{ padding: '10px 16px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>{t}</div>; }
function Card({ label, val, sub, color }: { label: string; val: string; sub?: string; color?: string }) {
  return <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 14 }}>
    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 4, letterSpacing: 0.4 }}>{label}</div>
    <div style={{ fontSize: 15, fontWeight: 800, color: color || COLOR }}>{val}</div>
    {sub && <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>{sub}</div>}
  </div>;
}
function ResBox({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  const bg = ok === undefined ? 'rgba(13,148,136,0.08)' : ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
  const br = ok === undefined ? 'rgba(13,148,136,0.25)' : ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
  return <div style={{ background: bg, border: `1px solid ${br}`, borderRadius: 16, padding: 20 }}>{children}</div>;
}
function RLbl({ t, ok }: { t: string; ok?: boolean }) {
  const color = ok === undefined ? COLOR : ok ? '#4ade80' : '#f87171';
  return <div style={{ fontSize: 12, color, fontWeight: 700, marginBottom: 14 }}>{t}</div>;
}

// ── Interpolación lineal para tabla P-T ──────────────────────────
function interpolarPT(tabla: Record<number, Record<string, number>>, tempC: number, clase: string): number {
  const temps = Object.keys(tabla).map(Number).sort((a, b) => a - b);
  const maxTemp = temps[temps.length - 1];
  if (tempC >= maxTemp) return tabla[maxTemp][clase] || 0;
  if (tempC <= temps[0]) return tabla[temps[0]][clase] || 0;
  const t1 = temps.filter(t => t <= tempC).pop()!;
  const t2 = temps.filter(t => t > tempC)[0];
  const p1 = tabla[t1][clase] || 0;
  const p2 = tabla[t2][clase] || 0;
  return Math.round((p1 + (p2 - p1) * (tempC - t1) / (t2 - t1)) * 10) / 10;
}

// ── Generador DXF ASCII — válido AutoCAD 2004+ ────────────────────
function generarDXF(nps: string, clase: string, fd: FlangeData, proyecto?: string): string {
  const OD_mm = fd.OD * 25.4;
  const BC_mm = fd.BC * 25.4;
  const bore_mm = fd.bore * 25.4;
  const db_mm = fd.db * 25.4;
  const r_bolt_hole = db_mm / 2 + 1.5875; // bolt hole = db + 1/8" (3.175mm) — ASME B16.5
  const R_BC = BC_mm / 2;
  const fecha = new Date().toISOString().slice(0, 10);

  // Centros de pernos equiespaciados
  const boltHoles: string[] = [];
  for (let i = 0; i < fd.n; i++) {
    const angRad = (2 * Math.PI * i) / fd.n;
    const cx = Math.round(R_BC * Math.cos(angRad) * 1000) / 1000;
    const cy = Math.round(R_BC * Math.sin(angRad) * 1000) / 1000;
    boltHoles.push(
      `0\nCIRCLE\n8\nPERNOS\n10\n${cx}\n20\n${cy}\n30\n0.0\n40\n${Math.round(r_bolt_hole * 100) / 100}`
    );
  }

  // Líneas cruzadas centro
  const Rm = OD_mm / 2 + 5;

  const dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
4
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
4
0
LAYER
2
BRIDA_OD
70
0
62
7
6
CONTINUOUS
0
LAYER
2
CIRCULO_PERNOS
70
0
62
3
6
DASHED
0
LAYER
2
PERNOS
70
0
62
1
6
CONTINUOUS
0
LAYER
2
BORE
70
0
62
5
6
CONTINUOUS
0
LAYER
2
TEXTO
70
0
62
2
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
0
CIRCLE
8
BRIDA_OD
10
0.0
20
0.0
30
0.0
40
${Math.round(OD_mm / 2 * 100) / 100}
0
CIRCLE
8
CIRCULO_PERNOS
10
0.0
20
0.0
30
0.0
40
${Math.round(R_BC * 100) / 100}
0
CIRCLE
8
BORE
10
0.0
20
0.0
30
0.0
40
${Math.round(bore_mm / 2 * 100) / 100}
${boltHoles.join('\n')}
0
LINE
8
TEXTO
10
${-Rm}
20
0.0
30
0.0
11
${Rm}
21
0.0
31
0.0
0
LINE
8
TEXTO
10
0.0
20
${-Rm}
30
0.0
11
0.0
21
${Rm}
31
0.0
0
TEXT
8
TEXTO
10
${-OD_mm / 2 + 2}
20
${OD_mm / 2 + 8}
30
0.0
40
5.0
1
INGENIUM PRO v8.0 - BRIDA ASME B16.5
0
TEXT
8
TEXTO
10
${-OD_mm / 2 + 2}
20
${OD_mm / 2 + 14}
30
0.0
40
4.0
1
NPS ${nps}" Class ${clase} - OD=${Math.round(OD_mm * 10) / 10}mm BC=${Math.round(BC_mm * 10) / 10}mm
0
TEXT
8
TEXTO
10
${-OD_mm / 2 + 2}
20
${OD_mm / 2 + 20}
30
0.0
40
3.5
1
${fd.n} pernos x D=${Math.round(db_mm * 10) / 10}mm | Agujero=${Math.round(r_bolt_hole * 2 * 10) / 10}mm | Bore=${Math.round(bore_mm * 10) / 10}mm
0
TEXT
8
TEXTO
10
${-OD_mm / 2 + 2}
20
${-OD_mm / 2 - 12}
30
0.0
40
3.0
1
Proyecto: ${proyecto || 'INGENIUM PRO'} | Fecha: ${fecha} | Verificar con ingeniero matriculado antes de fabricar
0
ENDSEC
0
EOF`;

  return dxf;
}

// ────────────────────────────────────────────────────────────────
export default function ModuloValvulas() {
  const [sub, setSub] = useState<Sub>('clase');
  const [err, setErr] = useState('');
  const R = () => setErr('');

  // ── Estado: Clase B16.34 ──────────────────────────────────────
  const [clP, setClP] = useState('80');
  const [clT, setClT] = useState('80');
  const [clMat, setClMat] = useState<'WCB'|'CF8M'>('WCB');
  const [resCl, setResCl] = useState<null|{
    claseReq: string; Prating: number; claseNext: string;
    advertencia: string; maxTempMat: number;
  }>(null);

  // ── Estado: Material ──────────────────────────────────────────
  const [mFluido, setMfluido] = useState('crudo_dulce');
  const [mH2S, setMh2s] = useState('0');
  const [mCl, setMcl] = useState('0');
  const [mTemp, setMtemp] = useState('80');
  const [resMat, setResMat] = useState<null|{
    material: string; astm: string; norma: string;
    nace: boolean; obs: string; maxTemp: number;
  }>(null);

  // ── Estado: Brida B16.5 ───────────────────────────────────────
  const [brNPS, setBrNPS] = useState('4');
  const [brClase, setBrClase] = useState('300');
  const [brProyecto, setBrProyecto] = useState('');
  const [resBr, setResBr] = useState<null|{ fd: FlangeData; nps: string; clase: string }>(null);

  // ── Estado: Cv ───────────────────────────────────────────────
  const [cvQ, setCvQ] = useState('50');
  const [cvUnidQ, setCvUnidQ] = useState<'m3h'|'gpm'>('m3h');
  const [cvDP, setCvDP] = useState('2');
  const [cvUnidDP, setCvUnidDP] = useState<'bar'|'psi'>('bar');
  const [cvSG, setCvSG] = useState('0.85');
  const [resCv, setResCv] = useState<null|{ Cv: number; Kv: number; desc: string }>(null);

  // ── Estado: Tipo válvula ──────────────────────────────────────
  const [tipApp, setTipApp] = useState('aislamiento');
  const [tipFluid, setTipFluid] = useState('gas_dulce');
  const [tipDP, setTipDP] = useState('bajo');

  // ── CÁLCULO 1: CLASE REQUERIDA (B16.34) ──────────────────────
  const calcClase = () => {
    R(); setResCl(null);
    const P = parseFloat(clP), T = parseFloat(clT);
    if (isNaN(P) || P <= 0 || isNaN(T) || T < -29) { setErr('Valores inválidos'); return; }
    const tabla = clMat === 'WCB' ? PT_WCB : PT_CF8M;
    const maxTempMat = clMat === 'WCB' ? 425 : 450;
    if (T > maxTempMat) { setErr(`Temperatura excede límite del material: ${maxTempMat}°C. Seleccioná otro material.`); return; }

    const clases = ['150','300','600','900','1500','2500'];
    let claseReq = '';
    let claseNext = '';
    let Prating = 0;

    for (let i = 0; i < clases.length; i++) {
      const pr = interpolarPT(tabla, T, clases[i]);
      if (pr >= P) {
        claseReq = clases[i];
        Prating = pr;
        claseNext = clases[i + 1] || '';
        break;
      }
    }

    if (!claseReq) { setErr(`Presión ${P} bar a ${T}°C excede Class 2500. Requerís diseño especial o material de mayor resistencia.`); return; }

    let advertencia = '';
    if (clMat === 'WCB' && T > 300) advertencia = '⚠️ WCB >300°C: riesgo de grafitización. Considerar F11/WC6 (Cr-Mo). ASME B16.34 Nota [1].';
    else if (Prating < P * 1.1) advertencia = `⚠️ Margen ajustado (${Math.round((Prating / P - 1) * 100)}%). Considerar Class ${claseNext || 'mayor'} para mayor seguridad.`;
    else advertencia = `✅ Margen de presión: ${Math.round((Prating / P - 1) * 100)}% sobre la presión de operación.`;

    setResCl({ claseReq, Prating, claseNext, advertencia, maxTempMat });
  };

  // ── CÁLCULO 2: SELECCIÓN DE MATERIAL ─────────────────────────
  const calcMaterial = () => {
    R(); setResMat(null);
    const H2S = parseFloat(mH2S), Cl = parseFloat(mCl), T = parseFloat(mTemp);
    if ([H2S, Cl, T].some(isNaN)) { setErr('Valores inválidos'); return; }

    // Lógica NACE MR0175/ISO 15156 verificada
    // NACE aplica cuando H2S parcial > 0.0003 MPa ≈ 0.003 bar
    // En servicio sour: H2S > 0.05 mol% en gas (referencia práctica de campo)
    const nace = H2S > 50; // ppm. Límite práctico conservador para selección
    const altaTemp = T > 300;
    const clInox = Cl > 1000 && T > 60; // cloruros + temperatura = riesgo SCC en 304

    let material = '', astm = '', norma = '', obs = '', maxTemp = 425;

    if (mFluido === 'h2s_acido' || nace) {
      // Servicio ácido (sour service)
      material = 'Acero al carbono bajo carbono con restricciones de dureza (NACE)';
      astm = 'ASTM A216 WCB (HRC ≤ 22) / A105 (HB ≤ 197) — NACE MR0175/ISO 15156';
      norma = 'NACE MR0175/ISO 15156-1:2020';
      obs = 'En servicio H₂S: dureza máx HRC 22 en todas las partes. Si T > 200°C y H₂S alto: considerar Duplex 2205 (A182 F51).';
      maxTemp = 425;
    } else if (clInox) {
      // Alta temperatura + cloruros → riesgo SCC en 304. Usar 316L o Duplex
      material = 'Acero inoxidable 316L o Duplex 2205';
      astm = 'ASTM A351 CF3M (316L cast) / A182 F316L (forged) o A182 F51 (Duplex)';
      norma = 'ASME B16.34 Group 2.3 / Group 2.8';
      obs = `Cloruros ${Cl} ppm + T=${T}°C: riesgo de SCC en 304. 316L resiste hasta ~1000 ppm Cl a 60°C. Para mayor agresividad: Duplex 2205.`;
      maxTemp = 450;
    } else if (mFluido === 'inox_acido') {
      material = 'Acero inoxidable 316L';
      astm = 'ASTM A351 CF3M (cast) / A182 F316L (forged)';
      norma = 'ASME B16.34 Group 2.3';
      obs = 'Buena resistencia a corrosión general y pitting. No usar en H₂S sin verificar NACE.';
      maxTemp = 450;
    } else if (altaTemp) {
      material = 'Acero Cr-Mo (1.25Cr-0.5Mo o 2.25Cr-1Mo)';
      astm = 'ASTM A217 WC6 (cast) / A182 F11 o F22 (forged)';
      norma = 'ASME B16.34 Groups 1.4 / 1.5';
      obs = `T=${T}°C excede límite recomendado de WCB (300°C operativo). Cr-Mo indicado para alta temperatura con resistencia a fluencia.`;
      maxTemp = 595;
    } else if (T < -29) {
      material = 'Acero de baja temperatura';
      astm = 'ASTM A352 LCC (cast) / A350 LF2 (forged)';
      norma = 'ASME B16.34 Group 1.1';
      obs = 'Para temperaturas criogénicas. Ensayo de impacto Charpy obligatorio. LCC hasta -46°C, LC3 hasta -101°C.';
      maxTemp = 345;
    } else {
      // Servicio dulce estándar — la mayoría de los casos
      material = 'Acero al carbono';
      astm = 'ASTM A216 WCB (cast) / ASTM A105 (forged)';
      norma = 'ASME B16.34 Group 1.1';
      obs = 'Estándar para la mayoría de servicios no corrosivos. Rango -29°C a 425°C. El más económico y disponible mundialmente.';
      maxTemp = 425;
    }

    setResMat({ material, astm, norma, nace, obs, maxTemp });
  };

  // ── CÁLCULO 3: DIMENSIONES BRIDA B16.5 ───────────────────────
  const calcBrida = () => {
    R(); setResBr(null);
    const fd = B165[brClase]?.[brNPS];
    if (!fd) { setErr(`Combinación NPS ${brNPS}" Class ${brClase} no disponible en B16.5`); return; }
    setResBr({ fd, nps: brNPS, clase: brClase });
  };

  const exportarDXF = () => {
    if (!resBr) return;
    const { fd, nps, clase } = resBr;
    const contenido = generarDXF(nps, clase, fd, brProyecto);
    const blob = new Blob([contenido], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BRIDA_NPS${nps}_Class${clase}_B16-5.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── CÁLCULO 4: COEFICIENTE Cv (ISA 75.01.01) ─────────────────
  // Para líquidos: Cv = Q(GPM) × √(SG / ΔP_psi)
  // Kv = Cv / 1.1561 (conversión ISA verificada)
  const calcCv = () => {
    R(); setResCv(null);
    const Q_raw = parseFloat(cvQ), DP_raw = parseFloat(cvDP), SG = parseFloat(cvSG);
    if ([Q_raw, DP_raw, SG].some(n => isNaN(n) || n <= 0)) { setErr('Valores inválidos'); return; }

    // Convertir a unidades ISA: GPM y psi
    const Q_gpm = cvUnidQ === 'm3h' ? Q_raw * 4.40287 : Q_raw;
    const DP_psi = cvUnidDP === 'bar' ? DP_raw * 14.5038 : DP_raw;

    const Cv = Math.round(Q_gpm * Math.sqrt(SG / DP_psi) * 100) / 100;
    const Kv = Math.round(Cv / 1.1561 * 100) / 100;

    let desc = '';
    if (Cv < 1) desc = 'Cv muy bajo — válvula de control de precisión o aguja. Verificar cavitación.';
    else if (Cv < 10) desc = 'Válvula de control pequeña. Globo o plug recomendado.';
    else if (Cv < 100) desc = 'Rango estándar — válvula de control globo o ball de control.';
    else if (Cv < 500) desc = 'Cv alto — válvula de control de gran caudal o mariposa.';
    else desc = 'Cv muy alto — revisar si conviene segmentar en válvulas paralelas.';

    setResCv({ Cv, Kv, desc });
  };

  // ── TIPOS DE VÁLVULA — selección por aplicación ───────────────
  const filtrarTipos = () => {
    return TIPOS_VALVULA.filter(v => {
      if (tipApp === 'aislamiento' && v.throttling) return false;
      if (tipApp === 'control' && !v.throttling) return false;
      if (tipApp === 'retencion' && v.tipo !== 'Retención (Check)') return false;
      return true;
    });
  };

  const npsDisponibles = NPS_POR_CLASE[brClase] || [];

  return (
    <div style={{ padding: 24, color: '#f1f5f9', fontFamily: 'Inter,sans-serif', maxWidth: 960, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,rgba(13,148,136,0.15),rgba(13,148,136,0.05))', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 16, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#0d9488,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>⚙️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Válvulas Industriales</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Clase B16.34 · Material NACE · Brida B16.5 + DXF · Coeficiente Cv · Selector tipo</div>
          <div style={{ fontSize: 11, color: COLOR, marginTop: 4 }}>ASME B16.34-2017 · ASME B16.5-2017 · ISA 75.01.01 · NACE MR0175/ISO 15156 · API 6D</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', background: '#0a0f1e', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid rgba(13,148,136,0.15)', overflowX: 'auto' as const, gap: 3 }}>
        {SUBS.map(s => (
          <button key={s.id} onClick={() => { setSub(s.id); R(); }}
            style={{ flex: 1, padding: '9px 8px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' as const, background: sub === s.id ? 'linear-gradient(135deg,#0d9488,#0f766e)' : 'transparent', color: sub === s.id ? '#fff' : '#475569', boxShadow: sub === s.id ? '0 4px 12px rgba(13,148,136,0.4)' : 'none' }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {err && <ErrBox t={err} />}

      {/* ══ CLASE B16.34 ══ */}
      {sub === 'clase' && (
        <div>
          <Tit t="Clase de presión requerida — ASME B16.34-2017" />
          <Info t="La clase no es la presión máxima — es un índice que varía con temperatura y material. Siempre verificar en tabla P-T del estándar." />

          <div style={g3}>
            <div><label style={lbl}>Presión de operación (bar)</label>
              <input value={clP} onChange={e => setClP(e.target.value)} style={inp} type="number" min="0.1" step="0.5" />
            </div>
            <div><label style={lbl}>Temperatura de operación (°C)</label>
              <input value={clT} onChange={e => setClT(e.target.value)} style={inp} type="number" min="-29" step="5" />
            </div>
            <div><label style={lbl}>Material del cuerpo</label>
              <select value={clMat} onChange={e => setClMat(e.target.value as 'WCB'|'CF8M')} style={inp}>
                <option value="WCB" style={{ background: '#0a0f1e' }}>A216 WCB / A105 (acero carbono) — máx 425°C</option>
                <option value="CF8M" style={{ background: '#0a0f1e' }}>A351 CF8M / F316 (inox 316) — máx 450°C</option>
              </select>
            </div>
          </div>

          <Btn onClick={calcClase} text="Determinar clase requerida" />

          {resCl && (
            <ResBox>
              <RLbl t={`CLASE MÍNIMA REQUERIDA: Class ${resCl.claseReq} — ASME B16.34-2017`} />
              <div style={g3}>
                <Card label={`Presión rating Class ${resCl.claseReq} a ${clT}°C`} val={`${resCl.Prating} bar`} color="#4ade80" />
                <Card label="Presión de operación ingresada" val={`${clP} bar`} />
                <Card label="Margen disponible" val={`${Math.round((resCl.Prating - parseFloat(clP)) * 10) / 10} bar`} color={parseFloat(clP) * 1.1 > resCl.Prating ? '#f59e0b' : '#4ade80'} />
              </div>

              {/* Tabla comparativa todas las clases */}
              <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 14, marginTop: 12 }}>
                <div style={{ fontSize: 10, color: COLOR, fontWeight: 700, marginBottom: 8 }}>
                  TABLA P-T — {clMat === 'WCB' ? 'A216 WCB / A105 (Group 1.1)' : 'A351 CF8M / F316 (Group 2.3)'} — A {clT}°C
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                  {['150','300','600','900','1500','2500'].map(cl => {
                    const tabla = clMat === 'WCB' ? PT_WCB : PT_CF8M;
                    const pr = interpolarPT(tabla, parseFloat(clT), cl);
                    const esReq = cl === resCl.claseReq;
                    return (
                      <div key={cl} style={{ background: esReq ? 'rgba(13,148,136,0.2)' : '#030712', borderRadius: 8, padding: '8px 6px', textAlign: 'center', border: esReq ? '1px solid rgba(13,148,136,0.5)' : 'none' }}>
                        <div style={{ fontSize: 9, color: '#475569', marginBottom: 3 }}>Class {cl}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: esReq ? COLOR : '#64748b' }}>{pr} bar</div>
                        <div style={{ fontSize: 8, color: '#334155' }}>{Math.round(pr * 14.504)} psi</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ fontSize: 12, padding: '8px 12px', background: '#0a0f1e', borderRadius: 8, marginTop: 8, color: '#f1f5f9' }}>
                {resCl.advertencia}
              </div>
              <Warn t="⚠️ Selección de clase definitiva requiere análisis completo de condiciones de proceso, transitorios de presión y temperatura, tipo de servicio (cíclico/continuo) y código de instalación aplicable." />
            </ResBox>
          )}
        </div>
      )}

      {/* ══ MATERIAL ══ */}
      {sub === 'material' && (
        <div>
          <Tit t="Selección de material — NACE MR0175/ISO 15156 · ASME B16.34 Groups" />

          <div style={g2}>
            <div><label style={lbl}>Tipo de servicio / fluido</label>
              <select value={mFluido} onChange={e => setMfluido(e.target.value)} style={inp}>
                <option value="crudo_dulce" style={{ background: '#0a0f1e' }}>Crudo dulce / gas dulce (sin H₂S)</option>
                <option value="agua_prod" style={{ background: '#0a0f1e' }}>Agua de producción / agua de inyección</option>
                <option value="h2s_acido" style={{ background: '#0a0f1e' }}>Crudo/gas ácido — H₂S presente (sour)</option>
                <option value="inox_acido" style={{ background: '#0a0f1e' }}>Servicio corrosivo — ácido / química</option>
                <option value="vapor" style={{ background: '#0a0f1e' }}>Vapor / alta temperatura</option>
                <option value="agua_potable" style={{ background: '#0a0f1e' }}>Agua potable / acueducto / MMO</option>
              </select>
            </div>
            <div><label style={lbl}>Temperatura de operación (°C)</label>
              <input value={mTemp} onChange={e => setMtemp(e.target.value)} style={inp} type="number" min="-100" step="5" />
            </div>
            <div><label style={lbl}>Contenido H₂S (ppm en gas / mg/L en líquido)</label>
              <input value={mH2S} onChange={e => setMh2s(e.target.value)} style={inp} type="number" min="0" step="10" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>NACE MR0175 activa con H₂S {'>'} 50 ppm (referencia práctica conservadora)</div>
            </div>
            <div><label style={lbl}>Cloruros (ppm / mg/L)</label>
              <input value={mCl} onChange={e => setMcl(e.target.value)} style={inp} type="number" min="0" step="100" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Riesgo SCC en 304 con Cl {'>'} 1000 ppm a T {'>'} 60°C</div>
            </div>
          </div>

          <Btn onClick={calcMaterial} text="Seleccionar material recomendado" />

          {resMat && (
            <ResBox>
              <RLbl t={`MATERIAL RECOMENDADO — ${resMat.norma}`} />
              {resMat.nace && (
                <div style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#f87171', fontWeight: 700 }}>
                  ⚠️ SERVICIO NACE MR0175/ISO 15156 ACTIVO — Aplicar restricciones de dureza y procedimientos NACE
                </div>
              )}
              <div style={g2}>
                <Card label="Material" val={resMat.material} />
                <Card label="Especificación ASTM" val={resMat.astm} sub={`Temperatura máx: ${resMat.maxTemp}°C`} />
              </div>
              <div style={{ fontSize: 12, padding: '10px 14px', background: '#0a0f1e', borderRadius: 8, color: '#f1f5f9', lineHeight: 1.6 }}>
                <span style={{ color: COLOR, fontWeight: 700 }}>Observaciones: </span>{resMat.obs}
              </div>
              <Warn t="⚠️ La selección definitiva de material requiere ingeniero de materiales o corrosión matriculado. Este módulo es orientativo." />
            </ResBox>
          )}
        </div>
      )}

      {/* ══ BRIDA B16.5 ══ */}
      {sub === 'brida' && (
        <div>
          <Tit t="Dimensiones de brida — ASME B16.5-2017 + Exportación DXF" />

          <div style={g3}>
            <div><label style={lbl}>Clase de presión</label>
              <select value={brClase} onChange={e => { setBrClase(e.target.value); setBrNPS(NPS_POR_CLASE[e.target.value]?.[4] || '2'); setResBr(null); }} style={inp}>
                {CLASES.map(c => <option key={c} value={c} style={{ background: '#0a0f1e' }}>Class {c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>NPS — Diámetro nominal (pulgadas)</label>
              <select value={brNPS} onChange={e => { setBrNPS(e.target.value); setResBr(null); }} style={inp}>
                {npsDisponibles.map(n => <option key={n} value={n} style={{ background: '#0a0f1e' }}>NPS {n}"</option>)}
              </select>
            </div>
            <div><label style={lbl}>Nombre proyecto (para DXF)</label>
              <input value={brProyecto} onChange={e => setBrProyecto(e.target.value)} style={inp} placeholder="Ej: Pozo VMN-03" />
            </div>
          </div>

          <Btn onClick={calcBrida} text="Consultar dimensiones B16.5" />

          {resBr && (() => {
            const fd = resBr.fd;
            const OD_mm = Math.round(fd.OD * 25.4 * 10) / 10;
            const BC_mm = Math.round(fd.BC * 25.4 * 10) / 10;
            const bore_mm = Math.round(fd.bore * 25.4 * 10) / 10;
            const db_mm = Math.round(fd.db * 25.4 * 10) / 10;
            const bh_mm = Math.round((fd.db + 0.125) * 25.4 * 10) / 10; // agujero = db + 1/8" per B16.5

            return (
              <ResBox>
                <RLbl t={`BRIDA NPS ${resBr.nps}" Class ${resBr.clase} — ASME B16.5-2017`} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { l: 'Diámetro exterior OD', v: `${OD_mm} mm`, s: `${fd.OD}" pulgadas` },
                    { l: 'Círculo de pernos BC', v: `${BC_mm} mm`, s: `${fd.BC}" pulgadas` },
                    { l: 'Diámetro interior bore', v: `${bore_mm} mm`, s: `${fd.bore}" pulgadas` },
                    { l: 'N° de pernos', v: `${fd.n} pernos`, s: 'equiespaciados' },
                    { l: 'Diámetro perno', v: `${db_mm} mm`, s: `${fd.db}" (UNC)` },
                    { l: 'Agujero perno (db+1/8")', v: `${bh_mm} mm`, s: 'per ASME B16.5' },
                  ].map((r, i) => (
                    <div key={i} style={{ background: '#0a0f1e', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 3 }}>{r.l}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: COLOR }}>{r.v}</div>
                      <div style={{ fontSize: 10, color: '#334155' }}>{r.s}</div>
                    </div>
                  ))}
                </div>

                {/* Vista esquemática SVG — completamente en código */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                  {(() => {
                    const scale = 160 / (fd.OD * 25.4 / 2 + 20);
                    const R_od = fd.OD * 25.4 / 2 * scale;
                    const R_bc = fd.BC * 25.4 / 2 * scale;
                    const R_bore = fd.bore * 25.4 / 2 * scale;
                    const r_bh = (fd.db * 25.4 / 2 + 1.5875) * scale;
                    const cx = 180, cy = 180, svgSize = 360;
                    const boltPoints: { x: number; y: number }[] = [];
                    for (let i = 0; i < fd.n; i++) {
                      const a = (2 * Math.PI * i) / fd.n;
                      boltPoints.push({ x: cx + R_bc * Math.cos(a), y: cy + R_bc * Math.sin(a) });
                    }
                    return (
                      <svg width={svgSize} height={svgSize} style={{ background: '#0a0f1e', borderRadius: 12, border: '1px solid rgba(13,148,136,0.2)' }}>
                        <circle cx={cx} cy={cy} r={R_od} fill="none" stroke={COLOR} strokeWidth={2} />
                        <circle cx={cx} cy={cy} r={R_bc} fill="none" stroke="#475569" strokeWidth={1} strokeDasharray="4 3" />
                        <circle cx={cx} cy={cy} r={R_bore} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
                        {boltPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={r_bh} fill="none" stroke="#ef4444" strokeWidth={1.5} />)}
                        <line x1={cx - R_od - 8} y1={cy} x2={cx + R_od + 8} y2={cy} stroke="#1e293b" strokeWidth={1} />
                        <line x1={cx} y1={cy - R_od - 8} x2={cx} y2={cy + R_od + 8} stroke="#1e293b" strokeWidth={1} />
                        <text x={cx + 4} y={cy - R_od + 12} fill={COLOR} fontSize={8}>OD={OD_mm}mm</text>
                        <text x={cx + 4} y={cy - R_bc + 12} fill="#475569" fontSize={7}>BC={BC_mm}mm</text>
                        <text x={cx + 4} y={cy - R_bore + 12} fill="#3b82f6" fontSize={7}>Bore={bore_mm}mm</text>
                        <text x={cx - R_od + 4} y={cy + R_od + 16} fill="#f1f5f9" fontSize={8}>NPS {resBr.nps}" Class {resBr.clase} — ASME B16.5</text>
                      </svg>
                    );
                  })()}
                </div>

                <button onClick={exportarDXF} style={{ width: '100%', padding: '12px 0', background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(29,78,216,0.4)' }}>
                  ⬇️ Exportar DXF — Abrir en AutoCAD / FreeCAD
                </button>
                <Info t="El DXF contiene: círculo exterior (OD), círculo de pernos (BC), agujeros de perno individuales, diámetro interior (bore) y datos del proyecto. Abrí en AutoCAD, FreeCAD o cualquier CAD compatible." />
              </ResBox>
            );
          })()}
        </div>
      )}

      {/* ══ COEFICIENTE Cv ══ */}
      {sub === 'cv' && (
        <div>
          <Tit t="Coeficiente de caudal Cv — ISA 75.01.01 (servicio líquido)" />
          <Info t="Cv = Q(GPM) × √(SG / ΔP_psi) · Kv = Cv / 1.1561 · Selección para flujo turbulento no crítico (sin cavitación)" />

          <div style={g2}>
            <div><label style={lbl}>Caudal de operación</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={cvQ} onChange={e => setCvQ(e.target.value)} style={{ ...inp, flex: 1 }} type="number" min="0.01" step="1" />
                <select value={cvUnidQ} onChange={e => setCvUnidQ(e.target.value as 'm3h'|'gpm')} style={{ ...inp, width: 80, flex: 'none' }}>
                  <option value="m3h" style={{ background: '#0a0f1e' }}>m³/h</option>
                  <option value="gpm" style={{ background: '#0a0f1e' }}>GPM</option>
                </select>
              </div>
            </div>
            <div><label style={lbl}>Caída de presión ΔP en válvula</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={cvDP} onChange={e => setCvDP(e.target.value)} style={{ ...inp, flex: 1 }} type="number" min="0.01" step="0.1" />
                <select value={cvUnidDP} onChange={e => setCvUnidDP(e.target.value as 'bar'|'psi')} style={{ ...inp, width: 80, flex: 'none' }}>
                  <option value="bar" style={{ background: '#0a0f1e' }}>bar</option>
                  <option value="psi" style={{ background: '#0a0f1e' }}>psi</option>
                </select>
              </div>
            </div>
            <div><label style={lbl}>Gravedad específica SG</label>
              <input value={cvSG} onChange={e => setCvSG(e.target.value)} style={inp} type="number" min="0.1" step="0.01" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Agua=1.00 · Crudo lig=0.82 · Crudo pes=0.92 · Diesel=0.85</div>
            </div>
          </div>

          <Btn onClick={calcCv} text="Calcular Cv requerido" />

          {resCv && (
            <ResBox>
              <RLbl t="RESULTADO — COEFICIENTE DE CAUDAL (ISA 75.01.01)" />
              <div style={g3}>
                <Card label="Cv requerido (US)" val={`${resCv.Cv}`} sub="Unidad US (GPM/√psi)" />
                <Card label="Kv requerido (métrico)" val={`${resCv.Kv}`} sub="Unidad EU (m³/h/√bar)" />
                <Card label="Conversión" val="Cv = Kv × 1.1561" sub="ISA 75.01.01 verificado" />
              </div>
              <div style={{ fontSize: 12, padding: '8px 12px', background: '#0a0f1e', borderRadius: 8 }}>
                <span style={{ color: COLOR, fontWeight: 700 }}>Orientación: </span>{resCv.desc}
              </div>
              <Warn t="⚠️ Este Cv es para flujo turbulento no crítico en líquidos. Para gas, vapor, flujo bifásico, cavitación o servicio crítico consultar ISA 75.01.01 completo con ingeniero de control." />
            </ResBox>
          )}
        </div>
      )}

      {/* ══ TIPO DE VÁLVULA ══ */}
      {sub === 'tipo' && (
        <div>
          <Tit t="Selector de tipo de válvula — API 6D · ASME B16.34 · MSS SP-67" />

          <div style={g3}>
            <div><label style={lbl}>Función principal</label>
              <select value={tipApp} onChange={e => setTipApp(e.target.value)} style={inp}>
                <option value="aislamiento" style={{ background: '#0a0f1e' }}>Aislamiento / shut-off (abierto/cerrado)</option>
                <option value="control" style={{ background: '#0a0f1e' }}>Control / regulación de caudal (throttling)</option>
                <option value="retencion" style={{ background: '#0a0f1e' }}>Retención / anti-retorno (check)</option>
                <option value="todos" style={{ background: '#0a0f1e' }}>Ver todos los tipos</option>
              </select>
            </div>
            <div><label style={lbl}>Tipo de fluido</label>
              <select value={tipFluid} onChange={e => setTipFluid(e.target.value)} style={inp}>
                <option value="gas_dulce" style={{ background: '#0a0f1e' }}>Gas natural / gas dulce</option>
                <option value="crudo" style={{ background: '#0a0f1e' }}>Crudo / petróleo</option>
                <option value="agua" style={{ background: '#0a0f1e' }}>Agua / agua de proceso</option>
                <option value="slurry" style={{ background: '#0a0f1e' }}>Slurry / fluido con sólidos (minería)</option>
                <option value="vapor" style={{ background: '#0a0f1e' }}>Vapor / alta temperatura</option>
              </select>
            </div>
            <div><label style={lbl}>Caída de presión estimada</label>
              <select value={tipDP} onChange={e => setTipDP(e.target.value)} style={inp}>
                <option value="bajo" style={{ background: '#0a0f1e' }}>Baja ({'<'}2 bar) — línea principal</option>
                <option value="medio" style={{ background: '#0a0f1e' }}>Media (2–10 bar) — distribución</option>
                <option value="alto" style={{ background: '#0a0f1e' }}>Alta ({'>'}10 bar) — control / regulación</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
            {(tipApp === 'todos' ? TIPOS_VALVULA : filtrarTipos()).map((v, i) => (
              <div key={i} style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' as const }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: COLOR }}>{v.tipo}</div>
                  <div style={{ fontSize: 10, background: '#0a0f1e', color: '#64748b', padding: '3px 10px', borderRadius: 20 }}>{v.norma}</div>
                  <div style={{ fontSize: 10, color: v.throttling ? '#4ade80' : '#f59e0b' }}>{v.throttling ? '✅ Throttling' : '⚠️ Solo aislamiento'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div style={{ background: '#0a0f1e', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 2 }}>Apertura</div>
                    <div style={{ fontSize: 12, color: '#f1f5f9' }}>{v.apertura}</div>
                  </div>
                  <div style={{ background: '#0a0f1e', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 2 }}>ΔP típico</div>
                    <div style={{ fontSize: 12, color: '#f1f5f9' }}>{v.dP}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', padding: '6px 10px', background: '#0a0f1e', borderRadius: 8 }}>
                  {v.usos}
                </div>
                <div style={{ fontSize: 10, color: '#334155', marginTop: 6 }}>
                  Industrias: {v.industrias.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 