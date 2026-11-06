import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { versaoDoSw, ouveTrocaDeControle, primeiroVisivel } from "../js/atualizacao.js";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(raiz, "ferramentas", "package.json"));

test("versão lida do sw.js minificado (como o build publica)", async () => {
  const { transform } = require("esbuild");
  const fonte = fs.readFileSync(path.join(raiz, "sw.js"), "utf8");
  const { code } = await transform(fonte, { loader: "js", minify: true, target: "es2020" });
  const v = /const V = "([0-9.]+)";/.exec(fonte)[1];
  assert.equal(versaoDoSw(code), v);
  assert.equal(versaoDoSw(fonte), v);
  assert.equal(versaoDoSw("nada"), "");
});

function swFalso(controller) {
  const ouvintes = [];
  return { controller, addEventListener: (_t, fn) => ouvintes.push(fn), dispara: () => ouvintes.forEach((f) => f()) };
}

test("primeira visita (sem controle) não recarrega", () => {
  const sw = swFalso(null);
  let recargas = 0;
  ouveTrocaDeControle(sw, () => recargas++);
  sw.controller = {};
  sw.dispara();
  assert.equal(recargas, 0);
});

test("troca de versão (já tinha controle) recarrega uma vez", () => {
  const sw = swFalso({});
  let recargas = 0;
  ouveTrocaDeControle(sw, () => recargas++);
  sw.dispara();
  sw.dispara();
  assert.equal(recargas, 1);
});

test("foco vai para o primeiro elemento visível", () => {
  const escondido = { id: "a", getClientRects: () => [] };
  const visivel = { id: "b", getClientRects: () => [{}] };
  assert.equal(primeiroVisivel([escondido, visivel]).id, "b");
  assert.equal(primeiroVisivel([escondido]), null);
  assert.equal(primeiroVisivel([]), null);
});
