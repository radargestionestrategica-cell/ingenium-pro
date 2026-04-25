// lib/generarPDF.ts
// ═══════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.1 — Generador de PDF con QR verificable
//  Corre SOLO en servidor (Node.js / Vercel Functions)
//  Librerías: pdfkit + qrcode
//  El QR apunta a ingeniumpro.store/verify/{hash}
// ═══════════════════════════════════════════════════════════════

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface DatosPDF {
  hash:         string;
  moduloNombre: string;
  submodulo?:   string;
  activoNombre?:string;
  normativa?:   string;
  proyectoNombre?:string;
  industria?:   string;
  ingeniero:    string;
  empresa:      string;
  pais:         string;
  fecha:        Date;
  parametros:   Record<string, unknown>;
  resultado:    Record<string, unknown>;
  alerta:       boolean;
  alertaMsg?:   string;
}

// Colores corporativos INGENIUM PRO
const COLOR_PRIMARIO  = '#6366f1'; // índigo
const COLOR_VERDE     = '#22c55e';
const COLOR_ROJO      = '#ef4444';
const COLOR_GRIS      = '#64748b';
const COLOR_FONDO     = '#0f172a';
const COLOR_TEXTO     = '#f1f5f9';

export async function generarPDF(datos: DatosPDF): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // ── Generar QR como imagen PNG en base64 ──────────────────
      const verifyUrl = `https://ingeniumpro.store/verify/${datos.hash}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H', // Alta corrección — resiste daño físico
        width: 200,
        margin: 1,
        color: {
          dark:  '#6366f1',
          light: '#0f172a',
        },
      });
      // Convertir data URL a Buffer para PDFKit
      const qrBase64  = qrDataUrl.split(',')[1];
      const qrBuffer  = Buffer.from(qrBase64, 'base64');

      // ── Crear documento PDF ───────────────────────────────────
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
        info: {
          Title:    `Cálculo Verificable — INGENIUM PRO`,
          Author:   datos.ingeniero,
          Subject:  datos.moduloNombre,
          Keywords: `ingenieria, calculo, ${datos.moduloNombre}, INGENIUM PRO`,
          Creator:  'INGENIUM PRO v8.1',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data',  (chunk: Buffer) => buffers.push(chunk));
      doc.on('end',   () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── HEADER ────────────────────────────────────────────────
      // Fondo header
      doc.rect(0, 0, doc.page.width, 90).fill('#070d1a');

      // Logo texto
      doc
        .fillColor(COLOR_TEXTO)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('INGENIUM PRO', 50, 28);

      doc
        .fillColor(COLOR_PRIMARIO)
        .fontSize(10)
        .font('Helvetica')
        .text('v8.1 — Plataforma de Ingeniería Técnica Verificable', 50, 54);

      doc
        .fillColor(COLOR_GRIS)
        .fontSize(8)
        .text('ingeniumpro.store  ·  © 2026 Silvana Belén Colombo — RADAR Gestión Estratégica', 50, 68);

      // ── BADGE VERIFICADO ─────────────────────────────────────
      doc.rect(doc.page.width - 180, 18, 140, 54)
        .fill('#0a2f0a');
      doc.rect(doc.page.width - 180, 18, 140, 54)
        .stroke('#22c55e');

      doc
        .fillColor(COLOR_VERDE)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('✓ VERIFICADO', doc.page.width - 175, 28);

      doc
        .fillColor('#86efac')
        .fontSize(7)
        .font('Helvetica')
        .text('Integridad SHA-256 confirmada', doc.page.width - 175, 44)
        .text('Registro inmutable en base de datos', doc.page.width - 175, 56);

      doc.moveDown(4);

      // ── MÓDULO ───────────────────────────────────────────────
      doc
        .fillColor(COLOR_PRIMARIO)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(datos.moduloNombre, 50, 110);

      if (datos.submodulo) {
        doc
          .fillColor(COLOR_GRIS)
          .fontSize(10)
          .font('Helvetica')
          .text(`Sub-módulo: ${datos.submodulo}`, 50, 130);
      }

      doc
        .fillColor(COLOR_GRIS)
        .fontSize(9)
        .text(datos.normativa || '', 50, datos.submodulo ? 145 : 130);

      // Línea divisoria
      doc.moveTo(50, 165).lineTo(doc.page.width - 50, 165).stroke(COLOR_PRIMARIO);

      // ── DATOS DEL PROYECTO ───────────────────────────────────
      let y = 180;

      const filaInfo = (label: string, valor: string, yPos: number) => {
        doc.fillColor(COLOR_GRIS).fontSize(8).font('Helvetica')
          .text(label.toUpperCase(), 50, yPos);
        doc.fillColor(COLOR_TEXTO).fontSize(10).font('Helvetica-Bold')
          .text(valor, 180, yPos);
      };

      filaInfo('Proyecto',      datos.proyectoNombre || '—',   y);
      filaInfo('Activo físico', datos.activoNombre   || '—',   y + 18);
      filaInfo('Industria',     datos.industria       || '—',   y + 36);
      filaInfo('Ingeniero',     datos.ingeniero,               y + 54);
      filaInfo('Empresa',       datos.empresa,                 y + 72);
      filaInfo('País',          datos.pais,                    y + 90);
      filaInfo('Fecha y hora',  datos.fecha.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),                                                       y + 108);

      // ── ALERTA ───────────────────────────────────────────────
      if (datos.alerta && datos.alertaMsg) {
        y += 138;
        doc.rect(50, y, doc.page.width - 100, 36).fill('#2d0a0a');
        doc.rect(50, y, doc.page.width - 100, 36).stroke(COLOR_ROJO);
        doc.fillColor(COLOR_ROJO).fontSize(8).font('Helvetica-Bold')
          .text('⚠  ALERTA NORMATIVA DETECTADA', 60, y + 6);
        doc.fillColor('#fca5a5').fontSize(8).font('Helvetica')
          .text(datos.alertaMsg, 60, y + 18, { width: doc.page.width - 120 });
        y += 50;
      } else {
        y += 138;
      }

      // Línea divisoria
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke(COLOR_PRIMARIO);
      y += 14;

      // ── PARÁMETROS DE ENTRADA ────────────────────────────────
      doc.fillColor(COLOR_PRIMARIO).fontSize(10).font('Helvetica-Bold')
        .text('PARÁMETROS DE ENTRADA', 50, y);
      y += 16;

      const entradas = Object.entries(datos.parametros).slice(0, 16);
      const colW = (doc.page.width - 100) / 2;

      entradas.forEach(([k, v], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const px  = 50 + col * colW;
        const py  = y + row * 18;

        doc.fillColor(COLOR_GRIS).fontSize(7).font('Helvetica')
          .text(k, px, py);
        doc.fillColor(COLOR_TEXTO).fontSize(9).font('Helvetica-Bold')
          .text(String(v), px + 90, py, { width: colW - 95, ellipsis: true });
      });

      y += Math.ceil(entradas.length / 2) * 18 + 12;

      // Línea divisoria
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke(COLOR_PRIMARIO);
      y += 14;

      // ── RESULTADOS ───────────────────────────────────────────
      doc.fillColor(COLOR_VERDE).fontSize(10).font('Helvetica-Bold')
        .text('RESULTADOS CALCULADOS', 50, y);
      y += 16;

      const resultados = Object.entries(datos.resultado).slice(0, 16);
      resultados.forEach(([k, v], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const px  = 50 + col * colW;
        const py  = y + row * 18;

        doc.fillColor(COLOR_GRIS).fontSize(7).font('Helvetica')
          .text(k, px, py);
        doc.fillColor(COLOR_VERDE).fontSize(9).font('Helvetica-Bold')
          .text(String(v), px + 90, py, { width: colW - 95, ellipsis: true });
      });

      y += Math.ceil(resultados.length / 2) * 18 + 16;

      // ── QR + HASH ─────────────────────────────────────────────
      // Si no hay espacio en la página, agregar nueva
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      // Fondo QR
      doc.rect(50, y, doc.page.width - 100, 120).fill('#0a0f1e');
      doc.rect(50, y, doc.page.width - 100, 120).stroke('rgba(99,102,241,0.3)');

      // QR image
      doc.image(qrBuffer, 60, y + 10, { width: 100, height: 100 });

      // Texto QR
      doc.fillColor(COLOR_PRIMARIO).fontSize(9).font('Helvetica-Bold')
        .text('ESCANEAR PARA VERIFICAR', 175, y + 14);

      doc.fillColor(COLOR_GRIS).fontSize(7).font('Helvetica')
        .text('Este QR apunta a la verificación pública en INGENIUM PRO.', 175, y + 28)
        .text('El regulador puede verificar la autenticidad de este cálculo', 175, y + 40)
        .text('escaneando el código. La información no puede ser alterada.', 175, y + 52);

      doc.fillColor(COLOR_GRIS).fontSize(6).font('Helvetica')
        .text('Hash SHA-256:', 175, y + 70);
      doc.fillColor(COLOR_PRIMARIO).fontSize(6).font('Courier')
        .text(datos.hash, 175, y + 82, { width: doc.page.width - 240, ellipsis: false });

      doc.fillColor(COLOR_GRIS).fontSize(7).font('Helvetica')
        .text(verifyUrl, 175, y + 100);

      // ── FOOTER ───────────────────────────────────────────────
      y += 136;
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke(COLOR_GRIS);
      y += 8;

      doc.fillColor(COLOR_GRIS).fontSize(7).font('Helvetica')
        .text(
          'Este documento fue generado por INGENIUM PRO v8.1 y tiene validez técnica como registro de cálculo de ingeniería. ' +
          'La autenticidad puede verificarse escaneando el QR o ingresando el hash en ingeniumpro.store/verify/',
          50, y, { width: doc.page.width - 100, align: 'center' }
        );

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
} 