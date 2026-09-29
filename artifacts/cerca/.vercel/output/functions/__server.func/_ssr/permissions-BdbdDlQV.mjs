//#region node_modules/.nitro/vite/services/ssr/assets/permissions-BdbdDlQV.js
function can(access, action, resource) {
	if (action === "admin" || action === "resolve_dispute") return access.platformRole === "admin";
	if (action === "buy") return true;
	if (action === "open_dispute") return Boolean(resource?.buyerUserId) && resource?.buyerUserId === access.userId;
	const owns = resource?.businessId ? access.businessIds.includes(resource.businessId) : access.businessIds.length > 0;
	if (action === "manage_business" || action === "respond_quote" || action === "fulfill_order") return owns;
	return false;
}
//#endregion
export { can as t };
