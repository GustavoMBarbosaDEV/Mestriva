import { test } from "node:test";
import assert from "node:assert/strict";
import { deveMostrarNovidades, corpoNovidades } from "../js/ui/novidades.js";

test("mostra uma vez por versão e não na primeira visita", () => {
  assert.equal(deveMostrarNovidades(null, "0.2.0", ["a"]), false);
  assert.equal(deveMostrarNovidades("0.1.0", "0.2.0", ["a"]), true);
  assert.equal(deveMostrarNovidades("0.2.0", "0.2.0", ["a"]), false);
  assert.equal(deveMostrarNovidades("0.1.0", "0.2.0", []), false);
});

test("lista escapada", () => {
  const h = corpoNovidades(["<b>x</b>", "y"]);
  assert.ok(h.includes("&lt;b&gt;x") && (h.match(/<li/g) || []).length === 2);
});
