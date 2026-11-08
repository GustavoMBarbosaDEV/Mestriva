import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { desenha, estadoInicial, valida, perfilFinal, a11yDasEscolhas, PASSOS, CAMINHOS, caminhoDo, passoInstituicao, listaFaculdades, listaCursos } from "../js/paginas/onboarding.js";
import { buscaFaculdades, cursosDaFaculdade, rotuloFaculdade, pedidoDeFaculdade } from "../js/faculdades.js";
import { PADRAO_A11Y } from "../js/preferencias.js";
import { PUBLICOS } from "../js/normaliza.js";

const dados = JSON.parse(fs.readFileSync(new URL("../conteudo/faculdades.json", import.meta.url), "utf8"));

test("estado vem do perfil", () => {
  const e = estadoInicial({ display_name: "Ana", course: "Direito", methods_used: ["Pomodoro"] });
  assert.equal(e.passo, 0);
  assert.equal(e.display_name, "Ana");
  assert.equal(e.publico, "faculdade");
  assert.deepEqual(e.methods_used, ["Pomodoro"]);
  assert.equal(estadoInicial({ institution: "Minha faculdade" }).manual, true, "faculdade digitada antes volta no modo digitar");
});

test("passo 1: nome e os 6 caminhos, com escape", () => {
  const h = desenha({ ...estadoInicial({}), display_name: '"><img src=x>' });
  assert.ok(!h.includes("<img src=x>"));
  for (const t of ["Vamos começar por você.", "Como você quer ser chamado", "O que você estuda", "Faculdade", "Ensino médio", "Cursinho", "Mestrado ou doutorado", "Concurso", "ENEM e medicina", "passo 1 de 4", "Continuar"]) assert.ok(h.includes(t), t);
  assert.equal(CAMINHOS.length, 6);
  assert.ok(!/\bIA\b/.test(h));
  for (const p of PUBLICOS) assert.ok(CAMINHOS.some((c) => c.valor === caminhoDo(p)), p);
});

test("passo 2 muda com o caminho", () => {
  const base = { ...estadoInicial({}), passo: 1 };
  assert.ok(passoInstituicao(base).includes("Sua faculdade") && passoInstituicao(base).includes("Não achei minha faculdade"));
  const em = passoInstituicao({ ...base, publico: "ensino_medio" });
  assert.ok(em.includes("1º ano") && em.includes("3º ano") && !em.includes("4º") && em.includes("Nome da escola"));
  assert.ok(passoInstituicao({ ...base, publico: "cursinho" }).includes("Nome do cursinho"));
  const pos = passoInstituicao({ ...base, publico: "doutorado" });
  assert.ok(pos.includes("Mestrado") && pos.includes('data-valor="doutorado"') && pos.includes("Programa ou área"));
  assert.ok(passoInstituicao({ ...base, publico: "concurso" }).includes("edital"));
  assert.ok(passoInstituicao({ ...base, publico: "medicina" }).includes("Vestibular de medicina"));
  const manual = passoInstituicao({ ...base, manual: true, institution: "Fac X", course: "Y" });
  assert.ok(manual.includes("Pedir para incluir minha faculdade") && manual.includes("mailto:"));
});

test("escolha da faculdade e do curso", () => {
  const ufjf = dados.faculdades.find((f) => f.sigla === "UFJF");
  const e = { ...estadoInicial({}), passo: 1, dadosFac: dados, filtroFac: "juiz de fora federal" };
  assert.ok(listaFaculdades(e).includes(`data-valor="${ufjf.id}"`));
  const comFac = { ...e, ies: ufjf.id, institution: "Universidade Federal de Juiz de Fora (UFJF)", filtroCurso: "engenharia" };
  const h = passoInstituicao(comFac);
  assert.ok(h.includes("Juiz de Fora/MG") && h.includes("Trocar") && h.includes("Seu curso"));
  assert.ok(listaCursos(comFac).includes("Engenharia Civil"));
  assert.ok(passoInstituicao({ ...comFac, course: "Medicina" }).includes("Medicina"));
  assert.ok(listaFaculdades({ ...e, dadosFac: null }).includes("Carregando"));
});

