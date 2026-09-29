const buckets = new Map<string, { count: number; reset: number }>();

/** Límite en memoria del proceso. No es un límite distribuido. */
export function allowRequest(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const current = buckets.get(key);
  if (!current || now >= current.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const raw = forwarded ? forwarded.split(",")[0] : "local";
  return raw.trim().slice(0, 64) || "local";
}
