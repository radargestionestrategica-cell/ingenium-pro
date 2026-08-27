'use client';
import { useState, useEffect } from 'react';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { getLang, EVENTO_IDIOMA } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import {
  calcularDerateoTermico, definicionServicio,
  limiteTemperaturaBobinado, verificarArranqueDisenoN,
  caidaTension, fusibleSugerido, verificarAmpacidadCable,
  ccaDisponible, alternadorRequerido,
  verificarClaseTemperatura, verificarBonding,
} from '@/lib/calculosElectromecanicaFlota';
import type { TipoServicio, ClaseTermica, MetodoDeteccion } from '@/lib/calculosElectromecanicaFlota';

// Módulo 18 — Electromecánica de Flota Pesada
// Secciones "Motores y Generadores", "Arranque y Protección Térmica",
// "Cableado y Protección", "Batería y Alternador" y "Zona Clasificada y
// Bonding" — cálculos orientativos, sin tabla kVA/kW todavía (queda
// para otra tanda).

type MarcoNormativo = 'SAE_API_ASME' | 'IEC_ISO';
type Voltaje = '12V' | '24V';
type Polos = '2' | '4' | '6' | '8';
type ZonaPozo = 'Zona 0' | 'Zona 1' | 'Zona 2';
type MetodoProteccion = 'Ex d' | 'Ex e' | 'Ex ia';

