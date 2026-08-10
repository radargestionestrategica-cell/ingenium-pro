'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { useState } from 'react';
import { linealizarTermocupla, TipoTermocupla } from '@/lib/calculosInstrumentacion';

const TIPOS_TERMOCUPLA: { label: string; value: TipoTermocupla; tipoCalculo: string }[] = [
  { label: 'Tipo K — Cromel/Alumel (0°C a 500°C)',    value: 'K', tipoCalculo: 'INSTRUMENTACION_TERMOCUPLA_K' },
  { label: 'Tipo J — Hierro/Constantán (0°C a 760°C)', value: 'J', tipoCalculo: 'INSTRUMENTACION_TERMOCUPLA_J' },
];

const TEAL = '#2dd4bf';

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f172a', border: '1px solid #475569',
  borderRadius: 8, padding: '10px 12px', color: '#f8fafc',
  fontSize: 15, boxSizing: 'border-box',
};

export default function ModuloInstrumentacion() {
  const [tipoIdx, setTipoIdx] = useState(0);
  const [mV,      setMV]      = useState('4.096');
  const [res,     setRes]     = useState<ReturnType<typeof linealizarTermocupla> | null>(null);
  const [datos,   setDatos]   = useState<DatosExportar | null>(null);
  const [error,   setError]   = useState('');

  const calcular = () => {
    setError('');
    const e = parseFloat(mV);
    if (isNaN(e)) {
      setError('Ingresá un valor numérico válido de milivoltios.');
      return;
    }
    const tipo = TIPOS_TERMOCUPLA[tipoIdx].value;
    const r = linealizarTermocupla(tipo, e);
    setRes(r);

    const payload: DatosExportar = {
      tipo:       TIPOS_TERMOCUPLA[tipoIdx].tipoCalculo,
      moduloId:   'instrumentacion',
      normativa:  r.norma,
      parametros: {
        'Tipo de termocupla': TIPOS_TERMOCUPLA[tipoIdx].label,
        'Señal medida (mV)':  mV,
      },
      resultado: {
        'Temperatura (°C)':  +r.celsius.toFixed(3),
        'Dentro de rango':   r.dentroDeRango ? 'Sí' : 'No',
        'Rango válido (°C)': `${r.rango.min} a ${r.rango.max}`,
      },
      alerta: !r.dentroDeRango,
    };
    setDatos(payload);
    publicarResultado(payload);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${TEAL},#0d9488)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📟</div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Módulo Electrónica de Instrumentación</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Calibración de termocupla — Linealización NIST ITS-90</div>
            </div>
          </div>
          <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: NIST ITS-90 Thermocouple Database — Polinomio inverso mV → °C, Tipo K, rango 0°C a 500°C
          </div>
        </div>

        {/* FORMULARIO */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Señal de termocupla</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Tipo de termocupla</label>
            <select value={tipoIdx} onChange={e => setTipoIdx(+e.target.value)}
              style={{ ...inputStyle, fontSize: 14 }}>
              {TIPOS_TERMOCUPLA.map((tp, i) => <option key={i} value={i}>{tp.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Señal medida (mV)</label>
            <input value={mV} onChange={e => setMV(e.target.value)}
              style={{ ...inputStyle, width: '50%' }}
              placeholder="Ej: 4.096" />
          </div>

          {error && (
            <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button onClick={calcular}
            style={{ width: '100%', background: `linear-gradient(135deg,${TEAL},#0d9488)`, border: 'none', borderRadius: 10, padding: '14px 0', color: '#000', fontWeight: 800, fontSize: 16, cursor: 'pointer', letterSpacing: 0.5 }}>
            ⚡ CALCULAR TEMPERATURA
          </button>
        </div>

        {/* RESULTADOS */}
        {res && (
          <div style={{ background: '#1e293b', border: `2px solid ${res.dentroDeRango ? TEAL : '#ef4444'}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Resultado de calibración</div>
              <div style={{ background: res.dentroDeRango ? TEAL : '#ef4444', color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {res.dentroDeRango ? '🟢 EN RANGO' : '🔴 FUERA DE RANGO'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' as const }}>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Temperatura calculada</div>
                <div style={{ color: res.dentroDeRango ? TEAL : '#ef4444', fontSize: 28, fontWeight: 800 }}>{res.celsius.toFixed(2)} °C</div>
                <div style={{ color: '#475569', fontSize: 10 }}>Tipo {res.tipo} · {res.milivoltios} mV medidos</div>
              </div>
            </div>

            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#a78bfa', marginBottom: 4, fontWeight: 700 }}>POLINOMIO NIST ITS-90 (INVERSO, TIPO K):</div>
              t90 = Σ dᵢ·Eᵢ, i = 0..9, E en mV
              <div style={{ marginTop: 8, color: '#64748b' }}>
                Rango válido: {res.rango.min}°C a {res.rango.max}°C
              </div>
              <div style={{ marginTop: 4, color: '#475569' }}>NIST ITS-90 Thermocouple Database — {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* BOTONES EXPORTAR */}
        {datos && <BotonesExportar visible={true} datos={datos} />}

      </div>
    </div>
  );
}
