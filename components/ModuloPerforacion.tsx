'use client';
import { useState } from 'react';

// ── TIPOS ────────────────────────────────────────────────────────
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ModoOp = 'terrestre' | 'offshore';

const RIESGO_COLOR: Record<RiskLevel, string> = {
  LOW: 'text-green-400 border-green-500/40 bg-green-500/10',
  MEDIUM: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  HIGH: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  CRITICAL: 'text-red-400 border-red-500/40 bg-red-500/10',
};

const RIESGO_LABEL: Record<RiskLevel, string> = {
  LOW: '✅ SEGURO', MEDIUM: '⚠️ ATENCIÓN', HIGH: '🔴 ALTO', CRITICAL: '🔴 CRÍTICO',
};

// ── CALCULADORES DISPONIBLES ─────────────────────────────────────
const CALC_TERRESTRE = [
  { id: 'presion_hidrostatica', label: '💧 Presión Hidrostática de Lodo', norma: 'API RP 13D §4' },
  { id: 'gradiente_fractura', label: '⚡ Gradiente de Fractura — Eaton', norma: 'Eaton (1969) JPT' },
  { id: 'bhp', label: '🔄 BHP + ECD Circulando', norma: 'API Bulletin D20' },
  { id: 'reologia', label: '🌊 Reología Bingham Plástico', norma: 'API RP 13D' },
  { id: 'torque_drag', label: '🔩 Torque y Drag en Sarta', norma: 'API RP 7G' },
  { id: 'volumen_anular', label: '📐 Volumen Anular + Lag', norma: 'API' },
  { id: 'hidraulica_broca', label: '💥 Hidráulica de Broca — HSI', norma: 'API RP 13D' },
];

const CALC_OFFSHORE = [
  { id: 'offshore_columna', label: '🌊 Columna Presión Offshore', norma: 'API RP 16Q' },
  { id: 'tension_riser', label: '⚓ Tensión del Riser + VIV', norma: 'API RP 16Q §6.3.3' },
  { id: 'kill_weight', label: '🚨 Kill Weight Mud', norma: 'IADC Well Control' },
  { id: 'kick_tolerance', label: '⚖️ Kick Tolerance', norma: 'API Std 53 §9' },
  { id: 'riser_margin', label: '🔌 Riser Margin', norma: 'API RP 16Q §6.4' },
  { id: 'bop', label: '🛡️ Presión BOP Subsea', norma: 'API Std 53' },
  { id: 'npt', label: '📊 NPT — Tiempo No Productivo', norma: 'IADC/SPE 159220' },
];

