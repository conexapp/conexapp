import type { Sql } from "../../db.ts";

export const RATE_SCOPES = [
  "login",
  "register",
  "password_reset",
  "image_upload",
  "listing_create",
  "quote_request",
  "message",
  "sensitive",
] as const;

export type RateScope = (typeof RATE_SCOPES)[number];

const DEFAULTS: Record<RateScope, { max: number; windowSec: number }> = {
  login: { max: 5, windowSec: 300 },
  register: { max: 5, windowSec: 3600 },
  password_reset: { max: 3, windowSec: 3600 },
  image_upload: { max: 40, windowSec: 3600 },
  listing_create: { max: 20, windowSec: 3600 },
  quote_request: { max: 20, windowSec: 3600 },
  message: { max: 40, windowSec: 3600 },
  sensitive: { max: 30, windowSec: 600 },
};

function readPositiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100_000) return fallback;
  return parsed;
}

/** CERCA_RL_<SCOPE>_MAX y CERCA_RL_<SCOPE>_WINDOW_SEC pisan el default. */
export function rateLimitConfig(
  scope: RateScope,
  env: Record<string, string | undefined> = process.env,
): { max: number; windowSec: number } {
  const key = scope.toUpperCase();
  return {
    max: readPositiveInt(env[`CERCA_RL_${key}_MAX`], DEFAULTS[scope].max),
    windowSec: readPositiveInt(env[`CERCA_RL_${key}_WINDOW_SEC`], DEFAULTS[scope].windowSec),
  };
}

export function rateLimitDecision(input: { hits: number; max: number }): "allow" | "deny" {
  if (!Number.isInteger(input.hits) || input.hits < 1) return "deny";
  return input.hits > input.max ? "deny" : "allow";
}

/** Incremento atómico de ventana fija. El primer hit de una ventana nueva vuelve a 1. */
export async function bumpRateLimit(db: Sql, bucket: string, windowSec: number): Promise<number> {
  const rows = await db<{ hits: number }>`
    insert into rate_limits (bucket, hits, window_started_at)
    values (${bucket}, 1, now())
    on conflict (bucket) do update set
      hits = case
        when rate_limits.window_started_at + (${windowSec} * interval '1 second') <= now() then 1
        else rate_limits.hits + 1
      end,
      window_started_at = case
        when rate_limits.window_started_at + (${windowSec} * interval '1 second') <= now() then now()
        else rate_limits.window_started_at
      end
    returning hits
  `;
  return rows[0]?.hits ?? 1;
}
