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
): number {
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
      sumResistente += (c * d.b + (W - u * d.b) * tanFric) / mAlfa;
      sumMotor += W * Math.sin(alfaRad) + kh * W * (d.brazo ?? 0) / R;
    }
    const fsNuevo = sumResistente / sumMotor;
    if (Math.abs(fsNuevo - fs) < 0.001) return fsNuevo;
    fs = fsNuevo;
  }
  return fs;
}
