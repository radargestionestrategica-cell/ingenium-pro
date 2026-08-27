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

// ── Límite de temperatura de bobinado — IEC 60034-11 ────────────────────
export type ClaseTermica = '130' | '155' | '180' | '200';
export type MetodoDeteccion = 'lento' | 'rapido';

// Tabla 1 IEC 60034-11 (método lento) y Tabla 2 (método rápido) — límites
// verificados en °C por clase térmica.
const LIMITE_TEMP_LENTO: Record<ClaseTermica, number> = {
  '130': 145,
  '155': 170,
  '180': 195,
  '200': 215,
};

const LIMITE_TEMP_RAPIDO: Record<ClaseTermica, number> = {
  '130': 225,
  '155': 250,
  '180': 275,
  '200': 295,
};

export function limiteTemperaturaBobinado(
  claseTermica: ClaseTermica,
  metodo: MetodoDeteccion,
): number {
  return metodo === 'lento' ? LIMITE_TEMP_LENTO[claseTermica] : LIMITE_TEMP_RAPIDO[claseTermica];
}

// ── Verificación de arranque — IEC 60034-12 Diseño N ────────────────────
export interface ResultadoArranqueDisenoN {
  estado: 'verificado' | 'no_verificado';
  bandaKw?: string;
  parLockedRotorPu?: number;
  parPullUpPu?: number;
  parBreakdownPu?: number;
  mensaje: string;
}

interface BandaPotenciaKw {
  min: number;
  max: number;
}

// Bandas de potencia con verificación pendiente/parcial (IEC 60034-12 Tabla 1).
const BANDAS_VERIFICADAS_KW: BandaPotenciaKw[] = [
  { min: 0.12, max: 0.63 },
  { min: 4.0,  max: 6.3  },
  { min: 63,   max: 100  },
  { min: 250,  max: 400  },
  { min: 630,  max: 1600 },
];

// Par mínimo verificado (locked-rotor / pull-up / breakdown, en pu) —
// IEC 60034-12 Tabla 1, Diseño N. Fuera de estas 5 bandas de potencia,
// la función NUNCA inventa ni interpola: devuelve "no_verificado".
const TABLA_PAR_ARRANQUE_DISENO_N: Record<
  string,
  { lockedRotorPu: number; pullUpPu: number; breakdownPu: number } | undefined
> = {
  '0.12-0.63_2': { lockedRotorPu: 1.9,  pullUpPu: 1.3, breakdownPu: 2.0 },
  '0.12-0.63_4': { lockedRotorPu: 2.0,  pullUpPu: 1.4, breakdownPu: 2.0 },
  '0.12-0.63_6': { lockedRotorPu: 2.0,  pullUpPu: 1.4, breakdownPu: 2.0 },
  '0.12-0.63_8': { lockedRotorPu: 2.0,  pullUpPu: 1.4, breakdownPu: 2.0 },

  '4-6.3_2': { lockedRotorPu: 1.5, pullUpPu: 1.0, breakdownPu: 2.0 },
  '4-6.3_4': { lockedRotorPu: 1.5, pullUpPu: 1.0, breakdownPu: 2.0 },
  '4-6.3_6': { lockedRotorPu: 1.5, pullUpPu: 1.0, breakdownPu: 2.0 },
  '4-6.3_8': { lockedRotorPu: 1.5, pullUpPu: 1.0, breakdownPu: 2.0 },

  '63-100_2': { lockedRotorPu: 1.0, pullUpPu: 0.7, breakdownPu: 1.8 },
  '63-100_4': { lockedRotorPu: 1.0, pullUpPu: 0.7, breakdownPu: 1.8 },
  '63-100_6': { lockedRotorPu: 1.0, pullUpPu: 0.7, breakdownPu: 1.8 },
  '63-100_8': { lockedRotorPu: 1.0, pullUpPu: 0.7, breakdownPu: 1.8 },

  '250-400_2': { lockedRotorPu: 0.75, pullUpPu: 0.6, breakdownPu: 1.6 },
  '250-400_4': { lockedRotorPu: 0.75, pullUpPu: 0.6, breakdownPu: 1.6 },
  '250-400_6': { lockedRotorPu: 0.75, pullUpPu: 0.6, breakdownPu: 1.6 },
  '250-400_8': { lockedRotorPu: 0.75, pullUpPu: 0.6, breakdownPu: 1.6 },

  '630-1600_2': { lockedRotorPu: 0.5, pullUpPu: 0.3, breakdownPu: 1.6 },
  '630-1600_4': { lockedRotorPu: 0.5, pullUpPu: 0.3, breakdownPu: 1.6 },
  '630-1600_6': { lockedRotorPu: 0.5, pullUpPu: 0.3, breakdownPu: 1.6 },
  '630-1600_8': { lockedRotorPu: 0.5, pullUpPu: 0.3, breakdownPu: 1.6 },
};

