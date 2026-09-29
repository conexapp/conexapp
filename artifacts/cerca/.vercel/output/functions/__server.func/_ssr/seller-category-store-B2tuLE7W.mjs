import { f as sql, r as audit, u as loadAccess } from "./helpers-AwcxVs0A.mjs";
import { t as businessMutation } from "./ownership-GOJqhWNU.mjs";
import { t as assertSellerCategorySelection } from "./seller-categories-BFm_XHW2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller-category-store-B2tuLE7W.js
async function checkedSellerCategoryIds(categoryIds) {
	const db = await sql();
	const known = await db`select id from categories where active = true`;
	const limitRows = await db`
    select value::text::int as value from platform_settings where key = 'seller_category_limit'
  `;
	const limit = Number.isInteger(limitRows[0]?.value) && limitRows[0].value > 0 ? limitRows[0].value : 10;
	return assertSellerCategorySelection({
		ids: categoryIds,
		limit,
		knownIds: new Set(known.map((row) => row.id))
	});
}
async function replaceBusinessCategories(userId, businessId, categoryIds) {
	const db = await sql();
	await loadAccess(db, userId);
	const rows = await db`
    select owner_user_id, status, is_demo from businesses where id = ${businessId}
  `;
	const decision = businessMutation({
		actorUserId: userId,
		ownerUserId: rows[0]?.owner_user_id ?? null,
		isDemo: rows[0]?.is_demo,
		businessStatus: rows[0]?.status
	});
	if (!decision.ok) throw new Error(decision.reason);
	const ids = await checkedSellerCategoryIds(categoryIds);
	await db`delete from business_categories where business_id = ${businessId}`;
	for (const categoryId of ids) await db`
      insert into business_categories (business_id, category_id)
      values (${businessId}, ${categoryId})
    `;
	await audit(db, userId, "set_business_categories", "business", businessId, { categoryIds: ids });
	return ids;
}
//#endregion
export { replaceBusinessCategories as n, checkedSellerCategoryIds as t };
