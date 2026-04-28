'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import { useState } from 'react';

// RMR - Rock Mass Rating (Bieniawski 1989)
// Referencia: Bieniawski Z.T. (1989) Engineering Rock Mass Classifications
function calcRMR(
  ucs: number, // Resistencia compresion uniaxial (MPa)
  rqd: number, // Rock Quality Designation (%)
  espaciado: number, // Espaciado discontinuidades (mm)
  condicion: string, // Condicion de discontinuidades
  agua: string, // Condicion agua subterranea
  orientacion: string // Orientacion discontinuidades
): { rmr: number; clase: string; descripcion: string; soporte: string; riesgo: string } {

  // Parametro 1: Resistencia compresion uniaxial
  let p1 = 0;
  if (ucs > 250) p1 = 15;
  else if (ucs > 100) p1 = 12;
  else if (ucs > 50) p1 = 7;
  else if (ucs > 25) p1 = 4;
  else if (ucs > 5) p1 = 2;
  else if (ucs > 1) p1 = 1;

  // Parametro 2: RQD
  let p2 = 0;
  if (rqd > 90) p2 = 20;
  else if (rqd > 75) p2 = 17;
  else if (rqd > 50) p2 = 13;
  else if (rqd > 25) p2 = 8;
  else p2 = 3;

  // Parametro 3: Espaciado discontinuidades
  let p3 = 0;
  if (espaciado > 2000) p3 = 20;
  else if (espaciado > 600) p3 = 15;
  else if (espaciado > 200) p3 = 10;
  else if (espaciado > 60) p3 = 8;
  else p3 = 5;

  // Parametro 4: Condicion discontinuidades
  const condMap: Record<string, number> = {
    muy_buena: 30, buena: 25, regular: 20, mala: 10, muy_mala: 0
  };
  const p4 = condMap[condicion] ?? 20;

  // Parametro 5: Agua subterranea
  const aguaMap: Record<string, number> = {
    seco: 15, humedo: 10, mojado: 7, goteo: 4, flujo: 0
  };
  const p5 = aguaMap[agua] ?? 10;

  // Ajuste orientacion
  const orientMap: Record<string, number> = {
    muy_favorable: 0, favorable: -2, regular: -5, desfavorable: -10, muy_desfavorable: -12
  };
  const ajuste = orientMap[orientacion] ?? -5;

  const rmr = p1 + p2 + p3 + p4 + p5 + ajuste;

  let clase = '', descripcion = '', soporte = '';
  if (rmr >= 81) {
    clase = 'I'; descripcion = 'Roca muy buena';
    soporte = 'Generalmente no se requiere soporte. Ocasionalmente pernos puntuales.';
  } else if (rmr >= 61) {
    clase = 'II'; descripcion = 'Roca buena';
    soporte = 'Pernos de roca 3m c/2.5m. Malla ocasional. Concreto lanzado 50mm si es necesario.';
  } else if (rmr >= 41) {
    clase = 'III'; descripcion = 'Roca regular';
    soporte = 'Pernos 4m c/2m con malla. Concreto lanzado 50-100mm. Cerchas ligeras ocasionales.';
  } else if (rmr >= 21) {
    clase = 'IV'; descripcion = 'Roca mala';
    soporte = 'Pernos 4-5m c/1-1.5m con malla. Concreto lanzado 100-150mm. Cerchas metalicas c/1.5m.';
  } else {
    clase = 'V'; descripcion = 'Roca muy mala';
    soporte = 'Soporte inmediato. Pernos + malla + concreto lanzado 150-200mm. Cerchas c/0.75m. Posible sostenimiento especial.';
  }

  const riesgo = rmr < 21 ? 'CRITICAL' : rmr < 41 ? 'HIGH' : rmr < 61 ? 'MEDIUM' : 'LOW';
  return { rmr, clase, descripcion, soporte, riesgo };
}

// Ventilacion subterranea - NIOSH / MSHA 30 CFR Part 57
// Referencia: NIOSH (2010) Mine Ventilation Engineering
function calcVentilacion(
  trabajadores: number,
  equipos_diesel_kW: number,
  longitud_galeria: number,
  seccion_m2: number,
  gases_ppm: number // CO medido en ppm
) {
  if (seccion_m2 <= 0 || longitud_galeria <= 0) return null;

  // Caudal minimo por persona (MSHA: 0.06 m3/s por persona)
  const Q_personas = trabajadores * 0.06;

  // Caudal minimo por equipo diesel (MSHA: 0.06 m3/s por kW)
  const Q_diesel = equipos_diesel_kW * 0.06;

  // Caudal total requerido
  const Q_requerido = Math.max(Q_personas + Q_diesel, 0.25);

  // Velocidad en galeria
  const V_galeria = Q_requerido / seccion_m2;

  // Tiempo renovacion aire
  const volumen = longitud_galeria * seccion_m2;
  const t_renovacion = volumen / Q_requerido / 60; // minutos

  // Evaluacion CO (NIOSH: limite 25ppm TWA, IDLH 1200ppm)
  const co_ok = gases_ppm < 25;
  const riesgo_co = gases_ppm > 200 ? 'CRITICAL' : gases_ppm > 50 ? 'HIGH' : gases_ppm > 25 ? 'MEDIUM' : 'LOW';

  const riesgo = V_galeria < 0.25 ? 'CRITICAL' : V_galeria < 0.5 ? 'HIGH' : riesgo_co;

  return {
    Q_requerido: +Q_requerido.toFixed(2),
    Q_personas: +Q_personas.toFixed(2),
    Q_diesel: +Q_diesel.toFixed(2),
    V_galeria: +V_galeria.toFixed(2),
    t_renovacion: +t_renovacion.toFixed(1),
    co_ok, riesgo_co, riesgo
  };
}

