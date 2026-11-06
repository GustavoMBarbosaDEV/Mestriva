import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { atrasoAbertura, ABERTURA_MIN_MS } from "../js/ui/abertura.js";

test("abertura fica o tempo mínimo da animação, e some na hora sem animação", () => {
  assert.equal(atrasoAbertura(0, false), ABERTURA_MIN_MS);
  assert.equal(atrasoAbertura(400, false), ABERTURA_MIN_MS - 400);
  assert.equal(atrasoAbertura(ABERTURA_MIN_MS + 50, false), 0);
  assert.equal(atrasoAbertura(0, true), 0);
  assert.ok(ABERTURA_MIN_MS >= 800 && ABERTURA_MIN_MS <= 1600);
});

test("index.html tem a abertura com o traço, o ponto e o nome", () => {
  const h = fs.readFileSync("index.html", "utf8");
  assert.ok(h.includes('id="abertura"') && h.includes('role="status"'));
  assert.ok(/class="ab-traco"[^>]*pathLength="1"|pathLength="1"[^>]*class="ab-traco"/.test(h));
  assert.ok(h.includes('class="ab-ponto"') && h.includes(">Mestriva<"));
});

test("boot.css respeita menos animação e tem a saída", () => {
  const c = fs.readFileSync("boot.css", "utf8");
  assert.ok(c.includes("#abertura.sai") && c.includes("prefers-reduced-motion") && c.includes("html.a11y-motion #abertura"));
});
