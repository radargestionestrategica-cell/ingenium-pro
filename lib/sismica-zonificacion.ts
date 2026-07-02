export interface ZonaSismica {
  nombre: string;
  pga: number;
}

export interface PaisSismico {
  nombre: string;
  norma: string;
  zonas: ZonaSismica[];
}

export const PAISES_SISMICOS: PaisSismico[] = [
  {
    nombre: 'Argentina',
    norma: 'INPRES-CIRSOC 103',
    zonas: [
      { nombre: 'Zona 0', pga: 0.04 },
      { nombre: 'Zona 1', pga: 0.10 },
      { nombre: 'Zona 2', pga: 0.18 },
      { nombre: 'Zona 3', pga: 0.25 },
      { nombre: 'Zona 4', pga: 0.35 },
    ],
  },
  {
    nombre: 'Chile',
    norma: 'NCh433',
    zonas: [
      { nombre: 'Zona 1', pga: 0.20 },
      { nombre: 'Zona 2', pga: 0.30 },
      { nombre: 'Zona 3', pga: 0.40 },
    ],
  },
  {
    nombre: 'Peru',
    norma: 'E.030',
    zonas: [
      { nombre: 'Zona 1', pga: 0.10 },
      { nombre: 'Zona 2', pga: 0.25 },
      { nombre: 'Zona 3', pga: 0.35 },
      { nombre: 'Zona 4', pga: 0.45 },
    ],
  },
  {
    nombre: 'Ecuador',
    norma: 'NEC-SE-DS',
    zonas: [
      { nombre: 'Zona I', pga: 0.15 },
      { nombre: 'Zona II', pga: 0.25 },
      { nombre: 'Zona III', pga: 0.30 },
      { nombre: 'Zona IV', pga: 0.35 },
      { nombre: 'Zona V', pga: 0.40 },
      { nombre: 'Zona VI (mínimo normativo)', pga: 0.50 },
    ],
  },
  {
    nombre: 'Colombia',
    norma: 'NSR-10 Título A',
    zonas: [
      { nombre: 'Aa 0.05 (amenaza baja)',        pga: 0.05 },
      { nombre: 'Aa 0.10 (amenaza baja)',        pga: 0.10 },
      { nombre: 'Aa 0.15 (amenaza intermedia)',  pga: 0.15 },
      { nombre: 'Aa 0.20 (amenaza intermedia)',  pga: 0.20 },
      { nombre: 'Aa 0.25 (amenaza alta)',        pga: 0.25 },
      { nombre: 'Aa 0.30 (amenaza alta)',        pga: 0.30 },
      { nombre: 'Aa 0.35 (amenaza alta)',        pga: 0.35 },
      { nombre: 'Aa 0.40 (amenaza alta)',        pga: 0.40 },
      { nombre: 'Aa 0.45 (amenaza alta)',        pga: 0.45 },
      { nombre: 'Aa 0.50 (amenaza alta)',        pga: 0.50 },
    ],
  },
];

export function pgaAKh(pga: number, factor = 0.5): number {
  return pga * factor;
}

// México — CFE MDOC 2015 no usa zonas de valor fijo: el usuario ingresa la
// aceleración máxima en roca a0r (cm/s²) obtenida del programa oficial
// PRODISIS de CFE, y se clasifica según la Tabla 1.3.
export interface ZonificacionMexico {
  pga: number;   // fracción de g (a0r / 981)
  zona: string;
  nivel: string;
}

export function clasificarZonaMexico(a0r_cm_s2: number): ZonificacionMexico {
  const pga = a0r_cm_s2 / 981;

  if (a0r_cm_s2 < 50)  return { pga, zona: 'Zona A', nivel: 'Baja' };
  if (a0r_cm_s2 < 100) return { pga, zona: 'Zona B', nivel: 'Moderada' };
  if (a0r_cm_s2 < 200) return { pga, zona: 'Zona C', nivel: 'Alta' };
  return { pga, zona: 'Zona D', nivel: 'Muy Alta' };
}
