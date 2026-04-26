// lib/generarExcel.ts
// ═══════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.1 — Generador de Excel de Integridad de Activos
//  5 hojas con fórmulas dinámicas reales — ExcelJS
//  Hoja 1: Datos del activo
//  Hoja 2: Historial de mediciones
//  Hoja 3: Cálculos con fórmulas editables
//  Hoja 4: Proyección de vida útil
//  Hoja 5: Alertas y recomendaciones
// ═══════════════════════════════════════════════════════════════

import ExcelJS from 'exceljs';

export interface RegistroHistorial {
  fecha:        Date;
  submodulo:    string;
  activoNombre: string;
  parametros:   Record<string, unknown>;
  resultado:    Record<string, unknown>;
  alerta:       boolean;
  alertaMsg:    string | null;
  normativa:    string | null;
  hash:         string | null;
  usuario:      string;
}

export interface DatosExcel {
  proyectoNombre:  string;
  industria:       string;
  activoNombre:    string;
  moduloId:        string;
  ingeniero:       string;
  empresa:         string;
  pais:            string;
  normativa:       string;
  historial:       RegistroHistorial[];
  t_nom_mm?:       number;
  t_min_mm?:       number;
  presion_bar?:    number;
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

export async function generarExcel(datos: DatosExcel): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();

  wb.creator  = 'INGENIUM PRO v8.1';
  // ✅ FIX ts(2353): wb.company no existe en ExcelJS.Workbook — eliminado
  wb.created  = new Date();
  wb.modified = new Date();

  const fecha = new Date().toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

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
    ['Empresa',               datos.empresa],
    ['País',                  datos.pais],
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

    // ✅ FIX ts(2353): separar style + font en lugar de spread
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
  // HOJA 3 — CÁLCULOS CON FÓRMULAS EDITABLES
  // ════════════════════════════════════════════════════════════
  const h3 = wb.addWorksheet('3. Fórmulas', {
    properties: { tabColor: { argb: C.amarillo } },
  });

  h3.columns = [
    { width: 30 }, { width: 18 }, { width: 18 },
    { width: 18 }, { width: 35 },
  ];

  h3.mergeCells('A1:E1');
  h3.getCell('A1').value = 'HOJA DE CÁLCULO — Fórmulas editables por el ingeniero';
  h3.getCell('A1').style = headerStyle(C.amarillo);
  h3.getRow(1).height   = 28;

  const hRow3 = h3.getRow(2);
  ['Parámetro', 'Valor ingresado', 'Valor calculado', 'Unidad', 'Fuente normativa'].forEach((h, i) => {
    const cell = hRow3.getCell(i + 1);
    cell.value = h;
    cell.style = headerStyle(C.fondo_med);
  });
  hRow3.height = 22;

  const formulas3: [string, number | string, string, string, string][] = [
    ['Diámetro exterior OD (mm)',     datos.t_nom_mm ? datos.t_nom_mm * 30 : 273.1, '', 'mm',  'ASME B36.10M'],
    ['Presión de diseño P (bar)',      datos.presion_bar || 80,                      '', 'bar', 'ASME B31.8 §841.1.1'],
    ['SMYS del material (MPa)',        448,                                           '', 'MPa', 'API 5L X65 — Apéndice D B31.8'],
    ['Factor de diseño F',             0.72,                                         '', '—',   'B31.8 Tabla 841.1.6-1 Clase 1'],
    ['Factor junta E',                 1.00,                                         '', '—',   'B31.8 Tabla 841.1.7-1 Seamless'],
    ['Factor temperatura T',           1.00,                                         '', '—',   'B31.8 Tabla 841.1.8-1 ≤120°C'],
    ['Espesor mínimo t_min (mm)',      '', '=((B4*14.5038)*(B3/25.4))/(2*(B5*145.038)*B6*B7*B8)', 'mm', 'B31.8 §841.1.1: t=P·D/(2·S·F·E·T)'],
    ['Espesor nominal (mm)',           datos.t_nom_mm || 9.3,                        '', 'mm',  'Especificación de compra'],
    ['Corrosión allowance CA (mm)',    1.6,                                           '', 'mm',  'Típico servicio agua/crudo'],
    ['Espesor de diseño (mm)',         '', '=B10+B11',                               'mm',  'B31.8: t_diseño = t_min + CA'],
    ['Hoop Stress σ_h (MPa)',          '', '=((B4*14.5038)*(B3/25.4))/(2*(B10/25.4))*0.006895', 'MPa', 'Barlow: σ_h = P·D/(2·t)'],
    ['Límite admisible (MPa)',         '', '=B5*B6*B7',                              'MPa', 'SMYS × F × E'],
    ['Factor de uso (%)',              '', '=B13/B14*100',                           '%',   'σ_h / Límite — máx 100%'],
  ];

