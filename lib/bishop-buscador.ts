import { calcularFSBishop } from './bishop';

function yTerr(x: number, H: number, pend: number): number {
  if (x <= 0) return 0;
  if (x >= H * pend) return H;
  return x / pend;
}

function baseCirc(x: number, xc: number, yc: number, R: number): number {
  return yc - Math.sqrt(R * R - (x - xc) * (x - xc));
}

function fsCirculo(
  xc: number, yc: number, R: number,
  H: number, pend: number,
  c: number, friccionGrados: number, gamma: number,
  nivelAgua: number | null,
  kh = 0,
): number | null {
  const pasos = 400;
  const dx = (2 * R) / pasos;
  let xIni: number | null = null;
  let xFin: number | null = null;

  for (let i = 0; i <= pasos; i++) {
    const x = xc - R + i * dx;
    const yt = yTerr(x, H, pend);
    const yb = baseCirc(x, xc, yc, R);
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
): number {
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

  return fsMin;
}

export { calcularFSBishop, yTerr, baseCirc, fsCirculo };
