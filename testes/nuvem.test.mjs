import { test } from "node:test";
import assert from "node:assert/strict";
import { configOk, emailOk, senhaBoa, senhaObvia, traduzErro, navegadorDeApp, resumoUsuario, FB_V } from "../js/nuvem.js";
import fs from "node:fs";

test("configuração: só liga a conta com a chave preenchida", () => {
  assert.equal(configOk(null), false);
  assert.equal(configOk({ apiKey: "COLE_AQUI", projectId: "x" }), false);
  assert.equal(configOk({ apiKey: "AIzaSyExemplo", projectId: "" }), false);
  assert.equal(configOk({ apiKey: "AIzaSyExemplo", projectId: "mestriva-9f87f" }), true);
});

test("e-mail e senha", () => {
  assert.equal(emailOk("ana@escola.edu.br"), true);
  assert.equal(emailOk("ana@escola"), false);
  assert.equal(emailOk("a na@x.com"), false);
  assert.equal(senhaBoa("abc12345"), true);
  assert.equal(senhaBoa("abcdefgh"), false, "precisa de número");
  assert.equal(senhaBoa("1234567"), false);
});

test("senha óbvia é recusada", () => {
  for (const s of ["senha123", "Senha@123", "12345678abc", "qwerty123", "aaaaaa11", "mestriva123"]) assert.equal(senhaObvia(s, "x@y.com"), true, s);
  assert.equal(senhaObvia("joaosilva22", "joaosilva@gmail.com"), true, "o próprio e-mail");
  assert.equal(senhaObvia("Girassol7Lua", "ana@x.com"), false);
});

test("erros do Firebase em português", () => {
  assert.equal(traduzErro({ code: "auth/popup-closed-by-user" }), "", "a pessoa fechou: nada a dizer");
  assert.match(traduzErro({ code: "auth/invalid-credential" }), /incorretos/);
  assert.match(traduzErro({ code: "auth/email-already-in-use" }), /já tem conta no Mestriva/);
  assert.match(traduzErro({ code: "auth/too-many-requests" }), /Muitas tentativas/);
  assert.match(traduzErro({ code: "auth/network-request-failed" }), /internet/);
  assert.match(traduzErro({ code: "auth/api-key-not-valid.-please-pass-a-valid-api-key." }), /sendo configurado/);
  assert.match(traduzErro({ code: "auth/estranho" }), /auth\/estranho/);
  assert.ok(!/Monetra/.test(traduzErro({ code: "auth/unauthorized-domain" })));
});

test("navegador dentro de outro app", () => {
  assert.equal(navegadorDeApp("Mozilla/5.0 ... Instagram 300.0"), true);
  assert.equal(navegadorDeApp("Mozilla/5.0 ... [FBAN/FBIOS;FBAV/400]"), true);
  assert.equal(navegadorDeApp("Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile Safari/537.36"), false);
});

test("resumo do usuário", () => {
  assert.equal(resumoUsuario(null), null);
  const r = resumoUsuario({ uid: "u", isAnonymous: false, email: "a@b.com", emailVerified: false, displayName: "Ana", providerData: [{ providerId: "password" }] });
  assert.equal(r.precisaConfirmar, true);
  assert.deepEqual(r.provedores, ["password"]);
  const g = resumoUsuario({ uid: "u", email: "a@b.com", emailVerified: true, providerData: [{ providerId: "google.com" }] });
  assert.equal(g.precisaConfirmar, false);
  assert.equal(resumoUsuario({ uid: "t", isAnonymous: true, providerData: [] }).anonimo, true);
});

test("a versão do SDK bate com a pasta vendor e com o package.json", () => {
  assert.ok(fs.existsSync(`vendor/firebase-${FB_V}/firebase-auth.js`));
  assert.ok(fs.existsSync(`vendor/firebase-${FB_V}/firebase-firestore.js`));
  const pkg = JSON.parse(fs.readFileSync("ferramentas/package.json", "utf8"));
  assert.equal(pkg.dependencies?.firebase || pkg.devDependencies?.firebase, FB_V);
});
