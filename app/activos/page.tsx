'use client';
// app/activos/page.tsx
// Listado de activos con nombre guardado — consume GET /api/calculos/activos

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

type ActivoResumen = {
  nombre: string;
  ultimoTipo: string;
  ultimaAlerta: boolean;
  ultimoAlertaMsg: string | null;
  ultimaFecha: string;
  totalMediciones: number;
};

export default function ActivosPage() {
  const router = useRouter();
  const [activos, setActivos] = useState<ActivoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/calculos/activos', { credentials: 'include', headers: ipAuthHeader() });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setActivos(json.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar activos');
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', fontSize: 13, padding: '8px 14px', cursor: 'pointer' }}
          >
            ← Volver
          </button>
          <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 20 }}>Activos</div>
        </div>

        {cargando && (
          <div style={{ color: '#64748b', fontSize: 13 }}>Cargando activos...</div>
        )}

        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 12, color: '#fca5a5', fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {!cargando && !error && activos.length === 0 && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, color: '#94a3b8', fontSize: 14, textAlign: 'center' }}>
            Todavia no tenes activos con nombre guardado
          </div>
        )}

        {!cargando && !error && activos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {activos.map(a => (
              <div key={a.nombre} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.ultimaAlerta ? '#ef4444' : '#22c55e', flexShrink: 0 }} />
                  <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nombre}</div>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Último tipo: <span style={{ color: '#f1f5f9' }}>{a.ultimoTipo}</span></div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Última fecha: <span style={{ color: '#f1f5f9' }}>{new Date(a.ultimaFecha).toLocaleDateString('es-AR')}</span></div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Mediciones totales: <span style={{ color: '#f1f5f9' }}>{a.totalMediciones}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
