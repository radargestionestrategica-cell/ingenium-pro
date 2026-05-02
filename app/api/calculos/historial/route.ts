import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req: NextRequest) {
  try {
    const p=req.nextUrl.searchParams
    const uid=p.get('usuarioId'),pid=p.get('proyectoId'),tip=p.get('tipo')
    if(!uid&&!pid) return NextResponse.json({ok:false,error:'Falta usuarioId o proyectoId'},{status:400})
    const data=await prisma.calculo.findMany({
      where:{...(uid?{usuarioId:uid}:{}), ...(pid?{proyectoId:pid}:{}), ...(tip?{tipo:tip}:{})},
      orderBy:{createdAt:'desc'},take:100
    })
    return NextResponse.json({ok:true,total:data.length,data})
  }catch(e){
    return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Error'},{status:500})
  }
}
