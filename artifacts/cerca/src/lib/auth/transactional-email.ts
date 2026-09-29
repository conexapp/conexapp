import { dbSource } from "@/lib/db";
import { consumeAuthToken, hashAuthToken } from "@/lib/cerca/domain/auth-token";
import { id, sql } from "@/lib/cerca/server/helpers";

const VERIFY_TTL_SEC = 60 * 60 * 24;
const RESET_TTL_SEC = 60 * 60;

export async function deliverAuthEmail(input: {
  kind: "verify" | "reset";
  email: string;
  url: string;
  token: string;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  const ttl = input.kind === "reset" ? RESET_TTL_SEC : VERIFY_TTL_SEC;
  const db = await sql();
  await db`
    insert into auth_tokens (token_hash, email, kind, expires_at)
    values (${hashAuthToken(input.token)}, ${email}, ${input.kind}, now() + (${ttl} * interval '1 second'))
    on conflict (token_hash) do nothing
  `;
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const subject = input.kind === "reset" ? "Recuperar la contraseña de CONEX" : "Confirmá tu email en CONEX";
  const text =
    input.kind === "reset"
      ? `Para elegir una contraseña nueva abrí este enlace. Vence en una hora y sirve una sola vez.\n\n${input.url}`
      : `Confirmá la cuenta con este enlace. Vence en 24 horas y sirve una sola vez.\n\n${input.url}`;
  if (key && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject, text }),
    });
    if (!response.ok) throw new Error("No se pudo enviar el correo. El enlace no se entregó.");
    return;
  }
  if (dbSource === "pglite") {
    await db`
      insert into auth_outbox (id, email, kind, url, expires_at)
      values (${id()}, ${email}, ${input.kind}, ${input.url}, now() + (${ttl} * interval '1 second'))
    `;
    return;
  }
  throw new Error("El correo no está configurado. Falta RESEND_API_KEY o RESEND_FROM.");
}

export async function consumeVerificationToken(token: string): Promise<void> {
  const db = await sql();
  const ok = await consumeAuthToken(db, token);
  if (!ok) throw new Error("Ese enlace ya se usó o venció.");
}

export function previewMailboxAllowed(): boolean {
  return dbSource === "pglite" && !(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim());
}
