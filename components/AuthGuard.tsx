'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ═══════════════════════════════════════════════════════════════
//  AUTH GUARD — INGENIUM PRO v8.1
//  Protección de rutas lado cliente.
//  Lee localStorage — mismo sistema de auth existente.
//  Si no hay sesión válida → redirige a /Login automáticamente.
//  Uso: envolver cualquier página con <AuthGuard>{children}</AuthGuard>
// ═══════════════════════════════════════════════════════════════

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [verificado, setVerificado] = useState(false);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const verificarSesion = () => {
      try {
        const stored = localStorage.getItem('ingenium_usuario');

        // No hay dato en localStorage → no hay sesión
        if (!stored) {
          router.replace('/Login');
          return;
        }

        // Intentar parsear el dato
        const usuario = JSON.parse(stored);

        // Verificar que el objeto tiene los campos mínimos requeridos
        if (
          !usuario ||
          typeof usuario !== 'object' ||
          !usuario.email ||
          !usuario.nombre
        ) {
          // Dato corrupto o incompleto → limpiar y redirigir
          localStorage.removeItem('ingenium_usuario');
          router.replace('/Login');
          return;
        }

        // Verificar que la cuenta está activa
        if (usuario.activo === false) {
          localStorage.removeItem('ingenium_usuario');
          router.replace('/Login');
          return;
        }

        // Sesión válida
        setAutorizado(true);
      } catch {
        // Error al parsear → limpiar y redirigir
        localStorage.removeItem('ingenium_usuario');
        router.replace('/Login');
      } finally {
        setVerificado(true);
      }
    };

    verificarSesion();
  }, [router]);

  // Mientras verifica — pantalla de carga
  if (!verificado) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#070d1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 13,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 18,
          color: '#fff',
        }}>
          IP
        </div>
        <div style={{ color: '#475569', fontSize: 13 }}>
          Verificando sesión...
        </div>
      </div>
    );
  }

  // No autorizado — no renderiza nada (el redirect ya se ejecutó)
  if (!autorizado) return null;

  // Autorizado — renderiza la página normalmente
  return <>{children}</>;
} 