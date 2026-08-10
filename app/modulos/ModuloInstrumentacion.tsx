'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { useState } from 'react';
import { linealizarTermocupla, TipoTermocupla, linealizarRTD, TipoRTD } from '@/lib/calculosInstrumentacion';

type SensorInstrumentacion =
  | { kind: 'termocupla'; tipo: TipoTermocupla; label: string; tipoCalculo: string }
  | { kind: 'rtd'; r0: TipoRTD; label: string; tipoCalculo: string };

const TIPOS_SENSOR: SensorInstrumentacion[] = [
  { kind: 'termocupla', tipo: 'K',   label: 'Tipo K — Cromel/Alumel (0°C a 500°C)',     tipoCalculo: 'INSTRUMENTACION_TERMOCUPLA_K' },
  { kind: 'termocupla', tipo: 'J',   label: 'Tipo J — Hierro/Constantán (0°C a 760°C)',  tipoCalculo: 'INSTRUMENTACION_TERMOCUPLA_J' },
  { kind: 'rtd',        r0: 100,     label: 'RTD Pt100 — IEC 60751 (-200°C a 850°C)',    tipoCalculo: 'INSTRUMENTACION_RTD_PT100' },
  { kind: 'rtd',        r0: 1000,    label: 'RTD Pt1000 — IEC 60751 (-200°C a 850°C)',   tipoCalculo: 'INSTRUMENTACION_RTD_PT1000' },
];

const TEAL = '#2dd4bf';

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f172a', border: '1px solid #475569',
  borderRadius: 8, padding: '10px 12px', color: '#f8fafc',
  fontSize: 15, boxSizing: 'border-box',
};

export default function ModuloInstrumentacion() {
  const [tipoIdx, setTipoIdx] = useState(0);
  const [senal,   setSenal]   = useState('4.096');
  const [res,     setRes]     = useState<ReturnType<typeof linealizarTermocupla> | ReturnType<typeof linealizarRTD> | null>(null);
  const [datos,   setDatos]   = useState<DatosExportar | null>(null);
  const [error,   setError]   = useState('');

  const sensor = TIPOS_SENSOR[tipoIdx];
  const unidadSenal = sensor.kind === 'termocupla' ? 'mV' : 'Ω';

  const calcular = () => {
    setError('');
    const valor = parseFloat(senal);
    if (isNaN(valor)) {
      setError(`Ingresá un valor numérico válido de señal (${unidadSenal}).`);
      return;
    }
    const r = sensor.kind === 'termocupla'
      ? linealizarTermocupla(sensor.tipo, valor)
      : linealizarRTD(sensor.r0, valor);
    setRes(r);

    const payload: DatosExportar = {
      tipo:       sensor.tipoCalculo,
      moduloId:   'instrumentacion',
      normativa:  r.norma,
      parametros: {
        'Tipo de sensor':                    sensor.label,
        [`Señal medida (${unidadSenal})`]:   senal,
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
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Calibración de sensores de temperatura — termocuplas y RTD</div>
            </div>
          </div>
          <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: NIST ITS-90 (termocuplas Tipo K/J) · IEC 60751 Callendar-Van Dusen (RTD Pt100/Pt1000)
          </div>
        </div>

        {/* FORMULARIO */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Señal del sensor</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Tipo de sensor</label>
            <select value={tipoIdx} onChange={e => setTipoIdx(+e.target.value)}
              style={{ ...inputStyle, fontSize: 14 }}>
              {TIPOS_SENSOR.map((tp, i) => <option key={i} value={i}>{tp.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>
              Señal medida ({unidadSenal}) — {sensor.kind === 'termocupla' ? 'mV de la termocupla' : 'Ω de la RTD'}
            </label>
            <input value={senal} onChange={e => setSenal(e.target.value)}
              style={{ ...inputStyle, width: '50%' }}
              placeholder={sensor.kind === 'termocupla' ? 'Ej: 4.096' : 'Ej: 138.5050'} />
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
                <div style={{ color: '#475569', fontSize: 10 }}>
                  {'tipo' in res
                    ? `Tipo ${res.tipo} · ${res.milivoltios} mV medidos`
                    : `Pt${res.r0} · ${res.resistenciaOhms} Ω medidos`}
                </div>
              </div>
            </div>

            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#a78bfa', marginBottom: 4, fontWeight: 700 }}>
                {'tipo' in res ? 'POLINOMIO NIST ITS-90 (INVERSO):' : 'CALLENDAR-VAN DUSEN (IEC 60751):'}
              </div>
              {'tipo' in res
                ? 't90 = Σ dᵢ·Eᵢ, i = 0..9, E en mV'
                : res.celsius >= 0
                  ? 'R = R0·(1 + A·T + B·T²) — cuadrática directa'
                  : 'R = R0·(1 + A·T + B·T² + C·(T−100)·T³) — Newton-Raphson'}
              <div style={{ marginTop: 8, color: '#64748b' }}>
                Rango válido: {res.rango.min}°C a {res.rango.max}°C
              </div>
              <div style={{ marginTop: 4, color: '#475569' }}>{res.norma} — {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* BOTONES EXPORTAR */}
        {datos && <BotonesExportar visible={true} datos={datos} />}

      </div>
    </div>
  );
}
