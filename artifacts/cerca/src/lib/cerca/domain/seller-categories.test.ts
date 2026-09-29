import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertSellerCategorySelection,
  childrenOf,
  featuredTaxa,
  searchSellerTaxonomy,
  type SellerTaxon,
} from "./seller-categories.ts";

const taxa: SellerTaxon[] = [
  { id: "deportes", name: "Deportes y Fitness", parentId: null, featured: true, icon: "sports", description: "", synonyms: "", sortOrder: 5 },
  { id: "basquet", name: "Básquet", parentId: "deportes", featured: false, icon: null, description: "", synonyms: "basquetbol", sortOrder: 100 },
  { id: "belleza", name: "Belleza y Cuidado Personal", parentId: null, featured: true, icon: "beauty", description: "", synonyms: "", sortOrder: 7 },
  { id: "perfumes", name: "Perfumes", parentId: "belleza", featured: false, icon: null, description: "", synonyms: "perfume fragancia", sortOrder: 100 },
  { id: "musica", name: "Instrumentos Musicales", parentId: null, featured: false, icon: "music", description: "", synonyms: "", sortOrder: 20 },
  { id: "guitarras", name: "Guitarras", parentId: "musica", featured: false, icon: null, description: "", synonyms: "guitarra", sortOrder: 100 },
  { id: "herramientas", name: "Herramientas y Construcción", parentId: null, featured: false, icon: "tools", description: "", synonyms: "construccion ferreteria", sortOrder: 8 },
  { id: "obras", name: "Construcción", parentId: "herramientas", featured: false, icon: null, description: "", synonyms: "obra", sortOrder: 100 },
  { id: "taladros", name: "Taladros", parentId: "herramientas", featured: false, icon: null, description: "", synonyms: "", sortOrder: 100 },
  { id: "construccion-legacy", name: "Construcción", parentId: null, featured: false, icon: null, description: "", synonyms: "", sortOrder: 1000 },
];

describe("categorías del vendedor", () => {
  it("muestra solo las destacadas como acceso rápido", () => {
    assert.deepEqual(featuredTaxa(taxa).map((item) => item.id), ["deportes", "belleza"]);
  });

  it("exige al menos una y respeta el límite configurable", () => {
    assert.deepEqual(assertSellerCategorySelection({ ids: ["deportes", "belleza"], limit: 10, knownIds: new Set(["deportes", "belleza"]) }), ["deportes", "belleza"]);
    assert.throws(() => assertSellerCategorySelection({ ids: [], limit: 10, knownIds: new Set() }), /al menos una/);
    assert.throws(() => assertSellerCategorySelection({ ids: ["a", "b"], limit: 1, knownIds: new Set(["a", "b"]) }), /hasta 1/);
  });

  it("encuentra subcategorías aunque la búsqueda no sea el nombre exacto", () => {
    assert.equal(searchSellerTaxonomy(taxa, "básquet")[0]?.parentName, "Deportes y Fitness");
    assert.equal(searchSellerTaxonomy(taxa, "basqet")[0]?.name, "Básquet");
    assert.equal(searchSellerTaxonomy(taxa, "guitarra")[0]?.name, "Guitarras");
    assert.equal(searchSellerTaxonomy(taxa, "guitarra")[0]?.parentName, "Instrumentos Musicales");
    assert.equal(searchSellerTaxonomy(taxa, "perfume")[0]?.name, "Perfumes");
    assert.equal(searchSellerTaxonomy(taxa, "perfume")[0]?.parentName, "Belleza y Cuidado Personal");
    const construccion = searchSellerTaxonomy(taxa, "construccion");
    assert.equal(construccion[0]?.name, "Construcción");
    assert.ok(construccion.some((hit) => hit.name === "Construcción" && hit.parentName === "Herramientas y Construcción"));
    assert.equal(construccion.some((hit) => hit.id === "taladros"), false);
    assert.equal(childrenOf(taxa, "deportes")[0]?.id, "basquet");
  });
});
