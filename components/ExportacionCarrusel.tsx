'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

const PANEL = '#0a0f1e';
const GRAY  = '#64748b';
const WHITE = '#f1f5f9';
const MS    = 3000;

interface SlideData {
  id:        string;
  color:     string;
  icon:      string;
  label:     string;
  titulo:    string;
  subtitulo: string;
  badge:     string;
}

const SLIDES: SlideData[] = [
  {
    id: 'pdf', color: '#FF4560', icon: '📄', label: 'PDF',
    titulo:    'PDF con QR verificable',
    subtitulo: 'Resultado firmado digitalmente. Escaneable 3 años después.',
    badge:     'ASME B16.34 · ISA 75.01.01',
  },
  {
    id: 'excel', color: '#00E5A0', icon: '📊', label: 'Excel',
    titulo:    'Excel con fórmulas reales',
    subtitulo: 'Celdas vivas. El ingeniero modifica y recalcula.',
    badge:     'IEC 60534 · API 6D',
  },
  {
    id: 'dxf', color: '#E8A020', icon: '📐', label: 'DXF CAD',
    titulo:    'Plano DXF para fabricación',
    subtitulo: 'Entregable directo al tornero. Sin AutoCAD.',
    badge:     'ASME B16.10 · API 600',
  },
  {
    id: 'qr', color: '#A78BFA', icon: '🔍', label: 'QR',
    titulo:    'QR verificable en obra',
    subtitulo: 'El inspector escanea y ve el cálculo original.',
    badge:     'Trazabilidad 3 años',
  },
];

// ── Mockup: PDF ──────────────────────────────────────────────────
function MockupPDF() {
  const filas: [string, string][] = [
    ['DN / NPS',    '100 mm / 4"'],
    ['Cara a cara', '229 mm'],
    ['Coef. Cv',    '37.68'],
    ['P máx',       '2.00 MPa'],
    ['Estado',      '✓ APROBADO'],
  ];
  return (
    <div style={{
      background: '#f8fafc', borderRadius: 10, padding: '14px 16px',
      fontFamily: 'ui-monospace,SFMono-Regular,monospace',
      color: '#1e293b', position: 'relative', minHeight: 190,
      border: '1px solid #e2e8f0', boxShadow: '0 6px 32px rgba(0,0,0,.55)',
    }}>
      <div style={{ borderBottom: '2px solid #6366f1', marginBottom: 10, paddingBottom: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 900, color: '#6366f1', fontSize: 10 }}>INGENIUM PRO</span>
        <span style={{ color: '#94a3b8', fontSize: 8 }}>v8.1 · VERIFICADO</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 10, color: '#0f172a', marginBottom: 4 }}>Válvula Globo DN100 · Clase 300</div>
      <div style={{ color: '#6366f1', fontSize: 8, marginBottom: 10 }}>ASME B16.34 · ISA 75.01.01</div>
      {filas.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '3px 0', fontSize: 9 }}>
          <span style={{ color: '#64748b' }}>{k}</span>
          <span style={{ fontWeight: 700, color: k === 'Estado' ? '#16a34a' : '#0f172a' }}>{v}</span>
        </div>
      ))}
      {/* QR corner */}
      <div style={{
        position: 'absolute', bottom: 10, right: 10,
        width: 46, height: 46, background: '#0f172a',
        borderRadius: 4, border: '1px solid #6366f1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 22 22" width="36" height="36">
          <rect x="1" y="1" width="8" height="8" fill="none" stroke="#6366f1" strokeWidth="1"/>
          <rect x="3" y="3" width="4" height="4" fill="#6366f1"/>
          <rect x="13" y="1" width="8" height="8" fill="none" stroke="#6366f1" strokeWidth="1"/>
          <rect x="15" y="3" width="4" height="4" fill="#6366f1"/>
          <rect x="1" y="13" width="8" height="8" fill="none" stroke="#6366f1" strokeWidth="1"/>
          <rect x="3" y="15" width="4" height="4" fill="#6366f1"/>
          <rect x="11" y="11" width="2" height="2" fill="#6366f1"/>
          <rect x="14" y="12" width="2" height="2" fill="#6366f1"/>
          <rect x="12" y="15" width="2" height="2" fill="#6366f1"/>
          <rect x="16" y="16" width="2" height="2" fill="#6366f1"/>
          <rect x="11" y="18" width="2" height="2" fill="#6366f1"/>
        </svg>
      </div>
    </div>
  );
}

