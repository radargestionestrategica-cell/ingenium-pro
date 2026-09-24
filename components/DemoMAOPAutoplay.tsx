'use client';
// components/DemoMAOPAutoplay.tsx
// Version autoplay/loop de la demo MAOP para landing — decorativa, sin inputs editables.
// Se usa en la landing (app/page.tsx).

import { useEffect, useState } from 'react';
import { calcMAOP } from '@/lib/calculos';

const RISK_COLOR: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626',
};

// Valores de ejemplo en unidades imperiales (psi / in), como se muestran en pantalla.
// pop: presión de operación del ejemplo — el estado se evalúa como P_op / MAOP.
const EJEMPLO = { smys: 52000, od: 16.00, t: 0.375, f: 0.72, temp: 20, pop: 1200 };

// calcMAOP trabaja en MPa y mm (P se devuelve en MPa y de ahí salen bar y psi).
// Antes se le pasaban psi/in directo: Barlow devolvía 1755 (psi) y la función
// lo trataba como MPa → la landing mostraba 254.545 psi / 17.550 bar en vez de
// 1.755 psi / 121 bar. Se convierte a SI antes de calcular.
const PSI_A_MPA = 0.00689476;
const IN_A_MM   = 25.4;
const EJEMPLO_SI = {
  smys_MPa: EJEMPLO.smys * PSI_A_MPA,
  od_mm:    EJEMPLO.od * IN_A_MM,
  t_mm:     EJEMPLO.t * IN_A_MM,
  pop_MPa:  EJEMPLO.pop * PSI_A_MPA,
};

// Aviso visible permanente: el demo es decorativo y usa valores fijos.
const AVISO_ILUSTRATIVO =
  'Ejemplo ilustrativo con valores fijos — no es un cálculo real ni reemplaza un análisis de ingeniería.';

// Fórmula mostrada con los mismos valores imperiales que ve el usuario —
// Barlow es homogénea en unidades, con psi/in el resultado sale en psi.
const FORMULA_EJEMPLO =
  `Pb = (2 × ${EJEMPLO.smys} × ${EJEMPLO.t} × ${EJEMPLO.f} × 1.0 × 1.0) / ${EJEMPLO.od} psi`;

// Locale explícito: toLocaleString() sin argumento usa el locale del entorno
// (en-US en el servidor, el del navegador en el cliente) y rompe la hidratación (#418).
const fmt = (n: number) => n.toLocaleString('es-AR');

const CAMPOS = [
  { lbl: 'SMYS (psi)',           val: fmt(EJEMPLO.smys) },
  { lbl: 'Diámetro ext. (in)',   val: EJEMPLO.od.toFixed(2) },
  { lbl: 'Espesor pared (in)',   val: EJEMPLO.t.toFixed(3) },
  { lbl: 'Factor diseño F',      val: EJEMPLO.f.toFixed(2) },
  { lbl: 'Factor junta E',       val: '1.00' },
  { lbl: 'Temp. operación (°C)', val: String(EJEMPLO.temp) },
  { lbl: 'Presión operación (psi)', val: fmt(EJEMPLO.pop), ancho: true },
];

// ── Timeline del loop (ms) — timing pausado, transiciones CSS suaves ──────────
const TICK_MS           = 100;   // resolución del setInterval
const FIELD_DELAY_MS    = 550;   // pausa entre cada input que se completa
const FILL_MS           = FIELD_DELAY_MS * CAMPOS.length;
const PAUSA_PRE_RES_MS  = 500;   // pausa antes de mostrar el resultado
const RESULT_AT_MS      = FILL_MS + PAUSA_PRE_RES_MS;
const HOLD_MS           = 3000;  // resultado completo visible
const FADEOUT_START_MS  = RESULT_AT_MS + HOLD_MS;
const FADEOUT_MS        = 600;
const RESET_GAP_MS      = 500;   // pantalla vacía antes de reiniciar
const CICLO_TOTAL_MS    = FADEOUT_START_MS + FADEOUT_MS + RESET_GAP_MS;

