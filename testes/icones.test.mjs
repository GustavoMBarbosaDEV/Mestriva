import { test } from "node:test";
import assert from "node:assert/strict";
import { NOMES, ICONE, icone } from "../js/icones.js";

test("todo nome da lista existe", () => {
  assert.ok(NOMES.length >= 50);
  for (const n of NOMES) assert.ok(ICONE[n] && ICONE[n].length > 10, `vazio: ${n}`);
  for (const n of ["CalendarDays", "LayoutDashboard", "Sparkles", "Loader2", "X", "Accessibility"]) assert.ok(NOMES.includes(n), n);
});

test("usa currentColor", () => {
  const s = icone("Sun");
  assert.ok(s.startsWith("<svg"));
  assert.ok(s.includes('stroke="currentColor"'));
  assert.ok(s.includes('aria-hidden="true"'));
  assert.ok(s.includes('class="h-4 w-4"'));
});

test("escapa a classe", () => {
  assert.ok(!icone("Sun", '"><script>').includes("<script>"));
});

test("nome desconhecido lança", () => {
  assert.throws(() => icone("Nada"));
});

test("Google sem stroke", () => {
  const s = icone("Google", "w-5 h-5 mr-2");
  assert.ok(s.includes("#4285F4"));
  assert.ok(!s.includes('stroke="currentColor"'));
  assert.ok(s.includes('class="w-5 h-5 mr-2"'));
});
