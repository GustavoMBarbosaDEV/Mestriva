import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const le = (f) => fs.readFileSync(path.join(raiz, f), "utf8");

function shell() {
  const sw = le("sw.js");
  const bloco = /const SHELL = \[([\s\S]*?)\];/.exec(sw);
  assert.ok(bloco, "sw.js sem SHELL");
  const V = /const V = "([0-9.]+)";/.exec(sw)[1];
  return [...bloco[1].matchAll(/"([^"]+)"/g)].map((m) => m[1].replace("${V}", V));
}

function arquivosJs(dir = "js") {
  return fs.readdirSync(path.join(raiz, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? arquivosJs(dir + "/" + e.name) : e.name.endsWith(".js") ? [dir + "/" + e.name] : []
  );
}

test("SHELL cobre todo arquivo de js/", () => {
  const itens = shell().map((s) => s.split("?")[0]);
  for (const f of arquivosJs()) assert.ok(itens.includes(f), `falta no SHELL: ${f}`);
});

test("SHELL só lista arquivos que existem", () => {
  for (const s of shell()) {
    const f = s.split("?")[0];
    if (f === "./") continue;
    assert.ok(fs.existsSync(path.join(raiz, f)), `não existe: ${f}`);
  }
});

test("versões batem", () => {
  const v = /export const VERSAO = "([0-9.]+)";/.exec(le("js/versao.js"))[1];
  assert.equal(/const V = "([0-9.]+)";/.exec(le("sw.js"))[1], v);
  const idx = le("index.html");
  const vs = [...idx.matchAll(/\?v=([0-9.]+)"/g)].map((m) => m[1]);
  assert.equal(vs.length, 4);
  for (const x of vs) assert.equal(x, v);
});

test("manifesto válido", () => {
  const m = JSON.parse(le("manifest.webmanifest"));
  assert.equal(m.start_url, "/");
  assert.equal(m.display, "standalone");
  assert.equal(m.theme_color, "#0b1220");
  const mask = m.icons.find((i) => i.purpose === "maskable" && i.sizes === "512x512");
  assert.ok(mask);
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(raiz, i.src.replace(/^\//, ""))), i.src);
  assert.ok(m.icons.some((i) => i.sizes === "192x192"));
});

test("index.html sem script inline", () => {
  const idx = le("index.html");
  // Só scripts de arquivo; o único bloco inline aceito é o JSON-LD do SEO, que é dado e não roda.
  for (const s of idx.match(/<script\b[^>]*>/gi)) assert.ok(/\ssrc=/.test(s) || s === '<script type="application/ld+json">', s);
  for (const [, json] of idx.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script[^>]*>/gi)) JSON.parse(json);
  assert.ok(!/\son[a-z]+=/i.test(idx));
  assert.match(idx, /Content-Security-Policy/);
});

test("ícones do index existem", () => {
  for (const f of ["icons/favicon.svg", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"]) {
    assert.ok(fs.existsSync(path.join(raiz, f)), f);
  }
});

test("CSP do index.html é a mesma do cabeçalho (o navegador aplica as duas)", () => {
  const fj = fs.readFileSync("firebase.json", "utf8");
  const cab = /"Content-Security-Policy",\s*"value":\s*"([^"]*)"/.exec(fj)[1];
  const meta = /<meta http-equiv="Content-Security-Policy" content="([^"]*)"/.exec(fs.readFileSync("index.html", "utf8"))[1];
  const partes = (c) => Object.fromEntries(c.split(";").map((x) => x.trim()).filter(Boolean).map((x) => [x.split(" ")[0], x]));
  const a = partes(cab);
  const b = partes(meta);
  for (const k of ["frame-ancestors", "upgrade-insecure-requests"]) delete a[k];
  assert.deepEqual(b, a);
  assert.match(a["connect-src"], /googleapis\.com/);
});
