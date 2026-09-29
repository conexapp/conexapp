//#region node_modules/.nitro/vite/services/ssr/assets/payment-methods-BtOKvucv.js
var RETIRED_PAYMENT_LABEL = "Medio anterior fuera del catálogo";
var PAYMENT_CATALOG_DISCLAIMERS = ["Los medios de pago disponibles dependen de cada proveedor. Seleccionar un medio no significa que CONEX haya confirmado el pago.", "Mercado Pago es el único medio de esta lista que puede tener confirmación automática dentro de CONEX mediante su integración. Los demás medios son acuerdos entre comprador y proveedor."];
var PAYMENT_METHODS = [
	{
		code: "mercadopago",
		name: "Mercado Pago",
		group: "plataforma",
		confirmsPayment: true,
		notice: "Disponible cuando el proveedor tiene su cuenta de Mercado Pago conectada. El pago se confirma únicamente cuando Mercado Pago informa la operación."
	},
	{
		code: "visa_debito",
		name: "Visa Débito",
		group: "tarjeta",
		confirmsPayment: false,
		notice: "El proveedor puede indicar que acepta pagos con tarjeta Visa Débito. CONEX no procesa los datos de la tarjeta."
	},
	{
		code: "visa_credito",
		name: "Visa Crédito",
		group: "tarjeta",
		confirmsPayment: false,
		notice: "El proveedor puede indicar que acepta pagos con tarjeta Visa Crédito. CONEX no procesa los datos de la tarjeta."
	},
	{
		code: "mastercard_debito",
		name: "Mastercard Débito",
		group: "tarjeta",
		confirmsPayment: false,
		notice: "El proveedor puede indicar que acepta pagos con tarjeta Mastercard Débito. CONEX no procesa los datos de la tarjeta."
	},
	{
		code: "mastercard_credito",
		name: "Mastercard Crédito",
		group: "tarjeta",
		confirmsPayment: false,
		notice: "El proveedor puede indicar que acepta pagos con tarjeta Mastercard Crédito. CONEX no procesa los datos de la tarjeta."
	},
	{
		code: "amex",
		name: "American Express",
		group: "tarjeta",
		confirmsPayment: false,
		notice: "El proveedor puede indicar que acepta pagos con American Express. CONEX no procesa los datos de la tarjeta."
	},
	{
		code: "cabal",
		name: "Cabal",
		group: "tarjeta",
		confirmsPayment: false,
		notice: "El proveedor puede indicar que acepta pagos con Cabal. CONEX no procesa los datos de la tarjeta."
	},
	{
		code: "naranja",
		name: "Naranja X",
		group: "tarjeta",
		confirmsPayment: false,
		notice: "El proveedor puede indicar que acepta pagos con Naranja X. CONEX no procesa los datos de la tarjeta."
	},
	{
		code: "transferencia",
		name: "Transferencia bancaria",
		group: "transferencia",
		confirmsPayment: false,
		notice: "El proveedor puede indicar que acepta transferencia bancaria. La transferencia se acuerda directamente con el proveedor y CONEX no la confirma automáticamente."
	}
];
var BY_CODE = new Map(PAYMENT_METHODS.map((method) => [method.code, method]));
var BANNED = /* @__PURE__ */ new Set([
	"qr",
	"pago_qr",
	"qr_mp",
	"qr_modo",
	"codigo_qr",
	"modo",
	"pago_modo",
	"efectivo",
	"cash"
]);
function paymentMethodByCode(code) {
	return BY_CODE.get(code);
}
function assertNoQr(code) {
	const folded = code.trim().toLowerCase();
	if (folded.includes("qr") || BANNED.has(folded)) throw new Error("Ese medio de pago no está disponible.");
}
/** Guarda solo códigos del catálogo, en el orden del catálogo, sin repetir. Rechaza lo desconocido. */
function normalizePaymentMethods(input) {
	if (!Array.isArray(input)) throw new Error("Los medios de pago tienen que ser una lista.");
	const wanted = /* @__PURE__ */ new Set();
	for (const item of input) {
		if (typeof item !== "string") throw new Error("Medio de pago inválido.");
		const code = item.trim().toLowerCase();
		if (!code) continue;
		assertNoQr(code);
		if (!BY_CODE.has(code)) throw new Error("Ese medio de pago no existe.");
		wanted.add(code);
	}
	return PAYMENT_METHODS.filter((method) => wanted.has(method.code)).map((method) => method.code);
}
function readStoredMethods(value) {
	if (value == null) return [];
	let raw = value;
	if (typeof value === "string") try {
		raw = JSON.parse(value);
	} catch {
		return [];
	}
	if (!Array.isArray(raw)) return [];
	return PAYMENT_METHODS.filter((method) => raw.includes(method.code)).map((method) => method.code);
}
/** NULL en la publicación = hereda el negocio. Un array, aunque esté vacío, es propio del producto. */
function acceptedMethods(businessValue, listingValue) {
	if (listingValue != null) return readStoredMethods(listingValue);
	return readStoredMethods(businessValue);
}
function decidePaymentChoice(input) {
	const allowed = readStoredMethods(input.allowed);
	const raw = input.chosen?.trim().toLowerCase() ?? "";
	if (!raw) {
		if (allowed.length === 0) return {
			ok: true,
			method: null
		};
		return {
			ok: false,
			reason: "Elegí un medio de pago antes de aceptar."
		};
	}
	try {
		assertNoQr(raw);
	} catch (error) {
		return {
			ok: false,
			reason: error instanceof Error ? error.message : "Ese medio de pago no está disponible."
		};
	}
	if (!BY_CODE.has(raw)) return {
		ok: false,
		reason: "Ese medio de pago no existe."
	};
	if (!allowed.includes(raw)) return {
		ok: false,
		reason: "Ese proveedor no acepta ese medio de pago."
	};
	return {
		ok: true,
		method: raw
	};
}
function allowsMercadoPagoCheckout(input) {
	if (input.method === "mercadopago") return true;
	return !input.declared && !input.method;
}
function describePayment(input) {
	const stored = input.method?.trim() ?? "";
	const method = stored ? paymentMethodByCode(stored) : void 0;
	if (!input.declared && !stored) return {
		methodName: "Sin medio registrado",
		stateLabel: "Este pedido es anterior a la elección de medio, o no tenía medios declarados.",
		confirmed: false
	};
	if (!method) {
		if (stored) return {
			methodName: RETIRED_PAYMENT_LABEL,
			stateLabel: "Pago no verificado por CONEX.",
			confirmed: false
		};
		return {
			methodName: "Sin medio elegido",
			stateLabel: "El proveedor no declaró medios. CONEX no inventó uno ni confirmó un pago.",
			confirmed: false
		};
	}
	if (method.code === "mercadopago") {
		if (input.orderStatus === "REFUNDED") return {
			methodName: method.name,
			stateLabel: "Mercado Pago confirmó el reembolso.",
			confirmed: false
		};
		if (input.orderStatus === "PAID" || input.orderStatus === "CONFIRMED" || input.orderStatus === "PREPARING" || input.orderStatus === "READY_FOR_PICKUP" || input.orderStatus === "OUT_FOR_DELIVERY" || input.orderStatus === "DELIVERED" || input.orderStatus === "COMPLETED") return {
			methodName: method.name,
			stateLabel: "Aprobado",
			confirmed: true
		};
		const mp = (input.mpStatus ?? "").toLowerCase();
		if (mp === "rejected" || mp === "cancelled") return {
			methodName: method.name,
			stateLabel: "Rechazado",
			confirmed: false
		};
		return {
			methodName: method.name,
			stateLabel: "Pendiente",
			confirmed: false
		};
	}
	return {
		methodName: method.name,
		stateLabel: "Pago no verificado por CONEX.",
		confirmed: false
	};
}
//#endregion
export { allowsMercadoPagoCheckout as a, normalizePaymentMethods as c, acceptedMethods as i, paymentMethodByCode as l, PAYMENT_METHODS as n, decidePaymentChoice as o, RETIRED_PAYMENT_LABEL as r, describePayment as s, PAYMENT_CATALOG_DISCLAIMERS as t, readStoredMethods as u };
