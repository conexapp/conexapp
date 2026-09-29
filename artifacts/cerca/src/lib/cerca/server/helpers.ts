import { dbSource, getSql, type Sql } from "@/lib/db";
import type { Access, PlatformRole } from "../domain/permissions";

export function id(): string {
  return crypto.randomUUID();
}

export async function sql(): Promise<Sql> {
  return getSql();
}

export function asNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Número inválido.");
  return n;
}

export function asInt(value: unknown): number {
  const n = asNumber(value);
  if (!Number.isSafeInteger(n)) throw new Error("Entero fuera de rango.");
  return n;
}

export async function loadAccess(db: Sql, userId: string): Promise<Access> {
  await db`insert into profiles (user_id) values (${userId}) on conflict (user_id) do nothing`;
  const rows = await db<{ platform_role: string }>`
    select platform_role from profiles where user_id = ${userId}
  `;
  const businesses = await db<{ id: string }>`
    select id from businesses
    where owner_user_id = ${userId} and status <> 'suspended'
  `;
  const role: PlatformRole = rows[0]?.platform_role === "admin" ? "admin" : "user";
  return { userId, platformRole: role, businessIds: businesses.map((b) => b.id) };
}

export function deliveryPepper(): string {
  const fromEnv = process.env.CERCA_DELIVERY_PEPPER;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;
  if (dbSource === "pglite") return "dev-only-pepper-not-for-production";
  throw new Error("Falta CERCA_DELIVERY_PEPPER. No se emiten códigos de entrega.");
}

export async function audit(
  db: Sql,
  actorUserId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown>,
): Promise<void> {
  await db`
    insert into audit_log (id, actor_user_id, action, entity_type, entity_id, metadata)
    values (
      ${id()},
      ${actorUserId},
      ${action},
      ${entityType},
      ${entityId},
      ${JSON.stringify(metadata)}::jsonb
    )
  `;
}

export async function notify(
  db: Sql,
  userId: string,
  kind: string,
  title: string,
  body: string,
  href: string | null,
): Promise<void> {
  let emailStatus = "skipped_unconfigured";
  let emailError: string | null = "Falta RESEND_API_KEY o RESEND_FROM.";
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (key && from) {
    const users = await db<{ email: string }>`select email from "user" where id = ${userId}`;
    const email = users[0]?.email;
    if (!email || email.endsWith("@cerca.invalid")) {
      emailStatus = "skipped_unconfigured";
      emailError = "El destinatario no tiene un email entregable.";
    } else {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from, to: [email], subject: title, text: body }),
        });
        if (!response.ok) {
          emailStatus = "failed";
          emailError = `Resend respondió ${response.status}.`;
        } else {
          emailStatus = "sent";
          emailError = null;
        }
      } catch (error) {
        emailStatus = "failed";
        emailError = error instanceof Error ? error.message : "Error de red.";
      }
    }
  }
  await db`
    insert into notifications (id, user_id, kind, title, body, href, email_status, email_error)
    values (${id()}, ${userId}, ${kind}, ${title}, ${body}, ${href}, ${emailStatus}, ${emailError})
  `;
}

export function assertString(value: unknown, label: string, max = 280): string {
  if (typeof value !== "string") throw new Error(`${label} es obligatorio.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} es obligatorio.`);
  if (trimmed.length > max) throw new Error(`${label} es demasiado largo.`);
  return trimmed;
}
