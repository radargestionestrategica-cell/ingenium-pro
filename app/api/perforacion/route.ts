import { NextResponse } from 'next/server';

function calcBHP(TVD: number, mudWeight: number, cuttingsLoad = 0) {
  const hydrostaticPsi = 0.052 * mudWeight * TVD;
  const bhp = hydrostaticPsi + cuttingsLoad;
  const risk = bhp > 10000 ? 'CRITICAL' : bhp > 7000 ? 'HIGH' : bhp > 4000 ? 'MEDIUM' : 'LOW';
  return { bhp: +bhp.toFixed(0), hydrostaticPsi: +hydrostaticPsi.toFixed(0), risk };
}

function calcFractureGradient(depth: number, overburdenGrad: number, poissonRatio = 0.25) {
  const fracGrad = (poissonRatio / (1 - poissonRatio)) * (overburdenGrad - 0.433) + 0.433;
  const fracPressure = fracGrad * depth;
  return { fracGrad: +fracGrad.toFixed(3), fracPressure: +fracPressure.toFixed(0) };
}

function calcMudWeight(porePresGrad: number, safetyFactor = 0.5) {
  const mudWeight = porePresGrad + safetyFactor;
  const ecd = mudWeight * 1.02;
  const risk = mudWeight > 18 ? 'CRITICAL' : mudWeight > 15 ? 'HIGH' : mudWeight > 12 ? 'MEDIUM' : 'LOW';
  return { mudWeight: +mudWeight.toFixed(2), ecd: +ecd.toFixed(2), risk };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const TVD       = Number(body.TVD)       || 0;
    const mudWeight = Number(body.mudWeight) || 0;
    const overburden = Number(body.overburden) || 1.0;
    const poreGrad   = Number(body.poreGrad)   || 0.433;

    if (!TVD || !mudWeight) {
      return NextResponse.json({ error: 'TVD y mudWeight son requeridos' }, { status: 400 });
    }

    const bhp  = calcBHP(TVD, mudWeight);
    const frac = calcFractureGradient(TVD, overburden);
    const mud  = calcMudWeight(poreGrad);

    return NextResponse.json({ bhp, frac, mud });
  } catch {
    return NextResponse.json({ error: 'Error en cálculo de perforación' }, { status: 500 });
  }
}
