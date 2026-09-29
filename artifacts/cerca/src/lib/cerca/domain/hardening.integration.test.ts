import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { fileURLToPath } from "node:url";
import type { Sql } from "../../db.ts";
import { consumeAuthToken, hashAuthToken } from "./auth-token.ts";
import { bumpRateLimit, rateLimitDecision } from "./rate-limit.ts";
import { acceptedMethods, decidePaymentChoice } from "./payment-methods.ts";
import { reserveAcceptedOrder } from "./reserve-order.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

function asSql(queryable: { query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }> }): Sql {
  const run = async <T>(text: string, params: unknown[]): Promise<T[]> => {
    const result = await queryable.query(text, params);
    return result.rows as T[];
  };
  const sql = (async <T>(strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0] ?? "";
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1] ?? ""}`;
    return run<T>(text, values);
  }) as Sql;
  sql.query = run;
  return sql;
}

async function migrate(pg: PGlite): Promise<void> {
  const dir = path.join(root, "migrations");
  const names = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    await pg.exec(await readFile(path.join(dir, name), "utf8"));
  }
}

const LISTING = "11111111-1111-4111-8111-111111111111";
const IMAGE = "22222222-2222-4222-8222-222222222222";

describe("reserva de stock y pedido histórico", () => {
  it("dos aceptaciones simultáneas sobre la última unidad dejan una sola reserva", async () => {
    const pg = new PGlite();
    await migrate(pg);
    const db = asSql(pg);
    await db`
      insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt") values
        ('owner', 'Dueño', 'owner@test', true, now(), now()),
        ('buyer-a', 'Ana', 'ana@test', true, now(), now()),
        ('buyer-b', 'Bea', 'bea@test', true, now(), now())
    `;
    await db`
      insert into businesses (id, owner_user_id, legal_name, trade_name, slug, status)
      values ('biz', 'owner', 'Legal', 'Corralón', 'corralon', 'active')
    `;
    await db`
      insert into listings (
        id, business_id, category_id, slug, name, brand, model, sku, price_cents, unit,
        stock_units, status, is_demo
      ) values (
        ${LISTING}, 'biz', 'cat-cementos', 'cemento-test', 'Cemento Portland 50 kg',
        'Loma Negra', 'CP40', 'SKU-50', 1050000, 'bolsa', 1, 'published', false
      )
    `;
    await db`
      insert into listing_images (id, listing_id, storage_key, content_type, byte_size, is_primary, status)
      values (
        ${IMAGE}, ${LISTING}, ${`listings/${LISTING}/${IMAGE}`}, 'image/jpeg', 120, true, 'ready'
      )
    `;
    for (const buyer of ["buyer-a", "buyer-b"]) {
      await db`
        insert into quote_requests (
          id, buyer_user_id, listing_id, category_id, title, quantity, delivery_required, status, expires_at
        ) values (
          ${`req-${buyer}`}, ${buyer}, ${LISTING}, 'cat-cementos', 'Cemento Portland 50 kg', 1, false,
          'open', now() + interval '2 days'
        )
      `;
      await db`
        insert into quotes (
          id, request_id, business_id, unit_price_cents, quantity, shipping_cents, total_cents, valid_until, status
        ) values (
          ${`quote-${buyer}`}, ${`req-${buyer}`}, 'biz', 900, 1, 0, 900, now() + interval '1 day', 'submitted'
        )
      `;
    }

    const attempt = (buyer: string) =>
      pg.transaction(async (tx) => {
        try {
          return await reserveAcceptedOrder(asSql(tx), {
            quoteId: `quote-${buyer}`,
            buyerUserId: buyer,
            orderId: `order-${buyer}`,
            itemId: `item-${buyer}`,
            eventId: `event-${buyer}`,
            idempotencyKey: `idem-${buyer}-12345678`,
            feeBps: 300,
            feeRuleId: null,
            paymentMethod: null,
          });
        } catch (error) {
          return { error: error instanceof Error ? error.message : "falló" };
        }
      });

    const results = await Promise.all([attempt("buyer-a"), attempt("buyer-b")]);
    const wins = results.filter((result) => "orderId" in result && result.orderId);
    const losses = results.filter((result) => "error" in result);
    assert.equal(wins.length, 1);
    assert.equal(losses.length, 1);
    assert.match(String((losses[0] as { error: string }).error), /stock suficiente|una reserva/);

    const stock = await db<{ stock_units: number; status: string }>`
      select stock_units, status from listings where id = ${LISTING}
    `;
    assert.equal(stock[0]?.stock_units, 0);
    assert.equal(stock[0]?.status, "out_of_stock");
    const orders = await db<{ n: number }>`select count(*)::int as n from orders`;
    assert.equal(orders[0]?.n, 1);
    const stored = await db<{ payment_method: string | null; payment_declared: boolean; status: string }>`
      select payment_method, payment_declared, status from orders
    `;
    assert.equal(stored[0]?.status, "PENDING_PAYMENT");
    assert.equal(stored[0]?.payment_method, null);
    assert.equal(stored[0]?.payment_declared, true);
    await assert.rejects(db`update listings set stock_units = -1 where id = ${LISTING}`);

    const before = await db<{
      title: string;
      brand: string;
      sku: string;
      unit: string;
      unit_price_cents: string;
      image_key: string;
      fee_bps: number;
    }>`
      select i.title, i.brand, i.sku, i.unit, i.unit_price_cents::text, i.image_key, e.fee_bps
      from order_items i
      join order_economics e on e.order_id = i.order_id
    `;
    await db`
      update listings
      set name = 'Otro nombre', brand = 'Otra', sku = 'OTRO', unit = 'pallet', price_cents = 50,
          status = 'archived', updated_at = now()
      where id = ${LISTING}
    `;
    await db`
      insert into platform_settings (key, value)
      values ('commission_default_bps', '900'::jsonb)
      on conflict (key) do update set value = excluded.value
    `;
    const after = await db<{
      title: string;
      brand: string;
      sku: string;
      unit: string;
      unit_price_cents: string;
      image_key: string;
      fee_bps: number;
    }>`
      select i.title, i.brand, i.sku, i.unit, i.unit_price_cents::text, i.image_key, e.fee_bps
      from order_items i
      join order_economics e on e.order_id = i.order_id
    `;
    assert.deepEqual(after[0], before[0]);
    assert.equal(after[0]?.title, "Cemento Portland 50 kg");
    assert.equal(after[0]?.brand, "Loma Negra");
    assert.equal(after[0]?.sku, "SKU-50");
    assert.equal(after[0]?.unit, "bolsa");
    assert.equal(after[0]?.unit_price_cents, "900");
    assert.equal(after[0]?.image_key, `listings/${LISTING}/${IMAGE}`);
    assert.equal(after[0]?.fee_bps, 300);
    await pg.close();
  });

  it("guarda el medio elegido y no lo trata como pago confirmado", async () => {
    const pg = new PGlite();
    await migrate(pg);
    const db = asSql(pg);
    await db`
      insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt") values
        ('owner', 'Dueño', 'owner@test', true, now(), now()),
        ('buyer', 'Ana', 'ana@test', true, now(), now())
    `;
    await db`
      insert into businesses (id, owner_user_id, legal_name, trade_name, slug, status, payment_methods)
      values ('biz', 'owner', 'Legal', 'Corralón', 'corralon', 'active', '["transferencia","efectivo","visa","mastercard","visa_debito"]'::jsonb)
    `;
    await db`
      insert into listings (
        id, business_id, category_id, slug, name, brand, model, sku, price_cents, unit,
        stock_units, status, is_demo
      ) values (
        ${LISTING}, 'biz', 'cat-cementos', 'cemento-test', 'Cemento',
        'Loma Negra', 'CP40', 'SKU-50', 900, 'bolsa', 2, 'published', false
      )
    `;
    await db`
      insert into quote_requests (
        id, buyer_user_id, listing_id, category_id, title, quantity, delivery_required, status, expires_at
      ) values (
        'req-pay', 'buyer', ${LISTING}, 'cat-cementos', 'Cemento', 1, false, 'open', now() + interval '2 days'
      )
    `;
    await db`
      insert into quotes (
        id, request_id, business_id, unit_price_cents, quantity, shipping_cents, total_cents, valid_until, status
      ) values (
        'quote-pay', 'req-pay', 'biz', 900, 1, 0, 900, now() + interval '1 day', 'submitted'
      )
    `;
    const rows = await db<{ business_methods: unknown; listing_methods: unknown }>`
      select b.payment_methods as business_methods, l.payment_methods as listing_methods
      from listings l join businesses b on b.id = l.business_id
      where l.id = ${LISTING}
    `;
    const allowed = acceptedMethods(rows[0]?.business_methods, rows[0]?.listing_methods);
    assert.deepEqual(allowed, ["visa_debito", "transferencia"]);
    assert.equal(allowed.includes("efectivo"), false);
    assert.equal(allowed.includes("visa"), false);
    assert.equal(allowed.includes("mastercard"), false);
    assert.equal(allowed.includes("visa_credito"), false);
    assert.equal(allowed.includes("mastercard_debito"), false);
    assert.equal(decidePaymentChoice({ allowed, chosen: "mastercard" }).ok, false);
    assert.equal(decidePaymentChoice({ allowed, chosen: "visa" }).ok, false);
    assert.equal(decidePaymentChoice({ allowed, chosen: "efectivo" }).ok, false);
    assert.equal(decidePaymentChoice({ allowed, chosen: "mercadopago" }).ok, false);
    const chosen = decidePaymentChoice({ allowed, chosen: "transferencia" });
    assert.equal(chosen.ok, true);
    const reserved = await reserveAcceptedOrder(db, {
      quoteId: "quote-pay",
      buyerUserId: "buyer",
      orderId: "order-pay",
      itemId: "item-pay",
      eventId: "event-pay",
      idempotencyKey: "idem-pay-12345678",
      feeBps: 300,
      feeRuleId: null,
      paymentMethod: chosen.ok ? chosen.method : null,
    });
    assert.equal(reserved.orderId, "order-pay");
    const order = await db<{ payment_method: string | null; payment_declared: boolean; status: string; fee_bps: number }>`
      select o.payment_method, o.payment_declared, o.status, e.fee_bps
      from orders o join order_economics e on e.order_id = o.id
      where o.id = 'order-pay'
    `;
    assert.equal(order[0]?.payment_method, "transferencia");
    assert.equal(order[0]?.payment_declared, true);
    assert.equal(order[0]?.status, "PENDING_PAYMENT");
    assert.equal(order[0]?.fee_bps, 300);
    await pg.close();
  });

  it("un token de correo se consume una sola vez y el límite cuenta en la base", async () => {
    const pg = new PGlite();
    await migrate(pg);
    const db = asSql(pg);
    const token = "token-de-verificacion-que-es-largo";
    await db`
      insert into auth_tokens (token_hash, email, kind, expires_at)
      values (${hashAuthToken(token)}, 'ana@test', 'verify', now() + interval '1 hour')
    `;
    assert.equal(await consumeAuthToken(db, token), true);
    assert.equal(await consumeAuthToken(db, token), false);
    const hits = [
      await bumpRateLimit(db, "login:ana", 300),
      await bumpRateLimit(db, "login:ana", 300),
      await bumpRateLimit(db, "login:ana", 300),
    ];
    assert.deepEqual(hits, [1, 2, 3]);
    assert.equal(rateLimitDecision({ hits: hits[2] ?? 0, max: 2 }), "deny");
    await pg.close();
  });

  it("el alta de admin no promociona a un email que no es el de bootstrap", async () => {
    const pg = new PGlite();
    await migrate(pg);
    const db = asSql(pg);
    await db`
      insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt") values
        ('ops', 'Ops', 'ops@cerca.test', true, now(), now()),
        ('otro', 'Otro', 'otro@cerca.test', true, now(), now())
    `;
    await db`insert into profiles (user_id) values ('ops'), ('otro')`;
    const roles = await db<{ platform_role: string }>`select platform_role from profiles order by user_id`;
    assert.deepEqual(roles.map((row) => row.platform_role), ["ops", "otro"].sort().map(() => "user"));
    const denied = await db`
      update profiles p
      set platform_role = 'admin'
      from "user" u
      where p.user_id = u.id
        and p.user_id = 'otro'
        and lower(u.email) = 'ops@cerca.test'
        and u."emailVerified" = true
        and (select count(*) from profiles where platform_role = 'admin') = 0
      returning p.user_id
    `;
    assert.equal(denied.length, 0);
    const granted = await db<{ user_id: string }>`
      update profiles p
      set platform_role = 'admin'
      from "user" u
      where p.user_id = u.id
        and p.user_id = 'ops'
        and lower(u.email) = 'ops@cerca.test'
        and u."emailVerified" = true
        and (select count(*) from profiles where platform_role = 'admin') = 0
      returning p.user_id
    `;
    assert.equal(granted[0]?.user_id, "ops");
    const again = await db`
      update profiles p
      set platform_role = 'admin'
      from "user" u
      where p.user_id = u.id
        and p.user_id = 'otro'
        and lower(u.email) = 'otro@cerca.test'
        and (select count(*) from profiles where platform_role = 'admin') = 0
      returning p.user_id
    `;
    assert.equal(again.length, 0);
    await pg.close();
  });
});
