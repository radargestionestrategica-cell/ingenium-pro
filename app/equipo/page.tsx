'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BG    = '#020609';
const GOLD  = '#E8A020';
const GREEN = '#22c55e';
const PANEL = '#0a0f1e';
const BORD  = 'rgba(232,160,32,0.15)';

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

type Miembro = { id: string; nombre: string; email: string };
type EquipoData = { id: string; nombre: string; owner: Miembro; miembros: Miembro[] } | null;

export default function EquipoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan]       = useState<string | null>(null);
  const [equipo, setEquipo]   = useState<EquipoData>(null);

  const [invitando, setInvitando]       = useState(false);
  const [emailInvitar, setEmailInvitar] = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [msgOk, setMsgOk]               = useState('');
  const [msgErr, setMsgErr]             = useState('');

  const cargarEquipo = () => {
    return fetch('/api/equipo', { credentials: 'include', headers: ipAuthHeader() })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setPlan(data?.plan ?? null);
        setEquipo(data?.equipo ?? null);
      });
  };

  useEffect(() => {
    // La sesión ya la valida el middleware (matcher incluye /equipo) — acá solo se pide la data.
    cargarEquipo().finally(() => setLoading(false));
  }, []);

  const enviarInvitacion = async () => {
    setEnviando(true);
    setMsgOk('');
    setMsgErr('');
    try {
      const res = await fetch('/api/equipo/invitar', {
        method:      'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...ipAuthHeader() },
        body: JSON.stringify({ email: emailInvitar }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsgErr(data.error || 'Error al enviar la invitación');
        return;
      }
      setMsgOk(data.mensaje || 'Invitación enviada');
      setEmailInvitar('');
      setInvitando(false);
      await cargarEquipo();
    } catch {
      setMsgErr('Error de red al enviar la invitación');
    } finally {
      setEnviando(false);
    }
  };

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
        <span style={{ color: '#334155', fontSize: 13 }}>Equipo</span>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '56px 24px 80px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: 80, color: '#475569' }}>
            <div style={{ fontSize: 14 }}>Cargando...</div>
          </div>
        )}

        {!loading && plan !== 'team' && (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            background: PANEL, borderRadius: 16, border: `1px solid ${BORD}`,
          }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: GOLD, marginBottom: 10 }}>
              Sección exclusiva del plan Team
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
              La gestión de equipos está disponible únicamente para cuentas con plan Team activo.
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '11px 24px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg,${GOLD},#c47a10)`,
                color: BG, fontWeight: 800, fontSize: 13, cursor: 'pointer',
              }}
            >
              ← Volver al dashboard
            </button>
          </div>
        )}

        {!loading && plan === 'team' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: GOLD, marginBottom: 10, textTransform: 'uppercase' }}>
                Plan Team
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', margin: 0 }}>
                {equipo?.nombre ?? 'Tu equipo'}
              </h1>
            </div>

            <div style={{
              background: PANEL, border: `1px solid ${BORD}`, borderRadius: 16,
              padding: '20px 24px', marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' }}>
                Miembros
              </div>

              {!equipo && (
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Todavía no se creó un equipo para esta cuenta.
                </div>
              )}

              {equipo && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(232,160,32,0.08)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{equipo.owner.nombre}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{equipo.owner.email}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: GOLD, letterSpacing: 1 }}>DUEÑO</span>
                  </div>

                  {equipo.miembros.filter(m => m.id !== equipo.owner.id).map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{m.nombre}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{m.email}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: 1 }}>MIEMBRO</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msgOk && (
              <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: GREEN, fontSize: 13 }}>
                ✓ {msgOk}
              </div>
            )}
            {msgErr && (
              <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>
                ✗ {msgErr}
              </div>
            )}

            {!invitando && (
              <button
                onClick={() => { setInvitando(true); setMsgOk(''); setMsgErr(''); }}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
                  background: `linear-gradient(135deg,${GOLD},#c47a10)`, color: BG,
                  fontWeight: 800, fontSize: 14, cursor: 'pointer',
                }}
              >
                + Invitar miembro
              </button>
            )}

            {invitando && (
              <div style={{
                background: PANEL, border: `1px solid ${BORD}`, borderRadius: 16,
                padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <input
                  type="email"
                  value={emailInvitar}
                  onChange={e => setEmailInvitar(e.target.value)}
                  placeholder="email@del-invitado.com"
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => { setInvitando(false); setEmailInvitar(''); }}
                    disabled={enviando}
                    style={{
                      flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                      fontWeight: 700, fontSize: 13, cursor: enviando ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={enviarInvitacion}
                    disabled={enviando || !emailInvitar.trim()}
                    style={{
                      flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
                      background: enviando ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,${GOLD},#c47a10)`,
                      color: enviando ? '#475569' : BG,
                      fontWeight: 800, fontSize: 13, cursor: enviando || !emailInvitar.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {enviando ? 'Enviando...' : 'Enviar invitación'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
