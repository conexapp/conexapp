import { n as assertString } from "./helpers-AwcxVs0A.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { l as createSsrRpc } from "./shell-CbJDficC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trade-DBj1viCc.js
var DISPUTE_REASONS = [
	"producto_faltante",
	"producto_incorrecto",
	"producto_danado",
	"pedido_incompleto",
	"pedido_no_recibido",
	"problema_entrega"
];
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
}).handler(createSsrRpc("20034d46e9f878f320ecac2ccfe7ddebc5a859af546b1f00fe3b42e28f6993db"));
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
}).handler(createSsrRpc("01716deecf2fbdf560e037859feff41106b54d7afc40f278bf136380d2e903bd"));
var cancelBuyerNeed = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((requestId) => {
	if (typeof requestId !== "string" || requestId.length < 8) throw new Error("Solicitud inválida.");
	return requestId;
}).handler(createSsrRpc("4e3b072766af4fb04bc27dbc5266e4af4b395420d2e66a46bb3e9ced6e73ceb6"));
var listMyQuoteRequests = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("aec1bd4711c6293b4c54af0cad5bbbf2929ad4bc6371f7ccc1c80f5adaa8404f"));
var listQuoteInbox = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e00e3c86dccdc6adc277dc4f58e43335481cf176df4d7d2c9f17bee90ac016dc"));
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
}).handler(createSsrRpc("3f3bd03426194117acd30f3da2e02d2945ab187a1df6c4dae5077e97c0861c38"));
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
}).handler(createSsrRpc("f47383ca4a89e22b22668181a5f68d3476c0df3f8d413df6e155d39ff2b42d32"));
/**
* Compra al precio ya publicado. No crea otro tipo de pedido:
* arma la cotización con el precio, el envío y el plazo de la publicación
* y la reserva con la misma función que aceptar una respuesta.
* No cobra ni marca el pedido como pagado.
*/
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
}).handler(createSsrRpc("2035a34f0c46523d3043e2b796af9963c2b8954550a0baf25bb53b2f0534eb5b"));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("df002c35d3d3997a5e88768901bb77dc25209d64cc8a6731a15c3885e637894f"));
var getOrder = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((orderId) => {
	if (typeof orderId !== "string" || orderId.length < 8) throw new Error("Pedido inválido.");
	return orderId;
}).handler(createSsrRpc("b7d725ffeda24f17014383cab3ea1e834c6eebf7427747f3d26ab0cbf3ed75bf"));
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((orderId) => {
	if (typeof orderId !== "string" || orderId.length < 8) throw new Error("Pedido inválido.");
	return orderId;
}).handler(createSsrRpc("53f00a2297d6fb19f2a9e84efc64562ff51920839953fbed7edaa40ca750e95e"));
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
}).handler(createSsrRpc("1855bd41be051d70c45a108cc7789b1b4c300837c6ea7a04051d3b88c9c164f5"));
var confirmDeliveryCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.orderId || !/^\d{8}$/.test(input.code ?? "")) throw new Error("El código tiene 8 dígitos.");
	return input;
}).handler(createSsrRpc("b36ed234cd7e01a9bd1bbc7f71c41d3fc2e2407d141516e5e79f7dbdd7d9f8b3"));
var openDispute = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.orderId) throw new Error("Falta el pedido.");
	if (!DISPUTE_REASONS.includes(input.reason)) throw new Error("Motivo inválido.");
	return {
		orderId: input.orderId,
		reason: input.reason,
		description: assertString(input.description, "Descripción", 2e3)
	};
}).handler(createSsrRpc("f9359a6f0e8eb7e57a91156f2e40f732bf82a43b1751ab7c981461b9e5bdf2c0"));
var addDisputeMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	disputeId: assertString(input?.disputeId, "Disputa", 80),
	body: assertString(input?.body, "Mensaje", 2e3)
})).handler(createSsrRpc("696dae5880ffc9f5f9938f5e2e41b7dabb74d67f219a460d9cef6f999323140a"));
//#endregion
export { cancelBuyerNeed as a, createQuoteRequest as c, listOrders as d, listQuoteInbox as f, submitQuote as h, buyPublishedListing as i, getOrder as l, startCheckout as m, addDisputeMessage as n, confirmDeliveryCode as o, openDispute as p, advanceOrder as r, createBuyerNeed as s, acceptQuote as t, listMyQuoteRequests as u };
