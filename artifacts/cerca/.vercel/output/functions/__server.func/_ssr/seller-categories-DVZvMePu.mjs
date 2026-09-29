import { f as sql } from "./helpers-AwcxVs0A.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { n as replaceBusinessCategories } from "./seller-category-store-B2tuLE7W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller-categories-DVZvMePu.js
function taxon(row) {
	return {
		id: row.id,
		name: row.name,
		parentId: row.parent_id,
		featured: row.is_featured === true,
		icon: row.icon,
		description: row.description,
		synonyms: row.synonyms,
		sortOrder: row.sort_order
	};
}
var listSellerTaxonomy_createServerFn_handler = createServerRpc({
	id: "fb57c938a0d920117e6ee0ac48d85231042b7fdd76b1a234d4bca9335ee74d28",
	name: "listSellerTaxonomy",
	filename: "src/lib/cerca/server/seller-categories.ts"
}, (opts) => listSellerTaxonomy.__executeServer(opts));
var listSellerTaxonomy = createServerFn({ method: "GET" }).handler(listSellerTaxonomy_createServerFn_handler, async () => {
	const db = await sql();
	const rows = await db`
    select id, name, parent_id, is_featured, icon, description, synonyms, sort_order
    from categories
    where active = true
    order by sort_order, name
  `;
	const limit = (await db`
    select value::text::int as value from platform_settings where key = 'seller_category_limit'
  `)[0]?.value;
	return {
		limit: Number.isInteger(limit) && limit > 0 ? limit : 10,
		categories: rows.map(taxon)
	};
});
var setBusinessCategories_createServerFn_handler = createServerRpc({
	id: "bd7739e16b93213b4c6fe07b3805872e6830adf60597d48ed0b98b00a024120e",
	name: "setBusinessCategories",
	filename: "src/lib/cerca/server/seller-categories.ts"
}, (opts) => setBusinessCategories.__executeServer(opts));
var setBusinessCategories = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId) throw new Error("Falta el negocio.");
	if (!Array.isArray(input.categoryIds)) throw new Error("Elegí al menos una categoría.");
	return {
		businessId: input.businessId,
		categoryIds: input.categoryIds
	};
}).handler(setBusinessCategories_createServerFn_handler, async ({ context, data }) => {
	return {
		ok: true,
		categoryIds: await replaceBusinessCategories(context.userId, data.businessId, data.categoryIds)
	};
});
//#endregion
export { listSellerTaxonomy_createServerFn_handler, setBusinessCategories_createServerFn_handler };
