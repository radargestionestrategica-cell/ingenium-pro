import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/prisma'

// preapproval_plan_id → slug guardado en Usuario.plan
const PLAN_MAP: Record<string, string> = {
  e13b7ec1809545f0965ff3ac21b06291: 'modulo',
  '87cce369f7fb45a3a08d9abad3660184': 'duo',
  '7977d5695fec4f99be5cc3e56c7b9428': 'pro',
  a82fae7648024090a3b6dc195d136ccd: 'team',
}

function verifySignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[webhook/mp] MP_WEBHOOK_SECRET no configurado en producción')
    }
    return false
  }
  const xSig   = req.headers.get('x-signature') ?? ''
  const xReqId = req.headers.get('x-request-id') ?? ''
  const tsMatch = xSig.match(/ts=(\d+)/)
  const v1Match = xSig.match(/v1=([a-f0-9]+)/)
  if (!tsMatch || !v1Match) {
    console.error('[webhook/mp] x-signature ausente o malformado:', xSig)
    return false
  }
  const manifest = `id:${dataId};request-id:${xReqId};ts:${tsMatch[1]};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  return expected === v1Match[1]
}

async function mpGet(path: string) {
  const r = await fetch(`https://api.mercadopago.com${path}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })
  if (!r.ok) throw new Error(`MP API ${path} → ${r.status}`)
  return r.json()
}

async function activatePlan(
  externalRef: string | undefined,
  payerEmail:  string | undefined,
  planSlug:    string,
): Promise<{ ok: boolean; msg?: string }> {
  if (externalRef) {
    const updated = await prisma.usuario.updateMany({
      where: { id: externalRef },
      data:  { plan: planSlug },
    })
    if (updated.count > 0) return { ok: true }
    console.error(`[webhook/mp] external_reference "${externalRef}" no coincide con ningún usuario`)
  }
  if (!payerEmail) return { ok: false, msg: 'sin email ni external_reference' }
  await prisma.usuario.updateMany({ where: { email: payerEmail }, data: { plan: planSlug } })
  return { ok: true }
}

export async function POST(req: NextRequest) {
  try {
    const b      = await req.json()
    const tipo   = b?.type || b?.action
    const dataId = String(b?.data?.id ?? b?.id ?? '')

    if (!dataId) {
      console.error('[webhook/mp] Payload sin data.id:', JSON.stringify(b))
      return NextResponse.json({ ok: false, msg: 'sin id' }, { status: 400 })
    }

    if (!verifySignature(req, dataId)) {
      console.error('[webhook/mp] Firma inválida para dataId:', dataId)
      return NextResponse.json({ ok: false, msg: 'firma inválida' }, { status: 401 })
    }

    if (tipo === 'payment') {
      const p = await mpGet(`/v1/payments/${dataId}`)
      if (p.status !== 'approved') {
        return NextResponse.json({ ok: true, msg: `pago ${p.status}` })
      }

      let planSlug = 'pro'
      if (p.preapproval_id) {
        const sub = await mpGet(`/v1/preapproval/${p.preapproval_id}`)
        planSlug = PLAN_MAP[sub.preapproval_plan_id] ?? 'pro'
      }

      const result = await activatePlan(p.external_reference, p.payer?.email, planSlug)
      if (!result.ok) {
        console.error('[webhook/mp] No se pudo identificar usuario — payment:', dataId, result.msg)
        return NextResponse.json({ ok: false, msg: result.msg }, { status: 400 })
      }
      return NextResponse.json({ ok: true, plan: planSlug })
    }

    if (tipo === 'subscription_preapproval') {
      const sub = await mpGet(`/v1/preapproval/${dataId}`)
      if (sub.status !== 'authorized') {
        return NextResponse.json({ ok: true, msg: `suscripción ${sub.status}` })
      }

      const planSlug = PLAN_MAP[sub.preapproval_plan_id] ?? 'pro'
      const result   = await activatePlan(sub.external_reference, sub.payer_email, planSlug)
      if (!result.ok) {
        console.error('[webhook/mp] No se pudo identificar usuario — preapproval:', dataId, result.msg)
        return NextResponse.json({ ok: false, msg: result.msg }, { status: 400 })
      }
      return NextResponse.json({ ok: true, plan: planSlug })
    }

    return NextResponse.json({ ok: true, msg: 'evento ignorado' })
  } catch (e) {
    console.error('[webhook/mp] Error inesperado:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
