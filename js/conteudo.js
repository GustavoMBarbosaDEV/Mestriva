// Motor do conteúdo sem IA: achar a matéria no banco, validar o banco, repetição espaçada,
// montar o quiz e montar a revisão do que o estudante errou. Tudo puro (testado com node --test).

const ROMANOS = { i: "1", ii: "2", iii: "3", iv: "4", v: "5", vi: "6", vii: "7", viii: "8", ix: "9", x: "10" };

/** "Cálculo II" → "calculo 2". */
export function normalizaNome(s = "") {
  return String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((p) => ROMANOS[p] || p)
    .join(" ");
}

// Palavras que as grades acrescentam sem mudar a matéria ("Física Geral e Experimental I" = "Física I").
const VAZIAS = new Set(
  (
    "a o e de da do das dos ao aos as os em na no nas nos para com " +
    "geral gerais experimental basica basico basicas fundamentos fundamental introducao introdutoria elementos nocoes principios humana humano"
  ).split(" "),
);

/** Miolo do nome: palavras que importam + o nível (número no fim; sem número = 1). */
function miolo(nome) {
  const partes = normalizaNome(nome).split(" ").filter(Boolean);
  let nivel = 1;
  if (partes.length > 1 && /^\d+$/.test(partes.at(-1))) nivel = Number(partes.pop());
  return { palavras: partes.filter((p) => !VAZIAS.has(p)), nivel };
}

/**
 * Id da matéria do banco que corresponde ao nome cadastrado na grade, ou null.
 * 1º nome ou apelido igual; 2º mesmo miolo e mesmo nível; 3º nome curto da grade contido
 * no nome do banco ("Anatomia" → Anatomia Humana), só se uma matéria servir.
 * Nunca liga níveis diferentes: "Cálculo II" não puxa Cálculo I.
 */
export function achaNoBanco(nome, indice) {
  const alvo = normalizaNome(nome);
  if (!alvo || !indice?.materias) return null;
  const nomes = (m) => [m.nome, ...(m.apelidos || [])];
  for (const m of indice.materias) {
    if (nomes(m).some((n) => normalizaNome(n) === alvo)) return m.id;
  }
  const g = miolo(nome);
  if (!g.palavras.length) return null;
  const chave = g.palavras.join(" ");
  const iguais = new Set();
  const contidos = new Set();
  for (const m of indice.materias) {
    for (const n of nomes(m)) {
      const b = miolo(n);
      if (b.nivel !== g.nivel || !b.palavras.length) continue;
      if (b.palavras.join(" ") === chave) iguais.add(m.id);
      // Uma palavra solta ("Imunologia", "Engenharia") é pouco para afirmar que é a mesma matéria.
      else if (g.palavras.length >= 2 && g.palavras.every((p) => b.palavras.includes(p)) && g.palavras.some((p) => p.length >= 4)) contidos.add(m.id);
    }
  }
  if (iguais.size === 1) return [...iguais][0];
  if (!iguais.size && contidos.size === 1) return [...contidos][0];
  return null;
}

/** Valor de materia.banco quando a pessoa escolheu não ligar a matéria a nenhum conteúdo. */
export const SEM_BANCO = "nenhum";

/** Conteúdo do banco da matéria da grade: o que a pessoa escolheu ou, sem escolha, o achado pelo nome. */
export function bancoDaMateria(m, indice) {
  if (!m) return null;
  if (m.banco === SEM_BANCO) return null;
  const lista = indice?.materias || [];
  if (m.banco && (!lista.length || lista.some((x) => x.id === m.banco))) return m.banco;
  return achaNoBanco(m.name, indice);
}

