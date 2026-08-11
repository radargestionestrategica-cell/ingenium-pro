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
