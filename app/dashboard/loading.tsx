// app/dashboard/loading.tsx
// Boundary de Suspense para la navegación a /dashboard (Next.js App Router).
// Sin este archivo, la transición cliente (p.ej. router.push('/dashboard') desde
// /planes tras activar la demo) no muestra ningún feedback mientras se resuelve
// el RSC payload del dashboard — la pantalla anterior queda congelada varios
// segundos y parece que el click no hizo nada.

const BG   = '#020609';
const GOLD = '#E8A020';

export default function DashboardLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        fontFamily: 'Inter,sans-serif',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(232,160,32,0.2)',
          borderTopColor: GOLD,
          animation: 'ip-spin 0.8s linear infinite',
        }}
      />
      <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>
        Preparando tu panel...
      </div>
      <style>{`@keyframes ip-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
