import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { businessMutation } from "./ownership.ts";
import {
  PAYMENT_CATALOG_DISCLAIMERS,
  PAYMENT_METHODS,
  RETIRED_PAYMENT_LABEL,
  acceptedMethods,
  allowsMercadoPagoCheckout,
  decidePaymentChoice,
  describePayment,
  normalizePaymentMethods,
  readStoredMethods,
} from "./payment-methods.ts";

const NAMES = [
  "Mercado Pago",
  "Visa Débito",
  "Visa Crédito",
  "Mastercard Débito",
  "Mastercard Crédito",
  "American Express",
  "Cabal",
  "Naranja X",
  "Transferencia bancaria",
];

describe("medios de pago declarados", () => {
  it("el catálogo es exactamente el de débito y crédito, sin efectivo, QR ni MODO", () => {
    assert.deepEqual(
      PAYMENT_METHODS.map((method) => method.name),
      NAMES,
    );
    assert.equal(PAYMENT_METHODS.length, 9);
    assert.equal(new Set(PAYMENT_METHODS.map((method) => method.code)).size, 9);
    const blob = PAYMENT_METHODS.map((method) => `${method.code} ${method.name} ${method.notice}`).join("\n").toLowerCase();
    assert.equal(blob.includes("efectivo"), false);
    assert.equal(blob.includes("cash"), false);
    assert.equal(/\bqr\b/.test(blob), false);
    assert.equal(/\bmodo\b/.test(blob), false);
    assert.equal(PAYMENT_METHODS.some((method) => method.code === "visa" || method.code === "mastercard"), false);
    assert.equal(PAYMENT_METHODS.filter((method) => method.confirmsPayment).map((method) => method.code).join(), "mercadopago");
    for (const method of PAYMENT_METHODS) assert.equal(method.notice.length > 20, true);
    assert.equal(PAYMENT_CATALOG_DISCLAIMERS.length, 2);
  });

  it("el vendedor puede marcar débito, crédito o ambos, en el orden del catálogo", () => {
    assert.deepEqual(
      normalizePaymentMethods(["visa_credito", "mastercard_credito", "visa_debito", "mercadopago", "transferencia"]),
      ["mercadopago", "visa_debito", "visa_credito", "mastercard_credito", "transferencia"],
    );
    assert.deepEqual(normalizePaymentMethods(["mastercard_debito"]), ["mastercard_debito"]);
    assert.deepEqual(normalizePaymentMethods(["mastercard_credito"]), ["mastercard_credito"]);
  });

  it("rechaza efectivo, cash, QR, MODO, Visa genérica y Mastercard genérica", () => {
    assert.throws(() => normalizePaymentMethods(["visa_debito", "crypto"]), /no existe/);
    assert.throws(() => normalizePaymentMethods(["visa"]), /no existe/);
    assert.throws(() => normalizePaymentMethods(["mastercard"]), /no existe/);
    assert.throws(() => normalizePaymentMethods(["efectivo"]), /no está disponible/);
    assert.throws(() => normalizePaymentMethods(["cash"]), /no está disponible/);
    assert.throws(() => normalizePaymentMethods(["qr"]), /no está disponible/);
    assert.throws(() => normalizePaymentMethods(["pago_qr"]), /no está disponible/);
    assert.throws(() => normalizePaymentMethods(["modo"]), /no está disponible/);
  });

  it("una configuración vieja de Visa o Mastercard no se convierte a débito ni a crédito", () => {
    assert.deepEqual(
      readStoredMethods(["visa", "mastercard", "efectivo", "visa_debito", "mercadopago", "qr", "modo"]),
      ["mercadopago", "visa_debito"],
    );
    assert.deepEqual(acceptedMethods(["visa", "mastercard", "efectivo"], null), []);
    assert.deepEqual(acceptedMethods(["visa"], ["mastercard_credito"]), ["mastercard_credito"]);
  });

  it("un producto sin configuración no recibe métodos inventados", () => {
    assert.deepEqual(acceptedMethods([], null), []);
    assert.deepEqual(acceptedMethods(["visa_debito"], null), ["visa_debito"]);
  });

  it("un producto puede reemplazar los medios del negocio, incluso con una lista vacía", () => {
    assert.deepEqual(acceptedMethods(["visa_debito", "transferencia"], []), []);
    assert.deepEqual(acceptedMethods(["visa_debito"], ["transferencia"]), ["transferencia"]);
  });

  it("el comprador solo puede elegir un medio que el proveedor declaró", () => {
    const allowed = ["mercadopago", "mastercard_credito", "transferencia"];
    assert.equal(decidePaymentChoice({ allowed, chosen: "mastercard_credito" }).ok, true);
    assert.equal(decidePaymentChoice({ allowed, chosen: "transferencia" }).ok, true);
    const debit = decidePaymentChoice({ allowed, chosen: "mastercard_debito" });
    assert.equal(debit.ok, false);
    if (!debit.ok) assert.match(debit.reason, /no acepta/);
    assert.equal(decidePaymentChoice({ allowed, chosen: "visa_debito" }).ok, false);
    assert.equal(decidePaymentChoice({ allowed, chosen: "visa" }).ok, false);
    assert.equal(decidePaymentChoice({ allowed, chosen: "efectivo" }).ok, false);
    assert.equal(decidePaymentChoice({ allowed, chosen: "qr" }).ok, false);
    assert.equal(decidePaymentChoice({ allowed, chosen: "modo" }).ok, false);
  });

  it("sin medios declarados no se puede mandar uno, y con medios hay que elegir", () => {
    assert.deepEqual(decidePaymentChoice({ allowed: [], chosen: null }), { ok: true, method: null });
    assert.equal(decidePaymentChoice({ allowed: [], chosen: "visa_debito" }).ok, false);
    assert.equal(decidePaymentChoice({ allowed: ["transferencia"], chosen: null }).ok, false);
  });

  it("elegir un medio no confirma el pago; Mercado Pago solo si el pedido ya está pagado", () => {
    const card = describePayment({ method: "visa_debito", declared: true, orderStatus: "PENDING_PAYMENT" });
    assert.equal(card.methodName, "Visa Débito");
    assert.equal(card.confirmed, false);
    assert.match(card.stateLabel, /no verificado/);
    const transfer = describePayment({ method: "transferencia", declared: true, orderStatus: "PENDING_PAYMENT" });
    assert.equal(transfer.confirmed, false);
    assert.match(transfer.stateLabel, /no verificado/);
    const retired = describePayment({ method: "visa", declared: true, orderStatus: "PENDING_PAYMENT" });
    assert.equal(retired.methodName, RETIRED_PAYMENT_LABEL);
    assert.equal(retired.confirmed, false);
    assert.notEqual(retired.methodName, "Visa Débito");
    assert.notEqual(retired.methodName, "Visa Crédito");
    const retiredCard = describePayment({ method: "mastercard", declared: true, orderStatus: "PENDING_PAYMENT" });
    assert.equal(retiredCard.methodName, RETIRED_PAYMENT_LABEL);
    const retiredCash = describePayment({ method: "efectivo", declared: true, orderStatus: "PENDING_PAYMENT" });
    assert.equal(retiredCash.methodName, RETIRED_PAYMENT_LABEL);
    assert.equal(retiredCash.confirmed, false);
    const pendingMp = describePayment({ method: "mercadopago", declared: true, orderStatus: "PENDING_PAYMENT" });
    assert.equal(pendingMp.confirmed, false);
    assert.equal(pendingMp.stateLabel, "Pendiente");
    const rejected = describePayment({
      method: "mercadopago",
      declared: true,
      orderStatus: "PENDING_PAYMENT",
      mpStatus: "rejected",
    });
    assert.equal(rejected.confirmed, false);
    assert.equal(rejected.stateLabel, "Rechazado");
    const paid = describePayment({ method: "mercadopago", declared: true, orderStatus: "PAID" });
    assert.equal(paid.confirmed, true);
    assert.equal(paid.stateLabel, "Aprobado");
    assert.equal(allowsMercadoPagoCheckout({ method: "visa_credito", declared: true }), false);
    assert.equal(allowsMercadoPagoCheckout({ method: "efectivo", declared: true }), false);
    assert.equal(allowsMercadoPagoCheckout({ method: null, declared: true }), false);
    assert.equal(allowsMercadoPagoCheckout({ method: "mercadopago", declared: true }), true);
    assert.equal(allowsMercadoPagoCheckout({ method: null, declared: false }), true);
  });

  it("el proveedor A no puede modificar los medios del proveedor B", () => {
    const decision = businessMutation({
      actorUserId: "proveedor-a",
      ownerUserId: "proveedor-b",
      businessStatus: "active",
    });
    assert.equal(decision.ok, false);
  });
});
