import { NextRequest, NextResponse } from 'next/server';
import { calculateMAOP } from '@/modules/petroleo/formulas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resultado = calculateMAOP(body);
    return NextResponse.json({ success: true, resultado });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error en cálculo MAOP' }, { status: 500 });
  }
}