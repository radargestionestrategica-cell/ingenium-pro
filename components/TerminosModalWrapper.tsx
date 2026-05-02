'use client';
import { useState, useEffect } from 'react';
import TerminosModal from './TerminosModal';

export default function TerminosModalWrapper() {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    setMostrar(
      typeof window !== 'undefined' &&
      localStorage.getItem('ip_terminos_aceptados') !== '1'
    );
  }, []);

  if (!mostrar) return null;
  return <TerminosModal />;
}
