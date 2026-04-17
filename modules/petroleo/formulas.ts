// ASME B31.8 Section 841.11 - Maximum Allowable Operating Pressure

export interface MAOPInput {
    OD: number;
    t: number;
    SMYS: number;
    F?: number;
    E_joint?: number;
    T_op?: number;
  }
  
  export interface MAOPResult {
    MAOP: number;
    safe: boolean;
    margin_of_safety: number;
    formula_used: string;
    assumptions: string[];
  }
  
  export function calculateMAOP(input: MAOPInput): MAOPResult {
    const { OD, t, SMYS, F = 0.72, E_joint = 1.0, T_op = 20 } = input;
  
    const temp_factor = T_op > 50 ? 1 - (T_op - 50) * 0.0005 : 1.0;
  
    const MAOP = (2 * t * SMYS * F * E_joint * temp_factor) / OD;
  
    return {
      MAOP: Math.round(MAOP * 100) / 100,
      safe: MAOP > 0,
      margin_of_safety: (MAOP / (SMYS * F)) * 100,
      formula_used: 'ASME B31.8 §841.11',
      assumptions: [
        'Seamless or ERW pipe',
        'No corrosion allowance applied',
        `Design factor: ${F * 100}%`,
        `Joint efficiency: ${E_joint * 100}%`,
        `Temperature factor: ${(temp_factor * 100).toFixed(2)}%`,
      ],
    };
  }
  
  export function calculateDarcyWeisbach(
    Q: number,
    D: number,
    L: number,
    f: number,
    rho: number = 1000
  ): number {
    const v = (Q / 3600) / (Math.PI * Math.pow(D / 1000, 2) / 4);
    const g = 9.81;
    const hf = f * (L / (D / 1000)) * (Math.pow(v, 2) / (2 * g));
    return Math.round(hf * 100) / 100;
  }
  
  export function calculateJoukowsky(
    a: number,
    v: number,
    rho: number = 1000
  ): number {
    const dP = rho * a * v;
    return Math.round(dP / 1000 * 100) / 100;
  }
  
  export function calculateBishopSlope(
    H: number,
    phi: number,
    c: number = 0,
    gamma: number = 19
  ): { FS: number; safe: boolean } {
    const phi_rad = (phi * Math.PI) / 180;
    const tan_phi = Math.tan(phi_rad);
  
    const FS = (tan_phi * (1 + 0.1)) / (Math.sin(phi_rad) * Math.cos(phi_rad));
  
    return {
      FS: Math.round(FS * 100) / 100,
      safe: FS > 1.3,
    };
  }