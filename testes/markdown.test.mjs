import { test } from "node:test";
import assert from "node:assert/strict";
import { markdownParaHtml } from "../js/markdown.js";
import { CLASSE_CAMPO, campo, chips } from "../js/ui/formulario.js";

test("títulos, listas e ênfase", () => {
  const h = markdownParaHtml("# T\n\n## Sub\n\nTexto **forte** e *leve* e `cod`.\n\n- a\n- b\n\n1. um\n2. dois\n\n> cit");
  assert.ok(h.includes("<h1>T</h1>"));
  assert.ok(h.includes("<h2>Sub</h2>"));
  assert.ok(h.includes("<strong>forte</strong>"));
  assert.ok(h.includes("<em>leve</em>"));
  assert.ok(h.includes("<code>cod</code>"));
  assert.ok(/<ul>\s*<li>a<\/li>\s*<li>b<\/li>\s*<\/ul>/.test(h));
  assert.ok(/<ol>\s*<li>um<\/li>\s*<li>dois<\/li>\s*<\/ol>/.test(h));
  assert.ok(h.includes("<blockquote>cit</blockquote>"));
});

test("tabela", () => {
  const h = markdownParaHtml("| a | b |\n|---|---|\n| 1 | 2 |");
  assert.ok(h.includes("<table>") && h.includes("<th>a</th>") && h.includes("<td>2</td>"));
});

test("não deixa passar HTML nem link perigoso", () => {
  const h = markdownParaHtml('<script>alert(1)</script>\n\n[x](javascript:alert(1)) [ok](https://a.com/"onmouseover=1)');
  assert.ok(!h.includes("<script"));
  assert.ok(!h.includes('href="javascript'));
  assert.ok(h.includes('href="https://a.com/&quot;onmouseover=1"') || !h.includes("onmouseover=1\""));
  assert.ok(h.includes('rel="noopener noreferrer"'));
});

test("campo e chips", () => {
  assert.ok(CLASSE_CAMPO.includes("focus:ring-electric/10"));
  const c = campo({ rotulo: "<b>Nome", para: "n", dica: "dica", conteudo: "<input id=n>" });
  assert.ok(c.includes("&lt;b&gt;Nome") && c.includes("<input id=n>") && c.includes("dica"));
  assert.ok(campo({ rotulo: "x", erro: "Falta" }).includes("text-destructive"));
  const k = chips({ opcoes: ["A", "<i>"], valor: ["A"], multiplo: true, acao: "chip", nome: "metodos", rotulo: "Métodos" });
  assert.ok(k.includes('role="group"') && k.includes('role="checkbox"'));
  assert.ok(/aria-checked="true"[^>]*>A</.test(k));
  assert.ok(k.includes("&lt;i&gt;") && !k.includes("<i>"));
  assert.ok(chips({ opcoes: ["A"], valor: "A", acao: "c", nome: "n" }).includes('role="radio"'));
});
