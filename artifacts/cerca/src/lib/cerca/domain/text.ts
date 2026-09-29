/** Email comparable for unicidad: trim + minúsculas. No altera el UNIQUE del schema. */
export function normalizeAccountEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function emailsMatch(a: string, b: string): boolean {
  return normalizeAccountEmail(a) === normalizeAccountEmail(b);
}

export function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value: string): string {
  const slug = fold(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  return slug || "item";
}

export function likeContains(value: string): string {
  const folded = fold(value).replace(/[\\%_]/g, "\\$&");
  return `%${folded}%`;
}
