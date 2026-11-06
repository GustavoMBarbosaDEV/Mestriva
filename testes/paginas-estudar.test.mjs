import { test } from "node:test";
import assert from "node:assert/strict";
import { relogio, pomodoroInicial, tique, alterna, reinicia, pula, FOCO, PAUSA, desenhaPomodoro } from "../js/ui/pomodoro.js";
import { textoParaFala, botaoOuvir, botaoDitar } from "../js/ui/fala.js";
import { corpoMaterial, ROTULO_TIPO } from "../js/ui/leitor.js";
import { desenha, proximaProva, formMaterial, validaMaterial } from "../js/paginas/estudar.js";

test("relógio", () => {
  assert.equal(relogio(1500), "25:00");
  assert.equal(relogio(61), "01:01");
  assert.equal(relogio(-5), "00:00");
});

test("pomodoro conta pelo relógio real e troca de fase", () => {
  let p = pomodoroInicial();
  assert.equal(p.restante, FOCO);
  p = alterna(p, 1000);
  assert.equal(p.rodando, true);
  let r = tique(p, 1000 + 10_000);
  assert.equal(r.estado.restante, FOCO - 10);
  assert.equal(r.concluiuFoco, false);
  r = tique(p, 1000 + FOCO * 1000 + 500);
  assert.equal(r.concluiuFoco, true);
  assert.equal(r.estado.fase, "pausa");
  assert.equal(r.estado.restante, PAUSA);
  assert.equal(r.estado.ciclos, 1);
  assert.equal(r.estado.rodando, false);
  const pausado = alterna(tique(p, 1000 + 60_000).estado, 1000 + 60_000);
  assert.equal(pausado.rodando, false);
  assert.equal(pausado.restante, FOCO - 60);
  assert.equal(reinicia(pausado).restante, FOCO);
  assert.equal(pula(pausado).fase, "pausa");
  assert.equal(pula(pula(pausado)).fase, "foco");
});

test("pomodoro desenha matérias com escape", () => {
  const h = desenhaPomodoro(pomodoroInicial(), [{ id: "1", name: "<A>" }], "");
  assert.ok(h.includes("25:00") && h.includes("0 ciclos") && h.includes("&lt;A&gt;") && h.includes("Iniciar"));
});

test("fala", () => {
  assert.equal(textoParaFala("# Título\n**forte** [link](https://x.com) `c`"), "Título forte link c");
  assert.ok(botaoOuvir(false).includes("Ouvir") && botaoOuvir(true).includes("Parar leitura"));
  assert.ok(botaoDitar(false, true).includes('aria-label="Ditar por voz"'));
  assert.ok(botaoDitar(false, false).includes("disabled"));
});

test("leitor de material", () => {
  const h = corpoMaterial({ id: "1", title: "T", kind: "guia", subject: "<S>", content: "## A\n<script>x</script>" });
  assert.ok(h.includes("<h2>A</h2>") && !h.includes("<script>") && h.includes("study-prose") && h.includes("Excluir"));
  assert.equal(ROTULO_TIPO.revisao, "Revisão complementar");
});

test("próxima prova e página", () => {
  const agora = new Date(2026, 10, 5, 10);
  const ev = [
    { id: "a", type: "trabalho", title: "T", date: "2026-11-06T10:00" },
    { id: "b", type: "prova", title: "P2", date: "2026-11-10T10:00", subject: "Cálculo" },
    { id: "c", type: "prova", title: "P1", date: "2026-11-01T10:00" },
  ];
  assert.equal(proximaProva(ev, agora).id, "b");
  const h = desenha(formMaterial(), [], [], proximaProva(ev, agora), pomodoroInicial(), agora);
  assert.ok(h.includes("próxima prova") && h.includes("P2") && h.includes("em 5 dias") && h.includes("Nenhum material ainda"));
  assert.ok(h.includes("Recall ativo") && h.includes("Modo Pomodoro"));
  assert.ok(!/\bIA\b/.test(h));
  assert.match(validaMaterial(formMaterial()), /Escolha a matéria/);
});
