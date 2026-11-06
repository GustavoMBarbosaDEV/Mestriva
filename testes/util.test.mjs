import { test } from "node:test";
import assert from "node:assert/strict";
import { esc, cn, uid, iniciais } from "../js/util.js";

test("esc troca os caracteres perigosos", () => {
  assert.equal(esc('<img src=x onerror="a">&\''), "&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;");
});

test("esc de vazio e número", () => {
  assert.equal(esc(null), "");
  assert.equal(esc(undefined), "");
  assert.equal(esc(0), "0");
});

test("cn junta só o que é verdadeiro", () => {
  assert.equal(cn("a", false && "b", null, undefined, "", "c"), "a c");
});

test("uid tem 20 caracteres e não repete", () => {
  assert.match(uid(), /^[A-Za-z0-9]{20}$/);
  assert.notEqual(uid(), uid());
});

test("iniciais do nome ou do e-mail", () => {
  assert.equal(iniciais("Gustavo M Barbosa"), "GM");
  assert.equal(iniciais("", "ana.souza@x.com"), "AS");
  assert.equal(iniciais(), "M");
  assert.equal(iniciais("<b>x"), "<");
});
