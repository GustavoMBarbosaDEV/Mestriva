// Regras do Firestore no emulador: cada estudante só mexe no que é seu, com os campos que o app grava.
import { test, before, after, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { NORM, COLECOES, normPerfil } from "../js/normaliza.js";

const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
let env;
const como = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
const semRegras = (fn) => env.withSecurityRulesDisabled((ctx) => fn(ctx.firestore()));
const agora = "2026-11-09T12:00:00.000Z";
/** Documento como o app grava (sem o id, que é o nome do documento). */
const documento = (col, extra = {}) => {
  const { id: _id, ...d } = NORM[col]({ criado_em: agora, atualizado_em: agora, questions: [{ question: "2+2?", options: ["3", "4"], answer_index: 1 }], wrong_topics: ["Limites"], ...extra });
  return d;
};

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-mestriva",
    firestore: { host, port: Number(port), rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8") },
  });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

test("o dono grava, lê e apaga cada coleção do app", async () => {
  const db = como("ana");
  for (const col of COLECOES) {
    const ref = doc(db, "users", "ana", col, "item_1");
    await assertSucceeds(setDoc(ref, documento(col)));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(getDocs(collection(db, "users", "ana", col)));
    await assertSucceeds(deleteDoc(ref));
  }
  await assertSucceeds(setDoc(doc(db, "users", "ana", "meta", "perfil"), normPerfil({ display_name: "Ana", onboarding_completed: true, termos: { v: "1.0", em: agora } })));
  await assertSucceeds(setDoc(doc(db, "users", "ana", "meta", "erros"), { erros: { "calculo-1-1": { a: 1, e: 0, prox: agora } } }));
  await assertSucceeds(getDocs(collection(db, "users", "ana", "meta")));
});

test("ninguém lê nem grava os dados de outra pessoa", async () => {
  await semRegras((db) => setDoc(doc(db, "users", "ana", "notas", "n1"), documento("notas", { value: 8 })));
  for (const quem of ["bia", null]) {
    const db = como(quem);
    await assertFails(getDoc(doc(db, "users", "ana", "notas", "n1")));
    await assertFails(getDocs(collection(db, "users", "ana", "notas")));
    await assertFails(setDoc(doc(db, "users", "ana", "notas", "n2"), documento("notas")));
    await assertFails(deleteDoc(doc(db, "users", "ana", "notas", "n1")));
    await assertFails(getDoc(doc(db, "users", "ana", "meta", "perfil")));
  }
});

test("campos a mais, tipos errados e textos grandes demais são recusados", async () => {
  const db = como("ana");
  const ref = doc(db, "users", "ana", "materias", "m1");
  await assertFails(setDoc(ref, { ...documento("materias"), admin: true }));
  await assertFails(setDoc(ref, { ...documento("materias"), order: "1" }));
  await assertFails(setDoc(ref, { ...documento("materias"), name: "x".repeat(121) }));
  await assertFails(setDoc(doc(db, "users", "ana", "materiais", "a1"), { ...documento("materiais"), content: "x".repeat(60001) }));
  await assertFails(setDoc(doc(db, "users", "ana", "eventos", "e1"), { ...documento("eventos"), done: "sim" }));
  await assertFails(setDoc(doc(db, "users", "ana", "meta", "perfil"), { ...normPerfil({}), plano: "pro" }));
  await assertFails(setDoc(doc(db, "users", "ana", "meta", "erros"), { erros: "x" }));
});

test("coleções e documentos fora do combinado ficam fechados", async () => {
  const db = como("ana");
  await assertFails(setDoc(doc(db, "users", "ana", "senhas", "s1"), { a: 1 }));
  await assertFails(setDoc(doc(db, "users", "ana", "meta", "outro"), { a: 1 }));
  await assertFails(setDoc(doc(db, "users", "ana"), { nome: "Ana" }));
  await assertFails(setDoc(doc(db, "publico", "x"), { a: 1 }));
  await assertFails(setDoc(doc(db, "users", "ana", "materias", "id com espaço"), documento("materias")));
});
