export async function auditLog(action: string, data: object): Promise<void> {
  console.log(`[AUDIT] ${action}:`, JSON.stringify(data));
}