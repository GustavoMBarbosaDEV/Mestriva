import { test } from "node:test";
import assert from "node:assert/strict";
import { validaBackup, montaBackup } from "../js/backup.js";
import { desenha, formDoPerfil } from "../js/paginas/ajustes.js";
import { lembretes, desenhaLembretes } from "../js/ui/sino.js";

test("backup válido volta normalizado", () => {
  const b = montaBackup({ versao: 1, perfil: { course: "Direito" }, materias: [{ id: "a", name: "X" }], eventos: [], notas: [], sessoes: [], quizzes: [], tentativas: [], materiais: [], cartoes: [], erros: {} }, new Date(2026, 10, 5));
  assert.equal(b.app, "mestriva");
  const r = validaBackup(JSON.stringify(b));
  assert.equal(r.ok, true);
  assert.equal(r.dados.perfil.course, "Direito");
  assert.equal(r.dados.materias[0].status, "cursando");
});

test("backup inválido explica o motivo", () => {
  assert.match(validaBackup("{x").erro, /não é um backup/);
  assert.match(validaBackup(JSON.stringify({ app: "outro" })).erro, /não é um backup do Mestriva/);
  const grande = { app: "mestriva", dados: { materias: Array.from({ length: 5001 }, () => ({ name: "x" })) } };
  assert.match(validaBackup(JSON.stringify(grande)).erro, /grande demais/);
  assert.match(validaBackup("x".repeat(6 * 1024 * 1024)).erro, /grande demais/);
});

test("página de ajustes", () => {
  const f = formDoPerfil({ display_name: "<Gu>", period: "4º" });
  const h = desenha(f, { nome: "<Gu>", email: "" }, false);
  assert.ok(h.includes("Seu perfil de estudante") && h.includes("Dados acadêmicos") && h.includes("Rever o questionário inicial"));
  assert.ok(h.includes("&lt;Gu&gt;") && !h.includes("<Gu>"));
  assert.ok(h.includes("Baixar backup") && h.includes("Restaurar backup") && h.includes("Apagar dados deste aparelho"));
  assert.ok(h.includes('value="4º" selected'));
  assert.ok(desenha(f, { nome: "", email: "" }, true).includes("Alterações salvas"));
  assert.ok(!/\bMFA\b|duas etapas/.test(h));
});

test("lembretes dos próximos 7 dias (por horário)", () => {
  const agora = new Date(2026, 10, 5, 10);
  const ev = [
    { id: "a", type: "prova", title: "P1", date: "2026-11-05T09:00" },
    { id: "b", type: "prova", title: "P2", date: "2026-11-12T09:00" },
    { id: "c", type: "prova", title: "P3", date: "2026-11-12T11:00" },
    { id: "d", type: "trabalho", title: "<T>", date: "2026-11-06T10:00" },
  ];
  assert.deepEqual(lembretes(ev, agora).map((e) => e.id), ["d", "b"]);
  const h = desenhaLembretes(lembretes(ev, agora), "default", false, agora);
  assert.ok(h.includes("&lt;T&gt;") && h.includes("Ativar notificações no navegador") && h.includes("amanhã"));
  assert.ok(desenhaLembretes([], "granted", true, agora).includes("Nenhum compromisso nos próximos 7 dias") && desenhaLembretes([], "granted", true, agora).includes("Notificações do navegador ativas"));
  assert.ok(desenhaLembretes([], "unsupported", false, agora).includes("não suporta notificações"));
});
