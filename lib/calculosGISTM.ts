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
      'Respetar los derechos de las personas afectadas por el proyecto y comprometerlas de forma significativa en todas las fases del ciclo de vida del depósito de relaves, incluido el cierre',
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
];
