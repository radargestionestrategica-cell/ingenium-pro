// lib/modulos-intro.ts
// ═══════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.1 — Contenido de intro de los 15 módulos
//  titulo + que_es: 8 idiomas verificados
//  que_calcula + como_usar: Español (es) + Inglés (en)
//  Normativas: universales (mismas en todos los idiomas)
// ═══════════════════════════════════════════════════════════════

import type { Lang } from './i18n';

export interface ModuloIntroData {
  titulo:        Record<Lang, string>;
  que_es:        Record<Lang, string>;
  que_calcula:   string[];      // Español
  que_calcula_en:string[];      // English
  normativas:    string[];      // Universal
  como_usar:     string[];      // Español
  como_usar_en:  string[];      // English
  color:         string;
  icono:         string;
}

export const MODULOS_INTRO: Record<string, ModuloIntroData> = {

  // ────────────────────────────────────────────────────────────
  petroleo: {
    color: '#f59e0b', icono: '🛢️',
    titulo: {
      es: 'Petróleo y Gas',
      en: 'Oil & Gas Pipelines',
      pt: 'Petróleo e Gás',
      ar: 'النفط والغاز',
      fr: 'Pétrole et Gaz',
      ru: 'Нефть и Газ',
      zh: '石油与天然气',
      id: 'Minyak dan Gas',
    },
    que_es: {
      es: 'Calcula la Presión Máxima Admisible de Operación (MAOP) para gasoductos y oleoductos conforme a ASME B31.8 y B31.4. Determina si la cañería soporta la presión de diseño bajo los factores de clase de ubicación, junta longitudinal y temperatura.',
      en: 'Calculates the Maximum Allowable Operating Pressure (MAOP) for gas and liquid transmission pipelines per ASME B31.8 and B31.4. Determines whether a pipe can withstand design pressure under location class, joint efficiency, and temperature factors.',
      pt: 'Calcula a Pressão Máxima de Operação Admissível (MAOP) para gasodutos e oleodutos conforme ASME B31.8 e B31.4. Determina se a tubulação suporta a pressão de projeto sob os fatores de classe de localização, junta e temperatura.',
      ar: 'يحسب الضغط التشغيلي الأقصى المسموح به (MAOP) لخطوط نقل الغاز والسوائل وفق ASME B31.8 وB31.4. يحدد ما إذا كانت الأنبوب تتحمل ضغط التصميم في ظل العوامل المحددة لفئة الموقع والوصلة ودرجة الحرارة.',
      fr: 'Calcule la Pression Maximale Admissible en Service (MAOP) pour les gazoducs et oléoducs selon ASME B31.8 et B31.4. Détermine si la tuyauterie supporte la pression de conception avec les facteurs de classe de localisation, joint et température.',
      ru: 'Рассчитывает максимально допустимое рабочее давление (MAOP) для трубопроводов газа и жидкости по ASME B31.8 и B31.4. Определяет, выдерживает ли труба расчётное давление с учётом класса местности, типа шва и температуры.',
      zh: '根据ASME B31.8和B31.4计算天然气和液体管道的最大允许操作压力（MAOP），判断管道在位置等级、接头效率和温度系数下是否能承受设计压力。',
      id: 'Menghitung Tekanan Operasi Maksimum yang Diizinkan (MAOP) untuk pipa transmisi gas dan cair sesuai ASME B31.8 dan B31.4. Menentukan apakah pipa dapat menahan tekanan desain.',
    },
    que_calcula: [
      'MAOP — Presión Máxima Admisible de Operación',
      'Presión de diseño por ecuación de Barlow: P = 2·S·t·F·E·T / D',
      'Factor de clase de ubicación F (0.40 a 0.80) — B31.8 Tabla 841.1.6-1',
      'Factor de eficiencia de junta E y factor de temperatura T',
      'Clasificación de riesgo: BAJO / MEDIO / ALTO / CRÍTICO',
    ],
    que_calcula_en: [
      'MAOP — Maximum Allowable Operating Pressure',
      'Design pressure by Barlow equation: P = 2·S·t·F·E·T / D',
      'Location class factor F (0.40 to 0.80) — B31.8 Table 841.1.6-1',
      'Longitudinal joint factor E and temperature derating factor T',
      'Risk classification: LOW / MEDIUM / HIGH / CRITICAL',
    ],
    normativas: ['ASME B31.8-2020 §841.1.1 — Gas Transmission', 'ASME B31.4-2019 §403.2.1 — Liquid Transportation', 'API 5L — Grades Gr.B to X80', 'API 1104:2021 — Welding of Pipelines'],
    como_usar: [
      'Seleccioná el código: ASME B31.8 (gasoductos) o B31.4 (oleoductos/líquidos)',
      'Ingresá diámetro exterior OD (mm), presión de diseño (bar) y grado API 5L',
      'Seleccioná la clase de ubicación (1D1 a 4) y el tipo de junta longitudinal',
      'El resultado muestra el MAOP calculado y dictamina CUMPLE o NO CUMPLE',
    ],
    como_usar_en: [
      'Select the design code: ASME B31.8 (gas) or B31.4 (liquid/oil pipelines)',
      'Enter outer diameter OD (mm), design pressure (bar), and API 5L material grade',
      'Select location class (1D1 to 4) and longitudinal joint type (Seamless/ERW)',
      'The result shows calculated MAOP and issues a PASS or FAIL verdict per code',
    ],
  },

  // ────────────────────────────────────────────────────────────
  hidraulica: {
    color: '#06b6d4', icono: '💧',
    titulo: { es:'Hidráulica', en:'Hydraulics', pt:'Hidráulica', ar:'الهيدروليك', fr:'Hydraulique', ru:'Гидравлика', zh:'水力学', id:'Hidraulik' },
    que_es: {
      es: 'Analiza sistemas de tuberías a presión: pérdidas de carga por fricción (Darcy-Weisbach), velocidad de flujo y transitorios hidráulicos. Calcula el golpe de ariete con la ecuación de Joukowsky, determinando la sobrepresión máxima al cerrar una válvula.',
      en: 'Analyzes pressurized piping systems: friction head losses (Darcy-Weisbach), flow velocity, and hydraulic transients. Calculates water hammer using Joukowsky\'s equation, determining maximum overpressure when closing a valve.',
      pt: 'Analisa sistemas de tubulações sob pressão: perdas de carga por atrito (Darcy-Weisbach), velocidade de escoamento e transitórios hidráulicos, incluindo golpe de aríete pela equação de Joukowsky.',
      ar: 'يحلل أنظمة الأنابيب تحت الضغط: فقدان الضغط بالاحتكاك (داسي-وايزباخ) وسرعة التدفق والظواهر العابرة. يحسب المطرقة المائية بمعادلة جوكوفسكي.',
      fr: 'Analyse les systèmes de tuyauteries sous pression: pertes de charge par friction (Darcy-Weisbach), vitesse et phénomènes transitoires. Calcule le coup de bélier par l\'équation de Joukowsky.',
      ru: 'Анализирует напорные трубопроводные системы: гидравлические потери (Дарси-Вейсбах), скорость и переходные процессы. Рассчитывает гидравлический удар по уравнению Жуковского.',
      zh: '分析承压管道系统：摩擦压头损失（达西-韦斯巴赫）、流速和水力瞬变。使用儒科夫斯基方程计算水击，确定关阀时最大超压。',
      id: 'Menganalisis sistem perpipaan bertekanan: kehilangan tekanan akibat gesekan (Darcy-Weisbach), kecepatan aliran, dan transien hidraulik termasuk water hammer (Joukowsky).',
    },
    que_calcula: ['Pérdidas de carga: Darcy-Weisbach (ΔP = f·L/D·ρv²/2)', 'Factor de fricción de Colebrook-White (flujo turbulento)', 'Velocidad de flujo y número de Reynolds', 'Celeridad de onda a en función de material, diámetro y espesor', 'Golpe de ariete: ΔP = ρ·a·Δv — Joukowsky'],
    que_calcula_en: ['Friction losses: Darcy-Weisbach (ΔP = f·L/D·ρv²/2)', 'Colebrook-White friction factor (turbulent flow)', 'Flow velocity and Reynolds number', 'Wave celerity based on material, diameter and wall thickness', 'Water hammer: ΔP = ρ·a·Δv — Joukowsky'],
    normativas: ['Darcy-Weisbach (universal)', 'Colebrook-White / Moody Diagram', 'Joukowsky (1898) — Water Hammer', 'AWWA M11 — Steel Pipe Design Guide'],
    como_usar: ['Ingresá diámetro interior (mm), longitud (m) y material de la tubería', 'Definí el fluido y caudal de diseño (L/s o m³/h)', 'El módulo calcula velocidad, Reynolds, factor de fricción y pérdida total', 'Para golpe de ariete: ingresá longitud del tramo y tiempo de cierre de válvula'],
    como_usar_en: ['Enter internal diameter (mm), length (m), and pipe material', 'Define fluid type and design flow rate (L/s or m³/h)', 'The module calculates velocity, Reynolds number, friction factor, and total loss', 'For water hammer: enter pipe length and valve closure time'],
  },

  // ────────────────────────────────────────────────────────────
  perforacion: {
    color: '#8b5cf6', icono: '⛏️',
    titulo: { es:'Perforación', en:'Drilling Engineering', pt:'Engenharia de Perfuração', ar:'هندسة الحفر', fr:'Ingénierie du Forage', ru:'Технология Бурения', zh:'钻井工程', id:'Teknik Pengeboran' },
    que_es: {
      es: 'Calcula los parámetros críticos de perforación de pozos petroleros y gasíferos: Densidad Equivalente de Circulación (ECD), gradiente de fractura por el método de Eaton (1969) y la ventana operacional segura de perforación.',
      en: 'Calculates critical drilling parameters for oil and gas wells: Equivalent Circulating Density (ECD), fracture gradient using Eaton\'s (1969) method, and the safe drilling operational window.',
      pt: 'Calcula parâmetros críticos de perfuração de poços: Densidade Equivalente de Circulação (ECD), gradiente de fratura pelo método de Eaton (1969) e a janela operacional segura de perfuração.',
      ar: 'يحسب معاملات الحفر الحرجة لآبار النفط والغاز: كثافة الدوران المكافئة (ECD) وتدرج الكسر بطريقة إيتون (1969) ونافذة الحفر الآمنة.',
      fr: 'Calcule les paramètres critiques de forage: densité de circulation équivalente (ECD), gradient de fracturation par la méthode d\'Eaton (1969) et la fenêtre de forage sûre.',
      ru: 'Рассчитывает критические параметры бурения скважин: эквивалентную плотность циркуляции (ECD), градиент разрыва пласта методом Итона (1969) и рабочее окно бурения.',
      zh: '计算石油和天然气井的关键钻井参数：等效循环密度（ECD）、用伊顿（1969）方法确定地层破裂梯度以及安全钻井窗口。',
      id: 'Menghitung parameter pengeboran kritis: Densitas Sirkulasi Ekuivalen (ECD), gradien fraktur metode Eaton (1969), dan jendela operasional pengeboran yang aman.',
    },
    que_calcula: ['ECD — Densidad Equivalente de Circulación (ppg / kg/m³)', 'Gradiente de fractura — Método de Eaton (1969) con coeficiente de Poisson', 'Ventana operacional entre gradiente de poro y gradiente de fractura', 'Capacidad de limpieza del lodo (transporte de ripios)', 'Pérdidas de presión en la sarta de perforación'],
    que_calcula_en: ['ECD — Equivalent Circulating Density (ppg / kg/m³)', 'Fracture gradient — Eaton (1969) method with Poisson\'s ratio', 'Operational window between pore gradient and fracture gradient', 'Mud carrying capacity (cuttings transport efficiency)', 'Pressure losses in the drill string'],
    normativas: ['API RP 13D — Rheology and Hydraulics of Oil-Well Fluids', 'Eaton (1969) — Fracture Gradient Correlation', 'API RP 7G — Drill Stem Design and Operating Limits', 'IADC Drilling Manual'],
    como_usar: ['Ingresá la profundidad TVD (m), peso del lodo (ppg) y caudal de circulación', 'Seleccioná diámetro del casing y geometría de la sarta de perforación', 'El módulo calcula el ECD y lo compara con el gradiente de fractura de Eaton', 'El resultado muestra si la operación está dentro de la ventana segura de perforación'],
    como_usar_en: ['Enter true vertical depth TVD (m), mud weight (ppg), and circulation rate', 'Select casing diameter and drill string geometry', 'The module calculates ECD and compares it with Eaton\'s fracture gradient', 'The result shows whether the operation is within the safe drilling window'],
  },

  // ────────────────────────────────────────────────────────────
  mineria: {
    color: '#ef4444', icono: '🪨',
    titulo: { es:'Minería', en:'Mining Engineering', pt:'Engenharia de Mineração', ar:'هندسة التعدين', fr:'Ingénierie Minière', ru:'Горная Инженерия', zh:'采矿工程', id:'Teknik Pertambangan' },
    que_es: {
      es: 'Clasifica macizos rocosos mediante el sistema Rock Mass Rating (RMR) de Bieniawski (1989) para el diseño de excavaciones subterráneas, taludes y túneles. Determina el tipo de sostenimiento recomendado y estima la resistencia del macizo rocoso.',
      en: 'Classifies rock masses using the Rock Mass Rating (RMR) system by Bieniawski (1989) for underground excavations, slopes, and tunnels. Determines recommended support type and estimates rock mass strength.',
      pt: 'Classifica maciços rochosos pelo sistema RMR de Bieniawski (1989) para projeto de escavações subterrâneas, taludes e túneis. Determina o tipo de suporte recomendado e estima a resistência do maciço.',
      ar: 'يصنف الكتل الصخرية باستخدام نظام RMR لبيينياوسكي (1989) لتصميم الحفريات تحت الأرض والمنحدرات والأنفاق. يحدد نوع الدعم الموصى به ويقدر مقاومة الكتلة الصخرية.',
      fr: 'Classifie les massifs rocheux selon le système RMR de Bieniawski (1989) pour la conception d\'excavations souterraines, pentes et tunnels. Détermine le type de soutènement recommandé.',
      ru: 'Классифицирует горные массивы по системе RMR Бьенявского (1989) для проектирования подземных выработок, откосов и тоннелей. Определяет рекомендуемый тип крепления.',
      zh: '使用Bieniawski（1989）RMR岩体分类系统对岩体进行分类，用于地下开挖、边坡和隧道设计，确定推荐支护类型并估算岩体强度。',
      id: 'Mengklasifikasikan massa batuan menggunakan sistem RMR Bieniawski (1989) untuk desain galian bawah tanah, lereng, dan terowongan. Menentukan jenis penyangga yang direkomendasikan.',
    },
    que_calcula: ['RMR total (0-100): suma de 6 parámetros de Bieniawski 1989', 'Clase del macizo: I (muy buena) a V (muy mala) con tiempo de auto-sostenimiento', 'Tipo de sostenimiento: pernos, malla, shotcrete, cerchas metálicas', 'Resistencia a compresión uniaxial (UCS) del macizo rocoso', 'Módulo de deformación del macizo rocoso estimado'],
    que_calcula_en: ['Total RMR (0-100): sum of 6 Bieniawski 1989 parameters', 'Rock mass class: I (very good) to V (very poor) with stand-up time', 'Support type: rock bolts, mesh, shotcrete, steel sets', 'Uniaxial compressive strength (UCS) of the rock mass', 'Estimated rock mass deformation modulus'],
    normativas: ['Bieniawski (1989) — Rock Mass Rating System', 'ISRM — International Society for Rock Mechanics', 'MSHA — Mine Safety and Health Administration'],
    como_usar: ['Ingresá los 6 parámetros RMR: resistencia roca, RQD, espaciado, condición y orientación de discontinuidades, agua', 'El sistema suma automáticamente la puntuación total RMR', 'Revisá la clasificación del macizo (Clase I a V) y el tiempo de auto-sostenimiento', 'Consultá el tipo de sostenimiento recomendado según el RMR obtenido'],
    como_usar_en: ['Enter the 6 RMR parameters: rock strength, RQD, spacing, condition and orientation of discontinuities, groundwater', 'The system automatically sums the total RMR score', 'Review rock mass class (Class I to V) and stand-up time', 'Check the recommended support type based on the obtained RMR'],
  },

  // ────────────────────────────────────────────────────────────
  civil: {
    color: '#3b82f6', icono: '🏗️',
    titulo: { es:'Ingeniería Civil', en:'Civil Engineering', pt:'Engenharia Civil', ar:'الهندسة المدنية', fr:'Génie Civil', ru:'Гражданское Строительство', zh:'土木工程', id:'Teknik Sipil' },
    que_es: {
      es: 'Diseña y verifica elementos estructurales de acero laminado (vigas y columnas perfil W) bajo la especificación AISC 360. Calcula capacidad a flexión, cortante y deflexión verificando los estados límite de resistencia y servicio.',
      en: 'Designs and verifies hot-rolled steel structural elements (W-shape beams and columns) per AISC 360. Calculates flexural, shear, and deflection capacity checking strength and serviceability limit states.',
      pt: 'Projeta e verifica elementos estruturais de aço laminado (perfis W) conforme AISC 360. Calcula capacidade à flexão, cisalhamento e flecha, verificando estados-limite de resistência e serviço.',
      ar: 'يصمم ويتحقق من العناصر الإنشائية الفولاذية المدلفنة (عوارض وأعمدة W) وفق AISC 360. يحسب قدرة الانعطاف والقص والانحراف وفق حالات الحد.',
      fr: 'Conçoit et vérifie les éléments structuraux en acier laminé (poutres et colonnes W) selon AISC 360. Calcule la capacité en flexion, cisaillement et déflexion selon les états limites.',
      ru: 'Проектирует и проверяет стальные строительные конструкции (балки и колонны W) по AISC 360. Рассчитывает изгибную, сдвиговую прочность и прогиб по предельным состояниям.',
      zh: '按照AISC 360规范设计和验证轧制钢结构构件（W型梁和柱），计算弯曲、剪切和挠度承载力，检验强度和正常使用极限状态。',
      id: 'Merancang dan memverifikasi elemen struktural baja canai (balok dan kolom profil W) sesuai AISC 360. Menghitung kapasitas lentur, geser, dan lendutan berdasarkan limit state.',
    },
    que_calcula: ['Momento nominal Mn = Fy × Zx — sección compacta (AISC 360 Cap. F)', 'Capacidad a cortante: Vn = 0.6 × Fy × Aw (AISC 360 Cap. G)', 'Deflexión vs. límites L/360 (carga viva) y L/240 (carga total)', 'Perfiles W reales AISC: W150 a W360 con propiedades reales', 'Factor de utilización φ·Mn / Mu ≥ 1.0 (LRFD)'],
    que_calcula_en: ['Nominal moment Mn = Fy × Zx — compact section (AISC 360 Ch. F)', 'Shear capacity: Vn = 0.6 × Fy × Aw (AISC 360 Ch. G)', 'Deflection vs. limits L/360 (live load) and L/240 (total load)', 'Real AISC W-shapes: W150 to W360 with actual properties', 'Utilization ratio φ·Mn / Mu ≥ 1.0 (LRFD)'],
    normativas: ['AISC 360-22 — Specification for Structural Steel Buildings', 'ACI 318-19 — Building Code Requirements for Concrete', 'CIRSOC 301 — Estructuras de Acero (Argentina)'],
    como_usar: ['Seleccioná el perfil W y el acero (A36 / A572-Gr50 / A992)', 'Ingresá el momento de diseño (kN·m) o la carga distribuida y la luz de la viga', 'El módulo verifica flexión, cortante y deflexión contra límites AISC 360', 'El resultado muestra el factor de utilización y CUMPLE / NO CUMPLE por estado límite'],
    como_usar_en: ['Select W-shape section and steel grade (A36 / A572-Gr50 / A992)', 'Enter design moment (kN·m) or distributed load and beam span', 'The module checks flexure, shear, and deflection against AISC 360 limits', 'The result shows the utilization ratio and PASS / FAIL per limit state'],
  },

  // ────────────────────────────────────────────────────────────
  geotecnia: {
    color: '#a16207', icono: '🌍',
    titulo: { es:'Geotecnia', en:'Geotechnical Engineering', pt:'Geotecnia', ar:'الهندسة الجيوتقنية', fr:'Géotechnique', ru:'Геотехника', zh:'岩土工程', id:'Geoteknik' },
    que_es: {
      es: 'Calcula la capacidad portante de suelos para fundaciones superficiales utilizando la teoría de Meyerhof (1963). Aplica factores de forma, profundidad e inclinación, e incorpora la influencia del nivel freático sobre la resistencia del suelo.',
      en: 'Calculates bearing capacity of soils for shallow foundations using Meyerhof (1963) theory. Applies shape, depth, and inclination factors, incorporating the influence of the water table on soil resistance.',
      pt: 'Calcula a capacidade de suporte de solos para fundações rasas usando a teoria de Meyerhof (1963), aplicando fatores de forma, profundidade e inclinação, considerando o nível freático.',
      ar: 'يحسب قدرة تحمل التربة للأساسات الضحلة باستخدام نظرية ماييرهوف (1963). يطبق عوامل الشكل والعمق والميل مع مراعاة منسوب المياه الجوفية.',
      fr: 'Calcule la capacité portante des sols pour fondations superficielles selon Meyerhof (1963). Applique les facteurs de forme, profondeur et inclinaison, avec influence de la nappe phréatique.',
      ru: 'Рассчитывает несущую способность грунтов по теории Майерхофа (1963) с учётом факторов формы, глубины, наклона нагрузки и уровня грунтовых вод.',
      zh: '采用Meyerhof（1963）理论计算浅基础地基承载力，应用形状、深度和荷载倾斜系数，考虑地下水位对土体强度的影响。',
      id: 'Menghitung kapasitas dukung tanah untuk fondasi dangkal menggunakan teori Meyerhof (1963), menerapkan faktor bentuk, kedalaman, kemiringan, dan pengaruh muka air tanah.',
    },
    que_calcula: ['Capacidad portante última: qu = c·Nc·Fcs·Fcd + q·Nq·Fqs·Fqd + 0.5·γ·B·Nγ·Fγs·Fγd', 'Capacidad admisible: qadm = qu / FS (Factor de seguridad FS ≥ 3.0)', 'Factores de capacidad Nc, Nq, Nγ de Meyerhof (1963)', 'Corrección por nivel freático: caso 1 (NF en superficie) y caso 2 (NF a profundidad B)', 'Factores de forma para bases cuadrada, circular y rectangular'],
    que_calcula_en: ['Ultimate bearing capacity: qu = c·Nc·Fcs·Fcd + q·Nq·Fqs·Fqd + 0.5·γ·B·Nγ·Fγs·Fγd', 'Allowable capacity: qadm = qu / FS (Safety factor FS ≥ 3.0)', 'Meyerhof (1963) bearing capacity factors Nc, Nq, Nγ', 'Water table correction: case 1 (WT at surface) and case 2 (WT at depth B)', 'Shape factors for square, circular, and rectangular footings'],
    normativas: ['Meyerhof (1963) — Bearing Capacity of Foundations', 'CIRSOC 101 (Argentina)', 'Terzaghi (1943) — referencia base'],
    como_usar: ['Ingresá propiedades del suelo: cohesión c (kPa), ángulo de fricción φ (°) y peso específico γ (kN/m³)', 'Definí la geometría de la fundación: ancho B (m), largo L (m) y profundidad Df (m)', 'Indicá si hay nivel freático y a qué profundidad', 'El módulo calcula qu y qadm y dictamina si el suelo soporta la carga de la estructura'],
    como_usar_en: ['Enter soil properties: cohesion c (kPa), friction angle φ (°), unit weight γ (kN/m³)', 'Define footing geometry: width B (m), length L (m), embedment depth Df (m)', 'Indicate if water table is present and at what depth', 'The module calculates qu and qadm and determines if soil can support the structural load'],
  },

  // ────────────────────────────────────────────────────────────
  termica: {
    color: '#dc2626', icono: '🌡️',
    titulo: { es:'Térmica', en:'Thermal Engineering', pt:'Engenharia Térmica', ar:'الهندسة الحرارية', fr:'Thermique Industrielle', ru:'Теплотехника', zh:'热工程', id:'Teknik Termal' },
    que_es: {
      es: 'Diseña intercambiadores de calor de casco y tubo mediante el método LMTD. Calcula el área de transferencia requerida, el coeficiente global de transferencia U y optimiza la configuración de flujo (contracorriente o paralelo) según estándar TEMA.',
      en: 'Designs shell-and-tube heat exchangers using the LMTD method. Calculates required heat transfer area, overall heat transfer coefficient U, and optimizes flow configuration (counter-current or parallel) per TEMA standard.',
      pt: 'Projeta trocadores de calor casco-e-tubo pelo método LMTD. Calcula área de transferência de calor, coeficiente global U e otimiza a configuração de fluxo conforme TEMA.',
      ar: 'يصمم مبادلات الحرارة قشرة-وأنابيب بطريقة LMTD. يحسب مساحة نقل الحرارة المطلوبة ومعامل الانتقال الكلي U وفق معيار TEMA.',
      fr: 'Conçoit les échangeurs de chaleur coque-et-tube par la méthode LMTD. Calcule la surface d\'échange, le coefficient global U et la configuration optimale selon TEMA.',
      ru: 'Проектирует кожухотрубные теплообменники методом LMTD. Рассчитывает площадь теплообмена, коэффициент теплопередачи U и оптимизирует схему потока по стандарту TEMA.',
      zh: '采用LMTD法设计管壳式换热器，根据TEMA标准计算所需换热面积、总传热系数U以及最佳流动配置。',
      id: 'Merancang penukar panas cangkang-dan-tabung menggunakan metode LMTD. Menghitung luas transfer panas dan koefisien U sesuai standar TEMA.',
    },
    que_calcula: ['LMTD — Diferencia de temperatura media logarítmica (contracorriente/paralelo)', 'Factor de corrección F para configuraciones multipaso', 'Área de transferencia: A = Q / (U × F × LMTD)', 'Coeficiente global U según tipo de fluido (TEMA Sección 2)', 'Dilatación térmica en cañerías: ΔL = α × L₀ × ΔT'],
    que_calcula_en: ['LMTD — Log Mean Temperature Difference (counter-current/parallel)', 'Correction factor F for multi-pass configurations', 'Heat transfer area: A = Q / (U × F × LMTD)', 'Overall coefficient U per fluid type (TEMA Section 2)', 'Thermal expansion: ΔL = α × L₀ × ΔT'],
    normativas: ['TEMA — Tubular Exchanger Manufacturers Association', 'ASME Sec.VIII Div.1 — Pressure Vessels', 'Kern (1950) — Process Heat Transfer', 'ASME B31.3 — Process Piping'],
    como_usar: ['Ingresá temperaturas de entrada y salida de ambos fluidos (caliente y frío)', 'Seleccioná la configuración: contracorriente (más eficiente) o paralelo', 'Ingresá el calor a transferir Q (kW) y el coeficiente U estimado', 'El módulo calcula LMTD, área requerida y la eficiencia del intercambiador'],
    como_usar_en: ['Enter inlet and outlet temperatures of both fluids (hot and cold)', 'Select flow configuration: counter-current (more efficient) or parallel', 'Enter heat duty Q (kW) and estimated overall coefficient U', 'The module calculates LMTD, required area, and heat exchanger efficiency'],
  },

  // ────────────────────────────────────────────────────────────
  vialidad: {
    color: '#16a34a', icono: '🛣️',
    titulo: { es:'Vialidad', en:'Road Engineering', pt:'Engenharia Rodoviária', ar:'هندسة الطرق', fr:'Génie Routier', ru:'Дорожное Строительство', zh:'道路工程', id:'Teknik Jalan Raya' },
    que_es: {
      es: 'Diseña el espesor de pavimentos flexibles y rígidos mediante el método AASHTO 93. Determina el número estructural SN y los espesores de cada capa (carpeta asfáltica, base granular y subbase) en función del tráfico proyectado y la capacidad de la subrasante.',
      en: 'Designs flexible and rigid pavement thicknesses using AASHTO 93. Determines structural number SN and layer thicknesses (asphalt, base, subbase) based on projected traffic and subgrade capacity.',
      pt: 'Projeta espessuras de pavimentos flexíveis e rígidos pelo método AASHTO 93. Determina o número estrutural SN e espessuras das camadas conforme tráfego projetado e capacidade da subrasante.',
      ar: 'يصمم سماكات الرصف المرن والجامد بطريقة AASHTO 93. يحدد الرقم الهيكلي SN وسماكات طبقات الأسفلت والقاعدة والقاعدة الفرعية وفق حركة المرور المتوقعة.',
      fr: 'Conçoit les épaisseurs de chaussées souples et rigides selon AASHTO 93. Détermine le nombre structurel SN et les épaisseurs des couches selon le trafic projeté.',
      ru: 'Проектирует толщины дорожных одежд по методу AASHTO 93. Определяет структурное число SN и толщины слоёв в зависимости от проектного трафика.',
      zh: '采用AASHTO 93方法设计柔性和刚性路面厚度，根据预测交通量和路基承载力确定结构数SN及各层厚度。',
      id: 'Merancang ketebalan perkerasan fleksibel dan kaku menggunakan AASHTO 93. Menentukan angka struktural SN dan ketebalan setiap lapisan berdasarkan lalu lintas yang diproyeksikan.',
    },
    que_calcula: ['ESAL — Ejes equivalentes de 8.2 toneladas para el período de diseño', 'Número estructural: SN = a1·D1 + a2·D2·m2 + a3·D3·m3', 'Espesores mínimos de carpeta asfáltica, base granular y subbase', 'Módulo resiliente Mr de la subrasante (kPa o psi)', 'Confiabilidad de diseño (75% a 99.9%)'],
    que_calcula_en: ['ESAL — Equivalent single axle loads of 8.2 tons for design period', 'Structural number: SN = a1·D1 + a2·D2·m2 + a3·D3·m3', 'Minimum thicknesses of asphalt layer, granular base, and subbase', 'Subgrade resilient modulus Mr (kPa or psi)', 'Design reliability (75% to 99.9%)'],
    normativas: ['AASHTO Guide for Design of Pavement Structures (1993)', 'Manual de Diseño Geométrico DG-2018 (Perú/MTC)', 'INVIAS — Manual de Diseño de Pavimentos (Colombia)'],
    como_usar: ['Ingresá el tráfico diario promedio (TPDA) y el factor de camiones', 'Definí la vida útil (años), el módulo resiliente Mr y el índice de servicio PSI', 'Seleccioná la confiabilidad de diseño (75% a 99.9% según clase de vía)', 'El módulo calcula el SN requerido y los espesores de cada capa del pavimento'],
    como_usar_en: ['Enter average daily traffic (ADT) and truck factor', 'Define design life (years), resilient modulus Mr, and serviceability index PSI', 'Select design reliability (75% to 99.9% by road class)', 'The module calculates the required SN and thickness of each pavement layer'],
  },

  // ────────────────────────────────────────────────────────────
  arquitectura: {
    color: '#0891b2', icono: '🏛️',
    titulo: { es:'Arquitectura Técnica', en:'Technical Architecture', pt:'Arquitetura Técnica', ar:'الهندسة المعمارية التقنية', fr:'Architecture Technique', ru:'Техническая Архитектура', zh:'技术建筑学', id:'Arsitektur Teknis' },
    que_es: {
      es: 'Analiza las cargas de viento sobre edificaciones y estructuras conforme a ASCE 7-22. Calcula la presión de diseño por viento en barlovento y sotavento considerando la velocidad básica, categoría de exposición, categoría de riesgo y coeficientes de presión.',
      en: 'Analyzes wind loads on buildings and structures per ASCE 7-22. Calculates design wind pressure (windward and leeward) considering basic wind speed, exposure category, risk category, and pressure coefficients.',
      pt: 'Analisa cargas de vento em edificações conforme ASCE 7-22. Calcula a pressão de projeto do vento (barlavento e sotavento) considerando velocidade básica, categoria de exposição e risco.',
      ar: 'يحلل أحمال الرياح على المباني وفق ASCE 7-22. يحسب ضغط الرياح التصميمي (مواجه للريح وظهر الريح) مع مراعاة السرعة الأساسية وفئة التعرض وفئة المخاطر.',
      fr: 'Analyse les charges de vent sur les bâtiments selon ASCE 7-22. Calcule la pression de vent de conception (au vent et sous le vent) selon la vitesse de référence, la catégorie d\'exposition et le risque.',
      ru: 'Анализирует ветровые нагрузки на здания по ASCE 7-22. Рассчитывает расчётное ветровое давление (наветренная и подветренная стороны) с учётом скорости ветра, категории местности и риска.',
      zh: '按照ASCE 7-22分析建筑物风荷载，考虑基本风速、暴露类别、风险类别和压力系数，计算迎风面和背风面设计风压。',
      id: 'Menganalisis beban angin pada bangunan sesuai ASCE 7-22. Menghitung tekanan angin desain (sisi angin dan belakang angin) berdasarkan kecepatan dasar, kategori paparan, dan risiko.',
    },
    que_calcula: ['Factor de velocidad Kz por altura y categoría de exposición (A, B, C, D)', 'Presión dinámica: qz = 0.613 × Kz × Kzt × Kd × V² (N/m²)', 'Presión barlovento: p = qz × G × Cp (presión positiva)', 'Presión sotavento: p = qh × G × Cp (succión — valor negativo)', 'Carga sísmica base: V = Cs × W (NSR-10 / CIRSOC 103)'],
    que_calcula_en: ['Velocity factor Kz by height and exposure category (A, B, C, D)', 'Dynamic pressure: qz = 0.613 × Kz × Kzt × Kd × V² (N/m²)', 'Windward pressure: p = qz × G × Cp (positive pressure)', 'Leeward pressure: p = qh × G × Cp (suction — negative value)', 'Base shear: V = Cs × W (ASCE 7-22 seismic)'],
    normativas: ['ASCE 7-22 — Minimum Design Loads for Buildings and Other Structures', 'CIRSOC 103 (Argentina) — Cargas de Viento', 'NSR-10 (Colombia) — Norma Sismo Resistente', 'NCh 433 (Chile) — Diseño Sísmico'],
    como_usar: ['Ingresá la velocidad básica de viento (km/h o mph) del mapa de vientos del país', 'Seleccioná la categoría de exposición (B=suburbano, C=campo abierto, D=costa)', 'Definí las dimensiones del edificio: altura, largo y ancho', 'El módulo calcula presiones en barlovento y sotavento con estado CUMPLE/NO CUMPLE'],
    como_usar_en: ['Enter basic wind speed (km/h or mph) from the country\'s wind hazard map', 'Select exposure category (B=suburban, C=open terrain, D=coastal)', 'Define building dimensions: height, length, and width', 'The module calculates windward and leeward pressures with PASS/FAIL status'],
  },

  // ────────────────────────────────────────────────────────────
  represas: {
    color: '#0284c7', icono: '🏞️',
    titulo: { es:'Represas y Presas', en:'Dams & Hydraulic Structures', pt:'Barragens e Estruturas Hidráulicas', ar:'السدود والمنشآت الهيدروليكية', fr:'Barrages et Ouvrages Hydrauliques', ru:'Плотины и Гидросооружения', zh:'水坝与水工建筑物', id:'Bendungan dan Bangunan Hidraulik' },
    que_es: {
      es: 'Calcula el caudal sobre vertederos (Francis y Poleni), las filtraciones a través de cuerpos de tierra mediante la Ley de Darcy y verifica la estabilidad hidráulica de presas aplicando criterios del USACE.',
      en: 'Calculates discharge over spillways (Francis and Poleni formulas), seepage through earth dams using Darcy\'s Law, and verifies hydraulic stability of dams per USACE design criteria.',
      pt: 'Calcula a vazão sobre vertedouros (Francis e Poleni), infiltração em barragens de terra (Lei de Darcy) e verifica a estabilidade hidráulica conforme USACE.',
      ar: 'يحسب التدفق فوق الفيضانات (فرانسيس وبوليني) والتسرب عبر الجسم الترابي (قانون داسي) ويتحقق من الاستقرار الهيدروليكي للسدود وفق USACE.',
      fr: 'Calcule le débit sur les déversoirs (Francis et Poleni), les infiltrations dans les barrages en terre (loi de Darcy) et vérifie la stabilité hydraulique selon les critères USACE.',
      ru: 'Рассчитывает расход через водосливы (формулы Франсиса и Полени), фильтрацию через тело плотины (закон Дарси) и проверяет гидравлическую устойчивость по критериям USACE.',
      zh: '计算溢洪道过水量（Francis和Poleni公式）、通过土坝的渗流（达西定律），并按USACE标准验证水坝水力稳定性。',
      id: 'Menghitung debit di atas pelimpah (Francis dan Poleni), rembesan melalui bendungan tanah (Hukum Darcy), dan memverifikasi stabilitas hidraulik sesuai USACE.',
    },
    que_calcula: ['Caudal vertedero cresta libre: Q = C × L × H^(3/2) — Francis', 'Caudal vertedero sumergido — Poleni con corrección de sumersión', 'Velocidad de filtración: v = k × i — Ley de Darcy', 'Gradiente hidráulico crítico y factor de seguridad contra sifonamiento', 'Empuje hidrostático y momento volcador sobre la presa'],
    que_calcula_en: ['Free overflow spillway: Q = C × L × H^(3/2) — Francis formula', 'Submerged spillway discharge — Poleni with submergence correction', 'Seepage velocity: v = k × i — Darcy\'s Law', 'Critical hydraulic gradient and safety factor against piping/heave', 'Hydrostatic thrust and overturning moment on the dam'],
    normativas: ['USACE EM 1110-2-1603 — Hydraulic Design of Spillways', 'ICOLD Bulletins — International Commission on Large Dams', 'Darcy (1856) — Law of Seepage in Porous Media'],
    como_usar: ['Para vertedero: ingresá longitud de cresta L (m) y carga hidráulica H (m)', 'Seleccioná el tipo de vertedero y el coeficiente C según la geometría', 'Para filtración: ingresá la permeabilidad del suelo k (m/s) y el gradiente i', 'El módulo calcula Q, velocidad de filtración y evalúa el riesgo de sifonamiento'],
    como_usar_en: ['For spillway: enter crest length L (m) and hydraulic head H (m)', 'Select spillway type and coefficient C based on geometry', 'For seepage: enter soil permeability k (m/s) and hydraulic gradient i', 'The module calculates Q, seepage velocity, and evaluates piping risk'],
  },

  // ────────────────────────────────────────────────────────────
  soldadura: {
    color: '#d97706', icono: '⚡',
    titulo: { es:'Soldadura Industrial', en:'Industrial Welding', pt:'Soldagem Industrial', ar:'اللحام الصناعي', fr:'Soudage Industriel', ru:'Промышленная Сварка', zh:'工业焊接', id:'Pengelasan Industri' },
    que_es: {
      es: 'Calcula los parámetros técnicos de soldadura industrial para estructuras metálicas, cañerías y recipientes a presión. Incluye selección de electrodo por aplicación, calor aportado (Heat Input), resistencia de soldadura de filete y temperatura de precalentamiento por carbono equivalente.',
      en: 'Calculates technical welding parameters for industrial structures, pipelines, and pressure vessels. Includes electrode selection, heat input calculation (AWS D1.1), fillet weld resistance, and preheat temperature based on carbon equivalent (IIW method).',
      pt: 'Calcula parâmetros técnicos de soldagem industrial para estruturas metálicas, tubulações e vasos de pressão. Inclui seleção de eletrodo, aporte de calor (Heat Input) e temperatura de pré-aquecimento.',
      ar: 'يحسب معاملات اللحام التقنية للإنشاءات الفولاذية والأنابيب وأوعية الضغط. يشمل اختيار القطب ومدخل الحرارة ومقاومة لحام الزاوية ودرجة حرارة ما قبل التسخين.',
      fr: 'Calcule les paramètres techniques de soudage industriel pour structures métalliques, tuyauteries et appareils à pression. Inclut la sélection d\'électrode, l\'apport thermique et la température de préchauffage.',
      ru: 'Рассчитывает технические параметры промышленной сварки для конструкций, трубопроводов и сосудов давления. Включает выбор электрода, тепловложение (Heat Input) и температуру предварительного нагрева.',
      zh: '计算工业金属结构、管道和压力容器的焊接技术参数，包括电极选择、热输入计算（AWS D1.1）、角焊缝强度以及基于碳当量（IIW法）的预热温度。',
      id: 'Menghitung parameter teknis pengelasan industri untuk struktur logam, pipa, dan bejana tekan. Termasuk pemilihan elektroda, heat input (AWS D1.1), resistansi las filet, dan suhu pemanasan awal.',
    },
    que_calcula: ['Heat Input: HI = (V × I × 60) / (v × 1000) kJ/mm — AWS D1.1 §6.8.5', 'Resistencia filete: Rw = 0.707 × a × Lw × FEXX × 0.60', 'Temperatura precalentamiento: CE_IIW = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15', 'Consumo de electrodos por junta (kg) según tipo y diámetro', 'Selección de electrodo por aplicación, posición y PWHT requerido'],
    que_calcula_en: ['Heat Input: HI = (V × I × 60) / (v × 1000) kJ/mm — AWS D1.1 §6.8.5', 'Fillet weld resistance: Rw = 0.707 × a × Lw × FEXX × 0.60', 'Preheat temperature: CE_IIW = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15', 'Electrode consumption per joint (kg) by type and diameter', 'Electrode selection by application, position, and required PWHT'],
    normativas: ['AWS D1.1:2020 — Structural Welding Code — Steel', 'ASME Section IX — Welding and Brazing Qualifications', 'API 1104:2021 — Welding of Pipelines and Related Facilities'],
    como_usar: ['Seleccioná el sub-módulo: Heat Input, filete, precalentamiento o selector de electrodo', 'Para Heat Input: ingresá voltaje (V), corriente (A) y velocidad de avance (mm/min)', 'El módulo verifica si el Heat Input cumple el rango del WPS (AWS D1.1)', 'Para precalentamiento: ingresá la composición química del acero para calcular CE y Tp'],
    como_usar_en: ['Select sub-module: Heat Input, fillet weld, preheat, or electrode selector', 'For Heat Input: enter voltage (V), current (A), and travel speed (mm/min)', 'The module verifies if Heat Input meets the WPS range (AWS D1.1)', 'For preheat: enter steel chemical composition to calculate CE and preheat temperature Tp'],
  },

  // ────────────────────────────────────────────────────────────
  mmo: {
    color: '#10b981', icono: '🧱',
    titulo: { es:'Maestro Mayor de Obra', en:'Construction Materials', pt:'Materiais de Construção', ar:'حاسبة مواد البناء', fr:'Matériaux de Construction', ru:'Строительные Материалы', zh:'建筑材料计算', id:'Material Konstruksi' },
    que_es: {
      es: 'Calcula con exactitud las cantidades de materiales para obras de construcción civil: dosificación de hormigón (H-25 a H-40), barras de hierro, mampostería, losas, revoque, cerámico, contrapiso y zapatas. Adaptado a 7 países con sus normativas y dosificaciones locales.',
      en: 'Precisely calculates material quantities for civil construction works: concrete mix design (H-25 to H-40), rebar, masonry, slabs, plaster, ceramic tile, floor bases, and footings. Adapted to 7 countries with local standards and mix designs.',
      pt: 'Calcula com precisão as quantidades de materiais para obras de construção civil: dosagem de concreto (H-25 a H-40), barras de aço, alvenaria, lajes, reboco, cerâmica e sapatas. Adaptado para 7 países.',
      ar: 'يحسب بدقة كميات مواد البناء المدني: تصميم الخلط الخرسانية (H-25 إلى H-40)، حديد التسليح، البناء، البلاطات، المصبة، الخزف والأساسات. مُكيَّف لـ7 دول لاتينية أمريكية.',
      fr: 'Calcule avec précision les quantités de matériaux pour la construction civile: dosage du béton (H-25 à H-40), barres d\'armature, maçonnerie, dalles, enduits et fondations. Adapté à 7 pays.',
      ru: 'Точно рассчитывает количество строительных материалов: состав бетона (H-25 до H-40), арматуру, кладку, плиты, штукатурку, керамику и фундаменты. Для 7 стран Латинской Америки.',
      zh: '精确计算土木建筑材料用量：混凝土配合比（H-25至H-40）、钢筋、砌体、楼板、抹灰、瓷砖和基础，支持7个拉丁美洲国家的标准。',
      id: 'Menghitung jumlah material konstruksi secara tepat: desain campuran beton (H-25 hingga H-40), besi beton, pasangan bata, pelat, plester, keramik, dan pondasi. Disesuaikan untuk 7 negara.',
    },
    que_calcula: ['Dosificación hormigón: cemento, arena, ripio y agua por m³ (H-25/H-30/H-35/H-40)', 'Hierro en barras: kg por m³ según tipo de elemento estructural', 'Mampostería: ladrillos y mortero por m² de pared', 'Losas: espesor, malla y acero de temperatura según luz y carga', 'Zapatas: hormigón, hierro y excavación según capacidad portante'],
    que_calcula_en: ['Concrete mix: cement, sand, aggregate, and water per m³ (H-25/H-30/H-35/H-40)', 'Rebar: kg per m³ by structural element type', 'Masonry: bricks and mortar per m² of wall', 'Slabs: thickness, mesh, and temperature steel by span and load', 'Footings: concrete, rebar, and excavation by bearing capacity'],
    normativas: ['CIRSOC 201 (Argentina) — Hormigón Armado', 'ACI 318-19 — Building Code Requirements for Structural Concrete', 'NCh 170 (Chile) — Hormigón: Requisitos Generales', 'NSR-10 (Colombia) — Reglamento de Construcción Sismo Resistente'],
    como_usar: ['Seleccioná el país (Argentina, Chile, Colombia, México, Perú, Uruguay, Bolivia)', 'Elegí el tipo de cálculo: hormigón, hierro, mampostería, losa, revoque, cerámico o zapata', 'Ingresá las dimensiones del elemento (largo, ancho, altura o espesor)', 'El módulo entrega las cantidades exactas de materiales por m² o m³'],
    como_usar_en: ['Select country (Argentina, Chile, Colombia, Mexico, Peru, Uruguay, Bolivia)', 'Choose calculation type: concrete, rebar, masonry, slab, plaster, ceramic, or footing', 'Enter element dimensions (length, width, height, or thickness)', 'The module delivers exact material quantities per m² or m³'],
  },

  // ────────────────────────────────────────────────────────────
  electricidad: {
    color: '#22c55e', icono: '🔋',
    titulo: { es:'Electricidad Industrial', en:'Industrial Electrical', pt:'Elétrica Industrial', ar:'الكهرباء الصناعية', fr:'Électricité Industrielle', ru:'Промышленная Электрика', zh:'工业电气', id:'Listrik Industri' },
    que_es: {
      es: 'Calcula instalaciones eléctricas industriales completas: calibre de cable (NEC/IEC), caída de tensión, corriente de cortocircuito (IEC 60909), banco de capacitores, motores eléctricos, iluminación (IES) y clasificación de áreas peligrosas (ATEX/API RP 500). Incluye tabla AWG↔mm².',
      en: 'Calculates complete industrial electrical installations: cable sizing (NEC/IEC), voltage drop, short-circuit current (IEC 60909), capacitor banks, electric motors, lighting (IES), and hazardous area classification (ATEX/API RP 500). Includes AWG↔mm² table.',
      pt: 'Calcula instalações elétricas industriais completas: calibre de cabo (NEC/IEC), queda de tensão, corrente de curto-circuito (IEC 60909), banco de capacitores, motores, iluminação e áreas perigosas.',
      ar: 'يحسب التركيبات الكهربائية الصناعية الكاملة: مقطع الكابل (NEC/IEC)، انخفاض الجهد، تيار القصر (IEC 60909)، بنوك المكثفات، المحركات والإضاءة وتصنيف المناطق الخطرة.',
      fr: 'Calcule les installations électriques industrielles complètes: section de câble (NEC/IEC), chute de tension, courant de court-circuit (IEC 60909), batteries de condensateurs, moteurs, éclairage et zones ATEX.',
      ru: 'Рассчитывает промышленные электроустановки: сечение кабеля (NEC/IEC), падение напряжения, ток короткого замыкания (IEC 60909), конденсаторные батареи, двигатели, освещение и взрывоопасные зоны.',
      zh: '计算完整工业电气安装：电缆截面（NEC/IEC）、电压降、短路电流（IEC 60909）、电容器组、电动机、照明（IES）和危险区域分类（ATEX/API RP 500）。',
      id: 'Menghitung instalasi listrik industri lengkap: ukuran kabel (NEC/IEC), penurunan tegangan, arus hubung singkat (IEC 60909), bank kapasitor, motor, pencahayaan (IES), dan area berbahaya (ATEX).',
    },
    que_calcula: ['Calibre mínimo de cable: sección según corriente y caída de tensión (NEC 310 / IEC 60364)', 'Caída de tensión: ΔV = (ρ × L × I × 2) / S — verificación ≤3% (NEC) o ≤5% (IEC)', 'Corriente de cortocircuito trifásico: Icc = U / (√3 × Z) — IEC 60909', 'Clasificación área peligrosa: Zona 0/1/2 (IEC 60079) — División 1/2 (API RP 500)', 'Nivel de iluminación requerido (lux) por tipo de tarea — IES / EN 12464-1'],
    que_calcula_en: ['Minimum cable size: section by current capacity and voltage drop (NEC 310 / IEC 60364)', 'Voltage drop: ΔV = (ρ × L × I × 2) / S — check ≤3% (NEC) or ≤5% (IEC)', 'Three-phase short-circuit current: Icc = U / (√3 × Z) — IEC 60909', 'Hazardous area classification: Zone 0/1/2 (IEC 60079) — Division 1/2 (API RP 500)', 'Required illuminance (lux) by task type — IES / EN 12464-1'],
    normativas: ['NEC 2023 — National Electrical Code (USA)', 'IEC 60909 — Short-Circuit Currents in AC Systems', 'IEC 60079 — Equipment for Explosive Atmospheres', 'API RP 500 — Hazardous Electrical Area Classification', 'IES — Illuminating Engineering Society'],
    como_usar: ['Seleccioná el sub-módulo: cable, caída de tensión, cortocircuito, motor, iluminación o área peligrosa', 'Ingresá corriente de diseño (A), tensión del sistema (V) y longitud del circuito (m)', 'Seleccioná material del conductor (Cu o Al) y tipo de instalación', 'El módulo calcula el calibre mínimo y dictamina CUMPLE / NO CUMPLE'],
    como_usar_en: ['Select sub-module: cable sizing, voltage drop, short-circuit, motor, lighting, or hazardous area', 'Enter design current (A), system voltage (V), and circuit length (m)', 'Select conductor material (Cu or Al) and installation type', 'The module calculates minimum cable size and issues PASS / FAIL'],
  },

  // ────────────────────────────────────────────────────────────
  canerias: {
    color: '#f97316', icono: '🔧',
    titulo: { es:'Cañerías e Integridad', en:'Pipeline Integrity', pt:'Integridade de Dutos', ar:'سلامة خطوط الأنابيب', fr:'Intégrité des Canalisations', ru:'Целостность Трубопроводов', zh:'管道完整性', id:'Integritas Perpipaan' },
    que_es: {
      es: 'Verifica la integridad de cañerías industriales bajo presión: calcula el espesor mínimo de pared (B31.8/B31.4), el estrés circunferencial (Hoop Stress de Barlow), la sobrepresión por golpe de ariete (Joukowsky) y evalúa la vida remanente conforme API 579/ASME FFS-1.',
      en: 'Verifies integrity of pressurized industrial pipelines: calculates minimum wall thickness (B31.8/B31.4), circumferential stress (Barlow Hoop Stress), water hammer overpressure (Joukowsky), and evaluates remaining life per API 579/ASME FFS-1.',
      pt: 'Verifica a integridade de tubulações industriais sob pressão: calcula espessura mínima de parede (B31.8/B31.4), tensão circunferencial (Barlow), golpe de aríete e vida remanescente conforme API 579.',
      ar: 'يتحقق من سلامة الأنابيب الصناعية تحت الضغط: يحسب سماكة الجدار الدنيا (B31.8/B31.4) والإجهاد الدائري والمطرقة المائية ويقيّم العمر المتبقي وفق API 579.',
      fr: 'Vérifie l\'intégrité des canalisations industrielles sous pression: calcule l\'épaisseur minimale de paroi (B31.8/B31.4), la contrainte circonférentielle (Barlow), le coup de bélier et la durée de vie résiduelle (API 579).',
      ru: 'Проверяет целостность промышленных трубопроводов под давлением: толщину стенки (B31.8/B31.4), кольцевые напряжения (Барлоу), гидравлический удар (Жуковский) и остаточный ресурс (API 579).',
      zh: '验证承压工业管道完整性：计算最小壁厚（B31.8/B31.4）、Barlow环向应力、水击超压（Joukowsky），并按API 579/ASME FFS-1评估剩余寿命。',
      id: 'Memverifikasi integritas perpipaan bertekanan: ketebalan dinding minimum (B31.8/B31.4), tegangan lingkar Barlow, water hammer (Joukowsky), dan sisa umur per API 579/ASME FFS-1.',
    },
    que_calcula: ['Espesor mínimo: t = P·D / (2·S·F·E·T) — ASME B31.8 §841.1.1', 'Hoop Stress (Barlow): σ_h = P·D / (2·t) — verificación vs. SMYS × F × E', 'Golpe de ariete: ΔP = ρ × a × Δv — Joukowsky con celeridad de onda real', 'Tiempo de cierre seguro de válvula: t_cierre ≥ 2L/a', 'Vida remanente: (t_medido - t_mínimo) / tasa_corrosión — API 579'],
    que_calcula_en: ['Minimum thickness: t = P·D / (2·S·F·E·T) — ASME B31.8 §841.1.1', 'Hoop Stress (Barlow): σ_h = P·D / (2·t) — check vs. SMYS × F × E', 'Water hammer: ΔP = ρ × a × Δv — Joukowsky with real wave celerity', 'Safe valve closure time: t_closure ≥ 2L/a', 'Remaining life: (t_measured - t_minimum) / corrosion_rate — API 579'],
    normativas: ['ASME B31.8-2020 — Gas Transmission and Distribution Piping', 'ASME B31.4-2019 — Liquid Transportation Systems', 'API 579-1/ASME FFS-1 — Fitness-For-Service', 'Joukowsky (1898) — Water Hammer Theory'],
    como_usar: ['Seleccioná el sub-módulo: espesor pared, Hoop Stress, golpe de ariete, cierre válvula o vida remanente', 'Ingresá diámetro exterior OD (mm), presión de diseño (bar) y grado API 5L', 'Seleccioná clase de ubicación y tipo de junta (solo para cálculo de espesor)', 'El resultado muestra el valor calculado y el estado: CUMPLE / FUERA DE SERVICIO / CRÍTICO'],
    como_usar_en: ['Select sub-module: wall thickness, Hoop Stress, water hammer, valve closure, or remaining life', 'Enter outer diameter OD (mm), design pressure (bar), and API 5L material grade', 'Select location class and joint type (for wall thickness only)', 'The result shows calculated value and status: PASS / OUT OF SERVICE / CRITICAL'],
  },

  // ────────────────────────────────────────────────────────────
  valvulas: {
    color: '#0d9488', icono: '⚙️',
    titulo: { es:'Válvulas Industriales', en:'Industrial Valves', pt:'Válvulas Industriais', ar:'الصمامات الصناعية', fr:'Vannes Industrielles', ru:'Трубопроводная Арматура', zh:'工业阀门', id:'Katup Industri' },
    que_es: {
      es: 'Selecciona y dimensiona válvulas industriales según fluido, presión y temperatura de servicio. Determina la clase de presión ASME B16.34, el material apropiado bajo NACE MR0175, las dimensiones reales de brida B16.5 (NPS ½" a 24") y exporta el plano DXF para fabricación en AutoCAD.',
      en: 'Selects and sizes industrial valves based on fluid, pressure, and service temperature. Determines ASME B16.34 pressure class, appropriate material per NACE MR0175, real B16.5 flange dimensions (NPS ½" to 24"), and exports DXF drawing for AutoCAD fabrication.',
      pt: 'Seleciona e dimensiona válvulas industriais conforme fluido, pressão e temperatura. Determina a classe de pressão ASME B16.34, material NACE MR0175, dimensões reais de flange B16.5 e exporta plano DXF.',
      ar: 'يختار ويحدد أبعاد الصمامات الصناعية وفق السائل والضغط ودرجة الحرارة. يحدد فئة ضغط ASME B16.34 والمادة وفق NACE MR0175 وأبعاد الشفة B16.5 ويصدر رسم DXF.',
      fr: 'Sélectionne et dimensionne les vannes industrielles selon le fluide, la pression et la température. Détermine la classe ASME B16.34, le matériau NACE MR0175, les dimensions bride B16.5 et exporte le plan DXF.',
      ru: 'Подбирает и рассчитывает промышленную арматуру по параметрам среды. Определяет класс давления ASME B16.34, материал по NACE MR0175, размеры фланцев B16.5 и экспортирует чертёж DXF.',
      zh: '根据流体、压力和温度选择工业阀门尺寸，确定ASME B16.34压力等级、NACE MR0175材料选择、B16.5法兰尺寸（NPS ½"至24"），并导出DXF图纸。',
      id: 'Memilih dan menentukan ukuran katup industri berdasarkan fluida, tekanan, dan suhu. Menentukan kelas tekanan ASME B16.34, material NACE MR0175, dimensi flange B16.5, dan mengekspor gambar DXF.',
    },
    que_calcula: ['Clase de presión mínima: Class 150/300/600/900/1500/2500 — B16.34 Tabla 2-1.1', 'Material cuerpo: WCB, CF8M, WC6 según temperatura, fluido e H₂S (NACE MR0175)', 'Dimensiones brida B16.5: OD, círculo pernos, N° pernos y bore (NPS ½" a 24")', 'Coeficiente de caudal Cv — ISA 75.01.01: Cv = Q × √(SG / ΔP)', 'Plano DXF — 2D con brida dimensionada para AutoCAD / FreeCAD'],
    que_calcula_en: ['Minimum pressure class: Class 150/300/600/900/1500/2500 — B16.34 Table 2-1.1', 'Body material: WCB, CF8M, WC6 by temperature, fluid, and H₂S (NACE MR0175)', 'B16.5 flange dimensions: OD, bolt circle, number of bolts, bore (NPS ½" to 24")', 'Flow coefficient Cv — ISA 75.01.01: Cv = Q × √(SG / ΔP)', 'DXF drawing — 2D dimensioned flange for AutoCAD / FreeCAD'],
    normativas: ['ASME B16.34-2017 — Valves: Flanged, Threaded and Welding End', 'ASME B16.5-2017 — Pipe Flanges and Flanged Fittings', 'ISA 75.01.01 — Flow Equations for Sizing Control Valves', 'NACE MR0175/ISO 15156 — Sour Service Material Requirements'],
    como_usar: ['Ingresá presión de operación (bar) y temperatura (°C) del servicio', 'Seleccioná material del cuerpo y el sistema verifica la clase de presión automáticamente', 'En la pestaña Brida B16.5: seleccioná NPS y clase para obtener todas las dimensiones reales', 'En la pestaña DXF: ingresá el nombre del proyecto y descargá el plano para AutoCAD'],
    como_usar_en: ['Enter operating pressure (bar) and service temperature (°C)', 'Select body material and the system automatically determines the required pressure class', 'In the B16.5 Flange tab: select NPS and class to get all actual dimensions', 'In the DXF tab: enter project name and download the drawing for AutoCAD'],
  },
}; 