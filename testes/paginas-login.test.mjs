import { test } from "node:test";
import assert from "node:assert/strict";
import { estadoLogin, desenhaLogin } from "../js/paginas/login.js";

test("entrar: Google, Microsoft, e-mail, links e testar sem conta", () => {
  const h = desenhaLogin(estadoLogin("login"));
  for (const t of ["Entrar no Mestriva", "Continuar com o Google", "Continuar com a Microsoft", "ou com e-mail", "Esqueci a senha", "Entrar sem senha, por link no e-mail", "Testar sem criar conta", 'autocomplete="current-password"', "termos de uso", "política de privacidade"]) assert.ok(h.includes(t), t);
  assert.ok(h.includes('aria-selected="true" data-acao="aba" data-valor="entrar"'));
});

test("criar conta e as outras telas", () => {
  const c = desenhaLogin(estadoLogin("register"));
  assert.ok(c.includes("Criar sua conta") && c.includes('autocomplete="new-password"') && c.includes("Pelo menos 8 caracteres") && !c.includes("Esqueci a senha"));
  const e = desenhaLogin(estadoLogin("forgot-password"));
  assert.ok(e.includes("Esqueci a senha") && e.includes("Mandar o link de nova senha") && !e.includes("Continuar com o Google") && !e.includes('type="password"'));
  assert.ok(desenhaLogin(estadoLogin("reset-password")).includes("Mandar o link de nova senha"));
  const l = desenhaLogin({ ...estadoLogin("login"), modo: "link" });
  assert.ok(l.includes("Entrar sem senha") && l.includes("Mandar o link"));
  assert.ok(desenhaLogin(estadoLogin("login", { linkPendente: true })).includes("Confirme seu e-mail"));
});

test("erro, sucesso, carregando e escape", () => {
  const e = { ...estadoLogin("login"), email: '"><b>x', erro: "E-mail ou senha incorretos.", ocupado: "google" };
  const h = desenhaLogin(e);
  assert.ok(h.includes('role="alert"') && h.includes("incorretos") && h.includes("animate-spin") && h.includes(" disabled"));
  assert.ok(!h.includes('"><b>x') && h.includes("&lt;b&gt;x"));
  assert.ok(desenhaLogin({ ...estadoLogin("login"), modo: "link", ok: "Enviamos um link" }).includes('role="status"'));
  assert.ok(desenhaLogin({ ...estadoLogin("login"), ver: true }).includes('type="text"'));
});

test("aviso para quem abriu dentro do Instagram", () => {
  assert.ok(desenhaLogin(estadoLogin("login"), { ua: "Instagram 300" }).includes("Abrir no navegador"));
  assert.ok(!desenhaLogin(estadoLogin("login"), { ua: "Chrome/130" }).includes("Abrir no navegador"));
});
