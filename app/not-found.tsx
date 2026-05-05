import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#020609',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter,sans-serif',
      color: '#f1f5f9',
      padding: 24,
    }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#E8A020', letterSpacing: 3, marginBottom: 32 }}>
        Ω INGENIUM PRO
      </div>
      <div style={{
        fontSize: 96, fontWeight: 900, color: '#E8A020',
        lineHeight: 1, letterSpacing: -4,
      }}>
        404
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 16, color: '#f1f5f9' }}>
        Página no encontrada
      </div>
      <div style={{ fontSize: 14, color: '#475569', marginTop: 10, textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
        La ruta que buscás no existe o fue movida.
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
        <Link
          href="/"
          style={{
            background: 'linear-gradient(135deg,#E8A020,#c47a10)',
            padding: '12px 28px', borderRadius: 10,
            color: '#020609', fontWeight: 800,
            textDecoration: 'none', fontSize: 14,
          }}
        >
          ← Inicio
        </Link>
        <Link
          href="/Login"
          style={{
            background: 'transparent',
            border: '1px solid rgba(99,102,241,0.4)',
            padding: '12px 28px', borderRadius: 10,
            color: '#6366f1', fontWeight: 700,
            textDecoration: 'none', fontSize: 14,
          }}
        >
          Ingresar
        </Link>
      </div>
    </div>
  );
}