// ── INPUTS POR CALCULADOR ────────────────────────────────────────
const INPUTS_MAP: Record<string, Array<{ key: string; label: string; unit: string; default: number }>> = {
  presion_hidrostatica: [
    { key: 'densidad_ppg', label: 'Densidad del lodo', unit: 'ppg', default: 10.5 },
    { key: 'TVD_ft', label: 'Profundidad TVD', unit: 'ft', default: 8000 },
  ],
  gradiente_fractura: [
    { key: 'TVD_ft', label: 'TVD', unit: 'ft', default: 8000 },
    { key: 'densidad_formacion_ppg', label: 'Densidad formación', unit: 'ppg', default: 13.5 },
    { key: 'presion_poros_psi', label: 'Presión de poros', unit: 'psi', default: 3500 },
    { key: 'nu', label: 'Coef. Poisson (opcional)', unit: '', default: 0.35 },
  ],
  bhp: [
    { key: 'densidad_ppg', label: 'Densidad lodo', unit: 'ppg', default: 10.5 },
    { key: 'TVD_ft', label: 'TVD', unit: 'ft', default: 8000 },
    { key: 'Q_gpm', label: 'Caudal', unit: 'gpm', default: 450 },
    { key: 'OD_in', label: 'OD drillpipe', unit: 'in', default: 5 },
    { key: 'ID_in', label: 'ID drillpipe', unit: 'in', default: 4.276 },
    { key: 'ID_hoyo_in', label: 'Diámetro hoyo', unit: 'in', default: 8.5 },
    { key: 'longitud_ft', label: 'Longitud sarta', unit: 'ft', default: 8000 },
    { key: 'VP_cP', label: 'Viscosidad plástica', unit: 'cP', default: 25 },
    { key: 'YP', label: 'Punto cedencia', unit: 'lbf/100ft²', default: 15 },
  ],
  reologia: [
    { key: 'R600', label: 'Lectura 600 rpm (Fann)', unit: '', default: 65 },
    { key: 'R300', label: 'Lectura 300 rpm (Fann)', unit: '', default: 40 },
    { key: 'R6', label: 'Lectura 6 rpm (gel 10s, opcional)', unit: '', default: 8 },
    { key: 'R3', label: 'Lectura 3 rpm (gel 10min, opcional)', unit: '', default: 10 },
  ],
  torque_drag: [
    { key: 'peso_lb', label: 'Peso sarta en aire', unit: 'lb', default: 150000 },
    { key: 'TVD_ft', label: 'TVD', unit: 'ft', default: 8000 },
    { key: 'angulo_deg', label: 'Ángulo de inclinación', unit: '°', default: 30 },
    { key: 'mu', label: 'Coef. fricción', unit: '', default: 0.25 },
    { key: 'OD_in', label: 'OD drillpipe', unit: 'in', default: 5 },
    { key: 'densidad_ppg', label: 'Densidad lodo', unit: 'ppg', default: 10.5 },
  ],
  volumen_anular: [
    { key: 'ID_hoyo_in', label: 'Diámetro hoyo', unit: 'in', default: 8.5 },
    { key: 'OD_sarta_in', label: 'OD sarta', unit: 'in', default: 5 },
    { key: 'longitud_ft', label: 'Longitud sección', unit: 'ft', default: 8000 },
    { key: 'Q_gpm', label: 'Caudal', unit: 'gpm', default: 450 },
  ],
  hidraulica_broca: [
    { key: 'Q_gpm', label: 'Caudal', unit: 'gpm', default: 450 },
    { key: 'dP_psi', label: 'ΔP en broca', unit: 'psi', default: 800 },
    { key: 'diam_broca_in', label: 'Diámetro broca', unit: 'in', default: 8.5 },
    { key: 'N_toberas', label: 'N° toberas', unit: '', default: 3 },
    { key: 'diam_tobera_in', label: 'Diámetro tobera', unit: 'in', default: 0.375 },
    { key: 'densidad_ppg', label: 'Densidad lodo', unit: 'ppg', default: 10.5 },
  ],
  offshore_columna: [
    { key: 'prof_agua_m', label: 'Lámina de agua', unit: 'm', default: 1500 },
    { key: 'TVD_mud_m', label: 'TVD bajo mudline', unit: 'm', default: 3000 },
    { key: 'densidad_agua', label: 'Densidad agua mar', unit: 'kg/m³', default: 1025 },
    { key: 'densidad_lodo_ppg', label: 'Densidad lodo', unit: 'ppg', default: 11.5 },
  ],
  tension_riser: [
    { key: 'longitud_m', label: 'Longitud riser', unit: 'm', default: 1500 },
    { key: 'OD_in', label: 'OD riser', unit: 'in', default: 21 },
    { key: 'WT_in', label: 'Espesor pared', unit: 'in', default: 0.75 },
    { key: 'densidad_agua', label: 'Densidad agua mar', unit: 'kg/m³', default: 1025 },
    { key: 'angulo_deg', label: 'Ángulo offset buque', unit: '°', default: 5 },
    { key: 'corriente_m_s', label: 'Velocidad corriente', unit: 'm/s', default: 0.8 },
  ],
  kill_weight: [
    { key: 'densidad_actual_ppg', label: 'Densidad lodo actual', unit: 'ppg', default: 10.5 },
    { key: 'SICP_psi', label: 'SICP (presión casing cerrado)', unit: 'psi', default: 450 },
    { key: 'SIDPP_psi', label: 'SIDPP (presión drillpipe cerrado)', unit: 'psi', default: 350 },
    { key: 'TVD_ft', label: 'TVD', unit: 'ft', default: 10000 },
    { key: 'cap_dp_bbl_ft', label: 'Capacidad drillpipe', unit: 'bbl/ft', default: 0.00742 },
    { key: 'Q_kill_gpm', label: 'Caudal de kill', unit: 'gpm', default: 200 },
  ],
  kick_tolerance: [
    { key: 'EMW_frac_ppg', label: 'EMW fractura zapata', unit: 'ppg', default: 14.5 },
    { key: 'KWM_ppg', label: 'Kill Weight Mud', unit: 'ppg', default: 11.2 },
    { key: 'TVD_zapata_ft', label: 'TVD zapata', unit: 'ft', default: 8000 },
    { key: 'TVD_fondo_ft', label: 'TVD fondo pozo', unit: 'ft', default: 12000 },
    { key: 'densidad_gas_ppg', label: 'Densidad gas', unit: 'ppg', default: 1.0 },
    { key: 'cap_anular_bbl_ft', label: 'Capacidad anular', unit: 'bbl/ft', default: 0.05 },
  ],
  riser_margin: [
    { key: 'densidad_lodo_ppg', label: 'Densidad lodo', unit: 'ppg', default: 11.5 },
    { key: 'densidad_agua_ppg', label: 'Densidad agua mar', unit: 'ppg', default: 8.6 },
    { key: 'prof_agua_ft', label: 'Lámina de agua', unit: 'ft', default: 4921 },
    { key: 'TVD_ft', label: 'TVD total', unit: 'ft', default: 14764 },
    { key: 'presion_poros_ppg', label: 'EMW de poros', unit: 'ppg', default: 9.8 },
  ],
  bop: [
    { key: 'prof_agua_m', label: 'Profundidad agua', unit: 'm', default: 1500 },
    { key: 'densidad_agua', label: 'Densidad agua mar', unit: 'kg/m³', default: 1025 },
    { key: 'presion_formacion_MPa', label: 'Presión máx. formación', unit: 'MPa', default: 80 },
    { key: 'rating_bop_psi', label: 'Rating del BOP', unit: 'psi', default: 15000 },
  ],
  npt: [
    { key: 'dias', label: 'Días totales planificados', unit: 'días', default: 60 },
    { key: 'h_mecanico', label: 'Horas NPT mecánico', unit: 'hr', default: 120 },
    { key: 'h_clima', label: 'Horas NPT clima', unit: 'hr', default: 80 },
    { key: 'h_formacion', label: 'Horas NPT formación', unit: 'hr', default: 60 },
    { key: 'h_logistica', label: 'Horas NPT logística', unit: 'hr', default: 40 },
    { key: 'costo_dia_usd', label: 'Costo del rig', unit: 'USD/día', default: 250000 },
  ],
};

