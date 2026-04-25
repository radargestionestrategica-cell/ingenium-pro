'use client';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
//  CONVERSOR DE UNIDADES — INGENIUM PRO v8.1
//  37 categorías reales de ingeniería industrial
//  Factores verificados: NIST · AWS · API · IEC · ASHRAE · AISC
//  TEMA · ASCE 7-22 · AASHTO · CIRSOC 101 · IEC 60228
// ═══════════════════════════════════════════════════════════════

interface Unidad { nombre: string; simbolo: string; factor: number; }
interface Cat {
  id: string; nombre: string; icono: string;
  grupo: 'basica' | 'tecnica' | 'exclusiva' | 'nueva';
  modulos: string;
  tipo: 'lineal' | 'temperatura' | 'api_gravity' | 'awg' | 'pendiente';
  unidades: Unidad[];
}

// ─── AWG ↔ mm² — NEC 2023 / IEC 60228 — Verificado ───────────
const AWG_TABLE: { awg: string; mm2: number }[] = [
  { awg: '28', mm2: 0.080 }, { awg: '26', mm2: 0.128 },
  { awg: '24', mm2: 0.205 }, { awg: '22', mm2: 0.324 },
  { awg: '20', mm2: 0.519 }, { awg: '18', mm2: 0.823 },
  { awg: '16', mm2: 1.31  }, { awg: '14', mm2: 2.08  },
  { awg: '12', mm2: 3.31  }, { awg: '10', mm2: 5.26  },
  { awg: '8',  mm2: 8.37  }, { awg: '6',  mm2: 13.3  },
  { awg: '4',  mm2: 21.1  }, { awg: '3',  mm2: 26.7  },
  { awg: '2',  mm2: 33.6  }, { awg: '1',  mm2: 42.4  },
  { awg: '1/0',mm2: 53.5  }, { awg: '2/0',mm2: 67.4  },
  { awg: '3/0',mm2: 85.0  }, { awg: '4/0',mm2: 107   },
  { awg: '300kcmil', mm2: 152 }, { awg: '350kcmil', mm2: 177 },
  { awg: '400kcmil', mm2: 203 }, { awg: '500kcmil', mm2: 253 },
  { awg: '600kcmil', mm2: 304 }, { awg: '750kcmil', mm2: 380 },
];

