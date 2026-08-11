// lib/calculosInstrumentacion.ts
// Módulo 16 — Electrónica de Instrumentación.
// Primera capacidad: linealización de termocuplas por el polinomio inverso
// NIST ITS-90 (milivoltios de señal -> grados Celsius).

export type TipoTermocupla = 'K' | 'J';

interface CoeficientesTermocupla {
  rangoMin: number; // °C
  rangoMax: number; // °C
  // t90 = Σ dᵢ·Eᵢ, i=0..9, con E en milivoltios y t90 en °C (NIST ITS-90)
  d: number[];
}

const COEFICIENTES_NIST_ITS90: Record<TipoTermocupla, CoeficientesTermocupla> = {
  K: {
    rangoMin: 0,
    rangoMax: 500,
    d: [
      0,
      25.08355,
      0.07860106,
      -0.2503131,
      0.08315270,
      -0.01228034,
      0.0009804036,
      -0.00004413030,
      0.000001057734,
      -0.00000001052755,
    ],
  },
  J: {
    rangoMin: 0,
    rangoMax: 760,
    d: [
      0,
      19.78425,
      -0.2001204,
      0.01036969,
      -0.0002549687,
      0.000003585153,
      -0.00000005344285,
      0.0000000005099890,
    ],
  },
};

export interface ResultadoTermocupla {
  tipo: TipoTermocupla;
  milivoltios: number;
  celsius: number;
  dentroDeRango: boolean;
  rango: { min: number; max: number };
  norma: string;
}

export function linealizarTermocupla(tipo: TipoTermocupla, milivoltios: number): ResultadoTermocupla {
  const cfg = COEFICIENTES_NIST_ITS90[tipo];
  if (!cfg) throw new Error(`Tipo de termocupla no soportado: ${tipo}`);

  const celsius = cfg.d.reduce((acc, di, i) => acc + di * Math.pow(milivoltios, i), 0);
  const dentroDeRango = celsius >= cfg.rangoMin && celsius <= cfg.rangoMax;

  return {
    tipo,
    milivoltios,
    celsius,
    dentroDeRango,
    rango: { min: cfg.rangoMin, max: cfg.rangoMax },
    norma: 'NIST ITS-90 Thermocouple Database — Tipo K, polinomio inverso 0°C a 500°C',
  };
}

// ═══════════════════════════════════════════════════════════════
// RTD — linealización Callendar-Van Dusen (IEC 60751:2022), Pt100 / Pt1000.
// Recibe la resistencia medida en ohms y devuelve la temperatura en °C.
//
// T ≥ 0°C  (R ≥ R0): cuadrática directa
//   R = R0·(1 + A·T + B·T²)  →  se despeja T con la fórmula cuadrática.
//
// T < 0°C  (R < R0): se agrega el término C·(T−100)·T³ y se resuelve
//   por Newton-Raphson (no tiene solución cerrada), hasta converger
//   a 0.001°C.
// ═══════════════════════════════════════════════════════════════

export type TipoRTD = 100 | 1000;

const RTD_A = 0.0039083;
const RTD_B = -0.0000005775;
const RTD_C = -4.183e-12; // IEC 60751:2022 / Callendar-Van Dusen, válido solo para T < 0°C

const RTD_RANGO = { min: -200, max: 850 }; // IEC 60751:2022, curva α=0.00385 (Pt100/Pt1000)

export interface ResultadoRTD {
  r0: TipoRTD;
  resistenciaOhms: number;
  celsius: number;
  dentroDeRango: boolean;
  rango: { min: number; max: number };
  norma: string;
}

