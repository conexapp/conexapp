import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { categoryChildren, categoryMatchesQuery, categoryRoots } from "./category-tree.ts";

describe("árbol de categorías", () => {
  it("toma raíces con parentId null o undefined", () => {
    const rows = [
      { id: "a", parentId: null, name: "Tecnología" },
      { id: "b", parentId: undefined, name: "Moda" },
      { id: "c", parentId: "a", name: "Celulares" },
    ];
    assert.deepEqual(
      categoryRoots(rows).map((row) => row.id),
      ["a", "b"],
    );
  });

  it("ordena las subcategorías por nombre", () => {
    const rows = [
      { id: "b", parentId: "a", name: "Notebooks" },
      { id: "a", parentId: "a", name: "Celulares" },
      { id: "c", parentId: "z", name: "Otra" },
    ];
    assert.deepEqual(
      categoryChildren(rows, "a").map((row) => row.name),
      ["Celulares", "Notebooks"],
    );
  });

  it("encuentra una subcategoría por un término parcial, sin inventar coincidencias", () => {
    assert.equal(categoryMatchesQuery({ name: "Celulares", slug: "celulares" }, "celu"), true);
    assert.equal(categoryMatchesQuery({ name: "Celulares", slug: "celulares" }, "CÁMARA"), false);
    assert.equal(categoryMatchesQuery({ name: "Cámaras", slug: "camaras" }, "camara"), true);
    assert.equal(categoryMatchesQuery({ name: "Celulares", slug: "celulares" }, "   "), false);
  });
});
