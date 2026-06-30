// lib/generarExcelTelemetria.ts
// ═══════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.1 — Generador de Excel de Telemetría
//  5 hojas (por ahora) — misma estética que lib/generarExcel.ts
//  Hoja 1: Datos del activo
//  Hoja 2: Historial de mediciones
//  Hoja 3: Parámetros de cálculo (geotécnicos)
//  Hoja 4: Análisis sísmico
//  Hoja 5: Alertas (clasificación por factor de seguridad)
// ═══════════════════════════════════════════════════════════════

import ExcelJS from 'exceljs';
import type { DatosExcel } from '@/lib/generarExcel';
import { PAISES_SISMICOS } from '@/lib/sismica-zonificacion';

// Geometría real de ActivoTelemetria.geometriaJson (ver GeometriaPileta en app/telemetria/[id]/page.tsx)
export interface GeometriaActivoTelemetria {
  largoCoronamiento?: number;
  anchoCoronamiento?: number;
  profundidad?: number;
  talud?: number;
}

// Extiende DatosExcel con los campos geotécnicos y sísmicos reales de ActivoTelemetria (schema.prisma)
export interface DatosExcelTelemetria extends DatosExcel {
  cohesion?:          number | null;
  friccionGrados?:    number | null;
  pesoEspecifico?:    number | null;
  tipoRevestimiento?: string | null;
  geometria?:         GeometriaActivoTelemetria | null;
  paisSismico?:       string | null; // ActivoTelemetria.pais
  zonaSismica?:       string | null; // ActivoTelemetria.zonaSismica
}

// Mapa país → IANA timezone (valores que puede contener Usuario.pais)
const TIMEZONES_XLS: Record<string, string> = {
  argentina:        'America/Argentina/Buenos_Aires',
  uruguay:          'America/Montevideo',
  chile:            'America/Santiago',
  colombia:         'America/Bogota',
  peru:             'America/Lima',
  perú:             'America/Lima',
  mexico:           'America/Mexico_City',
  méxico:           'America/Mexico_City',
  venezuela:        'America/Caracas',
  bolivia:          'America/La_Paz',
  ecuador:          'America/Guayaquil',
  paraguay:         'America/Asuncion',
  brasil:           'America/Sao_Paulo',
  brazil:           'America/Sao_Paulo',
  españa:           'Europe/Madrid',
  spain:            'Europe/Madrid',
  'estados unidos': 'America/New_York',
  usa:              'America/New_York',
};

function obtenerTimezoneXls(pais: string): string {
  return TIMEZONES_XLS[pais.toLowerCase().trim()] ?? 'America/Argentina/Buenos_Aires';
}

// ── Colores corporativos INGENIUM PRO ─────────────────────────
const C = {
  primario:    'FF6366F1',
  verde:       'FF22C55E',
  rojo:        'FFEF4444',
  amarillo:    'FFF59E0B',
  fondo_dark:  'FF0F172A',
  fondo_med:   'FF1E293B',
  fondo_light: 'FF334155',
  texto:       'FFF1F5F9',
  gris:        'FF64748B',
  blanco:      'FFFFFFFF',
};

function headerStyle(color: string = C.primario): Partial<ExcelJS.Style> {
  return {
    font:      { bold: true, color: { argb: C.blanco }, size: 11 },
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: color } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top:    { style: 'thin', color: { argb: C.fondo_light } },
      bottom: { style: 'thin', color: { argb: C.fondo_light } },
      left:   { style: 'thin', color: { argb: C.fondo_light } },
      right:  { style: 'thin', color: { argb: C.fondo_light } },
    },
  };
}

function dataStyle(bgColor: string = C.fondo_dark): Partial<ExcelJS.Style> {
  return {
    font:      { color: { argb: C.texto }, size: 10 },
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
    alignment: { vertical: 'middle' },
    border: {
      bottom: { style: 'hair', color: { argb: C.fondo_light } },
    },
  };
}

function labelStyle(): Partial<ExcelJS.Style> {
  return {
    font:      { bold: true, color: { argb: C.gris }, size: 9 },
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: C.fondo_med } },
    alignment: { vertical: 'middle' },
  };
}