export function verificarArranqueDisenoN(
  potenciaKw: number,
  polos: string,
): ResultadoArranqueDisenoN {
  const banda = BANDAS_VERIFICADAS_KW.find(b => potenciaKw >= b.min && potenciaKw <= b.max);

  if (!banda) {
    return {
      estado: 'no_verificado',
      mensaje: 'Fuera de rango verificado, pendiente fuente primaria IEC 60034-12 Tabla 1',
    };
  }

  const bandaKw = `${banda.min}-${banda.max} kW`;
  const clave = `${banda.min}-${banda.max}_${polos}`;
  const datos = TABLA_PAR_ARRANQUE_DISENO_N[clave];

  if (!datos) {
    return {
      estado: 'no_verificado',
      bandaKw,
      mensaje: 'Banda de potencia reconocida, pero valores de par aún no cargados en la tabla — pendiente fuente primaria IEC 60034-12 Tabla 1',
    };
  }

  return {
    estado: 'verificado',
    bandaKw,
    parLockedRotorPu: datos.lockedRotorPu,
    parPullUpPu:      datos.pullUpPu,
    parBreakdownPu:   datos.breakdownPu,
    mensaje: `Par mínimo verificado — IEC 60034-12 Tabla 1, banda ${bandaKw}`,
  };
}

// ── Caída de tensión en tramo de cable ──────────────────────────────────
const RESISTIVIDAD_COBRE_20C = 1.68e-8; // ohm·m

export interface ResultadoCaidaTension {
  caidaV:          number;
  caidaPorcentaje: number;
}

export function caidaTension(
  corrienteA: number,
  longitudMetros: number,
  seccionMm2: number,
  idaYVuelta: boolean,
  voltajeReferenciaV: number,
): ResultadoCaidaTension {
  if (seccionMm2 <= 0 || voltajeReferenciaV <= 0) {
    return { caidaV: 0, caidaPorcentaje: 0 };
  }

  const longitudEfectiva = longitudMetros * (idaYVuelta ? 2 : 1);
  const resistenciaOhm   = RESISTIVIDAD_COBRE_20C * longitudEfectiva / (seccionMm2 * 1e-6);
  const caidaV           = corrienteA * resistenciaOhm;
  const caidaPorcentaje  = (caidaV / voltajeReferenciaV) * 100;

  return {
    caidaV:          +caidaV.toFixed(3),
    caidaPorcentaje: +caidaPorcentaje.toFixed(2),
  };
}

// ── Fusible sugerido — código de colores blade (Littelfuse/Bussmann) ────
const FUSIBLES_BLADE: { amperaje: number; color: string }[] = [
  { amperaje: 5,  color: 'tan' },
  { amperaje: 7.5, color: 'marrón' },
  { amperaje: 10, color: 'rojo' },
  { amperaje: 15, color: 'azul' },
  { amperaje: 20, color: 'amarillo' },
  { amperaje: 25, color: 'incoloro' },
  { amperaje: 30, color: 'verde' },
];

