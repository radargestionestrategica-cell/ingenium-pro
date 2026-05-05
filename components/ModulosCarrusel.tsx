'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const GRAY  = '#64748b';
const WHITE = '#f1f5f9';

const PER  = 3;   // módulos visibles por página
const MS   = 3000; // ms autoplay

export interface ModuloItem {
  n:      string;
  nombre: string;
  desc:   string;
  norma:  string;
  color:  string;
  icon:   string;
  calcs:  number;
}

export default function ModulosCarrusel({ modulos }: { modulos: ModuloItem[] }) {
  const pages = Math.ceil(modulos.length / PER);  // 15 módulos / 3 = 5 páginas
  const [cur, setCur] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reinicia el timer de autoplay
  const arm = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setCur(c => (c + 1) % pages), MS);
  }, [pages]);

  useEffect(() => {
    arm();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [arm]);

  // Navega a la página i (con wrap) y reinicia el autoplay
  const go = useCallback((i: number) => {
    setCur(((i % pages) + pages) % pages);
    arm();
  }, [pages, arm]);

  return (
    <>
      {/* ── CSS del carrusel — puro, sin librerías ── */}
      <style>{`
        .mc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .mc-card {
          background: ${PANEL};
          border: 1px solid rgba(255,255,255,.05);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          position: relative;
          overflow: hidden;
          transition: transform .18s, border-color .2s, box-shadow .2s;
        }
        .mc-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(0,0,0,.35);
        }
        .mc-arrow {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(10,15,30,.92);
          border: 1px solid rgba(232,160,32,.25);
          color: ${GOLD};
          font-size: 26px;
          font-weight: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
          cursor: pointer;
          transition: background .2s, border-color .2s;
          line-height: 1;
          padding: 0;
          user-select: none;
        }
        .mc-arrow:hover {
          background: rgba(232,160,32,.12);
          border-color: rgba(232,160,32,.6);
        }
        .mc-dot {
          height: 8px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: width .35s ease, background .35s ease;
        }
        @media (max-width: 640px) {
          .mc-grid { grid-template-columns: 1fr; }
          .mc-arrow { width: 34px; height: 34px; font-size: 22px; }
        }
      `}</style>

      {/* ── Fila: flecha izq · viewport · flecha der ── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>

        {/* Flecha anterior */}
        <button
          className="mc-arrow"
          onClick={() => go(cur - 1)}
          aria-label="Módulos anteriores"
        >
          ‹
        </button>

        {/* Viewport con overflow:hidden */}
        <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          {/* Track deslizante */}
          <div style={{
            display: 'flex',
            width: `${pages * 100}%`,
            transform: `translateX(-${cur * (100 / pages)}%)`,
            transition: 'transform .5s cubic-bezier(.4,0,.2,1)',
          }}>
            {Array.from({ length: pages }, (_, pi) => (
              <div
                key={pi}
                className="mc-grid"
                style={{ width: `${100 / pages}%`, flexShrink: 0 }}
              >
                {modulos.slice(pi * PER, (pi + 1) * PER).map(m => (
                  <article
                    key={m.n}
                    className="mc-card"
                    style={{ borderLeft: `3px solid ${m.color}` }}
                  >
                    {/* Ícono */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 2, fontSize: 18,
                      background: `${m.color}12`,
                    }}>
                      {m.icon}
                    </div>

                    {/* Contenido */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 9, fontWeight: 900,
                        fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
                        color: GRAY, letterSpacing: 1, marginBottom: 2,
                      }}>
                        {m.n}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: WHITE, marginBottom: 5 }}>
                        {m.nombre}
                      </div>
                      <div style={{ fontSize: 12, color: GRAY, marginBottom: 8, lineHeight: 1.6 }}>
                        {m.desc}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{
                          fontSize: 10, fontWeight: 800,
                          fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
                          letterSpacing: .2, lineHeight: 1.5, flex: 1,
                          color: m.color,
                        }}>
                          {m.norma}
                        </div>
                        <div style={{
                          fontSize: 9, color: GRAY, fontWeight: 700, whiteSpace: 'nowrap',
                          padding: '3px 8px', borderRadius: 999,
                          background: 'rgba(255,255,255,.04)',
                          border: '1px solid rgba(255,255,255,.06)',
                        }}>
                          {m.calcs} cálcs.
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Flecha siguiente */}
        <button
          className="mc-arrow"
          onClick={() => go(cur + 1)}
          aria-label="Módulos siguientes"
        >
          ›
        </button>
      </div>

      {/* ── Indicadores de posición (dots) ── */}
      <div
        role="tablist"
        aria-label="Páginas de módulos"
        style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 22 }}
      >
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            role="tab"
            className="mc-dot"
            onClick={() => go(i)}
            aria-label={`Página ${i + 1} de ${pages}`}
            aria-selected={i === cur}
            style={{
              width: i === cur ? 24 : 8,
              background: i === cur ? GOLD : 'rgba(255,255,255,.2)',
            }}
          />
        ))}
      </div>
    </>
  );
}
