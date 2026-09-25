// lib/valvulasB1634.ts
// ASME B16.34 — ratings P-T, prueba hidrostática de carcasa y duración de la
// prueba. Fuente única para components/ModuloValvulas.tsx (pantalla, PDF,
// Excel y DXF). Sin React, con tests en lib/__tests__/calculos.test.ts.

export type MaterialB1634 = 'WCB' | 'CF8M';
export const CLASES_B1634 = ['150', '300', '600', '900', '1500', '2500'] as const;

// ─── WCB / A105 — Grupo 1.1 ───────────────────────────────────────
// Presión en bar por clase y temperatura (°C). Entre filas: interpolación lineal.
export const CITA_PT_WCB = 'ASME B16.34-2017, Tabla 2-1.1';
export const PT_WCB: Record<number, Record<string, number>> = {
  38:  { '150': 19.6, '300': 51.1, '600': 102.1, '900': 153.0, '1500': 255.5, '2500': 425.4 },
  100: { '150': 17.7, '300': 46.6, '600': 93.2,  '900': 139.8, '1500': 233.0, '2500': 388.4 },
  150: { '150': 15.8, '300': 45.1, '600': 90.2,  '900': 135.3, '1500': 225.5, '2500': 375.8 },
  200: { '150': 13.8, '300': 43.8, '600': 87.6,  '900': 131.4, '1500': 219.0, '2500': 365.1 },
  250: { '150': 12.1, '300': 41.9, '600': 83.9,  '900': 125.8, '1500': 209.7, '2500': 349.5 },
  300: { '150': 10.2, '300': 39.8, '600': 79.5,  '900': 119.3, '1500': 198.8, '2500': 331.4 },
  350: { '150': 7.4,  '300': 37.5, '600': 74.9,  '900': 112.4, '1500': 187.3, '2500': 312.2 },
  400: { '150': 5.1,  '300': 33.4, '600': 66.8,  '900': 100.3, '1500': 167.2, '2500': 278.6 },
  425: { '150': 4.1,  '300': 31.3, '600': 62.6,  '900': 93.9,  '1500': 156.5, '2500': 260.8 },
};

// ─── CF8M (316 fundido) — Grupo 2.2 ───────────────────────────────
// SOLO los 18 valores verificados contra ASME B16.34-2020 (y 2009/2017),
// Tabla 2-2.2 "A — Standard Class", Grupo 2.2 (confirmados con boletín
// Emerson VCBUL-04493): 38/100/200/300/400/450 °C × Clase 150/300/600.
// NO son los valores de la edición 2025 (distintos). Sin interpolación:
// entre filas se usa la fila verificada inmediatamente SUPERIOR en
// temperatura (rating menor = lado seguro). Clases 900/1500/2500: sin datos
// verificados → no disponibles.
export const CITA_PT_CF8M = 'ASME B16.34-2020, Tabla 2-2.2 (Standard Class)';
export const PT_CF8M: Record<number, Record<string, number>> = {
  38:  { '150': 19.0, '300': 49.6, '600': 99.3 },
  100: { '150': 16.2, '300': 42.2, '600': 84.4 },
  200: { '150': 13.7, '300': 35.7, '600': 71.3 },
  300: { '150': 10.2, '300': 31.6, '600': 63.2 },
  400: { '150': 6.5,  '300': 29.4, '600': 58.9 },
  450: { '150': 4.6,  '300': 28.8, '600': 57.7 },
};

export const CITA_PT: Record<MaterialB1634, string> = { WCB: CITA_PT_WCB, CF8M: CITA_PT_CF8M };
export const T_MAX_TABLA: Record<MaterialB1634, number> = { WCB: 425, CF8M: 450 };

export type RatingB1634 =
  | { ok: true; rating_bar: number; cita: string;
      T_fila: number | null;          // fila usada (CF8M: fila superior); null si se interpoló (WCB)
      nota: string | null }           // aclaración visible cuando no es la fila exacta
  | { ok: false; motivo: 'FUERA_DE_RANGO' | 'CLASE_NO_DISPONIBLE' | 'ENTRADA_INVALIDA'; mensaje: string };

const round1 = (x: number) => Math.round(x * 10) / 10;

export function ratingB1634(material: MaterialB1634, clase: string, T_C: number): RatingB1634 {
  if (!Number.isFinite(T_C)) return { ok: false, motivo: 'ENTRADA_INVALIDA', mensaje: 'Temperatura inválida.' };
  const tabla = material === 'WCB' ? PT_WCB : PT_CF8M;
  const cita = CITA_PT[material];
  const temps = Object.keys(tabla).map(Number).sort((a, b) => a - b);
  const tMax = temps[temps.length - 1];

  if (tabla[temps[0]][clase] === undefined) {
    return material === 'CF8M'
      ? { ok: false, motivo: 'CLASE_NO_DISPONIBLE', mensaje: 'No disponible — tabla pendiente de verificación contra la norma' }
      : { ok: false, motivo: 'CLASE_NO_DISPONIBLE', mensaje: `Clase ${clase} no disponible en la tabla.` };
  }
  if (T_C > tMax) return { ok: false, motivo: 'FUERA_DE_RANGO', mensaje: 'Fuera de rango de la tabla' };
  if (T_C <= temps[0]) return { ok: true, rating_bar: tabla[temps[0]][clase], cita, T_fila: temps[0], nota: null };

  if (tabla[T_C]) return { ok: true, rating_bar: tabla[T_C][clase], cita, T_fila: T_C, nota: null };

  const tSup = temps.find(t => t > T_C)!;
  if (material === 'CF8M') {
    return {
      ok: true, rating_bar: tabla[tSup][clase], cita, T_fila: tSup,
      nota: `Rating tomado de ${tSup} °C (fila verificada superior, criterio conservador)`,
    };
  }
  // WCB: interpolación lineal entre filas (comportamiento previo del módulo)
  const tInf = [...temps].reverse().find(t => t < T_C)!;
  const p1 = tabla[tInf][clase], p2 = tabla[tSup][clase];
  return { ok: true, rating_bar: round1(p1 + (p2 - p1) * (T_C - tInf) / (tSup - tInf)), cita, T_fila: null, nota: null };
}

// ─── Prueba hidrostática de carcasa — B16.34 §7.1.1 ──────────────
// 1,5 × rating a 38 °C, redondeado HACIA ARRIBA al bar entero.
// El −1e-9 evita que un producto entero exacto (ej. 76,000000001 por punto
// flotante) suba un bar de más.
export function calcPruebaHidrostaticaB1634(rating38_bar: number): number | null {
  if (!Number.isFinite(rating38_bar) || rating38_bar <= 0) return null;
  return Math.ceil(1.5 * rating38_bar - 1e-9);
}

// ─── Duración mínima de la prueba — B16.34 §7.1.2 ────────────────
// NPS ≤ 2 → 15 s · 2½ a 6 → 60 s · 8 a 12 → 120 s · ≥ 14 → 300 s.
// Tamaños no normalizados entre tramos caen en el tramo siguiente (más largo).
export function duracionPruebaB1634(NPS: number): number | null {
  if (!Number.isFinite(NPS) || NPS <= 0) return null;
  if (NPS <= 2)  return 15;
  if (NPS <= 6)  return 60;
  if (NPS <= 12) return 120;
  return 300;
}

// NPS normalizados para el selector de la pestaña Clase
export const NPS_NORMALIZADOS = [
  '0.5', '0.75', '1', '1.25', '1.5', '2', '2.5', '3', '4', '6', '8', '10',
  '12', '14', '16', '18', '20', '24',
] as const;
