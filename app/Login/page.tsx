'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

const inp: React.CSSProperties = { width:'100%', padding:'12px 14px', background:'#0a0f1e', border:'1px solid rgba(99,102,241,0.3)', borderRadius:10, color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box' };
const lbl: React.CSSProperties = { display:'block', fontSize:11, fontWeight:600, color:'#64748b', marginBottom:6, letterSpacing:0.5, textTransform:'uppercase' };
const BG = '#020609';
const GOLD = '#E8A020';
const GREEN = '#22c55e';
const PANEL = '#0a0f1e';

function OjoIcono({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ email:'', password:'', nombre:'', empresa:'', pais:'' });
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

      if (!res.ok) {
        setError(data.error || 'Error al procesar la solicitud');
        return;
      }

      if (modo === 'login') {
        // GUARDAR TOKEN Y USUARIO EN localStorage
        localStorage.setItem('ip_token', data.token);
        localStorage.setItem('ip_usuario', JSON.stringify(data.usuario));
        // Redirigir al dashboard
        router.replace('/dashboard');
      } else {
        setExito('Cuenta creada. Podés iniciar sesión ahora.');
        setModo('login');
        setForm({ email: form.email, password:'', nombre:'', empresa:'', pais:'' });
      }
    } catch {
      setError('Error de conexión. Verificá tu internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'Inter,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:420, background:PANEL, border:'1px solid rgba(99,102,241,0.2)', borderRadius:20, padding:36 }}>

        {/* LOGO */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg,${GOLD},#c47a10)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:24, color:BG, margin:'0 auto 12px' }}>Ω</div>
          <div style={{ fontWeight:900, fontSize:18, letterSpacing:2, color:'#f1f5f9' }}>INGENIUM PRO</div>
          <div style={{ fontSize:11, color:GOLD, letterSpacing:3, fontWeight:700 }}>PLATAFORMA TÉCNICA PROFESIONAL</div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex', background:'#070d1a', borderRadius:10, padding:4, marginBottom:24 }}>
          {(['login','signup'] as const).map(m => (
            <button key={m} onClick={() => { setModo(m); setError(''); setExito(''); }}
              style={{ flex:1, padding:'9px 0', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700, background: modo===m ? `linear-gradient(135deg,${GOLD},#c47a10)` : 'transparent', color: modo===m ? BG : '#475569' }}>
              {m === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        {/* SIGNUP FIELDS */}
        {modo === 'signup' && (
          <>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Nombre completo</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} style={inp} placeholder="Ing. Juan García" />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Empresa</label>
              <input name="empresa" value={form.empresa} onChange={handleChange} style={inp} placeholder="Tu empresa" />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>País</label>
              <select name="pais" value={form.pais} onChange={handleChange} style={inp}>
                <option value="" style={{ background:PANEL }}>Seleccioná tu país</option>
                {PAISES.map(p => <option key={p} value={p} style={{ background:PANEL }}>{p}</option>)}
              </select>
            </div>
          </>
        )}

        {/* EMAIL */}
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Correo electrónico</label>
          <input name="email" value={form.email} onChange={handleChange} style={inp} type="email" placeholder="ingeniero@empresa.com" autoComplete="email" />
        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>Contraseña</label>
          <div style={{ position:'relative' }}>
            <input name="password" value={form.password} onChange={handleChange}
              style={{ ...inp, paddingRight:44 }}
              type={verPass ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button onClick={() => setVerPass(v => !v)}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center' }}>
              <OjoIcono visible={verPass} />
            </button>
          </div>
        </div>

        {/* ERROR / ÉXITO */}
        {error && (
          <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:14, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', fontSize:13 }}>
            {error}
          </div>
        )}
        {exito && (
          <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:14, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.3)', color:GREEN, fontSize:13 }}>
            {exito}
          </div>
        )}

        {/* BOTÓN */}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width:'100%', padding:'13px 0', background:`linear-gradient(135deg,${GOLD},#c47a10)`, border:'none', borderRadius:12, color:BG, fontSize:15, fontWeight:800, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing:0.5 }}>
          {loading ? 'Procesando...' : modo === 'login' ? 'Ingresar →' : 'Crear cuenta →'}
        </button>

        {/* FOOTER */}
        <div style={{ marginTop:20, textAlign:'center', fontSize:11, color:'#334155' }}>
          <a href="/terminos" style={{ color:'#475569', textDecoration:'none' }}>Términos</a>
          {' · '}
          <a href="mailto:silvana@radargestion.com" style={{ color:'#475569', textDecoration:'none' }}>Soporte</a>
        </div>
      </div>
    </div>
  );
} 