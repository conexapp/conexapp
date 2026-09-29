import { f as sql, l as id, r as audit, u as loadAccess } from "./helpers-AwcxVs0A.mjs";
import { t as bumpRateLimit } from "./rate-limit-CxIZqdRb.mjs";
import { a as buildSellerAuthorizationUrl, l as readMercadoPagoEnv, s as missingMercadoPagoCredentials } from "./mercadopago-BrD8R2__.mjs";
import { a as ownedBusiness, d as tokenStorageMode, i as loadSeller, l as stateSigningKey, o as packOauthState, t as PRODUCTION } from "./payment-runtime-J3KTxcgp.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-DtBUQ4oz.js
var listSellerPaymentLinks_createServerFn_handler = createServerRpc({
	id: "663296a7af27f2e27ab0e04cfa55730d2c4211e61d501c3e03d2fc1803f1c988",
	name: "listSellerPaymentLinks",
	filename: "src/lib/cerca/server/payments.ts"
}, (opts) => listSellerPaymentLinks.__executeServer(opts));
var listSellerPaymentLinks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listSellerPaymentLinks_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const env = readMercadoPagoEnv();
	const storage = tokenStorageMode({
		productionDatabase: PRODUCTION(),
		tokenKey: env.tokenKey
	});
	const rows = await db`
      select b.id, b.trade_name, spa.status, spa.live_mode, spa.expires_at::text, spa.token_storage, spa.disconnected_at::text
      from businesses b
      left join seller_payment_accounts spa on spa.business_id = b.id and spa.provider = 'mercadopago'
      where b.owner_user_id = ${context.userId} and b.is_demo = false
      order by b.created_at
    `;
	return {
		missing: missingMercadoPagoCredentials(env),
		warning: storage.ok ? storage.warning : "Falta CERCA_TOKEN_KEY. En producción no se guarda el token.",
		businesses: rows.map((row) => ({
			businessId: row.id,
			tradeName: row.trade_name,
			status: row.disconnected_at ? "disconnected" : row.status ?? "missing",
			liveMode: row.live_mode,
			expiresAt: row.expires_at,
			storage: row.token_storage,
			connected: row.status === "connected" && !row.disconnected_at
		}))
	};
});
var startSellerOAuth_createServerFn_handler = createServerRpc({
	id: "39a5a0011edbb27ec30d1bf8886eb2192cdd3d27c983825d9f110addab244344",
	name: "startSellerOAuth",
	filename: "src/lib/cerca/server/payments.ts"
}, (opts) => startSellerOAuth.__executeServer(opts));
var startSellerOAuth = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((businessId) => {
	if (typeof businessId !== "string" || businessId.length < 8 || businessId.length > 80) throw new Error("Negocio inválido.");
	return businessId;
}).handler(startSellerOAuth_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	if (await bumpRateLimit(db, `oauth-start:${context.userId}`, 60) > 10) throw new Error("Demasiados intentos de conexión. Esperá un minuto.");
	await loadAccess(db, context.userId);
	const env = readMercadoPagoEnv();
	const missing = missingMercadoPagoCredentials(env);
	if (!tokenStorageMode({
		productionDatabase: PRODUCTION(),
		tokenKey: env.tokenKey
	}).ok) missing.push("CERCA_TOKEN_KEY");
	if (missing.length > 0 || !env.clientId || !env.redirectUri) return {
		url: null,
		alreadyConnected: false,
		missing,
		message: `No se abrió Mercado Pago. Falta: ${missing.join(", ")}.`
	};
	const owned = await ownedBusiness(db, context.userId, data);
	if (!owned.ok) throw new Error(owned.error);
	const seller = await loadSeller(db, data);
	const expiresMs = seller?.expires_at ? Date.parse(seller.expires_at) : NaN;
	if (seller?.status === "connected" && seller.access_token && Number.isFinite(expiresMs) && expiresMs > Date.now()) return {
		url: null,
		alreadyConnected: true,
		missing: [],
		message: "Este negocio ya tiene Mercado Pago conectado y el token sigue vigente."
	};
	const signing = stateSigningKey(env.tokenKey, PRODUCTION());
	if (!signing) return {
		url: null,
		alreadyConnected: false,
		missing: ["CERCA_TOKEN_KEY"],
		message: "Falta CERCA_TOKEN_KEY. No se firmó el state."
	};
	const nonce = id();
	const exp = Date.now() + 6e5;
	const payload = JSON.stringify({
		nonce,
		businessId: data,
		userId: context.userId,
		exp
	});
	await db`
      insert into oauth_states (nonce, business_id, user_id, expires_at)
      values (${nonce}, ${data}, ${context.userId}, ${new Date(exp).toISOString()})
    `;
	const url = buildSellerAuthorizationUrl({
		clientId: env.clientId,
		redirectUri: env.redirectUri,
		state: packOauthState(payload, signing)
	});
	await audit(db, context.userId, "oauth_start", "business", data, {});
	return {
		url,
		alreadyConnected: false,
		missing: [],
		message: "Redirigiendo a Mercado Pago."
	};
});
var disconnectSellerPayments_createServerFn_handler = createServerRpc({
	id: "062d79fba039d0d8d6fd0cc73135f06f8f65615339c3467c57ca4b5f47f4d84a",
	name: "disconnectSellerPayments",
	filename: "src/lib/cerca/server/payments.ts"
}, (opts) => disconnectSellerPayments.__executeServer(opts));
var disconnectSellerPayments = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((businessId) => {
	if (typeof businessId !== "string" || businessId.length < 8) throw new Error("Negocio inválido.");
	return businessId;
}).handler(disconnectSellerPayments_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const owned = await ownedBusiness(db, context.userId, data);
	if (!owned.ok) throw new Error(owned.error);
	if (!(await db`
      update seller_payment_accounts
      set status = 'disconnected', disconnected_at = now(), access_token = null, refresh_token = null, updated_at = now()
      where business_id = ${data} and provider = 'mercadopago'
      returning business_id
    `)[0]) throw new Error("Ese negocio no tenía Mercado Pago conectado.");
	await audit(db, context.userId, "oauth_disconnect", "business", data, {});
	return {
		ok: true,
		message: "Se desconectó Mercado Pago. Los pagos ya registrados no se borraron."
	};
});
//#endregion
export { disconnectSellerPayments_createServerFn_handler, listSellerPaymentLinks_createServerFn_handler, startSellerOAuth_createServerFn_handler };
