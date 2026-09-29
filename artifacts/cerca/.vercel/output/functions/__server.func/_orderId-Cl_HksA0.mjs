import { o as __toESM } from "./_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as Route$8 } from "./_ssr/router-CvWFEIdL.mjs";
import { a as RedirectToSignIn, n as PaymentMethodInline, o as Shell, y as useCurrentUserState } from "./_ssr/shell-CbJDficC.mjs";
import { t as formatArs } from "./_ssr/money-DSc2EJ_o.mjs";
import { i as orderStatusLabel } from "./_ssr/labels-BJ2JP56X.mjs";
import { t as ConexSelect } from "./_ssr/controls-DMCQZUQt.mjs";
import { l as getOrder, m as startCheckout, n as addDisputeMessage, o as confirmDeliveryCode, p as openDispute, r as advanceOrder } from "./_ssr/trade-DBj1viCc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_orderId-Cl_HksA0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var REASONS = [
	["producto_faltante", "Producto faltante"],
	["producto_incorrecto", "Producto incorrecto"],
	["producto_danado", "Producto dañado"],
	["pedido_incompleto", "Pedido incompleto"],
	["pedido_no_recibido", "Pedido no recibido"],
	["problema_entrega", "Problema con la entrega"]
];
function OrderPage() {
	const { orderId } = Route$8.useParams();
	const { user, isPending } = useCurrentUserState();
	const [order, setOrder] = (0, import_react.useState)(null);
	const [code, setCode] = (0, import_react.useState)("");
	const [reason, setReason] = (0, import_react.useState)(REASONS[0][0]);
	const [description, setDescription] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [revealed, setRevealed] = (0, import_react.useState)(null);
	function reload() {
		getOrder({ data: orderId }).then(setOrder).catch((error) => {
			toast.error(error instanceof Error ? error.message : "No se pudo abrir el pedido.");
		});
	}
	(0, import_react.useEffect)(() => {
		if (user) reload();
	}, [user, orderId]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!order) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Cargando pedido…"
	}) });
	async function act(action) {
		try {
			const result = await advanceOrder({ data: {
				orderId,
				action
			} });
			if (result.deliveryCode) {
				setRevealed(result.deliveryCode);
				toast.success("Código generado. Anotalo: no se vuelve a mostrar.");
			}
			if (result.message) toast.message(result.message);
			reload();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo actualizar.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: [
				order.tradeName,
				" · ",
				order.viewer === "buyer" ? "Compra" : "Venta"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-4xl",
			children: orderStatusLabel(order.status)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted",
			children: [
				"Liquidación: ",
				order.settlementStatus,
				". CONEX no libera el dinero al validar el código de entrega.",
				order.status === "PAID" ? " Mercado Pago aprobó el cobro. Split 1:1 no documenta una liberación: el pedido queda en awaiting_provider. Eso no significa que el dinero ya esté en la cuenta del proveedor." : " Completar el pedido no transfiere dinero."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 grid gap-1",
			children: order.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					item.title,
					" × ",
					item.quantity,
					item.unit ? ` ${item.unit}` : "",
					item.sku ? ` · código ${item.sku}` : "",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block text-xs text-muted",
						children: ["Precio unitario al momento de la compra: ", formatArs(item.unitPriceCents)]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: formatArs(item.lineCents)
				})]
			}, item.title))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-right font-display text-3xl tabular-nums",
			children: formatArs(order.totalCents)
		}),
		order.economics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted",
			children: [
				"Comisión de CONEX congelada en este pedido: ",
				(order.economics.feeBps / 100).toFixed(2),
				"% (",
				formatArs(order.economics.marketplaceFeeCents),
				").",
				order.economics.processorFeeCents == null || order.economics.supplierNetCents == null ? " Mercado Pago no informó la comisión del procesador. No se muestra un neto." : ` Comisión de Mercado Pago informada: ${formatArs(order.economics.processorFeeCents)}. Neto del proveedor: ${formatArs(order.economics.supplierNetCents)}.`
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 rounded-2xl border border-line bg-card p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Medio de pago"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Medio de pago elegido:" }), order.paymentMethod ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodInline, { code: order.paymentMethod }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: order.payment.methodName })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm",
					children: ["Estado del pago: ", order.payment.stateLabel]
				}),
				order.paymentMethod === "mercadopago" && order.payment.stateLabel === "Pendiente" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Elegir Mercado Pago no aprueba el pago. Solo cuenta la confirmación de Mercado Pago."
				}) : null,
				order.paymentMethod === "mercadopago" && order.payment.stateLabel === "Rechazado" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Mercado Pago no aprobó el cobro. El pedido no quedó pagado."
				}) : null,
				order.paymentMethod === "mercadopago" && order.payment.confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Pago aprobado por Mercado Pago."
				}) : null,
				order.paymentMethod !== "mercadopago" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "CONEX registra la elección. No confirma el pago salvo una respuesta real de Mercado Pago."
				}) : null
			]
		}),
		order.paymentWarning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: order.paymentWarning
		}) : null,
		order.refundStatus !== "not_requested" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted",
			children: [
				"Reembolso: ",
				order.refundStatus,
				". Sin confirmación de Mercado Pago la compra no queda reembolsada."
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [
				order.viewer === "buyer" && order.status === "PENDING_PAYMENT" && order.mercadoPagoCheckout && order.sellerLinked && order.paymentMissing.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full bg-copper px-4 text-ink",
					onClick: () => {
						startCheckout({ data: orderId }).then((result) => {
							if (result.ok && result.redirectUrl) {
								window.location.href = result.redirectUrl;
								return;
							}
							const missing = result.missing.length > 0 ? ` Falta: ${result.missing.join(", ")}.` : "";
							toast.message(`${result.message}${missing}`);
						});
					},
					children: "Pagar con Mercado Pago"
				}) : null,
				order.viewer === "buyer" && order.status === "PENDING_PAYMENT" && order.mercadoPagoCheckout && order.paymentMissing.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Mercado Pago no está configurado. No se inició un cobro. Falta: ",
						order.paymentMissing.join(", "),
						"."
					]
				}) : null,
				order.viewer === "buyer" && order.status === "PENDING_PAYMENT" && order.mercadoPagoCheckout && order.paymentMissing.length === 0 && !order.sellerLinked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Mercado Pago requiere que el proveedor lo conecte. No se generó un pago."
				}) : null,
				order.viewer !== "buyer" && order.status === "PAID" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full bg-ink px-4 text-paper",
					onClick: () => void act("supplier_confirm"),
					children: "Confirmar"
				}) : null,
				order.viewer !== "buyer" && order.status === "CONFIRMED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full bg-ink px-4 text-paper",
					onClick: () => void act("start_preparing"),
					children: "Preparar"
				}) : null,
				order.viewer !== "buyer" && order.status === "PREPARING" && order.fulfillment === "delivery" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full bg-olive px-4 text-ink",
					onClick: () => void act("mark_out_for_delivery"),
					children: "Sale a entrega"
				}) : null,
				order.viewer !== "buyer" && order.status === "PREPARING" && order.fulfillment === "pickup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full bg-olive px-4 text-ink",
					onClick: () => void act("mark_ready_for_pickup"),
					children: "Listo para retirar"
				}) : null,
				order.viewer === "buyer" && order.status === "DELIVERED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full bg-ink px-4 text-paper",
					onClick: () => void act("buyer_close"),
					children: "Cerrar recepción"
				}) : null,
				order.status === "PENDING_PAYMENT" || order.status === "PAID" || order.status === "CONFIRMED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "cx-danger min-h-11 rounded-full border border-line px-4",
					onClick: () => void act("cancel"),
					children: "Cancelar"
				}) : null
			]
		}),
		revealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 rounded-card border border-copper bg-foam p-4",
			children: [
				"Código de entrega, visible una sola vez: ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
					className: "tabular-nums",
					children: revealed
				}),
				". Se lo das al comprador en la entrega. Él lo carga. El servidor guarda solo el hash."
			]
		}) : null,
		order.viewer === "buyer" && (order.status === "OUT_FOR_DELIVERY" || order.status === "READY_FOR_PICKUP") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3",
			onSubmit: (event) => {
				event.preventDefault();
				confirmDeliveryCode({ data: {
					orderId,
					code
				} }).then(() => {
					toast.success("Entrega confirmada. No se liberó dinero.");
					reload();
				}).catch((error) => toast.error(error instanceof Error ? error.message : "Código rechazado."));
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl bg-sun/40 px-4 py-3 text-sm text-ink",
				children: "Antes de confirmar, conviene grabar la apertura desde el paquete cerrado: etiqueta, embalaje, contenido y número de serie si tiene. No es obligatorio. El código confirma que recibiste el pedido; no cierra un reclamo posterior."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: code,
					onChange: (event) => setCode(event.target.value),
					inputMode: "numeric",
					placeholder: "Código de 8 dígitos",
					className: "min-h-12 flex-1 rounded-full border border-line px-4"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "min-h-12 rounded-full bg-ink px-4 text-paper",
					children: "Validar"
				})]
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl",
				children: "Historial"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-2 grid gap-1 text-sm",
				children: order.events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					event.created_at,
					" · ",
					orderStatusLabel(event.to_status),
					" · ",
					event.actor_kind === "buyer" ? "comprador" : event.actor_kind === "supplier" ? "proveedor" : event.actor_kind,
					" ",
					event.note ? `· ${event.note}` : ""
				] }, event.created_at + event.to_status))
			})]
		}),
		order.viewer === "buyer" && order.disputes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-6 grid gap-2",
			onSubmit: (event) => {
				event.preventDefault();
				openDispute({ data: {
					orderId,
					reason,
					description
				} }).then(() => {
					toast.success("Disputa abierta.");
					reload();
				}).catch((error) => toast.error(error instanceof Error ? error.message : "No se abrió."));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Disputa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Las fotos no se pueden adjuntar: falta el almacenamiento de objetos. El motivo y el texto sí quedan guardados."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
					value: reason,
					onChange: setReason,
					ariaLabel: "Motivo de la disputa",
					options: REASONS.map(([value, label]) => ({
						value,
						label
					}))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					required: true,
					value: description,
					onChange: (event) => setDescription(event.target.value),
					className: "min-h-24 rounded-2xl border border-line px-3 py-2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "min-h-11 rounded-full border border-ink",
					children: "Abrir disputa"
				})
			]
		}) : null,
		order.disputes.map((dispute) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 rounded-card border border-line p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-2xl",
					children: ["Disputa ", dispute.status]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						dispute.reason,
						". Reembolso: ",
						dispute.refund_status,
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2",
					children: dispute.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 flex gap-2",
					onSubmit: (event) => {
						event.preventDefault();
						addDisputeMessage({ data: {
							disputeId: dispute.id,
							body: message
						} }).then(() => {
							setMessage("");
							toast.success("Mensaje guardado.");
						}).catch((error) => toast.error(error instanceof Error ? error.message : "No se envió."));
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: message,
						onChange: (event) => setMessage(event.target.value),
						className: "min-h-11 flex-1 rounded-full border border-line px-3"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 rounded-full bg-ink px-4 text-paper",
						children: "Enviar"
					})]
				})
			]
		}, dispute.id))
	] });
}
//#endregion
export { OrderPage as component };
