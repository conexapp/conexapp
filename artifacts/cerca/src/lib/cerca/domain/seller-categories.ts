import { fold } from "./text.ts";

export type SellerTaxon = {
  id: string;
  name: string;
  parentId: string | null;
  featured: boolean;
  icon: string | null;
  description: string;
  synonyms: string;
  sortOrder: number;
};

export function featuredTaxa(categories: SellerTaxon[]): SellerTaxon[] {
  return categories
    .filter((category) => category.featured && category.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es"));
}

export function otherRoots(categories: SellerTaxon[]): SellerTaxon[] {
  return categories
    .filter((category) => category.parentId === null && !category.featured)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es"));
}

export function childrenOf(categories: SellerTaxon[], parentId: string): SellerTaxon[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function assertSellerCategorySelection(input: { ids: string[]; limit: number; knownIds: ReadonlySet<string> }): string[] {
  const ids = [...new Set(input.ids.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) throw new Error("Elegí al menos una categoría.");
  if (!Number.isInteger(input.limit) || input.limit < 1) throw new Error("El límite de categorías no está configurado.");
  if (ids.length > input.limit) throw new Error(`Podés elegir hasta ${input.limit} categorías.`);
  const unknown = ids.find((id) => !input.knownIds.has(id));
  if (unknown) throw new Error("Hay una categoría que ya no está disponible.");
  return ids;
}

export type CategoryHit = { id: string; name: string; parentName: string | null };

export function searchSellerTaxonomy(categories: SellerTaxon[], query: string): CategoryHit[] {
  const needle = fold(query);
  if (needle.length < 2) return [];
  const byId = new Map(categories.map((category) => [category.id, category]));
  const hits: Array<CategoryHit & { rank: number }> = [];
  for (const category of categories) {
    const own = fold(`${category.name} ${category.synonyms}`);
    if (!matches(own, needle)) continue;
    const name = fold(category.name);
    const rank = name === needle ? 0 : name.includes(needle) ? 1 : 2;
    const parent = category.parentId ? byId.get(category.parentId) : undefined;
    hits.push({ id: category.id, name: category.name, parentName: parent?.name ?? null, rank });
  }
  hits.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, "es"));
  return hits.slice(0, 30).map(({ id, name, parentName }) => ({ id, name, parentName }));
}

function matches(haystack: string, needle: string): boolean {
  if (haystack.includes(needle)) return true;
  const words = haystack.split(/[^a-z0-9]+/).filter((word) => word.length >= 4);
  return words.some((word) => word.startsWith(needle) || (needle.length >= 5 && editDistance(word, needle) <= 1));
}

function editDistance(a: string, b: string): number {
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
