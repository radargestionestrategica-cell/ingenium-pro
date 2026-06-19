'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
const BG    = '#020609';
const GOLD  = '#E8A020';
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

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invitacion] = useState(() => searchParams.get('invitacion') ?? '');
  const [form, setForm] = useState({ email:'', password:'', nombre:'', empresa:'', pais:'', matricula:'', dni:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [aceptoCookies, setAceptoCookies]   = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    if (!aceptoTerminos || !aceptoCookies) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invitacion ? { ...form, invitacion } : form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al crear la cuenta'); return; }
      if (data.token) localStorage.setItem('ip_token', data.token);
      localStorage.setItem('ip_terminos_aceptados', '1');
      router.replace(data.redirect ?? '/planes');
    } catch {
      setError('Error de conexión. Verificá tu internet.');
    } finally {
      setLoading(false);
    }
  };

  const listo = aceptoTerminos && aceptoCookies;

  return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'Inter,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:420, background:PANEL, border:'1px solid rgba(99,102,241,0.2)', borderRadius:20, padding:36 }}>

        {/* LOGO */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg,${GOLD},#c47a10)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:24, color:BG, margin:'0 auto 12px' }}>Ω</div>
          <div style={{ fontWeight:900, fontSize:18, letterSpacing:2, color:'#f1f5f9' }}>INGENIUM PRO</div>
          <div style={{ fontSize:11, color:GOLD, letterSpacing:3, fontWeight:700 }}>COMENZAR DEMO GRATUITO</div>
        </div>

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
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Matrícula profesional (opcional)</label>
          <input name="matricula" value={form.matricula} onChange={handleChange} style={inp} placeholder="MP 12345 / REG-67890" />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>DNI / Documento de identidad (opcional)</label>
          <input name="dni" value={form.dni} onChange={handleChange} style={inp} placeholder="12.345.678" />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Correo electrónico</label>
          <input name="email" value={form.email} onChange={handleChange} style={inp} type="email" placeholder="ingeniero@empresa.com" autoComplete="email" />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>Contraseña</label>
          <div style={{ position:'relative' }}>
            <input name="password" value={form.password} onChange={handleChange}
              style={{ ...inp, paddingRight:44 }}
              type={verPass ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button onClick={() => setVerPass(v => !v)}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center' }}>
              <OjoIcono visible={verPass} />
            </button>
          </div>
        </div>

        {/* TÉRMINOS Y COOKIES */}
        <div style={{ marginBottom:18, display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { key:'terminos', checked:aceptoTerminos, set:setAceptoTerminos,
              label: <><a href="/terminos" target="_blank" rel="noopener noreferrer" style={{ color:GOLD, textDecoration:'underline' }}>Términos y Condiciones</a> — incluyendo el Protocolo de Exención de Responsabilidad Técnica</> },
            { key:'cookies', checked:aceptoCookies, set:setAceptoCookies,
              label: 'Política de Cookies — cookies de sesión para autenticación y preferencias' },
          ].map(({ key, checked, set, label }) => (
            <label key={key} onClick={() => set(v => !v)}
              style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'11px 14px', borderRadius:10, cursor:'pointer',
                background: checked ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${checked ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
              <div style={{ flexShrink:0, marginTop:1, width:18, height:18, borderRadius:5,
                border:`2px solid ${checked ? GREEN : '#334155'}`,
                background: checked ? GREEN : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#020609" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize:12, color:'#cbd5e1', lineHeight:1.5 }}>{label}</span>
            </label>
          ))}
        </div>

        {error && (
          <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:14, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', fontSize:13 }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || !listo}
          style={{ width:'100%', padding:'13px 0', border:'none', borderRadius:12, fontSize:15, fontWeight:800, letterSpacing:0.5,
            background: listo ? `linear-gradient(135deg,${GREEN},#16a34a)` : 'rgba(255,255,255,0.05)',
            color: listo ? BG : '#475569',
            cursor: loading || !listo ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creando cuenta...' : !listo ? 'Aceptá los términos para continuar' : 'Crear cuenta gratis →'}
        </button>

        <div style={{ marginTop:20, textAlign:'center', fontSize:12, color:'#475569' }}>
          ¿Ya tenés cuenta?{' '}
          <a href="/Login" style={{ color:GOLD, textDecoration:'none', fontWeight:700 }}>Ingresar →</a>
        </div>
      </div>
    </div>
  );
}
