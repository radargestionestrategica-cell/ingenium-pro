'use client';

import { useState, useEffect } from 'react';
import HistorialActivo from '@/components/HistorialActivo';

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const BORD  = 'rgba(99,102,241,0.15)';

export default function HistorialPage() {
  const [usuarioId, setUsuarioId] = useState('');

  useEffect(() => {
    try {
      const usr = JSON.parse(localStorage.getItem('ip_usuario') || '{}');
      setUsuarioId(usr?.id ?? '');
    } catch {}
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{
        height: 56, background: PANEL,
        borderBottom: `1px solid ${BORD}`,
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      }}>
        <a href="/dashboard" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
          ← Dashboard
        </a>
        <span style={{ color: GOLD, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>INGENIUM PRO</span>
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 300 }}>Ω</span>
        <span style={{ color: '#334155', fontSize: 13 }}>Historial</span>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* TÍTULO */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: GOLD, marginBottom: 10, textTransform: 'uppercase' as const }}>
            Panel de Integridad de Activos
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', margin: '0 0 10px', lineHeight: 1.1 }}>
            Historial
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 580, margin: 0, lineHeight: 1.6 }}>
            Evolución temporal de tus cálculos guardados, con semáforo de alertas.
          </p>
        </div>

        {usuarioId && <HistorialActivo usuarioId={usuarioId} />}
      </div>
    </div>
  );
}
