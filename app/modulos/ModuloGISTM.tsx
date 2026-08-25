'use client';
import { useState, useEffect } from 'react';
import { PRINCIPLES_GISTM, clasificarConsecuencia, CRITERIO_CRECIDA, CRITERIO_SISMICO } from '@/lib/calculosGISTM';
import type { NivelConsecuencia } from '@/lib/calculosGISTM';
import { publicarResultado } from '@/components/ResultadoContexto';
import BotonesExportar, { DatosExportar } from '@/components/BotonesExportar';
import { getLang, EVENTO_IDIOMA } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

// GISTM — Global Industry Standard on Tailings Management (ICMM/UNEP/PRI, agosto 2020)
// Checklist de auto-evaluación de cumplimiento por requisito, sin guardado/sellado todavía.

interface EstadoRequisito {
  status: 'cumple' | 'no_cumple' | 'no_aplica';
  justificacion?: string;
  referenciaEvidencia?: string;
}

const TOPICS = [
  { id: 'I',   label: 'I · Comunidades afectadas' },
  { id: 'II',  label: 'II · Base de conocimiento integrada' },
  { id: 'III', label: 'III · Diseño, construcción, operación y monitoreo' },
  { id: 'IV',  label: 'IV · Gestión y gobernanza' },
  { id: 'V',   label: 'V · Respuesta a emergencias y recuperación' },
  { id: 'VI',  label: 'VI · Divulgación pública y acceso a la información' },
] as const;

type TopicId = typeof TOPICS[number]['id'];

const TEAL  = '#2dd4bf';
const BG    = '#0f172a';
const PANEL = '#1e293b';
const CARD  = '#0f172a';
const BORD  = '#334155';

const statusColor: Record<EstadoRequisito['status'], string> = {
  cumple: '#22c55e',
  no_cumple: '#ef4444',
  no_aplica: '#64748b',
};

const nivelColor: Record<NivelConsecuencia['id'], string> = {
  low: '#22c55e',
  significant: '#eab308',
  high: '#f97316',
  very_high: '#ef4444',
  extreme: '#b91c1c',
};

