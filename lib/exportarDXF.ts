// lib/exportarDXF.ts
// INGENIUM PRO v8 — Exportación DXF para los 15 módulos
// Formato: AutoCAD DXF R12 ASCII — sin dependencias externas
// Compatible con: AutoCAD, FreeCAD, LibreCAD, BricsCAD, ZWCAD
// Silvana Belén Colombo © RADAR 2026

// ═══════════════════════════════════════════════════════════
//  TIPOS — INTERFACES DE PARÁMETROS POR MÓDULO
// ═══════════════════════════════════════════════════════════

export interface ParamsTuberias {
    OD: number;       // Diámetro exterior (mm)
    t: number;        // Espesor de pared (mm)
    L: number;        // Longitud (m)
    SMYS: number;     // Límite fluencia (MPa)
    MAOP: number;     // Presión máx operación (MPa)
    P_op?: number;    // Presión operación real (MPa)
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsHidraulica {
    D: number;        // Diámetro interno (mm)
    L: number;        // Longitud (m)
    Q: number;        // Caudal (L/s)
    V: number;        // Velocidad (m/s)
    hf: number;       // Pérdida de carga (m)
    Re: number;       // Reynolds
    f: number;        // Factor Darcy-Weisbach
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsGolpeAriete {
    D: number;        // Diámetro (mm)
    t: number;        // Espesor (mm)
    L: number;        // Longitud (m)
    V0: number;       // Velocidad inicial (m/s)
    a: number;        // Celeridad de onda (m/s)
    dP: number;       // Sobrepresión Joukowsky (MPa)
    Tc: number;       // Tiempo crítico (s)
    MAOP: number;     // Presión máx (MPa)
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsGeotecnia {
    B: number;        // Ancho cimentación (m)
    L_cim: number;    // Largo cimentación (m)
    Df: number;       // Profundidad de fundación (m)
    phi: number;      // Ángulo fricción interna (°)
    c: number;        // Cohesión (kPa)
    gamma: number;    // Peso unitario suelo (kN/m³)
    qu: number;       // Capacidad portante última (kPa)
    FS: number;       // Factor de seguridad
    qa: number;       // Capacidad admisible (kPa)
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsFatiga {
    D_eje: number;    // Diámetro eje/componente (mm)
    Kt: number;       // Factor concentración tensiones
    Se: number;       // Límite de fatiga corregido (MPa)
    sigma_a: number;  // Tensión alternante (MPa)
    sigma_m: number;  // Tensión media (MPa)
    N_ciclos: number; // Vida estimada (ciclos)
    material?: string;
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsDilatacion {
    D: number;        // Diámetro (mm)
    t: number;        // Espesor (mm)
    L: number;        // Longitud (m)
    dT: number;       // Delta temperatura (°C)
    alpha: number;    // Coef dilatación (mm/m·°C ×10⁻⁶)
    dL: number;       // Elongación total (mm)
    F_termico: number;// Fuerza térmica (kN)
    material?: string;
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsTaludes {
    H: number;        // Altura talud (m)
    beta: number;     // Ángulo inclinación (°)
    phi: number;      // Ángulo fricción (°)
    c: number;        // Cohesión (kPa)
    gamma: number;    // Peso unitario (kN/m³)
    Fs: number;       // Factor de seguridad Bishop
    R: number;        // Radio círculo falla (m)
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsHidrologia {
    A: number;        // Área cuenca (km²)
    CN: number;       // Curva número SCS
    Tc: number;       // Tiempo concentración (min)
    I: number;        // Intensidad lluvia (mm/h)
    Q_pico: number;   // Caudal pico (m³/s)
    L_cauce: number;  // Longitud cauce (m)
    H_cuenca: number; // Desnivel cuenca (m)
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsIntegridad {
    OD: number;       // Diámetro exterior (mm)
    t_nominal: number;// Espesor nominal (mm)
    t_real: number;   // Espesor medido (mm)
    d_defecto: number;// Profundidad defecto (mm)
    P_op: number;     // Presión operación (MPa)
    MAOP: number;     // MAOP original (MPa)
    MAOP_real: number;// MAOP con defecto (MPa)
    vida_rem: number; // Vida remanente (años)
    apto: boolean;    // Apto para operación
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsValvulas {
    DN: number;       // Diámetro nominal (mm)
    tipo: string;     // 'bt'|'bf'|'mp'|'cg'|'kn'|'gl'|'ch'|'wh'
    nombre: string;   // Nombre válvula
    clase: string;    // Clase ASME
    P_max: number;    // Presión máxima (MPa)
    P_op: number;     // Presión operación (MPa)
    norma: string;    // API 6D / ASME B16.34 / etc
    servicio?: string;
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsHardyCross {
    nodos: number;    // Número de nodos
    tuberias: number; // Número de tuberías
    Q_max: number;    // Caudal máximo (L/s)
    hf_max: number;   // Pérdida máxima (m)
    iteraciones: number; // Iteraciones convergencia
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsCanerias {
    OD: number;       // Diámetro exterior (mm)
    t: number;        // Espesor (mm)
    material: string; // API 5L X52 / A106 Gr.B / etc
    L: number;        // Longitud (m)
    codos: number;    // Número de codos
    tees: number;     // Número de tees
    red_DN: number;   // Reducciones (si aplica, DN)
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsMMO {
    equipo: string;   // Nombre equipo
    tag: string;      // Tag de planta
    tipo_mto: string; // Preventivo / Predictivo / Correctivo
    intervalo: number;// Intervalo mantenimiento (días)
    horas_op: number; // Horas de operación
    costo_mto: number;// Costo mantenimiento (USD)
    disponibilidad: number; // % disponibilidad
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsSoldadura {
    material_base: string;  // A36 / API 5L X52 / SS316 / etc
    espesor: number;        // Espesor material base (mm)
    tipo_junta: string;     // 'BW'|'FW'|'SW' (butt/fillet/socket)
    proceso: string;        // SMAW/GTAW/GMAW/SAW
    electrodo: string;      // E7018 / ER70S-6 / etc
    garganta: number;       // Garganta de soldadura (mm)
    precalentamiento: number;// Temperatura precalentamiento (°C)
    dureza_max: number;     // Dureza máxima (HV10)
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  export interface ParamsElectricidad {
    conductor: string;  // Cu / Al
    seccion: number;    // Sección (mm²)
    I_diseño: number;   // Corriente diseño (A)
    I_cortocircuito: number; // Corriente cortocircuito (kA)
    tension: number;    // Tensión (kV)
    L_circuito: number; // Longitud circuito (m)
    caida_tension: number; // Caída de tensión (%)
    num_conductores: number; // Conductores por circuito
    norma: string;      // NEC / IEC 60228 / etc
    zona_exp?: string;  // Zona ATEX/NEC si aplica
    proyecto?: string;
    ingeniero?: string;
    fecha?: string;
  }
  
  // ═══════════════════════════════════════════════════════════
  //  HELPERS INTERNOS — NO EXPORTADOS
  // ═══════════════════════════════════════════════════════════
  
  // Formatea número a 3 decimales para DXF
  function f(n: number): string {
    return n.toFixed(3);
  }
  
  // Genera cabecera DXF R12 con capas profesionales
  function _cabecera(): string {
    return [
      '  0', 'SECTION',
      '  2', 'HEADER',
      '  9', '$ACADVER',
      '  1', 'AC1009',
      '  9', '$INSUNITS',
      ' 70', '4',
      '  9', '$LTSCALE',
      ' 40', '1.0',
      '  0', 'ENDSEC',
      '  0', 'SECTION',
      '  2', 'TABLES',
      '  0', 'TABLE',
      '  2', 'LAYER',
      ' 70', '6',
      // Capa 0 — default
      '  0', 'LAYER', '  2', '0', ' 70', '0', ' 62', '7', '  6', 'CONTINUOUS',
      // Capa GEOMETRIA — cyan
      '  0', 'LAYER', '  2', 'GEOMETRIA', ' 70', '0', ' 62', '4', '  6', 'CONTINUOUS',
      // Capa COTAS — amarillo
      '  0', 'LAYER', '  2', 'COTAS', ' 70', '0', ' 62', '2', '  6', 'CONTINUOUS',
      // Capa DATOS — verde
      '  0', 'LAYER', '  2', 'DATOS', ' 70', '0', ' 62', '3', '  6', 'CONTINUOUS',
      // Capa TITULO — blanco
      '  0', 'LAYER', '  2', 'TITULO', ' 70', '0', ' 62', '7', '  6', 'CONTINUOUS',
      // Capa CENTRO — rojo punteado
      '  0', 'LAYER', '  2', 'CENTRO', ' 70', '0', ' 62', '1', '  6', 'CENTER',
      '  0', 'ENDTAB',
      '  0', 'ENDSEC',
      '  0', 'SECTION',
      '  2', 'ENTITIES',
    ].join('\n');
  }
  
  function _pie(): string {
    return ['  0', 'ENDSEC', '  0', 'EOF'].join('\n');
  }
  
  function _linea(x1: number, y1: number, x2: number, y2: number, capa = 'GEOMETRIA', color = 4): string {
    return [
      '  0', 'LINE',
      '  8', capa,
      ' 62', String(color),
      ' 10', f(x1), ' 20', f(y1), ' 30', '0.000',
      ' 11', f(x2), ' 21', f(y2), ' 31', '0.000',
    ].join('\n');
  }
  
  function _circulo(cx: number, cy: number, r: number, capa = 'GEOMETRIA', color = 4): string {
    return [
      '  0', 'CIRCLE',
      '  8', capa,
      ' 62', String(color),
      ' 10', f(cx), ' 20', f(cy), ' 30', '0.000',
      ' 40', f(r),
    ].join('\n');
  }
  
  function _arco(cx: number, cy: number, r: number, angIni: number, angFin: number, capa = 'GEOMETRIA', color = 4): string {
    return [
      '  0', 'ARC',
      '  8', capa,
      ' 62', String(color),
      ' 10', f(cx), ' 20', f(cy), ' 30', '0.000',
      ' 40', f(r),
      ' 50', f(angIni),
      ' 51', f(angFin),
    ].join('\n');
  }
  
  function _texto(x: number, y: number, h: number, texto: string, capa = 'DATOS', color = 3, rot = 0): string {
    return [
      '  0', 'TEXT',
      '  8', capa,
      ' 62', String(color),
      ' 10', f(x), ' 20', f(y), ' 30', '0.000',
      ' 40', f(h),
      '  1', texto,
      ' 50', f(rot),
    ].join('\n');
  }
  
  // Genera bloque de título estándar INGENIUM PRO
  function _bloqueTitle(
    titulo: string,
    norma: string,
    proyecto: string,
    ing: string,
    fecha: string,
    x0 = 0, y0 = -60
  ): string {
    const fechaFinal = fecha || new Date().toLocaleDateString('es-AR');
    const ingFinal = ing || 'INGENIUM PRO';
    const proyFinal = proyecto || 'SIN NOMBRE';
    const lines: string[] = [];
    // Borde del cartel
    lines.push(_linea(x0, y0, x0 + 260, y0, 'TITULO', 7));
    lines.push(_linea(x0 + 260, y0, x0 + 260, y0 - 50, 'TITULO', 7));
    lines.push(_linea(x0 + 260, y0 - 50, x0, y0 - 50, 'TITULO', 7));
    lines.push(_linea(x0, y0 - 50, x0, y0, 'TITULO', 7));
    // Divisores
    lines.push(_linea(x0, y0 - 12, x0 + 260, y0 - 12, 'TITULO', 7));
    lines.push(_linea(x0, y0 - 24, x0 + 260, y0 - 24, 'TITULO', 7));
    lines.push(_linea(x0, y0 - 36, x0 + 260, y0 - 36, 'TITULO', 7));
    lines.push(_linea(x0 + 130, y0 - 24, x0 + 130, y0 - 50, 'TITULO', 7));
    // Textos
    lines.push(_texto(x0 + 5, y0 - 9, 5, 'INGENIUM PRO v8 — RADAR © 2026', 'TITULO', 7));
    lines.push(_texto(x0 + 5, y0 - 21, 4.5, titulo, 'TITULO', 2));
    lines.push(_texto(x0 + 5, y0 - 33, 3.5, 'NORMA: ' + norma, 'TITULO', 3));
    lines.push(_texto(x0 + 5, y0 - 45, 3, 'PROYECTO: ' + proyFinal.substring(0, 35), 'TITULO', 7));
    lines.push(_texto(x0 + 135, y0 - 30, 3.5, 'ING: ' + ingFinal.substring(0, 22), 'TITULO', 7));
    lines.push(_texto(x0 + 135, y0 - 45, 3, 'FECHA: ' + fechaFinal, 'TITULO', 7));
    return lines.join('\n');
  }
  
  // Flecha de cota horizontal
  function _cotaHoriz(x1: number, y1: number, x2: number, y2: number, texto: string, yOffset = 15): string {
    const lines: string[] = [];
    const yRef = Math.max(y1, y2);
    const yc = yRef + yOffset;
    lines.push(_linea(x1, y1, x1, yc + 2, 'COTAS', 2));
    lines.push(_linea(x2, y2, x2, yc + 2, 'COTAS', 2));
    lines.push(_linea(x1, yc, x2, yc, 'COTAS', 2));
    lines.push(_texto((x1 + x2) / 2 - texto.length, yc + 2, 3.5, texto, 'COTAS', 2));
    return lines.join('\n');
  }
  
  // Flecha de cota vertical
  function _cotaVert(x: number, y1: number, y2: number, texto: string, xOffset = 15): string {
    const lines: string[] = [];
    const xc = x + xOffset;
    lines.push(_linea(x, y1, xc + 2, y1, 'COTAS', 2));
    lines.push(_linea(x, y2, xc + 2, y2, 'COTAS', 2));
    lines.push(_linea(xc, y1, xc, y2, 'COTAS', 2));
    lines.push(_texto(xc + 3, (y1 + y2) / 2, 3.5, texto, 'COTAS', 2, 90));
    return lines.join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  FUNCIÓN PÚBLICA: DESCARGA DEL ARCHIVO DXF
  // ═══════════════════════════════════════════════════════════
  
  /**
  * Dispara la descarga del archivo DXF en el navegador.
  * @param contenido  String DXF completo generado por cualquier exportarDXF*
  * @param nombre     Nombre del archivo sin extensión (se agrega .dxf automático)
  */
  export function descargarDXF(contenido: string, nombre: string): void {
    const blob = new Blob([contenido], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre.endsWith('.dxf') ? nombre : nombre + '.dxf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 1 — TUBERÍAS (ASME B31.8 / API 5L)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFTuberias(p: ParamsTuberias): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
    const scale = 0.5; // mm → unidades DXF
  
    // Sección transversal (círculos)
    const cx = 60, cy = 60;
    const rOut = (p.OD / 2) * scale;
    const rIn = ((p.OD / 2) - p.t) * scale;
  
    ents.push(_circulo(cx, cy, rOut, 'GEOMETRIA', 4));
    ents.push(_circulo(cx, cy, rIn, 'GEOMETRIA', 3));
    // Eje de simetría
    ents.push(_linea(cx - rOut - 10, cy, cx + rOut + 10, cy, 'CENTRO', 1));
    ents.push(_linea(cx, cy - rOut - 10, cx, cy + rOut + 10, 'CENTRO', 1));
  
    // Cotas
    ents.push(_cotaHoriz(cx - rOut, cy + rOut + 5, cx + rOut, cy + rOut + 5, `OD = ${p.OD} mm`, 10));
    ents.push(_cotaHoriz(cx - rIn, cy - rOut - 5, cx + rIn, cy - rOut - 5, `ID = ${(p.OD - 2 * p.t).toFixed(1)} mm`, -15));
  
    // Indicador de espesor
    ents.push(_linea(cx + rIn, cy, cx + rOut, cy, 'COTAS', 2));
    ents.push(_texto(cx + rIn + 2, cy + 2, 3.5, `t=${p.t}mm`, 'COTAS', 2));
  
    // Perfil longitudinal simplificado
    const lx0 = 140, ly = 60, lScale = Math.min(150 / p.L, 0.5);
    const lLen = p.L * lScale;
    const rDraw = Math.min(rOut, 20);
    // Paredes
    ents.push(_linea(lx0, ly + rDraw, lx0 + lLen, ly + rDraw, 'GEOMETRIA', 4));
    ents.push(_linea(lx0, ly - rDraw, lx0 + lLen, ly - rDraw, 'GEOMETRIA', 4));
    // Tapas
    ents.push(_linea(lx0, ly - rDraw, lx0, ly + rDraw, 'GEOMETRIA', 4));
    ents.push(_linea(lx0 + lLen, ly - rDraw, lx0 + lLen, ly + rDraw, 'GEOMETRIA', 4));
    // Eje
    ents.push(_linea(lx0, ly, lx0 + lLen, ly, 'CENTRO', 1));
    // Cota longitud
    ents.push(_cotaHoriz(lx0, ly + rDraw + 3, lx0 + lLen, ly + rDraw + 3, `L = ${p.L} m`, 10));
  
    // Bloque de datos
    const dx = 0, dy = 20;
    const datos = [
      `MODULO: TUBERIAS — ASME B31.8 §841.11 / API 5L`,
      `OD = ${p.OD} mm | t = ${p.t} mm | ID = ${(p.OD - 2 * p.t).toFixed(1)} mm`,
      `t/OD = ${((p.t / p.OD) * 100).toFixed(2)}% | L = ${p.L} m`,
      `SMYS = ${p.SMYS} MPa | Material: API 5L`,
      `MAOP = ${p.MAOP} MPa = ${(p.MAOP * 10).toFixed(1)} bar = ${(p.MAOP * 145).toFixed(0)} psi`,
      p.P_op ? `P operacion = ${p.P_op} MPa | Factor uso = ${((p.P_op / p.MAOP) * 100).toFixed(1)}%` : '',
      `Prueba hidrostatica = ${(p.MAOP * 1.5).toFixed(2)} MPa`,
    ].filter(Boolean);
  
    datos.forEach((d, i) => {
      ents.push(_texto(dx, dy - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : 3));
    });
  
    ents.push(_bloqueTitle('TUBERIA — SECCION TRANSVERSAL Y LONGITUDINAL', 'ASME B31.8 §841.11 / API 5L',
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 2 — HIDRÁULICA (DARCY-WEISBACH)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFHidraulica(p: ParamsHidraulica): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Tubería longitudinal
    const x0 = 20, x1 = 240, y_top = 80, y_bot = 60, yc = 70;
    ents.push(_linea(x0, y_top, x1, y_top, 'GEOMETRIA', 4));
    ents.push(_linea(x0, y_bot, x1, y_bot, 'GEOMETRIA', 4));
    ents.push(_linea(x0, y_bot, x0, y_top, 'GEOMETRIA', 4));
    ents.push(_linea(x1, y_bot, x1, y_top, 'GEOMETRIA', 4));
    // Eje
    ents.push(_linea(x0, yc, x1, yc, 'CENTRO', 1));
  
    // Flechas de flujo (3 flechas equidistantes)
    const step = (x1 - x0) / 4;
    for (let i = 1; i <= 3; i++) {
      const fx = x0 + step * i;
      ents.push(_linea(fx - 8, yc, fx + 8, yc, 'DATOS', 2));
      ents.push(_linea(fx + 8, yc, fx + 4, yc + 3, 'DATOS', 2));
      ents.push(_linea(fx + 8, yc, fx + 4, yc - 3, 'DATOS', 2));
    }
  
    // Gradiente piezométrico (línea inclinada sobre la tubería)
    const hfScale = Math.min(p.hf * 2, 30);
    ents.push(_linea(x0, y_top + 20, x1, y_top + 20 - hfScale, 'COTAS', 2));
    ents.push(_texto(x0 + 5, y_top + 22, 3, 'LINEA DE ENERGIA', 'COTAS', 2));
    ents.push(_linea(x1, y_top + 20 - hfScale, x1, y_top, 'COTAS', 2));
    ents.push(_texto(x1 + 3, y_top + 10 - hfScale / 2, 3.5, `hf=${p.hf.toFixed(3)}m`, 'COTAS', 2));
  
    // Cota diámetro
    const D_draw = (y_top - y_bot);
    ents.push(_texto(x0 - 18, yc, 3.5, `D=${p.D}mm`, 'COTAS', 2));
  
    // Cota longitud
    ents.push(_cotaHoriz(x0, y_bot - 5, x1, y_bot - 5, `L = ${p.L} m`, -12));
  
    // Bloque de datos
    const datos = [
      'MODULO: HIDRAULICA — DARCY-WEISBACH',
      `D interno = ${p.D} mm | L = ${p.L} m`,
      `Q = ${p.Q.toFixed(3)} L/s = ${(p.Q / 1000).toFixed(5)} m³/s`,
      `V = ${p.V.toFixed(3)} m/s | Re = ${p.Re.toFixed(0)}`,
      `f Darcy = ${p.f.toFixed(6)}`,
      `hf = ${p.hf.toFixed(3)} m | dP = ${(998 * 9.81 * p.hf / 1000).toFixed(2)} kPa`,
      p.Re < 2300 ? 'Regimen: LAMINAR' : p.Re < 4000 ? 'Regimen: TRANSICION' : 'Regimen: TURBULENTO',
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : 3));
    });
  
    ents.push(_bloqueTitle('HIDRAULICA — DARCY-WEISBACH / PERFIL PIEZOMETRICO', 'Darcy-Weisbach / Colebrook-White',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 3 — GOLPE DE ARIETE (JOUKOWSKY)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFGolpeAriete(p: ParamsGolpeAriete): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Tubería
    const x0 = 20, x1 = 220, yc = 70, r = 10;
    ents.push(_linea(x0, yc + r, x1, yc + r, 'GEOMETRIA', 4));
    ents.push(_linea(x0, yc - r, x1, yc - r, 'GEOMETRIA', 4));
    ents.push(_linea(x0, yc - r, x0, yc + r, 'GEOMETRIA', 4));
  
    // Válvula al final (símbolo ISA: dos triángulos opuestos)
    const vx = x1;
    ents.push(_linea(vx, yc - r - 5, vx, yc + r + 5, 'GEOMETRIA', 1));
    ents.push(_linea(vx - 8, yc - 8, vx, yc, 'GEOMETRIA', 1));
    ents.push(_linea(vx + 8, yc - 8, vx, yc, 'GEOMETRIA', 1));
    ents.push(_linea(vx - 8, yc + 8, vx, yc, 'GEOMETRIA', 1));
    ents.push(_linea(vx + 8, yc + 8, vx, yc, 'GEOMETRIA', 1));
    ents.push(_texto(vx - 4, yc + r + 8, 3.5, 'VALVULA', 'COTAS', 1));
  
    // Onda de presión (frente de onda moviéndose hacia la izquierda)
    const wx = (x0 + x1) / 2;
    ents.push(_linea(wx, yc - r, wx, yc + r, 'DATOS', 2));
    ents.push(_texto(wx - 10, yc + r + 3, 3, '← ONDA PRESION', 'DATOS', 2));
    ents.push(_texto(wx - 5, yc - r - 6, 3, `a = ${p.a.toFixed(0)} m/s`, 'DATOS', 3));
  
    // Cota longitud
    ents.push(_cotaHoriz(x0, yc + r + 5, x1, yc + r + 5, `L = ${p.L} m`, 12));
  
    // Diagrama P-t esquemático
    const px0 = 0, py0 = 45, pW = 100, pH = 25;
    ents.push(_texto(px0, py0 + 3, 3.5, 'DIAGRAMA P-t (ESQUEMA)', 'COTAS', 2));
    ents.push(_linea(px0, py0, px0 + pW, py0, 'COTAS', 2)); // eje t
    ents.push(_linea(px0, py0, px0, py0 - pH, 'COTAS', 2)); // eje P
    ents.push(_texto(px0 + pW + 2, py0 - 2, 3, 't (s)', 'COTAS', 2));
    ents.push(_texto(px0 - 3, py0 - pH - 3, 3, 'P', 'COTAS', 2));
    // Forma de onda cuadrada
    const tc_draw = Math.min(p.Tc * 8, pW * 0.4);
    const dP_draw = Math.min(p.dP * 5, pH * 0.9);
    ents.push(_linea(px0, py0, px0, py0 - dP_draw, 'DATOS', 2));
    ents.push(_linea(px0, py0 - dP_draw, px0 + tc_draw, py0 - dP_draw, 'DATOS', 2));
    ents.push(_linea(px0 + tc_draw, py0 - dP_draw, px0 + tc_draw, py0, 'DATOS', 2));
    ents.push(_texto(px0 + tc_draw / 2 - 5, py0 + 2, 3, `Tc=${p.Tc.toFixed(1)}s`, 'COTAS', 2));
    ents.push(_texto(px0 + pW * 0.5, py0 - dP_draw / 2, 3, `ΔP=${p.dP.toFixed(2)}MPa`, 'DATOS', 2));
  
    // Datos
    const datos = [
      'MODULO: GOLPE DE ARIETE — JOUKOWSKY',
      `D = ${p.D} mm | t = ${p.t} mm | L = ${p.L} m`,
      `V0 = ${p.V0.toFixed(3)} m/s | Celeridad a = ${p.a.toFixed(1)} m/s`,
      `ΔP Joukowsky = ρ·a·ΔV = ${p.dP.toFixed(3)} MPa = ${(p.dP * 10).toFixed(2)} bar`,
      `Tiempo critico Tc = 2L/a = ${p.Tc.toFixed(2)} s`,
      `MAOP = ${p.MAOP} MPa | P maxima = ${(p.MAOP + p.dP).toFixed(3)} MPa`,
      `ESTADO: ${(p.MAOP + p.dP) <= p.MAOP * 1.1 ? '✓ SEGURO' : '⚠ REVISAR — Supera MAOP+10%'}`,
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : (i === 6 ? 1 : 3)));
    });
  
    ents.push(_bloqueTitle('GOLPE DE ARIETE — JOUKOWSKY / DIAGRAMA ONDA PRESION', 'AWWA M11 / ASME B31.1',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 4 — GEOTECNIA (MEYERHOF / TERZAGHI)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFGeotecnia(p: ParamsGeotecnia): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    const x0 = 30, yNivel = 80;
  
    // Nivel de terreno
    ents.push(_linea(x0 - 20, yNivel, x0 + 200, yNivel, 'GEOMETRIA', 3));
    // Excavación
    const escala = Math.min(50 / p.Df, 15);
    const Df_d = p.Df * escala;
    const B_d = Math.min(p.B * escala, 80);
    ents.push(_linea(x0, yNivel, x0, yNivel - Df_d, 'GEOMETRIA', 4));
    ents.push(_linea(x0 + B_d, yNivel, x0 + B_d, yNivel - Df_d, 'GEOMETRIA', 4));
    // Cimentación
    const cH = 8;
    ents.push(_linea(x0 - 10, yNivel - Df_d, x0 + B_d + 10, yNivel - Df_d, 'GEOMETRIA', 4));
    ents.push(_linea(x0 - 10, yNivel - Df_d - cH, x0 + B_d + 10, yNivel - Df_d - cH, 'GEOMETRIA', 4));
    ents.push(_linea(x0 - 10, yNivel - Df_d, x0 - 10, yNivel - Df_d - cH, 'GEOMETRIA', 4));
    ents.push(_linea(x0 + B_d + 10, yNivel - Df_d, x0 + B_d + 10, yNivel - Df_d - cH, 'GEOMETRIA', 4));
    // Relleno diagonal en cimentación
    for (let i = 0; i < 5; i++) {
      const xi = x0 - 10 + (B_d + 20) * i / 5;
      ents.push(_linea(xi, yNivel - Df_d, xi + 10, yNivel - Df_d - cH, 'GEOMETRIA', 7));
    }
  
    // Zonas de influencia (líneas de rotura)
    ents.push(_arco(x0, yNivel - Df_d - cH, B_d * 1.2, 200, 340, 'COTAS', 2));
    ents.push(_arco(x0 + B_d, yNivel - Df_d - cH, B_d * 1.2, 200, 340, 'COTAS', 2));
  
    // Cotas
    ents.push(_cotaVert(x0 - 20, yNivel, yNivel - Df_d, `Df=${p.Df}m`, -10));
    ents.push(_cotaHoriz(x0, yNivel - Df_d - cH - 12, x0 + B_d, yNivel - Df_d - cH - 12, `B=${p.B}m`, -8));
  
    // Datos
    const datos = [
      'MODULO: GEOTECNIA — MEYERHOF / TERZAGHI',
      `Cimentacion: B = ${p.B} m | L = ${p.L_cim} m | Df = ${p.Df} m`,
      `phi = ${p.phi}° | c = ${p.c} kPa | gamma = ${p.gamma} kN/m³`,
      `qu (ultima) = ${p.qu.toFixed(1)} kPa`,
      `FS = ${p.FS.toFixed(2)} | qa (admisible) = ${p.qa.toFixed(1)} kPa`,
      `qa = ${p.qa.toFixed(1)} kPa = ${(p.qa / 9.81).toFixed(1)} kg/cm²`,
      `ESTADO: ${p.FS >= 3 ? '✓ FS≥3 ADECUADO' : p.FS >= 2 ? '⚠ FS<3 REVISAR' : '✗ FS<2 NO APTO'}`,
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : (i === 6 ? (p.FS >= 3 ? 3 : 1) : 3)));
    });
  
    ents.push(_bloqueTitle('GEOTECNIA — CAPACIDAD PORTANTE / CIMENTACION', 'CIRSOC 421 / ACI 336 / Meyerhof',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 5 — FATIGA (ASME SECCION VIII / MORROW)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFFatiga(p: ParamsFatiga): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Sección circular del componente
    const cx = 60, cy = 70;
    const r = Math.min((p.D_eje / 2) * 0.5, 35);
    ents.push(_circulo(cx, cy, r, 'GEOMETRIA', 4));
    // Zona de concentración de tensiones (entalla)
    ents.push(_arco(cx + r - 5, cy, 8, 60, 300, 'COTAS', 1));
    ents.push(_texto(cx + r + 5, cy + 5, 3.5, `Kt = ${p.Kt}`, 'COTAS', 1));
  
    // Ejes
    ents.push(_linea(cx - r - 12, cy, cx + r + 12, cy, 'CENTRO', 1));
    ents.push(_linea(cx, cy - r - 12, cx, cy + r + 12, 'CENTRO', 1));
    // Cota D
    ents.push(_cotaHoriz(cx - r, cy + r + 5, cx + r, cy + r + 5, `D = ${p.D_eje} mm`, 10));
  
    // Diagrama de Goodman simplificado
    const gx0 = 140, gy0 = 100, gW = 100, gH = 60;
    ents.push(_linea(gx0, gy0, gx0 + gW, gy0, 'COTAS', 2));
    ents.push(_linea(gx0, gy0, gx0, gy0 - gH, 'COTAS', 2));
    ents.push(_linea(gx0, gy0 - gH, gx0 + gW, gy0, 'COTAS', 2)); // Línea Goodman
    ents.push(_texto(gx0 + 2, gy0 - gH - 3, 3, `Se = ${p.Se.toFixed(0)} MPa`, 'DATOS', 3));
    ents.push(_texto(gx0 + gW - 10, gy0 + 3, 3, 'Su', 'DATOS', 3));
    // Punto de operación
    const sx = gx0 + (p.sigma_m / (p.Se * 2)) * gW;
    const sy = gy0 - (p.sigma_a / p.Se) * gH;
    ents.push(_circulo(sx, sy, 3, 'DATOS', 1));
    ents.push(_texto(sx + 4, sy, 3, `(σm=${p.sigma_m.toFixed(0)},σa=${p.sigma_a.toFixed(0)})`, 'DATOS', 1));
    ents.push(_texto(gx0, gy0 - gH / 2 - 3, 3, 'DIAGRAMA GOODMAN', 'COTAS', 2));
  
    // Datos
    const datos = [
      `MODULO: FATIGA — ASME Sec.VIII / MORROW`,
      `Material: ${p.material || 'Acero estructural'} | D = ${p.D_eje} mm`,
      `Kt = ${p.Kt} (concentracion de tensiones)`,
      `Se corregido = ${p.Se.toFixed(1)} MPa`,
      `sigma_a = ${p.sigma_a.toFixed(1)} MPa | sigma_m = ${p.sigma_m.toFixed(1)} MPa`,
      `Vida estimada N = ${p.N_ciclos.toExponential(2)} ciclos`,
      `ESTADO: ${p.sigma_a <= p.Se ? '✓ VIDA INFINITA' : '⚠ VIDA FINITA — REVISAR'}`,
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : (i === 6 ? 3 : 3)));
    });
  
    ents.push(_bloqueTitle('FATIGA — DIAGRAMA GOODMAN / VIDA UTIL', 'ASME Sec.VIII Div.2 / ASME B31.3 App.W',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 6 — DILATACIÓN TÉRMICA (ASME B31.3)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFDilatacion(p: ParamsDilatacion): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Tramo recto de tubería
    const x0 = 20, x1 = 160, yc = 70, r = 8;
    ents.push(_linea(x0, yc + r, x1, yc + r, 'GEOMETRIA', 4));
    ents.push(_linea(x0, yc - r, x1, yc - r, 'GEOMETRIA', 4));
    ents.push(_linea(x0, yc - r, x0, yc + r, 'GEOMETRIA', 4)); // Anclaje izq
    // Flecha de expansión
    const dL_draw = Math.min(p.dL * 0.3, 30);
    ents.push(_linea(x1, yc, x1 + dL_draw, yc, 'DATOS', 1));
    ents.push(_linea(x1 + dL_draw, yc, x1 + dL_draw - 5, yc + 4, 'DATOS', 1));
    ents.push(_linea(x1 + dL_draw, yc, x1 + dL_draw - 5, yc - 4, 'DATOS', 1));
    ents.push(_texto(x1 + 2, yc + 5, 3.5, `ΔL = ${p.dL.toFixed(1)} mm`, 'DATOS', 1));
  
    // Lira de expansión (loop)
    const lx = (x0 + x1) / 2, ly = yc;
    const lH = 30, lW = 30;
    ents.push(_linea(lx - lW / 2, ly + r, lx - lW / 2, ly + r + lH, 'GEOMETRIA', 3));
    ents.push(_linea(lx - lW / 2, ly + r + lH, lx + lW / 2, ly + r + lH, 'GEOMETRIA', 3));
    ents.push(_linea(lx + lW / 2, ly + r + lH, lx + lW / 2, ly + r, 'GEOMETRIA', 3));
    ents.push(_texto(lx - 12, ly + r + lH + 5, 3.5, 'LIRA EXPANSION', 'COTAS', 3));
  
    // Ancla y guía izq
    for (let i = 0; i < 4; i++) {
      ents.push(_linea(x0 - 8, yc - r + i * 4, x0, yc - r + i * 4, 'GEOMETRIA', 7));
    }
    // Cota longitud
    ents.push(_cotaHoriz(x0, yc + r + 5, x1, yc + r + 5, `L = ${p.L} m`, 12));
  
    // Datos
    const datos = [
      'MODULO: DILATACION TERMICA — ASME B31.3',
      `Material: ${p.material || 'Acero carbon'} | D = ${p.D} mm | t = ${p.t} mm`,
      `L = ${p.L} m | ΔT = ${p.dT} °C`,
      `α = ${p.alpha} ×10⁻⁶ mm/(mm·°C)`,
      `ΔL = α × L × ΔT = ${p.dL.toFixed(2)} mm`,
      `Fuerza termica = ${p.F_termico.toFixed(1)} kN`,
      `Requerida: lira / compensador / punto de anclaje`,
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : 3));
    });
  
    ents.push(_bloqueTitle('DILATACION TERMICA — EXPANSION / LIRA / ANCLAJE', 'ASME B31.3 §319 / EN 13480',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 7 — ESTABILIDAD TALUDES (BISHOP SIMPLIFICADO)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFTaludes(p: ParamsTaludes): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    const x0 = 20, yBase = 40, escH = Math.min(40 / p.H, 10);
    const H_d = p.H * escH;
    const betaRad = p.beta * Math.PI / 180;
    const L_horiz = H_d / Math.tan(betaRad);
  
    // Perfil del talud
    ents.push(_linea(x0, yBase + H_d, x0 + L_horiz * 2, yBase + H_d, 'GEOMETRIA', 3)); // Base
    ents.push(_linea(x0, yBase + H_d, x0, yBase, 'GEOMETRIA', 4)); // Cara vertical ref
    ents.push(_linea(x0, yBase, x0 + L_horiz, yBase + H_d, 'GEOMETRIA', 4)); // Talud
    ents.push(_linea(x0 + L_horiz, yBase + H_d, x0 + L_horiz + 60, yBase + H_d, 'GEOMETRIA', 3)); // Berma
    // Sombra talud
    for (let i = 0; i <= 5; i++) {
      const yi = yBase + H_d * i / 5;
      const xi = x0 + L_horiz * i / 5;
      ents.push(_linea(x0, yi, xi, yBase + H_d, 'GEOMETRIA', 7));
    }
  
    // Círculo de falla (Bishop)
    const R_d = Math.min(p.R * escH, 80);
    const ccx = x0 + L_horiz * 0.6;
    const ccy = yBase + H_d - R_d * 0.3;
    ents.push(_arco(ccx, ccy, R_d, 200, 350, 'COTAS', 1));
    ents.push(_texto(ccx - 5, ccy + 3, 3.5, `R=${p.R.toFixed(0)}m`, 'COTAS', 1));
  
    // Cota H
    ents.push(_cotaVert(x0 - 5, yBase, yBase + H_d, `H=${p.H}m`, -12));
    // Ángulo
    ents.push(_texto(x0 + 5, yBase + H_d - 8, 3.5, `β=${p.beta}°`, 'COTAS', 2));
  
    // Datos
    const datos = [
      'MODULO: TALUDES — BISHOP SIMPLIFICADO',
      `H = ${p.H} m | β = ${p.beta}° | R = ${p.R.toFixed(1)} m`,
      `phi = ${p.phi}° | c = ${p.c} kPa | γ = ${p.gamma} kN/m³`,
      `Fs (Bishop) = ${p.Fs.toFixed(3)}`,
      `Fs ≥ 1.5 (est. permanente) | Fs ≥ 1.3 (sismo)`,
      `ESTADO: ${p.Fs >= 1.5 ? '✓ ESTABLE' : p.Fs >= 1.3 ? '⚠ CONDICION SISMICA OK / ESTATICA REVISAR' : '✗ INESTABLE'}`,
      'Norma: USACE EM 1110-2-1902 / CIRSOC',
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(150, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : (i === 5 ? (p.Fs >= 1.5 ? 3 : 1) : 3)));
    });
  
    ents.push(_bloqueTitle('TALUD — ESTABILIDAD BISHOP SIMPLIFICADO / CIRCULO DE FALLA', 'USACE EM 1110-2-1902 / CIRSOC 421',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 8 — HIDROLOGÍA (MÉTODO RACIONAL SCS-CN)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFHidrologia(p: ParamsHidrologia): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Cuenca hidrográfica (contorno irregular)
    const cx = 130, cy = 80, rx = 90, ry = 55;
    // Elipse aproximada con líneas
    const pts: [number, number][] = [];
    for (let a = 0; a <= 360; a += 30) {
      const ar = a * Math.PI / 180;
      pts.push([cx + rx * Math.cos(ar), cy + ry * Math.sin(ar)]);
    }
    for (let i = 0; i < pts.length - 1; i++) {
      ents.push(_linea(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 'GEOMETRIA', 3));
    }
  
    // Cauce principal
    ents.push(_linea(cx - rx * 0.8, cy + ry * 0.3, cx - rx * 0.3, cy, 'GEOMETRIA', 4));
    ents.push(_linea(cx - rx * 0.3, cy, cx + rx * 0.2, cy - ry * 0.2, 'GEOMETRIA', 4));
    ents.push(_linea(cx + rx * 0.2, cy - ry * 0.2, cx + rx * 0.7, cy + ry * 0.5, 'GEOMETRIA', 4));
  
    // Cota área
    ents.push(_texto(cx - 20, cy, 4, `A = ${p.A} km²`, 'DATOS', 2));
    ents.push(_texto(cx - 20, cy + 10, 4, `CN = ${p.CN}`, 'DATOS', 3));
    ents.push(_texto(cx - 20, cy + 20, 4, `Tc = ${p.Tc.toFixed(1)} min`, 'DATOS', 3));
  
    // Punto de cierre (outlet)
    const ox = cx + rx * 0.7, oy = cy + ry * 0.5;
    ents.push(_circulo(ox, oy, 5, 'DATOS', 1));
    ents.push(_texto(ox + 6, oy, 3.5, 'CIERRE', 'DATOS', 1));
  
    // Diagrama unitario simplificado
    const ux0 = 20, uy0 = 30, uW = 80, uH = 25;
    ents.push(_linea(ux0, uy0, ux0 + uW, uy0, 'COTAS', 2));
    ents.push(_linea(ux0, uy0, ux0, uy0 - uH, 'COTAS', 2));
    ents.push(_texto(ux0 + 2, uy0 - uH - 3, 3, `Qp = ${p.Q_pico.toFixed(2)} m³/s`, 'DATOS', 2));
    // Triangulo hidrograma
    const Tc_d = Math.min(p.Tc * uW / 120, uW * 0.4);
    ents.push(_linea(ux0, uy0, ux0 + Tc_d, uy0 - uH, 'DATOS', 2));
    ents.push(_linea(ux0 + Tc_d, uy0 - uH, ux0 + uW, uy0, 'DATOS', 2));
    ents.push(_texto(ux0, uy0 + 2, 3, 'HIDROGRAMA TRIANGULAR', 'COTAS', 2));
  
    // Datos
    const datos = [
      'MODULO: HIDROLOGIA — METODO RACIONAL / SCS-CN',
      `Area cuenca A = ${p.A} km² | CN = ${p.CN}`,
      `L cauce = ${p.L_cauce} m | ΔH = ${p.H_cuenca} m`,
      `Tc (Kirpich) = ${p.Tc.toFixed(2)} min`,
      `I diseño = ${p.I.toFixed(1)} mm/h`,
      `Q pico = C·I·A = ${p.Q_pico.toFixed(3)} m³/s`,
      `Norma: USDA SCS TR-55 / Kirpich / Metodo Racional`,
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : 3));
    });
  
    ents.push(_bloqueTitle('HIDROLOGIA — CUENCA / HIDROGRAMA / CAUDAL PICO', 'USDA SCS TR-55 / USACE HEC-HMS / Kirpich',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 9 — INTEGRIDAD DE DUCTOS (API 579 / B31G)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFIntegridad(p: ParamsIntegridad): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
    const scale = 0.8;
  
    // Sección transversal pared de tubería
    const cx = 70, cy = 70;
    const rOut = (p.OD / 2) * scale * 0.4;
    const rNom = ((p.OD / 2) - p.t_nominal) * scale * 0.4;
    const rReal = ((p.OD / 2) - p.t_real) * scale * 0.4;
  
    // Pared exterior
    ents.push(_circulo(cx, cy, rOut, 'GEOMETRIA', 4));
    // Pared nominal (referencia)
    ents.push(_circulo(cx, cy, rNom, 'COTAS', 2));
    // Pared real medida
    ents.push(_circulo(cx, cy, rReal, 'GEOMETRIA', 3));
  
    // Defecto (zona de corrosión)
    const defAngle = 45;
    const defRad = defAngle * Math.PI / 180;
    const dxp = cx + rOut * Math.cos(defRad);
    const dyp = cy + rOut * Math.sin(defRad);
    const d_d = p.d_defecto * scale * 0.4;
    ents.push(_circulo(dxp, dyp, d_d + 2, 'DATOS', 1));
    ents.push(_texto(dxp + 5, dyp, 3.5, `def=${p.d_defecto}mm`, 'DATOS', 1));
  
    // Eje
    ents.push(_linea(cx - rOut - 10, cy, cx + rOut + 10, cy, 'CENTRO', 1));
    ents.push(_linea(cx, cy - rOut - 10, cx, cy + rOut + 10, 'CENTRO', 1));
  
    // Leyenda
    ents.push(_linea(155, 85, 175, 85, 'GEOMETRIA', 4));
    ents.push(_texto(177, 84, 3, 'OD nominal', 'DATOS', 4));
    ents.push(_linea(155, 78, 175, 78, 'COTAS', 2));
    ents.push(_texto(177, 77, 3, 't nominal (ref)', 'DATOS', 2));
    ents.push(_linea(155, 71, 175, 71, 'GEOMETRIA', 3));
    ents.push(_texto(177, 70, 3, 't real medido', 'DATOS', 3));
  
    // Datos
    const datos = [
      'MODULO: INTEGRIDAD DUCTOS — API 579 / ASME B31G',
      `OD = ${p.OD} mm | t nominal = ${p.t_nominal} mm | t medido = ${p.t_real} mm`,
      `Perdida espesor = ${(p.t_nominal - p.t_real).toFixed(2)} mm (${(((p.t_nominal - p.t_real) / p.t_nominal) * 100).toFixed(1)}%)`,
      `Profundidad defecto = ${p.d_defecto} mm`,
      `P operacion = ${p.P_op} MPa | MAOP original = ${p.MAOP} MPa`,
      `MAOP con defecto = ${p.MAOP_real.toFixed(3)} MPa | Vida rem = ${p.vida_rem.toFixed(1)} años`,
      `ESTADO: ${p.apto ? '✓ APTO PARA OPERACION' : '✗ FUERA DE SERVICIO — REPARAR'}`,
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : (i === 6 ? (p.apto ? 3 : 1) : 3)));
    });
  
    ents.push(_bloqueTitle('INTEGRIDAD — CORROSION / DEFECTO / API 579', 'API 579-1/ASME FFS-1 / ASME B31G',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 10 — VÁLVULAS (API 6D / API 6A / ASME B16.34)
  //  BASE VERIFICADA — Lógica equivalente a ModuloValvulas.tsx
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFValvulas(p: ParamsValvulas): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Tubería de entrada y salida
    const cx = 130, cy = 75, r = Math.min(p.DN * 0.12, 18);
    ents.push(_linea(cx - 60, cy + r, cx - 20, cy + r, 'GEOMETRIA', 4));
    ents.push(_linea(cx - 60, cy - r, cx - 20, cy - r, 'GEOMETRIA', 4));
    ents.push(_linea(cx + 20, cy + r, cx + 60, cy + r, 'GEOMETRIA', 4));
    ents.push(_linea(cx + 20, cy - r, cx + 60, cy - r, 'GEOMETRIA', 4));
  
    // Cuerpo de válvula — símbolo según tipo
    if (p.tipo === 'bt' || p.tipo === 'bf') {
      // Válvula de bola — ISA 5.1
      ents.push(_circulo(cx, cy, r + 8, 'GEOMETRIA', 4));
      ents.push(_circulo(cx, cy, r * 0.6, 'GEOMETRIA', 7)); // bola
      ents.push(_linea(cx, cy + r + 8, cx, cy + r + 20, 'GEOMETRIA', 7)); // vástago
      ents.push(_linea(cx - 8, cy + r + 20, cx + 8, cy + r + 20, 'GEOMETRIA', 7)); // volante
    } else if (p.tipo === 'mp') {
      // Mariposa
      ents.push(_circulo(cx, cy, r + 6, 'GEOMETRIA', 4));
      ents.push(_linea(cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7, 'GEOMETRIA', 7));
      ents.push(_linea(cx, cy + r + 6, cx, cy + r + 20, 'GEOMETRIA', 7));
      ents.push(_linea(cx - 8, cy + r + 20, cx + 8, cy + r + 20, 'GEOMETRIA', 7));
    } else if (p.tipo === 'cg' || p.tipo === 'kn') {
      // Compuerta / cuchilla
      ents.push(_linea(cx - r - 6, cy - r - 6, cx + r + 6, cy - r - 6, 'GEOMETRIA', 4));
      ents.push(_linea(cx - r - 6, cy + r + 6, cx + r + 6, cy + r + 6, 'GEOMETRIA', 4));
      ents.push(_linea(cx - r - 6, cy - r - 6, cx - r - 6, cy + r + 6, 'GEOMETRIA', 4));
      ents.push(_linea(cx + r + 6, cy - r - 6, cx + r + 6, cy + r + 6, 'GEOMETRIA', 4));
      ents.push(_linea(cx, cy - r, cx, cy + r, 'GEOMETRIA', 7)); // cuña/cuchilla
      ents.push(_linea(cx, cy + r + 6, cx, cy + r + 22, 'GEOMETRIA', 7));
      ents.push(_circulo(cx, cy + r + 22, 5, 'GEOMETRIA', 7)); // actuador
    } else if (p.tipo === 'gl') {
      // Globo / control
      ents.push(_circulo(cx, cy, r + 10, 'GEOMETRIA', 4));
      ents.push(_linea(cx - r, cy, cx + r, cy, 'GEOMETRIA', 7)); // asiento
      ents.push(_linea(cx, cy - 3, cx, cy + r + 10 + 15, 'GEOMETRIA', 7)); // vástago
      ents.push(_circulo(cx, cy + r + 10 + 15, 5, 'GEOMETRIA', 7)); // actuador
    } else if (p.tipo === 'ch') {
      // Retención (check wafer) — mariposa unidireccional
      ents.push(_circulo(cx, cy, r + 4, 'GEOMETRIA', 4));
      ents.push(_arco(cx, cy, r * 0.8, 90, 270, 'GEOMETRIA', 7));
      ents.push(_texto(cx - 6, cy - r - 8, 3.5, '→ FLUJO', 'COTAS', 2));
    } else if (p.tipo === 'wh') {
      // Cabezal de pozo API 6A
      ents.push(_linea(cx - 25, cy + r + 5, cx + 25, cy + r + 5, 'GEOMETRIA', 4));
      ents.push(_linea(cx - 25, cy - r - 5, cx + 25, cy - r - 5, 'GEOMETRIA', 4));
      ents.push(_linea(cx - 25, cy - r - 5, cx - 25, cy + r + 5, 'GEOMETRIA', 4));
      ents.push(_linea(cx + 25, cy - r - 5, cx + 25, cy + r + 5, 'GEOMETRIA', 4));
      ents.push(_texto(cx - 12, cy + 3, 4, 'API 6A', 'DATOS', 2));
    }
  
    // Cotas DN
    ents.push(_texto(cx - 5, cy - r - 15, 3.5, `DN ${p.DN}`, 'COTAS', 2));
    ents.push(_cotaHoriz(cx - 60, cy + r + 5, cx + 60, cy + r + 5, `L total ref = ${(p.DN * 3.5 / 1000).toFixed(2)} m`, 12));
  
    // Tag y clase
    ents.push(_texto(cx - 20, cy - r - 25, 4, `${p.nombre} / ${p.clase}`, 'DATOS', 2));
    ents.push(_texto(cx - 20, cy - r - 32, 3.5, p.norma, 'DATOS', 3));
  
    // Datos
    const datos = [
      `MODULO: VALVULAS — ${p.norma}`,
      `Tipo: ${p.nombre} | DN = ${p.DN} mm | Clase: ${p.clase}`,
      `P max clase = ${p.P_max} MPa | P operacion = ${p.P_op} MPa`,
      `Factor uso = ${((p.P_op / p.P_max) * 100).toFixed(1)}%`,
      p.servicio ? `Servicio: ${p.servicio}` : '',
      `Prueba hidrostatica cuerpo = ${(p.P_max * 1.5).toFixed(2)} MPa (ASME B16.34)`,
      `ESTADO: ${p.P_op <= p.P_max * 0.8 ? '✓ MARGEN ADECUADO' : p.P_op <= p.P_max ? '⚠ MARGEN REDUCIDO' : '✗ SOBREPRESION'}`,
    ].filter(Boolean) as string[];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 18 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : (i === 6 ? 3 : 3)));
    });
  
    ents.push(_bloqueTitle(`VALVULA — ${p.nombre} / SIMBOLOGIA ISA 5.1`, p.norma,
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 11 — HARDY-CROSS (REDES DE TUBERÍAS)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFHardyCross(p: ParamsHardyCross): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Red mallada básica (grilla de nodos)
    const cols = Math.min(Math.ceil(Math.sqrt(p.nodos)), 4);
    const rows = Math.ceil(p.nodos / cols);
    const spacingX = 50, spacingY = 40;
    const ox = 20, oy = 90;
  
    const nodPos: [number, number][] = [];
    let nIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (nIdx >= p.nodos) break;
        const nx = ox + c * spacingX;
        const ny = oy - r * spacingY;
        nodPos.push([nx, ny]);
        // Nodo
        ents.push(_circulo(nx, ny, 4, 'GEOMETRIA', 4));
        ents.push(_texto(nx + 5, ny + 3, 3.5, `N${nIdx + 1}`, 'DATOS', 3));
        nIdx++;
      }
    }
  
    // Tuberías entre nodos (conectar horizontal y vertical)
    nIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (nIdx >= p.nodos) break;
        const [nx, ny] = nodPos[nIdx];
        // Horizontal
        if (c < cols - 1 && nIdx + 1 < p.nodos) {
          const [nx2, ny2] = nodPos[nIdx + 1];
          ents.push(_linea(nx + 4, ny, nx2 - 4, ny2, 'GEOMETRIA', 7));
        }
        // Vertical
        if (r < rows - 1 && nIdx + cols < p.nodos) {
          const [nx2, ny2] = nodPos[nIdx + cols];
          ents.push(_linea(nx, ny - 4, nx2, ny2 + 4, 'GEOMETRIA', 7));
        }
        nIdx++;
      }
    }
  
    // Nodo fuente (supply) marcado
    if (nodPos.length > 0) {
      const [sx, sy] = nodPos[0];
      ents.push(_circulo(sx, sy, 7, 'DATOS', 2));
      ents.push(_texto(sx - 4, sy - 12, 3, 'FUENTE', 'DATOS', 2));
    }
  
    // Datos
    const datos = [
      'MODULO: REDES — HARDY-CROSS / COLEBROOK-WHITE',
      `Nodos = ${p.nodos} | Tuberias = ${p.tuberias}`,
      `Q max en red = ${p.Q_max.toFixed(3)} L/s`,
      `hf max = ${p.hf_max.toFixed(3)} m`,
      `Convergencia: ${p.iteraciones} iteraciones`,
      'Criterio: |ΔQ| < 0.001 L/s en todas las mallas',
      'Metodo: Hardy-Cross con Darcy-Weisbach + Colebrook',
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(250, 90 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : 3));
    });
  
    ents.push(_bloqueTitle('RED DE TUBERIAS — HARDY-CROSS / ANALISIS HIDRAULICO', 'AWWA M32 / Darcy-Weisbach / Colebrook-White',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 12 — CAÑERÍAS (ASME B16.9 / B31.3 FITTING)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFCanerias(p: ParamsCanerias): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
    const r = Math.min(p.OD * 0.15, 12);
  
    // Tramo horizontal principal
    const x0 = 30, x1 = 220, yc = 80;
    ents.push(_linea(x0, yc + r, x1, yc + r, 'GEOMETRIA', 4));
    ents.push(_linea(x0, yc - r, x1, yc - r, 'GEOMETRIA', 4));
    ents.push(_linea(x0, yc - r, x0, yc + r, 'GEOMETRIA', 4));
    // Eje
    ents.push(_linea(x0, yc, x1, yc, 'CENTRO', 1));
  
    // Codos (representados a 90°)
    const codoPosX = [x0 + 50, x0 + 120, x0 + 170];
    for (let i = 0; i < Math.min(p.codos, 3); i++) {
      const cx = codoPosX[i];
      ents.push(_arco(cx, yc + r, r, 90, 180, 'GEOMETRIA', 4));
      ents.push(_linea(cx, yc + r, cx, yc + r + 25, 'GEOMETRIA', 4));
      ents.push(_linea(cx - r, yc + r, cx - r, yc + r + 25, 'GEOMETRIA', 4));
      ents.push(_texto(cx - 5, yc + r + 27, 3, `CODO R=1.5D`, 'DATOS', 3));
    }
  
    // Tees
    if (p.tees > 0) {
      const tx = x0 + 90;
      ents.push(_linea(tx, yc + r, tx, yc + r + 20, 'GEOMETRIA', 3));
      ents.push(_linea(tx - r, yc + r, tx - r, yc + r + 20, 'GEOMETRIA', 3));
      ents.push(_linea(tx - r, yc + r + 20, tx + r, yc + r + 20, 'GEOMETRIA', 3));
      ents.push(_linea(tx + r, yc + r, tx + r, yc + r + 20, 'GEOMETRIA', 3));
      ents.push(_texto(tx - 5, yc + r + 23, 3, `TEE (${p.tees})`, 'DATOS', 3));
    }
  
    // Reducción al final
    if (p.red_DN > 0) {
      const rx2 = x1 - 20, r2 = Math.min(p.red_DN * 0.15, r * 0.7);
      ents.push(_linea(rx2, yc + r, x1, yc + r2, 'GEOMETRIA', 2));
      ents.push(_linea(rx2, yc - r, x1, yc - r2, 'GEOMETRIA', 2));
      ents.push(_linea(x1, yc - r2, x1, yc + r2, 'GEOMETRIA', 2));
      ents.push(_texto(rx2 + 5, yc + r + 5, 3, `RED→DN${p.red_DN}`, 'DATOS', 2));
    } else {
      ents.push(_linea(x1, yc - r, x1, yc + r, 'GEOMETRIA', 4));
    }
  
    // Cotas
    ents.push(_cotaHoriz(x0, yc + r + 40, x1, yc + r + 40, `L = ${p.L} m`, 5));
    ents.push(_texto(x0, yc - r - 8, 3.5, `OD ${p.OD}×${p.t}mm | ${p.material}`, 'COTAS', 2));
  
    // Datos
    const datos = [
      'MODULO: CAÑERIAS — ASME B16.9 / B31.3',
      `Material: ${p.material} | OD = ${p.OD} mm | t = ${p.t} mm`,
      `Longitud = ${p.L} m | ID = ${(p.OD - 2 * p.t).toFixed(1)} mm`,
      `Codos 90° = ${p.codos} (R=1.5D, ASME B16.9) | Tees = ${p.tees}`,
      p.red_DN > 0 ? `Reduccion concéntrica → DN ${p.red_DN}` : 'Sin reducciones',
      `Presion prueba hidrostáticas = 1.5×MAOP`,
      `Norma: ASME B31.3 §304 / ASME B16.9 fittings`,
    ].filter(Boolean) as string[];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : 3));
    });
  
    ents.push(_bloqueTitle('CAÑERIAS — ISOMETRICO / FITTINGS / ASME B16.9', 'ASME B31.3 / ASME B16.9 / API 5L',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 13 — MMO (MANTENIMIENTO / MATERIALES / OPERACIÓN)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFMMO(p: ParamsMMO): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Representación genérica de equipo (rectángulo + motor)
    const ex = 60, ey = 80, eW = 60, eH = 35;
    ents.push(_linea(ex, ey, ex + eW, ey, 'GEOMETRIA', 4));
    ents.push(_linea(ex, ey - eH, ex + eW, ey - eH, 'GEOMETRIA', 4));
    ents.push(_linea(ex, ey, ex, ey - eH, 'GEOMETRIA', 4));
    ents.push(_linea(ex + eW, ey, ex + eW, ey - eH, 'GEOMETRIA', 4));
    // Motor (círculo)
    ents.push(_circulo(ex + eW + 15, ey - eH / 2, eH / 4, 'GEOMETRIA', 3));
    ents.push(_texto(ex + eW + 8, ey - eH / 2, 3.5, 'M', 'DATOS', 3));
    // Eje motor-equipo
    ents.push(_linea(ex + eW, ey - eH / 2, ex + eW + 11, ey - eH / 2, 'GEOMETRIA', 7));
    // Tag del equipo
    ents.push(_texto(ex + 5, ey - eH / 2, 4.5, p.tag, 'DATOS', 2));
    ents.push(_texto(ex + 5, ey - eH / 2 - 8, 3.5, p.equipo.substring(0, 18), 'DATOS', 7));
  
    // Diagrama de Gantt de mantenimiento simplificado
    const gx = 150, gy = 80, gW = 120, nMeses = 12;
    ents.push(_texto(gx, gy + 5, 3.5, 'PLAN MANTENIMIENTO ANUAL', 'COTAS', 2));
    // Meses
    for (let m = 0; m <= nMeses; m++) {
      ents.push(_linea(gx + m * gW / nMeses, gy, gx + m * gW / nMeses, gy - 3, 'COTAS', 7));
    }
    ents.push(_linea(gx, gy, gx + gW, gy, 'COTAS', 7));
    // Barras de mantenimiento
    const intervDibujo = Math.max(1, Math.round(p.intervalo / 30));
    for (let m = 0; m < nMeses; m += intervDibujo) {
      const bx = gx + m * gW / nMeses;
      const bW = gW / nMeses * 0.8;
      ents.push(_linea(bx, gy - 5, bx + bW, gy - 5, 'DATOS', 2));
      ents.push(_linea(bx, gy - 10, bx + bW, gy - 10, 'DATOS', 2));
      ents.push(_linea(bx, gy - 5, bx, gy - 10, 'DATOS', 2));
      ents.push(_linea(bx + bW, gy - 5, bx + bW, gy - 10, 'DATOS', 2));
      ents.push(_texto(bx + 1, gy - 7, 3, 'MTO', 'DATOS', 2));
    }
    // Etiquetas meses
    const meses = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    meses.forEach((m, i) => {
      ents.push(_texto(gx + i * gW / nMeses + 1, gy + 3, 3, m, 'COTAS', 7));
    });
  
    // Datos
    const datos = [
      'MODULO: MMO — MANTENIMIENTO / MATERIALES / OPERACION',
      `Equipo: ${p.equipo} | TAG: ${p.tag}`,
      `Tipo mantenimiento: ${p.tipo_mto}`,
      `Intervalo: cada ${p.intervalo} dias | Horas op: ${p.horas_op} h`,
      `Costo mantenimiento: USD ${p.costo_mto.toLocaleString('en-US')}`,
      `Disponibilidad: ${p.disponibilidad.toFixed(1)}%`,
      `ESTADO: ${p.disponibilidad >= 95 ? '✓ ALTA DISPONIBILIDAD' : p.disponibilidad >= 85 ? '⚠ DISPONIBILIDAD MEDIA' : '✗ BAJA DISPONIBILIDAD'}`,
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : (i === 6 ? 3 : 3)));
    });
  
