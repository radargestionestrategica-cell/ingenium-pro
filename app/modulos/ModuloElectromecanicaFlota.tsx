'use client';
import { useState, useEffect } from 'react';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { getLang, EVENTO_IDIOMA } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

// Módulo 18 — Electromecánica de Flota Pesada
// Esqueleto de estructura — sin lógica de cálculo todavía.

type MarcoNormativo = 'SAE_API_ASME' | 'IEC_ISO';
type Voltaje = '12V' | '24V';

const MARCOS: { id: MarcoNormativo; label: string }[] = [
  { id: 'SAE_API_ASME', label: 'SAE / API / ASME' },
  { id: 'IEC_ISO',       label: 'IEC / ISO' },
];

const VOLTAJES: { id: Voltaje; label: string }[] = [
  { id: '12V', label: '12V' },
  { id: '24V', label: '24V' },
];

const TEAL  = '#2dd4bf';
const BG    = '#0f172a';
const PANEL = '#1e293b';
const BORD  = '#334155';

export default function ModuloElectromecanicaFlota() {
  const [lang, setLang] = useState<Lang>(() => getLang());
  const [marcoNormativo, setMarcoNormativo] = useState<MarcoNormativo>('SAE_API_ASME');
  const [voltaje, setVoltaje] = useState<Voltaje>('12V');
  const [payload, setPayload] = useState<DatosExportar | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Lang>;
      setLang(ce.detail);
    };
    window.addEventListener(EVENTO_IDIOMA, handler);
    return () => window.removeEventListener(EVENTO_IDIOMA, handler);
  }, []);

  const generarResultado = () => {
    const nuevoPayload: DatosExportar = {
      tipo:      'ELECTROMECANICA_FLOTA',
      normativa: marcoNormativo === 'SAE_API_ASME' ? 'SAE / API / ASME' : 'IEC / ISO',
      parametros: {
        'Marco normativo': marcoNormativo,
        'Voltaje':         voltaje,
      },
      resultado: {},
    };
    setPayload(nuevoPayload);
    publicarResultado(nuevoPayload);
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* ENCABEZADO */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>
            {lang === 'es' ? 'Módulo Electromecánica de Flota Pesada' : 'Heavy Fleet Electromechanical Module'}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>
            {lang === 'es'
              ? 'Diagnóstico y cálculo electromecánico para flota pesada'
              : 'Electromechanical diagnostics and calculations for heavy fleet'}
          </div>
        </div>

        {/* SELECTOR MARCO NORMATIVO */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {MARCOS.map(m => (
            <button key={m.id} onClick={() => setMarcoNormativo(m.id)}
              style={{
                flex: '1 1 auto', padding: '10px 12px', borderRadius: 10,
                border: `1px solid ${marcoNormativo === m.id ? TEAL : BORD}`,
                background: marcoNormativo === m.id ? 'rgba(45,212,191,0.12)' : 'transparent',
                color: marcoNormativo === m.id ? TEAL : '#94a3b8',
                fontWeight: 800, fontSize: 12, cursor: 'pointer', letterSpacing: 0.3,
              }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* SELECTOR VOLTAJE */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {VOLTAJES.map(v => (
            <button key={v.id} onClick={() => setVoltaje(v.id)}
              style={{
                flex: '1 1 auto', padding: '10px 12px', borderRadius: 10,
                border: `1px solid ${voltaje === v.id ? TEAL : BORD}`,
                background: voltaje === v.id ? 'rgba(45,212,191,0.12)' : 'transparent',
                color: voltaje === v.id ? TEAL : '#94a3b8',
                fontWeight: 800, fontSize: 12, cursor: 'pointer', letterSpacing: 0.3,
              }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* CONTENEDOR VACÍO PARA INPUTS FUTUROS */}
        <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ color: '#64748b', fontSize: 12 }}>
            {lang === 'es' ? 'Próximamente: parámetros de cálculo' : 'Coming soon: calculation parameters'}
          </div>
        </div>

        {/* GENERAR RESULTADO */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            onClick={generarResultado}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: TEAL, color: '#0f172a', fontWeight: 800, fontSize: 13, cursor: 'pointer',
            }}
          >
            {lang === 'es' ? 'Generar resultado' : 'Generate result'}
          </button>
        </div>

        {payload && <BotonesExportar visible={true} datos={payload} />}

      </div>
    </div>
  );
}
