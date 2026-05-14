import { NextRequest, NextResponse } from 'next/server'

const PLAN_IDS: Record<string, string> = {
  modulo: 'e13b7ec1809545f0965ff3ac21b06291',
  duo:    '87cce369f7fb45a3a08d9abad3660184',
  pro:    '7977d5695fec4f99be5cc3e56c7b9428',
  team:   'a82fae7648024090a3b6dc195d136ccd',
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ingeniumpro.store'

export async function POST(req: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    console.error('[pagos/checkout] MP_ACCESS_TOKEN no configurado')
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
  }

  try {
    const { planId } = await req.json()
    const preapprovalPlanId = PLAN_IDS[planId]
    if (!preapprovalPlanId) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        preapproval_plan_id: preapprovalPlanId,
        back_url: `${BASE}/planes`,
        reason:   `INGENIUM PRO — Plan ${planId}`,
      }),
    })

    if (!mpRes.ok) {
      const err = await mpRes.text()
      console.error('[pagos/checkout] MP API error:', mpRes.status, err)
      return NextResponse.json({ error: 'Error al generar checkout MP' }, { status: 502 })
    }

    const mpData = await mpRes.json()
    if (!mpData.init_point) {
      console.error('[pagos/checkout] MP no devolvió init_point:', mpData)
      return NextResponse.json({ error: 'Sin init_point en respuesta MP' }, { status: 502 })
    }

    return NextResponse.json({ init_point: mpData.init_point })
  } catch (e) {
    console.error('[pagos/checkout] Error inesperado:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
