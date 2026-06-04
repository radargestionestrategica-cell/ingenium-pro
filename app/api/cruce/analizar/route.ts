export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';
import { aplicarReglasDecruce } from '@/lib/cruceReglas';
import type { CalculoSnap } from '@/lib/cruceReglas';

export async function GET(req: NextRequest) {
  const payload = verificarTokenAPI(req);
  if (!payload) return respuestaNoAutorizado();

  try {
    const { prisma } = await import('@/lib/prisma');

    // Últimos 100 cálculos del usuario, ordenados del más reciente al más antiguo.
    // El orden DESC es necesario para que ultimo() devuelva el más reciente por tipo.
    const calculos = await prisma.calculo.findMany({
      where:   { usuarioId: payload.id },
      orderBy: { createdAt: 'desc' },
      take:    100,
      select: {
        id: true, tipo: true, moduloId: true, submodulo: true,
        parametros: true, resultado: true,
        alerta: true, alertaMsg: true, normativa: true, createdAt: true,
      },
    });

    const snaps: CalculoSnap[] = calculos.map(c => ({
      id:         c.id,
      tipo:       c.tipo,
      moduloId:   c.moduloId,
      submodulo:  c.submodulo,
      parametros: c.parametros as Record<string, unknown>,
      resultado:  c.resultado  as Record<string, unknown>,
      alerta:     c.alerta,
      alertaMsg:  c.alertaMsg,
      normativa:  c.normativa,
      createdAt:  c.createdAt.toISOString(),
    }));

    // Capa 1: reglas determinísticas — sin IA, sin alucinaciones
    const riesgos = aplicarReglasDecruce(snaps);

    // Capa 2 (opcional): IA contextual — solo si ?ia=1 Y hay riesgos
    const conIA = req.nextUrl.searchParams.get('ia') === '1';
    let analisisIA: string | null = null;

    if (conIA && riesgos.length > 0) {
      const resumenRiesgos = riesgos
        .map(r => `[${r.nivel}] ${r.id} — ${r.titulo}: ${r.descripcion} | Normativa: ${r.normativa}`)
        .join('\n');

      const modulosUsados = [...new Set(snaps.map(s => s.tipo))].slice(0, 20).join(', ');

      const systemPrompt =
`Sos el motor de integridad de INGENIUM PRO v8.1.

REGLAS ABSOLUTAS — NUNCA LAS ROMPAS:
1. NUNCA inventes un valor numérico. Solo usá los valores de RIESGOS DETECTADOS.
2. NUNCA inventes una normativa o cláusula. Solo citá las ya incluidas en cada riesgo.
3. Tu rol: priorizar, relacionar y contextualizar los riesgos ya detectados por reglas determinísticas.
4. Si no hay relación real entre dos riesgos, NO la inventes.

RIESGOS DETECTADOS (100% determinísticos — calculados con valores reales del historial):
${resumenRiesgos}

MÓDULOS CON CÁLCULOS EN HISTORIAL: ${modulosUsados}`;

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         process.env.ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:       'claude-sonnet-4-6',
          max_tokens:  900,
          temperature: 0,
          system:      systemPrompt,
          messages: [{
            role:    'user',
            content: `Analizá los ${riesgos.length} riesgos detectados. Para cada CRITICO y ALTO: confirmá la prioridad de acción y señalá si existe relación con otro riesgo de la lista. Máximo 3 oraciones por riesgo. Usá solo los datos provistos — no agregues valores ni normativas que no estén en el contexto.`,
          }],
        }),
      });

      if (resp.ok) {
        const data = await resp.json() as { content: { type: string; text: string }[] };
        analisisIA = data.content?.find(b => b.type === 'text')?.text ?? null;
      }
    }

    return NextResponse.json({
      ok:         true,
      totalSnaps: snaps.length,
      riesgos,
      analisisIA,
      generadoEn: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[api/cruce/analizar]', err);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
