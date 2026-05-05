import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    if (!b.tipo||!b.parametros||!b.resultado)
      return NextResponse.json({ok:false,error:'tipo, parametros y resultado son obligatorios'},{status:400})
    const hash=createHash('sha256').update(JSON.stringify({tipo:b.tipo,p:b.parametros,r:b.resultado})).digest('hex')
    const data={
      tipo:b.tipo,moduloId:b.moduloId??null,submodulo:b.submodulo??null,
      activoNombre:b.activoNombre??null,parametros:b.parametros,resultado:b.resultado,
      normativa:b.normativa??null,hash,alerta:b.alerta??false,
      alertaMsg:b.alertaMsg??null,usuario:b.usuario??'anonimo',
      usuarioId:b.usuarioId??null,proyectoId:b.proyectoId??null}
    const c=await prisma.calculo.upsert({where:{hash},create:data,update:{}})
    return NextResponse.json({ok:true,id:c.id,hash})
  } catch(e){
    return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Error interno'},{status:500})
  }
}
