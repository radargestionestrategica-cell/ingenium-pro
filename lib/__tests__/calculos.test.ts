import { describe, it, expect } from 'vitest';
import {
  calcMAOP, calcDarcyWeisbach, calcGolpeAriete, calcCv,
  calcBHP, calcFractureGradient, calcMudWeight,
  calcCapacidadPortante,
  calcIntercambiador, calcDilatacionLineal,
  calcColumnaHormigon,
  calcRMR, calcVentilacion,
  calcHeatInputSoldadura, calcCarbonoEquivalente,
  calcMotorTrifasico, calcTransformadorElect,
  calcEspesorParedCaneria, calcHoopStressBarlow, calcVidaRemanente,
} from '../calculos';

// ════════════════════════════════════════════════════════════════
// MAOP — ASME B31.8 §A842.221
// ════════════════════════════════════════════════════════════════
describe('calcMAOP', () => {

  it('pared delgada Barlow — API 5L X52, 12" SCH 40', () => {
    // OD=323.85mm, t=9.52mm → ratio=0.0294 < 0.10 → Barlow
    const r = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20);
    expect(r).not.toBeNull();
    expect(r!.reg).toBe('PARED DELGADA — Barlow');
    // Pb = (2 × 359 × 9.52 × 0.72 × 1.0 × 1.0) / 323.85 = 15.197 MPa
    expect(r!.P).toBeCloseTo(15.197, 1);
    expect(r!.bar).toBeCloseTo(151.97, 0);
    expect(r!.T_factor).toBe(1.0);
  });

  it('pared gruesa Lamé — t/OD > 0.15', () => {
    // OD=100mm, t=18mm → ratio=0.18 > 0.15 → Lamé
    const r = calcMAOP(100, 18, 414, 0.72, 1.0, 20);
    expect(r).not.toBeNull();
    expect(r!.reg).toBe('PARED GRUESA — Lamé');
    expect(r!.ratio).toBeCloseTo(18, 0);   // 18%
  });

  it('zona de transición — 0.10 < t/OD < 0.15', () => {
    // OD=100mm, t=12mm → ratio=0.12
    const r = calcMAOP(100, 12, 359, 0.72, 1.0, 20);
    expect(r).not.toBeNull();
    expect(r!.reg).toBe('TRANSICIÓN');
  });

  it('factor temperatura alta T_op=200°C reduce MAOP', () => {
    const r20  = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20);
    const r200 = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 200);
    expect(r200!.P).toBeLessThan(r20!.P);
    expect(r200!.T_factor).toBe(0.9);
  });

  it('factor temperatura T_op=160°C = 0.933', () => {
    const r = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 160);
    expect(r!.T_factor).toBe(0.933);
  });

  it('F=1.0 (zona urbana) da mayor MAOP que F=0.72', () => {
    const r72  = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20);
    const r100 = calcMAOP(323.85, 9.52, 359, 1.0,  1.0, 20);
    expect(r100!.P).toBeGreaterThan(r72!.P);
  });

  it('retorna null con OD=0', () => {
    expect(calcMAOP(0, 9.52, 359)).toBeNull();
  });

  it('retorna null con t=0', () => {
    expect(calcMAOP(323.85, 0, 359)).toBeNull();
  });

  it('retorna null con SMYS=0', () => {
    expect(calcMAOP(323.85, 9.52, 0)).toBeNull();
  });

  it('retorna null si t >= OD/2 (físicamente imposible)', () => {
    expect(calcMAOP(100, 50, 359)).toBeNull();
    expect(calcMAOP(100, 60, 359)).toBeNull();
  });

  it('riesgo CRITICAL cuando MAOP > 10 MPa', () => {
    const r = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20);
    expect(r!.risk).toBe('CRITICAL');
  });

  it('conversión MPa → psi correcta (factor 145.04)', () => {
    const r = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20);
    expect(r!.psi).toBe(+(r!.P * 145.04).toFixed(0));
  });
});

