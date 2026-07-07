'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';

export default function VerificarEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [resultado, setResultado] = useState<'ok' | 'error' | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await fetch('/api/v1/auth/verificar-email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ token }),
        });
        if (activo) setResultado(res.ok ? 'ok' : 'error');
      } catch {
        if (activo) setResultado('error');
      }
    })();
    return () => { activo = false; };
  }, [token]);

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

        {/* Estado: verificando */}
        {resultado === null && (
          <div style={{
            textAlign: 'center',
            fontSize:  '14px',
            color:     '#94a3b8',
            lineHeight: '1.6',
          }}>
            Verificando tu email...
          </div>
        )}

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
              Email verificado. Tu cuenta ya tiene el email confirmado.
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
              El enlace de verificación es inválido o venció.
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
      </div>
    </div>
  );
}