export default function DemoMAOPAutoplay() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(e => (e + TICK_MS) % CICLO_TOTAL_MS);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const enReset          = elapsed >= FADEOUT_START_MS + FADEOUT_MS;
  const enFadeOut         = elapsed >= FADEOUT_START_MS && !enReset;
  const visible           = !enReset;
  const camposShown       = enReset ? 0 : Math.min(CAMPOS.length, Math.floor(elapsed / FIELD_DELAY_MS) + 1);
  const mostrarResultado  = !enReset && elapsed >= RESULT_AT_MS;

  const r = mostrarResultado
    ? calcMAOP(EJEMPLO_SI.od_mm, EJEMPLO_SI.t_mm, EJEMPLO_SI.smys_MPa, EJEMPLO.f, 1.0, EJEMPLO.temp, EJEMPLO_SI.pop_MPa)
    : null;

  return (
    <div>
      {/* Fuera del bloque animado: el aviso queda visible todo el ciclo */}
      <div
        role="note"
        style={{
          background: 'rgba(232,160,32,.08)', border: '1px solid rgba(232,160,32,.35)',
          borderRadius: 6, padding: '6px 10px', marginBottom: 12,
          fontSize: 10, fontWeight: 700, color: 'rgba(232,160,32,.9)', letterSpacing: .2,
        }}
      >
        ⓘ {AVISO_ILUSTRATIVO}
      </div>
    <div style={{ opacity: visible && !enFadeOut ? 1 : 0, transition: `opacity ${FADEOUT_MS}ms ease` }}>
      <div className="preview-inputs">
        {CAMPOS.map((c, i) => (
          <div
            key={c.lbl}
            className="preview-field"
            style={{
              opacity: i < camposShown ? 1 : 0,
              transform: i < camposShown ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity .45s ease, transform .45s ease',
              ...(c.ancho ? { gridColumn: '1 / -1' } : {}),
            }}
          >
            <div className="preview-field-lbl">{c.lbl}</div>
            <div className="preview-field-val">{i < camposShown ? c.val : ''}</div>
          </div>
        ))}
      </div>

      <div className="preview-btn" style={{ opacity: 0.75, cursor: 'default' }}>
        ▶ CALCULAR MAOP — ASME B31.8
      </div>

      <div
        className="preview-results"
        style={{
          opacity: mostrarResultado ? 1 : 0,
          transform: mostrarResultado ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity .5s ease, transform .5s ease',
        }}
      >
        <div className="preview-res-card">
          <div className="preview-res-lbl">MAOP</div>
          <div className="preview-res-val">{r ? `${fmt(r.psi)} psi` : '—'}</div>
          <div className="preview-res-sub">{r ? `${r.bar} bar` : ''}</div>
        </div>
        <div className="preview-res-card">
          <div className="preview-res-lbl">Régimen</div>
          <div className="preview-res-val" style={{ fontSize: 12 }}>{r ? r.reg.split(' —')[0] : '—'}</div>
          <div className="preview-res-sub">{r ? `t/OD: ${r.ratio}%` : ''}</div>
        </div>
        <div className="preview-res-card">
          <div className="preview-res-lbl">Estado</div>
          <div className="preview-res-val" style={{ color: r?.risk ? RISK_COLOR[r.risk] : '#94a3b8' }}>{r?.risk ?? '—'}</div>
          <div className="preview-res-sub">{r?.util_pct != null ? `P_op/MAOP: ${fmt(r.util_pct)}%` : ''}</div>
        </div>
      </div>

      <div className="preview-export-row" style={{ opacity: mostrarResultado ? 1 : 0, transition: 'opacity .5s ease' }}>
        <div className="preview-exp-btn pdf">PDF</div>
        <div className="preview-exp-btn xls">Excel</div>
        <div className="preview-exp-btn dxf">DXF</div>
        <div className="preview-exp-btn qr">QR</div>
      </div>

      <div className="preview-norm-tag" style={{ opacity: mostrarResultado ? 1 : 0, transition: 'opacity .5s ease' }}>
        {r ? (r.reg.startsWith('PARED DELGADA') ? FORMULA_EJEMPLO : r.formula) : 'ASME B31.8-2022 § 841.1.1'}
      </div>
    </div>
    </div>
  );
}
