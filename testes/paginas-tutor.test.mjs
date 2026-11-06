import { test } from "node:test";
import assert from "node:assert/strict";
import { desenha, BOAS_VINDAS, NAO_ENTENDI } from "../js/paginas/tutor.js";

test("chat escapa as duas pontas e mostra ações", () => {
  const e = { mensagens: [BOAS_VINDAS, { papel: "estudante", texto: "<img src=x>" }, { papel: "tutor", texto: "**ok** <script>", acoes: [{ rotulo: "Quiz", href: "/quiz?subject=banco%3Acalculo-1" }] }], materia: "", entrada: "", pensando: false };
  const h = desenha(e, [{ name: "Cálculo <1>" }], { accessibility_notes: "TDAH <b>" });
  assert.ok(!h.includes("<img src=x>") && h.includes("&lt;img src=x&gt;"));
  assert.ok(!h.includes("<script>") && h.includes("<strong>ok</strong>"));
  assert.ok(h.includes('href="/quiz?subject=banco%3Acalculo-1"'));
  assert.ok(h.includes("Cálculo &lt;1&gt;") && h.includes("TDAH &lt;b&gt;"));
  assert.ok(h.includes("Tutor Mestriva") && h.includes("Comece por aqui") && h.includes("Ouvir resposta"));
  assert.ok(!/\bIA\b/.test(h));
});

test("mensagem de quando não entende sugere o que perguntar", () => {
  assert.match(NAO_ENTENDI, /Pomodoro|média|semana/);
});