export function linealizarRTD(r0: TipoRTD, resistenciaOhms: number): ResultadoRTD {
  let celsius: number;

  if (resistenciaOhms >= r0) {
    // T ≥ 0 — B·T² + A·T + (1 − R/R0) = 0
    const a = RTD_B;
    const b = RTD_A;
    const c = 1 - resistenciaOhms / r0;
    const discriminante = b * b - 4 * a * c;
    celsius = (-b + Math.sqrt(discriminante)) / (2 * a);
  } else {
    // T < 0 — Newton-Raphson sobre Callendar-Van Dusen completa
    const f  = (T: number) => r0 * (1 + RTD_A * T + RTD_B * T * T + RTD_C * (T - 100) * T * T * T) - resistenciaOhms;
    const fp = (T: number) => r0 * (RTD_A + 2 * RTD_B * T + RTD_C * (4 * T * T * T - 300 * T * T));

    let T = (resistenciaOhms / r0 - 1) / RTD_A; // semilla: aproximación lineal
    for (let i = 0; i < 50; i++) {
      const Tnext = T - f(T) / fp(T);
      const convergio = Math.abs(Tnext - T) < 0.001;
      T = Tnext;
      if (convergio) break;
    }
    celsius = T;
  }

  const dentroDeRango = celsius >= RTD_RANGO.min && celsius <= RTD_RANGO.max;

  return {
    r0,
    resistenciaOhms,
    celsius,
    dentroDeRango,
    rango: { ...RTD_RANGO },
    norma: `IEC 60751:2022 — Callendar-Van Dusen, Pt${r0}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// Error de cable RTD por resistencia de los conductores de cobre.
//
// Diámetro del conductor — ASTM B258 (en pulgadas, convertido a metros):
//   d = 0.005 · 92^((36−AWG)/39)
//
// Resistencia por metro de conductor (cobre):
//   r = ρ / área,  ρ = 1.724×10⁻⁸ Ω·m
//
// 2 hilos: la resistencia de ambos conductores (ida y vuelta) se suma
//   directamente a la lectura del puente/instrumento. Error estimado con
//   el coeficiente promedio α=0.00385 °C⁻¹ de la curva Pt100/Pt1000:
//     errorC = (2 · longitud · r) / (0.00385 · R0)
//
// 3 hilos: error de cable compensado — no hay término cerrado, se
//   informa 0°C asumiendo los 3 conductores idénticos (IEC 60751).
//
// 4 hilos: elimina el error de cable por medición Kelvin (excitación y
//   sensado en pares separados) — error 0°C.
// ═══════════════════════════════════════════════════════════════

export type CantidadHilosRTD = 2 | 3 | 4;

const RESISTIVIDAD_COBRE = 1.724e-8; // Ω·m

function diametroConductorAWG(awg: number): number {
  const diametroPulgadas = 0.005 * Math.pow(92, (36 - awg) / 39);
  return diametroPulgadas * 0.0254; // metros
}

export interface ResultadoErrorCableRTD {
  hilos: CantidadHilosRTD;
  awg: number;
  longitudM: number;
  r0: TipoRTD;
  diametroM: number;
  resistenciaPorMetro: number;
  errorC: number;
  nota: string;
  norma: string;
}

export function calcularErrorCableRTD(
  hilos: CantidadHilosRTD,
  awg: number,
  longitudM: number,
  r0: TipoRTD,
): ResultadoErrorCableRTD {
  const diametroM = diametroConductorAWG(awg);
  const area = Math.PI * (diametroM / 2) ** 2;
  const resistenciaPorMetro = RESISTIVIDAD_COBRE / area;

  let errorC: number;
  let nota: string;

  if (hilos === 2) {
    errorC = (2 * longitudM * resistenciaPorMetro) / (0.00385 * r0);
    nota = 'Configuración 2 hilos: la resistencia de ambos conductores (ida y vuelta) se suma directamente a la lectura.';
  } else if (hilos === 3) {
    errorC = 0;
    nota = 'Configuración 3 hilos: error de cable compensado, asumiendo los 3 conductores idénticos según IEC 60751.';
  } else {
    errorC = 0;
    nota = 'Configuración 4 hilos: elimina el error de cable por medición Kelvin (excitación y sensado en pares separados).';
  }

  return {
    hilos,
    awg,
    longitudM,
    r0,
    diametroM,
    resistenciaPorMetro,
    errorC,
    nota,
    norma: 'ASTM B258 (diámetro AWG) · IEC 60751:2022 (coeficiente α=0.00385)',
  };
}

// ═══════════════════════════════════════════════════════════════
// Verificación de clase de tolerancia de fábrica.
//
// La banda de tolerancia depende solo de la clase y de |t| — no del
// tipo de aleación (K/J) ni del R0 (Pt100/Pt1000), que por eso no son
// parámetros de esta función: IEC 60584-1 define la misma fórmula por
// clase para K y J, e IEC 60751:2022 la misma fórmula por clase (en °C)
// para Pt100 y Pt1000.
//
// Termocupla — IEC 60584-1:
//   Clase 1: ±1.5°C hasta 375°C, luego ±0.004·|t|
//   Clase 2: ±2.5°C hasta 333°C, luego ±0.0075·|t|
//
// RTD — IEC 60751:2022:
//   Clase AA: ±(0.10 + 0.0017·|t|)   Clase A: ±(0.15 + 0.002·|t|)
//   Clase B:  ±(0.30 + 0.005·|t|)    Clase C: ±(0.60 + 0.01·|t|)
// ═══════════════════════════════════════════════════════════════

export type ClaseTermocupla = 1 | 2;
export type ClaseRTD = 'AA' | 'A' | 'B' | 'C';

export type SensorTolerancia =
  | { familia: 'termocupla'; clase: ClaseTermocupla }
  | { familia: 'rtd'; clase: ClaseRTD };

export interface ResultadoTolerancia {
  familia: 'termocupla' | 'rtd';
  clase: ClaseTermocupla | ClaseRTD;
  temperaturaEsperadaC: number;
  temperaturaMedidaC: number;
  toleranciaC: number;
  desviacionC: number;
  dentroDeTolerancia: boolean;
  norma: string;
}

function toleranciaTermocupla(clase: ClaseTermocupla, t: number): number {
  const tAbs = Math.abs(t);
  if (clase === 1) return tAbs <= 375 ? 1.5 : 0.004 * tAbs;
  return tAbs <= 333 ? 2.5 : 0.0075 * tAbs;
}

const TABLA_TOLERANCIA_RTD: Record<ClaseRTD, { base: number; coef: number }> = {
  AA: { base: 0.10, coef: 0.0017 },
  A:  { base: 0.15, coef: 0.002 },
  B:  { base: 0.30, coef: 0.005 },
  C:  { base: 0.60, coef: 0.01 },
};

function toleranciaRTD(clase: ClaseRTD, t: number): number {
  const { base, coef } = TABLA_TOLERANCIA_RTD[clase];
  return base + coef * Math.abs(t);
}

export function evaluarTolerancia(
  sensor: SensorTolerancia,
  temperaturaEsperadaC: number,
  temperaturaMedidaC: number,
): ResultadoTolerancia {
  const toleranciaC = sensor.familia === 'termocupla'
    ? toleranciaTermocupla(sensor.clase, temperaturaEsperadaC)
    : toleranciaRTD(sensor.clase, temperaturaEsperadaC);

  const desviacionC = temperaturaMedidaC - temperaturaEsperadaC;
  const dentroDeTolerancia = Math.abs(desviacionC) <= toleranciaC;

  return {
    familia: sensor.familia,
    clase: sensor.clase,
    temperaturaEsperadaC,
    temperaturaMedidaC,
    toleranciaC,
    desviacionC,
    dentroDeTolerancia,
    norma: sensor.familia === 'termocupla'
      ? `IEC 60584-1 — Clase ${sensor.clase}`
      : `IEC 60751:2022 — Clase ${sensor.clase}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// Presupuesto de incertidumbre — JCGM 100:2008 (GUM).
//
// Componentes Tipo B (distribución rectangular, semiancho/√3):
//   uB_tolerancia  = toleranciaC / √3
//   uB_resolución  = resolucionInstrumentoC / (2·√3)   (semiancho = resolución/2)
//   uB_cable       = errorCableC / √3
//
// Componente Tipo A (evaluación experimental, opcional):
//   uA_repetibilidad = desviacionEstandarLecturasC / √cantidadLecturas
//   (0 si no se ingresaron lecturas repetidas)
//
// Combinación (ley de propagación de incertidumbres, componentes no
// correlacionados):
//   uc = √(uB_tolerancia² + uB_resolución² + uB_cable² + uA_repetibilidad²)
//
// Incertidumbre expandida, factor de cobertura k=2 (~95% de confianza,
// Anexo G del GUM):
//   U = k · uc
// ═══════════════════════════════════════════════════════════════

export interface ParametrosIncertidumbre {
  toleranciaC: number;
  errorCableC: number;
  resolucionInstrumentoC: number;
  desviacionEstandarLecturasC?: number;
  cantidadLecturas?: number;
}

export interface ComponenteIncertidumbre {
  nombre: string;
  tipo: 'A' | 'B';
  distribucion: string;
  valorC: number;
}

export interface ResultadoIncertidumbre {
  componentes: ComponenteIncertidumbre[];
  uCombinada: number;
  factorCobertura: number;
  incertidumbreExpandida: number;
  norma: string;
}

export function calcularPresupuestoIncertidumbre(
  params: ParametrosIncertidumbre,
): ResultadoIncertidumbre {
  const uTolerancia = params.toleranciaC / Math.sqrt(3);
  const uResolucion = params.resolucionInstrumentoC / (2 * Math.sqrt(3));
  const uCable = params.errorCableC / Math.sqrt(3);
  const uRepetibilidad =
    params.desviacionEstandarLecturasC != null &&
    params.cantidadLecturas != null &&
    params.cantidadLecturas > 0
      ? params.desviacionEstandarLecturasC / Math.sqrt(params.cantidadLecturas)
      : 0;

  const componentes: ComponenteIncertidumbre[] = [
    { nombre: 'Tolerancia de fábrica del sensor', tipo: 'B', distribucion: 'rectangular', valorC: uTolerancia },
    { nombre: 'Resolución del instrumento',        tipo: 'B', distribucion: 'rectangular', valorC: uResolucion },
    { nombre: 'Error de cable',                     tipo: 'B', distribucion: 'rectangular', valorC: uCable },
    { nombre: 'Repetibilidad de lecturas',          tipo: 'A', distribucion: 'experimental (evaluación estadística)', valorC: uRepetibilidad },
  ];

  const uCombinada = Math.sqrt(
    uTolerancia * uTolerancia +
    uResolucion * uResolucion +
    uCable * uCable +
    uRepetibilidad * uRepetibilidad,
  );

  const factorCobertura = 2;
  const incertidumbreExpandida = factorCobertura * uCombinada;

  return {
    componentes,
    uCombinada,
    factorCobertura,
    incertidumbreExpandida,
    norma: 'JCGM 100:2008 (GUM) — incertidumbre combinada y expandida, k=2 (~95% de confianza, Anexo G)',
  };
}

// ═══════════════════════════════════════════════════════════════
// Lazo 4-20mA.
//
// 1) Conversión de señal a unidades de ingeniería (escala lineal 4-20mA):
//      valor = valorMin + ((mA − 4) / 16) · (valorMax − valorMin)
//
// 2) Clasificación de zona según NAMUR NE43 (autodiagnóstico por señal
//    fuera del rango normal 4-20mA):
//      < 3.6 mA        → falla downscale (cable cortado o fallo de hardware)
//      3.6 - 3.8 mA     → banda prohibida (nunca debería ocurrir)
//      3.8 - 4.0 mA     → subrango bajo (proceso fuera de rango, no es falla)
//      4.0 - 20.0 mA    → normal
//      20.0 - 20.5 mA   → subrango alto (proceso fuera de rango, no es falla)
//      20.5 - 21.0 mA   → banda prohibida (nunca debería ocurrir)
//      > 21.0 mA        → falla upscale
//
// 3) Presupuesto de energía del lazo — Ley de Ohm con corriente de lazo
//    fija en 0.02 A (20 mA, peor caso de caída de tensión). Reutiliza
//    diametroConductorAWG y la misma fórmula de resistencia por metro
//    (ρ/área) que calcularErrorCableRTD, factorizada acá como
//    resistenciaCobrePorMetro() para no duplicar el cálculo ni tocar
//    calcularErrorCableRTD.
// ═══════════════════════════════════════════════════════════════

export function convertirSenalIngenieria(mA: number, valorMin: number, valorMax: number): number {
  return valorMin + ((mA - 4) / 16) * (valorMax - valorMin);
}

export type ZonaNE43 =
  | 'FALLA_DOWNSCALE'
  | 'BANDA_PROHIBIDA_BAJA'
  | 'SUBRANGO_BAJO'
  | 'NORMAL'
  | 'SUBRANGO_ALTO'
  | 'BANDA_PROHIBIDA_ALTA'
  | 'FALLA_UPSCALE';

export interface ResultadoNE43 {
  mA: number;
  zona: ZonaNE43;
  mensaje: string;
  esFalla: boolean;
  norma: string;
}

export function clasificarSenalNE43(mA: number): ResultadoNE43 {
  let zona: ZonaNE43;
  let mensaje: string;
  let esFalla: boolean;

  if (mA < 3.6) {
    zona = 'FALLA_DOWNSCALE';
    mensaje = 'Falla downscale — cable cortado o fallo de hardware';
    esFalla = true;
  } else if (mA < 3.8) {
    zona = 'BANDA_PROHIBIDA_BAJA';
    mensaje = 'Banda prohibida — nunca debería ocurrir';
    esFalla = true;
  } else if (mA < 4.0) {
    zona = 'SUBRANGO_BAJO';
    mensaje = 'Subrango bajo — proceso fuera de rango, no es falla';
    esFalla = false;
  } else if (mA <= 20.0) {
    zona = 'NORMAL';
    mensaje = 'Señal normal';
    esFalla = false;
  } else if (mA <= 20.5) {
    zona = 'SUBRANGO_ALTO';
    mensaje = 'Subrango alto — proceso fuera de rango, no es falla';
    esFalla = false;
  } else if (mA <= 21.0) {
    zona = 'BANDA_PROHIBIDA_ALTA';
    mensaje = 'Banda prohibida — nunca debería ocurrir';
    esFalla = true;
  } else {
    zona = 'FALLA_UPSCALE';
    mensaje = 'Falla upscale — cable cortado o fallo de hardware';
    esFalla = true;
  }

  return { mA, zona, mensaje, esFalla, norma: 'NAMUR NE43' };
}

// Misma fórmula (ρ/área) que usa calcularErrorCableRTD internamente,
// factorizada para reutilizarla acá sin tocar esa función.
function resistenciaCobrePorMetro(awg: number): number {
  const diametroM = diametroConductorAWG(awg);
  const area = Math.PI * (diametroM / 2) ** 2;
  return RESISTIVIDAD_COBRE / area;
}

const CORRIENTE_LAZO_A = 0.02; // A — 20 mA, peor caso para dimensionamiento

export interface ResultadoEnergiaLazo {
  vSuministro: number;
  vMinimoTransmisor: number;
  awg: number;
  longitudM: number;
  resistenciaReceptorOhm: number;
  corrienteLazoA: number;
  resistenciaCableOhm: number;
  caidaCableV: number;
  caidaReceptorV: number;
  margenV: number;
  alcanzaTension: boolean;
  nota: string;
}

export function calcularPresupuestoEnergiaLazo(
  vSuministro: number,
  vMinimoTransmisor: number,
  awg: number,
  longitudM: number,
  resistenciaReceptorOhm: number,
): ResultadoEnergiaLazo {
  const resistenciaCableOhm = 2 * longitudM * resistenciaCobrePorMetro(awg); // ida y vuelta
  const caidaCableV = CORRIENTE_LAZO_A * resistenciaCableOhm;
  const caidaReceptorV = CORRIENTE_LAZO_A * resistenciaReceptorOhm;
  const margenV = vSuministro - vMinimoTransmisor - caidaCableV - caidaReceptorV;

  return {
    vSuministro,
    vMinimoTransmisor,
    awg,
    longitudM,
    resistenciaReceptorOhm,
    corrienteLazoA: CORRIENTE_LAZO_A,
    resistenciaCableOhm,
    caidaCableV,
    caidaReceptorV,
    margenV,
    alcanzaTension: margenV >= 0,
    nota: 'Cálculo eléctrico básico (Ley de Ohm) — no cita normativa específica de instrumentación.',
  };
}
