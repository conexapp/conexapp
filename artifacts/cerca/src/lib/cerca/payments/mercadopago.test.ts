import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPreferenceBody,
  buildTokenForm,
  mercadoPagoManifest,
  missingMercadoPagoCredentials,
  refundConfirmed,
  signMercadoPagoManifest,
  verifyMercadoPagoSignature,
} from "./mercadopago.ts";
import { decryptSecret, encryptSecret, openToken } from "./secrets.ts";

describe("Mercado Pago", () => {
  it("arma marketplace_fee como monto y no como porcentaje", () => {
    const body = buildPreferenceBody({
      items: [{ id: "oferta-1", title: "Cemento Portland 50 kg", quantity: 10, unitPrice: 9500 }],
      marketplaceFee: 28.5,
      externalReference: "pedido-1",
      notificationUrl: "https://cerca.example/api/payments/mercadopago",
      expirationDateTo: "2026-09-26T12:00:00.000Z",
    });
    assert.equal(body.marketplace_fee, 28.5);
    assert.equal((body.items as { currency_id: string }[])[0].currency_id, "ARS");
    assert.equal(body.expires, true);
    assert.equal(body.notification_url, "https://cerca.example/api/payments/mercadopago");
  });

  it("el refresh rota el refresh_token y no manda el access token", () => {
    const form = buildTokenForm({
      clientId: "app",
      clientSecret: "secret",
      grant: "refresh_token",
      refreshToken: "TG-viejo",
    });
    assert.equal(form.get("grant_type"), "refresh_token");
    assert.equal(form.get("refresh_token"), "TG-viejo");
    assert.equal(form.get("access_token"), null);
  });

  it("verifica la firma del webhook y rechaza un cuerpo alterado", () => {
    const secret = "secreto-de-prueba";
    const manifest = mercadoPagoManifest({
      dataId: "999999999",
      requestId: "req-1",
      ts: "1704908010",
    });
    assert.equal(manifest, "id:999999999;request-id:req-1;ts:1704908010;");
    const v1 = signMercadoPagoManifest(manifest, secret);
    const header = `ts=1704908010,v1=${v1}`;
    assert.equal(
      verifyMercadoPagoSignature({ header, dataId: "999999999", requestId: "req-1", secret }),
      true,
    );
    assert.equal(
      verifyMercadoPagoSignature({ header, dataId: "otro", requestId: "req-1", secret }),
      false,
    );
    assert.equal(mercadoPagoManifest({ dataId: "ABC", requestId: "r", ts: "1" }), "id:abc;request-id:r;ts:1;");
  });

  it("lista las credenciales que faltan sin inventar un pago", () => {
    assert.deepEqual(missingMercadoPagoCredentials({}), [
      "MP_CLIENT_ID",
      "MP_CLIENT_SECRET",
      "MP_REDIRECT_URI",
      "MP_WEBHOOK_SECRET",
      "MP_WEBHOOK_URL",
    ]);
  });

  it("un reembolso sin estado approved no está confirmado", () => {
    assert.equal(refundConfirmed(201, { status: "approved" }), true);
    assert.equal(refundConfirmed(400, { status: "approved" }), false);
    assert.equal(refundConfirmed(201, { status: "rejected" }), false);
    assert.equal(refundConfirmed(201, null), false);
  });

  it("cifra el token y no abre texto plano de desarrollo en producción", () => {
    const key = "llave-de-prueba-16";
    const sealed = encryptSecret("APP_USR-vendedor", key);
    assert.equal(sealed.includes("APP_USR-vendedor"), false);
    assert.equal(decryptSecret(sealed, key), "APP_USR-vendedor");
    assert.equal(
      openToken({ stored: "en-claro", storage: "dev_plaintext", tokenKey: undefined, productionDatabase: true }),
      null,
    );
    assert.equal(
      openToken({ stored: "en-claro", storage: "dev_plaintext", tokenKey: undefined, productionDatabase: false }),
      "en-claro",
    );
  });
});
