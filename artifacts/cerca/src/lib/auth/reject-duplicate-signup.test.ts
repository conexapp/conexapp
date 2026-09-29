import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isEmailSignUpPath } from "./signup-path.ts";

describe("ruta de registro", () => {
  it("reconoce el endpoint de sign-up email", () => {
    assert.equal(isEmailSignUpPath("/api/auth/sign-up/email"), true);
    assert.equal(isEmailSignUpPath("/api/auth/sign-in/email"), false);
  });
});
