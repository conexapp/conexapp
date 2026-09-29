import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { businessInitials, memberSinceLabel } from "./labels.ts";

describe("antigüedad del negocio", () => {
  const now = Date.parse("2026-09-28T12:00:00.000Z");

  it("no inventa una fecha inválida", () => {
    assert.equal(memberSinceLabel("no-es-fecha", now), null);
    assert.equal(memberSinceLabel("2026-10-01T00:00:00.000Z", now), null);
  });

  it("cuenta meses reales, no un número fijo", () => {
    assert.equal(memberSinceLabel("2026-09-10T00:00:00.000Z", now), "Menos de un mes en CONEX");
    assert.equal(memberSinceLabel("2026-08-01T00:00:00.000Z", now), "1 mes en CONEX");
    assert.equal(memberSinceLabel("2026-01-01T00:00:00.000Z", now), "8 meses en CONEX");
    assert.equal(memberSinceLabel("2024-09-01T00:00:00.000Z", now), "2 años en CONEX");
  });

  it("arma las iniciales del nombre comercial", () => {
    assert.equal(businessInitials("Ferretería validación"), "FV");
    assert.equal(businessInitials("  "), "·");
  });
});