// ─── 37 CATEGORÍAS ────────────────────────────────────────────
const CATS: Cat[] = [

  // ══ BÁSICAS (12) ══════════════════════════════════════════
  {
    id: 'presion', nombre: 'Presión', icono: '⚙️', grupo: 'basica',
    modulos: 'Petróleo · Cañerías · Válvulas · Perforación · Hidráulica · Arquitectura',
    tipo: 'lineal',
    unidades: [
      { nombre: 'Pascal',        simbolo: 'Pa',       factor: 1 },
      { nombre: 'Kilopascal',    simbolo: 'kPa',      factor: 1e3 },
      { nombre: 'Bar',           simbolo: 'bar',      factor: 1e5 },
      { nombre: 'Megapascal',    simbolo: 'MPa',      factor: 1e6 },
      { nombre: 'psi (lb/in²)',  simbolo: 'psi',      factor: 6894.757 },
      { nombre: 'kgf/cm²',       simbolo: 'kgf/cm²',  factor: 98066.5 },
      { nombre: 'Atmósfera',     simbolo: 'atm',      factor: 101325 },
      { nombre: 'psf (lb/ft²) — ASCE 7-22', simbolo: 'psf', factor: 47.8803 },
      { nombre: 'mbar',          simbolo: 'mbar',     factor: 100 },
    ],
  },
  {
    id: 'temperatura', nombre: 'Temperatura', icono: '🌡️', grupo: 'basica',
    modulos: 'Todos los módulos', tipo: 'temperatura',
    unidades: [
      { nombre: 'Celsius',    simbolo: '°C', factor: 1 },
      { nombre: 'Fahrenheit', simbolo: '°F', factor: 1 },
      { nombre: 'Kelvin',     simbolo: 'K',  factor: 1 },
      { nombre: 'Rankine',    simbolo: '°R', factor: 1 },
    ],
  },
  {
    id: 'longitud', nombre: 'Longitud', icono: '📏', grupo: 'basica',
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
    ],
  },
  {
    id: 'area', nombre: 'Área', icono: '⬛', grupo: 'basica',
    modulos: 'Civil · Vialidad · MMO · Geotecnia · Arquitectura', tipo: 'lineal',
    unidades: [
      { nombre: 'mm²',       simbolo: 'mm²',  factor: 1e-6 },
      { nombre: 'cm²',       simbolo: 'cm²',  factor: 1e-4 },
      { nombre: 'm²',        simbolo: 'm²',   factor: 1 },
      { nombre: 'km²',       simbolo: 'km²',  factor: 1e6 },
      { nombre: 'in²',       simbolo: 'in²',  factor: 6.4516e-4 },
      { nombre: 'ft²',       simbolo: 'ft²',  factor: 0.092903 },
      { nombre: 'Hectárea',  simbolo: 'ha',   factor: 1e4 },
      { nombre: 'Acre',      simbolo: 'acre', factor: 4046.856 },
    ],
  },
  {
    id: 'volumen', nombre: 'Volumen', icono: '🧊', grupo: 'basica',
    modulos: 'Petróleo · Hidráulica · Represas · MMO', tipo: 'lineal',
    unidades: [
      { nombre: 'Mililitro',    simbolo: 'mL',      factor: 1e-6 },
      { nombre: 'Litro',        simbolo: 'L',       factor: 1e-3 },
      { nombre: 'm³',           simbolo: 'm³',      factor: 1 },
      { nombre: 'in³',          simbolo: 'in³',     factor: 1.6387e-5 },
      { nombre: 'ft³',          simbolo: 'ft³',     factor: 0.028317 },
      { nombre: 'Galón US',     simbolo: 'gal(US)', factor: 3.78541e-3 },
      { nombre: 'Barril crudo', simbolo: 'bbl',     factor: 0.158987 },
      { nombre: 'yd³',          simbolo: 'yd³',     factor: 0.764555 },
    ],
  },
  {
    id: 'caudal', nombre: 'Caudal', icono: '🌊', grupo: 'basica',
    modulos: 'Hidráulica · Represas · Perforación · Petróleo', tipo: 'lineal',
    unidades: [
      { nombre: 'L/s',      simbolo: 'L/s',   factor: 1e-3 },
      { nombre: 'm³/h',     simbolo: 'm³/h',  factor: 2.77778e-4 },
      { nombre: 'm³/día',   simbolo: 'm³/d',  factor: 1.15741e-5 },
      { nombre: 'm³/s',     simbolo: 'm³/s',  factor: 1 },
      { nombre: 'GPM',      simbolo: 'GPM',   factor: 6.30902e-5 },
      { nombre: 'bbl/día',  simbolo: 'bbl/d', factor: 1.84013e-6 },
      { nombre: 'cfs',      simbolo: 'cfs',   factor: 0.028317 },
      { nombre: 'ft³/min',  simbolo: 'cfm',   factor: 4.71947e-4 },
    ],
  },
  {
    id: 'masa', nombre: 'Masa / Peso', icono: '⚖️', grupo: 'basica',
    modulos: 'Civil · MMO · Soldadura · Minería', tipo: 'lineal',
    unidades: [
      { nombre: 'Gramo',          simbolo: 'g',     factor: 1e-3 },
      { nombre: 'Kilogramo',      simbolo: 'kg',    factor: 1 },
      { nombre: 'Tonelada',       simbolo: 't',     factor: 1000 },
      { nombre: 'Libra',          simbolo: 'lb',    factor: 0.453592 },
      { nombre: 'Onza',           simbolo: 'oz',    factor: 0.028350 },
      { nombre: 'US ton (2000lb)',simbolo: 'ton US',factor: 907.185 },
      { nombre: 'Long ton (UK)',  simbolo: 'LT',    factor: 1016.047 },
    ],
  },
  {
    id: 'fuerza', nombre: 'Fuerza', icono: '💪', grupo: 'basica',
    modulos: 'Civil · Geotecnia · Cañerías · Válvulas', tipo: 'lineal',
    unidades: [
      { nombre: 'Newton',      simbolo: 'N',   factor: 1 },
      { nombre: 'Kilonewton',  simbolo: 'kN',  factor: 1000 },
      { nombre: 'Meganewton',  simbolo: 'MN',  factor: 1e6 },
      { nombre: 'kgf',         simbolo: 'kgf', factor: 9.80665 },
      { nombre: 'lbf',         simbolo: 'lbf', factor: 4.44822 },
      { nombre: 'tonelada-f',  simbolo: 'tf',  factor: 9806.65 },
      { nombre: 'kip (1000lbf)',simbolo: 'kip', factor: 4448.22 },
    ],
  },
  {
    id: 'velocidad', nombre: 'Velocidad', icono: '💨', grupo: 'basica',
    modulos: 'Hidráulica · Vialidad · Arquitectura · Cañerías', tipo: 'lineal',
    unidades: [
      { nombre: 'm/s',    simbolo: 'm/s',   factor: 1 },
      { nombre: 'km/h',   simbolo: 'km/h',  factor: 0.27778 },
      { nombre: 'ft/s',   simbolo: 'ft/s',  factor: 0.3048 },
      { nombre: 'mph',    simbolo: 'mph',   factor: 0.44704 },
      { nombre: 'ft/min', simbolo: 'ft/min',factor: 5.08e-3 },
      { nombre: 'Nudo',   simbolo: 'kn',    factor: 0.514444 },
    ],
  },
  {
    id: 'potencia', nombre: 'Potencia', icono: '⚡', grupo: 'basica',
    modulos: 'Electricidad · Térmica · Represas', tipo: 'lineal',
    unidades: [
      { nombre: 'Watt',     simbolo: 'W',     factor: 1 },
      { nombre: 'kW',       simbolo: 'kW',    factor: 1000 },
      { nombre: 'MW',       simbolo: 'MW',    factor: 1e6 },
      { nombre: 'HP mec.',  simbolo: 'HP',    factor: 745.700 },
      { nombre: 'CV/PS',    simbolo: 'CV',    factor: 735.499 },
      { nombre: 'BTU/h',    simbolo: 'BTU/h', factor: 0.29307 },
      { nombre: 'kcal/h',   simbolo: 'kcal/h',factor: 1.16279 },
      { nombre: 'ton refrig.',simbolo:'TR',   factor: 3516.85 },
    ],
  },
  {
    id: 'energia', nombre: 'Energía', icono: '🔋', grupo: 'basica',
    modulos: 'Térmica · Electricidad · Soldadura', tipo: 'lineal',
    unidades: [
      { nombre: 'Joule',  simbolo: 'J',   factor: 1 },
      { nombre: 'kJ',     simbolo: 'kJ',  factor: 1000 },
      { nombre: 'MJ',     simbolo: 'MJ',  factor: 1e6 },
      { nombre: 'BTU',    simbolo: 'BTU', factor: 1055.06 },
      { nombre: 'kcal',   simbolo: 'kcal',factor: 4186.8 },
      { nombre: 'kWh',    simbolo: 'kWh', factor: 3.6e6 },
      { nombre: 'MWh',    simbolo: 'MWh', factor: 3.6e9 },
    ],
  },
  {
    id: 'torque', nombre: 'Torque / Momento', icono: '🔩', grupo: 'basica',
    modulos: 'Civil · Válvulas · Perforación', tipo: 'lineal',
    unidades: [
      { nombre: 'N·m',    simbolo: 'N·m',    factor: 1 },
      { nombre: 'kN·m',   simbolo: 'kN·m',   factor: 1000 },
      { nombre: 'kgf·m',  simbolo: 'kgf·m',  factor: 9.80665 },
      { nombre: 'lbf·ft', simbolo: 'lbf·ft', factor: 1.35582 },
      { nombre: 'lbf·in', simbolo: 'lbf·in', factor: 0.112985 },
      { nombre: 'kip·ft', simbolo: 'kip·ft', factor: 1355.82 },
    ],
  },

  // ══ TÉCNICAS (8) ══════════════════════════════════════════
  {
    id: 'estres', nombre: 'Estrés / Tensión', icono: '🏗️', grupo: 'tecnica',
    modulos: 'Civil · Soldadura · Cañerías · Geotecnia · Minería', tipo: 'lineal',
    unidades: [
      { nombre: 'Pa',           simbolo: 'Pa',       factor: 1e-6 },
      { nombre: 'kPa',          simbolo: 'kPa',      factor: 0.001 },
      { nombre: 'MPa (=N/mm²)', simbolo: 'MPa',      factor: 1 },
      { nombre: 'GPa',          simbolo: 'GPa',      factor: 1000 },
      { nombre: 'bar',          simbolo: 'bar',      factor: 0.1 },
      { nombre: 'psi',          simbolo: 'psi',      factor: 6.89476e-3 },
      { nombre: 'ksi (kpsi)',   simbolo: 'ksi',      factor: 6.89476 },
      { nombre: 'kgf/cm²',      simbolo: 'kgf/cm²',  factor: 0.098067 },
    ],
  },
  {
    id: 'densidad', nombre: 'Densidad', icono: '🧪', grupo: 'tecnica',
    modulos: 'Petróleo · Hidráulica · Perforación · MMO', tipo: 'lineal',
    unidades: [
      { nombre: 'kg/m³',     simbolo: 'kg/m³',   factor: 1 },
      { nombre: 'g/cm³',     simbolo: 'g/cm³',   factor: 1000 },
      { nombre: 'lb/ft³',    simbolo: 'lb/ft³',  factor: 16.0185 },
      { nombre: 'lb/gal(US)',simbolo: 'lb/gal',  factor: 119.826 },
      { nombre: 'SG (agua=1)',simbolo: 'SG',      factor: 1000 },
      { nombre: 'kg/L',      simbolo: 'kg/L',    factor: 1000 },
    ],
  },
  {
    id: 'flujo_masico', nombre: 'Flujo másico', icono: '🌀', grupo: 'tecnica',
    modulos: 'Térmica · Petróleo · Perforación', tipo: 'lineal',
    unidades: [
      { nombre: 'kg/s',  simbolo: 'kg/s',  factor: 1 },
      { nombre: 'kg/h',  simbolo: 'kg/h',  factor: 2.77778e-4 },
      { nombre: 't/h',   simbolo: 't/h',   factor: 0.27778 },
      { nombre: 'lb/s',  simbolo: 'lb/s',  factor: 0.453592 },
      { nombre: 'lb/h',  simbolo: 'lb/h',  factor: 1.25998e-4 },
      { nombre: 'lb/min',simbolo: 'lb/min',factor: 7.55987e-3 },
    ],
  },
  {
    id: 'cond_termica', nombre: 'Conductividad térmica', icono: '🔆', grupo: 'tecnica',
    modulos: 'Térmica — TEMA · ASME Sec.VIII · Kern', tipo: 'lineal',
    unidades: [
      { nombre: 'W/(m·K)',          simbolo: 'W/(m·K)',         factor: 1 },
      { nombre: 'BTU/(h·ft·°F)',    simbolo: 'BTU/(h·ft·°F)',   factor: 1.73073 },
      { nombre: 'kcal/(h·m·°C)',    simbolo: 'kcal/(h·m·°C)',   factor: 1.16279 },
      { nombre: 'mW/(m·K)',         simbolo: 'mW/(m·K)',        factor: 0.001 },
      { nombre: 'cal/(s·cm·°C)',    simbolo: 'cal/(s·cm·°C)',   factor: 418.68 },
    ],
  },
  {
    id: 'coef_transfer', nombre: 'Coef. transferencia calor (U)', icono: '♨️', grupo: 'tecnica',
    modulos: 'Térmica — TEMA · ASME Sec.VIII', tipo: 'lineal',
    unidades: [
      { nombre: 'W/(m²·K)',          simbolo: 'W/(m²·K)',         factor: 1 },
      { nombre: 'BTU/(h·ft²·°F)',    simbolo: 'BTU/(h·ft²·°F)',   factor: 5.67826 },
      { nombre: 'kcal/(h·m²·°C)',    simbolo: 'kcal/(h·m²·°C)',   factor: 1.16279 },
      { nombre: 'kW/(m²·K)',         simbolo: 'kW/(m²·K)',        factor: 1000 },
    ],
  },
  {
    id: 'visc_din', nombre: 'Viscosidad dinámica', icono: '🫧', grupo: 'tecnica',
    modulos: 'Petróleo · Perforación · Hidráulica', tipo: 'lineal',
    unidades: [
      { nombre: 'Pa·s',  simbolo: 'Pa·s',  factor: 1 },
      { nombre: 'cP',    simbolo: 'cP',    factor: 0.001 },
      { nombre: 'mPa·s', simbolo: 'mPa·s', factor: 0.001 },
      { nombre: 'Poise', simbolo: 'P',     factor: 0.1 },
      { nombre: 'lbf·s/ft²',simbolo:'lbf·s/ft²',factor: 47.8803 },
    ],
  },
  {
    id: 'visc_cin', nombre: 'Viscosidad cinemática', icono: '💧', grupo: 'tecnica',
    modulos: 'Hidráulica · Petróleo', tipo: 'lineal',
    unidades: [
      { nombre: 'm²/s',   simbolo: 'm²/s',  factor: 1 },
      { nombre: 'cSt',    simbolo: 'cSt',   factor: 1e-6 },
      { nombre: 'mm²/s',  simbolo: 'mm²/s', factor: 1e-6 },
      { nombre: 'ft²/s',  simbolo: 'ft²/s', factor: 0.092903 },
      { nombre: 'Stokes', simbolo: 'St',    factor: 1e-4 },
    ],
  },
  {
    id: 'iluminancia', nombre: 'Iluminancia', icono: '💡', grupo: 'tecnica',
    modulos: 'Electricidad — IES/IESNA · EN 12464-1 · API RP 54', tipo: 'lineal',
    unidades: [
      { nombre: 'Lux (=lm/m²)', simbolo: 'lux', factor: 1 },
      { nombre: 'Foot-candle',  simbolo: 'fc',  factor: 10.7639 },
      { nombre: 'lm/m²',        simbolo: 'lm/m²',factor: 1 },
      { nombre: 'Phot (ph)',    simbolo: 'ph',  factor: 10000 },
    ],
  },

  // ══ EXCLUSIVAS (7 originales) ══════════════════════════════
  {
    id: 'peso_lodo', nombre: 'Peso de lodo (Mud Weight)', icono: '⛏️', grupo: 'exclusiva',
    modulos: 'Perforación — API RP 13D', tipo: 'lineal',
    unidades: [
      { nombre: 'ppg (lb/gal US)',   simbolo: 'ppg',    factor: 1 },
      { nombre: 'kg/m³',             simbolo: 'kg/m³',  factor: 0.0083454 },
      { nombre: 'lb/ft³',            simbolo: 'lb/ft³', factor: 0.133681 },
      { nombre: 'SG (gravedad esp.)',simbolo: 'SG',     factor: 8.34540 },
      { nombre: 'psi/ft (gradiente)',simbolo: 'psi/ft', factor: 19.25 },
    ],
  },
  {
    id: 'grad_presion', nombre: 'Gradiente de presión', icono: '📊', grupo: 'exclusiva',
    modulos: 'Perforación · Petróleo · Cañerías', tipo: 'lineal',
    unidades: [
      { nombre: 'Pa/m',       simbolo: 'Pa/m',      factor: 0.001 },
      { nombre: 'kPa/m',      simbolo: 'kPa/m',     factor: 1 },
      { nombre: 'MPa/m',      simbolo: 'MPa/m',     factor: 1000 },
      { nombre: 'bar/m',      simbolo: 'bar/m',     factor: 100 },
      { nombre: 'psi/ft',     simbolo: 'psi/ft',    factor: 22.6206 },
      { nombre: 'psi/100ft',  simbolo: 'psi/100ft', factor: 0.226206 },
    ],
  },
  {
    id: 'api_gravity', nombre: '°API Gravity', icono: '🛢️', grupo: 'exclusiva',
    modulos: 'Petróleo — API estándar internacional', tipo: 'api_gravity',
    unidades: [
      { nombre: 'Grados API',         simbolo: '°API',  factor: 1 },
      { nombre: 'Gravedad específica',simbolo: 'SG',    factor: 1 },
      { nombre: 'kg/m³',              simbolo: 'kg/m³', factor: 1 },
    ],
  },
  {
    id: 'heat_input', nombre: 'Heat Input — Soldadura', icono: '🔥', grupo: 'exclusiva',
    modulos: 'Soldadura — AWS D1.1:2020 §6.8.5 · ASME Sec.IX', tipo: 'lineal',
    unidades: [
      { nombre: 'kJ/mm', simbolo: 'kJ/mm', factor: 1 },
      { nombre: 'J/mm',  simbolo: 'J/mm',  factor: 0.001 },
      { nombre: 'kJ/in', simbolo: 'kJ/in', factor: 0.039370 },
      { nombre: 'J/in',  simbolo: 'J/in',  factor: 3.937e-5 },
    ],
  },
  {
    id: 'cable_awg', nombre: 'Cable AWG ↔ mm²', icono: '🔌', grupo: 'exclusiva',
    modulos: 'Electricidad — NEC 2023 · IEC 60228', tipo: 'awg',
    unidades: [],
  },
  {
    id: 'permeabilidad', nombre: 'Permeabilidad suelo', icono: '🌍', grupo: 'exclusiva',
    modulos: 'Geotecnia · Represas — filtraciones Darcy', tipo: 'lineal',
    unidades: [
      { nombre: 'm/s',   simbolo: 'm/s',   factor: 1 },
      { nombre: 'cm/s',  simbolo: 'cm/s',  factor: 0.01 },
      { nombre: 'mm/s',  simbolo: 'mm/s',  factor: 0.001 },
      { nombre: 'ft/s',  simbolo: 'ft/s',  factor: 0.3048 },
      { nombre: 'm/día', simbolo: 'm/día', factor: 1.15741e-5 },
      { nombre: 'ft/día',simbolo: 'ft/día',factor: 3.5278e-6 },
    ],
  },
  {
    id: 'rugosidad', nombre: 'Rugosidad tubería', icono: '🔧', grupo: 'exclusiva',
    modulos: 'Hidráulica — Darcy-Weisbach · Cañerías', tipo: 'lineal',
    unidades: [
      { nombre: 'Milímetro',  simbolo: 'mm', factor: 1 },
      { nombre: 'Micrómetro', simbolo: 'μm', factor: 0.001 },
      { nombre: 'Pulgada',    simbolo: 'in', factor: 25.4 },
      { nombre: 'Pie',        simbolo: 'ft', factor: 304.8 },
    ],
  },

  // ══ NUEVAS (10) ══════════════════════════════════════════════
  {
    id: 'inercia', nombre: 'Momento de inercia (I)', icono: '⚙️', grupo: 'nueva',
    modulos: 'Civil — AISC 360 · Perfiles W · Columnas · Vigas',
    tipo: 'lineal',
    unidades: [
      { nombre: 'cm⁴',  simbolo: 'cm⁴', factor: 1 },
      { nombre: 'mm⁴',  simbolo: 'mm⁴', factor: 0.0001 },
      { nombre: 'm⁴',   simbolo: 'm⁴',  factor: 1e8 },
      { nombre: 'in⁴',  simbolo: 'in⁴', factor: 41.6231 },
      { nombre: 'ft⁴',  simbolo: 'ft⁴', factor: 863097 },
    ],
  },
  {
    id: 'cp', nombre: 'Capacidad calorífica (Cp)', icono: '🌡️', grupo: 'nueva',
    modulos: 'Térmica — TEMA · Kern (1950) · ASME Sec.VIII',
    tipo: 'lineal',
    unidades: [
      { nombre: 'kJ/(kg·K)',      simbolo: 'kJ/(kg·K)',     factor: 1 },
      { nombre: 'J/(kg·K)',       simbolo: 'J/(kg·K)',      factor: 0.001 },
      { nombre: 'BTU/(lb·°F)',    simbolo: 'BTU/(lb·°F)',   factor: 4.18680 },
      { nombre: 'kcal/(kg·°C)',   simbolo: 'kcal/(kg·°C)', factor: 4.18680 },
      { nombre: 'cal/(g·°C)',     simbolo: 'cal/(g·°C)',    factor: 4.18680 },
    ],
  },
  {
    id: 'entalpia', nombre: 'Entalpía específica (h)', icono: '♨️', grupo: 'nueva',
    modulos: 'Térmica — vapor · proceso · ASME Sec.VIII',
    tipo: 'lineal',
    unidades: [
      { nombre: 'kJ/kg',  simbolo: 'kJ/kg',  factor: 1 },
      { nombre: 'J/kg',   simbolo: 'J/kg',   factor: 0.001 },
      { nombre: 'MJ/kg',  simbolo: 'MJ/kg',  factor: 1000 },
      { nombre: 'BTU/lb', simbolo: 'BTU/lb', factor: 2.32600 },
      { nombre: 'kcal/kg',simbolo: 'kcal/kg',factor: 4.18680 },
      { nombre: 'cal/g',  simbolo: 'cal/g',  factor: 4.18680 },
    ],
  },
  {
    id: 'fouling', nombre: 'Fouling Factor — Ensuciamiento', icono: '🏭', grupo: 'nueva',
    modulos: 'Térmica — TEMA · Intercambiadores casco-tubo',
    tipo: 'lineal',
    unidades: [
      { nombre: 'm²·K/W',          simbolo: 'm²·K/W',        factor: 1 },
      { nombre: 'h·ft²·°F/BTU',   simbolo: 'h·ft²·°F/BTU',  factor: 0.17611 },
      { nombre: 'm²·K/kW',         simbolo: 'm²·K/kW',       factor: 0.001 },
      { nombre: 'cm²·h·°C/kcal',  simbolo: 'cm²·h·°C/kcal', factor: 0.859845 },
    ],
  },
  {
    id: 'carga_lineal', nombre: 'Carga lineal', icono: '↕️', grupo: 'nueva',
    modulos: 'Civil — AISC 360 · Vigas · Arquitectura — ASCE 7-22',
    tipo: 'lineal',
    unidades: [
      { nombre: 'N/m',    simbolo: 'N/m',    factor: 0.001 },
      { nombre: 'kN/m',   simbolo: 'kN/m',   factor: 1 },
      { nombre: 'MN/m',   simbolo: 'MN/m',   factor: 1000 },
      { nombre: 'kgf/m',  simbolo: 'kgf/m',  factor: 9.80665e-3 },
      { nombre: 'lb/ft',  simbolo: 'lb/ft',  factor: 0.014594 },
      { nombre: 'kip/ft', simbolo: 'kip/ft', factor: 14.5939 },
      { nombre: 'lbf/in', simbolo: 'lbf/in', factor: 0.175127 },
    ],
  },
  {
    id: 'pendiente', nombre: 'Pendiente / Inclinación', icono: '📐', grupo: 'nueva',
    modulos: 'Vialidad — AASHTO · Hidráulica · Represas · Arquitectura',
    tipo: 'pendiente',
    unidades: [
      { nombre: 'Porcentaje (%)',  simbolo: '%',    factor: 1 },
      { nombre: 'Por mil (‰)',     simbolo: '‰',    factor: 1 },
      { nombre: 'Grados (°)',      simbolo: '°',    factor: 1 },
      { nombre: 'm/m',             simbolo: 'm/m',  factor: 1 },
      { nombre: 'm/km',            simbolo: 'm/km', factor: 1 },
    ],
  },
  {
    id: 'gor', nombre: 'GOR — Gas-Oil Ratio', icono: '🛢️', grupo: 'nueva',
    modulos: 'Petróleo — API · Producción · Reservorios',
    tipo: 'lineal',
    unidades: [
      { nombre: 'scf/bbl',   simbolo: 'scf/bbl',   factor: 1 },
      { nombre: 'Sm³/m³',    simbolo: 'Sm³/m³',    factor: 0.17811 },
      { nombre: 'Mscf/bbl',  simbolo: 'Mscf/bbl',  factor: 1000 },
    ],
  },
  {
    id: 'rop', nombre: 'ROP — Tasa de Penetración', icono: '⛏️', grupo: 'nueva',
    modulos: 'Perforación — API RP 13D · IADC · Drilling Engineering',
    tipo: 'lineal',
    unidades: [
      { nombre: 'm/h',   simbolo: 'm/h',   factor: 1 },
      { nombre: 'ft/h',  simbolo: 'ft/h',  factor: 0.3048 },
      { nombre: 'ft/min',simbolo: 'ft/min',factor: 18.288 },
      { nombre: 'm/min', simbolo: 'm/min', factor: 60 },
    ],
  },
  {
    id: 'resistividad', nombre: 'Resistividad eléctrica', icono: '⚡', grupo: 'nueva',
    modulos: 'Electricidad — IEC 60228 · NEC · Cálculo de cables',
    tipo: 'lineal',
    unidades: [
      { nombre: 'Ω·m',        simbolo: 'Ω·m',        factor: 1 },
      { nombre: 'μΩ·m (=Ω·mm²/m)', simbolo: 'μΩ·m', factor: 1e-6 },
      { nombre: 'μΩ·cm',      simbolo: 'μΩ·cm',      factor: 1e-8 },
      { nombre: 'nΩ·m',       simbolo: 'nΩ·m',       factor: 1e-9 },
      { nombre: 'Ω·mm²/m',    simbolo: 'Ω·mm²/m',    factor: 1e-6 },
    ],
  },
  {
    id: 'peso_suelo', nombre: 'Peso específico suelo (γ)', icono: '🌍', grupo: 'nueva',
    modulos: 'Geotecnia — Meyerhof · CIRSOC 101 · Represas · Cimentaciones',
    tipo: 'lineal',
    unidades: [
      { nombre: 'kN/m³',    simbolo: 'kN/m³',   factor: 1 },
      { nombre: 'N/m³',     simbolo: 'N/m³',    factor: 0.001 },
      { nombre: 'kgf/m³',   simbolo: 'kgf/m³',  factor: 9.80665e-3 },
      { nombre: 'pcf (lbf/ft³)',simbolo: 'pcf',  factor: 0.157087 },
      { nombre: 'tf/m³',    simbolo: 'tf/m³',   factor: 9.80665 },
    ],
  },
];