/** Matérias do banco que batem com a busca (nome, apelido ou área), em ordem de área e nome. */
export function filtraBanco(indice, busca = "") {
  const palavras = normalizaNome(busca).split(" ").filter(Boolean);
  return (indice?.materias || [])
    .filter((m) => {
      const texto = normalizaNome([m.nome, m.area, ...(m.apelidos || [])].join(" "));
      return palavras.every((p) => texto.includes(p));
    })
    .sort((a, b) => (a.area || "").localeCompare(b.area || "", "pt") || a.nome.localeCompare(b.nome, "pt"));
}

/** Chave para comparar alternativas: ignora maiúsculas, espaços e pontuação final, mas não os símbolos. */
function chaveAlternativa(o) {
  return String(o).normalize("NFKC").toLowerCase().replace(/\s+/g, " ").replace(/[.;:!?]+$/, "").trim();
}

/** Lista de problemas da matéria do banco (vazia = ok). Regras das checagens automáticas do lançamento. */
export function validaMateriaBanco(m) {
  const erros = [];
  const topicos = new Set((m.topicos || []).map((t) => t.id));
  for (const t of m.topicos || []) {
    if (!t.resumo || !String(t.resumo).trim()) erros.push(`${t.id}: sem resumo`);
    if (!t.revisao || !String(t.revisao).trim()) erros.push(`${t.id}: sem revisão`);
  }
  const ids = new Set();
  const perguntas = new Set();
  const porTopico = new Map();
  let fortes = 0;
  for (const q of m.questoes || []) {
    if (ids.has(q.id)) erros.push(`id repetido: ${q.id}`);
    ids.add(q.id);
    const p = normalizaNome(q.pergunta);
    if (perguntas.has(p)) erros.push(`pergunta repetida: ${q.id}`);
    perguntas.add(p);
    if (!Array.isArray(q.opcoes) || q.opcoes.length !== 4) erros.push(`${q.id}: precisa de 4 alternativas`);
    // Mantém símbolos: "p > 1" e "p < 1", "O(n²)" e "O(n)" são alternativas diferentes.
    else if (new Set(q.opcoes.map(chaveAlternativa)).size !== 4) erros.push(`${q.id}: alternativas repetidas`);
    if (!Number.isInteger(q.correta) || q.correta < 0 || q.correta > 3) erros.push(`${q.id}: correta fora do intervalo`);
    if (!q.explicacao || String(q.explicacao).trim().length < 40) erros.push(`${q.id}: explicação curta`);
    if (!topicos.has(q.topico)) erros.push(`${q.id}: tópico desconhecido`);
    if (!["conceitual", "aplicacao", "analise"].includes(q.nivel)) erros.push(`${q.id}: nível inválido`);
    if (q.nivel === "aplicacao" || q.nivel === "analise") fortes += 1;
    porTopico.set(q.topico, (porTopico.get(q.topico) || 0) + 1);
  }
  for (const t of m.topicos || []) if ((porTopico.get(t.id) || 0) < 4) erros.push(`${t.id}: menos de 4 questões`);
  const total = (m.questoes || []).length;
  if (total && fortes / total < 0.2) erros.push("menos de 20% de questões de aplicação ou análise");
  return erros;
}

export const INTERVALOS = [1, 3, 7, 15];
const DIA = 86400000;

/** Atualiza o histórico de uma questão. erros: {id: {a, e, prox}} (a = acertos seguidos, e = erros). */
export function registraResposta(erros, id, acertou, agora = new Date()) {
  const atual = erros[id] || { a: 0, e: 0, prox: "" };
  const a = acertou ? Math.min(atual.a + 1, INTERVALOS.length) : 0;
  const dias = acertou ? INTERVALOS[a - 1] : 1;
  return { ...erros, [id]: { a, e: atual.e + (acertou ? 0 : 1), prox: new Date(agora.getTime() + dias * DIA).toISOString() } };
}

