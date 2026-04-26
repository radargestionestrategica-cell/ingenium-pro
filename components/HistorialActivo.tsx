'use client';
// components/HistorialActivo.tsx
// INGENIUM PRO V8 — Panel de Integridad de Activos
// Asset Integrity Management — evolución temporal + semáforo + alertas + exportación
// Campos: verificados contra schema.prisma y respuesta real de historial/route.ts

import { useState, useEffect, useCallback } from 'react';

// ── Tipos exactos basados en schema.prisma verificado ────────────────────────
type Calculo = {
  id:           string;
  tipo:         string;
  moduloId:     string | null;
  submodulo:    string | null;
  activoNombre: string | null;
  parametros:   Record<string, unknown>;
  resultado:    Record<string, unknown>;
  normativa:    string | null;
  hash:         string | null;
  alerta:       boolean;
  alertaMsg:    string | null;
  usuario:      string;
  createdAt:    string; // viene como string ISO del JSON
};

// Respuesta real de historial/route.ts — verificada en imagen
type RespuestaHistorial = {
  calculos:         Calculo[];
  fechaInicio:      string;
  fechaUltimo:      string;
  totalMediciones:  number;
  totalAlertas:     number;
  tendencias:       Record<string, unknown>;
  estadoGeneral:    'DETERIORO' | 'MEJORA' | 'ESTABLE';
};

type Props = {
  usuarioId:    string;
  proyectoId?:  string;
  activoNombre?: string;
  moduloId?:    string;
};

// ── Colores semáforo ─────────────────────────────────────────────────────────
const SEMAFORO = {
  DETERIORO: { bg: 'bg-red-900/40',    border: 'border-red-500',    texto: 'text-red-400',    icono: '🔴', label: 'DETERIORO'  },
  MEJORA:    { bg: 'bg-yellow-900/40', border: 'border-yellow-500', texto: 'text-yellow-400', icono: '🟡', label: 'MEJORA'     },
  ESTABLE:   { bg: 'bg-green-900/40',  border: 'border-green-500',  texto: 'text-green-400',  icono: '🟢', label: 'ESTABLE'    },
};

