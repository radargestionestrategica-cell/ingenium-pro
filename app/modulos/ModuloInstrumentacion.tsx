'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { useState } from 'react';
import {
  linealizarTermocupla, TipoTermocupla, linealizarRTD, TipoRTD,
  evaluarTolerancia, SensorTolerancia, ClaseTermocupla, ClaseRTD,
  calcularErrorCableRTD, CantidadHilosRTD,
  calcularPresupuestoIncertidumbre,
} from '@/lib/calculosInstrumentacion';

type SensorInstrumentacion =
  | { kind: 'termocupla'; tipo: TipoTermocupla; label: string; tipoCalculo: string }
  | { kind: 'rtd'; r0: TipoRTD; label: string; tipoCalculo: string };

const TIPOS_SENSOR: SensorInstrumentacion[] = [
  { kind: 'termocupla', tipo: 'K',   label: 'Tipo K — Cromel/Alumel (0°C a 500°C)',     tipoCalculo: 'INSTRUMENTACION_TERMOCUPLA_K' },
  { kind: 'termocupla', tipo: 'J',   label: 'Tipo J — Hierro/Constantán (0°C a 760°C)',  tipoCalculo: 'INSTRUMENTACION_TERMOCUPLA_J' },
  { kind: 'rtd',        r0: 100,     label: 'RTD Pt100 — IEC 60751 (-200°C a 850°C)',    tipoCalculo: 'INSTRUMENTACION_RTD_PT100' },
  { kind: 'rtd',        r0: 1000,    label: 'RTD Pt1000 — IEC 60751 (-200°C a 850°C)',   tipoCalculo: 'INSTRUMENTACION_RTD_PT1000' },
];

const CLASES_TERMOCUPLA: { label: string; value: ClaseTermocupla }[] = [
  { label: 'Clase 1 — ±1.5°C hasta 375°C, luego ±0.004·|t|',  value: 1 },
  { label: 'Clase 2 — ±2.5°C hasta 333°C, luego ±0.0075·|t|', value: 2 },
];

const CLASES_RTD: { label: string; value: ClaseRTD }[] = [
  { label: 'Clase AA — ±(0.10 + 0.0017·|t|)°C', value: 'AA' },
  { label: 'Clase A — ±(0.15 + 0.002·|t|)°C',   value: 'A' },
  { label: 'Clase B — ±(0.30 + 0.005·|t|)°C',   value: 'B' },
  { label: 'Clase C — ±(0.60 + 0.01·|t|)°C',    value: 'C' },
];

