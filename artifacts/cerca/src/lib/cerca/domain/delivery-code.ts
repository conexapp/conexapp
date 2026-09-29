import { createHash, randomInt, timingSafeEqual } from "node:crypto";

export type DeliveryCodeVerdict = "ok" | "mismatch" | "used" | "expired";

export function generateDeliveryCode(): string {
  let code = "";
  for (let i = 0; i < 8; i += 1) code += randomInt(0, 10).toString();
  return code;
}

export function hashDeliveryCode(code: string, pepper: string): string {
  return createHash("sha256").update(`${pepper}:${code}`).digest("hex");
}

export function assessDeliveryCode(input: {
  storedHash: string;
  providedCode: string;
  pepper: string;
  usedAt: string | null;
  expiresAt: string | null;
  now?: Date;
}): DeliveryCodeVerdict {
  if (input.usedAt) return "used";
  if (input.expiresAt && input.expiresAt <= (input.now ?? new Date()).toISOString()) return "expired";
  const actual = Buffer.from(hashDeliveryCode(input.providedCode, input.pepper), "hex");
  const expected = Buffer.from(input.storedHash, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return "mismatch";
  return "ok";
}
