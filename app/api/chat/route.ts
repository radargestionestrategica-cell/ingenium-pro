export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

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
        system: `Eres INGENIUM PRO, asistente técnico de ingeniería profesional mundial. Normas: ASME B31.1/B31.3/B31.8, API 579, AWWA, USACE. Respondés en español técnico profesional, preciso, sin alucinar valores.`,
        messages: [{ role: 'user', content: message }],
      }),
    });
    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sin respuesta del motor.';
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: 'Error de conexión.' });
  }
}