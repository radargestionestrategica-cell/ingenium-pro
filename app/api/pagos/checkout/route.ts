import { NextRequest, NextResponse } from 'next/server'

const CHECKOUT_URLS: Record<string, string> = {
  modulo: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=e13b7ec1809545f0965ff3ac21b06291',
  duo:    'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=87cce369f7fb45a3a08d9abad3660184',
  pro:    'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=7977d5695fec4f99be5cc3e56c7b9428',
  team:   'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=a82fae7648024090a3b6dc195d136ccd',
}

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json()
    const init_point = CHECKOUT_URLS[planId]
    if (!init_point) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }
    return NextResponse.json({ init_point })
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }
}
