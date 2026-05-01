'use client';
import { useState } from 'react';

export interface DatosExportar {
  tipo:          string;
  parametros:    Record<string, unknown>;
  resultado:     Record<string, unknown>;
  normativa?:    string;
  moduloId?:     string;
  submodulo?:    string;
  activoNombre?: string;
  matrizRiesgo?: {
    tecnico:   'LOW' | 'MEDIUM' | 'HIGH';
    normativo: 'LOW' | 'MEDIUM' | 'HIGH';
    operativo: 'LOW' | 'MEDIUM' | 'HIGH';
    economico: 'LOW' | 'MEDIUM' | 'HIGH';
    seguridad: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  nivelPrecision?: 1 | 2 | 3;
  advertencias?:   string[];
}

interface Props {
  datos:   DatosExportar;
  visible: boolean;
  onDXF?:  () => void; // mantenido por compatibilidad — no se usa
}

const GREEN = '#22c55e';
const GOLD  = '#E8A020';
const BLUE  = '#6366f1';
const BG    = '#0a0f1e';

export default function BotonesExportar({ datos, visible }: Props) {
  const [guardando,  setGuardando]  = useState(false);
  const [exportando, setExportando] = useState<'pdf' | 'excel' | 'dxf' | null>(null);
  const [calculoId,  setCalculoId]  = useState<string | null>(null);
  const [hash,       setHash]       = useState<string | null>(null);
  const [msgOk,      setMsgOk]      = useState('');
  const [msgErr,     setMsgErr]     = useState('');

  if (!visible) return null;

  // ── 1. GUARDAR en BD ─────────────────────────────────────────
  const guardar = async (): Promise<string | null> => {
    if (calculoId) return calculoId;
    setGuardando(true);
    setMsgErr('');
    try {
      const res = await fetch('/api/calculos/guardar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo:         datos.tipo,
          moduloId:     datos.moduloId    ?? datos.tipo,
          submodulo:    datos.submodulo   ?? null,
          activoNombre: datos.activoNombre ?? null,
          normativa:    datos.normativa    ?? null,
          parametros:   datos.parametros,
          resultado:    datos.resultado,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        setMsgErr(e.error || 'Error al guardar');
        return null;
      }
      const data = await res.json();
      setCalculoId(data.id);
      setHash(data.hash);
      return data.id;
    } catch {
      setMsgErr('Error de red al guardar el cálculo');
      return null;
    } finally {
      setGuardando(false);
    }
  };

  // ── 2. EXPORTAR PDF ─────────────────────────────────────────
  const exportarPDF = async () => {
    setExportando('pdf');
    setMsgErr('');
    const id = await guardar();
    if (!id) { setExportando(null); return; }
    try {
      const res = await fetch(`/api/calculos/exportar?id=${id}&tipo=pdf`);
      if (!res.ok) { setMsgErr('Error al generar PDF'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `INGENIUM_PRO_${datos.tipo}_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMsgOk('PDF descargado con QR verificable ✓');
    } catch {
      setMsgErr('Error de red al generar PDF');
    } finally {
      setExportando(null);
    }
  };

  // ── 3. EXPORTAR EXCEL ────────────────────────────────────────
  const exportarExcel = async () => {
    setExportando('excel');
    setMsgErr('');
    const id = await guardar();
    if (!id) { setExportando(null); return; }
    try {
      const res = await fetch(`/api/calculos/exportar?id=${id}&tipo=excel`);
      if (!res.ok) { setMsgErr('Error al generar Excel'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `INGENIUM_PRO_${datos.tipo}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setMsgOk('Excel descargado con fórmulas reales ✓');
    } catch {
      setMsgErr('Error de red al generar Excel');
    } finally {
      setExportando(null);
    }
  };

  // ── 4. EXPORTAR DXF — dynamic import por módulo ─────────────
  const exportarDXF = async () => {
    setExportando('dxf');
    setMsgErr('');
    try {
      const mod = await import('@/lib/exportarDXF');
      const key = (datos.moduloId ?? datos.tipo ?? '').toUpperCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = { ...datos.parametros, ...datos.resultado } as any;

      let contenido = '';

      if      (key.includes('MAOP') || key.includes('PETROLEO') || key.includes('TUBERIA'))
        contenido = mod.exportarDXFTuberias(p);
      else if (key.includes('HARDY'))
        contenido = mod.exportarDXFHardyCross(p);
      else if (key === 'DW' || key.includes('HIDRAULICA'))
        contenido = mod.exportarDXFHidraulica(p);
      else if (key === 'WH' || key.includes('JOUKOWSKY') || key.includes('ARIETE'))
        contenido = mod.exportarDXFGolpeAriete(p);
      else if (key.includes('GEOTECNIA') || key === 'CP' || key === 'ET')
        contenido = mod.exportarDXFGeotecnia(p);
      else if (key.includes('CANERIAS') || key.includes('CANERIA') || key.includes('ESP') || key.includes('HOOP'))
        contenido = mod.exportarDXFCanerias(p);
      else if (key.includes('MMO'))
        contenido = mod.exportarDXFMMO(p);
      else if (key.includes('SOLDADURA') || key.includes('SEL') || key.includes('HI') || key.includes('FIL'))
        contenido = mod.exportarDXFSoldadura(p);
      else if (key.includes('ELECTRICIDAD') || key.includes('CABLE') || key.includes('TRAFO'))
        contenido = mod.exportarDXFElectricidad(p);
      else if (key.includes('VALVULA') || key.includes('BRIDA') || key.includes('CV'))
        contenido = mod.exportarDXFValvulas(p);
      else if (key.includes('TERMICA') || key === 'DIL' || key.includes('DILATACION'))
        contenido = mod.exportarDXFDilatacion(p);
      else if (key.includes('INTEGRIDAD'))
        contenido = mod.exportarDXFIntegridad(p);
      else if (key.includes('REPRESAS') || key.includes('VERTEDERO') || key.includes('FILTRACION'))
        contenido = mod.exportarDXFHidrologia(p);
      else if (key.includes('FATIGA'))
        contenido = mod.exportarDXFFatiga(p);
      else if (key.includes('TALUD'))
        contenido = mod.exportarDXFTaludes(p);

      if (contenido) {
        mod.descargarDXF(contenido, `INGENIUM_PRO_${datos.tipo}_${Date.now()}.dxf`);
        setMsgOk('Archivo DXF descargado ✓');
      } else {
        setMsgErr('DXF no disponible para este módulo');
      }
    } catch {
      setMsgErr('Error al generar DXF');
    } finally {
      setExportando(null);
    }
  };

  const cargando = guardando || exportando !== null;

  return (
    <div style={{ margin: '24px 0 8px', padding: '20px 24px', background: BG, border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16 }}>

      {/* TÍTULO */}
      <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>
        📤 Exportar resultado
      </div>

      {/* BOTONES */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

        {/* PDF */}
        <button
          onClick={exportarPDF}
          disabled={cargando}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: exportando === 'pdf' ? 'rgba(99,102,241,0.3)' : `linear-gradient(135deg,${BLUE},#4f46e5)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: cargando ? 'wait' : 'pointer', opacity: cargando && exportando !== 'pdf' ? 0.5 : 1 }}
        >
          {exportando === 'pdf' ? '⏳' : '📄'} {exportando === 'pdf' ? 'Generando...' : 'PDF + QR'}
        </button>

        {/* EXCEL */}
        <button
          onClick={exportarExcel}
          disabled={cargando}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: exportando === 'excel' ? 'rgba(34,197,94,0.3)' : `linear-gradient(135deg,${GREEN},#16a34a)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: cargando ? 'wait' : 'pointer', opacity: cargando && exportando !== 'excel' ? 0.5 : 1 }}
        >
          {exportando === 'excel' ? '⏳' : '📊'} {exportando === 'excel' ? 'Generando...' : 'Excel'}
        </button>

        {/* DXF — dynamic import por módulo */}
        <button
          onClick={exportarDXF}
          disabled={cargando}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: `1px solid rgba(232,160,32,0.4)`, background: exportando === 'dxf' ? 'rgba(232,160,32,0.15)' : 'transparent', color: GOLD, fontSize: 13, fontWeight: 700, cursor: cargando ? 'wait' : 'pointer', opacity: cargando && exportando !== 'dxf' ? 0.5 : 1 }}
        >
          {exportando === 'dxf' ? '⏳' : '📐'} {exportando === 'dxf' ? 'Generando...' : 'DXF CAD'}
        </button>

        {/* GUARDAR SOLO */}
        {!calculoId && (
          <button
            onClick={guardar}
            disabled={cargando}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: cargando ? 'wait' : 'pointer' }}
          >
            {guardando ? '⏳ Guardando...' : '💾 Guardar'}
          </button>
        )}
      </div>

      {/* ESTADO GUARDADO */}
      {calculoId && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: GREEN, fontSize: 11, fontWeight: 700 }}>✓ Guardado en historial</span>
          {hash && (
            <a
              href={`/verify/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 10, color: '#6366f1', textDecoration: 'none', marginLeft: 8 }}
            >
              Ver verificación →
            </a>
          )}
        </div>
      )}

      {/* MENSAJES */}
      {msgOk && <div style={{ marginTop: 10, fontSize: 12, color: GREEN, fontWeight: 600 }}>✓ {msgOk}</div>}
      {msgErr && <div style={{ marginTop: 10, fontSize: 12, color: '#ef4444' }}>✗ {msgErr}</div>}

      {/* AVISO LEGAL */}
      <div style={{ marginTop: 14, fontSize: 9, color: '#1e3a5f', lineHeight: 1.5 }}>
        Los resultados deben ser validados por un profesional matriculado antes de su aplicación.{' '}
        <a href="/terminos" style={{ color: '#334155', textDecoration: 'none' }}>Ver términos</a>
      </div>
    </div>
  );
}
