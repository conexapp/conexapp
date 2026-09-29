import { f as sql, i as dbSource, l as id, r as audit } from "./helpers-AwcxVs0A.mjs";
import { t as bumpRateLimit } from "./rate-limit-CxIZqdRb.mjs";
import { t as businessMutation } from "./ownership-GOJqhWNU.mjs";
import { a as allowsMercadoPagoCheckout } from "./payment-methods-BtOKvucv.mjs";
import { t as transitionOrder } from "./orders-CEoJcK6u.mjs";
import { c as paymentSnapshot, d as safePaymentId, i as buildPreferenceBody, l as readMercadoPagoEnv, n as MP_PREFERENCES_URL, o as buildTokenForm, r as MP_TOKEN_URL, s as missingMercadoPagoCredentials, t as MP_PAYMENT_URL, u as refundConfirmed } from "./mercadopago-BrD8R2__.mjs";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/payment-runtime-J3KTxcgp.js
function centsToPesos(cents) {
	if (!Number.isInteger(cents) || cents < 0) throw new Error("Monto inválido.");
	return Number((cents / 100).toFixed(2));
}
/** La preferencia usa la comisión ya congelada en el pedido, no la regla vigente. */
function feeForPreference(frozenCents) {
	return centsToPesos(frozenCents);
}
function centsFromAmount(amount) {
	if (!Number.isFinite(amount) || amount < 0) return null;
	const cents = Math.round(amount * 100);
	return Number.isSafeInteger(cents) ? cents : null;
}
/**
* El id de la notificación no alcanza. Hace falta el objeto del pago,
* el mismo vendedor y el mismo total. Un approved repetido no vuelve a reservar stock.
*/
function paymentApplication(input) {
	if (!input.externalReference || input.externalReference !== input.orderId) return "reject_mismatch";
	if (!input.collectorId || !input.sellerMpUserId || input.collectorId !== input.sellerMpUserId) return "reject_mismatch";
	if (input.amountCents == null || input.amountCents !== input.orderTotalCents) return "reject_mismatch";
	if (input.paymentStatus === "approved") return input.orderStatus === "PENDING_PAYMENT" ? "mark_paid" : "record_only";
	if (input.paymentStatus === "refunded") return input.orderStatus === "PAID" || input.orderStatus === "CANCELLED" ? "mark_refunded" : "record_only";
	return "record_only";
}
function checkoutBlock(input) {
	if (input.missingCredentials.length > 0) return "PAYMENTS_NOT_CONFIGURED";
	if (!input.sellerConnected) return "SELLER_NOT_LINKED";
	if (!input.tokenUsable) return "SELLER_TOKEN_EXPIRED";
	return "ok";
}
function reusePreference(input) {
	if (!input.initPoint || !input.expiresAt) return false;
	const expires = Date.parse(input.expiresAt);
	return Number.isFinite(expires) && expires > input.nowMs;
}
function refundDecision(input) {
	if (!input.configured) return {
		orderBecomesRefunded: false,
		refundStatus: "blocked_unconfigured"
	};
	if (!input.confirmed) return {
		orderBecomesRefunded: false,
		refundStatus: "failed"
	};
	return {
		orderBecomesRefunded: true,
		refundStatus: "refunded"
	};
}
function tokenStorageMode(input) {
	if ((input.tokenKey?.trim() ?? "").length >= 16) return {
		ok: true,
		mode: "encrypted",
		warning: null
	};
	if (!input.productionDatabase) return {
		ok: true,
		mode: "dev_plaintext",
		warning: "Falta CERCA_TOKEN_KEY. En esta base embebida el token del vendedor queda en texto plano. No sirve para producción."
	};
	return {
		ok: false,
		missing: ["CERCA_TOKEN_KEY"]
	};
}
function shouldRefreshToken(expiresAtMs, nowMs) {
	if (expiresAtMs == null || !Number.isFinite(expiresAtMs)) return true;
	return expiresAtMs - nowMs < 6048e5;
}
function processorFeeCents(details) {
	if (!details) return null;
	const fee = details.find((item) => item.type === "mercadopago_fee");
	if (!fee || typeof fee.amount !== "number") return null;
	return centsFromAmount(fee.amount);
}
/** Solo hay neto si Mercado Pago informó su comisión. Cero inventado no cuenta. */
function supplierNetCents(input) {
	if (input.processorFeeCents == null) return null;
	return input.grossCents - input.marketplaceFeeCents - input.processorFeeCents;
}
function notificationSellerId(body) {
	if (!body || body.user_id == null) return null;
	return String(body.user_id).trim() || null;
}
var DEV_STATE_KEY = "dev-only-oauth-state-not-for-production";
function encryptSecret(plain, key) {
	const keyBuf = createHash("sha256").update(key).digest();
	const iv = randomBytes(12);
	const cipher = createCipheriv("aes-256-gcm", keyBuf, iv);
	const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}
