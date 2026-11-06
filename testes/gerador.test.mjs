import { test } from "node:test";
import assert from "node:assert/strict";
import { cartoesDoTexto, lacunasDoTexto, questoesDoEstudante } from "../js/gerador.js";

const TEXTO = `# Fotossíntese

Fotossíntese é o processo em que plantas produzem glicose usando luz, água e gás carbônico.

Clorofila: pigmento verde que absorve a luz nas folhas.
Estômato — abertura na folha por onde entram e saem gases.
Mitocôndria é a organela onde ocorre a respiração celular.

## Respiração celular
A respiração celular libera energia da glicose na forma de ATP.

A **clorofila** fica nos cloroplastos. O **ATP** é a moeda de energia da célula.`;

test("cartões a partir de definições e títulos", () => {
  const c = cartoesDoTexto(TEXTO);
  const frentes = c.map((x) => x.frente);
  assert.ok(frentes.includes("O que é fotossíntese?"));
  assert.ok(frentes.includes("O que é clorofila?"));
  assert.ok(frentes.includes("O que é estômato?"));
  assert.ok(frentes.includes("O que é mitocôndria?"));
  assert.ok(frentes.includes("Explique: Respiração celular"));
  const f = c.find((x) => x.frente === "O que é clorofila?");
  assert.equal(f.verso, "Pigmento verde que absorve a luz nas folhas.");
  assert.ok(c.every((x) => x.tipo === "pergunta"));
  assert.equal(new Set(frentes).size, frentes.length);
});

test("lacunas com termos em negrito", () => {
  const l = lacunasDoTexto(TEXTO);
  assert.ok(l.some((x) => x.frente === "A ______ fica nos cloroplastos." && x.verso === "clorofila"));
  assert.ok(l.some((x) => x.verso === "ATP"));
  assert.ok(l.every((x) => x.tipo === "lacuna"));
});

test("texto vazio ou sem estrutura não quebra", () => {
  assert.deepEqual(cartoesDoTexto(""), []);
  assert.deepEqual(lacunasDoTexto("só uma frase solta"), []);
});

test("questões de múltipla escolha com distratores dos outros cartões", () => {
  const c = cartoesDoTexto(TEXTO);
  let i = 0;
  const qs = questoesDoEstudante(c, () => [0.1, 0.7, 0.3, 0.9][i++ % 4]);
  assert.equal(qs.length, c.length);
  for (const q of qs) {
    assert.equal(q.opcoes.length, 4);
    assert.equal(new Set(q.opcoes).size, 4);
    const cartao = c.find((x) => x.frente === q.pergunta);
    assert.equal(q.opcoes[q.correta], cartao.verso);
    assert.equal(q.origem, "estudante");
  }
  assert.deepEqual(questoesDoEstudante(c.slice(0, 3)), []);
});
