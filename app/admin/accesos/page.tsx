'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const BORD  = 'rgba(99,102,241,0.15)';
const OWNER_EMAIL = 'colombosilvanabelen@gmail.com';

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function decodePayload(t: string) {
  try { return JSON.parse(atob(t.split('.')[0])); } catch { return null; }
}

interface RegistroAcceso {
  id: string;
  usuarioId: string | null;
  email: string;
  ip: string | null;
  userAgent: string | null;
  exitoso: boolean;
  createdAt: string;
}

export default function AccesosPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [registros, setRegistros] = useState<RegistroAcceso[]>([]);

  useEffect(() => {
    const verificarYCargar = async () => {
      try {
        const res = await fetch('/api/v1/auth/session', { credentials: 'include' });
        if (!res.ok) { router.replace('/Login'); return; }

        const data = await res.json();
        if (!data.token) { router.replace('/Login'); return; }

        localStorage.setItem('ip_token', data.token);
        const payload = decodePayload(data.token);

        if (payload?.email?.toLowerCase() !== OWNER_EMAIL) {
          router.replace('/dashboard');
          return;
        }

        setAutorizado(true);

        const resAccesos = await fetch('/api/admin/accesos', {
          credentials: 'include',
          headers: ipAuthHeader(),
        });
        if (resAccesos.status === 403) { router.replace('/dashboard'); return; }

        const json = await resAccesos.json();
        if (json?.ok) setRegistros(json.data);
      } catch {
        router.replace('/Login');
      } finally {
        setCargando(false);
      }
    };

    verificarYCargar();
  }, [router]);

  if (cargando || !autorizado) return null;

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
        <span style={{ color: '#334155', fontSize: 13 }}>Auditoría — Accesos</span>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🔐 Últimos accesos a la plataforma</h1>
        <p style={{ fontSize: 12, color: '#475569', marginBottom: 24 }}>
          Últimos {registros.length} registros, del más reciente al más viejo.
        </p>

        {registros.length === 0 ? (
          <div style={{ fontSize: 12, color: '#475569', padding: 12, background: '#0a0f1e', borderRadius: 8 }}>
            No hay registros de acceso todavía.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {registros.map(r => (
              <div key={r.id} style={{
                border: `1px solid ${BORD}`, borderRadius: 10,
                background: '#0a0f1e', padding: '10px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{r.email}</div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                    {new Date(r.createdAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: 10, color: '#334155', marginTop: 2 }}>
                    IP: {r.ip ?? '—'} · {r.userAgent ?? 'Dispositivo desconocido'}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                  color: r.exitoso ? '#4ade80' : '#f87171',
                  background: r.exitoso ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${r.exitoso ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                  {r.exitoso ? 'EXITOSO' : 'FALLIDO'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