  formulas3.forEach(([label, val, formula, unidad, fuente], i) => {
    const row = h3.getRow(i + 3);
    row.height = 20;

    const cA = row.getCell(1);
    const cB = row.getCell(2);
    const cC = row.getCell(3);
    const cD = row.getCell(4);
    const cE = row.getCell(5);

    cA.value = label;
    cA.style = labelStyle();

    if (val !== '') {
      // ✅ FIX ts(2353): style + font separados, sin spread
      cB.value = val;
      cB.style = dataStyle();
      cB.font  = { bold: true, color: { argb: 'FF0000FF' }, size: 10 };
    }

    if (formula !== '') {
      // ✅ FIX ts(2353): style + font + numFmt separados, sin spread
      cC.value  = { formula };
      cC.style  = dataStyle();
      cC.font   = { color: { argb: 'FF000000' }, size: 10 };
      cC.numFmt = '0.00';
    }

    cD.value = unidad;
    cD.style = dataStyle(C.fondo_med);

    // ✅ FIX ts(2353): style + font separados, sin spread
    cE.value = fuente;
    cE.style = dataStyle(C.fondo_med);
    cE.font  = { color: { argb: C.gris }, size: 8, italic: true };
  });

  h3.getRow(20).height = 14;
  h3.getCell('A20').value = 'CONVENCIÓN: Texto AZUL = ingresá tu valor | Texto NEGRO = fórmula calculada automáticamente';
  h3.getCell('A20').style = { font: { color: { argb: C.amarillo }, size: 8, italic: true } };
  h3.mergeCells('A20:E20');

  // ════════════════════════════════════════════════════════════
  // HOJA 4 — PROYECCIÓN DE VIDA ÚTIL
  // ════════════════════════════════════════════════════════════
  const h4 = wb.addWorksheet('4. Proyección Vida Útil', {
    properties: { tabColor: { argb: C.rojo } },
  });

  h4.columns = [
    { width: 10 }, { width: 18 }, { width: 20 },
    { width: 20 }, { width: 22 }, { width: 22 },
  ];

  h4.mergeCells('A1:F1');
  h4.getCell('A1').value = 'PROYECCIÓN DE VIDA ÚTIL — API 579-1/ASME FFS-1';
  h4.getCell('A1').style = headerStyle(C.rojo);
  h4.getRow(1).height   = 28;

  h4.getCell('A3').value = 'SUPUESTOS (editables):';
  h4.getCell('A3').style = { font: { bold: true, color: { argb: C.amarillo }, size: 10 } };

  const supuestos: [string, string, number, string][] = [
    ['B4', 'Espesor medido hoy (mm)',       datos.t_nom_mm  || 9.3, 'Medición UT en campo'],
    ['B5', 'Espesor mínimo requerido (mm)', datos.t_min_mm  || 5.5, 'Calculado en Hoja 3'],
    ['B6', 'Tasa de corrosión (mm/año)',     0.2,                    'Histórico o NACE SP0169'],
    ['B7', 'Presión operación actual (bar)', datos.presion_bar || 80,'Medición SCADA/campo'],
  ];

