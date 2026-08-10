import { describe, it, expect } from 'vitest';
import { calcularEstabilidadMuroRepresa } from '../represa-estabilidad';

// ════════════════════════════════════════════════════════════════
// Estabilidad muro de represa — USACE EM 1110-2-2200 Cap.4
// ════════════════════════════════════════════════════════════════
describe('calcularEstabilidadMuroRepresa', () => {

  it('caso de control — corona 2m, altura 5m, talud 0.75, hormigón 23.5, f=0.70, nivel 5m → FS ≈ 1.80', () => {
    const r = calcularEstabilidadMuroRepresa(
      { anchoCoronamiento: 2, profundidad: 5, talud: 0.75 },
      { pesoEspecificoHormigon: 23.5, coeficienteFriccionBase: 0.70, nivelAgua: 5 },
    );
    expect(r.baseAncho).toBeCloseTo(5.75, 3);
    expect(r.pesoMuro).toBeCloseTo(455.3125, 3);
    expect(r.empujeHidrostatico).toBeCloseTo(122.625, 3);
    expect(r.subpresion).toBeCloseTo(141.019, 2);
    expect(r.factorSeguridadDeslizamiento).toBeCloseTo(1.80, 1);
    expect(r.semaforo).toBe('amarillo');
    expect(r.resultanteEnTercioMedio).toBe(true);
  });

  it('semáforo verde — FS > 2.0', () => {
    const r = calcularEstabilidadMuroRepresa(
      { anchoCoronamiento: 4, profundidad: 5, talud: 0.75 },
      { pesoEspecificoHormigon: 23.5, coeficienteFriccionBase: 0.70, nivelAgua: 5 },
    );
    expect(r.factorSeguridadDeslizamiento).toBeGreaterThan(2.0);
    expect(r.semaforo).toBe('verde');
  });

  it('semáforo rojo — FS < 1.3', () => {
    const r = calcularEstabilidadMuroRepresa(
      { anchoCoronamiento: 1, profundidad: 5, talud: 0.3 },
      { pesoEspecificoHormigon: 23.5, coeficienteFriccionBase: 0.55, nivelAgua: 5 },
    );
    expect(r.factorSeguridadDeslizamiento).toBeLessThan(1.3);
    expect(r.semaforo).toBe('rojo');
  });

  it('nivel de agua se acota a la altura del muro (no admite sobrellenado)', () => {
    const conNivelExcedido = calcularEstabilidadMuroRepresa(
      { anchoCoronamiento: 2, profundidad: 5, talud: 0.75 },
      { pesoEspecificoHormigon: 23.5, coeficienteFriccionBase: 0.70, nivelAgua: 999 },
    );
    const conNivelAlTope = calcularEstabilidadMuroRepresa(
      { anchoCoronamiento: 2, profundidad: 5, talud: 0.75 },
      { pesoEspecificoHormigon: 23.5, coeficienteFriccionBase: 0.70, nivelAgua: 5 },
    );
    expect(conNivelExcedido.factorSeguridadDeslizamiento).toBeCloseTo(conNivelAlTope.factorSeguridadDeslizamiento, 6);
  });

  it('cita la norma USACE EM 1110-2-2200', () => {
    const r = calcularEstabilidadMuroRepresa(
      { anchoCoronamiento: 2, profundidad: 5, talud: 0.75 },
      { pesoEspecificoHormigon: 23.5, coeficienteFriccionBase: 0.70, nivelAgua: 5 },
    );
    expect(r.norma).toContain('EM 1110-2-2200');
  });
});
