import { assertSellerCategorySelection } from "../domain/seller-categories";
import { businessMutation } from "../domain/ownership";
import { audit, loadAccess, sql } from "./helpers";

export async function checkedSellerCategoryIds(categoryIds: string[]) {
  const db = await sql();
  const known = await db<{ id: string }>`select id from categories where active = true`;
  const limitRows = await db<{ value: number }>`
    select value::text::int as value from platform_settings where key = 'seller_category_limit'
  `;
  const limit = Number.isInteger(limitRows[0]?.value) && limitRows[0]!.value > 0 ? limitRows[0]!.value : 10;
  return assertSellerCategorySelection({
    ids: categoryIds,
    limit,
    knownIds: new Set(known.map((row) => row.id)),
  });
}

export async function replaceBusinessCategories(userId: string, businessId: string, categoryIds: string[]) {
  const db = await sql();
  await loadAccess(db, userId);
  const rows = await db<{ owner_user_id: string; status: string; is_demo: boolean }>`
    select owner_user_id, status, is_demo from businesses where id = ${businessId}
  `;
  const decision = businessMutation({
    actorUserId: userId,
    ownerUserId: rows[0]?.owner_user_id ?? null,
    isDemo: rows[0]?.is_demo,
    businessStatus: rows[0]?.status,
  });
  if (!decision.ok) throw new Error(decision.reason);
  const ids = await checkedSellerCategoryIds(categoryIds);
  await db`delete from business_categories where business_id = ${businessId}`;
  for (const categoryId of ids) {
    await db`
      insert into business_categories (business_id, category_id)
      values (${businessId}, ${categoryId})
    `;
  }
  await audit(db, userId, "set_business_categories", "business", businessId, { categoryIds: ids });
  return ids;
}