export default function HistorialActivo({ usuarioId, proyectoId, activoNombre, moduloId }: Props) {
  const [datos,     setDatos]     = useState<RespuestaHistorial | null>(null);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [exportando, setExportando] = useState<'excel' | 'pdf' | null>(null);
  const [calcSelec, setCalcSelec] = useState<Calculo | null>(null);

  // ── Cargar historial ──────────────────────────────────────────────────────
  const cargarHistorial = useCallback(async () => {
    if (!usuarioId) return;
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({ usuarioId });
      if (proyectoId)   params.set('proyectoId',   proyectoId);
      if (activoNombre) params.set('activoNombre', activoNombre);
      if (moduloId)     params.set('moduloId',     moduloId);

      const res = await fetch(`/api/calculos/historial?${params.toString()}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json() as RespuestaHistorial;
      setDatos(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar historial');
    } finally {
      setCargando(false);
    }
  }, [usuarioId, proyectoId, activoNombre, moduloId]);

  useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

  // ── Exportar Excel o PDF ──────────────────────────────────────────────────
  const exportar = async (formato: 'excel' | 'pdf', calculoId?: string) => {
    setExportando(formato);
    try {
      const body: Record<string, string> = { usuarioId, formato };
      if (calculoId)  body['calculoId']  = calculoId;
      if (proyectoId) body['proyectoId'] = proyectoId;
      if (moduloId)   body['tipo']       = moduloId;

      const res = await fetch('/api/calculos/exportar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      const fecha    = new Date().toISOString().slice(0, 10);
      const nombre   = activoNombre?.replace(/\s+/g, '_') ?? 'ACTIVO';
      a.href         = url;
      a.download     = formato === 'pdf'
        ? `INGENIUM_PRO_${nombre}_${fecha}.pdf`
        : `INGENIUM_PRO_${nombre}_${fecha}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al exportar');
    } finally {
      setExportando(null);
    }
  };

  // ── Extraer valor principal de resultado para timeline ────────────────────
  const resumenResultado = (calc: Calculo): string => {
    const r = calc.resultado;
    // Intentar extraer el valor más relevante según el módulo
    const candidatos = ['MAOP_bar', 'maop', 'hf', 'dP_bar', 'sigma_term',
      'presion_hidrostatica', 't_min_mm', 'resultado', 'valor'];
    for (const k of candidatos) {
      if (typeof r[k] === 'number' || typeof r[k] === 'string') {
        return `${k}: ${r[k]}`;
      }
    }
    // Primer valor numérico del objeto
    const primero = Object.entries(r).find(([, v]) => typeof v === 'number');
    return primero ? `${primero[0]}: ${primero[1]}` : '—';
  };

  // ── Estados de carga / error ──────────────────────────────────────────────
  if (cargando) return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      <span className="ml-3 text-cyan-400 text-sm">Cargando historial...</span>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm">
      ⚠ {error}
      <button onClick={cargarHistorial} className="ml-4 underline text-red-200">Reintentar</button>
    </div>
  );

  if (!datos) return null;

  const semaforo = SEMAFORO[datos.estadoGeneral] ?? SEMAFORO.ESTABLE;

  return (
    <div className="space-y-4 font-mono text-sm">

      {/* ── CABECERA SEMÁFORO ──────────────────────────────────────────────── */}
      <div className={`p-4 rounded-xl border-2 ${semaforo.bg} ${semaforo.border}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">

          {/* Estado general */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{semaforo.icono}</span>
            <div>
              <p className={`text-lg font-bold ${semaforo.texto}`}>
                {semaforo.label}
              </p>
              <p className="text-gray-400 text-xs">
                {activoNombre ?? 'Activo'} — Estado general del activo
              </p>
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-white font-bold text-xl">{datos.totalMediciones}</p>
              <p className="text-gray-400 text-xs">Mediciones</p>
            </div>
            <div>
              <p className={`font-bold text-xl ${datos.totalAlertas > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {datos.totalAlertas}
              </p>
              <p className="text-gray-400 text-xs">Alertas</p>
            </div>
            <div>
              <p className="text-cyan-400 font-bold text-xs">
                {new Date(datos.fechaInicio).toLocaleDateString('es-AR')}
              </p>
              <p className="text-cyan-400 font-bold text-xs">
                → {new Date(datos.fechaUltimo).toLocaleDateString('es-AR')}
              </p>
              <p className="text-gray-400 text-xs">Período</p>
            </div>
          </div>

          {/* Botones exportar */}
          <div className="flex gap-2">
            <button
              onClick={() => exportar('excel')}
              disabled={exportando !== null}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50
                         text-white text-xs font-bold rounded-lg transition-colors"
            >
              {exportando === 'excel' ? '⏳ Generando...' : '📊 Excel'}
            </button>
            <button
              onClick={() => exportar('pdf')}
              disabled={exportando !== null || datos.calculos.length === 0}
              className="px-3 py-2 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50
                         text-white text-xs font-bold rounded-lg transition-colors"
            >
              {exportando === 'pdf' ? '⏳ Generando...' : '📄 PDF'}
            </button>
            <button
              onClick={cargarHistorial}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600
                         text-white text-xs rounded-lg transition-colors"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* ── ALERTAS ACTIVAS ────────────────────────────────────────────────── */}
      {datos.totalAlertas > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 space-y-2">
          <p className="text-red-400 font-bold text-xs uppercase tracking-wider">
            ⚠ Alertas activas ({datos.totalAlertas})
          </p>
          {datos.calculos
            .filter(c => c.alerta)
            .map(c => (
              <div key={c.id} className="flex items-start gap-2 text-xs text-red-300 bg-red-900/30 rounded-lg p-2">
                <span className="text-red-500 mt-0.5">●</span>
                <div>
                  <span className="font-bold">{c.activoNombre ?? c.tipo}</span>
                  {' — '}
                  <span>{c.alertaMsg ?? 'Alerta detectada'}</span>
                  <span className="text-red-600 ml-2">
                    {new Date(c.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── LÍNEA DE TIEMPO ────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
          <p className="text-cyan-400 font-bold text-xs uppercase tracking-wider">
            📈 Línea de tiempo — Evolución del activo
          </p>
        </div>

        {datos.calculos.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            Sin mediciones registradas para este activo.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {datos.calculos.map((calc, idx) => {
              const esAlerta    = calc.alerta;
              const colorFila   = esAlerta ? 'bg-red-900/10' : idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50';
              const colorBorde  = esAlerta ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-cyan-800';

              return (
                <div
                  key={calc.id}
                  className={`${colorFila} ${colorBorde} px-4 py-3 cursor-pointer
                              hover:bg-slate-700/50 transition-colors`}
                  onClick={() => setCalcSelec(calcSelec?.id === calc.id ? null : calc)}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Fecha + módulo */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-gray-500 text-xs whitespace-nowrap">
                        {new Date(calc.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit', month: 'short', year: '2-digit',
                        })}
                      </span>
                      <span className="text-cyan-300 text-xs font-bold truncate">
                        {calc.moduloId ?? calc.tipo}
                      </span>
                      {calc.normativa && (
                        <span className="text-gray-500 text-xs hidden sm:block truncate">
                          {calc.normativa}
                        </span>
                      )}
                    </div>

                    {/* Resultado principal */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {resumenResultado(calc)}
                      </span>

                      {/* Semáforo fila */}
                      {esAlerta
                        ? <span className="text-red-400 text-xs font-bold">⚠ ALERTA</span>
                        : <span className="text-green-500 text-xs">✓ OK</span>
                      }

                      {/* Botón PDF individual */}
                      <button
                        onClick={e => { e.stopPropagation(); exportar('pdf', calc.id); }}
                        disabled={exportando !== null}
                        className="text-indigo-400 hover:text-indigo-300 text-xs disabled:opacity-30"
                        title="Exportar PDF de este cálculo"
                      >
                        📄
                      </button>
                    </div>
                  </div>

                  {/* Detalle expandible */}
                  {calcSelec?.id === calc.id && (
                    <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-3">
                      {/* Parámetros */}
                      <div>
                        <p className="text-gray-500 text-xs font-bold mb-1 uppercase">Parámetros</p>
                        {Object.entries(calc.parametros).slice(0, 8).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs py-0.5">
                            <span className="text-gray-400">{k}</span>
                            <span className="text-white font-bold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                      {/* Resultados */}
                      <div>
                        <p className="text-cyan-500 text-xs font-bold mb-1 uppercase">Resultados</p>
                        {Object.entries(calc.resultado).slice(0, 8).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs py-0.5">
                            <span className="text-gray-400">{k}</span>
                            <span className="text-cyan-300 font-bold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                      {/* Hash verificable */}
                      {calc.hash && (
                        <div className="col-span-2 mt-1">
                          <p className="text-gray-600 text-xs">Hash SHA-256:</p>
                          <a
                            href={`/verify/${calc.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 text-xs hover:underline break-all"
                          >
                            {calc.hash}
                          </a>
                        </div>
                      )}
                      {/* Alerta detalle */}
                      {calc.alerta && calc.alertaMsg && (
                        <div className="col-span-2 bg-red-900/30 border border-red-700 rounded p-2">
                          <p className="text-red-300 text-xs">⚠ {calc.alertaMsg}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── RESUMEN DE TENDENCIAS ─────────────────────────────────────────── */}
      {datos.tendencias && Object.keys(datos.tendencias).length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <p className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-3">
            📊 Tendencias del activo
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(datos.tendencias).map(([k, v]) => (
              <div key={k} className="bg-slate-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs">{k}</p>
                <p className="text-white font-bold text-sm">{String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
} 