function decryptSecret(payload, key) {
	const [version, ivB64, tagB64, dataB64] = payload.split(".");
	if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) throw new Error("Token cifrado inválido.");
	const keyBuf = createHash("sha256").update(key).digest();
	const decipher = createDecipheriv("aes-256-gcm", keyBuf, Buffer.from(ivB64, "base64url"));
	decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
	return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64url")), decipher.final()]).toString("utf8");
}
function sealToken(plain, mode, key) {
	if (mode === "encrypted") {
		if (!key || key.trim().length < 16) throw new Error("Falta CERCA_TOKEN_KEY.");
		return encryptSecret(plain, key.trim());
	}
	return plain;
}
function openToken(input) {
	if (!input.stored) return null;
	if (input.storage === "dev_plaintext") {
		if (input.productionDatabase) return null;
		return input.stored;
	}
	const key = input.tokenKey?.trim() ?? "";
	if (key.length < 16) return null;
	try {
		return decryptSecret(input.stored, key);
	} catch {
		return null;
	}
}
function stateSigningKey(tokenKey, productionDatabase) {
	const key = tokenKey?.trim() ?? "";
	if (key.length >= 16) return key;
	if (!productionDatabase) return DEV_STATE_KEY;
	return null;
}
function packOauthState(payload, key) {
	const sig = createHmac("sha256", key).update(payload).digest("hex");
	return `${Buffer.from(payload, "utf8").toString("base64url")}.${sig}`;
}
function unpackOauthState(state, key) {
	const dot = state.lastIndexOf(".");
	if (dot <= 0) return null;
	const encoded = state.slice(0, dot);
	const sig = state.slice(dot + 1);
	let payload;
	try {
		payload = Buffer.from(encoded, "base64url").toString("utf8");
	} catch {
		return null;
	}
	const expected = createHmac("sha256", key).update(payload).digest("hex");
	const a = Buffer.from(expected);
	const b = Buffer.from(sig);
	if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	return payload;
}
var PREFERENCE_TTL_MS = 864e5;
var PRODUCTION = () => dbSource === "neon";
function publicProviderMessage(value) {
	if (typeof value !== "string") return "";
	if (/APP_USR|TEST-|TG-|access_token|refresh_token|Bearer/i.test(value)) return "";
	return value.replace(/\s+/g, " ").trim().slice(0, 180);
}
async function postForm(form) {
	const response = await fetch(MP_TOKEN_URL, {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/x-www-form-urlencoded"
		},
		body: form,
		signal: AbortSignal.timeout(8e3)
	});
	const json = await response.json().catch(() => null);
	return {
		status: response.status,
		json
	};
}
function expiresInSeconds(value) {
	if (typeof value === "number" && Number.isInteger(value) && value > 60 && value < 1728e4) return value;
	return 15552e3;
}
async function saveSellerTokens(db, input) {
	const env = readMercadoPagoEnv();
	const mode = tokenStorageMode({
		productionDatabase: PRODUCTION(),
		tokenKey: env.tokenKey
	});
	if (!mode.ok) throw new Error("Falta CERCA_TOKEN_KEY. No se guardó el token.");
	const access = sealToken(input.accessToken, mode.mode, env.tokenKey);
	const refresh = sealToken(input.refreshToken, mode.mode, env.tokenKey);
	const expiresAt = new Date(Date.now() + input.expiresIn * 1e3).toISOString();
	await db`
    insert into seller_payment_accounts (
      business_id, provider, provider_user_id, access_token, refresh_token, public_key,
      expires_at, live_mode, status, scope, token_storage, disconnected_at, updated_at
    ) values (
      ${input.businessId}, 'mercadopago', ${input.mpUserId}, ${access}, ${refresh}, ${input.publicKey},
      ${expiresAt}, ${input.liveMode}, 'connected', ${input.scope.slice(0, 200)}, ${mode.mode}, null, now()
    )
    on conflict (business_id) do update set
      provider = 'mercadopago',
      provider_user_id = excluded.provider_user_id,
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      public_key = excluded.public_key,
      expires_at = excluded.expires_at,
      live_mode = excluded.live_mode,
      status = 'connected',
      scope = excluded.scope,
      token_storage = excluded.token_storage,
      disconnected_at = null,
      updated_at = now()
  `;
}
async function loadSeller(db, businessId) {
	return (await db`
    select business_id, provider_user_id, access_token, refresh_token, token_storage, expires_at::text, status
    from seller_payment_accounts
    where business_id = ${businessId} and provider = 'mercadopago'
  `)[0] ?? null;
}
async function markRefreshFailed(db, businessId) {
	await db`
    update seller_payment_accounts
    set status = 'refresh_failed', updated_at = now()
    where business_id = ${businessId} and provider = 'mercadopago' and status = 'connected'
  `;
}
async function usableSellerToken(db, businessId) {
	const seller = await loadSeller(db, businessId);
	if (!seller || seller.status !== "connected" || !seller.access_token || !seller.provider_user_id) return { error: "not_linked" };
	const env = readMercadoPagoEnv();
	const production = PRODUCTION();
	const access = openToken({
		stored: seller.access_token,
		storage: seller.token_storage,
		tokenKey: env.tokenKey,
		productionDatabase: production
	});
	if (!access) return { error: "unreadable" };
	const expiresMs = seller.expires_at ? Date.parse(seller.expires_at) : null;
	if (!shouldRefreshToken(Number.isFinite(expiresMs) ? expiresMs : null, Date.now())) return {
		token: access,
		mpUserId: seller.provider_user_id
	};
	const refresh = openToken({
		stored: seller.refresh_token,
		storage: seller.token_storage,
		tokenKey: env.tokenKey,
		productionDatabase: production
	});
	if (!refresh || !env.clientId || !env.clientSecret) {
		await markRefreshFailed(db, businessId);
		return { error: "refresh_failed" };
	}
	const exchanged = await postForm(buildTokenForm({
		clientId: env.clientId,
		clientSecret: env.clientSecret,
		grant: "refresh_token",
		refreshToken: refresh
	}));
	const next = exchanged.json;
	if (exchanged.status !== 200 || !next?.access_token || !next.refresh_token) {
		await markRefreshFailed(db, businessId);
		return { error: "refresh_failed" };
	}
	await saveSellerTokens(db, {
		businessId,
		mpUserId: String(next.user_id ?? seller.provider_user_id),
		accessToken: next.access_token,
		refreshToken: next.refresh_token,
		publicKey: next.public_key ?? "",
		expiresIn: expiresInSeconds(next.expires_in),
		liveMode: next.live_mode === true,
		scope: next.scope ?? ""
	});
	return {
		token: next.access_token,
		mpUserId: String(next.user_id ?? seller.provider_user_id)
	};
}
async function ownedBusiness(db, userId, businessId) {
	const business = (await db`
    select id, owner_user_id, status, is_demo, trade_name from businesses where id = ${businessId}
  `)[0];
	const decision = businessMutation({
		actorUserId: userId,
		ownerUserId: business?.owner_user_id ?? null,
		isDemo: business?.is_demo,
		businessStatus: business?.status
	});
	if (!decision.ok) return {
		ok: false,
		error: decision.reason
	};
	if (!business) return {
		ok: false,
		error: "Ese negocio no existe."
	};
	return {
		ok: true,
		business
	};
}
async function completeSellerOAuth(input) {
	const env = readMercadoPagoEnv();
	const missing = missingMercadoPagoCredentials(env);
	const storage = tokenStorageMode({
		productionDatabase: PRODUCTION(),
		tokenKey: env.tokenKey
	});
	if (!storage.ok) missing.push("CERCA_TOKEN_KEY");
	if (missing.length > 0 || !env.clientId || !env.clientSecret || !env.redirectUri || !storage.ok) return {
		ok: false,
		message: `No se vinculó. Falta: ${missing.join(", ")}.`
	};
	const signing = stateSigningKey(env.tokenKey, PRODUCTION());
	if (!signing) return {
		ok: false,
		message: "Falta CERCA_TOKEN_KEY. No se aceptó el state."
	};
	const payload = unpackOauthState(input.state, signing);
	if (!payload) return {
		ok: false,
		message: "El state no es válido."
	};
	let parsed;
	try {
		parsed = JSON.parse(payload);
	} catch {
		return {
			ok: false,
			message: "El state no es válido."
		};
	}
	if (!parsed.nonce || !parsed.businessId || !parsed.userId || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return {
		ok: false,
		message: "El state venció. Conectá de nuevo."
	};
	const db = await sql();
	if (!(await db`
    update oauth_states
    set used_at = now()
    where nonce = ${parsed.nonce}
      and business_id = ${parsed.businessId}
      and user_id = ${parsed.userId}
      and used_at is null
      and expires_at > now()
    returning nonce
  `)[0]) return {
		ok: false,
		message: "Ese intento de conexión ya se usó o venció."
	};
	const owned = await ownedBusiness(db, parsed.userId, parsed.businessId);
	if (!owned.ok) return {
		ok: false,
		message: owned.error
	};
	const exchanged = await postForm(buildTokenForm({
		clientId: env.clientId,
		clientSecret: env.clientSecret,
		grant: "authorization_code",
		code: input.code,
		redirectUri: env.redirectUri,
		state: parsed.nonce
	}));
	const token = exchanged.json;
	if (exchanged.status !== 200 || !token?.access_token || !token.refresh_token || token.user_id == null) return {
		ok: false,
		message: "Mercado Pago rechazó la vinculación. El código dura unos 10 minutos."
	};
	await saveSellerTokens(db, {
		businessId: parsed.businessId,
		mpUserId: String(token.user_id),
		accessToken: token.access_token,
		refreshToken: token.refresh_token,
		publicKey: token.public_key ?? "",
		expiresIn: expiresInSeconds(token.expires_in),
		liveMode: token.live_mode === true,
		scope: token.scope ?? ""
	});
	await audit(db, parsed.userId, "oauth_connected", "business", parsed.businessId, {
		mpUserId: String(token.user_id),
		liveMode: token.live_mode === true,
		storage: storage.mode
	});
	return {
		ok: true,
		message: storage.warning ? `Cuenta vinculada. ${storage.warning}` : "Cuenta de Mercado Pago vinculada. El token no se muestra."
	};
}
async function upsertPayment(db, input) {
	const raw = JSON.stringify(input.raw);
	if ((await db`
    update payments
    set status = ${input.status}, amount_cents = ${input.amountCents}, raw = ${raw}::jsonb, updated_at = now()
    where provider = 'mercadopago' and provider_payment_id = ${input.paymentId}
    returning id
  `)[0]) return;
	await db`
    insert into payments (id, order_id, provider, provider_payment_id, status, amount_cents, raw, expires_at)
    values (
      ${id()}, ${input.orderId}, 'mercadopago', ${input.paymentId}, ${input.status},
      ${input.amountCents}, ${raw}::jsonb, ${input.expiresAt ?? null}
    )
  `;
}
async function markPaid(db, orderId) {
	transitionOrder({
		from: "PENDING_PAYMENT",
		action: "payment_approved",
		actor: "system",
		fulfillment: "delivery"
	});
	const rows = await db`
    with updated as (
      update orders
      set status = 'PAID', settlement_status = 'awaiting_provider', updated_at = now()
      where id = ${orderId} and status = 'PENDING_PAYMENT'
      returning id
    )
    insert into order_events (id, order_id, from_status, to_status, actor_user_id, actor_kind, note)
    select ${id()}, id, 'PENDING_PAYMENT', 'PAID', null, 'system',
      'Mercado Pago aprobó el pago. La liquidación queda en awaiting_provider: Split 1:1 no documenta liberar fondos al entregar.'
    from updated
    returning order_id as id
  `;
	return Boolean(rows[0]);
}
async function markRefunded(db, orderId, from, fulfillment) {
	const next = transitionOrder({
		from,
		action: "provider_refund_confirmed",
		actor: "system",
		fulfillment
	});
	const rows = await db`
    with target as (
      select id, stock_reserved from orders where id = ${orderId} and status = ${from}
    ),
    moved as (
      update orders o
      set status = ${next}, refund_status = 'refunded', stock_reserved = false, updated_at = now()
      from target t
      where o.id = t.id
      returning o.id, t.stock_reserved as was_reserved
    ),
    restored as (
      update listings l
      set stock_units = l.stock_units + oi.quantity,
          status = case
            when l.status = 'out_of_stock' and l.stock_units + oi.quantity > 0 then 'published'
            else l.status
          end,
          updated_at = now()
      from order_items oi
      join moved m on m.id = oi.order_id and m.was_reserved = true
      where oi.listing_id = l.id
      returning l.id
    )
    insert into order_events (id, order_id, from_status, to_status, actor_user_id, actor_kind, note)
    select ${id()}, id, ${from}, ${next}, null, 'system', 'Mercado Pago confirmó el reembolso.'
    from moved
    returning order_id as id
  `;
	return Boolean(rows[0]);
}
async function settleCancellationRefund(orderId) {
	const db = await sql();
	const order = (await db`
    select status, business_id, fulfillment from orders where id = ${orderId}
  `)[0];
	if (!order) return {
		status: "CANCELLED",
		message: "Pedido inexistente."
	};
	if (order.status === "REFUNDED") return {
		status: "REFUNDED",
		message: "El reembolso ya estaba confirmado."
	};
	if (order.status !== "CANCELLED") return {
		status: order.status,
		message: "El pedido no quedó cancelado."
	};
	const paymentId = (await db`
    select provider_payment_id from payments
    where order_id = ${orderId} and provider = 'mercadopago' and status = 'approved' and provider_payment_id is not null
    order by created_at desc
    limit 1
  `)[0]?.provider_payment_id ?? null;
	const missing = missingMercadoPagoCredentials(readMercadoPagoEnv());
	const configured = missing.length === 0 && Boolean(paymentId);
	const fail = async (refundStatus, message) => {
		await db`
      update orders set refund_status = ${refundStatus}, updated_at = now()
      where id = ${orderId} and status = 'CANCELLED' and refund_status <> 'refunded'
    `;
		await db`
      insert into order_events (id, order_id, from_status, to_status, actor_user_id, actor_kind, note)
      values (${id()}, ${orderId}, 'CANCELLED', 'CANCELLED', null, 'system', ${message})
    `;
		return {
			status: "CANCELLED",
			message
		};
	};
	if (!configured) {
		const decision = refundDecision({
			configured: false,
			confirmed: false
		});
		return fail(decision.refundStatus === "refunded" ? "failed" : decision.refundStatus, !paymentId ? "No hay un pago approved para reembolsar. El pedido quedó CANCELLED, no REFUNDED." : `No se reembolsó. Falta: ${missing.join(", ")}. El pedido quedó CANCELLED, no REFUNDED.`);
	}
	const token = await usableSellerToken(db, order.business_id);
	if (!("token" in token)) return fail("failed", "No se reembolsó: el token del vendedor no está usable. El pedido quedó CANCELLED, no REFUNDED.");
	let confirmed = false;
	try {
		const response = await fetch(`${MP_PAYMENT_URL}/${encodeURIComponent(paymentId)}/refunds`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token.token}`,
				"Content-Type": "application/json",
				"X-Idempotency-Key": `refund:${orderId}:${paymentId}`
			},
			body: "{}",
			signal: AbortSignal.timeout(8e3)
		});
		const body = await response.json().catch(() => null);
		confirmed = refundConfirmed(response.status, body);
		await db`
      insert into payments (id, order_id, provider, status, raw)
      values (
        ${id()}, ${orderId}, 'mercadopago', ${confirmed ? "refunded" : "refund_rejected"},
        ${JSON.stringify({
			paymentId,
			httpStatus: response.status,
			refundStatus: body?.status ?? null
		})}::jsonb
      )
    `;
	} catch {
		confirmed = false;
	}
	if (!refundDecision({
		configured: true,
		confirmed
	}).orderBecomesRefunded) return fail("failed", "Mercado Pago no confirmó el reembolso. El pedido quedó CANCELLED, no REFUNDED.");
	const marked = await markRefunded(db, orderId, "CANCELLED", order.fulfillment);
	return {
		status: marked ? "REFUNDED" : "CANCELLED",
		message: marked ? "Mercado Pago confirmó el reembolso." : "Mercado Pago confirmó el reembolso, pero el pedido ya no estaba cancelado."
	};
}
async function createCheckoutPreference(input) {
	const db = await sql();
	if (await bumpRateLimit(db, `checkout:${input.userId}`, 60) > 8) return {
		ok: false,
		code: "RATE_LIMITED",
		missing: [],
		message: "Demasiados intentos de pago. Esperá un minuto."
	};
	const order = (await db`
    select id, status, buyer_user_id, business_id, shipping_cents::text, total_cents::text,
      payment_method, payment_declared
    from orders where id = ${input.orderId}
  `)[0];
	if (!order || order.buyer_user_id !== input.userId) throw new Error("No es tu pedido.");
	if (order.status !== "PENDING_PAYMENT") throw new Error("Ese pedido no está esperando pago.");
	const declared = order.payment_declared === true;
	if (!allowsMercadoPagoCheckout({
		method: order.payment_method,
		declared
	})) return {
		ok: false,
		code: "METHOD_NOT_MERCADOPAGO",
		missing: [],
		message: "Este pedido no se cobra con Mercado Pago. Elegir otro medio no confirma el pago."
	};
	const env = readMercadoPagoEnv();
	const missing = missingMercadoPagoCredentials(env);
	if (missing.length > 0) {
		await audit(db, input.userId, "checkout_blocked", "order", order.id, { missing });
		return {
			ok: false,
			code: "PAYMENTS_NOT_CONFIGURED",
			missing,
			message: `No se inició ningún cobro. Falta: ${missing.join(", ")}. El pedido sigue en PENDING_PAYMENT.`
		};
	}
	const economics = await db`
    select marketplace_fee_cents::text from order_economics where order_id = ${order.id}
  `;
	if (!economics[0]) return {
		ok: false,
		code: "FEE_NOT_FROZEN",
		missing: [],
		message: "El pedido no tiene la comisión congelada. No se inventó un marketplace_fee."
	};
	const feeCents = Number(economics[0].marketplace_fee_cents);
	const seller = await loadSeller(db, order.business_id);
	const token = await usableSellerToken(db, order.business_id);
	const block = checkoutBlock({
		missingCredentials: [],
		sellerConnected: Boolean(seller && seller.status === "connected"),
		tokenUsable: "token" in token
	});
	if (block !== "ok" || !("token" in token)) {
		const code = block === "ok" ? "SELLER_TOKEN_EXPIRED" : block;
		await audit(db, input.userId, "checkout_blocked", "order", order.id, { code });
		return {
			ok: false,
			code,
			missing: [],
			message: code === "SELLER_NOT_LINKED" ? "El proveedor no conectó Mercado Pago. No se creó una preferencia." : "El token del proveedor no está usable. Tiene que reconectar Mercado Pago. No se usó un token vencido."
		};
	}
	const current = (await db`
    select raw->>'init_point' as init_point, expires_at::text
    from payments
    where order_id = ${order.id} and provider = 'mercadopago' and status = 'preference_created'
    order by created_at desc
    limit 1
  `)[0];
	if (current && reusePreference({
		initPoint: current.init_point,
		expiresAt: current.expires_at,
		nowMs: Date.now()
	})) return {
		ok: true,
		code: "REDIRECT",
		redirectUrl: current.init_point,
		missing: [],
		message: "Se reutilizó la preferencia vigente."
	};
	const preferenceItems = (await db`
    select id, title, quantity, unit_price_cents::text from order_items where order_id = ${order.id}
  `).map((item) => ({
		id: item.id,
		title: item.title,
		quantity: item.quantity,
		unitPrice: centsToPesos(Number(item.unit_price_cents))
	}));
	const shippingCents = Number(order.shipping_cents);
	if (shippingCents > 0) preferenceItems.push({
		id: `${order.id}-envio`,
		title: "Envío",
		quantity: 1,
		unitPrice: centsToPesos(shippingCents)
	});
	const expiresAt = new Date(Date.now() + PREFERENCE_TTL_MS).toISOString();
	const attempts = await db`
    select count(*)::int as n from payments
    where order_id = ${order.id} and provider = 'mercadopago' and status = 'preference_created'
  `;
	const preference = buildPreferenceBody({
		items: preferenceItems,
		marketplaceFee: feeForPreference(feeCents),
		externalReference: order.id,
		notificationUrl: env.webhookUrl,
		expirationDateTo: expiresAt
	});
	const response = await fetch(MP_PREFERENCES_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token.token}`,
			"Content-Type": "application/json",
			"X-Idempotency-Key": `pref:${order.id}:${(attempts[0]?.n ?? 0) + 1}`
		},
		body: JSON.stringify(preference),
		signal: AbortSignal.timeout(8e3)
	});
	const payload = await response.json().catch(() => null);
	if (!response.ok || !payload?.init_point) {
		await audit(db, input.userId, "checkout_rejected", "order", order.id, { status: response.status });
		return {
			ok: false,
			code: "PROVIDER_REJECTED",
			missing: [],
			message: `Mercado Pago no creó la preferencia (${response.status}). El pedido sigue impago. ${publicProviderMessage(payload?.message)}`.trim()
		};
	}
	await db`
    insert into payments (id, order_id, provider, status, raw, expires_at)
    values (
      ${id()}, ${order.id}, 'mercadopago', 'preference_created',
      ${JSON.stringify({
		preference_id: payload.id ?? null,
		init_point: payload.init_point
	})}::jsonb,
      ${expiresAt}
    )
  `;
	await audit(db, input.userId, "checkout_preference", "order", order.id, { preferenceId: payload.id ?? null });
	return {
		ok: true,
		code: "REDIRECT",
		redirectUrl: payload.init_point,
		missing: [],
		message: "Preferencia creada."
	};
}
async function finishEvent(db, eventId, status, error) {
	await db`
    update payment_events
    set processing_status = ${status}, processing_error = ${error}
    where id = ${eventId}
  `;
}
async function processMercadoPagoWebhook(input) {
	const db = await sql();
	const paymentId = safePaymentId(input.dataId);
	const notificationId = input.body?.id != null ? String(input.body.id).slice(0, 80) : `payment:${paymentId ?? "none"}`;
	const storedPayload = JSON.stringify(input.body ?? {});
	const payload = storedPayload.length > 2e4 ? JSON.stringify({ truncated: true }) : storedPayload;
	const event = (await db`
    insert into payment_events (
      id, provider, notification_id, provider_resource_id, topic, signature_ok, payload, processing_status
    ) values (
      ${id()}, 'mercadopago', ${notificationId}, ${paymentId}, ${input.topic.slice(0, 80)}, true, ${payload}::jsonb, 'received'
    )
    on conflict (provider, notification_id) do update
    set processing_status = payment_events.processing_status
    returning id, processing_status
  `)[0];
	if (!event) return {
		httpStatus: 500,
		body: { ok: false }
	};
	if (event.processing_status === "applied" || event.processing_status === "ignored") return {
		httpStatus: 200,
		body: {
			ok: true,
			processing: event.processing_status
		}
	};
	if (!paymentId) {
		await finishEvent(db, event.id, "ignored", "Sin data.id.");
		return {
			httpStatus: 200,
			body: {
				ok: true,
				processing: "ignored"
			}
		};
	}
	const sellerMpUserId = notificationSellerId(input.body);
	if (!sellerMpUserId) {
		await finishEvent(db, event.id, "unmatched_seller", "La notificación no trae user_id.");
		return {
			httpStatus: 200,
			body: {
				ok: true,
				processing: "unmatched_seller"
			}
		};
	}
	const seller = (await db`
    select business_id from seller_payment_accounts
    where provider = 'mercadopago' and provider_user_id = ${sellerMpUserId} and status = 'connected' and disconnected_at is null
  `)[0];
	if (!seller) {
		await finishEvent(db, event.id, "unmatched_seller", "Ningún vendedor conectado coincide con user_id.");
		return {
			httpStatus: 200,
			body: {
				ok: true,
				processing: "unmatched_seller"
			}
		};
	}
	const token = await usableSellerToken(db, seller.business_id);
	if (!("token" in token)) {
		await finishEvent(db, event.id, "failed", "Token del vendedor no usable.");
		return {
			httpStatus: 500,
			body: {
				ok: false,
				processing: "failed"
			}
		};
	}
	let payment = null;
	let httpStatus = 0;
	try {
		const response = await fetch(`${MP_PAYMENT_URL}/${encodeURIComponent(paymentId)}`, {
			headers: { Authorization: `Bearer ${token.token}` },
			signal: AbortSignal.timeout(8e3)
		});
		httpStatus = response.status;
		payment = await response.json().catch(() => null);
		if (!response.ok || !payment) {
			await finishEvent(db, event.id, "failed", `GET pago respondió ${response.status}.`);
			return {
				httpStatus: 500,
				body: {
					ok: false,
					processing: "failed"
				}
			};
		}
	} catch {
		await finishEvent(db, event.id, "failed", "No se pudo leer el pago.");
		return {
			httpStatus: 500,
			body: {
				ok: false,
				processing: "failed"
			}
		};
	}
	const reference = payment.external_reference ? String(payment.external_reference) : null;
	if (!reference) {
		await finishEvent(db, event.id, "ignored", "El pago no trae external_reference.");
		return {
			httpStatus: 200,
			body: {
				ok: true,
				processing: "ignored"
			}
		};
	}
	const order = (await db`
    select id, status, total_cents::text, business_id, fulfillment from orders where id = ${reference}
  `)[0];
	if (!order) {
		await finishEvent(db, event.id, "ignored", "No existe un pedido con esa referencia. No se creó uno.");
		return {
			httpStatus: 200,
			body: {
				ok: true,
				processing: "ignored"
			}
		};
	}
	if (order.business_id !== seller.business_id) {
		await finishEvent(db, event.id, "mismatch", "El pago no es del vendedor del pedido.");
		return {
			httpStatus: 200,
			body: {
				ok: true,
				processing: "mismatch"
			}
		};
	}
	const amount = typeof payment.transaction_amount === "number" ? centsFromAmount(payment.transaction_amount) : null;
	const decision = paymentApplication({
		paymentStatus: payment.status ?? "",
		externalReference: reference,
		collectorId: payment.collector_id == null ? null : String(payment.collector_id),
		amountCents: amount,
		orderId: order.id,
		orderStatus: order.status,
		orderTotalCents: Number(order.total_cents),
		sellerMpUserId
	});
	const snapshot = paymentSnapshot(payment);
	if (decision === "reject_mismatch") {
		await finishEvent(db, event.id, "mismatch", "Referencia, vendedor o monto no coinciden. El pedido no cambió.");
		return {
			httpStatus: 200,
			body: {
				ok: true,
				processing: "mismatch"
			}
		};
	}
	try {
		await upsertPayment(db, {
			orderId: order.id,
			paymentId: String(payment.id ?? paymentId),
			status: payment.status ?? "unknown",
			amountCents: amount,
			raw: snapshot
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (!/duplicate|unique/i.test(message)) throw error;
		await db`
      update payments
      set status = ${payment.status ?? "unknown"}, amount_cents = ${amount}, raw = ${JSON.stringify(snapshot)}::jsonb, updated_at = now()
      where provider = 'mercadopago' and provider_payment_id = ${String(payment.id ?? paymentId)}
    `;
	}
	const fee = processorFeeCents(payment.fee_details);
	if (fee != null) await db`
      update order_economics set processor_fee_cents = ${fee}
      where order_id = ${order.id}
    `;
	if (decision === "mark_paid") {
		await markPaid(db, order.id);
		await finishEvent(db, event.id, "applied", null);
		return {
			httpStatus: 200,
			body: {
				ok: true,
				processing: "applied",
				orderStatus: "PAID"
			}
		};
	}
	if (decision === "mark_refunded") {
		await markRefunded(db, order.id, order.status, order.fulfillment);
		await finishEvent(db, event.id, "applied", null);
		return {
			httpStatus: 200,
			body: {
				ok: true,
				processing: "applied",
				orderStatus: "REFUNDED"
			}
		};
	}
	await finishEvent(db, event.id, "applied", `Estado ${payment.status ?? "desconocido"} registrado. El pedido no pasó a PAID.`);
	return {
		httpStatus: 200,
		body: {
			ok: true,
			processing: "record_only",
			paymentStatus: payment.status ?? null,
			httpStatus
		}
	};
}
//#endregion
export { ownedBusiness as a, settleCancellationRefund as c, tokenStorageMode as d, loadSeller as i, stateSigningKey as l, completeSellerOAuth as n, packOauthState as o, createCheckoutPreference as r, processMercadoPagoWebhook as s, PRODUCTION as t, supplierNetCents as u };
