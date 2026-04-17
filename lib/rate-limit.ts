const requestCounts: Record<string, { count: number; resetTime: number }> = {};

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = requestCounts[key];

  if (!record || now > record.resetTime) {
    requestCounts[key] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}