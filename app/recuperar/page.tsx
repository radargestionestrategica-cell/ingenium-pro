'use client';

import { useState } from 'react';

export default function RecuperarPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleEnviar() {
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      await fetch('/api/v1/auth/recuperar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
    } finally {
      setLoading(false);
      setEnviado(true);
    }
  }

  return (
    <div style={{
      minHeight:       '100vh',
      background:      '#0f172a',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '24px',
      fontFamily:      'Arial, sans-serif',
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

        <h1 style={{
          margin:     '0 0 8px',
          fontSize:   '20px',
          fontWeight: '700',
          color:      '#f1f5f9',
        }}>
          Recuperar contraseña
        </h1>
        <p style={{
          margin:     '0 0 28px',
          fontSize:   '14px',
          color:      '#94a3b8',
          lineHeight: '1.6',
        }}>
          Ingresá tu email y te enviamos un enlace para restablecer tu contraseña.
        </p>

        {enviado ? (
          <div style={{
            background:   '#0f172a',
            border:       '1px solid #f59e0b33',
            borderRadius: '8px',
            padding:      '20px',
            fontSize:     '14px',
            color:        '#94a3b8',
            lineHeight:   '1.7',
          }}>
            Si el email está registrado, vas a recibir un enlace para restablecer tu contraseña.
            Revisá tu bandeja de entrada.
          </div>
        ) : (
          <>
            <label style={{
              display:      'block',
              fontSize:     '13px',
              fontWeight:   '600',
              color:        '#94a3b8',
              marginBottom: '8px',
              letterSpacing: '0.3px',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleEnviar(); }}
              placeholder="tu@email.com"
              disabled={loading}
              style={{
                width:        '100%',
                boxSizing:    'border-box',
                background:   '#0f172a',
                border:       '1px solid #334155',
                borderRadius: '8px',
                padding:      '12px 14px',
                fontSize:     '15px',
                color:        '#f1f5f9',
                marginBottom: '20px',
                outline:      'none',
              }}
            />
            <button
              onClick={handleEnviar}
              disabled={loading || !email.trim()}
              style={{
                width:         '100%',
                background:    loading || !email.trim() ? '#78350f' : '#f59e0b',
                color:         '#0f172a',
                border:        'none',
                borderRadius:  '8px',
                padding:       '13px',
                fontSize:      '15px',
                fontWeight:    '700',
                cursor:        loading || !email.trim() ? 'not-allowed' : 'pointer',
                letterSpacing: '0.3px',
                transition:    'background 0.2s',
              }}
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </>
        )}

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <a href="/Login" style={{
            fontSize:       '13px',
            color:          '#f59e0b',
            textDecoration: 'none',
          }}>
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}
