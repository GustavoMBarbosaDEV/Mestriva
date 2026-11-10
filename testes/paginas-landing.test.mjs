import { test } from "node:test";
import assert from "node:assert/strict";
import { desenha, palavrasAnimadas, FAQ } from "../js/paginas/landing.js";

const OP = { versao: "9.9.9", inicio: "/onboarding", android: false, apk: "" };

test("landing tem as seções e não promete IA", () => {
  const h = desenha({ foco: false }, "light", OP);
  for (const t of [">Chegue<", ">sabendo<", "Começar grátis", "Já tenho conta", "Tudo em um só lugar", "Feito para funcionar com você", "Seu próximo semestre pode ser diferente.", "Começar agora", "Quem faz o Mestriva", "Perguntas frequentes", "Fale com a gente"]) assert.ok(h.includes(t), t);
  assert.ok(!/\bIA\b|intelig[eê]ncia artificial/i.test(h));
  assert.ok(h.includes('href="/privacidade.html"') && h.includes('href="/termos.html"') && h.includes('href="/faq.html"'));
  assert.ok((h.match(/class="[^"]*revela/g) || []).length >= 8);
});

test("selo com a versão, checagens e nota dos termos", () => {
  const h = desenha({ foco: false }, "light", OP);
  assert.ok(h.includes("versão 9.9.9"));
  for (const t of ["Sem anúncios", "Seus dados só seus", "Funciona sem internet"]) assert.ok(h.includes(t), t);
  assert.ok(h.includes("política de privacidade") && h.includes("termos de uso"));
});

test("título animado palavra por palavra, com destaque", () => {
  const p = palavrasAnimadas("Chegue na prova sabendo.", "sabendo");
  assert.equal((p.match(/class="palavra"/g) || []).length, 4);
  assert.ok(p.includes('style="--i:3"') && p.includes("shimmer-text") && p.includes("sabendo</span>."));
  assert.ok(!palavrasAnimadas("<b>x</b>", "").includes("<b>"));
});

test("botões levam para o início certo", () => {
  assert.ok(desenha({ foco: false }, "light", OP).includes('href="/onboarding"'));
  assert.ok(desenha({ foco: false }, "light", { ...OP, inicio: "/" }).includes('href="/"'));
});

test("link do APK só no Android e só se existir", () => {
  assert.ok(!desenha({ foco: false }, "light", { ...OP, android: true, apk: "" }).includes("Baixar o app para Android"));
  assert.ok(!desenha({ foco: false }, "light", { ...OP, android: false, apk: "/mestriva.apk" }).includes("Baixar o app para Android"));
  assert.ok(desenha({ foco: false }, "light", { ...OP, android: true, apk: "/mestriva.apk" }).includes("Baixar o app para Android"));
});

test("números contam até o valor e a barra fixa do celular existe", () => {
  const h = desenha({ foco: false }, "light", OP);
  assert.ok(h.includes('data-conta="2100"') && h.includes('data-conta="70"'));
  assert.ok(h.includes("data-barra-fixa") && h.includes("data-parallax"));
});

test("perguntas frequentes em details, com o contato", () => {
  const h = desenha({ foco: false }, "light", OP);
  assert.equal((h.match(/<details/g) || []).length, FAQ.length);
  assert.ok(FAQ.length >= 4);
  assert.ok(h.includes("mailto:monetra.app26@gmail.com"));
});

test("demonstração do modo foco alterna", () => {
  assert.ok(desenha({ foco: true }, "dark", OP).includes("25:00") && desenha({ foco: true }, "dark", OP).includes("Mostrar normal"));
  assert.ok(desenha({ foco: false }, "dark", OP).includes("Tema escuro ativo"));
});
