import { test } from "node:test";
import assert from "node:assert/strict";
import { vazio } from "../js/ui/vazio.js";
import { desenha, materiasDoTexto } from "../js/paginas/grade.js";
import { formDaMateria, validaMateria, materiaDoForm, corpoMateria } from "../js/ui/dialogo-materia.js";

test("estado vazio", () => {
  const h = desenha([]);
  assert.ok(h.includes("Sua grade ainda está vazia") && h.includes("Carregar grade curricular") && h.includes("Adicionar matéria"));
  assert.ok(vazio({ icone: "GraduationCap", titulo: "<t>", descricao: "d", acao: "<b>a</b>" }).includes("&lt;t&gt;"));
});

test("grade agrupada, escape e situação", () => {
  const h = desenha([
    { id: "1", name: "<Cálculo>", period: "1º", status: "cursando", professor: "", topics: "limites", order: 0 },
    { id: "2", name: "Física", period: "", status: "concluida", professor: "Ana", topics: "", order: 0 },
  ]);
  assert.ok(h.includes("1º período") && h.includes("Sem período"));
  assert.ok(h.includes("&lt;Cálculo&gt;") && !h.includes("<Cálculo>"));
  assert.ok(h.includes("Professor não informado") && h.includes("Ana"));
  assert.ok(h.includes("concluída") && h.includes("cursando"));
  assert.ok(h.includes('aria-label="Editar &lt;Cálculo&gt;"'));
  assert.ok(!/\bIA\b/.test(h));
});

test("importar texto", () => {
  const r = materiasDoTexto("1º - Cálculo\nFísica", "3º");
  assert.deepEqual(r, [
    { name: "Cálculo", period: "1º", status: "cursando", order: 1 },
    { name: "Física", period: "3º", status: "cursando", order: 2 },
  ]);
});

test("formulário da matéria", () => {
  const f = formDaMateria(null, "2º");
  assert.deepEqual(f, { name: "", period: "2º", professor: "", topics: "", status: "cursando", erro: "" });
  assert.match(validaMateria(f), /Informe o nome/);
  assert.deepEqual(materiaDoForm({ ...f, name: " A ", professor: " P " }), { name: "A", period: "2º", professor: "P", topics: "", status: "cursando" });
  const h = corpoMateria({ ...f, name: '"><x>' }, true);
  assert.ok(!h.includes("<x>") && h.includes("Excluir") && h.includes("2º período"));
});

test("ligar a um conteúdo do Mestriva", async () => {
  const { bancoDaMateria, filtraBanco, SEM_BANCO } = await import("../js/conteudo.js");
  const { corpoLigar, pedidoDeMateria } = await import("../js/ui/dialogo-materia.js");
  const indice = {
    materias: [
      { id: "anatomia-humana", nome: "Anatomia Humana", area: "Saúde", apelidos: ["Anatomia Geral"], topicos: [{}, {}] },
      { id: "calculo-1", nome: "Cálculo I", area: "Exatas", apelidos: [], topicos: [] },
    ],
  };
  // Sem escolha: acha pelo nome. Escolha manual vence. "nenhum" desliga. Id que sumiu do banco volta ao automático.
  assert.equal(bancoDaMateria({ name: "Anatomia" }, indice), "anatomia-humana");
  assert.equal(bancoDaMateria({ name: "Morfologia", banco: "anatomia-humana" }, indice), "anatomia-humana");
  assert.equal(bancoDaMateria({ name: "Anatomia", banco: SEM_BANCO }, indice), null);
  assert.equal(bancoDaMateria({ name: "Cálculo I", banco: "sumiu" }, indice), "calculo-1");

  assert.deepEqual(filtraBanco(indice, "").map((m) => m.id), ["calculo-1", "anatomia-humana"]);
  assert.deepEqual(filtraBanco(indice, "saude").map((m) => m.id), ["anatomia-humana"]);
  assert.deepEqual(filtraBanco(indice, "geral").map((m) => m.id), ["anatomia-humana"]);
  assert.deepEqual(filtraBanco(indice, "xyz"), []);

  // Cartão: ligado mostra o nome do conteúdo quando difere; não ligado mostra o botão.
  const h = desenha([
    { id: "1", name: "Morfologia", period: "1º", status: "cursando", banco: "anatomia-humana", order: 0 },
    { id: "2", name: "Zoologia", period: "1º", status: "cursando", order: 1 },
    { id: "3", name: "Cálculo I", period: "1º", status: "cursando", order: 2 },
  ], indice);
  assert.ok(h.includes("Conteúdo pronto: Anatomia Humana"));
  assert.ok(h.includes("Ligar a um conteúdo do Mestriva"));
  assert.ok(/Conteúdo pronto<\/span>/.test(h), "nome igual não repete");
  assert.equal((h.match(/data-acao="ligar"/g) || []).length, 3);
  assert.ok(!desenha([{ id: "2", name: "Zoologia", period: "1º", status: "cursando", order: 1 }]).includes("Ligar a um conteúdo"), "sem índice, sem botão");

  const c = corpoLigar({ nome: '"><x>', busca: "", atual: "calculo-1", opcoes: filtraBanco(indice) });
  assert.ok(!c.includes("<x>") && c.includes('data-valor="calculo-1" aria-pressed="true"') && c.includes(`data-valor="${SEM_BANCO}"`));
  assert.ok(corpoLigar({ nome: "Zoo", busca: "zz", atual: "", opcoes: [] }).includes("Nenhum conteúdo com esse nome"));
  const mail = pedidoDeMateria("Zoologia & Cia", "a@b.c");
  assert.ok(mail.startsWith("mailto:a@b.c?subject=") && mail.includes(encodeURIComponent("Zoologia & Cia")) && mail.split("&").length === 2);
});
