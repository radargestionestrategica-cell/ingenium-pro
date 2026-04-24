// lib/proyecto.ts
// ═══════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.1 — Sistema de Proyecto Compartido
//  Conecta los módulos entre sí sin tocar ningún módulo existente.
//  Pure TypeScript — sin React — sin dependencias externas.
// ═══════════════════════════════════════════════════════════════

export interface ProyectoData {
    nombre: string;
    industria: string;
    fluido: string;
    presion_bar: number | null;
    temperatura_c: number | null;
    nps_pulgadas: string;
    material_tuberia: string;
    norma: string;
    H2S_ppm: number;
    zona_electrica: string;
    pais: string;
    gravedad_especifica: number;
  }
  
  // Clave única — no colisiona con ingenium_usuario
  const LLAVE = 'ingenium_proyecto_activo_v1';
  
  // Proyecto vacío — valores por defecto seguros
  export const PROYECTO_VACIO: ProyectoData = {
    nombre: '',
    industria: 'Petróleo / Gas',
    fluido: '',
    presion_bar: null,
    temperatura_c: null,
    nps_pulgadas: '',
    material_tuberia: '',
    norma: 'ASME B31.8',
    H2S_ppm: 0,
    zona_electrica: 'zona2',
    pais: 'Argentina',
    gravedad_especifica: 1.0,
  };
  
  // Guardar proyecto activo
  export function guardarProyecto(data: ProyectoData): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(LLAVE, JSON.stringify(data));
    } catch {
      // localStorage no disponible — no bloquea la app
    }
  }
  
  // Leer proyecto activo
  export function leerProyecto(): ProyectoData | null {
    try {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(LLAVE);
      if (!stored) return null;
      return JSON.parse(stored) as ProyectoData;
    } catch {
      return null;
    }
  }
  
  // Limpiar proyecto activo
  export function limpiarProyecto(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(LLAVE);
    } catch {
      // silencioso
    }
  }
  
  // Qué datos comparte cada módulo — referencia real
  export const CONEXIONES: Record<string, string[]> = {
    petroleo:     ['presion_bar', 'temperatura_c', 'fluido', 'nps_pulgadas', 'material_tuberia', 'norma'],
    canerias:     ['presion_bar', 'temperatura_c', 'fluido', 'nps_pulgadas', 'material_tuberia'],
    valvulas:     ['presion_bar', 'temperatura_c', 'fluido', 'nps_pulgadas', 'H2S_ppm'],
    soldadura:    ['material_tuberia', 'temperatura_c'],
    electricidad: ['zona_electrica', 'industria'],
    hidraulica:   ['fluido', 'gravedad_especifica', 'nps_pulgadas'],
    perforacion:  ['fluido', 'presion_bar'],
    civil:        ['norma', 'pais'],
    geotecnia:    ['pais'],
    mmo:          ['pais'],
  }; 