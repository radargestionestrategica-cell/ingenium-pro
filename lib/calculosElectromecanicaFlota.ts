// lib/calculosElectromecanicaFlota.ts
// Motores y Generadores — Módulo 18 Electromecánica de Flota Pesada
// Funciones puras, sin conexión a UI. Valores orientativos — no reemplazan
// la hoja de datos ni la placa de características del fabricante.

export type TipoServicio =
  | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10';

export interface ResultadoDerateoTermico {
  saltoTermicoAdmisibleK: number;
  derrateoEstimado: string;
}

// Referencia orientativa de salto térmico admisible en condiciones estándar
// (≤1000 msnm, ≤40°C) — criterio típico clase de aislación B.
const SALTO_TERMICO_BASE_K = 80;

// ── Reducción de salto térmico por altitud/temperatura ──────────────────
// Altitud: IEC 60034-1 — por cada 100 m de exceso sobre 1000 msnm, reducir 1K.
// Temperatura: tabla WEG orientativa — reducción proporcional por cada °C
// de exceso sobre 40°C.
export function calcularDerateoTermico(
  altitudInstalacion_m: number,
  temperaturaAmbiente_C: number,
): ResultadoDerateoTermico {
  let reduccionK = 0;
  const notas: string[] = [];

  if (altitudInstalacion_m > 1000) {
    const excesoAltitud = altitudInstalacion_m - 1000;
    const reduccionAltitud = Math.floor(excesoAltitud / 100);
    reduccionK += reduccionAltitud;
    notas.push(`Altitud ${altitudInstalacion_m} m (exceso ${excesoAltitud} m sobre 1000 m): -${reduccionAltitud} K`);
  }

  if (temperaturaAmbiente_C > 40) {
    const excesoTemp = temperaturaAmbiente_C - 40;
    const reduccionTemp = excesoTemp;
    reduccionK += reduccionTemp;
    notas.push(`Temperatura ambiente ${temperaturaAmbiente_C} °C (exceso ${excesoTemp} °C sobre 40 °C): -${reduccionTemp} K`);
  }

  const saltoTermicoAdmisibleK = +(SALTO_TERMICO_BASE_K - reduccionK).toFixed(1);

  const derrateoEstimado = notas.length > 0
    ? `Derrateo estimado orientativo: ${notas.join('; ')}. Salto térmico admisible ajustado: ${saltoTermicoAdmisibleK} K (valor de referencia — verificar con hoja de datos del fabricante).`
    : `Sin derrateo — condiciones dentro de los límites estándar (≤1000 msnm, ≤40 °C). Salto térmico admisible: ${saltoTermicoAdmisibleK} K.`;

  return { saltoTermicoAdmisibleK, derrateoEstimado };
}

// ── Clasificación de servicio S1-S10 — IEC 60034-1 ──────────────────────
const DEFINICIONES_SERVICIO: Record<TipoServicio, string> = {
  S1:  'S1 — Servicio continuo: funcionamiento a carga constante de duración suficiente para alcanzar el equilibrio térmico.',
  S2:  'S2 — Servicio de tiempo limitado: funcionamiento a carga constante durante un tiempo determinado, menor al necesario para alcanzar el equilibrio térmico, seguido de un período de reposo suficiente para que la máquina recupere la temperatura del refrigerante.',
  S3:  'S3 — Servicio intermitente periódico: secuencia de ciclos idénticos, cada uno con un período de funcionamiento a carga constante y un período de reposo; la corriente de arranque no afecta significativamente la elevación de temperatura.',
  S4:  'S4 — Servicio intermitente periódico con arranque: secuencia de ciclos idénticos, cada uno con un período de arranque significativo, un período de funcionamiento a carga constante y un período de reposo.',
  S5:  'S5 — Servicio intermitente periódico con frenado eléctrico: secuencia de ciclos idénticos, cada uno con arranque, funcionamiento a carga constante, frenado eléctrico rápido y reposo.',
  S6:  'S6 — Servicio ininterrumpido periódico con carga intermitente: secuencia de ciclos idénticos, cada uno con un período de funcionamiento a carga constante y un período de funcionamiento en vacío; sin período de reposo.',
  S7:  'S7 — Servicio ininterrumpido periódico con frenado eléctrico: secuencia de ciclos idénticos, cada uno con arranque, funcionamiento a carga constante y frenado eléctrico; sin período de reposo.',
  S8:  'S8 — Servicio ininterrumpido periódico con cambios relacionados de carga/velocidad: secuencia de ciclos idénticos, cada uno con un período de funcionamiento a carga constante correspondiente a una velocidad predeterminada, seguido de uno o más períodos de funcionamiento a otras cargas y velocidades constantes; sin período de reposo.',
  S9:  'S9 — Servicio con variaciones no periódicas de carga y velocidad: la carga y la velocidad varían de forma no periódica dentro del rango de funcionamiento admisible, incluyendo sobrecargas frecuentes que pueden superar la plena carga.',
  S10: 'S10 — Servicio con cargas constantes distintas: servicio con hasta 4 valores discretos de carga (o cargas equivalentes), cada uno aplicado durante un tiempo suficiente para que la máquina alcance el equilibrio térmico.',
};

export function definicionServicio(tipo: TipoServicio): string {
  return DEFINICIONES_SERVICIO[tipo];
}
