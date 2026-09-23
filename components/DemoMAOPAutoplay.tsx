'use client';
// components/DemoMAOPAutoplay.tsx
// Version autoplay/loop de la demo MAOP para landing — decorativa, sin inputs editables.
// Se usa en la landing (app/page.tsx).

import { useEffect, useState } from 'react';

// Copiado tal cual de components/ModuloPetroleo.tsx — no modificar sin sincronizar las copias.
function calcMAOP(OD: number, t: number, SMYS: number, F = 0.72, E = 1.0, T_op = 20) {
  if (OD <= 0 || t <= 0 || SMYS <= 0 || t >= OD / 2) return null;
  // Factor T — Tabla 841.1.18-1 de ASME B31.8 (valores: ≤120°C=1.0, ≤150°C=0.967, ≤175°C=0.933, ≤200°C=0.900, >200°C=0.867)
  const T_factor = T_op <= 120 ? 1.0 : T_op <= 150 ? 0.967 : T_op <= 175 ? 0.933 : T_op <= 200 ? 0.900 : 0.867;
  const ratio = t / OD;
  const ro = OD / 2, ri = ro - t;
  const Pb = (2 * SMYS * t * F * E * T_factor) / OD;
  const Pl = SMYS * F * E * T_factor * (ro ** 2 - ri ** 2) / (ro ** 2 + ri ** 2);
  const P  = ratio > 0.15 ? Pl : ratio > 0.10 ? Pb * (1 - (ratio - 0.10) / 0.05) + Pl * (ratio - 0.10) / 0.05 : Pb;
  const reg = ratio > 0.15 ? 'PARED GRUESA — Lamé (criterio conservador adicional, fuera de B31.8)' : ratio > 0.10 ? 'TRANSICIÓN' : 'PARED DELGADA — Barlow';
  const risk = P > 10 ? 'CRITICAL' : P > 7 ? 'HIGH' : P > 4 ? 'MEDIUM' : 'LOW';

  // Fórmula que refleja el régimen real aplicado
  const formula =
    ratio > 0.15
      ? `Pl = ${SMYS} × ${F} × ${E} × ${T_factor} × (${ro.toFixed(1)}² − ${ri.toFixed(1)}²) / (${ro.toFixed(1)}² + ${ri.toFixed(1)}²)`
      : ratio > 0.10
      ? `P = interpolación Barlow/Lamé (t/OD = ${(ratio * 100).toFixed(2)}%)`
      : `Pb = (2 × ${SMYS} × ${t} × ${F} × ${E} × ${T_factor}) / ${OD}`;

  return {
    P: +P.toFixed(3), bar: +(P * 10).toFixed(2), psi: +(P * 145.04).toFixed(0),
    ratio: +(ratio * 100).toFixed(2), reg, risk,
    T_factor: +T_factor.toFixed(3),
    formula,
  };
}

const RISK_COLOR: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626',
};

// Valores de ejemplo en unidades imperiales (psi / in), como se muestran en pantalla.
const EJEMPLO = { smys: 52000, od: 16.00, t: 0.375, f: 0.72, temp: 20 };

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
};

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
    ? calcMAOP(EJEMPLO_SI.od_mm, EJEMPLO_SI.t_mm, EJEMPLO_SI.smys_MPa, EJEMPLO.f, 1.0, EJEMPLO.temp)
    : null;

  return (
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
          <div className="preview-res-val" style={{ color: r ? RISK_COLOR[r.risk] : '#94a3b8' }}>{r ? r.risk : '—'}</div>
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
  );
}
