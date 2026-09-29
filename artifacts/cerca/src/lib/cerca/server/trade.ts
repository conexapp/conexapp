import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { missingMercadoPagoCredentials, readMercadoPagoEnv } from "../payments/mercadopago";
import { supplierNetCents, tokenStorageMode } from "../domain/payments";
import { createCheckoutPreference, settleCancellationRefund } from "./payment-runtime";
import { resolveFeeBps, type FeeRule } from "../domain/commission";
import { can } from "../domain/permissions";
import { assessDeliveryCode, generateDeliveryCode, hashDeliveryCode } from "../domain/delivery-code";
import { transitionOrder, type OrderStatus } from "../domain/orders";
import { orderAccess } from "../domain/ownership";
import { reserveAcceptedOrder } from "../domain/reserve-order";
import { acceptedMethods, allowsMercadoPagoCheckout, decidePaymentChoice, describePayment } from "../domain/payment-methods";
import { dbSource } from "@/lib/db";
import { assertString, audit, asInt, deliveryPepper, id, loadAccess, notify, sql } from "./helpers";
import { enforceRateLimit } from "./rate-limit";

const DISPUTE_REASONS = [
  "producto_faltante",
  "producto_incorrecto",
  "producto_danado",
  "pedido_incompleto",
  "pedido_no_recibido",
  "problema_entrega",
] as const;

export const createQuoteRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    listingId: string;
    quantity: number;
    notes: string;
    address: string;
    delivery: boolean;
  }) => {
    if (!input?.listingId) throw new Error("Elegí una publicación de un proveedor.");
    if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 100_000) {
      throw new Error("Cantidad inválida.");
    }
    return {
      listingId: input.listingId,
      quantity: input.quantity,
      notes: typeof input.notes === "string" ? input.notes.trim().slice(0, 1000) : "",
      address: input.delivery === false ? "" : assertString(input.address, "Dirección de entrega", 160),
      delivery: input.delivery !== false,
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await enforceRateLimit(db, "quote_request", context.userId);
    const open = await db<{ n: number }>`
      select count(*)::int as n from quote_requests
      where buyer_user_id = ${context.userId} and status in ('open', 'answered')
    `;
    if ((open[0]?.n ?? 0) >= 10) throw new Error("Tenés demasiadas cotizaciones abiertas.");
    const listings = await db<{
      id: string;
      name: string;
      category_id: string;
      business_id: string;
      owner_user_id: string;
      stock_units: number;
      delivery: boolean;
      pickup: boolean;
      status: string;
      is_demo: boolean;
      business_status: string;
    }>`
      select l.id, l.name, l.category_id, l.business_id, b.owner_user_id, l.stock_units,
        l.delivery, l.pickup, l.status, l.is_demo, b.status as business_status
      from listings l
      join businesses b on b.id = l.business_id
      where l.id = ${data.listingId}
    `;
    const listing = listings[0];
    if (!listing || listing.is_demo || listing.business_status !== "active" || listing.status !== "published") {
      throw new Error("Esa publicación no está a la venta.");
    }
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
    await notify(
      db,
      listing.owner_user_id,
      "quote_request",
      "Nueva consulta",
      `${listing.name} · cantidad ${data.quantity}.`,
      "/panel",
    );
    await audit(db, context.userId, "create_quote_request", "quote_request", requestId, {
      listingId: listing.id,
      quantity: data.quantity,
    });
    return { id: requestId };
  });

