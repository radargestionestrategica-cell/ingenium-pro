'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function decodePayload(t:string){try{return JSON.parse(atob(t.split('.')[1]))}catch{return null}}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ip_token');
    const pl=decodePayload(token)
    if(pl&&pl.plan==='demo'&&typeof pl.demoExpira==='number'&&Date.now()>pl.demoExpira){router.replace('/planes');return}
    if (!token) {
      router.replace('/Login');
    } else {
      setVerificado(true);
    }
  }, [router]);

  if (!verificado) return null;
  return <>{children}</>;
} 