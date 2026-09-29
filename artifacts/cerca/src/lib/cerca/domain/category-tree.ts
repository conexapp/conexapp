import { fold } from "./text.ts";

export function categoryRoots<T extends { parentId?: string | null }>(categories: T[]): T[] {
  return categories.filter((category) => !category.parentId);
}

export function categoryChildren<T extends { id: string; parentId?: string | null; name?: string }>(
  categories: T[],
  parentId: string,
): T[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "es"));
}

/** Busca solo en nombre y slug. No mira productos ni proveedores. */
export function categoryMatchesQuery(category: { name: string; slug: string }, query: string): boolean {
  const needle = fold(query);
  if (!needle) return false;
  const name = fold(category.name);
  const slug = fold(category.slug).replace(/-/g, " ");
  return name.includes(needle) || slug.includes(needle);
}
