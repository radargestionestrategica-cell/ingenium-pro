'use client';

import { useState } from 'react';

const BG    = '#020609';
const GOLD  = '#E8A020';
const GREEN = '#22c55e';
const PANEL = '#0a0f1e';
const INDIGO = '#6366f1';
const BORD  = 'rgba(99,102,241,0.15)';
const PAYPAL_URL = 'https://www.paypal.me/ingeniumpro/75';

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

export default function DuoPage() {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSeleccionados(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const listoParaPagar = seleccionados.length === 2;

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
            Plan Dúo — USD 75/mes
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', margin: '0 0 14px', lineHeight: 1.1 }}>
            Elegí tus 2 módulos
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
            Seleccioná exactamente 2 módulos de ingeniería. Tendrás acceso completo a ambos: PDF, Excel, DXF y análisis de IA.
          </p>
        </div>

        {/* CONTADOR */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            background: PANEL, border: `1px solid ${BORD}`,
            borderRadius: 40, padding: '6px 20px',
            fontSize: 13, color: '#64748b', fontWeight: 600,
          }}>
            <span style={{ color: seleccionados.length === 2 ? GREEN : GOLD, fontWeight: 900 }}>
              {seleccionados.length}
            </span>
            {' '}/ 2 seleccionados
          </div>
        </div>

        {/* GRID DE MÓDULOS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 40,
        }}>
          {MODULOS.map((m) => {
            const activo    = seleccionados.includes(m.id);
            const orden     = seleccionados.indexOf(m.id) + 1;
            const bloqueado = !activo && seleccionados.length >= 2;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                disabled={bloqueado}
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
                  cursor: bloqueado ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'border-color .15s, background .15s',
                  width: '100%',
                  opacity: bloqueado ? 0.35 : 1,
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
                  }}>{orden}</span>
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
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Módulos seleccionados</div>
            {seleccionados.length === 0 && (
              <div style={{ fontSize: 14, color: '#334155' }}>Ninguno aún</div>
            )}
            {seleccionados.map((id, i) => {
              const m = MODULOS.find(x => x.id === id);
              return (
                <div key={id} style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>
                  {i + 1}. {m?.icon} {m?.label}
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Precio</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: GOLD }}>USD 75<span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>/mes</span></div>
          </div>
        </div>

        {/* BOTÓN CTA — PayPal */}
        <button
          type="button"
          onClick={() => { if (listoParaPagar) window.open(PAYPAL_URL, '_blank'); }}
          disabled={!listoParaPagar}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: '15px 24px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 15,
            cursor: listoParaPagar ? 'pointer' : 'not-allowed',
            transition: 'opacity .2s',
            background: listoParaPagar ? '#003087' : 'rgba(99,102,241,0.08)',
            border: listoParaPagar ? 'none' : `1px solid ${BORD}`,
            color: listoParaPagar ? '#fff' : '#334155',
            opacity: listoParaPagar ? 1 : 0.5,
          }}
        >
          {listoParaPagar
            ? 'Pagar con PayPal (USD)'
            : `Seleccioná ${2 - seleccionados.length} módulo${2 - seleccionados.length !== 1 ? 's' : ''} más para continuar`}
        </button>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: '#334155', lineHeight: 1.6 }}>
          Pagos procesados de forma segura a través de PayPal.{' '}
          Podés cancelar en cualquier momento.
        </div>
      </div>
    </div>
  );
}
