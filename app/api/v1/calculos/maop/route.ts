import { NextRequest, NextResponse } from 'next/server';
import { calculateMAOP } from '@/modules/petroleo/formulas';
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  if (!verificarTokenAPI(req)) return respuestaNoAutorizado();

  try {
    const body = await req.json();
    const resultado = calculateMAOP(body);
    return NextResponse.json({ success: true, resultado });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error en cálculo MAOP' }, { status: 500 });
  }
}