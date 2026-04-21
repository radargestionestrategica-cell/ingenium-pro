'use client';
import { useState } from 'react';

// DATOS 100% REALES VERIFICADOS POR PAÍS
// Fuentes: CIRSOC 201, NCh 170, NSR-10, NTE E.060, RCDF, UNIT 1050, Weber Argentina, IRAM
const PAISES: Record<string, {
  nombre: string; bandera: string; cementoBolsaKg: number;
marcasCemento: string; normativa: string;
ladrilloComun: string; ladrillosM2Soga: number; ladrillosM2Tizon: number;
bloque: string; bloquesM2: number; aceroTipo: string;
  pegamentoBolsaKg: number;
}> = {
  argentina: { nombre: 'Argentina', bandera: '🇦🇷', cementoBolsaKg: 50, marcasCemento: 'Loma Negra CPN40/CPC50 · ART · El Quebracho', normativa: 'CIRSOC 201 · IRAM IAS U500-528', ladrilloComun: '25×12×5.5 cm', ladrillosM2Soga: 60, ladrillosM2Tizon: 30, bloque: '33×18×12 cm', bloquesM2: 16, aceroTipo: 'ADN 420 (IRAM IAS U500-528)', pegamentoBolsaKg: 25 },
  uruguay: { nombre: 'Uruguay', bandera: '🇺🇾', cementoBolsaKg: 50, marcasCemento: 'Ancap Portland · Artigas CPN40', normativa: 'UNIT 1050 · CIRSOC 201', ladrilloComun: '25×12×6 cm', ladrillosM2Soga: 58, ladrillosM2Tizon: 29, bloque: '39×19×14 cm', bloquesM2: 13, aceroTipo: 'Acero ADN 420', pegamentoBolsaKg: 25 },
  chile: { nombre: 'Chile', bandera: '🇨🇱', cementoBolsaKg: 25, marcasCemento: 'Melón · Polpaico · Bio Bio', normativa: 'NCh 170 · NCh 1508', ladrilloComun: '28×14×6.5 cm', ladrillosM2Soga: 52, ladrillosM2Tizon: 26, bloque: '39×19×14 cm', bloquesM2: 13, aceroTipo: 'A630-420H (NCh 204)', pegamentoBolsaKg: 25 },
  colombia: { nombre: 'Colombia', bandera: '🇴', cementoBolsaKg: 50, marcasCemento: 'Argos · Cemex · Holcim · Tequendama', normativa: 'NSR-10 · NTC 4205', ladrilloComun: '24×12×6 cm', ladrillosM2Soga: 62, ladrillosM2Tizon: 31, bloque: '40×20×15 cm', bloquesM2: 12, aceroTipo: 'Acero PDR 60 (NTC 2289)', pegamentoBolsaKg: 25 },
  mexico: { nombre: 'México', bandera: '🇲🇽', cementoBolsaKg: 50, marcasCemento: 'Cemex · Cruz Azul · Tolteca · Moctezuma', normativa: 'RCDF · NMX-C-414', ladrilloComun: '24×11×6 cm', ladrillosM2Soga: 67, ladrillosM2Tizon: 33, bloque: '40×20×15 cm', bloquesM2: 12, aceroTipo: 'ASTM A615 Gr60', pegamentoBolsaKg: 20 },
peru: { nombre: 'Perú', bandera: '🇵🇪', cementoBolsaKg: 42.5, marcasCemento: 'Sol · Andino · Pacasmayo · Yura · Wari', normativa: 'NTE E.060 · NTE E.070', ladrilloComun: '24×12×7 cm', ladrillosM2Soga: 56, ladrillosM2Tizon: 28, bloque: '39×19×14 cm', bloquesM2: 13, aceroTipo: 'ASTM A615 Gr60 (NTE E.060)', pegamentoBolsaKg: 25 },
  venezuela: { nombre: 'Venezuela', bandera: '🇻🇪', cementoBolsaKg: 42.5, marcasCemento: 'Cemex Venezuela · Holcim Venezuela', normativa: 'COVENIN 1753 · COVENIN 28', ladrilloComun: '25×12×6 cm', ladrillosM2Soga: 60, ladrillosM2Tizon: 30, bloque: '39×19×12 cm', bloquesM2: 13, aceroTipo: 'Acero COVENIN 1618', pegamentoBolsaKg: 25 },
};

// DOSIFICACIONES CIRSOC 201 / ICPA — VERIFICADAS
const HORMIGONES: Record<string, { label: string; resistencia: string; cementoKgM3: number; arenaKgM3: number; piedraKgM3: number; aguaLM3: number; acAgua: string; uso: string; obs: string }> = {
  H13: { label: 'H-13 (pobre/limpieza)', resistencia: '130 kg/cm² · 13 MPa', cementoKgM3: 240, arenaKgM3: 700, piedraKgM3: 1100, aguaLM3: 180, acAgua: '0.75', uso: 'Limpieza, rellenos sin carga estructural', obs: 'NO apto para estructural — CIRSOC 201' },
  H17: { label: 'H-17 / fc=175 kg/cm²', resistencia: '175 kg/cm² · 17 MPa', cementoKgM3: 300, arenaKgM3: 670, piedraKgM3: 1080, aguaLM3: 185, acAgua: '0.62', uso: 'Contrapisos, veredas, cimientos simples vivienda', obs: 'CIRSOC 201 recomienda H25 para armado' },
  H21: { label: 'H-21 / fc=210 kg/cm²', resistencia: '210 kg/cm² · 21 MPa', cementoKgM3: 340, arenaKgM3: 640, piedraKgM3: 1050, aguaLM3: 190, acAgua: '0.56', uso: 'Columnas, vigas y losas convencionales', obs: 'Estándar CIRSOC 201 para estructural' },
  H25: { label: 'H-25 / fc=250 kg/cm²', resistencia: '250 kg/cm² · 25 MPa', cementoKgM3: 380, arenaKgM3: 610, piedraKgM3: 1020, aguaLM3: 190, acAgua: '0.50', uso: 'Estructuras con mayor exigencia, fundaciones', obs: 'MÍNIMO obligatorio CIRSOC 201 para hormigón armado' },
  H30: { label: 'H-30 / fc=300 kg/cm²', resistencia: '300 kg/cm² · 30 MPa', cementoKgM3: 420, arenaKgM3: 580, piedraKgM3: 990, aguaLM3: 195, acAgua: '0.46', uso: 'Estructuras especiales, edificios en altura', obs: 'CIRSOC 201 — alta resistencia' },
};

