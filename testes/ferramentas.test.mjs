import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const bump = path.join(raiz, "ferramentas", "bump.mjs");

function copia(indexSemPre = false) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "mestriva-bump-"));
  fs.mkdirSync(path.join(d, "js"));
  fs.writeFileSync(path.join(d, "js", "versao.js"), 'export const VERSAO = "0.1.0";\n');
  fs.writeFileSync(path.join(d, "sw.js"), 'const V = "0.1.0";\n');
  const linhas = [
    indexSemPre ? '<script src="/pre.js"></script>' : '<script src="/pre.js?v=0.1.0"></script>',
    '<link rel="stylesheet" href="/boot.css?v=0.1.0" />',
    '<link rel="stylesheet" href="/style.css?v=0.1.0" />',
    '<script type="module" src="/js/app.js?v=0.1.0"></script>',
  ];
  fs.writeFileSync(path.join(d, "index.html"), linhas.join("\n"));
  return d;
}
const roda = (d, v) => spawnSync(process.execPath, [bump, v], { env: { ...process.env, MESTRIVA_RAIZ: d }, encoding: "utf8" });

test("bump troca as três", () => {
  const d = copia();
  const r = roda(d, "0.2.0");
  assert.equal(r.status, 0, r.stderr);
  assert.match(fs.readFileSync(path.join(d, "js", "versao.js"), "utf8"), /VERSAO = "0\.2\.0"/);
  assert.match(fs.readFileSync(path.join(d, "sw.js"), "utf8"), /V = "0\.2\.0"/);
  const idx = fs.readFileSync(path.join(d, "index.html"), "utf8");
  assert.equal((idx.match(/\?v=0\.2\.0"/g) || []).length, 4);
  assert.ok(!idx.includes("0.1.0"));
});

test("bump não grava se faltar ocorrência", () => {
  const d = copia(true);
  const antes = fs.readFileSync(path.join(d, "js", "versao.js"), "utf8");
  const r = roda(d, "0.2.0");
  assert.equal(r.status, 1);
  assert.equal(fs.readFileSync(path.join(d, "js", "versao.js"), "utf8"), antes);
});

test("bump recusa versão mal escrita", () => {
  assert.equal(roda(copia(), "1.2").status, 1);
});
