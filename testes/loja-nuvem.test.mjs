import { test } from "node:test";
import assert from "node:assert/strict";
import { criaLojaNuvem, juntaDados, temDados, paraDocumento } from "../js/loja-nuvem.js";
import { normDados } from "../js/normaliza.js";

/** Firestore de mentira, em memória, com as funções que a loja usa. */
function firestoreFalso() {
  const docs = new Map(); // "users/u/col/id" -> dados
  const ouvintes = new Set();
  let falhar = false;
  const caminho = (...p) => p.slice(1).join("/");
  const dispara = () => {
    for (const o of ouvintes) o();
  };
  const F = {
    doc: (...p) => ({ caminho: caminho(...p) }),
    collection: (...p) => ({ caminho: caminho(...p) }),
    setDoc: async (ref, dados) => {
      if (falhar) throw Object.assign(new Error("x"), { code: "unavailable" });
      docs.set(ref.caminho, JSON.parse(JSON.stringify(dados)));
      dispara();
    },
    deleteDoc: async (ref) => {
      docs.delete(ref.caminho);
      dispara();
    },
    writeBatch: () => {
      const ops = [];
      return {
        set: (ref, dados) => ops.push(() => docs.set(ref.caminho, JSON.parse(JSON.stringify(dados)))),
        delete: (ref) => ops.push(() => docs.delete(ref.caminho)),
        commit: async () => {
          ops.forEach((f) => f());
          dispara();
        },
      };
    },
    onSnapshot: (col, ok) => {
      const manda = () => {
        const prefixo = col.caminho + "/";
        const lista = [...docs.entries()]
          .filter(([k]) => k.startsWith(prefixo) && !k.slice(prefixo.length).includes("/"))
          .map(([k, v]) => ({ id: k.slice(prefixo.length), data: () => JSON.parse(JSON.stringify(v)) }));
        ok({ docs: lista });
      };
      ouvintes.add(manda);
      queueMicrotask(manda);
      return () => ouvintes.delete(manda);
    },
  };
  return { F, docs, falha: (v) => (falhar = v) };
}

test("salva, lê, apaga e guarda cada item no seu documento", async () => {
  const { F, docs } = firestoreFalso();
  const loja = await criaLojaNuvem({ F, db: {}, uid: "u1" }).carrega();
  const m = loja.salva("materias", { name: "Cálculo I" });
  assert.equal(loja.lista("materias").length, 1);
  await new Promise((r) => setTimeout(r));
  const doc = docs.get(`users/u1/materias/${m.id}`);
  assert.equal(doc.name, "Cálculo I");
  assert.equal(doc.id, undefined, "o id é o nome do documento, não um campo");
  loja.salvaPerfil({ display_name: "Ana", onboarding_completed: true });
  loja.salvaErros({ "calculo-1-1": { a: 1, e: 0, prox: "2026-11-10" } });
  await new Promise((r) => setTimeout(r));
  assert.equal(docs.get("users/u1/meta/perfil").display_name, "Ana");
  assert.ok(docs.get("users/u1/meta/erros").erros["calculo-1-1"]);
  assert.equal(loja.apaga("materias", m.id), true);
  await new Promise((r) => setTimeout(r));
  assert.equal(docs.has(`users/u1/materias/${m.id}`), false);
  assert.throws(() => loja.lista("senhas"));
});

test("outro aparelho vê a mudança, e cada conta só vê o que é dela", async () => {
  const { F } = firestoreFalso();
  const celular = await criaLojaNuvem({ F, db: {}, uid: "u1" }).carrega();
  const pc = await criaLojaNuvem({ F, db: {}, uid: "u1" }).carrega();
  const outra = await criaLojaNuvem({ F, db: {}, uid: "u2" }).carrega();
  let avisos = 0;
  pc.assina(() => (avisos += 1));
  celular.salva("eventos", { title: "Prova de Física", type: "prova", date: "2026-12-01T10:00" });
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(pc.lista("eventos")[0].title, "Prova de Física");
  assert.ok(avisos > 0);
  assert.equal(outra.lista("eventos").length, 0);
  celular.para();
});

