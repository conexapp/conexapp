/** Money is integer centavos. Never store ARS as a float. */

export function formatArs(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Accepts "9500", "9.500", "9500,50", "$ 9.500,50". */
export function parseArsToCents(input: string): number | null {
  const cleaned = input.trim().replace(/[$\s]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/\.(?=\d{3}(\D|$))/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, frac = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0) return null;
  return cents;
}

export function marketplaceFeeCents(grossCents: number, feeBps: number): number {
  if (!Number.isInteger(grossCents) || grossCents < 0) {
    throw new Error("El bruto del pedido es inválido.");
  }
  if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 10_000) {
    throw new Error("La comisión en basis points es inválida.");
  }
  return Math.round((grossCents * feeBps) / 10_000);
}
