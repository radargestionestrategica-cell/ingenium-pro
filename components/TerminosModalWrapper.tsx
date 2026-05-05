'use client';
import { useState } from 'react';
import TerminosModal from './TerminosModal';

export default function TerminosModalWrapper() {
  const [mostrar] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('ip_token') &&
      localStorage.getItem('ip_terminos_aceptados') !== '1';
  });

  if (!mostrar) return null;
  return <TerminosModal />;
}
