'use client';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
//  CONVERSOR DE UNIDADES — INGENIUM PRO v8.1
//  27 categorías reales de ingeniería industrial
//  Factores verificados NIST · AWS · API · IEC · ASHRAE
//  Panel flotante — disponible en todos los módulos
// ═══════════════════════════════════════════════════════════════

interface Unidad {
  nombre: string;
  simbolo: string;
  factor: number; // valor_en_base = valor_en_unidad × factor
}
interface Cat {
  id: string; nombre: string; icono: string;
  grupo: 'basica' | 'tecnica' | 'exclusiva';
  modulos: string;
  tipo: 'lineal' | 'temperatura' | 'api_gravity' | 'awg';
  unidades: Unidad[];
}

// ─── AWG ↔ mm² — NEC 2023 / IEC 60228 — Verificado ────────────
const AWG: { awg: string; mm2: number; kcmil: string }[] = [
  { awg: '28', mm2: 0.080, kcmil: '—' },
  { awg: '26', mm2: 0.128, kcmil: '—' },
  { awg: '24', mm2: 0.205, kcmil: '—' },
  { awg: '22', mm2: 0.324, kcmil: '—' },
  { awg: '20', mm2: 0.519, kcmil: '—' },
  { awg: '18', mm2: 0.823, kcmil: '—' },
  { awg: '16', mm2: 1.31,  kcmil: '—' },
  { awg: '14', mm2: 2.08,  kcmil: '—' },
  { awg: '12', mm2: 3.31,  kcmil: '—' },
  { awg: '10', mm2: 5.26,  kcmil: '—' },
  { awg: '8',  mm2: 8.37,  kcmil: '—' },
  { awg: '6',  mm2: 13.3,  kcmil: '—' },
  { awg: '4',  mm2: 21.1,  kcmil: '—' },
  { awg: '3',  mm2: 26.7,  kcmil: '—' },
  { awg: '2',  mm2: 33.6,  kcmil: '—' },
  { awg: '1',  mm2: 42.4,  kcmil: '—' },
  { awg: '1/0',mm2: 53.5,  kcmil: '1/0' },
  { awg: '2/0',mm2: 67.4,  kcmil: '2/0' },
  { awg: '3/0',mm2: 85.0,  kcmil: '3/0' },
  { awg: '4/0',mm2: 107,   kcmil: '4/0' },
  { awg: '300kcmil', mm2: 152, kcmil: '300' },
  { awg: '350kcmil', mm2: 177, kcmil: '350' },
  { awg: '400kcmil', mm2: 203, kcmil: '400' },
  { awg: '500kcmil', mm2: 253, kcmil: '500' },
];