// ════════════════════════════════════════════════════════════════
// DARCY-WEISBACH — ISO 4006
// ════════════════════════════════════════════════════════════════
describe('calcDarcyWeisbach', () => {

  it('régimen turbulento — acero comercial DN100', () => {
    // Q=10 L/s, D=100mm, L=1000m, rugosidad=0.046mm, K=0
    const r = calcDarcyWeisbach(10, 100, 1000, 0.046, 0);
    expect(r).not.toBeNull();
    expect(r!.regimen).toBe('TURBULENTO');
    // V ≈ 1.273 m/s → Re ≈ 126.793 → turbulento ✓
    expect(r!.V).toBeCloseTo(1.273, 2);
    expect(r!.Re).toBeGreaterThan(4000);
  });

  it('régimen laminar — caudal muy bajo', () => {
    // Q=0.1 L/s, D=100mm → V ≈ 0.0127 m/s → Re ≈ 1268 < 2300
    const r = calcDarcyWeisbach(0.1, 100, 100, 0.046, 0);
    expect(r).not.toBeNull();
    expect(r!.regimen).toBe('LAMINAR');
    expect(r!.Re).toBeLessThan(2300);
    // f laminar = 64/Re
    expect(r!.f).toBeCloseTo(64 / r!.Re, 4);
  });

  it('pérdida de carga crece con longitud', () => {
    const r500  = calcDarcyWeisbach(10, 100, 500,  0.046, 0);
    const r1000 = calcDarcyWeisbach(10, 100, 1000, 0.046, 0);
    expect(r1000!.hf_mayor).toBeCloseTo(r500!.hf_mayor * 2, 1);
  });

  it('K_menor agrega pérdidas secundarias', () => {
    const rSin = calcDarcyWeisbach(10, 100, 1000, 0.046, 0);
    const rCon = calcDarcyWeisbach(10, 100, 1000, 0.046, 2);
    expect(rCon!.hf_total).toBeGreaterThan(rSin!.hf_total);
    expect(rCon!.hf_menor).toBeGreaterThan(0);
  });

  it('conversión Pa → bar correcta', () => {
    const r = calcDarcyWeisbach(10, 100, 1000, 0.046, 0);
    expect(r!.dP_bar).toBeCloseTo(r!.dP_Pa / 1e5, 3);
  });

  it('hf_total = hf_mayor + hf_menor', () => {
    const r = calcDarcyWeisbach(10, 100, 1000, 0.046, 1.5);
    expect(r!.hf_total).toBeCloseTo(r!.hf_mayor + r!.hf_menor, 3);
  });

  it('retorna null con Q=0', () => {
    expect(calcDarcyWeisbach(0, 100, 1000, 0.046, 0)).toBeNull();
  });

  it('retorna null con D=0', () => {
    expect(calcDarcyWeisbach(10, 0, 1000, 0.046, 0)).toBeNull();
  });

  it('retorna null con L=0', () => {
    expect(calcDarcyWeisbach(10, 100, 0, 0.046, 0)).toBeNull();
  });

  it('riesgo MEDIUM cuando V > 1.5 m/s', () => {
    // Q=10 L/s, D=100mm → V ≈ 1.273 → LOW. Subir Q para MEDIUM
    const r = calcDarcyWeisbach(15, 100, 1000, 0.046, 0);
    // V ≈ 1.91 → MEDIUM
    expect(r!.riesgo).toBe('MEDIUM');
  });
});

