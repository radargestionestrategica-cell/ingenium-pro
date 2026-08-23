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
];
