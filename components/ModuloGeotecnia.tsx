'use client';
import { useState } from 'react';

// Capacidad portante - Meyerhof con nivel freatico
// Referencia: Meyerhof (1963) + Das (2011) Principles of Foundation Engineering
function calcCapacidadPortante(
  suelo: string, B: number, L: number, Df: number,
  Q_kN: number, FS: number, Dw: number
) {
  if (B <= 0 || L <= 0 || Df <= 0) return null;

  const DB: Record<string, { Nq: number; Nc: number; Ng: number; c: number; phi: number; gamma: number; gamma_sat: number }> = {
    arena_suelta:   { Nq: 14.7, Nc: 25.8, Ng: 12.4, c: 0,   phi: 30, gamma: 1600, gamma_sat: 1900 },
    arena_compacta: { Nq: 33.3, Nc: 46.1, Ng: 37.2, c: 0,   phi: 35, gamma: 1850, gamma_sat: 2050 },
    arcilla_blanda: { Nq: 1.0,  Nc: 5.14, Ng: 0,    c: 25,  phi: 0,  gamma: 1500, gamma_sat: 1750 },
    arcilla_media:  { Nq: 1.0,  Nc: 5.14, Ng: 0,    c: 50,  phi: 0,  gamma: 1700, gamma_sat: 1900 },
    arcilla_firme:  { Nq: 1.0,  Nc: 5.14, Ng: 0,    c: 100, phi: 0,  gamma: 1800, gamma_sat: 1980 },
    grava:          { Nq: 64.2, Nc: 75.3, Ng: 93.7, c: 0,   phi: 40, gamma: 2000, gamma_sat: 2200 },
  };

  const d = DB[suelo] || DB.arcilla_media;
  const gamma_w = 9.81;

  // Peso especifico efectivo con nivel freatico (Meyerhof)
  const gamma_ef = Dw <= Df
    ? (d.gamma_sat - 1000) * gamma_w / 1000
    : d.gamma / 1000 * gamma_w;

  const gamma_base   = d.gamma / 1000 * gamma_w;
  const q_sobrecarga = gamma_base * Df;

  // Factores de forma (Meyerhof)
  const sc = 1 + 0.2 * (B / L);
  const sq = 1 + 0.1 * (B / L);
  const sg = Math.max(0.1, 1 - 0.4 * (B / L));

  // Capacidad portante ultima
  const qu = d.c * d.Nc * sc + q_sobrecarga * d.Nq * sq + 0.5 * gamma_ef * B * d.Ng * sg;
  const qa = qu / FS;
  const q_aplicada  = Q_kN / (B * L);
  const utilizacion = (q_aplicada / qa) * 100;

  const freatic = Dw <= Df ? 'NIVEL FREATICO REDUCE PORTANTE' : 'Sin efecto freatico';
  const riesgo  = q_aplicada > qa ? 'CRITICAL' : utilizacion > 80 ? 'HIGH' : utilizacion > 60 ? 'MEDIUM' : 'LOW';

  return {
    qu: +qu.toFixed(1), qa: +qa.toFixed(1), q_aplicada: +q_aplicada.toFixed(1),
    utilizacion: +utilizacion.toFixed(1), ok: q_aplicada <= qa,
    freatic, riesgo, phi: d.phi, c: d.c,
    Nq: d.Nq, Nc: d.Nc, Ng: d.Ng
  };
}

// Estabilidad de taludes - Bishop Simplificado
// Referencia: Bishop (1955) + Fellenius - CIRSOC 102
function calcEstabilidadTalud(
  H: number, beta_deg: number, c: number,
  phi_deg: number, gamma: number, Dw: number
) {
  if (H <= 0 || beta_deg <= 0 || beta_deg >= 90) return null;

  const phi  = phi_deg  * Math.PI / 180;
  const beta = beta_deg * Math.PI / 180;

  // Radio del circulo critico aproximado
  const R    = H / Math.sin(beta) * 0.8;
  const n_dov = 8;
  let sum_num = 0;
  let sum_den = 0;

  for (let i = 0; i < n_dov; i++) {
    const x     = (i + 0.5) * H * Math.cos(beta) / n_dov;
    const alpha  = Math.asin(Math.min(x / R, 0.99));
    const h_dov  = H - x * Math.tan(beta);
    const b_dov  = H * Math.cos(beta) / n_dov;
    const W      = (gamma / 1000) * h_dov * b_dov;

    // Presion de poro (simplificada)
    const u = Dw < h_dov ? 9.81 * (h_dov - Dw) * 0.3 : 0;

    const m_alpha = Math.cos(alpha) + Math.sin(alpha) * Math.tan(phi) / 1.3;
    const safe_m  = Math.max(m_alpha, 0.1);

    sum_num += (c * b_dov + (W - u * b_dov) * Math.tan(phi)) / safe_m;
    sum_den += W * Math.sin(alpha);
  }

  const FS     = sum_den > 0 ? sum_num / sum_den : 999;
  const riesgo = FS < 1.0 ? 'CRITICAL' : FS < 1.3 ? 'HIGH' : FS < 1.5 ? 'MEDIUM' : 'LOW';
  const estado = FS >= 1.5
    ? 'ESTABLE'
    : FS >= 1.3
      ? 'MARGINALMENTE ESTABLE'
      : 'INESTABLE — RIESGO DE DESLIZAMIENTO';

  return { FS: +FS.toFixed(2), riesgo, estado };
}

