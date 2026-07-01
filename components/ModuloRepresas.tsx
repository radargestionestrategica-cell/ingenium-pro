'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { useState, useEffect } from 'react';

interface ActivoRepresaOption {
  id: string;
  nombre: string;
  tipoActivo: string;
}

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

interface ResultadoVertedero {
  Q: number; // m³/s
  v: number; // m/s
  Fr: number; // Froude
  tipo: string;
  normativa: string;
}

interface ResultadoFiltracion {
  q: number; // m²/s por metro lineal
  gradiente: number;
  seguro: boolean;
  normativa: string;
}

interface ResultadoEstabilidad {
  W_kN: number; // peso propio presa por metro lineal
  U_kN: number; // subpresion (uplift) por metro lineal
  Pw_kN: number; // empuje hidrostatico por metro lineal
  FS_deslizamiento: number;
  FS_volcamiento: number;
  e_m: number; // excentricidad de la resultante
  tercio_medio: boolean;
  sigma_max: number; // kN/m2
  sigma_min: number; // kN/m2
  riesgo: string;
  normativa: string;
}

function calcularVertedero(L: number, H: number, Cd: number): ResultadoVertedero {
  // Fórmula de Francis — USACE EM 1110-2-1603
  const g = 9.81;
  const Q = Cd * L * Math.pow(H, 1.5) * Math.sqrt(2 * g);
  const A = L * H;
  const v = Q / A;
  const Fr = v / Math.sqrt(g * H);
  const tipo = Fr < 1 ? 'Flujo subcrítico' : Fr > 1 ? 'Flujo supercrítico' : 'Flujo crítico';
  return {
    Q: Math.round(Q * 1000) / 1000,
    v: Math.round(v * 1000) / 1000,
    Fr: Math.round(Fr * 1000) / 1000,
    tipo,
    normativa: 'USACE EM 1110-2-1603 · ICOLD Bulletin 58',
  };
}

function calcularFiltracion(H: number, k: number, L: number, d: number): ResultadoFiltracion {
  // Ley de Darcy — USACE EM 1110-2-1901
  const gradiente = H / L;
  const q = k * gradiente * d;
  const seguro = gradiente < 0.5; // Gradiente crítico según Terzaghi
  return {
    q: Math.round(q * 1e6) / 1e6,
    gradiente: Math.round(gradiente * 1000) / 1000,
    seguro,
    normativa: 'USACE EM 1110-2-1901 · Ley de Darcy · Terzaghi',
  };
}

// Estabilidad de presa de gravedad (sección triangular, cara vertical aguas arriba)
// Referencia: USACE EM 1110-2-2200 · ICOLD Bulletin 117 — Regla del tercio medio
// Incluye subpresión (uplift) en la base — FS mínimo aceptable: deslizamiento ≥ 1.5, vuelco ≥ 1.5
function calcularEstabilidad(Hw: number, B: number, Hd: number, gammaH: number, gammaW: number, mu: number): ResultadoEstabilidad {
  // Empuje hidrostático horizontal — actúa a Hw/3 desde la base
  const Pw = 0.5 * gammaW * Hw * Hw;
  const brazoPw = Hw / 3;

  // Peso propio (sección triangular) — actúa en el centroide a 2/3·B del pie de aguas abajo
  const W = gammaH * (0.5 * B * Hd);
  const brazoW = (2 / 3) * B;

  // Subpresión (uplift) en la base — resta estabilidad
  const U = 0.5 * gammaW * Hw * B;

  // Fuerza vertical neta resistente
  const N = W - U;

  // Factor de seguridad al deslizamiento — mínimo aceptable 1.5
  const FS_deslizamiento = (mu * N) / Pw;

  // Momentos respecto al pie de aguas abajo
  const M_volcador = Pw * brazoPw;
  const M_estabilizante = N * brazoW;

  // Factor de seguridad al vuelco — mínimo aceptable 1.5
  const FS_volcamiento = M_estabilizante / M_volcador;

  // Excentricidad y regla del tercio medio (solo si N > 0)
  let e = 0, sigma_max = 0, sigma_min = 0;
  let tercio_medio = false;
  if (N > 0) {
    const x_bar = (M_estabilizante - M_volcador) / N;
    e = Math.abs(B / 2 - x_bar);
    tercio_medio = e <= B / 6;
    sigma_max = (N / B) * (1 + 6 * e / B);
    sigma_min = (N / B) * (1 - 6 * e / B);
  }

  const riesgo = (FS_deslizamiento < 1.0 || FS_volcamiento < 1.0 || N <= 0 || sigma_min < 0)
    ? 'CRITICAL'
    : (FS_deslizamiento < 1.5 || FS_volcamiento < 1.5 || !tercio_medio)
      ? 'HIGH'
      : 'LOW';

  return {
    W_kN: Math.round(W * 100) / 100,
    U_kN: Math.round(U * 100) / 100,
    Pw_kN: Math.round(Pw * 100) / 100,
    FS_deslizamiento: Math.round(FS_deslizamiento * 1000) / 1000,
    FS_volcamiento: Math.round(FS_volcamiento * 1000) / 1000,
    e_m: Math.round(e * 1000) / 1000,
    tercio_medio,
    sigma_max: Math.round(sigma_max * 100) / 100,
    sigma_min: Math.round(sigma_min * 100) / 100,
    riesgo,
    normativa: 'USACE EM 1110-2-2100 Stability Analysis of Concrete Structures — FS min. deslizamiento y vuelco = 1.5',
  };
}

