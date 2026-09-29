import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkoutBlock,
  feeForPreference,
  mayApplyPaid,
  paymentApplication,
  processorFeeCents,
  refundDecision,
  stockDeltaForPayment,
  supplierNetCents,
  tokenStorageMode,
} from "./payments.ts";

const matched = {
  paymentStatus: "approved",
  externalReference: "pedido-1",
  collectorId: "seller-9",
  amountCents: 10_000,
  orderId: "pedido-1",
  orderStatus: "PENDING_PAYMENT",
  orderTotalCents: 10_000,
  sellerMpUserId: "seller-9",
};

describe("aplicación del pago", () => {
  it("una firma inválida no marca PAID aunque el cuerpo diga approved", () => {
    assert.equal(mayApplyPaid({ signatureOk: false, fetchedStatus: "approved" }), false);
    assert.equal(mayApplyPaid({ signatureOk: true, fetchedStatus: null }), false);
  });

  it("approved pasa a pagado solo con el objeto del pago, el vendedor y el total", () => {
    assert.equal(mayApplyPaid({ signatureOk: true, fetchedStatus: "approved" }), true);
    assert.equal(paymentApplication(matched), "mark_paid");
    assert.equal(paymentApplication({ ...matched, externalReference: "otro" }), "reject_mismatch");
    assert.equal(paymentApplication({ ...matched, collectorId: "otro" }), "reject_mismatch");
    assert.equal(paymentApplication({ ...matched, amountCents: 9_999 }), "reject_mismatch");
  });

  it("pending, rejected y cancelled no marcan PAID", () => {
    for (const paymentStatus of ["pending", "rejected", "cancelled", "in_process", "authorized"]) {
      assert.equal(paymentApplication({ ...matched, paymentStatus }), "record_only");
    }
  });

  it("un approved repetido no descuenta stock ni crea otro pedido", () => {
    assert.equal(paymentApplication({ ...matched, orderStatus: "PAID" }), "record_only");
    assert.equal(stockDeltaForPayment(), 0);
  });
});

describe("comisión y neto", () => {
  it("la preferencia usa la comisión congelada, no la regla actual", () => {
    assert.equal(feeForPreference(2850), 28.5);
    assert.notEqual(feeForPreference(2850), 100);
  });

  it("no muestra neto si Mercado Pago no informó su comisión", () => {
    assert.equal(processorFeeCents([{ type: "application_fee", amount: 10 }]), null);
    assert.equal(processorFeeCents([{ type: "mercadopago_fee", amount: 12.34 }]), 1234);
    assert.equal(
      supplierNetCents({ grossCents: 10_000, marketplaceFeeCents: 300, processorFeeCents: null }),
      null,
    );
    assert.equal(
      supplierNetCents({ grossCents: 10_000, marketplaceFeeCents: 300, processorFeeCents: 1234 }),
      8466,
    );
  });
});

describe("cobro y reembolso", () => {
  it("sin token del vendedor no hay preferencia", () => {
    assert.equal(checkoutBlock({ missingCredentials: [], sellerConnected: false, tokenUsable: false }), "SELLER_NOT_LINKED");
    assert.equal(checkoutBlock({ missingCredentials: ["MP_CLIENT_ID"], sellerConnected: true, tokenUsable: true }), "PAYMENTS_NOT_CONFIGURED");
    assert.equal(checkoutBlock({ missingCredentials: [], sellerConnected: true, tokenUsable: false }), "SELLER_TOKEN_EXPIRED");
  });

  it("cancelar un pago no marca REFUNDED si Mercado Pago no lo confirma", () => {
    assert.deepEqual(refundDecision({ configured: true, confirmed: false }), {
      orderBecomesRefunded: false,
      refundStatus: "failed",
    });
    assert.equal(refundDecision({ configured: false, confirmed: false }).refundStatus, "blocked_unconfigured");
    assert.equal(refundDecision({ configured: true, confirmed: true }).orderBecomesRefunded, true);
  });
});

describe("tokens", () => {
  it("en producción, sin CERCA_TOKEN_KEY no se guarda texto plano", () => {
    assert.deepEqual(tokenStorageMode({ productionDatabase: true, tokenKey: "" }), {
      ok: false,
      missing: ["CERCA_TOKEN_KEY"],
    });
    assert.equal(tokenStorageMode({ productionDatabase: true, tokenKey: "corta" }).ok, false);
    const dev = tokenStorageMode({ productionDatabase: false, tokenKey: undefined });
    assert.equal(dev.ok && dev.mode, "dev_plaintext");
    const locked = tokenStorageMode({ productionDatabase: true, tokenKey: "x".repeat(16) });
    assert.equal(locked.ok && locked.mode, "encrypted");
  });
});