/** Fisher–Yates com sorteio injetável (testes). */
function embaralha(lista, sorteio) {
  const l = [...lista];
  for (let i = l.length - 1; i > 0; i -= 1) {
    const j = Math.floor(sorteio() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

/**
 * Escolhe as questões: primeiro as vencidas (mais erradas antes), depois as nunca vistas, depois as outras.
 * @param {{questoes:any[], qtd:number, erros:Record<string,{a:number,e:number,prox:string}>, agora?:Date, sorteio?:() => number}} p
 */
export function montaQuiz({ questoes, qtd, erros = {}, agora = new Date(), sorteio = Math.random }) {
  const t = agora.getTime();
  const vencidas = [];
  const novas = [];
  const resto = [];
  for (const q of questoes) {
    const h = erros[q.id];
    if (!h) novas.push(q);
    else if (!h.prox || Date.parse(h.prox) <= t) vencidas.push(q);
    else resto.push(q);
  }
  vencidas.sort((a, b) => erros[b.id].e - erros[a.id].e);
  resto.sort((a, b) => Date.parse(erros[a.id].prox) - Date.parse(erros[b.id].prox));
  return [...vencidas, ...embaralha(novas, sorteio), ...resto].slice(0, qtd);
}

/** Mesma questão com as alternativas em outra ordem (a correta acompanha). */
export function embaralhaAlternativas(q, sorteio = Math.random) {
  const ordem = embaralha(q.opcoes.map((_, i) => i), sorteio);
  return { ...q, opcoes: ordem.map((i) => q.opcoes[i]), correta: ordem.indexOf(q.correta) };
}

/** Tópicos da matéria citados no texto do estudante. */
function topicosDoTexto(materia, texto) {
  if (!materia) return [];
  // Mesma busca do tutor e do quiz, só nesta matéria e sem contar o nome dela.
  const ids = new Set(topicosCitados(texto, { materias: [materia] }, [materia.nome]).map((t) => t.topico));
  return materia.topicos.filter((t) => ids.has(t.id));
}

/**
 * Revisão do que errou, com as seções (O que aconteceu, Reconstruindo a base, Passo a passo,
 * Treino rápido, Plano de 3 dias). Devolve markdown (o leitor escapa tudo).
 * @param {{materia:any|null, erradas:any[], texto:string}} p
 */
export function revisaoDosErros({ materia, erradas = [], texto = "" }) {
  const ids = new Set(erradas.map((q) => q.topico));
  const topicos = [...(materia?.topicos || []).filter((t) => ids.has(t.id)), ...topicosDoTexto(materia, texto).filter((t) => !ids.has(t.id))];
  const nomes = topicos.map((t) => t.nome);
  const partes = [];

  partes.push("## O que aconteceu");
  if (texto.trim()) partes.push(`Você anotou: "${texto.trim()}".`);
  partes.push(
    nomes.length
      ? `Os erros se concentram em: ${nomes.join(", ")}. Isso costuma indicar uma base que ficou frágil, não falta de capacidade — dá para fechar essas lacunas com treino focado.`
      : "Erro em prova quase sempre vem de um conceito que ficou pela metade ou de pressa na leitura do enunciado. Vamos reconstruir a base e treinar."
  );

  partes.push("## Reconstruindo a base");
  if (topicos.length) for (const t of topicos) partes.push(`### ${t.nome}`, t.resumo, t.revisao);
  else partes.push("Releia o conteúdo da aula sobre esse tema e escreva, sem olhar, as definições principais. Depois compare com o material e marque o que faltou.");

  partes.push("## Passo a passo do exercício");
  const exemplo = erradas[0];
  if (exemplo) {
    partes.push(`**Questão:** ${exemplo.pergunta}`, `1. Leia o enunciado e sublinhe o que ele pede.`, `2. Lembre o conceito envolvido (${(materia?.topicos || []).find((t) => t.id === exemplo.topico)?.nome || "veja acima"}).`, `3. Resposta correta: **${exemplo.opcoes[exemplo.correta]}**.`, `4. Por quê: ${exemplo.explicacao}`);
  } else {
    partes.push("1. Pegue uma questão parecida com a que você errou.", "2. Escreva o que o enunciado pede antes de calcular ou responder.", "3. Resolva devagar, justificando cada passo em uma frase.", "4. Confira com o gabarito e anote onde travou.");
  }

  partes.push("## Treino rápido");
  const idsErrados = new Set(erradas.map((q) => q.id));
  const treino = (materia?.questoes || []).filter((q) => (ids.has(q.topico) || topicos.some((t) => t.id === q.topico)) && !idsErrados.has(q.id)).slice(0, 5);
  if (treino.length) treino.forEach((q, i) => partes.push(`**${i + 1}.** ${q.pergunta}`, `> Resposta: ${q.opcoes[q.correta]} — ${q.explicacao}`));
  else partes.push("Faça 5 exercícios curtos do mesmo tipo (lista da aula ou do livro) e corrija na hora. Erre no treino, não na prova.");

  partes.push(
    "## Plano de 3 dias",
    "- **Dia 1:** 25 minutos relendo a base acima e escrevendo um resumo de memória; 25 minutos refazendo a questão errada sem olhar a resposta.",
    "- **Dia 2:** 25 minutos de treino rápido (5 exercícios) e 25 minutos explicando o conteúdo em voz alta, como se ensinasse alguém.",
    "- **Dia 3:** um quiz desta matéria no Mestriva; o que errar volta para a revisão."
  );
  return partes.join("\n\n");
}

// Palavras genéricas que aparecem em nomes de tópico de várias áreas e não identificam conteúdo sozinhas.
const GENERICAS = new Set(["sistem", "teoria", "relaca", "princi", "estrut", "organi", "aplica", "geral", "concei", "introd", "basica", "fundam", "metodo", "tipos", "regras", "abordag", "aborda", "explic", "entend", "quero", "sobre", "saber", "estuda", "precis", "melhor", "funcio", "pergun", "materi", "conteu", "quanto", "porque", "quais", "forma", "exemp", "exempl", "pratic", "coisas", "calcul", "resolv", "difere", "import", "dados"]);

/** Raízes (6 letras) das palavras com 5+ letras, sem as genéricas. */
export function raizesSignificativas(t) {
  return [...new Set(normalizaNome(t).split(" ").filter((p) => p.length >= 5).map((p) => p.slice(0, 6)).filter((r) => !GENERICAS.has(r)))];
}

/**
 * Tópicos citados no texto. Uma raiz em comum basta só se ela for de uma única matéria do índice
 * (palavra específica, como "mitose"); senão precisa de duas. Nomes em `ignorar` (ex.: o nome da matéria) não contam.
 * @param {string} texto @param {{materias:any[]}} indice @param {string[]} [ignorar]
 * @returns {{materia:string, topico:string, pontos:number}[]} do mais citado para o menos
 */
export function topicosCitados(texto, indice, ignorar = []) {
  const fora = new Set(ignorar.flatMap((n) => raizesSignificativas(n)));
  const q = new Set(raizesSignificativas(texto).filter((r) => !fora.has(r)));
  if (!q.size) return [];
  const materiasPorRaiz = new Map();
  for (const m of indice?.materias || []) for (const t of m.topicos || []) for (const r of raizesSignificativas(t.nome)) {
    if (!materiasPorRaiz.has(r)) materiasPorRaiz.set(r, new Set());
    materiasPorRaiz.get(r).add(m.id);
  }
  const achados = [];
  for (const m of indice?.materias || []) {
    for (const t of m.topicos || []) {
      const comuns = raizesSignificativas(t.nome).filter((r) => q.has(r));
      const especifica = comuns.some((r) => materiasPorRaiz.get(r)?.size === 1);
      if (comuns.length >= 2 || (comuns.length === 1 && especifica)) achados.push({ materia: m.id, topico: t.id, pontos: comuns.length });
    }
  }
  return achados.sort((a, b) => b.pontos - a.pontos);
}
