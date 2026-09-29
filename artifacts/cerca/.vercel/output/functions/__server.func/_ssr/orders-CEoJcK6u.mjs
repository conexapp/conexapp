//#region node_modules/.nitro/vite/services/ssr/assets/orders-CEoJcK6u.js
var ACTOR = {
	payment_approved: ["system"],
	supplier_confirm: ["supplier"],
	start_preparing: ["supplier"],
	mark_ready_for_pickup: ["supplier"],
	mark_out_for_delivery: ["supplier"],
	delivery_code_accepted: ["system"],
	buyer_close: ["buyer"],
	cancel: [
		"buyer",
		"supplier",
		"admin"
	],
	open_dispute: ["buyer"],
	admin_refund: ["admin"],
	admin_complete: ["admin"],
	provider_refund_confirmed: ["system"]
};
function transitionOrder(input) {
	const { from, action, actor, fulfillment } = input;
	if (!ACTOR[action].includes(actor)) throw new Error("Este rol no puede hacer esa transición.");
	const next = (() => {
		switch (action) {
			case "payment_approved": return from === "PENDING_PAYMENT" ? "PAID" : null;
			case "supplier_confirm": return from === "PAID" ? "CONFIRMED" : null;
			case "start_preparing": return from === "CONFIRMED" ? "PREPARING" : null;
			case "mark_ready_for_pickup": return from === "PREPARING" && fulfillment === "pickup" ? "READY_FOR_PICKUP" : null;
			case "mark_out_for_delivery": return from === "PREPARING" && fulfillment === "delivery" ? "OUT_FOR_DELIVERY" : null;
			case "delivery_code_accepted": return from === "READY_FOR_PICKUP" || from === "OUT_FOR_DELIVERY" ? "DELIVERED" : null;
			case "buyer_close": return from === "DELIVERED" ? "COMPLETED" : null;
			case "cancel":
				if (actor === "buyer" && (from === "PENDING_PAYMENT" || from === "PAID")) return "CANCELLED";
				if (actor === "supplier" && (from === "PAID" || from === "CONFIRMED")) return "CANCELLED";
				if (actor === "admin" && from !== "COMPLETED" && from !== "REFUNDED" && from !== "CANCELLED") return "CANCELLED";
				return null;
			case "open_dispute":
				if (from === "CONFIRMED" || from === "PREPARING" || from === "READY_FOR_PICKUP" || from === "OUT_FOR_DELIVERY" || from === "DELIVERED" || from === "COMPLETED") return "DISPUTED";
				return null;
			case "admin_refund": return from === "DISPUTED" || from === "PAID" || from === "CANCELLED" ? "REFUNDED" : null;
			case "admin_complete": return from === "DISPUTED" ? "COMPLETED" : null;
			case "provider_refund_confirmed": return from === "PAID" || from === "CANCELLED" ? "REFUNDED" : null;
			default: return null;
		}
	})();
	if (!next) throw new Error(`No se puede ${action} cuando el pedido está en ${from}.`);
	return next;
}
//#endregion
export { transitionOrder as t };