test("falha ao gravar deixa um aviso, sem perder o que está na tela", async () => {
  const { F, falha } = firestoreFalso();
  const loja = await criaLojaNuvem({ F, db: {}, uid: "u1" }).carrega();
  falha(true);
  loja.salva("notas", { subject: "Física", activity: "P1", value: 7, max_value: 10 });
  await new Promise((r) => setTimeout(r, 5));
  assert.match(loja.aviso, /internet/);
  assert.equal(loja.lista("notas").length, 1);
});

test("gravaTudo troca o conteúdo da conta (restaurar backup) e limpa apaga", async () => {
  const { F, docs } = firestoreFalso();
  const loja = await criaLojaNuvem({ F, db: {}, uid: "u1" }).carrega();
  loja.salva("materias", { id: "velha", name: "Velha" });
  await new Promise((r) => setTimeout(r));
  await loja.gravaTudo({ perfil: { display_name: "Bia", onboarding_completed: true }, materias: [{ id: "nova", name: "Nova" }] });
  assert.equal(docs.has("users/u1/materias/velha"), false);
  assert.equal(docs.get("users/u1/materias/nova").name, "Nova");
  assert.equal(loja.perfil().display_name, "Bia");
  loja.limpa();
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(docs.has("users/u1/materias/nova"), false);
  assert.equal(loja.perfil().onboarding_completed, false);
});

test("juntaDados mantém o que está na conta e traz o que falta do aparelho", () => {
  const conta = { perfil: { display_name: "Conta", onboarding_completed: true }, materias: [{ id: "a", name: "A conta", atualizado_em: "2026-11-01T00:00:00.000Z" }] };
  const aparelho = {
    perfil: { display_name: "Aparelho", onboarding_completed: true },
    materias: [{ id: "a", name: "A aparelho", atualizado_em: "2026-11-05T00:00:00.000Z" }, { id: "b", name: "B" }],
    erros: { q1: { a: 1, e: 1, prox: "2026-11-09" } },
  };
  const j = juntaDados(conta, aparelho);
  assert.equal(j.perfil.display_name, "Conta");
  assert.deepEqual(j.materias.map((m) => m.name).sort(), ["A aparelho", "B"]);
  assert.ok(j.erros.q1);
  assert.equal(juntaDados({}, aparelho).perfil.display_name, "Aparelho", "conta vazia fica com o perfil do aparelho");
});

test("temDados e paraDocumento", () => {
  assert.equal(temDados(null), false);
  assert.equal(temDados({ cartoes: [{ frente: "a", verso: "b" }] }), true);
  assert.equal(temDados({ perfil: { onboarding_completed: true } }), true);
  assert.deepEqual(paraDocumento({ id: "x", a: 1, b: undefined }), { a: 1 });
  assert.equal(normDados(null).versao, 1);
});

test("só avisa de fora quando outro aparelho muda algo, e apagaTudo limpa a conta", async () => {
  const { F, docs } = firestoreFalso();
  const a = await criaLojaNuvem({ F, db: {}, uid: "u1" }).carrega();
  const b = await criaLojaNuvem({ F, db: {}, uid: "u1" }).carrega();
  let foraA = 0;
  let foraB = 0;
  a.assinaFora(() => (foraA += 1));
  b.assinaFora(() => (foraB += 1));
  a.salva("cartoes", { subject: "Bio", tipo: "conceito", frente: "Célula", verso: "Unidade da vida" });
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(foraA, 0, "o eco da própria gravação não conta");
  assert.ok(foraB > 0);
  b.salvaPerfil({ display_name: "Caio", onboarding_completed: true });
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(a.perfil().display_name, "Caio");
  await a.apagaTudo();
  assert.equal([...docs.keys()].filter((k) => k.startsWith("users/u1/")).length, 0);
  b.para();
});
