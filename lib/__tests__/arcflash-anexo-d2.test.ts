import { describe, it, expect } from 'vitest';
import {
  clasificarEnclosure,
  calcularIarcIntermedia,
  calcularIarcFinalBajaTension,
  calcularVarCf,
  calcularIarcReducida,
  calcularEES,
  calcularCF,
  calcularEnergiaIncidente,
  calcularArcFlashBoundary,
  elegirPeorCaso,
  ConfiguracionElectrodoArcFlash,
} from '../calculos';

// ════════════════════════════════════════════════════════════════
// Rama LV directa (Ecuación 25) IEEE 1584-2018 — Anexo D.2
// Gabinete VCB, 0.48 kV, Ibf=45 kA, gap=32mm, enclosure 610×610mm
// (alto×ancho), distancia de trabajo 609.6mm.
// Valores de referencia dados para verificar la implementación
// contra el Anexo D.2 del estándar.
// ════════════════════════════════════════════════════════════════

const CONFIG: ConfiguracionElectrodoArcFlash = 'VCB';
const VOLTAJE_REAL_KV = 0.48;
const IBF_KA = 45;
const GAP_MM = 32;
const ALTURA_MM = 610;
const ANCHO_MM = 610;
const DISTANCIA_TRABAJO_MM = 609.6;
const TIEMPO_NORMAL_MS = 61.3;
const TIEMPO_REDUCIDO_MS = 319;

const TOLERANCIA_PCT = 2;

function verificar(nombre: string, actual: number, esperado: number) {
  const errorPct = Math.abs(actual - esperado) / Math.abs(esperado) * 100;
  console.log(
    `${nombre}: actual=${actual.toFixed(4)}  esperado=${esperado}  error=${errorPct.toFixed(3)}%`,
  );
  expect(errorPct).toBeLessThanOrEqual(TOLERANCIA_PCT);
}

describe('Pipeline IEEE 1584-2018 — Anexo D.2 (rama LV, VCB, 0.48kV, Ibf=45kA)', () => {
  it('reproduce energía incidente y AFB de ambos escenarios dentro de 2%', () => {
    // 1) Clasificación de enclosure
    const clasificacion = clasificarEnclosure(ALTURA_MM, ANCHO_MM, VOLTAJE_REAL_KV);
    console.log(`\nclasificarEnclosure: ${clasificacion}`);

    // 2) Iarc600 crudo (intermedio, SIN corregir por Ecuación 25) — no
    // cambia entre escenarios, se reusa como iarc600KA en ambas llamadas
    // a calcularEnergiaIncidente más abajo.
    const iarc600Crudo = calcularIarcIntermedia(CONFIG, 0.6, IBF_KA, GAP_MM);
    console.log(`calcularIarcIntermedia (iarc600Crudo): ${iarc600Crudo.toFixed(4)} kA`);

    // Iarc normal — Ecuación 25, directo (sin interpolar entre tensiones)
    const iarcNormal = calcularIarcFinalBajaTension(CONFIG, VOLTAJE_REAL_KV, IBF_KA, GAP_MM);
    console.log(`calcularIarcFinalBajaTension (Iarc normal): ${iarcNormal.toFixed(4)} kA`);

    // 3) Factor de variación de corriente de arco
    const varCf = calcularVarCf(CONFIG, VOLTAJE_REAL_KV);
    console.log(`calcularVarCf: ${varCf.toFixed(6)}`);

    // 4) Iarc reducida
    const iarcReducida = calcularIarcReducida(iarcNormal, varCf);
    console.log(`calcularIarcReducida: ${iarcReducida.toFixed(4)} kA`);

    // 5) Equivalent Enclosure Size
    const ees = calcularEES(CONFIG, VOLTAJE_REAL_KV, ALTURA_MM, ANCHO_MM, clasificacion);
    console.log(`calcularEES: ${ees.toFixed(4)} in`);

    // 6) Factor de corrección de enclosure
    const cf = calcularCF(CONFIG, clasificacion, ees);
    console.log(`calcularCF: ${cf.toFixed(6)}`);

    // 7) Energía incidente — escenario normal y reducido, voltajeReferencia
    // fija en 0.6kV (rama LV directa). iarc600Crudo (SIN corregir por
    // Ecuación 25) va como override iarc600KA en AMBAS llamadas — no
    // cambia entre escenarios; solo el 4to parámetro (iarcKA) difiere.
    const energiaNormal = calcularEnergiaIncidente(
      CONFIG, 0.6, TIEMPO_NORMAL_MS, iarcNormal, IBF_KA, GAP_MM, cf, DISTANCIA_TRABAJO_MM, iarc600Crudo,
    );
    const energiaReducida = calcularEnergiaIncidente(
      CONFIG, 0.6, TIEMPO_REDUCIDO_MS, iarcReducida, IBF_KA, GAP_MM, cf, DISTANCIA_TRABAJO_MM, iarc600Crudo,
    );
    console.log(`calcularEnergiaIncidente normal (t=${TIEMPO_NORMAL_MS}ms):   ${energiaNormal.toFixed(4)}`);
    console.log(`calcularEnergiaIncidente reducida (t=${TIEMPO_REDUCIDO_MS}ms): ${energiaReducida.toFixed(4)}`);

    // 8) Arc-flash boundary — ambos escenarios, voltajeReferencia 0.6kV
    const afbNormal   = calcularArcFlashBoundary(CONFIG, 0.6, energiaNormal, DISTANCIA_TRABAJO_MM);
    const afbReducida = calcularArcFlashBoundary(CONFIG, 0.6, energiaReducida, DISTANCIA_TRABAJO_MM);
    console.log(`calcularArcFlashBoundary normal:   ${afbNormal.toFixed(4)} mm`);
    console.log(`calcularArcFlashBoundary reducida: ${afbReducida.toFixed(4)} mm`);

    // 9) Peor caso
    const peorCaso = elegirPeorCaso(energiaNormal, afbNormal, energiaReducida, afbReducida);
    console.log(
      `elegirPeorCaso: escenario="${peorCaso.escenario}" energia=${peorCaso.energia.toFixed(4)} afb=${peorCaso.afb.toFixed(4)}`,
    );

    // ── Verificación contra Anexo D.2 (tolerancia 2%) ──
    console.log('\n=== VERIFICACIÓN vs ANEXO D.2 (tolerancia 2%) ===');
    verificar('Energía normal (J/cm²)',   energiaNormal,   11.585);
    verificar('AFB normal (mm)',          afbNormal,       1029);
    verificar('Energía reducida (J/cm²)', energiaReducida, 53.156);
    verificar('AFB reducida (mm)',        afbReducida,     2669);

    expect(peorCaso.escenario).toBe('reducida');
  });
});
