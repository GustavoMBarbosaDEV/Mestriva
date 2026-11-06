// Gera cartões, lacunas e questões a partir das anotações do estudante, no próprio aparelho (sem IA).
// Regras simples e previsíveis: definições ("X é…", "X: …", "X — …"), títulos com o parágrafo seguinte e termos em **negrito**.

const semMarcacao = (t) => t.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/[*_`]/g, "").trim();
const maiuscula = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);
const ponto = (t) => (/[.!?]$/.test(t) ? t : `${t}.`);
/** Primeira letra minúscula, a não ser em sigla (ATP, DNA). */
const termo = (t) => (t.length > 1 && t[1] === t[1].toLowerCase() ? t[0].toLowerCase() + t.slice(1) : t);
const ARTIGO = /^(o|a|os|as|um|uma)\s+/i;

function frases(texto) {
  return String(texto)
    .replace(/\r\n?/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((f) => f.trim())
    .filter(Boolean);
}

/** @param {string} texto @returns {{tipo:"pergunta", frente:string, verso:string}[]} */
export function cartoesDoTexto(texto) {
  const cartoes = [];
  const vistos = new Set();
  const add = (frente, verso) => {
    const v = semMarcacao(verso);
    if (!v || v.length < 8 || vistos.has(frente)) return;
    vistos.add(frente);
    cartoes.push({ tipo: "pergunta", frente, verso: maiuscula(ponto(v)) });
  };
  const linhas = String(texto || "").replace(/\r\n?/g, "\n").split("\n");
  for (let i = 0; i < linhas.length; i += 1) {
    const l = linhas[i].trim();
    const titulo = /^#{2,3}\s+(.+)$/.exec(l);
    if (titulo) {
      const par = [];
      for (let j = i + 1; j < linhas.length && linhas[j].trim() && !/^#/.test(linhas[j].trim()); j += 1) par.push(linhas[j].trim());
      if (par.length) add(`Explique: ${semMarcacao(titulo[1])}`, par.join(" "));
      continue;
    }
    if (/^#/.test(l)) continue;
    const doisPontos = /^([^:.—]{2,60}?)\s*(?::|\s—\s|\s–\s)\s*(.{8,})$/.exec(l);
    if (doisPontos && doisPontos[1].trim().split(/\s+/).length <= 5) {
      add(`O que é ${termo(semMarcacao(doisPontos[1]).replace(ARTIGO, ""))}?`, doisPontos[2]);
      continue;
    }
    for (const f of frases(l)) {
      const def = /^(.{2,60}?)\s+(?:é|são)\s+(.{8,})$/.exec(semMarcacao(f));
      if (!def) continue;
      const t = def[1].replace(ARTIGO, "").trim();
      if (t.split(/\s+/).length > 4 || /^(isso|isto|ele|ela|que|onde|quando)\b/i.test(t)) continue;
      add(`O que é ${termo(t)}?`, def[2]);
    }
  }
  return cartoes;
}

/** Frases com termo em **negrito** viram lacuna. @param {string} texto */
export function lacunasDoTexto(texto) {
  const lacunas = [];
  for (const f of frases(texto || "")) {
    const m = /\*\*([^*]+)\*\*/.exec(f);
    if (!m) continue;
    const frente = semMarcacao(f.replace(m[0], "\u0000")).replace("\u0000", "______");
    lacunas.push({ tipo: "lacuna", frente, verso: m[1].trim() });
  }
  return lacunas;
}

function embaralha(lista, sorteio) {
  const l = [...lista];
  for (let i = l.length - 1; i > 0; i -= 1) {
    const j = Math.floor(sorteio() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

/** Id estável a partir do texto (para a repetição espaçada lembrar da questão). */
function idDe(t) {
  let h = 0;
  for (let i = 0; i < t.length; i += 1) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  return `est-${h.toString(36)}`;
}

/**
 * Questões de múltipla escolha com os cartões: as alternativas erradas são as respostas de outros cartões.
 * Precisa de pelo menos 4 cartões com respostas diferentes.
 */
export function questoesDoEstudante(cartoes, sorteio = Math.random) {
  const versos = [...new Set(cartoes.map((c) => c.verso))];
  if (versos.length < 4) return [];
  return cartoes.map((c) => {
    const outros = embaralha(versos.filter((v) => v !== c.verso), sorteio).slice(0, 3);
    const opcoes = embaralha([c.verso, ...outros], sorteio);
    return {
      id: idDe(c.frente),
      topico: "",
      nivel: "conceitual",
      pergunta: c.frente,
      opcoes,
      correta: opcoes.indexOf(c.verso),
      explicacao: `Isso está nas suas anotações: ${c.verso}`,
      origem: "estudante",
    };
  });
}
