import { test } from "node:test";
import assert from "node:assert/strict";
import { parseData, formataData, diasAte, contagem, hojeISO, paraInputDataHora } from "../js/datas.js";
import { TIPOS_EVENTO, metaTipo, proximos } from "../js/eventos.js";

const agora = new Date(2026, 10, 5, 10, 0); // 5 nov 2026, 10:00 local

test("parseData", () => {
  assert.equal(parseData(""), null);
  assert.equal(parseData("xx"), null);
  assert.equal(parseData("2026-11-05T14:30").getHours(), 14);
});

test("formataData nos padrões", () => {
  assert.equal(formataData("2026-11-05T14:30", "d MMM · HH:mm"), "5 nov · 14:30");
  assert.equal(formataData("2026-11-05T14:30", "d MMM"), "5 nov");
  assert.equal(formataData("2026-11-05T09:05", "HH:mm"), "09:05");
  assert.equal(formataData("2026-11-05T14:30", "dd/MM"), "05/11");
  assert.equal(formataData("2026-11-05T14:30", "MMMM yyyy"), "novembro 2026");
  assert.equal(formataData("2026-11-05T14:30", "EEEE, d 'de' MMMM"), "quinta-feira, 5 de novembro");
  assert.equal(formataData("", "d MMM"), "—");
  assert.equal(formataData("2026-11-05T14:30"), "5 nov · 14:30");
});

test("diasAte e contagem por dia do calendário", () => {
  assert.equal(diasAte("2026-11-05T23:30", agora), 0);
  assert.equal(contagem("2026-11-05T23:30", agora), "hoje");
  assert.equal(contagem("2026-11-06T00:10", agora), "amanhã");
  assert.equal(contagem("2026-11-10T08:00", agora), "em 5 dias");
  assert.equal(contagem("2026-11-04T08:00", agora), "já aconteceu");
  assert.equal(contagem("", agora), "");
  assert.equal(diasAte(null, agora), null);
});

test("hojeISO e input", () => {
  assert.equal(hojeISO(agora), "2026-11-05");
  assert.equal(paraInputDataHora(new Date(2026, 0, 2, 3, 4)), "2026-01-02T03:04");
});

test("tipos de evento", () => {
  assert.equal(TIPOS_EVENTO.length, 5);
  assert.equal(metaTipo("prova").label, "Prova");
  assert.equal(metaTipo("x").value, "outro");
});

test("próximos 7 dias, sem feitos e em ordem", () => {
  const ev = [
    { id: "a", date: "2026-11-09T10:00", done: false },
    { id: "b", date: "2026-11-05T23:00", done: false },
    { id: "c", date: "2026-11-06T10:00", done: true },
    { id: "d", date: "2026-11-20T10:00", done: false },
    { id: "e", date: "2026-11-04T10:00", done: false },
    { id: "f", date: "", done: false },
  ];
  assert.deepEqual(proximos(ev, agora).map((e) => e.id), ["b", "a"]);
  assert.deepEqual(proximos(ev, agora, 30).map((e) => e.id), ["b", "a", "d"]);
});
