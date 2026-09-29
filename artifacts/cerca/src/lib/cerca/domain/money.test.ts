import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatArs, marketplaceFeeCents, parseArsToCents } from "./money.ts";

describe("parseArsToCents", () => {
  it("lee enteros y miles argentinos", () => {
    assert.equal(parseArsToCents("9500"), 950_000);
    assert.equal(parseArsToCents("9.500"), 950_000);
    assert.equal(parseArsToCents("$ 9.500,50"), 950_050);
    assert.equal(parseArsToCents("0"), null);
    assert.equal(parseArsToCents("abc"), null);
  });
});

describe("marketplaceFeeCents", () => {
  it("redondea el 3% sin hardcodearlo", () => {
    assert.equal(marketplaceFeeCents(50_000_000, 300), 1_500_000);
    assert.equal(marketplaceFeeCents(100, 300), 3);
  });

  it("rechaza comisiones fuera de rango", () => {
    assert.throws(() => marketplaceFeeCents(100, -1));
    assert.throws(() => marketplaceFeeCents(100, 10_001));
  });
});

describe("formatArs", () => {
  it("usa pesos", () => {
    assert.match(formatArs(950_000), /9\.500/);
  });
});