// ── FORMATEAR RESULTADO ──────────────────────────────────────────
function ResultCard({ label, value, unit }: { label: string; value: any; unit?: string }) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return (
    <div className="bg-[#0A1628] border border-[#1A2F50] rounded-lg p-3">
      <div className="text-[#5A7FA0] text-xs mb-1">{label}</div>
      <div className={`text-sm font-bold ${value ? 'text-green-400' : 'text-red-400'}`}>
        {value ? '✅ SÍ' : '❌ NO'}
      </div>
    </div>
  );
  if (typeof value === 'object') return null;
  return (
    <div className="bg-[#0A1628] border border-[#1A2F50] rounded-lg p-3">
      <div className="text-[#5A7FA0] text-xs mb-1">{label}</div>
      <div className="text-white text-sm font-bold">
        {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
        {unit && <span className="text-[#5A7FA0] text-xs ml-1">{unit}</span>}
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────
export default function ModuloPerforacion() {
  const [modo, setModo] = useState<ModoOp>('terrestre');
  const [calcSeleccionado, setCalcSeleccionado] = useState('presion_hidrostatica');
  const [valores, setValores] = useState<Record<string, number>>({});
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calcActual = [...CALC_TERRESTRE, ...CALC_OFFSHORE].find(c => c.id === calcSeleccionado);
  const inputs = INPUTS_MAP[calcSeleccionado] || [];

  const handleCalcular = async () => {
    setLoading(true);
    setError('');
    setResultado(null);
    try {
      // Preparar datos según el tipo
      let datos: any = {};
      if (calcSeleccionado === 'volumen_anular') {
        datos = {
          segmentos: [{ ID_hoyo_in: valores.ID_hoyo_in || 8.5, OD_sarta_in: valores.OD_sarta_in || 5, longitud_ft: valores.longitud_ft || 8000 }],
          Q_gpm: valores.Q_gpm || 450,
        };
      } else {
        inputs.forEach(inp => {
          datos[inp.key] = valores[inp.key] ?? inp.default;
        });
      }
      const res = await fetch('/api/perforacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: calcSeleccionado, datos }),
      });
      const json = await res.json();
      if (json.error) { setError(json.error); return; }
      setResultado(json.resultado);
    } catch { setError('Error de conexión con el motor de cálculo'); }
    finally { setLoading(false); }
  };

  const calcList = modo === 'terrestre' ? CALC_TERRESTRE : CALC_OFFSHORE;

  return (
    <div className="bg-[#050D1A] min-h-screen text-white p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-lg font-black">⛽</div>
        <div>
          <div className="text-white font-black text-lg">MÓDULO PERFORACIÓN</div>
          <div className="text-[#5A7FA0] text-xs">Terrestre + Offshore · API RP 13D · API RP 16Q · IADC</div>
        </div>
      </div>

      {/* Toggle Terrestre / Offshore */}
      <div className="flex gap-2 mb-4 p-1 bg-[#0A1628] rounded-xl">
        {(['terrestre', 'offshore'] as ModoOp[]).map(m => (
          <button key={m} onClick={() => { setModo(m); setCalcSeleccionado(m === 'terrestre' ? 'presion_hidrostatica' : 'offshore_columna'); setResultado(null); }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${modo === m ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow' : 'text-[#5A7FA0] hover:text-white'}`}>
            {m === 'terrestre' ? '🏔️ TERRESTRE' : '🌊 OFFSHORE'}
          </button>
        ))}
      </div>

      {/* Selector de cálculo */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        {calcList.map(c => (
          <button key={c.id} onClick={() => { setCalcSeleccionado(c.id); setResultado(null); }}
            className={`text-left p-3 rounded-xl border transition-all ${calcSeleccionado === c.id ? 'border-orange-500/60 bg-orange-500/10' : 'border-[#1A2F50] bg-[#0A1628] hover:border-orange-500/30'}`}>
            <div className="text-white text-sm font-bold">{c.label}</div>
            <div className="text-[#5A7FA0] text-xs">{c.norma}</div>
          </button>
        ))}
      </div>

      {/* Panel de inputs */}
      <div className="bg-[#0A1628] border border-[#1A2F50] rounded-xl p-4 mb-4">
        <div className="text-orange-400 font-black text-sm mb-3">⚙️ PARÁMETROS DE ENTRADA</div>
        <div className="grid grid-cols-2 gap-3">
          {inputs.map(inp => (
            <div key={inp.key}>
              <label className="text-[#5A7FA0] text-xs block mb-1">{inp.label} {inp.unit && <span className="text-orange-400/70">({inp.unit})</span>}</label>
              <input type="number" defaultValue={inp.default} step="any"
                onChange={e => setValores(prev => ({ ...prev, [inp.key]: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-[#050D1A] border border-[#1A2F50] rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500/60 outline-none" />
            </div>
          ))}
        </div>
        <button onClick={handleCalcular} disabled={loading}
          className="mt-4 w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-xl hover:from-orange-500 hover:to-red-500 disabled:opacity-50 transition-all shadow-lg">
          {loading ? '⚙️ CALCULANDO...' : '▶ CALCULAR — ' + calcActual?.norma}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Resultados */}
      {resultado && (
        <div className="bg-[#0A1628] border border-[#1A2F50] rounded-xl p-4">
          <div className="text-orange-400 font-black text-sm mb-3">📊 RESULTADOS — {calcActual?.label}</div>

          {/* Risk badge */}
          {resultado.risk && (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black mb-3 ${RIESGO_COLOR[resultado.risk as RiskLevel]}`}>
              {RIESGO_LABEL[resultado.risk as RiskLevel]}
            </div>
          )}

          {/* Grid de resultados numéricos */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(resultado).filter(([k]) => k !== 'risk' && k !== 'detalle' && k !== 'detalle_segmentos' && k !== 'recomendaciones').map(([key, val]) => {
              const label = key.replace(/_/g, ' ').toUpperCase();
              return <ResultCard key={key} label={label} value={val} />;
            })}
          </div>

          {/* Recomendaciones */}
          {resultado.recomendaciones && Array.isArray(resultado.recomendaciones) && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mt-2">
              <div className="text-blue-400 font-black text-xs mb-2">💡 RECOMENDACIONES TÉCNICAS</div>
              {resultado.recomendaciones.map((r: string, i: number) => (
                <div key={i} className="text-[#A0C0E0] text-xs mb-1">• {r}</div>
              ))}
            </div>
          )}

          {/* Norma citada */}
          <div className="mt-3 text-[#5A7FA0] text-xs border-t border-[#1A2F50] pt-2">
            📋 Normativa: {calcActual?.norma} · INGENIUM PRO v8.0 © Silvana Belén Colombo 2026
          </div>
        </div>
      )}
    </div>
  );
}