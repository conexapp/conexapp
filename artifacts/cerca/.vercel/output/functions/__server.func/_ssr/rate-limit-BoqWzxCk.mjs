import { n as rateLimitConfig, r as rateLimitDecision, t as bumpRateLimit } from "./rate-limit-CxIZqdRb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rate-limit-BoqWzxCk.js
async function enforceRateLimit(db, scope, actor) {
	const rule = rateLimitConfig(scope);
	const hits = await bumpRateLimit(db, `${scope}:${actor}`, rule.windowSec);
	if (rateLimitDecision({
		hits,
		max: rule.max
	}) === "deny") throw new Error("Demasiados intentos. Esperá y volvé a probar.");
}
//#endregion
export { enforceRateLimit as t };
