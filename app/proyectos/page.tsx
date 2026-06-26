'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProyectoContexto from '@/components/ProyectoContexto';

const BG   = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const BORD  = 'rgba(99,102,241,0.15)';

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

interface ProyectoItem {
  id: string;
  nombre: string;
  industria: string;
  createdAt: string;
}

export default function ProyectosPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<ProyectoItem[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarProyectos = useCallback(() => {
    setCargando(true);
    fetch('/api/proyectos', { credentials: 'include', headers: ipAuthHeader() })
      .then(res => {
        if (res.status === 401 || res.status === 403) { router.replace('/Login'); return null; }
        return res.ok ? res.json() : null;
      })
      .then(json => { if (json?.ok) setProyectos(json.data as ProyectoItem[]); })
      .catch(() => router.replace('/Login'))
      .finally(() => setCargando(false));
  }, [router]);

  useEffect(() => { cargarProyectos(); }, [cargarProyectos]);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

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
        <span style={{ color: '#334155', fontSize: 13 }}>Proyectos</span>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>📁 Proyectos</h1>
        <p style={{ fontSize: 12, color: '#475569', marginBottom: 24 }}>
          Creá y gestioná proyectos para conectar todos los módulos técnicos.
        </p>

        <ProyectoContexto />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', margin: 0 }}>Proyectos guardados</h2>
          <button
            onClick={cargarProyectos}
            style={{
              background: 'none', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 8, color: '#6366f1', fontSize: 11,
              fontWeight: 700, cursor: 'pointer', padding: '5px 12px',
            }}
          >
            ↻ Actualizar
          </button>
        </div>

        {cargando ? (
          <div style={{ fontSize: 12, color: '#475569' }}>Cargando…</div>
        ) : proyectos.length === 0 ? (
          <div style={{ fontSize: 12, color: '#475569', padding: 12, background: PANEL, borderRadius: 8 }}>
            No hay proyectos guardados todavía.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {proyectos.map(p => (
              <div key={p.id} style={{
                border: `1px solid ${BORD}`, borderRadius: 10,
                background: PANEL, padding: '10px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{p.nombre}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{p.industria}</div>
                </div>
                <div style={{ fontSize: 10, color: '#334155' }}>
                  {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
