import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        system: `Eres INGENIUM PRO, asistente técnico de ingeniería profesional mundial. Especialidades: petróleo, gas, hidráulica, minería, geotecnia, vialidad, estructuras, acueductos, represas, arquitectura técnica. Normas: ASME B31.1/B31.3/B31.8, API 579, API 5L, AWWA, USACE EM, ACI, AISC, ISO. Respondés en español técnico profesional. Sos preciso, concreto, no alucinas valores.`,
        messages: [{ role: 'user', content: message }],
      }),
    });
    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sin respuesta del motor.';
    await db.calculo.create({
      data: { tipo: 'consulta', parametros: { mensaje: message }, resultado: { respuesta: reply } },
    });
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ reply: 'Error de conexión.' });
  }
}