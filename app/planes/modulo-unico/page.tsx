'use client';

import { useState } from 'react';

const BG    = '#020609';
const GOLD  = '#E8A020';
const PANEL = '#0a0f1e';
const INDIGO = '#6366f1';
const BORD  = 'rgba(99,102,241,0.15)';
const PAYPAL_URL = 'https://www.paypal.me/ingeniumpro/35';

const MODULOS = [
  { id: 'petroleo',     label: 'Petróleo / MAOP',  icon: '🛢️' },
  { id: 'perforacion',  label: 'Perforación',       icon: '⛏️' },
  { id: 'hidraulica',   label: 'Hidráulica',        icon: '💧' },
  { id: 'canerias',     label: 'Cañerías',          icon: '🔩' },
  { id: 'electricidad', label: 'Electricidad',      icon: '⚡' },
  { id: 'geotecnia',    label: 'Geotecnia',         icon: '🌍' },
  { id: 'soldadura',    label: 'Soldadura',         icon: '🔥' },
  { id: 'mmo',          label: 'MMO',               icon: '🔧' },
  { id: 'valvulas',     label: 'Válvulas',          icon: '🚿' },
  { id: 'civil',        label: 'Civil',             icon: '🏗️' },
  { id: 'vialidad',     label: 'Vialidad',          icon: '🛣️' },
  { id: 'represas',     label: 'Represas',          icon: '🌊' },
  { id: 'mineria',      label: 'Minería',           icon: '⛏️' },
  { id: 'termica',      label: 'Térmica',           icon: '🌡️' },
  { id: 'arquitectura', label: 'Arquitectura',      icon: '🏛️' },
];

export default function ModuloUnicoPage() {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{
        height: 56, background: PANEL,
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      }}>
        <a href="/planes" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
          ← Volver
        </a>
        <span style={{ color: GOLD, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>INGENIUM PRO</span>
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 300 }}>Ω</span>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* TÍTULO */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: INDIGO, marginBottom: 12, textTransform: 'uppercase' }}>
            Plan Módulo único — USD 35/mes
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', margin: '0 0 14px', lineHeight: 1.1 }}>
            Elegí tu módulo
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
            Seleccioná 1 módulo de ingeniería. Tendrás acceso completo a ese módulo: PDF, Excel, DXF y análisis de IA.
          </p>
        </div>

        {/* GRID DE MÓDULOS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 40,
        }}>
          {MODULOS.map(m => {
            const activo = seleccionado === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSeleccionado(activo ? null : m.id)}
                style={{
                  background: activo
                    ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(99,102,241,0.1))'
                    : PANEL,
                  border: activo
                    ? '1.5px solid rgba(99,102,241,0.7)'
                    : `1px solid ${BORD}`,
                  borderRadius: 14,
                  padding: '18px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color .15s, background .15s',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: activo ? 700 : 500,
                  color: activo ? '#a5b4fc' : '#94a3b8',
                  lineHeight: 1.3,
                }}>
                  {m.label}
                </span>
                {activo && (
                  <span style={{
                    marginLeft: 'auto', flexShrink: 0,
                    width: 18, height: 18, borderRadius: '50%',
                    background: INDIGO,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 900, color: '#fff',
                  }}>✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* RESUMEN */}
        <div style={{
          background: PANEL,
          border: `1px solid ${BORD}`,
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Módulo seleccionado</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: seleccionado ? '#f1f5f9' : '#334155' }}>
              {seleccionado
                ? `${MODULOS.find(m => m.id === seleccionado)?.icon} ${MODULOS.find(m => m.id === seleccionado)?.label}`
                : 'Ninguno aún'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Precio</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: GOLD }}>USD 35<span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>/mes</span></div>
          </div>
        </div>

        {/* BOTÓN CTA — PayPal */}
        <button
          type="button"
          onClick={() => { if (seleccionado) window.location.href = PAYPAL_URL; }}
          disabled={!seleccionado}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: '15px 24px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 15,
            cursor: seleccionado ? 'pointer' : 'not-allowed',
            transition: 'opacity .2s',
            background: seleccionado
              ? `linear-gradient(135deg,${GOLD},#c47a10)`
              : 'rgba(99,102,241,0.08)',
            border: seleccionado ? 'none' : `1px solid ${BORD}`,
            color: seleccionado ? BG : '#334155',
            opacity: seleccionado ? 1 : 0.5,
          }}
        >
          {seleccionado ? 'Pagar con PayPal (USD 35/mes) →' : 'Seleccioná un módulo para continuar'}
        </button>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: '#334155', lineHeight: 1.6 }}>
          Pagos procesados de forma segura a través de PayPal.{' '}
          Podés cancelar en cualquier momento.
        </div>
      </div>
    </div>
  );
}
