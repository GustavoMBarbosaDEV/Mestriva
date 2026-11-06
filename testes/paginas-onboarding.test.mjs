import { test } from "node:test";
import assert from "node:assert/strict";
import { desenha, estadoInicial, valida, perfilFinal, a11yDasEscolhas, PASSOS } from "../js/paginas/onboarding.js";
import { PADRAO_A11Y } from "../js/preferencias.js";

test("estado vem do perfil", () => {
  const e = estadoInicial({ display_name: "Ana", course: "Direito", methods_used: ["Pomodoro"] });
  assert.equal(e.passo, 0);
  assert.equal(e.display_name, "Ana");
  assert.deepEqual(e.methods_used, ["Pomodoro"]);
});

test("passo 1 tem os campos e escapa o nome", () => {
  const h = desenha({ ...estadoInicial({}), display_name: '"><img src=x>' });
  assert.ok(!h.includes("<img src=x>"));
  for (const t of ["Vamos começar por você.", "Como você quer ser chamado", "Instituição de ensino", "Curso", "Período atual", "passo 1 de 3", "Continuar"]) assert.ok(h.includes(t), t);
  assert.ok(!/\bIA\b/.test(h));
});

test("passos 2 e 3", () => {
  const h2 = desenha({ ...estadoInicial({}), passo: 1 });
  assert.ok(h2.includes("Como é a sua semana?") && h2.includes("Mais de 20h") && h2.includes("Flashcards"));
  const h3 = desenha({ ...estadoInicial({}), passo: 2 });
  assert.ok(h3.includes("O app se adapta a você.") && h3.includes("Fonte para dislexia") && h3.includes("Começar a estudar"));
  assert.equal(PASSOS.length, 3);
});

test("validação do primeiro passo", () => {
  assert.match(valida({ ...estadoInicial({}), display_name: "A" }), /Preencha seu nome/);
  assert.equal(valida({ ...estadoInicial({}), display_name: "A", institution: "U", course: "C" }), "");
  assert.equal(valida({ ...estadoInicial({}), passo: 1 }), "");
});

test("perfil final e acessibilidade", () => {
  const e = { ...estadoInicial({}), display_name: " Ana ", institution: "U", course: "C", accommodations: ["Texto maior", "Fonte para dislexia", "Menos animações", "Alto contraste"] };
  const p = perfilFinal(e);
  assert.equal(p.display_name, "Ana");
  assert.equal(p.onboarding_completed, true);
  const a = a11yDasEscolhas(PADRAO_A11Y, e.accommodations);
  assert.equal(a.textScale, 115);
  assert.equal(a.dyslexia && a.reduceMotion && a.highContrast, true);
  assert.deepEqual(a11yDasEscolhas(PADRAO_A11Y, []), { ...PADRAO_A11Y });
});
