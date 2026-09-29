import { o as __toESM } from "../_runtime.mjs";
import { l as paymentMethodByCode } from "./payment-methods-BtOKvucv.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as RedirectToSignIn, o as Shell, r as PaymentMethodRadios, y as useCurrentUserState } from "./shell-CbJDficC.mjs";
import { t as formatArs } from "./money-DSc2EJ_o.mjs";
import { a as quoteStatusLabel, n as formatWhen, o as requestStatusLabel } from "./labels-BJ2JP56X.mjs";
import { a as cancelBuyerNeed, t as acceptQuote, u as listMyQuoteRequests } from "./trade-DBj1viCc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cotizaciones-BbDw_zKe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function QuotesPage() {
	const { user, isPending } = useCurrentUserState();
	const [data, setData] = (0, import_react.useState)(null);
	function reload() {
		listMyQuoteRequests().then(setData).catch((error) => toast.error(error instanceof Error ? error.message : "No se pudieron leer."));
	}
	(0, import_react.useEffect)(() => {
		if (user) reload();
	}, [user]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-2 text-4xl",
			children: "Mis consultas"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 max-w-2xl text-sm text-muted",
			children: "Acá están las consultas de productos y lo que publicaste porque no lo encontraste. Aceptar una respuesta arma una compra solo cuando está ligada a un producto publicado."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4",
			children: [data?.requests.map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-2xl border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: request.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: requestStatusLabel(request.status)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Cantidad: ",
							request.quantity,
							" · ",
							request.delivery_required ? "Entrega" : "Retiro",
							request.listing_id ? "" : " · pedido abierto",
							formatWhen(request.created_at) ? ` · ${formatWhen(request.created_at)}` : ""
						]
					}),
					!request.listing_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Los proveedores pueden responder, pero aceptar esta respuesta no genera una compra: no hay un producto publicado del cual reservar stock."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-2",
						children: data.quotes.filter((quote) => quote.request_id === request.id).map((quote) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid gap-2 border-t border-line pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: quote.trade_name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted",
									children: [
										formatArs(quote.unitPriceCents),
										" × ",
										quote.quantity,
										quote.shippingCents ? ` + envío ${formatArs(quote.shippingCents)}` : "",
										` · total ${formatArs(quote.totalCents)}`,
										quote.lead_time_hours !== null ? ` · ${quote.lead_time_hours} h` : "",
										" · ",
										quoteStatusLabel(quote.status)
									]
								}),
								quote.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm",
									children: quote.notes
								}) : null
							] }), quote.status === "submitted" && request.status !== "accepted" && request.listing_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AcceptQuote, {
								quoteId: quote.id,
								totalCents: quote.totalCents,
								methods: quote.paymentMethods
							}) : null]
						}, quote.id))
					}),
					data.quotes.every((quote) => quote.request_id !== request.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Todavía no hay respuestas."
					}) : null,
					!request.listing_id && (request.status === "open" || request.status === "answered") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "cx-danger mt-3 min-h-11 rounded-full border border-line px-4 text-sm font-semibold",
						onClick: () => {
							cancelBuyerNeed({ data: request.id }).then(() => {
								toast.success("Pedido cancelado.");
								reload();
							}).catch((error) => toast.error(error instanceof Error ? error.message : "No se canceló."));
						},
						children: "Cancelar pedido"
					}) : null
				]
			}, request.id)), data && data.requests.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "No tenés consultas todavía."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Acá vas a encontrar tus consultas y lo que publiques cuando no encuentres un producto."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							hash: "productos",
							className: "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
							children: "Buscar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/solicitudes",
							className: "inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold",
							children: "Publicar lo que necesito"
						})]
					})
				]
			}) : null]
		})
	] });
}
function AcceptQuote({ quoteId, totalCents, methods }) {
	const [method, setMethod] = (0, import_react.useState)("");
	const needsChoice = methods.length > 0;
	const chosen = paymentMethodByCode(method);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [needsChoice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
			className: "grid gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "text-sm font-semibold",
					children: "¿Cómo querés pagar?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Solo los medios que este proveedor declaró. CONEX no verifica que pueda cobrar con cada uno. Elegir no confirma el pago."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodRadios, {
					name: `pago-${quoteId}`,
					codes: methods,
					value: method,
					onChange: setMethod
				}),
				chosen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: ["Medio de pago: ", chosen.name]
				}) : null
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Medios de pago: consultar con el proveedor. Aceptar no elige un medio ni confirma un pago."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			disabled: needsChoice && !method,
			className: "min-h-11 w-fit rounded-full bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-40",
			onClick: () => {
				if (needsChoice && !method) {
					toast.error("Elegí un medio de pago antes de aceptar.");
					return;
				}
				acceptQuote({ data: {
					quoteId,
					idempotencyKey: crypto.randomUUID(),
					paymentMethod: needsChoice ? method : null
				} }).then((order) => {
					toast.success("Respuesta aceptada. La compra quedó pendiente de pago: no se cobró nada.");
					window.location.href = `/pedidos/${order.orderId}`;
				}).catch((error) => toast.error(error instanceof Error ? error.message : "No se aceptó."));
			},
			children: ["Aceptar ", formatArs(totalCents)]
		})]
	});
}
//#endregion
export { QuotesPage as component };
