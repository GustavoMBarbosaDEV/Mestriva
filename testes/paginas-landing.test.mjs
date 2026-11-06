import { test } from "node:test";
import assert from "node:assert/strict";
import { desenha } from "../js/paginas/landing.js";

test("landing tem as seções e não promete IA", () => {
  const h = desenha({ foco: false }, "light");
  for (const t of ["Estude com método.", "Chegue na prova", "Criar minha conta grátis", "Já tenho conta", "Tudo em um só lugar", "Feito para funcionar com você", "Seu próximo semestre pode ser diferente.", "Começar agora", "Feito para quem estuda de verdade."]) assert.ok(h.includes(t), t);
  assert.ok(!/\bIA\b|intelig[eê]ncia artificial|internet/i.test(h));
  assert.ok(h.includes('href="/privacidade.html"') && h.includes('href="/termos.html"'));
  assert.equal((h.match(/class="[^"]*revela/g) || []).length >= 4, true);
});

test("demonstração do modo foco alterna", () => {
  assert.ok(desenha({ foco: true }, "dark").includes("25:00") && desenha({ foco: true }, "dark").includes("Mostrar normal"));
  assert.ok(desenha({ foco: false }, "dark").includes("Tema escuro ativo"));
});