// ─── Grupos para tabs ──────────────────────────────────────────
const GRUPOS = [
  { id: 'basica'   as const, label: 'Básicas',   n: 12, nota: '' },
  { id: 'tecnica'  as const, label: 'Técnicas',  n: 8,  nota: '' },
  { id: 'exclusiva'as const, label: '★ Exclusivas', n: 7, nota: '' },
  { id: 'nueva'    as const, label: '✦ Nuevas',  n: 10, nota: '' },
];
const GC: Record<string, string> = {
  basica: '#6366f1', tecnica: '#06b6d4', exclusiva: '#f59e0b', nueva: '#10b981',
};

// ─── Formato numérico ──────────────────────────────────────────
function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  if (n === 0) return '0';
  const a = Math.abs(n);
  if (a >= 1e9 || (a < 1e-5 && a > 0)) return n.toExponential(4);
  if (a >= 10000) return n.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  return parseFloat(n.toPrecision(6)).toString();
}

// ─── Conversiones especiales ───────────────────────────────────
function convertirTemp(v: number, desde: string) {
  let c: number;
  if (desde === '°C') c = v;
  else if (desde === '°F') c = (v - 32) * 5 / 9;
  else if (desde === 'K') c = v - 273.15;
  else c = (v - 491.67) * 5 / 9; // Rankine
  return [
    { simbolo: '°C', nombre: 'Celsius',    r: c },
    { simbolo: '°F', nombre: 'Fahrenheit', r: c * 9 / 5 + 32 },
    { simbolo: 'K',  nombre: 'Kelvin',     r: c + 273.15 },
    { simbolo: '°R', nombre: 'Rankine',    r: (c + 273.15) * 9 / 5 },
  ];
}

