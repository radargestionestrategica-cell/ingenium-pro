import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect('https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=TU_PLAN_ID')
}