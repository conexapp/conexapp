import { createServerFn } from "@tanstack/react-start";
import { previewMailboxAllowed } from "@/lib/auth/transactional-email";
import { enforceRateLimit } from "./rate-limit";
import { sql } from "./helpers";

/** Solo el preview sin Resend. Producción no tiene este buzón. */
export const getDevMailbox = createServerFn({ method: "GET" })
  .validator((email: string) => {
    const value = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 160) {
      throw new Error("Email inválido.");
    }
    return value;
  })
  .handler(async ({ data }) => {
    if (!previewMailboxAllowed()) {
      throw new Error("El buzón de desarrollo no está disponible. El correo sale por Resend.");
    }
    const db = await sql();
    await enforceRateLimit(db, "password_reset", `mailbox:${data}`);
    return db<{ kind: string; url: string; expires_at: string }>`
      select kind, url, expires_at::text
      from auth_outbox
      where email = ${data} and expires_at > now()
      order by created_at desc
      limit 3
    `;
  });
