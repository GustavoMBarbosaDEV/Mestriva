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
