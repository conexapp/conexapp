import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { type SellerTaxon } from "../domain/seller-categories";
import { replaceBusinessCategories } from "./seller-category-store";
import { sql } from "./helpers";

type CategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
  is_featured: boolean;
  icon: string | null;
  description: string;
  synonyms: string;
  sort_order: number;
};

function taxon(row: CategoryRow): SellerTaxon {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    featured: row.is_featured === true,
    icon: row.icon,
    description: row.description,
    synonyms: row.synonyms,
    sortOrder: row.sort_order,
  };
}

export const listSellerTaxonomy = createServerFn({ method: "GET" }).handler(async () => {
  const db = await sql();
  const rows = await db<CategoryRow>`
    select id, name, parent_id, is_featured, icon, description, synonyms, sort_order
    from categories
    where active = true
    order by sort_order, name
  `;
  const limitRows = await db<{ value: number }>`
    select value::text::int as value from platform_settings where key = 'seller_category_limit'
  `;
  const limit = limitRows[0]?.value;
  return {
    limit: Number.isInteger(limit) && limit! > 0 ? limit! : 10,
    categories: rows.map(taxon),
  };
});

export const setBusinessCategories = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { businessId: string; categoryIds: string[] }) => {
    if (!input?.businessId) throw new Error("Falta el negocio.");
    if (!Array.isArray(input.categoryIds)) throw new Error("Elegí al menos una categoría.");
    return { businessId: input.businessId, categoryIds: input.categoryIds };
  })
  .handler(async ({ context, data }) => {
    const categoryIds = await replaceBusinessCategories(context.userId, data.businessId, data.categoryIds);
    return { ok: true as const, categoryIds };
  });
