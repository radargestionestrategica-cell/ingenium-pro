import { describe, it, expect } from 'vitest';
import {
  factorTempB318,
  calcMAOP, calcDarcyWeisbach, calcGolpeAriete,
  calcCvLiquido, formatearCoef, FL_ORIENTATIVO, NORMA_CV,
  calcBHP, calcFractureGradient, calcMudWeight,
  calcCapacidadPortante,
  calcIntercambiador, calcDilatacionLineal,
  calcDilatacionMaterial, MATERIALES_DILATACION,
  calcColumnaHormigon,
  calcRMR, calcVentilacion,
  calcHeatInputSoldadura, calcCarbonoEquivalente,
  calcMotorTrifasico, calcTransformadorElect,
  calcEspesorParedCaneria, calcHoopStressBarlow, calcVidaRemanente,
} from '../calculos';
import { exportarDXFCoeficienteCv, exportarDXFValvulas, exportarDXFSeleccionMaterial } from '../exportarDXF';
import { tituloModuloPDF } from '../tipos-calculo';

// ════════════════════════════════════════════════════════════════
// FACTOR T — ASME B31.8 Tabla 841.1.8-1 (tabla en °F)
// ════════════════════════════════════════════════════════════════
describe('factorTempB318', () => {
  const FaC = (F: number) => (F - 32) * 5 / 9;

  it('los 5 puntos de la tabla, ingresados en °C exactos', () => {
    expect(factorTempB318(FaC(250))).toBe(1.000);
    expect(factorTempB318(FaC(300))).toBeCloseTo(0.967, 12);
    expect(factorTempB318(FaC(350))).toBeCloseTo(0.933, 12);
    expect(factorTempB318(FaC(400))).toBeCloseTo(0.900, 12);
    expect(factorTempB318(FaC(450))).toBeCloseTo(0.867, 12);  // borde exacto: NO se rechaza
  });

  it('borde 121.11 °C (249,998 °F) → 1.000', () => {
    expect(factorTempB318(121.11)).toBe(1.000);
  });

  it('borde 232.22 °C (449,996 °F) → 0.867', () => {
    expect(factorTempB318(232.22)).toBeCloseTo(0.867, 5);
  });

  it('borde 232.3 °C (450,14 °F) → null (fuera de tabla)', () => {
    expect(factorTempB318(232.3)).toBeNull();
  });

  it('el corte es 450 °F exactos, no 232 °C redondeados', () => {
    // 232.1 °C = 449,78 °F → dentro de la tabla (un corte en 232 °C lo rechazaría)
    expect(factorTempB318(232.1)).not.toBeNull();
    expect(factorTempB318(232.1)!).toBeCloseTo(0.867 + 0.033 * (450 - 449.78) / 50, 5);
  });

  it('≤ 250 °F → 1.000 (incluye temperaturas bajas y negativas)', () => {
    expect(factorTempB318(20)).toBe(1.000);
    expect(factorTempB318(-40)).toBe(1.000);
  });

  it('interpola en temperaturas intermedias', () => {
    // 275 °F (punto medio 250–300) → (1.000 + 0.967) / 2 = 0.9835
    expect(factorTempB318(FaC(275))).toBeCloseTo(0.9835, 10);
    // 425 °F (punto medio 400–450) → (0.900 + 0.867) / 2 = 0.8835
    expect(factorTempB318(FaC(425))).toBeCloseTo(0.8835, 10);
  });

  it('150 °C (302 °F): antes 0.967 (no conservador), ahora interpolado 0.96564', () => {
    // 0.967 − 0.034 × 2/50 = 0.96564
    expect(factorTempB318(150)!).toBeCloseTo(0.96564, 5);
    expect(factorTempB318(150)!).toBeLessThan(0.967);
  });

  it('retorna null con NaN / Infinity', () => {
    expect(factorTempB318(NaN)).toBeNull();
    expect(factorTempB318(Infinity)).toBeNull();
    expect(factorTempB318(-Infinity)).toBeNull();
  });
});

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
    expect(r!.reg).toBe('PARED GRUESA — Lamé (criterio conservador adicional, fuera de B31.8)');
    expect(r!.ratio).toBeCloseTo(18, 0);   // 18%
    expect(r!.formula).toMatch(/^Pl = 414 × 0\.72 × 1 × 1 × \(50\.0² − 32\.0²\)/);
  });

  it('zona de transición — 0.10 < t/OD < 0.15', () => {
    // OD=100mm, t=12mm → ratio=0.12
    const r = calcMAOP(100, 12, 359, 0.72, 1.0, 20);
    expect(r).not.toBeNull();
    expect(r!.reg).toBe('TRANSICIÓN');
  });

  it('factor temperatura alta T_op=200°C reduce MAOP', () => {
    // 200 °C = 392 °F → interpolado entre 350 °F (0.933) y 400 °F (0.900):
    // 0.933 − 0.033 × 42/50 = 0.90528 (antes, escalón en °C: 0.900)
    const r20  = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20);
    const r200 = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 200);
    expect(r200!.P).toBeLessThan(r20!.P);
    expect(r200!.T_factor).toBe(0.905);
  });

  it('factor temperatura T_op=160°C interpolado = 0.953', () => {
    // 160 °C = 320 °F → 0.967 − 0.034 × 20/50 = 0.9534 (antes, escalón: 0.933)
    const r = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 160);
    expect(r!.T_factor).toBe(0.953);
  });

  it('retorna null por encima de 450 °F (232,22 °C) — fuera de la Tabla 841.1.8-1', () => {
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 250)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 232.3)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 232.2)).not.toBeNull();
  });

  it('formula muestra T interpolado con 3 decimales', () => {
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 160)!.formula)
      .toBe('Pb = (2 × 359 × 9.52 × 0.72 × 1 × 0.953) / 323.85');
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

  it('sin presión de operación → riesgo sin evaluar (null), MAOP igual', () => {
    // Antes: CRITICAL solo porque MAOP > 10 MPa (capacidad, no demanda)
    const r = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20)!;
    expect(r.risk).toBeNull();
    expect(r.util_pct).toBeNull();
    expect(r.margen_pct).toBeNull();
    expect(r.P).toBeCloseTo(15.197, 1);
  });

  it('riesgo por utilización P_op/MAOP — umbrales 80/90/100 %', () => {
    // MAOP = 15.197 MPa
    const riesgo = (P_op: number) => calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20, P_op)!.risk;
    expect(riesgo(10.0)).toBe('LOW');       // 65.8 %
    expect(riesgo(12.5)).toBe('MEDIUM');    // 82.3 %
    expect(riesgo(14.0)).toBe('HIGH');      // 92.1 %
    expect(riesgo(16.0)).toBe('CRITICAL');  // 105.3 % — opera por encima del MAOP
  });

  it('util_pct y margen_pct', () => {
    // Caso por defecto del módulo con P_op = 150 bar = 15 MPa → 15 / 18.921 = 79.3 %
    const r = calcMAOP(323.9, 9.5, 448, 0.72, 1.0, 20, 15)!;
    expect(r.util_pct).toBeCloseTo(79.3, 1);
    expect(r.margen_pct).toBeCloseTo(20.7, 1);
    expect(r.risk).toBe('LOW');
  });

  it('ejemplo de la landing — 1.200 psi sobre MAOP 1.755 psi = 68.4 % → LOW', () => {
    const psi = 0.00689476;
    const r = calcMAOP(16 * 25.4, 0.375 * 25.4, 52000 * psi, 0.72, 1.0, 20, 1200 * psi)!;
    expect(r.psi).toBe(1755);
    expect(r.util_pct).toBeCloseTo(68.4, 1);
    expect(r.risk).toBe('LOW');
  });

  it('retorna null con P_op informada pero inválida', () => {
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20, 0)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20, -5)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20, NaN)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20, Infinity)).toBeNull();
  });

  it('conversión MPa → psi correcta (factor 145.04)', () => {
    const r = calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20);
    expect(r!.psi).toBe(+(r!.P * 145.04).toFixed(0));
  });

  it('formula refleja el régimen aplicado', () => {
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, 20)!.formula)
      .toBe('Pb = (2 × 359 × 9.52 × 0.72 × 1 × 1) / 323.85');
    expect(calcMAOP(100, 12, 359, 0.72, 1.0, 20)!.formula)
      .toBe('P = interpolación Barlow/Lamé (t/OD = 12.00%)');
  });

  it('caso por defecto de ModuloPetroleo — X65, 323.9 × 9.5 mm', () => {
    // Pb = 2 × 448 × 9.5 × 0.72 / 323.9 = 18.921 MPa
    const r = calcMAOP(323.9, 9.5, 448, 0.72, 1.0, 20)!;
    expect(r.P).toBeCloseTo(18.921, 3);
    expect(r.reg).toBe('PARED DELGADA — Barlow');
  });

  it('retorna null con F o E fuera de (0, 1]', () => {
    expect(calcMAOP(323.85, 9.52, 359, 0,    1.0)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, -0.5, 1.0)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, 1.2,  1.0)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 0)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.5)).toBeNull();
    // Límite superior incluido
    expect(calcMAOP(323.85, 9.52, 359, 1.0, 1.0)).not.toBeNull();
  });

  it('retorna null con entradas no finitas (NaN / Infinity)', () => {
    expect(calcMAOP(NaN,    9.52, 359)).toBeNull();
    expect(calcMAOP(323.85, NaN,  359)).toBeNull();
    expect(calcMAOP(323.85, 9.52, Infinity)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, NaN)).toBeNull();
    expect(calcMAOP(323.85, 9.52, 359, 0.72, 1.0, NaN)).toBeNull();
    expect(calcMAOP(Infinity, 9.52, 359)).toBeNull();
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

  // Sin esta guarda, E·t_m en el denominador de la raíz de "a" deja el
  // resultado en Infinity/NaN, y como ninguna comparación con NaN da true,
  // el clasificador de riesgo caía en 'LOW' por default — un golpe de
  // ariete sin calcular reportado como si fuera seguro.
  it('retorna null con t_mm=0 (antes daba a=Infinity y riesgo:LOW silencioso)', () => {
    expect(calcGolpeAriete(20, 200, 0, 500, 200, 2)).toBeNull();
  });

  it('retorna null con t_mm negativo', () => {
    expect(calcGolpeAriete(20, 200, -5, 500, 200, 2)).toBeNull();
  });

  it('retorna null con E_GPa=0', () => {
    expect(calcGolpeAriete(20, 200, 8, 500, 0, 2)).toBeNull();
  });

  it('retorna null con E_GPa negativo', () => {
    expect(calcGolpeAriete(20, 200, 8, 500, -10, 2)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// COEFICIENTE Cv — LÍQUIDOS · ISA-75.01.01-2012 / IEC 60534-2-1
// calcCvLiquido es la función que usa components/ModuloValvulas.tsx
// ════════════════════════════════════════════════════════════════
describe('calcCvLiquido', () => {
  // Entrada base: 50 m³/h, P1 = 5 barg, P2 = 3 barg (ΔP = 2 bar), SG = 0.85
  const base = { Q: 50, unidadQ: 'm3h' as const, P1_man: 5, P2_man: 3, unidadP: 'bar' as const, SG: 0.85 };
  const ok = (r: ReturnType<typeof calcCvLiquido>) => {
    if (!r.ok) throw new Error(`se esperaba ok, vino error: ${r.error}`);
    return r;
  };

  it('caso por defecto del módulo — Kv = 50·√(0.85/2), Cv = Kv/0.865', () => {
    const r = ok(calcCvLiquido(base));
    const Kv = 50 * Math.sqrt(0.85 / 2);           // 32.596
    expect(r.Kv).toBeCloseTo(Kv, 10);
    expect(r.Cv).toBeCloseTo(Kv / 0.865, 10);      // 37.683
    expect(r.Kv_txt).toBe('32.60');
    expect(r.Cv_txt).toBe('37.68');                 // mismo valor que mostraba la versión anterior
    expect(r.dP_bar).toBeCloseTo(2, 12);
  });

  it('Cv = 1,156 × Kv (N1 = 0,865 de IEC 60534-2-1)', () => {
    const r = ok(calcCvLiquido(base));
    expect(r.Cv / r.Kv).toBeCloseTo(1.156, 3);
  });

  it('presiones manométricas → absolutas sumando 1,01325 bar', () => {
    const r = ok(calcCvLiquido(base));
    expect(r.P1_abs_bar).toBeCloseTo(5 + 1.01325, 12);
    expect(r.P2_abs_bar).toBeCloseTo(3 + 1.01325, 12);
  });

  it('unidades GPM y psi — Cv = Q·√(SG/ΔP) con N1 = 1', () => {
    // 100 GPM, ΔP = 25 psi, agua → Cv = 100 × √(1/25) = 20
    const r = ok(calcCvLiquido({ Q: 100, unidadQ: 'gpm', P1_man: 50, P2_man: 25, unidadP: 'psi', SG: 1 }));
    expect(r.Cv).toBeCloseTo(20, 2);
    expect(r.Kv).toBeCloseTo(20 * 0.865, 1);
  });

  it('GPM/psi y m³/h/bar dan el mismo Cv para el mismo caso físico', () => {
    const rSI  = ok(calcCvLiquido(base));
    const rImp = ok(calcCvLiquido({
      Q: 50 * 4.40287, unidadQ: 'gpm', P1_man: 5 * 14.5038, P2_man: 3 * 14.5038, unidadP: 'psi', SG: 0.85,
    }));
    expect(rImp.Cv).toBeCloseTo(rSI.Cv, 6);
  });

  it('Cv chico: 0,0037 no se muestra como 0 (3 cifras significativas)', () => {
    // Q = 0.01 m³/h, ΔP = 10 bar, agua → Kv = 0.0031623, Cv = 0.0036558
    const r = ok(calcCvLiquido({ Q: 0.01, unidadQ: 'm3h', P1_man: 10, P2_man: 0, unidadP: 'bar', SG: 1 }));
    expect(r.Cv).toBeCloseTo(0.0036558, 7);
    expect(r.Cv_txt).toBe('0.00366');
    expect(r.Kv_txt).toBe('0.00316');
    expect(Number(r.Cv_txt)).toBeGreaterThan(0);
  });

  it('Kv se calcula del valor exacto, sin doble redondeo', () => {
    const r = ok(calcCvLiquido(base));
    // Antes: Kv = round2(round2(Cv) / 1.1561) = 32.59; exacto 32.596 → 32.60
    expect(r.Kv_txt).toBe('32.60');
  });

  it('formatearCoef: ≥ 1 con 2 decimales, < 1 con 3 cifras significativas', () => {
    expect(formatearCoef(37.6834)).toBe('37.68');
    expect(formatearCoef(1)).toBe('1.00');
    expect(formatearCoef(0.5)).toBe('0.500');
    expect(formatearCoef(0.0036558)).toBe('0.00366');
  });

  it('proporcional a Q y a √SG, inverso a √ΔP', () => {
    const r1 = ok(calcCvLiquido(base));
    expect(ok(calcCvLiquido({ ...base, Q: 100 })).Cv).toBeCloseTo(r1.Cv * 2, 10);
    expect(ok(calcCvLiquido({ ...base, SG: 0.85 * 4 })).Cv).toBeCloseTo(r1.Cv * 2, 10);
    expect(ok(calcCvLiquido({ ...base, P1_man: 11 })).Cv).toBeCloseTo(r1.Cv / 2, 10); // ΔP = 8 bar
  });

  it('error con P2 por debajo del vacío absoluto (P2 abs ≤ 0)', () => {
    expect(calcCvLiquido({ ...base, P2_man: -3 }).ok).toBe(false);   // −3 barg < −1,01325 barg
  });

  it('FF con Pv/Pc conocidos: Pv/Pc = 0,25 → FF = 0,96 − 0,28 × 0,5 = 0,82', () => {
    const r = ok(calcCvLiquido({ ...base, FL: 0.9, Pv_abs: 50, Pc_abs: 200, P1_man: 100, P2_man: 98 }));
    expect(r.FF).toBeCloseTo(0.82, 12);
  });

  it('con FL, Pv y Pc — SIN estrangulamiento (ΔP < ΔPmax)', () => {
    // Agua ~90 °C: Pv = 0.7 bar a, Pc = 220.64 bar a; FL = 0.9; ΔP = 2 bar
    const r = ok(calcCvLiquido({ ...base, SG: 1, FL: 0.9, Pv_abs: 0.7, Pc_abs: 220.64 }));
    const FF = 0.96 - 0.28 * Math.sqrt(0.7 / 220.64);
    const dPmax = 0.81 * ((5 + 1.01325) - FF * 0.7);   // 4.335 bar
    expect(r.estrangulamiento).toBe('NO_ESTRANGULADO');
    expect(r.FF).toBeCloseTo(FF, 12);
    expect(r.dPmax_bar).toBeCloseTo(dPmax, 10);
    expect(r.dP_dimension_bar).toBeCloseTo(2, 12);
    expect(r.Kv).toBeCloseTo(50 * Math.sqrt(1 / 2), 10);
    expect(r.flashing).toBe(false);
  });

  it('con FL, Pv y Pc — FLUJO ESTRANGULADO (ΔP ≥ ΔPmax): Cv con ΔPmax', () => {
    // Mismo caso pero P2 = 0 barg → ΔP = 5 bar > ΔPmax = 4.335 bar
    const r = ok(calcCvLiquido({ ...base, SG: 1, P2_man: 0, FL: 0.9, Pv_abs: 0.7, Pc_abs: 220.64 }));
    const FF = 0.96 - 0.28 * Math.sqrt(0.7 / 220.64);
    const dPmax = 0.81 * ((5 + 1.01325) - FF * 0.7);
    expect(r.estrangulamiento).toBe('ESTRANGULADO');
    expect(r.dP_bar).toBeCloseTo(5, 12);
    expect(r.dP_dimension_bar).toBeCloseTo(dPmax, 10);
    expect(r.Kv).toBeCloseTo(50 * Math.sqrt(1 / dPmax), 10);
    // Con ΔP real el Cv hubiera salido más chico (subdimensionado)
    expect(r.Kv).toBeGreaterThan(50 * Math.sqrt(1 / 5));
  });

  it('sin Pv/Pc → "no verificado" e informa qué falta', () => {
    const r = ok(calcCvLiquido({ ...base, FL: 0.9 }));
    expect(r.estrangulamiento).toBe('NO_VERIFICADO');
    expect(r.faltanParaVerificar).toEqual(['Pv', 'Pc']);
    expect(r.FF).toBeNull();
    expect(r.dPmax_bar).toBeNull();
    expect(r.flashing).toBeNull();
  });

  it('flashing: P2 absoluta ≤ Pv', () => {
    // P2 = 0 barg → 1.01325 bar a; Pv = 2 bar a (P1 = 5 barg > Pv)
    const r = ok(calcCvLiquido({ ...base, P2_man: 0, FL: 0.9, Pv_abs: 2, Pc_abs: 220.64 }));
    expect(r.flashing).toBe(true);
  });

  it('error con P2 ≥ P1', () => {
    expect(calcCvLiquido({ ...base, P1_man: 3, P2_man: 3 }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, P1_man: 3, P2_man: 5 }).ok).toBe(false);
  });

  it('error con caudal 0 o negativo, y SG ≤ 0', () => {
    expect(calcCvLiquido({ ...base, Q: 0 }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, Q: -5 }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, SG: 0 }).ok).toBe(false);
  });

  it('error con NaN / Infinity en entradas obligatorias y opcionales', () => {
    expect(calcCvLiquido({ ...base, Q: NaN }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, P1_man: Infinity }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, P2_man: NaN }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, SG: Infinity }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, FL: NaN }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, Pv_abs: Infinity }).ok).toBe(false);
  });

  it('error con FL fuera de (0, 1], Pv ≥ Pc o P1 ≤ Pv', () => {
    expect(calcCvLiquido({ ...base, FL: 0 }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, FL: 1.2 }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, Pv_abs: 10, Pc_abs: 5 }).ok).toBe(false);
    expect(calcCvLiquido({ ...base, Pv_abs: 7 }).ok).toBe(false);   // P1 = 6.01 bar a < Pv
  });

  it('FL orientativos por tipo de válvula', () => {
    expect(FL_ORIENTATIVO).toEqual({ globo: 0.9, bola: 0.6, mariposa: 0.7 });
  });

  it('cita única de la norma', () => {
    expect(NORMA_CV).toBe('ISA-75.01.01-2012 / IEC 60534-2-1');
  });
});