export default function ModuloRepresas() {
  const [calculo, setCalculo] = useState<'vertedero' | 'filtracion' | 'estabilidad'>('vertedero');

  // Vertedero
  const [L, setL] = useState('10');
  const [H, setH] = useState('2');
  const [Cd, setCd] = useState('1.84');
  const [resV, setResV] = useState<ResultadoVertedero | null>(null);
  const [datosV, setDatosV] = useState<DatosExportar | null>(null);

  // Filtración
  const [Hf, setHf] = useState('5');
  const [k, setK] = useState('0.0001');
  const [Lf, setLf] = useState('20');
  const [d, setD] = useState('1');
  const [resF, setResF] = useState<ResultadoFiltracion | null>(null);
  const [datosF, setDatosF] = useState<DatosExportar | null>(null);

  // Estabilidad presa de gravedad
  const [He, setHe] = useState('10');
  const [Be, setBe] = useState('8');
  const [HdE, setHdE] = useState('12');
  const [gammaH, setGammaH] = useState('23.5');
  const [gammaW, setGammaW] = useState('9.81');
  const [muE, setMuE] = useState('0.7');
  const [resE, setResE] = useState<ResultadoEstabilidad | null>(null);
  const [datosE, setDatosE] = useState<DatosExportar | null>(null);

  const [error, setError] = useState('');

  // Activos monitoreados de tipo represa (telemetría) — solo para el sub-cálculo de estabilidad
  const [activosRepresa, setActivosRepresa] = useState<ActivoRepresaOption[]>([]);
  const [activoElegido, setActivoElegido] = useState<ActivoRepresaOption | null>(null);

  useEffect(() => {
    fetch('/api/telemetria', { credentials: 'include', headers: ipAuthHeader() })
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json?.ok && Array.isArray(json.data)) {
          const soloRepresas = (json.data as ActivoRepresaOption[]).filter(a => a.tipoActivo === 'represa');
          setActivosRepresa(soloRepresas);
        }
      })
      .catch(() => {});
  }, []);

  const calcular = () => {
    setError('');
    try {
      if (calculo === 'vertedero') {
        const lv = parseFloat(L);
        const hv = parseFloat(H);
        const cd = parseFloat(Cd);
        if (isNaN(lv) || isNaN(hv) || isNaN(cd) || lv <= 0 || hv <= 0 || cd <= 0) {
          setError('Todos los valores deben ser positivos'); return;
        }
        const rv = calcularVertedero(lv, hv, cd);
        setResV(rv);
        const payloadV: DatosExportar = {
          tipo: 'VERTEDERO_FRANCIS',
          normativa: 'USACE EM 1110-2-1603 | ICOLD Bulletin 58',
          parametros: {
            'Longitud vertedero L (m)': lv,
            'Carga hidraulica H (m)': hv,
            'Coef. descarga Cd': cd,
          },
          resultado: {
            'Caudal Q (m3/s)': rv.Q,
            'Velocidad v (m/s)': rv.v,
            'Numero de Froude Fr': rv.Fr,
            'Regimen': rv.tipo,
          },
          dxfParams: {
            tipo:    'vertedero',
            L_vert:  lv,
            H_carga: hv,
            Cd:      cd,
            Q_m3s:   rv.Q,
            v_ms:    rv.v,
            Fr:      rv.Fr,
            regimen: rv.tipo,
          },
        };
        setDatosV(payloadV);
        publicarResultado(payloadV);
      } else if (calculo === 'filtracion') {
        const hf = parseFloat(Hf);
        const kv = parseFloat(k);
        const lf = parseFloat(Lf);
        const dv = parseFloat(d);
        if (isNaN(hf) || isNaN(kv) || isNaN(lf) || isNaN(dv) || hf <= 0 || kv <= 0 || lf <= 0 || dv <= 0) {
          setError('Todos los valores deben ser positivos'); return;
        }
        const rf = calcularFiltracion(hf, kv, lf, dv);
        setResF(rf);
        const payloadF: DatosExportar = {
          tipo: 'FILTRACION_DARCY',
          normativa: 'USACE EM 1110-2-1901 | Ley de Darcy | Terzaghi',
          parametros: {
            'Carga hidraulica H (m)': hf,
            'Conductividad hidraulica k (m/s)': kv,
            'Longitud de filtracion L (m)': lf,
            'Espesor estrato d (m)': dv,
          },
          resultado: {
            'Caudal filtracion q (m2/s)': rf.q,
            'Gradiente hidraulico i': rf.gradiente,
            'Seguro (i < 0.5 Terzaghi)': rf.seguro ? 'SI' : 'NO',
          },
          dxfParams: {
            tipo:      'filtracion',
            H_fil:     hf,
            k_ms:      kv,
            L_fil:     lf,
            d_m:       dv,
            q_m2s:     rf.q,
            gradiente: rf.gradiente,
            seguro:    rf.seguro,
          },
        };
        setDatosF(payloadF);
        publicarResultado(payloadF);
      } else {
        const he = parseFloat(He);
        const be = parseFloat(Be);
        const hde = parseFloat(HdE);
        const gh = parseFloat(gammaH);
        const gw = parseFloat(gammaW);
        const mu = parseFloat(muE);
        if (isNaN(he) || isNaN(be) || isNaN(hde) || isNaN(gh) || isNaN(gw) || isNaN(mu) || he <= 0 || be <= 0 || hde <= 0 || gh <= 0 || gw <= 0 || mu <= 0) {
          setError('Todos los valores deben ser positivos'); return;
        }
        const re = calcularEstabilidad(he, be, hde, gh, gw, mu);
        setResE(re);
        const payloadE: DatosExportar = {
          tipo: 'ESTABILIDAD_PRESA_GRAVEDAD',
          normativa: 'USACE EM 1110-2-2100 Stability Analysis of Concrete Structures',
          parametros: {
            'Altura de agua Hw (m)': he,
            'Base de la presa B (m)': be,
            'Altura de la presa Hd (m)': hde,
            'Peso especifico hormigon (kN/m3)': gh,
            'Peso especifico agua (kN/m3)': gw,
            'Coef. friccion base': mu,
          },
          resultado: {
            'Peso presa W (kN/m)': re.W_kN,
            'Subpresion U (kN/m)': re.U_kN,
            'Empuje hidrostatico Pw (kN/m)': re.Pw_kN,
            'FS deslizamiento': re.FS_deslizamiento,
            'FS volcamiento': re.FS_volcamiento,
            'Excentricidad e (m)': re.e_m,
            'Dentro del tercio medio': re.tercio_medio ? 'SI' : 'NO',
            'Tension maxima (kN/m2)': re.sigma_max,
            'Tension minima (kN/m2)': re.sigma_min,
          },
          dxfParams: {
            tipo:      'estabilidad_presa',
            Hw:        he,
            B:         be,
            Hd:        hde,
            gammaH:    gh,
            gammaW:    gw,
            mu,
            U_kN:      re.U_kN,
            FS_desliz: re.FS_deslizamiento,
            FS_volc:   re.FS_volcamiento,
            e_m:       re.e_m,
          },
        };
        setDatosE(payloadE);
        publicarResultado(payloadE);
      }
    } catch {
      setError('Error en el cálculo. Verificá los datos.');
    }
  };

  const datosActivo = calculo === 'vertedero' ? datosV : calculo === 'filtracion' ? datosF : datosE;

  return (
    <div style={{ padding: 24, color: '#f1f5f9', fontFamily: 'Inter, sans-serif' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(6,182,212,0.05))',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: 16, padding: 24, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>🌊</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Módulo Represas</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Vertederos (Francis) + Filtración (Darcy) | USACE · ICOLD
          </div>
          <div style={{
            marginTop: 6, fontSize: 11, color: '#06b6d4',
            background: 'rgba(6,182,212,0.1)', padding: '2px 10px',
            borderRadius: 20, display: 'inline-block',
          }}>
            USACE EM 1110-2-1603 · USACE EM 1110-2-1901 · ICOLD Bulletin 58
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{
        display: 'flex', background: '#0a0f1e', borderRadius: 12,
        padding: 4, marginBottom: 24, border: '1px solid rgba(6,182,212,0.15)',
      }}>
        {(['vertedero', 'filtracion', 'estabilidad'] as const).map(t => (
          <button key={t} onClick={() => { setCalculo(t); setError(''); setResV(null); setResF(null); setResE(null); }}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: calculo === t ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'transparent',
              color: calculo === t ? '#fff' : '#475569',
              boxShadow: calculo === t ? '0 4px 12px rgba(6,182,212,0.4)' : 'none',
            }}>
            {t === 'vertedero' ? 'Vertedero Francis' : t === 'filtracion' ? 'Filtración Darcy' : 'Estabilidad Presa'}
          </button>
        ))}
      </div>

      {/* FORMULARIO VERTEDERO */}
      {calculo === 'vertedero' && (
        <div>
          <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' as const }}>
            Parámetros — Fórmula de Francis
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Longitud vertedero L (m)</label>
              <input value={L} onChange={e => setL(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Carga hidráulica H (m)</label>
              <input value={H} onChange={e => setH(e.target.value)} style={inp} type="number" min="0" step="0.01" />
            </div>
            <div>
              <label style={lbl}>Coef. descarga Cd (Francis=1.84)</label>
              <input value={Cd} onChange={e => setCd(e.target.value)} style={inp} type="number" min="0" step="0.01" />
            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO FILTRACIÓN */}
      {calculo === 'filtracion' && (
        <div>
          <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' as const }}>
            Parámetros — Ley de Darcy
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Carga hidráulica H (m)</label>
              <input value={Hf} onChange={e => setHf(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Conductividad hidráulica k (m/s)</label>
              <input value={k} onChange={e => setK(e.target.value)} style={inp} type="number" min="0" step="0.00001" />
            </div>
            <div>
              <label style={lbl}>Longitud de filtración L (m)</label>
              <input value={Lf} onChange={e => setLf(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Espesor estrato d (m)</label>
              <input value={d} onChange={e => setD(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO ESTABILIDAD */}
      {calculo === 'estabilidad' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Cargar desde activo monitoreado (opcional)</label>
            <select
              value={activoElegido?.id ?? ''}
              onChange={e => {
                const id = e.target.value;
                const encontrado = activosRepresa.find(a => a.id === id) ?? null;
                setActivoElegido(encontrado);
              }}
              style={inp}
            >
              <option value="">Sin activo — carga manual</option>
              {activosRepresa.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' as const }}>
            Parámetros — Estabilidad Presa de Gravedad
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Altura de agua Hw (m)</label>
              <input value={He} onChange={e => setHe(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Base de la presa B (m)</label>
              <input value={Be} onChange={e => setBe(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Altura de la presa Hd (m)</label>
              <input value={HdE} onChange={e => setHdE(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Peso especifico hormigon (kN/m³)</label>
              <input value={gammaH} onChange={e => setGammaH(e.target.value)} style={inp} type="number" min="0" step="0.1" />
            </div>
            <div>
              <label style={lbl}>Peso especifico agua (kN/m³)</label>
              <input value={gammaW} onChange={e => setGammaW(e.target.value)} style={inp} type="number" min="0" step="0.01" />
            </div>
            <div>
              <label style={lbl}>Coef. friccion base μ</label>
              <input value={muE} onChange={e => setMuE(e.target.value)} style={inp} type="number" min="0" step="0.01" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 16,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', fontSize: 13,
        }}>{error}</div>
      )}

      <button onClick={calcular} style={{
        width: '100%', padding: '13px 0', marginBottom: 24,
        background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
        border: 'none', borderRadius: 12, color: '#fff',
        fontSize: 15, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(6,182,212,0.4)',
      }}>
        Calcular
      </button>

      {/* RESULTADO VERTEDERO */}
      {resV && (
        <div style={{
          background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)',
          borderRadius: 16, padding: 20,
        }}>
          <div style={{ fontSize: 13, color: '#06b6d4', fontWeight: 700, marginBottom: 16 }}>
            RESULTADO — VERTEDERO FRANCIS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Caudal Q', value: `${resV.Q} m³/s` },
              { label: 'Velocidad v', value: `${resV.v} m/s` },
              { label: 'Número de Froude', value: resV.Fr },
              { label: 'Régimen', value: resV.tipo },
            ].map((r, i) => (
              <div key={i} style={{ background: '#0a0f1e', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, textTransform: 'uppercase' as const }}>{r.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#06b6d4' }}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#475569', padding: '8px 12px', background: '#0a0f1e', borderRadius: 8 }}>
            {resV.normativa}
          </div>
        </div>
      )}

      {/* RESULTADO FILTRACIÓN */}
      {resF && (
        <div style={{
          background: resF.seguro ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${resF.seguro ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 16, padding: 20,
        }}>
          <div style={{ fontSize: 13, color: resF.seguro ? '#4ade80' : '#f87171', fontWeight: 700, marginBottom: 16 }}>
            RESULTADO — FILTRACIÓN DARCY · {resF.seguro ? '✅ GRADIENTE SEGURO' : '⚠️ GRADIENTE CRÍTICO'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Caudal filtración q', value: `${resF.q} m²/s` },
              { label: 'Gradiente hidráulico i', value: resF.gradiente },
              { label: 'Estado', value: resF.seguro ? 'Seguro (i < 0.5)' : 'Crítico (i ≥ 0.5)' },
              { label: 'Criterio Terzaghi', value: 'icrit = 0.5' },
            ].map((r, i) => (
              <div key={i} style={{ background: '#0a0f1e', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, textTransform: 'uppercase' as const }}>{r.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: resF.seguro ? '#4ade80' : '#f87171' }}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#475569', padding: '8px 12px', background: '#0a0f1e', borderRadius: 8 }}>
            {resF.normativa}
          </div>
        </div>
      )}

      {/* RESULTADO ESTABILIDAD */}
      {resE && (
        <div style={{
          background: resE.riesgo === 'LOW' ? 'rgba(34,197,94,0.08)' : resE.riesgo === 'HIGH' ? 'rgba(232,160,32,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${resE.riesgo === 'LOW' ? 'rgba(34,197,94,0.25)' : resE.riesgo === 'HIGH' ? 'rgba(232,160,32,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 16, padding: 20,
        }}>
          <div style={{ fontSize: 13, color: resE.riesgo === 'LOW' ? '#4ade80' : resE.riesgo === 'HIGH' ? '#E8A020' : '#f87171', fontWeight: 700, marginBottom: 16 }}>
            RESULTADO — ESTABILIDAD PRESA DE GRAVEDAD · {resE.riesgo === 'LOW' ? '✅ ESTABLE' : resE.riesgo === 'HIGH' ? '⚠️ REVISAR' : '🛑 CRITICO'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Empuje horizontal Pw', value: `${resE.Pw_kN} kN/m`, ok: null },
              { label: 'Peso propio W', value: `${resE.W_kN} kN/m`, ok: null },
              { label: 'Subpresion U', value: `${resE.U_kN} kN/m`, ok: null },
              { label: 'FS deslizamiento', value: `${resE.FS_deslizamiento}${resE.FS_deslizamiento >= 1.5 ? ' ✅ Cumple' : ' ⚠️ No cumple'}`, ok: resE.FS_deslizamiento >= 1.5 },
              { label: 'FS vuelco', value: `${resE.FS_volcamiento}${resE.FS_volcamiento >= 1.5 ? ' ✅ Cumple' : ' ⚠️ No cumple'}`, ok: resE.FS_volcamiento >= 1.5 },
              { label: 'FS minimo aceptable', value: '1.5 (USACE EM 1110-2-2100)', ok: null },
            ].map((r, i) => (
              <div key={i} style={{ background: '#0a0f1e', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, textTransform: 'uppercase' as const }}>{r.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: r.ok === null ? '#06b6d4' : r.ok ? '#4ade80' : '#f97316' }}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#475569', padding: '8px 12px', background: '#0a0f1e', borderRadius: 8 }}>
            {resE.normativa}
          </div>
        </div>
      )}
      {datosActivo && <BotonesExportar visible={true} datos={datosActivo} />}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: '#0a0f1e', border: '1px solid rgba(6,182,212,0.2)',
  borderRadius: 10, color: '#f1f5f9', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#64748b', marginBottom: 6, letterSpacing: 0.5,
  textTransform: 'uppercase',
};