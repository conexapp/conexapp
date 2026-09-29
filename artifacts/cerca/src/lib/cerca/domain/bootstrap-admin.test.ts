import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bootstrapAdminDecision } from "./bootstrap-admin.ts";

describe("primer administrador", () => {
  const base = {
    adminCount: 0,
    callerEmail: "ops@cerca.test",
    emailVerified: true,
    bootstrapEmail: "ops@cerca.test",
    devClaimAllowed: false,
  };

  it("deja entrar solo al email configurado y verificado cuando todavía no hay admin", () => {
    assert.equal(bootstrapAdminDecision(base), "allow");
    assert.equal(bootstrapAdminDecision({ ...base, callerEmail: "  OPS@cerca.test " }), "allow");
  });

  it("después del primero nadie se autoasigna, aunque sea el mismo email", () => {
    assert.equal(bootstrapAdminDecision({ ...base, adminCount: 1 }), "already_exists");
  });

  it("un usuario normal no coincide con el bootstrap", () => {
    assert.equal(bootstrapAdminDecision({ ...base, callerEmail: "otro@cerca.test" }), "email_mismatch");
  });

  it("en producción, sin variable, no hay reclamo abierto", () => {
    assert.equal(bootstrapAdminDecision({ ...base, bootstrapEmail: null }), "not_configured");
    assert.equal(bootstrapAdminDecision({ ...base, bootstrapEmail: "  " }), "not_configured");
  });

  it("el preview sin variable conserva el reclamo de desarrollo", () => {
    assert.equal(
      bootstrapAdminDecision({ ...base, bootstrapEmail: null, devClaimAllowed: true, emailVerified: false }),
      "allow",
    );
  });

  it("el correo corporativo previsto solo entra si está verificado y todavía no hay admin", () => {
    const corporate = {
      adminCount: 0,
      callerEmail: "conex.app1@gmail.com",
      emailVerified: true,
      bootstrapEmail: "conex.app1@gmail.com",
      devClaimAllowed: true,
    };
    assert.equal(bootstrapAdminDecision(corporate), "allow");
    assert.equal(bootstrapAdminDecision({ ...corporate, callerEmail: "otro@gmail.com" }), "email_mismatch");
    assert.equal(bootstrapAdminDecision({ ...corporate, emailVerified: false }), "unverified");
    assert.equal(bootstrapAdminDecision({ ...corporate, adminCount: 1 }), "already_exists");
  });

  it("si la variable está puesta, el preview también exige ese email verificado", () => {
    assert.equal(
      bootstrapAdminDecision({ ...base, devClaimAllowed: true, emailVerified: false }),
      "unverified",
    );
  });
});
