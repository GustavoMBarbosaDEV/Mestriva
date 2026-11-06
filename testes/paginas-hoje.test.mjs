import { test } from "node:test";
import assert from "node:assert/strict";
import { resumo, desenha, inicioDaSemana } from "../js/paginas/hoje.js";

const agora = new Date(2026, 10, 5, 15, 0); // quinta, 15h

test("início da semana é segunda 00:00", () => {
  const s = inicioDaSemana(agora);
  assert.equal(s.getDay(), 1);
  assert.equal(s.getDate(), 2);
  assert.equal(inicioDaSemana(new Date(2026, 10, 8, 9)).getDate(), 2); // domingo
});

test("resumo do painel", () => {
  const dados = {
    perfil: { display_name: "Gu", course: "Direito", institution: "UFPR", period: "4º" },
    materias: [{ status: "cursando" }, { status: "concluida" }, { status: "cursando" }],
    eventos: [
      { id: "a", type: "prova", title: "P1", date: "2026-11-09T10:00" },
      { id: "b", type: "trabalho", title: "T", date: "2026-11-06T10:00" },
      { id: "c", type: "prova", title: "Velha", date: "2026-11-01T10:00" },
      { id: "d", type: "palestra", title: "Longe", date: "2026-12-20T10:00" },
    ],
    sessoes: [
      { minutes: 25, criado_em: new Date(2026, 10, 3, 10).toISOString() },
      { minutes: 50, criado_em: new Date(2026, 10, 4, 10).toISOString() },
      { minutes: 25, criado_em: new Date(2026, 9, 30, 10).toISOString() },
    ],
    materiais: [],
  };
  const r = resumo(dados, agora);
  assert.equal(r.saudacao, "Boa tarde");
  assert.equal(r.hoje, "quinta-feira, 5 de novembro");
  assert.equal(r.proximaProva.id, "a");
  assert.equal(r.diasProva, 4);
  assert.equal(r.ativas, 2);
  assert.equal(r.semana, 2);
  assert.equal(r.foco, "1h15");
  assert.deepEqual(r.agenda.map((e) => e.id), ["b", "a", "d"]);
  assert.equal(r.linha, "Direito · UFPR · 4º período");
});

test("painel com dados e escape", () => {
  const dados = { perfil: { display_name: "<Gu>" }, materias: [], eventos: [{ id: "a", type: "prova", title: "<P1>", date: "2026-11-09T10:00" }], sessoes: [], materiais: [] };
  const h = desenha(resumo(dados, agora));
  assert.ok(h.includes("Boa tarde, &lt;Gu&gt;.") && h.includes("&lt;P1&gt;") && !h.includes("<P1>"));
  assert.ok(h.includes("Prova chegando") && h.includes("9 de novembro às 10:00") && h.includes("em 4 dias"));
  assert.ok(h.includes("Comece pela sua grade") && h.includes("Complete seu perfil em Ajustes"));
  assert.ok(!/\bIA\b/.test(h));
});

test("painel vazio", () => {
  const h = desenha(resumo({ perfil: {}, materias: [{ status: "cursando" }], eventos: [], sessoes: [], materiais: [] }, new Date(2026, 10, 5, 8)));
  assert.ok(h.includes("Bom dia.") && h.includes("Vamos colocar as datas no lugar?") && h.includes("Nada marcado por aqui ainda.") && h.includes("Foco agora"));
  assert.ok(h.includes("0min"));
});
