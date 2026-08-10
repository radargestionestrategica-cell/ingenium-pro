import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth'
import { signHash } from '@/lib/cripto'

// tipo real de cálculo -> moduloId canónico del dashboard
// (misma agrupación que ya existe como comentarios en components/BotonesExportar.tsx DXF_MAP)
const TIPO_A_MODULO: Record<string, string> = {
  MAOP: 'petroleo',
  PERFORACION: 'perforacion',
  DARCY_WEISBACH: 'hidraulica', GOLPE_ARIETE: 'hidraulica',
  CANERIAS_ESPESOR: 'canerias', CANERIAS_HOOP: 'canerias', CANERIAS_ARIETE: 'canerias',
  CANERIAS_CIERRE: 'canerias', CANERIAS_REMANENTE: 'canerias',
  ELECTRICIDAD_CABLE: 'electricidad', ELECTRICIDAD_CAIDA_TENSION: 'electricidad',
  ELECTRICIDAD_CORTOCIRCUITO: 'electricidad', ELECTRICIDAD_FACTOR_POTENCIA: 'electricidad',
  ELECTRICIDAD_MOTOR: 'electricidad', ELECTRICIDAD_ILUMINACION: 'electricidad',
  ELECTRICIDAD_AREA_PELIGROSA: 'electricidad', ELECTRICIDAD_TRANSFORMADOR: 'electricidad',
  CAPACIDAD_PORTANTE: 'geotecnia', ESTABILIDAD_TALUD: 'geotecnia',
  SELECTOR_SOLDADURA: 'soldadura', HEAT_INPUT: 'soldadura', FILETE_SOLDADURA: 'soldadura',
  CONSUMO_ELECTRODOS: 'soldadura', PRECALENTAMIENTO: 'soldadura',
  HORMIGON_MMO: 'mmo', HIERRO_MMO: 'mmo', MAMPOSTERIA_MMO: 'mmo', LOSA_MMO: 'mmo',
  REVOQUE_MMO: 'mmo', CERAMICO_MMO: 'mmo', CONTRAPISO_MMO: 'mmo', ZAPATA_MMO: 'mmo',
  EXCAVACION_MMO: 'mmo', MORTERO_MMO: 'mmo', RENDIMIENTO_MMO: 'mmo',
  VALVULAS_CLASE_B16_34: 'valvulas', VALVULAS_MATERIAL_NACE: 'valvulas',
  VALVULAS_BRIDA_B16_5: 'valvulas', VALVULAS_DISENO_BOLA: 'valvulas',
  VALVULAS_DISENO_MARIPOSA: 'valvulas', VALVULAS_DISENO_RETENCION: 'valvulas',
  VALVULAS_DISENO_TAPON: 'valvulas', VALVULAS_DISENO_GLOBO: 'valvulas',
  VALVULAS_COEFICIENTE_CV: 'valvulas',
  VIGA_ACERO_AISC: 'civil', COLUMNA_HORMIGON_ACI: 'civil',
  PAVIMENTO_AASHTO93: 'vialidad', DRENAJE_VIAL_HEC22: 'vialidad',
  VERTEDERO_FRANCIS: 'represas', FILTRACION_DARCY: 'represas',
  RMR_BIENIAWSKI: 'mineria', VENTILACION_SUBTERRANEA: 'mineria',
  DILATACION_TERMICA: 'termica', INTERCAMBIADOR_LMTD: 'termica',
  ARQUITECTURA_VIENTO: 'arquitectura', ARQUITECTURA_SISMO: 'arquitectura',
  ARQUITECTURA_ILUMINACION: 'arquitectura',
}

export async function POST(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();
  try {
    const b = await req.json()
    if (!b.tipo||!b.parametros||!b.resultado)
      return NextResponse.json({ok:false,error:'tipo, parametros y resultado son obligatorios'},{status:400})

    // Planes de módulo único/dúo: solo pueden guardar cálculos de los módulos que eligieron
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { plan: true, modulosElegidos: true },
    })
    if (usuario && (usuario.plan === 'modulo' || usuario.plan === 'duo')) {
      const moduloReal = TIPO_A_MODULO[b.tipo] ?? b.moduloId ?? b.tipo
      if (!usuario.modulosElegidos.includes(moduloReal)) {
        return NextResponse.json({ok:false,error:'Este módulo no está incluido en tu plan actual.'},{status:403})
      }
    }

    const hash=createHash('sha256').update(JSON.stringify({tipo:b.tipo,p:b.parametros,r:b.resultado})).digest('hex')
    const firma=signHash(hash)
    const data={
      tipo:b.tipo,moduloId:b.moduloId??null,submodulo:b.submodulo??null,
      activoNombre:b.activoNombre??null,parametros:b.parametros,resultado:b.resultado,
      normativa:b.normativa??null,hash,firma,alerta:b.alerta??false,
      alertaMsg:b.alertaMsg??null,nivel:b.nivel??null,usuario:b.usuario??'anonimo',
      usuarioId:payload.id,proyectoId:b.proyectoId??null}
    const c=await prisma.calculo.upsert({where:{hash},create:data,update:{usuarioId:payload.id}})
    return NextResponse.json({ok:true,id:c.id,hash})
  } catch(e){
    return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Error interno'},{status:500})
  }
}
