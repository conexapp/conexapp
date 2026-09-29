import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LEGAL_REVIEW,
  MINOR_SELL_BLOCK,
  completionShare,
  parseSellerIntent,
  publicStandingLabel,
  readSellerIntent,
  sellerStanding,
} from "./seller-profile.ts";

describe("declaración del proveedor", () => {
  it("acepta solo opciones conocidas", () => {
    const intent = parseSellerIntent({
      goal: "ambos",
      productKinds: "  taladros  ",
      activities: ["fabrico", "no-existe", "revendo"],
      channels: ["minorista"],
      size: "empezando",
      ships: true,
      seeking: "clientes cerca",
      declaresMinor: false,
    });
    assert.equal(intent.productKinds, "taladros");
    assert.deepEqual(intent.activities, ["fabrico", "revendo"]);
    assert.equal(intent.declaresMinor, false);
  });

  it("no interpreta basura como una declaración", () => {
    assert.equal(readSellerIntent(null), null);
    assert.equal(readSellerIntent("{"), null);
    assert.throws(() => parseSellerIntent({ goal: "confiable" }), /vender/);
  });

  it("bloquea la venta si declara ser menor, sin pedir un documento", () => {
    const standing = sellerStanding({
      intent: parseSellerIntent({ goal: "vender", size: "empezando", declaresMinor: true }),
      businessStatus: "active",
      completedOrders: 4,
    });
    assert.equal(standing.code, "menor_bloqueado");
    assert.match(MINOR_SELL_BLOCK, /otra persona/);
    assert.equal(standing.label.toLocaleLowerCase("es").includes("confiable"), false);
  });

  it("no llama confiable a un negocio aprobado ni inventa historial", () => {
    const approved = sellerStanding({ intent: null, businessStatus: "active", completedOrders: 0 });
    assert.equal(approved.label, "Negocio aprobado para publicar");
    assert.match(approved.detail, /no verifica identidad/i);
    const history = publicStandingLabel(2);
    assert.equal(history.label, "Proveedor con historial");
    assert.equal(completionShare(0, 0), null);
    assert.equal(completionShare(1, 1), "50% de 2 operaciones cerradas figura como completada");
  });

  it("deja identidad, menores, pagos y sanciones para revisión profesional", () => {
    const topics = LEGAL_REVIEW.map((item) => item.topic);
    assert.ok(topics.includes("Identidad"));
    assert.ok(topics.includes("Menores"));
    assert.ok(topics.includes("Sanciones y comisión"));
  });
});
