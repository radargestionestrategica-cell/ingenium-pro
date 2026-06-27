// lib/telemetria-calculo.ts
// Calculo de volumen de piletas troncopiramidales a partir de su geometria
// y el nivel de liquido medido. Pure TypeScript, sin dependencias externas.

export interface GeometriaPileta {
  largoCoronamiento: number;  // largo en la parte superior de la pileta, en metros
  anchoCoronamiento: number;  // ancho en la parte superior de la pileta, en metros
  profundidad: number;        // profundidad total de la pileta, en metros
  talud: number;              // relacion horizontal por cada metro vertical del talud
}

export interface ResultadoPileta {
  volumenActual: number;       // metros cubicos contenidos hasta el nivel medido
  capacidadTotal: number;      // metros cubicos totales de la pileta llena
  capacidadRestante: number;   // metros cubicos que faltan para llenar la pileta
  camiones30m3: number;        // cantidad de camiones de treinta metros cubicos necesarios
  norma: string;
}

const CAPACIDAD_CAMION_M3 = 30;

// Calcula el area rectangular a una altura dada, medida desde el fondo de la pileta.
// Como la pileta es troncopiramidal, las dimensiones se achican hacia el fondo
// segun el talud: por cada metro que se baja, cada lado se reduce el valor del talud.
function dimensionesEnAltura(geometria: GeometriaPileta, alturaDesdeFondo: number) {
  const reduccionDesdeCoronamiento = geometria.talud * (geometria.profundidad - alturaDesdeFondo);
  const largo = geometria.largoCoronamiento - 2 * reduccionDesdeCoronamiento;
  const ancho = geometria.anchoCoronamiento - 2 * reduccionDesdeCoronamiento;
  return { largo, ancho };
}

function areaEnAltura(geometria: GeometriaPileta, alturaDesdeFondo: number): number {
  const { largo, ancho } = dimensionesEnAltura(geometria, alturaDesdeFondo);
  return Math.max(largo, 0) * Math.max(ancho, 0);
}

// Calcula el volumen contenido entre el fondo de la pileta y una altura dada,
// usando la formula del prismatoide: se toma el area del fondo, el area en la
// mitad de la altura y el area en la altura superior, se suma el area de la
// mitad multiplicada por cuatro, y el resultado se multiplica por la altura
// dividida en seis partes.
function volumenHastaAltura(geometria: GeometriaPileta, altura: number): number {
  if (altura <= 0) return 0;

  const areaFondo  = areaEnAltura(geometria, 0);
  const areaMedio  = areaEnAltura(geometria, altura / 2);
  const areaSuperior = areaEnAltura(geometria, altura);

  return (altura / 6) * (areaFondo + 4 * areaMedio + areaSuperior);
}

export function calcularPileta(
  geometria: GeometriaPileta,
  nivelMedido: number,
): ResultadoPileta {
  const nivelAcotado = Math.min(Math.max(nivelMedido, 0), geometria.profundidad);

  const volumenActual  = volumenHastaAltura(geometria, nivelAcotado);
  const capacidadTotal = volumenHastaAltura(geometria, geometria.profundidad);
  const capacidadRestante = Math.max(capacidadTotal - volumenActual, 0);
  const camiones30m3 = Math.ceil(capacidadRestante / CAPACIDAD_CAMION_M3);

  return { volumenActual, capacidadTotal, capacidadRestante, camiones30m3, norma: 'Metodo del prismatoide (regla de Simpson)' };
}

export interface ResultadoEstabilidadPared {
  empujeHidrostatico: number;          // fuerza por metro lineal de pared, en kilonewton sobre metro
  puntoAplicacion: number;             // altura desde el fondo donde actua la fuerza resultante, en metros
  factorSeguridadDeslizamiento: number; // factor de seguridad del talud frente al deslizamiento, sin unidad
  norma: string;
}

// Calcula el empuje hidrostatico, su punto de aplicacion y el factor de
// seguridad al deslizamiento del talud, a partir del nivel de liquido medido,
// el peso especifico del liquido, el angulo de friccion interna del suelo
// y la relacion del talud.
//
// El empuje hidrostatico se obtiene de la distribucion triangular de presion
// contra la pared: se multiplica el peso especifico del liquido por el
// cuadrado del nivel medido, y el resultado se divide a la mitad.
//
// El punto de aplicacion de esa fuerza, al ser la distribucion triangular,
// queda ubicado a un tercio del nivel medido contado desde el fondo.
//
// El factor de seguridad al deslizamiento del talud se calcula con el
// metodo del talud infinito en condicion seca: se compara la tangente del
// angulo de friccion del suelo contra la tangente del angulo del talud. El
// angulo del talud se obtiene a partir de la relacion horizontal sobre
// vertical que describe el talud.
export function calcularEstabilidadPared(
  nivelMedido: number,
  pesoEspecificoLiquido: number,
  anguloFriccionGrados: number,
  talud: number,
): ResultadoEstabilidadPared {
  const empujeHidrostatico = (pesoEspecificoLiquido * nivelMedido * nivelMedido) / 2;
  const puntoAplicacion = nivelMedido / 3;

  const anguloFriccionRadianes = (anguloFriccionGrados * Math.PI) / 180;
  const anguloTaludRadianes = Math.atan(1 / talud);
  const factorSeguridadDeslizamiento = Math.tan(anguloFriccionRadianes) / Math.tan(anguloTaludRadianes);

  return { empujeHidrostatico, puntoAplicacion, factorSeguridadDeslizamiento, norma: 'USACE EM 1110-2-1902' };
}
