export const DICCIONARIO = {
    es: {
        SUBTITULO: "El Estándar de Ingeniería Inigualable",
        ID_PROCESO: "ID Proceso",
        COSTO_ESTIMADO: "Costo Estimado USD",
        ENTRADA_DATOS: "Entrada de Datos Críticos",
        PLACEHOLDER: "Ingrese parámetros técnicos para validación...",
        BOTON_EJECUTAR: "Sincronizar Matriz Global",
        TITULO_CERTIFICADO: "Certificado de Interferencia",
        VALIDACION_EXITOSA: "Validación Mundial Exitosa",
        ORIGEN: "NEUQUÉN - GLOBAL",
        TEXTO_BASE: "Esperando ingreso de datos para validación física..."
    },
    en: {
        SUBTITULO: "The Unrivaled Engineering Standard",
        ID_PROCESO: "Process ID",
        COSTO_ESTIMADO: "Estimated Cost USD",
        ENTRADA_DATOS: "Critical Data Input",
        PLACEHOLDER: "Enter technical parameters for validation...",
        BOTON_EJECUTAR: "Synchronize Global Matrix",
        TITULO_CERTIFICADO: "Interference Certificate",
        VALIDACION_EXITOSA: "Successful Global Validation",
        ORIGEN: "NEUQUEN - GLOBAL",
        TEXTO_BASE: "Awaiting data input for physical validation..."
    },
    pt: { // PORTUGUÉS (Mercado Brasil / Petrobras)
        SUBTITULO: "O Padrão de Engenharia Inigualável",
        ID_PROCESO: "ID do Processo",
        COSTO_ESTIMADO: "Custo Estimado USD",
        ENTRADA_DATOS: "Entrada de Dados Críticos",
        PLACEHOLDER: "Insira parâmetros técnicos para validação...",
        BOTON_EJECUTAR: "Sincronizar Matriz Global",
        TITULO_CERTIFICADO: "Certificado de Interferência",
        VALIDACION_EXITOSA: "Validação Mundial de Sucesso",
        ORIGEN: "NEUQUÉN - GLOBAL",
        TEXTO_BASE: "Aguardando entrada de dados para validação física..."
    },
    zh: { // CHINO (Gigantes de Infraestructura)
        SUBTITULO: "无与伦比 des 工程标准",
        ID_PROCESO: "过程 ID",
        COSTO_ESTIMADO: "预估成本 USD",
        ENTRADA_DATOS: "关键数据输入",
        PLACEHOLDER: "输入技术参数进行验证...",
        BOTON_EJECUTAR: "同步全球矩阵",
        TITULO_CERTIFICADO: "干扰证书",
        VALIDACION_EXITOSA: "全球验证成功",
        ORIGEN: "内乌肯 - 全球",
        TEXTO_BASE: "等待物理验证的数据输入..."
    }
};

export type IdiomaKey = keyof typeof DICCIONARIO;