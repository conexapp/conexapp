import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { effectFromProviderPaymentStatus, transitionOrder, type OrderStatus } from "./orders.ts";

describe("transiciones de pedido", () => {
  it("el frontend no puede marcar un pedido como pagado", () => {
    assert.throws(() =>
      transitionOrder({
        from: "PENDING_PAYMENT",
        action: "payment_approved",
        actor: "buyer",
        fulfillment: "delivery",
      }),
    );
  });

  it("sigue el camino de entrega", () => {
    let status: OrderStatus = "PENDING_PAYMENT";
    status = transitionOrder({ from: status, action: "payment_approved", actor: "system", fulfillment: "delivery" });
    status = transitionOrder({ from: status, action: "supplier_confirm", actor: "supplier", fulfillment: "delivery" });
    status = transitionOrder({ from: status, action: "start_preparing", actor: "supplier", fulfillment: "delivery" });
    status = transitionOrder({ from: status, action: "mark_out_for_delivery", actor: "supplier", fulfillment: "delivery" });
    status = transitionOrder({
      from: status,
      action: "delivery_code_accepted",
      actor: "system",
      fulfillment: "delivery",
    });
    assert.equal(status, "DELIVERED");
    assert.equal(
      transitionOrder({ from: status, action: "buyer_close", actor: "buyer", fulfillment: "delivery" }),
      "COMPLETED",
    );
  });

  it("no manda a reparto un pedido de retiro", () => {
    assert.throws(() =>
      transitionOrder({
        from: "PREPARING",
        action: "mark_out_for_delivery",
        actor: "supplier",
        fulfillment: "pickup",
      }),
    );
  });

  it("un admin no cumple ni abre la disputa de un pedido ajeno", () => {
    assert.throws(() =>
      transitionOrder({
        from: "PAID",
        action: "supplier_confirm",
        actor: "admin",
        fulfillment: "delivery",
      }),
    );
    assert.throws(() =>
      transitionOrder({
        from: "DELIVERED",
        action: "open_dispute",
        actor: "admin",
        fulfillment: "delivery",
      }),
    );
  });
  it("el comprador no cancela un pedido que ya se está preparando", () => {
    assert.throws(() =>
      transitionOrder({
        from: "PREPARING",
        action: "cancel",
        actor: "buyer",
        fulfillment: "delivery",
      }),
    );
  });
});

describe("estado del proveedor de pagos", () => {
  it("approved es el único estado que habilita el cobro", () => {
    assert.equal(effectFromProviderPaymentStatus("approved"), "approve");
    assert.equal(effectFromProviderPaymentStatus("pending"), "record_only");
    assert.equal(effectFromProviderPaymentStatus("rejected"), "record_only");
    assert.equal(effectFromProviderPaymentStatus("refunded"), "refund");
  });
});
