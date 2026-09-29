import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { can } from "../domain/permissions";
import { assertString, audit, id, loadAccess, sql } from "./helpers";
import { enforceRateLimit } from "./rate-limit";

const TARGETS = ["listing", "business", "user", "other"] as const;
const STATUSES = ["pending", "in_review", "resolved", "dismissed"] as const;

export const submitReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { targetType: string; targetId: string; reason: string; details?: string }) => {
    if (!TARGETS.includes(input.targetType as (typeof TARGETS)[number])) {
      throw new Error("Tipo de reporte inválido.");
    }
    return {
      targetType: input.targetType,
      targetId: assertString(input.targetId, "Objetivo", 80),
      reason: assertString(input.reason, "Motivo", 80),
      details: typeof input.details === "string" && input.details.trim()
        ? assertString(input.details, "Detalle", 500)
        : "",
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await enforceRateLimit(db, "sensitive", context.userId);
    const reportId = id();
    await db`
      insert into content_reports (id, reporter_user_id, target_type, target_id, reason, details)
      values (${reportId}, ${context.userId}, ${data.targetType}, ${data.targetId}, ${data.reason}, ${data.details})
    `;
    await audit(db, context.userId, "submit_report", data.targetType, data.targetId, { reportId });
    return { ok: true as const, id: reportId };
  });

export const listReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    const access = await loadAccess(db, context.userId);
    if (!can(access, "admin")) throw new Error("Hace falta un administrador.");
    return db<{
      id: string;
      target_type: string;
      target_id: string;
      reason: string;
      details: string;
      status: string;
      created_at: string;
    }>`
      select id, target_type, target_id, reason, details, status, created_at::text
      from content_reports
      order by created_at desc
      limit 80
    `;
  });

export const resolveReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: string; note?: string }) => {
    if (!STATUSES.includes(input.status as (typeof STATUSES)[number])) {
      throw new Error("Estado de reporte inválido.");
    }
    return {
      id: assertString(input.id, "Reporte", 80),
      status: input.status,
      note: typeof input.note === "string" && input.note.trim() ? assertString(input.note, "Nota", 400) : "",
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    const access = await loadAccess(db, context.userId);
    if (!can(access, "admin")) throw new Error("Hace falta un administrador.");
    await enforceRateLimit(db, "sensitive", context.userId);
    const updated = await db<{ id: string }>`
      update content_reports
      set status = ${data.status}, admin_note = ${data.note}, resolved_by = ${context.userId}, updated_at = now()
      where id = ${data.id}
      returning id
    `;
    if (!updated[0]) throw new Error("No está ese reporte.");
    await audit(db, context.userId, "resolve_report", "report", data.id, { status: data.status });
    return { ok: true as const };
  });