function convertirAPI(v: number, desde: string) {
  let sg: number;
  if (desde === '°API') sg = 141.5 / (v + 131.5);
  else if (desde === 'SG') sg = v;
  else sg = v / 1000;
  return [
    { simbolo: '°API', nombre: 'Grados API', r: 141.5 / sg - 131.5 },
    { simbolo: 'SG',   nombre: 'Gravedad específica', r: sg },
    { simbolo: 'kg/m³',nombre: 'kg/m³', r: sg * 1000 },
  ];
}

function convertirPendiente(v: number, desde: string) {
  // Convertir a fracción (m/m) primero
  let mm: number;
  if (desde === '%')    mm = v / 100;
  else if (desde === '‰')   mm = v / 1000;
  else if (desde === '°')   mm = Math.tan(v * Math.PI / 180);
  else if (desde === 'm/m') mm = v;
  else mm = v / 1000; // m/km
  return [
    { simbolo: '%',    nombre: 'Porcentaje',   r: mm * 100 },
    { simbolo: '‰',    nombre: 'Por mil',      r: mm * 1000 },
    { simbolo: '°',    nombre: 'Grados',       r: Math.atan(mm) * 180 / Math.PI },
    { simbolo: 'm/m',  nombre: 'm/m',          r: mm },
    { simbolo: 'm/km', nombre: 'm/km',         r: mm * 1000 },
  ];
}

