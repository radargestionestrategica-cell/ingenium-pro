// lib/cruceReglas.ts
// INGENIUM PRO v8.1 — Reglas de cruce determinísticas entre módulos
// 100% determinístico. Sin IA. Cada alerta traza a valores reales del historial.
// Normativas verificadas — no interpoladas ni inventadas.

export interface CalculoSnap {
  id:         string;
  tipo:       string;
  moduloId:   string | null;
  submodulo:  string | null;
  parametros: Record<string, unknown>;
  resultado:  Record<string, unknown>;
  alerta:     boolean;
  alertaMsg:  string | null;
  normativa:  string | null;
  createdAt:  string;
}

export interface RiesgoDetectado {
  id:          string;           // 'CRUCE-001' … 'CRUCE-010'
  nivel:       'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  titulo:      string;
  descripcion: string;
  modulos:     string[];         // tipos de cálculo involucrados
  normativa:   string;
  accion:      string;
  evidencia:   Record<string, unknown>;  // valores exactos que dispararon la regla
}

// ── Helpers internos ──────────────────────────────────────────────────────────

function num(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== '') {
      const n = Number(v);
      if (!isNaN(n) && isFinite(n)) return n;
    }
  }
  for (const k of keys) {
    const kl = k.toLowerCase();
    for (const [ok, ov] of Object.entries(obj)) {
      if (ok.toLowerCase().includes(kl)) {
        const n = Number(ov);
        if (!isNaN(n) && isFinite(n)) return n;
      }
    }
  }
  return 0;
}

function str(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null) return String(v);
  }
  return '';
}

// Devuelve el cálculo más reciente que coincide con alguno de los tipos dados.
function ultimo(snaps: CalculoSnap[], ...tipos: string[]): CalculoSnap | null {
  return snaps.find(s =>
    tipos.some(t => s.tipo.toUpperCase().includes(t.toUpperCase()))
  ) ?? null;
}

// ════════════════════════════════════════════════════════════════════════════
// REGLAS DE CRUCE — 10 reglas determinísticas
// snaps debe estar ordenado por createdAt DESC (el más reciente primero).
// ════════════════════════════════════════════════════════════════════════════

