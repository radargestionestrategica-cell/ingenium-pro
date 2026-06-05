'use client';

import { useState } from 'react';
import { use } from 'react';

export default function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [password, setPassword]   = useState('');
  const [repetir, setRepetir]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [resultado, setResultado] = useState<'ok' | 'error' | null>(null);

  async function handleConfirmar() {
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== repetir) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/reset', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      setResultado(res.ok ? 'ok' : 'error');
    } catch {
      setResultado('error');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    boxSizing:    'border-box',
    background:   '#0f172a',
    border:       '1px solid #334155',
    borderRadius: '8px',
    padding:      '12px 14px',
    fontSize:     '15px',
    color:        '#f1f5f9',
    outline:      'none',
  };

  const labelStyle: React.CSSProperties = {
    display:       'block',
    fontSize:      '13px',
    fontWeight:    '600',
    color:         '#94a3b8',
    marginBottom:  '8px',
    letterSpacing: '0.3px',
  };

  return (
    <div style={{
      minHeight:      '100vh',
      background:     '#0f172a',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '24px',
      fontFamily:     'Arial, sans-serif',
    }}>
      <div style={{
        background:   '#1e293b',
        borderRadius: '12px',
        padding:      '40px',
        width:        '100%',
        maxWidth:     '440px',
        boxShadow:    '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{
            fontSize:      '26px',
            fontWeight:    '900',
            letterSpacing: '2px',
            color:         '#f59e0b',
          }}>
            INGENIUM PRO
          </span>
        </div>

        {/* Estado: ok */}
        {resultado === 'ok' && (
          <>
            <div style={{
              background:   '#0f172a',
              border:       '1px solid #f59e0b33',
              borderRadius: '8px',
              padding:      '20px',
              fontSize:     '15px',
              color:        '#f1f5f9',
              lineHeight:   '1.6',
              marginBottom: '24px',
            }}>
              Tu contraseña fue actualizada correctamente.
            </div>
            <div style={{ textAlign: 'center' }}>
              <a href="/Login" style={{
                color:          '#f59e0b',
                fontSize:       '14px',
                textDecoration: 'none',
                fontWeight:     '600',
              }}>
                Ir al inicio de sesión →
              </a>
            </div>
          </>
        )}

        {/* Estado: error */}
        {resultado === 'error' && (
          <>
            <div style={{
              background:   '#0f172a',
              border:       '1px solid #ef444433',
              borderRadius: '8px',
              padding:      '20px',
              fontSize:     '15px',
              color:        '#fca5a5',
              lineHeight:   '1.6',
              marginBottom: '24px',
            }}>
              El enlace es inválido o expiró. Pedí uno nuevo.
            </div>
            <div style={{ textAlign: 'center' }}>
              <a href="/recuperar" style={{
                color:          '#f59e0b',
                fontSize:       '14px',
                textDecoration: 'none',
                fontWeight:     '600',
              }}>
                Solicitar nuevo enlace →
              </a>
            </div>
          </>
        )}

        {/* Estado: formulario */}
        {resultado === null && (
          <>
            <h1 style={{
              margin:     '0 0 8px',
              fontSize:   '20px',
              fontWeight: '700',
              color:      '#f1f5f9',
            }}>
              Nueva contraseña
            </h1>
            <p style={{
              margin:     '0 0 28px',
              fontSize:   '14px',
              color:      '#94a3b8',
              lineHeight: '1.6',
            }}>
              Elegí una contraseña nueva para tu cuenta.
            </p>

            <label style={labelStyle}>Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
              style={{ ...inputStyle, marginBottom: '20px' }}
            />

            <label style={labelStyle}>Repetir contraseña</label>
            <input
              type="password"
              value={repetir}
              onChange={e => setRepetir(e.target.value)}
              placeholder="Repetí la contraseña"
              disabled={loading}
              onKeyDown={e => { if (e.key === 'Enter') handleConfirmar(); }}
              style={{ ...inputStyle, marginBottom: error ? '12px' : '24px' }}
            />

            {error && (
              <p style={{
                margin:       '0 0 16px',
                fontSize:     '13px',
                color:        '#fca5a5',
                lineHeight:   '1.5',
              }}>
                {error}
              </p>
            )}

            <button
              onClick={handleConfirmar}
              disabled={loading}
              style={{
                width:         '100%',
                background:    loading ? '#78350f' : '#f59e0b',
                color:         '#0f172a',
                border:        'none',
                borderRadius:  '8px',
                padding:       '13px',
                fontSize:      '15px',
                fontWeight:    '700',
                cursor:        loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.3px',
                transition:    'background 0.2s',
              }}
            >
              {loading ? 'Actualizando...' : 'Confirmar nueva contraseña'}
            </button>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <a href="/Login" style={{
                fontSize:       '13px',
                color:          '#f59e0b',
                textDecoration: 'none',
              }}>
                ← Volver al inicio de sesión
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
