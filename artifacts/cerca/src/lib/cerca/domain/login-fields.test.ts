import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../");

describe("formulario de cuenta", () => {
  it("login tiene ids y names propios, distintos del buscador", () => {
    const login = readFileSync(join(root, "routes/login.tsx"), "utf8");
    const shell = readFileSync(join(root, "components/cerca/shell.tsx"), "utf8");
    assert.match(login, /id="conex-auth-email"/);
    assert.match(login, /name="email"/);
    assert.match(login, /id="conex-auth-password"/);
    assert.match(shell, /id="conex-header-search"/);
    assert.match(shell, /id="conex-header-search-mobile"/);
    assert.equal(login.includes('id="conex-header-search"'), false);
  });
});
