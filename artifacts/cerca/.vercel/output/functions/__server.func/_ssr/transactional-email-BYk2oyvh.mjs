import { f as sql, i as dbSource, l as id } from "./helpers-AwcxVs0A.mjs";
import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/transactional-email-BYk2oyvh.js
function hashAuthToken(token) {
	return createHash("sha256").update(token).digest("hex");
}
/** Un token se consume una sola vez y solo si no venció. */
async function consumeAuthToken(db, token) {
	if (!token || token.length < 16 || token.length > 2e3) return false;
	const rows = await db`
    update auth_tokens
    set used_at = now()
    where token_hash = ${hashAuthToken(token)}
      and used_at is null
      and expires_at > now()
    returning token_hash
  `;
	return Boolean(rows[0]);
}
var VERIFY_TTL_SEC = 86400;
var RESET_TTL_SEC = 3600;
async function deliverAuthEmail(input) {
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
	const text = input.kind === "reset" ? `Para elegir una contraseña nueva abrí este enlace. Vence en una hora y sirve una sola vez.\n\n${input.url}` : `Confirmá la cuenta con este enlace. Vence en 24 horas y sirve una sola vez.\n\n${input.url}`;
	if (key && from) {
		if (!(await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${key}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				from,
				to: [email],
				subject,
				text
			})
		})).ok) throw new Error("No se pudo enviar el correo. El enlace no se entregó.");
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
async function consumeVerificationToken(token) {
	if (!await consumeAuthToken(await sql(), token)) throw new Error("Ese enlace ya se usó o venció.");
}
function previewMailboxAllowed() {
	return dbSource === "pglite" && !(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim());
}
//#endregion
export { deliverAuthEmail as n, previewMailboxAllowed as r, consumeVerificationToken as t };
