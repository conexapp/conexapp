import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rateLimitConfig, rateLimitDecision } from "./rate-limit.ts";

describe("límites configurables", () => {
  it("usa defaults razonables", () => {
    assert.deepEqual(rateLimitConfig("login", {}), { max: 5, windowSec: 300 });
    assert.deepEqual(rateLimitConfig("password_reset", {}), { max: 3, windowSec: 3600 });
    assert.equal(rateLimitConfig("image_upload", {}).max, 40);
  });

  it("respeta el entorno y descarta basura", () => {
    assert.deepEqual(
      rateLimitConfig("listing_create", { CERCA_RL_LISTING_CREATE_MAX: "8", CERCA_RL_LISTING_CREATE_WINDOW_SEC: "120" }),
      { max: 8, windowSec: 120 },
    );
    assert.equal(rateLimitConfig("login", { CERCA_RL_LOGIN_MAX: "0" }).max, 5);
    assert.equal(rateLimitConfig("login", { CERCA_RL_LOGIN_MAX: "no" }).max, 5);
  });

  it("corta cuando la ventana se pasa", () => {
    assert.equal(rateLimitDecision({ hits: 5, max: 5 }), "allow");
    assert.equal(rateLimitDecision({ hits: 6, max: 5 }), "deny");
  });
});
