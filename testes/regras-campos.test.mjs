// As regras do Firestore precisam aceitar tudo o que o app grava (js/normaliza.js) e nada além.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { NORM, COLECOES, normPerfil } from "../js/normaliza.js";

const regras = fs.readFileSync("firestore.rules", "utf8");
const FUNCAO = { materias: "materia", eventos: "evento", notas: "nota", sessoes: "sessao", quizzes: "quiz", tentativas: "tentativa", materiais: "material", cartoes: "cartao" };

/** Corpo da função das regras, as chaves do hasOnly e os limites de texto. */
function daRegra(nome) {
  const ini = regras.indexOf(`function ${nome}(d) {`);
  assert.ok(ini >= 0, "sem função " + nome);
  const corpo = regras.slice(ini, regras.indexOf("\n    }", ini));
  const chaves = /hasOnly\(\[([^\]]*)\]\)/.exec(corpo)[1].match(/'([^']+)'/g).map((x) => x.slice(1, -1));
  const limites = Object.fromEntries([...corpo.matchAll(/texto\(d, '([^']+)', (\d+)\)/g)].map((m) => [m[1], Number(m[2])]));
  if (corpo.includes("datas(d)")) Object.assign(limites, { criado_em: 40, atualizado_em: 40 });
  return { chaves, limites };
}

test("cada coleção do app tem regra, com os mesmos campos", () => {
  for (const col of COLECOES) {
    assert.ok(FUNCAO[col], "coleção sem regra: " + col);
    assert.ok(regras.includes(`col == '${col}' && ${FUNCAO[col]}(d)`), "coleção fora de valido(): " + col);
    const { id: _id, ...doc } = NORM[col]({});
    assert.deepEqual(daRegra(FUNCAO[col]).chaves.sort(), Object.keys(doc).sort(), col);
  }
  assert.deepEqual(daRegra("perfil").chaves.sort(), Object.keys(normPerfil({})).sort());
});

test("os limites de texto das regras cabem o que o app grava", () => {
  const enorme = "x".repeat(100000);
  for (const col of COLECOES) {
    const { limites } = daRegra(FUNCAO[col]);
    for (const [k, max] of Object.entries(limites)) {
      if (k === "criado_em" || k === "atualizado_em" || k === "date") continue;
      const v = NORM[col]({ [k]: enorme })[k];
      assert.ok(typeof v === "string" && v.length <= max, `${col}.${k}: app grava ${v.length}, regra aceita ${max}`);
    }
  }
  const { limites } = daRegra("perfil");
  for (const [k, max] of Object.entries(limites)) assert.ok(String(normPerfil({ [k]: enorme })[k]).length <= max, "perfil." + k);
});

test("só o dono lê e grava, e o resto fica fechado", () => {
  assert.match(regras, /function dono\(uid\) \{ return request\.auth != null && request\.auth\.uid == uid; \}/);
  assert.equal((regras.match(/allow /g) || []).length, 4);
  assert.ok(!/allow (read|write)[^;]*: if true/.test(regras));
});
