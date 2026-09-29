import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashAuthToken, tokenUseDecision } from "./auth-token.ts";

describe("tokens de cuenta", () => {
  it("no guarda el token en claro: el hash es estable y no lo revela", () => {
    const hash = hashAuthToken("token-de-prueba-largo");
    assert.equal(hash, hashAuthToken("token-de-prueba-largo"));
    assert.notEqual(hash, "token-de-prueba-largo");
    assert.equal(hash.length, 64);
  });

  it("el segundo uso se rechaza", () => {
    assert.equal(tokenUseDecision({ consumed: true }), "ok");
    assert.equal(tokenUseDecision({ consumed: false }), "rejected");
  });
});