const CONDICIONES = [
  { id: 'muy_buena', label: 'Muy buena — superficies rugosas, cerradas, sin relleno' },
  { id: 'buena', label: 'Buena — superficies ligeramente rugosas, apertura <1mm' },
  { id: 'regular', label: 'Regular — apertura 1-5mm o relleno blando <5mm' },
  { id: 'mala', label: 'Mala — apertura >5mm o relleno blando >5mm' },
  { id: 'muy_mala', label: 'Muy mala — relleno blando >5mm, abiertas' },
];
const AGUA = [
  { id: 'seco', label: 'Seco — sin agua' },
  { id: 'humedo', label: 'Humedo — humedad solo' },
  { id: 'mojado', label: 'Mojado — agua, no caudal' },
  { id: 'goteo', label: 'Goteo — caudal < 10 L/min' },
  { id: 'flujo', label: 'Flujo — caudal > 10 L/min' },
];
const ORIENTACION = [
  { id: 'muy_favorable', label: 'Muy favorable' },
  { id: 'favorable', label: 'Favorable' },
  { id: 'regular', label: 'Regular' },
  { id: 'desfavorable', label: 'Desfavorable' },
  { id: 'muy_desfavorable', label: 'Muy desfavorable' },
];

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<string, string> = {
  LOW: 'SEGURO', MEDIUM: 'MONITOREAR', HIGH: 'REVISAR', CRITICAL: 'DETENER'
};

