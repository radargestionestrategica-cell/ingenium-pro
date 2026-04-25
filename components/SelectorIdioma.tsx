'use client';
import { useState, useEffect } from 'react';
import { getLang, setLang as guardarLang, IDIOMAS, EVENTO_IDIOMA } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

// ═══════════════════════════════════════════════════════════════
//  SELECTOR DE IDIOMA — INGENIUM PRO v8.1
//  8 idiomas. Guarda en localStorage. Emite evento global.
//  Se agrega en el header de page.tsx y dashboard/page.tsx
// ═══════════════════════════════════════════════════════════════

export default function SelectorIdioma() {
  const [lang, setLangState] = useState<Lang>('es');
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    setLangState(getLang());
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Lang>;
      setLangState(ce.detail);
    };
    window.addEventListener(EVENTO_IDIOMA, handler);
    return () => window.removeEventListener(EVENTO_IDIOMA, handler);
  }, []);

  const cambiar = (l: Lang) => {
    guardarLang(l);
    setLangState(l);
    setAbierto(false);
  };

  const actual = IDIOMAS[lang];

  return (
    <div style={{ position: 'relative' }}>
      {/* BOTÓN ACTUAL */}
      <button
        onClick={() => setAbierto(!abierto)}
        title="Cambiar idioma / Change language"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px',
          background: '#0f172a', border: '1px solid #334155',
          borderRadius: 8, color: '#f1f5f9', cursor: 'pointer',
          fontSize: 12, fontWeight: 600,
        }}
      >
        <span style={{ fontSize: 16 }}>{actual.bandera}</span>
        <span style={{ fontSize: 11 }}>{actual.nativo}</span>
        <span style={{ fontSize: 9, color: '#475569' }}>▼</span>
      </button>

      {/* DROPDOWN */}
      {abierto && (
        <>
          {/* Overlay para cerrar */}
          <div
            onClick={() => setAbierto(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6,
            zIndex: 999, background: '#0f172a',
            border: '1px solid #1e293b', borderRadius: 12,
            padding: 6, minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}>
            {(Object.entries(IDIOMAS) as [Lang, typeof IDIOMAS[Lang]][]).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => cambiar(key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', border: 'none', borderRadius: 8,
                  background: lang === key ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: lang === key ? '#a78bfa' : '#94a3b8',
                  cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                  fontSize: 12,
                }}
              >
                <span style={{ fontSize: 18 }}>{meta.bandera}</span>
                <div>
                  <div style={{ fontWeight: lang === key ? 700 : 400 }}>{meta.nativo}</div>
                  <div style={{ fontSize: 9, color: '#475569' }}>{meta.nombre}</div>
                </div>
                {lang === key && <span style={{ marginLeft: 'auto', color: '#a78bfa', fontSize: 14 }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 