const OPCIONES_HILOS: { label: string; value: CantidadHilosRTD }[] = [
  { label: '2 hilos', value: 2 },
  { label: '3 hilos', value: 3 },
  { label: '4 hilos', value: 4 },
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

  const [claseIdx,        setClaseIdx]        = useState(0);
  const [tempEsperada,    setTempEsperada]    = useState('');
  const [resTolerancia,   setResTolerancia]   = useState<ReturnType<typeof evaluarTolerancia> | null>(null);
  const [errorTolerancia, setErrorTolerancia] = useState('');

  const [hilos,          setHilos]          = useState<CantidadHilosRTD>(2);
  const [awgCable,       setAwgCable]       = useState('22');
  const [longitudCable,  setLongitudCable]  = useState('100');
  const [resErrorCable,  setResErrorCable]  = useState<ReturnType<typeof calcularErrorCableRTD> | null>(null);
  const [errorCable,     setErrorCable]     = useState('');

  const [resolucionInstrumento,       setResolucionInstrumento]       = useState('0.1');
  const [desviacionEstandarLecturas,  setDesviacionEstandarLecturas]  = useState('');
  const [cantidadLecturas,            setCantidadLecturas]            = useState('');
  const [resIncertidumbre,            setResIncertidumbre]            = useState<ReturnType<typeof calcularPresupuestoIncertidumbre> | null>(null);
  const [errorIncertidumbre,          setErrorIncertidumbre]          = useState('');

  const sensor = TIPOS_SENSOR[tipoIdx];
  const unidadSenal = sensor.kind === 'termocupla' ? 'mV' : 'Ω';
  const clasesDisponibles = sensor.kind === 'termocupla' ? CLASES_TERMOCUPLA : CLASES_RTD;

  const calcular = () => {
    setError('');
    setResTolerancia(null);
    setResIncertidumbre(null);
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

  const verificarTolerancia = () => {
    setErrorTolerancia('');
    setResIncertidumbre(null);
    if (!res) return;
    const esperada = parseFloat(tempEsperada);
    if (isNaN(esperada)) {
      setErrorTolerancia('Ingresá la temperatura esperada / de referencia (°C).');
      return;
    }
    const claseSeleccionada = clasesDisponibles[claseIdx].value;
    const sensorTolerancia: SensorTolerancia = sensor.kind === 'termocupla'
      ? { familia: 'termocupla', clase: claseSeleccionada as ClaseTermocupla }
      : { familia: 'rtd', clase: claseSeleccionada as ClaseRTD };
    const rt = evaluarTolerancia(sensorTolerancia, esperada, res.celsius);
    setResTolerancia(rt);
  };

  const calcularErrorCable = () => {
    setErrorCable('');
    if (sensor.kind !== 'rtd') return;
    const awgNum = parseFloat(awgCable);
    const longNum = parseFloat(longitudCable);
    if (isNaN(awgNum) || isNaN(longNum)) {
      setErrorCable('Ingresá AWG y longitud numéricos válidos.');
      return;
    }
    const r = calcularErrorCableRTD(hilos, awgNum, longNum, sensor.r0);
    setResErrorCable(r);
  };

  const calcularIncertidumbre = () => {
    setErrorIncertidumbre('');
    if (!resTolerancia) {
      setErrorIncertidumbre('Primero verificá la tolerancia — el presupuesto de incertidumbre usa ese resultado.');
      return;
    }
    const resolucion = parseFloat(resolucionInstrumento);
    if (isNaN(resolucion)) {
      setErrorIncertidumbre('Ingresá la resolución del instrumento (°C).');
      return;
    }
    const desvTexto = desviacionEstandarLecturas.trim();
    const cantTexto = cantidadLecturas.trim();
    const desviacionEstandarLecturasC = desvTexto === '' ? undefined : parseFloat(desvTexto);
    const cantidadLecturasNum = cantTexto === '' ? undefined : parseFloat(cantTexto);
    if ((desviacionEstandarLecturasC != null && isNaN(desviacionEstandarLecturasC)) ||
        (cantidadLecturasNum != null && isNaN(cantidadLecturasNum))) {
      setErrorIncertidumbre('Desviación estándar y cantidad de lecturas deben ser numéricas.');
      return;
    }
    const errorCableC = sensor.kind === 'rtd' ? (resErrorCable?.errorC ?? 0) : 0;
    const r = calcularPresupuestoIncertidumbre({
      toleranciaC: resTolerancia.toleranciaC,
      errorCableC,
      resolucionInstrumentoC: resolucion,
      desviacionEstandarLecturasC,
      cantidadLecturas: cantidadLecturasNum,
    });
    setResIncertidumbre(r);
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
            <select value={tipoIdx} onChange={e => {
                setTipoIdx(+e.target.value);
                setClaseIdx(0);
                setResTolerancia(null);
                setResErrorCable(null);
                setResIncertidumbre(null);
              }}
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

          {sensor.kind === 'rtd' && (
            <div style={{ marginBottom: 20, paddingTop: 16, borderTop: '1px solid #334155' }}>
              <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Error de cable (opcional)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Hilos</label>
                  <select value={hilos} onChange={e => setHilos(+e.target.value as CantidadHilosRTD)}
                    style={{ ...inputStyle, fontSize: 13 }}>
                    {OPCIONES_HILOS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>AWG del cable</label>
                  <input value={awgCable} onChange={e => setAwgCable(e.target.value)} style={inputStyle} placeholder="Ej: 22" />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Longitud del tramo (m)</label>
                  <input value={longitudCable} onChange={e => setLongitudCable(e.target.value)} style={inputStyle} placeholder="Ej: 100" />
                </div>
              </div>

              {errorCable && (
                <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>
                  {errorCable}
                </div>
              )}

              <button onClick={calcularErrorCable}
                style={{ width: '100%', background: 'transparent', border: '1px solid #475569', borderRadius: 10, padding: '10px 0', color: '#94a3b8', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: 0.5, marginBottom: resErrorCable ? 12 : 0 }}>
                🔌 CALCULAR ERROR DE CABLE
              </button>

              {resErrorCable && (
                <div style={{ background: '#0f172a', border: `1px solid ${resErrorCable.errorC > 0 ? '#ef4444' : TEAL}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ color: '#64748b', fontSize: 10 }}>Error estimado por cableado</div>
                    <div style={{ color: resErrorCable.errorC > 0 ? '#ef4444' : TEAL, fontWeight: 800, fontSize: 15 }}>±{resErrorCable.errorC.toFixed(3)} °C</div>
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>
                    AWG{resErrorCable.awg}: {(resErrorCable.diametroM * 1000).toFixed(4)} mm · {resErrorCable.resistenciaPorMetro.toFixed(5)} Ω/m · {resErrorCable.longitudM} m · {resErrorCable.hilos} hilos
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginBottom: 8 }}>{resErrorCable.nota}</div>
                  <div style={{ fontSize: 10, color: '#475569', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>{resErrorCable.norma}</div>
                </div>
              )}
            </div>
          )}

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

            {/* VERIFICACIÓN DE TOLERANCIA DE FÁBRICA */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #334155' }}>
              <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Verificación de clase de tolerancia de fábrica
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Clase de tolerancia</label>
                  <select value={claseIdx} onChange={e => setClaseIdx(+e.target.value)}
                    style={{ ...inputStyle, fontSize: 13 }}>
                    {clasesDisponibles.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Temperatura esperada / referencia (°C)</label>
                  <input value={tempEsperada} onChange={e => setTempEsperada(e.target.value)}
                    style={inputStyle} placeholder="Ej: 100" />
                </div>
              </div>

              {errorTolerancia && (
                <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                  {errorTolerancia}
                </div>
              )}

              <button onClick={verificarTolerancia}
                style={{ width: '100%', background: 'transparent', border: `1px solid ${TEAL}`, borderRadius: 10, padding: '12px 0', color: TEAL, fontWeight: 800, fontSize: 14, cursor: 'pointer', letterSpacing: 0.5, marginBottom: resTolerancia ? 16 : 0 }}>
                🎯 VERIFICAR TOLERANCIA
              </button>

              {resTolerancia && (
                <div style={{ background: '#0f172a', border: `1px solid ${resTolerancia.dentroDeTolerancia ? TEAL : '#ef4444'}`, borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>Clase {resTolerancia.clase}</div>
                    <div style={{ background: resTolerancia.dentroDeTolerancia ? TEAL : '#ef4444', color: '#000', borderRadius: 20, padding: '4px 12px', fontWeight: 800, fontSize: 11 }}>
                      {resTolerancia.dentroDeTolerancia ? '✅ DENTRO DE TOLERANCIA' : '❌ FUERA DE TOLERANCIA'}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 10 }}>Tolerancia permitida</div>
                      <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>±{resTolerancia.toleranciaC.toFixed(4)} °C</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 10 }}>Desviación medida</div>
                      <div style={{ color: resTolerancia.dentroDeTolerancia ? TEAL : '#ef4444', fontWeight: 700, fontSize: 13 }}>{resTolerancia.desviacionC.toFixed(4)} °C</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 10 }}>Ref. vs. medida</div>
                      <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>{resTolerancia.temperaturaEsperadaC}°C / {resTolerancia.temperaturaMedidaC.toFixed(2)}°C</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>{resTolerancia.norma}</div>
                </div>
              )}

              {/* PRESUPUESTO DE INCERTIDUMBRE */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #334155' }}>
                <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Presupuesto de incertidumbre (GUM)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Resolución instrumento (°C)</label>
                    <input value={resolucionInstrumento} onChange={e => setResolucionInstrumento(e.target.value)}
                      style={inputStyle} placeholder="Ej: 0.1" />
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Desv. estándar lecturas (°C, opcional)</label>
                    <input value={desviacionEstandarLecturas} onChange={e => setDesviacionEstandarLecturas(e.target.value)}
                      style={inputStyle} placeholder="Ej: 0.05" />
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Cantidad de lecturas (opcional)</label>
                    <input value={cantidadLecturas} onChange={e => setCantidadLecturas(e.target.value)}
                      style={inputStyle} placeholder="Ej: 10" />
                  </div>
                </div>

                {errorIncertidumbre && (
                  <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                    {errorIncertidumbre}
                  </div>
                )}

                <button onClick={calcularIncertidumbre}
                  style={{ width: '100%', background: 'transparent', border: `1px solid ${TEAL}`, borderRadius: 10, padding: '12px 0', color: TEAL, fontWeight: 800, fontSize: 14, cursor: 'pointer', letterSpacing: 0.5, marginBottom: resIncertidumbre ? 16 : 0 }}>
                  📐 CALCULAR PRESUPUESTO DE INCERTIDUMBRE
                </button>

                {resIncertidumbre && (
                  <div style={{ background: '#0f172a', border: `1px solid ${TEAL}`, borderRadius: 8, padding: 16 }}>
                    <div style={{ textAlign: 'center' as const, marginBottom: 14 }}>
                      <div style={{ color: '#64748b', fontSize: 10, marginBottom: 4 }}>Resultado final</div>
                      <div style={{ color: TEAL, fontSize: 22, fontWeight: 800 }}>
                        {res!.celsius.toFixed(3)} °C ± {resIncertidumbre.incertidumbreExpandida.toFixed(4)} °C
                      </div>
                      <div style={{ color: '#475569', fontSize: 10 }}>U expandida, k = {resIncertidumbre.factorCobertura} (≈95% de confianza)</div>
                    </div>

                    <div style={{ fontSize: 9, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Componentes</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {resIncertidumbre.componentes.map((c, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', borderRadius: 6, padding: '6px 10px' }}>
                          <div style={{ fontSize: 11, color: '#e2e8f0' }}>{c.nombre} <span style={{ color: '#475569' }}>(Tipo {c.tipo}, {c.distribucion})</span></div>
                          <div style={{ fontSize: 12, color: '#f8fafc', fontWeight: 700, fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>{c.valorC.toFixed(4)} °C</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: 10 }}>uc combinada</div>
                        <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>{resIncertidumbre.uCombinada.toFixed(4)} °C</div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', fontSize: 10 }}>U expandida (k=2)</div>
                        <div style={{ color: TEAL, fontWeight: 700, fontSize: 13 }}>{resIncertidumbre.incertidumbreExpandida.toFixed(4)} °C</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 10, color: '#475569', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>{resIncertidumbre.norma}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTONES EXPORTAR */}
        {datos && <BotonesExportar visible={true} datos={datos} />}

      </div>
    </div>
  );
}