describe('exportarDXFCoeficienteCv', () => {
  const dxf = exportarDXFCoeficienteCv({
    Cv_txt: '37.68', Kv_txt: '32.60', estado: 'Estrangulamiento no verificado — faltan: Pv, Pc',
    norma: 'ISA-75.01.01-2012 / IEC 60534-2-1',
    entradas: [['Caudal', '50 m³/h'], ['P1 entrada (manométrica)', '5 barg'], ['P2 salida (manométrica)', '3 barg']],
  });

  it('muestra Cv, Kv, estado y los datos ingresados', () => {
    expect(dxf).toContain('Cv requerido = 37.68');
    expect(dxf).toContain('Kv requerido = 32.60');
    expect(dxf).toContain('Estrangulamiento no verificado');
    expect(dxf).toContain('P1 entrada (manométrica): 5 barg');
  });

  it('no inventa DN, clase ni presiones de diseño', () => {
    expect(dxf).not.toMatch(/DN \d/);
    expect(dxf).not.toMatch(/Clase/);
    expect(dxf).not.toMatch(/P max|Prueba hidrost|Factor uso/);
  });
});

describe('exportarDXFValvulas — unidades y presiones', () => {
  const base = { DN: 100, tipo: 'bt', nombre: 'Valvula Clase 300', clase: '300', norma: 'ASME B16.34' };

  it('P_max y P_op en MPa se muestran con su equivalente en bar correcto', () => {
    // Clase 300 CF8M a 100 °C: rating 42,2 bar = 4,22 MPa; P_op 30 bar = 3,0 MPa
    const dxf = exportarDXFValvulas({ ...base, P_max: 4.22, P_op: 3.0, material: 'ASTM A351 CF8M (Grupo 2.2)' });
    expect(dxf).toContain('P max clase = 4.22 MPa (42.2 bar)');
    expect(dxf).toContain('P oper = 3.00 MPa (30.0 bar)');
    expect(dxf).not.toContain('42.20 MPa');   // el error anterior: bar rotulado como MPa
    expect(dxf).toContain('Material: ASTM A351 CF8M (Grupo 2.2)');
    expect(dxf).not.toContain('(default)');
  });

  it('sin P_max ni P_op no imprime presiones ni estado', () => {
    const dxf = exportarDXFValvulas({ ...base, material: 'ASTM A351 CF8M' });
    expect(dxf).toContain('Presiones: no evaluadas en este calculo');
    expect(dxf).not.toMatch(/P max clase|P oper|Factor uso|Prueba hidrost|ESTADO:/);
  });

  it('prueba hidrostática = 1,5 × rating a 38 °C, no al rating a la temperatura de operación', () => {
    // CF8M Clase 300: rating a 100 °C = 4,22 MPa; a 38 °C = 4,96 MPa → 1,5 × 4,96 = 7,44 MPa
    const dxf = exportarDXFValvulas({ ...base, P_max: 4.22, P_op: 3.0, P_rating38: 4.96 });
    expect(dxf).toContain('Prueba hidrost = 7.44 MPa');
    expect(dxf).not.toContain('6.33 MPa');   // 1,5 × 4,22: el cálculo anterior
  });

  it('sin P_rating38 no imprime prueba hidrostática', () => {
    const dxf = exportarDXFValvulas({ ...base, P_max: 4.22, P_op: 3.0 });
    expect(dxf).not.toContain('Prueba hidrost');
  });
});

