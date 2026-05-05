'use client';
import { useState } from 'react';

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const GREEN = '#22c55e';
const BORD  = 'rgba(232,160,32,0.25)';

export default function TerminosModal({ forzarVisible }: { forzarVisible?: boolean } = {}) {
  const [visible, setVisible] = useState(() => {
    if (forzarVisible !== undefined) return forzarVisible;
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('ip_terminos_aceptados');
  });
  const [terminos, setTerminos] = useState(false);
  const [cookies, setCookies] = useState(false);

  const handleAceptar = () => {
    localStorage.setItem('ip_terminos_aceptados', '1');
    window.dispatchEvent(new CustomEvent('ip_terminos_aceptados'));
    setVisible(false);
  };

  if (!visible) return null;

  const listo = terminos && cookies;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2,6,9,0.92)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: PANEL, border: `1px solid ${BORD}`,
        borderRadius: 20, padding: '36px 32px', fontFamily: 'Inter,system-ui,sans-serif',
      }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `linear-gradient(135deg,${GOLD},#c47a10)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 24, color: BG, margin: '0 auto 12px',
          }}>Ω</div>
          <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: 2, color: '#f1f5f9' }}>
            INGENIUM PRO
          </div>
          <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, fontWeight: 700, marginTop: 2 }}>
            PLATAFORMA TÉCNICA PROFESIONAL
          </div>
        </div>

        {/* TÍTULO */}
        <div style={{
          background: 'rgba(232,160,32,0.07)', border: `1px solid rgba(232,160,32,0.15)`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
            Antes de continuar, revisá y aceptá
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Es obligatorio para acceder a la plataforma
          </div>
        </div>

        {/* CHECKBOX — TÉRMINOS */}
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          background: terminos ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${terminos ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 10, padding: '14px 16px', marginBottom: 12, cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          <div style={{ position: 'relative', flexShrink: 0, marginTop: 1 }}>
            <input
              type="checkbox" checked={terminos} onChange={e => setTerminos(e.target.checked)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            />
            <div style={{
              width: 20, height: 20, borderRadius: 5,
              border: `2px solid ${terminos ? GREEN : '#334155'}`,
              background: terminos ? GREEN : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {terminos && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke={BG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 3 }}>
              Acepto los{' '}
              <a href="/terminos" target="_blank" rel="noopener noreferrer"
                style={{ color: GOLD, textDecoration: 'underline' }}>
                Términos y Condiciones
              </a>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
              Incluye el Protocolo de Exención de Responsabilidad Técnica y Legal de INGENIUM PRO Ω.
            </div>
          </div>
        </label>

        {/* CHECKBOX — COOKIES */}
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          background: cookies ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${cookies ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 10, padding: '14px 16px', marginBottom: 28, cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          <div style={{ position: 'relative', flexShrink: 0, marginTop: 1 }}>
            <input
              type="checkbox" checked={cookies} onChange={e => setCookies(e.target.checked)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            />
            <div style={{
              width: 20, height: 20, borderRadius: 5,
              border: `2px solid ${cookies ? GREEN : '#334155'}`,
              background: cookies ? GREEN : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {cookies && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke={BG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 3 }}>
              Acepto la Política de Cookies
            </div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
              Usamos cookies de sesión para autenticación y preferencias. No se comparten con terceros.
            </div>
          </div>
        </label>

        {/* BOTÓN */}
        <button
          onClick={handleAceptar}
          disabled={!listo}
          style={{
            width: '100%', padding: '13px 0',
            background: listo ? `linear-gradient(135deg,${GREEN},#16a34a)` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${listo ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 12, color: listo ? BG : '#334155',
            fontSize: 14, fontWeight: 800, cursor: listo ? 'pointer' : 'not-allowed',
            letterSpacing: 0.5, transition: 'all 0.2s',
          }}
        >
          {listo ? 'Ingresar a la plataforma →' : 'Aceptá ambas opciones para continuar'}
        </button>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 10, color: '#1e3a5f' }}>
          INGENIUM PRO v8.1 · RADAR Gestión Estratégica · © 2026
        </div>
      </div>
    </div>
  );
}
