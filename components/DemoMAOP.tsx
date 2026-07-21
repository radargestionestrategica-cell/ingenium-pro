'use client';
// components/DemoMAOP.tsx
// Demo interactiva de la landing — mismo calcMAOP de ModuloPetroleo.tsx, sin login ni fetch.

import { useState } from 'react';

// Copiado tal cual de components/ModuloPetroleo.tsx — no modificar sin sincronizar ambas copias.
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

export default function DemoMAOP() {
  const [od, setOd]     = useState('16.00');
  const [t, setT]       = useState('0.375');
  const [smys, setSmys] = useState('52000');
  const [f, setF]       = useState('0.72');
  const [temp, setTemp] = useState('20');

  const r = calcMAOP(parseFloat(od), parseFloat(t), parseFloat(smys), parseFloat(f) || 0.72, 1.0, parseFloat(temp) || 20);

  return (
    <>
      <div className="preview-inputs">
        {[
          { lbl: 'SMYS (psi)',          val: smys, set: setSmys },
          { lbl: 'Diámetro ext. (in)',  val: od,   set: setOd   },
          { lbl: 'Espesor pared (in)',  val: t,    set: setT    },
          { lbl: 'Factor diseño F',     val: f,    set: setF    },
          { lbl: 'Factor junta E',      val: '1.00', set: undefined },
          { lbl: 'Temp. operación (°C)', val: temp, set: setTemp },
        ].map(({ lbl, val, set }) => (
          <div key={lbl} className="preview-field">
            <div className="preview-field-lbl">{lbl}</div>
            {set ? (
              <input
                value={val}
                onChange={e => set(e.target.value)}
                inputMode="decimal"
                aria-label={lbl}
              />
            ) : (
              <div className="preview-field-val">{val}</div>
            )}
          </div>
        ))}
      </div>

      <div className="preview-btn" style={{ opacity: 0.75, cursor: 'default' }}>
        ▶ RECALCULA EN VIVO AL EDITAR
      </div>

      <div className="preview-results">
        <div className="preview-res-card">
          <div className="preview-res-lbl">MAOP</div>
          <div className="preview-res-val">{r ? `${r.psi.toLocaleString()} psi` : '—'}</div>
          <div className="preview-res-sub">{r ? `${r.bar} bar` : 'Valores inválidos'}</div>
        </div>
        <div className="preview-res-card">
          <div className="preview-res-lbl">Régimen</div>
          <div className="preview-res-val" style={{ fontSize: 12 }}>{r ? r.reg.split(' —')[0] : '—'}</div>
          <div className="preview-res-sub">{r ? `t/OD: ${r.ratio}%` : '—'}</div>
        </div>
        <div className="preview-res-card">
          <div className="preview-res-lbl">Estado</div>
          <div className="preview-res-val" style={{ color: r ? RISK_COLOR[r.risk] : '#94a3b8' }}>{r ? r.risk : '—'}</div>
        </div>
      </div>

      <div className="preview-export-row">
        <div className="preview-exp-btn pdf">PDF</div>
        <div className="preview-exp-btn xls">Excel</div>
        <div className="preview-exp-btn dxf">DXF</div>
        <div className="preview-exp-btn qr">QR</div>
      </div>

      <div className="preview-norm-tag">
        {r ? r.formula : 'Ingresá valores válidos (espesor menor a OD/2)'}
      </div>
    </>
  );
}
