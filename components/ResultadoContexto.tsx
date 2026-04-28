'use client';
// components/ResultadoContexto.tsx
// INGENIUM PRO v8.1 — Contexto global de resultado calculado
// Los módulos publican su resultado aquí via evento del navegador
// page.tsx escucha y muestra BotonesExportar automáticamente

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatosExportar } from '@/components/BotonesExportar';

interface ResultadoCtx {
  datos:   DatosExportar | null;
  limpiar: () => void;
}

const Ctx = createContext<ResultadoCtx>({ datos: null, limpiar: () => {} });

export function ResultadoProvider({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<DatosExportar | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<DatosExportar>).detail;
      if (d?.tipo && d?.resultado) setDatos(d);
    };
    window.addEventListener('ingenium:resultado', handler);
    return () => window.removeEventListener('ingenium:resultado', handler);
  }, []);

  return (
    <Ctx.Provider value={{ datos, limpiar: () => setDatos(null) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useResultado = () => useContext(Ctx);

// ── Función que cualquier módulo llama al calcular ──────────────
// Uso: publicarResultado({ tipo: 'MAOP', parametros: {...}, resultado: res })
export function publicarResultado(datos: DatosExportar) {
  window.dispatchEvent(new CustomEvent('ingenium:resultado', { detail: datos }));
} 