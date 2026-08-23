// GISTM — Global Industry Standard on Tailings Management (ICMM / UNEP / PRI, August 2020)
// Fuente: https://globaltailingsreview.org/wp-content/uploads/2020/08/global-industry-standard-on-tailings-management.pdf
// Texto de Requisitos citado verbatim en inglés (idioma original del documento).

export interface Requisito {
  id: string;
  principleId: number;
  topicId: string;
  texto: string;
  rolResponsable?: string[];
}

export interface Principle {
  id: number;
  topicId: string;
  titulo: string;
  requisitos: Requisito[];
}

export const PRINCIPLES_GISTM: Principle[] = [
  {
    id: 1,
    topicId: 'I',
    titulo:
      'Respect the rights of project-affected people and meaningfully engage them at all phases of the tailings facility lifecycle, including closure.',
    requisitos: [
      {
        id: '1.1',
        principleId: 1,
        topicId: 'I',
        texto:
          'Demonstrate respect for human rights in accordance with the United Nations Guiding Principles on Business and Human Rights (UNGP), conduct human rights due diligence to inform management decisions throughout the tailings facility lifecycle and address the human rights risks of tailings facility credible failure scenarios. For existing facilities, the Operator can initially opt to prioritise salient human rights issues in accordance with the UNGP.',
      },
      {
        id: '1.2',
        principleId: 1,
        topicId: 'I',
        texto:
          'Where a new tailings facility may impact the rights of indigenous or tribal peoples, including their land and resource rights and their right to self-determination, work to obtain and maintain Free Prior and Informed Consent (FPIC) by demonstrating conformance to international guidance and recognised best practice frameworks.',
      },
      {
        id: '1.3',
        principleId: 1,
        topicId: 'I',
        texto:
          'Demonstrate that project-affected people are meaningfully engaged throughout the tailings facility lifecycle in building the knowledge base and in decisions that may have a bearing on public safety and the integrity of the tailings facility. The Operator shall share information to support this process.',
      },
      {
        id: '1.4',
        principleId: 1,
        topicId: 'I',
        texto:
          'Establish an effective operational-level, non-judicial grievance mechanism that addresses complaints and grievances of project-affected people relating to the tailings facility, and provide remedy in accordance with the UNGP.',
      },
    ],
  },
  {
    id: 2,
    topicId: 'II',
    titulo:
      'Develop and maintain an interdisciplinary knowledge base to support safe tailings management throughout the tailings facility lifecycle, including closure.',
    requisitos: [
      {
        id: '2.1',
        principleId: 2,
        topicId: 'II',
        texto:
          'Develop and document knowledge about the social, environmental and local economic context of the tailings facility, using approaches aligned with international best practices. Update this knowledge at least every five years, and whenever there is a material change either to the tailings facility or to the social, environmental and local economic context. This knowledge should capture uncertainties due to climate change.',
      },
      {
        id: '2.2',
        principleId: 2,
        topicId: 'II',
        texto:
          'Prepare, document and update a detailed site characterisation of the tailings facility site(s) that includes data on climate, geomorphology, geology, geochemistry, hydrology and hydrogeology (surface and groundwater flow and quality), geotechnical, and seismicity. The physical and chemical properties of the tailings shall be characterised and updated regularly to account for variability in ore properties and processing.',
      },
      {
        id: '2.3',
        principleId: 2,
        topicId: 'II',
        texto:
          "Develop and document a breach analysis for the tailings facility using a methodology that considers credible failure modes, site conditions, and the properties of the slurry. The results of the analysis shall estimate the physical area impacted by a potential failure. When flowable materials (water and liquefiable solids) are present at tailings facilities with Consequence Classification of 'High', 'Very High' or 'Extreme', the results should include estimates of the physical area impacted by a potential failure, flow arrival times, depth and velocities, and depth of material deposition. Update whenever there is a material change either to the tailings facility or the physical area impacted.",
      },
      {
        id: '2.4',
        principleId: 2,
        topicId: 'II',
        texto:
          'In order to identify the groups most at risk, refer to the updated tailings facility breach analysis to assess and document potential human exposure and vulnerability to tailings facility credible failure scenarios. Update the assessment whenever there is a material change either to the tailings facility or to the knowledge base.',
      },
    ],
  },
  {
    id: 3,
    topicId: 'II',
    titulo:
      'Use all elements of the knowledge base - social, environmental, local economic and technical - to inform decisions throughout the tailings facility lifecycle, including closure.',
    requisitos: [
      {
        id: '3.1',
        principleId: 3,
        topicId: 'II',
        texto:
          'To enhance resilience to climate change, evaluate, regularly update and use climate change knowledge throughout the tailings facility lifecycle in accordance with the principles of Adaptive Management.',
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
    requisitos: [
      {
        id: '4.1',
        principleId: 4,
        topicId: 'III',
        texto:
          'Determine the consequence of failure classification of the tailings facility by assessing the downstream conditions documented in the knowledge base and selecting the classification corresponding to the highest Consequence Classification for each category in Annex 2, Table 1. The assessment and selection of the classification shall be based on credible failure modes, and shall be defensible and documented.',
      },
      {
        id: '4.2',
        principleId: 4,
        topicId: 'III',
        texto:
          "With the objective of maintaining flexibility in the development of a new tailings facility and optimising costs while prioritising safety throughout the tailings facility lifecycle: A. Develop preliminary designs for the tailings facility with external loading design criteria consistent with both the consequence of failure classification selected based on current conditions and higher Consequence Classifications (including 'Extreme'). B. Informed by the range of requirements defined by the preliminary designs, either: 1. Implement the design for the 'Extreme' Consequence Classification external loading criteria; or 2. Implement the design for the current Consequence Classification criteria, or a higher one, and demonstrate that the feasibility, at a proof of concept level, to upgrade to the design for the 'Extreme' classification criteria is maintained throughout the tailings facility lifecycle. C. If option B.2 is implemented, review the consequence of failure classification at the time of the Dam Safety Review (DSR) and at least every five years, or sooner if there is a material change in the social, environmental and local economic context, and complete the upgrade of the tailings facility to the new Consequence Classification as determined by the DSR within three years. This review shall proceed until the tailings facility has been safely closed according to this Standard. D. The process described above shall be reviewed by the Independent Tailings Review Board (ITRB) or the senior independent technical reviewer, as appropriate for the tailings facility Consequence Classification. Subject to Requirement 4.7, Requirements 4.2.C and 4.2.D shall also apply to existing tailings facilities.",
      },
      {
        id: '4.3',
        principleId: 4,
        topicId: 'III',
        texto:
          'The Accountable Executive shall take the decision to adopt a design for the current Consequence Classification criteria and to maintain flexibility to upgrade the design for the highest classification criteria later in the tailings facility lifecycle. This decision shall be documented.',
      },
      {
        id: '4.4',
        principleId: 4,
        topicId: 'III',
        texto:
          'Select, explicitly identify and document all design criteria that are appropriate to minimise risk for all credible failure modes for all phases of the tailings facility lifecycle.',
      },
      {
        id: '4.5',
        principleId: 4,
        topicId: 'III',
        texto:
          'Apply design criteria, such as factors of safety for slope stability and seepage management, that consider estimated operational properties of materials and expected performance of design elements, and quality of the implementation of risk management systems. These issues should also be appropriately accounted for in designs based on deformation analyses.',
      },
      {
        id: '4.6',
        principleId: 4,
        topicId: 'III',
        texto:
          'Identify and address brittle failure modes with conservative design criteria, independent of trigger mechanisms, to minimise their impact on the performance of the tailings facility.',
      },
      {
        id: '4.7',
        principleId: 4,
        topicId: 'III',
        texto:
          'Existing tailings facilities shall conform with the Requirements under Principle 4, except for those aspects where the Engineer of Record (EOR), with review by the ITRB or a senior independent technical reviewer, determines that the upgrade of an existing tailings facility is not viable or cannot be retroactively applied. In this case, the Accountable Executive shall approve and document the implementation of measures to reduce both the probability and the consequences of a tailings facility failure in order to reduce the risk to a level as low as reasonably practicable (ALARP). The basis and timing for addressing the upgrade of existing tailings facilities shall be risk-informed and carried out as soon as reasonably practicable.',
      },
      {
        id: '4.8',
        principleId: 4,
        topicId: 'III',
        texto:
          'The EOR shall prepare a Design Basis Report (DBR) that details the design assumptions and criteria, including operating constraints, and that provides the basis for the design of all phases of the tailings facility lifecycle. The DBR shall be reviewed by the ITRB or senior independent technical reviewer. The EOR shall update the DBR every time there is a material change in the design assumptions, design criteria, design or the knowledge base and confirm internal consistency among these elements.',
      },
    ],
  },
  {
    id: 5,
    topicId: 'III',
    titulo:
      'Develop a robust design that integrates the knowledge base and minimises the risk of failure to people and the environment for all phases of the tailings facility lifecycle, including closure and post-closure.',
    requisitos: [
      {
        id: '5.1',
        principleId: 5,
        topicId: 'III',
        texto:
          'For new tailings facilities, incorporate the outcome of the multi-criteria alternatives analysis including the use of tailings technologies in the design of the tailings facility. For expansions to existing tailings facilities, investigate the potential to refine the tailings technologies and design approaches with the goal of minimising risks to people and the environment throughout the tailings facility lifecycle.',
      },
      {
        id: '5.2',
        principleId: 5,
        topicId: 'III',
        texto:
          'Develop a robust design that considers the technical, social, environmental and local economic context, the tailings facility Consequence Classification, site conditions, water management, mine plant operations, tailings operational and construction issues, and that demonstrates the feasibility of safe closure of the tailings facility. The design should be reviewed and updated as performance and site data become available and in response to material changes to the tailings facility or its performance.',
      },
      {
        id: '5.3',
        principleId: 5,
        topicId: 'III',
        texto:
          'Develop, implement and maintain a water balance model and associated water management plans for the tailings facility, taking into account the knowledge base including climate change, upstream and downstream hydrological and hydrogeological basins, the mine site, mine planning and overall operations and the integrity of the tailings facility throughout its lifecycle. The water management programme must be designed to protect against unintentional releases.',
      },
      {
        id: '5.4',
        principleId: 5,
        topicId: 'III',
        texto:
          'Address all potential failure modes of the structure, its foundation, abutments, reservoir (tailings deposit and pond), reservoir rim and appurtenant structures to minimise risk to ALARP. Risk assessments must be used to inform the design.',
      },
      {
        id: '5.5',
        principleId: 5,
        topicId: 'III',
        texto:
          'Develop a design for each stage of construction of the tailings facility, including but not limited to start-up, partial raises and interim configurations, final raise, and all closure stages.',
      },
      {
        id: '5.6',
        principleId: 5,
        topicId: 'III',
        texto:
          'Design the closure phase in a manner that meets all the Requirements of the Standard with sufficient detail to demonstrate the feasibility of the closure scenario and to allow implementation of elements of the design during construction and operation as appropriate. The design should include progressive closure and reclamation during operations.',
      },
      {
        id: '5.7',
        principleId: 5,
        topicId: 'III',
        texto:
          "For a proposed new tailings facility classified as 'High', 'Very High' or 'Extreme', the Accountable Executive shall confirm that the design satisfies ALARP and shall approve additional reasonable steps that may be taken downstream, to further reduce potential consequences to people and the environment. The Accountable Executive shall explain and document the decisions with respect to ALARP and additional consequence reduction measures. For an existing tailings facility classified as 'High', 'Very High' or 'Extreme', the Accountable Executive, at the time of every DSR or at least every five years, shall confirm that the design satisfies ALARP and shall seek to identify and implement additional reasonable steps that may be taken to further reduce potential consequences to people and the environment. The Accountable Executive shall explain and document the decisions with respect to ALARP and additional consequence reduction measures, in consultation with external parties as appropriate.",
      },
      {
        id: '5.8',
        principleId: 5,
        topicId: 'III',
        texto:
          'Where other measures to reduce the consequences of a tailings facility credible failure mode as per the breach analysis have been exhausted, and pre-emptive resettlement cannot be avoided, the Operator shall demonstrate conformance with international standards for involuntary resettlement.',
      },
    ],
  },
  {
    id: 6,
    topicId: 'III',
    titulo:
      'Plan, build and operate the tailings facility to manage risk at all phases of the tailings facility lifecycle, including closure and post-closure.',
    requisitos: [
      {
        id: '6.1',
        principleId: 6,
        topicId: 'III',
        texto:
          'Build, operate, monitor and close the tailings facility according to the design intent at all phases of the tailings facility lifecycle, using qualified personnel and appropriate methodology, equipment and procedures, data acquisition methods, the Tailings Management System (TMS) and the overall Environmental and Social Management System (ESMS) for the mine and associated infrastructure.',
      },
      {
        id: '6.2',
        principleId: 6,
        topicId: 'III',
        texto:
          'Manage the quality and adequacy of the construction and operation process by implementing Quality Control, Quality Assurance and Construction vs Design Intent Verification (CDIV). The Operator shall use the CDIV to ensure that the design intent is implemented and is still being met if the site conditions vary from the design assumptions.',
      },
      {
        id: '6.3',
        principleId: 6,
        topicId: 'III',
        texto:
          "Prepare a detailed Construction Records Report ('as-built' report) whenever there is a material change to the tailings facility, its infrastructure or its monitoring system. The EOR and the Responsible Tailings Facility Engineer (RTFE) shall sign this report.",
      },
      {
        id: '6.4',
        principleId: 6,
        topicId: 'III',
        texto:
          'Develop, implement, review annually and update as required an Operations, Maintenance and Surveillance (OMS) Manual that supports effective risk management as part of the TMS. The OMS Manual should follow best practices, clearly provide the context and critical controls for safe operations, and be reviewed for effectiveness. The RTFE shall provide access to the OMS Manual and training to all levels of personnel involved in the TMS with support from the EOR.',
      },
      {
        id: '6.5',
        principleId: 6,
        topicId: 'III',
        texto:
          'Implement a formal change management system that triggers the evaluation, review, approval and documentation of changes to design, construction, operation or monitoring during the tailings facility lifecycle. The change management system shall also include the requirement for the EOR to prepare a periodic Deviance Accountability Report (DAR), that provides an assessment of the cumulative impact of the changes on the risk level of the as-constructed facility. The DAR shall provide recommendations for managing risk, if necessary, and any resulting updates to the design, DBR, OMS and the monitoring programme. The DAR shall be approved by the Accountable Executive.',
      },
      {
        id: '6.6',
        principleId: 6,
        topicId: 'III',
        texto:
          'Include new and emerging technologies and approaches and use the evolving knowledge in the refinement of the design, construction and operation of the tailings facility.',
      },
    ],
  },
  {
    id: 7,
    topicId: 'III',
    titulo:
      'Design, implement and operate monitoring systems to manage risk at all phases of the facility lifecycle, including closure.',
    requisitos: [
      {
        id: '7.1',
        principleId: 7,
        topicId: 'III',
        texto:
          'Design, implement and operate a comprehensive and integrated performance monitoring programme for the tailings facility and its appurtenant structures as part of the TMS and for those aspects of the ESMS related to the tailings facility in accordance with the principles of Adaptive Management.',
      },
      {
        id: '7.2',
        principleId: 7,
        topicId: 'III',
        texto:
          'Design, implement and operate a comprehensive and integrated engineering monitoring system that is appropriate for verifying design assumptions and for monitoring potential failure modes. Full implementation of the Observational Method shall be adopted for non-brittle failure modes. Brittle failure modes are addressed by conservative design criteria.',
      },
      {
        id: '7.3',
        principleId: 7,
        topicId: 'III',
        texto:
          'Establish specific and measurable performance objectives, indicators, criteria, and performance parameters and include them in the design of the monitoring programmes that measure performance throughout the tailings facility lifecycle. Record and evaluate the data at appropriate frequencies. Based on the data obtained, update the monitoring programmes throughout the tailings facility lifecycle to confirm that they remain effective to manage risk.',
      },
      {
        id: '7.4',
        principleId: 7,
        topicId: 'III',
        texto:
          'Analyse technical monitoring data at the frequency recommended by the EOR, and assess the performance of the tailings facility, clearly identifying and presenting evidence on any deviations from the expected performance and any deterioration of the performance over time. Promptly submit evidence to the EOR for review and update the risk assessment and design, if required. Performance outside the expected ranges shall be addressed promptly through Trigger Action Response Plans (TARPs) or critical controls.',
      },
      {
        id: '7.5',
        principleId: 7,
        topicId: 'III',
        texto:
          'Report the results of each of the monitoring programmes at the frequency required to meet company and regulatory requirements and, at a minimum, on an annual basis. The RTFE and the EOR shall review and approve the technical monitoring reports.',
      },
    ],
  },
];
