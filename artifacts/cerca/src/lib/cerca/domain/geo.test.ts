import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { insideRosario, nominatimHitsInRosario, publicCoordinate, ROSARIO } from "./geo.ts";

describe("publicCoordinate", () => {
  it("keeps the stored point when the business chose exact", () => {
    assert.deepEqual(publicCoordinate(-32.94421, -60.65051, "exact"), { lat: -32.94421, lng: -60.65051 });
  });

  it("publishes the cell center, not the exact point, when approximate", () => {
    const shown = publicCoordinate(-32.94421, -60.65051, "approximate");
    assert.notDeepEqual(shown, { lat: -32.94421, lng: -60.65051 });
    assert.equal(shown.lat, -32.945);
    assert.equal(shown.lng, -60.655);
    assert.equal(insideRosario(shown.lat, shown.lng), true);
  });
});

describe("nominatimHitsInRosario", () => {
  it("drops results outside Rosario and junk payloads", () => {
    const hits = nominatimHitsInRosario([
      { display_name: "Pellegrini 1234, Rosario", lat: String(ROSARIO.lat), lon: String(ROSARIO.lng) },
      { display_name: "Buenos Aires", lat: "-34.6", lon: "-58.4" },
      null,
      { lat: ROSARIO.lat, lon: ROSARIO.lng },
    ]);
    assert.equal(hits.length, 1);
    assert.equal(hits[0]?.label, "Pellegrini 1234, Rosario");
  });
});