  supuestos.forEach(([, label, val, fuente], i) => {
    const row = h4.getRow(i + 4);
    row.height = 20;
    row.getCell(1).value = label;
    row.getCell(1).style = labelStyle();
    // ✅ FIX ts(2353): style + font separados, sin spread
    const c = row.getCell(2);
    c.value = val;
    c.style = dataStyle();
    c.font  = { bold: true, color: { argb: 'FF0000FF' }, size: 10 };
    // ✅ FIX ts(2353): style + font separados, sin spread
    row.getCell(3).value = fuente;
    row.getCell(3).style = dataStyle(C.fondo_med);
    row.getCell(3).font  = { color: { argb: C.gris }, size: 8 };
  });

  h4.getRow(9).height = 14;
  h4.getCell('A10').value = 'RESULTADO:';
  h4.getCell('A10').style = { font: { bold: true, color: { argb: C.verde }, size: 10 } };

  const resultados4: [string, string, string][] = [
    ['Vida remanente (años)',             '=(B4-B5)/B6',   'API 579: (t_medido - t_mínimo) / tasa_corrosión'],
    ['Espesor proyectado en 5 años',      '=B4-(B6*5)',    'Proyección lineal — conservadora'],
    ['Espesor proyectado en 10 años',     '=B4-(B6*10)',   'Proyección lineal — conservadora'],
    ['Estado en 5 años',                  '=IF(B4-(B6*5)>B5,"EN SERVICIO","FUERA DE SERVICIO")', 'Comparación con t_mínimo'],
    ['Estado en 10 años',                 '=IF(B4-(B6*10)>B5,"EN SERVICIO","FUERA DE SERVICIO")', 'Comparación con t_mínimo'],
    ['Reducción presión recomendada (%)', '=MAX(0,(1-(B4-(B6*5))/B4)*100)', 'Si espera 5 años sin intervenir'],
  ];

  resultados4.forEach(([label, formula, fuente], i) => {
    const row = h4.getRow(i + 11);
    row.height = 20;
    // ✅ FIX ts(2353): style + font + numFmt separados, sin spread
    row.getCell(1).value = label;
    row.getCell(1).style = labelStyle();
    row.getCell(2).value  = { formula };
    row.getCell(2).style  = dataStyle();
    row.getCell(2).font   = { color: { argb: 'FF000000' }, size: 10 };
    row.getCell(2).numFmt = '0.00';
    // ✅ FIX ts(2353): style + font separados, sin spread
    row.getCell(3).value = fuente;
    row.getCell(3).style = dataStyle(C.fondo_med);
    row.getCell(3).font  = { color: { argb: C.gris }, size: 8, italic: true };
  });

  h4.getRow(19).height = 22;
  ['Año', 'Espesor proy. (mm)', 'Estado', 'Presión máx recom. (bar)', 'Acción recomendada'].forEach((h, i) => {
    const cell = h4.getRow(19).getCell(i + 1);
    cell.value = h;
    cell.style = headerStyle(C.fondo_med);
  });

  for (let anio = 0; anio <= 15; anio++) {
    const row   = h4.getRow(20 + anio);
    const bgAnio = anio % 2 === 0 ? C.fondo_dark : C.fondo_med;
    row.height  = 18;

    // ✅ FIX ts(2353): style + alignment separados, sin spread
    row.getCell(1).value     = new Date().getFullYear() + anio;
    row.getCell(1).style     = dataStyle(bgAnio);
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    const esp = `=B4-(B6*${anio})`;
    // ✅ FIX ts(2353): style + font + numFmt separados, sin spread
    row.getCell(2).value  = { formula: esp };
    row.getCell(2).style  = dataStyle(bgAnio);
    row.getCell(2).font   = { color: { argb: C.texto }, size: 10 };
    row.getCell(2).numFmt = '0.00';

    row.getCell(3).value = { formula: `=IF(${esp}>B5,"✓ SERVICIO","✗ RETIRAR")` };
    row.getCell(3).style = dataStyle(bgAnio);

    // ✅ FIX ts(2353): style + numFmt separados, sin spread
    row.getCell(4).value  = { formula: `=IF(${esp}>0,B7*(${esp}/B4),0)` };
    row.getCell(4).style  = dataStyle(bgAnio);
    row.getCell(4).numFmt = '0.0';

    const accion = anio === 0
      ? 'Medición base'
      : `=IF(${esp}<B5,"RETIRAR — vida agotada",IF(${esp}<B5*1.2,"INSPECCIÓN URGENTE",IF(${esp}<B5*1.5,"MONITOREO","OPERACIÓN NORMAL")))`;
    row.getCell(5).value = typeof accion === 'string' && accion !== 'Medición base'
      ? { formula: accion }
      : accion;
    row.getCell(5).style = dataStyle(bgAnio);
  }

