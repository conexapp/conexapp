import { createHash } from "node:crypto";
import type { Sql } from "../../db.ts";

export function hashAuthToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenUseDecision(input: { consumed: boolean }): "ok" | "rejected" {
  return input.consumed ? "ok" : "rejected";
}

/** Un token se consume una sola vez y solo si no venció. */
export async function consumeAuthToken(db: Sql, token: string): Promise<boolean> {
  if (!token || token.length < 16 || token.length > 2000) return false;
  const rows = await db<{ token_hash: string }>`
    update auth_tokens
    set used_at = now()
    where token_hash = ${hashAuthToken(token)}
      and used_at is null
      and expires_at > now()
    returning token_hash
  `;
  return Boolean(rows[0]);
}
