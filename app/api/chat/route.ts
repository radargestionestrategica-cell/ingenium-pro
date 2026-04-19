import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, system } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: system || 'Eres INGENIUM PRO v8.0, asistente de ingenieria tecnica.',
        messages: messages || [],
      }),
    });

    const data = await response.json();
    const texto = data?.content?.[0]?.text;
    if (!texto) return NextResponse.json({ reply: 'Sin respuesta de la IA.' });
    return NextResponse.json({ content: [{ text: texto }] });

  } catch (error) {
    return NextResponse.json({ reply: 'Error servidor.' }, { status: 500 });
  }
}