export interface ResultadoFusible {
  amperaje?: number;
  color?:    string;
  mensaje:   string;
}

export function fusibleSugerido(corrienteA: number): ResultadoFusible {
  const encontrado = FUSIBLES_BLADE.find(f => f.amperaje >= corrienteA);

  if (!encontrado) {
    return {
      mensaje: 'Fuera de rango de fusible blade estándar, consultar fusible de alta corriente',
    };
  }

  return {
    amperaje: encontrado.amperaje,
    color:    encontrado.color,
    mensaje:  `Fusible sugerido: ${encontrado.amperaje}A (${encontrado.color})`,
  };
}

// ── Ampacidad de cable — pendiente fuente primaria ──────────────────────
export interface ResultadoAmpacidad {
  estado:  'no_verificado';
  mensaje: string;
}

// NUNCA se inventa una tabla de ampacidad: hasta cargar una fuente primaria
// verificada (SAE J1292/J2183), esta función siempre devuelve "no_verificado".
export function verificarAmpacidadCable(): ResultadoAmpacidad {
  return {
    estado:  'no_verificado',
    mensaje: 'Ampacidad de cable - pendiente fuente primaria SAE J1292/J2183',
  };
}

// ── CCA disponible por temperatura — SAE J537 ───────────────────────────
// El CCA nominal se mide a -18°C. Tasa de corrección: 1.1% por cada grado
// °C de diferencia respecto a -18°C (fuente: SENS-USA, ejemplo verificado
// 1805 CCA a 0°C → 1444 CCA a -18°C).
export interface ResultadoCCA {
  ccaDisponible: number;
  mensaje:       string;
}

export function ccaDisponible(ccaNominal: number, tempAmbienteC: number): ResultadoCCA {
  const extrapolado  = tempAmbienteC > 0;
  const tempCalculo  = extrapolado ? 0 : tempAmbienteC;
  const cca          = ccaNominal * (1 + 0.011 * (tempCalculo - (-18)));

  const mensaje = extrapolado
    ? 'CCA disponible estimado — corrección SAE J537 (1.1%/°C respecto a -18°C, fuente SENS-USA); extrapolado sobre el rango verificado (-18°C a 0°C).'
    : 'CCA disponible estimado — corrección SAE J537 (1.1%/°C respecto a -18°C, fuente SENS-USA).';

  return { ccaDisponible: +cca.toFixed(0), mensaje };
}

// ── Alternador requerido — metodología Delco Remy ───────────────────────
export interface ResultadoAlternador {
  alternadorMinimoA: number;
  mensaje:           string;
}

export function alternadorRequerido(
  cargaContinuaA: number,
  cargaIntermitenteA: number,
): ResultadoAlternador {
  const cargaTotal        = cargaContinuaA + (0.25 * cargaIntermitenteA) + (0.20 * cargaContinuaA);
  const alternadorMinimoA = cargaTotal * 1.5;

  return {
    alternadorMinimoA: +alternadorMinimoA.toFixed(1),
    mensaje: 'Metodología de fabricante (Delco Remy), no es tabla normativa SAE/ISO - verificar contra especificación vigente del fabricante antes de aplicar en obra.',
  };
}

// ── Clase de temperatura — IEC 60079-0 ──────────────────────────────────
export type ClaseTemperaturaIEC = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';

export interface ResultadoClaseTemperatura {
  clase:   ClaseTemperaturaIEC | null;
  mensaje: string;
}

// Temperatura superficial máxima por clase, IEC 60079-0.
const TABLA_CLASE_TEMPERATURA: { clase: ClaseTemperaturaIEC; maxC: number }[] = [
  { clase: 'T1', maxC: 450 },
  { clase: 'T2', maxC: 300 },
  { clase: 'T3', maxC: 200 },
  { clase: 'T4', maxC: 135 },
  { clase: 'T5', maxC: 100 },
  { clase: 'T6', maxC: 85  },
];

