import { test } from "node:test";
import assert from "node:assert/strict";
import { diasDoMes, chaveDia } from "../js/datas.js";
import { cabecalho } from "../js/ui/cabecalho.js";
import { formDoEvento, validaEvento, eventoDoForm, corpoEvento } from "../js/ui/dialogo-evento.js";
import { desenhaGrade, desenhaContagem, contagemRegressiva } from "../js/paginas/calendario.js";

const agora = new Date(2026, 10, 5, 10, 0);

test("grade do mês começa no domingo e cobre semanas inteiras", () => {
  const d = diasDoMes(2026, 10); // novembro 2026: dia 1 é domingo
  assert.equal(d.length % 7, 0);
  assert.equal(d[0].getDay(), 0);
  assert.equal(d[0].getDate(), 1);
  assert.equal(d[d.length - 1].getDay(), 6);
  const f = diasDoMes(2026, 1); // fevereiro 2026: dia 1 é domingo, 28 dias
  assert.equal(f.length, 28);
  const m = diasDoMes(2026, 4); // maio 2026: dia 1 é sexta
  assert.equal(m[0].getMonth(), 3);
  assert.equal(chaveDia(new Date(2026, 0, 2)), "2026-01-02");
});

test("cabeçalho de página escapa", () => {
  const h = cabecalho({ sobre: "nov", titulo: "<b>T", descricao: "d", acoes: "<button>x</button>" });
  assert.ok(h.includes("&lt;b&gt;T") && h.includes("<button>x</button>") && h.includes("text-[30px]"));
});

test("formulário do evento", () => {
  const novo = formDoEvento(null, "2026-11-07");
  assert.deepEqual(novo, { title: "", type: "prova", date: "2026-11-07", time: "09:00", subject: "", notes: "", erro: "" });
  const ed = formDoEvento({ title: "P1", type: "trabalho", date: "2026-11-09T14:30", subject: "Cálculo", notes: "x" }, "");
  assert.equal(ed.time, "14:30");
  assert.equal(ed.date, "2026-11-09");
  assert.match(validaEvento({ ...novo, title: " " }), /Dê um nome/);
  assert.match(validaEvento({ ...novo, title: "a", date: "" }), /Escolha a data/);
  assert.equal(validaEvento({ ...novo, title: "a" }), "");
  assert.deepEqual(eventoDoForm({ ...novo, title: " P2 ", time: "" }), { title: "P2", type: "prova", date: "2026-11-07T09:00", subject: "", notes: "" });
});

test("corpo do diálogo escapa e lista matérias", () => {
  const h = corpoEvento({ ...formDoEvento(null, "2026-11-07"), title: '"><img>' }, [{ id: "1", name: "Cál<c>ulo" }], false);
  assert.ok(!h.includes("<img>") && h.includes("Cál&lt;c&gt;ulo"));
  assert.ok(h.includes("Sem matéria específica") && !h.includes("Excluir"));
  assert.ok(corpoEvento(formDoEvento(null, ""), [], true).includes("Excluir"));
  assert.ok(!/\bIA\b/.test(h));
});

test("grade do calendário marca hoje, selecionado e eventos", () => {
  const ev = [{ id: "e1", title: "<P1>", type: "prova", date: "2026-11-05T14:00" }];
  const h = desenhaGrade({ mes: new Date(2026, 10, 1), dia: new Date(2026, 10, 5) }, ev, agora);
  assert.ok(h.includes("novembro 2026"));
  assert.ok(h.includes("bg-ink text-neon"));
  assert.ok(h.includes("5 de novembro, 1 compromissos"));
  assert.ok(h.includes("&lt;P1&gt;") && !h.includes("<P1>"));
  assert.ok(h.includes("14:00"));
});

test("contagem regressiva: 12h de tolerância e no máximo 8", () => {
  const ev = Array.from({ length: 10 }, (_, i) => ({ id: "x" + i, title: "E" + i, type: "outro", date: `2026-11-${String(6 + i).padStart(2, "0")}T10:00` }));
  ev.push({ id: "velho", title: "V", type: "outro", date: "2026-11-04T10:00" });
  ev.push({ id: "recente", title: "R", type: "outro", date: "2026-11-05T01:00" });
  const lista = contagemRegressiva(ev, agora);
  assert.equal(lista.length, 8);
  assert.equal(lista[0].id, "recente");
  assert.ok(desenhaContagem([], agora).includes("Adicionar o primeiro"));
  assert.ok(desenhaContagem(ev, agora).includes("amanhã"));
});