// ── Mockup: Excel ────────────────────────────────────────────────
function MockupExcel() {
  const rows: [string, string, string][] = [
    ['DN',    '100',   'mm'],
    ['Clase', '300',   '—'],
    ['Cv',    '37.68', 'm³/h'],
    ['P_max', '2.00',  'MPa'],
    ['F2F',   '229',   'mm'],
  ];
  return (
    <div style={{
      background: '#0a1628', borderRadius: 10, overflow: 'hidden',
      border: '1px solid rgba(0,229,160,.25)', boxShadow: '0 6px 32px rgba(0,0,0,.55)',
      fontFamily: 'ui-monospace,SFMono-Regular,monospace',
    }}>
      <div style={{ background: '#071020', padding: '5px 10px', display: 'flex', gap: 6 }}>
        {['1.Datos', '2.Hist.', '3.Fórmulas', '4.Vida útil'].map((t, i) => (
          <div key={t} style={{
            fontSize: 8, padding: '2px 7px', borderRadius: 3,
            background:   i === 0 ? 'rgba(0,229,160,.15)' : 'transparent',
            color:        i === 0 ? '#00E5A0' : GRAY,
            border:       i === 0 ? '1px solid rgba(0,229,160,.3)' : '1px solid transparent',
          }}>{t}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'rgba(0,229,160,.12)', padding: '5px 12px', borderBottom: '1px solid rgba(0,229,160,.2)' }}>
        {['Parámetro', 'Valor', 'Unidad'].map(h => (
          <div key={h} style={{ fontSize: 8, fontWeight: 700, color: '#00E5A0' }}>{h}</div>
        ))}
      </div>
      {rows.map(([k, v, u], i) => (
        <div key={k} style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          padding: '5px 12px',
          background: i % 2 === 0 ? 'rgba(255,255,255,.025)' : 'transparent',
          borderBottom: '1px solid rgba(255,255,255,.04)',
        }}>
          <div style={{ fontSize: 9, color: GRAY }}>{k}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#00E5A0' }}>{v}</div>
          <div style={{ fontSize: 9, color: '#475569' }}>{u}</div>
        </div>
      ))}
      <div style={{ padding: '5px 12px', fontSize: 7.5, color: '#1e3a5f' }}>IEC 60534 · API 6D · ASME B16.34</div>
    </div>
  );
}

