import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizaNome, achaNoBanco, validaMateriaBanco, registraResposta, montaQuiz, embaralhaAlternativas, revisaoDosErros, INTERVALOS } from "../js/conteudo.js";

const indice = {
  versao: 1,
  materias: [
    { id: "calculo-1", nome: "Cálculo I", apelidos: ["Cálculo Diferencial e Integral I", "Cálculo 1"], area: "Exatas", topicos: [] },
    { id: "direito-constitucional", nome: "Direito Constitucional", apelidos: ["Constitucional I"], area: "Direito", topicos: [] },
  ],
};

test("normaliza nomes", () => {
  assert.equal(normalizaNome("  Cálculo  II "), "calculo 2");
  assert.equal(normalizaNome("Física-I"), "fisica 1");
  assert.equal(normalizaNome("CÁLCULO DIFERENCIAL E INTEGRAL I"), "calculo diferencial e integral 1");
  assert.equal(normalizaNome("Direito Civil III"), "direito civil 3");
});

test("acha matéria pelo nome, apelido ou número romano", () => {
  assert.equal(achaNoBanco("Cálculo I", indice), "calculo-1");
  assert.equal(achaNoBanco("calculo 1", indice), "calculo-1");
  assert.equal(achaNoBanco("Cálculo Diferencial e Integral I", indice), "calculo-1");
  assert.equal(achaNoBanco("Constitucional I", indice), "direito-constitucional");
  assert.equal(achaNoBanco("Cálculo II", indice), null);
  assert.equal(achaNoBanco("", indice), null);
});

test("busca tolerante com nomes reais de grades, usando o índice de verdade", async () => {
  const { readFile } = await import("node:fs/promises");
  const real = JSON.parse(await readFile(new URL("../conteudo/indice.json", import.meta.url), "utf8"));
  const casos = {
    "Física Geral e Experimental I": "fisica-1",
    "Química Geral e Experimental": "quimica-geral",
    "Teoria Geral da Administração I": "teoria-geral-administracao",
    "Anatomia": "anatomia-humana",
    "Anatomia Humana I": "anatomia-humana",
    "Português": "portugues-redacao",
    "Citologia e Histologia": "biologia-celular",
    "Geometria Analítica e Álgebra Linear": "algebra-linear",
    "Algoritmos e Estruturas de Dados I": "algoritmos-programacao",
    "CALCULO DIFERENCIAL E INTEGRAL I": "calculo-1",
    "Cálculo": "calculo-1",
    "Direito": "introducao-direito",
    "Fundamentos de Anatomia": "anatomia-humana",
    "Direito Civil I": "direito-civil-geral",
    "Fisiologia": "fisiologia-humana",
    "Bioquímica I": "bioquimica",
    "Banco de Dados": "banco-de-dados",
    "Desenvolvimento Humano": "psicologia-desenvolvimento",
    "Histologia": "histologia",
    "Microbiologia Clínica": "microbiologia",
    "Farmacologia Aplicada à Enfermagem": "farmacologia",
    "Imunologia": "imunologia",
    "Microbiologia e Imunologia": "microbiologia",
    "Genética Humana": "genetica",
    "Saúde Pública": "saude-coletiva",
    "Epidemiologia": "epidemiologia",
    "Parasitologia Humana": "parasitologia",
    "Teoria Geral do Estado": "teoria-geral-estado",
    "Ciência Política": "teoria-geral-estado",
    "Direito Penal I": "direito-penal-geral",
    "Direito Penal - Parte Geral": "direito-penal-geral",
    "Direito Administrativo I": "direito-administrativo",
    "Direito Processual Civil I": "processo-civil",
    "Direito do Trabalho": "direito-trabalho",
    "Direito Comercial": "direito-empresarial",
    "Psicologia da Aprendizagem": "psicologia-educacao",
    "Educação e Sociedade": "sociologia-educacao",
    "Filosofia da Educação I": "filosofia-educacao",
    "Historia da Educacao": "historia-educacao",
    "Estrutura e Funcionamento da Educação Básica": "politica-educacional",
    "Fundamentos e Metodologia da Alfabetização": "alfabetizacao-letramento",
    "Processos Patológicos Gerais": "patologia",
  };
  for (const [nome, id] of Object.entries(casos)) assert.equal(achaNoBanco(nome, real), id, nome);
  // Nível diferente ou matéria diferente nunca liga.
  for (const nome of ["Cálculo II", "Cálculo Diferencial e Integral II", "Física II", "Física Moderna", "Química Orgânica", "Direito Civil II", "Fisiologia Vegetal", "Direito Penal II", "Direito Processual Penal", "Processo Penal", "Direito Administrativo II", "Administração Pública", "Direito Processual Civil II", "Processo do Trabalho", "Direito Coletivo do Trabalho", "Segurança do Trabalho", "Direito Empresarial II", "Direito Tributário", "Teoria", "Anatomia Veterinária", "Estatística II", "Bioquímica II", "Bioquímica Clínica", "Banco de Dados II", "Psicologia Social", "Desenvolvimento Web", "Embriologia", "Engenharia", "Planejamento", "Mecânica Geral", "Histologia Vegetal", "Farmacologia Veterinária", "Imunologia II", "Genética Vegetal", "Saúde Mental", "Patologia Vegetal", "Patologia Bucal", "Parasitologia Veterinária", "Epidemiologia II", "Filosofia", "Sociologia", "História do Brasil", "Ética Profissional", "Psicologia Geral", "Educação Física", "Letramento Digital", "Política Externa Brasileira"]) {
    assert.equal(achaNoBanco(nome, real), null, nome);
  }
});

