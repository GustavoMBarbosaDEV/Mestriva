import { test } from "node:test";
import assert from "node:assert/strict";
import { casca } from "../js/ui/casca.js";
import * as naoEncontrada from "../js/paginas/nao-encontrada.js";
import * as provisoria from "../js/paginas/provisoria.js";

const base = { caminho: "/calendario", usuario: { nome: "<img src=x onerror=alert(1)>", email: "a@b.com" }, tema: "light", conteudo: "<p>oi</p>" };

/** Pega a tag <a ...> do menu (aside) que aponta para href. */
function linkLateral(html, href) {
  const aside = html.slice(html.indexOf("<aside"), html.indexOf("</aside>"));
  const nav = aside.slice(aside.indexOf("<nav"), aside.indexOf("</nav>"));
  const m = nav.match(new RegExp(`<a href="${href.replace("/", "\\/")}"[^>]*>`));
  return m ? m[0] : "";
}

test("marca o item ativo", () => {
  const h = casca(base);
  assert.ok(linkLateral(h, "/calendario").includes("bg-ink text-white"));
  assert.ok(!linkLateral(h, "/").includes("bg-ink text-white"));
  assert.ok(linkLateral(h, "/calendario").includes('aria-current="page"'));
});

test("/ só ativo quando exato", () => {
  assert.ok(linkLateral(casca({ ...base, caminho: "/" }), "/").includes("bg-ink text-white"));
  assert.ok(!linkLateral(casca({ ...base, caminho: "/notas" }), "/").includes("bg-ink text-white"));
});

test("escapa nome do usuário", () => {
  const h = casca(base);
  assert.ok(!h.includes("<img src=x"));
  assert.ok(h.includes("&lt;img src=x"));
  assert.ok(h.includes("a@b.com"));
});

test("nome vazio mostra Estudante", () => {
  assert.ok(casca({ ...base, usuario: { nome: "", email: "" } }).includes(">Estudante<"));
});

test("rótulo Tutor sem IA", () => {
  const h = casca(base);
  assert.ok(h.includes("Tutor</a>") || /Tutor\s*<\/a>/.test(h));
  assert.ok(!h.includes("Tutor IA"));
});

test("barra do celular tem 5 itens", () => {
  const h = casca(base);
  const inicio = h.lastIndexOf('<nav class="fixed inset-x-0 bottom-0');
  const nav = h.slice(inicio, h.indexOf("</nav>", inicio));
  const rotulos = [...nav.matchAll(/<\/span>\s*([^<]+?)\s*<\/a>/g)].map((m) => m[1]);
  assert.deepEqual(rotulos, ["Hoje", "Calendário", "Estudar", "Notas", "Tutor"]);
});

test("conteúdo dentro do main com animação", () => {
  const h = casca(base);
  assert.ok(/<main id="conteudo"[^>]*>[\s\S]*<div class="pagina-entra">\s*<p>oi<\/p>/.test(h));
});

test("404 escapa o caminho", () => {
  const h = naoEncontrada.render({ rota: { caminho: '/"><script>' } });
  assert.ok(!h.includes("<script>"));
  assert.ok(h.includes("Página não encontrada"));
});

test("provisória mostra o título da rota", () => {
  assert.ok(provisoria.render({ rota: { titulo: "Notas <b>" } }).includes("Notas &lt;b&gt;"));
});
