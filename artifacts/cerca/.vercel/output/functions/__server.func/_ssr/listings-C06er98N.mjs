//#region node_modules/.nitro/vite/services/ssr/assets/listings-C06er98N.js
function publishBlockers(input) {
	const blockers = [];
	if (input.businessStatus !== "active") blockers.push("El negocio tiene que estar aprobado para publicar.");
	if (!input.categoryIsLeaf) blockers.push("Elegí una subcategoría, no el rubro general.");
	if (!Number.isInteger(input.priceCents) || input.priceCents <= 0) blockers.push("El precio es obligatorio.");
	if (!input.unit.trim()) blockers.push("La unidad es obligatoria.");
	if (input.readyImages < 1) blockers.push("Subí al menos una imagen.");
	if (!Number.isInteger(input.stockUnits) || input.stockUnits <= 0) blockers.push("No se puede publicar sin stock.");
	return blockers;
}
/** Stock 0 de una publicación a la venta pasa a sin stock. Reponer vuelve a publicada. Pausa y borrador no se mueven solos. */
function statusAfterStock(current, stockUnits) {
	if (!Number.isInteger(stockUnits) || stockUnits < 0) return current;
	if (current === "published" && stockUnits === 0) return "out_of_stock";
	if (current === "out_of_stock" && stockUnits > 0) return "published";
	return current;
}
/** Si ya hay cotización o pedido, no se borra la fila: se archiva. */
function listingRemoval(input) {
	if (input.orderRefs > 0 || input.quoteRefs > 0) return "archive";
	return "delete";
}
/** Compara solo publicaciones que el proveedor asoció a la misma ancla. El nombre no agrupa. */
function comparableGroups(listings) {
	const buckets = /* @__PURE__ */ new Map();
	for (const listing of listings) {
		if (!listing.standardProductId) continue;
		const bucket = buckets.get(listing.standardProductId) ?? [];
		bucket.push(listing.id);
		buckets.set(listing.standardProductId, bucket);
	}
	return [...buckets.entries()].filter(([, ids]) => ids.length >= 2).map(([standardProductId, listingIds]) => ({
		standardProductId,
		listingIds
	}));
}
//#endregion
export { statusAfterStock as i, listingRemoval as n, publishBlockers as r, comparableGroups as t };
