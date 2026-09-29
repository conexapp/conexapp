import type { Sql } from "../../db.ts";

export type ReservationInput = {
  quoteId: string;
  buyerUserId: string;
  orderId: string;
  itemId: string;
  eventId: string;
  idempotencyKey: string;
  feeBps: number;
  feeRuleId: string | null;
  paymentMethod: string | null;
  /** Si no se pasa, queda el texto de aceptar una cotización. */
  eventNote?: string;
};

function isUniqueViolation(error: unknown): boolean {
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
export async function reserveAcceptedOrder(
  db: Sql,
  input: ReservationInput,
): Promise<{ orderId: string; alreadyProcessed: boolean }> {
  try {
    const inserted = await db<{ id: string }>`
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
    `;
    const orderId = inserted[0]?.id;
    if (!orderId) {
      throw new Error(
        "No hay stock suficiente o la publicación ya no está a la venta. Solo una reserva puede tomar esas unidades.",
      );
    }
    return { orderId, alreadyProcessed: false };
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const existing = await db<{ id: string }>`
      select id from orders
      where idempotency_key = ${input.idempotencyKey} and buyer_user_id = ${input.buyerUserId}
    `;
    if (!existing[0]) throw error;
    return { orderId: existing[0].id, alreadyProcessed: true };
  }
}