// ── Mockup: DXF — válvula globo ──────────────────────────────────
function MockupDXF() {
  return (
    <div style={{
      background: '#050e1a', borderRadius: 10, padding: 8,
      border: '1px solid rgba(232,160,32,.3)', boxShadow: '0 6px 32px rgba(0,0,0,.55)',
    }}>
      <svg viewBox="0 0 320 190" style={{ width: '100%', display: 'block' }}>
        <rect width="320" height="190" fill="#060e1a"/>
        {/* Centerlines */}
        <line x1="0" y1="90" x2="320" y2="90" stroke="#0d2040" strokeWidth="0.5" strokeDasharray="5,4"/>
        <line x1="160" y1="0" x2="160" y2="175" stroke="#0d2040" strokeWidth="0.5" strokeDasharray="5,4"/>
        {/* Left flange */}
        <rect x="6" y="64" width="13" height="52" fill="#081520" stroke="#E8A020" strokeWidth="1.2"/>
        {/* Right flange */}
        <rect x="301" y="64" width="13" height="52" fill="#081520" stroke="#E8A020" strokeWidth="1.2"/>
        {/* Left bore */}
        <rect x="19" y="83" width="96" height="14" fill="#081520" stroke="#E8A020" strokeWidth="1"/>
        {/* Right bore */}
        <rect x="205" y="83" width="96" height="14" fill="#081520" stroke="#E8A020" strokeWidth="1"/>
        {/* Body circle */}
        <circle cx="160" cy="90" r="46" fill="#081520" stroke="#E8A020" strokeWidth="1.5"/>
        {/* Seat ring */}
        <line x1="132" y1="90" x2="188" y2="90" stroke="#E8A020" strokeWidth="1"/>
        {/* Disc — diamond */}
        <polygon points="160,78 174,90 160,102 146,90" fill="none" stroke="#E8A020" strokeWidth="1"/>
        {/* Bonnet */}
        <rect x="148" y="31" width="24" height="59" fill="#081520" stroke="#E8A020" strokeWidth="1"/>
        {/* Gland */}
        <line x1="148" y1="44" x2="172" y2="44" stroke="#E8A020" strokeWidth="0.7" strokeDasharray="3,2"/>
        {/* Stem */}
        <line x1="160" y1="31" x2="160" y2="7" stroke="#E8A020" strokeWidth="1.5"/>
        {/* Handwheel */}
        <line x1="133" y1="7" x2="187" y2="7" stroke="#E8A020" strokeWidth="2.5"/>
        <line x1="160" y1="7" x2="160" y2="1" stroke="#E8A020" strokeWidth="2"/>
        <line x1="143" y1="12" x2="177" y2="12" stroke="#E8A020" strokeWidth="1.5"/>
        {/* Dimension line */}
        <line x1="6" y1="160" x2="314" y2="160" stroke="#E8A020" strokeWidth="0.8"/>
        <polygon points="6,160 13,157 13,163" fill="#E8A020"/>
        <polygon points="314,160 307,157 307,163" fill="#E8A020"/>
        <line x1="6" y1="152" x2="6" y2="168" stroke="#E8A020" strokeWidth="0.8"/>
        <line x1="314" y1="152" x2="314" y2="168" stroke="#E8A020" strokeWidth="0.8"/>
        <text x="160" y="176" textAnchor="middle" fill="#E8A020" fontSize={9} fontFamily="Courier New, monospace">L = 229 mm  ·  ASME B16.10</text>
        {/* DN annotation */}
        <line x1="284" y1="64" x2="284" y2="116" stroke="#E8A020" strokeWidth="0.8"/>
        <polygon points="284,64 281,72 287,72" fill="#E8A020"/>
        <polygon points="284,116 281,108 287,108" fill="#E8A020"/>
        <text x="297" y="93" textAnchor="middle" fill="#E8A020" fontSize={8} fontFamily="Courier New, monospace" transform="rotate(90,297,93)">DN 100</text>
        {/* Title block */}
        <rect x="1" y="1" width="102" height="24" fill="none" stroke="#E8A020" strokeWidth="0.5"/>
        <text x="5" y="11" fill="#E8A020" fontSize={7.5} fontFamily="Courier New, monospace" fontWeight="bold">INGENIUM PRO</text>
        <text x="5" y="21" fill="#c47a10" fontSize={6.5} fontFamily="Courier New, monospace">VÁLVULA GLOBO · CL300</text>
      </svg>
    </div>
  );
}

// ── Mockup: QR ───────────────────────────────────────────────────
function MockupQR() {
  const S = 9;
  const cells: number[][] = [
    [1,1,1,1,1,1,1,0,0,1,1],
    [1,0,0,0,0,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,0,1],
    [0,0,0,1,0,0,0,1,0,1,0],
    [1,1,0,0,1,1,0,1,1,0,1],
    [0,1,0,1,0,1,1,0,0,1,1],
    [1,0,1,0,1,0,0,1,0,0,1],
    [1,1,0,1,1,0,1,0,1,1,0],
  ];
  const N = cells.length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        background: '#0c0620', borderRadius: 14, padding: 12,
        border: '2px solid #A78BFA',
        boxShadow: '0 0 32px rgba(167,139,250,.3)',
      }}>
        <svg viewBox={`0 0 ${N * S} ${N * S}`} width={N * S} height={N * S} style={{ display: 'block' }}>
          {cells.flatMap((row, r) =>
            row.map((v, c) =>
              v ? (
                <rect key={`${r}-${c}`} x={c * S} y={r * S} width={S - 1} height={S - 1} fill="#A78BFA" rx={1}/>
              ) : null
            )
          )}
        </svg>
      </div>
      <div style={{ fontSize: 9, color: '#A78BFA', fontFamily: 'ui-monospace,SFMono-Regular,monospace', letterSpacing: 0.3 }}>
        ingeniumpro.store/verify/sha256...
      </div>
      <div style={{ fontSize: 8, color: GRAY, textAlign: 'center' }}>Escaneable 3 años después de emitido</div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function renderMockup(id: string) {
  if (id === 'pdf')   return <MockupPDF />;
  if (id === 'excel') return <MockupExcel />;
  if (id === 'dxf')   return <MockupDXF />;
  return <MockupQR />;
}

