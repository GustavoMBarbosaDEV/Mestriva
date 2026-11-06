import { test } from "node:test";
import assert from "node:assert/strict";
import { responde, achaTopico, notaNecessaria } from "../js/tutor.js";

const agora = new Date(2026, 10, 5, 10);
const indice = {
  materias: [
    { id: "calculo-1", nome: "Cálculo I", apelidos: ["Cálculo 1"], topicos: [{ id: "derivadas", nome: "Derivadas e regras de derivação" }, { id: "integrais", nome: "Integrais e Teorema Fundamental" }] },
    { id: "biologia-celular", nome: "Biologia Celular", apelidos: [], topicos: [{ id: "mitose", nome: "Divisão celular: mitose e meiose" }] },
  ],
};
const calculo = { id: "calculo-1", nome: "Cálculo I", topicos: [{ id: "derivadas", nome: "Derivadas e regras de derivação", resumo: "A derivada mede a taxa de variação.", revisao: "Regra da cadeia." }, { id: "integrais", nome: "Integrais e Teorema Fundamental", resumo: "Integral acumula.", revisao: "TFC." }], questoes: [] };
const ctx = {
  perfil: { display_name: "Gu", course: "Engenharia", weekly_hours: "5 a 10h", accessibility_notes: "Tenho TDAH" },
  materias: [{ name: "Cálculo 1", status: "cursando" }, { name: "Física I", status: "cursando" }],
  eventos: [
    { id: "a", type: "prova", title: "P1 de Cálculo", subject: "Cálculo 1", date: "2026-11-09T10:00" },
    { id: "b", type: "trabalho", title: "Relatório <x>", subject: "Física I", date: "2026-11-07T10:00" },
    { id: "c", type: "prova", title: "Longe", subject: "Física I", date: "2026-12-20T10:00" },
  ],
  notas: [
    { subject: "Cálculo 1", activity: "P1", value: 5, max_value: 10 },
    { subject: "Cálculo 1", activity: "T1", value: 8, max_value: 10 },
    { subject: "Física I", activity: "P1", value: 9, max_value: 10 },
  ],
  indice,
  carregadas: { "calculo-1": calculo },
  agora,
};

test("acha tópico do banco pela pergunta", () => {
  assert.deepEqual(achaTopico("me explica derivadas com uma analogia", indice), { materia: "calculo-1", topico: "derivadas" });
  assert.deepEqual(achaTopico("o que é mitose?", indice), { materia: "biologia-celular", topico: "mitose" });
  assert.equal(achaTopico("bom dia", indice), null);
});

test("nota necessária com pesos iguais", () => {
  assert.equal(notaNecessaria([5, 8], 7), 8);
  assert.equal(notaNecessaria([10, 10], 6), 0);
  assert.equal(notaNecessaria([2, 2], 7), null);
});

test("ajuda e saudação", () => {
  assert.match(responde("o que você sabe fazer?", ctx).texto, /Pomodoro/);
  assert.match(responde("oi", ctx).texto, /Gu/);
});

test("métodos de estudo", () => {
  assert.match(responde("como funciona o pomodoro?", ctx).texto, /25 minutos/);
  assert.match(responde("Como adaptar o Pomodoro para quem tem TDAH?", ctx).texto, /15 minutos/);
  assert.match(responde("o que é repetição espaçada", ctx).texto, /1, 3, 7 e 15/);
  assert.match(responde("técnica de Feynman", ctx).texto, /explicar/i);
  assert.match(responde("Me explique os métodos de estudo que realmente funcionam", ctx).texto, /Recall ativo/);
});

test("agenda e plano da semana usam os dados", () => {
  const ag = responde("o que tenho essa semana?", ctx).texto;
  assert.ok(ag.includes("P1 de Cálculo") && ag.includes("Relatório <x>") && !ag.includes("Longe"));
  const plano = responde("Como montar um cronograma para a semana de provas?", ctx).texto;
  assert.ok(plano.includes("P1 de Cálculo") && /blocos de 25 minutos/.test(plano) && /5 a 10h/.test(plano));
});

test("médias e quanto preciso tirar", () => {
  assert.match(responde("qual minha média em cálculo?", ctx).texto, /6,5/);
  assert.match(responde("qual é a minha média geral", ctx).texto, /7,3/);
  const r = responde("quanto preciso tirar em cálculo para ficar com média 7?", ctx).texto;
  assert.match(r, /8,0/);
});

test("conteúdo do banco", () => {
  const r = responde("explique derivadas", ctx);
  assert.ok(r.texto.includes("A derivada mede a taxa de variação."));
  assert.ok(r.acoes.some((a) => a.href.startsWith("/quiz?subject=")));
  const pede = responde("o que é mitose?", ctx);
  assert.deepEqual(pede.precisaCarregar, "biologia-celular");
});

test("não entendeu devolve null", () => {
  assert.equal(responde("qual a capital da mongólia no século XII", ctx), null);
  assert.equal(responde("", ctx), null);
});
