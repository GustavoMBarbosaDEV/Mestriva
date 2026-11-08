import { test } from "node:test";
import assert from "node:assert/strict";
import { normPerfil, normMateria, normEvento, normNota, normSessao, normQuiz, normTentativa, normMaterial, normCartao, normDados, COLECOES, NORM } from "../js/normaliza.js";

test("perfil vazio vem completo", () => {
  const p = normPerfil(undefined);
  assert.deepEqual(Object.keys(p).sort(), ["accessibility_notes", "accommodations", "course", "display_name", "goal", "ies", "institution",
    "methods_used", "onboarding_completed", "period", "publico", "termos", "weekly_hours"].sort());
  assert.equal(p.publico, "faculdade");
  assert.equal(p.ies, null);
  assert.equal(p.onboarding_completed, false);
  assert.equal(p.termos, null);
  assert.deepEqual(p.methods_used, []);
});

test("público e código da faculdade", () => {
  assert.equal(normPerfil({ publico: "ensino_medio" }).publico, "ensino_medio");
  assert.equal(normPerfil({ publico: "hacker" }).publico, "faculdade");
  assert.equal(normPerfil({ ies: "575" }).ies, 575);
  for (const v of [-1, 1.5, "x", 0]) assert.equal(normPerfil({ ies: v }).ies, null);
});

test("descarta campo estranho", () => {
  const p = normPerfil({ x: 1, course: "Direito" });
  assert.ok(!("x" in p));
  assert.equal(p.course, "Direito");
});

test("corta texto longo", () => {
  assert.equal(normMateria({ name: "a".repeat(500) }).name.length, 120);
});

test("enum inválido vira padrão", () => {
  assert.equal(normEvento({ type: "festa" }).type, "outro");
  assert.equal(normMateria({ status: "x" }).status, "cursando");
  assert.equal(normSessao({ method: "x" }).method, "livre");
  assert.equal(normMaterial({ kind: "x" }).kind, "resumo");
  assert.equal(normCartao({ tipo: "x" }).tipo, "pergunta");
});

test("data inválida vira vazio", () => {
  assert.equal(normEvento({ date: "amanhã" }).date, "");
  assert.equal(normEvento({ date: "2026-11-05T14:30" }).date, "2026-11-05T14:30");
  assert.equal(normNota({ date: "2026-11-05" }).date, "2026-11-05");
  assert.equal(normNota({ date: "05/11/2026" }).date, "");
});

test("números da nota", () => {
  assert.equal(normNota({ value: "7.5" }).value, 7.5);
  assert.equal(normNota({}).value, null);
  assert.equal(normNota({ value: "abc" }).value, null);
  assert.equal(normSessao({ minutes: 9999 }).minutes, 600);
  assert.equal(normSessao({ minutes: -3 }).minutes, 0);
});

test("cor só no formato #rrggbb", () => {
  assert.equal(normMateria({ color: "#3b5bff" }).color, "#3b5bff");
  assert.equal(normMateria({ color: "red;background:url(x)" }).color, "");
});

test("answer_index limitado", () => {
  const q = normQuiz({ questions: [{ question: "q", options: ["a", "b"], answer_index: 9 }] });
  assert.equal(q.questions[0].answer_index, 1);
  assert.equal(q.questions[0].origem, "estudante");
});

test("questão com menos de 2 opções sai", () => {
  const q = normQuiz({ questions: [{ question: "q", options: ["a"] }, { question: "r", options: ["a", "b", "c"] }] });
  assert.equal(q.questions.length, 1);
  assert.equal(q.questions[0].question, "r");
});

test("tentativa com tópicos errados", () => {
  const t = normTentativa({ score: 3.7, total: -1, wrong_topics: ["a", 5, "b"] });
  assert.equal(t.score, 3);
  assert.equal(t.total, 0);
  assert.deepEqual(t.wrong_topics, ["a", "b"]);
});

test("normDados aceita lixo", () => {
  const d = normDados({ materias: "x", eventos: [null, 3, { title: "P1" }], erros: { q1: { a: 2, e: "1" }, q2: "x" } });
  assert.equal(d.versao, 1);
  assert.deepEqual(d.materias, []);
  assert.equal(d.eventos.length, 1);
  assert.match(d.eventos[0].id, /^[A-Za-z0-9]{20}$/);
  assert.deepEqual(d.erros, { q1: { a: 2, e: 1, prox: "" } });
  for (const c of COLECOES) assert.ok(Array.isArray(d[c]), c);
  assert.equal(typeof NORM.materias, "function");
});

test("normDados de nada", () => {
  const d = normDados(null);
  assert.equal(d.perfil.onboarding_completed, false);
  assert.deepEqual(d.cartoes, []);
});
