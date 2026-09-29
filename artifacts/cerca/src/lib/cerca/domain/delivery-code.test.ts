import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assessDeliveryCode, generateDeliveryCode, hashDeliveryCode } from "./delivery-code.ts";

describe("código de entrega", () => {
  it("es de un solo uso, expira y no acepta otro código", () => {
    const pepper = "pepper-de-prueba";
    const code = generateDeliveryCode();
    assert.match(code, /^\d{8}$/);
    const storedHash = hashDeliveryCode(code, pepper);
    const base = {
      storedHash,
      pepper,
      usedAt: null,
      expiresAt: "2026-12-01T00:00:00.000Z",
      now: new Date("2026-06-01T00:00:00.000Z"),
    };
    assert.equal(assessDeliveryCode({ ...base, providedCode: code }), "ok");
    assert.equal(assessDeliveryCode({ ...base, providedCode: "00000000" }), "mismatch");
    assert.equal(assessDeliveryCode({ ...base, providedCode: code, usedAt: "2026-05-01T00:00:00.000Z" }), "used");
    assert.equal(
      assessDeliveryCode({
        ...base,
        providedCode: code,
        now: new Date("2027-01-01T00:00:00.000Z"),
      }),
      "expired",
    );
  });
});