// ─── CATEGORÍAS — 27 en total ───────────────────────────────────
const CATS: Cat[] = [

  // ══════════ BÁSICAS (12) ══════════
  { id: 'presion', nombre: 'Presión', icono: '⚙️', grupo: 'basica',
    modulos: 'Petróleo · Cañerías · Válvulas · Perforación · Hidráulica', tipo: 'lineal',
    unidades: [
      { nombre: 'Pascal',       simbolo: 'Pa',      factor: 1 },
      { nombre: 'Kilopascal',   simbolo: 'kPa',     factor: 1000 },
      { nombre: 'Bar',          simbolo: 'bar',     factor: 100000 },
      { nombre: 'Megapascal',   simbolo: 'MPa',     factor: 1000000 },
      { nombre: 'psi',          simbolo: 'psi',     factor: 6894.757 },
      { nombre: 'kgf/cm²',      simbolo: 'kgf/cm²', factor: 98066.5 },
      { nombre: 'Atmósfera',    simbolo: 'atm',     factor: 101325 },
    ] },

  { id: 'temperatura', nombre: 'Temperatura', icono: '🌡️', grupo: 'basica',
    modulos: 'Todos los módulos', tipo: 'temperatura',
    unidades: [
      { nombre: 'Celsius',    simbolo: '°C', factor: 1 },
      { nombre: 'Fahrenheit', simbolo: '°F', factor: 1 },
      { nombre: 'Kelvin',     simbolo: 'K',  factor: 1 },
    ] },

  { id: 'longitud', nombre: 'Longitud', icono: '📏', grupo: 'basica',
    modulos: 'Todos los módulos', tipo: 'lineal',
    unidades: [
      { nombre: 'Milímetro',  simbolo: 'mm', factor: 0.001 },
      { nombre: 'Centímetro', simbolo: 'cm', factor: 0.01 },
      { nombre: 'Metro',      simbolo: 'm',  factor: 1 },
      { nombre: 'Kilómetro',  simbolo: 'km', factor: 1000 },
      { nombre: 'Pulgada',    simbolo: 'in', factor: 0.0254 },
      { nombre: 'Pie',        simbolo: 'ft', factor: 0.3048 },
      { nombre: 'Yarda',      simbolo: 'yd', factor: 0.9144 },
      { nombre: 'Milla',      simbolo: 'mi', factor: 1609.344 },
    ] },

  { id: 'area', nombre: 'Área', icono: '⬛', grupo: 'basica',
    modulos: 'Civil · Vialidad · MMO · Geotecnia', tipo: 'lineal',
    unidades: [
      { nombre: 'mm²',       simbolo: 'mm²',  factor: 1e-6 },
      { nombre: 'cm²',       simbolo: 'cm²',  factor: 1e-4 },
      { nombre: 'm²',        simbolo: 'm²',   factor: 1 },
      { nombre: 'km²',       simbolo: 'km²',  factor: 1e6 },
      { nombre: 'Pulgada²',  simbolo: 'in²',  factor: 6.4516e-4 },
      { nombre: 'Pie²',      simbolo: 'ft²',  factor: 0.092903 },
      { nombre: 'Hectárea',  simbolo: 'ha',   factor: 10000 },
      { nombre: 'Acre',      simbolo: 'acre', factor: 4046.856 },
    ] },

  { id: 'volumen', nombre: 'Volumen', icono: '🧊', grupo: 'basica',
    modulos: 'Petróleo · Hidráulica · Represas · MMO', tipo: 'lineal',
    unidades: [
      { nombre: 'Mililitro',   simbolo: 'mL',     factor: 1e-6 },
      { nombre: 'Litro',       simbolo: 'L',      factor: 1e-3 },
      { nombre: 'm³',          simbolo: 'm³',     factor: 1 },
      { nombre: 'Pulgada³',    simbolo: 'in³',    factor: 1.6387e-5 },
      { nombre: 'Pie³',        simbolo: 'ft³',    factor: 0.028317 },
      { nombre: 'Galón US',    simbolo: 'gal(US)',factor: 3.7854e-3 },
      { nombre: 'Barril crudo',simbolo: 'bbl',    factor: 0.158987 },
    ] },

  { id: 'caudal', nombre: 'Caudal', icono: '🌊', grupo: 'basica',
    modulos: 'Hidráulica · Represas · Perforación · Petróleo', tipo: 'lineal',
    unidades: [
      { nombre: 'L/s',      simbolo: 'L/s',   factor: 1e-3 },
      { nombre: 'm³/hora',  simbolo: 'm³/h',  factor: 2.77778e-4 },
      { nombre: 'm³/día',   simbolo: 'm³/d',  factor: 1.15741e-5 },
      { nombre: 'm³/s',     simbolo: 'm³/s',  factor: 1 },
      { nombre: 'GPM',      simbolo: 'GPM',   factor: 6.30902e-5 },
      { nombre: 'bbl/día',  simbolo: 'bbl/d', factor: 1.84013e-6 },
      { nombre: 'cfs',      simbolo: 'cfs',   factor: 0.028317 },
    ] },

  { id: 'masa', nombre: 'Masa / Peso', icono: '⚖️', grupo: 'basica',
    modulos: 'Civil · MMO · Soldadura · Minería', tipo: 'lineal',
    unidades: [
      { nombre: 'Gramo',        simbolo: 'g',     factor: 1e-3 },
      { nombre: 'Kilogramo',    simbolo: 'kg',    factor: 1 },
      { nombre: 'Tonelada (t)', simbolo: 't',     factor: 1000 },
      { nombre: 'Libra',        simbolo: 'lb',    factor: 0.453592 },
      { nombre: 'Onza',         simbolo: 'oz',    factor: 0.028350 },
      { nombre: 'Ton US (2000lb)',simbolo:'ton US',factor: 907.185 },
    ] },

  { id: 'fuerza', nombre: 'Fuerza', icono: '💪', grupo: 'basica',
    modulos: 'Civil · Geotecnia · Cañerías · Válvulas', tipo: 'lineal',
    unidades: [
      { nombre: 'Newton',       simbolo: 'N',   factor: 1 },
      { nombre: 'Kilonewton',   simbolo: 'kN',  factor: 1000 },
      { nombre: 'Meganewton',   simbolo: 'MN',  factor: 1e6 },
      { nombre: 'kgf',          simbolo: 'kgf', factor: 9.80665 },
      { nombre: 'lbf',          simbolo: 'lbf', factor: 4.44822 },
      { nombre: 'Tonelada-f',   simbolo: 'tf',  factor: 9806.65 },
    ] },

  { id: 'velocidad', nombre: 'Velocidad', icono: '💨', grupo: 'basica',
    modulos: 'Hidráulica · Vialidad · Arquitectura', tipo: 'lineal',
    unidades: [
      { nombre: 'm/s',    simbolo: 'm/s',   factor: 1 },
      { nombre: 'km/h',   simbolo: 'km/h',  factor: 0.27778 },
      { nombre: 'ft/s',   simbolo: 'ft/s',  factor: 0.3048 },
      { nombre: 'mph',    simbolo: 'mph',   factor: 0.44704 },
      { nombre: 'ft/min', simbolo: 'ft/min',factor: 0.00508 },
      { nombre: 'Nudo',   simbolo: 'kn',    factor: 0.51444 },
    ] },

  { id: 'potencia', nombre: 'Potencia', icono: '⚡', grupo: 'basica',
    modulos: 'Electricidad · Térmica · Represas', tipo: 'lineal',
    unidades: [
      { nombre: 'Watt',    simbolo: 'W',     factor: 1 },
      { nombre: 'kW',      simbolo: 'kW',    factor: 1000 },
      { nombre: 'MW',      simbolo: 'MW',    factor: 1e6 },
      { nombre: 'HP (mec)',simbolo: 'HP',    factor: 745.700 },
      { nombre: 'kVA(FP=1)',simbolo:'kVA',   factor: 1000 },
      { nombre: 'BTU/hora',simbolo: 'BTU/h', factor: 0.29307 },
    ] },

  { id: 'energia', nombre: 'Energía', icono: '🔋', grupo: 'basica',
    modulos: 'Térmica · Electricidad · Soldadura', tipo: 'lineal',
    unidades: [
      { nombre: 'Joule',    simbolo: 'J',   factor: 1 },
      { nombre: 'kJ',       simbolo: 'kJ',  factor: 1000 },
      { nombre: 'MJ',       simbolo: 'MJ',  factor: 1e6 },
      { nombre: 'BTU',      simbolo: 'BTU', factor: 1055.06 },
      { nombre: 'kcal',     simbolo: 'kcal',factor: 4186.8 },
      { nombre: 'kWh',      simbolo: 'kWh', factor: 3.6e6 },
      { nombre: 'MWh',      simbolo: 'MWh', factor: 3.6e9 },
    ] },

  { id: 'torque', nombre: 'Torque / Momento', icono: '🔩', grupo: 'basica',
    modulos: 'Civil · Válvulas · Perforación', tipo: 'lineal',
    unidades: [
      { nombre: 'N·m',    simbolo: 'N·m',    factor: 1 },
      { nombre: 'kN·m',   simbolo: 'kN·m',   factor: 1000 },
      { nombre: 'kgf·m',  simbolo: 'kgf·m',  factor: 9.80665 },
      { nombre: 'lbf·ft', simbolo: 'lbf·ft', factor: 1.35582 },
      { nombre: 'lbf·in', simbolo: 'lbf·in', factor: 0.112985 },
    ] },

  // ══════════ TÉCNICAS (8) ══════════
  { id: 'estres', nombre: 'Estrés / Tensión', icono: '🏗️', grupo: 'tecnica',
    modulos: 'Civil · Soldadura · Cañerías · Geotecnia', tipo: 'lineal',
    unidades: [
      { nombre: 'Pa',          simbolo: 'Pa',      factor: 1e-6 },
      { nombre: 'kPa',         simbolo: 'kPa',     factor: 0.001 },
      { nombre: 'bar',         simbolo: 'bar',     factor: 0.1 },
      { nombre: 'MPa (=N/mm²)',simbolo: 'MPa',     factor: 1 },
      { nombre: 'GPa',         simbolo: 'GPa',     factor: 1000 },
      { nombre: 'psi',         simbolo: 'psi',     factor: 0.00689476 },
      { nombre: 'kgf/cm²',     simbolo: 'kgf/cm²', factor: 0.0980665 },
    ] },

  { id: 'densidad', nombre: 'Densidad', icono: '🧪', grupo: 'tecnica',
    modulos: 'Petróleo · Hidráulica · Perforación · MMO', tipo: 'lineal',
    unidades: [
      { nombre: 'kg/m³',    simbolo: 'kg/m³',   factor: 1 },
      { nombre: 'g/cm³',    simbolo: 'g/cm³',   factor: 1000 },
      { nombre: 'lb/ft³',   simbolo: 'lb/ft³',  factor: 16.0185 },
      { nombre: 'lb/gal(US)',simbolo: 'lb/gal',  factor: 119.826 },
      { nombre: 'SG (agua=1)',simbolo:'SG',       factor: 1000 },
    ] },

  { id: 'flujo_masico', nombre: 'Flujo másico', icono: '🌀', grupo: 'tecnica',
    modulos: 'Térmica · Petróleo · Perforación', tipo: 'lineal',
    unidades: [
      { nombre: 'kg/s',  simbolo: 'kg/s',  factor: 1 },
      { nombre: 'kg/h',  simbolo: 'kg/h',  factor: 2.77778e-4 },
      { nombre: 't/h',   simbolo: 't/h',   factor: 0.27778 },
      { nombre: 'lb/s',  simbolo: 'lb/s',  factor: 0.453592 },
      { nombre: 'lb/h',  simbolo: 'lb/h',  factor: 1.25998e-4 },
    ] },

  { id: 'cond_termica', nombre: 'Conductividad térmica', icono: '🔆', grupo: 'tecnica',
    modulos: 'Térmica — TEMA · ASME Sec.VIII · Kern', tipo: 'lineal',
    unidades: [
      { nombre: 'W/(m·K)',        simbolo: 'W/(m·K)',        factor: 1 },
      { nombre: 'BTU/(h·ft·°F)', simbolo: 'BTU/(h·ft·°F)', factor: 1.73073 },
      { nombre: 'kcal/(h·m·°C)', simbolo: 'kcal/(h·m·°C)', factor: 1.16279 },
      { nombre: 'mW/(m·K)',       simbolo: 'mW/(m·K)',       factor: 0.001 },
    ] },

  { id: 'coef_transfer', nombre: 'Coef. transferencia calor', icono: '🌡️', grupo: 'tecnica',
    modulos: 'Térmica — TEMA · ASME Sec.VIII', tipo: 'lineal',
    unidades: [
      { nombre: 'W/(m²·K)',        simbolo: 'W/(m²·K)',        factor: 1 },
      { nombre: 'BTU/(h·ft²·°F)', simbolo: 'BTU/(h·ft²·°F)', factor: 5.67826 },
      { nombre: 'kcal/(h·m²·°C)', simbolo: 'kcal/(h·m²·°C)', factor: 1.16279 },
    ] },

  { id: 'visc_din', nombre: 'Viscosidad dinámica', icono: '🫧', grupo: 'tecnica',
    modulos: 'Petróleo · Perforación · Hidráulica', tipo: 'lineal',
    unidades: [
      { nombre: 'Pa·s',   simbolo: 'Pa·s',  factor: 1 },
      { nombre: 'cP',     simbolo: 'cP',    factor: 0.001 },
      { nombre: 'mPa·s',  simbolo: 'mPa·s', factor: 0.001 },
      { nombre: 'Poise',  simbolo: 'P',     factor: 0.1 },
    ] },

  { id: 'visc_cin', nombre: 'Viscosidad cinemática', icono: '💧', grupo: 'tecnica',
    modulos: 'Hidráulica · Petróleo', tipo: 'lineal',
    unidades: [
      { nombre: 'm²/s',   simbolo: 'm²/s',  factor: 1 },
      { nombre: 'cSt',    simbolo: 'cSt',   factor: 1e-6 },
      { nombre: 'mm²/s',  simbolo: 'mm²/s', factor: 1e-6 },
      { nombre: 'ft²/s',  simbolo: 'ft²/s', factor: 0.092903 },
    ] },

  { id: 'iluminancia', nombre: 'Iluminancia', icono: '💡', grupo: 'tecnica',
    modulos: 'Electricidad — IES/IESNA · EN 12464-1 · API RP 54', tipo: 'lineal',
    unidades: [
      { nombre: 'Lux (=lm/m²)',    simbolo: 'lux', factor: 1 },
      { nombre: 'Foot-candle',     simbolo: 'fc',  factor: 10.7639 },
      { nombre: 'lm/m²',           simbolo: 'lm/m²',factor: 1 },
    ] },

  // ══════════ EXCLUSIVAS (7) ══════════
  { id: 'peso_lodo', nombre: 'Peso de lodo (Mud Weight)', icono: '⛏️', grupo: 'exclusiva',
    modulos: 'Perforación — API RP 13D', tipo: 'lineal',
    unidades: [
      { nombre: 'ppg (lb/gal US)',  simbolo: 'ppg',    factor: 1 },
      { nombre: 'kg/m³',            simbolo: 'kg/m³',  factor: 0.0083454 },
      { nombre: 'lb/ft³',           simbolo: 'lb/ft³', factor: 0.133681 },
      { nombre: 'SG (gravedad esp.',simbolo: 'SG',     factor: 8.34540 },
      { nombre: 'psi/ft (gradiente)',simbolo:'psi/ft',  factor: 19.2500 },
    ] },

  { id: 'grad_presion', nombre: 'Gradiente de presión', icono: '📊', grupo: 'exclusiva',
    modulos: 'Perforación · Petróleo · Cañerías', tipo: 'lineal',
    unidades: [
      { nombre: 'Pa/m',       simbolo: 'Pa/m',      factor: 0.001 },
      { nombre: 'kPa/m',      simbolo: 'kPa/m',     factor: 1 },
      { nombre: 'MPa/m',      simbolo: 'MPa/m',     factor: 1000 },
      { nombre: 'bar/m',      simbolo: 'bar/m',     factor: 100 },
      { nombre: 'psi/ft',     simbolo: 'psi/ft',    factor: 22.6206 },
      { nombre: 'psi/100ft',  simbolo: 'psi/100ft', factor: 0.226206 },
    ] },

  { id: 'api_gravity', nombre: '°API Gravity', icono: '🛢️', grupo: 'exclusiva',
    modulos: 'Petróleo — API estándar internacional', tipo: 'api_gravity',
    unidades: [
      { nombre: 'Grados API',        simbolo: '°API',  factor: 1 },
      { nombre: 'Gravedad específica',simbolo: 'SG',    factor: 1 },
      { nombre: 'kg/m³',             simbolo: 'kg/m³', factor: 1 },
    ] },

  { id: 'heat_input', nombre: 'Heat Input — Soldadura', icono: '🔥', grupo: 'exclusiva',
    modulos: 'Soldadura — AWS D1.1:2020 §6.8.5 · ASME Sec.IX', tipo: 'lineal',
    unidades: [
      { nombre: 'kJ/mm', simbolo: 'kJ/mm', factor: 1 },
      { nombre: 'J/mm',  simbolo: 'J/mm',  factor: 0.001 },
      { nombre: 'kJ/in', simbolo: 'kJ/in', factor: 0.039370 },
      { nombre: 'J/in',  simbolo: 'J/in',  factor: 3.937e-5 },
    ] },

  { id: 'cable_awg', nombre: 'Cable AWG ↔ mm²', icono: '🔌', grupo: 'exclusiva',
    modulos: 'Electricidad — NEC 2023 · IEC 60228', tipo: 'awg',
    unidades: [] },

  { id: 'permeabilidad', nombre: 'Permeabilidad suelo', icono: '🌍', grupo: 'exclusiva',
    modulos: 'Geotecnia · Represas — filtraciones Darcy', tipo: 'lineal',
    unidades: [
      { nombre: 'm/s',   simbolo: 'm/s',   factor: 1 },
      { nombre: 'cm/s',  simbolo: 'cm/s',  factor: 0.01 },
      { nombre: 'mm/s',  simbolo: 'mm/s',  factor: 0.001 },
      { nombre: 'ft/s',  simbolo: 'ft/s',  factor: 0.3048 },
      { nombre: 'm/día', simbolo: 'm/día', factor: 1.1574e-5 },
      { nombre: 'ft/día',simbolo: 'ft/día',factor: 3.5278e-6 },
    ] },

  { id: 'rugosidad', nombre: 'Rugosidad tubería', icono: '🔧', grupo: 'exclusiva',
    modulos: 'Hidráulica — Darcy-Weisbach · Cañerías', tipo: 'lineal',
    unidades: [
      { nombre: 'Milímetro',   simbolo: 'mm', factor: 1 },
      { nombre: 'Micrómetro',  simbolo: 'μm', factor: 0.001 },
      { nombre: 'Pulgada',     simbolo: 'in', factor: 25.4 },
      { nombre: 'Pie',         simbolo: 'ft', factor: 304.8 },
    ] },
];

