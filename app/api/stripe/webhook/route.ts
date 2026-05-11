import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const PLAN_SLUGS = new Set(['modulo', 'duo', 'pro', 'team'])

export async function POST(req: NextRequest) {
  const stripeKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    console.error('[stripe/webhook] STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET no configurados')
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }
  const stripe = new Stripe(stripeKey)

  const rawBody = Buffer.from(await req.arrayBuffer())
  const sig     = req.headers.get('stripe-signature')

  if (!sig) {
    console.error('[stripe/webhook] stripe-signature header ausente')
    return NextResponse.json({ error: 'sin firma' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (e) {
    console.error('[stripe/webhook] Firma inválida:', e)
    return NextResponse.json({ error: 'firma inválida' }, { status: 401 })
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object as Stripe.Checkout.Session
    const email    = session.customer_email ?? session.customer_details?.email
    const planSlug = session.metadata?.plan

    if (!email || !planSlug || !PLAN_SLUGS.has(planSlug)) {
      console.error('[stripe/webhook] Datos insuficientes:', { email, planSlug })
      return NextResponse.json({ error: 'datos insuficientes' }, { status: 400 })
    }

    try {
      const updated = await prisma.usuario.updateMany({
        where: { email },
        data:  { plan: planSlug },
      })
      if (updated.count === 0) {
        console.error(`[stripe/webhook] Email "${email}" no registrado en DB`)
      } else {
        console.log(`[stripe/webhook] Plan "${planSlug}" activado para ${email}`)
      }
    } catch (e) {
      console.error('[stripe/webhook] Error Prisma:', e)
      return NextResponse.json({ error: 'error DB' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
