import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PLANES: Record<string, { nombre: string; precioUSD: number; slug: string }> = {
  modulo: { nombre: 'INGENIUM PRO — Módulo Único', precioUSD: 25,  slug: 'modulo' },
  duo:    { nombre: 'INGENIUM PRO — Dúo',          precioUSD: 44,  slug: 'duo'    },
  pro:    { nombre: 'INGENIUM PRO — Pro',           precioUSD: 195, slug: 'pro'    },
  team:   { nombre: 'INGENIUM PRO — Team',          precioUSD: 555, slug: 'team'   },
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ingeniumpro.store'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    console.error('[stripe/checkout] STRIPE_SECRET_KEY no configurado')
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }
  const stripe = new Stripe(stripeKey)
  try {
    const { planId, email }: { planId: string; email?: string } = await req.json()
    const plan = PLANES[planId]
    if (!plan) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency:     'usd',
            product_data: { name: plan.nombre },
            unit_amount:  plan.precioUSD * 100,
            recurring:    { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      customer_email: email ?? undefined,
      metadata:       { plan: plan.slug },
      success_url:    `${BASE}/dashboard?stripe=success&plan=${plan.slug}`,
      cancel_url:     `${BASE}/planes`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('[stripe/checkout]', e)
    return NextResponse.json({ error: 'Error al crear sesión' }, { status: 500 })
  }
}
