'use client';
import { useState } from 'react';

const PAISES = [
  'Argentina','Bolivia','Brasil','Chile','Colombia','Costa Rica','Cuba',
  'Ecuador','El Salvador','España','Guatemala','Honduras','México',
  'Nicaragua','Panamá','Paraguay','Perú','Puerto Rico',
  'República Dominicana','Uruguay','Venezuela','Alemania','Australia',
  'Canadá','China','Corea del Sur','Estados Unidos','Francia','India',
  'Italia','Japón','Reino Unido','Rusia','Sudáfrica','Turquía',
  'Emiratos Árabes Unidos','Arabia Saudita','Nigeria','Egipto',
  'Indonesia','Otro',
];

function OjoIcono({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function LoginPage() {
  const [modo, setModo] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({
    email: '', password: '', nombre: '', empresa: '', pais: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [verPass, setVerPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setExito('');
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
        setExito('✅ Cuenta creada exitosamente. Ahora iniciá sesión.');
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
      fontFamily: 'Inter, sans-serif', padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 460,
        background: 'rgba(15,23,42,0.97)',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: 20, padding: '44px 40px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
      }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 10, letterSpacing: 5, color: '#6366f1', fontWeight: 800, marginBottom: 10 }}>
            ◈ INGENIUM PRO
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: -0.5 }}>
            {modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>
            Plataforma de Ingeniería Técnica de Precisión
          </div>
        </div>

        {/* TABS */}
        <div style={{
          display: 'flex', background: '#0a0f1e', borderRadius: 12,
          padding: 5, marginBottom: 32,
          border: '1px solid rgba(99,102,241,0.15)',
        }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m}
              onClick={() => { setModo(m); setError(''); setExito(''); }}
              style={{
                flex: 1, padding: '9px 0', border: 'none', borderRadius: 9,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                background: modo === m ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                color: modo === m ? '#fff' : '#475569',
                boxShadow: modo === m ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
              }}>
              {m === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* CAMPOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {modo === 'signup' && (
            <>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input name="nombre" placeholder="Ej: Juan Pérez"
                  value={form.nombre} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Empresa / Organización</label>
                <input name="empresa" placeholder="Ej: YPF S.A."
                  value={form.empresa} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>País</label>
                <select name="pais" value={form.pais} onChange={handleChange}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none' as const,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    paddingRight: 40,
                  }}>
                  <option value="" disabled>Seleccioná tu país</option>
                  {PAISES.map(p => (
                    <option key={p} value={p} style={{ background: '#0f172a', color: '#f1f5f9' }}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label style={labelStyle}>Email profesional</label>
            <input name="email" type="email" placeholder="usuario@empresa.com"
              value={form.email} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type={verPass ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={handleChange}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button
                onClick={() => setVerPass(!verPass)}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}>
                <OjoIcono visible={verPass} />
              </button>
            </div>
          </div>
        </div>

        {/* MENSAJES */}
        {error && (
          <div style={{
            marginTop: 16, padding: '11px 16px', borderRadius: 10,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', fontSize: 13,
          }}>{error}</div>
        )}
        {exito && (
          <div style={{
            marginTop: 16, padding: '11px 16px', borderRadius: 10,
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80', fontSize: 13,
          }}>{exito}</div>
        )}

        {/* BOTÓN */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', marginTop: 24, padding: '14px 0',
          background: loading ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          border: loading ? '1px solid #334155' : 'none',
          borderRadius: 12, color: loading ? '#475569' : '#fff',
          fontSize: 15, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 6px 24px rgba(99,102,241,0.45)',
        }}>
          {loading ? 'Procesando...' : modo === 'login' ? 'Ingresar a INGENIUM PRO' : 'Crear Cuenta'}
        </button>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#334155', letterSpacing: 0.5 }}>
            ASME · API · ISO · AWWA · AASHTO
          </div>
          <div style={{ fontSize: 10, color: '#1e293b', marginTop: 6 }}>
            © 2026 INGENIUM PRO — Todos los derechos reservados
          </div>
        </div>

      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: '#0a0f1e',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: 10, color: '#f1f5f9',
  fontSize: 14, outline: 'none',
  width: '100%', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#64748b', marginBottom: 6, letterSpacing: 0.5,
  textTransform: 'uppercase',
};