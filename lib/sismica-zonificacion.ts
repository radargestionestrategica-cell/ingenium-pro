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
];

export function pgaAKh(pga: number, factor = 0.5): number {
  return pga * factor;
}