const POLOS_OPCIONES: Polos[] = ['2', '4', '6', '8'];
const SERVICIOS_OPCIONES: TipoServicio[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
const CLASES_TERMICAS: ClaseTermica[] = ['130', '155', '180', '200'];
const METODOS_DETECCION: { id: MetodoDeteccion; label: string }[] = [
  { id: 'lento',  label: 'Lento' },
  { id: 'rapido', label: 'Rápido' },
];
const ZONAS_POZO: ZonaPozo[] = ['Zona 0', 'Zona 1', 'Zona 2'];
const METODOS_PROTECCION: MetodoProteccion[] = ['Ex d', 'Ex e', 'Ex ia'];

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

  // Cableado y Protección
  const [corrienteCircuito, setCorrienteCircuito] = useState('');
  const [longitudTramo, setLongitudTramo] = useState('');
  const [seccionCable, setSeccionCable] = useState('');
  const [incluirRetorno, setIncluirRetorno] = useState(false);

  // Batería y Alternador
  const [ccaNominal, setCcaNominal] = useState('');
  const [tempArranque, setTempArranque] = useState('');
  const [cargaContinua, setCargaContinua] = useState('');
  const [cargaIntermitente, setCargaIntermitente] = useState('');

  // Zona Clasificada y Bonding
  const [zonaPozo, setZonaPozo] = useState<ZonaPozo>('Zona 1');
  const [metodoProteccion, setMetodoProteccion] = useState<MetodoProteccion>('Ex d');
  const [temperaturaAutoignicion, setTemperaturaAutoignicion] = useState('');
  const [resistenciaBonding, setResistenciaBonding] = useState('');
  const [esVacuum, setEsVacuum] = useState(false);

  const [payload, setPayload] = useState<DatosExportar | null>(null);

  const derateo = calcularDerateoTermico(
    Number(altitudInstalacion) || 0,
    Number(temperaturaAmbiente) || 0,
  );
  const clasificacionServicio = definicionServicio(tipoServicio);
  const limiteTemp = limiteTemperaturaBobinado(claseTermica, metodoDeteccion);
  const arranque = verificarArranqueDisenoN(Number(potenciaNominal) || 0, polos);

  const caida = caidaTension(
    Number(corrienteCircuito) || 0,
    Number(longitudTramo) || 0,
    Number(seccionCable) || 0,
    incluirRetorno,
    voltaje === '12V' ? 12 : 24,
  );
  const fusible = fusibleSugerido(Number(corrienteCircuito) || 0);
  const ampacidad = verificarAmpacidadCable();

  const cca = ccaDisponible(Number(ccaNominal) || 0, Number(tempArranque) || 0);
  const alternador = alternadorRequerido(Number(cargaContinua) || 0, Number(cargaIntermitente) || 0);

  const claseTemp = verificarClaseTemperatura(Number(temperaturaAutoignicion) || 0);
  const bonding = verificarBonding(Number(resistenciaBonding) || 0);
  const advertenciaZona = zonaPozo === 'Zona 0' && metodoProteccion !== 'Ex ia'
    ? 'Zona 0 requiere EPL Ga (Ex ia u equivalente) - IEC 60079-14 Tabla 1. Ex d y Ex e (EPL Gb) no son aptos para Zona 0.'
    : null;
  const notaVacuum = esVacuum
    ? 'Unidad vacuum en servicio petrolero - aplica ademas API 2219.'
    : null;

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
        'Corriente circuito (A)':       Number(corrienteCircuito) || 0,
        'Longitud tramo (m)':           Number(longitudTramo) || 0,
        'Seccion cable (mm2)':          Number(seccionCable) || 0,
        'Incluye retorno a masa':       incluirRetorno,
        'CCA nominal bateria (A)':      Number(ccaNominal) || 0,
        'Temperatura ambiente arranque (C)': Number(tempArranque) || 0,
        'Carga continua estimada (A)': Number(cargaContinua) || 0,
        'Carga intermitente estimada (A)': Number(cargaIntermitente) || 0,
        'Zona del pozo':                zonaPozo,
        'Metodo de proteccion':         metodoProteccion,
        'Temperatura autoignicion (C)': Number(temperaturaAutoignicion) || 0,
        'Resistencia bonding (ohms)':   Number(resistenciaBonding) || 0,
        'Es unidad vacuum':             esVacuum,
      },
      resultado: {
        'Salto termico admisible (K)':      derateo.saltoTermicoAdmisibleK,
        'Derrateo estimado':                derateo.derrateoEstimado,
        'Clasificacion de servicio':         clasificacionServicio,
        'Limite temperatura bobinado (C)':   limiteTemp,
        'Arranque Diseno N - estado':        arranque.estado,
        'Arranque Diseno N - mensaje':       arranque.mensaje,
        'Caida de tension (V)':              caida.caidaV,
        'Caida de tension (%)':              caida.caidaPorcentaje,
        'Fusible sugerido':                  fusible.mensaje,
        'Ampacidad cable':                   ampacidad.mensaje,
        'CCA disponible (A)':                cca.ccaDisponible,
        'CCA disponible - nota':             cca.mensaje,
        'Alternador minimo (A)':             alternador.alternadorMinimoA,
        'Alternador - metodologia':          alternador.mensaje,
        'Clase de temperatura (IEC 60079-0)': claseTemp.mensaje,
        'Bonding - apto':                     bonding.apto,
        'Bonding - mensaje':                  bonding.mensaje,
        ...(advertenciaZona ? { 'Advertencia zona clasificada': advertenciaZona } : {}),
        ...(notaVacuum ? { 'Nota vacuum (API 2219)': notaVacuum } : {}),
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

        {/* CABLEADO Y PROTECCIÓN */}
        <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ color: TEAL, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Cableado y Protección
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Corriente del circuito (A)
              </label>
              <input
                type="number"
                min={0}
                value={corrienteCircuito}
                onChange={e => setCorrienteCircuito(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Longitud del tramo (m)
              </label>
              <input
                type="number"
                min={0}
                value={longitudTramo}
                onChange={e => setLongitudTramo(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Sección del cable (mm²)
              </label>
              <input
                type="number"
                min={0}
                value={seccionCable}
                onChange={e => setSeccionCable(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={incluirRetorno}
                  onChange={e => setIncluirRetorno(e.target.checked)}
                />
                Incluir retorno a masa (ida y vuelta)
              </label>
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Caída de tensión
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {caida.caidaV} V ({caida.caidaPorcentaje}% sobre {voltaje})
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Fusible sugerido (blade)
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {fusible.mensaje}
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Ampacidad de cable
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {ampacidad.mensaje}
            </div>
          </div>
        </div>

        {/* BATERÍA Y ALTERNADOR */}
        <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ color: TEAL, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Batería y Alternador
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                CCA nominal de batería (A)
              </label>
              <input
                type="number"
                min={0}
                value={ccaNominal}
                onChange={e => setCcaNominal(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Temperatura ambiente de arranque (°C)
              </label>
              <input
                type="number"
                value={tempArranque}
                onChange={e => setTempArranque(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Carga continua estimada (A)
              </label>
              <input
                type="number"
                min={0}
                value={cargaContinua}
                onChange={e => setCargaContinua(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Carga intermitente estimada (A)
              </label>
              <input
                type="number"
                min={0}
                value={cargaIntermitente}
                onChange={e => setCargaIntermitente(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              CCA disponible (SAE J537)
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {cca.ccaDisponible} A — {cca.mensaje}
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Alternador mínimo requerido (metodología Delco Remy)
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {alternador.alternadorMinimoA} A — {alternador.mensaje}
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Formato de placa de alternador (SAE J56)
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              Los alternadores se marcan como "IL/IR A VT V" (ej: 50/120A 13.5V) = corriente a ralentí (1500rpm) / corriente a régimen nominal (6000rpm), medidos a voltaje de prueba VT (13.5V para 12V, 27.0V para 24V).
            </div>
          </div>
        </div>

        {/* ZONA CLASIFICADA Y BONDING */}
        <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ color: TEAL, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Zona Clasificada y Bonding
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Zona del pozo
              </label>
              <select
                value={zonaPozo}
                onChange={e => setZonaPozo(e.target.value as ZonaPozo)}
                style={{ width: '100%', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              >
                {ZONAS_POZO.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Método de protección del equipo
              </label>
              <select
                value={metodoProteccion}
                onChange={e => setMetodoProteccion(e.target.value as MetodoProteccion)}
                style={{ width: '100%', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              >
                {METODOS_PROTECCION.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Temperatura de autoignición (°C)
              </label>
              <input
                type="number"
                min={0}
                value={temperaturaAutoignicion}
                onChange={e => setTemperaturaAutoignicion(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Resistencia de bonding medida (Ω)
              </label>
              <input
                type="number"
                min={0}
                value={resistenciaBonding}
                onChange={e => setResistenciaBonding(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>

            <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={esVacuum}
                  onChange={e => setEsVacuum(e.target.checked)}
                />
                Es unidad vacuum (API 2219)
              </label>
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Clase de temperatura (IEC 60079-0)
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
              {claseTemp.mensaje}
            </div>
          </div>

          <div style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14, marginBottom: (advertenciaZona || notaVacuum) ? 10 : 0 }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Bonding (API RP 2003)
            </div>
            <div style={{ color: bonding.apto ? '#f1f5f9' : '#ef4444', fontSize: 12, lineHeight: 1.6 }}>
              {bonding.mensaje}
            </div>
          </div>

          {advertenciaZona && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 14, marginBottom: notaVacuum ? 10 : 0 }}>
              <div style={{ color: '#ef4444', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, fontWeight: 700 }}>
                Advertencia
              </div>
              <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
                {advertenciaZona}
              </div>
            </div>
          )}

          {notaVacuum && (
            <div style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.3)', borderRadius: 10, padding: 14 }}>
              <div style={{ color: '#E8A020', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, fontWeight: 700 }}>
                Nota
              </div>
              <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.6 }}>
                {notaVacuum}
              </div>
            </div>
          )}
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
