import { test } from "node:test";
import assert from "node:assert/strict";
import { filtraPorTopico, mensagemResultado, linkReportar, desenhaConfig, desenhaQuestao, desenhaResultado, opcoesMateria } from "../js/paginas/quiz.js";

const materia = {
  id: "calculo-1", nome: "Cálculo I",
  topicos: [{ id: "limites", nome: "Limites e continuidade" }, { id: "derivadas", nome: "Derivadas" }],
  questoes: [
    { id: "calculo-1-1", topico: "limites", pergunta: "L?", opcoes: ["a", "b", "c", "d"], correta: 0, explicacao: "e" },
    { id: "calculo-1-2", topico: "derivadas", pergunta: "D?", opcoes: ["a", "b", "c", "d"], correta: 1, explicacao: "e" },
  ],
};

test("filtra pelo conteúdo digitado quando bate com um tópico", () => {
  assert.deepEqual(filtraPorTopico(materia.questoes, materia, "derivadas e regra da cadeia").map((q) => q.id), ["calculo-1-2"]);
  assert.equal(filtraPorTopico(materia.questoes, materia, "tudo").length, 2);
  assert.equal(filtraPorTopico(materia.questoes, materia, "").length, 2);
});

test("mensagens do resultado", () => {
  assert.match(mensagemResultado(8, 8), /Gabaritou/);
  assert.match(mensagemResultado(3, 8), /Muitos pontos em aberto/);
  assert.match(mensagemResultado(6, 8), /Bom resultado/);
});

test("link de reportar erro", () => {
  const l = linkReportar({ id: "calculo-1-7", pergunta: "Quanto é?" });
  assert.ok(l.startsWith("mailto:monetra.app26@gmail.com?subject="));
  assert.ok(decodeURIComponent(l).includes("calculo-1-7"));
});

test("opções de matéria juntam grade e banco sem repetir", () => {
  const o = opcoesMateria([{ name: "Cálculo 1" }, { name: "Direito <Civil>" }], { materias: [{ id: "calculo-1", nome: "Cálculo I", apelidos: ["Cálculo 1"] }, { id: "fisica-1", nome: "Física I", apelidos: [] }] });
  assert.deepEqual(o.map((x) => [x.valor, x.rotulo, x.banco]), [
    ["Cálculo 1", "Cálculo 1", "calculo-1"],
    ["Direito <Civil>", "Direito <Civil>", null],
    ["banco:fisica-1", "Física I", "fisica-1"],
  ]);
});

test("telas escapam e não falam de IA", () => {
  const cfg = desenhaConfig({ materia: "", topico: '<b>x', qtd: 8, erro: "" }, [{ valor: "A<", rotulo: "A<", banco: null }]);
  assert.ok(cfg.includes("&lt;b&gt;x") && cfg.includes("A&lt;") && cfg.includes("8 questões · equilíbrio") && cfg.includes("Montar quiz"));
  assert.ok(!/\bIA\b|com ia/i.test(cfg));
  const q = { id: "calculo-1-1", pergunta: "<P>", opcoes: ["<a>", "b", "c", "d"], correta: 0, explicacao: "<e>", origem: "banco" };
  const h = desenhaQuestao({ questoes: [q], i: 0, respostas: [0], revelada: true, titulo: "Q" });
  assert.ok(h.includes("&lt;P&gt;") && h.includes("&lt;a&gt;") && h.includes("&lt;e&gt;") && h.includes("Reportar erro nesta questão") && h.includes("Ver resultado"));
  const r = desenhaResultado({ questoes: [q, { ...q, id: "x", correta: 1 }], respostas: [0, 0], titulo: "Q" });
  assert.ok(r.includes("50%") && r.includes("1 de 2 corretas") && r.includes("Revisar meus erros"));
});
