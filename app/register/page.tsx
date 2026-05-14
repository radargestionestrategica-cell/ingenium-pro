'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/Login?modo=signup');
  }, [router]);
  return null;
}
