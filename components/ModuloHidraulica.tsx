'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { useState, useEffect } from 'react';
import { parsearGeometriaSegura, calcularCaudalMedido, type ResultadoCaudalMedido } from '@/lib/telemetria-calculo';
import { calcDarcyWeisbach, calcGolpeAriete } from '@/lib/calculos';

interface ActivoTelemetriaOption {
  id: string;
  nombre: string;
  tipoActivo: string;
  geometriaJson: string;
}

interface LecturaTelemetriaApi {
  valor: number;
  createdAt: string;
}

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// calcDarcyWeisbach y calcGolpeAriete — importadas de @/lib/calculos (fuente
// única de verdad, con tests). Antes eran copias manuales acá, idénticas en
// fórmula a las de lib/, pero invisibles para el test suite.

const MATERIALES = [
  { label: 'Acero comercial', rugosidad: 0.046 },
  { label: 'Hierro fundido', rugosidad: 0.26 },
  { label: 'PVC / HDPE', rugosidad: 0.0015 },
  { label: 'Hormigon liso', rugosidad: 0.3 },
  { label: 'Acero inoxidable', rugosidad: 0.015 },
  { label: 'Cobre', rugosidad: 0.0015 },
];

const E_MATERIALES = [
  { label: 'Acero (200 GPa)', E: 200 },
  { label: 'PVC (3 GPa)', E: 3 },
  { label: 'HDPE (0.8 GPa)', E: 0.8 },
  { label: 'Hierro fundido (100 GPa)', E: 100 },
];

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<string, string> = {
  LOW: 'SEGURO', MEDIUM: 'MONITOREAR', HIGH: 'REVISAR', CRITICAL: 'DETENER'
};

