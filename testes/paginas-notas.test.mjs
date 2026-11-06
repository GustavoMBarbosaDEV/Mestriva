import { test } from "node:test";
import assert from "node:assert/strict";
import { parseData, formataData } from "../js/datas.js";
import { desenha, formInicial, validaNota, notaDoForm, tomDaNota, mediaGeral, numeroBr } from "../js/paginas/notas.js";

test("data só com dia é lida no fuso local (não volta um dia)", () => {
  const d = parseData("2026-11-05");
  assert.equal(d.getDate(), 5);
  assert.equal(d.getHours(), 0);
  assert.equal(formataData("2026-11-05", "d MMM yyyy"), "5 nov 2026");
});

test("formulário e validação", () => {
  const f = formInicial(new Date(2026, 10, 5));
  assert.deepEqual(f, { subject: "", activity: "", value: "", max_value: "10", wrong_topics: "", date: "2026-11-05", erro: "" });
  assert.match(validaNota(f), /Informe a matéria, a atividade e a nota/);
  assert.equal(validaNota({ ...f, subject: "A", activity: "P1", value: 0 }), "");
  assert.deepEqual(notaDoForm({ ...f, subject: " A ", activity: " P1 ", value: "7.5", max_value: "" }), {
    subject: "A", activity: "P1", value: 7.5, max_value: 10, wrong_topics: "", date: "2026-11-05",
  });
});

test("tom, número e média", () => {
  assert.equal(tomDaNota({ value: 7, max_value: 10 }), "bg-[#EFFBF3] text-[#027A48]");
  assert.equal(tomDaNota({ value: 5, max_value: 10 }), "bg-[#FFF7E6] text-[#B54708]");
  assert.equal(tomDaNota({ value: 1, max_value: 10 }), "bg-[#FFEDED] text-[#B42318]");
  assert.equal(tomDaNota({ value: 1, max_value: 0 }), "bg-[#FFEDED] text-[#B42318]");
  assert.equal(numeroBr(7.5), "7,5");
  assert.equal(mediaGeral([]), null);
  assert.equal(mediaGeral([{ value: 8, max_value: 10 }, { value: 6, max_value: 10 }]), "7,0");
});

test("lista e vazio", () => {
  assert.ok(desenha(formInicial(), [], []).includes("Nenhuma nota lançada"));
  const h = desenha(formInicial(), [{ id: "1", subject: "<Cálc>", activity: "P1", value: 8, max_value: 10, wrong_topics: "regra <da> cadeia", date: "" }], [{ id: "m", name: "Cálc" }]);
  assert.ok(h.includes("&lt;Cálc&gt;") && h.includes("regra &lt;da&gt; cadeia") && h.includes("sem data"));
  assert.ok(h.includes("8/10") && h.includes("média geral") && h.includes("8,0"));
  assert.ok(h.includes('<option value="Cálc">'));
  assert.ok(!/\bIA\b/.test(h));
});
