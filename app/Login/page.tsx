'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [modo, setModo] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ email: '', password: '', nombre: '', empresa: '', pais: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setExito('');
    try {
      const url = modo === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/signup';
      const body = modo === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, nombre: form.nombre, empresa: form.empresa, pais: form.pais };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error desconocido'); return; }
      if (modo === 'login') {
        localStorage.setItem('ip_token', data.token);
        localStorage.setItem('ip_user', JSON.stringify(data.usuario));
        window.location.href = '/';
      } else {
        setExito('Cuenta creada exitosamente. Ahora iniciá sesión.');
        setModo('login');
        setForm({ email: form.email, password: '', nombre: '', empresa: '', pais: '' });
      }
    } catch {
      setError('Error de conexión. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #0a0a1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 16, padding: 40,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontSize: 11, letterSpacing: 4, color: '#6366f1',
            fontWeight: 700, marginBottom: 8,
          }}>INGENIUM PRO</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9' }}>
            {modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
            Plataforma de Ingeniería Técnica de Precisión
          </div>
        </div>

        {/* TABS */}
        <div style={{
          display: 'flex', background: '#0f172a',
          borderRadius: 10, padding: 4, marginBottom: 28,
        }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setModo(m); setError(''); setExito(''); }}
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                background: modo === m ? '#6366f1' : 'transparent',
                color: modo === m ? '#fff' : '#64748b',
              }}>
              {m === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* CAMPOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {modo === 'signup' && (
            <>
              <input name="nombre" placeholder="Nombre completo" value={form.nombre}
                onChange={handleChange} style={inputStyle} />
              <input name="empresa" placeholder="Empresa / Organización" value={form.empresa}
                onChange={handleChange} style={inputStyle} />
              <input name="pais" placeholder="País" value={form.pais}
                onChange={handleChange} style={inputStyle} />
            </>
          )}
          <input name="email" type="email" placeholder="Email profesional" value={form.email}
            onChange={handleChange} style={inputStyle} />
          <input name="password" type="password" placeholder="Contraseña" value={form.password}
            onChange={handleChange} style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        {/* MENSAJES */}
        {error && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', fontSize: 13,
          }}>{error}</div>
        )}
        {exito && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80', fontSize: 13,
          }}>{exito}</div>
        )}

        {/* BOTÓN */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', marginTop: 22, padding: '13px 0',
          background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', borderRadius: 10, color: '#fff',
          fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
        }}>
          {loading ? 'Procesando...' : modo === 'login' ? 'Ingresar a INGENIUM PRO' : 'Crear Cuenta'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#475569' }}>
          Plataforma certificada bajo normativas ASME · API · ISO · AWWA
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: '#0f172a',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: 8,
  color: '#f1f5f9',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};