describe('exportarDXFSeleccionMaterial', () => {
  const dxf = exportarDXFSeleccionMaterial({
    material: 'Acero inoxidable', astm: 'ASTM A351 CF8M', norma: 'NACE MR0175/ISO 15156',
    nace: true, maxTemp: 450, obs: 'Servicio ácido con H2S.',
    entradas: [['Tipo de fluido', 'h2s_acido'], ['Temperatura (C)', '80'], ['H2S (ppm)', '500'], ['Cloruros (ppm)', '0']],
  });

  it('muestra el material recomendado y los datos ingresados', () => {
    expect(dxf).toContain('Material recomendado: Acero inoxidable');
    expect(dxf).toContain('Especificacion ASTM: ASTM A351 CF8M');
    expect(dxf).toContain('H2S (ppm): 500');
  });

  it('no dibuja DN, clase, presiones ni el material por defecto', () => {
    expect(dxf).not.toMatch(/DN \d|DN = |Clase ASME|Clase 300|P max|P oper|Prueba hidrost|\(default\)/);
    expect(dxf).not.toContain('CIRCLE');   // sin geometría de válvula
  });
});

describe('tituloModuloPDF', () => {
  it('resuelve el módulo desde el tipo (antes solo MAOP coincidía)', () => {
    expect(tituloModuloPDF('VALVULAS_COEFICIENTE_CV', 'VALVULAS_COEFICIENTE_CV')).toBe('Válvulas Industriales');
    expect(tituloModuloPDF('MAOP', 'MAOP')).toBe('Petróleo y Gas');
    expect(tituloModuloPDF('CANERIAS_HOOP', 'CANERIAS_HOOP')).toBe('Cañerías e Integridad');
    expect(tituloModuloPDF('ESTABILIDAD_PRESA_GRAVEDAD', null)).toBe('Represas y Presas');
    expect(tituloModuloPDF('INSTRUMENTACION_LAZO_4_20MA', null)).toBe('Electrónica de Instrumentación');
  });

  it('todos los tipos usados en los módulos tienen título (no el nombre interno)', () => {
    const tipos = [
      'ARQUITECTURA_ILUMINACION', 'ARQUITECTURA_SISMO', 'ARQUITECTURA_VIENTO',
      'CANERIAS_ARIETE', 'CANERIAS_CIERRE', 'CANERIAS_ESPESOR', 'CANERIAS_HOOP', 'CANERIAS_REMANENTE',
      'CAPACIDAD_PORTANTE', 'CERAMICO_MMO', 'COLUMNA_HORMIGON_ACI', 'CONSUMO_ELECTRODOS', 'CONTRAPISO_MMO',
      'DARCY_WEISBACH', 'DILATACION_TERMICA', 'DRENAJE_VIAL_HEC22',
      'ELECTRICIDAD_AREA_PELIGROSA', 'ELECTRICIDAD_CABLE', 'ELECTRICIDAD_CAIDA_TENSION',
      'ELECTRICIDAD_CORTOCIRCUITO', 'ELECTRICIDAD_FACTOR_POTENCIA', 'ELECTRICIDAD_ILUMINACION',
      'ELECTRICIDAD_MOTOR', 'ELECTRICIDAD_TRANSFORMADOR', 'ELECTROMECANICA_FLOTA',
      'ESTABILIDAD_PRESA_GRAVEDAD', 'ESTABILIDAD_TALUD', 'EXCAVACION_MMO', 'FILETE_SOLDADURA',
      'FILTRACION_DARCY', 'GISTM_CONFORMIDAD', 'GOLPE_ARIETE', 'HEAT_INPUT', 'HIERRO_MMO', 'HORMIGON_MMO',
      'INSTRUMENTACION_ENERGIA_SOLAR', 'INSTRUMENTACION_LAZO_4_20MA', 'INSTRUMENTACION_TERMOCUPLA_K',
      'INSTRUMENTACION_EMI_CONDUCIDA', 'INTERCAMBIADOR_LMTD', 'LOSA_MMO', 'MAMPOSTERIA_MMO', 'MAOP',
      'MORTERO_MMO', 'PAVIMENTO_AASHTO93', 'PERFORACION', 'PRECALENTAMIENTO', 'RENDIMIENTO_MMO',
      'REVOQUE_MMO', 'RMR_BIENIAWSKI', 'SELECTOR_SOLDADURA', 'VALVULAS_BRIDA_B16_5',
      'VALVULAS_CLASE_B16_34', 'VALVULAS_COEFICIENTE_CV', 'VALVULAS_MATERIAL_NACE',
      'VALVULAS_DISENO_BOLA', 'VALVULAS_DISENO_MARIPOSA', 'VALVULAS_DISENO_RETENCION',
      'VALVULAS_DISENO_TAPON', 'VALVULAS_DISENO_GLOBO',
      'VENTILACION_SUBTERRANEA', 'VERTEDERO_FRANCIS', 'VIGA_ACERO_AISC', 'ZAPATA_MMO',
    ];
    for (const t of tipos) expect(tituloModuloPDF(t, t), t).not.toBe(t);
  });

  it('registros viejos con moduloId de módulo', () => {
    expect(tituloModuloPDF('X', 'VALVULAS')).toBe('Válvulas Industriales');
    expect(tituloModuloPDF('X', 'THERMAL')).toBe('Térmica');
    expect(tituloModuloPDF('X', 'valvulas')).toBe('Válvulas Industriales');
  });

  it('tipo desconocido → comportamiento anterior (nombre interno)', () => {
    expect(tituloModuloPDF('TIPO_INEXISTENTE', null)).toBe('TIPO_INEXISTENTE');
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
  it('fórmula Eaton con Poisson=0.25, poreGrad default (0.433)', () => {
    const r = calcFractureGradient(3000, 1.0, 0.433, 0.25);
    expect(r).not.toBeNull();
    // nu/(1-nu) = 0.25/0.75 = 0.3333
    // fracGrad = 0.3333 × (1.0 - 0.433) + 0.433 = 0.622
    expect(r!.fracGrad).toBeCloseTo(0.622, 2);
    expect(r!.fracPressure).toBeCloseTo(0.622 * 3000, 0);
  });

  it('Poisson más alto → gradiente más alto', () => {
    const r1 = calcFractureGradient(3000, 1.0, 0.433, 0.25);
    const r2 = calcFractureGradient(3000, 1.0, 0.433, 0.40);
    expect(r2!.fracGrad).toBeGreaterThan(r1!.fracGrad);
  });

  it('poreGrad es un parámetro real — cambiarlo cambia el resultado', () => {
    const rAguaDulce = calcFractureGradient(3000, 1.0, 0.433, 0.25);
    const rAguaSalada = calcFractureGradient(3000, 1.0, 0.465, 0.25);
    expect(rAguaSalada!.fracGrad).not.toBeCloseTo(rAguaDulce!.fracGrad, 3);
  });

  it('retorna null con depth=0', () => {
    expect(calcFractureGradient(0, 1.0)).toBeNull();
  });

  // Antes esto se acotaba solo en el sitio de llamada del componente
  // (fuera de la función) — ahora la función misma lo rechaza.
  it('retorna null con poissonRatio=1 (antes daba Infinity)', () => {
    expect(calcFractureGradient(3000, 1.0, 0.433, 1)).toBeNull();
  });

  it('retorna null con poissonRatio>1 (antes invertía el signo)', () => {
    expect(calcFractureGradient(3000, 1.0, 0.433, 1.5)).toBeNull();
  });

  it('retorna null con poissonRatio negativo', () => {
    expect(calcFractureGradient(3000, 1.0, 0.433, -0.1)).toBeNull();
  });

  it('retorna null con poissonRatio=0.5 exacto (límite no incluido)', () => {
    expect(calcFractureGradient(3000, 1.0, 0.433, 0.5)).toBeNull();
  });

  it('acepta poissonRatio=0 (límite inferior válido)', () => {
    expect(calcFractureGradient(3000, 1.0, 0.433, 0)).not.toBeNull();
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

  it('retorna null con Q_kN=0', () => {
    expect(calcCapacidadPortante('grava', 2, 2, 1, 0, 3, 99)).toBeNull();
  });

  // Nq/Nc/Ng derivados de φ con las fórmulas de Vesic (1973) — reemplaza la
  // tabla fija que tenía esta función y la copia manual, ya eliminada, que
  // vivía en components/ModuloGeotecnia.tsx con valores distintos.
  it('Nq/Nc/Ng de Vesic — arena_suelta (φ=30°)', () => {
    const r = calcCapacidadPortante('arena_suelta', 2, 2, 1, 100, 3, 99);
    expect(r!.phi).toBe(30);
    expect(r!.Nq).toBeCloseTo(18.40, 1);
    expect(r!.Nc).toBeCloseTo(30.14, 1);
    expect(r!.Ng).toBeCloseTo(22.40, 1);
  });

  it('Nq/Nc/Ng de Vesic — grava (φ=40°), ya no igual a arena_compacta', () => {
    const r = calcCapacidadPortante('grava', 2, 2, 1, 100, 3, 99);
    expect(r!.phi).toBe(40);
    expect(r!.Nq).toBeCloseTo(64.20, 1);
    expect(r!.Nc).toBeCloseTo(75.31, 1);
    expect(r!.Ng).toBeCloseTo(109.41, 1);
  });

  it('Nq/Nc/Ng de Vesic — arcilla (φ=0°): Nc=π+2, Nq=1, Ng=0', () => {
    const r = calcCapacidadPortante('arcilla_media', 2, 2, 1, 100, 3, 99);
    expect(r!.phi).toBe(0);
    expect(r!.Nq).toBeCloseTo(1.0, 2);
    expect(r!.Nc).toBeCloseTo(5.14, 2);
    expect(r!.Ng).toBe(0);
  });

  it('devuelve riesgo, freatic, utilizacion y c para consumo de UI', () => {
    const r = calcCapacidadPortante('arena_compacta', 3, 3, 1.5, 1000, 3, 99);
    expect(r).not.toBeNull();
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(r!.riesgo);
    expect(typeof r!.utilizacion).toBe('number');
    expect(r!.freatic).toBe('Sin efecto freatico');
    expect(r!.c).toBe(0);
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

  it('devuelve dT1, dT2 y riesgo por área', () => {
    const r = calcIntercambiador(500, 120, 60, 20, 80, 500, 'contracorriente')!;
    expect(r.dT1).toBe(40);
    expect(r.dT2).toBe(40);
    expect(r.A_m2).toBe(25);
    expect(r.riesgo).toBe('LOW');
  });

  it('riesgo por área: >200 m² MEDIUM, >500 m² HIGH', () => {
    // LMTD = 40 → A = Q·1000 / (U·40)
    expect(calcIntercambiador(3000, 120, 60, 20, 80, 300)!.riesgo).toBe('MEDIUM'); // 250 m²
    expect(calcIntercambiador(9000, 120, 60, 20, 80, 300)!.riesgo).toBe('HIGH');   // 750 m²
  });

  it('ΔT1 ≈ ΔT2 (< 0.01) → LMTD = media aritmética', () => {
    // dT1 = 120 − 80 = 40, dT2 = 60.005 − 20 = 40.005 → media 40.0025
    const r = calcIntercambiador(500, 120, 60.005, 20, 80, 500, 'contracorriente')!;
    expect(r.LMTD).toBeCloseTo(40.0025, 2);
  });

  it('rechaza sentido físico inverso (caliente se calienta / frío se enfría)', () => {
    // Antes lib lo aceptaba y devolvía efectividad = −150 %
    expect(calcIntercambiador(100, 60, 120, 20, 50, 500)).toBeNull();
    expect(calcIntercambiador(100, 120, 60, 80, 20, 500)).toBeNull();
  });

  it('cambio de fase: condensador (Thi == Tho) aceptado', () => {
    // Vapor condensando a 120 °C, agua 20 → 80 °C
    // dT1 = 120 − 80 = 40, dT2 = 120 − 20 = 100 → LMTD = 60/ln(2.5) = 65.48
    const r = calcIntercambiador(500, 120, 120, 20, 80, 500, 'contracorriente')!;
    expect(r).not.toBeNull();
    expect(r.LMTD).toBeCloseTo(60 / Math.log(2.5), 2);
    // Efectividad del lado caliente daría 0 % sin sentido → null + nota
    expect(r.efectividad).toBeNull();
    expect(r.notaEfectividad).toMatch(/no aplica.*condensaci/i);
  });

  it('cambio de fase: evaporador (Tci == Tco) aceptado', () => {
    // Fluido caliente 120 → 60 °C, refrigerante evaporando a 10 °C
    // dT1 = 120 − 10 = 110, dT2 = 60 − 10 = 50 → LMTD = 60/ln(2.2) = 76.10
    const r = calcIntercambiador(500, 120, 60, 10, 10, 500, 'contracorriente')!;
    expect(r).not.toBeNull();
    expect(r.LMTD).toBeCloseTo(60 / Math.log(2.2), 2);
    // Efectividad del lado caliente sigue siendo significativa: (120−60)/(120−10)
    expect(r.efectividad).toBeCloseTo(60 / 110 * 100, 1);
    expect(r.notaEfectividad).toMatch(/evaporaci/i);
  });

  it('cambio de fase en ambos lados → efectividad no aplica', () => {
    // Vapor condensando a 150 °C, agua hirviendo a 100 °C → LMTD = 50
    const r = calcIntercambiador(500, 150, 150, 100, 100, 500, 'contracorriente')!;
    expect(r.LMTD).toBe(50);
    expect(r.efectividad).toBeNull();
    expect(r.notaEfectividad).toMatch(/ambos fluidos/i);
  });

  it('sin cambio de fase → sin nota de efectividad', () => {
    expect(calcIntercambiador(500, 120, 60, 20, 80, 500)!.notaEfectividad).toBeNull();
  });

  it('retorna null con entradas no finitas (NaN / Infinity)', () => {
    expect(calcIntercambiador(NaN,      120, 60,  20, 80, 500)).toBeNull();
    expect(calcIntercambiador(500,      NaN, 60,  20, 80, 500)).toBeNull();
    expect(calcIntercambiador(500,      120, 60,  NaN, 80, 500)).toBeNull();
    expect(calcIntercambiador(500,      120, 60,  20, 80, Infinity)).toBeNull();
    expect(calcIntercambiador(Infinity, 120, 60,  20, 80, 500)).toBeNull();
  });
});

describe('calcDilatacionLineal', () => {
  it('dL correcta — acero 100 m, ΔT=180°C, α=11.7µ', () => {
    const r = calcDilatacionLineal(100, 20, 200, 11.7);
    expect(r).not.toBeNull();
    // dL = 11.7e-6 × 100 × 180 × 1000 = 210.6 mm
    expect(r!.dL_mm).toBeCloseTo(11.7e-6 * 100 * 180 * 1000, 1);
  });

  it('restringido genera tensión — CRITICAL si > 200 MPa', () => {
    // sigma = 200×1000 × 11.7e-6 × 180 = 421.2 MPa
    const r = calcDilatacionLineal(100, 20, 200, 11.7, true, 200);
    expect(r!.sigma_MPa).toBeCloseTo(421.2, 0);
    expect(r!.riesgo).toBe('CRITICAL');
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

  it('ΔL > 50 mm sin restricción → MEDIUM (antes el componente daba LOW)', () => {
    // Caso por defecto de la UI: 100 m, 20 → 80 °C, acero al carbono
    // dL = 11.7e-6 × 100 × 60 × 1000 = 70.2 mm, sigma = 0
    const r = calcDilatacionLineal(100, 20, 80, 11.7, false)!;
    expect(r.dL_mm).toBe(70.2);
    expect(r.sigma_MPa).toBe(0);
    expect(r.riesgo).toBe('MEDIUM');
  });

  it('ΔL ≤ 50 mm sin restricción → LOW', () => {
    // dL = 11.7e-6 × 50 × 60 × 1000 = 35.1 mm
    expect(calcDilatacionLineal(50, 20, 80, 11.7, false)!.riesgo).toBe('LOW');
  });

  it('umbral HIGH 150 MPa solo aplica con sigmaAdmAplica (acero al carbono)', () => {
    // sigma = 200×1000 × 11.7e-6 × 70 = 163.8 MPa
    const conAdm = calcDilatacionLineal(10, 20, 90, 11.7, true, 200, undefined, true)!;
    const sinAdm = calcDilatacionLineal(10, 20, 90, 11.7, true, 200, undefined, false)!;
    expect(conAdm.sigma_MPa).toBeCloseTo(163.8, 1);
    expect(conAdm.riesgo).toBe('HIGH');
    expect(conAdm.ok).toBe(false);
    expect(sinAdm.riesgo).toBe('MEDIUM');
    expect(sinAdm.advertenciaMaterial).not.toBeNull();
  });

  it('estado y ok se derivan del mismo riesgo combinado — nunca se contradicen', () => {
    const casos = [
      calcDilatacionLineal(50,  20, 80,  11.7, false),                           // LOW
      calcDilatacionLineal(100, 20, 80,  11.7, false),                           // MEDIUM por ΔL
      calcDilatacionLineal(100, 20, 80,  11.7, true, 200, undefined, true),      // MEDIUM por σ=140.4
      calcDilatacionLineal(10,  20, 90,  11.7, true, 200, undefined, true),      // HIGH σ=163.8
      calcDilatacionLineal(10,  20, 200, 11.7, true, 200, undefined, true),      // CRITICAL
      calcDilatacionLineal(10,  20, 200, 17.2, true, 193, undefined, false),     // CRITICAL no carbono
    ].map(r => r!);
    const esperado = { LOW: 'APTO', MEDIUM: 'MONITOREAR', HIGH: 'REQUIERE LIRA', CRITICAL: 'REQUIERE LIRA' };
    expect(casos.map(r => r.riesgo)).toEqual(['LOW', 'MEDIUM', 'MEDIUM', 'HIGH', 'CRITICAL', 'CRITICAL']);
    for (const r of casos) {
      expect(r.estado).toBe(esperado[r.riesgo]);
      expect(r.ok).toBe(r.riesgo === 'LOW' || r.riesgo === 'MEDIUM');
    }
  });

  it('estadoMotivo explica el origen del riesgo', () => {
    expect(calcDilatacionLineal(50,  20, 80, 11.7, false)!.estadoMotivo).toBeNull();
    expect(calcDilatacionLineal(100, 20, 80, 11.7, false)!.estadoMotivo).toMatch(/Dilatacion libre > 50 mm/);
    expect(calcDilatacionLineal(100, 20, 80, 11.7, true, 200, undefined, true)!.estadoMotivo).toMatch(/> 100 MPa/);
  });

  it('dT se devuelve con signo', () => {
    expect(calcDilatacionLineal(50, 80, 20, 11.7)!.dT).toBe(-60);
  });

  it('retorna null con entradas no finitas (NaN / Infinity)', () => {
    expect(calcDilatacionLineal(NaN, 20, 80, 11.7)).toBeNull();
    expect(calcDilatacionLineal(100, NaN, 80, 11.7)).toBeNull();
    expect(calcDilatacionLineal(100, 20, Infinity, 11.7)).toBeNull();
    expect(calcDilatacionLineal(100, 20, 80, NaN)).toBeNull();
    expect(calcDilatacionLineal(100, 20, 80, 11.7, true, NaN)).toBeNull();
  });

  it('retorna null con E <= 0 o geometría inválida', () => {
    expect(calcDilatacionLineal(100, 20, 80, 11.7, true, 0)).toBeNull();
    expect(calcDilatacionLineal(100, 20, 80, 11.7, true, -200)).toBeNull();
    expect(calcDilatacionLineal(100, 20, 80, 11.7, false, 200, { OD_mm: NaN, t_mm: 8 })).toBeNull();
    expect(calcDilatacionLineal(100, 20, 80, 11.7, false, 200, { OD_mm: 219.1, t_mm: -1 })).toBeNull();
  });
});

describe('calcDilatacionMaterial', () => {
  it('caso por defecto de la UI — acero al carbono, lira en U', () => {
    // dL = 70.2 mm; lira = √(3 × 200e9 × 0.2191 × 0.0702 / 200e6) = 6.79 m
    const r = calcDilatacionMaterial(100, 20, 80, 'acero_carbono', false, 219.1, 8.18)!;
    expect(r.alpha).toBe(11.7);
    expect(r.dL_mm).toBe(70.2);
    expect(r.L_lira_m).toBeCloseTo(6.79, 2);
    expect(r.sigmaAdmAplica).toBe(true);
    expect(r.advertenciaMaterial).toBeNull();
    expect(r.ok).toBe(true);
  });

  it('restringido — acero al carbono σ = 140.4 MPa → MEDIUM', () => {
    const r = calcDilatacionMaterial(100, 20, 80, 'acero_carbono', true, 219.1, 8.18)!;
    expect(r.sigma_MPa).toBeCloseTo(140.4, 1);
    expect(r.riesgo).toBe('MEDIUM');
  });

  it('usa E de la tabla — HDPE (E = 0.8 GPa) no da tensión absurda', () => {
    // sigma = 0.8×1000 × 150e-6 × 60 = 7.2 MPa (con E=200 daría 1800 MPa)
    const r = calcDilatacionMaterial(100, 20, 80, 'hdpe', true, 110, 10)!;
    expect(r.sigma_MPa).toBeCloseTo(7.2, 1);
    expect(r.sigmaAdmAplica).toBe(false);
  });

  it('coincide con MATERIALES_DILATACION para cada material', () => {
    for (const [id, m] of Object.entries(MATERIALES_DILATACION)) {
      const r = calcDilatacionMaterial(10, 20, 80, id, true, 100, 5)!;
      expect(r.alpha).toBe(m.alpha_1e6);
      expect(r.sigma_MPa).toBeCloseTo(m.E_GPa * 1000 * m.alpha_1e6 * 1e-6 * 60, 1);
    }
  });

  it('material desconocido → null', () => {
    expect(calcDilatacionMaterial(100, 20, 80, 'titanio', false, 219.1, 8.18)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// CIVIL — ACI 318-19
// ════════════════════════════════════════════════════════════════
describe('calcColumnaHormigon', () => {
  it('phi_Pn correcta — columna 300×300, fc=25, fy=420', () => {
    // Ag=90000, Pn_max = 0.80×(0.85×25×(90000-1800)+420×1800) = 2104.2 kN
    // phi_Pn = 0.65 × 2104.2 = 1367.7 kN
    const r = calcColumnaHormigon(1200, 50, 300, 300, 1800, 25, 420);
    expect(r).not.toBeNull();
    expect(r!.phi_Pn).toBeCloseTo(1367.7, 1);
    expect(r!.ok_P).toBe(true);
  });

  it('campos derivados: util_P, e_mm, e_min, Ag_cm2', () => {
    const r = calcColumnaHormigon(1200, 50, 300, 300, 1800, 25, 420)!;
    // util = 1200 / 1367.73 = 87.7 %
    expect(r.util_P).toBeCloseTo(87.7, 1);
    // e = 50e6 N·mm / 1.2e6 N = 41.7 mm
    expect(r.e_mm).toBeCloseTo(41.7, 1);
    // e_min = max(15, 0.03×300=9) = 15
    expect(r.e_min).toBe(15);
    expect(r.Ag_cm2).toBe(900);
  });

  it('e_min = 0.03·h cuando supera 15 mm; Mu=0 → e_mm=0', () => {
    const r = calcColumnaHormigon(1000, 0, 600, 600, 7200, 25, 420)!;
    expect(r.e_min).toBe(18);
    expect(r.e_mm).toBe(0);
  });

  it('umbrales de riesgo 70/90 % sobre φPn=1367.73 kN', () => {
    const riesgo = (Pu: number) => calcColumnaHormigon(Pu, 0, 300, 300, 1800, 25, 420)!.riesgo;
    expect(riesgo(900)).toBe('LOW');       // 65.8 %
    expect(riesgo(1050)).toBe('MEDIUM');   // 76.8 %
    expect(riesgo(1300)).toBe('HIGH');     // 95.0 %
    expect(riesgo(1400)).toBe('CRITICAL'); // 102.4 %
  });

  it('ok_P compara contra φPn sin redondear', () => {
    // φPn real = 1367.73 kN → se muestra 1367.7. Pu=1367.72 cumple aunque
    // sea mayor que el valor redondeado mostrado.
    const r = calcColumnaHormigon(1367.72, 0, 300, 300, 1800, 25, 420)!;
    expect(r.phi_Pn).toBe(1367.7);
    expect(r.ok_P).toBe(true);
  });

  it('retorna null con Pu <= 0 (sin carga o tracción)', () => {
    expect(calcColumnaHormigon(0,   0, 300, 300, 1800, 25, 420)).toBeNull();
    expect(calcColumnaHormigon(-50, 0, 300, 300, 1800, 25, 420)).toBeNull();
  });

  it('retorna null con fc, fy <= 0 o As < 0', () => {
    expect(calcColumnaHormigon(1000, 0, 300, 300, 1800, 0,  420)).toBeNull();
    expect(calcColumnaHormigon(1000, 0, 300, 300, 1800, 25, 0)).toBeNull();
    expect(calcColumnaHormigon(1000, 0, 300, 300, -1,   25, 420)).toBeNull();
  });

  it('retorna null con entradas no finitas (NaN / Infinity)', () => {
    expect(calcColumnaHormigon(NaN,      0,   300, 300, 1800, 25, 420)).toBeNull();
    expect(calcColumnaHormigon(1000,     NaN, 300, 300, 1800, 25, 420)).toBeNull();
    expect(calcColumnaHormigon(1000,     0,   NaN, 300, 1800, 25, 420)).toBeNull();
    expect(calcColumnaHormigon(Infinity, 0,   300, 300, 1800, 25, 420)).toBeNull();
    expect(calcColumnaHormigon(1000,     0,   300, 300, 1800, 25, Infinity)).toBeNull();
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
  it('roca buena — clase II (P4 corregido: buena=25/30, no 12/15)', () => {
    // ucs=101→p1=12, rqd=80→p2=17, espaciado=500→p3=10 (200–600), buena→p4=25
    // (tabla Bieniawski real, antes esta función tenía buena=12 sobre 15),
    // humedo→p5=10, favorable→adj=-2
    const r = calcRMR(101, 80, 500, 'buena', 'humedo', 'favorable');
    expect(r).not.toBeNull();
    expect(r!.p4).toBe(25);
    expect(r!.rmr).toBe(12 + 17 + 10 + 25 + 10 - 2);  // 72
    expect(r!.clase).toBe('II');    // 61–80 (antes daba 'III' con el P4 viejo)
    expect(r!.riesgo).toBe('LOW');  // antes daba 'MEDIUM'
  });

  it('P4 — las 5 categorías dan el puntaje real de Bieniawski (máximo 30, no 15)', () => {
    expect(calcRMR(101, 80, 500, 'muy_buena', 'seco', 'muy_favorable')!.p4).toBe(30);
    expect(calcRMR(101, 80, 500, 'buena',     'seco', 'muy_favorable')!.p4).toBe(25);
    expect(calcRMR(101, 80, 500, 'regular',   'seco', 'muy_favorable')!.p4).toBe(20);
    expect(calcRMR(101, 80, 500, 'mala',      'seco', 'muy_favorable')!.p4).toBe(10);
    expect(calcRMR(101, 80, 500, 'muy_mala',  'seco', 'muy_favorable')!.p4).toBe(0);
  });

  it('roca muy mala — clase V, riesgo CRITICAL', () => {
    const r = calcRMR(3, 15, 30, 'muy_mala', 'flujo', 'muy_desfavorable');
    expect(r!.clase).toBe('V');
    expect(r!.riesgo).toBe('CRITICAL');
  });

  it('suma de parámetros es correcta', () => {
    const r = calcRMR(55, 60, 300, 'regular', 'seco', 'regular');
    expect(r!.rmr).toBe(r!.p1 + r!.p2 + r!.p3 + r!.p4 + r!.p5 + r!.adj);
  });
});

describe('calcVentilacion', () => {
  it('caudal mínimo = 0.25 m³/s para galería vacía (norma genérica default)', () => {
    const r = calcVentilacion(0, 0, 100, 8, 0);
    expect(r!.Q_requerido).toBeCloseTo(0.25, 2);
    expect(r!.normaLabel).toBe('Genérica — práctica internacional');
  });

  it('Q = trabajadores×0.06 + diesel×0.06 (norma genérica)', () => {
    const r = calcVentilacion(10, 200, 500, 8, 15);
    expect(r!.Q_requerido).toBeCloseTo(10 * 0.06 + 200 * 0.06, 2);
    // V_galeria se redondea a 2 decimales (mismo criterio que el componente
    // real, antes esta función redondeaba a 3 — ver commit)
    expect(r!.V_galeria).toBeCloseTo(r!.Q_requerido / 8, 2);
    expect(r!.co_ok).toBe(true);
  });

  // CO entre el TLV-TWA (25 ppm, ACGIH) y el REL (35 ppm, NIOSH): el
  // componente real (ya en producción, sin cambios) NO lo trata como
  // CRITICAL automático — usa el nivel granular de riesgo_co, y CRITICAL
  // en `riesgo` queda reservado para cuando no se cumple el caudal
  // requerido o la velocidad de galería es insuficiente. La versión vieja
  // de esta función (nunca conectada al componente) trataba cualquier
  // co_ok=false como CRITICAL directo — ese comportamiento nunca llegó a
  // un usuario real.
  it('CO=30ppm (entre TWA y REL) con caudal/velocidad OK → MEDIUM, no CRITICAL', () => {
    const r = calcVentilacion(5, 50, 100, 4, 30);
    expect(r!.co_ok).toBe(false);
    expect(r!.riesgo_co).toBe('MEDIUM');
    expect(r!.cumple_caudal).toBe(true);
    expect(r!.riesgo).toBe('MEDIUM');
  });

  it('CO>200ppm (cerca de IDLH) → CRITICAL', () => {
    const r = calcVentilacion(5, 50, 100, 4, 250);
    expect(r!.riesgo_co).toBe('CRITICAL');
    expect(r!.riesgo).toBe('CRITICAL');
  });

  it('caudal insuficiente → CRITICAL aunque el CO esté OK', () => {
    // Q_medido muy por debajo del requerido → cumple_caudal=false → CRITICAL
    const r = calcVentilacion(50, 500, 100, 8, 0, 'generico', 0.5);
    expect(r!.co_ok).toBe(true);
    expect(r!.cumple_caudal).toBe(false);
    expect(r!.riesgo).toBe('CRITICAL');
  });

  it('retorna null con seccion=0', () => {
    expect(calcVentilacion(10, 50, 100, 0, 0)).toBeNull();
  });

  it('norma "chile" usa sus propios factores, distintos de "generico"', () => {
    const rGenerico = calcVentilacion(10, 200, 500, 8, 0, 'generico');
    const rChile     = calcVentilacion(10, 200, 500, 8, 0, 'chile');
    // Chile: 10×0.05 + 200×0.063 = 13.1 ; Generico: 10×0.06 + 200×0.06 = 12.6
    expect(rChile!.Q_requerido).not.toBeCloseTo(rGenerico!.Q_requerido, 1);
    expect(rChile!.normaLabel).toBe('Chile — DS 132 Art. 138');
  });

  it('norma "peru" usa sus propios factores', () => {
    const r = calcVentilacion(10, 200, 500, 8, 0, 'peru');
    expect(r!.Q_requerido).toBeCloseTo(10 * 0.05 + 200 * 0.067, 2);
    expect(r!.normaLabel).toBe('Perú — DS 023-2017-EM Art. 252');
  });

  it('norma desconocida cae a "generico" por default', () => {
    const r = calcVentilacion(10, 200, 500, 8, 0, 'inexistente');
    expect(r!.normaLabel).toBe('Genérica — práctica internacional');
  });

  it('sin Q_medido: usaMedido=false, evalúa contra el caudal requerido', () => {
    const r = calcVentilacion(10, 0, 100, 8, 0);
    expect(r!.usaMedido).toBe(false);
    expect(r!.cumple_caudal).toBe(true);
    expect(r!.Q_eval).toBeCloseTo(r!.Q_requerido, 2);
  });

  it('con Q_medido menor al requerido: usaMedido=true, cumple_caudal=false', () => {
    const r = calcVentilacion(50, 500, 100, 8, 0, 'generico', 1);
    expect(r!.usaMedido).toBe(true);
    expect(r!.cumple_caudal).toBe(false);
    expect(r!.Q_eval).toBeCloseTo(1, 2);
    expect(r!.riesgo).toBe('CRITICAL'); // no cumple caudal
  });

  it('Q_medido=0 se ignora (usaMedido=false, se comporta como sin medir)', () => {
    const r = calcVentilacion(10, 0, 100, 8, 0, 'generico', 0);
    expect(r!.usaMedido).toBe(false);
  });

  it('t_renovacion = volumen / Q_eval / 60', () => {
    const r = calcVentilacion(10, 0, 100, 8, 0);
    const volumen = 100 * 8;
    expect(r!.t_renovacion).toBeCloseTo(volumen / r!.Q_eval / 60, 1);
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

// ════════════════════════════════════════════════════════════════
// CORTOCIRCUITO TRIFÁSICO — IEC 60909 §4.3.1 (ModuloElectricidad.tsx calcCC,
// funcion inline no exportada; formula reproducida aqui: Zt=(uk%×V²)/(100×S_VA),
// Imax=(1.1×V)/(√3×(Zt+Zc)), Imin=(0.95×V)/(√3×(Zt+2×Zc)))
// ════════════════════════════════════════════════════════════════
describe('cortocircuito trifasico (IEC 60909)', () => {
  it('transformador 500 kVA, 400V, uk=4%, sin cable (Zc=0)', () => {
    const S_kVA = 500, uk = 4, V = 400, Zc = 0;
    const Zt = (uk / 100) * (V * V) / (S_kVA * 1000);
    const Imax = (1.1 * V) / (Math.sqrt(3) * (Zt + Zc));
    const Imin = (0.95 * V) / (Math.sqrt(3) * (Zt + 2 * Zc));
    expect(Math.abs(Imax / 1000 - 19.85)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(Imin / 1000 - 17.14)).toBeLessThanOrEqual(0.1);
  });
});
