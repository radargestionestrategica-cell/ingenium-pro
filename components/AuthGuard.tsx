'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TerminosModal from './TerminosModal';

function decodePayload(t: string) {
  try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; }
}

type Estado = 'loading' | 'noterms' | 'ok';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('loading');

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem('ip_token');
      if (!token) { router.replace('/Login'); return; }

      const pl = decodePayload(token);
      if (pl && pl.plan === 'demo' && typeof pl.demoExpira === 'number' && Date.now() > pl.demoExpira) {
        router.replace('/planes'); return;
      }

      if (localStorage.getItem('ip_terminos_aceptados') !== '1') {
        setEstado('noterms');
        return;
      }

      setEstado('ok');
    };

    check();
    window.addEventListener('ip_terminos_aceptados', check);
    return () => window.removeEventListener('ip_terminos_aceptados', check);
  }, [router]);

  if (estado === 'loading') return null;
  if (estado === 'noterms') return <TerminosModal forzarVisible />;
  return <>{children}</>;
}
