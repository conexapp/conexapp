import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { businessMutation, orderAccess, profileMutation } from "./ownership.ts";

describe("cambiar el id no otorga el recurso", () => {
  it("el proveedor A no edita el producto, la imagen ni el negocio de B", () => {
    const decision = businessMutation({
      actorUserId: "proveedor-a",
      ownerUserId: "proveedor-b",
      businessStatus: "active",
    });
    assert.equal(decision.ok, false);
  });

  it("un comprador no edita el perfil de otro usuario", () => {
    assert.equal(profileMutation("comprador", "otro").ok, false);
    assert.equal(profileMutation("comprador", "comprador").ok, true);
  });

  it("un pedido ajeno no se ve, no se paga y no se disputa", () => {
    const input = {
      actorUserId: "intruso",
      buyerUserId: "comprador",
      ownerUserId: "proveedor",
      platformRole: "user" as const,
    };
    assert.equal(orderAccess({ ...input, intent: "view" }).ok, false);
    assert.equal(orderAccess({ ...input, intent: "buyer" }).ok, false);
    assert.equal(orderAccess({ ...input, intent: "supplier" }).ok, false);
    assert.equal(orderAccess({ ...input, intent: "party" }).ok, false);
  });

  it("el admin modera la disputa pero no cumple el pedido de otro", () => {
    const input = {
      actorUserId: "admin",
      buyerUserId: "comprador",
      ownerUserId: "proveedor",
      platformRole: "admin" as const,
    };
    assert.equal(orderAccess({ ...input, intent: "view" }).ok, true);
    assert.equal(orderAccess({ ...input, intent: "party" }).ok, true);
    assert.equal(orderAccess({ ...input, intent: "supplier" }).ok, false);
    assert.equal(orderAccess({ ...input, intent: "buyer" }).ok, false);
  });

  it("el dueño y el comprador sí operan lo suyo", () => {
    assert.equal(
      orderAccess({
        actorUserId: "proveedor",
        buyerUserId: "comprador",
        ownerUserId: "proveedor",
        platformRole: "user",
        intent: "supplier",
      }).ok,
      true,
    );
    assert.equal(
      businessMutation({
        actorUserId: "proveedor",
        ownerUserId: "proveedor",
        isDemo: false,
        businessStatus: "active",
      }).ok,
      true,
    );
  });
});
