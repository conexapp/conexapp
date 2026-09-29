import { copyFileSync, mkdirSync } from "node:fs";

const dest = ".vercel/output/functions/__server.func/_libs";
mkdirSync(dest, { recursive: true });
for (const file of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  copyFileSync(`node_modules/@electric-sql/pglite/dist/${file}`, `${dest}/${file}`);
}
