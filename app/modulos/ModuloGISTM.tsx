'use client';
import { useState } from 'react';
import { PRINCIPLES_GISTM } from '@/lib/calculosGISTM';

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

export default function ModuloGISTM() {
  const [pestanaActiva, setPestanaActiva] = useState<TopicId>('I');
  const [estados, setEstados] = useState<Record<string, EstadoRequisito>>({});

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
              Principle {principle.id}
            </div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
              {principle.titulo}
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
                    {requisito.texto}
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

      </div>
    </div>
  );
}
