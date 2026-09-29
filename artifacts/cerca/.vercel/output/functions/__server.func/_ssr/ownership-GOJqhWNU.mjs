//#region node_modules/.nitro/vite/services/ssr/assets/ownership-GOJqhWNU.js
/** El id lo elige el servidor a partir de la sesión. El body no nombra al usuario. */
function profileMutation(actorUserId, targetUserId) {
	if (!actorUserId || actorUserId !== targetUserId) return {
		ok: false,
		reason: "No podés modificar el perfil de otra persona."
	};
	return { ok: true };
}
function businessMutation(input) {
	if (!input.ownerUserId) return {
		ok: false,
		reason: "Ese negocio no existe."
	};
	if (input.isDemo) return {
		ok: false,
		reason: "Los ejemplos de desarrollo no se pueden editar."
	};
	if (input.actorUserId !== input.ownerUserId) return {
		ok: false,
		reason: "No podés modificar un recurso de otro proveedor."
	};
	if (input.businessStatus === "suspended") return {
		ok: false,
		reason: "El negocio está suspendido."
	};
	return { ok: true };
}
function orderAccess(input) {
	const buyer = input.actorUserId === input.buyerUserId;
	const supplier = input.actorUserId === input.ownerUserId;
	const admin = input.platformRole === "admin";
	if (input.intent === "buyer") return buyer ? { ok: true } : {
		ok: false,
		reason: "No es tu pedido."
	};
	if (input.intent === "supplier") return supplier ? { ok: true } : {
		ok: false,
		reason: "No podés operar el pedido de otro proveedor."
	};
	if (input.intent === "party") return buyer || supplier || admin ? { ok: true } : {
		ok: false,
		reason: "No participás de esa disputa."
	};
	return buyer || supplier || admin ? { ok: true } : {
		ok: false,
		reason: "No podés ver ese pedido."
	};
}
//#endregion
export { orderAccess as n, profileMutation as r, businessMutation as t };
