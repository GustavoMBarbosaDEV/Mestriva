import { test } from "node:test";
import assert from "node:assert/strict";
import { criaLoja } from "../js/loja.js";

const CHAVE = "mestriva.dados.v1";

function armazenamentoFalso(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    m,
  };
}

test("começa vazia e grava", () => {
  const a = armazenamentoFalso();
  const loja = criaLoja({ armazenamento: a });
  assert.deepEqual(loja.lista("materias"), []);
  const m = loja.salva("materias", { name: "Cálculo I" });
  assert.equal(loja.lista("materias")[0].name, "Cálculo I");
  assert.ok(m.id && m.criado_em && m.atualizado_em);
  const gravado = JSON.parse(a.getItem(CHAVE));
  assert.equal(gravado.versao, 1);
  assert.equal(gravado.materias[0].name, "Cálculo I");
  assert.equal(loja.persistente, true);
  assert.equal(loja.aviso, null);
});

test("salva com mesmo id substitui", () => {
  const loja = criaLoja({ armazenamento: armazenamentoFalso() });
  const m = loja.salva("materias", { name: "A" });
  loja.salva("materias", { ...m, name: "B" });
  assert.equal(loja.lista("materias").length, 1);
  assert.equal(loja.pega("materias", m.id).name, "B");
  assert.equal(loja.pega("materias", m.id).criado_em, m.criado_em);
});

test("lista em ordem do mais novo", () => {
  const loja = criaLoja({ armazenamento: armazenamentoFalso() });
  loja.salva("notas", { activity: "velha", criado_em: "2026-01-01T00:00:00.000Z" });
  loja.salva("notas", { activity: "nova", criado_em: "2026-06-01T00:00:00.000Z" });
  assert.deepEqual(loja.lista("notas").map((n) => n.activity), ["nova", "velha"]);
});

test("apaga", () => {
  const loja = criaLoja({ armazenamento: armazenamentoFalso() });
  const m = loja.salva("eventos", { title: "P1" });
  assert.equal(loja.apaga("eventos", m.id), true);
  assert.equal(loja.apaga("eventos", m.id), false);
  assert.equal(loja.pega("eventos", m.id), null);
});

test("perfil parcial", () => {
  const a = armazenamentoFalso();
  const loja = criaLoja({ armazenamento: a });
  loja.salvaPerfil({ course: "Direito" });
  loja.salvaPerfil({ display_name: "Ana" });
  assert.equal(loja.perfil().course, "Direito");
  assert.equal(loja.perfil().display_name, "Ana");
  assert.equal(criaLoja({ armazenamento: a }).perfil().display_name, "Ana");
});

test("dados() é uma cópia", () => {
  const loja = criaLoja({ armazenamento: armazenamentoFalso() });
  loja.dados().materias.push({ id: "x" });
  assert.deepEqual(loja.lista("materias"), []);
});

test("assina avisa a cada gravação e desassina", () => {
  const loja = criaLoja({ armazenamento: armazenamentoFalso() });
  let n = 0;
  const sai = loja.assina(() => n++);
  loja.salva("materias", { name: "A" });
  loja.salvaPerfil({ course: "X" });
  sai();
  loja.salva("materias", { name: "B" });
  assert.equal(n, 2);
});

test("JSON corrompido abre vazio e guarda cópia", () => {
  const a = armazenamentoFalso({ [CHAVE]: "{oi" });
  const loja = criaLoja({ armazenamento: a });
  assert.deepEqual(loja.lista("materias"), []);
  assert.equal(a.getItem(CHAVE + ".corrompido"), "{oi");
});

test("formato antigo é aproveitado", () => {
  const a = armazenamentoFalso({ [CHAVE]: JSON.stringify({ perfil: { course: "Direito" }, materias: [{ name: "X", status: "qualquer" }] }) });
  const loja = criaLoja({ armazenamento: a });
  assert.equal(loja.perfil().course, "Direito");
  assert.equal(loja.lista("materias")[0].status, "cursando");
});

test("armazenamento que lança funciona em memória", () => {
  const a = { getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); }, removeItem: () => {} };
  const loja = criaLoja({ armazenamento: a });
  assert.doesNotThrow(() => loja.salva("materias", { name: "A" }));
  assert.equal(loja.lista("materias").length, 1);
  assert.equal(loja.persistente, false);
  assert.match(loja.aviso, /Não deu para salvar neste aparelho/);
});

test("leitura que lança funciona em memória", () => {
  const a = { getItem: () => { throw new Error("SecurityError"); }, setItem: () => {}, removeItem: () => {} };
  const loja = criaLoja({ armazenamento: a });
  assert.deepEqual(loja.lista("materias"), []);
});

test("sem armazenamento (null) funciona em memória", () => {
  const loja = criaLoja({ armazenamento: null });
  loja.salva("materias", { name: "A" });
  assert.equal(loja.lista("materias").length, 1);
  assert.equal(loja.persistente, false);
});

test("coleção desconhecida lança", () => {
  const loja = criaLoja({ armazenamento: armazenamentoFalso() });
  assert.throws(() => loja.lista("nada"), /coleção desconhecida/);
  assert.throws(() => loja.salva("nada", {}), /coleção desconhecida/);
});

test("substitui tudo (restaurar backup) e limpa (apagar dados)", () => {
  const a = armazenamentoFalso();
  const loja = criaLoja({ armazenamento: a });
  loja.salva("materias", { name: "Velha" });
  let avisos = 0;
  loja.assina(() => avisos++);
  loja.substitui({ perfil: { course: "Direito" }, materias: [{ name: "Nova" }] });
  assert.deepEqual(loja.lista("materias").map((m) => m.name), ["Nova"]);
  assert.equal(criaLoja({ armazenamento: a }).perfil().course, "Direito");
  loja.limpa();
  assert.deepEqual(loja.lista("materias"), []);
  assert.equal(loja.perfil().onboarding_completed, false);
  assert.equal(a.getItem(CHAVE), null);
  assert.equal(avisos, 2);
});