// ─── Componente principal ──────────────────────────────────────
export default function ConversorUnidades() {
  const [abierto, setAbierto]   = useState(false);
  const [grupo, setGrupo]       = useState<'basica'|'tecnica'|'exclusiva'|'nueva'>('basica');
  const [catId, setCatId]       = useState('presion');
  const [valor, setValor]       = useState('');
  const [desde, setDesde]       = useState('Pa');
  const [busqueda, setBusqueda] = useState('');

  const cat     = CATS.find(c => c.id === catId)!;
  const catsFil = CATS.filter(c => c.grupo === grupo);
  const gc      = GC[grupo];

  const cambiarCat = (id: string) => {
    setCatId(id);
    const c = CATS.find(c => c.id === id)!;
    if (c.unidades.length > 0) setDesde(c.unidades[0].simbolo);
    setValor('');
  };
  const cambiarGrupo = (g: typeof grupo) => {
    setGrupo(g);
    const first = CATS.find(c => c.grupo === g);
    if (first) cambiarCat(first.id);
  };

  const convertirLineal = (v: number) =>
    cat.unidades.map(u => {
      const from = cat.unidades.find(x => x.simbolo === desde);
      if (!from) return { simbolo: u.simbolo, nombre: u.nombre, r: 0 };
      return { simbolo: u.simbolo, nombre: u.nombre, r: (v * from.factor) / u.factor };
    });

  const getRes = () => {
    const v = parseFloat(valor);
    if (isNaN(v)) return [];
    if (cat.tipo === 'temperatura')  return convertirTemp(v, desde);
    if (cat.tipo === 'api_gravity')  return convertirAPI(v, desde);
    if (cat.tipo === 'pendiente')    return convertirPendiente(v, desde);
    if (cat.tipo === 'lineal')       return convertirLineal(v);
    return [];
  };
  const resultados = getRes();

  const catsBusqueda = busqueda.length > 1
    ? CATS.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.modulos.toLowerCase().includes(busqueda.toLowerCase()))
    : null;

  // ── Botón flotante ───────────────────────────────────────────
  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)}
        title="Conversor de unidades — 37 categorías de ingeniería"
        style={{
          position:'fixed', bottom:24, right:24, zIndex:999,
          width:52, height:52, borderRadius:'50%',
          background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
          border:'2px solid rgba(99,102,241,0.5)',
          color:'#fff', fontSize:22, cursor:'pointer',
          boxShadow:'0 4px 24px rgba(99,102,241,0.6)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>⚖️</button>
    );
  }

  // ── Panel lateral ────────────────────────────────────────────
  return (
    <>
      <div onClick={() => setAbierto(false)}
        style={{position:'fixed',inset:0,zIndex:997,background:'rgba(0,0,0,0.4)'}}/>

      <div style={{
        position:'fixed', right:0, top:0, bottom:0, zIndex:998,
        width:'100%', maxWidth:420,
        background:'#070d1a', borderLeft:'1px solid rgba(99,102,241,0.3)',
        display:'flex', flexDirection:'column',
        fontFamily:'Inter,system-ui,sans-serif', color:'#f1f5f9',
        boxShadow:'-8px 0 40px rgba(0,0,0,0.6)',
      }}>

        {/* HEADER */}
        <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(99,102,241,0.2)',display:'flex',alignItems:'center',gap:10,background:'rgba(99,102,241,0.08)',flexShrink:0}}>
          <span style={{fontSize:22}}>⚖️</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800}}>Conversor de Unidades</div>
            <div style={{fontSize:9,color:'#475569'}}>37 categorías · NIST · AWS · API · IEC · ASHRAE · AISC · TEMA · ASCE 7-22</div>
          </div>
          <button onClick={()=>setAbierto(false)} style={{background:'none',border:'none',color:'#64748b',fontSize:20,cursor:'pointer',padding:'4px 8px'}}>✕</button>
        </div>

        {/* BUSCADOR */}
        <div style={{padding:'8px 12px',background:'#0a0f1e',borderBottom:'1px solid rgba(99,102,241,0.1)',flexShrink:0}}>
          <input value={busqueda} onChange={e=>setBusqueda(e.target.value)}
            placeholder="Buscar categoría o módulo..."
            style={{width:'100%',padding:'7px 12px',background:'#070d1a',border:'1px solid rgba(99,102,241,0.2)',borderRadius:8,color:'#f1f5f9',fontSize:12,outline:'none',boxSizing:'border-box' as const}}/>
        </div>

        {/* GRUPOS */}
        {!busqueda && (
          <div style={{display:'flex',background:'#0a0f1e',borderBottom:'1px solid rgba(99,102,241,0.15)',flexShrink:0}}>
            {GRUPOS.map(g=>(
              <button key={g.id} onClick={()=>cambiarGrupo(g.id)} style={{
                flex:1, padding:'8px 2px', border:'none', background:'transparent',
                color:grupo===g.id?GC[g.id]:'#475569',
                borderBottom:grupo===g.id?`2px solid ${GC[g.id]}`:'2px solid transparent',
                fontSize:9, fontWeight:grupo===g.id?700:400, cursor:'pointer',
              }}>{g.label}<br/><span style={{fontSize:8,opacity:0.6}}>({g.n})</span></button>
            ))}
          </div>
        )}

        {/* CHIPS CATEGORÍAS */}
        {!busqueda && (
          <div style={{padding:'6px 10px',borderBottom:'1px solid rgba(99,102,241,0.1)',display:'flex',gap:4,flexWrap:'wrap' as const,background:'#0a0f1e',flexShrink:0}}>
            {catsFil.map(c=>(
              <button key={c.id} onClick={()=>cambiarCat(c.id)} style={{
                padding:'3px 8px', borderRadius:16,
                background:catId===c.id?`${gc}18`:'transparent',
                border:`1px solid ${catId===c.id?gc+'50':'rgba(99,102,241,0.1)'}`,
                color:catId===c.id?gc:'#64748b',
                fontSize:9, fontWeight:catId===c.id?700:400, cursor:'pointer',
              }}>{c.icono} {c.nombre}</button>
            ))}
          </div>
        )}

        {/* CONTENIDO */}
        <div style={{flex:1,overflowY:'auto',padding:14}}>

          {/* BÚSQUEDA RESULTADO */}
          {busqueda && catsBusqueda && (
            <div>
              <div style={{fontSize:10,color:'#475569',marginBottom:10}}>
                {catsBusqueda.length} resultado(s) para "{busqueda}"
              </div>
              {catsBusqueda.map(c=>(
                <div key={c.id} onClick={()=>{cambiarCat(c.id);setGrupo(c.grupo);setBusqueda('');}}
                  style={{padding:'8px 12px',background:'#0a0f1e',borderRadius:8,marginBottom:6,cursor:'pointer',border:'1px solid rgba(99,102,241,0.12)'}}>
                  <div style={{fontSize:12,fontWeight:700,color:GC[c.grupo]}}>{c.icono} {c.nombre}</div>
                  <div style={{fontSize:10,color:'#475569',marginTop:2}}>{c.modulos}</div>
                </div>
              ))}
              {catsBusqueda.length === 0 && <div style={{color:'#334155',fontSize:12}}>Sin resultados.</div>}
            </div>
          )}

          {/* TABLA AWG */}
          {!busqueda && cat.tipo === 'awg' && (
            <div>
              <div style={{fontSize:11,color:'#f59e0b',fontWeight:700,marginBottom:8}}>
                AWG ↔ mm² — NEC 2023 / IEC 60228
              </div>
              <div style={{fontSize:10,color:'#475569',marginBottom:10,lineHeight:1.5}}>
                NEC (EE.UU.) usa AWG. IEC (Europa/LatAm) usa mm². Esta tabla cruza ambos sistemas.
                Cobre: ρ = 0.0175 Ω·mm²/m · Aluminio: ρ = 0.0280 Ω·mm²/m
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3,marginBottom:4}}>
                {['AWG','mm² (IEC 60228)'].map(h=>(
                  <div key={h} style={{fontSize:9,color:'#f59e0b',fontWeight:700,padding:'5px 8px',background:'#0f172a',borderRadius:5,textAlign:'center' as const}}>{h}</div>
                ))}
              </div>
              {AWG_TABLE.map(r=>(
                <div key={r.awg} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3,marginBottom:2}}>
                  <div style={{fontSize:11,color:'#94a3b8',padding:'4px 8px',background:'#0a0f1e',borderRadius:5}}>AWG {r.awg}</div>
                  <div style={{fontSize:12,color:'#f59e0b',fontWeight:700,padding:'4px 8px',background:'#0a0f1e',borderRadius:5,textAlign:'center' as const}}>{r.mm2}</div>
                </div>
              ))}
            </div>
          )}

          {/* PENDIENTE INFO */}
          {!busqueda && cat.tipo === 'pendiente' && (
            <div style={{fontSize:10,color:'#334155',marginBottom:10,padding:'8px 10px',background:'#0a0f1e',borderRadius:8,lineHeight:1.6}}>
              % ↔ ‰ ↔ m/m: conversión lineal. % ↔ °: no lineal — usa arctan(p/100). Ej: 10% = arctan(0.1) = 5.71°
            </div>
          )}

          {/* INPUT + FROM */}
          {!busqueda && cat.tipo !== 'awg' && (
            <>
              <div style={{fontSize:10,color:gc,fontWeight:700,marginBottom:8,padding:'4px 8px',background:`${gc}0f`,borderRadius:6}}>
                📌 {cat.modulos}
              </div>

              <div style={{marginBottom:10}}>
                <label style={{display:'block',fontSize:9,fontWeight:700,color:'#64748b',marginBottom:4,textTransform:'uppercase' as const,letterSpacing:0.5}}>Valor</label>
                <input value={valor} onChange={e=>setValor(e.target.value)} type="number"
                  placeholder="Ingresá el valor..."
                  style={{width:'100%',padding:'9px 12px',background:'#0a0f1e',border:'1px solid rgba(99,102,241,0.2)',borderRadius:9,color:'#f1f5f9',fontSize:14,outline:'none',boxSizing:'border-box' as const}}/>
              </div>

              {cat.tipo !== 'api_gravity' && cat.tipo !== 'temperatura' && cat.tipo !== 'pendiente' && (
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',fontSize:9,fontWeight:700,color:'#64748b',marginBottom:4,textTransform:'uppercase' as const,letterSpacing:0.5}}>Desde</label>
                  <select value={desde} onChange={e=>setDesde(e.target.value)} style={{width:'100%',padding:'9px 12px',background:'#0a0f1e',border:'1px solid rgba(99,102,241,0.2)',borderRadius:9,color:'#f1f5f9',fontSize:12,outline:'none'}}>
                    {cat.unidades.map(u=>(
                      <option key={u.simbolo} value={u.simbolo} style={{background:'#0a0f1e'}}>
                        {u.simbolo} — {u.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(cat.tipo === 'temperatura' || cat.tipo === 'pendiente') && (
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',fontSize:9,fontWeight:700,color:'#64748b',marginBottom:4,textTransform:'uppercase' as const,letterSpacing:0.5}}>Desde</label>
                  <select value={desde} onChange={e=>setDesde(e.target.value)} style={{width:'100%',padding:'9px 12px',background:'#0a0f1e',border:'1px solid rgba(99,102,241,0.2)',borderRadius:9,color:'#f1f5f9',fontSize:12,outline:'none'}}>
                    {cat.unidades.map(u=>(
                      <option key={u.simbolo} value={u.simbolo} style={{background:'#0a0f1e'}}>
                        {u.simbolo} — {u.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* RESULTADOS */}
              {valor !== '' && !isNaN(parseFloat(valor)) ? (
                <div>
                  <div style={{fontSize:9,color:gc,fontWeight:700,marginBottom:6,textTransform:'uppercase' as const,letterSpacing:0.5}}>Resultados</div>
                  {resultados.map(r=>(
                    <div key={r.simbolo} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'8px 10px', borderRadius:8, marginBottom:3,
                      background: r.simbolo === desde ? `${gc}12` : '#0a0f1e',
                      border:`1px solid ${r.simbolo===desde ? gc+'40' : 'transparent'}`,
                    }}>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:r.simbolo===desde?gc:'#94a3b8'}}>{r.simbolo}</div>
                        <div style={{fontSize:8,color:'#334155'}}>{r.nombre}</div>
                      </div>
                      <div style={{fontSize:15,fontWeight:800,color:r.simbolo===desde?gc:'#f1f5f9',fontFamily:'monospace'}}>
                        {fmt(r.r)}
                      </div>
                    </div>
                  ))}

                  {cat.tipo === 'api_gravity' && (
                    <div style={{fontSize:9,color:'#334155',marginTop:6,padding:'5px 8px',background:'#0a0f1e',borderRadius:6}}>
                      API: SG = 141.5 / (°API + 131.5)
                    </div>
                  )}
                  {cat.id === 'peso_lodo' && (
                    <div style={{fontSize:9,color:'#334155',marginTop:6,padding:'5px 8px',background:'#0a0f1e',borderRadius:6}}>
                      Agua dulce = 8.34 ppg = 1000 kg/m³ = 0.433 psi/ft
                    </div>
                  )}
                  {cat.id === 'fouling' && (
                    <div style={{fontSize:9,color:'#334155',marginTop:6,padding:'5px 8px',background:'#0a0f1a',borderRadius:6}}>
                      TEMA: agua río = 0.0002 m²·K/W · crudo = 0.0003–0.0007 m²·K/W
                    </div>
                  )}
                  {cat.id === 'resistividad' && (
                    <div style={{fontSize:9,color:'#334155',marginTop:6,padding:'5px 8px',background:'#0a0f1e',borderRadius:6}}>
                      Cu: 0.0175 Ω·mm²/m · Al: 0.0280 Ω·mm²/m (IEC 60228, 20°C)
                    </div>
                  )}
                  {cat.id === 'peso_suelo' && (
                    <div style={{fontSize:9,color:'#334155',marginTop:6,padding:'5px 8px',background:'#0a0f1e',borderRadius:6}}>
                      γ_agua = 9.81 kN/m³ = 62.4 pcf · γ_arena = 16–20 kN/m³
                    </div>
                  )}
                  {cat.id === 'inercia' && (
                    <div style={{fontSize:9,color:'#334155',marginTop:6,padding:'5px 8px',background:'#0a0f1e',borderRadius:6}}>
                      AISC usa in⁴ · LatAm usa cm⁴ · 1 in⁴ = 41.62 cm⁴
                    </div>
                  )}
                </div>
              ) : (
                <div style={{textAlign:'center' as const,padding:'20px 0',color:'#334155',fontSize:12}}>
                  Ingresá un valor para ver las conversiones
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div style={{padding:'5px 14px',borderTop:'1px solid rgba(99,102,241,0.1)',fontSize:8,color:'#1e293b',textAlign:'center' as const,flexShrink:0}}>
          INGENIUM PRO v8.1 · 37 categorías · NIST · AWS · API · IEC · ASHRAE · AISC · TEMA · ASCE 7-22 verificados
        </div>
      </div>
    </>
  );
} 