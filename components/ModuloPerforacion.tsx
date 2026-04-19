'use client';
import { useState } from 'react';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

function calcBHP(TVD: number, mudWeight: number, cuttingsLoad = 0) {
  const hydrostaticPsi = 0.052 * mudWeight * TVD;
  const bhp = hydrostaticPsi + cuttingsLoad;
  const risk: RiskLevel = bhp > 10000 ? 'CRITICAL' : bhp > 7000 ? 'HIGH' : bhp > 4000 ? 'MEDIUM' : 'LOW';
  return { bhp: +bhp.toFixed(0), hydrostaticPsi: +hydrostaticPsi.toFixed(0), risk };
}

function calcFractureGradient(depth: number, overburdenGrad: number, poissonRatio = 0.25) {
  const fracGrad = (poissonRatio / (1 - poissonRatio)) * (overburdenGrad - 0.433) + 0.433;
  const fracPressure = fracGrad * depth;
  return { fracGrad: +fracGrad.toFixed(3), fracPressure: +fracPressure.toFixed(0) };
}

function calcMudWeight(porePresGrad: number, safetyFactor = 0.5) {
  const mudWeight = porePresGrad + safetyFactor;
  const ecd = mudWeight * 1.02;
  const risk: RiskLevel = mudWeight > 18 ? 'CRITICAL' : mudWeight > 15 ? 'HIGH' : mudWeight > 12 ? 'MEDIUM' : 'LOW';
  return { mudWeight: +mudWeight.toFixed(2), ecd: +ecd.toFixed(2), risk };
}

const riskColor: Record<RiskLevel, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<RiskLevel, string> = {
  LOW: 'SEGURO', MEDIUM: 'MONITOREAR', HIGH: 'REVISAR', CRITICAL: 'DETENER'
};

export default function ModuloPerforacion() {
  const [TVD, setTVD] = useState('3000');
  const [mudWeight, setMudWeight] = useState('10.5');
  const [overburden, setOverburden] = useState('1.0');
  const [poreGrad, setPoreGrad] = useState('0.433');
  const [res, setRes] = useState<null | {
    bhp: ReturnType<typeof calcBHP>;
    frac: ReturnType<typeof calcFractureGradient>;
    mud: ReturnType<typeof calcMudWeight>;
  }>(null);

  const calcular = () => {
    const tvd = parseFloat(TVD);
    const mw = parseFloat(mudWeight);
    const ob = parseFloat(overburden);
    const pg = parseFloat(poreGrad);
    if (isNaN(tvd) || isNaN(mw) || isNaN(ob) || isNaN(pg)) return;
    setRes({
      bhp: calcBHP(tvd, mw),
      frac: calcFractureGradient(tvd, ob),
      mud: calcMudWeight(pg),
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⛏️</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Perforacion</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>BHP - Gradiente Fractura - Peso de Lodo | API RP 13D</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: API RP 13D | API RP 7G | Presion de fondo real
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' }}>Parametros de Perforacion</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Profundidad TVD (ft)', val: TVD, set: setTVD, ph: '3000' },
              { label: 'Peso de lodo (ppg)', val: mudWeight, set: setMudWeight, ph: '10.5' },
              { label: 'Gradiente sobrecarga (psi/ft)', val: overburden, set: setOverburden, ph: '1.0' },
              { label: 'Gradiente poros (psi/ft)', val: poreGrad, set: setPoreGrad, ph: '0.433' },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f8fafc', fontSize: 15, boxSizing: 'border-box' as const }}
                  placeholder={f.ph} />
              </div>
            ))}
          </div>

          <button onClick={calcular}
            style={{ width: '100%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', borderRadius: 10, padding: '14px 0', color: '#000', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
            CALCULAR PERFORACION
          </button>
        </div>

        {res && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[res.bhp.risk]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados</div>
              <div style={{ background: riskColor[res.bhp.risk], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {riskLabel[res.bhp.risk]}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'BHP', value: `${res.bhp.bhp} psi`, sub: 'Presion de fondo' },
                { label: 'Hidrostatica', value: `${res.bhp.hydrostaticPsi} psi`, sub: 'Presion hidrostatica' },
                { label: 'Grad. Fractura', value: `${res.frac.fracGrad} psi/ft`, sub: 'Limite de fractura' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[res.bhp.risk], fontSize: 18, fontWeight: 800 }}>{r.value}</div>
                  <div style={{ color: '#475569', fontSize: 10 }}>{r.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>Peso lodo recomendado</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{res.mud.mudWeight} ppg</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>ECD</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{res.mud.ecd} ppg</div>
              </div>
            </div>

            <div style={{ marginTop: 16, background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#a78bfa', marginBottom: 4, fontWeight: 700 }}>NORMATIVA APLICADA:</div>
              API RP 13D - Reologia y Hidraulica | BHP = 0.052 x MW x TVD
              <div style={{ marginTop: 4, color: '#475569' }}>API RP 7G - Sarta de perforacion | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}