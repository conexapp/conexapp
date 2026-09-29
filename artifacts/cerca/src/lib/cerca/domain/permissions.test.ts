import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { can, type Access } from "./permissions.ts";

const supplier: Access = {
  userId: "u1",
  platformRole: "user",
  businessIds: ["b1"],
};

describe("RBAC", () => {
  it("un proveedor no administra la plataforma", () => {
    assert.equal(can(supplier, "admin"), false);
    assert.equal(can(supplier, "manage_business", { businessId: "b1" }), true);
    assert.equal(can(supplier, "manage_business", { businessId: "b2" }), false);
  });

  it("solo el comprador del pedido abre disputa", () => {
    assert.equal(can(supplier, "open_dispute", { buyerUserId: "u1" }), true);
    assert.equal(can(supplier, "open_dispute", { buyerUserId: "otro" }), false);
  });

  it("el admin resuelve disputas pero no opera el negocio de otro", () => {
    const admin: Access = { userId: "a", platformRole: "admin", businessIds: [] };
    assert.equal(can(admin, "resolve_dispute"), true);
    assert.equal(can(admin, "fulfill_order", { businessId: "b9" }), false);
    assert.equal(can(admin, "manage_business", { businessId: "b9" }), false);
    assert.equal(can(admin, "open_dispute", { buyerUserId: "otro" }), false);
  });
});
