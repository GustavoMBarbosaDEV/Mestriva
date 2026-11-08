import { test } from "node:test";
import assert from "node:assert/strict";
import { corpoMaterial } from "../js/ui/leitor.js";
import { revisaoDaNota } from "../js/paginas/notas.js";
import { desenha as desenhaGrade } from "../js/paginas/grade.js";
import { materialDoBanco } from "../js/paginas/estudar.js";

const materia = { id: "calculo-1", nome: "Cálculo I", topicos: [{ id: "derivadas", nome: "Derivadas", resumo: "Resumo D", revisao: "Rev D" }, { id: "limites", nome: "Limites", resumo: "Resumo L", revisao: "Rev L" }], questoes: [] };

test("leitor: material do estudante gera cartões; do banco é só leitura", () => {
  const meu = corpoMaterial({ id: "1", content: "x", kind: "resumo" });
  assert.ok(meu.includes("Gerar cartões") && meu.includes("Excluir"));
  const banco = corpoMaterial({ id: "banco:calculo-1", content: "x", kind: "resumo" }, false, { somenteLeitura: true });
  assert.ok(!banco.includes("Excluir") && !banco.includes("Gerar cartões"));
});

test("revisão da nota usa o banco quando a matéria bate", () => {
  const r = revisaoDaNota({ subject: "Cálculo 1", activity: "P1", wrong_topics: "errei derivadas" }, materia);
  assert.equal(r.kind, "revisao");
  assert.equal(r.title, "Revisão: P1");
  assert.ok(r.content.includes("### Derivadas") && r.content.includes("Resumo D") && !r.content.includes("Resumo L"));
  const sem = revisaoDaNota({ subject: "Direito Civil", activity: "P2", wrong_topics: "" }, null);
  assert.ok(sem.content.includes("## Plano de 3 dias") && sem.content.includes("Pontos fracos em P2"));
});

test("material do banco junta os resumos dos tópicos", () => {
  const m = materialDoBanco(materia);
  assert.equal(m.id, "banco:calculo-1");
  assert.ok(m.content.includes("## Derivadas") && m.content.includes("Resumo D") && m.content.includes("Rev L"));
});

test("grade mostra o selo de conteúdo pronto", () => {
  const h = desenhaGrade([{ id: "1", name: "Cálculo 1", period: "1º", status: "cursando" }, { id: "2", name: "Direito Civil", period: "1º", status: "cursando" }], { materias: [{ id: "calculo-1", nome: "Cálculo I", apelidos: ["Cálculo 1"] }] });
  assert.equal((h.match(/">Conteúdo pronto/g) || []).length, 1);
  assert.ok(h.includes("Ligar a um conteúdo do Mestriva"), "Direito Civil ganha o botão");
});