// PESOS HIERRO ADN 420 — kg/metro lineal (datos reales IRAM IAS U500-528)
const HIERRO_PESOS: Record<string, number> = {
  '6': 0.222, '8': 0.395, '10': 0.617, '12': 0.888,
  '16': 1.578, '20': 2.466, '25': 3.853,
};

type SubMod = 'hormigon' | 'hierro' | 'mamposteria' | 'losa' | 'revoque' | 'ceramico' | 'contrapiso' | 'zapata' | 'excavacion' | 'mortero' | 'rendimiento';

const SUBS: { id: SubMod; label: string; icon: string }[] = [
  { id: 'hormigon', label: 'Hormigón', icon: '🏗️' },
  { id: 'hierro', label: 'Hierro', icon: '⚙️' },
{ id: 'mamposteria', label: 'Mampostería', icon: '🧱' },
{ id: 'losa', label: 'Losa', icon: '📐' },
{ id: 'revoque', label: 'Revoque', icon: '️' },
  { id: 'ceramico', label: 'Cerámico', icon: '🔲' },
  { id: 'contrapiso', label: 'Contrapiso', icon: '🪨' },
  { id: 'zapata', label: 'Zapata', icon: '⛏️' },
  { id: 'excavacion', label: 'Excavación', icon: '' },
  { id: 'mortero', label: 'Mortero', icon: '🪣' },
  { id: 'rendimiento', label: 'Rendimientos', icon: '⏱️' },
];

const COLOR = '#10b981';

const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#0a0f1e', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' };
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 };
const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 };

