'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const BORD  = 'rgba(99,102,241,0.15)';

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

interface GeometriaPileta {
  largoCoronamiento: number;
  anchoCoronamiento: number;
  profundidad: number;
  talud: number;
}

interface ActivoTelemetria {
  id: string;
  nombre: string;
  tipoActivo: string;
  geometriaJson: string;
  proyectoId: string | null;
  createdAt: string;
}

export default function FichaActivoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activo, setActivo] = useState<ActivoTelemetria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/telemetria/${id}`, { credentials: 'include', headers: ipAuthHeader() })
      .then(res => {
        if (res.status === 401 || res.status === 403) { router.replace('/Login'); return null; }
        return res.ok ? res.json() : null;
      })
      .then(json => {
        if (!json) return;
        if (json?.ok) setActivo(json.activo);
        else setError('No se pudo cargar el activo.');
      })
      .catch(() => router.replace('/Login'))
      .finally(() => setCargando(false));
  }, [id, router]);

  const geometria: GeometriaPileta | null = (() => {
    try { return activo ? JSON.parse(activo.geometriaJson) : null; } catch { return null; }
  })();

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{
        height: 56, background: PANEL,
        borderBottom: `1px solid ${BORD}`,
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      }}>
        <a href="/telemetria" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
          ← Telemetría
        </a>
        <span style={{ color: GOLD, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>INGENIUM PRO</span>
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 300 }}>Ω</span>
        <span style={{ color: '#334155', fontSize: 13 }}>Ficha de activo</span>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        {cargando && <div style={{ fontSize: 12, color: '#475569' }}>Cargando…</div>}
        {error && <div style={{ fontSize: 12, color: '#f87171' }}>{error}</div>}

        {activo && (
          <>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>📡 {activo.nombre}</h1>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 24 }}>
              Tipo: {activo.tipoActivo} · Creado: {new Date(activo.createdAt).toLocaleDateString()}
            </div>

            {geometria && (
              <div style={{
                border: `1px solid ${BORD}`, borderRadius: 12,
                background: 'rgba(7,13,26,0.8)', padding: 16,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Geometría de la pileta
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { l: 'Coronamiento largo', v: `${geometria.largoCoronamiento} m` },
                    { l: 'Coronamiento ancho', v: `${geometria.anchoCoronamiento} m` },
                    { l: 'Profundidad',        v: `${geometria.profundidad} m` },
                    { l: 'Talud (H:V)',        v: `${geometria.talud}:1` },
                  ].map(r => (
                    <div key={r.l} style={{ background: '#0a0f1e', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>{r.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