export const createBuyerNeed = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    title: string;
    notes: string;
    quantity: number;
    categoryId: string;
    delivery: boolean;
  }) => {
    const title = assertString(input?.title, "Qué necesitás", 140);
    if (!Number.isInteger(input?.quantity) || input.quantity < 1 || input.quantity > 100_000) {
      throw new Error("Indicá una cantidad entre 1 y 100000.");
    }
    const categoryId = typeof input?.categoryId === "string" ? input.categoryId.trim() : "";
    if (!categoryId) throw new Error("Elegí una categoría.");
    return {
      title,
      notes: typeof input?.notes === "string" ? input.notes.trim().slice(0, 1000) : "",
      quantity: input.quantity,
      categoryId,
      delivery: input?.delivery === true,
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await enforceRateLimit(db, "quote_request", context.userId);
    const open = await db<{ n: number }>`
      select count(*)::int as n from quote_requests
      where buyer_user_id = ${context.userId} and status in ('open', 'answered')
    `;
    if ((open[0]?.n ?? 0) >= 10) throw new Error("Tenés demasiadas solicitudes abiertas.");
    const categories = await db<{ id: string }>`
      select id from categories where id = ${data.categoryId} and active = true
    `;
    if (!categories[0]) throw new Error("Esa categoría no está disponible.");
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
      quantity: data.quantity,
    });
    return { id: requestId };
  });

export const cancelBuyerNeed = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((requestId: string) => {
    if (typeof requestId !== "string" || requestId.length < 8) throw new Error("Solicitud inválida.");
    return requestId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const updated = await db<{ id: string }>`
      update quote_requests
      set status = 'cancelled'
      where id = ${data}
        and buyer_user_id = ${context.userId}
        and listing_id is null
        and status in ('open', 'answered')
      returning id
    `;
    if (!updated[0]) throw new Error("No podés cancelar esa solicitud.");
    await audit(db, context.userId, "cancel_buyer_need", "quote_request", data, {});
    return { ok: true as const };
  });

export const listMyQuoteRequests = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    const requests = await db<{
      id: string;
      title: string;
      quantity: number;
      status: string;
      notes: string;
      address_line: string | null;
      delivery_required: boolean;
      listing_id: string | null;
      created_at: string;
    }>`
      select id, title, quantity, status, notes, address_line, delivery_required, listing_id, created_at::text
      from quote_requests
      where buyer_user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;
    const quotes = await db<{
      id: string;
      request_id: string;
      business_id: string;
      trade_name: string;
      unit_price_cents: string;
      quantity: number;
      shipping_cents: string;
      total_cents: string;
      lead_time_hours: number | null;
      notes: string;
      valid_until: string;
      status: string;
      business_methods: unknown;
      listing_methods: unknown;
    }>`
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
    `;
    return {
      requests,
      quotes: quotes.map((quote) => ({
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
        paymentMethods: acceptedMethods(quote.business_methods, quote.listing_methods),
      })),
    };
  });

export const listQuoteInbox = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    const access = await loadAccess(db, context.userId);
    if (access.businessIds.length === 0) return [];
    return db<{
      id: string;
      title: string;
      quantity: number;
      notes: string;
      address_line: string | null;
      delivery_required: boolean;
      listing_id: string | null;
      business_id: string;
      status: string;
      created_at: string;
      quote_id: string | null;
      quote_status: string | null;
    }>`
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

