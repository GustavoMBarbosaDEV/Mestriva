import { test } from "node:test";
import assert from "node:assert/strict";
import { PERIODOS, CORES_MATERIA, corDaMateria, agrupaPorPeriodo, lerGradeTexto, ordenaMaterias, mediaNotas } from "../js/curriculo.js";

test("constantes", () => {
  assert.equal(PERIODOS.length, 10);
  assert.deepEqual(CORES_MATERIA, ["#3B5BFF", "#12B76A", "#F79009", "#8B5CF6", "#F04438", "#0EA5E9"]);
});

test("cor estável pelo nome", () => {
  assert.equal(corDaMateria("Cálculo I"), corDaMateria("Cálculo I"));
  assert.ok(CORES_MATERIA.includes(corDaMateria("")));
});

test("agrupa por período com ordem numérica", () => {
  const g = agrupaPorPeriodo([
    { name: "B", period: "10º", order: 0 },
    { name: "A", period: "2º", order: 1 },
    { name: "C", period: "2º", order: 0 },
    { name: "D", period: "" },
  ]);
  assert.deepEqual(g.map((x) => x.period), ["2º", "10º", "Sem período"]);
  assert.deepEqual(g[0].items.map((x) => x.name), ["C", "A"]);
});

test("lê grade colada", () => {
  const r = lerGradeTexto("1º - Cálculo I\n2: Física\n- Algoritmos\n\n•  x\nº");
  assert.deepEqual(r, [
    { period: "1º", name: "Cálculo I" },
    { period: "2º", name: "Física" },
    { period: "", name: "Algoritmos" },
  ]);
});

test("ordena matérias", () => {
  const r = ordenaMaterias([{ name: "x", period: "3º", order: 2 }, { name: "y", period: "1º", order: 5 }, { name: "z", period: "3º", order: 1 }]);
  assert.deepEqual(r.map((m) => m.name), ["y", "z", "x"]);
});

test("média em escala 0–10 ignorando inválidas", () => {
  assert.deepEqual(mediaNotas([]), { media: null, n: 0 });
  const r = mediaNotas([{ value: 8, max_value: 10 }, { value: 15, max_value: 20 }, { value: 5, max_value: 0 }, { value: null, max_value: 10 }, { value: 7 }]);
  assert.equal(r.n, 2);
  assert.equal(r.media, 7.75);
});