export default function ModuloGISTM() {
  const [lang, setLang] = useState<Lang>(() => getLang());
  const [pestanaActiva, setPestanaActiva] = useState<TopicId>('I');
  const [estados, setEstados] = useState<Record<string, EstadoRequisito>>({});

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Lang>;
      setLang(ce.detail);
    };
    window.addEventListener(EVENTO_IDIOMA, handler);
    return () => window.removeEventListener(EVENTO_IDIOMA, handler);
  }, []);

  // Clasificación de Consecuencia (Annex 2, Tabla 1) — estos dos valores y su
  // resultado derivado quedan en el estado del componente para usarlos en el
  // payload del guardado HMAC en el próximo paso.
  const [poblacionRiesgo, setPoblacionRiesgo] = useState('');
  const [perdidaVidasPotencial, setPerdidaVidasPotencial] = useState('');

  const clasificacion = clasificarConsecuencia(
    Number(poblacionRiesgo) || 0,
    Number(perdidaVidasPotencial) || 0,
  );
  const criterioCrecida = CRITERIO_CRECIDA.find(c => c.nombre === clasificacion.nombre);
  const criterioSismico = CRITERIO_SISMICO.find(c => c.nombre === clasificacion.nombre);

  const [payload, setPayload] = useState<DatosExportar | null>(null);

  const todosRequisitos = PRINCIPLES_GISTM.flatMap(p => p.requisitos);
  const resumenChecklist = {
    cumple:    todosRequisitos.filter(r => estados[r.id]?.status === 'cumple').length,
    no_cumple: todosRequisitos.filter(r => estados[r.id]?.status === 'no_cumple').length,
    no_aplica: todosRequisitos.filter(r => estados[r.id]?.status === 'no_aplica').length,
  };

  const generarResultado = () => {
    const nuevoPayload: DatosExportar = {
      tipo:      'GISTM_CONFORMIDAD',
      normativa: 'ICMM/UNEP/PRI - GISTM (agosto 2020)',
      parametros: {
        'Poblacion en riesgo':          Number(poblacionRiesgo) || 0,
        'Perdida de vidas potencial':   Number(perdidaVidasPotencial) || 0,
      },
      resultado: {
        'Nivel de clasificacion':                              clasificacion.nombre,
        'Probabilidad crecida - Operacion/Cierre Activo':       criterioCrecida?.probabilidadOperacion ?? '—',
        'Probabilidad crecida - Cierre Pasivo':                 criterioCrecida?.probabilidadCierrePasivo ?? '—',
        'Probabilidad sismico - Operacion/Cierre Activo':       criterioSismico?.probabilidadOperacion ?? '—',
        'Probabilidad sismico - Cierre Pasivo':                 criterioSismico?.probabilidadCierrePasivo ?? '—',
        'Requisitos cumple':                                    resumenChecklist.cumple,
        'Requisitos no cumple':                                 resumenChecklist.no_cumple,
        'Requisitos no aplica':                                 resumenChecklist.no_aplica,
        'Total requisitos':                                     todosRequisitos.length,
      },
      nivel: clasificacion.id,
    };
    setPayload(nuevoPayload);
    publicarResultado(nuevoPayload);
  };

  const setStatus = (id: string, status: EstadoRequisito['status']) => {
    setEstados(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), status } }));
  };

  const setCampo = (
    id: string,
    campo: 'justificacion' | 'referenciaEvidencia',
    valor: string,
  ) => {
    setEstados(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? { status: 'no_aplica' as const }), [campo]: valor },
    }));
  };

  const principiosDelTopic = PRINCIPLES_GISTM.filter(p => p.topicId === pestanaActiva);

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* ENCABEZADO */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>Módulo GISTM</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>
            Checklist de cumplimiento — Global Industry Standard on Tailings Management
          </div>
          <div style={{ background: PANEL, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b' }}>
            Normativa: ICMM / UNEP / PRI — Global Industry Standard on Tailings Management (agosto 2020)
          </div>
        </div>

        {/* CLASIFICACIÓN DE CONSECUENCIA — Annex 2, Tabla 1 */}
        <div style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ color: TEAL, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Annex 2 · Tabla 1
          </div>
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
            Clasificación de Consecuencia
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Población en riesgo (personas)
              </label>
              <input
                type="number"
                min={0}
                value={poblacionRiesgo}
                onChange={e => setPoblacionRiesgo(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                Pérdida de vidas potencial
              </label>
              <input
                type="number"
                min={0}
                value={perdidaVidasPotencial}
                onChange={e => setPerdidaVidasPotencial(e.target.value)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
              />
            </div>
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ color: '#94a3b8', fontSize: 11 }}>Nivel:</span>
              <span style={{ color: nivelColor[clasificacion.id], fontWeight: 800, fontSize: 14 }}>
                {clasificacion.nombre}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <div>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                  Crecida · Operación/Cierre Activo
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700 }}>
                  {criterioCrecida?.probabilidadOperacion ?? '—'}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                  Crecida · Cierre Pasivo
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700 }}>
                  {criterioCrecida?.probabilidadCierrePasivo ?? '—'}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                  Sísmico · Operación/Cierre Activo
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700 }}>
                  {criterioSismico?.probabilidadOperacion ?? '—'}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                  Sísmico · Cierre Pasivo
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700 }}>
                  {criterioSismico?.probabilidadCierrePasivo ?? '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PESTAÑAS POR TOPIC */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {TOPICS.map(t => (
            <button key={t.id} onClick={() => setPestanaActiva(t.id)}
              style={{
                flex: '1 1 auto', padding: '10px 12px', borderRadius: 10,
                border: `1px solid ${pestanaActiva === t.id ? TEAL : BORD}`,
                background: pestanaActiva === t.id ? 'rgba(45,212,191,0.12)' : 'transparent',
                color: pestanaActiva === t.id ? TEAL : '#94a3b8',
                fontWeight: 800, fontSize: 12, cursor: 'pointer', letterSpacing: 0.3,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO DEL TOPIC ACTIVO */}
        {principiosDelTopic.map(principle => (
          <div key={principle.id} style={{ background: PANEL, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ color: TEAL, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              {lang === 'es' ? 'Principio' : 'Principle'} {principle.id}
            </div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
              {lang === 'es' && principle.tituloEs ? principle.tituloEs : principle.titulo}
            </div>

            {principle.requisitos.map(requisito => {
              const estado = estados[requisito.id];
              return (
                <div key={requisito.id} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: TEAL, fontWeight: 800, fontSize: 12 }}>{requisito.id}</span>
                    {estado?.status && (
                      <span style={{ color: statusColor[estado.status], fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                        {estado.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
                    {lang === 'es' && requisito.textoEs ? requisito.textoEs : requisito.texto}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <select
                      value={estado?.status ?? ''}
                      onChange={e => setStatus(requisito.id, e.target.value as EstadoRequisito['status'])}
                      style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
                    >
                      <option value="" disabled>Seleccionar estado…</option>
                      <option value="cumple">Cumple</option>
                      <option value="no_cumple">No cumple</option>
                      <option value="no_aplica">No aplica</option>
                    </select>
                    <input
                      placeholder="Justificación (opcional)"
                      value={estado?.justificacion ?? ''}
                      onChange={e => setCampo(requisito.id, 'justificacion', e.target.value)}
                      style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
                    />
                    <input
                      placeholder="Referencia / evidencia (opcional)"
                      value={estado?.referenciaEvidencia ?? ''}
                      onChange={e => setCampo(requisito.id, 'referenciaEvidencia', e.target.value)}
                      style={{ background: BG, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 12 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* GENERAR RESULTADO */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            onClick={generarResultado}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: TEAL, color: '#0f172a', fontWeight: 800, fontSize: 13, cursor: 'pointer',
            }}
          >
            Generar resultado
          </button>
        </div>

        {payload && <BotonesExportar visible={true} datos={payload} />}

      </div>
    </div>
  );
}
