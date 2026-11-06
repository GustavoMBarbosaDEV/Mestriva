import { test } from "node:test";
import assert from "node:assert/strict";
import { switchHtml, labelHtml, botaoIcone } from "../js/ui/controles.js";
import { botaoAcessibilidade, botaoTema, corpoAcessibilidade, aplicaAcaoA11y } from "../js/ui/acessibilidade.js";
import { PADRAO_A11Y } from "../js/preferencias.js";

const conta = (s, sub) => s.split(sub).length - 1;

test("switch marcado", () => {
  const s = switchHtml({ id: "a11y-dyslexia", marcado: true, acao: "a11y-alterna", rotulo: "Fonte" });
  assert.ok(s.includes('role="switch"'));
  assert.ok(s.includes('aria-checked="true"'));
  assert.ok(s.includes('data-estado="checked"'));
  assert.ok(s.includes("data-[estado=checked]:bg-primary"));
  assert.ok(s.includes("data-[estado=checked]:translate-x-4"));
  assert.ok(s.includes('data-acao="a11y-alterna"'));
});

test("switch desmarcado", () => {
  const s = switchHtml({ id: "x", marcado: false, acao: "a", rotulo: "r" });
  assert.ok(s.includes('aria-checked="false"'));
  assert.ok(s.includes('data-estado="unchecked"'));
});

test("switch escapa rótulo e dados", () => {
  const s = switchHtml({ id: '"><b>', marcado: false, acao: "a", rotulo: '"><b>' });
  assert.ok(!s.includes('"><b>'));
});

test("label e botão de ícone", () => {
  assert.ok(labelHtml({ para: "x", texto: "<i>", classe: "text-sm" }).includes("&lt;i&gt;"));
  const b = botaoIcone({ acao: "foco", rotulo: "Modo foco", icone: "Focus", classe: "h-9" });
  assert.ok(b.startsWith("<button") && b.includes('aria-label="Modo foco"') && b.includes("<svg"));
  const a = botaoIcone({ href: "/ajustes", rotulo: "Ajustes", icone: "Settings", classe: "" });
  assert.ok(a.startsWith("<a") && a.includes('href="/ajustes"'));
});

test("menu tem 4 switches e 4 filtros", () => {
  const c = corpoAcessibilidade(PADRAO_A11Y);
  assert.equal(conta(c, 'role="switch"'), 4);
  assert.equal(conta(c, 'role="radio"'), 4);
  assert.ok(/aria-checked="true"[^>]*>\s*Sem filtro/.test(c));
  assert.ok(c.includes("100%"));
  for (const t of ["Tamanho do texto", "Filtro para daltonismo", "Alto contraste", "Fonte para dislexia", "Espaçamento de leitura", "Reduzir animações", "Restaurar padrões"]) {
    assert.ok(c.includes(t), t);
  }
});

test("texto limitado", () => {
  assert.equal(aplicaAcaoA11y({ ...PADRAO_A11Y, textScale: 145 }, "a11y-texto", { valor: "5" }).textScale, 145);
  assert.equal(aplicaAcaoA11y({ ...PADRAO_A11Y, textScale: 120 }, "a11y-texto", { valor: "0" }).textScale, 100);
  assert.equal(aplicaAcaoA11y({ ...PADRAO_A11Y, textScale: 85 }, "a11y-texto", { valor: "-5" }).textScale, 85);
  assert.equal(aplicaAcaoA11y(PADRAO_A11Y, "a11y-texto", { valor: "5" }).textScale, 105);
});

test("alterna, cor e restaurar", () => {
  assert.equal(aplicaAcaoA11y(PADRAO_A11Y, "a11y-alterna", { chave: "dyslexia" }).dyslexia, true);
  assert.equal(aplicaAcaoA11y(PADRAO_A11Y, "a11y-alterna", { chave: "lixo" }).lixo, undefined);
  assert.equal(aplicaAcaoA11y(PADRAO_A11Y, "a11y-cor", { valor: "tritanopia" }).colorVision, "tritanopia");
  assert.equal(aplicaAcaoA11y(PADRAO_A11Y, "a11y-cor", { valor: "x" }).colorVision, "none");
  assert.deepEqual(aplicaAcaoA11y({ ...PADRAO_A11Y, dyslexia: true, textScale: 130 }, "a11y-restaura", {}), { ...PADRAO_A11Y });
});

test("botão de tema", () => {
  const b = botaoTema("dark", { compacto: true });
  assert.ok(b.includes('aria-pressed="true"'));
  assert.ok(b.includes("Ativar tema claro"));
  assert.ok(b.includes('data-acao="alterna-tema"'));
  assert.ok(botaoTema("light", { compacto: false }).includes("Tema escuro"));
});

test("botão de acessibilidade", () => {
  const b = botaoAcessibilidade({ compacto: false, classe: "w-full justify-center" });
  assert.ok(b.includes('data-acao="abre-acessibilidade"'));
  assert.ok(b.includes("Acessibilidade"));
  assert.ok(b.includes("w-full justify-center"));
  assert.ok(!botaoAcessibilidade({ compacto: true }).includes(">Acessibilidade<"));
});