export async function generarExcelTelemetria(datos: DatosExcelTelemetria): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();

  wb.creator  = 'INGENIUM PRO v8.1';
  wb.created  = new Date();
  wb.modified = new Date();

  // Fecha y hora con zona horaria correcta según el país del usuario registrado
  const tz = obtenerTimezoneXls(datos.pais);
  const fecha = new Intl.DateTimeFormat('es-AR', {
    timeZone: tz,
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  // ════════════════════════════════════════════════════════════
  // HOJA 1 — DATOS DEL ACTIVO
  // ════════════════════════════════════════════════════════════
  const h1 = wb.addWorksheet('1. Datos del Activo', {
    properties: { tabColor: { argb: C.primario } },
  });

  h1.columns = [
    { width: 28 }, { width: 40 }, { width: 20 },
  ];

  h1.mergeCells('A1:C1');
  h1.getCell('A1').value = 'INGENIUM PRO v8.1 — Informe de Integridad de Activo';
  h1.getCell('A1').style = headerStyle(C.primario);
  h1.getRow(1).height   = 30;

  h1.mergeCells('A2:C2');
  h1.getCell('A2').value = `Generado el ${fecha} por ${datos.ingeniero}`;
  h1.getCell('A2').style = {
    font: { color: { argb: C.gris }, size: 9, italic: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: C.fondo_dark } },
  };
  h1.getRow(2).height = 18;

  const filas1: [string, string | number][] = [
    ['Proyecto',              datos.proyectoNombre],
    ['Activo / Equipo',       datos.activoNombre],
    ['Industria',             datos.industria],
    ['Módulo de cálculo',     datos.moduloId],
    ['Normativa aplicada',    datos.normativa],
    ['Ingeniero responsable', datos.ingeniero],
    ['Matrícula profesional', datos.matricula || '—'],
    ['DNI / Documento',       datos.dni || '—'],
    ['Email profesional',     datos.email || '—'],
    ['Empresa',               datos.empresa],
    ['País',                  datos.pais],
    ['Fecha y hora emisión',  fecha],
    ['Total de registros',    datos.historial.length],
    ['Alertas detectadas',    datos.historial.filter(r => r.alerta).length],
    ['Espesor nominal (mm)',  datos.t_nom_mm ?? '—'],
    ['Espesor mínimo req. (mm)', datos.t_min_mm ?? '—'],
    ['Presión diseño (bar)',  datos.presion_bar ?? '—'],
  ];

  filas1.forEach(([label, valor], i) => {
    const row = h1.getRow(i + 4);
    row.height = 20;
    const cA = row.getCell(1);
    const cB = row.getCell(2);
    cA.value = label;
    cA.style = labelStyle();
    cB.value = valor;
    cB.style = dataStyle(i % 2 === 0 ? C.fondo_dark : C.fondo_med);
  });

  h1.getRow(20).height = 16;
  h1.getCell('A20').value = '⚠ Este informe es verificable. Cada cálculo tiene un hash SHA-256 en la Hoja 2.';
  h1.getCell('A20').style = { font: { color: { argb: C.amarillo }, size: 9, italic: true } };
  h1.mergeCells('A20:C20');

  // ════════════════════════════════════════════════════════════
  // HOJA 2 — HISTORIAL DE MEDICIONES
  // ════════════════════════════════════════════════════════════
  const h2 = wb.addWorksheet('2. Historial', {
    properties: { tabColor: { argb: C.verde } },
  });

  h2.columns = [
    { key: 'fecha',         header: 'Fecha',           width: 20 },
    { key: 'activo',        header: 'Activo',           width: 22 },
    { key: 'submodulo',     header: 'Sub-cálculo',      width: 20 },
    { key: 'normativa',     header: 'Normativa',        width: 22 },
    { key: 'param_resumen', header: 'Parámetros clave', width: 35 },
    { key: 'resultado_k',   header: 'Resultado clave',  width: 22 },
    { key: 'alerta',        header: 'Alerta',           width: 10 },
    { key: 'alertaMsg',     header: 'Detalle alerta',   width: 35 },
    { key: 'usuario',       header: 'Ingeniero',        width: 20 },
    { key: 'hash',          header: 'Hash SHA-256 (verificar en ingeniumpro.store/verify/)', width: 70 },
  ];

  const headerRow2 = h2.getRow(1);
  headerRow2.height = 28;
  headerRow2.eachCell(cell => { cell.style = headerStyle(C.verde); });

  datos.historial.forEach((reg, i) => {
    const paramResumen = Object.entries(reg.parametros)
      .slice(0, 4)
      .map(([k, v]) => `${k}=${v}`)
      .join(' | ');

    const resultResumen = Object.entries(reg.resultado)
      .slice(0, 2)
      .map(([k, v]) => `${k}=${v}`)
      .join(' | ');

    const row = h2.addRow({
      fecha:         reg.fecha,
      activo:        reg.activoNombre,
      submodulo:     reg.submodulo,
      normativa:     reg.normativa || '—',
      param_resumen: paramResumen,
      resultado_k:   resultResumen,
      alerta:        reg.alerta ? '⚠ SÍ' : '✓ NO',
      alertaMsg:     reg.alertaMsg || '—',
      usuario:       reg.usuario,
      hash:          reg.hash || '—',
    });

    row.height = 18;
    const bg = i % 2 === 0 ? C.fondo_dark : C.fondo_med;
    row.eachCell(cell => { cell.style = dataStyle(bg); });

    const alertaCell = row.getCell('alerta');
    if (reg.alerta) {
      alertaCell.style = dataStyle(bg);
      alertaCell.font  = { bold: true, color: { argb: C.rojo } };
    } else {
      alertaCell.style = dataStyle(bg);
      alertaCell.font  = { color: { argb: C.verde } };
    }

    row.getCell('fecha').numFmt = 'dd/mm/yyyy hh:mm';
  });

  h2.autoFilter = { from: 'A1', to: 'J1' };

  // ════════════════════════════════════════════════════════════
  // HOJA 3 — PARÁMETROS DE CÁLCULO (GEOTÉCNICOS)
  // ════════════════════════════════════════════════════════════
  const h3 = wb.addWorksheet('3. Parametros de Calculo', {
    properties: { tabColor: { argb: C.amarillo } },
  });

  h3.columns = [
    { width: 32 }, { width: 22 }, { width: 32 },
  ];

  h3.mergeCells('A1:C1');
  h3.getCell('A1').value = 'PARÁMETROS DE CÁLCULO — Geotecnia del activo';
  h3.getCell('A1').style = headerStyle(C.amarillo);
  h3.getRow(1).height   = 28;

  const hRow3 = h3.getRow(2);
  ['Parámetro', 'Valor', 'Fuente normativa'].forEach((h, i) => {
    const cell = hRow3.getCell(i + 1);
    cell.value = h;
    cell.style = headerStyle(C.fondo_med);
  });
  hRow3.height = 22;

  const FUENTE_GEOTECNIA = 'USACE EM 1110-2-1902';
  const geo = datos.geometria;

  const filas3: [string, string | number][] = [
    ['Cohesión (kPa)',                 datos.cohesion ?? 'No disponible'],
    ['Ángulo de fricción interna (°)', datos.friccionGrados ?? 'No disponible'],
    ['Peso específico (kN/m³)',        datos.pesoEspecifico ?? 'No disponible'],
    ['Tipo de revestimiento',          datos.tipoRevestimiento ?? 'No disponible'],
    ['Largo de coronamiento (m)',      geo?.largoCoronamiento ?? 'No disponible'],
    ['Ancho de coronamiento (m)',      geo?.anchoCoronamiento ?? 'No disponible'],
    ['Profundidad (m)',                geo?.profundidad ?? 'No disponible'],
    ['Talud (H:V)',                    geo?.talud ?? 'No disponible'],
  ];

  filas3.forEach(([label, valor], i) => {
    const row = h3.getRow(i + 3);
    row.height = 20;
    const bg = i % 2 === 0 ? C.fondo_dark : C.fondo_med;

    const cA = row.getCell(1);
    cA.value = label;
    cA.style = labelStyle();

    const cB = row.getCell(2);
    cB.value = valor;
    cB.style = dataStyle(bg);

    const cC = row.getCell(3);
    cC.value = FUENTE_GEOTECNIA;
    cC.style = dataStyle(bg);
    cC.font  = { color: { argb: C.gris }, size: 8, italic: true };
  });

  // ════════════════════════════════════════════════════════════
  // HOJA 4 — ANÁLISIS SÍSMICO
  // ════════════════════════════════════════════════════════════
  const h4 = wb.addWorksheet('4. Analisis Sismico', {
    properties: { tabColor: { argb: C.rojo } },
  });

  h4.columns = [
    { width: 32 }, { width: 24 }, { width: 32 },
  ];

  h4.mergeCells('A1:C1');
  h4.getCell('A1').value = 'ANÁLISIS SÍSMICO — Zonificación del activo';
  h4.getCell('A1').style = headerStyle(C.rojo);
  h4.getRow(1).height   = 28;

  const paisData = datos.paisSismico
    ? PAISES_SISMICOS.find(p => p.nombre === datos.paisSismico)
    : undefined;
  const zonaData = paisData?.zonas.find(z => z.nombre === datos.zonaSismica);

  if (!paisData || !zonaData) {
    h4.mergeCells('A3:C3');
    h4.getCell('A3').value = 'Sin análisis sísmico configurado para este activo.';
    h4.getCell('A3').style = {
      font:      { color: { argb: C.amarillo }, bold: true, size: 11 },
      fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: C.fondo_dark } },
      alignment: { horizontal: 'center' },
    };
    h4.getRow(3).height = 24;
  } else {
    const hRow4 = h4.getRow(2);
    ['Parámetro', 'Valor', 'Fuente'].forEach((h, i) => {
      const cell = hRow4.getCell(i + 1);
      cell.value = h;
      cell.style = headerStyle(C.fondo_med);
    });
    hRow4.height = 22;

    const filas4: [string, string | number][] = [
      ['País sísmico',        paisData.nombre],
      ['Zona sísmica',        zonaData.nombre],
      ['PGA (g)',             zonaData.pga],
      ['Norma aplicada',      paisData.norma],
      ['Factor sísmico (α)',  'No disponible — no persistido en el activo'],
    ];

    filas4.forEach(([label, valor], i) => {
      const row = h4.getRow(i + 3);
      row.height = 20;
      const bg = i % 2 === 0 ? C.fondo_dark : C.fondo_med;

      const cA = row.getCell(1);
      cA.value = label;
      cA.style = labelStyle();

      const cB = row.getCell(2);
      cB.value = valor;
      cB.style = dataStyle(bg);

      const cC = row.getCell(3);
      cC.value = paisData.norma;
      cC.style = dataStyle(bg);
      cC.font  = { color: { argb: C.gris }, size: 8, italic: true };
    });
  }

  // ════════════════════════════════════════════════════════════
  // HOJA 5 — ALERTAS
  // ════════════════════════════════════════════════════════════
  const h5 = wb.addWorksheet('5. Alertas', {
    properties: { tabColor: { argb: C.rojo } },
  });

  h5.columns = [
    { width: 20 }, { width: 24 }, { width: 20 }, { width: 20 }, { width: 28 },
  ];

  h5.mergeCells('A1:E1');
  h5.getCell('A1').value = 'REGISTRO DE ALERTAS — Factor de seguridad geotécnico';
  h5.getCell('A1').style = headerStyle(C.rojo);
  h5.getRow(1).height   = 28;

  const hRow5 = h5.getRow(2);
  ['Fecha', 'Activo', 'Factor de seguridad', 'Diagnóstico', 'Fuente normativa'].forEach((h, i) => {
    const cell = hRow5.getCell(i + 1);
    cell.value = h;
    cell.style = headerStyle(C.fondo_med);
  });
  hRow5.height = 22;

  const FUENTE_ALERTAS = 'USACE EM 1110-2-1902';

  datos.historial.forEach((reg, i) => {
    const row = h5.getRow(i + 3);
    row.height = 20;
    const bg = i % 2 === 0 ? C.fondo_dark : C.fondo_med;

    const valorRaw = reg.resultado['Factor de seguridad'];
    const fs = typeof valorRaw === 'number'
      ? valorRaw
      : (typeof valorRaw === 'string' && valorRaw !== '—' ? parseFloat(valorRaw) : NaN);
    const tieneFs = Number.isFinite(fs);

    let diagnostico: string;
    let color: string;
    if (!tieneFs) {
      diagnostico = 'Sin datos de suelo';
      color = C.gris;
    } else if (fs < 1.3) {
      diagnostico = 'CRÍTICO';
      color = C.rojo;
    } else if (fs < 1.5) {
      diagnostico = 'PRECAUCIÓN';
      color = C.amarillo;
    } else {
      diagnostico = 'SEGURO';
      color = C.verde;
    }

    const cFecha = row.getCell(1);
    cFecha.value  = reg.fecha;
    cFecha.style  = dataStyle(bg);
    cFecha.numFmt = 'dd/mm/yyyy hh:mm';

    const cActivo = row.getCell(2);
    cActivo.value = reg.activoNombre;
    cActivo.style = dataStyle(bg);

    const cFs = row.getCell(3);
    cFs.value = tieneFs ? Number(fs.toFixed(3)) : '—';
    cFs.style = dataStyle(bg);

    const cDiag = row.getCell(4);
    cDiag.value = diagnostico;
    cDiag.style = dataStyle(bg);
    cDiag.font  = { bold: true, color: { argb: color } };

    const cFuente = row.getCell(5);
    cFuente.value = tieneFs ? FUENTE_ALERTAS : '—';
    cFuente.style = dataStyle(bg);
    cFuente.font  = { color: { argb: C.gris }, size: 8, italic: true };
  });

  h5.autoFilter = { from: 'A2', to: 'E2' };

  // ── Serializar a Buffer ───────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
