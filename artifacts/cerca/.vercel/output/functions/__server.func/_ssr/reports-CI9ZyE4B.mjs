import { n as assertString } from "./helpers-AwcxVs0A.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { l as createSsrRpc } from "./shell-CbJDficC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-CI9ZyE4B.js
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
var submitReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!TARGETS.includes(input.targetType)) throw new Error("Tipo de reporte inválido.");
	return {
		targetType: input.targetType,
		targetId: assertString(input.targetId, "Objetivo", 80),
		reason: assertString(input.reason, "Motivo", 80),
		details: typeof input.details === "string" && input.details.trim() ? assertString(input.details, "Detalle", 500) : ""
	};
}).handler(createSsrRpc("517016fc38afc8fb312b4ee6cea597e2af85d8fe0daf52cb966cdea70a4d4ba6"));
var listReports = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("cd61fc732f3744e3d460acc301cf2d38dea3b260973420c1004c533141e6804b"));
var resolveReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!STATUSES.includes(input.status)) throw new Error("Estado de reporte inválido.");
	return {
		id: assertString(input.id, "Reporte", 80),
		status: input.status,
		note: typeof input.note === "string" && input.note.trim() ? assertString(input.note, "Nota", 400) : ""
	};
}).handler(createSsrRpc("226ddd3b6e881cf24fb9026aa244777bf68640d68ded074c37e9f80d4c47cf78"));
//#endregion
export { resolveReport as n, submitReport as r, listReports as t };