test("busca de faculdades", () => {
  assert.equal(buscaFaculdades(dados, "UFMG")[0].sigla, "UFMG", "sigla exata vem primeiro");
  assert.ok(buscaFaculdades(dados, "puc minas").some((f) => f.sigla === "PUC MINAS"));
  assert.ok(buscaFaculdades(dados, "vicosa").some((f) => f.sigla === "UFV"), "sem acento");
  assert.deepEqual(buscaFaculdades(dados, ""), []);
  assert.ok(buscaFaculdades(dados, "universidade", 5).length <= 5);
  const ufv = dados.faculdades.find((f) => f.sigla === "UFV");
  assert.ok(cursosDaFaculdade(dados, ufv, "agro").includes("Agronomia"));
  assert.equal(rotuloFaculdade(ufv), "UFV · Viçosa/MG");
  const mail = pedidoDeFaculdade({ faculdade: "Fac & Cia", cidade: "X/MG", curso: "Y" }, "a@b.c");
  assert.ok(mail.startsWith("mailto:a@b.c?subject=") && mail.split("&").length === 2);
});

test("dados de faculdades bem formados", () => {
  assert.ok(dados.fonte.startsWith("INEP"));
  const tipos = new Set(dados.faculdades.map((f) => f.tipo));
  assert.deepEqual([...tipos].sort(), ["estadual", "federal", "particular"]);
  assert.ok(dados.faculdades.filter((f) => f.tipo === "federal").length >= 60, "todas as federais");
  for (const s of ["UFJF", "UFV", "UFMG", "USP", "UNICAMP", "PUC MINAS", "MACKENZIE", "FUMEC"]) assert.ok(dados.faculdades.some((f) => f.sigla === s), s);
  const ids = dados.faculdades.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const f of dados.faculdades) for (const i of f.cursos) assert.ok(typeof dados.cursos[i] === "string");
});

test("validação por caminho", () => {
  const e = (x) => ({ ...estadoInicial({}), passo: 1, ...x });
  assert.match(valida({ ...estadoInicial({}) }), /chamado/);
  assert.equal(valida({ ...estadoInicial({}), display_name: "A" }), "");
  assert.match(valida(e({})), /faculdade/);
  assert.equal(valida(e({ institution: "U", course: "C" })), "");
  assert.match(valida(e({ publico: "ensino_medio", institution: "Escola", period: "5º" })), /ano/);
  assert.equal(valida(e({ publico: "ensino_medio", institution: "Escola", period: "2º" })), "");
  assert.match(valida(e({ publico: "concurso" })), /concurso/);
  assert.equal(valida(e({ publico: "enem" })), "");
  assert.equal(valida({ ...estadoInicial({}), passo: 2 }), "");
});

test("passos 3 e 4", () => {
  const h3 = desenha({ ...estadoInicial({}), passo: 2 });
  assert.ok(h3.includes("Como é a sua semana?") && h3.includes("Mais de 20h") && h3.includes("Flashcards"));
  const h4 = desenha({ ...estadoInicial({}), passo: 3 });
  assert.ok(h4.includes("O app se adapta a você.") && h4.includes("Fonte para dislexia") && h4.includes("Começar a estudar"));
  assert.equal(PASSOS.length, 4);
});

test("perfil final e acessibilidade", () => {
  const e = { ...estadoInicial({}), display_name: " Ana ", institution: "U", course: "C", ies: 575, accommodations: ["Texto maior", "Fonte para dislexia", "Menos animações", "Alto contraste"] };
  const p = perfilFinal(e);
  assert.equal(p.display_name, "Ana");
  assert.equal(p.publico, "faculdade");
  assert.equal(p.ies, 575);
  assert.equal(p.onboarding_completed, true);
  assert.equal(perfilFinal({ ...e, manual: true }).ies, null);
  const em = perfilFinal({ ...e, publico: "ensino_medio", period: "3º" });
  assert.equal(em.course, "Ensino médio");
  assert.equal(em.period, "3º");
  assert.equal(em.ies, null);
  assert.equal(perfilFinal({ ...e, publico: "concurso", period: "3º" }).period, "");
  const a = a11yDasEscolhas(PADRAO_A11Y, e.accommodations);
  assert.equal(a.textScale, 115);
  assert.equal(a.dyslexia && a.reduceMotion && a.highContrast, true);
  assert.deepEqual(a11yDasEscolhas(PADRAO_A11Y, []), { ...PADRAO_A11Y });
});
