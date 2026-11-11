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
    "Psicologia Social": "psicologia-social",
    "Psicologia Comunitária": "psicologia-social",
    "Avaliação Psicológica": "avaliacao-psicologica",
    "PSICOMETRIA": "avaliacao-psicologica",
    "Psicodiagnóstico": "avaliacao-psicologica",
    "Psicologia Organizacional": "psicologia-organizacional",
    "Psicologia do Trabalho": "psicologia-organizacional",
    "Programação Orientada a Objetos": "programacao-orientada-objetos",
    "POO": "programacao-orientada-objetos",
    "Sistemas Operacionais": "sistemas-operacionais",
    "SISTEMAS OPERACIONAIS I": "sistemas-operacionais",
    "Matemática Discreta": "matematica-discreta",
    "Lógica Matemática": "matematica-discreta",
    "Desenvolvimento Web": "desenvolvimento-web",
    "Programação Web": "desenvolvimento-web",
    "Estrutura de Dados": "estrutura-dados",
    "Redes de Computadores": "redes-computadores",
    "Engenharia de Software": "engenharia-software",
    "Administração Financeira": "administracao-financeira",
    "Finanças Corporativas": "administracao-financeira",
    "Logística": "logistica",
    "Administração de Materiais": "logistica",
    "Gestão de Projetos": "gestao-projetos",
    "GERENCIAMENTO DE PROJETOS": "gestao-projetos",
    "Comportamento Organizacional": "comportamento-organizacional",
    "Liderança": "comportamento-organizacional",
    "Matemática Financeira": "matematica-financeira",
    "Gestão de Pessoas": "gestao-pessoas",
    "Contabilidade de Custos": "contabilidade-custos",
    "Direito de Família": "direito-familia-sucessoes",
    "Direito das Sucessões": "direito-familia-sucessoes",
    "Direito das Coisas": "direito-coisas",
    "Direitos Reais": "direito-coisas",
    "Direito Civil IV": "direito-coisas",
    "Direito do Consumidor": "direito-consumidor",
    "Processo do Trabalho": "processo-trabalho",
    "DIREITO PROCESSUAL DO TRABALHO I": "processo-trabalho",
    "Direito Tributário": "direito-tributario",
    "Processo Penal": "processo-penal",
    "DIREITO PROCESSUAL PENAL I": "processo-penal",
    "Direito Civil II": "direito-civil-obrigacoes",
    "Direito das Obrigações": "direito-civil-obrigacoes",
    "Responsabilidade Civil": "direito-civil-obrigacoes",
    "Direito Penal III": "direito-penal-especial",
    "Direito Penal: Parte Especial": "direito-penal-especial",
    "Anatomia Veterinária": "anatomia-veterinaria",
    "ANATOMIA DOS ANIMAIS DOMÉSTICOS I": "anatomia-veterinaria",
    "Teorias da Comunicação": "teorias-comunicacao",
    "INTRODUÇÃO AO JORNALISMO": "teorias-comunicacao",
    "Introdução ao Serviço Social": "servico-social",
    "Política Social": "servico-social",
    "Teoria das Relações Internacionais": "relacoes-internacionais",
    "História da Arquitetura e do Urbanismo": "historia-arquitetura",
    "Introdução ao Design": "fundamentos-design",
    "Tipografia": "fundamentos-design",
    "Comunicação e Expressão": "portugues-redacao",
    "Desenho Arquitetônico": "desenho-tecnico",
    "Nutrição Básica": "nutricao-humana",
    "NUTRIÇÃO E DIETÉTICA": "nutricao-humana",
    "Cinesiologia e Biomecânica": "cinesiologia",
    "Biomecânica": "cinesiologia",
    "Fisiologia do Exercício": "fisiologia-exercicio",
    "Anatomia e Escultura Dental": "anatomia-dental",
    "Oclusão": "anatomia-dental",
    "Fisiologia Aplicada à Nutrição": "fisiologia-humana",
    "Linguística": "linguistica",
    "Introdução aos Estudos Linguísticos": "linguistica",
    "Teoria Literária": "teoria-literaria",
    "TEORIA DA LITERATURA II": "teoria-literaria",
    "Língua Portuguesa": "portugues-redacao",
    "Sociologia": "sociologia",
    "Filosofia": "filosofia",
    "Antropologia Cultural": "antropologia",
    "LÍNGUA BRASILEIRA DE SINAIS - LIBRAS": "libras",
    "Libras II": "libras",
    "Sociologia da Educação": "sociologia-educacao",
    "Filosofia da Educação": "filosofia-educacao",
    "Ciência do Solo": "ciencia-solo",
    "Fertilidade do Solo": "ciencia-solo",
    "Pedologia": "ciencia-solo",
    "Manejo e Conservação do Solo": "ciencia-solo",
    "Botânica": "botanica",
    "Morfologia Vegetal": "botanica",
    "Zoologia dos Invertebrados": "zoologia",
    "ZOOLOGIA GERAL": "zoologia",
    "Ecologia Geral": "ecologia",
    "Ciências do Ambiente": "ecologia",
    "Química Orgânica": "quimica-organica",
    "QUIMICA ORGANICA II": "quimica-organica",
    "Química Analítica Quantitativa": "quimica-analitica",
    "Análise Instrumental": "quimica-analitica",
    "Química Geral I": "quimica-geral",
    "Física II": "fisica-2",
    "FISICA GERAL E EXPERIMENTAL II": "fisica-2",
    "Física I": "fisica-1",
    "Mecânica Geral": "mecanica-geral",
    "Estática": "mecanica-geral",
    "Resistência dos Materiais II": "resistencia-materiais",
    "Mecânica dos Sólidos": "resistencia-materiais",
    "Fenômenos de Transporte": "fenomenos-transporte",
    "Mecânica dos Fluidos": "fenomenos-transporte",
    "Termodinâmica": "termodinamica",
    "Termodinâmica Aplicada": "termodinamica",
    "Circuitos Elétricos I": "circuitos-eletricos",
    "Análise de Circuitos": "circuitos-eletricos",
    "Desenho Técnico": "desenho-tecnico",
    "Expressão Gráfica": "desenho-tecnico",
    "Cálculo II": "calculo-2",
    "Cálculo Diferencial e Integral II": "calculo-2",
    "CALCULO 2": "calculo-2",
    "Cálculo III": "calculo-3",
    "Cálculo de Várias Variáveis": "calculo-3",
    "Equações Diferenciais Ordinárias": "equacoes-diferenciais",
    "EDO": "equacoes-diferenciais",
    "Geometria Analítica": "geometria-analitica",
    "Vetores e Geometria Analítica": "geometria-analitica",
    "Cálculo I": "calculo-1",
    "Semiologia": "semiologia",
    "SEMIOLOGIA MEDICA II": "semiologia",
    "Propedêutica Médica": "semiologia",
    "Fundamentos de Enfermagem": "fundamentos-enfermagem",
    "Semiologia e Semiotécnica da Enfermagem": "fundamentos-enfermagem",
    "Fundamentos de Enfermagem II": "fundamentos-enfermagem",
    "Processos Psicológicos Básicos": "processos-psicologicos",
    "PROCESSOS PSICOLOGICOS BASICOS II": "processos-psicologicos",
    "Psicologia Cognitiva": "processos-psicologicos",
    "Teorias da Personalidade I": "teorias-personalidade",
    "Psicologia da Personalidade": "teorias-personalidade",
    "Psicopatologia": "psicopatologia",
    "Psicopatologia Geral II": "psicopatologia",
    "Semiologia Psiquiátrica": "psicopatologia",
    "Neuroanatomia": "neuroanatomia",
    "Neuroanatomia Funcional": "neuroanatomia",
    "Neurociências": "neuroanatomia",
    "Patologia Geral": "patologia",
    "Anatomia Humana": "anatomia-humana",
    "Psicologia do Desenvolvimento": "psicologia-desenvolvimento",
    "Contabilidade de Custos II": "contabilidade-custos",
    "Custos e Formação de Preços": "contabilidade-custos",
    "Administração de Marketing I": "marketing",
    "Comportamento do Consumidor": "marketing",
    "Administração de Recursos Humanos II": "gestao-pessoas",
    "Gestao de Pessoas I": "gestao-pessoas",
    "Teoria Microeconômica I": "microeconomia",
    "Teoria Macroeconômica II": "macroeconomia",
    "Matemática para Negócios": "matematica-aplicada",
    "Economia": "introducao-economia",
    "ESTRUTURAS DE DADOS II": "estrutura-dados",
    "AEDS II": "estrutura-dados",
    "Algoritmos e Estruturas de Dados I": "algoritmos-programacao",
    "Análise e Projeto de Sistemas": "engenharia-software",
    "Engenharia de Software II": "engenharia-software",
    "Redes de Computadores I": "redes-computadores",
    "Comunicação de Dados": "redes-computadores",
    "Arquitetura e Organização de Computadores": "arquitetura-computadores",
    "Sistemas Digitais": "arquitetura-computadores",
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
  for (const nome of ["Física Moderna", "Fisiologia Vegetal", "Direito Penal II", "Direito Administrativo II", "Administração Pública", "Direito Processual Civil II", "Direito Coletivo do Trabalho", "Segurança do Trabalho", "Direito Empresarial II", "Teoria", "Estatística II", "Bioquímica II", "Bioquímica Clínica", "Banco de Dados II", "Embriologia", "Engenharia", "Planejamento", "Histologia Vegetal", "Farmacologia Veterinária", "Imunologia II", "Genética Vegetal", "Saúde Mental", "Patologia Vegetal", "Patologia Bucal", "Parasitologia Veterinária", "Epidemiologia II", "História do Brasil", "Ética Profissional", "Psicologia Geral", "Educação Física", "Letramento Digital", "Política Externa Brasileira", "Economia Brasileira", "Marketing Pessoal", "Gestão Ambiental", "Contabilidade Tributária", "Matemática Básica", "Redes Sociais", "Compiladores", "Arquitetura de Software", "Estrutura de Concreto", "Computação Gráfica", "Inteligência Artificial", "Psicologia Clínica", "Psicofarmacologia", "Neurologia", "Psiquiatria", "Psicologia Hospitalar", "Enfermagem em Saúde Mental", "Enfermagem Obstétrica", "Semiologia Veterinária", "Enfermagem Pediátrica", "Administração em Enfermagem", "Propedêutica Cirúrgica", "Equações Diferenciais Parciais", "Geometria Descritiva", "Cálculo Numérico", "Física III", "Mecânica dos Solos", "Hidrologia", "Eletrônica Analógica", "Máquinas Elétricas", "Desenho Artístico", "Termodinâmica Química", "Físico-Química", "Química Ambiental", "Paleontologia", "Microbiologia do Solo", "Irrigação e Drenagem", "Agrometeorologia", "Filosofia do Direito", "Sociologia Jurídica", "Antropologia Jurídica", "Literatura Brasileira", "Literatura Portuguesa", "Literatura Infantil", "Língua Inglesa", "Morfologia do Português", "Nutrição Animal", "Fisioterapia Respiratória", "Prótese Dentária", "Dentística", "Educação Física Escolar", "Design de Interiores", "Comércio Exterior", "Conforto Ambiental", "Fisiologia Veterinária", "Execução Penal", "Direito Ambiental", "Direito Internacional", "Direito Eleitoral", "Direito Previdenciário", "Planejamento Estratégico", "Empreendedorismo", "Administração da Produção", "Gestão da Qualidade", "Sistemas Distribuídos", "Segurança da Informação", "Interação Humano-Computador", "Teoria da Computação", "Desenvolvimento Mobile", "Psicologia Jurídica", "Psicologia da Saúde", "Psicologia Escolar", "Psicanálise", "Terapia Cognitivo-Comportamental"]) {
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

test("validador não confunde expoentes nas alternativas", () => {
  const qs = [{ ...q(1), opcoes: ["O(n²)", "O(n)", "O(n³)", "O(log n)"] }, { ...q(2), opcoes: ["p > 1", "p < 1", "p = 1", "Para todo p"] }, q(3, "t1", "aplicacao"), q(4, "t1", "analise")];
  assert.deepEqual(validaMateriaBanco(materia(qs)), []);
  // Diferença só de maiúscula, espaço ou ponto final continua sendo repetição.
  const iguais = [{ ...q(1), opcoes: ["Sim", "sim.", "Não", "Talvez"] }, q(2), q(3, "t1", "aplicacao"), q(4, "t1", "analise")];
  assert.ok(validaMateriaBanco(materia(iguais)).join().includes("m-1: alternativas repetidas"));
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