    ents.push(_bloqueTitle('MMO — PLAN MANTENIMIENTO / DISPONIBILIDAD', 'ISO 55001 / NFPA 70B / API 510',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 14 — SOLDADURA (AWS D1.1 / ASME IX / API 1104)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFSoldadura(p: ParamsSoldadura): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Unión a tope (butt weld) — sección transversal
    const cx = 80, cy = 75;
    const e_d = Math.min(p.espesor * 1.5, 25);
  
    if (p.tipo_junta === 'BW') {
      // Dos chapas enfrentadas con junta en V
      ents.push(_linea(cx - 40, cy - e_d, cx - 5, cy - e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx - 40, cy + e_d, cx - 5, cy + e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx - 40, cy - e_d, cx - 40, cy + e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx - 5, cy - e_d, cx, cy, 'GEOMETRIA', 4)); // bisel izq
      ents.push(_linea(cx - 5, cy + e_d, cx, cy, 'GEOMETRIA', 4));
      // chapa derecha
      ents.push(_linea(cx + 40, cy - e_d, cx + 5, cy - e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx + 40, cy + e_d, cx + 5, cy + e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx + 40, cy - e_d, cx + 40, cy + e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx + 5, cy - e_d, cx, cy, 'GEOMETRIA', 4)); // bisel der
      ents.push(_linea(cx + 5, cy + e_d, cx, cy, 'GEOMETRIA', 4));
      // Cordón de soldadura (relleno)
      ents.push(_arco(cx, cy, e_d * 0.5, 270, 90, 'GEOMETRIA', 2));
      ents.push(_texto(cx - 8, cy - e_d - 8, 3.5, `JUNTA V — t=${p.espesor}mm`, 'COTAS', 2));
    } else if (p.tipo_junta === 'FW') {
      // Filete
      ents.push(_linea(cx - 35, cy, cx + 35, cy, 'GEOMETRIA', 4)); // ala
      ents.push(_linea(cx, cy - e_d * 1.5, cx, cy, 'GEOMETRIA', 4)); // alma
      const a_d = Math.min(p.garganta * 1.5, e_d);
      ents.push(_linea(cx, cy, cx + a_d * 1.4, cy, 'GEOMETRIA', 2));
      ents.push(_linea(cx, cy, cx, cy - a_d * 1.4, 'GEOMETRIA', 2));
      ents.push(_linea(cx + a_d * 1.4, cy, cx, cy - a_d * 1.4, 'GEOMETRIA', 2));
      ents.push(_texto(cx + a_d + 2, cy - a_d - 2, 3.5, `a=${p.garganta}mm`, 'COTAS', 2));
      ents.push(_texto(cx - 20, cy - e_d * 1.5 - 5, 3.5, `FILETE a=${p.garganta}mm`, 'COTAS', 2));
    } else {
      // Socket weld
      ents.push(_linea(cx - 30, cy - e_d, cx + 30, cy - e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx - 30, cy + e_d, cx + 30, cy + e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx - 30, cy - e_d, cx - 30, cy + e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx + 30, cy - e_d, cx + 30, cy + e_d, 'GEOMETRIA', 4));
      ents.push(_linea(cx, cy - e_d, cx, cy + e_d, 'GEOMETRIA', 7)); // socket
      ents.push(_texto(cx - 20, cy - e_d - 8, 3.5, 'SOCKET WELD', 'COTAS', 2));
    }
  
    // Símbolo de soldadura (norma AWS A2.4)
    ents.push(_linea(cx + 45, cy + 10, cx + 60, cy + 10, 'DATOS', 7));
    ents.push(_linea(cx + 60, cy + 10, cx + 70, cy + 20, 'DATOS', 7));
    ents.push(_texto(cx + 72, cy + 20, 3.5, p.tipo_junta === 'BW' ? '\/\/' : 'Δ', 'DATOS', 7));
  
    // Datos
    const datos = [
      'MODULO: SOLDADURA — CALIFICACION / INSPECCION',
      `Material base: ${p.material_base} | e = ${p.espesor} mm`,
      `Tipo junta: ${p.tipo_junta} | Proceso: ${p.proceso} | Electrodo: ${p.electrodo}`,
      p.tipo_junta === 'FW' ? `Garganta a = ${p.garganta} mm` : `Raiz + relleno + acabado`,
      `Precalentamiento: ${p.precalentamiento} °C (AWS D1.1 / ASME IX)`,
      `Dureza maxima: ${p.dureza_max} HV10 (NACE MR0175 si H2S)`,
      `EPS requerida: ASME Seccion IX / API 1104 / AWS D1.1`,
    ];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : 3));
    });
  
    ents.push(_bloqueTitle('SOLDADURA — JUNTA / CALIFICACION / AWS SIMBOLO', 'AWS D1.1 / ASME IX / API 1104',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 15 — ELECTRICIDAD (NEC / IEC 60228 / IEC 60909)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFElectricidad(p: ParamsElectricidad): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
  
    // Sección transversal del conduit con conductores
    const cx = 70, cy = 75;
    const nCond = Math.min(p.num_conductores, 4);
    const secDraw = Math.sqrt(p.seccion) * 1.2;
    const rConduit = secDraw * 1.8 + 8;
  
    // Conduit exterior
    ents.push(_circulo(cx, cy, rConduit, 'GEOMETRIA', 7));
    ents.push(_circulo(cx, cy, rConduit - 3, 'GEOMETRIA', 4));
  
    // Conductores dentro del conduit
    const posiciones: [number, number][] = [
      [cx, cy],
      [cx - secDraw * 1.3, cy],
      [cx + secDraw * 1.3, cy],
      [cx, cy - secDraw * 1.3],
    ];
    for (let i = 0; i < nCond; i++) {
      const [px, py] = posiciones[i];
      ents.push(_circulo(px, py, secDraw * 0.5, 'GEOMETRIA', 2));
      // Alma del conductor
      ents.push(_circulo(px, py, secDraw * 0.3, 'GEOMETRIA', p.conductor === 'Cu' ? 2 : 3));
      // Etiqueta fase
      const fases = ['L1', 'L2', 'L3', 'N'];
      ents.push(_texto(px - 3, py - 2, 3, fases[i], 'DATOS', 7));
    }
  
    // Cota diámetro conduit
    ents.push(_cotaHoriz(cx - rConduit, cy + rConduit + 5, cx + rConduit, cy + rConduit + 5,
      `Ø conduit = ${Math.ceil(rConduit * 2 / 10) * 10} mm`, 8));
  
    // Eje X
    ents.push(_linea(cx - rConduit - 8, cy, cx + rConduit + 8, cy, 'CENTRO', 1));
    ents.push(_linea(cx, cy - rConduit - 8, cx, cy + rConduit + 8, 'CENTRO', 1));
  
    // Conductor individual ampliado
    const detx = 160, dety = 80, detR = 20;
    ents.push(_circulo(detx, dety, detR, 'GEOMETRIA', p.conductor === 'Cu' ? 2 : 3));
    ents.push(_circulo(detx, dety, detR - 5, 'GEOMETRIA', 7));
    ents.push(_texto(detx - 8, dety - 3, 4, `${p.conductor}`, 'DATOS', 7));
    ents.push(_texto(detx - 10, dety - 10, 3, `${p.seccion}mm²`, 'DATOS', 2));
    ents.push(_cotaHoriz(detx - detR, dety + detR + 5, detx + detR, dety + detR + 5, `${p.seccion}mm²`, 8));
    ents.push(_texto(detx - 15, dety + detR + 18, 3, 'SECCIÓN CONDUCTOR', 'COTAS', 2));
  
    // Datos
    const datos = [
      `MODULO: ELECTRICIDAD — ${p.norma}`,
      `Conductor: ${p.conductor} | Seccion: ${p.seccion} mm² | ${p.num_conductores} conductores`,
      `I diseño = ${p.I_diseño} A | Tension = ${p.tension} kV`,
      `Icc = ${p.I_cortocircuito} kA (IEC 60909)`,
      `L circuito = ${p.L_circuito} m | Caida tension = ${p.caida_tension.toFixed(2)}%`,
      p.zona_exp ? `Zona ATEX/NEC: ${p.zona_exp} — API RP 500 / IEC 60079` : `NEC 310 / IEC 60228`,
      `ESTADO: ${p.caida_tension <= 3 ? '✓ CAIDA TENSION ADMISIBLE (≤3%)' : '⚠ CAIDA TENSION EXCESIVA — REVISAR'}`,
    ].filter(Boolean) as string[];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : (i === 6 ? (p.caida_tension <= 3 ? 3 : 1) : 3)));
    });
  
    ents.push(_bloqueTitle('ELECTRICIDAD — SECCION CONDUCTOR / CONDUIT', 'NEC 310 / IEC 60228 / IEC 60909 / API RP 500',
      p.proyecto || '', p.ingeniero || '', fecha));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  } 