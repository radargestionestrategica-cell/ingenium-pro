// lib/represa-estabilidad.ts
// Estabilidad de un muro de hormigon de gravedad (represa) frente a
// deslizamiento y vuelco en la interfaz hormigon-fundacion.
// Fuente: USACE EM 1110-2-2200 "Gravity Dam Design", Capitulo 4.
//   - Ecuacion 4-8: FS deslizamiento = (W - U) * f / H
//   - Ecuacion 4-1: ubicacion de la resultante de fuerzas en la base
//   - Parrafo 3-3d: subpresion (uplift) triangular en la base sin drenes de alivio
//   - Tabla 4-1: umbrales de semaforo del FS al deslizamiento
//
// Seccion transversal supuesta: muro trapezoidal con paramento aguas arriba
// vertical (talon en x=0) y paramento aguas abajo inclinado segun el talud
// (relacion horizontal por cada metro vertical), puntera en x = anchoBase.

const GAMMA_AGUA = 9.81; // kN/m3

export interface GeometriaMuroRepresa {
  anchoCoronamiento: number; // m
  profundidad: number;       // m, altura total del muro (H)
  talud: number;             // relacion horizontal:vertical del paramento aguas abajo
}

export interface ParametrosEstabilidadRepresa {
  pesoEspecificoHormigon: number;  // kN/m3
  coeficienteFriccionBase: number; // adimensional, f = tan(phi) efectivo hormigon-fundacion
  nivelAgua: number;               // m, medido desde la base del muro
}

export type SemaforoEstabilidad = 'verde' | 'amarillo' | 'rojo';

export interface ResultadoEstabilidadRepresa {
  baseAncho: number;                     // L, m
  pesoMuro: number;                      // W, kN/m
  empujeHidrostatico: number;            // H, kN/m
  subpresion: number;                    // U, kN/m
  factorSeguridadDeslizamiento: number;  // FS, Ecuacion 4-8
  distanciaResultanteDesdeTalon: number; // m, Ecuacion 4-1
  excentricidad: number;                 // m, + hacia el talon
  resultanteEnTercioMedio: boolean;      // |e| <= L/6
  semaforo: SemaforoEstabilidad;         // Tabla 4-1
  norma: string;
}

export function calcularEstabilidadMuroRepresa(
  geometria: GeometriaMuroRepresa,
  params: ParametrosEstabilidadRepresa,
): ResultadoEstabilidadRepresa {
  const { anchoCoronamiento, profundidad: H, talud } = geometria;
  const { pesoEspecificoHormigon: gammaH, coeficienteFriccionBase: f } = params;
  const h = Math.min(Math.max(params.nivelAgua, 0), H);

  const baseAncho = anchoCoronamiento + talud * H;

  const pesoMuro = gammaH * H * (anchoCoronamiento + baseAncho) / 2;
  const empujeHidrostatico = (GAMMA_AGUA * h * h) / 2;
  const subpresion = (GAMMA_AGUA * h * baseAncho) / 2;

  const factorSeguridadDeslizamiento = ((pesoMuro - subpresion) * f) / empujeHidrostatico;

  const areaRectangulo = anchoCoronamiento * H;
  const areaTriangulo = 0.5 * talud * H * H;
  const centroideRectangulo = anchoCoronamiento / 2;
  const centroideTriangulo = anchoCoronamiento + (talud * H) / 3;
  const centroideW = (areaRectangulo * centroideRectangulo + areaTriangulo * centroideTriangulo)
    / (areaRectangulo + areaTriangulo);

  const brazoW = baseAncho - centroideW;
  const brazoU = baseAncho - baseAncho / 3;
  const brazoH = h / 3;

  const momentoResistente = pesoMuro * brazoW - subpresion * brazoU;
  const momentoVolcante = empujeHidrostatico * brazoH;
  const sumaVertical = pesoMuro - subpresion;

  const distanciaResultanteDesdePuntera = (momentoResistente - momentoVolcante) / sumaVertical;
  const distanciaResultanteDesdeTalon = baseAncho - distanciaResultanteDesdePuntera;
  const excentricidad = baseAncho / 2 - distanciaResultanteDesdeTalon;
  const resultanteEnTercioMedio = Math.abs(excentricidad) <= baseAncho / 6;

  const semaforo: SemaforoEstabilidad =
    factorSeguridadDeslizamiento > 2.0 ? 'verde' :
    factorSeguridadDeslizamiento >= 1.3 ? 'amarillo' : 'rojo';

  return {
    baseAncho, pesoMuro, empujeHidrostatico, subpresion,
    factorSeguridadDeslizamiento,
    distanciaResultanteDesdeTalon, excentricidad, resultanteEnTercioMedio,
    semaforo,
    norma: 'USACE EM 1110-2-2200 Cap.4 (Ec.4-8 deslizamiento, Ec.4-1 resultante), §3-3d (subpresion sin drenes), Tabla 4-1 (semaforo)',
  };
}

// permeabilidadRevestimiento (m/s) es un dato informativo de caracterizacion
// del revestimiento del activo — no interviene en esta formula de deslizamiento/vuelco.