const q = (n, topico = "t1", nivel = "conceitual") => ({ id: `m-${n}`, topico, nivel, pergunta: `Pergunta ${n}?`, opcoes: [`a${n}`, `b${n}`, `c${n}`, `d${n}`], correta: n % 4, explicacao: "Explicação suficiente para passar no mínimo exigido pelo validador." });
const materia = (questoes) => ({
  id: "m", nome: "M", versao: 1,
  topicos: [{ id: "t1", nome: "T1", resumo: "# R", revisao: "## O que revisar" }],
  questoes,
});

test("validador do banco aceita matéria boa", () => {
  const qs = [q(1), q(2), q(3, "t1", "aplicacao"), q(4, "t1", "analise"), q(5)];
  assert.deepEqual(validaMateriaBanco(materia(qs)), []);
});

test("validador do banco aponta cada problema", () => {
  const ruins = [
    { ...q(1), opcoes: ["a", "b", "c"] },
    { ...q(2), correta: 4 },
    { ...q(3), explicacao: "curta" },
    { ...q(4), pergunta: "Pergunta 5?" },
    q(5),
    { ...q(6), topico: "nao-existe" },
    { ...q(7), opcoes: ["x", "x", "y", "z"] },
    { ...q(8), id: "m-5" },
  ];
  const erros = validaMateriaBanco(materia(ruins)).join("\n");
  for (const t of ["m-1: precisa de 4 alternativas", "m-2: correta fora", "m-3: explicação curta", "pergunta repetida", "m-6: tópico desconhecido", "m-7: alternativas repetidas", "id repetido: m-5", "aplicação ou análise"]) {
    assert.ok(erros.includes(t), `falta: ${t}\n${erros}`);
  }
  assert.ok(validaMateriaBanco(materia([q(1)])).join().includes("t1: menos de 4 questões"));
});

test("repetição espaçada", () => {
  const agora = new Date(2026, 10, 5, 10);
  let e = registraResposta({}, "m-1", true, agora);
  assert.deepEqual(INTERVALOS, [1, 3, 7, 15]);
  assert.equal(e["m-1"].a, 1);
  assert.equal(e["m-1"].prox.slice(0, 10), "2026-11-06");
  e = registraResposta(e, "m-1", true, agora);
  assert.equal(e["m-1"].prox.slice(0, 10), "2026-11-08");
  e = registraResposta(e, "m-1", false, agora);
  assert.equal(e["m-1"].e, 1);
  assert.equal(e["m-1"].a, 0);
  assert.equal(e["m-1"].prox.slice(0, 10), "2026-11-06");
});

test("monta quiz priorizando vencidas e erradas, sem repetir", () => {
  const qs = Array.from({ length: 20 }, (_, i) => q(i + 1));
  const agora = new Date(2026, 10, 5, 10);
  const erros = {
    "m-7": { a: 0, e: 2, prox: "2026-11-04T10:00:00.000Z" },
    "m-3": { a: 3, e: 0, prox: "2026-12-30T10:00:00.000Z" },
  };
  const sorteio = () => 0.5;
  const r = montaQuiz({ questoes: qs, qtd: 5, erros, agora, sorteio });
  assert.equal(r.length, 5);
  assert.equal(r[0].id, "m-7");
  assert.ok(!r.some((x) => x.id === "m-3"));
  assert.equal(new Set(r.map((x) => x.id)).size, 5);
  assert.equal(montaQuiz({ questoes: qs.slice(0, 3), qtd: 8, erros: {}, agora, sorteio }).length, 3);
});

test("embaralhar alternativas mantém a correta", () => {
  const original = q(2);
  let i = 0;
  const seq = [0.9, 0.1, 0.5, 0.3];
  const r = embaralhaAlternativas(original, () => seq[i++ % seq.length]);
  assert.equal(r.opcoes[r.correta], original.opcoes[original.correta]);
  assert.deepEqual([...r.opcoes].sort(), [...original.opcoes].sort());
});

test("revisão dos erros tem as seções", () => {
  const m = { ...materia([q(1), q(2, "t1", "aplicacao")]), topicos: [{ id: "t1", nome: "Derivadas", resumo: "Derivada mede variação.", revisao: "Revise a regra da cadeia." }] };
  const md = revisaoDosErros({ materia: m, erradas: [q(2, "t1", "aplicacao")], texto: "errei derivadas <script>" });
  for (const s of ["## O que aconteceu", "## Reconstruindo a base", "## Passo a passo do exercício", "## Treino rápido", "## Plano de 3 dias"]) assert.ok(md.includes(s), s);
  assert.ok(md.includes("Derivadas") && md.includes("Derivada mede variação."));
  assert.ok(md.includes("Dia 1") && md.includes("25 minutos"));
  const semBanco = revisaoDosErros({ materia: null, erradas: [], texto: "confundi sujeito e predicado" });
  assert.ok(semBanco.includes("## Plano de 3 dias") && semBanco.includes("confundi sujeito e predicado"));
});