  // ════════════════════════════════════════════════════════════
  // HOJA 5 — ALERTAS Y RECOMENDACIONES
  // ════════════════════════════════════════════════════════════
  const h5 = wb.addWorksheet('5. Alertas', {
    properties: { tabColor: { argb: C.rojo } },
  });

  h5.columns = [
    { width: 20 }, { width: 22 }, { width: 20 },
    { width: 45 }, { width: 22 }, { width: 70 },
  ];

  h5.mergeCells('A1:F1');
  h5.getCell('A1').value = 'REGISTRO DE ALERTAS — INGENIUM PRO v8.1';
  h5.getCell('A1').style = headerStyle(C.rojo);
  h5.getRow(1).height   = 28;

  const hRow5 = h5.getRow(2);
  ['Fecha', 'Activo', 'Sub-cálculo', 'Mensaje de alerta', 'Ingeniero', 'Hash verificable'].forEach((h, i) => {
    const cell = hRow5.getCell(i + 1);
    cell.value = h;
    cell.style = headerStyle(C.fondo_med);
  });
  hRow5.height = 22;

  const alertas = datos.historial.filter(r => r.alerta);

  if (alertas.length === 0) {
    h5.mergeCells('A3:F3');
    h5.getCell('A3').value = '✓ Sin alertas registradas en el período analizado.';
    h5.getCell('A3').style = {
      font:      { color: { argb: C.verde }, bold: true },
      fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: C.fondo_dark } },
      alignment: { horizontal: 'center' },
    };
    h5.getRow(3).height = 24;
  } else {
    alertas.forEach((reg, i) => {
      const row = h5.getRow(i + 3);
      row.height = 20;
      row.getCell(1).value  = reg.fecha;
      row.getCell(1).numFmt = 'dd/mm/yyyy';
      row.getCell(2).value  = reg.activoNombre;
      row.getCell(3).value  = reg.submodulo;
      row.getCell(4).value  = reg.alertaMsg || '—';
      row.getCell(5).value  = reg.usuario;
      row.getCell(6).value  = reg.hash ? `https://ingeniumpro.store/verify/${reg.hash}` : '—';

      const bgAlerta = i % 2 === 0 ? 'FF2D0A0A' : C.fondo_dark;
      row.eachCell(cell => {
        cell.style = {
          font:   { color: { argb: C.texto }, size: 10 },
          fill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: bgAlerta } },
          border: { bottom: { style: 'hair', color: { argb: C.rojo } } },
        };
      });

      // ✅ FIX ts(2353): style + font separados, sin spread
      h5.getRow(i + 3).getCell(4).style = {
        font: { color: { argb: C.rojo }, bold: true, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bgAlerta } },
      };
    });
  }

  const footerRow = h5.getRow(alertas.length + 6);
  footerRow.height = 16;
  h5.mergeCells(`A${alertas.length + 6}:F${alertas.length + 6}`);
  h5.getCell(`A${alertas.length + 6}`).value =
    `Informe generado por INGENIUM PRO v8.1 — ingeniumpro.store — ${fecha} — ${datos.ingeniero} — ${datos.empresa}`;
  h5.getCell(`A${alertas.length + 6}`).style = {
    font:      { color: { argb: C.gris }, size: 8, italic: true },
    alignment: { horizontal: 'center' },
  };

  // ── Serializar a Buffer ───────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
} 