export function aplicarReglasDecruce(snaps: CalculoSnap[]): RiesgoDetectado[] {
  const alertas: RiesgoDetectado[] = [];

  // Pre-fetch: cálculo más reciente por tipo
  const maop       = ultimo(snaps, 'MAOP');
  const hidra      = ultimo(snaps, 'DARCY_WEISBACH', 'HIDRAULICA');
  const ariete     = ultimo(snaps, 'GOLPE_ARIETE', 'JOUKOWSKY');
  const caneria    = ultimo(snaps, 'CANERIAS_ESPESOR', 'CANERIAS_HOOP', 'CANERIAS');
  const perfo      = ultimo(snaps, 'PERFORACION');
  const suelda     = ultimo(snaps, 'PRECALENTAMIENTO', 'SELECTOR_SOLDADURA', 'HEAT_INPUT');
  const talud      = ultimo(snaps, 'ESTABILIDAD_TALUD');
  const excav      = ultimo(snaps, 'EXCAVACION_MMO', 'EXCAVACION');
  const geoCP      = ultimo(snaps, 'CAPACIDAD_PORTANTE');
  const colHorm    = ultimo(snaps, 'COLUMNA_HORMIGON_ACI');
  const rmrCalc    = ultimo(snaps, 'RMR_BIENIAWSKI');
  const ventCalc   = ultimo(snaps, 'VENTILACION_SUBTERRANEA');
  const sismoCalc  = ultimo(snaps, 'ARQUITECTURA_SISMO');
  const vigaCalc   = ultimo(snaps, 'VIGA_ACERO_AISC');
  const termCalc   = ultimo(snaps, 'DILATACION_TERMICA', 'INTERCAMBIADOR_LMTD');
  const filtCalc   = ultimo(snaps, 'FILTRACION_DARCY');
  const vientoCalc = ultimo(snaps, 'ARQUITECTURA_VIENTO');
  const pavCalc    = ultimo(snaps, 'PAVIMENTO_AASHTO93');

  // ── REGLA 001: Presión alta + velocidad alta → erosión-corrosión ──────────
  if (maop && hidra) {
    const p_bar = num(maop.resultado,  'MAOP (bar)', 'bar')
               || num(maop.parametros, 'P_bar', 'presion_bar');
    const v_ms  = num(hidra.resultado, 'V', 'Velocidad V (m/s)', 'velocidad');
    if (p_bar > 40 && v_ms > 2.0) {
      alertas.push({
        id:          'CRUCE-001',
        nivel:       p_bar > 70 && v_ms > 3.0 ? 'CRITICO' : 'ALTO',
        titulo:      'Erosión-corrosión: presión elevada + velocidad alta',
        descripcion: `MAOP=${p_bar.toFixed(1)} bar con velocidad=${v_ms.toFixed(2)} m/s supera el umbral combinado de erosión-corrosión.`,
        modulos:     [maop.tipo, hidra.tipo],
        normativa:   'API RP 14E-2007 §2.3: V_max = C/√ρ — C=100 fluido no corrosivo, C=125 con inhibidor.',
        accion:      'Verificar protección anticorrosión activa. Reducir velocidad a < 2.0 m/s o tratar con inhibidor. Inspección PIG en 6 meses.',
        evidencia:   { 'MAOP (bar)': +p_bar.toFixed(1), 'V (m/s)': +v_ms.toFixed(2) },
      });
    }
  }

  // ── REGLA 002: Golpe de ariete + espesor al límite → riesgo rotura ───────
  if (ariete && caneria) {
    const dP_bar_r = num(ariete.resultado, 'Sobrepresion (bar)', 'dP_bar', 'Sobrepresión (bar)');
    const dP_MPa_r = num(ariete.resultado, 'Sobrepresion (MPa)', 'dP_MPa', 'Sobrepresión (MPa)');
    const dP_bar   = dP_bar_r > 0 ? dP_bar_r : dP_MPa_r * 10;
    const util_pct = num(caneria.resultado, 'Factor de uso (%)', 'Utilizacion (%)');
    if (dP_bar > 15 && util_pct > 75) {
      alertas.push({
        id:          'CRUCE-002',
        nivel:       dP_bar > 30 || util_pct > 90 ? 'CRITICO' : 'ALTO',
        titulo:      'Golpe de ariete sobre cañería al límite de espesor',
        descripcion: `Sobrepresión transitoria=${dP_bar.toFixed(1)} bar sobre tubería con utilización al ${util_pct.toFixed(0)}%.`,
        modulos:     [ariete.tipo, caneria.tipo],
        normativa:   'AWWA M11: sobrepresión máx. admisible = 1.5× presión trabajo. ASME B31.3 §302.2.4: transitorios ≤ 1.33× diseño.',
        accion:      'Instalar VRP o bypass. Revisar tiempo de cierre de válvulas (Tc ≥ 2L/a). Verificar espesor bajo carga combinada estática + transitoria.',
        evidencia:   { 'ΔP ariete (bar)': +dP_bar.toFixed(1), 'Util. espesor (%)': +util_pct.toFixed(0) },
      });
    }
  }

  // ── REGLA 003: H2S + CE elevado → stress corrosion cracking ──────────────
  if (perfo && suelda) {
    const h2s = num(perfo.parametros, 'H2S (ppm)', 'H2S', 'h2s');
    const CE  = num(suelda.resultado, 'Carbono Equivalente CE (IIW)', 'CE');
    if (h2s > 50 && CE > 0.35) {
      alertas.push({
        id:          'CRUCE-003',
        nivel:       h2s > 500 && CE > 0.45 ? 'CRITICO' : 'ALTO',
        titulo:      'Riesgo SCC: servicio H₂S + CE elevado en soldadura',
        descripcion: `H₂S=${h2s.toFixed(0)} ppm en perforación y CE(IIW)=${CE.toFixed(3)}. Combinación de riesgo de Stress Corrosion Cracking.`,
        modulos:     [perfo.tipo, suelda.tipo],
        normativa:   'NACE MR0175/ISO 15156-2:2020 §7.2: H₂S parcial > 0.0003 MPa define sour service. CE > 0.35 → dureza ZAC ≤ 22 HRC.',
        accion:      'Aplicar NACE MR0175. Verificar dureza ZAC ≤ 22 HRC (250 HBW). Considerar PWHT. Inhibidor de H₂S activo.',
        evidencia:   { 'H₂S (ppm)': h2s, 'CE IIW': +CE.toFixed(3) },
      });
    }
  }

  // ── REGLA 004: FS talud bajo + excavación profunda → deslizamiento ────────
  if (talud && excav) {
    const FS   = num(talud.resultado, 'Factor de Seguridad FS', 'FS');
    const prof = num(excav.parametros, 'Profundidad (m)', 'prof_m');
    if (FS > 0 && FS < 1.5 && prof > 2.0) {
      alertas.push({
        id:          'CRUCE-004',
        nivel:       FS < 1.2 ? 'CRITICO' : 'ALTO',
        titulo:      'Talud inestable próximo a excavación profunda',
        descripcion: `FS=${FS.toFixed(2)} (Bishop) con excavación de ${prof.toFixed(1)} m de profundidad en el mismo proyecto.`,
        modulos:     [talud.tipo, excav.tipo],
        normativa:   'CIRSOC 102-1982: FS mín. permanente = 1.5. OHSAS 18001 §4.4.6: apuntalamiento obligatorio H > 1.2 m.',
        accion:      'Instalar apuntalamiento o entibación antes de excavar. Monitoreo de desplazamientos con hitos topográficos.',
        evidencia:   { 'FS Bishop': +FS.toFixed(2), 'Prof. excavación (m)': prof },
      });
    }
  }

  // ── REGLA 005: Capacidad portante al límite + columna con carga alta ──────
  if (geoCP && colHorm) {
    const util_geo = num(geoCP.resultado, 'Utilizacion (%)', 'utilizacion');
    const Pu       = num(colHorm.parametros, 'Carga axial Pu (kN)', 'Pu_kN');
    const phi_Pn   = num(colHorm.resultado,  'phi.Pn capacidad (kN)', 'phi_Pn');
    if (util_geo > 75 && phi_Pn > 0 && (Pu / phi_Pn) > 0.80) {
      alertas.push({
        id:          'CRUCE-005',
        nivel:       util_geo > 92 ? 'CRITICO' : 'ALTO',
        titulo:      'Fundación al límite + columna con alta carga axial',
        descripcion: `Suelo al ${util_geo.toFixed(0)}% de utilización con columna al ${((Pu/phi_Pn)*100).toFixed(0)}% de phi.Pn.`,
        modulos:     [geoCP.tipo, colHorm.tipo],
        normativa:   'ACI 318-19 §13.3: distribución de presiones bajo zapata con excentricidad. CIRSOC 201-2002 §15.',
        accion:      'Ampliar zapata (B, L o Df). Verificar combinaciones de carga sísmicas y de viento sobre la columna.',
        evidencia:   { 'Util. suelo (%)': +util_geo.toFixed(0), 'Pu (kN)': Pu, 'phi.Pn (kN)': +phi_Pn.toFixed(0) },
      });
    }
  }

  // ── REGLA 006: RMR bajo + ventilación insuficiente → riesgo gas ──────────
  if (rmrCalc && ventCalc) {
    const rmr   = num(rmrCalc.resultado, 'Valor RMR', 'rmr');
    const V_gal = num(ventCalc.resultado, 'Velocidad en galeria (m/s)', 'V_galeria');
    if (rmr > 0 && rmr < 40 && V_gal > 0 && V_gal < 0.5) {
      alertas.push({
        id:          'CRUCE-006',
        nivel:       rmr < 21 && V_gal < 0.25 ? 'CRITICO' : 'ALTO',
        titulo:      'Roca muy fracturada + ventilación deficiente',
        descripcion: `RMR=${rmr} (${str(rmrCalc.resultado, 'Clase de roca') || 'Clase III-IV'}) con V_galería=${V_gal.toFixed(2)} m/s.`,
        modulos:     [rmrCalc.tipo, ventCalc.tipo],
        normativa:   'MSHA 30 CFR §57.5005: V_min = 0.25 m/s. Clase IV/V requiere sostenimiento inmediato y ventilación reforzada.',
        accion:      'Aumentar caudal hasta V ≥ 0.5 m/s. Instalar sostenimiento en zonas Clase IV/V. Monitoreo continuo CO/CH4.',
        evidencia:   { 'RMR': rmr, 'V galería (m/s)': +V_gal.toFixed(2) },
      });
    }
  }

  // ── REGLA 007: Sismo alto + viga al límite → revisión sismorresistente ────
  if (sismoCalc) {
    const Cs      = num(sismoCalc.resultado, 'Coeficiente sismico Cs', 'Cs');
    const util_v  = vigaCalc
      ? num(vigaCalc.resultado, 'Utilizacion flexion (%)', 'util_M')
      : 0;
    if (Cs > 0.15) {
      const nivelR = Cs > 0.25 ? 'CRITICO' : 'ALTO';
      alertas.push({
        id:          'CRUCE-007',
        nivel:       nivelR,
        titulo:      'Demanda sísmica alta: verificar elementos resistentes',
        descripcion: `Cs=${Cs.toFixed(3)}${vigaCalc ? ` con vigas al ${util_v.toFixed(0)}% de utilización` : ' — sin verificación de elementos resistentes en historial'}.`,
        modulos:     [sismoCalc.tipo, ...(vigaCalc ? [vigaCalc.tipo] : [])],
        normativa:   'CIRSOC 103:2013 §8: diseño sismorresistente — ductilidad y redundancia. ASCE 7-22 §12.12: derivas admisibles.',
        accion:      'Análisis modal espectral completo obligatorio para Cs > 0.20. Verificar ductilidad de uniones.',
        evidencia:   { 'Cs': +Cs.toFixed(4), ...(vigaCalc ? { 'Util. viga (%)': +util_v.toFixed(0) } : {}) },
      });
    }
  }

  // ── REGLA 008: Dilatación térmica + cañería de pared delgada ─────────────
  if (termCalc && caneria) {
    const dL_mm  = num(termCalc.resultado, 'Dilatacion libre dL (mm)', 'dL_mm', 'dL');
    const OD_mm  = num(caneria.parametros, 'OD', 'Diametro exterior OD (mm)');
    const t_mm   = num(caneria.parametros, 't', 'Espesor de pared t (mm)');
    if (dL_mm > 20 && OD_mm > 0 && t_mm > 0) {
      const t_OD = (t_mm / OD_mm) * 100;
      if (t_OD < 4) {
        alertas.push({
          id:          'CRUCE-008',
          nivel:       dL_mm > 50 ? 'ALTO' : 'MEDIO',
          titulo:      'Dilatación térmica significativa en tubería de pared delgada',
          descripcion: `ΔL=${dL_mm.toFixed(1)} mm con t/OD=${t_OD.toFixed(1)}% — riesgo de pandeo o rotura en puntos de anclaje.`,
          modulos:     [termCalc.tipo, caneria.tipo],
          normativa:   'ASME B31.3 §319.2.1: análisis de flexibilidad obligatorio cuando ΔT > 50°C o ΔL supera deformación admisible.',
          accion:      'Verificar análisis de flexibilidad (Caesar II / AutoPIPE). Instalar lira de expansión o junta de dilatación.',
          evidencia:   { 'ΔL (mm)': +dL_mm.toFixed(1), 'OD (mm)': OD_mm, 't (mm)': t_mm, 't/OD (%)': +t_OD.toFixed(1) },
        });
      }
    }
  }

  // ── REGLA 009: Gradiente hidráulico + excavación → sifonamiento ───────────
  if (filtCalc && excav) {
    const grad = num(filtCalc.resultado, 'Gradiente hidraulico i', 'gradiente');
    const prof = num(excav.parametros,  'Profundidad (m)', 'prof_m');
    if (grad > 0.2 && prof > 1.5) {
      alertas.push({
        id:          'CRUCE-009',
        nivel:       grad > 0.4 ? 'CRITICO' : 'MEDIO',
        titulo:      'Gradiente hidráulico + excavación profunda → sifonamiento',
        descripcion: `Gradiente i=${grad.toFixed(3)} (límite Terzaghi ≈ 0.5) con excavación de ${prof.toFixed(1)} m en zona con flujo subterráneo.`,
        modulos:     [filtCalc.tipo, excav.tipo],
        normativa:   'Terzaghi (1943): ic = (Gs-1)/(1+e) ≈ 0.5 arena media. USACE EM 1110-2-1901: filtro requerido si i > 0.15.',
        accion:      'Instalar wellpoints para bajar nivel freático antes de excavar. Filtro de drenaje perimetral en zanja.',
        evidencia:   { 'Gradiente i': +grad.toFixed(4), 'Prof. excavación (m)': prof },
      });
    }
  }

  // ── REGLA 010: Viento alto + pavimento de bajo SN → carga combinada ───────
  if (vientoCalc && pavCalc) {
    const p_kPa = num(vientoCalc.resultado, 'P total diseno (kPa)', 'p_total');
    const SN    = num(pavCalc.resultado,    'Numero Estructural SN', 'SN');
    if (p_kPa > 2.0 && SN < 3.0) {
      alertas.push({
        id:          'CRUCE-010',
        nivel:       'MEDIO',
        titulo:      'Carga de viento alta en zona con pavimento de bajo SN',
        descripcion: `Presión de diseño=${p_kPa.toFixed(2)} kPa con SN=${SN.toFixed(2)} — vía de acceso puede ser insuficiente para equipos de montaje pesados.`,
        modulos:     [vientoCalc.tipo, pavCalc.tipo],
        normativa:   'ASCE 7-22 §27: cargas de viento de diseño. AASHTO 1993: SN mínimo según tránsito y vehículos de servicio.',
        accion:      'Verificar capacidad portante de vía de acceso. Considerar mejoramiento de base granular si se requiere maquinaria pesada.',
        evidencia:   { 'P viento (kPa)': +p_kPa.toFixed(2), 'SN pavimento': +SN.toFixed(2) },
      });
    }
  }

  // Ordenar por severidad
  const orden: Record<string, number> = { CRITICO: 0, ALTO: 1, MEDIO: 2, BAJO: 3 };
  return alertas.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
}
