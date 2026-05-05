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
    DN: number;        // Diámetro nominal (mm)
    tipo: string;      // 'bt'|'bf'|'mp'|'cg'|'kn'|'gl'|'ch'|'wh'
    nombre: string;    // Nombre válvula
    clase: string;     // Clase ASME
    P_max: number;     // Presión máxima (MPa)
    P_op: number;      // Presión operación (MPa)
    norma: string;     // API 6D / ASME B16.34 / etc
    f2f_mm?: number;   // Face-to-face ASME B16.10 (mm) — real de tabla
    material?: string; // Especificación material ASTM (ej. A216 WCB)
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
  
  // Extrae datos del usuario inyectados por BotonesExportar (prefijo _usr_)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function _usrData(p: any) {
    return {
      nombre:    String(p._usr_nombre    ?? '') || undefined,
      email:     String(p._usr_email     ?? '') || undefined,
      matricula: String(p._usr_matricula ?? '') || undefined,
      dni:       String(p._usr_dni       ?? '') || undefined,
      empresa:   String(p._usr_empresa   ?? '') || undefined,
      pais:      String(p._usr_pais      ?? '') || undefined,
    };
  }

  // Genera bloque de título estándar INGENIUM PRO con datos completos del usuario
  function _bloqueTitle(
    titulo: string,
    norma: string,
    proyecto: string,
    ing: string,
    fecha: string,
    x0 = 0, y0 = -60,
    extras?: { nombre?: string; email?: string; matricula?: string; dni?: string; empresa?: string; pais?: string }
  ): string {
    const fechaFinal  = fecha    || new Date().toLocaleDateString('es-AR');
    const ingFinal    = extras?.nombre || ing || 'INGENIUM PRO';
    const proyFinal   = proyecto || 'SIN NOMBRE';
    const emailFinal  = extras?.email     || '—';
    const matFinal    = extras?.matricula || '—';
    const dniFinal    = extras?.dni       || '—';
    const empFinal    = extras?.empresa   || '—';
    const paisFinal   = extras?.pais      || '';
    const lines: string[] = [];
    // Caja exterior ampliada para incluir todos los datos del profesional
    lines.push(_linea(x0, y0, x0 + 280, y0, 'TITULO', 7));
    lines.push(_linea(x0 + 280, y0, x0 + 280, y0 - 78, 'TITULO', 7));
    lines.push(_linea(x0 + 280, y0 - 78, x0, y0 - 78, 'TITULO', 7));
    lines.push(_linea(x0, y0 - 78, x0, y0, 'TITULO', 7));
    // Divisores horizontales
    lines.push(_linea(x0, y0 - 12, x0 + 280, y0 - 12, 'TITULO', 7));
    lines.push(_linea(x0, y0 - 24, x0 + 280, y0 - 24, 'TITULO', 7));
    lines.push(_linea(x0, y0 - 36, x0 + 280, y0 - 36, 'TITULO', 7));
    lines.push(_linea(x0, y0 - 52, x0 + 280, y0 - 52, 'TITULO', 7));
    lines.push(_linea(x0, y0 - 64, x0 + 280, y0 - 64, 'TITULO', 7));
    // Divisores verticales
    lines.push(_linea(x0 + 140, y0 - 36, x0 + 140, y0 - 78, 'TITULO', 7));
    // Fila 1: encabezado
    lines.push(_texto(x0 + 5, y0 - 9,  5,   'INGENIUM PRO v8 — RADAR © 2026', 'TITULO', 7));
    // Fila 2: módulo + normativa
    lines.push(_texto(x0 + 5, y0 - 21, 4.5, titulo.substring(0, 40), 'TITULO', 2));
    // Fila 3: norma (izq) | ingeniero (der)
    lines.push(_texto(x0 + 5,   y0 - 33, 3.5, 'NORMA: ' + norma.substring(0, 35), 'TITULO', 3));
    lines.push(_texto(x0 + 145, y0 - 33, 3.5, 'ING: ' + ingFinal.substring(0, 28), 'TITULO', 7));
    // Fila 4: proyecto (izq) | fecha (der)
    lines.push(_texto(x0 + 5,   y0 - 45, 3,   'PROYECTO: ' + proyFinal.substring(0, 28), 'TITULO', 7));
    lines.push(_texto(x0 + 145, y0 - 45, 3,   'FECHA: ' + fechaFinal, 'TITULO', 7));
    // Fila 5: email | matrícula
    lines.push(_texto(x0 + 5, y0 - 58,  3.5, 'EMAIL: ' + emailFinal.substring(0, 28), 'TITULO', 2));
    lines.push(_texto(x0 + 145, y0 - 58, 3.5, 'MAT: ' + matFinal.substring(0, 18),   'TITULO', 2));
    // Fila 6: empresa | DNI
    lines.push(_texto(x0 + 5, y0 - 71,  3,   'EMPRESA: ' + empFinal.substring(0, 26), 'TITULO', 7));
    lines.push(_texto(x0 + 145, y0 - 71, 3,   'DNI: ' + dniFinal + (paisFinal ? ' · ' + paisFinal.substring(0, 10) : ''), 'TITULO', 7));
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
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
  
    // Gradiente piezométrico — escala logarítmica para no colapsar valores grandes
    const hfScale = Math.max(Math.min(Math.log10(p.hf + 1) * 18, 38), 2);
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
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
    // Forma de onda cuadrada — escala log para representar rango amplio de Tc y dP
    const tc_draw = Math.max(Math.min(Math.log10(p.Tc + 1) * 28, pW * 0.7), 4);
    const dP_draw = Math.max(Math.min(Math.log10(p.dP * 10 + 1) * 12, pH * 0.95), 2);
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
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
    // Escala fija para variación real: 7 DXF units/m → Df 0.5-8m produce 3.5-55 units
    const escalaFija = 7;
    const Df_d = Math.max(Math.min(p.Df * escalaFija, 55), 3);
    const B_d  = Math.max(Math.min(p.B  * escalaFija, 80), 5);
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 8 — HIDROLOGÍA (MÉTODO RACIONAL SCS-CN)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFHidrologia(p: ParamsHidrologia): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');

    // Cuenca hidrográfica — tamaño escalado por área A (km²) y desnivel H_cuenca
    const cx = 130, cy = 80;
    const rx = Math.max(Math.min(30 + Math.sqrt(p.A + 0.01) * 9, 100), 35);
    const ry = Math.max(Math.min(20 + Math.sqrt(p.A + 0.01) * 5 + p.H_cuenca * 0.15, 65), 22);
    // Elipse aproximada con líneas (contorno cuenca)
    const pts: [number, number][] = [];
    for (let a = 0; a <= 360; a += 30) {
      const ar = a * Math.PI / 180;
      pts.push([cx + rx * Math.cos(ar), cy + ry * Math.sin(ar)]);
    }
    for (let i = 0; i < pts.length - 1; i++) {
      ents.push(_linea(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 'GEOMETRIA', 3));
    }

    // Cauce principal — longitud proporcional a L_cauce
    const lcScale = Math.min(rx * 1.4 / Math.max(p.L_cauce, 1), 1.4);
    const lcLen = Math.min(rx * 1.3, 120);
    ents.push(_linea(cx - lcLen * 0.7, cy + ry * 0.25, cx - lcLen * 0.3, cy, 'GEOMETRIA', 4));
    ents.push(_linea(cx - lcLen * 0.3, cy, cx + lcLen * 0.15, cy - ry * 0.2, 'GEOMETRIA', 4));
    ents.push(_linea(cx + lcLen * 0.15, cy - ry * 0.2, cx + lcLen * 0.55, cy + ry * 0.45, 'GEOMETRIA', 4));
    void lcScale;

    // Cotas dentro de la cuenca
    ents.push(_texto(cx - 18, cy, 4, `A = ${p.A} km2`, 'DATOS', 2));
    ents.push(_texto(cx - 18, cy + 9, 3.5, `CN = ${p.CN}`, 'DATOS', 3));
    ents.push(_texto(cx - 18, cy + 18, 3.5, `Tc = ${p.Tc.toFixed(1)} min`, 'DATOS', 3));
  
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 10 — VÁLVULAS (API 6D / API 6A / ASME B16.34)
  //  BASE VERIFICADA — Lógica equivalente a ModuloValvulas.tsx
  // ═══════════════════════════════════════════════════════════

  // ASME B16.10 Globe valve (short pattern, flanged ends) — face-to-face (mm)
  // Class 150 = Class 300 para globo corto (mismo cuerpo, diferente espesor pared)
  // Fuente: ASME B16.10-2017 Table 1. SOLO referencia esquemática DXF.
  const F2F_GLOBO_B1610: Record<string, Record<string, number>> = {
    '150': { '0.5':102,'0.75':102,'1':127,'1.25':140,'1.5':152,'2':178,'2.5':203,'3':216,'4':229,'6':267,'8':292,'10':330,'12':356 },
    '300': { '0.5':102,'0.75':102,'1':127,'1.25':140,'1.5':152,'2':178,'2.5':203,'3':216,'4':229,'6':267,'8':292,'10':330,'12':356 },
    '600': { '0.5':127,'0.75':152,'1':178,'1.25':203,'1.5':216,'2':254,'2.5':279,'3':305,'4':356,'6':432,'8':508,'10':584,'12':660 },
    '900': { '2':305,'3':381,'4':457,'6':559,'8':660,'10':787,'12':914 },
  };

  // Convierte DN (mm) al NPS string más cercano para lookup en tabla
  function _dnToNpsKey(dn: number): string {
    const MAP: [number, string][] = [
      [15,'0.5'],[20,'0.75'],[25,'1'],[32,'1.25'],[40,'1.5'],
      [50,'2'],[65,'2.5'],[80,'3'],[100,'4'],[125,'5'],
      [150,'6'],[200,'8'],[250,'10'],[300,'12'],
    ];
    const r = Math.round(dn);
    return MAP.reduce((best, cur) =>
      Math.abs(cur[0] - r) < Math.abs(best[0] - r) ? cur : best
    )[1];
  }

  export function exportarDXFValvulas(p: ParamsValvulas): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');

    // Helpers de formato seguro — elimina decimales flotantes basura
    const n2 = (x: number) => parseFloat(x.toFixed(2)).toFixed(2);
    const n1 = (x: number) => parseFloat(x.toFixed(1)).toFixed(1);

    // Escala dinámica por DN — sin cap fijo, cada tamaño produce geometría distinta
    const cx = 130, cy = 75;
    const r = Math.max(Math.min(p.DN * 0.1, 26), 3);
    const bodyMaxR = r + 10;
    const pConn = Math.max(bodyMaxR + 2, 22);
    const pLen = 46;

    // Tubería de entrada y salida
    ents.push(_linea(cx - pConn - pLen, cy + r, cx - pConn, cy + r, 'GEOMETRIA', 4));
    ents.push(_linea(cx - pConn - pLen, cy - r, cx - pConn, cy - r, 'GEOMETRIA', 4));
    ents.push(_linea(cx + pConn, cy + r, cx + pConn + pLen, cy + r, 'GEOMETRIA', 4));
    ents.push(_linea(cx + pConn, cy - r, cx + pConn + pLen, cy - r, 'GEOMETRIA', 4));
    // Bridas en extremos (cara raised face)
    ents.push(_linea(cx - pConn, cy - r - 5, cx - pConn, cy + r + 5, 'GEOMETRIA', 4));
    ents.push(_linea(cx - pConn - 3, cy - r - 5, cx - pConn - 3, cy + r + 5, 'GEOMETRIA', 4));
    ents.push(_linea(cx + pConn, cy - r - 5, cx + pConn, cy + r + 5, 'GEOMETRIA', 4));
    ents.push(_linea(cx + pConn + 3, cy - r - 5, cx + pConn + 3, cy + r + 5, 'GEOMETRIA', 4));

    // ── GEOMETRÍA ESPECÍFICA POR TIPO ──────────────────────────
    if (p.tipo === 'bt' || p.tipo === 'bf') {
      // Bola (Ball) — cuerpo circular con esfera interior y tallo
      const bR = r + 8;
      const ballR = Math.max(r * 0.55, 3);
      ents.push(_circulo(cx, cy, bR, 'GEOMETRIA', 4));              // cuerpo
      ents.push(_circulo(cx, cy, ballR, 'GEOMETRIA', 7));           // esfera de cierre
      // Bore interior (paso)
      ents.push(_linea(cx - pConn, cy + r * 0.4, cx - bR, cy + r * 0.4, 'GEOMETRIA', 7));
      ents.push(_linea(cx - pConn, cy - r * 0.4, cx - bR, cy - r * 0.4, 'GEOMETRIA', 7));
      ents.push(_linea(cx + pConn, cy + r * 0.4, cx + bR, cy + r * 0.4, 'GEOMETRIA', 7));
      ents.push(_linea(cx + pConn, cy - r * 0.4, cx + bR, cy - r * 0.4, 'GEOMETRIA', 7));
      // Tallo / actuador
      ents.push(_linea(cx, cy + ballR, cx, cy + bR + 14, 'GEOMETRIA', 7));
      ents.push(_linea(cx - 8, cy + bR + 14, cx + 8, cy + bR + 14, 'GEOMETRIA', 7));
      ents.push(_linea(cx - 6, cy + bR + 18, cx + 6, cy + bR + 18, 'GEOMETRIA', 7));
      ents.push(_texto(cx + bR + 4, cy + 2, 2.5, 'ESFERA', 'COTAS', 4));

    } else if (p.tipo === 'mp') {
      // Mariposa (Butterfly) — cuerpo delgado con disco inclinado y vástago
      const bR = r + 6;
      ents.push(_circulo(cx, cy, bR, 'GEOMETRIA', 4));
      // Disco (plato) — inclinado 30°
      const dR = Math.max(r * 0.85, 4);
      const ang = 30 * Math.PI / 180;
      ents.push(_linea(cx - dR * Math.cos(ang), cy - dR * Math.sin(ang),
                       cx + dR * Math.cos(ang), cy + dR * Math.sin(ang), 'GEOMETRIA', 7));
      // Eje del disco (horizontal)
      ents.push(_linea(cx - dR, cy, cx + dR, cy, 'GEOMETRIA', 7));
      // Vástago
      ents.push(_linea(cx, cy + bR, cx, cy + bR + 14, 'GEOMETRIA', 7));
      ents.push(_linea(cx - 7, cy + bR + 14, cx + 7, cy + bR + 14, 'GEOMETRIA', 7));
      ents.push(_linea(cx - 5, cy + bR + 18, cx + 5, cy + bR + 18, 'GEOMETRIA', 7));
      ents.push(_texto(cx + bR + 3, cy - 2, 2.5, 'DISCO', 'COTAS', 4));

    } else if (p.tipo === 'cg' || p.tipo === 'kn') {
      // Compuerta / cuchilla — cuerpo rectangular + cuña + vástago
      const bW = r + 6, bH = r + 6;
      ents.push(_linea(cx - bW, cy - bH, cx + bW, cy - bH, 'GEOMETRIA', 4));
      ents.push(_linea(cx - bW, cy + bH, cx + bW, cy + bH, 'GEOMETRIA', 4));
      ents.push(_linea(cx - bW, cy - bH, cx - bW, cy + bH, 'GEOMETRIA', 4));
      ents.push(_linea(cx + bW, cy - bH, cx + bW, cy + bH, 'GEOMETRIA', 4));
      // Bore interior
      ents.push(_linea(cx - pConn, cy + r * 0.45, cx - bW, cy + r * 0.45, 'GEOMETRIA', 7));
      ents.push(_linea(cx - pConn, cy - r * 0.45, cx - bW, cy - r * 0.45, 'GEOMETRIA', 7));
      ents.push(_linea(cx + pConn, cy + r * 0.45, cx + bW, cy + r * 0.45, 'GEOMETRIA', 7));
      ents.push(_linea(cx + pConn, cy - r * 0.45, cx + bW, cy - r * 0.45, 'GEOMETRIA', 7));
      // Cuña (wedge) — rombo central
      const wH = bH * 0.7, wW = Math.max(r * 0.4, 2.5);
      ents.push(_linea(cx, cy - wH, cx + wW, cy, 'GEOMETRIA', 7));
      ents.push(_linea(cx + wW, cy, cx, cy + wH, 'GEOMETRIA', 7));
      ents.push(_linea(cx, cy + wH, cx - wW, cy, 'GEOMETRIA', 7));
      ents.push(_linea(cx - wW, cy, cx, cy - wH, 'GEOMETRIA', 7));
      // Vástago y volante
      const vstTop = cy + bH + 18;
      ents.push(_linea(cx - wW * 0.6, cy + wH, cx - wW * 0.6, vstTop, 'GEOMETRIA', 7));
      ents.push(_linea(cx + wW * 0.6, cy + wH, cx + wW * 0.6, vstTop, 'GEOMETRIA', 7));
      ents.push(_linea(cx - bW * 0.7, vstTop, cx + bW * 0.7, vstTop, 'GEOMETRIA', 7));
      ents.push(_linea(cx - bW * 0.5, vstTop + 4, cx + bW * 0.5, vstTop + 4, 'GEOMETRIA', 7));
      ents.push(_texto(cx + bW + 3, cy - 4, 2.5, 'CUÑA', 'COTAS', 1));
      ents.push(_texto(cx + bW + 3, cy + 6, 2.5, 'VASTAGO', 'COTAS', 7));

    } else if (p.tipo === 'gl') {
      // Globo (Globe) — sección de corte real: cuerpo, bonete, vástago, asiento, disco
      const bodyR  = r + 10;                        // radio cuerpo globo
      const boreR  = Math.max(r * 0.45, 3);         // semiancho bore
      const seatW  = boreR * 1.1;                   // semiancho anillo asiento
      const discH  = boreR * 0.65;                  // altura disco
      const stemW  = Math.max(boreR * 0.22, 1.5);   // semiancho vástago
      const bonW   = Math.max(stemW * 2.8, 5);      // semiancho bonete
      const bonH   = bodyR * 1.25;                  // altura bonete

      // Cuerpo circular
      ents.push(_circulo(cx, cy, bodyR, 'GEOMETRIA', 4));

      // Bore interior (paso de fluido — izq y der dentro del cuerpo)
      ents.push(_linea(cx - pConn, cy + boreR, cx - bodyR * 0.72, cy + boreR, 'GEOMETRIA', 7));
      ents.push(_linea(cx - pConn, cy - boreR, cx - bodyR * 0.72, cy - boreR, 'GEOMETRIA', 7));
      ents.push(_linea(cx + pConn, cy + boreR, cx + bodyR * 0.72, cy + boreR, 'GEOMETRIA', 7));
      ents.push(_linea(cx + pConn, cy - boreR, cx + bodyR * 0.72, cy - boreR, 'GEOMETRIA', 7));

      // Anillo de asiento — línea horizontal con cara cónica (V)
      const seatY = cy - boreR * 0.25;
      ents.push(_linea(cx - seatW, seatY, cx + seatW, seatY, 'GEOMETRIA', 7));
      ents.push(_linea(cx - seatW * 0.45, seatY, cx, seatY - discH * 0.55, 'GEOMETRIA', 7));
      ents.push(_linea(cx + seatW * 0.45, seatY, cx, seatY - discH * 0.55, 'GEOMETRIA', 7));

      // Disco / tapón — trapezoidal, encima del asiento (posición abierta parcial)
      ents.push(_linea(cx - seatW * 0.88, seatY, cx - stemW, seatY + discH, 'GEOMETRIA', 7));
      ents.push(_linea(cx + seatW * 0.88, seatY, cx + stemW, seatY + discH, 'GEOMETRIA', 7));
      ents.push(_linea(cx - stemW, seatY + discH, cx + stemW, seatY + discH, 'GEOMETRIA', 7));

      // Bonete — caja rectangular sobre el cuerpo
      const bonBase = cy + bodyR;
      ents.push(_linea(cx - bonW, bonBase, cx - bonW, bonBase + bonH, 'GEOMETRIA', 4));
      ents.push(_linea(cx + bonW, bonBase, cx + bonW, bonBase + bonH, 'GEOMETRIA', 4));
      ents.push(_linea(cx - bonW, bonBase + bonH, cx + bonW, bonBase + bonH, 'GEOMETRIA', 4));
      // Prensaestopa (gland) — línea horizontal a 1/3 del bonete
      ents.push(_linea(cx - bonW, bonBase + bonH * 0.35, cx + bonW, bonBase + bonH * 0.35, 'GEOMETRIA', 7));

      // Vástago — desde disco hasta encima del bonete
      const vstTop = bonBase + bonH + 8;
      ents.push(_linea(cx - stemW, seatY + discH, cx - stemW, vstTop, 'GEOMETRIA', 7));
      ents.push(_linea(cx + stemW, seatY + discH, cx + stemW, vstTop, 'GEOMETRIA', 7));

      // Volante / actuador manual
      ents.push(_linea(cx - r * 0.9, vstTop, cx + r * 0.9, vstTop,     'GEOMETRIA', 7));
      ents.push(_linea(cx - r * 0.65, vstTop + 4, cx + r * 0.65, vstTop + 4, 'GEOMETRIA', 7));
      ents.push(_linea(cx, vstTop, cx, vstTop + 4, 'GEOMETRIA', 7));

      // Etiquetas de componentes
      ents.push(_texto(cx + seatW + 2, seatY - 2,      2.5, 'ASIENTO', 'COTAS', 2));
      ents.push(_texto(cx + stemW + 2, seatY + discH * 0.5, 2.5, 'DISCO',   'COTAS', 2));
      ents.push(_texto(cx + bonW  + 2, bonBase + bonH * 0.5, 2.5, 'BONETE',  'COTAS', 4));
      ents.push(_texto(cx + stemW + 2, bonBase + bonH * 0.15, 2.5, 'VASTAGO', 'COTAS', 3));

    } else if (p.tipo === 'ch') {
      // Retención (Check) — cuerpo circular con clapeta/disco oscilante
      const bR = r + 4;
      ents.push(_circulo(cx, cy, bR, 'GEOMETRIA', 4));
      // Clapeta oscilante (swing check) — arco + eje de giro
      ents.push(_arco(cx, cy, Math.max(r * 0.78, 3), 90, 270, 'GEOMETRIA', 7));
      ents.push(_linea(cx, cy - r * 0.78, cx, cy + r * 0.78, 'GEOMETRIA', 7));
      // Asiento (horizontal)
      ents.push(_linea(cx - r * 0.5, cy, cx + r * 0.5, cy, 'GEOMETRIA', 7));
      // Indicador de flujo
      ents.push(_texto(cx - 8, cy - bR - 6, 3, '-> FLUJO', 'COTAS', 2));
      ents.push(_texto(cx + bR + 3, cy - 2, 2.5, 'CLAPETA', 'COTAS', 4));

    } else if (p.tipo === 'wh') {
      // Cabezal de pozo API 6A — perfil de árbol de navidad esquemático
      const bW = 25, bH = r + 5;
      ents.push(_linea(cx - bW, cy - bH, cx + bW, cy - bH, 'GEOMETRIA', 4));
      ents.push(_linea(cx - bW, cy + bH, cx + bW, cy + bH, 'GEOMETRIA', 4));
      ents.push(_linea(cx - bW, cy - bH, cx - bW, cy + bH, 'GEOMETRIA', 4));
      ents.push(_linea(cx + bW, cy - bH, cx + bW, cy + bH, 'GEOMETRIA', 4));
      // Flap lateral de kill line
      ents.push(_linea(cx - bW, cy - 4, cx - bW - 12, cy - 4, 'GEOMETRIA', 3));
      ents.push(_linea(cx - bW, cy + 4, cx - bW - 12, cy + 4, 'GEOMETRIA', 3));
      ents.push(_linea(cx - bW - 12, cy - 4, cx - bW - 12, cy + 4, 'GEOMETRIA', 3));
      ents.push(_texto(cx - 12, cy + 3, 4, 'API 6A', 'DATOS', 2));
    }

    // Cota DN — diámetro nominal con NPS equivalente
    const npsRef = (p.DN / 25.4).toFixed(1);
    ents.push(_texto(cx - 10, cy - r - 12, 3.5, `DN ${Math.round(p.DN)} mm (NPS ${npsRef}")`, 'COTAS', 2));

    // ── FACE-TO-FACE — tabla ASME B16.10 real por tipo y clase ──
    let f2fVal: number;
    if (p.f2f_mm != null && p.f2f_mm > 0) {
      f2fVal = p.f2f_mm;
    } else if (p.tipo === 'gl') {
      // Globe: lookup en tabla ASME B16.10 Table 1 (short pattern)
      const npsKey = _dnToNpsKey(p.DN);
      f2fVal = F2F_GLOBO_B1610[p.clase]?.[npsKey]
            ?? F2F_GLOBO_B1610['300']?.[npsKey]
            ?? Math.round(p.DN * 2.3);
    } else if (p.tipo === 'bt' || p.tipo === 'bf') {
      // Bola: referencia proporcional API 6D (sin tabla embebida aquí)
      f2fVal = Math.round(p.DN * 2.0);
    } else if (p.tipo === 'mp') {
      // Mariposa: cuerpo muy corto (wafer ≈ DN*0.4)
      f2fVal = Math.round(p.DN * 0.4);
    } else {
      // Compuerta, retención, otros: proporcional estándar
      f2fVal = Math.round(p.DN * 2.8);
    }
    const f2fSrc  = (p.f2f_mm != null && p.f2f_mm > 0) ? 'ASME B16.10'
                  : (p.tipo === 'gl')                   ? 'ASME B16.10 Tabla 1 (globo)'
                  : 'ref';
    const f2fLabel = `F2F = ${f2fVal} mm  ${f2fSrc}`;
    ents.push(_cotaHoriz(cx - pConn - pLen, cy + r + 6, cx + pConn + pLen, cy + r + 6, f2fLabel, 12));

    // Tag, clase y norma
    ents.push(_texto(cx - 22, cy - r - 22, 4, `${p.nombre} / Clase ${p.clase}`, 'DATOS', 2));
    ents.push(_texto(cx - 22, cy - r - 29, 3.5, p.norma, 'DATOS', 3));

    // Tolerancias ASME B16.34 / B16.10
    const tolF2F = f2fVal <= 300 || p.DN <= 100 ? '+-1.5 mm' : '+-3.0 mm';
    const tolBore = p.DN <= 100 ? 'H7' : 'H8';
    const tolRF   = p.DN <= 200 ? '+-0.3 mm (RF)' : '+-0.5 mm (RF)';

    // Presiones limpias — parseFloat elimina basura flotante antes de formatear
    const pMaxFmt = n2(p.P_max);
    const pOpFmt  = n2(p.P_op);
    const pHidFmt = n2(p.P_max * 1.5);
    const pBarFmt = n1(p.P_max * 10);
    const factorFmt = p.P_max > 0 ? n1((p.P_op / p.P_max) * 100) : '—';

    // Carátula de datos
    const datos: string[] = [
      `MODULO: VALVULAS INDUSTRIALES — ${p.norma}`,
      `Tipo: ${p.nombre} | DN = ${Math.round(p.DN)} mm | Clase ASME: ${p.clase}`,
      p.material ? `Material: ${p.material}` : `Material: A216 WCB / A105 (default)`,
      `P max clase = ${pMaxFmt} MPa (${pBarFmt} bar) | P oper = ${pOpFmt} MPa`,
      `Factor uso = ${factorFmt}% | Prueba hidrost = ${pHidFmt} MPa (ASME B16.34 Cl. 6.1)`,
      `F2F = ${f2fVal} mm (${f2fSrc}) | Tol F2F: ${tolF2F} | Tol bore: ${tolBore} | Cara: ${tolRF}`,
      `ESTADO: ${p.P_max > 0 && p.P_op <= p.P_max * 0.8 ? 'MARGEN ADECUADO (>20%)' : p.P_max > 0 && p.P_op <= p.P_max ? 'MARGEN REDUCIDO (<20%)' : 'VERIFICAR CONDICIONES'}`,
      p.servicio ? `Servicio: ${p.servicio}` : '',
    ].filter(Boolean) as string[];
    datos.forEach((d, i) => {
      ents.push(_texto(0, 20 - i * 6, 3.5, d, 'DATOS', i === 0 ? 2 : 3));
    });

    ents.push(_bloqueTitle(`VALVULA ${p.nombre} / Clase ${p.clase} — ISA 5.1 / ASME B16.34`, p.norma,
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));

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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 12 — CAÑERÍAS (ASME B16.9 / B31.3 FITTING)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFCanerias(p: ParamsCanerias): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');
    // Radio proporcional a OD — sin cap bajo que hace idénticos todos los calibres grandes
    const r = Math.max(Math.min(p.OD * 0.15, 25), 3);

    // Longitud visual de tubería proporcional a L (más corta = longitud menor)
    const x0 = 30;
    const x1 = x0 + Math.max(Math.min(p.L * 1.5, 200), 60);
    const yc = 85;
    ents.push(_linea(x0, yc + r, x1, yc + r, 'GEOMETRIA', 4));
    ents.push(_linea(x0, yc - r, x1, yc - r, 'GEOMETRIA', 4));
    ents.push(_linea(x0, yc - r, x0, yc + r, 'GEOMETRIA', 4));
    // Eje
    ents.push(_linea(x0, yc, x1, yc, 'CENTRO', 1));
  
    // Codos (posición distribuida proporcionalmente en el tramo)
    const pipeLen = x1 - x0;
    const codoPosX = [
      x0 + pipeLen * 0.25,
      x0 + pipeLen * 0.50,
      x0 + pipeLen * 0.75,
    ];
    for (let i = 0; i < Math.min(p.codos, 3); i++) {
      const cxc = codoPosX[i];
      ents.push(_arco(cxc, yc + r, r, 90, 180, 'GEOMETRIA', 4));
      ents.push(_linea(cxc, yc + r, cxc, yc + r + 22, 'GEOMETRIA', 4));
      ents.push(_linea(cxc - r, yc + r, cxc - r, yc + r + 22, 'GEOMETRIA', 4));
      ents.push(_texto(cxc - 5, yc + r + 24, 3, 'CODO R=1.5D', 'DATOS', 3));
    }

    // Tees — posición relativa al tramo
    if (p.tees > 0) {
      const tx = x0 + pipeLen * 0.42;
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
    return [_cabecera(), ...ents, _pie()].join('\n');
  }
  
  // ═══════════════════════════════════════════════════════════
  //  MÓDULO 13 — MMO (MANTENIMIENTO / MATERIALES / OPERACIÓN)
  // ═══════════════════════════════════════════════════════════
  
  export function exportarDXFMMO(p: ParamsMMO): string {
    const ents: string[] = [];
    const fecha = p.fecha || new Date().toLocaleDateString('es-AR');

    // Dimensiones del equipo escaladas por horas_op y costo_mto — cada equipo tendrá distinto tamaño
    const eW = Math.max(Math.min(Math.sqrt(Math.max(p.costo_mto, 0) + 1) * 3.5, 80), 32);
    const eH = Math.max(Math.min(Math.sqrt(Math.max(p.horas_op, 0) + 1) * 4.5, 52), 16);
    const ex = 55, ey = 85;

    // Cuerpo equipo (rectángulo con dimensiones proporcionales)
    ents.push(_linea(ex,      ey,      ex + eW, ey,      'GEOMETRIA', 4));
    ents.push(_linea(ex,      ey - eH, ex + eW, ey - eH, 'GEOMETRIA', 4));
    ents.push(_linea(ex,      ey,      ex,      ey - eH, 'GEOMETRIA', 4));
    ents.push(_linea(ex + eW, ey,      ex + eW, ey - eH, 'GEOMETRIA', 4));
    // Motor (radio ∝ horas_op)
    const mR = Math.max(eH / 5, 4);
    ents.push(_circulo(ex + eW + mR + 4, ey - eH / 2, mR, 'GEOMETRIA', 3));
    ents.push(_texto(ex + eW + mR, ey - eH / 2, 3, 'M', 'DATOS', 3));
    ents.push(_linea(ex + eW, ey - eH / 2, ex + eW + 4, ey - eH / 2, 'GEOMETRIA', 7));
    // Tag y nombre
    ents.push(_texto(ex + 3, ey - eH / 2 + 2,  4,   p.tag,                         'DATOS', 2));
    ents.push(_texto(ex + 3, ey - eH / 2 - 6,  3.5, p.equipo.substring(0, 20),     'DATOS', 7));
    ents.push(_texto(ex + 3, ey - eH / 2 - 12, 3,   `${p.horas_op.toFixed(0)} h/año | USD ${p.costo_mto.toFixed(0)}`, 'COTAS', 3));

    // Gauge de disponibilidad — barra vertical proporcional (0–100%)
    const gaugX = ex + eW + mR * 2 + 12, gaugY = ey, gaugH = eH;
    const fillH = gaugH * Math.min(p.disponibilidad, 100) / 100;
    ents.push(_linea(gaugX,     gaugY,          gaugX + 10, gaugY,          'GEOMETRIA', 7));
    ents.push(_linea(gaugX,     gaugY - gaugH,  gaugX + 10, gaugY - gaugH,  'GEOMETRIA', 7));
    ents.push(_linea(gaugX,     gaugY,          gaugX,      gaugY - gaugH,  'GEOMETRIA', 7));
    ents.push(_linea(gaugX + 10,gaugY,          gaugX + 10, gaugY - gaugH,  'GEOMETRIA', 7));
    ents.push(_linea(gaugX + 2, gaugY,          gaugX + 8,  gaugY,          'DATOS', p.disponibilidad >= 95 ? 3 : p.disponibilidad >= 85 ? 2 : 1));
    ents.push(_linea(gaugX + 2, gaugY - fillH,  gaugX + 8,  gaugY - fillH,  'DATOS', p.disponibilidad >= 95 ? 3 : p.disponibilidad >= 85 ? 2 : 1));
    ents.push(_linea(gaugX + 2, gaugY,          gaugX + 2,  gaugY - fillH,  'DATOS', p.disponibilidad >= 95 ? 3 : p.disponibilidad >= 85 ? 2 : 1));
    ents.push(_linea(gaugX + 8, gaugY,          gaugX + 8,  gaugY - fillH,  'DATOS', p.disponibilidad >= 95 ? 3 : p.disponibilidad >= 85 ? 2 : 1));
    ents.push(_texto(gaugX,     gaugY + 3,      3,   `${p.disponibilidad.toFixed(0)}%`, 'DATOS', 2));
    ents.push(_texto(gaugX,     gaugY - gaugH - 5, 3, 'DISP', 'COTAS', 2));

    // Diagrama de Gantt — barras de intervalo de mantenimiento
    const gx = 165, gy = 85, gW = 110, nMeses = 12;
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));
  
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
      p.proyecto || '', p.ingeniero || '', fecha, 0, -60, _usrData(p)));

    return [_cabecera(), ...ents, _pie()].join('\n');
  }

  // ═══════════════════════════════════════════════════════════
  //  MÓDULO VÁLVULAS — BRIDA ASME B16.5 (4 capas específicas)
  //  Capas: CUERPO · BORE · BRIDA · ANOTACIONES
  //  Face-to-face per ASME B16.10 Table 1 (válvula compuerta)
  //  Plano esquemático de referencia — NO dimensional
  // ═══════════════════════════════════════════════════════════

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function exportarDXFBridaB165(p: Record<string, any>): string {
    const nps     = String(p['NPS (pulg)']          ?? '');
    const clase   = String(p['Clase de presion']     ?? '');
    const OD_mm   = Number(p['OD (mm)']              ?? 0);
    const BC_mm   = Number(p['BC (mm)']              ?? 0);
    const bore_mm = Number(p['Bore (mm)']            ?? 0);
    const n_pern  = Number(p['Numero de pernos']     ?? 0);
    const proyecto = String(p['Proyecto']            ?? '');
    const f2f_raw = p['F2F ASME B16.10 (mm)'];
    const fecha   = new Date().toLocaleDateString('es-AR');

    // Sin F2F en tabla → no generar DXF (BotonesExportar mostrará "no disponible")
    const f2f_num = (f2f_raw != null && f2f_raw !== 'Consultar fabricante') ? Number(f2f_raw) : 0;
    if (!f2f_num || f2f_num <= 0 || !OD_mm || !bore_mm) return '';

    const F2F      = f2f_num;
    // Alto de cuerpo ESTIMADO — solo esquemático
    const body_h   = Math.min(Math.max(bore_mm * 2.5, OD_mm * 1.0), F2F * 0.65);
    const flange_t = Math.max(OD_mm * 0.09, 10);

    const bx0 = -F2F / 2;
    const bx1 =  F2F / 2;
    const by0 = -body_h / 2;
    const by1 =  body_h / 2;
    const fy0 = -OD_mm / 2;
    const fy1 =  OD_mm / 2;

    // Helpers locales con capas nominadas correctamente
    const L = (x1: number, y1: number, x2: number, y2: number, layer: string, color: number) =>
      ['  0','LINE','  8',layer,' 62',String(color),
       ' 10',x1.toFixed(3),' 20',y1.toFixed(3),' 30','0.000',
       ' 11',x2.toFixed(3),' 21',y2.toFixed(3),' 31','0.000'].join('\n');

    const T = (x: number, y: number, h: number, txt: string, layer: string, color: number) =>
      ['  0','TEXT','  8',layer,' 62',String(color),
       ' 10',x.toFixed(3),' 20',y.toFixed(3),' 30','0.000',
       ' 40',h.toFixed(3),'  1',txt,' 50','0.000'].join('\n');

    const ents: string[] = [];

    // ── CUERPO — rectángulo cuerpo válvula (F2F × alto estimado) + paso bore — blanco 7 ──
    ents.push(L(bx0, by0, bx1, by0, 'CUERPO', 7)); // fondo
    ents.push(L(bx1, by0, bx1, by1, 'CUERPO', 7)); // derecha
    ents.push(L(bx1, by1, bx0, by1, 'CUERPO', 7)); // techo
    ents.push(L(bx0, by1, bx0, by0, 'CUERPO', 7)); // izquierda
    // Paso de bore (tubería de conexión, visible a ambos lados)
    const hb = bore_mm / 2;
    ents.push(L(bx0 - 22,  hb, bx1 + 22,  hb, 'CUERPO', 7));
    ents.push(L(bx0 - 22, -hb, bx1 + 22, -hb, 'CUERPO', 7));

    // ── CUÑA — compuerta/cuña (gate wedge schematic) — rojo 1 ───────────────
    const cuna_w  = Math.min(bore_mm * 0.45, body_h * 0.30); // semi-ancho horizontal
    const cuna_h  = Math.min(body_h  * 0.35, bore_mm * 0.65); // semi-alto vertical
    const stem_ht = Math.max(22, body_h * 0.28); // extensión vástago sobre cuerpo
    // Rombo (cuña)
    ents.push(L( 0,       cuna_h,  cuna_w, 0,       'CUÑA', 1));
    ents.push(L( cuna_w,  0,       0,     -cuna_h,  'CUÑA', 1));
    ents.push(L( 0,      -cuna_h, -cuna_w, 0,       'CUÑA', 1));
    ents.push(L(-cuna_w,  0,       0,      cuna_h,  'CUÑA', 1));
    // Vástago (stem)
    ents.push(L(0, cuna_h, 0, by1 + stem_ht, 'CUÑA', 1));
    // Indicador actuador / volante
    ents.push(L(-10, by1 + stem_ht,     10, by1 + stem_ht,     'CUÑA', 1));
    ents.push(L( -7, by1 + stem_ht + 5,  7, by1 + stem_ht + 5, 'CUÑA', 1));

    // ── BRIDA — indicación B16.5 en cada extremo — verde 3 ─────────────────
    ents.push(L(bx0 - flange_t, fy0, bx0,            fy0, 'BRIDA', 3));
    ents.push(L(bx0,            fy0, bx0,            fy1, 'BRIDA', 3));
    ents.push(L(bx0,            fy1, bx0 - flange_t, fy1, 'BRIDA', 3));
    ents.push(L(bx0 - flange_t, fy1, bx0 - flange_t, fy0, 'BRIDA', 3));
    ents.push(L(bx1,            fy0, bx1 + flange_t, fy0, 'BRIDA', 3));
    ents.push(L(bx1 + flange_t, fy0, bx1 + flange_t, fy1, 'BRIDA', 3));
    ents.push(L(bx1 + flange_t, fy1, bx1,            fy1, 'BRIDA', 3));
    ents.push(L(bx1,            fy1, bx1,            fy0, 'BRIDA', 3));

    // ── ANOTACIONES — amarillo 2 / rojo 1 para advertencias ─────────────────
    const clearance = Math.max(OD_mm / 2, body_h / 2);
    const ay_top = clearance + 16;
    const ay_bot = -(clearance + 14);

    ents.push(T(bx0 - flange_t, ay_top + 40, 6,
      'INGENIUM PRO v8.1 - VALVULA INDUSTRIAL - PLANO ESQUEMATICO', 'ANOTACIONES', 2));
    ents.push(T(bx0 - flange_t, ay_top + 28, 5,
      `NPS ${nps}" - Class ${clase} - Face-to-Face: ${F2F.toFixed(0)} mm (ASME B16.10 Tabla 1, valvula compuerta)`, 'ANOTACIONES', 2));
    ents.push(T(bx0 - flange_t, ay_top + 16, 4.5,
      `Bore: ${bore_mm.toFixed(1)} mm - OD brida: ${OD_mm.toFixed(1)} mm - BC pernos: ${BC_mm.toFixed(1)} mm - N pernos: ${n_pern} - Brida ASME B16.5 | Compuerta ASME B16.34/API 600`, 'ANOTACIONES', 2));
    ents.push(T(bx0 - flange_t, ay_top + 4, 4,
      `Proyecto: ${proyecto || 'Sin nombre'} - Fecha: ${fecha} - Normativa: ASME B16.34 / B16.10 / B16.5`, 'ANOTACIONES', 2));
    ents.push(T(bx0 - flange_t, ay_top - 9, 3.5,
      `Ing: ${String(p._usr_nombre || '') || '—'}  Email: ${String(p._usr_email || '') || '—'}  Mat: ${String(p._usr_matricula || '') || '—'}  DNI: ${String(p._usr_dni || '') || '—'}`, 'ANOTACIONES', 7));
    ents.push(T(bx0 - flange_t, ay_top - 21, 3.5,
      `Empresa: ${String(p._usr_empresa || '') || '—'}  Pais: ${String(p._usr_pais || '') || '—'}`, 'ANOTACIONES', 7));

    // Cota F2F
    const yd = by0 - 12;
    ents.push(L(bx0 - flange_t, by0 - 4, bx0 - flange_t, by0 - 18, 'ANOTACIONES', 2));
    ents.push(L(bx1 + flange_t, by0 - 4, bx1 + flange_t, by0 - 18, 'ANOTACIONES', 2));
    ents.push(L(bx0 - flange_t, yd,      bx1 + flange_t, yd,       'ANOTACIONES', 2));
    ents.push(T(-F2F / 4, yd - 8, 3.5,
      `F-to-F = ${F2F.toFixed(0)} mm`, 'ANOTACIONES', 2));

    // Advertencias obligatorias
    ents.push(T(bx0 - flange_t, ay_bot - 2, 4.5,
      '* Plano esquematico de referencia - requiere validacion de fabricante antes de mecanizar.', 'ANOTACIONES', 1));
    ents.push(T(bx0 - flange_t, ay_bot - 14, 4,
      `* Alto de cuerpo (${body_h.toFixed(0)} mm) ESTIMADO - no dimensional. F-to-F segun ASME B16.10 Tabla 1.`, 'ANOTACIONES', 1));
    ents.push(T(bx0 - flange_t, ay_bot - 26, 4,
      '* Verificar todas las dimensiones con el fabricante. Plano NO apto para fabricacion directa.', 'ANOTACIONES', 1));

    // Cabecera DXF AC1015 (2000+) — soporta caracteres extendidos (Ñ)
    // 4 capas: CUERPO, CUÑA, BRIDA, ANOTACIONES
    const header = [
      '  0','SECTION','  2','HEADER',
      '  9','$ACADVER','  1','AC1015',
      '  9','$INSUNITS',' 70','4',
      '  0','ENDSEC',
      '  0','SECTION','  2','TABLES',
      '  0','TABLE','  2','LAYER',' 70','4',
      '  0','LAYER','  2','CUERPO',      ' 70','0',' 62','7','  6','CONTINUOUS',
      '  0','LAYER','  2','CUÑA',        ' 70','0',' 62','1','  6','CONTINUOUS',
      '  0','LAYER','  2','BRIDA',       ' 70','0',' 62','3','  6','CONTINUOUS',
      '  0','LAYER','  2','ANOTACIONES', ' 70','0',' 62','2','  6','CONTINUOUS',
      '  0','ENDTAB','  0','ENDSEC',
      '  0','SECTION','  2','ENTITIES',
    ].join('\n');

    return [header, ...ents, '  0','ENDSEC','  0','EOF'].join('\n');
  }

  // ═══════════════════════════════════════════════════════════
  //  MÓDULO VÁLVULAS — BOLA (Ball Valve) API 6D / ASME B16.10
  //  Capas: CUERPO · ESFERA · BRIDA · ANOTACIONES
  //  Face-to-face per ASME B16.10 Long Pattern (bola)
  //  Plano esquemático de referencia — NO dimensional
  // ═══════════════════════════════════════════════════════════

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function exportarDXFBola(p: Record<string, any>): string {
    const nps      = String(p['NPS (pulg)']          ?? '');
    const clase    = String(p['Clase de presion']     ?? '');
    const OD_mm    = Number(p['OD (mm)']              ?? 0);
    const BC_mm    = Number(p['BC (mm)']              ?? 0);
    const bore_mm  = Number(p['Bore (mm)']            ?? 0);
    const n_pern   = Number(p['Numero de pernos']     ?? 0);
    const proyecto = String(p['Proyecto']             ?? '');
    const f2f_raw  = p['F2F ASME B16.10 (mm)'];
    const fecha    = new Date().toLocaleDateString('es-AR');

    const f2f_num = (f2f_raw != null && f2f_raw !== 'Consultar fabricante') ? Number(f2f_raw) : 0;
    if (!f2f_num || f2f_num <= 0) return '';

    const F2F      = f2f_num;
    const ref_h    = bore_mm > 0 ? bore_mm : OD_mm > 0 ? OD_mm * 0.5 : F2F * 0.4;
    const body_h   = Math.min(Math.max(ref_h * 2.5, OD_mm > 0 ? OD_mm * 1.0 : 0), F2F * 0.65);
    const flange_t = Math.max(OD_mm > 0 ? OD_mm * 0.09 : 10, 10);

    const bx0 = -F2F / 2;
    const bx1 =  F2F / 2;
    const by0 = -body_h / 2;
    const by1 =  body_h / 2;
    const fy0 = -(OD_mm > 0 ? OD_mm / 2 : body_h / 2);
    const fy1 =  (OD_mm > 0 ? OD_mm / 2 : body_h / 2);

    const L = (x1: number, y1: number, x2: number, y2: number, layer: string, color: number) =>
      ['  0','LINE','  8',layer,' 62',String(color),
       ' 10',x1.toFixed(3),' 20',y1.toFixed(3),' 30','0.000',
       ' 11',x2.toFixed(3),' 21',y2.toFixed(3),' 31','0.000'].join('\n');

    const C = (cx: number, cy: number, r: number, layer: string, color: number) =>
      ['  0','CIRCLE','  8',layer,' 62',String(color),
       ' 10',cx.toFixed(3),' 20',cy.toFixed(3),' 30','0.000',
       ' 40',r.toFixed(3)].join('\n');

    const T = (x: number, y: number, h: number, txt: string, layer: string, color: number) =>
      ['  0','TEXT','  8',layer,' 62',String(color),
       ' 10',x.toFixed(3),' 20',y.toFixed(3),' 30','0.000',
       ' 40',h.toFixed(3),'  1',txt,' 50','0.000'].join('\n');

    const ents: string[] = [];

    // ── CUERPO — rectángulo cuerpo válvula + paso bore — blanco 7 ──
    ents.push(L(bx0, by0, bx1, by0, 'CUERPO', 7));
    ents.push(L(bx1, by0, bx1, by1, 'CUERPO', 7));
    ents.push(L(bx1, by1, bx0, by1, 'CUERPO', 7));
    ents.push(L(bx0, by1, bx0, by0, 'CUERPO', 7));
    if (bore_mm > 0) {
      const hb = bore_mm / 2;
      ents.push(L(bx0 - 22,  hb, bx1 + 22,  hb, 'CUERPO', 7));
      ents.push(L(bx0 - 22, -hb, bx1 + 22, -hb, 'CUERPO', 7));
    }

    // ── ESFERA — bola de cierre full bore + tallo 1/4 vuelta — cyan 4 ──
    if (bore_mm > 0) {
      const ball_r   = bore_mm / 2;
      const stem_top = by1 + Math.max(22, body_h * 0.30);
      ents.push(C(0, 0, ball_r, 'ESFERA', 4));
      ents.push(L(0, ball_r, 0, stem_top, 'ESFERA', 4));
      ents.push(L(-12, stem_top,     12, stem_top,     'ESFERA', 4));
      ents.push(L( -9, stem_top + 6,  9, stem_top + 6, 'ESFERA', 4));
    }

    // ── BRIDA — indicación B16.5 en cada extremo — verde 3 ──
    ents.push(L(bx0 - flange_t, fy0, bx0,            fy0, 'BRIDA', 3));
    ents.push(L(bx0,            fy0, bx0,            fy1, 'BRIDA', 3));
    ents.push(L(bx0,            fy1, bx0 - flange_t, fy1, 'BRIDA', 3));
    ents.push(L(bx0 - flange_t, fy1, bx0 - flange_t, fy0, 'BRIDA', 3));
    ents.push(L(bx1,            fy0, bx1 + flange_t, fy0, 'BRIDA', 3));
    ents.push(L(bx1 + flange_t, fy0, bx1 + flange_t, fy1, 'BRIDA', 3));
    ents.push(L(bx1 + flange_t, fy1, bx1,            fy1, 'BRIDA', 3));
    ents.push(L(bx1,            fy1, bx1,            fy0, 'BRIDA', 3));

    // ── ANOTACIONES — amarillo 2 / rojo 1 advertencias ──
    const clearance = Math.max(OD_mm > 0 ? OD_mm / 2 : body_h / 2, body_h / 2);
    const stem_ext  = bore_mm > 0 ? Math.max(22, body_h * 0.30) + 12 : 30;
    const ay_top    = clearance + stem_ext + 20;
    const ay_bot    = -(clearance + 14);

    ents.push(T(bx0 - flange_t, ay_top + 40, 6,
      'INGENIUM PRO v8.1 - VALVULA DE BOLA - PLANO ESQUEMATICO', 'ANOTACIONES', 2));
    ents.push(T(bx0 - flange_t, ay_top + 28, 5,
      `NPS ${nps}" - Class ${clase} - Face-to-Face: ${F2F.toFixed(0)} mm (ASME B16.10 Long Pattern, API 6D)`, 'ANOTACIONES', 2));

    const bore_txt = bore_mm > 0
      ? `Bore: ${bore_mm.toFixed(1)} mm - OD brida: ${OD_mm.toFixed(1)} mm - BC: ${BC_mm.toFixed(1)} mm - N pernos: ${n_pern} - Bola full bore ASME B16.34/API 6D`
      : `OD brida: ${OD_mm.toFixed(1)} mm - BC: ${BC_mm.toFixed(1)} mm - N pernos: ${n_pern} - Bore: consultar fabricante`;
    ents.push(T(bx0 - flange_t, ay_top + 16, 4.5, bore_txt, 'ANOTACIONES', 2));
    ents.push(T(bx0 - flange_t, ay_top + 4, 4,
      `Proyecto: ${proyecto || 'Sin nombre'} - Fecha: ${fecha} - Normativa: ASME B16.34 / B16.10 / B16.5 / API 6D`, 'ANOTACIONES', 2));
    ents.push(T(bx0 - flange_t, ay_top - 9, 3.5,
      `Ing: ${String(p._usr_nombre || '') || '—'}  Email: ${String(p._usr_email || '') || '—'}  Mat: ${String(p._usr_matricula || '') || '—'}  DNI: ${String(p._usr_dni || '') || '—'}`, 'ANOTACIONES', 7));
    ents.push(T(bx0 - flange_t, ay_top - 21, 3.5,
      `Empresa: ${String(p._usr_empresa || '') || '—'}  Pais: ${String(p._usr_pais || '') || '—'}`, 'ANOTACIONES', 7));

    // Cota F2F
    const yd = by0 - 12;
    ents.push(L(bx0 - flange_t, by0 - 4, bx0 - flange_t, by0 - 18, 'ANOTACIONES', 2));
    ents.push(L(bx1 + flange_t, by0 - 4, bx1 + flange_t, by0 - 18, 'ANOTACIONES', 2));
    ents.push(L(bx0 - flange_t, yd,      bx1 + flange_t, yd,       'ANOTACIONES', 2));
    ents.push(T(-F2F / 4, yd - 8, 3.5, `F-to-F = ${F2F.toFixed(0)} mm`, 'ANOTACIONES', 2));

    // Advertencias obligatorias
    ents.push(T(bx0 - flange_t, ay_bot - 2, 4.5,
      '* Plano esquematico - requiere validacion de fabricante antes de mecanizar.', 'ANOTACIONES', 1));
    ents.push(T(bx0 - flange_t, ay_bot - 14, 4,
      `* Alto de cuerpo (${body_h.toFixed(0)} mm) ESTIMADO - no dimensional. F-to-F segun ASME B16.10 Long Pattern.`, 'ANOTACIONES', 1));
    ents.push(T(bx0 - flange_t, ay_bot - 26, 4,
      '* Verificar todas las dimensiones con el fabricante. Plano NO apto para fabricacion directa.', 'ANOTACIONES', 1));

    // Cabecera AC1015 — 4 capas: CUERPO, ESFERA, BRIDA, ANOTACIONES
    const header = [
      '  0','SECTION','  2','HEADER',
      '  9','$ACADVER','  1','AC1015',
      '  9','$INSUNITS',' 70','4',
      '  0','ENDSEC',
      '  0','SECTION','  2','TABLES',
      '  0','TABLE','  2','LAYER',' 70','4',
      '  0','LAYER','  2','CUERPO',      ' 70','0',' 62','7','  6','CONTINUOUS',
      '  0','LAYER','  2','ESFERA',      ' 70','0',' 62','4','  6','CONTINUOUS',
      '  0','LAYER','  2','BRIDA',       ' 70','0',' 62','3','  6','CONTINUOUS',
      '  0','LAYER','  2','ANOTACIONES', ' 70','0',' 62','2','  6','CONTINUOUS',
      '  0','ENDTAB','  0','ENDSEC',
      '  0','SECTION','  2','ENTITIES',
    ].join('\n');

    return [header, ...ents, '  0','ENDSEC','  0','EOF'].join('\n');
  }

  // ═══════════════════════════════════════════════════════════
  //  MÓDULO VÁLVULAS — MARIPOSA (Butterfly) API 609 / MSS SP-67
  //  Capas: CUERPO · EJE · BRIDA · ANOTACIONES
  //  CUERPO = disco circular diámetro = NPS en mm
  //  Plano esquemático de referencia — NO dimensional
  // ═══════════════════════════════════════════════════════════

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function exportarDXFMariposa(p: Record<string, any>): string {
    const nps      = String(p['NPS (pulg)']          ?? '');
    const clase    = String(p['Clase de presion']     ?? '');
    const estilo   = String(p['Estilo']               ?? 'Wafer');
    const proyecto = String(p['Proyecto']             ?? '');
    const f2f_raw  = p['F2F ASME B16.10 (mm)'];
    const _ahora   = new Date();
    const fechaHora = `${_ahora.getFullYear()}-${String(_ahora.getMonth()+1).padStart(2,'0')}-${String(_ahora.getDate()).padStart(2,'0')} ${String(_ahora.getHours()).padStart(2,'0')}:${String(_ahora.getMinutes()).padStart(2,'0')}`;

    const nps_num = parseFloat(nps);
    if (isNaN(nps_num) || nps_num <= 0) return '';

    const disc_r   = (nps_num * 25.4) / 2;          // radio disco = NPS/2 en mm
    const disc_d   = disc_r * 2;                     // diámetro disco en mm
    const body_hw  = Math.max(disc_r * 0.15, 8);    // semi-ancho cuerpo estimado (flujo)
    const stem_len = Math.max(disc_r * 0.55, 22);   // extensión vástago sobre disco
    const flange_t = Math.max(disc_r * 0.12, 8);    // espesor referencia cara brida

    const f2f_num = (f2f_raw != null && f2f_raw !== 'Consultar fabricante') ? Number(f2f_raw) : 0;

    const L = (x1: number, y1: number, x2: number, y2: number, layer: string, color: number) =>
      ['  0','LINE','  8',layer,' 62',String(color),
       ' 10',x1.toFixed(3),' 20',y1.toFixed(3),' 30','0.000',
       ' 11',x2.toFixed(3),' 21',y2.toFixed(3),' 31','0.000'].join('\n');

    const C = (cx: number, cy: number, r: number, layer: string, color: number) =>
      ['  0','CIRCLE','  8',layer,' 62',String(color),
       ' 10',cx.toFixed(3),' 20',cy.toFixed(3),' 30','0.000',
       ' 40',r.toFixed(3)].join('\n');

    const T = (x: number, y: number, h: number, txt: string, layer: string, color: number) =>
      ['  0','TEXT','  8',layer,' 62',String(color),
       ' 10',x.toFixed(3),' 20',y.toFixed(3),' 30','0.000',
       ' 40',h.toFixed(3),'  1',txt,' 50','0.000'].join('\n');

    const ents: string[] = [];

    // ── CUERPO — disco circular diámetro = NPS en mm + líneas cara cuerpo — blanco 7 ──
    ents.push(C(0, 0, disc_r, 'CUERPO', 7));
    ents.push(L(-body_hw, -disc_r, -body_hw, disc_r, 'CUERPO', 7)); // cara cuerpo izq
    ents.push(L( body_hw, -disc_r,  body_hw, disc_r, 'CUERPO', 7)); // cara cuerpo der

    // ── EJE — vástago central + indicador palanca 1/4 vuelta — magenta 6 ──
    const stem_top = disc_r + stem_len;
    ents.push(L(0, -(disc_r * 0.9), 0, stem_top, 'EJE', 6));        // eje completo
    ents.push(L(-14, stem_top,      14, stem_top,     'EJE', 6));    // palanca
    ents.push(L(-10, stem_top + 7,  10, stem_top + 7, 'EJE', 6));    // palanca sup

    // ── BRIDA — caras de conexión (pipe flanges) — verde 3 ──
    const fy0 = -(disc_r + 8);
    const fy1 =  (disc_r + 8);
    ents.push(L(-(body_hw + flange_t), fy0, -body_hw,             fy0, 'BRIDA', 3));
    ents.push(L(-body_hw,             fy0, -body_hw,             fy1, 'BRIDA', 3));
    ents.push(L(-body_hw,             fy1, -(body_hw + flange_t), fy1, 'BRIDA', 3));
    ents.push(L(-(body_hw + flange_t), fy1, -(body_hw + flange_t), fy0, 'BRIDA', 3));
    ents.push(L( body_hw,              fy0,  body_hw + flange_t,  fy0, 'BRIDA', 3));
    ents.push(L( body_hw + flange_t,   fy0,  body_hw + flange_t, fy1, 'BRIDA', 3));
    ents.push(L( body_hw + flange_t,   fy1,  body_hw,            fy1, 'BRIDA', 3));
    ents.push(L( body_hw,              fy1,  body_hw,            fy0, 'BRIDA', 3));

    // ── ANOTACIONES — amarillo 2 / rojo 1 advertencias ──
    const ax0     = -(disc_r + body_hw + flange_t);
    const ay_top  = stem_top + 22;
    const ay_bot  = -(disc_r + 28);
    const f2f_txt = f2f_num > 0 ? `${f2f_num.toFixed(0)} mm` : 'Consultar fabricante';

    ents.push(T(ax0, ay_top + 40, 6,
      'INGENIUM PRO v8.1 - VALVULA DE MARIPOSA - PLANO ESQUEMATICO', 'ANOTACIONES', 2));
    ents.push(T(ax0, ay_top + 28, 5,
      `NPS ${nps}" - Class ${clase} - Estilo: ${estilo} - Face-to-Face: ${f2f_txt}`, 'ANOTACIONES', 2));
    ents.push(T(ax0, ay_top + 16, 4.5,
      `Diametro disco: ${disc_d.toFixed(1)} mm (NPS x 25.4) - Normativa: API 609 / MSS SP-67 / ASME B16.34 / B16.5`, 'ANOTACIONES', 2));
    ents.push(T(ax0, ay_top + 4, 4,
      `Proyecto: ${proyecto || 'Sin nombre'} - Fecha/Hora: ${fechaHora} - Apertura: 1/4 vuelta`, 'ANOTACIONES', 2));
    ents.push(T(ax0, ay_top - 9, 3.5,
      `Ing: ${String(p._usr_nombre || '') || '—'}  Email: ${String(p._usr_email || '') || '—'}  Mat: ${String(p._usr_matricula || '') || '—'}  DNI: ${String(p._usr_dni || '') || '—'}`, 'ANOTACIONES', 7));
    ents.push(T(ax0, ay_top - 21, 3.5,
      `Empresa: ${String(p._usr_empresa || '') || '—'}  Pais: ${String(p._usr_pais || '') || '—'}`, 'ANOTACIONES', 7));

    // Cota disco (siempre disponible) o F2F
    const yd = -(disc_r + 14);
    if (f2f_num > 0) {
      const xf0 = -(body_hw + flange_t);
      const xf1 =  (body_hw + flange_t);
      ents.push(L(xf0, -(disc_r + 4), xf0, -(disc_r + 18), 'ANOTACIONES', 2));
      ents.push(L(xf1, -(disc_r + 4), xf1, -(disc_r + 18), 'ANOTACIONES', 2));
      ents.push(L(xf0, yd, xf1, yd, 'ANOTACIONES', 2));
      ents.push(T(0, yd - 9, 3.5, `F-to-F = ${f2f_num.toFixed(0)} mm`, 'ANOTACIONES', 2));
    } else {
      ents.push(L(-disc_r, -(disc_r - 4), -disc_r, yd, 'ANOTACIONES', 2));
      ents.push(L( disc_r, -(disc_r - 4),  disc_r, yd, 'ANOTACIONES', 2));
      ents.push(L(-disc_r, yd, disc_r, yd, 'ANOTACIONES', 2));
      ents.push(T(0, yd - 9, 3.5, `Disco = ${disc_d.toFixed(1)} mm (NPS x 25.4)`, 'ANOTACIONES', 2));
    }

    // Advertencias obligatorias
    ents.push(T(ax0, ay_bot, 4.5,
      '* Plano esquematico - requiere validacion de fabricante antes de mecanizar.', 'ANOTACIONES', 1));
    ents.push(T(ax0, ay_bot - 12, 4,
      `* Ancho cuerpo (${(body_hw * 2).toFixed(0)} mm) ESTIMADO - F-to-F segun API 609 / ASME B16.10 (estilo ${estilo}).`, 'ANOTACIONES', 1));
    ents.push(T(ax0, ay_bot - 24, 4,
      '* Verificar con fabricante. Plano NO apto para fabricacion directa.', 'ANOTACIONES', 1));

    // Cabecera AC1015 — 4 capas: CUERPO, EJE, BRIDA, ANOTACIONES
    const header = [
      '  0','SECTION','  2','HEADER',
      '  9','$ACADVER','  1','AC1015',
      '  9','$INSUNITS',' 70','4',
      '  0','ENDSEC',
      '  0','SECTION','  2','TABLES',
      '  0','TABLE','  2','LAYER',' 70','4',
      '  0','LAYER','  2','CUERPO',      ' 70','0',' 62','7','  6','CONTINUOUS',
      '  0','LAYER','  2','EJE',         ' 70','0',' 62','6','  6','CONTINUOUS',
      '  0','LAYER','  2','BRIDA',       ' 70','0',' 62','3','  6','CONTINUOUS',
      '  0','LAYER','  2','ANOTACIONES', ' 70','0',' 62','2','  6','CONTINUOUS',
      '  0','ENDTAB','  0','ENDSEC',
      '  0','SECTION','  2','ENTITIES',
    ].join('\n');

    return [header, ...ents, '  0','ENDSEC','  0','EOF'].join('\n');
  }

