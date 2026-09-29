import type { Sql } from "@/lib/db";
import { bumpRateLimit, rateLimitConfig, rateLimitDecision, type RateScope } from "../domain/rate-limit";

export async function enforceRateLimit(db: Sql, scope: RateScope, actor: string): Promise<void> {
  const rule = rateLimitConfig(scope);
  const hits = await bumpRateLimit(db, `${scope}:${actor}`, rule.windowSec);
  if (rateLimitDecision({ hits, max: rule.max }) === "deny") {
    throw new Error("Demasiados intentos. Esperá y volvé a probar.");
  }
}
