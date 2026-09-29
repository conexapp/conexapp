//#region node_modules/.nitro/vite/services/ssr/assets/seller-profile-B9jvPmNx.js
var SELLER_GOALS = [
	"vender",
	"comprar",
	"ambos"
];
var SELLER_ACTIVITIES = [
	"fabrico",
	"importo",
	"distribuyo",
	"revendo"
];
var SELLER_CHANNELS = [
	"mayorista",
	"minorista",
	"empresas",
	"consumidor"
];
var SELLER_SIZES = [
	"empezando",
	"local",
	"deposito",
	"sin_local"
];
var MINOR_SELL_BLOCK = "Declaraste ser menor de edad. Vender, publicar y cobrar quedan bloqueados hasta que exista un flujo de representante legal. No uses el documento de otra persona.";
var GOAL_LABEL = {
	vender: "Vender",
	comprar: "Comprar",
	ambos: "Vender y comprar"
};
var ACTIVITY_LABEL = {
	fabrico: "Fabrico",
	importo: "Importo",
	distribuyo: "Distribuyo",
	revendo: "Revendo"
};
var CHANNEL_LABEL = {
	mayorista: "Mayorista",
	minorista: "Minorista",
	empresas: "A empresas",
	consumidor: "Al consumidor final"
};
var SIZE_LABEL = {
	empezando: "Estoy comenzando",
	local: "Tengo local",
	deposito: "Tengo depósito",
	sin_local: "Opero sin local"
};
function goalLabel(goal) {
	return GOAL_LABEL[goal];
}
function activityLabel(id) {
	return ACTIVITY_LABEL[id] ?? id;
}
function channelLabel(id) {
	return CHANNEL_LABEL[id] ?? id;
}
function sizeLabel(size) {
	return SIZE_LABEL[size];
}
function asText(value, max) {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, max);
}
function picked(value, allowed) {
	if (!Array.isArray(value)) return [];
	const set = /* @__PURE__ */ new Set();
	for (const item of value) if (typeof item === "string" && allowed.includes(item)) set.add(item);
	return [...set];
}
function parseSellerIntent(input) {
	const raw = typeof input === "string" ? safeJson(input) : input;
	if (!raw || typeof raw !== "object") throw new Error("Falta la declaración.");
	const record = raw;
	const goal = record.goal;
	if (goal !== "vender" && goal !== "comprar" && goal !== "ambos") throw new Error("Elegí si querés vender, comprar o las dos cosas.");
	const size = record.size;
	if (size !== "empezando" && size !== "local" && size !== "deposito" && size !== "sin_local") throw new Error("Elegí cómo operás hoy.");
	return {
		goal,
		productKinds: asText(record.productKinds, 120),
		activities: picked(record.activities, SELLER_ACTIVITIES),
		channels: picked(record.channels, SELLER_CHANNELS),
		size,
		ships: record.ships === true,
		seeking: asText(record.seeking, 200),
		declaresMinor: record.declaresMinor === true
	};
}
function readSellerIntent(value) {
	if (value == null || value === "") return null;
	try {
		return parseSellerIntent(value);
	} catch {
		return null;
	}
}
function safeJson(value) {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}
function sellerStanding(input) {
	if (input.intent?.declaresMinor) return {
		code: "menor_bloqueado",
		label: "Venta no habilitada",
		detail: "Declaraste ser menor de edad. No hay flujo de representante legal, así que vender y cobrar siguen bloqueados."
	};
	if (input.businessStatus === "active" && input.completedOrders > 0) return {
		code: "con_historial",
		label: "Proveedor con historial",
		detail: "Hay operaciones completadas en CONEX. No es una afirmación de confianza."
	};
	if (input.businessStatus === "active") return {
		code: "negocio_aprobado",
		label: "Negocio aprobado para publicar",
		detail: "CONEX revisó el alta del negocio. Eso no verifica identidad ni situación fiscal."
	};
	if (input.businessStatus === "pending_review") return {
		code: "en_revision",
		label: "Alta en revisión",
		detail: "El negocio todavía no aparece en la búsqueda."
	};
	if (input.businessStatus === "suspended") return {
		code: "sin_verificar",
		label: "Negocio suspendido",
		detail: "No se publica ni se opera hasta una revisión."
	};
	if (input.intent) return {
		code: "actividad_declarada",
		label: "Actividad comercial declarada",
		detail: "Contaste qué hacés. Todavía no enviaste un negocio a revisión."
	};
	return {
		code: "sin_verificar",
		label: "Sin verificar",
		detail: "Todavía no declaraste una actividad ni hay un negocio aprobado."
	};
}
function publicStandingLabel(completedOrders) {
	if (completedOrders > 0) return {
		label: "Proveedor con historial",
		detail: "Hay operaciones completadas registradas. No es una nota de confianza."
	};
	return {
		label: "Negocio aprobado para publicar",
		detail: "CONEX revisó el alta. No verifica identidad ni situación fiscal."
	};
}
/** Solo cuando hay cierres reales. No inventa un porcentaje sobre cero. */
function completionShare(completed, cancelled) {
	if (!Number.isInteger(completed) || !Number.isInteger(cancelled) || completed < 0 || cancelled < 0) return null;
	const total = completed + cancelled;
	if (total <= 0) return null;
	return `${Math.round(completed / total * 100)}% de ${total} ${total === 1 ? "operación cerrada" : "operaciones cerradas"} figura como completada`;
}
function panelLead(intent) {
	if (!intent) return "Contanos qué querés hacer. En este paso no pedimos DNI, CUIT ni documentos.";
	if (intent.declaresMinor) return MINOR_SELL_BLOCK;
	if (intent.goal === "comprar") return "Tu cuenta está para comprar. Si más adelante querés vender, se declara acá, sin crear otro usuario.";
	if (intent.size === "empezando") return "Estás comenzando: podés publicar de a un producto. La carga masiva no existe todavía.";
	if (intent.ships) return "Marcaste que hacés envíos. La entrega se define en cada producto y en el mapa, no con una zona inventada.";
	return `Declaraste que querés ${goalLabel(intent.goal).toLocaleLowerCase("es")}. El negocio se revisa antes de aparecer en la búsqueda.`;
}
var UNAVAILABLE_VERIFICATION = [
	"Identidad iniciada",
	"Identidad pendiente",
	"Identidad verificada",
	"Actividad comercial verificada",
	"Empresa verificada"
];
var LEGAL_REVIEW = [
	{
		topic: "Identidad",
		detail: "Nombre, apellido, DNI, fecha de nacimiento y un proveedor de verificación. No se piden ni se guardan en esta versión."
	},
	{
		topic: "Actividad fiscal y sociedades",
		detail: "CUIT, condición fiscal, razón social societaria, representante y documentos. Tiene que verlo un contador y un abogado antes de pedirlo."
	},
	{
		topic: "Menores",
		detail: "Hoy solo se puede declarar ser menor, y eso bloquea vender. Falta el circuito de representante, autorización, límites de pago y contratación. No se acepta el documento de un adulto como si fuera del menor."
	},
	{
		topic: "Pagos y consumidores",
		detail: "Mercado Pago sigue como está. No hay billetera, escrow ni cobro a nombre de un menor. Las promesas al consumidor tienen que coincidir con lo que el sistema hace."
	},
	{
		topic: "Sanciones y comisión",
		detail: "No hay detección automática ni castigos. Definir evasión, advertencia, apelación y suspensión requiere revisión legal. Una sospecha no alcanza para sancionar."
	},
	{
		topic: "Datos de las comunicaciones",
		detail: "Un chat con archivos y conservación de evidencia necesita una política de privacidad y plazos de guarda. Hoy el registro es la consulta y la respuesta."
	}
];
//#endregion
export { sizeLabel as _, SELLER_GOALS as a, activityLabel as c, goalLabel as d, panelLead as f, sellerStanding as g, readSellerIntent as h, SELLER_CHANNELS as i, channelLabel as l, publicStandingLabel as m, MINOR_SELL_BLOCK as n, SELLER_SIZES as o, parseSellerIntent as p, SELLER_ACTIVITIES as r, UNAVAILABLE_VERIFICATION as s, LEGAL_REVIEW as t, completionShare as u };