export const submitQuote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    requestId: string;
    businessId: string;
    unitPriceCents: number;
    quantity: number;
    shippingCents: number;
    leadTimeHours: number;
    notes: string;
  }) => {
    if (!input?.requestId || !input?.businessId) throw new Error("Faltan datos de la cotización.");
    if (!Number.isInteger(input.unitPriceCents) || input.unitPriceCents <= 0) throw new Error("Precio inválido.");
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) throw new Error("Cantidad inválida.");
    if (!Number.isInteger(input.shippingCents) || input.shippingCents < 0) throw new Error("Envío inválido.");
    if (!Number.isInteger(input.leadTimeHours) || input.leadTimeHours < 0 || input.leadTimeHours > 24 * 60) {
      throw new Error("Plazo inválido.");
    }
    return {
      ...input,
      notes: typeof input.notes === "string" ? input.notes.trim().slice(0, 800) : "",
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    const access = await loadAccess(db, context.userId);
    await enforceRateLimit(db, "message", context.userId);
    if (!can(access, "respond_quote", { businessId: data.businessId })) {
      throw new Error("Ese negocio no puede cotizar.");
    }
    const requests = await db<{
      id: string;
      buyer_user_id: string;
      status: string;
      title: string;
      listing_id: string | null;
      listing_business_id: string | null;
      listing_status: string | null;
      business_status: string | null;
      business_demo: boolean | null;
    }>`
      select r.id, r.buyer_user_id, r.status, r.title, r.listing_id,
        l.business_id as listing_business_id, l.status as listing_status,
        b.status as business_status, b.is_demo as business_demo
      from quote_requests r
      left join listings l on l.id = r.listing_id
      left join businesses b on b.id = ${data.businessId} and b.owner_user_id = ${context.userId}
      where r.id = ${data.requestId} and r.status in ('open', 'answered') and r.expires_at > now()
    `;
    const request = requests[0];
    if (!request) throw new Error("La solicitud no está abierta.");
    if (request.buyer_user_id === context.userId) throw new Error("No podés cotizar tu propia solicitud.");
    if (request.business_status !== "active" || request.business_demo) {
      throw new Error("El negocio tiene que estar activo para cotizar.");
    }
    if (request.listing_id) {
      if (request.listing_business_id !== data.businessId || request.listing_status !== "published") {
        throw new Error("Solo el proveedor de esa publicación puede cotizarla, y tiene que seguir publicada.");
      }
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
    await notify(
      db,
      request.buyer_user_id,
      "quote_received",
      "Recibiste una respuesta",
      request.title,
      "/cotizaciones",
    );
    await audit(db, context.userId, "submit_quote", "quote", quoteId, { requestId: request.id, total });
    return { ok: true as const };
  });

export const acceptQuote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { quoteId: string; idempotencyKey: string; paymentMethod?: string | null }) => {
    if (!input?.quoteId) throw new Error("Falta la cotización.");
    if (!input.idempotencyKey || input.idempotencyKey.length < 8 || input.idempotencyKey.length > 80) {
      throw new Error("Falta la clave de idempotencia.");
    }
    const paymentMethod =
      input.paymentMethod == null || input.paymentMethod === "" ? null : String(input.paymentMethod).trim().toLowerCase();
    if (paymentMethod && paymentMethod.length > 40) throw new Error("Medio de pago inválido.");
    return { quoteId: input.quoteId, idempotencyKey: input.idempotencyKey, paymentMethod };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const existing = await db<{ id: string }>`
      select id from orders where idempotency_key = ${data.idempotencyKey} and buyer_user_id = ${context.userId}
    `;
    if (existing[0]) return { orderId: existing[0].id, alreadyProcessed: true as const };

    const quotes = await db<{
      id: string;
      business_id: string;
      buyer_user_id: string;
      category_id: string;
      owner_user_id: string;
      title: string;
      business_methods: unknown;
      listing_methods: unknown;
    }>`
      select q.id, q.business_id, r.buyer_user_id, l.category_id, b.owner_user_id, l.name as title,
        b.payment_methods as business_methods, l.payment_methods as listing_methods
      from quotes q
      join quote_requests r on r.id = q.request_id
      join businesses b on b.id = q.business_id
      join listings l on l.id = r.listing_id
      where q.id = ${data.quoteId} and q.status = 'submitted' and q.valid_until > now()
        and r.status in ('open', 'answered') and l.is_demo = false
    `;
    const quote = quotes[0];
    if (!quote) throw new Error("Esa cotización ya no está vigente.");
    if (quote.buyer_user_id !== context.userId) throw new Error("No es tu solicitud.");
    if (quote.owner_user_id === context.userId) throw new Error("No podés aceptar tu propia oferta.");
    const choice = decidePaymentChoice({
      allowed: acceptedMethods(quote.business_methods, quote.listing_methods),
      chosen: data.paymentMethod,
    });
    if (!choice.ok) throw new Error(choice.reason);

    const rules = await db<{
      id: string;
      scope: "global" | "category" | "business";
      category_id: string | null;
      business_id: string | null;
      fee_bps: number;
      valid_from: string;
    }>`
      select id, scope, category_id, business_id, fee_bps, valid_from::text
      from commission_rules
      where active = true and (valid_to is null or valid_to > now())
    `;
    const settings = await db<{ value: number }>`
      select value::text::int as value from platform_settings where key = 'commission_default_bps'
    `;
    const feeRules: FeeRule[] = rules.map((rule) => ({
      id: rule.id,
      scope: rule.scope,
      categoryId: rule.category_id,
      businessId: rule.business_id,
      feeBps: rule.fee_bps,
      validFrom: rule.valid_from,
    }));
    const resolved = resolveFeeBps({
      rules: feeRules,
      businessId: quote.business_id,
      categoryId: quote.category_id,
      fallbackBps: settings[0]?.value ?? 300,
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
      paymentMethod: choice.method,
    });
    if (reserved.alreadyProcessed) return { orderId: reserved.orderId, alreadyProcessed: true as const };
    await notify(
      db,
      quote.owner_user_id,
      "quote_accepted",
      "Aceptaron tu respuesta",
      `${quote.title}. La compra queda pendiente de pago. El stock de ese producto quedó reservado.`,
      `/pedidos/${reserved.orderId}`,
    );
    await audit(db, context.userId, "accept_quote", "order", reserved.orderId, {
      quoteId: quote.id,
      feeBps: resolved.feeBps,
      paymentMethod: choice.method,
    });
    await audit(db, context.userId, "create_order", "order", reserved.orderId, {
      quoteId: quote.id,
      feeBps: resolved.feeBps,
      frozen: true,
    });
    return { orderId: reserved.orderId, alreadyProcessed: false as const };
  });

