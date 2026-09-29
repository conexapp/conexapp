import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emailsMatch, normalizeAccountEmail } from "./text.ts";

describe("email de cuenta", () => {
  it("normaliza espacios y mayúsculas", () => {
    assert.equal(normalizeAccountEmail("  E2E.Buyer@CONEX.test "), "e2e.buyer@conex.test");
  });

  it("considera el mismo email aunque cambie el casing", () => {
    assert.equal(emailsMatch("e2e.buyer@conex.test", "E2E.BUYER@CONEX.TEST"), true);
  });

  it("no iguala dos emails distintos", () => {
    assert.equal(emailsMatch("a@conex.test", "b@conex.test"), false);
  });
});