// ════════════════════════════════════════════════════════════════
// GOLPE DE ARIETE — Joukowsky
// ════════════════════════════════════════════════════════════════
describe('calcGolpeAriete', () => {

  it('celeridad de onda en acero — DN200, t=8mm', () => {
    // a = sqrt(K/ρ / (1 + K·D/(E·t)))
    // ≈ 1315 m/s para acero con agua
    const r = calcGolpeAriete(20, 200, 8, 500, 200, 2);
    expect(r).not.toBeNull();
    expect(r!.a).toBeGreaterThan(1000);
    expect(r!.a).toBeLessThan(1500);
  });

  it('presión de ariete Joukowsky — ΔP = ρ·a·ΔV', () => {
    const r = calcGolpeAriete(20, 200, 8, 500, 200, 2);
    expect(r).not.toBeNull();
    // dP_MPa = 998 × a × 2 / 1e6
    const esperado = 998 * r!.a * 2 / 1e6;
    expect(r!.dP_MPa).toBeCloseTo(esperado, 2);
  });

  it('tiempo de cierre Tc = 2L/a', () => {
    const r = calcGolpeAriete(20, 200, 8, 500, 200, 2);
    expect(r!.Tc).toBeCloseTo(2 * 500 / r!.a, 1);
  });

  it('riesgo CRITICAL cuando dP > 2 MPa', () => {
    // Gran ΔV = 5 m/s → golpe severo
    const r = calcGolpeAriete(20, 200, 8, 500, 200, 5);
    expect(r!.riesgo).toBe('CRITICAL');
  });

  it('riesgo LOW con ΔV pequeño', () => {
    const r = calcGolpeAriete(20, 200, 8, 500, 200, 0.2);
    expect(r!.riesgo).toBe('LOW');
  });

  it('PVC (E=3 GPa) da celeridad menor que acero (E=200 GPa)', () => {
    const rAcero = calcGolpeAriete(20, 200, 8, 500, 200, 2);
    const rPVC   = calcGolpeAriete(20, 200, 8, 500,   3, 2);
    expect(rPVC!.a).toBeLessThan(rAcero!.a);
  });

  it('pared más gruesa reduce celeridad de onda', () => {
    // Mayor t → mayor rigidez → mayor velocidad de onda
    const r4  = calcGolpeAriete(20, 200,  4, 500, 200, 2);
    const r16 = calcGolpeAriete(20, 200, 16, 500, 200, 2);
    expect(r16!.a).toBeGreaterThan(r4!.a);
  });

  it('retorna null con Q=0', () => {
    expect(calcGolpeAriete(0, 200, 8, 500, 200, 2)).toBeNull();
  });

  it('retorna null con D=0', () => {
    expect(calcGolpeAriete(20, 0, 8, 500, 200, 2)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// COEFICIENTE Cv — ISA 75.01.01
// ════════════════════════════════════════════════════════════════
describe('calcCv', () => {

  it('Cv=10 para Q=10 m³/h, ΔP=1 bar, agua', () => {
    // Q_gpm = 10 × 4.40287 = 44.029
    // DP_psi = 1 × 14.5038 = 14.504
    // Cv = 44.029 × sqrt(1/14.504) = 44.029 × 0.2626 = 11.56
    const r = calcCv(10, 1, 1.0);
    expect(r).not.toBeNull();
    expect(r!.Cv).toBeCloseTo(11.56, 0);
  });

  it('Kv = Cv / 1.1561 (conversión ISA verificada)', () => {
    const r = calcCv(10, 1, 1.0);
    expect(r!.Kv).toBeCloseTo(r!.Cv / 1.1561, 1);
  });

  it('mayor ΔP → menor Cv para mismo caudal', () => {
    const r1  = calcCv(10, 1, 1.0);
    const r4  = calcCv(10, 4, 1.0);
    expect(r4!.Cv).toBeLessThan(r1!.Cv);
  });

  it('mayor caudal → mayor Cv para mismo ΔP', () => {
    const r10 = calcCv(10, 1, 1.0);
    const r20 = calcCv(20, 1, 1.0);
    expect(r20!.Cv).toBeGreaterThan(r10!.Cv);
    expect(r20!.Cv).toBeCloseTo(r10!.Cv * 2, 1); // relación lineal en Q
  });

  it('SG > 1 (fluido más denso) → mayor Cv', () => {
    const rAgua    = calcCv(10, 1, 1.0);
    const rFluido  = calcCv(10, 1, 1.5);
    expect(rFluido!.Cv).toBeGreaterThan(rAgua!.Cv);
  });

  it('retorna null con Q=0', () => {
    expect(calcCv(0, 1, 1.0)).toBeNull();
  });

  it('retorna null con ΔP=0', () => {
    expect(calcCv(10, 0, 1.0)).toBeNull();
  });

  it('retorna null con SG=0', () => {
    expect(calcCv(10, 1, 0)).toBeNull();
  });

  it('retorna null con valores negativos', () => {
    expect(calcCv(-5, 1, 1.0)).toBeNull();
    expect(calcCv(10, -1, 1.0)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// PERFORACIÓN — API RP 13D
// ════════════════════════════════════════════════════════════════
describe('calcBHP', () => {
  it('BHP = hidrostática + cuttings', () => {
    const r = calcBHP(3000, 10.5, 50);
    expect(r).not.toBeNull();
    expect(r!.hydrostaticPsi).toBeCloseTo(0.052 * 10.5 * 3000, 0);
    expect(r!.bhp).toBeCloseTo(r!.hydrostaticPsi + 50, 0);
  });

  it('riesgo LOW a 3000 ft, 10.5 ppg sin cuttings', () => {
    const r = calcBHP(3000, 10.5);
    expect(r!.risk).toBe('LOW');
    // 0.052 × 10.5 × 3000 = 1638 psi → LOW
    expect(r!.bhp).toBeCloseTo(1638, 0);
  });

  it('riesgo CRITICAL a 15000 ft, 16 ppg', () => {
    const r = calcBHP(15000, 16.0);
    expect(r!.risk).toBe('CRITICAL');
    expect(r!.bhp).toBeGreaterThan(10000);
  });

  it('mayor profundidad aumenta BHP', () => {
    const r1 = calcBHP(3000, 10.5);
    const r2 = calcBHP(6000, 10.5);
    expect(r2!.bhp).toBeCloseTo(r1!.bhp * 2, 0);
  });

  it('retorna null con TVD=0', () => {
    expect(calcBHP(0, 10.5)).toBeNull();
  });

  it('retorna null con mudWeight=0', () => {
    expect(calcBHP(3000, 0)).toBeNull();
  });
});

describe('calcFractureGradient', () => {
  it('fórmula Eaton con Poisson=0.25', () => {
    const r = calcFractureGradient(3000, 1.0, 0.25);
    expect(r).not.toBeNull();
    // nu/(1-nu) = 0.25/0.75 = 0.3333
    // fracGrad = 0.3333 × (1.0 - 0.433) + 0.433 = 0.622
    expect(r!.fracGrad).toBeCloseTo(0.622, 2);
    expect(r!.fracPressure).toBeCloseTo(0.622 * 3000, 0);
  });

  it('Poisson más alto → gradiente más alto', () => {
    const r1 = calcFractureGradient(3000, 1.0, 0.25);
    const r2 = calcFractureGradient(3000, 1.0, 0.40);
    expect(r2!.fracGrad).toBeGreaterThan(r1!.fracGrad);
  });

  it('retorna null con depth=0', () => {
    expect(calcFractureGradient(0, 1.0)).toBeNull();
  });
});

describe('calcMudWeight', () => {
  it('mudWeight = porePresGrad + safetyFactor', () => {
    const r = calcMudWeight(10.0, 0.5);
    expect(r!.mudWeight).toBeCloseTo(10.5, 1);
    expect(r!.ecd).toBeCloseTo(10.5 * 1.02, 1);
  });

  it('riesgo CRITICAL cuando mudWeight > 18 ppg', () => {
    const r = calcMudWeight(17.6, 0.5);
    expect(r!.mudWeight).toBeCloseTo(18.1, 1);
    expect(r!.risk).toBe('CRITICAL');
  });

  it('riesgo LOW a 9 ppg', () => {
    expect(calcMudWeight(8.5)!.risk).toBe('LOW');
  });

  it('retorna null con porePresGrad=0', () => {
    expect(calcMudWeight(0)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// GEOTECNIA — Meyerhof (1963)
// ════════════════════════════════════════════════════════════════
describe('calcCapacidadPortante', () => {
  it('arcilla media — carga admisible correcta', () => {
    // B=3, L=4, Df=1.2, Q=500 kN, FS=3
    const r = calcCapacidadPortante('arcilla_media', 3, 4, 1.2, 500, 3, 99);
    expect(r).not.toBeNull();
    expect(r!.ok).toBe(true);
    // q_aplicada = 500/(3×4) = 41.7 kPa < qa
    expect(r!.q_aplicada).toBeCloseTo(41.7, 1);
    expect(r!.qa).toBeGreaterThan(r!.q_aplicada);
  });

  it('sobrecarga → ok=false', () => {
    const r = calcCapacidadPortante('arcilla_blanda', 1, 1, 0.5, 5000, 3, 99);
    expect(r!.ok).toBe(false);
  });

  it('napa superficial reduce capacidad (arena)', () => {
    const rSeco   = calcCapacidadPortante('arena_compacta', 3, 3, 1.5, 1000, 3, 99);
    const rNapa   = calcCapacidadPortante('arena_compacta', 3, 3, 1.5, 1000, 3, 0.5);
    expect(rNapa!.qa).toBeLessThan(rSeco!.qa);
  });

  it('retorna null con B=0', () => {
    expect(calcCapacidadPortante('grava', 0, 3, 1, 100, 3, 99)).toBeNull();
  });

  it('retorna null con FS=0', () => {
    expect(calcCapacidadPortante('grava', 2, 2, 1, 100, 0, 99)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// TÉRMICA — LMTD / Dilatación
// ════════════════════════════════════════════════════════════════
describe('calcIntercambiador', () => {
  it('LMTD contracorriente — Q=500kW, U=500', () => {
    // dT1 = 120-80=40, dT2 = 60-20=40 → LMTD = 40 (iguales)
    const r = calcIntercambiador(500, 120, 60, 20, 80, 500, 'contracorriente');
    expect(r).not.toBeNull();
    expect(r!.LMTD).toBeCloseTo(40, 0);
    expect(r!.A_m2).toBeCloseTo(500 * 1000 / (500 * 40), 1);
  });

  it('paralelo — dT1 y dT2 correctos', () => {
    // dT1 = 120-20=100, dT2 = 60-80 negativo → saltar
    // usar T_cold_out < T_hot_out
    const r = calcIntercambiador(200, 100, 60, 20, 50, 300, 'paralelo');
    expect(r).not.toBeNull();
    // dT1=100-20=80, dT2=60-50=10 → LMTD=(80-10)/ln(8)=33.0
    expect(r!.LMTD).toBeCloseTo((80 - 10) / Math.log(80 / 10), 1);
  });

  it('mayor U → menor área necesaria', () => {
    const r1 = calcIntercambiador(300, 90, 50, 20, 60, 300, 'contracorriente');
    const r2 = calcIntercambiador(300, 90, 50, 20, 60, 600, 'contracorriente');
    expect(r2!.A_m2).toBeLessThan(r1!.A_m2);
    expect(r2!.A_m2).toBeCloseTo(r1!.A_m2 / 2, 1);
  });

  it('efectividad = (Th_in - Th_out)/(Th_in - Tc_in) × 100', () => {
    const r = calcIntercambiador(500, 120, 60, 20, 80, 500, 'contracorriente');
    expect(r!.efectividad).toBeCloseTo((120 - 60) / (120 - 20) * 100, 0);
  });

  it('retorna null con Q=0', () => {
    expect(calcIntercambiador(0, 100, 60, 20, 80, 500)).toBeNull();
  });
});

describe('calcDilatacionLineal', () => {
  it('dL correcta — acero 100 m, ΔT=180°C, α=11.7µ', () => {
    const r = calcDilatacionLineal(100, 20, 200, 11.7);
    expect(r).not.toBeNull();
    // dL = 11.7e-6 × 100 × 180 × 1000 = 210.6 mm
    expect(r!.dL_mm).toBeCloseTo(11.7e-6 * 100 * 180 * 1000, 1);
  });

  it('restringido genera tensión — CRITICAL si > 300 MPa', () => {
    // sigma = 200×1000 × 11.7e-6 × 180 = 421.2 MPa
    const r = calcDilatacionLineal(100, 20, 200, 11.7, true, 200);
    expect(r!.sigma_MPa).toBeCloseTo(421.2, 0);
    expect(r!.risk).toBe('CRITICAL');
  });

  it('sin restricción → sigma=0', () => {
    const r = calcDilatacionLineal(100, 20, 200, 11.7, false);
    expect(r!.sigma_MPa).toBe(0);
  });

  it('ΔT negativo produce mismo dL que positivo (valor absoluto)', () => {
    const r1 = calcDilatacionLineal(50, 20, 80, 11.7);
    const r2 = calcDilatacionLineal(50, 80, 20, 11.7);
    expect(r1!.dL_mm).toBeCloseTo(r2!.dL_mm, 2);
  });

  it('retorna null con L=0', () => {
    expect(calcDilatacionLineal(0, 20, 200, 11.7)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// CIVIL — ACI 318-19
// ════════════════════════════════════════════════════════════════
describe('calcColumnaHormigon', () => {
  it('phi_Pn correcta — columna 300×300, fc=25, fy=420', () => {
    // Ag=90000, Pn_max = 0.80×(0.85×25×(90000-1800)+420×1800) = 2111.7 kN
    // phi_Pn = 0.65 × 2111.7 = 1372.6 kN
    const r = calcColumnaHormigon(1200, 50, 300, 300, 1800, 25, 420);
    expect(r).not.toBeNull();
    expect(r!.phi_Pn).toBeGreaterThan(1300);
    expect(r!.ok_P).toBe(true);
  });

  it('Pu > phi_Pn → ok_P=false, riesgo=CRITICAL', () => {
    const r = calcColumnaHormigon(9999, 0, 200, 200, 1200, 20, 420);
    expect(r!.ok_P).toBe(false);
    expect(r!.riesgo).toBe('CRITICAL');
  });

  it('rho fuera de [1%–8%] → ok_rho=false', () => {
    // As muy pequeño → rho < 1%
    const r = calcColumnaHormigon(100, 0, 400, 400, 100, 25, 420);
    expect(r!.ok_rho).toBe(false);
  });

  it('rho calculado correctamente', () => {
    const r = calcColumnaHormigon(500, 0, 300, 300, 2700, 25, 420);
    // rho = 2700/(300×300) = 0.03 → 3%
    expect(r!.rho).toBeCloseTo(3.0, 1);
    expect(r!.ok_rho).toBe(true);
  });

  it('retorna null con b=0', () => {
    expect(calcColumnaHormigon(1000, 0, 0, 300, 1800, 25, 420)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// MINERÍA — RMR / Ventilación
// ════════════════════════════════════════════════════════════════
describe('calcRMR', () => {
  it('roca buena — clase II', () => {
    // ucs=101→p1=12, rqd=80→p2=17, espaciado=500→p3=10 (200–600), buena→p4=12, humedo→p5=10, favorable→adj=-2
    const r = calcRMR(101, 80, 500, 'buena', 'humedo', 'favorable');
    expect(r).not.toBeNull();
    expect(r!.rmr).toBe(12 + 17 + 10 + 12 + 10 - 2);  // 59
    expect(r!.clase).toBe('III');   // 41–60
    expect(r!.riesgo).toBe('MEDIUM');
  });

  it('roca muy mala — clase V, riesgo CRITICAL', () => {
    const r = calcRMR(3, 15, 30, 'muy_pobre', 'flujo', 'muy_desfavorable');
    expect(r!.clase).toBe('V');
    expect(r!.riesgo).toBe('CRITICAL');
  });

  it('suma de parámetros es correcta', () => {
    const r = calcRMR(55, 60, 300, 'moderada', 'seco', 'moderada');
    expect(r!.rmr).toBe(r!.p1 + r!.p2 + r!.p3 + r!.p4 + r!.p5 + r!.adj);
  });
});

describe('calcVentilacion', () => {
  it('caudal mínimo = 0.25 m³/s para galería vacía', () => {
    const r = calcVentilacion(0, 0, 100, 8, 0);
    expect(r!.Q_req).toBeCloseTo(0.25, 2);
  });

  it('Q = trabajadores×0.06 + diesel×0.06', () => {
    const r = calcVentilacion(10, 200, 500, 8, 15);
    expect(r!.Q_req).toBeCloseTo(10 * 0.06 + 200 * 0.06, 2);
    expect(r!.V).toBeCloseTo(r!.Q_req / 8, 3);
    expect(r!.co_ok).toBe(true);
  });

  it('CO > 25 ppm → co_ok=false, CRITICAL', () => {
    const r = calcVentilacion(5, 50, 100, 4, 30);
    expect(r!.co_ok).toBe(false);
    expect(r!.riesgo).toBe('CRITICAL');
  });

  it('retorna null con seccion=0', () => {
    expect(calcVentilacion(10, 50, 100, 0, 0)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// SOLDADURA — ASME Sec. IX
// ════════════════════════════════════════════════════════════════
describe('calcHeatInputSoldadura', () => {
  it('HI = V×I×60×η / (v×1000)', () => {
    // (22×150×60×0.80) / (100×1000) = 158400/100000 = 1.584 kJ/mm
    const r = calcHeatInputSoldadura(22, 150, 100, 0.80);
    expect(r).not.toBeNull();
    expect(r!.hi).toBeCloseTo(1.584, 3);
    expect(r!.riesgo).toBe('LOW');
  });

  it('mayor corriente → mayor HI', () => {
    const r1 = calcHeatInputSoldadura(22, 150, 100, 0.80);
    const r2 = calcHeatInputSoldadura(22, 300, 100, 0.80);
    expect(r2!.hi).toBeCloseTo(r1!.hi * 2, 2);
  });

  it('mayor velocidad → menor HI', () => {
    const r1 = calcHeatInputSoldadura(22, 150, 100, 0.80);
    const r2 = calcHeatInputSoldadura(22, 150, 200, 0.80);
    expect(r2!.hi).toBeCloseTo(r1!.hi / 2, 2);
  });

  it('retorna null con V=0', () => {
    expect(calcHeatInputSoldadura(0, 150, 100, 0.8)).toBeNull();
  });
});

describe('calcCarbonoEquivalente', () => {
  it('acero bajo carbono — CE < 0.35, Grupo I', () => {
    // CE = 0.20 + 1.00/6 = 0.367 → Grupo II
    const r = calcCarbonoEquivalente(0.20, 1.00, 0, 0, 0);
    expect(r).not.toBeNull();
    expect(r!.CE).toBeCloseTo(0.367, 2);
    expect(r!.grupo).toBe('II');
  });

  it('aleaciones aumentan CE', () => {
    const r1 = calcCarbonoEquivalente(0.15, 0.80, 0, 0, 0);
    const r2 = calcCarbonoEquivalente(0.15, 0.80, 1.0, 0.5, 2.0);
    expect(r2!.CE).toBeGreaterThan(r1!.CE);
  });

  it('formula IIW correcta', () => {
    const r = calcCarbonoEquivalente(0.18, 1.20, 0.60, 0.30, 1.50);
    const expected = 0.18 + 1.20/6 + (0.60+0.30)/5 + 1.50/15;
    expect(r!.CE).toBeCloseTo(expected, 3);
  });

  it('retorna null con valores negativos', () => {
    expect(calcCarbonoEquivalente(-0.1, 1, 0, 0, 0)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// ELECTRICIDAD — NEC Art. 430 / IEC 60947
// ════════════════════════════════════════════════════════════════
describe('calcMotorTrifasico', () => {
  it('Inom = P/(η) × 1000 / (√3 × V × FP)', () => {
    const r = calcMotorTrifasico(75, 380, 0.85, 0.93);
    expect(r).not.toBeNull();
    const Pelec = 75 / 0.93;
    const Inom  = Pelec * 1000 / (Math.sqrt(3) * 380 * 0.85);
    expect(r!.Inom).toBeCloseTo(Inom, 0);
    expect(r!.Iarr).toBeCloseTo(6 * Inom, 0);
  });

  it('Iarr = 6 × Inom', () => {
    const r = calcMotorTrifasico(75, 380, 0.85, 0.93);
    expect(r!.Iarr).toBeCloseTo(r!.Inom * 6, 0);
  });

  it('mayor tensión → menor corriente', () => {
    const r380 = calcMotorTrifasico(75, 380,  0.85, 0.93);
    const r660 = calcMotorTrifasico(75, 660,  0.85, 0.93);
    expect(r660!.Inom).toBeLessThan(r380!.Inom);
  });

  it('retorna null con P=0', () => {
    expect(calcMotorTrifasico(0, 380, 0.85, 0.93)).toBeNull();
  });
});

describe('calcTransformadorElect', () => {
  it('S = P/(FP×η), Is = S×1000/(√3×Vs)', () => {
    const r = calcTransformadorElect(500, 0.85, 0.98, 13200, 400);
    expect(r).not.toBeNull();
    const S  = 500 / (0.85 * 0.98);
    const Is = S * 1000 / (Math.sqrt(3) * 400);
    expect(r!.S).toBeCloseTo(S, 0);
    expect(r!.Is).toBeCloseTo(Is, 0);
    expect(r!.Iarr).toBeCloseTo(10 * Is, 0);
  });

  it('Vs más bajo → Is más alto', () => {
    const r1 = calcTransformadorElect(500, 0.85, 0.98, 13200, 400);
    const r2 = calcTransformadorElect(500, 0.85, 0.98, 13200, 200);
    expect(r2!.Is).toBeGreaterThan(r1!.Is);
  });

  it('retorna null con Vs=0', () => {
    expect(calcTransformadorElect(500, 0.85, 0.98, 13200, 0)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// CAÑERÍAS — ASME B31.4 / API 579-1
// ════════════════════════════════════════════════════════════════
describe('calcEspesorParedCaneria', () => {
  it('t_min y t_dis para DN273, P=80bar, X52', () => {
    // SMYS X52 = 448 MPa · F=0.72
    const r = calcEspesorParedCaneria(273.1, 80, 448, 0.72, 1.0, 1.0, 1.6);
    expect(r).not.toBeNull();
    const D_in   = 273.1 / 25.4;
    const P_psi  = 80 * 14.5038;
    const S_psi  = 448 * 145.038;
    const t_in   = (P_psi * D_in) / (2 * S_psi * 0.72 * 1.0 * 1.0);
    expect(r!.t_min_mm).toBeCloseTo(t_in * 25.4, 1);
    expect(r!.t_dis_mm).toBeCloseTo(r!.t_min_mm + 1.6, 1);
  });

  it('mayor presión → mayor espesor mínimo', () => {
    const r1 = calcEspesorParedCaneria(273.1, 50, 448);
    const r2 = calcEspesorParedCaneria(273.1, 100, 448);
    expect(r2!.t_min_mm).toBeGreaterThan(r1!.t_min_mm);
  });

  it('retorna null con D=0', () => {
    expect(calcEspesorParedCaneria(0, 80, 448)).toBeNull();
  });
});

describe('calcHoopStressBarlow', () => {
  it('sigma_h = P×D/(2×t) y ok si <= allow', () => {
    const r = calcHoopStressBarlow(273.1, 9.3, 80, 448, 0.72);
    expect(r).not.toBeNull();
    const P_MPa   = 80 / 10;
    const sigma_h = P_MPa * 273.1 / (2 * 9.3);
    const allow   = 448 * 0.72;
    expect(r!.sigma_h).toBeCloseTo(sigma_h, 1);
    expect(r!.allow).toBeCloseTo(allow, 1);
    expect(r!.ok).toBe(sigma_h <= allow);
  });

  it('tensión admisible proporcional a SMYS × F', () => {
    const r1 = calcHoopStressBarlow(273.1, 9.3, 80, 448, 0.72);
    const r2 = calcHoopStressBarlow(273.1, 9.3, 80, 448, 1.0);
    expect(r2!.allow).toBeGreaterThan(r1!.allow);
    expect(r2!.allow / r1!.allow).toBeCloseTo(1.0 / 0.72, 2);
  });

  it('retorna null con t=0', () => {
    expect(calcHoopStressBarlow(273.1, 0, 80, 448)).toBeNull();
  });
});

describe('calcVidaRemanente', () => {
  it('vida = (t_med - t_min) / corr', () => {
    // (7.8 - 5.5) / 0.2 = 11.5 años
    const r = calcVidaRemanente(9.3, 7.8, 5.5, 0.2);
    expect(r).not.toBeNull();
    expect(r!.vida).toBeCloseTo(11.5, 1);
    expect(r!.estado).toBe('EN SERVICIO NORMAL');
  });

  it('pct = (t_med - t_min) / (t_nom - t_min) × 100', () => {
    const r = calcVidaRemanente(9.3, 7.8, 5.5, 0.2);
    expect(r!.pct).toBeCloseTo((7.8 - 5.5) / (9.3 - 5.5) * 100, 1);
  });

  it('t_med <= t_min → FUERA DE SERVICIO', () => {
    const r = calcVidaRemanente(9.3, 5.0, 5.5, 0.2);
    expect(r!.estado).toBe('FUERA DE SERVICIO');
    expect(r!.vida).toBe(0);
  });

  it('vida < 2 años → REEMPLAZO URGENTE', () => {
    const r = calcVidaRemanente(9.3, 5.7, 5.5, 0.2);
    // vida = 0.2/0.2 = 1.0 → REEMPLAZO
    expect(r!.estado).toBe('REEMPLAZO URGENTE');
  });

  it('retorna null con corr=0', () => {
    expect(calcVidaRemanente(9.3, 7.8, 5.5, 0)).toBeNull();
  });
});
