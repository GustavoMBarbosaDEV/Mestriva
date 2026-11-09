import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validaMateriaBanco, normalizaNome } from "../js/conteudo.js";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(raiz, "conteudo");
const indice = JSON.parse(fs.readFileSync(path.join(dir, "indice.json"), "utf8"));

test("índice bem formado", () => {
  assert.equal(indice.versao, 1);
  const ids = indice.materias.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, "id de matéria repetido no índice");
  const nomes = indice.materias.flatMap((m) => [m.nome, ...(m.apelidos || [])].map(normalizaNome));
  assert.equal(new Set(nomes).size, nomes.length, "nome ou apelido repetido entre matérias");
  for (const m of indice.materias) assert.match(m.id, /^[a-z0-9-]+$/);
});

for (const item of indice.materias) {
  test(`matéria ${item.id}`, () => {
    const arq = path.join(dir, `${item.id}.json`);
    assert.ok(fs.existsSync(arq), `falta conteudo/${item.id}.json`);
    const m = JSON.parse(fs.readFileSync(arq, "utf8"));
    assert.equal(m.id, item.id);
    assert.equal(m.nome, item.nome);
    assert.deepEqual(m.topicos.map((t) => ({ id: t.id, nome: t.nome })), item.topicos, "tópicos do índice diferentes dos do arquivo");
    assert.deepEqual(validaMateriaBanco(m), []);
    assert.ok(m.questoes.length >= 25, `só ${m.questoes.length} questões`);
    for (const q of m.questoes) assert.ok(q.id.startsWith(`${item.id}-`), `id fora do padrão: ${q.id}`);
    const corretas = [0, 1, 2, 3].map((i) => m.questoes.filter((q) => q.correta === i).length);
    assert.ok(Math.max(...corretas) <= m.questoes.length * 0.45, `gabarito concentrado demais: ${corretas}`);
  });
}

test("números do banco na apresentação e no FAQ batem com o índice", () => {
  const materias = indice.materias.length;
  const questoes = indice.materias.reduce((s, item) => s + JSON.parse(fs.readFileSync(path.join(dir, `${item.id}.json`), "utf8")).questoes.length, 0);
  const landing = fs.readFileSync(path.join(raiz, "js", "paginas", "landing.js"), "utf8");
  const faq = fs.readFileSync(path.join(raiz, "faq.html"), "utf8");
  assert.ok(landing.includes(`{ n: ${materias}, t: "matérias com conteúdo pronto" }`), `landing: ${materias} matérias`);
  assert.ok(landing.includes(`{ n: ${questoes}, t: "questões explicadas" }`), `landing: ${questoes} questões`);
  assert.ok(landing.includes(`"${questoes.toLocaleString("pt-BR")} questões explicadas`), `landing destaque: ${questoes} questões`);
  for (const [nome, txt] of [["landing", landing], ["faq", faq]]) assert.ok(txt.includes(`já tem ${materias} matérias`), `${nome}: ${materias} matérias no FAQ`);
});
