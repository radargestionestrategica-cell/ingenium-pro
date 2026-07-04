// Prediccion de falla de taludes - metodo de velocidad inversa (Fukuzono, 1985)
// Referencia: Fukuzono, T. (1985) "A new method for predicting the failure time of a slope"

const DIA_MS = 86_400_000;
const MIN_LECTURAS = 5;
const MIN_PUNTOS_TRAMO = 3;

export interface LecturaDesplazamiento {
  fecha: Date;
  desplazamiento: number; // mm
}

export type EstadoVelocidadInversa =
  | 'DATOS_INSUFICIENTES'
  | 'SIN_TENDENCIA_FALLA'
  | 'FALLA_ESTIMADA';

export interface ResultadoVelocidadInversa {
  estado: EstadoVelocidadInversa;
  fechaEstimadaFalla: Date | null;
  pendiente: number | null;
  ordenadaOrigen: number | null;
  puntosUsados: number;
}

function suavizarMediaMovil3(valores: number[]): number[] {
  const n = valores.length;
  const suavizado = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    suavizado[i] = i === 0 || i === n - 1
      ? valores[i]
      : (valores[i - 1] + valores[i] + valores[i + 1]) / 3;
  }
  return suavizado;
}

// Indice de inicio del tramo final donde la velocidad crece de forma consecutiva
function inicioTramoAcelerando(velocidades: number[]): number {
  let inicio = velocidades.length - 1;
  for (let i = velocidades.length - 1; i > 0; i--) {
    if (velocidades[i] > velocidades[i - 1]) {
      inicio = i - 1;
    } else {
      break;
    }
  }
  return inicio;
}

function ajustarRectaMinimosCuadrados(x: number[], y: number[]): { pendiente: number; ordenada: number } {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
  const denominador = n * sumXX - sumX * sumX;
  const pendiente = denominador !== 0 ? (n * sumXY - sumX * sumY) / denominador : 0;
  const ordenada = (sumY - pendiente * sumX) / n;
  return { pendiente, ordenada };
}

const SIN_TENDENCIA = (puntosUsados: number, pendiente: number | null = null, ordenadaOrigen: number | null = null): ResultadoVelocidadInversa => ({
  estado: 'SIN_TENDENCIA_FALLA',
  fechaEstimadaFalla: null,
  pendiente,
  ordenadaOrigen,
  puntosUsados,
});

export function predecirFallaFukuzono(lecturas: LecturaDesplazamiento[]): ResultadoVelocidadInversa {
  if (lecturas.length < MIN_LECTURAS) {
    return { estado: 'DATOS_INSUFICIENTES', fechaEstimadaFalla: null, pendiente: null, ordenadaOrigen: null, puntosUsados: 0 };
  }

  const ordenadas = [...lecturas].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  const suavizado = suavizarMediaMovil3(ordenadas.map(l => l.desplazamiento));

  const t0 = ordenadas[0].fecha.getTime();
  const tiempos: number[] = [];
  const velocidades: number[] = [];
  for (let i = 1; i < ordenadas.length; i++) {
    const dtDias = (ordenadas[i].fecha.getTime() - ordenadas[i - 1].fecha.getTime()) / DIA_MS;
    if (dtDias <= 0) continue;
    velocidades.push((suavizado[i] - suavizado[i - 1]) / dtDias);
    tiempos.push((ordenadas[i].fecha.getTime() - t0) / DIA_MS);
  }

  if (velocidades.length < MIN_PUNTOS_TRAMO) return SIN_TENDENCIA(velocidades.length);

  const inicio = inicioTramoAcelerando(velocidades);
  const velTramo = velocidades.slice(inicio);
  const tiempoTramo = tiempos.slice(inicio);

  const acelera = velTramo.length >= MIN_PUNTOS_TRAMO && velTramo.every(v => v > 0);
  if (!acelera) return SIN_TENDENCIA(velTramo.length);

  const invVTramo = velTramo.map(v => 1 / v);
  const { pendiente, ordenada } = ajustarRectaMinimosCuadrados(tiempoTramo, invVTramo);

  // La recta 1/v debe bajar hacia cero (pendiente negativa) para indicar aceleracion hacia la falla
  if (pendiente >= 0) return SIN_TENDENCIA(velTramo.length, pendiente, ordenada);

  const tCorteDias = -ordenada / pendiente;
  const ultimoTiempoTramo = tiempoTramo[tiempoTramo.length - 1];
  if (tCorteDias <= ultimoTiempoTramo) return SIN_TENDENCIA(velTramo.length, pendiente, ordenada);

  return {
    estado: 'FALLA_ESTIMADA',
    fechaEstimadaFalla: new Date(t0 + tCorteDias * DIA_MS),
    pendiente,
    ordenadaOrigen: ordenada,
    puntosUsados: velTramo.length,
  };
}
