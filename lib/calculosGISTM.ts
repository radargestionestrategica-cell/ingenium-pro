// GISTM — Global Industry Standard on Tailings Management (ICMM / UNEP / PRI, August 2020)
// Fuente: https://globaltailingsreview.org/wp-content/uploads/2020/08/global-industry-standard-on-tailings-management.pdf
// Texto de Requisitos citado verbatim en inglés (idioma original del documento).

export interface Requisito {
  id: string;
  principleId: number;
  topicId: string;
  texto: string;
  textoEs?: string;
  rolResponsable?: string[];
}

export interface Principle {
  id: number;
  topicId: string;
  titulo: string;
  tituloEs?: string;
  requisitos: Requisito[];
}

export const PRINCIPLES_GISTM: Principle[] = [
  {
    id: 1,
    topicId: 'I',
    titulo:
      'Respect the rights of project-affected people and meaningfully engage them at all phases of the tailings facility lifecycle, including closure.',
    tituloEs:
      'Respetar los derechos de las personas afectadas por el proyecto y comprometerlas de manera significativa en todas las fases del ciclo de vida de la instalacion de relaves, incluido el cierre.',
    requisitos: [
      {
        id: '1.1',
        principleId: 1,
        topicId: 'I',
        texto:
          'Demonstrate respect for human rights in accordance with the United Nations Guiding Principles on Business and Human Rights (UNGP), conduct human rights due diligence to inform management decisions throughout the tailings facility lifecycle and address the human rights risks of tailings facility credible failure scenarios. For existing facilities, the Operator can initially opt to prioritise salient human rights issues in accordance with the UNGP.',
        textoEs:
          'Demostrar respeto por los derechos humanos de conformidad con los Principios Rectores de la ONU sobre Empresas y Derechos Humanos (UNGP), realizar la debida diligencia en derechos humanos para fundamentar decisiones de gestion durante el ciclo de vida de la instalacion, y abordar los riesgos de derechos humanos de escenarios creibles de falla. En instalaciones existentes, el Operador puede priorizar inicialmente los temas mas relevantes segun los UNGP.',
      },
      {
        id: '1.2',
        principleId: 1,
        topicId: 'I',
        texto:
          'Where a new tailings facility may impact the rights of indigenous or tribal peoples, including their land and resource rights and their right to self-determination, work to obtain and maintain Free Prior and Informed Consent (FPIC) by demonstrating conformance to international guidance and recognised best practice frameworks.',
        textoEs:
          'Cuando una nueva instalacion pueda afectar derechos de pueblos indigenas o tribales, incluidos derechos territoriales y de autodeterminacion, trabajar para obtener y mantener el Consentimiento Libre, Previo e Informado (CLPI) conforme a guias internacionales reconocidas.',
      },
      {
        id: '1.3',
        principleId: 1,
        topicId: 'I',
        texto:
          'Demonstrate that project-affected people are meaningfully engaged throughout the tailings facility lifecycle in building the knowledge base and in decisions that may have a bearing on public safety and the integrity of the tailings facility. The Operator shall share information to support this process.',
        textoEs:
          'Demostrar que las personas afectadas por el proyecto participan de manera significativa durante el ciclo de vida de la instalacion en la construccion de la base de conocimiento y en decisiones que puedan incidir en la seguridad publica y la integridad de la instalacion. El Operador debera compartir informacion para respaldar este proceso.',
      },
      {
        id: '1.4',
        principleId: 1,
        topicId: 'I',
        texto:
          'Establish an effective operational-level, non-judicial grievance mechanism that addresses complaints and grievances of project-affected people relating to the tailings facility, and provide remedy in accordance with the UNGP.',
        textoEs:
          'Establecer un mecanismo de reclamos a nivel operativo, no judicial y eficaz, que atienda quejas y reclamos de las personas afectadas por el proyecto relacionados con la instalacion, y proporcionar reparacion conforme a los UNGP.',
      },
    ],
  },
  {
    id: 2,
    topicId: 'II',
    titulo:
      'Develop and maintain an interdisciplinary knowledge base to support safe tailings management throughout the tailings facility lifecycle, including closure.',
    tituloEs:
      'Desarrollar y mantener una base de conocimiento interdisciplinaria para respaldar la gestion segura de relaves a lo largo del ciclo de vida de la instalacion, incluido el cierre.',
    requisitos: [
      {
        id: '2.1',
        principleId: 2,
        topicId: 'II',
        texto:
          'Develop and document knowledge about the social, environmental and local economic context of the tailings facility, using approaches aligned with international best practices. Update this knowledge at least every five years, and whenever there is a material change either to the tailings facility or to the social, environmental and local economic context. This knowledge should capture uncertainties due to climate change.',
        textoEs:
          'Desarrollar y documentar conocimiento sobre el contexto social, ambiental y economico local de la instalacion de relaves, usando enfoques alineados con mejores practicas internacionales. Actualizar cada cinco años o ante cambio material en la instalacion o el contexto. Debe capturar incertidumbres del cambio climatico.',
      },
      {
        id: '2.2',
        principleId: 2,
        topicId: 'II',
        texto:
          'Prepare, document and update a detailed site characterisation of the tailings facility site(s) that includes data on climate, geomorphology, geology, geochemistry, hydrology and hydrogeology (surface and groundwater flow and quality), geotechnical, and seismicity. The physical and chemical properties of the tailings shall be characterised and updated regularly to account for variability in ore properties and processing.',
        textoEs:
          'Preparar, documentar y actualizar una caracterizacion detallada del sitio que incluya clima, geomorfologia, geologia, geoquimica, hidrologia e hidrogeologia, geotecnia y sismicidad. Las propiedades fisicas y quimicas de los relaves deben caracterizarse y actualizarse periodicamente.',
      },
      {
        id: '2.3',
        principleId: 2,
        topicId: 'II',
        texto:
          "Develop and document a breach analysis for the tailings facility using a methodology that considers credible failure modes, site conditions, and the properties of the slurry. The results of the analysis shall estimate the physical area impacted by a potential failure. When flowable materials (water and liquefiable solids) are present at tailings facilities with Consequence Classification of 'High', 'Very High' or 'Extreme', the results should include estimates of the physical area impacted by a potential failure, flow arrival times, depth and velocities, and depth of material deposition. Update whenever there is a material change either to the tailings facility or the physical area impacted.",
        textoEs:
          'Desarrollar y documentar un analisis de brecha para la instalacion usando una metodologia que considere modos de falla creibles, condiciones del sitio y propiedades de la pulpa. En instalaciones High/Very High/Extreme con materiales fluibles, incluir area afectada, tiempos de llegada, profundidad y velocidades del flujo. Actualizar ante cambio material.',
      },
      {
        id: '2.4',
        principleId: 2,
        topicId: 'II',
        texto:
          'In order to identify the groups most at risk, refer to the updated tailings facility breach analysis to assess and document potential human exposure and vulnerability to tailings facility credible failure scenarios. Update the assessment whenever there is a material change either to the tailings facility or to the knowledge base.',
        textoEs:
          'Para identificar los grupos con mayor riesgo, usar el analisis de brecha actualizado para evaluar y documentar exposicion humana potencial y vulnerabilidad ante escenarios creibles de falla. Actualizar ante cambio material en la instalacion o la base de conocimiento.',
      },
    ],
  },
  {
    id: 3,
    topicId: 'II',
    titulo:
      'Use all elements of the knowledge base - social, environmental, local economic and technical - to inform decisions throughout the tailings facility lifecycle, including closure.',
    tituloEs:
      'Utilizar todos los elementos de la base de conocimiento -social, ambiental, economico local y tecnico- para fundamentar las decisiones a lo largo del ciclo de vida de la instalacion de relaves, incluido el cierre.',
    requisitos: [
      {
        id: '3.1',
        principleId: 3,
        topicId: 'II',
        texto:
          'To enhance resilience to climate change, evaluate, regularly update and use climate change knowledge throughout the tailings facility lifecycle in accordance with the principles of Adaptive Management.',
        textoEs:
          'Para fortalecer la resiliencia frente al cambio climatico, evaluar, actualizar regularmente y utilizar el conocimiento sobre cambio climatico a lo largo del ciclo de vida de la instalacion, de acuerdo con los principios de la Gestion Adaptativa.',
      },
      {
        id: '3.2',
        principleId: 3,
        topicId: 'II',
        texto:
          'For new tailings facilities, the Operator shall use the knowledge base and undertake a multi-criteria alternatives analysis of all feasible sites, technologies and strategies for tailings management. The goal of this analysis shall be to: (i) select an alternative that minimises risks to people and the environment throughout the tailings facility lifecycle; and (ii) minimise the volume of tailings and water placed in external tailings facilities. This analysis shall be reviewed by the Independent Tailings Review Board (ITRB) or a senior independent technical reviewer. For existing tailings facilities, the Operator shall periodically review and refine the tailings technologies and design, and management strategies to minimise risk and improve environmental outcomes. An exception applies to facilities that are demonstrated to be in a state of safe closure.',
      },
      {
        id: '3.3',
        principleId: 3,
        topicId: 'II',
        texto:
          'For new tailings facilities, use the knowledge base, including uncertainties due to climate change, to assess the social, environmental and local economic impacts of the tailings facility and its potential failure throughout its lifecycle. Where impact assessments predict material acute or chronic impacts, the Operator shall develop, document and implement impact mitigation and management plans using the mitigation hierarchy.',
      },
      {
        id: '3.4',
        principleId: 3,
        topicId: 'II',
        texto:
          'Update the assessment of the social, environmental and local economic impacts to reflect a material change either to the tailings facility or to the social, environmental and local economic context. If new data indicates that the impacts from the tailings facility have changed materially, including as a result of climate change knowledge or long-term impacts, the Operator shall update tailings facility management to reflect the new data using Adaptive Management best practices.',
      },
    ],
  },
  {
    id: 4,
    topicId: 'III',
    titulo:
      'Develop plans and design criteria for the tailings facility to minimise risk for all phases of its lifecycle, including closure and post-closure.',
    tituloEs:
      'Desarrollar planes y criterios de diseño para la instalacion de relaves con el fin de minimizar el riesgo en todas las fases de su ciclo de vida, incluyendo el cierre y el post-cierre.',
    requisitos: [
      {
        id: '4.1',
        principleId: 4,
        topicId: 'III',
        texto:
          'Determine the consequence of failure classification of the tailings facility by assessing the downstream conditions documented in the knowledge base and selecting the classification corresponding to the highest Consequence Classification for each category in Annex 2, Table 1. The assessment and selection of the classification shall be based on credible failure modes, and shall be defensible and documented.',
        textoEs:
          'Determinar la clasificacion de consecuencia de falla de la instalacion de relaves evaluando las condiciones aguas abajo documentadas en la base de conocimiento y seleccionando la clasificacion correspondiente a la Clasificacion de Consecuencia mas alta para cada categoria de la Tabla 1 del Annex 2. La evaluacion y seleccion deberan basarse en modos de falla creibles, y deberan ser defendibles y estar documentadas.',
      },
      {
        id: '4.2',
        principleId: 4,
        topicId: 'III',
        texto:
          "With the objective of maintaining flexibility in the development of a new tailings facility and optimising costs while prioritising safety throughout the tailings facility lifecycle: A. Develop preliminary designs for the tailings facility with external loading design criteria consistent with both the consequence of failure classification selected based on current conditions and higher Consequence Classifications (including 'Extreme'). B. Informed by the range of requirements defined by the preliminary designs, either: 1. Implement the design for the 'Extreme' Consequence Classification external loading criteria; or 2. Implement the design for the current Consequence Classification criteria, or a higher one, and demonstrate that the feasibility, at a proof of concept level, to upgrade to the design for the 'Extreme' classification criteria is maintained throughout the tailings facility lifecycle. C. If option B.2 is implemented, review the consequence of failure classification at the time of the Dam Safety Review (DSR) and at least every five years, or sooner if there is a material change in the social, environmental and local economic context, and complete the upgrade of the tailings facility to the new Consequence Classification as determined by the DSR within three years. This review shall proceed until the tailings facility has been safely closed according to this Standard. D. The process described above shall be reviewed by the Independent Tailings Review Board (ITRB) or the senior independent technical reviewer, as appropriate for the tailings facility Consequence Classification. Subject to Requirement 4.7, Requirements 4.2.C and 4.2.D shall also apply to existing tailings facilities.",
        textoEs:
          'Con el objetivo de mantener flexibilidad en el desarrollo de una nueva instalacion de relaves y optimizar costos priorizando la seguridad a lo largo del ciclo de vida: A. Desarrollar disenos preliminares con criterios de carga externa consistentes con la clasificacion actual y con clasificaciones superiores incluyendo Extreme. B. Conforme al rango de requisitos de los disenos preliminares: 1. Implementar el diseno para criterios Extreme; o 2. Implementar el diseno para criterios actuales o superiores, demostrando viabilidad de actualizar a Extreme mas adelante. C. Si se implementa la opcion B.2, revisar la clasificacion en cada Revision de Seguridad de la Presa y al menos cada cinco anios, o antes si hay cambio material en el contexto, completando la actualizacion dentro de tres anios. Esta revision continua hasta el cierre seguro de la instalacion. D. El proceso debera ser revisado por la ITRB o el revisor tecnico independiente senior. Sujeto al Requisito 4.7, los Requisitos 4.2.C y 4.2.D tambien aplican a instalaciones existentes.',
      },
      {
        id: '4.3',
        principleId: 4,
        topicId: 'III',
        texto:
          'The Accountable Executive shall take the decision to adopt a design for the current Consequence Classification criteria and to maintain flexibility to upgrade the design for the highest classification criteria later in the tailings facility lifecycle. This decision shall be documented.',
        textoEs:
          'El Ejecutivo Responsable debera tomar la decision de adoptar un diseno para la Clasificacion de Consecuencia actual y de mantener la flexibilidad para actualizarlo a criterios mas altos mas adelante. Esta decision debera estar documentada.',
      },
      {
        id: '4.4',
        principleId: 4,
        topicId: 'III',
        texto:
          'Select, explicitly identify and document all design criteria that are appropriate to minimise risk for all credible failure modes for all phases of the tailings facility lifecycle.',
        textoEs:
          'Seleccionar, identificar explicitamente y documentar todos los criterios de diseno apropiados para minimizar el riesgo ante todos los modos de falla creibles, para todas las fases del ciclo de vida de la instalacion.',
      },
      {
        id: '4.5',
        principleId: 4,
        topicId: 'III',
        texto:
          'Apply design criteria, such as factors of safety for slope stability and seepage management, that consider estimated operational properties of materials and expected performance of design elements, and quality of the implementation of risk management systems. These issues should also be appropriately accounted for in designs based on deformation analyses.',
        textoEs:
          'Aplicar criterios de diseno, como factores de seguridad para estabilidad de taludes y gestion de filtraciones, que consideren las propiedades operativas estimadas de los materiales y el desempeno esperado de los elementos de diseno, asi como la calidad de implementacion de los sistemas de gestion de riesgo. Estas cuestiones tambien deberan tenerse en cuenta en los disenos basados en analisis de deformacion.',
      },
      {
        id: '4.6',
        principleId: 4,
        topicId: 'III',
        texto:
          'Identify and address brittle failure modes with conservative design criteria, independent of trigger mechanisms, to minimise their impact on the performance of the tailings facility.',
        textoEs:
          'Identificar y abordar los modos de falla fragil con criterios de diseno conservadores, independientemente de los mecanismos desencadenantes, para minimizar su impacto en el desempeno de la instalacion.',
      },
      {
        id: '4.7',
        principleId: 4,
        topicId: 'III',
        texto:
          'Existing tailings facilities shall conform with the Requirements under Principle 4, except for those aspects where the Engineer of Record (EOR), with review by the ITRB or a senior independent technical reviewer, determines that the upgrade of an existing tailings facility is not viable or cannot be retroactively applied. In this case, the Accountable Executive shall approve and document the implementation of measures to reduce both the probability and the consequences of a tailings facility failure in order to reduce the risk to a level as low as reasonably practicable (ALARP). The basis and timing for addressing the upgrade of existing tailings facilities shall be risk-informed and carried out as soon as reasonably practicable.',
        textoEs:
          'Las instalaciones existentes deberan cumplir con los Requisitos del Principio 4, excepto donde el Ingeniero de Registro, con revision de la ITRB o un revisor tecnico independiente senior, determine que la actualizacion no es viable o no puede aplicarse retroactivamente. En ese caso, el Ejecutivo Responsable debera aprobar y documentar medidas para reducir probabilidad y consecuencias de falla, llevando el riesgo a un nivel tan bajo como sea razonablemente practicable (ALARP). El fundamento y los plazos para abordar la actualizacion de instalaciones existentes deberan estar basados en riesgo y ejecutarse tan pronto como sea razonablemente practicable.',
      },
      {
        id: '4.8',
        principleId: 4,
        topicId: 'III',
        texto:
          'The EOR shall prepare a Design Basis Report (DBR) that details the design assumptions and criteria, including operating constraints, and that provides the basis for the design of all phases of the tailings facility lifecycle. The DBR shall be reviewed by the ITRB or senior independent technical reviewer. The EOR shall update the DBR every time there is a material change in the design assumptions, design criteria, design or the knowledge base and confirm internal consistency among these elements.',
        textoEs:
          'El EOR debera preparar un Informe de Bases de Diseno que detalle los supuestos y criterios de diseno, incluidas las restricciones operativas, como base del diseno de todas las fases del ciclo de vida. El Informe debera ser revisado por la ITRB o un revisor tecnico independiente senior, y actualizado cada vez que exista un cambio material en los supuestos de diseno, los criterios de diseno, el diseno o la base de conocimiento, confirmando consistencia interna entre estos elementos.',
      },
    ],
  },
  {
    id: 5,
    topicId: 'III',
    titulo:
      'Develop a robust design that integrates the knowledge base and minimises the risk of failure to people and the environment for all phases of the tailings facility lifecycle, including closure and post-closure.',
    tituloEs:
      'Desarrollar un diseno robusto que integre la base de conocimiento y minimice el riesgo de falla para las personas y el ambiente en todas las fases del ciclo de vida de la instalacion de relaves, incluyendo el cierre y el post-cierre.',
    requisitos: [
      {
        id: '5.1',
        principleId: 5,
        topicId: 'III',
        texto:
          'For new tailings facilities, incorporate the outcome of the multi-criteria alternatives analysis including the use of tailings technologies in the design of the tailings facility. For expansions to existing tailings facilities, investigate the potential to refine the tailings technologies and design approaches with the goal of minimising risks to people and the environment throughout the tailings facility lifecycle.',
        textoEs:
          'Para nuevas instalaciones de relaves, incorporar el resultado del analisis de alternativas multicriterio, incluyendo el uso de tecnologias de relaves, en el diseno de la instalacion. Para ampliaciones de instalaciones existentes, investigar la posibilidad de perfeccionar las tecnologias y enfoques de diseno con el objetivo de minimizar los riesgos para las personas y el ambiente a lo largo del ciclo de vida de la instalacion.',
      },
      {
        id: '5.2',
        principleId: 5,
        topicId: 'III',
        texto:
          'Develop a robust design that considers the technical, social, environmental and local economic context, the tailings facility Consequence Classification, site conditions, water management, mine plant operations, tailings operational and construction issues, and that demonstrates the feasibility of safe closure of the tailings facility. The design should be reviewed and updated as performance and site data become available and in response to material changes to the tailings facility or its performance.',
        textoEs:
          'Desarrollar un diseno robusto que considere el contexto tecnico, social, ambiental y economico local, la Clasificacion de Consecuencia de la instalacion, las condiciones del sitio, la gestion del agua, las operaciones de la planta minera, y los aspectos operativos y constructivos de los relaves, y que demuestre la viabilidad de un cierre seguro de la instalacion. El diseno debera revisarse y actualizarse a medida que se disponga de datos de desempeno y del sitio, y en respuesta a cambios materiales en la instalacion o su desempeno.',
      },
      {
        id: '5.3',
        principleId: 5,
        topicId: 'III',
        texto:
          'Develop, implement and maintain a water balance model and associated water management plans for the tailings facility, taking into account the knowledge base including climate change, upstream and downstream hydrological and hydrogeological basins, the mine site, mine planning and overall operations and the integrity of the tailings facility throughout its lifecycle. The water management programme must be designed to protect against unintentional releases.',
        textoEs:
          'Desarrollar, implementar y mantener un modelo de balance hidrico y los planes de gestion del agua asociados para la instalacion de relaves, teniendo en cuenta la base de conocimiento, incluido el cambio climatico, las cuencas hidrologicas e hidrogeologicas aguas arriba y aguas abajo, el sitio minero, la planificacion minera y las operaciones generales, y la integridad de la instalacion a lo largo de su ciclo de vida. El programa de gestion del agua debe disenarse para proteger contra liberaciones no intencionales.',
      },
      {
        id: '5.4',
        principleId: 5,
        topicId: 'III',
        texto:
          'Address all potential failure modes of the structure, its foundation, abutments, reservoir (tailings deposit and pond), reservoir rim and appurtenant structures to minimise risk to ALARP. Risk assessments must be used to inform the design.',
        textoEs:
          'Abordar todos los modos de falla potenciales de la estructura, su fundacion, estribos, embalse (deposito de relaves y laguna), borde del embalse y estructuras conexas, a fin de minimizar el riesgo a un nivel ALARP. Las evaluaciones de riesgo deben utilizarse para fundamentar el diseno.',
      },
      {
        id: '5.5',
        principleId: 5,
        topicId: 'III',
        texto:
          'Develop a design for each stage of construction of the tailings facility, including but not limited to start-up, partial raises and interim configurations, final raise, and all closure stages.',
        textoEs:
          'Desarrollar un diseno para cada etapa de construccion de la instalacion de relaves, incluyendo pero no limitado al arranque, elevaciones parciales y configuraciones intermedias, elevacion final, y todas las etapas de cierre.',
      },
      {
        id: '5.6',
        principleId: 5,
        topicId: 'III',
        texto:
          'Design the closure phase in a manner that meets all the Requirements of the Standard with sufficient detail to demonstrate the feasibility of the closure scenario and to allow implementation of elements of the design during construction and operation as appropriate. The design should include progressive closure and reclamation during operations.',
        textoEs:
          'Disenar la fase de cierre de manera que cumpla con todos los Requisitos del Estandar, con el detalle suficiente para demostrar la viabilidad del escenario de cierre y permitir la implementacion de elementos del diseno durante la construccion y la operacion segun corresponda. El diseno debe incluir cierre progresivo y recuperacion durante la operacion.',
      },
      {
        id: '5.7',
        principleId: 5,
        topicId: 'III',
        texto:
          "For a proposed new tailings facility classified as 'High', 'Very High' or 'Extreme', the Accountable Executive shall confirm that the design satisfies ALARP and shall approve additional reasonable steps that may be taken downstream, to further reduce potential consequences to people and the environment. The Accountable Executive shall explain and document the decisions with respect to ALARP and additional consequence reduction measures. For an existing tailings facility classified as 'High', 'Very High' or 'Extreme', the Accountable Executive, at the time of every DSR or at least every five years, shall confirm that the design satisfies ALARP and shall seek to identify and implement additional reasonable steps that may be taken to further reduce potential consequences to people and the environment. The Accountable Executive shall explain and document the decisions with respect to ALARP and additional consequence reduction measures, in consultation with external parties as appropriate.",
        textoEs:
          'Para una nueva instalacion de relaves propuesta clasificada como High, Very High o Extreme, el Ejecutivo Responsable debera confirmar que el diseno satisface el ALARP y debera aprobar pasos razonables adicionales que puedan tomarse aguas abajo para reducir aun mas las consecuencias potenciales para las personas y el ambiente. El Ejecutivo Responsable debera explicar y documentar las decisiones respecto del ALARP y las medidas adicionales de reduccion de consecuencias. Para una instalacion existente clasificada como High, Very High o Extreme, el Ejecutivo Responsable, en cada DSR o al menos cada cinco anios, debera confirmar que el diseno satisface el ALARP y debera procurar identificar e implementar pasos razonables adicionales para reducir aun mas las consecuencias potenciales. El Ejecutivo Responsable debera explicar y documentar las decisiones respecto del ALARP y las medidas adicionales, en consulta con partes externas segun corresponda.',
      },
      {
        id: '5.8',
        principleId: 5,
        topicId: 'III',
        texto:
          'Where other measures to reduce the consequences of a tailings facility credible failure mode as per the breach analysis have been exhausted, and pre-emptive resettlement cannot be avoided, the Operator shall demonstrate conformance with international standards for involuntary resettlement.',
        textoEs:
          'Cuando se hayan agotado otras medidas para reducir las consecuencias de un modo de falla creible de la instalacion de relaves segun el analisis de brecha, y el reasentamiento preventivo no pueda evitarse, el Operador debera demostrar conformidad con los estandares internacionales de reasentamiento involuntario.',
      },
    ],
  },
  {
    id: 6,
    topicId: 'III',
    titulo:
      'Plan, build and operate the tailings facility to manage risk at all phases of the tailings facility lifecycle, including closure and post-closure.',
    tituloEs:
      'Planificar, construir y operar la instalacion de relaves para gestionar el riesgo en todas las fases de su ciclo de vida, incluyendo el cierre y el post-cierre.',
    requisitos: [
      {
        id: '6.1',
        principleId: 6,
        topicId: 'III',
        texto:
          'Build, operate, monitor and close the tailings facility according to the design intent at all phases of the tailings facility lifecycle, using qualified personnel and appropriate methodology, equipment and procedures, data acquisition methods, the Tailings Management System (TMS) and the overall Environmental and Social Management System (ESMS) for the mine and associated infrastructure.',
        textoEs:
          'Construir, operar, monitorear y cerrar la instalacion de relaves de acuerdo con la intencion de diseno en todas las fases del ciclo de vida, utilizando personal calificado, y metodologia, equipos y procedimientos apropiados, metodos de adquisicion de datos, el Sistema de Gestion de Relaves (TMS) y el Sistema de Gestion Ambiental y Social (ESMS) general de la mina y su infraestructura asociada.',
      },
      {
        id: '6.2',
        principleId: 6,
        topicId: 'III',
        texto:
          'Manage the quality and adequacy of the construction and operation process by implementing Quality Control, Quality Assurance and Construction vs Design Intent Verification (CDIV). The Operator shall use the CDIV to ensure that the design intent is implemented and is still being met if the site conditions vary from the design assumptions.',
        textoEs:
          'Gestionar la calidad y adecuacion del proceso de construccion y operacion implementando Control de Calidad, Aseguramiento de Calidad y Verificacion de Construccion versus Intencion de Diseno (CDIV). El Operador debera usar el CDIV para asegurar que la intencion de diseno se implemente y se siga cumpliendo si las condiciones del sitio varian respecto de los supuestos de diseno.',
      },
      {
        id: '6.3',
        principleId: 6,
        topicId: 'III',
        texto:
          "Prepare a detailed Construction Records Report ('as-built' report) whenever there is a material change to the tailings facility, its infrastructure or its monitoring system. The EOR and the Responsible Tailings Facility Engineer (RTFE) shall sign this report.",
        textoEs:
          'Preparar un Informe de Registros de Construccion detallado (informe as-built) cada vez que exista un cambio material en la instalacion de relaves, su infraestructura o su sistema de monitoreo. El EOR y el Ingeniero Responsable de la Instalacion de Relaves (RTFE) deberan firmar este informe.',
      },
      {
        id: '6.4',
        principleId: 6,
        topicId: 'III',
        texto:
          'Develop, implement, review annually and update as required an Operations, Maintenance and Surveillance (OMS) Manual that supports effective risk management as part of the TMS. The OMS Manual should follow best practices, clearly provide the context and critical controls for safe operations, and be reviewed for effectiveness. The RTFE shall provide access to the OMS Manual and training to all levels of personnel involved in the TMS with support from the EOR.',
        textoEs:
          'Desarrollar, implementar, revisar anualmente y actualizar segun sea necesario un Manual de Operacion, Mantenimiento y Vigilancia (OMS) que respalde la gestion eficaz del riesgo como parte del TMS. El Manual OMS debe seguir mejores practicas, proveer claramente el contexto y los controles criticos para operaciones seguras, y ser revisado por su efectividad. El RTFE debera proveer acceso al Manual OMS y capacitacion a todos los niveles de personal involucrado en el TMS, con el apoyo del EOR.',
      },
      {
        id: '6.5',
        principleId: 6,
        topicId: 'III',
        texto:
          'Implement a formal change management system that triggers the evaluation, review, approval and documentation of changes to design, construction, operation or monitoring during the tailings facility lifecycle. The change management system shall also include the requirement for the EOR to prepare a periodic Deviance Accountability Report (DAR), that provides an assessment of the cumulative impact of the changes on the risk level of the as-constructed facility. The DAR shall provide recommendations for managing risk, if necessary, and any resulting updates to the design, DBR, OMS and the monitoring programme. The DAR shall be approved by the Accountable Executive.',
        textoEs:
          'Implementar un sistema formal de gestion de cambios que active la evaluacion, revision, aprobacion y documentacion de cambios al diseno, construccion, operacion o monitoreo durante el ciclo de vida de la instalacion. El sistema de gestion de cambios debera incluir tambien el requisito de que el EOR prepare un Informe de Responsabilidad por Desviacion (DAR) periodico, que evalue el impacto acumulado de los cambios sobre el nivel de riesgo de la instalacion tal como fue construida. El DAR debera proveer recomendaciones para gestionar el riesgo, si es necesario, y cualquier actualizacion resultante al diseno, al DBR, al OMS y al programa de monitoreo. El DAR debera ser aprobado por el Ejecutivo Responsable.',
      },
      {
        id: '6.6',
        principleId: 6,
        topicId: 'III',
        texto:
          'Include new and emerging technologies and approaches and use the evolving knowledge in the refinement of the design, construction and operation of the tailings facility.',
        textoEs:
          'Incorporar tecnologias y enfoques nuevos y emergentes, y utilizar el conocimiento en evolucion para el perfeccionamiento del diseno, la construccion y la operacion de la instalacion de relaves.',
      },
    ],
  },
  {
    id: 7,
    topicId: 'III',
    titulo:
      'Design, implement and operate monitoring systems to manage risk at all phases of the facility lifecycle, including closure.',
    tituloEs:
      'Disenar, implementar y operar sistemas de monitoreo para gestionar el riesgo en todas las fases del ciclo de vida de la instalacion, incluyendo el cierre.',
    requisitos: [
      {
        id: '7.1',
        principleId: 7,
        topicId: 'III',
        texto:
          'Design, implement and operate a comprehensive and integrated performance monitoring programme for the tailings facility and its appurtenant structures as part of the TMS and for those aspects of the ESMS related to the tailings facility in accordance with the principles of Adaptive Management.',
        textoEs:
          'Disenar, implementar y operar un programa de monitoreo de desempeno integral e integrado para la instalacion de relaves y sus estructuras conexas como parte del TMS, y para aquellos aspectos del ESMS relacionados con la instalacion, de acuerdo con los principios de la Gestion Adaptativa.',
      },
      {
        id: '7.2',
        principleId: 7,
        topicId: 'III',
        texto:
          'Design, implement and operate a comprehensive and integrated engineering monitoring system that is appropriate for verifying design assumptions and for monitoring potential failure modes. Full implementation of the Observational Method shall be adopted for non-brittle failure modes. Brittle failure modes are addressed by conservative design criteria.',
        textoEs:
          'Disenar, implementar y operar un sistema de monitoreo de ingenieria integral e integrado que sea apropiado para verificar los supuestos de diseno y para monitorear los modos de falla potenciales. Debera adoptarse la implementacion total del Metodo Observacional para los modos de falla no fragiles. Los modos de falla fragil se abordan mediante criterios de diseno conservadores.',
      },
      {
        id: '7.3',
        principleId: 7,
        topicId: 'III',
        texto:
          'Establish specific and measurable performance objectives, indicators, criteria, and performance parameters and include them in the design of the monitoring programmes that measure performance throughout the tailings facility lifecycle. Record and evaluate the data at appropriate frequencies. Based on the data obtained, update the monitoring programmes throughout the tailings facility lifecycle to confirm that they remain effective to manage risk.',
        textoEs:
          'Establecer objetivos, indicadores, criterios y parametros de desempeno especificos y medibles, e incluirlos en el diseno de los programas de monitoreo que midan el desempeno a lo largo del ciclo de vida de la instalacion. Registrar y evaluar los datos con la frecuencia apropiada. Con base en los datos obtenidos, actualizar los programas de monitoreo a lo largo del ciclo de vida de la instalacion para confirmar que sigan siendo eficaces para gestionar el riesgo.',
      },
      {
        id: '7.4',
        principleId: 7,
        topicId: 'III',
        texto:
          'Analyse technical monitoring data at the frequency recommended by the EOR, and assess the performance of the tailings facility, clearly identifying and presenting evidence on any deviations from the expected performance and any deterioration of the performance over time. Promptly submit evidence to the EOR for review and update the risk assessment and design, if required. Performance outside the expected ranges shall be addressed promptly through Trigger Action Response Plans (TARPs) or critical controls.',
        textoEs:
          'Analizar los datos de monitoreo tecnico con la frecuencia recomendada por el EOR, y evaluar el desempeno de la instalacion, identificando y presentando claramente evidencia de cualquier desviacion respecto del desempeno esperado y cualquier deterioro del desempeno a lo largo del tiempo. Presentar la evidencia sin demora al EOR para su revision, y actualizar la evaluacion de riesgo y el diseno si es necesario. El desempeno fuera de los rangos esperados debera abordarse sin demora mediante Planes de Respuesta a la Activacion de Disparadores (TARPs) o controles criticos.',
      },
      {
        id: '7.5',
        principleId: 7,
        topicId: 'III',
        texto:
          'Report the results of each of the monitoring programmes at the frequency required to meet company and regulatory requirements and, at a minimum, on an annual basis. The RTFE and the EOR shall review and approve the technical monitoring reports.',
        textoEs:
          'Reportar los resultados de cada uno de los programas de monitoreo con la frecuencia requerida para cumplir con los requisitos de la empresa y regulatorios y, como minimo, con periodicidad anual. El RTFE y el EOR deberan revisar y aprobar los reportes tecnicos de monitoreo.',
      },
    ],
  },
  {
    id: 8,
    topicId: 'IV',
    titulo:
      'Establish policies, systems and accountabilities to support the safety and integrity of the tailings facility.',
    tituloEs:
      'Establecer politicas, sistemas y responsabilidades para respaldar la seguridad e integridad de la instalacion de relaves.',
    requisitos: [
      {
        id: '8.1',
        principleId: 8,
        topicId: 'IV',
        texto:
          'The Board of Directors shall adopt and publish a policy on or commitment to the safe management of tailings facilities, to emergency preparedness and response, and to recovery after failure.',
        textoEs:
          'El Directorio debera adoptar y publicar una politica sobre -o compromiso con- la gestion segura de las instalaciones de relaves, la preparacion y respuesta ante emergencias, y la recuperacion tras una falla.',
      },
      {
        id: '8.2',
        principleId: 8,
        topicId: 'IV',
        texto:
          'Establish a tailings governance framework and a performance based TMS and ensure that the ESMS and other critical systems encompass relevant aspects of the tailings facility management.',
        textoEs:
          'Establecer un marco de gobernanza de relaves y un TMS basado en desempeno, y asegurar que el ESMS y otros sistemas criticos abarquen los aspectos relevantes de la gestion de la instalacion de relaves.',
      },
      {
        id: '8.3',
        principleId: 8,
        topicId: 'IV',
        texto:
          'For roles with responsibility for tailings facilities, develop mechanisms such that incentive payments or performance reviews are based, at least in part, on public safety and the integrity of the tailings facility. These incentive payments shall reflect the degree to which public safety and the integrity of the tailings facility are part of the role. Long-term incentives for relevant executive managers should take tailings management into account.',
        textoEs:
          'Para los roles con responsabilidad sobre las instalaciones de relaves, desarrollar mecanismos tales que los pagos por incentivos o las evaluaciones de desempeno se basen, al menos en parte, en la seguridad publica y la integridad de la instalacion. Estos pagos por incentivos deberan reflejar el grado en que la seguridad publica y la integridad de la instalacion forman parte del rol. Los incentivos a largo plazo para los directivos ejecutivos relevantes deberan tener en cuenta la gestion de relaves.',
      },
      {
        id: '8.4',
        principleId: 8,
        topicId: 'IV',
        texto:
          'Appoint one or more Accountable Executives who is/are directly answerable to the CEO on matters related to this Standard. The Accountable Executive(s) shall be accountable for the safety of tailings facilities and for avoiding or minimising the social and environmental consequences of a tailings facility failure. The Accountable Executive(s) shall also be accountable for a programme of tailings management training, and for emergency preparedness and response. The Accountable Executive(s) must have scheduled communication with the EOR and regular communication with the Board of Directors, which can be initiated either by the Accountable Executive(s), or the Board. The Board of Directors shall document how it holds the Accountable Executive(s) accountable.',
        textoEs:
          'Designar uno o mas Ejecutivos Responsables que respondan directamente ante el CEO en asuntos relacionados con este Estandar. El o los Ejecutivo(s) Responsable(s) debera(n) responder por la seguridad de las instalaciones de relaves y por evitar o minimizar las consecuencias sociales y ambientales de una falla. El o los Ejecutivo(s) Responsable(s) tambien debera(n) responder por un programa de capacitacion en gestion de relaves, y por la preparacion y respuesta ante emergencias. El o los Ejecutivo(s) Responsable(s) debera(n) tener comunicacion programada con el EOR y comunicacion regular con el Directorio, que puede ser iniciada tanto por el o los Ejecutivo(s) Responsable(s) como por el Directorio. El Directorio debera documentar como responsabiliza al o a los Ejecutivo(s) Responsable(s).',
      },
      {
        id: '8.5',
        principleId: 8,
        topicId: 'IV',
        texto:
          'Appoint a site-specific Responsible Tailings Facility Engineer (RTFE) who is accountable for the integrity of the tailings facility, who liaises with the EOR and internal teams such as operations, planning, regulatory affairs, social performance and environment, and who has regular two-way communication with the Accountable Executive. The RTFE must be familiar with the DBR, the design report and the construction and performance of the tailings facility.',
        textoEs:
          'Designar un Ingeniero Responsable de la Instalacion de Relaves (RTFE) especifico del sitio, que responda por la integridad de la instalacion, que enlace con el EOR y con equipos internos como operaciones, planificacion, asuntos regulatorios, desempeno social y ambiente, y que tenga comunicacion regular en ambos sentidos con el Ejecutivo Responsable. El RTFE debe estar familiarizado con el DBR, el informe de diseno, y la construccion y desempeno de la instalacion.',
      },
      {
        id: '8.6',
        principleId: 8,
        topicId: 'IV',
        texto:
          'Identify appropriate qualifications and experience requirements for all personnel who play safety-critical roles in the operation of a tailings facility, including, but not limited to the RTFE, the EOR and the Accountable Executive. Ensure that incumbents of these roles have the identified qualifications and experience, and develop succession plans for these personnel.',
        textoEs:
          'Identificar los requisitos apropiados de calificacion y experiencia para todo el personal que desempene roles criticos de seguridad en la operacion de una instalacion de relaves, incluyendo, entre otros, el RTFE, el EOR y el Ejecutivo Responsable. Asegurar que quienes ocupen estos roles cuenten con la calificacion y experiencia identificadas, y desarrollar planes de sucesion para este personal.',
      },
      {
        id: '8.7',
        principleId: 8,
        topicId: 'IV',
        texto:
          "For tailings facilities with Consequence Classification of 'Very High' or 'Extreme', appoint an Independent Tailings Review Board (ITRB). For all other facilities, the Operator may appoint a senior independent technical reviewer. The ITRB or the reviewer shall be appointed early in the project development process, report to the Accountable Executive and certify in writing that they follow best practices for engineers in avoiding conflicts of interest.",
        textoEs:
          'Para instalaciones de relaves con Clasificacion de Consecuencia Very High o Extreme, designar una ITRB. Para el resto de las instalaciones, el Operador podra designar un revisor tecnico independiente senior. La ITRB o el revisor deberan ser designados tempranamente en el proceso de desarrollo del proyecto, reportar al Ejecutivo Responsable, y certificar por escrito que siguen las mejores practicas de ingenieria para evitar conflictos de interes.',
      },
    ],
  },
  {
    id: 9,
    topicId: 'IV',
    titulo: 'Appoint and empower an Engineer of Record.',
    tituloEs: 'Designar y empoderar a un Ingeniero de Registro (EOR).',
    requisitos: [
      {
        id: '9.1',
        principleId: 9,
        topicId: 'IV',
        texto:
          "Engage an engineering firm with expertise and experience in the design and construction of tailings facilities of comparable complexity to provide EOR services for operating the tailings facility and for closed facilities with 'High', 'Very High' and 'Extreme' Consequence Classification, that are in the active closure phase. Require that the firm nominate a senior engineer, approved by the Operator, to represent the firm as the EOR, and verify that the individual has the necessary experience, skills and time to fulfil this role. Alternatively, the Operator may appoint an in-house engineer with expertise and experience in comparable facilities as the EOR. In this instance, the EOR may delegate the design to a firm ('Designer of Record') but shall remain thoroughly familiar with the design in discharging their responsibilities as EOR. Whether the EOR or the DOR is in-house or external, they must be competent and have experience appropriate to the Consequence Classification and complexity of the tailings facility.",
        textoEs:
          'Contratar una firma de ingenieria con experiencia y trayectoria en el diseno y construccion de instalaciones de relaves de complejidad comparable, para proveer servicios de EOR en la instalacion operativa y en instalaciones cerradas con Clasificacion de Consecuencia High, Very High y Extreme que esten en fase activa de cierre. Exigir que la firma designe un ingeniero senior, aprobado por el Operador, para representar a la firma como EOR, y verificar que la persona cuente con la experiencia, habilidades y tiempo necesarios para cumplir este rol. Alternativamente, el Operador puede designar un ingeniero interno con experiencia y trayectoria en instalaciones comparables como EOR. En este caso, el EOR puede delegar el diseno a una firma (Disenador de Registro), pero debera mantenerse profundamente familiarizado con el diseno al desempenar sus responsabilidades como EOR. Ya sea que el EOR o el DOR sean internos o externos, deben ser competentes y tener experiencia apropiada a la Clasificacion de Consecuencia y complejidad de la instalacion.',
      },
      {
        id: '9.2',
        principleId: 9,
        topicId: 'IV',
        texto:
          'Empower the EOR through a written agreement that clearly describes their authority, role and responsibilities throughout the tailings facility lifecycle, and during change of ownership of mining properties. The written agreement must clearly describe the obligations of the Operator to the EOR, to support the effective performance of the EOR.',
        textoEs:
          'Empoderar al EOR mediante un acuerdo escrito que describa claramente su autoridad, rol y responsabilidades a lo largo del ciclo de vida de la instalacion, y durante cambios de propiedad de los activos mineros. El acuerdo escrito debe describir claramente las obligaciones del Operador hacia el EOR, para respaldar el desempeno eficaz del EOR.',
      },
      {
        id: '9.3',
        principleId: 9,
        topicId: 'IV',
        texto:
          'Establish and implement a programme to manage the quality of all engineering work, the interactions between the EOR, the RTFE and the Accountable Executive, and their involvement in the tailings facility lifecycle as necessary to confirm that both the implementation of the design and the design intent are met.',
        textoEs:
          'Establecer e implementar un programa para gestionar la calidad de todo el trabajo de ingenieria, las interacciones entre el EOR, el RTFE y el Ejecutivo Responsable, y su participacion en el ciclo de vida de la instalacion segun sea necesario, a fin de confirmar que se cumplan tanto la implementacion del diseno como la intencion de diseno.',
      },
      {
        id: '9.4',
        principleId: 9,
        topicId: 'IV',
        texto:
          'Given its potential impact on the risks associated with a tailings facility, the selection of the EOR shall be decided by the Accountable Executive and informed, but not decided, by procurement personnel.',
        textoEs:
          'Dado su impacto potencial sobre los riesgos asociados a una instalacion de relaves, la seleccion del EOR debera ser decidida por el Ejecutivo Responsable, e informada -pero no decidida- por el personal de compras.',
      },
      {
        id: '9.5',
        principleId: 9,
        topicId: 'IV',
        texto:
          'Where it becomes necessary to change the EOR (whether a firm or an in-house employee), develop a detailed plan for the comprehensive transfer of data, information, knowledge and experience with the construction procedures and materials.',
        textoEs:
          'Cuando sea necesario cambiar de EOR (ya sea una firma o un empleado interno), desarrollar un plan detallado para la transferencia integral de datos, informacion, conocimiento y experiencia relacionados con los procedimientos de construccion y los materiales.',
      },
    ],
  },
  {
    id: 10,
    topicId: 'IV',
    titulo:
      'Establish and implement levels of review as part of a strong quality and risk management system for all phases of the tailings facility lifecycle, including closure.',
    tituloEs:
      'Establecer e implementar Niveles de Revision como parte de un sistema solido de gestion de calidad y riesgo para todas las fases del ciclo de vida de la instalacion de relaves, incluyendo el cierre.',
    requisitos: [
      {
        id: '10.1',
        principleId: 10,
        topicId: 'IV',
        texto:
          'Conduct and update risk assessments with a qualified multi-disciplinary team using best practice methodologies at a minimum every three years and more frequently whenever there is a material change either to the tailings facility or to the social, environmental and local economic context. Transmit risk assessments to the ITRB or senior independent technical reviewer for review, and address with urgency all unacceptable tailings facility risks.',
        textoEs:
          'Realizar y actualizar evaluaciones de riesgo con un equipo multidisciplinario calificado, utilizando metodologias de mejores practicas, como minimo cada tres anios y con mayor frecuencia cada vez que exista un cambio material en la instalacion de relaves o en el contexto social, ambiental y economico local. Transmitir las evaluaciones de riesgo a la ITRB o al revisor tecnico independiente senior para su revision, y abordar con urgencia todos los riesgos inaceptables de la instalacion de relaves.',
      },
      {
        id: '10.2',
        principleId: 10,
        topicId: 'IV',
        texto:
          "Conduct regular reviews of the TMS and of the components of the ESMS that refer to the tailings facility to assure the effectiveness of the management systems. Document and report the outcomes to the Accountable Executive, Board of Directors and project-affected people. The review shall be undertaken by senior technical reviewers with the appropriate qualifications, expertise and resources. For tailings facilities with 'High', 'Very High' or 'Extreme' Consequence Classification, conduct the review at least every three years.",
        textoEs:
          'Realizar revisiones periodicas del TMS y de los componentes del ESMS relacionados con la instalacion de relaves para asegurar la eficacia de los sistemas de gestion. Documentar y reportar los resultados al Ejecutivo Responsable, al Directorio y a las personas afectadas por el proyecto. La revision debera ser realizada por revisores tecnicos senior con la calificacion, experiencia y recursos apropiados. Para instalaciones con Clasificacion de Consecuencia High, Very High o Extreme, realizar la revision al menos cada tres anios.',
      },
      {
        id: '10.3',
        principleId: 10,
        topicId: 'IV',
        texto:
          'Conduct internal audits to verify consistent implementation of company procedures, guidelines and corporate governance requirements consistent with the TMS and aspects of the ESMS developed to manage tailings facility risks.',
        textoEs:
          'Realizar auditorias internas para verificar la implementacion consistente de los procedimientos, lineamientos y requisitos de gobernanza corporativa de la empresa, en consonancia con el TMS y los aspectos del ESMS desarrollados para gestionar los riesgos de la instalacion de relaves.',
      },
      {
        id: '10.4',
        principleId: 10,
        topicId: 'IV',
        texto:
          'The EOR or senior independent technical reviewer shall conduct tailings facility construction and performance reviews annually or more frequently, if required.',
        textoEs:
          'El EOR o el revisor tecnico independiente senior debera realizar revisiones de construccion y desempeno de la instalacion de relaves anualmente o con mayor frecuencia, si es necesario.',
      },
      {
        id: '10.5',
        principleId: 10,
        topicId: 'IV',
        texto:
          "Conduct an independent DSR at least every five years for tailings facilities with 'Very High' or 'Extreme' Consequence Classifications and at least every 10 years for all other facilities. For tailings facilities with complex conditions or performance, the ITRB may recommend more frequent DSRs. The DSR shall include technical, operational and governance aspects of the tailings facility and shall be completed according to best practices. The DSR contractor cannot conduct consecutive DSRs on the same tailings facility and shall certify in writing that they follow best practices for engineers in avoiding conflicts of interest.",
        textoEs:
          'Realizar una DSR independiente al menos cada cinco anios para instalaciones con Clasificacion de Consecuencia Very High o Extreme, y al menos cada 10 anios para el resto de las instalaciones. Para instalaciones con condiciones o desempeno complejos, la ITRB puede recomendar DSR mas frecuentes. La DSR debera incluir aspectos tecnicos, operativos y de gobernanza de la instalacion, y debera completarse conforme a las mejores practicas. El contratista de la DSR no puede realizar DSR consecutivas sobre la misma instalacion, y debera certificar por escrito que sigue las mejores practicas de ingenieria para evitar conflictos de interes.',
      },
      {
        id: '10.6',
        principleId: 10,
        topicId: 'IV',
        texto:
          "For tailings facilities with 'Very High' or 'Extreme' Consequence Classifications, the ITRB, reporting to the Accountable Executive shall provide ongoing senior independent review of the planning, siting, design, construction, operation, water and mass balance, maintenance, monitoring, performance and risk management at appropriate intervals across all phases of the tailings facility lifecycle. For tailings facilities with other Consequence Classifications, this review can be done by a senior independent technical reviewer.",
        textoEs:
          'Para instalaciones con Clasificacion de Consecuencia Very High o Extreme, la ITRB, reportando al Ejecutivo Responsable, debera proveer revision independiente senior continua de la planificacion, ubicacion, diseno, construccion, operacion, balance de agua y masa, mantenimiento, monitoreo, desempeno y gestion de riesgo, con intervalos apropiados a lo largo de todas las fases del ciclo de vida de la instalacion. Para instalaciones con otras Clasificaciones de Consecuencia, esta revision puede ser realizada por un revisor tecnico independiente senior.',
      },
      {
        id: '10.7',
        principleId: 10,
        topicId: 'IV',
        texto:
          'The amount of estimated costs for planned closure, early closure, reclamation, and post-closure of the tailings facility and its appurtenant structures shall be reviewed periodically to confirm that adequate financial capacity (including insurance, to the extent commercially reasonable) is available for such purposes throughout the tailings facility lifecycle, and the conclusions of the review shall be publicly disclosed annually. Disclosure may be made in audited financial statements or in public regulatory filings. Subject to the provisions of local or national regulations on this matter, Operators shall use best efforts to assess and take into account the capability of an acquirer of any of its assets involving a tailings facility (through merger, acquisition, or other change in ownership) to maintain this Standard for the tailings facility lifecycle.',
        textoEs:
          'El monto de los costos estimados para el cierre planificado, cierre anticipado, recuperacion y post-cierre de la instalacion de relaves y sus estructuras conexas debera revisarse periodicamente para confirmar que exista capacidad financiera adecuada (incluyendo seguros, en la medida comercialmente razonable) disponible para tales fines a lo largo del ciclo de vida de la instalacion, y las conclusiones de la revision deberan divulgarse publicamente cada anio. La divulgacion puede realizarse en estados financieros auditados o en presentaciones regulatorias publicas. Sujeto a las disposiciones de las regulaciones locales o nacionales sobre esta materia, los Operadores deberan hacer sus mejores esfuerzos para evaluar y tener en cuenta la capacidad de un adquirente de cualquiera de sus activos que involucre una instalacion de relaves (a traves de fusion, adquisicion u otro cambio de propiedad) para mantener este Estandar a lo largo del ciclo de vida de la instalacion.',
      },
    ],
  },
  {
    id: 11,
    topicId: 'IV',
    titulo:
      'Develop an organisational culture that promotes learning, communication and early problem recognition.',
    tituloEs:
      'Desarrollar una cultura organizacional que promueva el aprendizaje, la comunicacion y la deteccion temprana de problemas.',
    requisitos: [
      {
        id: '11.1',
        principleId: 11,
        topicId: 'IV',
        texto:
          'Educate personnel who have a role in any phase of the tailings facility lifecycle about how their job procedures and responsibilities relate to the prevention of a failure.',
        textoEs:
          'Educar al personal que desempene un rol en cualquier fase del ciclo de vida de la instalacion de relaves sobre como sus procedimientos de trabajo y responsabilidades se relacionan con la prevencion de una falla.',
      },
      {
        id: '11.2',
        principleId: 11,
        topicId: 'IV',
        texto:
          "Establish mechanisms that incorporate workers' experience-based knowledge into planning, design and operations for all phases of the tailings facility lifecycle.",
        textoEs:
          'Establecer mecanismos que incorporen el conocimiento basado en la experiencia de los trabajadores en la planificacion, el diseno y las operaciones, para todas las fases del ciclo de vida de la instalacion de relaves.',
      },
      {
        id: '11.3',
        principleId: 11,
        topicId: 'IV',
        texto:
          'Establish mechanisms that promote cross-functional collaboration to ensure effective data and knowledge sharing, communication and implementation of management measures to support public safety and the integrity of the tailings facility.',
        textoEs:
          'Establecer mecanismos que promuevan la colaboracion interfuncional para asegurar el intercambio eficaz de datos y conocimiento, la comunicacion y la implementacion de medidas de gestion que respalden la seguridad publica y la integridad de la instalacion de relaves.',
      },
      {
        id: '11.4',
        principleId: 11,
        topicId: 'IV',
        texto:
          'Identify and implement lessons from internal incident investigations and relevant external incident reports, paying particular attention to human and organisational factors.',
        textoEs:
          'Identificar e implementar lecciones aprendidas de investigaciones internas de incidentes y de reportes externos relevantes de incidentes, prestando especial atencion a los factores humanos y organizacionales.',
      },
      {
        id: '11.5',
        principleId: 11,
        topicId: 'IV',
        texto:
          'Establish mechanisms that recognise, reward and protect from retaliation, employees and contractors who report problems or identify opportunities for improving tailings facility management. Respond in a timely manner and communicate actions taken and their outcomes.',
        textoEs:
          'Establecer mecanismos que reconozcan, premien y protejan de represalias a los empleados y contratistas que reporten problemas o identifiquen oportunidades para mejorar la gestion de la instalacion de relaves. Responder de manera oportuna y comunicar las acciones tomadas y sus resultados.',
      },
    ],
  },
  {
    id: 12,
    topicId: 'IV',
    titulo:
      'Establish a process for reporting and addressing concerns and implement whistleblower protections.',
    requisitos: [
      {
        id: '12.1',
        principleId: 12,
        topicId: 'IV',
        texto:
          'The Accountable Executive shall establish a formal, confidential and written process to receive, investigate and promptly address concerns from employees and contractors about possible permit violations or other matters relating to regulatory compliance, public safety, tailings facility integrity or the environment.',
      },
      {
        id: '12.2',
        principleId: 12,
        topicId: 'IV',
        texto:
          'In accordance with international best practices for whistleblower protection, the Operator shall not discharge, discriminate against, or otherwise retaliate in any way against a whistleblower who, in good faith, has reported possible permit violations or other matters relating to regulatory compliance, public safety, tailings facility integrity or the environment.',
      },
    ],
  },
  {
    id: 13,
    topicId: 'V',
    titulo: 'Prepare for emergency response to tailings facility failures.',
    requisitos: [
      {
        id: '13.1',
        principleId: 13,
        topicId: 'V',
        texto:
          'As part of the TMS, use best practices and emergency response expertise to prepare and implement a site-specific tailings facility Emergency Preparedness and Response Plan (EPRP) based on credible flow failure scenarios and the assessment of potential consequences. Test and update the EPRP at all phases of the tailings facility lifecycle at a frequency established in the plan, or more frequently if triggered by a material change either to the tailings facility or to the social, environmental and local economic context. Meaningfully engage with employees and contractors to inform the EPRP, and co-develop community-focused emergency preparedness measures with project-affected people.',
      },
      {
        id: '13.2',
        principleId: 13,
        topicId: 'V',
        texto:
          'Engage with public sector agencies, first responders, local authorities and institutions and take reasonable steps to assess the capability of emergency response services to address the hazards identified in the tailings facility EPRP, identify gaps in capability and use this information to support the development of a collaborative plan to improve preparedness.',
      },
      {
        id: '13.3',
        principleId: 13,
        topicId: 'V',
        texto:
          'Considering community-focused measures and public sector capacity, the Operator shall take all reasonable steps to maintain a shared state of readiness for tailings facility credible flow failure scenarios by securing resources and carrying out annual training and exercises. The Operator shall conduct emergency response simulations at a frequency established in the EPRP but at least every 3 years for tailings facilities with potential loss of life.',
      },
      {
        id: '13.4',
        principleId: 13,
        topicId: 'V',
        texto:
          'In the case of a catastrophic tailings facility failure, provide immediate response to save lives, supply humanitarian aid and minimise environmental harm.',
      },
    ],
  },
  {
    id: 14,
    topicId: 'V',
    titulo: 'Prepare for long-term recovery in the event of catastrophic failure.',
    requisitos: [
      {
        id: '14.1',
        principleId: 14,
        topicId: 'V',
        texto:
          'Based on tailings facility credible flow failure scenarios and the assessment of potential consequences, take reasonable steps to meaningfully engage with public sector agencies and other organisations that would participate in medium- and long-term social and environmental post-failure response strategies.',
      },
      {
        id: '14.2',
        principleId: 14,
        topicId: 'V',
        texto:
          'In the event of a catastrophic tailings facility failure, assess social, environmental and local economic impacts as soon as possible after people are safe and short-term survival needs have been met.',
      },
      {
        id: '14.3',
        principleId: 14,
        topicId: 'V',
        texto:
          'In the event of a catastrophic tailings facility failure, work with public sector agencies and other stakeholders to develop and implement reconstruction, restoration and recovery plans that address the medium- and long-term social, environmental and local economic impacts of the failure. The plans shall be disclosed if permitted by public authorities.',
      },
      {
        id: '14.4',
        principleId: 14,
        topicId: 'V',
        texto:
          'In the event of a catastrophic tailings facility failure, enable the participation of affected people in reconstruction, restoration and recovery works and ongoing monitoring activities.',
      },
      {
        id: '14.5',
        principleId: 14,
        topicId: 'V',
        texto:
          'Facilitate the monitoring and public reporting of post-failure outcomes that are aligned with the thresholds and indicators outlined in the reconstruction, restoration and recovery plans and adapt activities in response to findings and feedback.',
      },
    ],
  },
  {
    id: 15,
    topicId: 'VI',
    titulo:
      'Publicly disclose and provide access to information about the tailings facility to support public accountability.',
    requisitos: [
      {
        id: '15.1',
        principleId: 15,
        topicId: 'VI',
        texto:
          "Publish and regularly update information on the Operator's commitment to safe tailings facility management, implementation of its tailings governance framework, its organisation-wide policies, standards or approaches to the design, construction, monitoring and closure of tailings facilities. A. For new tailings facilities for which the regulatory authorisation process has commenced, or that are otherwise approved by the Operator, the Operator shall publish and update, in accordance with Principle 21 of the UNGP, the following information: 1. A plain language summary of the rationale for the basis of the design and site selected as per the multi-criteria alternatives analysis, impact assessments, and mitigation plans (Information may be obtained from the output of multiple Requirements including, but not limited to, Requirements 3.2, 3.3, 5.1, 5.3, 6.4, 6.6, 7.1 and 10.1); and 2. The Consequence Classification. (Requirement 4.1). B. For each existing tailings facility and in accordance with Principle 21 of the UNGP, the Operator shall publish and update at least on an annual basis, the following information: 1. A description of the tailings facility (information may be obtained from the output of Requirements 5.5 and 6.4); 2. The Consequence Classification (Requirement 4.1); 3. A summary of risk assessment findings relevant to the tailings facility (Information may be obtained from the output of Requirement 10.1); 4. A summary of impact assessments and of human exposure and vulnerability to tailings facility credible flow failure scenarios (Information may be obtained from the output of Requirements 2.4 and 3.3); 5. A description of the design for all phases of the tailings facility lifecycle including the current and final height (Information may be obtained from the output of Requirement 5.5); 6. A summary of material findings of annual performance reviews and DSR, including implementation of mitigation measures to reduce risk to ALARP (Information may be obtained from output of Requirements 10.4 and 10.5); 7. A summary of material findings of the environmental and social monitoring programme including implementation of mitigation measures (Requirement 7.5); 8. A summary version of the tailings facility EPRP for facilities that have a credible failure mode(s) that could lead to a flow failure event that: (i) is informed by credible flow failure scenarios from the tailings facility breach analysis; (ii) includes emergency response measures that apply to project affected people as identified through the tailings facility breach analysis and involve cooperation with public sector agencies; and (iii) excludes details of emergency preparedness measures that apply to the Operator's assets, or confidential information (Requirements 13.1 and 13.2); 9. Dates of most recent and next independent reviews (Requirement 10.5); and 10. Annual confirmation that the Operator has adequate financial capacity (including insurance to the extent commercially reasonable) to cover estimated costs of planned closure, early closure, reclamation, and post-closure of the tailings facility and its appurtenant structures (Requirement 10.7). Such disclosures shall be made directly, unless subject to limitations imposed by regulatory authorities. C. Provide local authorities and emergency services with sufficient information derived from the breach analysis to enable effective disaster management planning (Information may be obtained from the output of Requirement 2.3).",
      },
      {
        id: '15.2',
        principleId: 15,
        topicId: 'VI',
        texto:
          'Respond in a systematic and timely manner to requests from interested and affected stakeholders for additional information material to the public safety and integrity of a tailings facility. When the request for information is denied, provide an explanation to the requesting stakeholder.',
      },
      {
        id: '15.3',
        principleId: 15,
        topicId: 'VI',
        texto:
          'Commit to cooperate in credible global transparency initiatives to create standardised, independent, industry-wide and publicly accessible databases, inventories or other information repositories about the safety and integrity of tailings facilities.',
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// ANNEX 2 — Consequence Classification Tables (GISTM agosto 2020, páginas 34-36)
// ═══════════════════════════════════════════════════════════════

export interface NivelConsecuencia {
  id: 'low' | 'significant' | 'high' | 'very_high' | 'extreme';
  nombre: string;
  poblacionRiesgo: string;
  perdidaVidas: string;
}

// Tabla 1: Consequence Classification Matrix (página 34)
export const TABLA_CLASIFICACION_CONSECUENCIA: NivelConsecuencia[] = [
  { id: 'low', nombre: 'Low', poblacionRiesgo: 'None', perdidaVidas: 'None expected' },
  { id: 'significant', nombre: 'Significant', poblacionRiesgo: '1-10', perdidaVidas: 'Unspecified' },
  { id: 'high', nombre: 'High', poblacionRiesgo: '10-100', perdidaVidas: 'Possible (1-10)' },
  { id: 'very_high', nombre: 'Very High', poblacionRiesgo: '100-1,000', perdidaVidas: 'Likely (10-100)' },
  { id: 'extreme', nombre: 'Extreme', poblacionRiesgo: '>1,000', perdidaVidas: 'Many (>100)' },
];

export interface CriterioProbabilidad {
  nombre: string;
  probabilidadOperacion: string;
  probabilidadCierrePasivo: string;
}

// Tabla 2: Flood Design Criteria — Annual Exceedance Probability (página 36)
export const CRITERIO_CRECIDA: CriterioProbabilidad[] = [
  { nombre: 'Low', probabilidadOperacion: '1/200', probabilidadCierrePasivo: '1/10,000' },
  { nombre: 'Significant', probabilidadOperacion: '1/1,000', probabilidadCierrePasivo: '1/10,000' },
  { nombre: 'High', probabilidadOperacion: '1/2,475', probabilidadCierrePasivo: '1/10,000' },
  { nombre: 'Very High', probabilidadOperacion: '1/5,000', probabilidadCierrePasivo: '1/10,000' },
  { nombre: 'Extreme', probabilidadOperacion: '1/10,000', probabilidadCierrePasivo: '1/10,000' },
];

// Tabla 3: Seismic Design Criteria — Annual Exceedance Probability (página 36, mismos valores que Tabla 2)
export const CRITERIO_SISMICO: CriterioProbabilidad[] = [
  { nombre: 'Low', probabilidadOperacion: '1/200', probabilidadCierrePasivo: '1/10,000' },
  { nombre: 'Significant', probabilidadOperacion: '1/1,000', probabilidadCierrePasivo: '1/10,000' },
  { nombre: 'High', probabilidadOperacion: '1/2,475', probabilidadCierrePasivo: '1/10,000' },
  { nombre: 'Very High', probabilidadOperacion: '1/5,000', probabilidadCierrePasivo: '1/10,000' },
  { nombre: 'Extreme', probabilidadOperacion: '1/10,000', probabilidadCierrePasivo: '1/10,000' },
];

const ORDEN_NIVELES = ['low', 'significant', 'high', 'very_high', 'extreme'] as const;

// Bins numéricos derivados de Tabla 1. El documento tiene límites superpuestos
// entre bandas (p. ej. "1-10" y "10-100" comparten el 10); el valor límite se
// asigna a la banda de menor severidad para no sobreclasificar.
function nivelPorPoblacion(poblacionRiesgo: number): typeof ORDEN_NIVELES[number] {
  if (poblacionRiesgo <= 0) return 'low';
  if (poblacionRiesgo <= 10) return 'significant';
  if (poblacionRiesgo <= 100) return 'high';
  if (poblacionRiesgo <= 1000) return 'very_high';
  return 'extreme';
}

// 'Significant' no tiene rango numérico de pérdida de vidas definido en la
// norma (columna "Unspecified"), por lo que ese nivel solo puede alcanzarse
// por el criterio de población en riesgo.
function nivelPorPerdidaVidas(perdidaVidasPotencial: number): typeof ORDEN_NIVELES[number] {
  if (perdidaVidasPotencial <= 0) return 'low';
  if (perdidaVidasPotencial <= 10) return 'high';
  if (perdidaVidasPotencial <= 100) return 'very_high';
  return 'extreme';
}

// Clasifica según Tabla 1, tomando "the classification corresponding to the
// highest Consequence Classification for each category" (Requirement 4.1).
export function clasificarConsecuencia(
  poblacionRiesgo: number,
  perdidaVidasPotencial: number,
): NivelConsecuencia {
  const nivelPob = nivelPorPoblacion(poblacionRiesgo);
  const nivelPerdidas = nivelPorPerdidaVidas(perdidaVidasPotencial);
  const idFinal =
    ORDEN_NIVELES[Math.max(ORDEN_NIVELES.indexOf(nivelPob), ORDEN_NIVELES.indexOf(nivelPerdidas))];
  return TABLA_CLASIFICACION_CONSECUENCIA.find(n => n.id === idFinal)!;
}
