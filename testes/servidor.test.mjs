import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { criaServidor } from "../ferramentas/servidor.mjs";

let raiz, servidor, base;
const INDEX = "<!doctype html><title>x</title>";

before(async () => {
  raiz = fs.mkdtempSync(path.join(os.tmpdir(), "mestriva-srv-"));
  fs.writeFileSync(path.join(raiz, "index.html"), INDEX);
  fs.writeFileSync(path.join(raiz, "a.js"), "export const a = 1;");
  fs.writeFileSync(path.join(raiz, "privacidade.html"), "<p>priv</p>");
  servidor = criaServidor(raiz);
  await new Promise((ok) => servidor.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(() => {
  servidor.close();
  fs.rmSync(raiz, { recursive: true, force: true });
});

test("serve arquivo existente com tipo certo", async () => {
  const r = await fetch(base + "/index.html");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /^text\/html/);
});

test("endereço interno cai no index.html", async () => {
  const r = await fetch(base + "/calendario");
  assert.equal(r.status, 200);
  assert.equal(await r.text(), INDEX);
});

test("arquivo com extensão inexistente dá 404", async () => {
  const r = await fetch(base + "/nada.js");
  assert.equal(r.status, 404);
});

test("não sai da raiz", async () => {
  const r = await fetch(base + "/..%2f..%2fWindows/win.ini");
  assert.notEqual(r.status, 200);
  const r2 = await fetch(base + "/%2e%2e/%2e%2e/etc/hosts.txt");
  assert.notEqual(r2.status, 200);
});

test(".js sai como text/javascript", async () => {
  const r = await fetch(base + "/a.js");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /^text\/javascript/);
});

test("endereço sem extensão serve a página .html se existir (como o cleanUrls do Hosting)", async () => {
  const r = await fetch(base + "/privacidade");
  assert.equal(await r.text(), "<p>priv</p>");
});
