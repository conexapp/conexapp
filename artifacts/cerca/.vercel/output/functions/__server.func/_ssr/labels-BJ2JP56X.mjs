//#region node_modules/.nitro/vite/services/ssr/assets/labels-BJ2JP56X.js
function requestStatusLabel(status) {
	switch (status) {
		case "open": return "Esperando respuesta";
		case "answered": return "Respondida";
		case "accepted": return "Aceptada";
		case "cancelled": return "Cancelada";
		case "expired": return "Vencida";
		default: return status;
	}
}
function quoteStatusLabel(status) {
	switch (status) {
		case "submitted": return "Respuesta enviada";
		case "accepted": return "Aceptada";
		case "rejected": return "Rechazada";
		case "withdrawn": return "Retirada";
		default: return status;
	}
}
function orderStatusLabel(status) {
	switch (status) {
		case "PENDING_PAYMENT": return "Pendiente de pago";
		case "PAID": return "Pagada";
		case "CONFIRMED": return "Confirmada";
		case "PREPARING": return "En preparación";
		case "READY_FOR_PICKUP": return "Lista para retirar";
		case "OUT_FOR_DELIVERY": return "En camino";
		case "DELIVERED": return "Entregada";
		case "COMPLETED": return "Completada";
		case "CANCELLED": return "Cancelada";
		case "DISPUTED": return "En revisión";
		case "REFUNDED": return "Reembolsada";
		default: return status;
	}
}
function memberSinceLabel(createdAt, now = Date.now()) {
	const start = Date.parse(createdAt);
	if (!Number.isFinite(start) || start > now) return null;
	const months = Math.floor((now - start) / 26298e5);
	if (months < 1) return "Menos de un mes en CONEX";
	if (months < 12) return months === 1 ? "1 mes en CONEX" : `${months} meses en CONEX`;
	const years = Math.floor(months / 12);
	return years === 1 ? "1 año en CONEX" : `${years} años en CONEX`;
}
function businessInitials(name) {
	return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0] ?? "").join("").toLocaleUpperCase("es") || "·";
}
function formatWhen(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(date);
}
//#endregion
export { quoteStatusLabel as a, orderStatusLabel as i, formatWhen as n, requestStatusLabel as o, memberSinceLabel as r, businessInitials as t };
