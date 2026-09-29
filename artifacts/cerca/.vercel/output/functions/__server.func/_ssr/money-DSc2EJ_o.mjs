//#region node_modules/.nitro/vite/services/ssr/assets/money-DSc2EJ_o.js
/** Money is integer centavos. Never store ARS as a float. */
function formatArs(cents) {
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "ARS",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(cents / 100);
}
/** Accepts "9500", "9.500", "9500,50", "$ 9.500,50". */
function parseArsToCents(input) {
	const cleaned = input.trim().replace(/[$\s]/g, "");
	if (!cleaned) return null;
	const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/\.(?=\d{3}(\D|$))/g, "");
	if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
	const [whole, frac = ""] = normalized.split(".");
	const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
	if (!Number.isSafeInteger(cents) || cents <= 0) return null;
	return cents;
}
//#endregion
export { parseArsToCents as n, formatArs as t };
