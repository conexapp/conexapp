//#region node_modules/.nitro/vite/services/ssr/assets/text-BUH6vDdb.js
/** Email comparable for unicidad: trim + minúsculas. No altera el UNIQUE del schema. */
function normalizeAccountEmail(value) {
	return value.trim().toLowerCase();
}
function fold(value) {
	return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}
function slugify(value) {
	return fold(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "item";
}
function likeContains(value) {
	return `%${fold(value).replace(/[\\%_]/g, "\\$&")}%`;
}
//#endregion
export { slugify as i, likeContains as n, normalizeAccountEmail as r, fold as t };