export default function ModuloHidraulica() {
  const [tab, setTab] = useState<'dw' | 'wh'>('dw');
  const [Q, setQ] = useState('80');
  const [D, setD] = useState('300');
  const [L, setL] = useState('500');
  const [matIdx, setMatIdx] = useState(0);
  const [K, setK] = useState('0.5');
  const [t, setT] = useState('8');
  const [eIdx, setEIdx] = useState(0);
  const [dV, setDV] = useState('1.5');
  const [resDW, setResDW] = useState<ReturnType<typeof calcDarcyWeisbach>>(null);
  const [resWH, setResWH] = useState<ReturnType<typeof calcGolpeAriete>>(null);
  const [datosDW, setDatosDW] = useState<DatosExportar | null>(null);
  const [datosWH, setDatosWH] = useState<DatosExportar | null>(null);
  const [error, setError] = useState('');

  // Activos monitoreados de telemetría — solo para el sub-cálculo Darcy-Weisbach
  const [activosTelemetria, setActivosTelemetria] = useState<ActivoTelemetriaOption[]>([]);
  const [activoElegido, setActivoElegido] = useState<ActivoTelemetriaOption | null>(null);
  const [calculandoCaudal, setCalculandoCaudal] = useState(false);
  const [resultadoCaudal, setResultadoCaudal] = useState<ResultadoCaudalMedido | null>(null);
  const [errorCaudal, setErrorCaudal] = useState('');

  useEffect(() => {
    fetch('/api/telemetria', { credentials: 'include', headers: ipAuthHeader() })
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json?.ok && Array.isArray(json.data)) {
          setActivosTelemetria(json.data as ActivoTelemetriaOption[]);
        }
      })
      .catch(() => {});
  }, []);

  const calcularCaudalDelActivo = async () => {
    if (!activoElegido) return;
    setCalculandoCaudal(true);
    setErrorCaudal('');
    setResultadoCaudal(null);
    try {
      const res = await fetch(`/api/telemetria/lecturas?activoId=${activoElegido.id}`, {
        credentials: 'include',
        headers: ipAuthHeader(),
      });
      const json = await res.json();
      if (!json?.ok || !Array.isArray(json.data)) {
        setErrorCaudal('No se pudieron obtener las lecturas del activo.');
        return;
      }

      const lecturas = json.data as LecturaTelemetriaApi[];
      if (lecturas.length < 2) {
        setErrorCaudal('Se necesitan al menos dos lecturas del activo para calcular el caudal.');
        return;
      }

      const geometria = parsearGeometriaSegura(activoElegido.geometriaJson);
      if (!geometria) {
        setErrorCaudal('El activo no tiene una geometría válida cargada.');
        return;
      }

      const [actual, anterior] = lecturas; // orden desc: [0] es la mas reciente
      const areaSuperficie_m2 = geometria.largoCoronamiento * geometria.anchoCoronamiento;

      const resultado = calcularCaudalMedido(
        { nivel: anterior.valor, fecha: new Date(anterior.createdAt) },
        { nivel: actual.valor, fecha: new Date(actual.createdAt) },
        areaSuperficie_m2,
      );

      if (!resultado) {
        setErrorCaudal('El intervalo de tiempo entre las dos lecturas no es válido.');
        return;
      }

      setResultadoCaudal(resultado);
    } catch {
      setErrorCaudal('Error de conexión al calcular el caudal.');
    } finally {
      setCalculandoCaudal(false);
    }
  };

  const calcularDW = () => {
    setError('');
    const r = calcDarcyWeisbach(
      parseFloat(Q), parseFloat(D), parseFloat(L),
      MATERIALES[matIdx].rugosidad, parseFloat(K)
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResDW(r);
    const payload: DatosExportar = {
      tipo: 'DARCY_WEISBACH',
      normativa: 'AWWA M11 | Darcy-Weisbach | Swamee-Jain (aproximación explícita de Colebrook-White)',
      parametros: {
        'Caudal Q (L/s)': Q,
        'Diametro interno D (mm)': D,
        'Longitud L (m)': L,
        'Material': MATERIALES[matIdx].label,
        'Rugosidad (mm)': MATERIALES[matIdx].rugosidad,
        'Coef. perdidas menores K': K,
      },
      resultado: {
        'Velocidad V (m/s)': r.V,
        'Numero de Reynolds Re': r.Re,
        'Regimen de flujo': r.regimen,
        'Factor de friccion f': r.f,
        'hf Mayor (m)': r.hf_mayor,
        'hf Menor (m)': r.hf_menor,
        'hf Total (m)': r.hf_total,
        'Presion (bar)': r.dP_bar,
        'Presion (Pa)': r.dP_Pa,
        'Estado': r.riesgo,
      },
      nivel:  r.riesgo,
      alerta: r.riesgo === 'HIGH' || r.riesgo === 'CRITICAL',
      dxfParams: {
        D:  parseFloat(D),
        L:  parseFloat(L),
        Q:  parseFloat(Q),
        V:  r.V,
        hf: r.hf_total,
        Re: r.Re,
        f:  r.f,
      },
    };
    setDatosDW(payload);
    publicarResultado(payload);
  };

  const calcularWH = () => {
    setError('');
    const r = calcGolpeAriete(
      parseFloat(Q), parseFloat(D), parseFloat(t),
      parseFloat(L), E_MATERIALES[eIdx].E, parseFloat(dV)
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResWH(r);
    const payload: DatosExportar = {
      tipo: 'GOLPE_ARIETE',
      normativa: 'Joukowsky 1898 | AWWA M11 | ASME B31.3',
      parametros: {
        'Caudal Q (L/s)': Q,
        'Diametro D (mm)': D,
        'Longitud L (m)': L,
        'Espesor pared t (mm)': t,
        'Material tuberia': E_MATERIALES[eIdx].label,
        'Modulo elasticidad E (GPa)': E_MATERIALES[eIdx].E,
        'Cambio velocidad dV (m/s)': dV,
      },
      resultado: {
        'Celeridad onda a (m/s)': r.a,
        'Sobrepresion (MPa)': r.dP_MPa,
        'Sobrepresion (bar)': r.dP_bar,
        'Tiempo critico Tc (s)': r.Tc,
        'Estado': r.riesgo,
      },
      nivel:  r.riesgo,
      alerta: r.riesgo === 'HIGH' || r.riesgo === 'CRITICAL',
      dxfParams: {
        D:    parseFloat(D),
        t:    parseFloat(t),
        L:    parseFloat(L),
        V0:   parseFloat(dV),
        a:    r.a,
        dP:   r.dP_MPa,
        Tc:   r.Tc,
        MAOP: r.dP_MPa * 2,
      },
    };
    setDatosWH(payload);
    publicarResultado(payload);
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
    fontSize: 14
  };

  const datosActivo = tab === 'dw' ? datosDW : datosWH;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              💧
            </div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Hidraulica</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Darcy-Weisbach + Golpe de Ariete (Joukowsky) | AWWA M11</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: AWWA M11 | Darcy-Weisbach | Swamee-Jain (aprox. explícita de Colebrook-White) | Joukowsky 1898 | ASME B31.3
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'dw', label: 'Perdidas Hidraulicas' },
            { id: 'wh', label: 'Golpe de Ariete' }
          ].map(t2 => (
            <button key={t2.id} onClick={() => setTab(t2.id as 'dw' | 'wh')}
              style={{
                flex: 1, padding: '10px',
                background: tab === t2.id ? '#0ea5e9' : '#1e293b',
                border: '1px solid #334155', borderRadius: 8,
                color: 'white', fontWeight: tab === t2.id ? 800 : 400,
                cursor: 'pointer', fontSize: 13
              }}>
              {t2.label}
            </button>
          ))}
        </div>

        {/* DARCY-WEISBACH */}
        {tab === 'dw' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Cargar desde activo monitoreado (opcional)</label>
              <select
                value={activoElegido?.id ?? ''}
                onChange={e => {
                  const id = e.target.value;
                  const encontrado = activosTelemetria.find(a => a.id === id) ?? null;
                  setActivoElegido(encontrado);
                }}
                style={selectStyle}
              >
                <option value="">Sin activo — carga manual</option>
                {activosTelemetria.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
              {activoElegido && (
                <>
                  <button
                    onClick={calcularCaudalDelActivo}
                    disabled={calculandoCaudal}
                    style={{
                      marginTop: 10, padding: '8px 16px',
                      background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
                      border: 'none', borderRadius: 8, color: '#fff',
                      fontSize: 12, fontWeight: 700, cursor: calculandoCaudal ? 'default' : 'pointer',
                      opacity: calculandoCaudal ? 0.6 : 1,
                    }}
                  >
                    {calculandoCaudal ? 'Calculando…' : 'Calcular caudal medido'}
                  </button>
                  {errorCaudal && (
                    <div style={{ marginTop: 10, fontSize: 12, color: '#f87171', fontWeight: 600 }}>{errorCaudal}</div>
                  )}
                  {resultadoCaudal && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#0f172a', borderRadius: 8, fontSize: 13 }}>
                      <span style={{ color: '#94a3b8' }}>Caudal medido: </span>
                      <span style={{ color: resultadoCaudal.tipo === 'llenado' ? '#4ade80' : resultadoCaudal.tipo === 'vaciado' ? '#f87171' : '#94a3b8', fontWeight: 800 }}>
                        {resultadoCaudal.caudalLitrosSegundo.toFixed(3)} L/s — {resultadoCaudal.tipo.toUpperCase()}
                      </span>
                      <button
                        onClick={() => setQ(Math.abs(resultadoCaudal.caudalLitrosSegundo).toFixed(2))}
                        style={{
                          marginLeft: 12, padding: '4px 12px',
                          background: 'transparent', border: '1px solid #0ea5e9',
                          borderRadius: 6, color: '#0ea5e9', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Aplicar a Q
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Parametros Darcy-Weisbach
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Caudal Q (L/s)</label>
                <input value={Q} onChange={e => setQ(e.target.value)} style={inputStyle} placeholder="80" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Diametro interno D (mm)</label>
                <input value={D} onChange={e => setD(e.target.value)} style={inputStyle} placeholder="300" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Longitud L (m)</label>
                <input value={L} onChange={e => setL(e.target.value)} style={inputStyle} placeholder="500" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Coef. perdidas menores K</label>
                <input value={K} onChange={e => setK(e.target.value)} style={inputStyle} placeholder="0.5" />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Material de tuberia</label>
              <select value={matIdx} onChange={e => setMatIdx(+e.target.value)} style={selectStyle}>
                {MATERIALES.map((m, i) => (
                  <option key={i} value={i}>{m.label} — rugosidad {m.rugosidad} mm</option>
                ))}
              </select>
            </div>
            {error && (
              <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button onClick={calcularDW}
              style={{ width: '100%', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR PERDIDAS HIDRAULICAS
            </button>
          </div>
        )}

        {/* GOLPE DE ARIETE */}
        {tab === 'wh' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Parametros Golpe de Ariete — Joukowsky
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Caudal Q (L/s)</label>
                <input value={Q} onChange={e => setQ(e.target.value)} style={inputStyle} placeholder="80" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Diametro D (mm)</label>
                <input value={D} onChange={e => setD(e.target.value)} style={inputStyle} placeholder="300" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Longitud L (m)</label>
                <input value={L} onChange={e => setL(e.target.value)} style={inputStyle} placeholder="500" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Espesor pared t (mm)</label>
                <input value={t} onChange={e => setT(e.target.value)} style={inputStyle} placeholder="8" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Cambio velocidad dV (m/s)</label>
                <input value={dV} onChange={e => setDV(e.target.value)} style={inputStyle} placeholder="1.5" />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Material de tuberia</label>
              <select value={eIdx} onChange={e => setEIdx(+e.target.value)} style={selectStyle}>
                {E_MATERIALES.map((m, i) => (
                  <option key={i} value={i}>{m.label}</option>
                ))}
              </select>
            </div>
            {error && (
              <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button onClick={calcularWH}
              style={{ width: '100%', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', borderRadius: 10, padding: 14, color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR GOLPE DE ARIETE
            </button>
          </div>
        )}

        {/* RESULTADOS DW */}
        {tab === 'dw' && resDW && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resDW.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Hidraulicos</div>
              <div style={{ background: riskColor[resDW.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {riskLabel[resDW.riesgo]}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Velocidad', value: resDW.V + ' m/s' },
                { label: 'Reynolds', value: resDW.Re.toLocaleString() },
                { label: 'Regimen', value: resDW.regimen },
                { label: 'hf Mayor', value: resDW.hf_mayor + ' m' },
                { label: 'hf Menor', value: resDW.hf_menor + ' m' },
                { label: 'hf Total', value: resDW.hf_total + ' m' },
                { label: 'Factor f', value: resDW.f.toString() },
                { label: 'Presion', value: resDW.dP_bar + ' bar' },
                { label: 'mca', value: resDW.dP_mca + ' mca' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resDW.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#0ea5e9', marginBottom: 4, fontWeight: 700 }}>FORMULA APLICADA:</div>
              hf = f x (L/D) x V2 / 2g
              <div style={{ marginTop: 4, color: '#475569' }}>
                f={resDW.f} | V={resDW.V} m/s | Re={resDW.Re} | {resDW.regimen}
              </div>
              <div style={{ marginTop: 4, color: '#475569' }}>AWWA M11 | Swamee-Jain (aprox. explícita de Colebrook-White) | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* RESULTADOS WH */}
        {tab === 'wh' && resWH && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resWH.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Golpe de Ariete</div>
              <div style={{ background: riskColor[resWH.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {riskLabel[resWH.riesgo]}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Celeridad onda a', value: resWH.a + ' m/s' },
                { label: 'Sobrepresion', value: resWH.dP_MPa + ' MPa' },
                { label: 'Sobrepresion', value: resWH.dP_bar + ' bar' },
                { label: 'Tiempo critico Tc', value: resWH.Tc + ' s' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resWH.riesgo], fontSize: 18, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#0ea5e9', marginBottom: 4, fontWeight: 700 }}>FORMULA JOUKOWSKY:</div>
              dP = rho x a x dV = 998 x {resWH.a} x {dV} = {resWH.dP_MPa} MPa
              <div style={{ marginTop: 4, color: '#475569' }}>Joukowsky 1898 | AWWA M11 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}
        {datosActivo && <BotonesExportar visible={true} datos={datosActivo} />}

      </div>
    </div>
  );
}
