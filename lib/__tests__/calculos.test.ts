import { describe, it, expect } from 'vitest';
import { calcMAOP, calcDarcyWeisbach, calcGolpeAriete, calcCv } from '../calculos';

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
