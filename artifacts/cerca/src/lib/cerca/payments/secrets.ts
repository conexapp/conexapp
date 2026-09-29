import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const DEV_STATE_KEY = "dev-only-oauth-state-not-for-production";

export function encryptSecret(plain: string, key: string): string {
  const keyBuf = createHash("sha256").update(key).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBuf, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptSecret(payload: string, key: string): string {
  const [version, ivB64, tagB64, dataB64] = payload.split(".");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) throw new Error("Token cifrado inválido.");
  const keyBuf = createHash("sha256").update(key).digest();
  const decipher = createDecipheriv("aes-256-gcm", keyBuf, Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64url")), decipher.final()]).toString("utf8");
}

export function sealToken(plain: string, mode: "encrypted" | "dev_plaintext", key: string | undefined): string {
  if (mode === "encrypted") {
    if (!key || key.trim().length < 16) throw new Error("Falta CERCA_TOKEN_KEY.");
    return encryptSecret(plain, key.trim());
  }
  return plain;
}

export function openToken(input: {
  stored: string | null;
  storage: string;
  tokenKey: string | undefined;
  productionDatabase: boolean;
}): string | null {
  if (!input.stored) return null;
  if (input.storage === "dev_plaintext") {
    if (input.productionDatabase) return null;
    return input.stored;
  }
  const key = input.tokenKey?.trim() ?? "";
  if (key.length < 16) return null;
  try {
    return decryptSecret(input.stored, key);
  } catch {
    return null;
  }
}

export function stateSigningKey(tokenKey: string | undefined, productionDatabase: boolean): string | null {
  const key = tokenKey?.trim() ?? "";
  if (key.length >= 16) return key;
  if (!productionDatabase) return DEV_STATE_KEY;
  return null;
}

export function packOauthState(payload: string, key: string): string {
  const sig = createHmac("sha256", key).update(payload).digest("hex");
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${sig}`;
}

export function unpackOauthState(state: string, key: string): string | null {
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const encoded = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = createHmac("sha256", key).update(payload).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}
