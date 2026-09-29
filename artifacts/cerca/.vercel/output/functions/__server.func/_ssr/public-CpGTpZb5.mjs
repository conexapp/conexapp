import { t as fold } from "./text-BUH6vDdb.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { l as createSsrRpc } from "./shell-CbJDficC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/public-CpGTpZb5.js
function cleanSearch(input) {
	const sort = input.sort;
	return {
		q: typeof input.q === "string" ? input.q.trim().slice(0, 80) : "",
		category: typeof input.category === "string" ? input.category : "",
		maxPriceCents: typeof input.maxPriceCents === "number" && input.maxPriceCents > 0 ? Math.round(input.maxPriceCents) : null,
		maxDistanceKm: typeof input.maxDistanceKm === "number" && input.maxDistanceKm > 0 ? input.maxDistanceKm : null,
		delivery: input.delivery === true,
		pickup: input.pickup === true,
		inStock: input.inStock !== false,
		includeUnavailable: input.includeUnavailable === true,
		sort: sort === "price_desc" || sort === "distance" || sort === "price_asc" ? sort : "price_asc"
	};
}
var searchMarketplace = createServerFn({ method: "GET" }).validator((input) => cleanSearch(input ?? {})).handler(createSsrRpc("595a8ab801994b6292bc300a91b651e567e2daae81ed0471d75b56f838b3f92d"));
var getListing = createServerFn({ method: "GET" }).validator((listingId) => {
	if (typeof listingId !== "string" || listingId.length > 80) throw new Error("Publicación inválida.");
	return listingId;
}).handler(createSsrRpc("5e3c309d39c92021bb234d83940e34ecd99decd8e2a7617d1813c18486ed7202"));
var getBusiness = createServerFn({ method: "GET" }).validator((businessId) => {
	if (typeof businessId !== "string" || businessId.length > 80) throw new Error("Negocio inválido.");
	return businessId;
}).handler(createSsrRpc("2cca906b0777e366fa01707ff8f41e6326b7a6364c15a7cb94b3fd62ba2b305f"));
var listMapBusinesses = createServerFn({ method: "GET" }).validator((input) => ({
	q: typeof input?.q === "string" ? input.q.trim().slice(0, 80) : "",
	category: typeof input?.category === "string" ? fold(input.category).slice(0, 80) : "",
	onlyWithProducts: input?.onlyWithProducts === true
})).handler(createSsrRpc("a19c4c828fc9b807f1782a31aa30c9e10cc6f3d3cd5b31086d06d52a4648bc04"));
var listPublicBusinesses = createServerFn({ method: "GET" }).validator((input) => ({
	q: typeof input?.q === "string" ? input.q.trim().slice(0, 80) : "",
	category: typeof input?.category === "string" ? fold(input.category).slice(0, 80) : ""
})).handler(createSsrRpc("e6e4a234686fae5162494c65975c62a6db747c496e6bd0da868f2bbc6ba35c34"));
var listPublicRequests = createServerFn({ method: "GET" }).validator((input) => ({
	q: typeof input?.q === "string" ? input.q.trim().slice(0, 80) : "",
	category: typeof input?.category === "string" ? fold(input.category).slice(0, 80) : ""
})).handler(createSsrRpc("e037490333ff983b784fb5fc311499b83e9bbbee89aec2f6611b5bd87d203310"));
var getPublicRequest = createServerFn({ method: "GET" }).validator((requestId) => {
	if (typeof requestId !== "string" || requestId.length < 8 || requestId.length > 80) throw new Error("Solicitud inválida.");
	return requestId;
}).handler(createSsrRpc("3b02ed6fe2b63dc5d4da6791aabab8593e0625544802cb5db5dd94a895e61e14"));
var getPlatformStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("eb7a6e2652b1acce69d022bec5bb992294f4ce36f090057ad803bae6f6247612"));
//#endregion
export { listMapBusinesses as a, searchMarketplace as c, getPublicRequest as i, getListing as n, listPublicBusinesses as o, getPlatformStatus as r, listPublicRequests as s, getBusiness as t };
