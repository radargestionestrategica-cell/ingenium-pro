'use client';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import HistorialActivo from '@/components/HistorialActivo';
import type { RiesgoDetectado } from '@/lib/cruceReglas';
import { useState, useEffect } from 'react';
import {
  linealizarTermocupla, TipoTermocupla, linealizarRTD, TipoRTD,
  evaluarTolerancia, SensorTolerancia, ClaseTermocupla, ClaseRTD,
  calcularErrorCableRTD, CantidadHilosRTD,
  calcularPresupuestoIncertidumbre,
  convertirSenalIngenieria, clasificarSenalNE43, calcularPresupuestoEnergiaLazo,
  evaluarEmisionFCC, TipoEmisionFCC, ResultadoEmisionFCC,
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

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

type ValorMensual = { mes: string; valor: number };
type NasaPowerResp = {
  lat: number; lon: number; unidad: string;
  valoresMensuales: ValorMensual[];
  promedioAnual: number;
  mesMasDesfavorable: ValorMensual;
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f172a', border: '1px solid #475569',
  borderRadius: 8, padding: '10px 12px', color: '#f8fafc',
  fontSize: 15, boxSizing: 'border-box',
};

// ── Fusión del resultado guardado/exportado con los pasos opcionales ──
// Cada helper agrega sus campos solo si el paso correspondiente ya se
// calculó (parámetro no nulo); si no, devuelve el resultado sin tocar.

function construirResultadoBase(r: { celsius: number; dentroDeRango: boolean; rango: { min: number; max: number } }): Record<string, unknown> {
  return {
    'Temperatura (°C)':  +r.celsius.toFixed(3),
    'Dentro de rango':   r.dentroDeRango ? 'Sí' : 'No',
    'Rango válido (°C)': `${r.rango.min} a ${r.rango.max}`,
  };
}

function conErrorCable(resultado: Record<string, unknown>, rc: ReturnType<typeof calcularErrorCableRTD> | null): Record<string, unknown> {
  if (!rc) return resultado;
  return {
    ...resultado,
    'Cable — Hilos':               rc.hilos,
    'Cable — AWG':                 rc.awg,
    'Cable — Longitud (m)':        rc.longitudM,
    'Cable — Error estimado (°C)': +rc.errorC.toFixed(4),
  };
}

function conTolerancia(resultado: Record<string, unknown>, rt: ReturnType<typeof evaluarTolerancia> | null): Record<string, unknown> {
  if (!rt) return resultado;
  return {
    ...resultado,
    'Tolerancia — Clase':                       rt.clase,
    'Tolerancia — Temperatura esperada (°C)':   rt.temperaturaEsperadaC,
    'Tolerancia — Tolerancia permitida (°C)':   +rt.toleranciaC.toFixed(4),
    'Tolerancia — Desviación (°C)':             +rt.desviacionC.toFixed(4),
    'Tolerancia — Dentro de tolerancia':        rt.dentroDeTolerancia ? 'Sí' : 'No',
  };
}

function conIncertidumbre(resultado: Record<string, unknown>, ri: ReturnType<typeof calcularPresupuestoIncertidumbre> | null): Record<string, unknown> {
  if (!ri) return resultado;
  const conComponentes = ri.componentes.reduce<Record<string, unknown>>((acc, c) => {
    acc[`Incertidumbre — ${c.nombre} (Tipo ${c.tipo}, °C)`] = +c.valorC.toFixed(4);
    return acc;
  }, { ...resultado });
  conComponentes['Incertidumbre — uc combinada (°C)']       = +ri.uCombinada.toFixed(4);
  conComponentes['Incertidumbre — U expandida k=2 (°C)']    = +ri.incertidumbreExpandida.toFixed(4);
  return conComponentes;
}

// ── Fusión del resultado de la pestaña Lazo 4-20mA ──

function construirResultadoLazoBase(clasif: ReturnType<typeof clasificarSenalNE43>): Record<string, unknown> {
  return {
    'Señal (mA)': clasif.mA,
    'Zona NE43':  clasif.zona,
    'Mensaje':    clasif.mensaje,
    'Es falla':   clasif.esFalla ? 'Sí' : 'No',
  };
}

function conConversionIngenieria(resultado: Record<string, unknown>, valorConvertido: number | null, unidad: string): Record<string, unknown> {
  if (valorConvertido == null) return resultado;
  const sufijo = unidad.trim() ? ` (${unidad.trim()})` : '';
  return {
    ...resultado,
    [`Valor de ingeniería${sufijo}`]: +valorConvertido.toFixed(4),
  };
}

function conEnergiaLazo(resultado: Record<string, unknown>, en: ReturnType<typeof calcularPresupuestoEnergiaLazo> | null): Record<string, unknown> {
  if (!en) return resultado;
  return {
    ...resultado,
    'Energía — Resistencia de cable (Ω)': +en.resistenciaCableOhm.toFixed(3),
    'Energía — Caída en cable (V)':       +en.caidaCableV.toFixed(3),
    'Energía — Caída en receptor (V)':    +en.caidaReceptorV.toFixed(3),
    'Energía — Margen de tensión (V)':    +en.margenV.toFixed(3),
    'Energía — Alcanza la tensión':       en.alcanzaTension ? 'Sí' : 'No',
  };
}

export default function ModuloInstrumentacion() {
  const [pestanaActiva, setPestanaActiva] = useState<'sensor' | 'lazo' | 'solar' | 'emi'>('sensor');

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

  // ── Pestaña Lazo 4-20mA ──
  const [mALazo,               setMALazo]               = useState('12.000');
  const [valorMinIngenieria,   setValorMinIngenieria]   = useState('0');
  const [valorMaxIngenieria,   setValorMaxIngenieria]   = useState('100');
  const [unidadIngenieria,     setUnidadIngenieria]     = useState('');
  const [resClasificacion,     setResClasificacion]     = useState<ReturnType<typeof clasificarSenalNE43> | null>(null);
  const [resConversion,        setResConversion]        = useState<number | null>(null);
  const [errorLazo,            setErrorLazo]            = useState('');
  const [datosLazo,            setDatosLazo]            = useState<DatosExportar | null>(null);

  const [vSuministro,          setVSuministro]          = useState('24');
  const [vMinimoTransmisor,    setVMinimoTransmisor]    = useState('12');
  const [awgLazo,              setAwgLazo]              = useState('22');
  const [longitudLazo,         setLongitudLazo]         = useState('500');
  const [resistenciaReceptor,  setResistenciaReceptor]  = useState('250');
  const [resEnergia,           setResEnergia]           = useState<ReturnType<typeof calcularPresupuestoEnergiaLazo> | null>(null);
  const [errorEnergia,         setErrorEnergia]         = useState('');

  const listoParaExportarLazo = resClasificacion !== null;

  // ── Pestaña Energía Solar (NASA POWER) ──
  const [latSolar,       setLatSolar]       = useState('');
  const [lonSolar,       setLonSolar]       = useState('');
  const [resSolar,       setResSolar]       = useState<NasaPowerResp | null>(null);
  const [cargandoSolar,  setCargandoSolar]  = useState(false);
  const [errorSolar,     setErrorSolar]     = useState('');
  const [datosSolar,     setDatosSolar]     = useState<DatosExportar | null>(null);

  // ── Pestaña EMI/EMC (FCC 47 CFR Parte 15) ──
  const [tipoEmi,        setTipoEmi]        = useState<TipoEmisionFCC>('conducida');
  const [frecuenciaEmi,  setFrecuenciaEmi]  = useState('');
  const [valorEmi,       setValorEmi]       = useState('');
  const [resEmi,         setResEmi]         = useState<ResultadoEmisionFCC | null>(null);
  const [errorEmi,       setErrorEmi]       = useState('');
  const [datosEmi,       setDatosEmi]       = useState<DatosExportar | null>(null);

  // ── Cruce manual con otro cálculo (CRUCE-011 / CRUCE-012) ──
  const [usuarioId,       setUsuarioId]       = useState('');
  const [mostrarCruce,    setMostrarCruce]    = useState(false);
  const [cargandoCruce,   setCargandoCruce]   = useState(false);
  const [resultadoCruce,  setResultadoCruce]  = useState<{ ok: boolean; riesgos?: RiesgoDetectado[]; error?: string } | null>(null);

  useEffect(() => {
    try {
      const usr = JSON.parse(localStorage.getItem('ip_usuario') || '{}');
      setUsuarioId(usr?.id ?? '');
    } catch {}
  }, []);

  const manejarSeleccionCompleta = async (calculoId1: string, calculoId2: string) => {
    setCargandoCruce(true);
    setResultadoCruce(null);
    try {
      const res = await fetch('/api/cruce/analizar-manual', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...ipAuthHeader() },
        body:    JSON.stringify({ calculoId1, calculoId2 }),
      });
      const json = await res.json();
      setResultadoCruce(json);
    } catch {
      setResultadoCruce({ ok: false, error: 'No se pudo conectar con el servidor.' });
    } finally {
      setCargandoCruce(false);
      setMostrarCruce(false);
    }
  };

  const sensor = TIPOS_SENSOR[tipoIdx];
  const unidadSenal = sensor.kind === 'termocupla' ? 'mV' : 'Ω';
  const clasesDisponibles = sensor.kind === 'termocupla' ? CLASES_TERMOCUPLA : CLASES_RTD;

  // Tolerancia es obligatoria para exportar en ambos sensores; error de
  // cable es obligatorio solo para RTD. Incertidumbre queda siempre
  // opcional — no entra en esta lista.
  const pasosFaltantes: string[] = [];
  if (!resTolerancia) pasosFaltantes.push('verificar la tolerancia');
  if (sensor.kind === 'rtd' && !resErrorCable) pasosFaltantes.push('calcular el error de cable');
  const listoParaExportar = pasosFaltantes.length === 0;

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

    // Nueva temperatura invalida tolerancia e incertidumbre (ya reseteadas
    // arriba) — el error de cable no depende de la temperatura, se conserva.
    const resultado = conErrorCable(construirResultadoBase(r), resErrorCable);

    const payload: DatosExportar = {
      tipo:       sensor.tipoCalculo,
      moduloId:   'instrumentacion',
      normativa:  r.norma,
      parametros: {
        'Tipo de sensor':                    sensor.label,
        [`Señal medida (${unidadSenal})`]:   senal,
      },
      resultado,
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

    // Incertidumbre ya se reseteó arriba (dependía de la tolerancia vieja).
    if (datos) {
      const resultado = conTolerancia(conErrorCable(construirResultadoBase(res), resErrorCable), rt);
      const payloadActualizado: DatosExportar = { ...datos, resultado };
      setDatos(payloadActualizado);
      publicarResultado(payloadActualizado);
    }
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

    if (datos && res) {
      const resultado = conIncertidumbre(
        conTolerancia(conErrorCable(construirResultadoBase(res), r), resTolerancia),
        resIncertidumbre,
      );
      const payloadActualizado: DatosExportar = { ...datos, resultado };
      setDatos(payloadActualizado);
      publicarResultado(payloadActualizado);
    }
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

    if (datos && res) {
      const resultado = conIncertidumbre(
        conTolerancia(conErrorCable(construirResultadoBase(res), resErrorCable), resTolerancia),
        r,
      );
      const payloadActualizado: DatosExportar = { ...datos, resultado };
      setDatos(payloadActualizado);
      publicarResultado(payloadActualizado);
    }
  };

  const analizarSenalLazo = () => {
    setErrorLazo('');
    const mA = parseFloat(mALazo);
    const vMin = parseFloat(valorMinIngenieria);
    const vMax = parseFloat(valorMaxIngenieria);
    if (isNaN(mA) || isNaN(vMin) || isNaN(vMax)) {
      setErrorLazo('Ingresá mA, valor mínimo y valor máximo numéricos válidos.');
      return;
    }
    const clasif = clasificarSenalNE43(mA);
    const conv = convertirSenalIngenieria(mA, vMin, vMax);
    setResClasificacion(clasif);
    setResConversion(conv);

    const resultado = conEnergiaLazo(
      conConversionIngenieria(construirResultadoLazoBase(clasif), conv, unidadIngenieria),
      resEnergia,
    );

    const payload: DatosExportar = {
      tipo:       'INSTRUMENTACION_LAZO_4_20MA',
      moduloId:   'instrumentacion',
      normativa:  clasif.norma,
      parametros: {
        'Señal medida (mA)':          mALazo,
        'Valor mínimo de ingeniería': valorMinIngenieria,
        'Valor máximo de ingeniería': valorMaxIngenieria,
        ...(unidadIngenieria.trim() ? { 'Unidad de ingeniería': unidadIngenieria.trim() } : {}),
      },
      resultado,
      alerta: clasif.esFalla,
    };
    setDatosLazo(payload);
    publicarResultado(payload);
  };

  const calcularEnergiaLazo = () => {
    setErrorEnergia('');
    const vSup    = parseFloat(vSuministro);
    const vMinTx  = parseFloat(vMinimoTransmisor);
    const awgNum  = parseFloat(awgLazo);
    const longNum = parseFloat(longitudLazo);
    const rRecep  = parseFloat(resistenciaReceptor);
    if ([vSup, vMinTx, awgNum, longNum, rRecep].some(v => isNaN(v))) {
      setErrorEnergia('Completá los 5 campos con valores numéricos válidos.');
      return;
    }
    const en = calcularPresupuestoEnergiaLazo(vSup, vMinTx, awgNum, longNum, rRecep);
    setResEnergia(en);

    if (datosLazo && resClasificacion) {
      const resultado = conEnergiaLazo(
        conConversionIngenieria(construirResultadoLazoBase(resClasificacion), resConversion, unidadIngenieria),
        en,
      );
      const payloadActualizado: DatosExportar = { ...datosLazo, resultado };
      setDatosLazo(payloadActualizado);
      publicarResultado(payloadActualizado);
    }
  };

  const consultarEnergiaSolar = async () => {
    setErrorSolar('');
    setResSolar(null);
    const lat = parseFloat(latSolar);
    const lon = parseFloat(lonSolar);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setErrorSolar('Ingresá latitud (-90 a 90) y longitud (-180 a 180) numéricas válidas.');
      return;
    }
    setCargandoSolar(true);
    try {
      const res = await fetch(`/api/nasa-power?lat=${lat}&lon=${lon}`, {
        headers: ipAuthHeader(),
      });
      if (!res.ok) throw new Error('api');
      const data = await res.json() as NasaPowerResp;
      setResSolar(data);

      const payload: DatosExportar = {
        tipo:       'INSTRUMENTACION_ENERGIA_SOLAR',
        moduloId:   'instrumentacion',
        normativa:  'NASA POWER — Climatology (promedio histórico ~22 años, comunidad RE)',
        parametros: {
          'Latitud':  latSolar,
          'Longitud': lonSolar,
        },
        resultado: {
          ...Object.fromEntries(
            data.valoresMensuales.map(v => [`Irradiancia ${v.mes} (${data.unidad})`, v.valor]),
          ),
          [`Promedio anual (${data.unidad})`]:          data.promedioAnual,
          'Mes más desfavorable':                       data.mesMasDesfavorable.mes,
          [`Irradiancia mes desfavorable (${data.unidad})`]: data.mesMasDesfavorable.valor,
        },
        alerta: false,
      };
      setDatosSolar(payload);
      publicarResultado(payload);
    } catch {
      setErrorSolar('No se pudo consultar NASA POWER. Verificá tu conexión e intentá de nuevo.');
    } finally {
      setCargandoSolar(false);
    }
  };

  const evaluarEmi = () => {
    setErrorEmi('');
    setResEmi(null);
    const freq = parseFloat(frecuenciaEmi);
    const valor = parseFloat(valorEmi);
    if (isNaN(freq) || isNaN(valor)) {
      setErrorEmi('Ingresá frecuencia (MHz) y valor medido numéricos válidos.');
      return;
    }
    const r = evaluarEmisionFCC(tipoEmi, freq, valor);
    if (!r.ok) {
      setErrorEmi(r.error);
      return;
    }
    setResEmi(r);

    const unidad = tipoEmi === 'conducida' ? 'dBµV' : 'µV/m';
    const payload: DatosExportar = {
      tipo:       tipoEmi === 'conducida' ? 'INSTRUMENTACION_EMI_CONDUCIDA' : 'INSTRUMENTACION_EMI_RADIADA',
      moduloId:   'instrumentacion',
      normativa:  r.norma,
      parametros: {
        'Tipo de emisión':             tipoEmi === 'conducida' ? 'Conducida' : 'Radiada',
        'Frecuencia (MHz)':            frecuenciaEmi,
        [`Valor medido (${unidad})`]:  valorEmi,
      },
      resultado: {
        'Banda':                    r.banda,
        'Clase aplicable':          r.claseAplicable,
        'Límite cuasipico (dB)':    +r.limiteCuasipicoDB.toFixed(2),
        ...(r.limitePromedioDB != null ? { 'Límite promedio (dBµV, referencia)': r.limitePromedioDB } : {}),
        ...(r.limiteOriginalUVm != null ? { 'Límite (µV/m)': r.limiteOriginalUVm } : {}),
        'Valor medido (dB)':        +r.valorMedidoDB.toFixed(2),
        'Margen (dB)':              +r.margenDB.toFixed(2),
        'Cumple límite publicado':  r.cumple ? 'Sí' : 'No',
        'Aclaración':               r.disclaimer,
      },
      alerta: !r.cumple,
    };
    setDatosEmi(payload);
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

        {/* PESTAÑAS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { id: 'sensor' as const, label: '🌡️ Calibración de sensor' },
            { id: 'lazo'   as const, label: '🔁 Lazo 4-20mA' },
            { id: 'solar'  as const, label: '☀️ Energía Solar' },
            { id: 'emi'    as const, label: '📡 EMI/EMC' },
          ]).map(t => (
            <button key={t.id} onClick={() => setPestanaActiva(t.id)}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 10,
                border: `1px solid ${pestanaActiva === t.id ? TEAL : '#334155'}`,
                background: pestanaActiva === t.id ? 'rgba(45,212,191,0.12)' : 'transparent',
                color: pestanaActiva === t.id ? TEAL : '#94a3b8',
                fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: 0.3,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {pestanaActiva === 'sensor' && (
        <>
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

        {/* BOTONES EXPORTAR — bloqueados hasta completar los pasos obligatorios */}
        {datos && (
          listoParaExportar ? (
            <BotonesExportar visible={true} datos={datos} />
          ) : (
            <div style={{ background: '#1e293b', border: '1px solid #f59e0b', borderRadius: 12, padding: '16px 20px', color: '#fbbf24', fontSize: 13, lineHeight: 1.6 }}>
              ⚠️ Antes de exportar falta: {pasosFaltantes.join(' y ')}.
            </div>
          )
        )}
        </>
        )}

        {pestanaActiva === 'lazo' && (
        <>
        {/* FORMULARIO — SEÑAL 4-20mA */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Señal del lazo</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Señal medida (mA)</label>
            <input value={mALazo} onChange={e => setMALazo(e.target.value)}
              style={{ ...inputStyle, width: '50%' }} placeholder="Ej: 12.000" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Valor mínimo (4mA)</label>
              <input value={valorMinIngenieria} onChange={e => setValorMinIngenieria(e.target.value)} style={inputStyle} placeholder="Ej: 0" />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Valor máximo (20mA)</label>
              <input value={valorMaxIngenieria} onChange={e => setValorMaxIngenieria(e.target.value)} style={inputStyle} placeholder="Ej: 100" />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Unidad (opcional)</label>
              <input value={unidadIngenieria} onChange={e => setUnidadIngenieria(e.target.value)} style={inputStyle} placeholder="Ej: °C, bar, %" />
            </div>
          </div>

          {errorLazo && (
            <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
              {errorLazo}
            </div>
          )}

          <button onClick={analizarSenalLazo}
            style={{ width: '100%', background: `linear-gradient(135deg,${TEAL},#0d9488)`, border: 'none', borderRadius: 10, padding: '14px 0', color: '#000', fontWeight: 800, fontSize: 16, cursor: 'pointer', letterSpacing: 0.5 }}>
            ⚡ ANALIZAR SEÑAL
          </button>
        </div>

        {/* RESULTADOS — CLASIFICACIÓN NE43 + CONVERSIÓN */}
        {resClasificacion && (
          <div style={{
            background: '#1e293b',
            border: `2px solid ${resClasificacion.esFalla ? '#ef4444' : resClasificacion.zona === 'NORMAL' ? TEAL : '#f59e0b'}`,
            borderRadius: 12, padding: 24, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Diagnóstico NAMUR NE43</div>
              <div style={{
                background: resClasificacion.esFalla ? '#ef4444' : resClasificacion.zona === 'NORMAL' ? TEAL : '#f59e0b',
                color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13,
              }}>
                {resClasificacion.zona.replace(/_/g, ' ')}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' as const }}>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Señal medida</div>
                <div style={{
                  color: resClasificacion.esFalla ? '#ef4444' : resClasificacion.zona === 'NORMAL' ? TEAL : '#f59e0b',
                  fontSize: 28, fontWeight: 800,
                }}>{resClasificacion.mA.toFixed(3)} mA</div>
                <div style={{ color: '#475569', fontSize: 10 }}>{resClasificacion.mensaje}</div>
              </div>
            </div>

            {resConversion != null && (
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' as const, marginBottom: 16 }}>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Valor de ingeniería</div>
                <div style={{ color: TEAL, fontSize: 22, fontWeight: 800 }}>
                  {resConversion.toFixed(4)} {unidadIngenieria.trim()}
                </div>
                <div style={{ color: '#475569', fontSize: 10 }}>
                  Escala lineal 4-20mA · {valorMinIngenieria} a {valorMaxIngenieria}
                </div>
              </div>
            )}

            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#a78bfa', marginBottom: 4, fontWeight: 700 }}>ESCALA:</div>
              valor = valorMin + ((mA − 4) / 16) · (valorMax − valorMin)
              <div style={{ marginTop: 4, color: '#475569' }}>{resClasificacion.norma} — {new Date().toLocaleDateString('es-AR')}</div>
            </div>

            {/* PRESUPUESTO DE ENERGÍA DEL LAZO */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #334155' }}>
              <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Presupuesto de energía del lazo (opcional)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>V. suministro (V)</label>
                  <input value={vSuministro} onChange={e => setVSuministro(e.target.value)} style={inputStyle} placeholder="Ej: 24" />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>V. mínimo transmisor (V)</label>
                  <input value={vMinimoTransmisor} onChange={e => setVMinimoTransmisor(e.target.value)} style={inputStyle} placeholder="Ej: 12" />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>AWG del cable</label>
                  <input value={awgLazo} onChange={e => setAwgLazo(e.target.value)} style={inputStyle} placeholder="Ej: 22" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Longitud del tramo (m)</label>
                  <input value={longitudLazo} onChange={e => setLongitudLazo(e.target.value)} style={inputStyle} placeholder="Ej: 500" />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Resistencia receptor (Ω)</label>
                  <input value={resistenciaReceptor} onChange={e => setResistenciaReceptor(e.target.value)} style={inputStyle} placeholder="Ej: 250" />
                </div>
              </div>

              {errorEnergia && (
                <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>
                  {errorEnergia}
                </div>
              )}

              <button onClick={calcularEnergiaLazo}
                style={{ width: '100%', background: 'transparent', border: `1px solid ${TEAL}`, borderRadius: 10, padding: '12px 0', color: TEAL, fontWeight: 800, fontSize: 14, cursor: 'pointer', letterSpacing: 0.5, marginBottom: resEnergia ? 16 : 0 }}>
                🔋 CALCULAR PRESUPUESTO DE ENERGÍA
              </button>

              {resEnergia && (
                <div style={{ background: '#0f172a', border: `1px solid ${resEnergia.alcanzaTension ? TEAL : '#ef4444'}`, borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>Margen de tensión</div>
                    <div style={{ background: resEnergia.alcanzaTension ? TEAL : '#ef4444', color: '#000', borderRadius: 20, padding: '4px 12px', fontWeight: 800, fontSize: 11 }}>
                      {resEnergia.alcanzaTension ? '✅ ALCANZA' : '❌ NO ALCANZA'}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 10 }}>Caída en cable</div>
                      <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>{resEnergia.caidaCableV.toFixed(3)} V</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 10 }}>Caída en receptor</div>
                      <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>{resEnergia.caidaReceptorV.toFixed(3)} V</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 10 }}>Margen</div>
                      <div style={{ color: resEnergia.alcanzaTension ? TEAL : '#ef4444', fontWeight: 700, fontSize: 13 }}>{resEnergia.margenV.toFixed(3)} V</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>
                    R cable (ida y vuelta, AWG{resEnergia.awg}, {resEnergia.longitudM} m): {resEnergia.resistenciaCableOhm.toFixed(3)} Ω · I lazo: {(resEnergia.corrienteLazoA * 1000).toFixed(0)} mA
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>{resEnergia.nota}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTONES EXPORTAR — bloqueados hasta clasificar la señal al menos una vez */}
        {datosLazo && (
          listoParaExportarLazo ? (
            <BotonesExportar visible={true} datos={datosLazo} />
          ) : (
            <div style={{ background: '#1e293b', border: '1px solid #f59e0b', borderRadius: 12, padding: '16px 20px', color: '#fbbf24', fontSize: 13, lineHeight: 1.6 }}>
              ⚠️ Antes de exportar, analizá la señal.
            </div>
          )
        )}
        </>
        )}

        {pestanaActiva === 'solar' && (
        <>
        {/* FORMULARIO — UBICACIÓN DEL ACTIVO */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Ubicación del activo</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Latitud (-90 a 90)</label>
              <input value={latSolar} onChange={e => setLatSolar(e.target.value)}
                style={inputStyle} placeholder="Ej: -34.6037" />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Longitud (-180 a 180)</label>
              <input value={lonSolar} onChange={e => setLonSolar(e.target.value)}
                style={inputStyle} placeholder="Ej: -58.3816" />
            </div>
          </div>

          {errorSolar && (
            <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
              {errorSolar}
            </div>
          )}

          <button onClick={consultarEnergiaSolar} disabled={cargandoSolar}
            style={{
              width: '100%', background: `linear-gradient(135deg,${TEAL},#0d9488)`, border: 'none', borderRadius: 10,
              padding: '14px 0', color: '#000', fontWeight: 800, fontSize: 16,
              cursor: cargandoSolar ? 'not-allowed' : 'pointer', letterSpacing: 0.5,
              opacity: cargandoSolar ? 0.6 : 1,
            }}>
            {cargandoSolar ? '⏳ CONSULTANDO NASA POWER...' : '☀️ CONSULTAR IRRADIANCIA'}
          </button>
        </div>

        {/* RESULTADOS — IRRADIANCIA MENSUAL */}
        {resSolar && (
          <div style={{ background: '#1e293b', border: `2px solid ${TEAL}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Irradiancia solar histórica</div>
              <div style={{ background: '#f59e0b', color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                MES CRÍTICO: {resSolar.mesMasDesfavorable.mes}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' as const }}>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Mes más desfavorable — dimensionar con este valor</div>
                <div style={{ color: '#f59e0b', fontSize: 28, fontWeight: 800 }}>
                  {resSolar.mesMasDesfavorable.valor.toFixed(2)} {resSolar.unidad}
                </div>
                <div style={{ color: '#475569', fontSize: 10 }}>
                  Promedio anual: {resSolar.promedioAnual.toFixed(2)} {resSolar.unidad} · lat {resSolar.lat}, lon {resSolar.lon}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
              {resSolar.valoresMensuales.map(v => (
                <div key={v.mes} style={{
                  background: '#0f172a',
                  border: `1px solid ${v.mes === resSolar.mesMasDesfavorable.mes ? '#f59e0b' : '#334155'}`,
                  borderRadius: 8, padding: '8px 6px', textAlign: 'center' as const,
                }}>
                  <div style={{ color: '#64748b', fontSize: 10 }}>{v.mes}</div>
                  <div style={{ color: v.mes === resSolar.mesMasDesfavorable.mes ? '#f59e0b' : '#e2e8f0', fontWeight: 700, fontSize: 13 }}>
                    {v.valor.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              <div style={{ color: '#a78bfa', marginBottom: 4, fontWeight: 700 }}>FUENTE:</div>
              NASA POWER — parámetro ALLSKY_SFC_SW_DWN, climatology (promedio histórico ~22 años), comunidad RE
              <div style={{ marginTop: 4, color: '#475569' }}>Consultado: {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}

        {/* BOTONES EXPORTAR */}
        {datosSolar && <BotonesExportar visible={true} datos={datosSolar} />}
        </>
        )}

        {pestanaActiva === 'emi' && (
        <>
        {/* FORMULARIO — EMISIÓN CONDUCIDA/RADIADA */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Emisión medida — FCC 47 CFR Parte 15, Clase A</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {([
              { id: 'conducida' as const, label: 'Conducida (§15.107)' },
              { id: 'radiada'   as const, label: 'Radiada (§15.109)' },
            ]).map(t => (
              <button key={t.id} onClick={() => { setTipoEmi(t.id); setResEmi(null); setErrorEmi(''); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8,
                  border: `1px solid ${tipoEmi === t.id ? TEAL : '#475569'}`,
                  background: tipoEmi === t.id ? 'rgba(45,212,191,0.12)' : 'transparent',
                  color: tipoEmi === t.id ? TEAL : '#94a3b8',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Frecuencia (MHz)</label>
              <input value={frecuenciaEmi} onChange={e => setFrecuenciaEmi(e.target.value)}
                style={inputStyle} placeholder={tipoEmi === 'conducida' ? 'Ej: 5' : 'Ej: 150'} />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>
                Valor medido ({tipoEmi === 'conducida' ? 'dBµV' : 'µV/m'})
              </label>
              <input value={valorEmi} onChange={e => setValorEmi(e.target.value)}
                style={inputStyle} placeholder={tipoEmi === 'conducida' ? 'Ej: 68' : 'Ej: 120'} />
            </div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#64748b', marginBottom: 16 }}>
            {tipoEmi === 'conducida'
              ? 'Rango cubierto por esta tabla: 0.15 a 30 MHz.'
              : 'Rango cubierto por esta tabla: 30 MHz en adelante. Límite medido a 10 metros.'}
          </div>

          {errorEmi && (
            <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
              {errorEmi}
            </div>
          )}

          <button onClick={evaluarEmi}
            style={{ width: '100%', background: `linear-gradient(135deg,${TEAL},#0d9488)`, border: 'none', borderRadius: 10, padding: '14px 0', color: '#000', fontWeight: 800, fontSize: 16, cursor: 'pointer', letterSpacing: 0.5 }}>
            📡 EVALUAR CONTRA LÍMITE FCC
          </button>
        </div>

        {/* RESULTADOS — MARGEN CONTRA LÍMITE FCC */}
        {resEmi && resEmi.ok && (
          <div style={{ background: '#1e293b', border: `2px solid ${resEmi.cumple ? TEAL : '#ef4444'}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Margen contra límite publicado</div>
              <div style={{ background: resEmi.cumple ? TEAL : '#ef4444', color: '#000', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 13 }}>
                {resEmi.cumple ? '🟢 DENTRO DEL LÍMITE' : '🔴 SUPERA EL LÍMITE'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, textAlign: 'center' as const }}>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Margen — banda {resEmi.banda}</div>
                <div style={{ color: resEmi.cumple ? TEAL : '#ef4444', fontSize: 28, fontWeight: 800 }}>
                  {resEmi.margenDB >= 0 ? '+' : ''}{resEmi.margenDB.toFixed(2)} dB
                </div>
                <div style={{ color: '#475569', fontSize: 10 }}>
                  Medido: {resEmi.valorMedidoDB.toFixed(2)} dB{resEmi.tipo === 'radiada' ? 'µV/m' : 'µV'} · Límite cuasipico: {resEmi.limiteCuasipicoDB.toFixed(2)} dB{resEmi.tipo === 'radiada' ? 'µV/m' : 'µV'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: resEmi.limitePromedioDB != null ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 16 }}>
              {resEmi.limitePromedioDB != null && (
                <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                  <div style={{ color: '#64748b', fontSize: 10 }}>Límite promedio (referencia)</div>
                  <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>{resEmi.limitePromedioDB} dBµV</div>
                </div>
              )}
              {resEmi.limiteOriginalUVm != null && (
                <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                  <div style={{ color: '#64748b', fontSize: 10 }}>Límite tabla original</div>
                  <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>{resEmi.limiteOriginalUVm} µV/m</div>
                </div>
              )}
            </div>

            <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', marginBottom: 12 }}>
              <div style={{ color: '#a78bfa', marginBottom: 4, fontWeight: 700 }}>NORMA:</div>
              {resEmi.norma}
              <div style={{ marginTop: 4, color: '#475569' }}>Consultado: {new Date().toLocaleDateString('es-AR')}</div>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid #f59e0b', borderRadius: 8, padding: '10px 14px', color: '#fbbf24', fontSize: 11, lineHeight: 1.5 }}>
              ⚠️ {resEmi.disclaimer}
            </div>
          </div>
        )}

        {/* BOTONES EXPORTAR — bloqueados hasta evaluar al menos una vez */}
        {datosEmi && <BotonesExportar visible={true} datos={datosEmi} />}
        </>
        )}

        {/* ── CRUCE MANUAL CON OTRO CÁLCULO ── */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #334155' }}>
          <button
            onClick={() => { setMostrarCruce(v => !v); setResultadoCruce(null); }}
            style={{ width: '100%', background: 'transparent', border: `1px solid ${TEAL}`, borderRadius: 10, padding: '12px 0', color: TEAL, fontWeight: 800, fontSize: 14, cursor: 'pointer', letterSpacing: 0.5 }}>
            🔗 {mostrarCruce ? 'Cancelar cruce' : 'Cruzar con otro cálculo'}
          </button>

          {mostrarCruce && (
            <div style={{ marginTop: 16, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
              <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>
                Elegí exactamente 2 cálculos del historial (Térmica + RTD, o Lazo 4-20mA + Electricidad) para cruzarlos.
              </div>
              {usuarioId
                ? (
                  <HistorialActivo
                    usuarioId={usuarioId}
                    modoSeleccionMaxima
                    onSeleccionCompleta={manejarSeleccionCompleta}
                  />
                )
                : <div style={{ color: '#64748b', fontSize: 12 }}>Cargando usuario...</div>}
            </div>
          )}

          {cargandoCruce && (
            <div style={{ marginTop: 16, color: '#94a3b8', fontSize: 13 }}>⏳ Analizando cruce...</div>
          )}

          {resultadoCruce && !resultadoCruce.ok && (
            <div style={{ marginTop: 16, background: '#450a0a', border: '1px solid #dc2626', borderRadius: 8, padding: '14px 16px', color: '#fca5a5', fontSize: 13, lineHeight: 1.6 }}>
              ⚠️ {resultadoCruce.error ?? 'No se pudo analizar el cruce.'}
            </div>
          )}

          {resultadoCruce?.ok && (
            <div style={{ marginTop: 16 }}>
              {(!resultadoCruce.riesgos || resultadoCruce.riesgos.length === 0) ? (
                <div style={{ background: '#0f172a', border: `1px solid ${TEAL}`, borderRadius: 8, padding: '14px 16px', color: TEAL, fontSize: 13 }}>
                  ✓ Sin riesgos detectados en el cruce.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {resultadoCruce.riesgos.map(r => (
                    <div key={r.id} style={{
                      background: '#1e293b',
                      border: `2px solid ${r.nivel === 'CRITICO' ? '#ef4444' : r.nivel === 'ALTO' ? '#f59e0b' : '#334155'}`,
                      borderRadius: 10, padding: 16,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: 11, letterSpacing: 0.5 }}>{r.id}</div>
                        <div style={{
                          background: r.nivel === 'CRITICO' ? '#ef4444' : r.nivel === 'ALTO' ? '#f59e0b' : '#334155',
                          color: '#000', borderRadius: 20, padding: '4px 12px', fontWeight: 800, fontSize: 11,
                        }}>{r.nivel}</div>
                      </div>
                      <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{r.titulo}</div>
                      <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{r.descripcion}</div>
                      <div style={{ color: '#475569', fontSize: 11, fontFamily: 'ui-monospace,SFMono-Regular,monospace', marginBottom: 8 }}>{r.normativa}</div>
                      <div style={{ color: '#cbd5e1', fontSize: 12, fontStyle: 'italic' }}>Acción: {r.accion}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