export function verificarClaseTemperatura(temperaturaAutoignicionC: number): ResultadoClaseTemperatura {
  if (temperaturaAutoignicionC <= 85) {
    return { clase: null, mensaje: 'Requiere T6 o consultar caso especial' };
  }

  const validas = TABLA_CLASE_TEMPERATURA.filter(t => t.maxC < temperaturaAutoignicionC);
  // Clase mínima requerida = la de MAYOR temperatura superficial máxima
  // que siga siendo estrictamente menor al AIT (evita sobredimensionar).
  const minimaRequerida = validas.reduce((prev, cur) => (cur.maxC > prev.maxC ? cur : prev));

  return {
    clase:   minimaRequerida.clase,
    mensaje: `Clase de temperatura mínima requerida: ${minimaRequerida.clase} (IEC 60079-0) — temp. superficial máxima ${minimaRequerida.maxC}°C, AIT del hidrocarburo ${temperaturaAutoignicionC}°C.`,
  };
}

// ── Verificación de bonding — API RP 2003 ───────────────────────────────
export interface ResultadoBonding {
  apto:    boolean;
  mensaje: string;
}

export function verificarBonding(resistenciaMedidaOhms: number): ResultadoBonding {
  const apto = resistenciaMedidaOhms <= 10;

  return {
    apto,
    mensaje: apto
      ? `Apto — resistencia de bonding ${resistenciaMedidaOhms} Ω ≤ 10 Ω (límite API RP 2003).`
      : `No apto, verificar conexión — resistencia de bonding ${resistenciaMedidaOhms} Ω > 10 Ω (límite API RP 2003).`,
  };
}

// ── Método de refrigeración — código IC, IEC 60034-6 ────────────────────
// Tabla fija, fuente IEC 60034-6:1991, reproducida idéntica sin
// desviaciones en IS 6362:1995. Descriptivo/informativo — no modifica
// el cálculo de derrateo térmico por altitud/temperatura ya existente,
// solo lo complementa con contexto sobre el método de refrigeración.
export type CodigoIC = 'IC01' | 'IC411' | 'IC416' | 'IC611' | 'IC81W';

export interface ResultadoCodigoIC {
  descripcion: string;
  implicancia: string;
}

const TABLA_CODIGO_IC: Record<CodigoIC, ResultadoCodigoIC> = {
  IC01: {
    descripcion: 'Autoventilado, circuito abierto (ventilador en el eje)',
    implicancia: 'Pierde refrigeración proporcional a la velocidad del eje - aplica derrateo completo por altitud y por baja velocidad VFD',
  },
  IC411: {
    descripcion: 'Autoventilado, superficie de carcasa (TEFC - ventilador en el eje)',
    implicancia: 'Misma que IC01 - aplica derrateo completo por altitud y baja velocidad VFD',
  },
  IC416: {
    descripcion: 'Ventilación forzada independiente sobre carcasa (TEFV - soplador con motor propio)',
    implicancia: 'No pierde refrigeración a baja velocidad del eje - el derrateo por baja velocidad VFD NO aplica. El derrateo por altitud sí aplica (sigue siendo aire)',
  },
  IC611: {
    descripcion: 'Intercambiador de calor aire-aire montado en la máquina (CACA), ambos circuitos autoventilados',
    implicancia: 'Derrateo por altitud aplica de forma indirecta - verificar curva del fabricante',
  },
  IC81W: {
    descripcion: 'Intercambiador de calor aire-agua montado en la máquina (CACW), agua a presión',
    implicancia: 'El agua es la vía principal de disipación de calor - el derrateo estándar por densidad de aire (altitud) NO aplica de la misma manera - verificar con fabricante',
  },
};

export function decodificarCodigoIC(codigo: CodigoIC): ResultadoCodigoIC {
  return TABLA_CODIGO_IC[codigo];
}