// ── Main component ───────────────────────────────────────────────
export default function ExportacionCarrusel() {
  const [cur, setCur] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = SLIDES.length;

  const arm = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setCur(c => (c + 1) % total), MS);
  }, [total]);

  useEffect(() => {
    arm();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [arm]);

  const go = useCallback((i: number) => {
    setCur(((i % total) + total) % total);
    arm();
  }, [total, arm]);

  const s = SLIDES[cur];

  return (
    <>
      <style>{`
        .ec2-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }
        .ec2-arrow {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04);
          color: ${WHITE};
          font-size: 22px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background .2s, border-color .2s;
          line-height: 1; padding: 0; flex-shrink: 0;
          user-select: none;
        }
        .ec2-arrow:hover {
          background: rgba(255,255,255,.1);
          border-color: rgba(255,255,255,.25);
        }
        .ec2-dot {
          height: 6px; border-radius: 999px;
          border: none; cursor: pointer; padding: 0;
          transition: width .35s ease, background .35s ease;
        }
        @media (max-width: 700px) {
          .ec2-inner { grid-template-columns: 1fr; gap: 22px; }
        }
      `}</style>

      {/* Viewport */}
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          width: `${total * 100}%`,
          transform: `translateX(-${cur * (100 / total)}%)`,
          transition: 'transform .5s cubic-bezier(.4,0,.2,1)',
        }}>
          {SLIDES.map((slide) => (
            <div key={slide.id} style={{ width: `${100 / total}%`, flexShrink: 0 }}>
              <div style={{
                background: PANEL,
                borderRadius: 20,
                overflow: 'hidden',
                border: `1px solid ${slide.color}22`,
              }}>
                {/* Color accent bar */}
                <div style={{ height: 3, background: slide.color }}/>

                <div style={{ padding: '32px 36px' }}>
                  <div className="ec2-inner">

                    {/* LEFT — info */}
                    <div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 12px', borderRadius: 999, marginBottom: 20,
                        background: `${slide.color}14`,
                        border: `1px solid ${slide.color}40`,
                        fontSize: 11, fontWeight: 800, color: slide.color,
                        fontFamily: 'ui-monospace,SFMono-Regular,monospace',
                        letterSpacing: 1, textTransform: 'uppercase' as const,
                      }}>
                        {slide.icon} {slide.label}
                      </div>

                      <div style={{ fontSize: 'clamp(18px,2.4vw,26px)', fontWeight: 900, color: WHITE, lineHeight: 1.25, marginBottom: 12 }}>
                        {slide.titulo}
                      </div>

                      <div style={{ fontSize: 14, color: GRAY, lineHeight: 1.75, marginBottom: 24 }}>
                        {slide.subtitulo}
                      </div>

                      <div style={{
                        display: 'inline-block',
                        padding: '5px 12px', borderRadius: 8,
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(255,255,255,.08)',
                        fontSize: 10, fontWeight: 800, color: slide.color,
                        fontFamily: 'ui-monospace,SFMono-Regular,monospace',
                        letterSpacing: .5,
                      }}>
                        {slide.badge}
                      </div>
                    </div>

                    {/* RIGHT — mockup */}
                    <div>
                      {renderMockup(slide.id)}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }}>
        <button className="ec2-arrow" onClick={() => go(cur - 1)} aria-label="Slide anterior">‹</button>

        <div style={{ display: 'flex', gap: 7 }}>
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              className="ec2-dot"
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}: ${slide.titulo}`}
              style={{
                width:      i === cur ? 22 : 7,
                background: i === cur ? s.color : 'rgba(255,255,255,.18)',
              }}
            />
          ))}
        </div>

        <button className="ec2-arrow" onClick={() => go(cur + 1)} aria-label="Slide siguiente">›</button>

        <div style={{ marginLeft: 6, fontSize: 12, color: GRAY, fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>
          {cur + 1} / {total}
        </div>
      </div>
    </>
  );
}
