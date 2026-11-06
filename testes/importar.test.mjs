import { test } from "node:test";
import assert from "node:assert/strict";
import { materiasDoTextoExtraido, linhasDosItens } from "../js/importar.js";

const GRADE = `UNIVERSIDADE FEDERAL DE EXEMPLO
Curso: Engenharia Civil — Matriz Curricular 2024
1º PERÍODO
Código Disciplina CH Créditos
MAT101 Cálculo Diferencial e Integral I 90 6
FIS101 Física Geral I 60 4
QUI110 Química Geral 60 4
LET001 Leitura e Produção de Textos 30 2
Total do período 240 16
2º Semestre
MAT102 Cálculo Diferencial e Integral II 90 6
EST201 - Probabilidade e Estatística (60h)
CIV210 Desenho Técnico Prof. Ana Souza 60
Optativas
Pré-requisito: MAT101
3
Libras 30`;

test("separa matérias por período e limpa código e carga horária", () => {
  const r = materiasDoTextoExtraido(GRADE);
  assert.deepEqual(r.map((m) => [m.period, m.name]), [
    ["1º", "Cálculo Diferencial e Integral I"],
    ["1º", "Física Geral I"],
    ["1º", "Química Geral"],
    ["1º", "Leitura e Produção de Textos"],
    ["2º", "Cálculo Diferencial e Integral II"],
    ["2º", "Probabilidade e Estatística"],
    ["2º", "Desenho Técnico"],
    ["", "Libras"],
  ]);
  assert.equal(r[6].professor, "Ana Souza");
});

test("texto vazio ou sem matérias", () => {
  assert.deepEqual(materiasDoTextoExtraido(""), []);
  assert.deepEqual(materiasDoTextoExtraido("123\n---\nTotal 300"), []);
});

test("junta os pedaços de texto do PDF por linha (posição vertical)", () => {
  const itens = [
    { str: "MAT101", transform: [1, 0, 0, 1, 50, 700] },
    { str: "Cálculo I", transform: [1, 0, 0, 1, 120, 700.4] },
    { str: "90", transform: [1, 0, 0, 1, 400, 700] },
    { str: "FIS101", transform: [1, 0, 0, 1, 50, 680] },
    { str: "Física I", transform: [1, 0, 0, 1, 120, 680] },
  ];
  assert.deepEqual(linhasDosItens(itens), ["MAT101 Cálculo I 90", "FIS101 Física I"]);
});

import { corpoArquivo } from "../js/ui/dialogo-materia.js";

test("diálogo de arquivo: escolher, lendo e conferir", () => {
  assert.ok(corpoArquivo({ fase: "escolher", erro: "", itens: [] }).includes('accept="application/pdf'));
  assert.ok(corpoArquivo({ fase: "lendo", erro: "", itens: [] }).includes("Lendo o arquivo no seu aparelho"));
  const h = corpoArquivo({ fase: "conferir", erro: "", itens: [{ name: "<Cálculo>", period: "1º", professor: "" }, { name: "Física", period: "", professor: "Ana" }] });
  assert.ok(h.includes("&lt;Cálculo&gt;") && !h.includes("<Cálculo>"));
  assert.ok(h.includes("2 matérias encontradas") && h.includes("Salvar 2 matérias") && h.includes('data-acao="remover"'));
  assert.ok(corpoArquivo({ fase: "escolher", erro: "Não achei", itens: [] }).includes('role="alert"'));
});

test("revisão: linhas reais de grade (pré-requisito, só códigos, cabeçalhos e períodos por extenso)", () => {
  const r = materiasDoTextoExtraido(`Primeiro Semestre
ENG1001 Cálculo I 60 -
ENG1002 Geometria Analítica 60 —
IIº Semestre
ENG2001 Cálculo II 60 ENG1001
ENG2002 Física II 4 60 ENG1001, ENG1002
ENG1001 ENG1002
Coordenação do Curso
1 Mecânica Geral 4 60`);
  assert.deepEqual(r.map((m) => [m.period, m.name]), [
    ["1º", "Cálculo I"],
    ["1º", "Geometria Analítica"],
    ["2º", "Cálculo II"],
    ["2º", "Física II"],
    ["2º", "Mecânica Geral"],
  ]);
});
