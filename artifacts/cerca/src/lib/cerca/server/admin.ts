import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { can } from "../domain/permissions";
import { transitionOrder, type OrderStatus } from "../domain/orders";
import { audit, id, loadAccess, sql } from "./helpers";
import { enforceRateLimit } from "./rate-limit";

async function requireAdmin(userId: string) {
  const db = await sql();
  const access = await loadAccess(db, userId);
  if (!can(access, "admin")) throw new Error("Hace falta un administrador.");
  return { db, access };
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { db } = await requireAdmin(context.userId);
    const [metrics] = await db<{
      users: number;
      businesses: number;
      pending: number;
      live_offers: number;
      orders: number;
      disputes: number;
      demo_businesses: number;
    }>`
      select
        (select count(*)::int from profiles) as users,
        (select count(*)::int from businesses where status = 'active' and is_demo = false) as businesses,
        (select count(*)::int from businesses where status = 'pending_review') as pending,
        (select count(*)::int from listings l join businesses b on b.id = l.business_id where l.status = 'published' and b.is_demo = false and l.is_demo = false) as live_offers,
        (select count(*)::int from orders) as orders,
        (select count(*)::int from disputes where status in ('open', 'under_review', 'awaiting_supplier')) as disputes,
        (select count(*)::int from businesses where is_demo = true) as demo_businesses
    `;
    const businesses = await db<{
      id: string;
      trade_name: string;
      status: string;
      city: string;
      is_demo: boolean;
      owner_email: string;
    }>`
      select b.id, b.trade_name, b.status, b.city, b.is_demo, u.email as owner_email
      from businesses b
      join "user" u on u.id = b.owner_user_id
      order by b.created_at desc
      limit 40
    `;
    const rules = await db<{ id: string; scope: string; fee_bps: number; valid_from: string }>`
      select id, scope, fee_bps, valid_from::text from commission_rules
      where active = true order by valid_from desc limit 12
    `;
    const [setting] = await db<{ value: string }>`
      select value::text as value from platform_settings where key = 'commission_default_bps'
    `;
    return {
      metrics,
      businesses,
      rules,
      defaultFeeBps: Number(setting?.value ?? 300),
    };
  });

export const setDefaultCommission = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((feeBps: number) => {
    if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 3000) {
      throw new Error("La comisión tiene que estar entre 0 y 30,00%.");
    }
    return feeBps;
  })
  .handler(async ({ context, data }) => {
    const { db } = await requireAdmin(context.userId);
    await enforceRateLimit(db, "sensitive", context.userId);
    const ruleId = id();
    await db`
      insert into commission_rules (id, scope, fee_bps, created_by)
      values (${ruleId}, 'global', ${data}, ${context.userId})
    `;
    await db`
      insert into platform_settings (key, value, updated_at, updated_by)
      values ('commission_default_bps', to_jsonb(${data}::int), now(), ${context.userId})
      on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by
    `;
    await audit(db, context.userId, "set_commission", "commission_rule", ruleId, { feeBps: data });
    return { ok: true as const };
  });

export const reviewBusiness = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { businessId: string; decision: "active" | "suspended" }) => {
    if (!input?.businessId || (input.decision !== "active" && input.decision !== "suspended")) {
      throw new Error("Decisión inválida.");
    }
    return input;
  })
  .handler(async ({ context, data }) => {
    const { db } = await requireAdmin(context.userId);
    await enforceRateLimit(db, "sensitive", context.userId);
    const updated = await db<{ id: string; owner_user_id: string }>`
      update businesses set status = ${data.decision}, updated_at = now(),
        verified_at = case when ${data.decision} = 'active' then coalesce(verified_at, now()) else verified_at end
      where id = ${data.businessId} and is_demo = false
      returning id, owner_user_id
    `;
    if (!updated[0]) throw new Error("No se pudo actualizar ese negocio. Los ejemplos de desarrollo no se aprueban como reales.");
    await audit(db, context.userId, "review_business", "business", data.businessId, { decision: data.decision });
    return { ok: true as const };
  });

export const resolveDispute = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { disputeId: string; outcome: "buyer" | "supplier"; note: string }) => {
    if (!input?.disputeId || (input.outcome !== "buyer" && input.outcome !== "supplier")) {
      throw new Error("Resolución inválida.");
    }
    const note = typeof input.note === "string" ? input.note.trim() : "";
    if (note.length < 8) throw new Error("La resolución necesita un fundamento.");
    return { disputeId: input.disputeId, outcome: input.outcome, note: note.slice(0, 2000) };
  })
  .handler(async ({ context, data }) => {
    const { db } = await requireAdmin(context.userId);
    await enforceRateLimit(db, "sensitive", context.userId);
    const rows = await db<{ id: string; order_id: string; status: OrderStatus; fulfillment: "delivery" | "pickup" }>`
      select d.id, d.order_id, o.status, o.fulfillment
      from disputes d join orders o on o.id = d.order_id
      where d.id = ${data.disputeId}
    `;
    const dispute = rows[0];
    if (!dispute) throw new Error("Disputa inexistente.");
    if (data.outcome === "supplier") {
      const next = transitionOrder({
        from: dispute.status,
        action: "admin_complete",
        actor: "admin",
        fulfillment: dispute.fulfillment,
      });
      await db`
        update orders set status = ${next}, settlement_status = 'awaiting_provider', updated_at = now()
        where id = ${dispute.order_id} and status = 'DISPUTED'
      `;
      await db`
        update disputes set status = 'resolved_supplier', resolution = ${data.note}, updated_at = now()
        where id = ${dispute.id}
      `;
    } else {
      await db`
        update disputes
        set status = 'resolved_buyer', resolution = ${data.note}, refund_status = 'blocked_unconfigured', updated_at = now()
        where id = ${dispute.id}
      `;
    }
    await db`
      insert into dispute_messages (id, dispute_id, author_user_id, body)
      values (${id()}, ${dispute.id}, ${context.userId}, ${data.note})
    `;
    await audit(db, context.userId, "resolve_dispute", "dispute", dispute.id, {
      outcome: data.outcome,
      refundExecuted: false,
    });
    return {
      ok: true as const,
      refundExecuted: false as const,
      message:
        data.outcome === "buyer"
          ? "La disputa quedó a favor del comprador, pero el reembolso no se ejecutó: Mercado Pago no está conectado."
          : "La disputa se cerró a favor del proveedor. La liquidación sigue pendiente del procesador.",
    };
  });
