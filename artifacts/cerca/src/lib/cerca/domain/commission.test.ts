import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveFeeBps, type FeeRule } from "./commission.ts";

const rules: FeeRule[] = [
  {
    id: "g",
    scope: "global",
    categoryId: null,
    businessId: null,
    feeBps: 300,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "c",
    scope: "category",
    categoryId: "cemento",
    businessId: null,
    feeBps: 250,
    validFrom: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "b",
    scope: "business",
    categoryId: null,
    businessId: "biz",
    feeBps: 150,
    validFrom: "2026-03-01T00:00:00.000Z",
  },
];

describe("comisión", () => {
  it("prioriza proveedor, después categoría, después global", () => {
    assert.deepEqual(
      resolveFeeBps({ rules, businessId: "biz", categoryId: "cemento", fallbackBps: 300 }),
      { feeBps: 150, ruleId: "b" },
    );
    assert.deepEqual(
      resolveFeeBps({ rules, businessId: "otro", categoryId: "cemento", fallbackBps: 300 }),
      { feeBps: 250, ruleId: "c" },
    );
    assert.deepEqual(
      resolveFeeBps({ rules, businessId: "otro", categoryId: "pintura", fallbackBps: 400 }),
      { feeBps: 300, ruleId: "g" },
    );
  });
});