// ─────────────────────────────────────────────────────────────────────────────
// VÁLVULA DE RETENCIÓN — ASME B16.10-2022 + API STD 594
// Subtipos: Swing (clapeta giratoria), Lift (disco axial), Tilting Disc
// 4 capas: CUERPO (7), CLAPETA (5), BRIDA (3), ANOTACIONES (2/1)
// ─────────────────────────────────────────────────────────────────────────────
export function exportarDXFRetencion(p: Record<string, unknown>): string {
  const nps_num  = parseFloat(String(p['NPS (pulg)'] ?? p['NPS'] ?? 0));
  if (!(nps_num > 0)) return '';
  const clase    = String(p['Clase de presion'] ?? p['clase'] ?? '600');
  const subtipo  = String(p['Subtipo'] ?? 'Swing');
  const proyecto = String(p['Proyecto'] ?? p['proyecto'] ?? '');
  const ahora    = new Date();
  const fechaHora = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')} ${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}`;

  const f2f_raw = p['F2F ASME B16.10 (mm)'] ?? p['F2F ASME B16.10 resultado (mm)'] ?? p['F2F'] ?? 0;
  const f2f_num = typeof f2f_raw === 'number' ? f2f_raw : parseFloat(String(f2f_raw));
  if (!(f2f_num > 0)) return '';

  const OD_raw    = p['OD (mm)'];
  const BC_raw    = p['BC (mm)'];
  const bore_raw  = p['Bore (mm)'];
  const npern_raw = p['Numero de pernos'];
  const OD_mm   = typeof OD_raw    === 'number' ? OD_raw    : parseFloat(String(OD_raw    ?? 0));
  const BC_mm   = typeof BC_raw    === 'number' ? BC_raw    : parseFloat(String(BC_raw    ?? 0));
  const bore_mm = typeof bore_raw  === 'number' ? bore_raw  : parseFloat(String(bore_raw  ?? (nps_num * 25.4 * 0.9)));
  const n_pern  = typeof npern_raw === 'number' ? npern_raw : parseInt(String(npern_raw   ?? 8));

  const hw       = f2f_num / 2;
  const body_h   = OD_mm > 0 ? OD_mm / 2 : nps_num * 25.4 * 0.8;
  const bore_r   = bore_mm > 0 ? bore_mm / 2 : nps_num * 25.4 / 2;
  const flange_t = OD_mm > 0 ? OD_mm * 0.06 : nps_num * 25.4 * 0.12;
  const flange_h = OD_mm > 0 ? OD_mm / 2 : body_h;

  type Ent = string;
  const ents: Ent[] = [];

  const L = (x1: number, y1: number, x2: number, y2: number, lyr: string, col: number): Ent =>
    `  0\nLINE\n  8\n${lyr}\n 62\n${col}\n 10\n${x1.toFixed(3)}\n 20\n${y1.toFixed(3)}\n 30\n0.0\n 11\n${x2.toFixed(3)}\n 21\n${y2.toFixed(3)}\n 31\n0.0`;
  const C = (cx: number, cy: number, r: number, lyr: string, col: number): Ent =>
    `  0\nCIRCLE\n  8\n${lyr}\n 62\n${col}\n 10\n${cx.toFixed(3)}\n 20\n${cy.toFixed(3)}\n 30\n0.0\n 40\n${r.toFixed(3)}`;
  const T = (x: number, y: number, h: number, txt: string, lyr: string, col: number): Ent =>
    `  0\nTEXT\n  8\n${lyr}\n 62\n${col}\n 10\n${x.toFixed(3)}\n 20\n${y.toFixed(3)}\n 30\n0.0\n 40\n${h.toFixed(2)}\n  1\n${txt}\n 72\n1\n 11\n${x.toFixed(3)}\n 21\n${y.toFixed(3)}\n 31\n0.0`;

  // CUERPO — body rectangle + bore passage lines
  ents.push(L(-hw, -body_h,  hw, -body_h, 'CUERPO', 7));
  ents.push(L( hw, -body_h,  hw,  body_h, 'CUERPO', 7));
  ents.push(L( hw,  body_h, -hw,  body_h, 'CUERPO', 7));
  ents.push(L(-hw,  body_h, -hw, -body_h, 'CUERPO', 7));
  ents.push(L(-hw,  bore_r,  hw,  bore_r, 'CUERPO', 7));
  ents.push(L(-hw, -bore_r,  hw, -bore_r, 'CUERPO', 7));

  // CLAPETA — schematic in semi-open position
  if (subtipo === 'Swing') {
    const hx  = hw * 0.1;
    const hy  = bore_r;
    const dl  = bore_r * 2;
    const ang = Math.PI / 4;
    ents.push(C(hx, hy, bore_r * 0.08, 'CLAPETA', 5));
    ents.push(L(hx, hy, hx + dl * Math.sin(ang), hy - dl * Math.cos(ang), 'CLAPETA', 5));
    ents.push(L(hx, hy, hx, hy - dl, 'CLAPETA', 5));
  } else if (subtipo === 'Lift') {
    ents.push(C(0, 0, bore_r * 0.45, 'CLAPETA', 5));
    ents.push(L(0, bore_r * 0.45, 0, bore_r, 'CLAPETA', 5));
    ents.push(L(-bore_r * 0.5, 0, bore_r * 0.5, 0, 'CLAPETA', 5));
  } else {
    const tilt = Math.PI / 6;
    const tdx = bore_r * Math.sin(tilt);
    const tdy = bore_r * Math.cos(tilt);
    ents.push(C(0, 0, bore_r * 0.08, 'CLAPETA', 5));
    ents.push(L(-tdx, -tdy, tdx, tdy, 'CLAPETA', 5));
  }

  // BRIDA — left and right flanges with bolt holes
  for (const side of [-1, 1] as const) {
    const x0 = side * hw;
    const x1 = side * (hw + flange_t);
    ents.push(L(x0, -flange_h, x1, -flange_h, 'BRIDA', 3));
    ents.push(L(x1, -flange_h, x1,  flange_h, 'BRIDA', 3));
    ents.push(L(x1,  flange_h, x0,  flange_h, 'BRIDA', 3));
    if (BC_mm > 0 && n_pern > 0) {
      const r_bc  = BC_mm / 2;
      const scale = flange_h / (OD_mm > 0 ? OD_mm / 2 : flange_h);
      const cx    = side * (hw + flange_t * 0.5);
      for (let i = 0; i < n_pern; i++) {
        const bang = (Math.PI * i) / n_pern;
        ents.push(C(cx, r_bc * Math.sin(bang) * scale, 1.5, 'BRIDA', 3));
      }
    }
  }

  // ANOTACIONES
  const ax0    = -(hw + flange_t);
  const ay_top = body_h + 12;
  const ay_bot = -(body_h + 22);

  ents.push(T(ax0, ay_top + 40, 5,
    'INGENIUM PRO v8.1 - VALVULA DE RETENCION - PLANO ESQUEMATICO', 'ANOTACIONES', 2));
  ents.push(T(ax0, ay_top + 28, 5,
    `NPS ${nps_num}" - Class ${clase} - Subtipo: ${subtipo} Check`, 'ANOTACIONES', 2));
  ents.push(T(ax0, ay_top + 16, 4.5,
    `Face-to-Face: ${f2f_num.toFixed(0)} mm (${(f2f_num / 25.4).toFixed(2)}") - Normativa: ASME B16.10-2022 + API STD 594`, 'ANOTACIONES', 2));
  ents.push(T(ax0, ay_top + 4, 4,
    `Proyecto: ${proyecto || 'Sin nombre'} - Fecha/Hora: ${fechaHora}`, 'ANOTACIONES', 2));
  ents.push(T(ax0, ay_top - 9, 3.5,
    `Ing: ${String((p as any)._usr_nombre || '') || '—'}  Email: ${String((p as any)._usr_email || '') || '—'}  Mat: ${String((p as any)._usr_matricula || '') || '—'}  DNI: ${String((p as any)._usr_dni || '') || '—'}`, 'ANOTACIONES', 7));
  ents.push(T(ax0, ay_top - 21, 3.5,
    `Empresa: ${String((p as any)._usr_empresa || '') || '—'}  Pais: ${String((p as any)._usr_pais || '') || '—'}`, 'ANOTACIONES', 7));

  const xf0 = -(hw + flange_t);
  const xf1 =  (hw + flange_t);
  const yd  = -(body_h + 8);
  ents.push(L(xf0, -(body_h - 2), xf0, yd, 'ANOTACIONES', 2));
  ents.push(L(xf1, -(body_h - 2), xf1, yd, 'ANOTACIONES', 2));
  ents.push(L(xf0, yd, xf1, yd, 'ANOTACIONES', 2));
  ents.push(T(0, yd - 9, 3.5, `F-to-F = ${f2f_num.toFixed(0)} mm`, 'ANOTACIONES', 2));

  ents.push(T(ax0, ay_bot,      4.5, '* Plano esquematico - requiere validacion de fabricante antes de mecanizar.', 'ANOTACIONES', 1));
  ents.push(T(ax0, ay_bot - 12, 4,   `* Subtipo: ${subtipo} Check - Clapeta en posicion semi-abierta. ASME B16.10-2022 + API STD 594.`, 'ANOTACIONES', 1));
  ents.push(T(ax0, ay_bot - 24, 4,   '* Verificar con fabricante. Plano NO apto para fabricacion directa.', 'ANOTACIONES', 1));

  const header = [
    '  0','SECTION','  2','HEADER',
    '  9','$ACADVER','  1','AC1015',
    '  9','$INSUNITS',' 70','4',
    '  0','ENDSEC',
    '  0','SECTION','  2','TABLES',
    '  0','TABLE','  2','LAYER',' 70','4',
    '  0','LAYER','  2','CUERPO',      ' 70','0',' 62','7','  6','CONTINUOUS',
    '  0','LAYER','  2','CLAPETA',     ' 70','0',' 62','5','  6','CONTINUOUS',
    '  0','LAYER','  2','BRIDA',       ' 70','0',' 62','3','  6','CONTINUOUS',
    '  0','LAYER','  2','ANOTACIONES', ' 70','0',' 62','2','  6','CONTINUOUS',
    '  0','ENDTAB','  0','ENDSEC',
    '  0','SECTION','  2','ENTITIES',
  ].join('\n');

  return [header, ...ents, '  0','ENDSEC','  0','EOF'].join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// VÁLVULA DE TAPÓN — ASME B16.10-2022 + MSS SP-78
// Patrones: Regular / Venturi — F2F idéntico por patrón
// 4 capas: CUERPO (7), TAPON_CONICO (4), BRIDA (3), ANOTACIONES (2/1)
// ─────────────────────────────────────────────────────────────────────────────
export function exportarDXFTapon(p: Record<string, unknown>): string {
  const nps_num  = parseFloat(String(p['NPS (pulg)'] ?? p['NPS'] ?? 0));
  if (!(nps_num > 0)) return '';
  const clase    = String(p['Clase de presion'] ?? p['clase'] ?? '600');
  const patron   = String(p['Patron'] ?? p['patron'] ?? 'Regular');
  const proyecto = String(p['Proyecto'] ?? p['proyecto'] ?? '');
  const fecha    = new Date().toISOString().slice(0, 10);

  const f2f_raw = p['F2F ASME B16.10 (mm)'] ?? p['F2F ASME B16.10 resultado (mm)'] ?? p['F2F'] ?? 0;
  const f2f_num = typeof f2f_raw === 'number' ? f2f_raw : parseFloat(String(f2f_raw));
  if (!(f2f_num > 0)) return '';

  const OD_raw    = p['OD (mm)'];
  const BC_raw    = p['BC (mm)'];
  const bore_raw  = p['Bore (mm)'];
  const npern_raw = p['Numero de pernos'];
  const OD_mm   = typeof OD_raw    === 'number' ? OD_raw    : parseFloat(String(OD_raw    ?? 0));
  const BC_mm   = typeof BC_raw    === 'number' ? BC_raw    : parseFloat(String(BC_raw    ?? 0));
  const bore_mm = typeof bore_raw  === 'number' ? bore_raw  : parseFloat(String(bore_raw  ?? (nps_num * 25.4 * 0.9)));
  const n_pern  = typeof npern_raw === 'number' ? npern_raw : parseInt(String(npern_raw   ?? 8));

  const hw       = f2f_num / 2;
  const body_h   = OD_mm > 0 ? OD_mm / 2 : nps_num * 25.4 * 0.8;
  const bore_r   = bore_mm > 0 ? bore_mm / 2 : nps_num * 25.4 / 2;
  const flange_t = OD_mm > 0 ? OD_mm * 0.06 : nps_num * 25.4 * 0.12;
  const flange_h = OD_mm > 0 ? OD_mm / 2 : body_h;

  // Plug cone geometry: trapezoid rotated 90° (taper axis = vertical)
  const cone_top_w  = bore_r * 1.1;    // half-width at top (wider end of taper)
  const cone_bot_w  = bore_r * 0.5;    // half-width at bottom (narrower end)
  const cone_top_y  = body_h * 0.7;    // top y-position
  const cone_bot_y  = -body_h * 0.65;  // bottom y-position

  type Ent = string;
  const ents: Ent[] = [];

  const L = (x1: number, y1: number, x2: number, y2: number, lyr: string, col: number): Ent =>
    `  0\nLINE\n  8\n${lyr}\n 62\n${col}\n 10\n${x1.toFixed(3)}\n 20\n${y1.toFixed(3)}\n 30\n0.0\n 11\n${x2.toFixed(3)}\n 21\n${y2.toFixed(3)}\n 31\n0.0`;
  const C = (cx: number, cy: number, r: number, lyr: string, col: number): Ent =>
    `  0\nCIRCLE\n  8\n${lyr}\n 62\n${col}\n 10\n${cx.toFixed(3)}\n 20\n${cy.toFixed(3)}\n 30\n0.0\n 40\n${r.toFixed(3)}`;
  const T = (x: number, y: number, h: number, txt: string, lyr: string, col: number): Ent =>
    `  0\nTEXT\n  8\n${lyr}\n 62\n${col}\n 10\n${x.toFixed(3)}\n 20\n${y.toFixed(3)}\n 30\n0.0\n 40\n${h.toFixed(2)}\n  1\n${txt}\n 72\n1\n 11\n${x.toFixed(3)}\n 21\n${y.toFixed(3)}\n 31\n0.0`;

  // CUERPO — body rectangle + bore passage lines
  ents.push(L(-hw, -body_h,  hw, -body_h, 'CUERPO', 7));
  ents.push(L( hw, -body_h,  hw,  body_h, 'CUERPO', 7));
  ents.push(L( hw,  body_h, -hw,  body_h, 'CUERPO', 7));
  ents.push(L(-hw,  body_h, -hw, -body_h, 'CUERPO', 7));
  ents.push(L(-hw,  bore_r,  hw,  bore_r, 'CUERPO', 7));
  ents.push(L(-hw, -bore_r,  hw, -bore_r, 'CUERPO', 7));

  // TAPON_CONICO — trapezoidal plug rotated 90° (cone open-position, bore aligned)
  // Trapezoid: top side at cone_top_y, bottom side at cone_bot_y
  ents.push(L(-cone_top_w, cone_top_y,  cone_top_w, cone_top_y, 'TAPON_CONICO', 4));  // top edge (wide)
  ents.push(L(-cone_bot_w, cone_bot_y,  cone_bot_w, cone_bot_y, 'TAPON_CONICO', 4));  // bottom edge (narrow)
  ents.push(L(-cone_top_w, cone_top_y, -cone_bot_w, cone_bot_y, 'TAPON_CONICO', 4));  // left taper
  ents.push(L( cone_top_w, cone_top_y,  cone_bot_w, cone_bot_y, 'TAPON_CONICO', 4));  // right taper
  // Bore hole through plug (Venturi = smaller, Regular = standard)
  const plug_bore_r = patron === 'Venturi' ? bore_r * 0.55 : bore_r * 0.85;
  ents.push(C(0, (cone_top_y + cone_bot_y) / 2, plug_bore_r, 'TAPON_CONICO', 4));
  // Stem indicator (top of plug)
  ents.push(L(0, cone_top_y, 0, cone_top_y + body_h * 0.25, 'TAPON_CONICO', 4));

  // BRIDA — left and right flanges with bolt holes
  for (const side of [-1, 1] as const) {
    const x0 = side * hw;
    const x1 = side * (hw + flange_t);
    ents.push(L(x0, -flange_h, x1, -flange_h, 'BRIDA', 3));
    ents.push(L(x1, -flange_h, x1,  flange_h, 'BRIDA', 3));
    ents.push(L(x1,  flange_h, x0,  flange_h, 'BRIDA', 3));
    if (BC_mm > 0 && n_pern > 0) {
      const r_bc  = BC_mm / 2;
      const scale = flange_h / (OD_mm > 0 ? OD_mm / 2 : flange_h);
      const cx    = side * (hw + flange_t * 0.5);
      for (let i = 0; i < n_pern; i++) {
        const bang = (Math.PI * i) / n_pern;
        ents.push(C(cx, r_bc * Math.sin(bang) * scale, 1.5, 'BRIDA', 3));
      }
    }
  }

  // ANOTACIONES
  const ax0    = -(hw + flange_t);
  const ay_top = body_h + 12;
  const ay_bot = -(body_h + 22);

  ents.push(T(ax0, ay_top + 40, 5,
    'INGENIUM PRO v8.1 - VALVULA DE TAPON - PLANO ESQUEMATICO', 'ANOTACIONES', 2));
  ents.push(T(ax0, ay_top + 28, 5,
    `NPS ${nps_num}" - Class ${clase} - Patron: ${patron}`, 'ANOTACIONES', 2));
  ents.push(T(ax0, ay_top + 16, 4.5,
    `Face-to-Face: ${f2f_num.toFixed(0)} mm (${(f2f_num / 25.4).toFixed(2)}") - Normativa: ASME B16.10-2022 + MSS SP-78`, 'ANOTACIONES', 2));
  ents.push(T(ax0, ay_top + 4, 4,
    `Proyecto: ${proyecto || 'Sin nombre'} - Fecha: ${fecha} - Apertura: 1/4 vuelta`, 'ANOTACIONES', 2));
  ents.push(T(ax0, ay_top - 9, 3.5,
    `Ing: ${String((p as any)._usr_nombre || '') || '—'}  Email: ${String((p as any)._usr_email || '') || '—'}  Mat: ${String((p as any)._usr_matricula || '') || '—'}  DNI: ${String((p as any)._usr_dni || '') || '—'}`, 'ANOTACIONES', 7));
  ents.push(T(ax0, ay_top - 21, 3.5,
    `Empresa: ${String((p as any)._usr_empresa || '') || '—'}  Pais: ${String((p as any)._usr_pais || '') || '—'}`, 'ANOTACIONES', 7));

  const xf0 = -(hw + flange_t);
  const xf1 =  (hw + flange_t);
  const yd  = -(body_h + 8);
  ents.push(L(xf0, -(body_h - 2), xf0, yd, 'ANOTACIONES', 2));
  ents.push(L(xf1, -(body_h - 2), xf1, yd, 'ANOTACIONES', 2));
  ents.push(L(xf0, yd, xf1, yd, 'ANOTACIONES', 2));
  ents.push(T(0, yd - 9, 3.5, `F-to-F = ${f2f_num.toFixed(0)} mm`, 'ANOTACIONES', 2));

  ents.push(T(ax0, ay_bot,      4.5, '* Plano esquematico - requiere validacion de fabricante antes de mecanizar.', 'ANOTACIONES', 1));
  ents.push(T(ax0, ay_bot - 12, 4,   `* Patron ${patron} - Cono girado 90deg (posicion abierta). ASME B16.10-2022 + MSS SP-78.`, 'ANOTACIONES', 1));
  ents.push(T(ax0, ay_bot - 24, 4,   '* Verificar con fabricante. Plano NO apto para fabricacion directa.', 'ANOTACIONES', 1));

  const header = [
    '  0','SECTION','  2','HEADER',
    '  9','$ACADVER','  1','AC1015',
    '  9','$INSUNITS',' 70','4',
    '  0','ENDSEC',
    '  0','SECTION','  2','TABLES',
    '  0','TABLE','  2','LAYER',' 70','4',
    '  0','LAYER','  2','CUERPO',        ' 70','0',' 62','7','  6','CONTINUOUS',
    '  0','LAYER','  2','TAPON_CONICO',  ' 70','0',' 62','4','  6','CONTINUOUS',
    '  0','LAYER','  2','BRIDA',         ' 70','0',' 62','3','  6','CONTINUOUS',
    '  0','LAYER','  2','ANOTACIONES',   ' 70','0',' 62','2','  6','CONTINUOUS',
    '  0','ENDTAB','  0','ENDSEC',
    '  0','SECTION','  2','ENTITIES',
  ].join('\n');

  return [header, ...ents, '  0','ENDSEC','  0','EOF'].join('\n');
}