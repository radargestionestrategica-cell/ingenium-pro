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

  return { volumenActual, capacidadTotal, capacidadRestante, camiones30m3 };
}
