'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'registro'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [pais, setPais] = useState('Argentina');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const PAISES = ['Argentina','Colombia','Mexico','Chile','Peru','Brasil','Venezuela','Bolivia','Ecuador','Uruguay','Espana','USA','Canada','Otro'];

  const handleLogin = async () => {
    setError(''); setOk('');
    if (!email || !password) { setError('Completa todos los campos.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al iniciar sesion.'); setLoading(false); return; }
      localStorage.setItem('ip_token', data.token);
      localStorage.setItem('ip_usuario', JSON.stringify(data.usuario));
      window.location.href = '/';
    } catch { setError('Error de conexion.'); }
    setLoading(false);
  };

  const handleRegistro = async () => {
    setError(''); setOk('');
    if (!email || !password || !nombre || !empresa) { setError('Completa todos los campos.'); return; }
    if (password.length < 8) { setError('La contrasena debe tener al menos 8 caracteres.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombre, empresa, pais })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al registrar.'); setLoading(false); return; }
      setOk('Cuenta creada. Ahora podes iniciar sesion.');
      setTab('login');
    } catch { setError('Error de conexion.'); }
    setLoading(false);
  };

  const inp = { width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '12px 16px', color: '#f8fafc', fontSize: 14, boxSizing: 'border-box' as const, outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'system-ui' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24, fontWeight: 900, color: 'white' }}>IP</div>
          <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: 24 }}>INGENIUM PRO</div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>v8.0 - Plataforma de Ingenieria Tecnica</div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32 }}>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[{ id: 'login', label: 'Iniciar Sesion' }, { id: 'registro', label: 'Registrarse' }].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id as 'login' | 'registro'); setError(''); setOk(''); }}
                style={{ flex: 1, padding: '10px', background: tab === t.id ? '#7c3aed' : '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>
                {t.label}
              </button>
            ))}
          </div>

          {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          {ok && <div style={{ background: '#0a2a1a', border: '1px solid #00e5a0', borderRadius: 8, padding: '10px 14px', color: '#00e5a0', fontSize: 13, marginBottom: 16 }}>{ok}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {tab === 'registro' && (
              <>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Nombre completo</label>
                  <input value={nombre} onChange={e => setNombre(e.target.value)} style={inp} placeholder="Ing. Juan Perez" />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Empresa</label>
                  <input value={empresa} onChange={e => setEmpresa(e.target.value)} style={inp} placeholder="YPF / TotalEnergies / etc." />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Pais</label>
                  <select value={pais} onChange={e => setPais(e.target.value)} style={{ ...inp, fontSize: 13 }}>
                    {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </>
            )}

            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder="ingeniero@empresa.com" />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Contrasena</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inp} placeholder="Minimo 8 caracteres" onKeyDown={e => { if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegistro(); }} />
            </div>

            <button onClick={tab === 'login' ? handleLogin : handleRegistro} disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', border: 'none', borderRadius: 10, padding: '14px', color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.6 : 1, marginTop: 8 }}>
              {loading ? 'Procesando...' : tab === 'login' ? 'INGRESAR' : 'CREAR CUENTA'}
            </button>

          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#334155', fontSize: 11, marginTop: 24 }}>
          INGENIUM PRO v8.0 - ASME - API - AWWA - Silvana Belen Colombo 2026
        </div>
      </div>
    </div>
  );
}