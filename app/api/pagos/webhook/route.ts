import{NextRequest,NextResponse}from'next/server'
import{prisma}from'@/lib/prisma'
export async function POST(req:NextRequest){
try{
const b=await req.json()
const tipo=b?.type||b?.action
if(tipo!=='payment'&&tipo!=='subscription_preapproval')return NextResponse.json({ok:true})
const id=b?.data?.id||b?.id
if(!id)return NextResponse.json({ok:false},{status:400})
const r=await fetch('https://api.mercadopago.com/v1/payments/'+id,{headers:{Authorization:'Bearer '+process.env.MP_ACCESS_TOKEN}})
const p=await r.json()
if(p.status!=='approved')return NextResponse.json({ok:true,msg:'no aprobado'})
const email=p.payer?.email
if(!email)return NextResponse.json({ok:false},{status:400})
await prisma.usuario.updateMany({where:{email},data:{plan:'pro'}})
return NextResponse.json({ok:true,email})
}catch(e){return NextResponse.json({ok:false},{status:500})}
}