// ─── Formato de números ────────────────────────────────────────
function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  if (n === 0) return '0';
  const a = Math.abs(n);
  if (a >= 1e9 || (a < 0.00001 && a > 0)) return n.toExponential(4);
  if (a >= 10000) return n.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  if (a >= 1000) return n.toLocaleString('es-AR', { maximumFractionDigits: 3 });
  return parseFloat(n.toPrecision(6)).toString();
}

// ─── Colores por grupo ─────────────────────────────────────────
const GC = { basica: '#6366f1', tecnica: '#06b6d4', exclusiva: '#f59e0b' };

// ─── Componente principal ──────────────────────────────────────
export default function ConversorUnidades() {
  const [abierto, setAbierto] = useState(false);
  const [grupo, setGrupo] = useState<'basica' | 'tecnica' | 'exclusiva'>('basica');
  const [catId, setCatId] = useState('presion');
  const [valor, setValor] = useState('');
  const [desde, setDesde] = useState('Pa');

  const cat = CATS.find(c => c.id === catId)!;
  const catsFiltradas = CATS.filter(c => c.grupo === grupo);
  const gc = GC[grupo];

  const cambiarCat = (id: string) => {
    setCatId(id);
    const c = CATS.find(c => c.id === id)!;
    if (c.unidades.length > 0) setDesde(c.unidades[0].simbolo);
    setValor('');
  };

  const cambiarGrupo = (g: 'basica' | 'tecnica' | 'exclusiva') => {
    setGrupo(g);
    const first = CATS.find(c => c.grupo === g);
    if (first) cambiarCat(first.id);
  };

  // Conversión lineal
  const convertirLineal = (v: number) =>
    cat.unidades.map(u => {
      const fromU = cat.unidades.find(x => x.simbolo === desde);
      if (!fromU) return { simbolo: u.simbolo, nombre: u.nombre, r: 0 };
      return { simbolo: u.simbolo, nombre: u.nombre, r: (v * fromU.factor) / u.factor };
    });

  // Conversión temperatura
  const convertirTemp = (v: number) => {
    let c: number;
    if (desde === '°C') c = v;
    else if (desde === '°F') c = (v - 32) * 5 / 9;
    else c = v - 273.15;
    return [
      { simbolo: '°C', nombre: 'Celsius', r: c },
      { simbolo: '°F', nombre: 'Fahrenheit', r: c * 9 / 5 + 32 },
      { simbolo: 'K',  nombre: 'Kelvin', r: c + 273.15 },
    ];
  };

  // Conversión API Gravity
  const convertirAPI = (v: number) => {
    let sg: number;
    if (desde === '°API') sg = 141.5 / (v + 131.5);
    else if (desde === 'SG') sg = v;
    else sg = v / 1000;
    const api = 141.5 / sg - 131.5;
    return [
      { simbolo: '°API',  nombre: 'Grados API', r: api },
      { simbolo: 'SG',    nombre: 'Gravedad específica', r: sg },
      { simbolo: 'kg/m³', nombre: 'kg/m³', r: sg * 1000 },
    ];
  };

  const getResultados = () => {
    const v = parseFloat(valor);
    if (isNaN(v)) return [];
    if (cat.tipo === 'temperatura') return convertirTemp(v);
    if (cat.tipo === 'api_gravity') return convertirAPI(v);
    if (cat.tipo === 'lineal') return convertirLineal(v);
    return [];
  };

  const resultados = getResultados();

  // ── BOTÓN FLOTANTE ─────────────────────────────────────────
  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        title="Conversor de unidades de ingeniería — 27 categorías"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          border: '2px solid rgba(99,102,241,0.5)',
          color: '#fff', fontSize: 22, cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(99,102,241,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >⚖️</button>
    );
  }

  // ── PANEL ──────────────────────────────────────────────────
  return (
    <>
      <div onClick={() => setAbierto(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 997, background: 'rgba(0,0,0,0.4)' }} />

      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 998,
        width: '100%', maxWidth: 400,
        background: '#070d1a', borderLeft: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
        color: '#f1f5f9',
      }}>

        {/* Header */}
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(99,102,241,0.08)', flexShrink: 0,
        }}>
          <div style={{ fontSize: 22 }}>⚖️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Conversor de Unidades</div>
            <div style={{ fontSize: 10, color: '#475569' }}>27 categorías · Ingeniería industrial · Factores NIST</div>
          </div>
          <button onClick={() => setAbierto(false)}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}>
            ✕
          </button>
        </div>

        {/* Group tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(99,102,241,0.15)', background: '#0a0f1e', flexShrink: 0 }}>
          {([
            { id: 'basica' as const, label: 'Básicas', n: 12 },
            { id: 'tecnica' as const, label: 'Técnicas', n: 8 },
            { id: 'exclusiva' as const, label: '★ Exclusivas', n: 7 },
          ]).map(g => (
            <button key={g.id} onClick={() => cambiarGrupo(g.id)} style={{
              flex: 1, padding: '9px 4px', border: 'none', background: 'transparent',
              color: grupo === g.id ? GC[g.id] : '#475569',
              borderBottom: grupo === g.id ? `2px solid ${GC[g.id]}` : '2px solid transparent',
              fontSize: 10, fontWeight: grupo === g.id ? 700 : 400, cursor: 'pointer',
            }}>
              {g.label} ({g.n})
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div style={{
          padding: '8px 12px', borderBottom: '1px solid rgba(99,102,241,0.1)',
          display: 'flex', gap: 5, flexWrap: 'wrap' as const,
          background: '#0a0f1e', flexShrink: 0,
        }}>
          {catsFiltradas.map(c => (
            <button key={c.id} onClick={() => cambiarCat(c.id)} style={{
              padding: '4px 9px', borderRadius: 20,
              background: catId === c.id ? `${gc}18` : 'transparent',
              border: `1px solid ${catId === c.id ? gc + '50' : 'rgba(99,102,241,0.12)'}`,
              color: catId === c.id ? gc : '#64748b',
              fontSize: 10, fontWeight: catId === c.id ? 700 : 400, cursor: 'pointer',
            }}>
              {c.icono} {c.nombre}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

          {/* Module info */}
          <div style={{ fontSize: 10, color: '#334155', marginBottom: 14, lineHeight: 1.5 }}>
            <span style={{ color: gc, fontWeight: 700 }}>Módulos: </span>
            {cat.modulos}
          </div>

          {/* ── AWG TABLE ── */}
          {cat.tipo === 'awg' && (
            <div>
              <div style={{ fontSize: 12, color: gc, fontWeight: 700, marginBottom: 10 }}>
                Tabla AWG ↔ mm² — NEC 2023 / IEC 60228
              </div>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 12 }}>
                Conversión estándar internacional. NEC (EE.UU.) usa AWG, IEC (Europa/LatAm) usa mm².
              </div>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 4 }}>
                {['AWG', 'mm² (IEC)', 'kcmil'].map(h => (
                  <div key={h} style={{ fontSize: 9, color: gc, fontWeight: 700, padding: '5px 8px', background: '#0f172a', borderRadius: 6, textAlign: 'center' }}>
                    {h}
                  </div>
                ))}
              </div>
              {AWG.map(r => (
                <div key={r.awg} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 3 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', padding: '5px 8px', background: '#0a0f1e', borderRadius: 6 }}>AWG {r.awg}</div>
                  <div style={{ fontSize: 12, color: gc, fontWeight: 700, padding: '5px 8px', background: '#0a0f1e', borderRadius: 6, textAlign: 'center' }}>{r.mm2}</div>
                  <div style={{ fontSize: 11, color: '#475569', padding: '5px 8px', background: '#0a0f1e', borderRadius: 6, textAlign: 'center' }}>{r.kcmil}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── LINEAR + TEMP + API ── */}
          {cat.tipo !== 'awg' && (
            <>
              {/* Input */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                  Valor
                </label>
                <input
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  type="number"
                  placeholder="Ingresá el valor..."
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: '#0a0f1e', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 10, color: '#f1f5f9', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box' as const,
                  }}
                />
              </div>

              {/* From unit */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                  Desde
                </label>
                <select value={desde} onChange={e => setDesde(e.target.value)} style={{
                  width: '100%', padding: '10px 14px',
                  background: '#0a0f1e', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none',
                }}>
                  {cat.unidades.map(u => (
                    <option key={u.simbolo} value={u.simbolo} style={{ background: '#0a0f1e' }}>
                      {u.simbolo} — {u.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results */}
              {valor !== '' && !isNaN(parseFloat(valor)) ? (
                <div>
                  <div style={{ fontSize: 10, color: gc, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                    Resultados
                  </div>
                  {resultados.map(r => (
                    <div key={r.simbolo} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 12px', borderRadius: 9, marginBottom: 4,
                      background: r.simbolo === desde ? `${gc}12` : '#0a0f1e',
                      border: `1px solid ${r.simbolo === desde ? gc + '40' : 'transparent'}`,
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: r.simbolo === desde ? gc : '#94a3b8' }}>{r.simbolo}</div>
                        <div style={{ fontSize: 9, color: '#334155' }}>{r.nombre}</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: r.simbolo === desde ? gc : '#f1f5f9', fontFamily: 'monospace' }}>
                        {fmt(r.r)}
                      </div>
                    </div>
                  ))}

                  {/* API Gravity note */}
                  {cat.tipo === 'api_gravity' && (
                    <div style={{ fontSize: 10, color: '#334155', marginTop: 8, padding: '6px 10px', background: '#0a0f1e', borderRadius: 6 }}>
                      Fórmula API: SG = 141.5 / (°API + 131.5) · kg/m³ = SG × 1000
                    </div>
                  )}

                  {/* Mud weight note */}
                  {cat.id === 'peso_lodo' && (
                    <div style={{ fontSize: 10, color: '#334155', marginTop: 8, padding: '6px 10px', background: '#0a0f1e', borderRadius: 6 }}>
                      Agua dulce = 8.34 ppg = 1000 kg/m³ = 62.4 lb/ft³ = 0.433 psi/ft
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#334155', fontSize: 12 }}>
                  Ingresá un valor para ver las conversiones
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '6px 16px', borderTop: '1px solid rgba(99,102,241,0.1)',
          fontSize: 9, color: '#1e293b', textAlign: 'center', flexShrink: 0,
        }}>
          INGENIUM PRO v8.1 · 27 categorías · Factores NIST · AWS · API · IEC · ASHRAE verificados
        </div>
      </div>
    </>
  );
} 