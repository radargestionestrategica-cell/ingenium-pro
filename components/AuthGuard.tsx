'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TerminosModal from './TerminosModal';

function decodePayload(t: string) {
  try { return JSON.parse(atob(t.split('.')[0])); } catch { return null; }
}

type Estado = 'loading' | 'noterms' | 'ok';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('loading');

  useEffect(() => {
    const check = async () => {
      // Siempre consulta BD vía session endpoint — nunca confiar en token local
      // que puede tener plan=demo viejo aunque la BD tenga plan pagado.
      try {
        const res = await fetch('/api/v1/auth/session');
        if (!res.ok) { router.replace('/Login'); return; }
        const data = await res.json();
        if (!data.token) { router.replace('/Login'); return; }

        localStorage.setItem('ip_token', data.token);

        const pl = decodePayload(data.token);

        // Bypass administrador — acceso irrestricto independiente del plan
        if (pl?.email?.toLowerCase() === 'colombosilvanabelen@gmail.com') {
          setEstado('ok'); return;
        }

        if (
          pl &&
          (pl.plan === 'demo' || pl.plan === 'trial') &&
          typeof pl.demoExpira === 'number' &&
          Date.now() > pl.demoExpira
        ) {
          router.replace('/planes?demo=expired'); return;
        }

        if (localStorage.getItem('ip_terminos_aceptados') !== '1') {
          setEstado('noterms');
          return;
        }

        setEstado('ok');
      } catch {
        router.replace('/Login');
      }
    };

    check();
    window.addEventListener('ip_terminos_aceptados', check);
    return () => window.removeEventListener('ip_terminos_aceptados', check);
  }, [router]);

  if (estado === 'loading') return null;
  if (estado === 'noterms') return <TerminosModal forzarVisible />;
  return <>{children}</>;
}
