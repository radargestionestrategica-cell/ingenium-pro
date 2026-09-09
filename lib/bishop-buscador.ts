import { calcularFSBishop } from './bishop';

function yTerr(x: number, H: number, pend: number): number {
  // Guarda de dominio: pend<=0 (talud invalido) hace que x/pend degenere en
  // division por cero o cambie de signo sin sentido fisico. NaN es la señal
  // explicita de "invalido" que fsCirculo detecta mas abajo.
  if (!(pend > 0)) return NaN;
  if (x <= 0) return 0;
  if (x >= H * pend) return H;
  return x / pend;
}

function baseCirc(x: number, xc: number, yc: number, R: number): number {
  // Guarda de dominio: R<=0 no es un circulo valido, y un discriminante
  // negativo significa que x cae fuera del circulo — ambos casos son
  // invalidos para esta formula (Math.sqrt de negativo). Se señaliza con
  // NaN en vez de dejar pasar un resultado numerico incorrecto.
  if (!(R > 0)) return NaN;
  const discriminante = R * R - (x - xc) * (x - xc);
  if (discriminante < 0) return NaN;
  return yc - Math.sqrt(discriminante);
}

function fsCirculo(
  xc: number, yc: number, R: number,
  H: number, pend: number,
  c: number, friccionGrados: number, gamma: number,
  nivelAgua: number | null,
  kh = 0,
): number | null {
  // Guarda de dominio: sin esto, H<=0 o pend<=0 (geometria invalida) se
  // propagarian como NaN silencioso a traves de todo el barrido de circulos.
  if (!(R > 0) || !(H > 0) || !(pend > 0)) return null;

  const pasos = 400;
  const dx = (2 * R) / pasos;
  let xIni: number | null = null;
  let xFin: number | null = null;

  for (let i = 0; i <= pasos; i++) {
    const x = xc - R + i * dx;
    const yt = yTerr(x, H, pend);
    const yb = baseCirc(x, xc, yc, R);
    if (!Number.isFinite(yt) || !Number.isFinite(yb)) continue; // punto fuera de dominio (redondeo en el borde del circulo) — se descarta, no invalida el barrido
    if (yt > yb) {
      if (xIni === null) xIni = x;
      xFin = x;
    }
  }

  if (xIni === null || xFin === null || xFin <= xIni) return null;

  const nDovelas = 20;
  const ancho = (xFin - xIni) / nDovelas;
  const dovelas = [];

  for (let i = 0; i < nDovelas; i++) {
    const xMid = xIni + (i + 0.5) * ancho;
    const yBase = baseCirc(xMid, xc, yc, R);
    if (!Number.isFinite(yBase)) return null; // dovela fuera de dominio — este circulo no es evaluable, error explicito
    const h = Math.max(yTerr(xMid, H, pend) - yBase, 0);
    const sinAlfa = Math.max(-1, Math.min(1, (xMid - xc) / R));
    const alfa = (Math.asin(sinAlfa) * 180) / Math.PI;
    const profAgua = (nivelAgua ?? 0) - yBase;
    const u = profAgua > 0 ? 9.81 * profAgua : 0;
    const brazo = yc - (yBase + h / 2);
    dovelas.push({ b: ancho, h, alfa, u, brazo });
  }

  return calcularFSBishop(dovelas, c, friccionGrados, gamma, R, kh);
}


export function buscarFSCritico(
  H: number, pend: number,
  c: number, friccionGrados: number, gamma: number,
  nivelAgua: number | null,
  kh = 0,
): number | null {
  // Guarda de dominio: si la geometria es invalida, ningun circulo de la
  // busqueda va a ser evaluable (fsCirculo siempre devuelve null) — se corta
  // antes en vez de dejar que fsMin quede en Infinity silencioso.
  if (!(H > 0) || !(pend > 0)) return null;

  let fsMin = Infinity;
  let bestXc = 0, bestYc = 0, bestR = 0;

  for (let xc = 0; xc <= 40; xc += 4) {
    for (let yc = 12; yc <= 44; yc += 4) {
      for (let R = 10; R <= 52; R += 4) {
        const fs = fsCirculo(xc, yc, R, H, pend, c, friccionGrados, gamma, nivelAgua, kh);
        if (fs !== null && fs >= 0.2 && fs < fsMin) {
          fsMin = fs; bestXc = xc; bestYc = yc; bestR = R;
        }
      }
    }
  }

  for (let xc = bestXc - 4; xc <= bestXc + 4; xc += 1) {
    for (let yc = bestYc - 4; yc <= bestYc + 4; yc += 1) {
      for (let R = bestR - 4; R <= bestR + 4; R += 1) {
        if (R < 1) continue;
        const fs = fsCirculo(xc, yc, R, H, pend, c, friccionGrados, gamma, nivelAgua, kh);
        if (fs !== null && fs >= 0.2 && fs < fsMin) {
          fsMin = fs;
        }
      }
    }
  }

  // Si ningun circulo del barrido resulto evaluable, fsMin nunca se actualizo
  // y sigue en su valor inicial Infinity — se traduce a null explicito en vez
  // de devolver Infinity silencioso.
  return Number.isFinite(fsMin) ? fsMin : null;
}

export { calcularFSBishop, yTerr, baseCirc, fsCirculo };
