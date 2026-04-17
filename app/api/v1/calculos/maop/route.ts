import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MAOPInputSchema } from '@/lib/validators';
import { hashCalculation, signHash, generateCalculationId } from '@/lib/crypto';
import { calculateMAOP } from '@/modules/petroleo/formulas';
import { auditLog } from '@/lib/audit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const validation = MAOPInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const inputs = validation.data;
    
    const resultado = calculateMAOP(inputs);

    const hash = hashCalculation(inputs);

    const firma = signHash(hash);

    const calcId = generateCalculationId();

    const calculo = await db.calculo.create({
      data: {
        id: calcId,
        usuario_id: session.user.id,
        tipo: 'MAOP',
        version: '1.0',
        inputs: JSON.stringify(inputs),
        resultados: JSON.stringify(resultado),
        hash,
        firma_digital: firma,
        ip_cliente: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        public: false,
      },
    });

    await auditLog(
      session.user.id,
      'CALCULO_MAOP',
      'Calculo',
      calcId,
      null,
      { tipo: 'MAOP', OD: inputs.OD, MAOP: resultado.MAOP }
    );

    return NextResponse.json(
      {
        success: true,
        calcId: calculo.id,
        resultado,
        hash,
        firma_verificacion: calculo.firma_digital,
        timestamp: calculo.timestamp,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('MAOP calculation error:', error);
    return NextResponse.json(
      { error: 'Error en cálculo' },
      { status: 500 }
    );
  }
}