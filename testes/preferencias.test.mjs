import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { PADRAO_A11Y, CHAVE_TEMA, CHAVE_A11Y, lePrefs, gravaPrefs, aplicaPrefs } from "../js/preferencias.js";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function armazenamento(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
}

function raizFalsa() {
  const classes = new Set();
  return {
    classList: { toggle: (c, ligado) => (ligado ? classes.add(c) : classes.delete(c)), contains: (c) => classes.has(c) },
    style: {},
    classes,
  };
}

test("padrões quando vazio", () => {
  const p = lePrefs(armazenamento());
  assert.equal(p.tema, "light");
  assert.deepEqual(p.a11y, PADRAO_A11Y);
  assert.deepEqual(PADRAO_A11Y, { textScale: 100, highContrast: false, dyslexia: false, reduceMotion: false, spacious: false, colorVision: "none" });
});

test("lê chaves", () => {
  assert.equal(CHAVE_TEMA, "mestriva.theme");
  assert.equal(CHAVE_A11Y, "mestriva.accessibility");
  const p = lePrefs(armazenamento({ [CHAVE_TEMA]: "dark", [CHAVE_A11Y]: '{"dyslexia":true,"textScale":200,"colorVision":"x","lixo":1}' }));
  assert.equal(p.tema, "dark");
  assert.equal(p.a11y.dyslexia, true);
  assert.equal(p.a11y.textScale, 145);
  assert.equal(p.a11y.colorVision, "none");
  assert.ok(!("lixo" in p.a11y));
});

test("JSON ruim cai no padrão", () => {
  assert.deepEqual(lePrefs(armazenamento({ [CHAVE_A11Y]: "{x" })).a11y, PADRAO_A11Y);
  assert.deepEqual(lePrefs({ getItem: () => { throw new Error("x"); } }).a11y, PADRAO_A11Y);
});

test("grava e relê", () => {
  const a = armazenamento();
  gravaPrefs({ tema: "dark", a11y: { ...PADRAO_A11Y, spacious: true } }, a);
  assert.equal(lePrefs(a).tema, "dark");
  assert.equal(lePrefs(a).a11y.spacious, true);
  assert.doesNotThrow(() => gravaPrefs({ tema: "dark", a11y: PADRAO_A11Y }, { setItem: () => { throw new Error("x"); } }));
});

test("aplica classes", () => {
  const r = raizFalsa();
  r.classes.add("cvd-protanopia");
  aplicaPrefs({ tema: "dark", a11y: { ...PADRAO_A11Y, colorVision: "tritanopia", reduceMotion: true } }, r);
  assert.ok(r.classes.has("dark"));
  assert.ok(r.classes.has("cvd-tritanopia"));
  assert.ok(r.classes.has("a11y-motion"));
  assert.ok(!r.classes.has("cvd-protanopia"));
  assert.ok(!r.classes.has("a11y-contrast"));
  assert.equal(r.style.fontSize, "100%");
  assert.equal(r.style.colorScheme, "dark");
});

test("pre.js e preferencias.js concordam", () => {
  const dados = { [CHAVE_TEMA]: "dark", [CHAVE_A11Y]: '{"highContrast":true,"textScale":120,"colorVision":"deuteranopia","spacious":true}' };
  const esperado = raizFalsa();
  aplicaPrefs(lePrefs(armazenamento(dados)), esperado);
  const obtido = raizFalsa();
  vm.runInNewContext(fs.readFileSync(path.join(raiz, "pre.js"), "utf8"), {
    document: { documentElement: obtido },
    localStorage: armazenamento(dados),
  });
  assert.deepEqual([...obtido.classes].sort(), [...esperado.classes].sort());
  assert.equal(obtido.style.fontSize, esperado.style.fontSize);
  assert.equal(obtido.style.colorScheme, esperado.style.colorScheme);
});

test("textScale nulo ou vazio vira 100", () => {
  assert.equal(lePrefs(armazenamento({ [CHAVE_A11Y]: '{"textScale":null}' })).a11y.textScale, 100);
  assert.equal(lePrefs(armazenamento({ [CHAVE_A11Y]: '{"textScale":""}' })).a11y.textScale, 100);
});
