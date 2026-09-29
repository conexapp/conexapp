import { t as fold } from "./text-BUH6vDdb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller-categories-BFm_XHW2.js
function featuredTaxa(categories) {
	return categories.filter((category) => category.featured && category.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es"));
}
function otherRoots(categories) {
	return categories.filter((category) => category.parentId === null && !category.featured).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es"));
}
function childrenOf(categories, parentId) {
	return categories.filter((category) => category.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name, "es"));
}
function assertSellerCategorySelection(input) {
	const ids = [...new Set(input.ids.map((id) => id.trim()).filter(Boolean))];
	if (ids.length === 0) throw new Error("Elegí al menos una categoría.");
	if (!Number.isInteger(input.limit) || input.limit < 1) throw new Error("El límite de categorías no está configurado.");
	if (ids.length > input.limit) throw new Error(`Podés elegir hasta ${input.limit} categorías.`);
	if (ids.find((id) => !input.knownIds.has(id))) throw new Error("Hay una categoría que ya no está disponible.");
	return ids;
}
function searchSellerTaxonomy(categories, query) {
	const needle = fold(query);
	if (needle.length < 2) return [];
	const byId = new Map(categories.map((category) => [category.id, category]));
	const hits = [];
	for (const category of categories) {
		if (!matches(fold(`${category.name} ${category.synonyms}`), needle)) continue;
		const name = fold(category.name);
		const rank = name === needle ? 0 : name.includes(needle) ? 1 : 2;
		const parent = category.parentId ? byId.get(category.parentId) : void 0;
		hits.push({
			id: category.id,
			name: category.name,
			parentName: parent?.name ?? null,
			rank
		});
	}
	hits.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, "es"));
	return hits.slice(0, 30).map(({ id, name, parentName }) => ({
		id,
		name,
		parentName
	}));
}
function matches(haystack, needle) {
	if (haystack.includes(needle)) return true;
	return haystack.split(/[^a-z0-9]+/).filter((word) => word.length >= 4).some((word) => word.startsWith(needle) || needle.length >= 5 && editDistance(word, needle) <= 1);
}
function editDistance(a, b) {
	if (Math.abs(a.length - b.length) > 1) return 2;
	const rows = Array.from({ length: a.length + 1 }, (_, i) => i);
	for (let j = 1; j <= b.length; j += 1) {
		let previous = rows[0] ?? 0;
		rows[0] = j;
		for (let i = 1; i <= a.length; i += 1) {
			const current = rows[i] ?? 0;
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			rows[i] = Math.min((rows[i] ?? 0) + 1, (rows[i - 1] ?? 0) + 1, previous + cost);
			previous = current;
		}
	}
	return rows[a.length] ?? 2;
}
//#endregion
export { searchSellerTaxonomy as a, otherRoots as i, childrenOf as n, featuredTaxa as r, assertSellerCategorySelection as t };
