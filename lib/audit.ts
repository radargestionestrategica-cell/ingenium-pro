import { db } from './db';

export async function auditLog(
  usuarioId: string | null,
  accion: string,
  entidad: string,
  entidadId: string | null,
  datos_antes?: any,
  datos_despues?: any,
  ip?: string,
  userAgent?: string
) {
  try {
    await db.auditLog.create({
      data: {
        usuario_id: usuarioId,
        accion,
        entidad,
        entidad_id: entidadId,
        datos_antes: datos_antes ? JSON.stringify(datos_antes) : null,
        datos_despues: datos_despues ? JSON.stringify(datos_despues) : null,
        ip,
        user_agent: userAgent,
      },
    });
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}