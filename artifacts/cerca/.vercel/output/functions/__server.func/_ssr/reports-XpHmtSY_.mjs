import { f as sql, l as id, n as assertString, r as audit, u as loadAccess } from "./helpers-AwcxVs0A.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as enforceRateLimit } from "./rate-limit-BoqWzxCk.mjs";
import { t as can } from "./permissions-BdbdDlQV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-XpHmtSY_.js
var TARGETS = [
	"listing",
	"business",
	"user",
	"other"
];
var STATUSES = [
	"pending",
	"in_review",
	"resolved",
	"dismissed"
];
var submitReport_createServerFn_handler = createServerRpc({
	id: "517016fc38afc8fb312b4ee6cea597e2af85d8fe0daf52cb966cdea70a4d4ba6",
	name: "submitReport",
	filename: "src/lib/cerca/server/reports.ts"
}, (opts) => submitReport.__executeServer(opts));
var submitReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!TARGETS.includes(input.targetType)) throw new Error("Tipo de reporte inválido.");
	return {
		targetType: input.targetType,
		targetId: assertString(input.targetId, "Objetivo", 80),
		reason: assertString(input.reason, "Motivo", 80),
		details: typeof input.details === "string" && input.details.trim() ? assertString(input.details, "Detalle", 500) : ""
	};
}).handler(submitReport_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await enforceRateLimit(db, "sensitive", context.userId);
	const reportId = id();
	await db`
      insert into content_reports (id, reporter_user_id, target_type, target_id, reason, details)
      values (${reportId}, ${context.userId}, ${data.targetType}, ${data.targetId}, ${data.reason}, ${data.details})
    `;
	await audit(db, context.userId, "submit_report", data.targetType, data.targetId, { reportId });
	return {
		ok: true,
		id: reportId
	};
});
var listReports_createServerFn_handler = createServerRpc({
	id: "cd61fc732f3744e3d460acc301cf2d38dea3b260973420c1004c533141e6804b",
	name: "listReports",
	filename: "src/lib/cerca/server/reports.ts"
}, (opts) => listReports.__executeServer(opts));
var listReports = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listReports_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	const access = await loadAccess(db, context.userId);
	if (!can(access, "admin")) throw new Error("Hace falta un administrador.");
	return db`
      select id, target_type, target_id, reason, details, status, created_at::text
      from content_reports
      order by created_at desc
      limit 80
    `;
});
var resolveReport_createServerFn_handler = createServerRpc({
	id: "226ddd3b6e881cf24fb9026aa244777bf68640d68ded074c37e9f80d4c47cf78",
	name: "resolveReport",
	filename: "src/lib/cerca/server/reports.ts"
}, (opts) => resolveReport.__executeServer(opts));
var resolveReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!STATUSES.includes(input.status)) throw new Error("Estado de reporte inválido.");
	return {
		id: assertString(input.id, "Reporte", 80),
		status: input.status,
		note: typeof input.note === "string" && input.note.trim() ? assertString(input.note, "Nota", 400) : ""
	};
}).handler(resolveReport_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const access = await loadAccess(db, context.userId);
	if (!can(access, "admin")) throw new Error("Hace falta un administrador.");
	await enforceRateLimit(db, "sensitive", context.userId);
	if (!(await db`
      update content_reports
      set status = ${data.status}, admin_note = ${data.note}, resolved_by = ${context.userId}, updated_at = now()
      where id = ${data.id}
      returning id
    `)[0]) throw new Error("No está ese reporte.");
	await audit(db, context.userId, "resolve_report", "report", data.id, { status: data.status });
	return { ok: true };
});
//#endregion
export { listReports_createServerFn_handler, resolveReport_createServerFn_handler, submitReport_createServerFn_handler };