export default function ModuloMineria() {
  const [tab, setTab] = useState<'rmr' | 'vent'>('rmr');

  // RMR
  const [ucs, setUcs] = useState('80');
  const [rqd, setRqd] = useState('75');
  const [espaciado, setEspaciado] = useState('300');
  const [condicion, setCondicion] = useState('buena');
  const [agua, setAgua] = useState('humedo');
  const [orientacion, setOrientacion] = useState('regular');
  const [resRMR, setResRMR] = useState<ReturnType<typeof calcRMR> | null>(null);

  // Ventilacion
  const [trabajadores, setTrabajadores] = useState('10');
  const [diesel_kW, setDieselKW] = useState('150');
  const [longitud, setLongitud] = useState('500');
  const [seccion, setSeccion] = useState('12');
  const [co_ppm, setCoPpm] = useState('15');
  const [resVent, setResVent] = useState<ReturnType<typeof calcVentilacion>>(null);
  const [error, setError] = useState('');

  const calcularRMR = () => {
    setError('');
    const r = calcRMR(
      parseFloat(ucs), parseFloat(rqd), parseFloat(espaciado),
      condicion, agua, orientacion
    );
    setResRMR(r);
  };

  const calcularVent = () => {
    setError('');
    const r = calcVentilacion(
      parseFloat(trabajadores), parseFloat(diesel_kW),
      parseFloat(longitud), parseFloat(seccion), parseFloat(co_ppm)
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResVent(r);
  };

  const inputStyle = {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #475569',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#f8fafc',
    fontSize: 15,
    boxSizing: 'border-box' as const
  };

  const selectStyle = {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #475569',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#f8fafc',
    fontSize: 13
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#78716c,#44403c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              ⛏️
            </div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Mineria</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>RMR Bieniawski 1989 + Ventilacion NIOSH/MSHA</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: Bieniawski 1989 | NIOSH 2010 | MSHA 30 CFR Part 57 | IRAM 11647
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'rmr', label: 'RMR — Clasificacion Roca' },
            { id: 'vent', label: 'Ventilacion Subterranea' }
          ].map(t2 => (
            <button key={t2.id} onClick={() => setTab(t2.id as 'rmr' | 'vent')}
              style={{
                flex: 1, padding: 10,
                background: tab === t2.id ? '#78716c' : '#1e293b',
                border: '1px solid #334155', borderRadius: 8,
                color: 'white', fontWeight: tab === t2.id ? 800 : 400,
                cursor: 'pointer', fontSize: 13
              }}>
              {t2.label}
            </button>
          ))}
        </div>

        {/* RMR */}
        {tab === 'rmr' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#a8a29e', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Parametros RMR — Bieniawski 1989
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>UCS — Resistencia uniaxial (MPa)</label>
                <input value={ucs} onChange={e => setUcs(e.target.value)} style={inputStyle} placeholder="80" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>RQD — Rock Quality Designation (%)</label>
                <input value={rqd} onChange={e => setRqd(e.target.value)} style={inputStyle} placeholder="75" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Espaciado discontinuidades (mm)</label>
                <input value={espaciado} onChange={e => setEspaciado(e.target.value)} style={inputStyle} placeholder="300" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Condicion de discontinuidades</label>
                <select value={condicion} onChange={e => setCondicion(e.target.value)} style={selectStyle}>
                  {CONDICIONES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Condicion agua subterranea</label>
                <select value={agua} onChange={e => setAgua(e.target.value)} style={selectStyle}>
                  {AGUA.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Orientacion de discontinuidades</label>
                <select value={orientacion} onChange={e => setOrientacion(e.target.value)} style={selectStyle}>
                  {ORIENTACION.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <button onClick={calcularRMR}
              style={{ width: '100%', background: 'linear-gradient(135deg,#78716c,#44403c)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR RMR — CLASIFICACION DE ROCA
            </button>
          </div>
        )}

        {/* VENTILACION */}
        {tab === 'vent' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#a8a29e', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Ventilacion Subterranea — NIOSH / MSHA
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Trabajadores en frente', val: trabajadores, set: setTrabajadores },
                { label: 'Potencia equipos diesel (kW)', val: diesel_kW, set: setDieselKW },
                { label: 'Longitud galeria (m)', val: longitud, set: setLongitud },
                { label: 'Seccion transversal (m2)', val: seccion, set: setSeccion },
                { label: 'CO medido en galeria (ppm)', val: co_ppm, set: setCoPpm },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            {error && <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button onClick={calcularVent}
              style={{ width: '100%', background: 'linear-gradient(135deg,#78716c,#44403c)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR VENTILACION REQUERIDA
            </button>
          </div>
        )}

        {/* RESULTADOS RMR */}
        {tab === 'rmr' && resRMR && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resRMR.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Clasificacion RMR</div>
              <div style={{ background: riskColor[resRMR.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {riskLabel[resRMR.riesgo]}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 20, textAlign: 'center' as const }}>
                <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>Valor RMR</div>
                <div style={{ color: riskColor[resRMR.riesgo], fontSize: 40, fontWeight: 900 }}>{resRMR.rmr}</div>
                <div style={{ color: '#475569', fontSize: 11 }}>/ 100</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 20, textAlign: 'center' as const }}>
                <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>Clase de Roca</div>
                <div style={{ color: riskColor[resRMR.riesgo], fontSize: 40, fontWeight: 900 }}>Clase {resRMR.clase}</div>
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{resRMR.descripcion}</div>
              </div>
            </div>
            <div style={{ background: '#0a1628', border: '1px solid #334155', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ color: '#a8a29e', fontWeight: 700, fontSize: 12, marginBottom: 8 }}>SOPORTE RECOMENDADO:</div>
              <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.6 }}>{resRMR.soporte}</div>
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#a8a29e', marginBottom: 4, fontWeight: 700 }}>METODO RMR:</div>
              RMR = P1(UCS) + P2(RQD) + P3(Espaciado) + P4(Condicion) + P5(Agua) + Ajuste(Orientacion)
              <div style={{ marginTop: 4, color: '#475569' }}>Bieniawski 1989 | NIOSH | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* RESULTADOS VENTILACION */}
        {tab === 'vent' && resVent && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resVent.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Ventilacion</div>
              <div style={{ background: riskColor[resVent.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {riskLabel[resVent.riesgo]}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Caudal requerido total', value: resVent.Q_requerido + ' m3/s' },
                { label: 'Por trabajadores', value: resVent.Q_personas + ' m3/s' },
                { label: 'Por equipos diesel', value: resVent.Q_diesel + ' m3/s' },
                { label: 'Velocidad en galeria', value: resVent.V_galeria + ' m/s' },
                { label: 'Tiempo renovacion aire', value: resVent.t_renovacion + ' min' },
                { label: 'CO — Estado', value: resVent.co_ok ? 'DENTRO LIMITE' : 'SUPERA LIMITE' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resVent.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#a8a29e', marginBottom: 4, fontWeight: 700 }}>CRITERIOS MSHA 30 CFR Part 57:</div>
              Q minimo = 0.06 m3/s por persona + 0.06 m3/s por kW diesel
              <div style={{ marginTop: 4, color: '#475569' }}>CO limite TWA: 25 ppm | IDLH: 1200 ppm | V min galeria: 0.25 m/s</div>
              <div style={{ marginTop: 4, color: '#475569' }}>NIOSH 2010 | MSHA 30 CFR 57 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
