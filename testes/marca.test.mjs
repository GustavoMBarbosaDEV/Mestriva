import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { simbolo, SIMBOLO_SVG, CORES } from "../js/ui/marca.js";

test("símbolo: M que sobe com o ponto, nas cores da marca", () => {
  const s = simbolo("h-10 w-10");
  assert.ok(s.startsWith("<svg") && s.includes('viewBox="0 0 64 64"') && s.includes('aria-hidden="true"'));
  assert.ok(s.includes(CORES.tinta) && s.includes(CORES.lima) && s.includes("M16 48V28l14 14 18-18v24"));
  assert.ok(s.includes('class="h-10 w-10'));
  assert.ok(!simbolo('"><script>').includes("<script>"));
});

test("o favicon e o splash usam o mesmo símbolo", () => {
  assert.ok(fs.readFileSync("icons/favicon.svg", "utf8").includes("M16 48V28l14 14 18-18v24"));
  assert.ok(fs.readFileSync("index.html", "utf8").includes("M16 48V28l14 14 18-18v24"));
  assert.ok(SIMBOLO_SVG.includes("<circle"));
});

test("nenhuma tela usa mais o M de texto como logo", () => {
  for (const f of ["js/ui/casca.js", "js/paginas/landing.js", "js/paginas/onboarding.js", "js/atualizacao.js", "privacidade.html", "termos.html", "index.html"]) {
    assert.ok(!/>M<\/span>/.test(fs.readFileSync(f, "utf8")), f);
  }
});