/**
 * Compra al precio ya publicado. No crea otro tipo de pedido:
 * arma la cotización con el precio, el envío y el plazo de la publicación
 * y la reserva con la misma función que aceptar una respuesta.
 * No cobra ni marca el pedido como pagado.
 */
export const buyPublishedListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    listingId: string;
    quantity: number;
    address: string;
    delivery: boolean;
    idempotencyKey: string;
    paymentMethod?: string | null;
  }) => {
    if (!input?.listingId) throw new Error("Elegí una publicación de un proveedor.");
    if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 100_000) {
      throw new Error("Cantidad inválida.");
    }
    if (!input.idempotencyKey || input.idempotencyKey.length < 8 || input.idempotencyKey.length > 80) {
      throw new Error("Falta la clave de idempotencia.");
    }
    const paymentMethod =
      input.paymentMethod == null || input.paymentMethod === "" ? null : String(input.paymentMethod).trim().toLowerCase();
    if (paymentMethod && paymentMethod.length > 40) throw new Error("Medio de pago inválido.");
    return {
      listingId: input.listingId,
      quantity: input.quantity,
      address: input.delivery === false ? "" : assertString(input.address, "Dirección de entrega", 160),
      delivery: input.delivery !== false,
      idempotencyKey: input.idempotencyKey,
      paymentMethod,
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await enforceRateLimit(db, "quote_request", context.userId);
    const existing = await db<{ id: string }>`
      select id from orders where idempotency_key = ${data.idempotencyKey} and buyer_user_id = ${context.userId}
    `;
    if (existing[0]) return { orderId: existing[0].id, alreadyProcessed: true as const };

    const listings = await db<{
      id: string;
      name: string;
      category_id: string;
      business_id: string;
      owner_user_id: string;
      price_cents: string;
      shipping_cents: string;
      stock_units: number;
      delivery: boolean;
      pickup: boolean;
      status: string;
      is_demo: boolean;
      lead_time_hours: number | null;
      business_status: string;
      business_demo: boolean;
      business_methods: unknown;
      listing_methods: unknown;
    }>`
      select l.id, l.name, l.category_id, l.business_id, b.owner_user_id,
        l.price_cents::text, l.shipping_cents::text, l.stock_units, l.delivery, l.pickup,
        l.status, l.is_demo, l.lead_time_hours, b.status as business_status, b.is_demo as business_demo,
        b.payment_methods as business_methods, l.payment_methods as listing_methods
      from listings l
      join businesses b on b.id = l.business_id
      where l.id = ${data.listingId}
    `;
    const listing = listings[0];
    if (!listing || listing.is_demo || listing.business_demo || listing.business_status !== "active" || listing.status !== "published") {
      throw new Error("Esa publicación no está a la venta.");
    }
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
      chosen: data.paymentMethod,
    });
    if (!choice.ok) throw new Error(choice.reason);

    const rules = await db<{
      id: string;
      scope: "global" | "category" | "business";
      category_id: string | null;
      business_id: string | null;
      fee_bps: number;
      valid_from: string;
    }>`
      select id, scope, category_id, business_id, fee_bps, valid_from::text
      from commission_rules
      where active = true and (valid_to is null or valid_to > now())
    `;
    const settings = await db<{ value: number }>`
      select value::text::int as value from platform_settings where key = 'commission_default_bps'
    `;
    const feeRules: FeeRule[] = rules.map((rule) => ({
      id: rule.id,
      scope: rule.scope,
      categoryId: rule.category_id,
      businessId: rule.business_id,
      feeBps: rule.fee_bps,
      validFrom: rule.valid_from,
    }));
    const resolved = resolveFeeBps({
      rules: feeRules,
      businessId: listing.business_id,
      categoryId: listing.category_id,
      fallbackBps: settings[0]?.value ?? 300,
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
    let reserved: { orderId: string; alreadyProcessed: boolean };
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
        eventNote: "Pedido creado al confirmar la compra al precio publicado. El precio, la comisión y la imagen quedaron congelados.",
      });
    } catch (error) {
      await db`
        delete from quote_requests
        where id = ${requestId} and buyer_user_id = ${context.userId} and status in ('open', 'answered')
      `;
      throw error;
    }
    if (reserved.alreadyProcessed) return { orderId: reserved.orderId, alreadyProcessed: true as const };
    await notify(
      db,
      listing.owner_user_id,
      "quote_accepted",
      "Nueva compra",
      `${listing.name}. Quedó pendiente de pago. El stock de ese producto quedó reservado.`,
      `/pedidos/${reserved.orderId}`,
    );
    await audit(db, context.userId, "buy_listing", "order", reserved.orderId, {
      listingId: listing.id,
      quoteId,
      feeBps: resolved.feeBps,
      paymentMethod: choice.method,
      unitPriceCents,
      quantity: data.quantity,
    });
    await audit(db, context.userId, "create_order", "order", reserved.orderId, {
      quoteId,
      feeBps: resolved.feeBps,
      frozen: true,
      source: "published_price",
    });
    return { orderId: reserved.orderId, alreadyProcessed: false as const };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    const access = await loadAccess(db, context.userId);
    return db<{
      id: string;
      status: string;
      total_cents: string;
      fulfillment: string;
      created_at: string;
      trade_name: string;
      role: string;
    }>`
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

export const getOrder = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((orderId: string) => {
    if (typeof orderId !== "string" || orderId.length < 8) throw new Error("Pedido inválido.");
    return orderId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    const access = await loadAccess(db, context.userId);
    const orders = await db<{
      id: string;
      buyer_user_id: string;
      business_id: string;
      status: string;
      fulfillment: string;
      subtotal_cents: string;
      shipping_cents: string;
      total_cents: string;
      settlement_status: string;
      refund_status: string;
      created_at: string;
      trade_name: string;
      owner_user_id: string;
      payment_method: string | null;
      payment_declared: boolean;
    }>`
      select o.id, o.buyer_user_id, o.business_id, o.status, o.fulfillment, o.subtotal_cents::text,
        o.shipping_cents::text, o.total_cents::text, o.settlement_status, o.refund_status, o.created_at::text,
        b.trade_name, b.owner_user_id, o.payment_method, o.payment_declared
      from orders o
      join businesses b on b.id = o.business_id
      where o.id = ${data}
    `;
    const order = orders[0];
    if (!order) throw new Error("Pedido inexistente.");
    const accessView = orderAccess({
      actorUserId: context.userId,
      buyerUserId: order.buyer_user_id,
      ownerUserId: order.owner_user_id,
      platformRole: access.platformRole,
      intent: "view",
    });
    if (!accessView.ok) throw new Error(accessView.reason);
    const items = await db<{
      title: string;
      quantity: number;
      unit_price_cents: string;
      line_cents: string;
      brand: string;
      model: string;
      sku: string;
      unit: string;
    }>`
      select title, quantity, unit_price_cents::text, line_cents::text,
        brand, model, sku, unit
      from order_items where order_id = ${order.id}
    `;
    const economics = await db<{
      fee_bps: number;
      marketplace_fee_cents: string;
      supplier_before_processor_cents: string;
      processor_fee_cents: string | null;
    }>`
      select fee_bps, marketplace_fee_cents::text, supplier_before_processor_cents::text, processor_fee_cents::text
      from order_economics where order_id = ${order.id}
    `;
    const events = await db<{ to_status: string; actor_kind: string; note: string | null; created_at: string }>`
      select to_status, actor_kind, note, created_at::text from order_events
      where order_id = ${order.id} order by created_at
    `;
    const disputes = await db<{ id: string; reason: string; status: string; description: string; refund_status: string }>`
      select id, reason, status, description, refund_status from disputes where order_id = ${order.id}
    `;
    const env = readMercadoPagoEnv();
    const paymentMissing = missingMercadoPagoCredentials(env);
    const storage = tokenStorageMode({ productionDatabase: dbSource === "neon", tokenKey: env.tokenKey });
    const links = await db<{ status: string; disconnected_at: string | null }>`
      select status, disconnected_at::text
      from seller_payment_accounts
      where business_id = ${order.business_id} and provider = 'mercadopago'
    `;
    const link = links[0];
    const payments = await db<{ status: string }>`
      select status from payments
      where order_id = ${order.id} and provider = 'mercadopago'
      order by created_at desc
      limit 1
    `;
    const paymentDeclared = order.payment_declared === true;
    const paymentMethod = order.payment_method;
    const processorFee =
      economics[0]?.processor_fee_cents != null && economics[0].processor_fee_cents !== ""
        ? asInt(economics[0].processor_fee_cents)
        : null;
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
        unit: item.unit,
      })),
      economics: economics[0]
        ? {
            feeBps: economics[0].fee_bps,
            marketplaceFeeCents: asInt(economics[0].marketplace_fee_cents),
            supplierBeforeProcessorCents: asInt(economics[0].supplier_before_processor_cents),
            processorFeeCents: processorFee,
            supplierNetCents:
              processorFee == null
                ? null
                : supplierNetCents({
                    grossCents: asInt(order.total_cents),
                    marketplaceFeeCents: asInt(economics[0].marketplace_fee_cents),
                    processorFeeCents: processorFee,
                  }),
          }
        : null,
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
        mpStatus: payments[0]?.status ?? null,
      }),
      mercadoPagoCheckout: allowsMercadoPagoCheckout({ method: paymentMethod, declared: paymentDeclared }),
    };
  });

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((orderId: string) => {
    if (typeof orderId !== "string" || orderId.length < 8) throw new Error("Pedido inválido.");
    return orderId;
  })
  .handler(async ({ context, data }) => createCheckoutPreference({ userId: context.userId, orderId: data }));

async function applyAction(
  orderId: string,
  userId: string,
  action: "supplier_confirm" | "start_preparing" | "mark_ready_for_pickup" | "mark_out_for_delivery" | "cancel" | "buyer_close",
) {
  const db = await sql();
  const access = await loadAccess(db, userId);
  const orders = await db<{
    id: string;
    status: OrderStatus;
    fulfillment: "delivery" | "pickup";
    buyer_user_id: string;
    owner_user_id: string;
    business_id: string;
  }>`
    select o.id, o.status, o.fulfillment, o.buyer_user_id, b.owner_user_id, o.business_id
    from orders o join businesses b on b.id = o.business_id
    where o.id = ${orderId}
  `;
  const order = orders[0];
  if (!order) throw new Error("Pedido inexistente.");
  const actor =
    order.owner_user_id === userId
      ? "supplier"
      : order.buyer_user_id === userId
        ? "buyer"
        : access.platformRole === "admin"
          ? "admin"
          : null;
  if (!actor) throw new Error("No podés operar ese pedido.");
  const intent = actor === "supplier" ? "supplier" : actor === "buyer" ? "buyer" : "view";
  const allowed = orderAccess({
    actorUserId: userId,
    buyerUserId: order.buyer_user_id,
    ownerUserId: order.owner_user_id,
    platformRole: access.platformRole,
    intent: action === "cancel" && actor === "admin" ? "view" : intent,
  });
  if (!allowed.ok) throw new Error(allowed.reason);
  if (actor === "supplier" && !can(access, "fulfill_order", { businessId: order.business_id })) {
    throw new Error("Negocio suspendido.");
  }
  const next = transitionOrder({ from: order.status, action, actor, fulfillment: order.fulfillment });
  let deliveryCode: string | null = null;
  if (action === "mark_out_for_delivery" || action === "mark_ready_for_pickup") {
    deliveryCode = generateDeliveryCode();
    const hash = hashDeliveryCode(deliveryCode, deliveryPepper());
    await db`
      insert into delivery_codes (id, order_id, code_hash, expires_at)
      values (${id()}, ${order.id}, ${hash}, now() + interval '7 days')
    `;
  }
  const moved =
    action === "cancel"
      ? await db<{ id: string }>`
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
        `
      : await db<{ id: string }>`
          update orders set status = ${next}, updated_at = now(),
            settlement_status = case when ${next} = 'COMPLETED' then 'awaiting_provider' else settlement_status end
          where id = ${order.id} and status = ${order.status}
          returning id
        `;
  if (!moved[0]) throw new Error("El pedido cambió mientras lo actualizabas. Recargá.");
  await db`
    insert into order_events (id, order_id, from_status, to_status, actor_user_id, actor_kind, note)
    values (${id()}, ${order.id}, ${order.status}, ${next}, ${userId}, ${actor}, ${action})
  `;
  await audit(db, userId, action, "order", order.id, { from: order.status, to: next });
  if (action === "cancel" && order.status !== "PENDING_PAYMENT") {
    const refund = await settleCancellationRefund(order.id);
    return { status: refund.status, deliveryCode, message: refund.message };
  }
  return { status: next, deliveryCode, message: null as string | null };
}

export const advanceOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { orderId: string; action: "supplier_confirm" | "start_preparing" | "mark_ready_for_pickup" | "mark_out_for_delivery" | "cancel" | "buyer_close" }) => {
    const allowed = ["supplier_confirm", "start_preparing", "mark_ready_for_pickup", "mark_out_for_delivery", "cancel", "buyer_close"] as const;
    if (!input?.orderId || !allowed.includes(input.action)) throw new Error("Acción inválida.");
    return input;
  })
  .handler(async ({ context, data }) => applyAction(data.orderId, context.userId, data.action));

export const confirmDeliveryCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { orderId: string; code: string }) => {
    if (!input?.orderId || !/^\d{8}$/.test(input.code ?? "")) throw new Error("El código tiene 8 dígitos.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    const orders = await db<{ id: string; status: OrderStatus; buyer_user_id: string }>`
      select id, status, buyer_user_id from orders where id = ${data.orderId}
    `;
    const order = orders[0];
    const buyer = orderAccess({
      actorUserId: context.userId,
      buyerUserId: order?.buyer_user_id ?? "",
      ownerUserId: "",
      platformRole: "user",
      intent: "buyer",
    });
    if (!order || !buyer.ok) throw new Error("No es tu pedido.");
    const codes = await db<{ code_hash: string; used_at: string | null; expires_at: string }>`
      select code_hash, used_at::text, expires_at::text
      from delivery_codes where order_id = ${order.id}
      order by created_at desc limit 1
    `;
    const current = codes[0];
    if (!current) throw new Error("Este pedido todavía no tiene código de entrega.");
    const verdict = assessDeliveryCode({
      storedHash: current.code_hash,
      providedCode: data.code,
      pepper: deliveryPepper(),
      usedAt: current.used_at,
      expiresAt: current.expires_at,
    });
    if (verdict !== "ok") {
      await audit(db, context.userId, "delivery_code_rejected", "order", order.id, { verdict });
      throw new Error(
        verdict === "used" ? "Ese código ya se usó." : verdict === "expired" ? "El código venció." : "El código no coincide.",
      );
    }
    const next = transitionOrder({
      from: order.status,
      action: "delivery_code_accepted",
      actor: "system",
      fulfillment: order.status === "READY_FOR_PICKUP" ? "pickup" : "delivery",
    });
    const hash = hashDeliveryCode(data.code, deliveryPepper());
    const moved = await db<{ id: string }>`
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
    `;
    if (!moved[0]) throw new Error("No se pudo confirmar la entrega. El código no se consumió.");
    await db`
      insert into order_events (id, order_id, from_status, to_status, actor_user_id, actor_kind, note)
      values (${id()}, ${order.id}, ${order.status}, ${next}, ${context.userId}, 'system', 'Código de entrega validado')
    `;
    await audit(db, context.userId, "delivery_code_accepted", "order", order.id, {});
    return { status: next };
  });

export const openDispute = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { orderId: string; reason: string; description: string }) => {
    if (!input?.orderId) throw new Error("Falta el pedido.");
    if (!DISPUTE_REASONS.includes(input.reason as (typeof DISPUTE_REASONS)[number])) {
      throw new Error("Motivo inválido.");
    }
    return {
      orderId: input.orderId,
      reason: input.reason,
      description: assertString(input.description, "Descripción", 2000),
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    const access = await loadAccess(db, context.userId);
    const orders = await db<{ id: string; status: OrderStatus; buyer_user_id: string; fulfillment: "delivery" | "pickup"; owner_user_id: string }>`
      select o.id, o.status, o.buyer_user_id, o.fulfillment, b.owner_user_id
      from orders o join businesses b on b.id = o.business_id
      where o.id = ${data.orderId}
    `;
    const order = orders[0];
    if (!order) throw new Error("Pedido inexistente.");
    const buyer = orderAccess({
      actorUserId: context.userId,
      buyerUserId: order.buyer_user_id,
      ownerUserId: order.owner_user_id,
      platformRole: access.platformRole,
      intent: "buyer",
    });
    if (!buyer.ok) throw new Error("Solo el comprador puede abrir la disputa.");
    await enforceRateLimit(db, "sensitive", context.userId);
    const next = transitionOrder({
      from: order.status,
      action: "open_dispute",
      actor: "buyer",
      fulfillment: order.fulfillment,
    });
    const disputeId = id();
    const moved = await db<{ id: string }>`
      update orders set status = ${next}, updated_at = now()
      where id = ${order.id} and status = ${order.status} and buyer_user_id = ${context.userId}
      returning id
    `;
    if (!moved[0]) throw new Error("No se pudo abrir la disputa.");
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
    await audit(db, context.userId, "open_dispute", "dispute", disputeId, { orderId: order.id, reason: data.reason });
    return { id: disputeId };
  });

export const addDisputeMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { disputeId: string; body: string }) => ({
    disputeId: assertString(input?.disputeId, "Disputa", 80),
    body: assertString(input?.body, "Mensaje", 2000),
  }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    const access = await loadAccess(db, context.userId);
    const rows = await db<{ id: string; buyer_user_id: string; owner_user_id: string }>`
      select d.id, o.buyer_user_id, b.owner_user_id
      from disputes d
      join orders o on o.id = d.order_id
      join businesses b on b.id = o.business_id
      where d.id = ${data.disputeId}
    `;
    const dispute = rows[0];
    if (!dispute) throw new Error("Disputa inexistente.");
    const party = orderAccess({
      actorUserId: context.userId,
      buyerUserId: dispute.buyer_user_id,
      ownerUserId: dispute.owner_user_id,
      platformRole: access.platformRole,
      intent: "party",
    });
    if (!party.ok) throw new Error(party.reason);
    await enforceRateLimit(db, "message", context.userId);
    await db`
      insert into dispute_messages (id, dispute_id, author_user_id, body)
      values (${id()}, ${dispute.id}, ${context.userId}, ${data.body})
    `;
    await audit(db, context.userId, "dispute_message", "dispute", dispute.id, {});
    return { ok: true as const };
  });
