import { MINOR_SELL_BLOCK, readSellerIntent } from "../domain/seller-profile";
import type { Sql } from "@/lib/db";

export async function assertCanSell(db: Sql, userId: string): Promise<void> {
  const rows = await db<{ seller_intent: unknown }>`
    select seller_intent from profiles where user_id = ${userId}
  `;
  const intent = readSellerIntent(rows[0]?.seller_intent ?? null);
  if (intent?.declaresMinor) throw new Error(MINOR_SELL_BLOCK);
}
