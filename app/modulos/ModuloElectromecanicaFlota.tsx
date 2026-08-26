'use client';
import { useState, useEffect } from 'react';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { getLang, EVENTO_IDIOMA } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import {
  calcularDerateoTermico, definicionServicio,
  limiteTemperaturaBobinado, verificarArranqueDisenoN,
} from '@/lib/calculosElectromecanicaFlota';
import type { TipoServicio, ClaseTermica, MetodoDeteccion } from '@/lib/calculosElectromecanicaFlota';

// Módulo 18 — Electromecánica de Flota Pesada
// Secciones "Motores y Generadores" y "Arranque y Protección Térmica" —
// cálculos orientativos, sin tabla kVA/kW todavía (queda para otra tanda).

type MarcoNormativo = 'SAE_API_ASME' | 'IEC_ISO';
type Voltaje = '12V' | '24V';
type Polos = '2' | '4' | '6' | '8';

const POLOS_OPCIONES: Polos[] = ['2', '4', '6', '8'];
const SERVICIOS_OPCIONES: TipoServicio[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
const CLASES_TERMICAS: ClaseTermica[] = ['130', '155', '180', '200'];
const METODOS_DETECCION: { id: MetodoDeteccion; label: string }[] = [
  { id: 'lento',  label: 'Lento' },
  { id: 'rapido', label: 'Rápido' },
];

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

  // Motores y Generadores
  const [potenciaNominal, setPotenciaNominal] = useState('');
  const [polos, setPolos] = useState<Polos>('4');
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>('S1');
  const [altitudInstalacion, setAltitudInstalacion] = useState('');
  const [temperaturaAmbiente, setTemperaturaAmbiente] = useState('');

  // Arranque y Protección Térmica
  const [claseTermica, setClaseTermica] = useState<ClaseTermica>('155');
  const [metodoDeteccion, setMetodoDeteccion] = useState<MetodoDeteccion>('lento');

  const [payload, setPayload] = useState<DatosExportar | null>(null);

  const derateo = calcularDerateoTermico(
    Number(altitudInstalacion) || 0,
    Number(temperaturaAmbiente) || 0,
  );
  const clasificacionServicio = definicionServicio(tipoServicio);
  const limiteTemp = limiteTemperaturaBobinado(claseTermica, metodoDeteccion);
  const arranque = verificarArranqueDisenoN(Number(potenciaNominal) || 0, polos);

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
        'Marco normativo':              marcoNormativo,
        'Voltaje':                      voltaje,
        'Potencia nominal (kW)':        Number(potenciaNominal) || 0,
        'Polos':                        polos,
        'Tipo de servicio':             tipoServicio,
        'Altitud instalacion (m)':      Number(altitudInstalacion) || 0,
        'Temperatura ambiente (C)':     Number(temperaturaAmbiente) || 0,
        'Clase termica':                claseTermica,
        'Metodo deteccion':             metodoDeteccion,
      },
      resultado: {
        'Salto termico admisible (K)':      derateo.saltoTermicoAdmisibleK,
        'Derrateo estimado':                derateo.derrateoEstimado,
        'Clasificacion de servicio':         clasificacionServicio,
        'Limite temperatura bobinado (C)':   limiteTemp,
        'Arranque Diseno N - estado':        arranque.estado,
        'Arranque Diseno N - mensaje':       arranque.mensaje,
      },
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

        {/* MOTORES Y GENERADORES */}
        <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ color: TEAL, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Motores y Generadores
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Potencia nominal (kW)
              </label>
              <input
                type="number"
                min={0}
                value={potenciaNominal}
                onChange={e => setPotenciaNominal(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Polos
              </label>
              <select
                value={polos}
                onChange={e => setPolos(e.target.value as Polos)}
                style={{ width: '100%', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              >
                {POLOS_OPCIONES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Tipo de servicio
              </label>
              <select
                value={tipoServicio}
                onChange={e => setTipoServicio(e.target.value as TipoServicio)}
                style={{ width: '100%', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              >
                {SERVICIOS_OPCIONES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Altitud instalación (m)
              </label>
              <input
                type="number"
                min={0}
                value={altitudInstalacion}
                onChange={e => setAltitudInstalacion(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Temperatura ambiente (°C)
              </label>
              <input
                type="number"
                value={temperaturaAmbiente}
                onChange={e => setTemperaturaAmbiente(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Derrateo térmico estimado
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {derateo.derrateoEstimado}
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Clasificación de servicio (IEC 60034-1)
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {clasificacionServicio}
            </div>
          </div>
        </div>

        {/* ARRANQUE Y PROTECCIÓN TÉRMICA */}
        <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ color: TEAL, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Arranque y Protección Térmica
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Clase térmica
              </label>
              <select
                value={claseTermica}
                onChange={e => setClaseTermica(e.target.value as ClaseTermica)}
                style={{ width: '100%', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              >
                {CLASES_TERMICAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Método detección
              </label>
              <select
                value={metodoDeteccion}
                onChange={e => setMetodoDeteccion(e.target.value as MetodoDeteccion)}
                style={{ width: '100%', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              >
                {METODOS_DETECCION.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Límite de temperatura de bobinado (IEC 60034-11)
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {limiteTemp} °C
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Verificación de arranque (IEC 60034-12 Diseño N)
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {arranque.mensaje}
            </div>
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
