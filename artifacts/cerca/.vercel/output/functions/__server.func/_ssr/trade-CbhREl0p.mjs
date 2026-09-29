import { a as deliveryPepper, d as notify, f as sql, i as dbSource, l as id, n as assertString, r as audit, t as asInt, u as loadAccess } from "./helpers-AwcxVs0A.mjs";
import { n as orderAccess } from "./ownership-GOJqhWNU.mjs";
import { a as allowsMercadoPagoCheckout, i as acceptedMethods, o as decidePaymentChoice, s as describePayment } from "./payment-methods-BtOKvucv.mjs";
import { t as transitionOrder } from "./orders-CEoJcK6u.mjs";
import { l as readMercadoPagoEnv, s as missingMercadoPagoCredentials } from "./mercadopago-BrD8R2__.mjs";
import { c as settleCancellationRefund, d as tokenStorageMode, r as createCheckoutPreference, u as supplierNetCents } from "./payment-runtime-J3KTxcgp.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as enforceRateLimit } from "./rate-limit-BoqWzxCk.mjs";
import { t as can } from "./permissions-BdbdDlQV.mjs";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/trade-CbhREl0p.js
var RANK = {
	business: 3,
	category: 2,
	global: 1
};
/**
* La regla más específica gana. Dentro del mismo alcance, gana la más nueva.
* El resultado se congela en el pedido: cambiar la comisión global no reescribe historia.
*/
function resolveFeeBps(input) {
	const now = (input.now ?? /* @__PURE__ */ new Date()).toISOString();
	const applicable = input.rules.filter((rule) => {
		if (rule.validFrom > now) return false;
		if (rule.scope === "business") return rule.businessId === input.businessId;
		if (rule.scope === "category") return rule.categoryId !== null && rule.categoryId === input.categoryId;
		return rule.scope === "global";
	});
	applicable.sort((a, b) => {
		const byScope = RANK[b.scope] - RANK[a.scope];
		if (byScope !== 0) return byScope;
		return a.validFrom < b.validFrom ? 1 : -1;
	});
	const winner = applicable[0];
	if (!winner) return {
		feeBps: input.fallbackBps,
		ruleId: null
	};
	return {
		feeBps: winner.feeBps,
		ruleId: winner.id
	};
}
function generateDeliveryCode() {
	let code = "";
	for (let i = 0; i < 8; i += 1) code += randomInt(0, 10).toString();
	return code;
}
function hashDeliveryCode(code, pepper) {
	return createHash("sha256").update(`${pepper}:${code}`).digest("hex");
}
function assessDeliveryCode(input) {
	if (input.usedAt) return "used";
	if (input.expiresAt && input.expiresAt <= (input.now ?? /* @__PURE__ */ new Date()).toISOString()) return "expired";
	const actual = Buffer.from(hashDeliveryCode(input.providedCode, input.pepper), "hex");
	const expected = Buffer.from(input.storedHash, "hex");
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return "mismatch";
	return "ok";
}
function isUniqueViolation(error) {
	const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
	const message = error instanceof Error ? error.message : "";
	return code === "23505" || /duplicate key|unique/i.test(message);
}
/**
* Aceptar la cotización, descontar stock y crear el pedido es una sola sentencia.
* El UPDATE del listing es el candado: la segunda transacción reevalúa
* `stock_units >= quantity` y no inserta nada si la primera se quedó las unidades.
* El snapshot (nombre, marca, SKU, unidad, precio, imagen, comisión) se copia acá
* y no se vuelve a leer del listing.
*/
async function reserveAcceptedOrder(db, input) {
	try {
		const orderId = (await db`
      with locked_listing as (
        update listings l
        set stock_units = l.stock_units - q.quantity,
            status = case when l.stock_units - q.quantity = 0 then 'out_of_stock' else l.status end,
            updated_at = now()
        from quotes q
        join quote_requests r on r.id = q.request_id
        where q.id = ${input.quoteId}
          and q.status = 'submitted'
          and q.valid_until > now()
          and r.buyer_user_id = ${input.buyerUserId}
          and r.buyer_user_id <> (
            select b.owner_user_id from businesses b where b.id = q.business_id
          )
          and r.status in ('open', 'answered')
          and r.listing_id is not null
          and l.id = r.listing_id
          and l.business_id = q.business_id
          and l.status = 'published'
          and l.is_demo = false
          and l.stock_units >= q.quantity
        returning l.id as listing_id, l.name, l.brand, l.model, l.sku, l.unit,
          q.id as quote_id, q.request_id, q.business_id, q.unit_price_cents, q.quantity,
          q.shipping_cents, q.total_cents, r.delivery_required
      ),
      accepted as (
        update quotes q
        set status = 'accepted'
        from locked_listing ll
        where q.id = ll.quote_id
          and q.status = 'submitted'
        returning q.id
      ),
      rejected as (
        update quotes
        set status = 'rejected'
        where request_id = (select request_id from locked_listing)
          and id <> (select quote_id from locked_listing)
          and status = 'submitted'
        returning id
      ),
      closed as (
        update quote_requests
        set status = 'accepted', accepted_quote_id = (select quote_id from locked_listing)
        where id = (select request_id from locked_listing)
          and buyer_user_id = ${input.buyerUserId}
          and status in ('open', 'answered')
          and exists (select 1 from accepted)
        returning id
      ),
      placed as (
        insert into orders (
          id, buyer_user_id, business_id, quote_id, status, fulfillment, subtotal_cents,
          shipping_cents, total_cents, settlement_status, idempotency_key, stock_reserved,
          payment_method, payment_declared
        )
        select ${input.orderId}, ${input.buyerUserId}, ll.business_id, ll.quote_id, 'PENDING_PAYMENT',
          case when ll.delivery_required then 'delivery' else 'pickup' end,
          ll.total_cents - ll.shipping_cents, ll.shipping_cents, ll.total_cents,
          'not_started', ${input.idempotencyKey}, true,
          ${input.paymentMethod}, true
        from locked_listing ll
        where exists (select 1 from closed)
        returning id
      ),
      item as (
        insert into order_items (
          id, order_id, product_id, listing_id, title, quantity, unit_price_cents, line_cents,
          brand, model, sku, unit, image_key
        )
        select ${input.itemId}, p.id, null, ll.listing_id, ll.name, ll.quantity, ll.unit_price_cents,
          ll.total_cents - ll.shipping_cents, ll.brand, ll.model, ll.sku, ll.unit,
          (
            select i.storage_key from listing_images i
            where i.listing_id = ll.listing_id and i.status = 'ready'
            order by i.is_primary desc, i.position
            limit 1
          )
        from placed p
        cross join locked_listing ll
        returning id
      ),
      economics as (
        insert into order_economics (
          order_id, gross_cents, fee_bps, fee_rule_id, marketplace_fee_cents, supplier_before_processor_cents
        )
        select p.id, ll.total_cents, ${input.feeBps}, ${input.feeRuleId},
          round((ll.total_cents::numeric * ${input.feeBps}) / 10000)::bigint,
          ll.total_cents - round((ll.total_cents::numeric * ${input.feeBps}) / 10000)::bigint
        from placed p
        cross join locked_listing ll
        returning order_id
      )
      insert into order_events (id, order_id, from_status, to_status, actor_user_id, actor_kind, note)
      select ${input.eventId}, order_id, null, 'PENDING_PAYMENT', ${input.buyerUserId}, 'buyer',
        ${input.eventNote ?? "Pedido creado al aceptar la cotización. El precio, la comisión y la imagen quedaron congelados."}
      from economics
      returning order_id as id
    `)[0]?.id;
		if (!orderId) throw new Error("No hay stock suficiente o la publicación ya no está a la venta. Solo una reserva puede tomar esas unidades.");
		return {
			orderId,
			alreadyProcessed: false
		};
	} catch (error) {
		if (!isUniqueViolation(error)) throw error;
		const existing = await db`
      select id from orders
      where idempotency_key = ${input.idempotencyKey} and buyer_user_id = ${input.buyerUserId}
    `;
		if (!existing[0]) throw error;
		return {
			orderId: existing[0].id,
			alreadyProcessed: true
		};
	}
}
var DISPUTE_REASONS = [
	"producto_faltante",
	"producto_incorrecto",
	"producto_danado",
	"pedido_incompleto",
	"pedido_no_recibido",
	"problema_entrega"
];
var createQuoteRequest_createServerFn_handler = createServerRpc({
	id: "20034d46e9f878f320ecac2ccfe7ddebc5a859af546b1f00fe3b42e28f6993db",
	name: "createQuoteRequest",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => createQuoteRequest.__executeServer(opts));
var createQuoteRequest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId) throw new Error("Elegí una publicación de un proveedor.");
	if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 1e5) throw new Error("Cantidad inválida.");
	return {
		listingId: input.listingId,
		quantity: input.quantity,
		notes: typeof input.notes === "string" ? input.notes.trim().slice(0, 1e3) : "",
		address: input.delivery === false ? "" : assertString(input.address, "Dirección de entrega", 160),
		delivery: input.delivery !== false
	};
}).handler(createQuoteRequest_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await enforceRateLimit(db, "quote_request", context.userId);
	if (((await db`
      select count(*)::int as n from quote_requests
      where buyer_user_id = ${context.userId} and status in ('open', 'answered')
    `)[0]?.n ?? 0) >= 10) throw new Error("Tenés demasiadas cotizaciones abiertas.");
	const listing = (await db`
      select l.id, l.name, l.category_id, l.business_id, b.owner_user_id, l.stock_units,
        l.delivery, l.pickup, l.status, l.is_demo, b.status as business_status
      from listings l
      join businesses b on b.id = l.business_id
      where l.id = ${data.listingId}
    `)[0];
	if (!listing || listing.is_demo || listing.business_status !== "active" || listing.status !== "published") throw new Error("Esa publicación no está a la venta.");
	if (listing.owner_user_id === context.userId) throw new Error("No podés cotizar tu propio producto.");
	if (listing.stock_units < data.quantity) throw new Error("No hay stock suficiente para esa cantidad.");
	if (data.delivery && !listing.delivery) throw new Error("Ese proveedor no ofrece envío para este producto.");
	if (!data.delivery && !listing.pickup) throw new Error("Ese proveedor no ofrece retiro para este producto.");
	const requestId = id();
	await db`
      insert into quote_requests (
        id, buyer_user_id, product_id, listing_id, category_id, title, notes, quantity,
        delivery_required, address_line, city, status, expires_at
      ) values (
        ${requestId}, ${context.userId}, null, ${listing.id}, ${listing.category_id},
        ${listing.name}, ${data.notes}, ${data.quantity}, ${data.delivery},
        ${data.address || null}, 'Rosario', 'open', now() + interval '7 days'
      )
    `;
	await notify(db, listing.owner_user_id, "quote_request", "Nueva consulta", `${listing.name} · cantidad ${data.quantity}.`, "/panel");
	await audit(db, context.userId, "create_quote_request", "quote_request", requestId, {
		listingId: listing.id,
		quantity: data.quantity
	});
	return { id: requestId };
});
var createBuyerNeed_createServerFn_handler = createServerRpc({
	id: "01716deecf2fbdf560e037859feff41106b54d7afc40f278bf136380d2e903bd",
	name: "createBuyerNeed",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => createBuyerNeed.__executeServer(opts));
var createBuyerNeed = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = assertString(input?.title, "Qué necesitás", 140);
	if (!Number.isInteger(input?.quantity) || input.quantity < 1 || input.quantity > 1e5) throw new Error("Indicá una cantidad entre 1 y 100000.");
	const categoryId = typeof input?.categoryId === "string" ? input.categoryId.trim() : "";
	if (!categoryId) throw new Error("Elegí una categoría.");
	return {
		title,
		notes: typeof input?.notes === "string" ? input.notes.trim().slice(0, 1e3) : "",
		quantity: input.quantity,
		categoryId,
		delivery: input?.delivery === true
	};
}).handler(createBuyerNeed_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await enforceRateLimit(db, "quote_request", context.userId);
	if (((await db`
      select count(*)::int as n from quote_requests
      where buyer_user_id = ${context.userId} and status in ('open', 'answered')
    `)[0]?.n ?? 0) >= 10) throw new Error("Tenés demasiadas solicitudes abiertas.");
	if (!(await db`
      select id from categories where id = ${data.categoryId} and active = true
    `)[0]) throw new Error("Esa categoría no está disponible.");
	const requestId = id();
	await db`
      insert into quote_requests (
        id, buyer_user_id, product_id, listing_id, category_id, title, notes, quantity,
        delivery_required, address_line, city, status, expires_at
      ) values (
        ${requestId}, ${context.userId}, null, null, ${data.categoryId},
        ${data.title}, ${data.notes}, ${data.quantity}, ${data.delivery},
        null, 'Rosario', 'open', now() + interval '14 days'
      )
    `;
	await audit(db, context.userId, "create_buyer_need", "quote_request", requestId, {
		categoryId: data.categoryId,
		quantity: data.quantity
	});
	return { id: requestId };
});
var cancelBuyerNeed_createServerFn_handler = createServerRpc({
	id: "4e3b072766af4fb04bc27dbc5266e4af4b395420d2e66a46bb3e9ced6e73ceb6",
	name: "cancelBuyerNeed",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => cancelBuyerNeed.__executeServer(opts));
var cancelBuyerNeed = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((requestId) => {
	if (typeof requestId !== "string" || requestId.length < 8) throw new Error("Solicitud inválida.");
	return requestId;
}).handler(cancelBuyerNeed_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	if (!(await db`
      update quote_requests
      set status = 'cancelled'
      where id = ${data}
        and buyer_user_id = ${context.userId}
        and listing_id is null
        and status in ('open', 'answered')
      returning id
    `)[0]) throw new Error("No podés cancelar esa solicitud.");
	await audit(db, context.userId, "cancel_buyer_need", "quote_request", data, {});
	return { ok: true };
});
var listMyQuoteRequests_createServerFn_handler = createServerRpc({
	id: "aec1bd4711c6293b4c54af0cad5bbbf2929ad4bc6371f7ccc1c80f5adaa8404f",
	name: "listMyQuoteRequests",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => listMyQuoteRequests.__executeServer(opts));
var listMyQuoteRequests = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyQuoteRequests_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	return {
		requests: await db`
      select id, title, quantity, status, notes, address_line, delivery_required, listing_id, created_at::text
      from quote_requests
      where buyer_user_id = ${context.userId}
      order by created_at desc
      limit 40
    `,
		quotes: (await db`
      select q.id, q.request_id, q.business_id, b.trade_name, q.unit_price_cents::text,
        q.quantity, q.shipping_cents::text, q.total_cents::text, q.lead_time_hours, q.notes,
        q.valid_until::text, q.status,
        b.payment_methods as business_methods, l.payment_methods as listing_methods
      from quotes q
      join businesses b on b.id = q.business_id
      join quote_requests r on r.id = q.request_id
      left join listings l on l.id = r.listing_id
      where r.buyer_user_id = ${context.userId}
      order by q.total_cents
    `).map((quote) => ({
			id: quote.id,
			request_id: quote.request_id,
			business_id: quote.business_id,
			trade_name: quote.trade_name,
			unitPriceCents: asInt(quote.unit_price_cents),
			shippingCents: asInt(quote.shipping_cents),
			totalCents: asInt(quote.total_cents),
			quantity: quote.quantity,
			lead_time_hours: quote.lead_time_hours,
			notes: quote.notes,
			valid_until: quote.valid_until,
			status: quote.status,
			paymentMethods: acceptedMethods(quote.business_methods, quote.listing_methods)
		}))
	};
});
var listQuoteInbox_createServerFn_handler = createServerRpc({
	id: "e00e3c86dccdc6adc277dc4f58e43335481cf176df4d7d2c9f17bee90ac016dc",
	name: "listQuoteInbox",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => listQuoteInbox.__executeServer(opts));
var listQuoteInbox = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listQuoteInbox_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	if ((await loadAccess(db, context.userId)).businessIds.length === 0) return [];
	return db`
      select r.id, r.title, r.quantity, r.notes, r.address_line, r.delivery_required,
        r.listing_id, l.business_id, r.status, r.created_at::text,
        q.id as quote_id, q.status as quote_status
      from quote_requests r
      join listings l on l.id = r.listing_id
      join businesses b on b.id = l.business_id
      left join quotes q on q.request_id = r.id and q.business_id = l.business_id
      where b.owner_user_id = ${context.userId}
        and l.is_demo = false
        and l.status = 'published'
        and r.buyer_user_id <> ${context.userId}
        and r.status in ('open', 'answered')
        and r.expires_at > now()
      order by r.created_at desc
      limit 40
    `;
});
var submitQuote_createServerFn_handler = createServerRpc({
	id: "3f3bd03426194117acd30f3da2e02d2945ab187a1df6c4dae5077e97c0861c38",
	name: "submitQuote",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => submitQuote.__executeServer(opts));
var submitQuote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.requestId || !input?.businessId) throw new Error("Faltan datos de la cotización.");
	if (!Number.isInteger(input.unitPriceCents) || input.unitPriceCents <= 0) throw new Error("Precio inválido.");
	if (!Number.isInteger(input.quantity) || input.quantity <= 0) throw new Error("Cantidad inválida.");
	if (!Number.isInteger(input.shippingCents) || input.shippingCents < 0) throw new Error("Envío inválido.");
	if (!Number.isInteger(input.leadTimeHours) || input.leadTimeHours < 0 || input.leadTimeHours > 1440) throw new Error("Plazo inválido.");
	return {
		...input,
		notes: typeof input.notes === "string" ? input.notes.trim().slice(0, 800) : ""
	};
}).handler(submitQuote_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const access = await loadAccess(db, context.userId);
	await enforceRateLimit(db, "message", context.userId);
	if (!can(access, "respond_quote", { businessId: data.businessId })) throw new Error("Ese negocio no puede cotizar.");
	const request = (await db`
      select r.id, r.buyer_user_id, r.status, r.title, r.listing_id,
        l.business_id as listing_business_id, l.status as listing_status,
        b.status as business_status, b.is_demo as business_demo
      from quote_requests r
      left join listings l on l.id = r.listing_id
      left join businesses b on b.id = ${data.businessId} and b.owner_user_id = ${context.userId}
      where r.id = ${data.requestId} and r.status in ('open', 'answered') and r.expires_at > now()
    `)[0];
	if (!request) throw new Error("La solicitud no está abierta.");
	if (request.buyer_user_id === context.userId) throw new Error("No podés cotizar tu propia solicitud.");
	if (request.business_status !== "active" || request.business_demo) throw new Error("El negocio tiene que estar activo para cotizar.");
	if (request.listing_id) {
		if (request.listing_business_id !== data.businessId || request.listing_status !== "published") throw new Error("Solo el proveedor de esa publicación puede cotizarla, y tiene que seguir publicada.");
	}
	const total = data.unitPriceCents * data.quantity + data.shippingCents;
	if (!Number.isSafeInteger(total)) throw new Error("El total de la cotización se va de rango.");
	const quoteId = id();
	await db`
      insert into quotes (
        id, request_id, business_id, unit_price_cents, quantity, shipping_cents, total_cents,
        lead_time_hours, notes, valid_until, status
      ) values (
        ${quoteId}, ${request.id}, ${data.businessId}, ${data.unitPriceCents}, ${data.quantity},
        ${data.shippingCents}, ${total}, ${data.leadTimeHours}, ${data.notes},
        now() + interval '3 days', 'submitted'
      )
      on conflict (request_id, business_id) do update set
        unit_price_cents = excluded.unit_price_cents,
        quantity = excluded.quantity,
        shipping_cents = excluded.shipping_cents,
        total_cents = excluded.total_cents,
        lead_time_hours = excluded.lead_time_hours,
        notes = excluded.notes,
        valid_until = excluded.valid_until,
        status = 'submitted',
        created_at = now()
    `;
	await db`
      update quote_requests set status = 'answered'
      where id = ${request.id} and status = 'open'
    `;
	await notify(db, request.buyer_user_id, "quote_received", "Recibiste una respuesta", request.title, "/cotizaciones");
	await audit(db, context.userId, "submit_quote", "quote", quoteId, {
		requestId: request.id,
		total
	});
	return { ok: true };
});
var acceptQuote_createServerFn_handler = createServerRpc({
	id: "f47383ca4a89e22b22668181a5f68d3476c0df3f8d413df6e155d39ff2b42d32",
	name: "acceptQuote",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => acceptQuote.__executeServer(opts));
var acceptQuote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.quoteId) throw new Error("Falta la cotización.");
	if (!input.idempotencyKey || input.idempotencyKey.length < 8 || input.idempotencyKey.length > 80) throw new Error("Falta la clave de idempotencia.");
	const paymentMethod = input.paymentMethod == null || input.paymentMethod === "" ? null : String(input.paymentMethod).trim().toLowerCase();
	if (paymentMethod && paymentMethod.length > 40) throw new Error("Medio de pago inválido.");
	return {
		quoteId: input.quoteId,
		idempotencyKey: input.idempotencyKey,
		paymentMethod
	};
}).handler(acceptQuote_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const existing = await db`
      select id from orders where idempotency_key = ${data.idempotencyKey} and buyer_user_id = ${context.userId}
    `;
	if (existing[0]) return {
		orderId: existing[0].id,
		alreadyProcessed: true
	};
	const quote = (await db`
      select q.id, q.business_id, r.buyer_user_id, l.category_id, b.owner_user_id, l.name as title,
        b.payment_methods as business_methods, l.payment_methods as listing_methods
      from quotes q
      join quote_requests r on r.id = q.request_id
      join businesses b on b.id = q.business_id
      join listings l on l.id = r.listing_id
      where q.id = ${data.quoteId} and q.status = 'submitted' and q.valid_until > now()
        and r.status in ('open', 'answered') and l.is_demo = false
    `)[0];
	if (!quote) throw new Error("Esa cotización ya no está vigente.");
	if (quote.buyer_user_id !== context.userId) throw new Error("No es tu solicitud.");
	if (quote.owner_user_id === context.userId) throw new Error("No podés aceptar tu propia oferta.");
	const choice = decidePaymentChoice({
		allowed: acceptedMethods(quote.business_methods, quote.listing_methods),
		chosen: data.paymentMethod
	});
	if (!choice.ok) throw new Error(choice.reason);
	const rules = await db`
      select id, scope, category_id, business_id, fee_bps, valid_from::text
      from commission_rules
      where active = true and (valid_to is null or valid_to > now())
    `;
	const settings = await db`
      select value::text::int as value from platform_settings where key = 'commission_default_bps'
    `;
	const resolved = resolveFeeBps({
		rules: rules.map((rule) => ({
			id: rule.id,
			scope: rule.scope,
			categoryId: rule.category_id,
			businessId: rule.business_id,
			feeBps: rule.fee_bps,
			validFrom: rule.valid_from
		})),
		businessId: quote.business_id,
		categoryId: quote.category_id,
		fallbackBps: settings[0]?.value ?? 300
	});
	const orderId = id();
	await enforceRateLimit(db, "sensitive", context.userId);
	const reserved = await reserveAcceptedOrder(db, {
		quoteId: quote.id,
		buyerUserId: context.userId,
		orderId,
		itemId: id(),
		eventId: id(),
		idempotencyKey: data.idempotencyKey,
		feeBps: resolved.feeBps,
		feeRuleId: resolved.ruleId,
		paymentMethod: choice.method
	});
	if (reserved.alreadyProcessed) return {
		orderId: reserved.orderId,
		alreadyProcessed: true
	};
	await notify(db, quote.owner_user_id, "quote_accepted", "Aceptaron tu respuesta", `${quote.title}. La compra queda pendiente de pago. El stock de ese producto quedó reservado.`, `/pedidos/${reserved.orderId}`);
	await audit(db, context.userId, "accept_quote", "order", reserved.orderId, {
		quoteId: quote.id,
		feeBps: resolved.feeBps,
		paymentMethod: choice.method
	});
	await audit(db, context.userId, "create_order", "order", reserved.orderId, {
		quoteId: quote.id,
		feeBps: resolved.feeBps,
		frozen: true
	});
	return {
		orderId: reserved.orderId,
		alreadyProcessed: false
	};
});
var buyPublishedListing_createServerFn_handler = createServerRpc({
	id: "2035a34f0c46523d3043e2b796af9963c2b8954550a0baf25bb53b2f0534eb5b",
	name: "buyPublishedListing",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => buyPublishedListing.__executeServer(opts));
var buyPublishedListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId) throw new Error("Elegí una publicación de un proveedor.");
	if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 1e5) throw new Error("Cantidad inválida.");
	if (!input.idempotencyKey || input.idempotencyKey.length < 8 || input.idempotencyKey.length > 80) throw new Error("Falta la clave de idempotencia.");
	const paymentMethod = input.paymentMethod == null || input.paymentMethod === "" ? null : String(input.paymentMethod).trim().toLowerCase();
	if (paymentMethod && paymentMethod.length > 40) throw new Error("Medio de pago inválido.");
	return {
		listingId: input.listingId,
		quantity: input.quantity,
		address: input.delivery === false ? "" : assertString(input.address, "Dirección de entrega", 160),
		delivery: input.delivery !== false,
		idempotencyKey: input.idempotencyKey,
		paymentMethod
	};
}).handler(buyPublishedListing_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await enforceRateLimit(db, "quote_request", context.userId);
	const existing = await db`
      select id from orders where idempotency_key = ${data.idempotencyKey} and buyer_user_id = ${context.userId}
    `;
	if (existing[0]) return {
		orderId: existing[0].id,
		alreadyProcessed: true
	};
	const listing = (await db`
      select l.id, l.name, l.category_id, l.business_id, b.owner_user_id,
        l.price_cents::text, l.shipping_cents::text, l.stock_units, l.delivery, l.pickup,
        l.status, l.is_demo, l.lead_time_hours, b.status as business_status, b.is_demo as business_demo,
        b.payment_methods as business_methods, l.payment_methods as listing_methods
      from listings l
      join businesses b on b.id = l.business_id
      where l.id = ${data.listingId}
    `)[0];
	if (!listing || listing.is_demo || listing.business_demo || listing.business_status !== "active" || listing.status !== "published") throw new Error("Esa publicación no está a la venta.");
	if (listing.owner_user_id === context.userId) throw new Error("No podés comprar tu propio producto.");
	if (listing.stock_units < data.quantity) throw new Error("No hay stock suficiente para esa cantidad.");
	if (data.delivery && !listing.delivery) throw new Error("Ese proveedor no ofrece envío para este producto.");
	if (!data.delivery && !listing.pickup) throw new Error("Ese proveedor no ofrece retiro para este producto.");
	const unitPriceCents = asInt(listing.price_cents);
	const shippingCents = data.delivery ? asInt(listing.shipping_cents) : 0;
	if (unitPriceCents <= 0) throw new Error("Esa publicación no tiene un precio para comprar.");
	const total = unitPriceCents * data.quantity + shippingCents;
	if (!Number.isSafeInteger(total) || total <= 0) throw new Error("El total de la compra se va de rango.");
	const choice = decidePaymentChoice({
		allowed: acceptedMethods(listing.business_methods, listing.listing_methods),
		chosen: data.paymentMethod
	});
	if (!choice.ok) throw new Error(choice.reason);
	const rules = await db`
      select id, scope, category_id, business_id, fee_bps, valid_from::text
      from commission_rules
      where active = true and (valid_to is null or valid_to > now())
    `;
	const settings = await db`
      select value::text::int as value from platform_settings where key = 'commission_default_bps'
    `;
	const resolved = resolveFeeBps({
		rules: rules.map((rule) => ({
			id: rule.id,
			scope: rule.scope,
			categoryId: rule.category_id,
			businessId: rule.business_id,
			feeBps: rule.fee_bps,
			validFrom: rule.valid_from
		})),
		businessId: listing.business_id,
		categoryId: listing.category_id,
		fallbackBps: settings[0]?.value ?? 300
	});
	const requestId = id();
	const quoteId = id();
	await enforceRateLimit(db, "sensitive", context.userId);
	await db`
      insert into quote_requests (
        id, buyer_user_id, product_id, listing_id, category_id, title, notes, quantity,
        delivery_required, address_line, city, status, expires_at
      ) values (
        ${requestId}, ${context.userId}, null, ${listing.id}, ${listing.category_id},
        ${listing.name}, ${"Compra directa al precio publicado."}, ${data.quantity}, ${data.delivery},
        ${data.address || null}, 'Rosario', 'open', now() + interval '1 day'
      )
    `;
	await db`
      insert into quotes (
        id, request_id, business_id, unit_price_cents, quantity, shipping_cents, total_cents,
        lead_time_hours, notes, valid_until, status
      ) values (
        ${quoteId}, ${requestId}, ${listing.business_id}, ${unitPriceCents}, ${data.quantity},
        ${shippingCents}, ${total}, ${listing.lead_time_hours},
        ${"Precio publicado al confirmar la compra. No es una contraoferta."},
        now() + interval '1 day', 'submitted'
      )
    `;
	let reserved;
	try {
		reserved = await reserveAcceptedOrder(db, {
			quoteId,
			buyerUserId: context.userId,
			orderId: id(),
			itemId: id(),
			eventId: id(),
			idempotencyKey: data.idempotencyKey,
			feeBps: resolved.feeBps,
			feeRuleId: resolved.ruleId,
			paymentMethod: choice.method,
			eventNote: "Pedido creado al confirmar la compra al precio publicado. El precio, la comisión y la imagen quedaron congelados."
		});
	} catch (error) {
		await db`
        delete from quote_requests
        where id = ${requestId} and buyer_user_id = ${context.userId} and status in ('open', 'answered')
      `;
		throw error;
	}
	if (reserved.alreadyProcessed) return {
		orderId: reserved.orderId,
		alreadyProcessed: true
	};
	await notify(db, listing.owner_user_id, "quote_accepted", "Nueva compra", `${listing.name}. Quedó pendiente de pago. El stock de ese producto quedó reservado.`, `/pedidos/${reserved.orderId}`);
	await audit(db, context.userId, "buy_listing", "order", reserved.orderId, {
		listingId: listing.id,
		quoteId,
		feeBps: resolved.feeBps,
		paymentMethod: choice.method,
		unitPriceCents,
		quantity: data.quantity
	});
	await audit(db, context.userId, "create_order", "order", reserved.orderId, {
		quoteId,
		feeBps: resolved.feeBps,
		frozen: true,
		source: "published_price"
	});
	return {
		orderId: reserved.orderId,
		alreadyProcessed: false
	};
});
var listOrders_createServerFn_handler = createServerRpc({
	id: "df002c35d3d3997a5e88768901bb77dc25209d64cc8a6731a15c3885e637894f",
	name: "listOrders",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => listOrders.__executeServer(opts));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listOrders_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	const access = await loadAccess(db, context.userId);
	return db`
      select o.id, o.status, o.total_cents::text, o.fulfillment, o.created_at::text, b.trade_name,
        case when o.buyer_user_id = ${context.userId} then 'buyer' else 'supplier' end as role
      from orders o
      join businesses b on b.id = o.business_id
      where o.buyer_user_id = ${context.userId}
         or b.owner_user_id = ${context.userId}
         or ${access.platformRole} = 'admin'
      order by o.created_at desc
      limit 50
    `;
});
var getOrder_createServerFn_handler = createServerRpc({
	id: "b7d725ffeda24f17014383cab3ea1e834c6eebf7427747f3d26ab0cbf3ed75bf",
	name: "getOrder",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => getOrder.__executeServer(opts));
var getOrder = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((orderId) => {
	if (typeof orderId !== "string" || orderId.length < 8) throw new Error("Pedido inválido.");
	return orderId;
}).handler(getOrder_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const access = await loadAccess(db, context.userId);
	const order = (await db`
      select o.id, o.buyer_user_id, o.business_id, o.status, o.fulfillment, o.subtotal_cents::text,
        o.shipping_cents::text, o.total_cents::text, o.settlement_status, o.refund_status, o.created_at::text,
        b.trade_name, b.owner_user_id, o.payment_method, o.payment_declared
      from orders o
      join businesses b on b.id = o.business_id
      where o.id = ${data}
    `)[0];
	if (!order) throw new Error("Pedido inexistente.");
	const accessView = orderAccess({
		actorUserId: context.userId,
		buyerUserId: order.buyer_user_id,
		ownerUserId: order.owner_user_id,
		platformRole: access.platformRole,
		intent: "view"
	});
	if (!accessView.ok) throw new Error(accessView.reason);
	const items = await db`
      select title, quantity, unit_price_cents::text, line_cents::text,
        brand, model, sku, unit
      from order_items where order_id = ${order.id}
    `;
	const economics = await db`
      select fee_bps, marketplace_fee_cents::text, supplier_before_processor_cents::text, processor_fee_cents::text
      from order_economics where order_id = ${order.id}
    `;
	const events = await db`
      select to_status, actor_kind, note, created_at::text from order_events
      where order_id = ${order.id} order by created_at
    `;
	const disputes = await db`
      select id, reason, status, description, refund_status from disputes where order_id = ${order.id}
    `;
	const env = readMercadoPagoEnv();
	const paymentMissing = missingMercadoPagoCredentials(env);
	const storage = tokenStorageMode({
		productionDatabase: dbSource === "neon",
		tokenKey: env.tokenKey
	});
	const link = (await db`
      select status, disconnected_at::text
      from seller_payment_accounts
      where business_id = ${order.business_id} and provider = 'mercadopago'
    `)[0];
	const payments = await db`
      select status from payments
      where order_id = ${order.id} and provider = 'mercadopago'
      order by created_at desc
      limit 1
    `;
	const paymentDeclared = order.payment_declared === true;
	const paymentMethod = order.payment_method;
	const processorFee = economics[0]?.processor_fee_cents != null && economics[0].processor_fee_cents !== "" ? asInt(economics[0].processor_fee_cents) : null;
	return {
		id: order.id,
		status: order.status,
		fulfillment: order.fulfillment,
		settlementStatus: order.settlement_status,
		refundStatus: order.refund_status,
		buyerUserId: order.buyer_user_id,
		businessId: order.business_id,
		tradeName: order.trade_name,
		viewer: order.buyer_user_id === context.userId ? "buyer" : order.owner_user_id === context.userId ? "supplier" : "admin",
		subtotalCents: asInt(order.subtotal_cents),
		shippingCents: asInt(order.shipping_cents),
		totalCents: asInt(order.total_cents),
		items: items.map((item) => ({
			title: item.title,
			quantity: item.quantity,
			unitPriceCents: asInt(item.unit_price_cents),
			lineCents: asInt(item.line_cents),
			brand: item.brand,
			model: item.model,
			sku: item.sku,
			unit: item.unit
		})),
		economics: economics[0] ? {
			feeBps: economics[0].fee_bps,
			marketplaceFeeCents: asInt(economics[0].marketplace_fee_cents),
			supplierBeforeProcessorCents: asInt(economics[0].supplier_before_processor_cents),
			processorFeeCents: processorFee,
			supplierNetCents: processorFee == null ? null : supplierNetCents({
				grossCents: asInt(order.total_cents),
				marketplaceFeeCents: asInt(economics[0].marketplace_fee_cents),
				processorFeeCents: processorFee
			})
		} : null,
		events,
		disputes,
		paymentsConfigured: paymentMissing.length === 0,
		paymentMissing,
		paymentWarning: storage.ok ? storage.warning : "Falta CERCA_TOKEN_KEY. En producción no se guarda el token.",
		sellerLinked: link?.status === "connected" && !link.disconnected_at,
		paymentMethod,
		paymentDeclared,
		payment: describePayment({
			method: paymentMethod,
			declared: paymentDeclared,
			orderStatus: order.status,
			mpStatus: payments[0]?.status ?? null
		}),
		mercadoPagoCheckout: allowsMercadoPagoCheckout({
			method: paymentMethod,
			declared: paymentDeclared
		})
	};
});
var startCheckout_createServerFn_handler = createServerRpc({
	id: "53f00a2297d6fb19f2a9e84efc64562ff51920839953fbed7edaa40ca750e95e",
	name: "startCheckout",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => startCheckout.__executeServer(opts));
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((orderId) => {
	if (typeof orderId !== "string" || orderId.length < 8) throw new Error("Pedido inválido.");
	return orderId;
}).handler(startCheckout_createServerFn_handler, async ({ context, data }) => createCheckoutPreference({
	userId: context.userId,
	orderId: data
}));
async function applyAction(orderId, userId, action) {
	const db = await sql();
	const access = await loadAccess(db, userId);
	const order = (await db`
    select o.id, o.status, o.fulfillment, o.buyer_user_id, b.owner_user_id, o.business_id
    from orders o join businesses b on b.id = o.business_id
    where o.id = ${orderId}
  `)[0];
	if (!order) throw new Error("Pedido inexistente.");
	const actor = order.owner_user_id === userId ? "supplier" : order.buyer_user_id === userId ? "buyer" : access.platformRole === "admin" ? "admin" : null;
	if (!actor) throw new Error("No podés operar ese pedido.");
	const intent = actor === "supplier" ? "supplier" : actor === "buyer" ? "buyer" : "view";
	const allowed = orderAccess({
		actorUserId: userId,
		buyerUserId: order.buyer_user_id,
		ownerUserId: order.owner_user_id,
		platformRole: access.platformRole,
		intent: action === "cancel" && actor === "admin" ? "view" : intent
	});
	if (!allowed.ok) throw new Error(allowed.reason);
	if (actor === "supplier" && !can(access, "fulfill_order", { businessId: order.business_id })) throw new Error("Negocio suspendido.");
	const next = transitionOrder({
		from: order.status,
		action,
		actor,
		fulfillment: order.fulfillment
	});
	let deliveryCode = null;
	if (action === "mark_out_for_delivery" || action === "mark_ready_for_pickup") {
		deliveryCode = generateDeliveryCode();
		const hash = hashDeliveryCode(deliveryCode, deliveryPepper());
		await db`
      insert into delivery_codes (id, order_id, code_hash, expires_at)
      values (${id()}, ${order.id}, ${hash}, now() + interval '7 days')
    `;
	}
	if (!(action === "cancel" ? await db`
          with target as (
            select id, stock_reserved from orders where id = ${order.id} and status = ${order.status}
          ),
          moved as (
            update orders o
            set status = ${next}, updated_at = now(), stock_reserved = false
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
          select id from moved
        ` : await db`
          update orders set status = ${next}, updated_at = now(),
            settlement_status = case when ${next} = 'COMPLETED' then 'awaiting_provider' else settlement_status end
          where id = ${order.id} and status = ${order.status}
          returning id
        `)[0]) throw new Error("El pedido cambió mientras lo actualizabas. Recargá.");
	await db`
    insert into order_events (id, order_id, from_status, to_status, actor_user_id, actor_kind, note)
    values (${id()}, ${order.id}, ${order.status}, ${next}, ${userId}, ${actor}, ${action})
  `;
	await audit(db, userId, action, "order", order.id, {
		from: order.status,
		to: next
	});
	if (action === "cancel" && order.status !== "PENDING_PAYMENT") {
		const refund = await settleCancellationRefund(order.id);
		return {
			status: refund.status,
			deliveryCode,
			message: refund.message
		};
	}
	return {
		status: next,
		deliveryCode,
		message: null
	};
}
var advanceOrder_createServerFn_handler = createServerRpc({
	id: "1855bd41be051d70c45a108cc7789b1b4c300837c6ea7a04051d3b88c9c164f5",
	name: "advanceOrder",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => advanceOrder.__executeServer(opts));
var advanceOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.orderId || ![
		"supplier_confirm",
		"start_preparing",
		"mark_ready_for_pickup",
		"mark_out_for_delivery",
		"cancel",
		"buyer_close"
	].includes(input.action)) throw new Error("Acción inválida.");
	return input;
}).handler(advanceOrder_createServerFn_handler, async ({ context, data }) => applyAction(data.orderId, context.userId, data.action));
var confirmDeliveryCode_createServerFn_handler = createServerRpc({
	id: "b36ed234cd7e01a9bd1bbc7f71c41d3fc2e2407d141516e5e79f7dbdd7d9f8b3",
	name: "confirmDeliveryCode",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => confirmDeliveryCode.__executeServer(opts));
var confirmDeliveryCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.orderId || !/^\d{8}$/.test(input.code ?? "")) throw new Error("El código tiene 8 dígitos.");
	return input;
}).handler(confirmDeliveryCode_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const order = (await db`
      select id, status, buyer_user_id from orders where id = ${data.orderId}
    `)[0];
	const buyer = orderAccess({
		actorUserId: context.userId,
		buyerUserId: order?.buyer_user_id ?? "",
		ownerUserId: "",
		platformRole: "user",
		intent: "buyer"
	});
	if (!order || !buyer.ok) throw new Error("No es tu pedido.");
	const current = (await db`
      select code_hash, used_at::text, expires_at::text
      from delivery_codes where order_id = ${order.id}
      order by created_at desc limit 1
    `)[0];
	if (!current) throw new Error("Este pedido todavía no tiene código de entrega.");
	const verdict = assessDeliveryCode({
		storedHash: current.code_hash,
		providedCode: data.code,
		pepper: deliveryPepper(),
		usedAt: current.used_at,
		expiresAt: current.expires_at
	});
	if (verdict !== "ok") {
		await audit(db, context.userId, "delivery_code_rejected", "order", order.id, { verdict });
		throw new Error(verdict === "used" ? "Ese código ya se usó." : verdict === "expired" ? "El código venció." : "El código no coincide.");
	}
	const next = transitionOrder({
		from: order.status,
		action: "delivery_code_accepted",
		actor: "system",
		fulfillment: order.status === "READY_FOR_PICKUP" ? "pickup" : "delivery"
	});
	const hash = hashDeliveryCode(data.code, deliveryPepper());
	if (!(await db`
      with consumed as (
        update delivery_codes dc
        set used_at = now(), used_by = ${context.userId}
        from orders o
        where dc.order_id = o.id
          and o.id = ${order.id}
          and o.buyer_user_id = ${context.userId}
          and o.status = ${order.status}
          and dc.code_hash = ${hash}
          and dc.used_at is null
          and dc.expires_at > now()
        returning dc.order_id
      )
      update orders
      set status = ${next}, updated_at = now()
      where id in (select order_id from consumed)
      returning id
    `)[0]) throw new Error("No se pudo confirmar la entrega. El código no se consumió.");
	await db`
      insert into order_events (id, order_id, from_status, to_status, actor_user_id, actor_kind, note)
      values (${id()}, ${order.id}, ${order.status}, ${next}, ${context.userId}, 'system', 'Código de entrega validado')
    `;
	await audit(db, context.userId, "delivery_code_accepted", "order", order.id, {});
	return { status: next };
});
var openDispute_createServerFn_handler = createServerRpc({
	id: "f9359a6f0e8eb7e57a91156f2e40f732bf82a43b1751ab7c981461b9e5bdf2c0",
	name: "openDispute",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => openDispute.__executeServer(opts));
var openDispute = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.orderId) throw new Error("Falta el pedido.");
	if (!DISPUTE_REASONS.includes(input.reason)) throw new Error("Motivo inválido.");
	return {
		orderId: input.orderId,
		reason: input.reason,
		description: assertString(input.description, "Descripción", 2e3)
	};
}).handler(openDispute_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const access = await loadAccess(db, context.userId);
	const order = (await db`
      select o.id, o.status, o.buyer_user_id, o.fulfillment, b.owner_user_id
      from orders o join businesses b on b.id = o.business_id
      where o.id = ${data.orderId}
    `)[0];
	if (!order) throw new Error("Pedido inexistente.");
	if (!orderAccess({
		actorUserId: context.userId,
		buyerUserId: order.buyer_user_id,
		ownerUserId: order.owner_user_id,
		platformRole: access.platformRole,
		intent: "buyer"
	}).ok) throw new Error("Solo el comprador puede abrir la disputa.");
	await enforceRateLimit(db, "sensitive", context.userId);
	const next = transitionOrder({
		from: order.status,
		action: "open_dispute",
		actor: "buyer",
		fulfillment: order.fulfillment
	});
	const disputeId = id();
	if (!(await db`
      update orders set status = ${next}, updated_at = now()
      where id = ${order.id} and status = ${order.status} and buyer_user_id = ${context.userId}
      returning id
    `)[0]) throw new Error("No se pudo abrir la disputa.");
	await db`
      insert into disputes (id, order_id, opened_by, reason, description, status)
      values (${disputeId}, ${order.id}, ${context.userId}, ${data.reason}, ${data.description}, 'open')
    `;
	await db`
      insert into dispute_messages (id, dispute_id, author_user_id, body)
      values (${id()}, ${disputeId}, ${context.userId}, ${data.description})
    `;
	await db`
      insert into order_events (id, order_id, from_status, to_status, actor_user_id, actor_kind, note)
      values (${id()}, ${order.id}, ${order.status}, ${next}, ${context.userId}, 'buyer', ${data.reason})
    `;
	await notify(db, order.owner_user_id, "dispute_opened", "Se abrió una disputa", data.reason, `/pedidos/${order.id}`);
	await audit(db, context.userId, "open_dispute", "dispute", disputeId, {
		orderId: order.id,
		reason: data.reason
	});
	return { id: disputeId };
});
var addDisputeMessage_createServerFn_handler = createServerRpc({
	id: "696dae5880ffc9f5f9938f5e2e41b7dabb74d67f219a460d9cef6f999323140a",
	name: "addDisputeMessage",
	filename: "src/lib/cerca/server/trade.ts"
}, (opts) => addDisputeMessage.__executeServer(opts));
var addDisputeMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	disputeId: assertString(input?.disputeId, "Disputa", 80),
	body: assertString(input?.body, "Mensaje", 2e3)
})).handler(addDisputeMessage_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const access = await loadAccess(db, context.userId);
	const dispute = (await db`
      select d.id, o.buyer_user_id, b.owner_user_id
      from disputes d
      join orders o on o.id = d.order_id
      join businesses b on b.id = o.business_id
      where d.id = ${data.disputeId}
    `)[0];
	if (!dispute) throw new Error("Disputa inexistente.");
	const party = orderAccess({
		actorUserId: context.userId,
		buyerUserId: dispute.buyer_user_id,
		ownerUserId: dispute.owner_user_id,
		platformRole: access.platformRole,
		intent: "party"
	});
	if (!party.ok) throw new Error(party.reason);
	await enforceRateLimit(db, "message", context.userId);
	await db`
      insert into dispute_messages (id, dispute_id, author_user_id, body)
      values (${id()}, ${dispute.id}, ${context.userId}, ${data.body})
    `;
	await audit(db, context.userId, "dispute_message", "dispute", dispute.id, {});
	return { ok: true };
});
//#endregion
export { acceptQuote_createServerFn_handler, addDisputeMessage_createServerFn_handler, advanceOrder_createServerFn_handler, buyPublishedListing_createServerFn_handler, cancelBuyerNeed_createServerFn_handler, confirmDeliveryCode_createServerFn_handler, createBuyerNeed_createServerFn_handler, createQuoteRequest_createServerFn_handler, getOrder_createServerFn_handler, listMyQuoteRequests_createServerFn_handler, listOrders_createServerFn_handler, listQuoteInbox_createServerFn_handler, openDispute_createServerFn_handler, startCheckout_createServerFn_handler, submitQuote_createServerFn_handler };
