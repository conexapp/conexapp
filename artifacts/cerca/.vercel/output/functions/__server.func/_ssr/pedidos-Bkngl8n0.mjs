import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as RedirectToSignIn, o as Shell, y as useCurrentUserState } from "./shell-CbJDficC.mjs";
import { t as formatArs } from "./money-DSc2EJ_o.mjs";
import { i as orderStatusLabel } from "./labels-BJ2JP56X.mjs";
import { d as listOrders } from "./trade-DBj1viCc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pedidos-Bkngl8n0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrdersPage() {
	const { user, isPending } = useCurrentUserState();
	const [orders, setOrders] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		listOrders().then(setOrders).catch((error) => toast.error(error instanceof Error ? error.message : "No se pudieron leer los pedidos."));
	}, [user]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-4xl",
			children: "Mis compras"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-2",
			children: orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/pedidos/$orderId",
				params: { orderId: order.id },
				className: "flex items-center justify-between rounded-card border border-line bg-foam px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-medium",
					children: order.trade_name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm text-muted",
					children: [
						order.role === "buyer" ? "Compra" : "Venta",
						" · ",
						orderStatusLabel(order.status)
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: formatArs(Number(order.total_cents))
				})]
			}) }, order.id))
		}),
		orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Todavía no tenés compras. Cuando aceptes una respuesta de un proveedor, la compra aparece acá."
		}) : null
	] });
}
//#endregion
export { OrdersPage as component };
