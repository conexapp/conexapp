//#region node_modules/.nitro/vite/services/ssr/assets/rate-limit-CxIZqdRb.js
var DEFAULTS = {
	login: {
		max: 5,
		windowSec: 300
	},
	register: {
		max: 5,
		windowSec: 3600
	},
	password_reset: {
		max: 3,
		windowSec: 3600
	},
	image_upload: {
		max: 40,
		windowSec: 3600
	},
	listing_create: {
		max: 20,
		windowSec: 3600
	},
	quote_request: {
		max: 20,
		windowSec: 3600
	},
	message: {
		max: 40,
		windowSec: 3600
	},
	sensitive: {
		max: 30,
		windowSec: 600
	}
};
function readPositiveInt(value, fallback) {
	if (!value?.trim()) return fallback;
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1e5) return fallback;
	return parsed;
}
/** CERCA_RL_<SCOPE>_MAX y CERCA_RL_<SCOPE>_WINDOW_SEC pisan el default. */
function rateLimitConfig(scope, env = process.env) {
	const key = scope.toUpperCase();
	return {
		max: readPositiveInt(env[`CERCA_RL_${key}_MAX`], DEFAULTS[scope].max),
		windowSec: readPositiveInt(env[`CERCA_RL_${key}_WINDOW_SEC`], DEFAULTS[scope].windowSec)
	};
}
function rateLimitDecision(input) {
	if (!Number.isInteger(input.hits) || input.hits < 1) return "deny";
	return input.hits > input.max ? "deny" : "allow";
}
/** Incremento atómico de ventana fija. El primer hit de una ventana nueva vuelve a 1. */
async function bumpRateLimit(db, bucket, windowSec) {
	return (await db`
    insert into rate_limits (bucket, hits, window_started_at)
    values (${bucket}, 1, now())
    on conflict (bucket) do update set
      hits = case
        when rate_limits.window_started_at + (${windowSec} * interval '1 second') <= now() then 1
        else rate_limits.hits + 1
      end,
      window_started_at = case
        when rate_limits.window_started_at + (${windowSec} * interval '1 second') <= now() then now()
        else rate_limits.window_started_at
      end
    returning hits
  `)[0]?.hits ?? 1;
}
//#endregion
export { rateLimitConfig as n, rateLimitDecision as r, bumpRateLimit as t };
