import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  return NextResponse.redirect('https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c9380849709bcc501970f2bbd880e56')
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, data } = body

  if (type === 'subscription_preapproval') {
    const { error } = await supabase
      .from('suscripciones')
      .upsert({
        mp_suscripcion_id: data.id,
        email: data.payer_email,
        plan: 'starter',
        estado: data.status,
      }, { onConflict: 'mp_suscripcion_id' })

    if (error) console.error(error)
  }

  return NextResponse.json({ ok: true })
}