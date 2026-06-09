'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
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
  const risk: RiskLevel = mudWeight > 18 ? 'CRITICAL' : mudWeight > 15 ? 'HIGH' : mudWeight > 12 ? 'MEDIUM' : 'LOW';
  return { mudWeight: +mudWeight.toFixed(2), risk };
}

// API RP 13D — Bingham Plastic: PV, YP, velocidad anular, pérdida anular, ECD real
function calcHidraulica(Q: number, Dh: number, Dt: number, R600: number, R300: number, mw: number) {
  const PV = R600 - R300;                                                          // cP
  const YP = R300 - PV;                                                            // lbf/100 ft²
  const Va = (24.51 * Q) / (Dh * Dh - Dt * Dt);                                  // ft/min
  const Pa = (PV * Va) / (60000 * (Dh - Dt)) + YP / (200 * (Dh - Dt));          // psi/ft
  const ecd = mw + Pa / 0.052;                                                     // ppg
  return { PV: +PV.toFixed(1), YP: +YP.toFixed(1), Va: +Va.toFixed(1), Pa: +Pa.toFixed(4), ecd: +ecd.toFixed(2) };
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
  const [caudal, setCaudal] = useState('350');
  const [diamPozo, setDiamPozo] = useState('8.5');
  const [diamTuberia, setDiamTuberia] = useState('5');
  const [r600, setR600] = useState('60');
  const [r300, setR300] = useState('40');
  const [r3,   setR3]   = useState('5');
  const [modeloReologico, setModeloReologico] = useState('bingham');
  const [res, setRes] = useState<null | {
    bhp: ReturnType<typeof calcBHP>;
    frac: ReturnType<typeof calcFractureGradient>;
    mud: ReturnType<typeof calcMudWeight>;
    hid: ReturnType<typeof calcHidraulica>;
  }>(null);
  const [datos, setDatos] = useState<DatosExportar | null>(null);

  const calcular = () => {
    const tvd = parseFloat(TVD);
    const mw  = parseFloat(mudWeight);
    const ob  = parseFloat(overburden);
    const pg  = parseFloat(poreGrad);
    const Q   = parseFloat(caudal);
    const Dh  = parseFloat(diamPozo);
    const Dt  = parseFloat(diamTuberia);
    const R6  = parseFloat(r600);
    const R3  = parseFloat(r300);
    if ([tvd, mw, ob, pg, Q, Dh, Dt, R6, R3].some(isNaN)) return;
    const mudCalc = calcMudWeight(pg);
    const r = {
      bhp:  calcBHP(tvd, mw),
      frac: calcFractureGradient(tvd, ob),
      mud:  mudCalc,
      hid:  calcHidraulica(Q, Dh, Dt, R6, R3, mw),
    };
    setRes(r);
    const payload: DatosExportar = {
      tipo: 'PERFORACION',
      normativa: 'API RP 13D | API RP 7G',
      parametros: {
        'Profundidad TVD (ft)':              TVD,
        'Peso de lodo (ppg)':                mudWeight,
        'Gradiente sobrecarga (psi/ft)':     overburden,
        'Gradiente poros (psi/ft)':          poreGrad,
        'Caudal de bombeo (gpm)':            caudal,
        'Diámetro del pozo (pulg)':          diamPozo,
        'Diámetro exterior tubería (pulg)':  diamTuberia,
        'Viscosímetro 600 rpm (R600)':       r600,
        'Viscosímetro 300 rpm (R300)':       r300,
      },
      resultado: {
        'BHP (psi)':                         r.bhp.bhp,
        'Presion hidrostatica (psi)':        r.bhp.hydrostaticPsi,
        'Gradiente de fractura (psi/ft)':    r.frac.fracGrad,
        'Presion de fractura (psi)':         r.frac.fracPressure,
        'Peso lodo recomendado (ppg)':       r.mud.mudWeight,
        'VP - Viscosidad Plástica (cP)':     r.hid.PV,
        'YP - Punto de Cedencia (lbf/100ft²)': r.hid.YP,
        'Velocidad anular (ft/min)':         r.hid.Va,
        'Pérdida presión anular (psi/ft)':   r.hid.Pa,
        'ECD (ppg)':                         r.hid.ecd,
        'Estado BHP':                        r.bhp.risk,
        'Estado lodo':                       r.mud.risk,
      },
      dxfParams: {
        OD:   244.5,
        t:    11.05,
        L:    tvd * 0.3048,
        SMYS: 551,
        MAOP: r.frac.fracPressure * 0.006895,
        P_op: r.bhp.bhp * 0.006895,
      },
    };
    setDatos(payload);
    publicarResultado(payload);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⛏️</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Perforacion</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>BHP - Gradiente Fractura - Peso de Lodo - ECD Hidráulico | API RP 13D</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: API RP 13D | API RP 7G | ECD = MW + ΔP_anular / 0.052
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' }}>Parametros de Perforacion</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Modelo reológico</label>
            <select value={modeloReologico} onChange={e => setModeloReologico(e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f8fafc', fontSize: 15, boxSizing: 'border-box' as const }}>
              <option value="bingham">Bingham Plastic</option>
              <option value="powerlaw">Power Law</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Profundidad TVD (ft)', val: TVD, set: setTVD, ph: '3000' },
              { label: 'Peso de lodo (ppg)', val: mudWeight, set: setMudWeight, ph: '10.5' },
              { label: 'Gradiente sobrecarga (psi/ft)', val: overburden, set: setOverburden, ph: '1.0' },
              { label: 'Gradiente poros (psi/ft)', val: poreGrad, set: setPoreGrad, ph: '0.433' },
              { label: 'Caudal de bombeo (gpm)', val: caudal, set: setCaudal, ph: '350' },
              { label: 'Diámetro del pozo (pulg)', val: diamPozo, set: setDiamPozo, ph: '8.5' },
              { label: 'Diámetro exterior tubería (pulg)', val: diamTuberia, set: setDiamTuberia, ph: '5' },
              { label: 'Viscosímetro 600 rpm (R600)', val: r600, set: setR600, ph: '60' },
              { label: 'Viscosímetro 300 rpm (R300)', val: r300, set: setR300, ph: '40' },
              { label: 'Viscosímetro 3 rpm (R3)',     val: r3,   set: setR3,   ph: '5'  },
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>Peso lodo recomendado</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{res.mud.mudWeight} ppg</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>ECD Hidráulico (API RP 13D)</div>
                <div style={{ color: '#f59e0b', fontWeight: 700 }}>{res.hid.ecd} ppg</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>VP — Viscosidad Plástica</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{res.hid.PV} cP</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>YP — Punto de Cedencia</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{res.hid.YP} lbf/100ft²</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>Velocidad anular</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{res.hid.Va} ft/min</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#64748b', fontSize: 11 }}>Pérdida presión anular</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{res.hid.Pa} psi/ft</div>
              </div>
            </div>

            <div style={{ marginTop: 4, background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#a78bfa', marginBottom: 4, fontWeight: 700 }}>NORMATIVA APLICADA:</div>
              API RP 13D — Bingham Plastic | VP = R600 − R300 | YP = R300 − VP
              <div style={{ marginTop: 2 }}>Va = 24.51 × Q / (Dh² − Dt²) | ΔPa = VP·Va/(60000·ΔD) + YP/(200·ΔD)</div>
              <div style={{ marginTop: 2 }}>ECD = MW + ΔPa / 0.052</div>
              <div style={{ marginTop: 4, color: '#475569' }}>API RP 7G — Sarta de perforacion | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}
        {datos && <BotonesExportar visible={true} datos={datos} />}
      </div>
    </div>
  );
}