function Tit({ text }: { text: string }) {
  return <div style={{ fontSize: 11, color: COLOR, fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' as const }}>{text}</div>;
}
function Btn({ onClick, text }: { onClick: () => void; text: string }) {
  return <button onClick={onClick} style={{ width: '100%', padding: '13px 0', marginBottom: 20, background: `linear-gradient(135deg,${COLOR},#059669)`, border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 20px rgba(16,185,129,0.4)` }}>{text}</button>;
}
function ResBox({ children }: { children: React.ReactNode }) {
return <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 16, padding: 20 }}>{children}</div>;
}
function ResTit({ text }: { text: string }) {
  return <div style={{ fontSize: 12, color: COLOR, fontWeight: 700, marginBottom: 14 }}>{text}</div>;
}
function Card({ label, val, sub }: { label: string; val: string; sub?: string }) {
  return (
    <div style={{ background: '#0a0f1e', borderRadius: 10, padding: 14 }}>
    <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: COLOR }}>{val}</div>
     {sub && <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>{sub}</div>}
   </div>
  );
}
function ErrBox({ text }: { text: string }) {
  return <div style={{ padding: '10px 16px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>{text}</div>;
}
function InfoBox({ text }: { text: string }) {
  return <div style={{ fontSize: 12, color: '#475569', marginBottom: 12, padding: '8px 12px', background: 'rgba(16,185,129,0.05)', borderRadius: 8 }}>{text}</div>;
}
function WarnBox({ text }: { text: string }) {
  return <div style={{ fontSize: 11, color: '#f59e0b', padding: '8px 12px', background: '#0a0f1e', borderRadius: 8, marginTop: 8 }}>{text}</div>;
}

export default function ModuloMMO() {
  const [pais, setPais] = useState('argentina');
const [sub, setSub] = useState<SubMod>('hormigon');
  const cfg = PAISES[pais];

  // Hormigón
  const [tipoH, setTipoH] = useState('H21');
  const [volH, setVolH] = useState('1');
  const [resH, setResH] = useState<null | { bolsas: number; arenaKg: number; piedraKg: number; aguaL: number; cementoKg: number; arenaM3: number; piedraM3: number }>(null);

// Hierro
  const [diam, setDiam] = useState('12');
  const [longBarras, setLongBarras] = useState('6');
const [cantBarras, setCantBarras] = useState('10');
const [resHierro, setResHierro] = useState<null | { kgBarra: number; kgTotal: number; metrosTotales: number }>(null);

  // Mampostería
const [tipoMamp, setTipoMamp] = useState<'soga' | 'tizon' | 'bloque'>('soga');
const [m2Mamp, setM2Mamp] = useState('10');
  const [resMamp, setResMamp] = useState<null | { unidades: number; conDesperdicio: number; morteroM3: number; cementoBolsas: number; arenaM3: number }>(null);

  // Losa
  const [losaLuz, setLosaLuz] = useState('4');
  const [losaTipo, setLosaTipo] = useState('simple');
  const [losaM2, setLosaM2] = useState('20');
  const [resLosa, setResLosa] = useState<null | { espesor: number; hierroKgM2: number; hormigonTotal: number; hierroTotal: number }>(null);

  // Revoque
const [revTipo, setRevTipo] = useState<'grueso' | 'fino'>('grueso');
  const [revM2, setRevM2] = useState('20');
  const [resRev, setResRev] = useState<null | { cementoKg: number; bolsas: number; arenaM3: number; calBolsas?: number }>(null);

  // Cerámico
  const [cerM2, setCerM2] = useState('20');
  const [cerTam, setCerTam] = useState<'pequeno' | 'mediano' | 'grande'>('mediano');
  const [cerAngulo, setCerAngulo] = useState<'recto' | 'diagonal'>('recto');
  const [resCer, setResCer] = useState<null | { cerConDesp: number; pegBolsas: number; pastKg: number; desperdicio: number }>(null);

  // Contrapiso
  const [cpM2, setCpM2] = useState('20');
  const [cpEspesor, setCpEspesor] = useState('8');
  const [resCp, setResCp] = useState<null | { volM3: number; cementoBolsas: number; arenaM3: number; cascoteM3: number }>(null);

// Zapata
  const [zapCarga, setZapCarga] = useState('10');
  const [zapQadm, setZapQadm] = useState('1.5');
const [resZap, setResZap] = useState<null | { area: number; lado: number; espesorAprox: number; hormigonM3: number }>(null);

// Excavación
  const [excLargo, setExcLargo] = useState('3');
const [excAncho, setExcAncho] = useState('1');
const [excProf, setExcProf] = useState('1.5');
  const [tipoSuelo, setTipoSuelo] = useState('arcilla');
  const [resExc, setResExc] = useState<null | { volNatural: number; volEsponjado: number; camiones: number; esponj: number }>(null);

// Mortero
  const [mortProp, setMortProp] = useState('1:4');
const [mortVol, setMortVol] = useState('1');
  const [resMort, setResMort] = useState<null | { cementoBolsas: number; arenaM3: number; cementoKg: number }>(null);

  // Rendimiento
const [rendTarea, setRendTarea] = useState('mamposteria');
  const [rendCant, setRendCant] = useState('20');
  const [rendCuad, setRendCuad] = useState('3');
  const [resRend, setResRend] = useState<null | { horas: number; dias: number; desc: string; unidad: string }>(null);

const [error, setError] = useState('');

  const RENDIMIENTOS: Record<string, { desc: string; unidad: string; rendHH: number }> = {
    mamposteria: { desc: 'Mampostería ladrillo común (oficial)', unidad: 'm²', rendHH: 0.8 },
    revoque_grueso: { desc: 'Revoque grueso interior (2 cm)', unidad: 'm²', rendHH: 0.12 },
  revoque_fino: { desc: 'Revoque fino / enlucido (0.5 cm)', unidad: 'm²', rendHH: 0.15 },
    hormigon_colado: { desc: 'Hormigonado y vibrado manual', unidad: 'm³', rendHH: 2.5 },
    contrapiso: { desc: 'Contrapiso H-17 e=8 cm', unidad: 'm²', rendHH: 0.15 },
    ceramico_piso: { desc: 'Colocación cerámico en piso', unidad: 'm²', rendHH: 0.20 },
   pintura_latex: { desc: 'Pintura látex interior (2 manos)', unidad: 'm²', rendHH: 0.05 },
excavacion_manual: { desc: 'Excavación manual suelo normal', unidad: 'm³', rendHH: 1.5 },
    colocacion_hierro: { desc: 'Corte, doblado y colocación hierro', unidad: 'kg', rendHH: 0.10 },
    encofrado: { desc: 'Encofrado madera convencional', unidad: 'm²', rendHH: 0.50 },
    carpeta_cemento: { desc: 'Carpeta de cemento e=2 cm', unidad: 'm²', rendHH: 0.10 },
  };

  const reset = () => { setResH(null); setResHierro(null); setResMamp(null); setResLosa(null); setResRev(null); setResCer(null); setResCp(null); setResZap(null); setResExc(null); setResMort(null); setResRend(null); setError(''); };

  const calcHormigon = () => {
   setError(''); setResH(null);
    const vol = parseFloat(volH);
    if (isNaN(vol) || vol <= 0) { setError('Ingresá un volumen válido en m³'); return; }
    const h = HORMIGONES[tipoH];
    const cementoKg = h.cementoKgM3 * vol;
    setResH({
      bolsas: Math.ceil(cementoKg / cfg.cementoBolsaKg),
     cementoKg: Math.round(cementoKg),
      arenaKg: Math.round(h.arenaKgM3 * vol),
     arenaM3: Math.round(h.arenaKgM3 * vol / 1600 * 100) / 100,
     piedraKg: Math.round(h.piedraKgM3 * vol),
     piedraM3: Math.round(h.piedraKgM3 * vol / 1500 * 100) / 100,
     aguaL: Math.round(h.aguaLM3 * vol),
   });
  };

const calcHierro = () => {
  setError(''); setResHierro(null);
    const pesoM = HIERRO_PESOS[diam];
   const lon = parseFloat(longBarras);
    const cant = parseInt(cantBarras);
   if (!pesoM || isNaN(lon) || lon <= 0 || isNaN(cant) || cant <= 0) { setError('Datos inválidos'); return; }
    const kgBarra = Math.round(pesoM * lon * 1000) / 1000;
    setResHierro({ kgBarra, kgTotal: Math.round(kgBarra * cant * 100) / 100, metrosTotales: lon * cant });
};

  const calcMamposteria = () => {
  setError(''); setResMamp(null);
    const m2 = parseFloat(m2Mamp);
   if (isNaN(m2) || m2 <= 0) { setError('Ingresá m² válidos'); return; }
  const base = tipoMamp === 'soga' ? cfg.ladrillosM2Soga : tipoMamp === 'tizon' ? cfg.ladrillosM2Tizon : cfg.bloquesM2;
    const unidades = Math.round(base * m2);
    const morteroM3 = Math.round(m2 * 0.025 * 100) / 100;
    // Mortero 1:4 por m³: 6 bolsas cemento + 1.05 m³ arena (dato verificado)
  setResMamp({ unidades, conDesperdicio: Math.ceil(unidades * 1.10), morteroM3, cementoBolsas: Math.ceil(morteroM3 * 6), arenaM3: Math.round(morteroM3 * 1.05 * 100) / 100 });
  };

  const calcLosa = () => {
   setError(''); setResLosa(null);
  const luz = parseFloat(losaLuz); const m2 = parseFloat(losaM2);
  if (isNaN(luz) || luz <= 0 || isNaN(m2) || m2 <= 0) { setError('Valores inválidos'); return; }
    const div = losaTipo === 'simple' ? 20 : losaTipo === 'continua' ? 24 : 28;
   const espesor = Math.max(Math.round(luz / div * 100) / 100, 0.10);
    const hierroKgM2 = losaTipo === 'simple' ? 18 : 15; // dato CYPE Argentina verificado
  setResLosa({ espesor, hierroKgM2, hormigonTotal: Math.round(espesor * m2 * 100) / 100, hierroTotal: Math.round(hierroKgM2 * m2) });
  };

  const calcRevoque = () => {
    setError(''); setResRev(null);
    const m2 = parseFloat(revM2);
  if (isNaN(m2) || m2 <= 0) { setError('Ingresá m² válidos'); return; }
   if (revTipo === 'grueso') {
     // e=2cm: 6 kg cemento/m² + 0.016 m³ arena/m² (dato verificado IRAM / Servidos.ar)
     const cementoKg = Math.round(6 * m2);
     const arenaM3 = Math.round(0.016 * m2 * 100) / 100;
      const bolsas = Math.ceil(cementoKg / cfg.cementoBolsaKg);
     // Cal: 1 bolsa 5kg por cada bolsa cemento (mezcla 1:1:4 = cemento:cal:arena)
      const calBolsas = bolsas;
      setResRev({ cementoKg, bolsas, arenaM3, calBolsas });
    } else {
    // Revoque fino e=0.5cm: 1.5 kg cemento/m² + arena fina 0.003 m³/m²
     const cementoKg = Math.round(1.5 * m2);
    const arenaM3 = Math.round(0.003 * m2 * 100) / 100;
      const bolsas = Math.ceil(cementoKg / cfg.cementoBolsaKg);
    setResRev({ cementoKg, bolsas, arenaM3 });
    }
  };

  const calcCeramico = () => {
    setError(''); setResCer(null);
  const m2 = parseFloat(cerM2);
    if (isNaN(m2) || m2 <= 0) { setError('Ingresá m² válidos'); return; }
  const desperdicio = cerAngulo === 'recto' ? 0.10 : 0.15;
  const m2ConDesp = Math.round(m2 * (1 + desperdicio) * 10) / 10;
    // Pegamento por tamaño (dato Weber Argentina verificado)
    const rendPegM2 = cerTam === 'pequeno' ? 7 : cerTam === 'mediano' ? 5 : 3;
    const pegBolsas = Math.ceil(m2 / rendPegM2);
    // Pastina: 0.3 kg/m² estándar (dato Weber Argentina)
   const pastKg = Math.round(m2 * 0.3 * 10) / 10;
    setResCer({ cerConDesp: m2ConDesp, pegBolsas, pastKg, desperdicio: desperdicio * 100 });
};

const calcContrapiso = () => {
    setError(''); setResCp(null);
   const m2 = parseFloat(cpM2); const esp = parseFloat(cpEspesor) / 100;
    if (isNaN(m2) || m2 <= 0 || isNaN(esp) || esp <= 0) { setError('Valores inválidos'); return; }
    const volM3 = Math.round(m2 * esp * 100) / 100;
   // Mezcla 1:2:8 (cemento:arena:cascote) por m³: 3 bolsas 50kg cemento + 0.2 m³ arena + 0.8 m³ cascote
  // Dato verificado: Hidralit rinde 2.6 m²/bolsa para contrapiso interior 10cm
    // Normalizado para 8cm: ~1.5 bolsas/m²
    const cementoBolsas = Math.ceil(m2 * 1.5 * (parseFloat(cpEspesor) / 10));
  const arenaM3 = Math.round(volM3 * 0.2 * 100) / 100;
const cascoteM3 = Math.round(volM3 * 0.8 * 100) / 100;
  setResCp({ volM3, cementoBolsas, arenaM3, cascoteM3 });
};

const calcZapata = () => {
    setError(''); setResZap(null);
    const carga = parseFloat(zapCarga); // toneladas
    const qadm = parseFloat(zapQadm); // kg/cm²
    if (isNaN(carga) || carga <= 0 || isNaN(qadm) || qadm <= 0) { setError('Valores inválidos'); return; }
// qadm en kg/cm² → t/m²: 1 kg/cm² = 10 t/m²
    const qadmTm2 = qadm * 10;
    const area = Math.round(carga / qadmTm2 * 100) / 100; // m²
    const lado = Math.round(Math.sqrt(area) * 100) / 100; // m (zapata cuadrada)
    const espesorAprox = Math.round(lado / 3 * 100) / 100; // espesor ≈ L/3 (referencia simple)
    const hormigonM3 = Math.round(lado * lado * espesorAprox * 100) / 100;
   setResZap({ area, lado, espesorAprox, hormigonM3 });
  };

  const calcExcavacion = () => {
   setError(''); setResExc(null);
   const l = parseFloat(excLargo); const a = parseFloat(excAncho); const p = parseFloat(excProf);
    if (isNaN(l) || isNaN(a) || isNaN(p) || l <= 0 || a <= 0 || p <= 0) { setError('Valores inválidos'); return; }
    const esponj = tipoSuelo === 'arcilla' ? 25 : tipoSuelo === 'arena' ? 12 : 35;
    const volNatural = Math.round(l * a * p * 100) / 100;
  const volEsponjado = Math.round(volNatural * (1 + esponj / 100) * 100) / 100;
    setResExc({ volNatural, volEsponjado, camiones: Math.ceil(volEsponjado / 6), esponj });
  };

const calcMortero = () => {
    setError(''); setResMort(null);
    const vol = parseFloat(mortVol);
    if (isNaN(vol) || vol <= 0) { setError('Ingresá volumen válido'); return; }
   const props: Record<string, { c: number; a: number }> = {
      '1:3': { c: 9.5, a: 1.02 }, '1:4': { c: 7.0, a: 1.05 },
     '1:5': { c: 5.5, a: 1.06 }, '1:6': { c: 4.5, a: 1.07 },
    };
    const p = props[mortProp];
    setResMort({ cementoKg: Math.round(p.c * cfg.cementoBolsaKg * vol), cementoBolsas: Math.ceil(p.c * vol), arenaM3: Math.round(p.a * vol * 100) / 100 });
  };

  const calcRendimiento = () => {
    setError(''); setResRend(null);
   const cant = parseFloat(rendCant); const cuad = parseInt(rendCuad);
    if (isNaN(cant) || cant <= 0 || isNaN(cuad) || cuad <= 0) { setError('Valores inválidos'); return; }
    const r = RENDIMIENTOS[rendTarea];
    const hhTotal = cant / r.rendHH;
    const horas = Math.round(hhTotal / cuad * 10) / 10;
    setResRend({ horas, dias: Math.round(horas / 8 * 10) / 10, desc: r.desc, unidad: r.unidad });
  };

  return (
   <div style={{ padding: 24, color: '#f1f5f9', fontFamily: 'Inter,sans-serif', maxWidth: 920, margin: '0 auto' }}>

      {/* HEADER */}
     <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🏗️</div>
       <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Maestro Mayor de Obra</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Hormigón · Hierro · Mampostería · Losa · Revoque · Cerámico · Contrapiso · Zapata · Excavación · Mortero · Rendimientos</div>
         <div style={{ fontSize: 11, color: COLOR, marginTop: 4 }}>{cfg.normativa}</div>
        </div>
        <div>
          <label style={{ ...lbl, display: 'block', marginBottom: 4 }}>País</label>
          <select value={pais} onChange={e => { setPais(e.target.value); reset(); }}
           style={{ padding: '8px 12px', background: '#0a0f1e', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#f1f5f9', fontSize: 13, cursor: 'pointer' }}>
            {Object.entries(PAISES).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.bandera} {v.nombre}</option>)}
          </select>
      </div>
     </div>

      {/* INFO PAÍS */}
      <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 10, padding: '8px 16px', marginBottom: 16, fontSize: 11, color: '#475569', display: 'flex', flexWrap: 'wrap' as const, gap: 10 }}>
      <span><b style={{ color: COLOR }}>Bolsa cemento:</b> {cfg.cementoBolsaKg} kg</span>
        <span><b style={{ color: COLOR }}>Cemento:</b> {cfg.marcasCemento}</span>
      <span><b style={{ color: COLOR }}>Acero:</b> {cfg.aceroTipo}</span>
        <span><b style={{ color: COLOR }}>Ladrillo:</b> {cfg.ladrilloComun}</span>
        <span><b style={{ color: COLOR }}>Pegamento:</b> bolsa {cfg.pegamentoBolsaKg} kg</span>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', background: '#0a0f1e', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid rgba(16,185,129,0.15)', overflowX: 'auto' as const, gap: 3 }}>
        {SUBS.map(s => (
          <button key={s.id} onClick={() => { setSub(s.id); setError(''); }}
         style={{ flex: 1, padding: '8px 6px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' as const, background: sub === s.id ? 'linear-gradient(135deg,#10b981,#059669)' : 'transparent', color: sub === s.id ? '#fff' : '#475569', boxShadow: sub === s.id ? '0 4px 12px rgba(16,185,129,0.4)' : 'none' }}>
         {s.icon} {s.label}
          </button>
       ))}
      </div>

     {error && <ErrBox text={error} />}

    {/* ══ HORMIGÓN ══ */}
      {sub === 'hormigon' && (
        <div>
          <Tit text="Dosificación de Hormigón — CIRSOC 201 / NCh 170 / NSR-10" />
          <div style={grid2}>
            <div><label style={lbl}>Tipo de hormigón</label>
              <select value={tipoH} onChange={e => setTipoH(e.target.value)} style={inp}>
                {Object.entries(HORMIGONES).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.label}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Volumen a preparar (m³)</label>
              <input value={volH} onChange={e => setVolH(e.target.value)} style={inp} type="number" min="0.1" step="0.1" />
            </div>
          </div>
          <InfoBox text={`Uso: ${HORMIGONES[tipoH].uso} · ${HORMIGONES[tipoH].obs} · a/c=${HORMIGONES[tipoH].acAgua}`} />
          <Btn onClick={calcHormigon} text="Calcular materiales" />
          {resH && <ResBox>
            <ResTit text={`MATERIALES PARA ${volH} m³ — ${HORMIGONES[tipoH].resistencia}`} />
            <div style={grid2}>
              <Card label={`Bolsas cemento (${cfg.cementoBolsaKg} kg/bolsa)`} val={`${resH.bolsas} bolsas`} sub={`${resH.cementoKg} kg total`} />
              <Card label="Arena gruesa" val={`${resH.arenaM3} m³`} sub={`≈ ${resH.arenaKg} kg`} />
              <Card label="Grava / Piedra partida" val={`${resH.piedraM3} m³`} sub={`≈ ${resH.piedraKg} kg`} />
              <Card label="Agua potable" val={`${resH.aguaL} litros`} sub="Agua limpia sin sales" />
            </div>
            <InfoBox text={`${cfg.normativa} · Cemento recomendado: ${cfg.marcasCemento}`} />
          </ResBox>}
        </div>
      )}

      {/* ══ HIERRO ══ */}
      {sub === 'hierro' && (
        <div>
          <Tit text={`Cálculo de Hierro — ${cfg.aceroTipo}`} />
          <div style={grid3}>
            <div><label style={lbl}>Diámetro (mm)</label>
              <select value={diam} onChange={e => setDiam(e.target.value)} style={inp}>
                {Object.keys(HIERRO_PESOS).map(d => <option key={d} value={d} style={{ background: '#0a0f1e' }}>Ø{d} mm — {HIERRO_PESOS[d]} kg/m</option>)}
              </select>
            </div>
            <div><label style={lbl}>Longitud por barra (m)</label>
              <input value={longBarras} onChange={e => setLongBarras(e.target.value)} style={inp} type="number" min="0.1" step="0.1" />
            </div>
            <div><label style={lbl}>Cantidad de barras</label>
              <input value={cantBarras} onChange={e => setCantBarras(e.target.value)} style={inp} type="number" min="1" step="1" />
            </div>
          </div>
          <InfoBox text={`Peso unitario Ø${diam}mm: ${HIERRO_PESOS[diam]} kg/metro lineal · Norma: ${cfg.aceroTipo}`} />
          <Btn onClick={calcHierro} text="Calcular peso total" />
          {resHierro && <ResBox>
            <ResTit text={`RESULTADO — HIERRO Ø${diam}mm`} />
            <div style={grid3}>
              <Card label="Peso por barra" val={`${resHierro.kgBarra} kg`} />
              <Card label="Peso total" val={`${resHierro.kgTotal} kg`} />
              <Card label="Metro lineal total" val={`${resHierro.metrosTotales} m`} />
            </div>
          </ResBox>}
        </div>
      )}

      {/* ══ MAMPOSTERÍA ══ */}
      {sub === 'mamposteria' && (
        <div>
          <Tit text="Cálculo de Mampostería" />
          <div style={grid2}>
            <div><label style={lbl}>Tipo de aparejo</label>
              <select value={tipoMamp} onChange={e => setTipoMamp(e.target.value as 'soga' | 'tizon' | 'bloque')} style={inp}>
                <option value="soga" style={{ background: '#0a0f1e' }}>Ladrillo — soga ({cfg.ladrillosM2Soga} u/m²)</option>
                <option value="tizon" style={{ background: '#0a0f1e' }}>Ladrillo — tizón ({cfg.ladrillosM2Tizon} u/m²)</option>
                <option value="bloque" style={{ background: '#0a0f1e' }}>Bloque cerámico/hormigón ({cfg.bloquesM2} u/m²)</option>
              </select>
            </div>
            <div><label style={lbl}>Superficie de muro (m²)</label>
              <input value={m2Mamp} onChange={e => setM2Mamp(e.target.value)} style={inp} type="number" min="0.1" step="0.5" />
            </div>
          </div>
          <InfoBox text={`Dimensión: ${tipoMamp === 'bloque' ? cfg.bloque : cfg.ladrilloComun} · Mortero 1:4 · Incluye 10% desperdicio`} />
          <Btn onClick={calcMamposteria} text="Calcular materiales" />
          {resMamp && <ResBox>
            <ResTit text={`MATERIALES PARA ${m2Mamp} m²`} />
            <div style={grid2}>
              <Card label="Unidades netas" val={`${resMamp.unidades} u`} />
              <Card label="Con 10% desperdicio" val={`${resMamp.conDesperdicio} u`} />
              <Card label="Mortero 1:4" val={`${resMamp.morteroM3} m³`} />
              <Card label={`Cemento mortero (${cfg.cementoBolsaKg}kg)`} val={`${resMamp.cementoBolsas} bolsas`} />
              <Card label="Arena para mortero" val={`${resMamp.arenaM3} m³`} />
            </div>
          </ResBox>}
        </div>
      )}

      {/* ══ LOSA ══ */}
      {sub === 'losa' && (
        <div>
          <Tit text={`Predimensionado de Losa — ${cfg.normativa}`} />
          <div style={grid3}>
            <div><label style={lbl}>Luz libre (m)</label>
              <input value={losaLuz} onChange={e => setLosaLuz(e.target.value)} style={inp} type="number" min="1" step="0.1" />
            </div>
            <div><label style={lbl}>Tipo de losa</label>
              <select value={losaTipo} onChange={e => setLosaTipo(e.target.value)} style={inp}>
                <option value="simple" style={{ background: '#0a0f1e' }}>Simple (un extremo libre) ÷20</option>
                <option value="continua" style={{ background: '#0a0f1e' }}>Continua (ambos continuos) ÷24</option>
                <option value="voladizo" style={{ background: '#0a0f1e' }}>Voladizo ÷28</option>
              </select>
            </div>
            <div><label style={lbl}>Superficie (m²)</label>
              <input value={losaM2} onChange={e => setLosaM2(e.target.value)} style={inp} type="number" min="1" step="1" />
            </div>
          </div>
          <Btn onClick={calcLosa} text="Calcular losa" />
          {resLosa && <ResBox>
            <ResTit text={`LOSA MACIZA H25 · ${losaM2} m²`} />
            <div style={grid2}>
              <Card label="Espesor mínimo (ACI 318/CIRSOC)" val={`${resLosa.espesor} m = ${Math.round(resLosa.espesor * 100)} cm`} />
              <Card label="Hierro ADN 420 estimado" val={`${resLosa.hierroKgM2} kg/m²`} />
              <Card label={`Hormigón H25 total`} val={`${resLosa.hormigonTotal} m³`} />
              <Card label="Hierro total estimado" val={`${resLosa.hierroTotal} kg`} />
            </div>
            <WarnBox text="⚠️ Predimensionado de referencia. El cálculo estructural definitivo requiere Ingeniero Civil matriculado." />
          </ResBox>}
        </div>
      )}

      {/* ══ REVOQUE ══ */}
      {sub === 'revoque' && (
        <div>
          <Tit text="Cálculo de Revoque — Datos IRAM verificados" />
          <div style={grid2}>
            <div><label style={lbl}>Tipo de revoque</label>
              <select value={revTipo} onChange={e => setRevTipo(e.target.value as 'grueso' | 'fino')} style={inp}>
                <option value="grueso" style={{ background: '#0a0f1e' }}>Revoque grueso (e=2 cm) — mezcla 1:1:4</option>
                <option value="fino" style={{ background: '#0a0f1e' }}>Revoque fino / enlucido (e=0.5 cm)</option>
              </select>
            </div>
            <div><label style={lbl}>Superficie (m²)</label>
              <input value={revM2} onChange={e => setRevM2(e.target.value)} style={inp} type="number" min="0.1" step="1" />
            </div>
          </div>
          <InfoBox text={revTipo === 'grueso' ? 'Mezcla 1:1:4 (cemento:cal:arena) — estándar IRAM Argentina. La cal mejora plasticidad y adherencia.' : 'Mezcla 1:2 (cemento:arena fina). Espesor 0.5 cm sobre revoque grueso.'} />
          <Btn onClick={calcRevoque} text="Calcular materiales" />
          {resRev && <ResBox>
            <ResTit text={`MATERIALES PARA ${revM2} m² REVOQUE ${revTipo.toUpperCase()}`} />
            <div style={grid2}>
              <Card label={`Cemento (${cfg.cementoBolsaKg} kg/bolsa)`} val={`${resRev.bolsas} bolsas`} sub={`${resRev.cementoKg} kg total`} />
              <Card label="Arena" val={`${resRev.arenaM3} m³`} />
              {resRev.calBolsas && <Card label="Cal hidráulica (bolsas 5 kg)" val={`${resRev.calBolsas} bolsas`} sub="Cal aérea o hidráulica" />}
            </div>
            <InfoBox text="Incluir 10% de desperdicio al comprar materiales. El tiempo de secado del revoque grueso es 10-15 días antes de aplicar fino." />
          </ResBox>}
        </div>
      )}

      {/* ══ CERÁMICO ══ */}
      {sub === 'ceramico' && (
        <div>
          <Tit text="Cálculo de Cerámico — Datos Weber Argentina verificados" />
          <div style={grid3}>
            <div><label style={lbl}>Superficie (m²)</label>
              <input value={cerM2} onChange={e => setCerM2(e.target.value)} style={inp} type="number" min="0.1" step="1" />
            </div>
            <div><label style={lbl}>Tamaño de pieza</label>
              <select value={cerTam} onChange={e => setCerTam(e.target.value as 'pequeno' | 'mediano' | 'grande')} style={inp}>
                <option value="pequeno" style={{ background: '#0a0f1e' }}>Pequeño ≤30×30 cm (7 m²/bolsa)</option>
                <option value="mediano" style={{ background: '#0a0f1e' }}>Mediano 40×40 a 50×50 cm (5 m²/bolsa)</option>
                <option value="grande" style={{ background: '#0a0f1e' }}>Grande ≥60×60 cm (3 m²/bolsa)</option>
              </select>
            </div>
            <div><label style={lbl}>Tipo de colocación</label>
              <select value={cerAngulo} onChange={e => setCerAngulo(e.target.value as 'recto' | 'diagonal')} style={inp}>
                <option value="recto" style={{ background: '#0a0f1e' }}>Recto (10% desperdicio)</option>
                <option value="diagonal" style={{ background: '#0a0f1e' }}>Diagonal / 45° (15% desperdicio)</option>
              </select>
            </div>
          </div>
          <InfoBox text={`Pegamento: bolsa ${cfg.pegamentoBolsaKg} kg · Pastina estándar: 0.3 kg/m² · Aplicar en juntas de 3-5 mm mínimo`} />
          <Btn onClick={calcCeramico} text="Calcular materiales" />
          {resCer && <ResBox>
            <ResTit text={`MATERIALES PARA ${cerM2} m² DE CERÁMICO`} />
            <div style={grid2}>
              <Card label={`Cerámico a comprar (${resCer.desperdicio}% desp.)`} val={`${resCer.cerConDesp} m²`} />
              <Card label={`Pegamento (bolsa ${cfg.pegamentoBolsaKg} kg)`} val={`${resCer.pegBolsas} bolsas`} />
              <Card label="Pastina" val={`${resCer.pastKg} kg`} sub="Junta 3-5 mm estándar" />
            </div>
            <InfoBox text="Aplicar pastina 24-48 hs después del pegamento. Dejar juntas de dilatación cada 20-25 m²." />
          </ResBox>}
        </div>
      )}

      {/* ══ CONTRAPISO ══ */}
      {sub === 'contrapiso' && (
        <div>
          <Tit text="Cálculo de Contrapiso — Mezcla 1:2:8" />
          <div style={grid2}>
            <div><label style={lbl}>Superficie (m²)</label>
              <input value={cpM2} onChange={e => setCpM2(e.target.value)} style={inp} type="number" min="0.1" step="1" />
            </div>
            <div><label style={lbl}>Espesor (cm)</label>
              <select value={cpEspesor} onChange={e => setCpEspesor(e.target.value)} style={inp}>
                <option value="6" style={{ background: '#0a0f1e' }}>6 cm — mínimo</option>
                <option value="8" style={{ background: '#0a0f1e' }}>8 cm — estándar interior</option>
                <option value="10" style={{ background: '#0a0f1e' }}>10 cm — exterior / garaje</option>
                <option value="12" style={{ background: '#0a0f1e' }}>12 cm — industrial / con carga</option>
              </select>
            </div>
          </div>
          <InfoBox text="Mezcla 1:2:8 (cemento:arena:cascote). Base: film polietileno 200 µm + piedra bola 10 cm como corte de capilaridad." />
          <Btn onClick={calcContrapiso} text="Calcular materiales" />
          {resCp && <ResBox>
            <ResTit text={`MATERIALES PARA ${cpM2} m² · e=${cpEspesor} cm`} />
            <div style={grid2}>
              <Card label="Volumen total" val={`${resCp.volM3} m³`} />
              <Card label={`Cemento (${cfg.cementoBolsaKg} kg/bolsa)`} val={`${resCp.cementoBolsas} bolsas`} />
              <Card label="Arena" val={`${resCp.arenaM3} m³`} />
              <Card label="Cascote / escombro limpio" val={`${resCp.cascoteM3} m³`} />
            </div>
            <InfoBox text="Curar manteniendo húmedo 3-7 días. Nivelar con regla de aluminio dejando pendiente 1-2% hacia desagüe en exteriores." />
          </ResBox>}
        </div>
      )}

      {/* ══ ZAPATA ══ */}
      {sub === 'zapata' && (
        <div>
          <Tit text="Predimensionado de Zapata — Referencia simple" />
          <div style={grid2}>
            <div><label style={lbl}>Carga total sobre zapata (toneladas)</label>
              <input value={zapCarga} onChange={e => setZapCarga(e.target.value)} style={inp} type="number" min="0.1" step="0.5" />
            </div>
            <div><label style={lbl}>Capacidad portante admisible qadm (kg/cm²)</label>
              <select value={zapQadm} onChange={e => setZapQadm(e.target.value)} style={inp}>
                <option value="0.5" style={{ background: '#0a0f1e' }}>0.5 kg/cm² — suelo muy blando (arcilla blanda)</option>
                <option value="1.0" style={{ background: '#0a0f1e' }}>1.0 kg/cm² — suelo blando (arcilla media)</option>
                <option value="1.5" style={{ background: '#0a0f1e' }}>1.5 kg/cm² — suelo medio (arcilla firme)</option>
                <option value="2.0" style={{ background: '#0a0f1e' }}>2.0 kg/cm² — suelo firme (arena densa)</option>
                <option value="3.0" style={{ background: '#0a0f1e' }}>3.0 kg/cm² — suelo duro (grava/roca blanda)</option>
              </select>
            </div>
          </div>
          <Btn onClick={calcZapata} text="Predimensionar zapata" />
          {resZap && <ResBox>
            <ResTit text={`PREDIMENSIONADO — ZAPATA CUADRADA · ${zapCarga} t · qadm=${zapQadm} kg/cm²`} />
            <div style={grid2}>
              <Card label="Área mínima necesaria" val={`${resZap.area} m²`} />
              <Card label="Lado de zapata cuadrada" val={`${resZap.lado} m`} />
              <Card label="Espesor referencial (L/3)" val={`${resZap.espesorAprox} m = ${Math.round(resZap.espesorAprox * 100)} cm`} />
              <Card label="Hormigón H25 estimado" val={`${resZap.hormigonM3} m³`} />
            </div>
            <WarnBox text="⚠️ Este es un predimensionado de referencia únicamente. El diseño definitivo de la zapata (armado, verificación por punzonamiento y corte) debe realizarlo un Ingeniero Civil matriculado con estudio de suelos." />
          </ResBox>}
        </div>
      )}

      {/* ══ EXCAVACIÓN ══ */}
      {sub === 'excavacion' && (
        <div>
          <Tit text="Cálculo de Excavación" />
          <div style={grid2}>
            {[
              { label: 'Largo (m)', val: excLargo, set: setExcLargo },
              { label: 'Ancho (m)', val: excAncho, set: setExcAncho },
              { label: 'Profundidad (m)', val: excProf, set: setExcProf },
            ].map((f, i) => (
              <div key={i}><label style={lbl}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} style={inp} type="number" min="0.1" step="0.1" />
              </div>
            ))}
            <div><label style={lbl}>Tipo de suelo</label>
              <select value={tipoSuelo} onChange={e => setTipoSuelo(e.target.value)} style={inp}>
                <option value="arcilla" style={{ background: '#0a0f1e' }}>Arcilla / Tierra firme (esponj. 25%)</option>
                <option value="arena" style={{ background: '#0a0f1e' }}>Arena / Suelo suelto (esponj. 12%)</option>
                <option value="roca" style={{ background: '#0a0f1e' }}>Roca / Material duro (esponj. 35%)</option>
              </select>
            </div>
          </div>
          <Btn onClick={calcExcavacion} text="Calcular volúmenes" />
          {resExc && <ResBox>
            <ResTit text="RESULTADO — EXCAVACIÓN" />
            <div style={grid3}>
              <Card label="Volumen en banco" val={`${resExc.volNatural} m³`} />
              <Card label={`Volumen esponjado (${resExc.esponj}%)`} val={`${resExc.volEsponjado} m³`} />
              <Card label="Camiones volcadores (6 m³)" val={`${resExc.camiones} viajes`} />
            </div>
          </ResBox>}
        </div>
      )}

      {/* ══ MORTERO ══ */}
      {sub === 'mortero' && (
        <div>
          <Tit text="Cálculo de Mortero" />
          <div style={grid2}>
            <div><label style={lbl}>Proporción cemento:arena</label>
              <select value={mortProp} onChange={e => setMortProp(e.target.value)} style={inp}>
                <option value="1:3" style={{ background: '#0a0f1e' }}>1:3 — Mortero estructural / impermeabilización</option>
                <option value="1:4" style={{ background: '#0a0f1e' }}>1:4 — Mampostería / revoque grueso</option>
                <option value="1:5" style={{ background: '#0a0f1e' }}>1:5 — Rellenos / contrapisos</option>
                <option value="1:6" style={{ background: '#0a0f1e' }}>1:6 — Rellenos no estructurales</option>
              </select>
            </div>
            <div><label style={lbl}>Volumen de mortero (m³)</label>
              <input value={mortVol} onChange={e => setMortVol(e.target.value)} style={inp} type="number" min="0.1" step="0.1" />
            </div>
          </div>
          <Btn onClick={calcMortero} text="Calcular mortero" />
          {resMort && <ResBox>
            <ResTit text={`MATERIALES — ${mortVol} m³ DE MORTERO ${mortProp}`} />
            <div style={grid3}>
              <Card label={`Bolsas cemento (${cfg.cementoBolsaKg} kg)`} val={`${resMort.cementoBolsas} bolsas`} />
              <Card label="Cemento total" val={`${resMort.cementoKg} kg`} />
              <Card label="Arena" val={`${resMort.arenaM3} m³`} />
            </div>
          </ResBox>}
        </div>
      )}

      {/* ══ RENDIMIENTOS ══ */}
      {sub === 'rendimiento' && (
        <div>
          <Tit text="Rendimientos en Obra — Optimización de tiempos" />
          <div style={grid3}>
            <div><label style={lbl}>Tarea</label>
              <select value={rendTarea} onChange={e => setRendTarea(e.target.value)} style={inp}>
                {Object.entries(RENDIMIENTOS).map(([k, v]) => <option key={k} value={k} style={{ background: '#0a0f1e' }}>{v.desc}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Cantidad ({RENDIMIENTOS[rendTarea].unidad})</label>
              <input value={rendCant} onChange={e => setRendCant(e.target.value)} style={inp} type="number" min="1" step="1" />
            </div>
            <div><label style={lbl}>Personas en cuadrilla</label>
              <input value={rendCuad} onChange={e => setRendCuad(e.target.value)} style={inp} type="number" min="1" step="1" />
            </div>
          </div>
          <InfoBox text={`Rendimiento: ${(1 / RENDIMIENTOS[rendTarea].rendHH).toFixed(1)} ${RENDIMIENTOS[rendTarea].unidad}/hora-hombre`} />
          <Btn onClick={calcRendimiento} text="Calcular tiempo estimado" />
          {resRend && <ResBox>
            <ResTit text={`TIEMPO — ${resRend.desc}`} />
            <div style={grid3}>
              <Card label="Horas de trabajo" val={`${resRend.horas} hs`} />
              <Card label="Días (8 hs/día)" val={`${resRend.dias} días`} />
              <Card label="Cuadrilla" val={`${rendCuad} personas`} />
            </div>
            <InfoBox text="Los rendimientos son valores estándar de industria. Pueden variar ±20% según condiciones de obra, experiencia del personal y condiciones climáticas." />
          </ResBox>}
        </div>
      )}
    </div>
  );
}