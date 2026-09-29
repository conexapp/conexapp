import { f as sql } from "./helpers-AwcxVs0A.mjs";
import { r as previewMailboxAllowed } from "./transactional-email-BYk2oyvh.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as enforceRateLimit } from "./rate-limit-BoqWzxCk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mailbox-DayxML3z.js
/** Solo el preview sin Resend. Producción no tiene este buzón. */
var getDevMailbox_createServerFn_handler = createServerRpc({
	id: "7458161e1907a40ce044cf547db9f0e4e98e45e18bf0e397da18e047cd54a810",
	name: "getDevMailbox",
	filename: "src/lib/cerca/server/mailbox.ts"
}, (opts) => getDevMailbox.__executeServer(opts));
var getDevMailbox = createServerFn({ method: "GET" }).validator((email) => {
	const value = typeof email === "string" ? email.trim().toLowerCase() : "";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 160) throw new Error("Email inválido.");
	return value;
}).handler(getDevMailbox_createServerFn_handler, async ({ data }) => {
	if (!previewMailboxAllowed()) throw new Error("El buzón de desarrollo no está disponible. El correo sale por Resend.");
	const db = await sql();
	await enforceRateLimit(db, "password_reset", `mailbox:${data}`);
	return db`
      select kind, url, expires_at::text
      from auth_outbox
      where email = ${data} and expires_at > now()
      order by created_at desc
      limit 3
    `;
});
//#endregion
export { getDevMailbox_createServerFn_handler };
