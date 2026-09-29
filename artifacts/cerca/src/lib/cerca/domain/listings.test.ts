import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { imageObjectDisposition, imageRejection, sniffImageType, assertStorageKey } from "./images.ts";
import { comparableGroups, listingRemoval, publishBlockers, statusAfterStock } from "./listings.ts";

describe("publicar un producto del proveedor", () => {
  const ready = {
    businessStatus: "active",
    categoryIsLeaf: true,
    priceCents: 1_050_000,
    unit: "bolsa",
    readyImages: 1,
    stockUnits: 50,
  };

  it("deja publicar cuando el negocio está aprobado y hay foto, precio y stock", () => {
    assert.deepEqual(publishBlockers(ready), []);
  });

  it("no publica un negocio en revisión ni un producto sin imagen o sin stock", () => {
    assert.ok(publishBlockers({ ...ready, businessStatus: "pending_review" }).some((item) => item.includes("aprobado")));
    assert.ok(publishBlockers({ ...ready, readyImages: 0 }).some((item) => item.includes("imagen")));
    assert.ok(publishBlockers({ ...ready, stockUnits: 0 }).some((item) => item.includes("stock")));
    assert.ok(publishBlockers({ ...ready, categoryIsLeaf: false }).some((item) => item.includes("subcategoría")));
  });
});

describe("stock y archivo", () => {
  it("pasa a sin stock y vuelve a publicado solo desde ese estado", () => {
    assert.equal(statusAfterStock("published", 0), "out_of_stock");
    assert.equal(statusAfterStock("out_of_stock", 4), "published");
    assert.equal(statusAfterStock("paused", 0), "paused");
    assert.equal(statusAfterStock("paused", 9), "paused");
    assert.equal(statusAfterStock("draft", 3), "draft");
    assert.equal(statusAfterStock("archived", 9), "archived");
  });

  it("archiva si ya hay pedido o cotización", () => {
    assert.equal(listingRemoval({ orderRefs: 1, quoteRefs: 0 }), "archive");
    assert.equal(listingRemoval({ orderRefs: 0, quoteRefs: 2 }), "archive");
    assert.equal(listingRemoval({ orderRefs: 0, quoteRefs: 0 }), "delete");
  });
});

describe("comparación", () => {
  it("no junta productos solo porque el nombre se parece", () => {
    const groups = comparableGroups([
      { id: "a", standardProductId: null },
      { id: "b", standardProductId: null },
    ]);
    assert.deepEqual(groups, []);
  });

  it("junta solo los que comparten ancla, de a dos o más", () => {
    const groups = comparableGroups([
      { id: "a", standardProductId: "cemento" },
      { id: "b", standardProductId: "cemento" },
      { id: "c", standardProductId: "cal" },
    ]);
    assert.deepEqual(groups, [{ standardProductId: "cemento", listingIds: ["a", "b"] }]);
  });
});

describe("imágenes", () => {
  it("reconoce jpeg, png y webp y rechaza el resto", () => {
    assert.equal(sniffImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0x00])), "image/jpeg");
    assert.equal(
      sniffImageType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      "image/png",
    );
    const webp = new Uint8Array(12);
    webp.set([0x52, 0x49, 0x46, 0x46], 0);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    assert.equal(sniffImageType(webp), "image/webp");
    assert.equal(sniffImageType(Uint8Array.from([0x3c, 0x73, 0x76, 0x67])), null);
  });

  it("rechaza tamaño, tipo declarado y cantidad", () => {
    assert.equal(
      imageRejection({ byteSize: 10, declaredType: "image/jpeg", sniffed: "image/png", existingCount: 0 }),
      "El tipo del archivo no coincide con su contenido.",
    );
    assert.match(imageRejection({ byteSize: 5_000_000, declaredType: "image/jpeg", sniffed: "image/jpeg", existingCount: 0 }) ?? "", /4 MB/);
    assert.match(imageRejection({ byteSize: 10, declaredType: "image/jpeg", sniffed: "image/jpeg", existingCount: 8 }) ?? "", /8/);
    assert.match(imageRejection({ byteSize: 10, declaredType: "image/svg+xml", sniffed: null, existingCount: 0 }) ?? "", /WebP/);
  });

  it("no acepta path traversal ni una clave de otro formato", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    assert.equal(assertStorageKey(`listings/${id}/${id}`), `listings/${id}/${id}`);
    assert.throws(() => assertStorageKey("../etc/passwd"));
    assert.throws(() => assertStorageKey(`listings/${id}/../${id}`));
    assert.throws(() => assertStorageKey(`listings/${id}/${id}/extra`));
  });

  it("no borra el archivo si un pedido histórico lo referencia", () => {
    assert.equal(imageObjectDisposition({ referencedByOrders: 1 }), "retain");
    assert.equal(imageObjectDisposition({ referencedByOrders: 0 }), "delete");
  });
});