const SUELOS = [
  { id: 'arena_suelta',   label: 'Arena suelta (phi=30)'       },
  { id: 'arena_compacta', label: 'Arena compacta (phi=35)'     },
  { id: 'arcilla_blanda', label: 'Arcilla blanda (c=25 kPa)'  },
  { id: 'arcilla_media',  label: 'Arcilla media (c=50 kPa)'   },
  { id: 'arcilla_firme',  label: 'Arcilla firme (c=100 kPa)'  },
  { id: 'grava',          label: 'Grava (phi=40)'              },
];

const riskColor: Record<string, string> = {
  LOW: '#00E5A0', MEDIUM: '#E8A020', HIGH: '#ef4444', CRITICAL: '#dc2626'
};
const riskLabel: Record<string, string> = {
  LOW: 'SEGURO', MEDIUM: 'MONITOREAR', HIGH: 'REVISAR', CRITICAL: 'DETENER'
};

export default function ModuloGeotecnia() {
  const [tab, setTab] = useState<'cp' | 'et'>('cp');

  // Capacidad portante
  const [suelo, setSuelo] = useState('arcilla_media');
  const [B,     setB]     = useState('1.5');
  const [L2,    setL2]    = useState('2.0');
  const [Df,    setDf]    = useState('1.2');
  const [Q,     setQ]     = useState('500');
  const [FS,    setFS]    = useState('3.0');
  const [Dw,    setDw]    = useState('10');
  const [resCP, setResCP] = useState<ReturnType<typeof calcCapacidadPortante>>(null);

  // Estabilidad talud
  const [H,     setH]     = useState('8');
  const [beta,  setBeta]  = useState('35');
  const [c,     setC]     = useState('40');
  const [phi,   setPhi]   = useState('28');
  const [gamma, setGamma] = useState('1800');
  const [DwT,   setDwT]   = useState('5');
  const [resET, setResET] = useState<ReturnType<typeof calcEstabilidadTalud>>(null);
  const [error, setError] = useState('');

  const calcCP = () => {
    setError('');
    const r = calcCapacidadPortante(
      suelo, parseFloat(B), parseFloat(L2), parseFloat(Df),
      parseFloat(Q), parseFloat(FS), parseFloat(Dw)
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResCP(r);
  };

  const calcET = () => {
    setError('');
    const r = calcEstabilidadTalud(
      parseFloat(H), parseFloat(beta), parseFloat(c),
      parseFloat(phi), parseFloat(gamma), parseFloat(DwT)
    );
    if (!r) { setError('Verificar datos de entrada.'); return; }
    setResET(r);
  };

  const inputStyle = {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #475569',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#f8fafc',
    fontSize: 15,
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#84cc16,#4d7c0f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              🌍
            </div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Modulo Geotecnia</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Capacidad Portante (Meyerhof) + Estabilidad Taludes (Bishop)</div>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: CIRSOC 102 | Meyerhof 1963 | Bishop 1955 | Das 2011 | ASCE 7
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'cp', label: 'Capacidad Portante' },
            { id: 'et', label: 'Estabilidad Taludes' }
          ].map(t2 => (
            <button key={t2.id} onClick={() => setTab(t2.id as 'cp' | 'et')}
              style={{
                flex: 1, padding: 10,
                background: tab === t2.id ? '#84cc16' : '#1e293b',
                border: '1px solid #334155', borderRadius: 8,
                color: tab === t2.id ? '#000' : 'white',
                fontWeight: tab === t2.id ? 800 : 400,
                cursor: 'pointer', fontSize: 13,
              }}>
              {t2.label}
            </button>
          ))}
        </div>

        {/* CAPACIDAD PORTANTE */}
        {tab === 'cp' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#84cc16', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Parametros Cimentacion — Meyerhof
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Tipo de suelo</label>
              <select value={suelo} onChange={e => setSuelo(e.target.value)} style={{ ...inputStyle, fontSize: 14 }}>
                {SUELOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Ancho B (m)',               val: B,  set: setB  },
                { label: 'Largo L (m)',               val: L2, set: setL2 },
                { label: 'Profundidad Df (m)',         val: Df, set: setDf },
                { label: 'Carga Q (kN)',               val: Q,  set: setQ  },
                { label: 'Factor seguridad FS',        val: FS, set: setFS },
                { label: 'Nivel freatico Dw (m)',      val: Dw, set: setDw },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            {error && (
              <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button onClick={calcCP}
              style={{ width: '100%', background: 'linear-gradient(135deg,#84cc16,#4d7c0f)', border: 'none', borderRadius: 10, padding: 14, color: '#000', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR CAPACIDAD PORTANTE
            </button>
          </div>
        )}

        {/* ESTABILIDAD TALUDES */}
        {tab === 'et' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ color: '#84cc16', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase' as const }}>
              Parametros Talud — Bishop Simplificado
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Altura H (m)',                    val: H,     set: setH     },
                { label: 'Angulo beta (grados)',            val: beta,  set: setBeta  },
                { label: 'Cohesion c (kPa)',                val: c,     set: setC     },
                { label: 'Angulo friccion phi (grados)',    val: phi,   set: setPhi   },
                { label: 'Peso especifico gamma (kg/m3)',   val: gamma, set: setGamma },
                { label: 'Nivel freatico Dw (m)',          val: DwT,   set: setDwT   },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            {error && (
              <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button onClick={calcET}
              style={{ width: '100%', background: 'linear-gradient(135deg,#84cc16,#4d7c0f)', border: 'none', borderRadius: 10, padding: 14, color: '#000', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              CALCULAR ESTABILIDAD DE TALUD
            </button>
          </div>
        )}

        {/* RESULTADOS CAPACIDAD PORTANTE */}
        {tab === 'cp' && resCP && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resCP.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Capacidad Portante</div>
              <div style={{ background: riskColor[resCP.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {riskLabel[resCP.riesgo]}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'qu ultima',   value: resCP.qu + ' kPa'          },
                { label: 'qa admisible',value: resCP.qa + ' kPa'          },
                { label: 'q aplicada',  value: resCP.q_aplicada + ' kPa'  },
                { label: 'Utilizacion', value: resCP.utilizacion + '%'    },
                { label: 'Nq',          value: resCP.Nq.toString()        },
                { label: 'Nc',          value: resCP.Nc.toString()        },
              ].map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ color: riskColor[resCP.riesgo], fontSize: 14, fontWeight: 800 }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: resCP.ok ? '#0a2a1a' : '#2a0a0a', border: `1px solid ${resCP.ok ? '#00e5a0' : '#dc2626'}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ color: resCP.ok ? '#00e5a0' : '#dc2626', fontWeight: 800, fontSize: 14 }}>
                {resCP.ok
                  ? 'CIMENTACION APTA — q aplicada < qa admisible'
                  : 'CIMENTACION NO APTA — Aumentar B, L o Df'}
              </div>
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#84cc16', marginBottom: 4, fontWeight: 700 }}>FORMULA MEYERHOF:</div>
              qu = c·Nc·sc + q·Nq·sq + 0.5·gamma·B·Ng·sg
              <div style={{ marginTop: 4, color: '#475569' }}>{resCP.freatic}</div>
              <div style={{ marginTop: 4, color: '#475569' }}>Meyerhof 1963 | CIRSOC 102 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* RESULTADOS ESTABILIDAD TALUDES */}
        {tab === 'et' && resET && (
          <div style={{ background: '#1e293b', border: `2px solid ${riskColor[resET.riesgo]}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultados Estabilidad de Talud</div>
              <div style={{ background: riskColor[resET.riesgo], color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {riskLabel[resET.riesgo]}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 20, textAlign: 'center' as const }}>
                <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>Factor de Seguridad FS</div>
                <div style={{ color: riskColor[resET.riesgo], fontSize: 36, fontWeight: 900 }}>{resET.FS}</div>
                <div style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>FS min. requerido: 1.5</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ color: riskColor[resET.riesgo], fontWeight: 800, fontSize: 14 }}>{resET.estado}</div>
                  <div style={{ color: '#475569', fontSize: 11, marginTop: 8 }}>
                    {resET.FS >= 1.5
                      ? 'Cumple norma CIRSOC 102'
                      : resET.FS >= 1.3
                        ? 'Revisar y monitorear'
                        : 'Requiere mejoramiento inmediato'}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#84cc16', marginBottom: 4, fontWeight: 700 }}>METODO BISHOP SIMPLIFICADO:</div>
              FS = Sum[(c·b + (W-u·b)·tan(phi)) / m_alpha] / Sum[W·sin(alpha)]
              <div style={{ marginTop: 4, color: '#475569' }}>Bishop 1955 | CIRSOC 102 | {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
} 