import { f as sql, l as id, r as audit, u as loadAccess } from "./helpers-AwcxVs0A.mjs";
import { t as transitionOrder } from "./orders-CEoJcK6u.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as enforceRateLimit } from "./rate-limit-BoqWzxCk.mjs";
import { t as can } from "./permissions-BdbdDlQV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BlFG026X.js
async function requireAdmin(userId) {
	const db = await sql();
	const access = await loadAccess(db, userId);
	if (!can(access, "admin")) throw new Error("Hace falta un administrador.");
	return {
		db,
		access
	};
}
var adminOverview_createServerFn_handler = createServerRpc({
	id: "104d891b307ee121ee6bccd44cc1d85b8e39be92d0d577a9f0d71ba19ad9be4f",
	name: "adminOverview",
	filename: "src/lib/cerca/server/admin.ts"
}, (opts) => adminOverview.__executeServer(opts));
var adminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminOverview_createServerFn_handler, async ({ context }) => {
	const { db } = await requireAdmin(context.userId);
	const [metrics] = await db`
      select
        (select count(*)::int from profiles) as users,
        (select count(*)::int from businesses where status = 'active' and is_demo = false) as businesses,
        (select count(*)::int from businesses where status = 'pending_review') as pending,
        (select count(*)::int from listings l join businesses b on b.id = l.business_id where l.status = 'published' and b.is_demo = false and l.is_demo = false) as live_offers,
        (select count(*)::int from orders) as orders,
        (select count(*)::int from disputes where status in ('open', 'under_review', 'awaiting_supplier')) as disputes,
        (select count(*)::int from businesses where is_demo = true) as demo_businesses
    `;
	const businesses = await db`
      select b.id, b.trade_name, b.status, b.city, b.is_demo, u.email as owner_email
      from businesses b
      join "user" u on u.id = b.owner_user_id
      order by b.created_at desc
      limit 40
    `;
	const rules = await db`
      select id, scope, fee_bps, valid_from::text from commission_rules
      where active = true order by valid_from desc limit 12
    `;
	const [setting] = await db`
      select value::text as value from platform_settings where key = 'commission_default_bps'
    `;
	return {
		metrics,
		businesses,
		rules,
		defaultFeeBps: Number(setting?.value ?? 300)
	};
});
var setDefaultCommission_createServerFn_handler = createServerRpc({
	id: "43af0442dd74b6ee305d50c4164b3bd385ce3c73ed3178cee79855de92537a31",
	name: "setDefaultCommission",
	filename: "src/lib/cerca/server/admin.ts"
}, (opts) => setDefaultCommission.__executeServer(opts));
var setDefaultCommission = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((feeBps) => {
	if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 3e3) throw new Error("La comisión tiene que estar entre 0 y 30,00%.");
	return feeBps;
}).handler(setDefaultCommission_createServerFn_handler, async ({ context, data }) => {
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
	return { ok: true };
});
var reviewBusiness_createServerFn_handler = createServerRpc({
	id: "3485a09735191139808ab58c37f9c05cbfcb00518a2935db449e276d77421d18",
	name: "reviewBusiness",
	filename: "src/lib/cerca/server/admin.ts"
}, (opts) => reviewBusiness.__executeServer(opts));
var reviewBusiness = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId || input.decision !== "active" && input.decision !== "suspended") throw new Error("Decisión inválida.");
	return input;
}).handler(reviewBusiness_createServerFn_handler, async ({ context, data }) => {
	const { db } = await requireAdmin(context.userId);
	await enforceRateLimit(db, "sensitive", context.userId);
	if (!(await db`
      update businesses set status = ${data.decision}, updated_at = now(),
        verified_at = case when ${data.decision} = 'active' then coalesce(verified_at, now()) else verified_at end
      where id = ${data.businessId} and is_demo = false
      returning id, owner_user_id
    `)[0]) throw new Error("No se pudo actualizar ese negocio. Los ejemplos de desarrollo no se aprueban como reales.");
	await audit(db, context.userId, "review_business", "business", data.businessId, { decision: data.decision });
	return { ok: true };
});
var resolveDispute_createServerFn_handler = createServerRpc({
	id: "f54fad8aea6fd50b0df372575b6454823cac6d9834caba37e95f91e35febe077",
	name: "resolveDispute",
	filename: "src/lib/cerca/server/admin.ts"
}, (opts) => resolveDispute.__executeServer(opts));
var resolveDispute = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.disputeId || input.outcome !== "buyer" && input.outcome !== "supplier") throw new Error("Resolución inválida.");
	const note = typeof input.note === "string" ? input.note.trim() : "";
	if (note.length < 8) throw new Error("La resolución necesita un fundamento.");
	return {
		disputeId: input.disputeId,
		outcome: input.outcome,
		note: note.slice(0, 2e3)
	};
}).handler(resolveDispute_createServerFn_handler, async ({ context, data }) => {
	const { db } = await requireAdmin(context.userId);
	await enforceRateLimit(db, "sensitive", context.userId);
	const dispute = (await db`
      select d.id, d.order_id, o.status, o.fulfillment
      from disputes d join orders o on o.id = d.order_id
      where d.id = ${data.disputeId}
    `)[0];
	if (!dispute) throw new Error("Disputa inexistente.");
	if (data.outcome === "supplier") {
		await db`
        update orders set status = ${transitionOrder({
			from: dispute.status,
			action: "admin_complete",
			actor: "admin",
			fulfillment: dispute.fulfillment
		})}, settlement_status = 'awaiting_provider', updated_at = now()
        where id = ${dispute.order_id} and status = 'DISPUTED'
      `;
		await db`
        update disputes set status = 'resolved_supplier', resolution = ${data.note}, updated_at = now()
        where id = ${dispute.id}
      `;
	} else await db`
        update disputes
        set status = 'resolved_buyer', resolution = ${data.note}, refund_status = 'blocked_unconfigured', updated_at = now()
        where id = ${dispute.id}
      `;
	await db`
      insert into dispute_messages (id, dispute_id, author_user_id, body)
      values (${id()}, ${dispute.id}, ${context.userId}, ${data.note})
    `;
	await audit(db, context.userId, "resolve_dispute", "dispute", dispute.id, {
		outcome: data.outcome,
		refundExecuted: false
	});
	return {
		ok: true,
		refundExecuted: false,
		message: data.outcome === "buyer" ? "La disputa quedó a favor del comprador, pero el reembolso no se ejecutó: Mercado Pago no está conectado." : "La disputa se cerró a favor del proveedor. La liquidación sigue pendiente del procesador."
	};
});
//#endregion
export { adminOverview_createServerFn_handler, resolveDispute_createServerFn_handler, reviewBusiness_createServerFn_handler, setDefaultCommission_createServerFn_handler };
