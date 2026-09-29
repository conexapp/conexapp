import { createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/mercadopago-BrD8R2__.js
/**
* Split de Pagos 1:1 — Checkout Pro, Argentina.
* marketplace_fee es un monto en pesos. La preferencia y el GET del pago
* usan el access_token OAuth del vendedor. La comisión de Mercado Pago se
* descuenta del vendedor antes que la del marketplace. El reembolso es
* proporcional y puede fallar si el vendedor no tiene saldo.
* No hay, en esa documentación, una llamada para liberar fondos al validar
* el código de entrega.
*/
var MP_OAUTH_URL = "https://auth.mercadopago.com.ar/authorization";
var MP_TOKEN_URL = "https://api.mercadopago.com/oauth/token";
var MP_PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";
var MP_PAYMENT_URL = "https://api.mercadopago.com/v1/payments";
function pick(env, primary, legacy) {
	return env[primary]?.trim() || env[legacy]?.trim() || void 0;
}
function readMercadoPagoEnv(env = process.env) {
	return {
		clientId: pick(env, "MP_CLIENT_ID", "MERCADOPAGO_CLIENT_ID"),
		clientSecret: pick(env, "MP_CLIENT_SECRET", "MERCADOPAGO_CLIENT_SECRET"),
		webhookSecret: pick(env, "MP_WEBHOOK_SECRET", "MERCADOPAGO_WEBHOOK_SECRET"),
		redirectUri: pick(env, "MP_REDIRECT_URI", "MERCADOPAGO_REDIRECT_URI"),
		webhookUrl: pick(env, "MP_WEBHOOK_URL", "MERCADOPAGO_WEBHOOK_URL"),
		tokenKey: env.CERCA_TOKEN_KEY?.trim() || void 0
	};
}
function missingMercadoPagoCredentials(env) {
	const missing = [];
	if (!env.clientId) missing.push("MP_CLIENT_ID");
	if (!env.clientSecret) missing.push("MP_CLIENT_SECRET");
	if (!env.redirectUri) missing.push("MP_REDIRECT_URI");
	if (!env.webhookSecret) missing.push("MP_WEBHOOK_SECRET");
	if (!env.webhookUrl) missing.push("MP_WEBHOOK_URL");
	return missing;
}
function buildSellerAuthorizationUrl(input) {
	const url = new URL(MP_OAUTH_URL);
	url.searchParams.set("client_id", input.clientId);
	url.searchParams.set("response_type", "code");
	url.searchParams.set("platform_id", "mp");
	url.searchParams.set("redirect_uri", input.redirectUri);
	url.searchParams.set("state", input.state);
	return url.toString();
}
function buildTokenForm(input) {
	const form = new URLSearchParams();
	form.set("client_id", input.clientId);
	form.set("client_secret", input.clientSecret);
	form.set("grant_type", input.grant);
	if (input.grant === "authorization_code") {
		form.set("code", input.code ?? "");
		form.set("redirect_uri", input.redirectUri ?? "");
		if (input.state) form.set("state", input.state);
	} else form.set("refresh_token", input.refreshToken ?? "");
	return form;
}
/** Cuerpo documentado de POST /checkout/preferences para marketplace 1:1. */
function buildPreferenceBody(input) {
	if (!(input.marketplaceFee >= 0)) throw new Error("marketplace_fee inválido.");
	return {
		items: input.items.map((item) => ({
			id: item.id,
			title: item.title,
			quantity: item.quantity,
			unit_price: item.unitPrice,
			currency_id: "ARS"
		})),
		marketplace_fee: input.marketplaceFee,
		external_reference: input.externalReference,
		...input.notificationUrl ? { notification_url: input.notificationUrl } : {},
		...input.expirationDateTo ? {
			expires: true,
			expiration_date_to: input.expirationDateTo
		} : {}
	};
}
function paymentSnapshot(payment) {
	return {
		id: payment.id,
		status: payment.status,
		status_detail: payment.status_detail,
		transaction_amount: payment.transaction_amount,
		currency_id: payment.currency_id,
		external_reference: payment.external_reference,
		collector_id: payment.collector_id,
		fee_details: payment.fee_details ?? null
	};
}
function refundConfirmed(status, body) {
	if (status !== 200 && status !== 201) return false;
	return body?.status === "approved" || body?.status === "refunded";
}
/**
* Manifest oficial:
* id:[data.id];request-id:[x-request-id];ts:[ts];
* data.id se toma de la query. Si es alfanumérico, va en minúsculas.
* Si falta data.id o x-request-id, ese par se omite.
*/
function mercadoPagoManifest(input) {
	const parts = [];
	if (input.dataId) parts.push(`id:${input.dataId.toLowerCase()}`);
	if (input.requestId) parts.push(`request-id:${input.requestId}`);
	parts.push(`ts:${input.ts}`);
	return `${parts.join(";")};`;
}
function signMercadoPagoManifest(manifest, secret) {
	return createHmac("sha256", secret).update(manifest).digest("hex");
}
function parseSignatureHeader(header) {
	if (!header) return null;
	const found = {};
	for (const piece of header.split(",")) {
		const [key, value] = piece.split("=");
		if (key && value) found[key.trim()] = value.trim();
	}
	if (!found.ts || !found.v1) return null;
	return {
		ts: found.ts,
		v1: found.v1
	};
}
function verifyMercadoPagoSignature(input) {
	const parsed = parseSignatureHeader(input.header);
	if (!parsed) return false;
	const expected = signMercadoPagoManifest(mercadoPagoManifest({
		dataId: input.dataId,
		requestId: input.requestId,
		ts: parsed.ts
	}), input.secret);
	const a = Buffer.from(expected);
	const b = Buffer.from(parsed.v1);
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}
function safePaymentId(value) {
	if (!value || !/^[A-Za-z0-9_-]{1,48}$/.test(value)) return null;
	return value;
}
//#endregion
export { buildSellerAuthorizationUrl as a, paymentSnapshot as c, safePaymentId as d, verifyMercadoPagoSignature as f, buildPreferenceBody as i, readMercadoPagoEnv as l, MP_PREFERENCES_URL as n, buildTokenForm as o, MP_TOKEN_URL as r, missingMercadoPagoCredentials as s, MP_PAYMENT_URL as t, refundConfirmed as u };
