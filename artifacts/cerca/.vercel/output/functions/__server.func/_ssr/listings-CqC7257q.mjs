import { n as assertString } from "./helpers-AwcxVs0A.mjs";
import "./storage-BueJXjBC.mjs";
import { c as normalizePaymentMethods } from "./payment-methods-BtOKvucv.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { l as createSsrRpc } from "./shell-CbJDficC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listings-CqC7257q.js
var IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp"
];
var LIST_FILTERS = [
	"all",
	"published",
	"paused",
	"out_of_stock",
	"draft",
	"archived"
];
function optionalText(value, label, max) {
	if (value == null) return "";
	if (typeof value !== "string") throw new Error(`${label} es inválido.`);
	const trimmed = value.trim();
	if (trimmed.length > max) throw new Error(`${label} es demasiado largo.`);
	return trimmed;
}
function assertCount(value, label, min, max) {
	if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) throw new Error(`${label} inválido.`);
	return value;
}
function parseListingWrite(input) {
	if (!input) throw new Error("Faltan los datos del producto.");
	const standard = optionalText(input.standardProductId, "Ancla", 80);
	return {
		businessId: optionalText(input.businessId, "Negocio", 80),
		name: assertString(input.name, "Nombre", 140),
		description: optionalText(input.description, "Descripción", 4e3),
		brand: optionalText(input.brand, "Marca", 80),
		model: optionalText(input.model, "Modelo", 80),
		sku: optionalText(input.sku, "SKU", 64),
		categoryId: assertString(input.categoryId, "Categoría", 80),
		standardProductId: standard || null,
		priceCents: assertCount(input.priceCents, "Precio", 1, 5e10),
		unit: assertString(input.unit, "Unidad", 40),
		referenceUnit: optionalText(input.referenceUnit, "Unidad de referencia", 40),
		referencePriceCents: input.referencePriceCents == null ? null : assertCount(input.referencePriceCents, "Precio de referencia", 1, 5e10),
		stockUnits: assertCount(input.stockUnits, "Stock", 0, 1e6),
		minStock: assertCount(input.minStock, "Stock mínimo", 0, 1e6),
		pickup: input.pickup === true,
		delivery: input.delivery === true,
		shippingCents: assertCount(input.shippingCents, "Envío", 0, 5e10),
		leadTimeHours: assertCount(input.leadTimeHours, "Plazo", 0, 2160)
	};
}
var listListingOptions = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("bb4c716e95da024a696aa67577c657d5537ccbd4a9b1dd2ba3be364881d5633e"));
var listMyListings = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => {
	return {
		status: LIST_FILTERS.find((item) => item === input?.status) ?? "all",
		q: typeof input?.q === "string" ? input.q.trim().slice(0, 80) : ""
	};
}).handler(createSsrRpc("2a70852ea57fd033f20ca36f2662dbc32fd30e433a4191af12ccd2e20848bdcb"));
var getMyListing = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((listingId) => {
	if (typeof listingId !== "string" || listingId.length < 8) throw new Error("Producto inválido.");
	return listingId;
}).handler(createSsrRpc("b1451e68a15c7cc347fb61a9daa7f4ed6a555933fbcb345198a8e701ff37cf43"));
var createListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = parseListingWrite(input);
	if (!data.businessId) throw new Error("Elegí el negocio.");
	return data;
}).handler(createSsrRpc("22372a2aa8e20de22e83c803aaeaf499586dace933d4a2728b3c4226dbcbdb14"));
var updateListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId) throw new Error("Falta el producto.");
	return {
		listingId: input.listingId,
		...parseListingWrite(input)
	};
}).handler(createSsrRpc("c22079f48edf6c411ab370efa8697f79ce29925275f299ee03f5f086d8503679"));
var setListingPaymentMethods = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId || input.listingId.length > 80) throw new Error("Falta el producto.");
	const inherit = input.inherit === true;
	return {
		listingId: input.listingId,
		inherit,
		methods: inherit ? [] : normalizePaymentMethods(input.methods ?? [])
	};
}).handler(createSsrRpc("fe5e44ce154d000eeba91a11f5e3c419567ce869572065098ca503e8ecd66641"));
var publishListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((listingId) => {
	if (typeof listingId !== "string" || listingId.length < 8) throw new Error("Producto inválido.");
	return listingId;
}).handler(createSsrRpc("c9f157dbae3f0d63c0517ef48555e6eeb32b32fad0022267e4cfb2c07c9ee5ab"));
var setListingStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId) throw new Error("Falta el producto.");
	if (input.action !== "pause" && input.action !== "reactivate") throw new Error("Acción inválida.");
	return input;
}).handler(createSsrRpc("d5ecea687019526196135fc48aaa424b07016597d0a00f0ce09fa8d0416da692"));
var removeListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((listingId) => {
	if (typeof listingId !== "string" || listingId.length < 8) throw new Error("Producto inválido.");
	return listingId;
}).handler(createSsrRpc("fbd90881f4deb394008d7046631e48abc9fdf348851e1d7244d6c58efa2533ab"));
var prepareListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId) throw new Error("Falta el producto.");
	if (!IMAGE_TYPES.includes(input.contentType)) throw new Error("Solo se aceptan JPEG, PNG o WebP.");
	if (!Number.isInteger(input.byteSize) || input.byteSize <= 0) throw new Error("La imagen está vacía.");
	if (input.byteSize > 4194304) throw new Error("La imagen supera 4 MB.");
	return {
		listingId: input.listingId,
		contentType: input.contentType,
		byteSize: input.byteSize
	};
}).handler(createSsrRpc("9a40844b8d2c384bc24049390203a1a74774e3312dd1c8ed919aa1b402f6794c"));
var saveListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.imageId || typeof input.base64 !== "string") throw new Error("Falta la imagen.");
	const compact = input.base64.replace(/\s/g, "");
	if (!compact || compact.length > Math.ceil(4194304 / 3) * 4 + 16) throw new Error("La imagen supera 4 MB.");
	return {
		imageId: input.imageId,
		base64: compact
	};
}).handler(createSsrRpc("966a226e22f8e8c39446a3d3a9570fdbfa2579ca2dd644241d4d38e681a84aea"));
var confirmListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((imageId) => {
	if (typeof imageId !== "string" || imageId.length < 8) throw new Error("Imagen inválida.");
	return imageId;
}).handler(createSsrRpc("13dc6501e7cc47f82aea7fdb5c0e58c4b4997e462704b0607d027b2de980036b"));
var setPrimaryImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((imageId) => {
	if (typeof imageId !== "string" || imageId.length < 8) throw new Error("Imagen inválida.");
	return imageId;
}).handler(createSsrRpc("c511238cf4adef3703b302f0a76b8e7dc39e56bd6ecfed687a96e20e0c24d8d8"));
var deleteListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((imageId) => {
	if (typeof imageId !== "string" || imageId.length < 8) throw new Error("Imagen inválida.");
	return imageId;
}).handler(createSsrRpc("6d7ed0e34794dd41d8fb6c8444ceac9867b427aa0c82f4f99d16dfbc52488b6c"));
var moveListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.imageId) throw new Error("Imagen inválida.");
	if (input.direction !== "up" && input.direction !== "down") throw new Error("Dirección inválida.");
	return input;
}).handler(createSsrRpc("b7f1c30ac12bee335dfcb34ff5a791a74cdd10bc4bcb6bc0cdac0c7e96c9d644"));
//#endregion
export { listListingOptions as a, prepareListingImage as c, saveListingImage as d, setListingPaymentMethods as f, updateListing as h, getMyListing as i, publishListing as l, setPrimaryImage as m, createListing as n, listMyListings as o, setListingStatus as p, deleteListingImage as r, moveListingImage as s, confirmListingImage as t, removeListing as u };
