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
