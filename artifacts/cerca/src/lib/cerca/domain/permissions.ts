export type PlatformRole = "user" | "admin";

export type Access = {
  userId: string;
  platformRole: PlatformRole;
  businessIds: string[];
};

export type Action =
  | "admin"
  | "buy"
  | "manage_business"
  | "respond_quote"
  | "fulfill_order"
  | "open_dispute"
  | "resolve_dispute";

export function can(
  access: Access,
  action: Action,
  resource?: { businessId?: string; buyerUserId?: string },
): boolean {
  if (action === "admin" || action === "resolve_dispute") {
    return access.platformRole === "admin";
  }
  if (action === "buy") return true;
  if (action === "open_dispute") {
    return Boolean(resource?.buyerUserId) && resource?.buyerUserId === access.userId;
  }
  const owns = resource?.businessId
    ? access.businessIds.includes(resource.businessId)
    : access.businessIds.length > 0;
  if (action === "manage_business" || action === "respond_quote" || action === "fulfill_order") {
    return owns;
  }
  return false;
}
