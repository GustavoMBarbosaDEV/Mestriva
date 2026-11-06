import { test } from "node:test";
import assert from "node:assert/strict";
import { responde, achaTopico, notaNecessaria, topicoPeloResumo } from "../js/tutor.js";

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

test("revisão: perguntas de conteúdo não caem em ajuda, média, agenda ou plano", () => {
  const c2 = { ...ctx, indice: { materias: [...indice.materias, { id: "estatistica", nome: "Estatística", apelidos: [], topicos: [{ id: "descritiva", nome: "Estatística descritiva" }] }, { id: "algebra", nome: "Álgebra Linear", apelidos: [], topicos: [{ id: "sistemas", nome: "Sistemas lineares" }] }, { id: "dir", nome: "Direito", apelidos: [], topicos: [{ id: "rel", nome: "Relação jurídica e sujeitos de direito" }] }] } };
  assert.equal(responde("me ajuda a entender derivadas", c2).texto.includes("Derivadas e regras"), true);
  assert.ok(!/Sua média/.test(responde("o que é média aritmética", c2)?.texto || ""));
  assert.ok(!/Sua média/.test(responde("como calcular a média e a mediana", c2)?.texto || ""));
  assert.ok(!/próximos 7 dias/.test(responde("o que tenho que saber sobre derivadas", c2)?.texto || ""));
  assert.ok(!/plano para os próximos/.test(responde("o que é planejar na administração", c2)?.texto || ""));
  assert.equal(achaTopico("como funciona o sistema de notas", c2.indice), null);
  assert.equal(achaTopico("qual a relação entre ansiedade e prova", c2.indice), null);
  assert.match(responde("qual minha média em cálculo?", c2).texto, /6,5/);
  assert.match(responde("ajuda", c2).texto, /Pomodoro/);
});

test("revisão: nota-alvo lida do texto original", () => {
  const c2 = { ...ctx, materias: [{ name: "Cálculo II", status: "cursando" }], notas: [{ subject: "Cálculo II", value: 5, max_value: 10 }, { subject: "Cálculo II", value: 8, max_value: 10 }] };
  assert.match(responde("quanto preciso tirar em Cálculo II?", c2).texto, /média \*\*6,0\*\*.*\*\*5,0\*\*/s);
  assert.match(responde("quanto preciso tirar em Cálculo II para média 6,5?", c2).texto, /\*\*6,5\*\*.*\*\*6,5\*\*/s);
});

test("com matéria de contexto, procura também dentro dos resumos", () => {
  const est = { id: "estatistica", nome: "Estatística", topicos: [
    { id: "descritiva", nome: "Estatística descritiva", resumo: "A **mediana** é o valor central dos dados ordenados; a moda é o mais frequente.", revisao: "r" },
    { id: "prob", nome: "Probabilidade", resumo: "Eventos independentes multiplicam probabilidades.", revisao: "r" },
  ], questoes: [] };
  assert.equal(topicoPeloResumo("o que é a mediana", est).id, "descritiva");
  assert.equal(topicoPeloResumo("qual a melhor forma de estudar", est), null);
});
