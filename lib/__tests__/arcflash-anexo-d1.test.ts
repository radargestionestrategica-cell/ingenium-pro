import { describe, it, expect } from 'vitest';
import {
  clasificarEnclosure,
  calcularIarcIntermedia,
  interpolarArcFlash,
  calcularVarCf,
  calcularIarcReducida,
  calcularEES,
  calcularCF,
  calcularEnergiaYBoundaryFinal,
  elegirPeorCaso,
  ConfiguracionElectrodoArcFlash,
} from '../calculos';

// ════════════════════════════════════════════════════════════════
// Pipeline completo IEEE 1584-2018 — Anexo D.1
// Gabinete VCB metal-clad, 4.16 kV, Ibf=15 kA, gap=104mm,
// enclosure 1143×762mm (alto×ancho), distancia de trabajo 914.4mm.
// Valores de referencia dados para verificar la implementación
// contra el Anexo D.1 del estándar.
// ════════════════════════════════════════════════════════════════

const CONFIG: ConfiguracionElectrodoArcFlash = 'VCB';
const VOLTAJE_REAL_KV = 4.16;
const IBF_KA = 15;
const GAP_MM = 104;
const ALTURA_MM = 1143;
const ANCHO_MM = 762;
const DISTANCIA_TRABAJO_MM = 914.4;
const TIEMPO_NORMAL_MS = 197;
const TIEMPO_REDUCIDO_MS = 223;

const TOLERANCIA_PCT = 0.5;

function verificar(nombre: string, actual: number, esperado: number) {
  const errorPct = Math.abs(actual - esperado) / Math.abs(esperado) * 100;
  console.log(
    `${nombre}: actual=${actual.toFixed(4)}  esperado=${esperado}  error=${errorPct.toFixed(3)}%`,
  );
  expect(errorPct).toBeLessThanOrEqual(TOLERANCIA_PCT);
}

describe('Pipeline IEEE 1584-2018 — Anexo D.1 (VCB, 4.16kV, Ibf=15kA)', () => {
  it('reproduce energía incidente y AFB de ambos escenarios dentro de 0.5%', () => {
    // 1) Clasificación de enclosure
    const clasificacion = clasificarEnclosure(ALTURA_MM, ANCHO_MM, VOLTAJE_REAL_KV);
    console.log(`\nclasificarEnclosure: ${clasificacion}`);

    // 2) Iarc intermedia en las 3 tensiones de referencia
    const iarc600   = calcularIarcIntermedia(CONFIG, 0.6,  IBF_KA, GAP_MM);
    const iarc2700  = calcularIarcIntermedia(CONFIG, 2.7,  IBF_KA, GAP_MM);
    const iarc14300 = calcularIarcIntermedia(CONFIG, 14.3, IBF_KA, GAP_MM);
    console.log(`calcularIarcIntermedia 0.6kV:  ${iarc600.toFixed(4)} kA`);
    console.log(`calcularIarcIntermedia 2.7kV:  ${iarc2700.toFixed(4)} kA`);
    console.log(`calcularIarcIntermedia 14.3kV: ${iarc14300.toFixed(4)} kA`);

    // 3) Interpolación de Iarc normal a la tensión real
    const iarcNormal = interpolarArcFlash(iarc600, iarc2700, iarc14300, VOLTAJE_REAL_KV);
    console.log(`interpolarArcFlash Iarc normal @ ${VOLTAJE_REAL_KV}kV: ${iarcNormal.toFixed(4)} kA`);

    // 4) Factor de variación de corriente de arco
    const varCf = calcularVarCf(CONFIG, VOLTAJE_REAL_KV);
    console.log(`calcularVarCf: ${varCf.toFixed(6)}`);

    // 5) Iarc reducida en cada punto de referencia
    const iarc600Red   = calcularIarcReducida(iarc600, varCf);
    const iarc2700Red  = calcularIarcReducida(iarc2700, varCf);
    const iarc14300Red = calcularIarcReducida(iarc14300, varCf);
    console.log(`calcularIarcReducida 0.6kV:  ${iarc600Red.toFixed(4)} kA`);
    console.log(`calcularIarcReducida 2.7kV:  ${iarc2700Red.toFixed(4)} kA`);
    console.log(`calcularIarcReducida 14.3kV: ${iarc14300Red.toFixed(4)} kA`);

    // 6) Interpolación de Iarc reducida a la tensión real
    const iarcReducida = interpolarArcFlash(iarc600Red, iarc2700Red, iarc14300Red, VOLTAJE_REAL_KV);
    console.log(`interpolarArcFlash Iarc reducida @ ${VOLTAJE_REAL_KV}kV: ${iarcReducida.toFixed(4)} kA`);

    // 7) Equivalent Enclosure Size
    const ees = calcularEES(CONFIG, VOLTAJE_REAL_KV, ALTURA_MM, ANCHO_MM, clasificacion);
    console.log(`calcularEES: ${ees.toFixed(4)} in`);

    // 8) Factor de corrección de enclosure
    const cf = calcularCF(CONFIG, clasificacion, ees);
    console.log(`calcularCF: ${cf.toFixed(6)}`);

    // 9-10) Energía incidente y arc-flash boundary final — cada uno
    // interpolado por separado en su propio espacio (no se deriva el AFB
    // de la energía ya interpolada), escenario normal y reducido.
    const { energia: energiaNormal, afb: afbNormal } = calcularEnergiaYBoundaryFinal(
      CONFIG, VOLTAJE_REAL_KV, TIEMPO_NORMAL_MS,
      iarc600, iarc2700, iarc14300,
      IBF_KA, GAP_MM, cf, DISTANCIA_TRABAJO_MM,
    );
    const { energia: energiaReducida, afb: afbReducida } = calcularEnergiaYBoundaryFinal(
      CONFIG, VOLTAJE_REAL_KV, TIEMPO_REDUCIDO_MS,
      iarc600Red, iarc2700Red, iarc14300Red,
      IBF_KA, GAP_MM, cf, DISTANCIA_TRABAJO_MM,
    );
    console.log(`calcularEnergiaYBoundaryFinal normal (t=${TIEMPO_NORMAL_MS}ms):   energia=${energiaNormal.toFixed(4)}  afb=${afbNormal.toFixed(4)}`);
    console.log(`calcularEnergiaYBoundaryFinal reducida (t=${TIEMPO_REDUCIDO_MS}ms): energia=${energiaReducida.toFixed(4)}  afb=${afbReducida.toFixed(4)}`);

    // 11) Peor caso
    const peorCaso = elegirPeorCaso(energiaNormal, afbNormal, energiaReducida, afbReducida);
    console.log(
      `elegirPeorCaso: escenario="${peorCaso.escenario}" energia=${peorCaso.energia.toFixed(4)} afb=${peorCaso.afb.toFixed(4)}`,
    );

    // ── Verificación contra Anexo D.1 (tolerancia 0.5%) ──
    console.log('\n=== VERIFICACIÓN vs ANEXO D.1 (tolerancia 0.5%) ===');
    verificar('Energía normal (J/cm²)',   energiaNormal,   12.152);
    verificar('AFB normal (mm)',          afbNormal,       1606);
    verificar('Energía reducida (J/cm²)', energiaReducida, 13.343);
    verificar('AFB reducida (mm)',        afbReducida,     1704);

    expect(peorCaso.escenario).toBe('reducida');
  });
});
