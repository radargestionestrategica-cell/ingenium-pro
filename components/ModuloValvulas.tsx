'use client';
import { useState } from 'react';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import {
  calcCvLiquido, FL_ORIENTATIVO, NORMA_CV, P_ATM_BAR,
  type ResultadoCvLiquido,
} from '@/lib/calculos';
import {
  ratingB1634, calcPruebaHidrostaticaB1634, duracionPruebaB1634,
  CLASES_B1634, NPS_NORMALIZADOS, T_MAX_TABLA,
} from '@/lib/valvulasB1634';

// ═══════════════════════════════════════════════════════════════
//  MÓDULO VÁLVULAS INDUSTRIALES — INGENIUM PRO v8.0
//  NORMATIVAS 100% REALES VERIFICADAS:
//  ASME B16.34 · ASME B16.5-2017 · ISA-75.01.01-2012 / IEC 60534-2-1
//  NACE MR0175/ISO 15156 · API 6D · MSS SP-25
// ═══════════════════════════════════════════════════════════════

const COLOR = '#0d9488'; // teal

// Tablas P-T (WCB Grupo 1.1 y CF8M Grupo 2.2), rating, prueba hidrostática
// y duración: lib/valvulasB1634.ts (fuente única, con tests).

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

// Face-to-face ASME B16.10 Table 1 — Válvula compuerta (gate), bridada, raised face (mm)
// Fuente: ASME B16.10-2017. SOLO para plano esquemático DXF — verificar con fabricante.
const F2F_B1610: Record<string, Record<string, number>> = {
  '150': { '0.5':108,'0.75':117,'1':130,'1.5':159,'2':178,'2.5':216,'3':229,'4':267,'6':356,'8':457,'10':533,'12':610 },
  '300': { '0.5':140,'0.75':152,'1':165,'1.5':197,'2':216,'2.5':254,'3':279,'4':318,'6':419,'8':521,'10':622,'12':711 },
  '600': { '0.5':165,'0.75':190,'1':216,'1.25':229,'1.5':241,'2':292,'2.5':330,'3':356,'4':432,'6':559,'8':660,'10':787,'12':838 },
  '900': { '2':292,'2.5':330,'3':356,'4':406,'6':533,'8':660,'10':787,'12':914 },
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

// ─── ASME B16.10 Long Pattern — Válvula BOLA (Ball) API 6D ─────────
// Valores verificados: ASME B16.34-2017 + ASME B16.10-2018 + API 6D
// SOLO para plano esquemático DXF — verificar con fabricante
const F2F_BOLA: Record<string, Record<string, number>> = {
  '150': { '0.5':108,'0.75':117,'1':127,'1.25':140,'1.5':165,'2':178,'2.5':190,'3':203,'4':229,'6':394,'8':457,'10':533,'12':610 },
  '300': { '0.5':140,'0.75':152,'1':165,'1.25':178,'1.5':190,'2':216,'2.5':241,'3':282,'4':305,'6':403,'8':502,'10':568,'12':648 },
  '600': { '0.5':165,'0.75':190,'1':216,'1.25':229,'1.5':241,'2':292,'2.5':330,'3':356,'4':432,'6':559,'8':660,'10':787,'12':838 },
};

// ─── Swing Check — ASME B16.10-2022 + API STD 594 ────────────────
// Solo Swing Class 600 con datos verificados. Clases 150/300: Consultar fabricante.
const F2F_RETENCION: Record<string, Record<string, number>> = {
  '600': { '1.5':241,'2':292,'2.5':330,'3':356,'4':432,'5':508,'6':559,'8':660,'10':787,'12':838,'14':889,'16':991,'18':1092,'20':1194,'22':1295,'24':1397,'26':1448,'28':1600,'30':1651,'36':2083 },
};

// ─── Tapón Regular/Venturi — ASME B16.10-2022 + MSS SP-78 ────────
// Class 600 y Class 900 (parcial). Clases 150/300: Consultar fabricante.
const F2F_TAPON: Record<string, Record<string, number>> = {
  '600': { '1':216,'1.25':229,'1.5':241,'2':292,'2.5':330,'3':356,'4':432,'6':559,'8':660,'10':787,'12':838,'14':889,'16':991,'18':1092,'20':1194,'22':1295,'24':1397,'26':1448,'30':1651,'32':1778,'34':1930,'36':2083 },
  '900': { '8':794,'10':940,'12':1067 },
};

type TipoDisenio = 'compuerta' | 'globo' | 'bola' | 'mariposa' | 'retencion' | 'tapon';

const CLASES_DISENO: Record<TipoDisenio, string[]> = {
  compuerta: ['150','300','600','900'],
  globo:     ['150','300','600','900'],
  bola:      ['150','300','600'],
  mariposa:  ['150','300'],
  retencion: ['150','300','600'],
  tapon:     ['150','300','600','900'],
};

const NPS_DISENO: Record<TipoDisenio, Record<string, string[]>> = {
  compuerta: {
    '150': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '900': ['2','2.5','3','4','6','8','10','12'],
  },
  globo: {
    '150': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['0.5','0.75','1','1.5','2','2.5','3','4','6','8','10','12'],
    '900': ['2','2.5','3','4','6','8','10','12'],
  },
  bola: {
    '150': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
  },
  mariposa: {
    '150': ['2','2.5','3','4','6','8','10','12'],
    '300': ['2','2.5','3','4','6','8','10','12'],
  },
  retencion: {
    '150': ['1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['1.5','2','2.5','3','4','5','6','8','10','12','14','16','18','20','22','24','26','28','30','36'],
  },
  tapon: {
    '150': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '300': ['0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'],
    '600': ['1','1.25','1.5','2','2.5','3','4','6','8','10','12','14','16','18','20','22','24','26','30','32','34','36'],
    '900': ['8','10','12'],
  },
};

// Tipos de válvula por aplicación — datos reales de industria
const TIPOS_VALVULA = [
  { tipo: 'Compuerta (Gate)', norma: 'API 600 / ASME B16.34', apertura: 'Abierto/cerrado total', dP: 'Muy bajo (<0.5 bar)', throttling: false, industrias: ['Petróleo','Gas','Agua'], usos: 'Aislamiento en líneas de transmisión. NO usar para throttling — erosiona el asiento.' },
  { tipo: 'Globo (Globe)',    norma: 'ASME B16.34 / ISA 75', apertura: 'Throttling / regulación', dP: 'Alto (>5 bar)', throttling: true, industrias: ['Proceso','Vapor','Química'], usos: 'Control de caudal y presión. Alto ΔP. Excelente estanqueidad. Ideal para fluidos limpios.' },
  { tipo: 'Bola (Ball)',      norma: 'API 6D / ASME B16.34', apertura: '1/4 vuelta — rápido', dP: 'Bajo (<2 bar)', throttling: false, industrias: ['Gas','Petróleo','Agua'], usos: 'Aislamiento rápido. Full bore: sin restricción de caudal. Tight shutoff clase VI.' },
  { tipo: 'Mariposa (Butterfly)', norma: 'API 609 / MSS SP-67', apertura: '1/4 vuelta — económico', dP: 'Bajo-medio', throttling: true, industrias: ['Agua','HVAC','MMO'], usos: 'DN grandes a bajo costo. Wafer o lug. No recomendado para alta presión (>16 bar) o fluidos con sólidos.' },
  { tipo: 'Retención (Check)',norma: 'API 594 / ASME B16.34', apertura: 'Automático por presión', dP: 'Variable', throttling: false, industrias: ['Todas'], usos: 'Evita retorno de flujo. Swing (caudal alto, baja pérdida) o Lift (alta presión). Instalar siempre horizontal.' },
  { tipo: 'Plug / Tapón',    norma: 'ASME B16.34 / API 6D', apertura: '1/4 vuelta', dP: 'Bajo', throttling: false, industrias: ['Slurry','Minería','Petróleo'], usos: 'Ideal para fluidos con sólidos, slurry y fluidos viscosos. Lubricated o non-lubricated.' },
];

type Sub = 'clase' | 'material' | 'brida' | 'diseno' | 'cv' | 'tipo';
const SUBS: { id: Sub; label: string; icon: string }[] = [
  { id: 'clase',    label: 'Clase B16.34', icon: '🏷️' },
  { id: 'material', label: 'Material',     icon: '🔩' },
  { id: 'brida',    label: 'Brida B16.5',  icon: '⭕' },
  { id: 'diseno',   label: 'Diseño',       icon: '📐' },
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

// ────────────────────────────────────────────────────────────────
export default function ModuloValvulas() {
  const [sub, setSub] = useState<Sub>('clase');
  const [err, setErr] = useState('');
  const R = () => setErr('');

  // ── Estado: Clase B16.34 ──────────────────────────────────────
  const [clP, setClP] = useState('80');
  const [clT, setClT] = useState('80');
  const [clMat, setClMat] = useState<'WCB'|'CF8M'>('WCB');
  const [clNPS, setClNPS] = useState('4');   // obligatorio: duración de prueba §7.1.2 y DXF
  const [resCl, setResCl] = useState<null|{
    claseReq: string; Prating: number; claseNext: string;
    advertencia: string; maxTempMat: number;
    cita: string; notaFila: string | null;
    pruebaBar: number | null; duracionS: number | null; nps: string; T: number;
    ratingsTabla: { clase: string; txt: string }[];
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
  const [resBr, setResBr] = useState<null|{ fd: FlangeData | null; nps: string; clase: string; f2f_mm: number | null }>(null);

  // ── Estado: Cv ───────────────────────────────────────────────
  // Fase: solo líquido está implementado; gas/vapor queda bloqueado
  const [cvFase, setCvFase] = useState<'liquido'|'gas'>('liquido');
  const [cvQ, setCvQ] = useState('50');
  const [cvUnidQ, setCvUnidQ] = useState<'m3h'|'gpm'>('m3h');
  // Presiones MANOMÉTRICAS (P1 − P2 = 2 bar por defecto, igual que el ΔP anterior)
  const [cvP1, setCvP1] = useState('5');
  const [cvP2, setCvP2] = useState('3');
  const [cvUnidP, setCvUnidP] = useState<'bar'|'psi'>('bar');
  const [cvSG, setCvSG] = useState('0.85');
  // Estrangulamiento (opcionales): FL precargado por tipo, Pv/Pc absolutas
  const [cvTipoVal, setCvTipoVal] = useState<'globo'|'bola'|'mariposa'|'otro'>('globo');
  const [cvFL, setCvFL] = useState(String(FL_ORIENTATIVO.globo));
  const [cvPv, setCvPv] = useState('');
  const [cvPc, setCvPc] = useState('');
  const [resCv, setResCv] = useState<null|(Extract<ResultadoCvLiquido, { ok: true }> & { desc: string })>(null);

  // ── Estado: Tipo válvula ──────────────────────────────────────
  const [tipApp, setTipApp] = useState('aislamiento');
  const [tipFluid, setTipFluid] = useState('gas_dulce');
  const [tipDP, setTipDP] = useState('bajo');

  // ── Estado: export ────────────────────────────────────────────
  const [datosClase, setDatosClase] = useState<DatosExportar | null>(null);
  const [datosMaterial, setDatosMaterial] = useState<DatosExportar | null>(null);
  const [datosBrida, setDatosBrida] = useState<DatosExportar | null>(null);
  const [datosDis, setDatosDis] = useState<DatosExportar | null>(null);
  const [datosCv, setDatosCv] = useState<DatosExportar | null>(null);

  // ── Estado: Diseño de válvula ─────────────────────────────────
  const [disTipo, setDisTipo] = useState<TipoDisenio>('compuerta');
  const [disClase, setDisClase] = useState('300');
  const [disNPS, setDisNPS] = useState('4');
  const [disProyecto, setDisProyecto] = useState('');
  const [disMaterial, setDisMaterial] = useState('A216 WCB');
  const [disEstilo, setDisEstilo] = useState('Wafer');
  const [disSubtipo, setDisSubtipo] = useState('Swing');
  const [disPatron, setDisPatron] = useState('Regular');
  const [resDis, setResDis] = useState<null|{
    f2f_mm: number | null;
    fd: FlangeData | null;
    nps: string;
    clase: string;
    tipo: TipoDisenio;
    subtipo?: string;
    pruebaTxt: string;        // prueba hidrostática §7.1.1 o motivo de no disponible
    duracionS: number | null; // duración mínima §7.1.2
    citaPT: string | null;
  }>(null);

  // ── CÁLCULO 1: CLASE REQUERIDA (B16.34) ──────────────────────
  const calcClase = () => {
    R(); setResCl(null);
    const P = parseFloat(clP), T = parseFloat(clT), nps = parseFloat(clNPS);
    if (!Number.isFinite(P) || P <= 0 || !Number.isFinite(T) || T < -29) { setErr('Valores inválidos'); return; }
    if (!Number.isFinite(nps) || nps <= 0) { setErr('Seleccioná el NPS de la válvula.'); return; }
    const maxTempMat = T_MAX_TABLA[clMat];
    if (T > maxTempMat) { setErr(`Fuera de rango de la tabla: máximo ${maxTempMat} °C para ${clMat}.`); return; }

    // Ratings de todas las clases (para elegir la mínima y mostrar la tabla)
    const ratings = CLASES_B1634.map(cl => ({ clase: cl, r: ratingB1634(clMat, cl, T) }));
    let claseReq = '', claseNext = '', Prating = 0, cita = '', notaFila: string | null = null;
    for (let i = 0; i < ratings.length; i++) {
      const { clase, r } = ratings[i];
      if (!r.ok) {
        if (r.motivo === 'CLASE_NO_DISPONIBLE') {
          setErr(`Presión ${P} bar a ${T} °C excede las clases disponibles para ${clMat}. Class ${clase} y superiores: ${r.mensaje}.`);
        } else {
          setErr(r.mensaje);
        }
        return;
      }
      if (r.rating_bar >= P) {
        claseReq = clase; Prating = r.rating_bar; cita = r.cita; notaFila = r.nota;
        claseNext = CLASES_B1634[i + 1] || '';
        break;
      }
    }
    if (!claseReq) { setErr(`Presión ${P} bar a ${T}°C excede Class 2500. Requerís diseño especial o material de mayor resistencia.`); return; }

    // Prueba hidrostática de carcasa (§7.1.1) y duración (§7.1.2)
    const r38 = ratingB1634(clMat, claseReq, 38);
    const pruebaBar = r38.ok ? calcPruebaHidrostaticaB1634(r38.rating_bar) : null;
    const duracionS = duracionPruebaB1634(nps);
    const ratingsTabla = ratings.map(({ clase, r }) => ({
      clase, txt: r.ok ? `${r.rating_bar} bar` : (r.motivo === 'CLASE_NO_DISPONIBLE' ? 'N/D' : '—'),
    }));

    let advertencia = '';
    if (clMat === 'WCB' && T > 300) advertencia = '⚠️ WCB >300°C: riesgo de grafitización. Considerar F11/WC6 (Cr-Mo). ASME B16.34 Nota [1].';
    else if (Prating < P * 1.1) advertencia = `⚠️ Margen ajustado (${Math.round((Prating / P - 1) * 100)}%). Considerar Class ${claseNext || 'mayor'} para mayor seguridad.`;
    else advertencia = `✅ Margen de presión: ${Math.round((Prating / P - 1) * 100)}% sobre la presión de operación.`;

    const resultadoClase = {
      claseReq, Prating, claseNext, advertencia, maxTempMat, cita, notaFila,
      pruebaBar, duracionS, nps: clNPS, T, ratingsTabla,
    };

    setResCl(resultadoClase);

    const margenPct = (Prating / P - 1) * 100;
    const payloadClase: DatosExportar = {
      tipo: 'VALVULAS_CLASE_B16_34',
      normativa: cita,
      parametros: {
        'Presion operacion (bar)': clP,
        'Temperatura operacion (C)': clT,
        'Material cuerpo': clMat,
        'NPS (pulg)': clNPS,
      },
      resultado: {
        'Clase minima requerida': claseReq,
        'Presion rating (bar)': Prating,
        ...(notaFila ? { 'Rating tomado de': notaFila } : {}),
        'Fuente tabla P-T': cita,
        'Temp max material (C)': maxTempMat,
        'Prueba hidrostatica carcasa B16.34 §7.1.1 (bar)': pruebaBar ?? 'No disponible',
        'Duracion minima prueba B16.34 §7.1.2 (s)': duracionS ?? 'No disponible',
        'Advertencia': advertencia,
      },
      nivel:  margenPct >= 10 ? 'OK' : 'ALTO',
      alerta: margenPct < 10,
      dxfParams: {
        DN:    nps * 25.4,   // NPS ingresado (antes DN 100 fijo)
        tipo:  'bt',
        nombre: `Valvula Clase ${claseReq}`,
        clase: claseReq,
        // El DXF espera MPa; Prating y clP están en bar
        P_max: Prating / 10,
        P_op:  P / 10,
        ...(pruebaBar !== null ? { P_prueba_bar: pruebaBar } : {}),
        ...(duracionS !== null ? { duracion_prueba_s: duracionS } : {}),
        ...(notaFila ? { nota_rating: notaFila } : {}),
        norma: cita,
        material: clMat === 'WCB' ? 'ASTM A216 WCB (Grupo 1.1)' : 'ASTM A351 CF8M (Grupo 2.2)',
      },
    };
    setDatosClase(payloadClase);
    publicarResultado(payloadClase);
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
    const payloadMat: DatosExportar = {
      tipo: 'VALVULAS_MATERIAL_NACE',
      normativa: 'NACE MR0175/ISO 15156 | ASME B16.34',
      parametros: {
        'Tipo fluido': mFluido,
        'Temperatura (C)': mTemp,
        'H2S (ppm)': mH2S,
        'Cloruros (ppm)': mCl,
      },
      resultado: {
        'Material recomendado': material,
        'Especificacion ASTM': astm,
        'Normativa aplicable': norma,
        'Servicio NACE MR0175': nace ? 'SI' : 'NO',
        'Temperatura maxima (C)': maxTemp,
        'Observaciones': obs,
      },
      // DXF de hoja de datos (exportarDXFSeleccionMaterial): solo lo que esta
      // pestaña calcula e ingresa. Antes pasaba DN 100, Clase 300, geometría de
      // bola y presiones 50/40 fijos que la pestaña nunca pide ni calcula.
      dxfParams: {
        material, astm, norma, nace, maxTemp, obs,
        entradas: [
          ['Tipo de fluido', mFluido],
          ['Temperatura (C)', mTemp],
          ['H2S (ppm)', mH2S],
          ['Cloruros (ppm)', mCl],
        ],
      },
    };
    setDatosMaterial(payloadMat);
    publicarResultado(payloadMat);
  };

  // ── CÁLCULO 3: DIMENSIONES BRIDA B16.5 ───────────────────────
  const calcBrida = () => {
    R(); setResBr(null);
    const fd = B165[brClase]?.[brNPS] ?? null;
    if (!fd) {
      // Dato no disponible en tabla — NUNCA calcular ni interpolar
      setResBr({ fd: null, nps: brNPS, clase: brClase, f2f_mm: null });
      return;
    }
    const f2f_mm = F2F_B1610[brClase]?.[brNPS] ?? null;
    setResBr({ fd, nps: brNPS, clase: brClase, f2f_mm });
    const payloadBr: DatosExportar = {
      tipo: 'VALVULAS_BRIDA_B16_5',
      normativa: 'ASME B16.5-2017',
      parametros: {
        'NPS (pulg)': brNPS,
        'Clase de presion': brClase,
        'Proyecto': brProyecto || 'Sin nombre',
        'F2F ASME B16.10 (mm)': f2f_mm ?? 'Consultar fabricante',
      },
      resultado: {
        'OD exterior (pulg)': fd.OD,
        'BC circulo pernos (pulg)': fd.BC,
        'Bore interior (pulg)': fd.bore,
        'Numero de pernos': fd.n,
        'Diametro perno (pulg)': fd.db,
        'OD (mm)': Math.round(fd.OD * 25.4 * 10) / 10,
        'BC (mm)': Math.round(fd.BC * 25.4 * 10) / 10,
        'Bore (mm)': Math.round(fd.bore * 25.4 * 10) / 10,
      },
    };
    setDatosBrida(payloadBr);
    publicarResultado(payloadBr);
  };

  // DXF se genera via BotonesExportar → exportarDXFBridaB165 en lib/exportarDXF.ts

  // ── CÁLCULO: DISEÑO DE VÁLVULA (F2F + B16.5) ─────────────────
  const calcDisenio = () => {
    R(); setResDis(null);
    const fd = B165[disClase]?.[disNPS] ?? null;
    let f2f_mm: number | null = null;
    if (disTipo === 'compuerta') f2f_mm = F2F_B1610[disClase]?.[disNPS] ?? null;
    else if (disTipo === 'bola') f2f_mm = F2F_BOLA[disClase]?.[disNPS] ?? null;
    else if (disTipo === 'retencion' && disSubtipo === 'Swing') f2f_mm = F2F_RETENCION[disClase]?.[disNPS] ?? null;
    else if (disTipo === 'tapon') f2f_mm = F2F_TAPON[disClase]?.[disNPS] ?? null;
    // globo, mariposa, retencion Lift/Tilting: f2f_mm = null

    const tipoKey = disTipo === 'compuerta'  ? 'VALVULAS_BRIDA_B16_5'
                  : disTipo === 'bola'       ? 'VALVULAS_DISENO_BOLA'
                  : disTipo === 'mariposa'   ? 'VALVULAS_DISENO_MARIPOSA'
                  : disTipo === 'retencion'  ? 'VALVULAS_DISENO_RETENCION'
                  : disTipo === 'tapon'      ? 'VALVULAS_DISENO_TAPON'
                  :                           'VALVULAS_DISENO_GLOBO';
    const normativa = disTipo === 'bola'      ? 'ASME B16.34 + ASME B16.10-2018 + API 6D'
                    : disTipo === 'compuerta' ? 'ASME B16.34 + ASME B16.10-2018 + API 600'
                    : disTipo === 'mariposa'  ? 'API 609 / MSS SP-67 / ASME B16.34'
                    : disTipo === 'retencion' ? 'ASME B16.10-2022 + API STD 594'
                    : disTipo === 'tapon'     ? 'ASME B16.10-2022 + MSS SP-78'
                    :                          'ASME B16.34 + ASME B16.10-2018';

    // DN real en mm a partir de NPS en pulgadas (ASME B36.10M)
    const dnMm = Math.round(parseFloat(disNPS) * 25.4 * 10) / 10;
    // Rating a 38 °C según el material elegido (lib/valvulasB1634). Antes se
    // usaba una copia de la fila de WCB para cualquier material.
    // Solo WCB (Grupo 1.1) y CF8M (Grupo 2.2) tienen tabla P-T en el módulo.
    const matB1634 = disMaterial === 'A216 WCB' ? 'WCB' as const
                   : disMaterial === 'A351 CF8M' ? 'CF8M' as const : null;
    const r38 = matB1634 ? ratingB1634(matB1634, disClase, 38) : null;
    const rating38Bar = r38 && r38.ok ? r38.rating_bar : null;
    const pruebaBar = rating38Bar !== null ? calcPruebaHidrostaticaB1634(rating38Bar) : null;
    const duracionS = duracionPruebaB1634(parseFloat(disNPS));
    const pruebaTxt =
      pruebaBar !== null ? `${pruebaBar} bar` :
      !matB1634          ? 'no disponible — sin tabla P-T para este material' :
      r38 && !r38.ok     ? `no disponible — ${r38.mensaje}` : 'no disponible';
    const citaPT = r38 && r38.ok ? r38.cita : null;
    const tipoCode = disTipo === 'compuerta' ? 'cg'
                   : disTipo === 'bola'      ? 'bt'
                   : disTipo === 'mariposa'  ? 'mp'
                   : disTipo === 'retencion' ? 'ch'
                   : disTipo === 'tapon'     ? 'cg'
                   : /* globo */               'gl';
    setResDis({
      f2f_mm, fd, nps: disNPS, clase: disClase, tipo: disTipo,
      subtipo: disTipo === 'retencion' ? disSubtipo : disTipo === 'tapon' ? disPatron : undefined,
      pruebaTxt, duracionS, citaPT,
    });

    const nombreLabel = disTipo === 'compuerta' ? `Compuerta NPS ${disNPS}" Clase ${disClase}`
                      : disTipo === 'bola'      ? `Bola NPS ${disNPS}" Clase ${disClase}`
                      : disTipo === 'mariposa'  ? `Mariposa NPS ${disNPS}" Clase ${disClase}`
                      : disTipo === 'retencion' ? `Retencion NPS ${disNPS}" Clase ${disClase}`
                      : disTipo === 'tapon'     ? `Tapon NPS ${disNPS}" Clase ${disClase}`
                      :                           `Globo NPS ${disNPS}" Clase ${disClase}`;

    const payload: DatosExportar = {
      tipo: tipoKey,
      normativa,
      parametros: {
        'NPS (pulg)': disNPS,
        'Clase de presion': disClase,
        'Tipo valvula': disTipo,
        ...(disTipo === 'mariposa'  ? { 'Estilo': disEstilo } : {}),
        ...(disTipo === 'retencion' ? { 'Subtipo': disSubtipo } : {}),
        ...(disTipo === 'tapon'     ? { 'Patron': disPatron } : {}),
        'Proyecto': disProyecto || 'Sin nombre',
        'F2F ASME B16.10 (mm)': f2f_mm ?? 'Consultar fabricante',
      },
      resultado: {
        'F2F ASME B16.10 resultado (mm)': f2f_mm ?? 'Consultar fabricante',
        ...(disTipo === 'mariposa' ? { 'Diametro disco (mm)': Math.round(parseFloat(disNPS) * 25.4 * 10) / 10 } : {}),
        'OD (mm)':   fd ? Math.round(fd.OD   * 25.4 * 10) / 10 : 0,
        'BC (mm)':   fd ? Math.round(fd.BC   * 25.4 * 10) / 10 : 0,
        'Bore (mm)': fd ? Math.round(fd.bore * 25.4 * 10) / 10 : 0,
        'Numero de pernos': fd ? fd.n : 0,
        'Material cuerpo': `ASTM ${disMaterial}`,
        'Prueba hidrostatica carcasa B16.34 §7.1.1 (bar)': pruebaBar ?? `No disponible (${pruebaTxt.replace(/^no disponible — /, '')})`,
        ...(citaPT ? { 'Fuente tabla P-T': citaPT } : {}),
        'Duracion minima prueba B16.34 §7.1.2 (s)': duracionS ?? 'No disponible',
      },
      // dxfParams: incluye claves en inglés (para exportarDXFValvulas / globo)
      // Y claves en español (para exportarDXFBola / Mariposa / Retencion / Tapon)
      dxfParams: {
        // Claves Spanish — leídas por exportarDXFBola, exportarDXFMariposa, etc.
        'NPS (pulg)':        disNPS,
        'Clase de presion':  disClase,
        'Proyecto':          disProyecto || 'Sin nombre',
        'F2F ASME B16.10 (mm)': f2f_mm ?? 'Consultar fabricante',
        ...(disTipo === 'mariposa'  ? { 'Estilo': disEstilo }   : {}),
        ...(disTipo === 'retencion' ? { 'Subtipo': disSubtipo } : {}),
        ...(disTipo === 'tapon'     ? { 'Patron': disPatron }   : {}),
        // Claves TypeScript interface — leídas por exportarDXFValvulas (globo)
        DN:       dnMm,
        tipo:     tipoCode,
        nombre:   nombreLabel,
        clase:    disClase,
        // Rating a 38 °C del material elegido (MPa). Sin P_op: esta pestaña no
        // pide presión de operación (antes se inventaba 0,7 × P_max y un ESTADO).
        ...(rating38Bar !== null ? { P_max: rating38Bar / 10 } : {}),
        ...(pruebaBar !== null ? { P_prueba_bar: pruebaBar } : {}),
        ...(duracionS !== null ? { duracion_prueba_s: duracionS } : {}),
        norma:    citaPT ? `${normativa} | ${citaPT}` : normativa,
        f2f_mm:   f2f_mm ?? undefined,
        material: `ASTM ${disMaterial}`,
        proyecto: disProyecto || undefined,
      },
    };
    setDatosDis(payload);
    publicarResultado(payload);
  };

  // ── CÁLCULO 4: COEFICIENTE Cv — LÍQUIDOS ──────────────────────
  // calcCvLiquido de @/lib/calculos (fuente única, con tests):
  // ISA-75.01.01-2012 / IEC 60534-2-1, líquido turbulento sin accesorios
  // (Fp = 1), presiones manométricas → absolutas, verificación de flujo
  // estrangulado si se informan FL, Pv y Pc. Gas/vapor NO implementado.
  const cambiarFaseCv = (f: 'liquido'|'gas') => {
    setCvFase(f);
    // Al pasar a gas no puede quedar a la vista (ni exportable) un Cv de líquido
    if (f === 'gas') { setResCv(null); setDatosCv(null); R(); }
  };
  const cambiarTipoValCv = (t: 'globo'|'bola'|'mariposa'|'otro') => {
    setCvTipoVal(t);
    if (t !== 'otro') setCvFL(String(FL_ORIENTATIVO[t]));
  };
  const opcional = (s: string) => (s.trim() === '' ? undefined : parseFloat(s));

  const calcCv = () => {
    R(); setResCv(null); setDatosCv(null);
    if (cvFase !== 'liquido') { setErr('Cálculo de gas/vapor no implementado aún.'); return; }

    const r = calcCvLiquido({
      Q: parseFloat(cvQ), unidadQ: cvUnidQ,
      P1_man: parseFloat(cvP1), P2_man: parseFloat(cvP2), unidadP: cvUnidP,
      SG: parseFloat(cvSG),
      FL: opcional(cvFL), Pv_abs: opcional(cvPv), Pc_abs: opcional(cvPc),
    });
    if (!r.ok) { setErr(r.error); return; }

    let desc = '';
    if (r.Cv < 1) desc = 'Cv muy bajo — válvula de control de precisión o aguja.';
    else if (r.Cv < 10) desc = 'Válvula de control pequeña. Globo o plug recomendado.';
    else if (r.Cv < 100) desc = 'Rango estándar — válvula de control globo o ball de control.';
    else if (r.Cv < 500) desc = 'Cv alto — válvula de control de gran caudal o mariposa.';
    else desc = 'Cv muy alto — revisar si conviene segmentar en válvulas paralelas.';

    setResCv({ ...r, desc });

    const uP = cvUnidP === 'bar' ? 'barg' : 'psig';
    const uPa = cvUnidP === 'bar' ? 'bar a' : 'psia';
    const tipoValTxt = { globo: 'Globo', bola: 'Bola', mariposa: 'Mariposa', otro: 'Otro / manual' }[cvTipoVal];
    const estadoTxt =
      r.estrangulamiento === 'ESTRANGULADO'    ? 'FLUJO ESTRANGULADO — Cv calculado con ΔPmax' :
      r.estrangulamiento === 'NO_ESTRANGULADO' ? 'Sin estrangulamiento (ΔP < ΔPmax)' :
      `Estrangulamiento no verificado — faltan: ${r.faltanParaVerificar.join(', ')}`;

    // Solo datos ingresados por el usuario y resultados calculados — sin valores inventados
    const entradas: [string, string][] = [
      ['Fase', 'Líquido'],
      ['Caudal', `${cvQ} ${cvUnidQ === 'm3h' ? 'm³/h' : 'GPM'}`],
      ['P1 entrada (manométrica)', `${cvP1} ${uP}`],
      ['P2 salida (manométrica)', `${cvP2} ${uP}`],
      ['Gravedad específica SG', cvSG],
      ['Tipo de válvula (para FL)', tipoValTxt],
      ...(cvFL.trim() ? [['FL (orientativo, verificar fabricante)', cvFL] as [string, string]] : []),
      ...(cvPv.trim() ? [['Pv (absoluta)', `${cvPv} ${uPa}`] as [string, string]] : []),
      ...(cvPc.trim() ? [['Pc (absoluta)', `${cvPc} ${uPa}`] as [string, string]] : []),
    ];
    const alerta = r.estrangulamiento === 'ESTRANGULADO' || r.flashing === true;

    const payloadCv: DatosExportar = {
      tipo: 'VALVULAS_COEFICIENTE_CV',
      normativa: NORMA_CV,
      parametros: Object.fromEntries(entradas),
      resultado: {
        'Cv requerido (US)': Number(r.Cv_txt),
        'Kv requerido (metrico)': Number(r.Kv_txt),
        'Delta P real (bar)': +r.dP_bar.toFixed(3),
        ...(r.dPmax_bar !== null ? {
          'Delta P max estrangulamiento (bar)': +r.dPmax_bar.toFixed(3),
          'FF': +r.FF!.toFixed(4),
        } : {}),
        'Estrangulamiento': estadoTxt,
        ...(r.flashing ? { 'Flashing': 'P2 ≤ Pv — vaporización a la salida' } : {}),
        'Orientacion seleccion': desc,
      },
      ...(alerta ? { nivel: 'HIGH' } : {}),
      alerta,
      // DXF propio del Cv: solo Cv, Kv y lo ingresado (sin DN, clase ni presiones inventadas)
      dxfParams: {
        Cv_txt: r.Cv_txt, Kv_txt: r.Kv_txt, estado: estadoTxt, norma: NORMA_CV, entradas,
      },
    };
    setDatosCv(payloadCv);
    publicarResultado(payloadCv);
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

  const datosActivo = sub === 'clase' ? datosClase : sub === 'material' ? datosMaterial : sub === 'brida' ? datosBrida : sub === 'diseno' ? datosDis : datosCv;

  return (
    <div style={{ padding: 24, color: '#f1f5f9', fontFamily: 'Inter,sans-serif', maxWidth: 960, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,rgba(13,148,136,0.15),rgba(13,148,136,0.05))', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 16, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#0d9488,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>⚙️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Válvulas Industriales</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Clase B16.34 · Material NACE · Brida B16.5 + DXF · Coeficiente Cv · Selector tipo</div>
          <div style={{ fontSize: 11, color: COLOR, marginTop: 4 }}>ASME B16.34 · ASME B16.5-2017 · {NORMA_CV} · NACE MR0175/ISO 15156 · API 6D</div>
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
          <Tit t="Clase de presión requerida — ASME B16.34" />
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
                <option value="CF8M" style={{ background: '#0a0f1e' }}>A351 CF8M / F316 (inox 316) — máx 450°C · Clase 150 a 600</option>
              </select>
            </div>
            <div><label style={lbl}>NPS de la válvula (pulg)</label>
              <select value={clNPS} onChange={e => setClNPS(e.target.value)} style={inp}>
                {NPS_NORMALIZADOS.map(n => <option key={n} value={n} style={{ background: '#0a0f1e' }}>NPS {n}"</option>)}
              </select>
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Define la duración mínima de la prueba (B16.34 §7.1.2) y el tamaño del plano DXF.</div>
            </div>
          </div>

          <Btn onClick={calcClase} text="Determinar clase requerida" />

          {resCl && (
            <ResBox>
              <RLbl t={`CLASE MÍNIMA REQUERIDA: Class ${resCl.claseReq} — ${resCl.cita}`} />
              <div style={g3}>
                <Card label={`Presión rating Class ${resCl.claseReq} a ${resCl.T}°C`} val={`${resCl.Prating} bar`} color="#4ade80" />
                <Card label="Presión de operación ingresada" val={`${clP} bar`} />
                <Card label="Margen disponible" val={`${Math.round((resCl.Prating - parseFloat(clP)) * 10) / 10} bar`} color={parseFloat(clP) * 1.1 > resCl.Prating ? '#f59e0b' : '#4ade80'} />
              </div>
              {resCl.notaFila && <Warn t={`ℹ️ ${resCl.notaFila}.`} />}
              <div style={g2}>
                <Card label={`Prueba hidrostática de carcasa — B16.34 §7.1.1 (Class ${resCl.claseReq})`} val={resCl.pruebaBar !== null ? `${resCl.pruebaBar} bar` : 'No disponible'} sub="1,5 × rating a 38 °C, redondeado al bar entero superior" />
                <Card label={`Duración mínima de la prueba — B16.34 §7.1.2 (NPS ${resCl.nps}")`} val={resCl.duracionS !== null ? `${resCl.duracionS} s` : 'No disponible'} sub="NPS ≤2: 15 s · 2½–6: 60 s · 8–12: 120 s · ≥14: 300 s" />
              </div>

              {/* Tabla comparativa todas las clases */}
              <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 14, marginTop: 12 }}>
                <div style={{ fontSize: 10, color: COLOR, fontWeight: 700, marginBottom: 8 }}>
                  TABLA P-T — {resCl.cita} — A {resCl.T}°C
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                  {resCl.ratingsTabla.map(({ clase: cl, txt }) => {
                    const esReq = cl === resCl.claseReq;
                    const pr = parseFloat(txt);
                    return (
                      <div key={cl} style={{ background: esReq ? 'rgba(13,148,136,0.2)' : '#030712', borderRadius: 8, padding: '8px 6px', textAlign: 'center', border: esReq ? '1px solid rgba(13,148,136,0.5)' : 'none' }}>
                        <div style={{ fontSize: 9, color: '#475569', marginBottom: 3 }}>Class {cl}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: esReq ? COLOR : '#64748b' }}>{txt}</div>
                        <div style={{ fontSize: 8, color: '#334155' }}>{Number.isFinite(pr) ? `${Math.round(pr * 14.504)} psi` : ''}</div>
                      </div>
                    );
                  })}
                </div>
                {resCl.ratingsTabla.some(r => r.txt === 'N/D') && (
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 6 }}>N/D: No disponible — tabla pendiente de verificación contra la norma.</div>
                )}
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

          {/* Caso: combinación no disponible en tabla */}
          {resBr && !resBr.fd && (
            <ResBox>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b', marginBottom: 10 }}>
                Consultar fabricante — dato no disponible en tabla estándar
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 12 }}>
                La combinación <strong style={{ color: '#f1f5f9' }}>NPS {resBr.nps}″ Class {resBr.clase}</strong> no está presente
                en la tabla ASME B16.5-2017 embebida. No se calculan ni interpolan valores.
                Contactar al fabricante o consultar la edición vigente del estándar.
              </div>
              <Warn t="⚠️ NUNCA dimensionar, mecanizar ni fabricar basándose en valores calculados o interpolados no presentes en el estándar." rojo />
            </ResBox>
          )}

          {/* Caso: datos disponibles */}
          {resBr && resBr.fd && (() => {
            const fd = resBr.fd!;
            const OD_mm  = Math.round(fd.OD  * 25.4 * 10) / 10;
            const BC_mm  = Math.round(fd.BC  * 25.4 * 10) / 10;
            const bore_mm= Math.round(fd.bore * 25.4 * 10) / 10;
            const db_mm  = Math.round(fd.db  * 25.4 * 10) / 10;
            const bh_mm  = Math.round((fd.db + 0.125) * 25.4 * 10) / 10;
            const f2f    = resBr.f2f_mm;

            return (
              <ResBox>
                <RLbl t={`BRIDA NPS ${resBr.nps}" Class ${resBr.clase} — ASME B16.5-2017`} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { l: 'Diámetro exterior OD', v: `${OD_mm} mm`,  s: `${fd.OD}" pulgadas` },
                    { l: 'Círculo de pernos BC', v: `${BC_mm} mm`,  s: `${fd.BC}" pulgadas` },
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

                {/* Face-to-face ASME B16.10 */}
                <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 4, letterSpacing: 0.4 }}>Face-to-Face ASME B16.10 — Válvula compuerta (referencia)</div>
                  {f2f ? (
                    <div style={{ fontSize: 16, fontWeight: 800, color: COLOR }}>{f2f} mm
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 400, marginLeft: 10 }}>({(f2f / 25.4).toFixed(2)}")</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>Consultar fabricante — dato no disponible en tabla estándar</div>
                  )}
                  {!f2f && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>ASME B16.10 no cubre esta combinación en la tabla embebida.</div>}
                  {f2f && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Plano DXF disponible: 4 capas (CUERPO · BORE · BRIDA · ANOTACIONES). Requiere validación de fabricante antes de mecanizar.</div>}
                </div>

                {/* Vista esquemática SVG — sección transversal brida */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                  {(() => {
                    const scale = 160 / (fd.OD * 25.4 / 2 + 20);
                    const R_od   = fd.OD  * 25.4 / 2 * scale;
                    const R_bc   = fd.BC  * 25.4 / 2 * scale;
                    const R_bore = fd.bore * 25.4 / 2 * scale;
                    const r_bh   = (fd.db * 25.4 / 2 + 1.5875) * scale;
                    const cx = 180, cy = 180, svgSize = 360;
                    const boltPoints: { x: number; y: number }[] = [];
                    for (let i = 0; i < fd.n; i++) {
                      const a = (2 * Math.PI * i) / fd.n;
                      boltPoints.push({ x: cx + R_bc * Math.cos(a), y: cy + R_bc * Math.sin(a) });
                    }
                    return (
                      <svg width={svgSize} height={svgSize} style={{ background: '#0a0f1e', borderRadius: 12, border: '1px solid rgba(13,148,136,0.2)' }}>
                        <circle cx={cx} cy={cy} r={R_od}   fill="none" stroke={COLOR}    strokeWidth={2} />
                        <circle cx={cx} cy={cy} r={R_bc}   fill="none" stroke="#475569"  strokeWidth={1} strokeDasharray="4 3" />
                        <circle cx={cx} cy={cy} r={R_bore} fill="none" stroke="#3b82f6"  strokeWidth={1.5} />
                        {boltPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={r_bh} fill="none" stroke="#ef4444" strokeWidth={1.5} />)}
                        <line x1={cx - R_od - 8} y1={cy} x2={cx + R_od + 8} y2={cy} stroke="#1e293b" strokeWidth={1} />
                        <line x1={cx} y1={cy - R_od - 8} x2={cx} y2={cy + R_od + 8} stroke="#1e293b" strokeWidth={1} />
                        <text x={cx + 4} y={cy - R_od  + 12} fill={COLOR}    fontSize={8}>OD={OD_mm}mm</text>
                        <text x={cx + 4} y={cy - R_bc  + 12} fill="#475569"  fontSize={7}>BC={BC_mm}mm</text>
                        <text x={cx + 4} y={cy - R_bore + 12} fill="#3b82f6" fontSize={7}>Bore={bore_mm}mm</text>
                        <text x={cx - R_od + 4} y={cy + R_od + 16} fill="#f1f5f9" fontSize={8}>NPS {resBr.nps}" Class {resBr.clase} — ASME B16.5</text>
                      </svg>
                    );
                  })()}
                </div>

                {f2f && <Info t="DXF: 4 capas — CUERPO (cuerpo válvula F2F × alto estimado), BORE (diámetro interior), BRIDA (indicación B16.5), ANOTACIONES (NPS, Clase, F2F, normativa, fecha, proyecto). Plano esquemático de referencia — requiere validación de fabricante antes de mecanizar." />}
                {!f2f && <Warn t="⚠️ Face-to-face no disponible en tabla ASME B16.10 embebida — DXF de cuerpo de válvula no disponible. Consultar fabricante." />}
              </ResBox>
            );
          })()}
        </div>
      )}

      {/* ══ DISEÑO DE VÁLVULA ══ */}
      {sub === 'diseno' && (
        <div>
          <Tit t="Diseño de válvula — Face-to-Face ASME B16.10 + DXF esquemático" />
          <Info t="Valores F2F exclusivamente de tablas verificadas. NUNCA interpolados ni calculados. Si la combinación no está en tabla → Consultar fabricante." />

          {/* Selector tipo válvula */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' as const }}>
            {([
              { id: 'compuerta'  as TipoDisenio, label: 'Compuerta (Gate)',    icon: '🔲', norma: 'API 600 / B16.34' },
              { id: 'globo'      as TipoDisenio, label: 'Globo (Globe)',        icon: '🔵', norma: 'ASME B16.34' },
              { id: 'bola'       as TipoDisenio, label: 'Bola (Ball)',          icon: '⚽', norma: 'API 6D / B16.34' },
              { id: 'mariposa'   as TipoDisenio, label: 'Mariposa (Butterfly)', icon: '🦋', norma: 'API 609 / MSS SP-67' },
              { id: 'retencion'  as TipoDisenio, label: 'Retención (Check)',    icon: '↩️', norma: 'API 594 / B16.10' },
              { id: 'tapon'      as TipoDisenio, label: 'Tapón (Plug)',         icon: '🔌', norma: 'MSS SP-78 / B16.10' },
            ]).map(t => (
              <button key={t.id} onClick={() => {
                setDisTipo(t.id);
                const firstClase = CLASES_DISENO[t.id][0];
                setDisClase(firstClase);
                const npsList = NPS_DISENO[t.id][firstClase] || [];
                setDisNPS(npsList[Math.min(4, npsList.length - 1)] || npsList[0] || '');
                setResDis(null);
              }}
                style={{ flex: '1 1 calc(20% - 8px)', minWidth: 90, padding: '10px 6px', border: `1px solid ${disTipo === t.id ? COLOR : 'rgba(13,148,136,0.2)'}`, borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 700, background: disTipo === t.id ? `linear-gradient(135deg,${COLOR},#0f766e)` : '#0a0f1e', color: disTipo === t.id ? '#fff' : '#64748b', textAlign: 'center' as const }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                <div>{t.label}</div>
                <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{t.norma}</div>
              </button>
            ))}
          </div>

          <div style={g3}>
            <div><label style={lbl}>Clase de presión</label>
              <select value={disClase} onChange={e => {
                const cl = e.target.value; setDisClase(cl);
                const npsList = NPS_DISENO[disTipo][cl] || [];
                setDisNPS(npsList[Math.min(4, npsList.length - 1)] || npsList[0] || '');
                setResDis(null);
              }} style={inp}>
                {CLASES_DISENO[disTipo].map(c => <option key={c} value={c} style={{ background: '#0a0f1e' }}>Class {c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>NPS — Diámetro nominal (pulgadas)</label>
              <select value={disNPS} onChange={e => { setDisNPS(e.target.value); setResDis(null); }} style={inp}>
                {(NPS_DISENO[disTipo][disClase] || []).map(n => <option key={n} value={n} style={{ background: '#0a0f1e' }}>NPS {n}"</option>)}
              </select>
            </div>
            <div><label style={lbl}>Nombre proyecto (para DXF)</label>
              <input value={disProyecto} onChange={e => setDisProyecto(e.target.value)} style={inp} placeholder="Ej: Planta GNL Norte" />
            </div>
          </div>

          {/* Material del cuerpo */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Material del cuerpo (ASTM)</label>
            <select value={disMaterial} onChange={e => setDisMaterial(e.target.value)} style={inp}>
              <option value="A216 WCB"  style={{ background: '#0a0f1e' }}>A216 WCB — Acero carbono (estándar, -29°C a 425°C)</option>
              <option value="A216 WCC"  style={{ background: '#0a0f1e' }}>A216 WCC — Acero carbono alta resist. (-29°C a 425°C)</option>
              <option value="A352 LCC"  style={{ background: '#0a0f1e' }}>A352 LCC — Baja temperatura (-46°C a 345°C)</option>
              <option value="A352 LCB"  style={{ background: '#0a0f1e' }}>A352 LCB — Baja temperatura (-46°C a 345°C)</option>
              <option value="A351 CF8"  style={{ background: '#0a0f1e' }}>A351 CF8 — Inox 304 (-196°C a 425°C)</option>
              <option value="A351 CF8M" style={{ background: '#0a0f1e' }}>A351 CF8M — Inox 316 (-196°C a 450°C)</option>
            </select>
          </div>

          {/* Estilo — solo para válvula mariposa */}
          {disTipo === 'mariposa' && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Estilo de instalación</label>
              <select value={disEstilo} onChange={e => setDisEstilo(e.target.value)} style={inp}>
                <option value="Wafer"          style={{ background: '#0a0f1e' }}>Wafer — entre bridones (más económico)</option>
                <option value="Lug"            style={{ background: '#0a0f1e' }}>Lug — con orejas roscadas (end-of-line)</option>
                <option value="Double Flanged" style={{ background: '#0a0f1e' }}>Double Flanged — con bridas propias</option>
              </select>
            </div>
          )}

          {/* Subtipo — solo para válvula de retención */}
          {disTipo === 'retencion' && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Subtipo de válvula de retención</label>
              <select value={disSubtipo} onChange={e => setDisSubtipo(e.target.value)} style={inp}>
                <option value="Swing"        style={{ background: '#0a0f1e' }}>Swing Check — clapeta giratoria (bajo ΔP, caudal alto)</option>
                <option value="Lift"         style={{ background: '#0a0f1e' }}>Lift Check — disco axial (alta presión, flujo limpio)</option>
                <option value="Tilting Disc" style={{ background: '#0a0f1e' }}>Tilting Disc — disco inclinado (cierre rápido, agua)</option>
              </select>
            </div>
          )}

          {/* Patrón — solo para válvula de tapón */}
          {disTipo === 'tapon' && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Patrón de tapón</label>
              <select value={disPatron} onChange={e => setDisPatron(e.target.value)} style={inp}>
                <option value="Regular" style={{ background: '#0a0f1e' }}>Regular — orificio estándar (MSS SP-78)</option>
                <option value="Venturi" style={{ background: '#0a0f1e' }}>Venturi — orificio reducido (menor pérdida de presión)</option>
              </select>
            </div>
          )}

          <Btn onClick={calcDisenio} text={
            disTipo === 'compuerta'  ? 'Consultar F2F — Compuerta ASME B16.10 Tabla 1'       :
            disTipo === 'globo'      ? 'Consultar dimensiones — Globo ASME B16.34'            :
            disTipo === 'mariposa'   ? 'Generar esquema — Mariposa API 609 / MSS SP-67'       :
            disTipo === 'retencion'  ? 'Consultar F2F — Retención ASME B16.10-2022 + API 594' :
            disTipo === 'tapon'      ? 'Consultar F2F — Tapón ASME B16.10-2022 + MSS SP-78'   :
                                      'Consultar F2F — Bola API 6D / ASME B16.10 Long Pattern'
          } />

          {resDis && (() => {
            const { f2f_mm, fd, nps, clase, tipo, subtipo } = resDis;
            const tipoLabel = tipo === 'compuerta' ? 'Compuerta (Gate)'
                            : tipo === 'globo'     ? 'Globo (Globe)'
                            : tipo === 'mariposa'  ? 'Mariposa (Butterfly)'
                            : tipo === 'retencion' ? `Retención — ${subtipo ?? 'Swing'} Check`
                            : tipo === 'tapon'     ? `Tapón ${subtipo ?? 'Regular'} (Plug)`
                            :                       'Bola (Ball)';
            const normaLabel = tipo === 'bola'      ? 'ASME B16.34 + B16.10 Long Pattern + API 6D'
                             : tipo === 'compuerta' ? 'ASME B16.34 + B16.10 Tabla 1 + API 600'
                             : tipo === 'mariposa'  ? 'API 609 / MSS SP-67 / ASME B16.34'
                             : tipo === 'retencion' ? 'ASME B16.10-2022 + API STD 594'
                             : tipo === 'tapon'     ? 'ASME B16.10-2022 + MSS SP-78'
                             :                       'ASME B16.34 + B16.10';
            const OD_mm   = fd ? Math.round(fd.OD   * 25.4 * 10) / 10 : null;
            const BC_mm   = fd ? Math.round(fd.BC   * 25.4 * 10) / 10 : null;
            const bore_mm = fd ? Math.round(fd.bore * 25.4 * 10) / 10 : null;
            const db_mm   = fd ? Math.round(fd.db   * 25.4 * 10) / 10 : null;
            const bh_mm   = fd ? Math.round((fd.db + 0.125) * 25.4 * 10) / 10 : null;
            const capaLabel = tipo === 'bola'      ? 'ESFERA'
                            : tipo === 'compuerta' ? 'CUÑA'
                            : tipo === 'mariposa'  ? 'EJE'
                            : tipo === 'retencion' ? 'CLAPETA'
                            : tipo === 'tapon'     ? 'TAPON_CONICO'
                            :                       '—';
            const disc_d_mm = tipo === 'mariposa' ? Math.round(parseFloat(nps) * 25.4 * 10) / 10 : null;

            return (
              <ResBox>
                <RLbl t={`${tipoLabel} — NPS ${nps}" Class ${clase} — ${normaLabel}`} />
                <div style={g2}>
                  <Card label={`Prueba hidrostática de carcasa — B16.34 §7.1.1 (Class ${clase})`} val={resDis.pruebaTxt} sub={resDis.citaPT ? `1,5 × rating a 38 °C, al bar entero superior · ${resDis.citaPT}` : 'Solo A216 WCB y A351 CF8M tienen tabla P-T en el módulo'} />
                  <Card label={`Duración mínima de la prueba — B16.34 §7.1.2 (NPS ${nps}")`} val={resDis.duracionS !== null ? `${resDis.duracionS} s` : 'No disponible'} sub="NPS ≤2: 15 s · 2½–6: 60 s · 8–12: 120 s · ≥14: 300 s" />
                </div>

                {/* Diámetro disco para mariposa */}
                {tipo === 'mariposa' && (
                  <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 6, letterSpacing: 0.4 }}>Diámetro disco (NPS × 25.4)</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: COLOR }}>{disc_d_mm} mm
                      <span style={{ fontSize: 13, color: '#475569', fontWeight: 400, marginLeft: 12 }}>({nps}" = {disc_d_mm} mm)</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
                      Estilo: <strong style={{ color: '#f1f5f9' }}>{disEstilo}</strong> · Apertura 1/4 vuelta · API 609 / MSS SP-67 · DXF disponible con capa EJE.
                    </div>
                  </div>
                )}

                {/* F2F — ocultar para mariposa, retencion y tapon (tienen su propia sección) */}
                {tipo !== 'mariposa' && tipo !== 'retencion' && tipo !== 'tapon' && (
                  <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 6, letterSpacing: 0.4 }}>
                      Face-to-Face ASME B16.10 {tipo === 'bola' ? '— Long Pattern' : tipo === 'compuerta' ? '— Tabla 1 (Raised Face)' : ''}
                    </div>
                    {f2f_mm ? (
                      <div style={{ fontSize: 22, fontWeight: 800, color: COLOR }}>
                        {f2f_mm} mm
                        <span style={{ fontSize: 13, color: '#475569', fontWeight: 400, marginLeft: 12 }}>({(f2f_mm / 25.4).toFixed(2)}")</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: '#f59e0b', fontWeight: 700 }}>
                        Consultar fabricante — dato no disponible en tabla estándar
                      </div>
                    )}
                    {!f2f_mm && tipo === 'globo' && <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>F2F para Globo varía por modelo (short/long pattern). Consultar ASME B16.10 con el fabricante.</div>}
                    {f2f_mm && tipo === 'bola' && <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>Long Pattern · Full Bore · API 6D · DXF disponible con capa ESFERA.</div>}
                    {f2f_mm && tipo === 'compuerta' && <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>Raised face · DXF disponible con capa CUÑA (compuerta).</div>}
                  </div>
                )}

                {/* F2F para mariposa siempre es Consultar fabricante */}
                {tipo === 'mariposa' && (
                  <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 4 }}>Face-to-Face ASME B16.10</div>
                    <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>Consultar fabricante — dato no disponible en tabla estándar</div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>F2F varía según estilo (Wafer/Lug/Double Flanged) y fabricante. Consultar API 609 / ASME B16.10 con el proveedor.</div>
                  </div>
                )}

                {/* F2F para retención */}
                {tipo === 'retencion' && (
                  <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 6, letterSpacing: 0.4 }}>
                      Face-to-Face ASME B16.10-2022 — {subtipo ?? 'Swing'} Check
                    </div>
                    {f2f_mm ? (
                      <>
                        <div style={{ fontSize: 22, fontWeight: 800, color: COLOR }}>
                          {f2f_mm} mm
                          <span style={{ fontSize: 13, color: '#475569', fontWeight: 400, marginLeft: 12 }}>({(f2f_mm / 25.4).toFixed(2)}")</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
                          Swing Check Class 600 · API STD 594 · DXF disponible con capa CLAPETA.
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 14, color: '#f59e0b', fontWeight: 700 }}>
                          Consultar fabricante — dato no disponible en tabla estándar
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                          {subtipo !== 'Swing'
                            ? `F2F para ${subtipo ?? 'Lift'} Check varía por modelo y fabricante. Solo Swing Class 600 tiene valores embebidos.`
                            : `F2F Swing Check para Class ${clase} no disponible en tabla embebida. Solo Class 600 verificada.`}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* F2F para tapón */}
                {tipo === 'tapon' && (
                  <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 6, letterSpacing: 0.4 }}>
                      Face-to-Face ASME B16.10-2022 — Tapón {subtipo ?? 'Regular'}
                    </div>
                    {f2f_mm ? (
                      <>
                        <div style={{ fontSize: 22, fontWeight: 800, color: COLOR }}>
                          {f2f_mm} mm
                          <span style={{ fontSize: 13, color: '#475569', fontWeight: 400, marginLeft: 12 }}>({(f2f_mm / 25.4).toFixed(2)}")</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
                          Patrón {subtipo ?? 'Regular'} · MSS SP-78 · Apertura 1/4 vuelta · DXF disponible con capa TAPON_CONICO.
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 14, color: '#f59e0b', fontWeight: 700 }}>
                          Consultar fabricante — dato no disponible en tabla estándar
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                          F2F para Class {clase} NPS {nps}" no disponible en tabla embebida. Solo Class 600 y Class 900 (NPS 8–12) verificadas.
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Brida B16.5 */}
                {fd ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                    {([
                      { l: 'OD exterior brida', v: `${OD_mm} mm`, s: `${fd.OD}" pulgadas` },
                      { l: 'Círculo de pernos BC', v: `${BC_mm} mm`, s: `${fd.BC}" pulgadas` },
                      { l: 'Bore interior', v: `${bore_mm} mm`, s: `${fd.bore}" pulgadas` },
                      { l: 'N° de pernos', v: `${fd.n}`, s: 'equiespaciados' },
                      { l: 'Diámetro perno', v: `${db_mm} mm`, s: `${fd.db}"` },
                      { l: 'Agujero perno (db+1/8")', v: `${bh_mm} mm`, s: 'ASME B16.5' },
                    ] as const).map((r, i) => (
                      <div key={i} style={{ background: '#0a0f1e', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' as const, marginBottom: 3 }}>{r.l}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: COLOR }}>{r.v}</div>
                        <div style={{ fontSize: 10, color: '#334155' }}>{r.s}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>
                      Dimensiones de brida ASME B16.5: Consultar fabricante
                    </div>
                    <div style={{ fontSize: 11, color: '#475569' }}>
                      NPS {nps}" Class {clase} no está en tabla B16.5 embebida. Usar tab <strong style={{ color: '#f1f5f9' }}>Brida B16.5</strong> o consultar el estándar vigente.
                    </div>
                  </div>
                )}

                {tipo === 'mariposa'
                  ? <Info t="DXF disponible: 4 capas (CUERPO · EJE · BRIDA · ANOTACIONES). Disco circular diámetro = NPS en mm. Plano esquemático — validar con fabricante." />
                  : tipo === 'retencion'
                    ? (f2f_mm
                      ? <Info t={`DXF disponible: 4 capas (CUERPO · CLAPETA · BRIDA · ANOTACIONES). Subtipo: ${subtipo ?? 'Swing'}. Plano esquemático — validar con fabricante antes de mecanizar.`} />
                      : <Warn t="⚠️ F2F no disponible en tabla embebida — DXF no generado. Consultar fabricante." />
                    )
                  : tipo === 'tapon'
                    ? (f2f_mm
                      ? <Info t={`DXF disponible: 4 capas (CUERPO · TAPON_CONICO · BRIDA · ANOTACIONES). Patrón: ${subtipo ?? 'Regular'}. Plano esquemático — validar con fabricante antes de mecanizar.`} />
                      : <Warn t="⚠️ F2F no disponible en tabla embebida — DXF no generado. Consultar fabricante." />
                    )
                    : (f2f_mm
                      ? <Info t={`DXF disponible: 4 capas (CUERPO · ${capaLabel} · BRIDA · ANOTACIONES). Plano esquemático — validar con fabricante antes de mecanizar.`} />
                      : <Warn t="⚠️ F2F no disponible en tabla embebida — DXF no generado. Consultar fabricante." />
                    )
                }
                <Warn t="⚠️ Plano esquemático de referencia — requiere validación de fabricante antes de mecanizar. Normativa: ASME B16.34 · B16.10 · B16.5 · API 6D / API 609 / API 594 / MSS SP-78." />
              </ResBox>
            );
          })()}
        </div>
      )}

      {/* ══ COEFICIENTE Cv ══ */}
      {sub === 'cv' && (
        <div>
          <Tit t={`Coeficiente de caudal Cv — ${NORMA_CV} (servicio líquido)`} />
          <Info t="Kv = Q(m³/h) × √(SG / ΔP(bar)) · Cv = 1,156 × Kv · Flujo estrangulado: ΔPmax = FL² × (P1 − FF × Pv), FF = 0,96 − 0,28 × √(Pv/Pc)" />

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Fase del fluido</label>
            <select value={cvFase} onChange={e => cambiarFaseCv(e.target.value as 'liquido'|'gas')} style={inp}>
              <option value="liquido" style={{ background: '#0a0f1e' }}>Líquido</option>
              <option value="gas" style={{ background: '#0a0f1e' }}>Gas / vapor — no implementado</option>
            </select>
          </div>

          {cvFase === 'gas' ? (
            <Warn rojo t={`⛔ Cálculo de gas/vapor no implementado aún. Este cálculo solo dimensiona líquidos (${NORMA_CV}); para gas o vapor hacen falta el factor de expansión Y, xT, Fγ, M, T1 y Z. No se puede continuar en este modo.`} />
          ) : (
          <>
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
            <div><label style={lbl}>Gravedad específica SG</label>
              <input value={cvSG} onChange={e => setCvSG(e.target.value)} style={inp} type="number" min="0.1" step="0.01" />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>Agua=1.00 · Crudo lig=0.82 · Crudo pes=0.92 · Diesel=0.85</div>
            </div>
          </div>

          <div style={g3}>
            <div><label style={lbl}>P1 entrada (manométrica)</label>
              <input value={cvP1} onChange={e => setCvP1(e.target.value)} style={inp} type="number" step="0.1" />
            </div>
            <div><label style={lbl}>P2 salida (manométrica)</label>
              <input value={cvP2} onChange={e => setCvP2(e.target.value)} style={inp} type="number" step="0.1" />
            </div>
            <div><label style={lbl}>Unidad de presión</label>
              <select value={cvUnidP} onChange={e => setCvUnidP(e.target.value as 'bar'|'psi')} style={inp}>
                <option value="bar" style={{ background: '#0a0f1e' }}>bar (barg / bar a)</option>
                <option value="psi" style={{ background: '#0a0f1e' }}>psi (psig / psia)</option>
              </select>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', margin: '-8px 0 16px', padding: '6px 10px', background: 'rgba(13,148,136,0.05)', borderRadius: 8 }}>
            ℹ️ P1 y P2 son <b>manométricas</b> ({cvUnidP === 'bar' ? 'barg' : 'psig'}). Para el cálculo se suma la presión atmosférica estándar ({cvUnidP === 'bar' ? `${P_ATM_BAR} bar` : '14,696 psi'}) y se trabaja con presiones absolutas. ΔP = P1 − P2.
          </div>

          <RLbl t="VERIFICACIÓN DE FLUJO ESTRANGULADO (opcional)" />
          <div style={g2}>
            <div><label style={lbl}>Tipo de válvula (precarga FL)</label>
              <select value={cvTipoVal} onChange={e => cambiarTipoValCv(e.target.value as 'globo'|'bola'|'mariposa'|'otro')} style={inp}>
                <option value="globo" style={{ background: '#0a0f1e' }}>Globo — FL ≈ {FL_ORIENTATIVO.globo}</option>
                <option value="bola" style={{ background: '#0a0f1e' }}>Bola — FL ≈ {FL_ORIENTATIVO.bola}</option>
                <option value="mariposa" style={{ background: '#0a0f1e' }}>Mariposa — FL ≈ {FL_ORIENTATIVO.mariposa}</option>
                <option value="otro" style={{ background: '#0a0f1e' }}>Otro / valor manual</option>
              </select>
            </div>
            <div><label style={lbl}>FL — factor de recuperación de presión</label>
              <input value={cvFL} onChange={e => setCvFL(e.target.value)} style={inp} type="number" min="0.1" max="1" step="0.01" />
              <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 3 }}>⚠ Valor orientativo, verificar contra la hoja de datos del fabricante.</div>
            </div>
            <div><label style={lbl}>Pv — presión de vapor del líquido (absoluta)</label>
              <input value={cvPv} onChange={e => setCvPv(e.target.value)} style={inp} type="number" min="0" step="0.01" placeholder={`Opcional — ${cvUnidP === 'bar' ? 'bar a' : 'psia'}`} />
            </div>
            <div><label style={lbl}>Pc — presión crítica termodinámica (absoluta)</label>
              <input value={cvPc} onChange={e => setCvPc(e.target.value)} style={inp} type="number" min="0" step="0.1" placeholder={`Opcional — ${cvUnidP === 'bar' ? 'bar a' : 'psia'} (agua: 220,64 bar a)`} />
            </div>
          </div>

          <Btn onClick={calcCv} text="Calcular Cv requerido" />

          {resCv && (
            <ResBox>
              <RLbl t={`RESULTADO — COEFICIENTE DE CAUDAL (${NORMA_CV})`} />
              <div style={g3}>
                <Card label="Cv requerido (US)" val={resCv.Cv_txt} sub="Unidad US (GPM/√psi)" />
                <Card label="Kv requerido (métrico)" val={resCv.Kv_txt} sub="Unidad EU (m³/h/√bar)" />
                <Card label="Conversión" val="Cv = 1,156 × Kv" sub={NORMA_CV} />
              </div>
              {resCv.estrangulamiento === 'ESTRANGULADO' && (
                <Warn rojo t={`⛔ FLUJO ESTRANGULADO: ΔP = ${resCv.dP_bar.toFixed(3)} bar ≥ ΔPmax = ${resCv.dPmax_bar!.toFixed(3)} bar (FL = ${cvFL}, FF = ${resCv.FF!.toFixed(4)}). El Cv se calculó con ΔPmax: aumentar la caída de presión no aumenta el caudal. Riesgo de cavitación, ruido y daño — revisar la selección de la válvula.`} />
              )}
              {resCv.estrangulamiento === 'NO_ESTRANGULADO' && (
                <div style={{ fontSize: 11, color: '#4ade80', padding: '8px 12px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, marginBottom: 8 }}>
                  ✓ Sin estrangulamiento: ΔP = {resCv.dP_bar.toFixed(3)} bar &lt; ΔPmax = {resCv.dPmax_bar!.toFixed(3)} bar (FF = {resCv.FF!.toFixed(4)}).
                </div>
              )}
              {resCv.estrangulamiento === 'NO_VERIFICADO' && (
                <div style={{ fontSize: 11, color: '#94a3b8', padding: '8px 12px', background: '#0a0f1e', border: '1px solid #475569', borderRadius: 8, marginBottom: 8 }}>
                  ⚪ Estrangulamiento no verificado — faltan: {resCv.faltanParaVerificar.join(', ')}. Sin esos datos el Cv supone flujo no estrangulado.
                </div>
              )}
              {resCv.flashing && (
                <Warn rojo t="⛔ P2 absoluta ≤ Pv: el líquido se vaporiza a la salida (flashing). Revisar selección de válvula y materiales." />
              )}
              <div style={{ fontSize: 12, padding: '8px 12px', background: '#0a0f1e', borderRadius: 8, marginTop: 8 }}>
                <span style={{ color: COLOR, fontWeight: 700 }}>Orientación: </span>{resCv.desc}
              </div>
              <Warn t={`⚠️ Cv para líquido en flujo turbulento, sin accesorios (Fp = 1). Para gas, vapor, flujo bifásico o servicio crítico consultar ${NORMA_CV} completo con ingeniero de control.`} />
            </ResBox>
          )}
          </>
          )}
        </div>
      )}
      {datosActivo && <BotonesExportar visible={true} datos={datosActivo} />}

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
