export interface Dovela {
  b: number;
  h: number;
  alfa: number;
  u?: number;
  brazo?: number;
}

export function calcularFSBishop(
  dovelas: Dovela[],
  c: number,
  friccionGrados: number,
  gamma: number,
  R: number,
  kh = 0,
): number | null {
  // Guarda de dominio: sin dovelas o con R<=0 el metodo no tiene geometria
  // sobre la que iterar (R aparece dividiendo en sumMotor).
  if (dovelas.length === 0 || !(R > 0)) return null;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const tanFric = Math.tan(toRad(friccionGrados));

  let fs = 1.5;
  for (let i = 0; i < 50; i++) {
    let sumResistente = 0;
    let sumMotor = 0;
    for (const d of dovelas) {
      const alfaRad = toRad(d.alfa);
      const W = d.b * d.h * gamma;
      const u = d.u ?? 0;
      const mAlfa = Math.cos(alfaRad) * (1 + (tanFric * Math.tan(alfaRad)) / fs);
      // mAlfa=0 (p.ej. alfa=90°) deja la division de sumResistente indefinida
      // — se aborta con estado de error explicito en vez de propagar Infinity/NaN.
      if (mAlfa === 0) return null;
      sumResistente += (c * d.b + (W - u * d.b) * tanFric) / mAlfa;
      sumMotor += W * Math.sin(alfaRad) + kh * W * (d.brazo ?? 0) / R;
    }
    // sumMotor=0 (p.ej. dovelas todas horizontales y kh=0) deja el FS
    // indefinido (division por cero) — mismo criterio de error explicito.
    if (sumMotor === 0) return null;
    const fsNuevo = sumResistente / sumMotor;
    if (!Number.isFinite(fsNuevo)) return null;
    if (Math.abs(fsNuevo - fs) < 0.001) return fsNuevo;
    fs = fsNuevo;
  }
  return fs;
}
