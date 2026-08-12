import { NextRequest, NextResponse } from 'next/server'
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'

const MESES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;

export async function GET(req: NextRequest) {
  const payload = verificarTokenAPI(req)
  if (!payload) return respuestaNoAutorizado()

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const limited = rateLimit(`nasa-power:${ip}`, 20, 60_000)
  if (limited) return limited

  const lat = req.nextUrl.searchParams.get('lat')
  const lon = req.nextUrl.searchParams.get('lon')
  const latNum = Number(lat)
  const lonNum = Number(lon)

  if (lat === null || lon === null || isNaN(latNum) || isNaN(lonNum) ||
      latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return NextResponse.json(
      { error: 'lat y lon numéricos válidos son obligatorios (-90..90, -180..180)' },
      { status: 400 },
    )
  }

  try {
    const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lonNum}&latitude=${latNum}&format=JSON`
    const nasaRes = await fetch(url)

    if (!nasaRes.ok) {
      const err = await nasaRes.text()
      console.error('[nasa-power] NASA API error:', nasaRes.status, err)
      return NextResponse.json({ error: 'Error al consultar NASA POWER' }, { status: 502 })
    }

    const data = await nasaRes.json()
    const mensual = data?.properties?.parameter?.ALLSKY_SFC_SW_DWN

    if (!mensual) {
      console.error('[nasa-power] Respuesta sin parámetro esperado:', data)
      return NextResponse.json({ error: 'Sin datos de irradiancia en la respuesta' }, { status: 502 })
    }

    const valoresMensuales = MESES.map(m => ({ mes: m, valor: mensual[m] as number }))
    const mesMasDesfavorable = valoresMensuales.reduce((min, v) => (v.valor < min.valor ? v : min))

    return NextResponse.json({
      lat: latNum,
      lon: lonNum,
      unidad: 'kWh/m²/día',
      valoresMensuales,
      promedioAnual: mensual.ANN,
      mesMasDesfavorable,
    })
  } catch (e) {
    console.error('[nasa-power] Error inesperado:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
