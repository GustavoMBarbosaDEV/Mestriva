// Material da aula: organiza o texto lido de um PDF ou de fotos do quadro em material de estudo,
// no próprio aparelho e sem IA. Regras simples: limpa o texto, acha títulos, escolhe as frases mais
// representativas (frequência das palavras), destaca os termos que mais se repetem e reaproveita o
// gerador de cartões. O resultado é previsível e o estudante confere tudo antes de salvar.
import { cartoesDoTexto } from "./gerador.js";

/** Tamanho máximo do texto guardado de uma aula (o aparelho tem espaço limitado). */
export const LIMITE_TEXTO = 30000;
/** Menos letras que isso não dá material. */
const MINIMO_LETRAS = 80;

const VAZIAS = new Set(
  ("a ao aos as o os um uma uns umas de da das do dos em na nas no nos num numa por pela pelas pelo pelos para pra com sem sob sobre " +
    "entre ate apos ante e ou mas nem que se como quando onde porque pois porem tambem ja nao sim mais menos muito muita muitos muitas " +
    "pouco pouca tao tanto tanta cada todo toda todos todas outro outra outros outras mesmo mesma mesmos mesmas este esta estes estas esse " +
    "essa esses essas isso isto aquele aquela aqueles aquelas aquilo ele ela eles elas voce voces nos seu sua seus suas meu minha nosso " +
    "nossa lhe lhes ser sao era eram foi foram sera serao sendo sido estar esta estao estava estavam estiver ter tem tinha tinham tera " +
    "haver havia pode podem podera deve devem fazer faz fazem feito feita vai vao ainda entao assim apenas qual quais quem cujo cuja cujos " +
    "depois antes durante desde contra cerca vez vezes etc exemplo exemplos parte partes forma formas tipo tipos caso casos pagina slide " +
    "aula aulas professor professora prof assim seja sejam sobretudo geralmente principalmente outro algum alguma alguns algumas nenhum " +
    "nenhuma qualquer quaisquer grande grandes maior maiores menor menores primeiro primeira segundo segunda bem mal sempre nunca aqui ali la " +
    "onde neste nesta nesse nessa disso disto daquele dele dela deles delas numa dessa desse deste desta pelo seguinte seguintes tais tal").split(" ")
);

const PALAVRA = /[\p{L}][\p{L}'-]*/gu;
const LIGA = new Set(["de", "da", "do", "das", "dos"]);
/** Chave sem acento e em minúsculas, com o mesmo tamanho do texto original (para achar a posição). */
const chaveLetra = (c) => c.normalize("NFD")[0].toLowerCase();
const chave = (w) => [...w.normalize("NFC")].map(chaveLetra).join("");
const sigla = (w) => /^\p{Lu}{2,6}$/u.test(w);
const util = (w) => {
  const k = chave(w);
  return !VAZIAS.has(k) && (k.length >= 4 || sigla(w));
};

/**
 * Limpa o texto bruto: junta palavras quebradas por hífen no fim da linha, tira números de página,
 * cabeçalhos e rodapés repetidos e linhas sem letras (sujeira da leitura da foto), e padroniza os marcadores.
 * @param {string} bruto
 */
export function limpaTexto(bruto) {
  let t = String(bruto || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/­/g, "").replace(/[ \t ]+/g, " ");
  t = t.replace(/(\p{L})-\n\s*(\p{Ll})/gu, "$1$2");
  const linhas = t.split("\n").map((l) => l.trim());
  const conta = new Map();
  for (const l of linhas) if (l.length >= 4) conta.set(l, (conta.get(l) || 0) + 1);
  const saida = [];
  for (let l of linhas) {
    if (/^\d{1,4}$/.test(l) || /^(?:p[aá]g(?:ina)?\.?\s*)?\d{1,4}\s*(?:de|\/)\s*\d{1,4}$/i.test(l)) continue;
    if (l.length >= 4 && l.length <= 80 && (conta.get(l) || 0) >= 3) continue;
    l = l.replace(/^(?:[•●▪◦■□➢➤►▶✓✔·]\s*|[-–—*]\s+)/, "- ").replace(/^(\d{1,2})[.)]\s+/, "$1. ");
    if (l && !/\p{L}{2,}/u.test(l)) continue;
    saida.push(l);
  }
  return saida.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const FIM_FRASE = /[.!?…:;]$/;
const ehMarcador = (l) => /^(?:- |\d{1,2}\. )/.test(l);

/** Junta as linhas que são continuação da anterior (texto quebrado pelo PDF ou pela foto). */
function juntaLinhas(texto) {
  const saida = [];
  for (const l of texto.split("\n")) {
    const ant = saida[saida.length - 1];
    if (l && ant && !FIM_FRASE.test(ant) && /^[\p{Ll}(]/u.test(l)) saida[saida.length - 1] = `${ant} ${l}`;
    else saida.push(l);
  }
  return saida;
}

/** Linha que parece título: curta, sem pontuação final, começando com maiúscula (ou toda em maiúsculas). */
export function ehTitulo(l) {
  if (!l || ehMarcador(l) || l.length > 70 || l.length < 3) return false;
  if (/[.,;!?…]$/.test(l)) return false;
  const palavras = l.replace(/:$/, "").split(/\s+/);
  if (palavras.length > 9) return false;
  const letras = l.replace(/[^\p{L}]/gu, "");
  if (letras.length < 3) return false;
  if (letras === letras.toUpperCase()) return true;
  return /^(?:\d+(?:\.\d+)*\.?\s+)?\p{Lu}/u.test(l);
}

const formaTitulo = (l) => {
  const s = l.replace(/:$/, "").replace(/^\d+(?:\.\d+)*\.?\s+/, "").trim();
  const letras = s.replace(/[^\p{L}]/gu, "");
  return letras.length > 3 && letras === letras.toUpperCase() ? s[0] + s.slice(1).toLowerCase() : s;
};

/**
 * Blocos do texto: cada título com as linhas que vêm depois dele.
 * @param {string} texto já limpo
 * @returns {{titulo: string, linhas: string[]}[]}
 */
export function blocos(texto) {
  const lista = [{ titulo: "", linhas: /** @type {string[]} */ ([]) }];
  const linhas = juntaLinhas(texto);
  linhas.forEach((l, i) => {
    if (!l) return;
    const prox = linhas.slice(i + 1).find(Boolean);
    if (ehTitulo(l) && prox && !ehTitulo(prox)) lista.push({ titulo: formaTitulo(l), linhas: [] });
    else lista[lista.length - 1].linhas.push(l);
  });
  return lista.filter((b) => b.titulo || b.linhas.length);
}

/** Frases de uma linha (marcadores sem ponto contam como uma frase). */
function frasesDaLinha(l) {
  const sem = l.replace(/^(?:- |\d{1,2}\. )/, "");
  return sem.split(/(?<=[.!?…])\s+(?=[\p{Lu}\d"“(])/u).map((f) => f.trim()).filter((f) => /\p{L}{3,}/u.test(f));
}

/** Contagem das palavras e das duplas de palavras que se repetem, com a grafia mais usada. */
function contagens(frases) {
  const uni = new Map();
  const bi = new Map();
  const forma = new Map();
  const anota = (k, w) => {
    const f = forma.get(k) || new Map();
    f.set(w, (f.get(w) || 0) + 1);
    forma.set(k, f);
  };
  const dupla = (kb, grafada) => {
    bi.set(kb, (bi.get(kb) || 0) + 1);
    anota(kb, grafada);
  };
  for (const fr of frases) {
    const ws = fr.match(PALAVRA) || [];
    ws.forEach((w, i) => {
      if (!util(w)) return;
      const k = chave(w);
      uni.set(k, (uni.get(k) || 0) + 1);
      anota(k, w);
      const p = ws[i + 1];
      const q = ws[i + 2];
      if (p && util(p)) dupla(`${k} ${chave(p)}`, `${w} ${p}`);
      // "gradiente de concentração", "ciclo do ácido": termo com de/da/do no meio.
      else if (p && q && LIGA.has(chave(p)) && util(q)) dupla(`${k} ${chave(p)} ${chave(q)}`, `${w} ${p.toLowerCase()} ${q}`);
    });
  }
  const grafia = (k) => {
    const f = [...(forma.get(k) || new Map()).entries()].sort((a, b) => b[1] - a[1]);
    const melhor = f[0]?.[0] || k;
    if (melhor.split(" ").every(sigla)) return melhor;
    // Nome próprio (Piaget, Krebs) fica com maiúscula; o resto vai em minúsculas.
    const minuscula = f.find(([w]) => w === w.toLowerCase());
    return minuscula ? minuscula[0] : melhor.split(" ").map((w, i) => (sigla(w) || (i > 0 && /^\p{Lu}/u.test(w)) ? w : w.toLowerCase())).join(" ");
  };
  return { uni, bi, grafia };
}

/**
 * Termos que mais se repetem (duplas como "membrana plasmática" entram inteiras).
 * @param {string[]} frases @param {number} [max]
 * @returns {{chave: string, termo: string, vezes: number}[]}
 */
export function palavrasChave(frases, max = 10) {
  const { uni, bi, grafia } = contagens(frases);
  const duplas = [...bi.entries()].filter(([, n]) => n >= 2).map(([k, n]) => ({ chave: k, vezes: n, peso: n * 1.6 }));
  const soltas = [...uni.entries()]
    .filter(([k, n]) => n >= 2 && !duplas.some((d) => d.chave.split(" ").includes(k) && d.vezes >= n * 0.6))
    .map(([k, n]) => ({ chave: k, vezes: n, peso: n }));
  return [...duplas, ...soltas]
    .sort((a, b) => b.peso - a.peso || a.chave.localeCompare(b.chave))
    .slice(0, max)
    .map(({ chave: k, vezes }) => ({ chave: k, termo: grafia(k), vezes }));
}

/**
 * Frases mais representativas, na ordem em que aparecem no texto. Com grupos (os tópicos da aula),
 * cada grupo entra com pelo menos a sua melhor frase antes de completar pela nota.
 * @param {string[]} frases @param {number} [max] @param {number[]} [grupos] o grupo de cada frase
 */
export function resumoExtrativo(frases, max, grupos = []) {
  const boas = frases.map((f, i) => ({ f, i, g: grupos[i] ?? 0 })).filter(({ f }) => {
    const n = f.split(/\s+/).length;
    return n >= 5 && n <= 45;
  });
  const limite = max ?? Math.min(12, Math.max(3, Math.round(boas.length * 0.3)));
  if (boas.length <= limite) return boas.map((x) => x.f);
  const { uni } = contagens(boas.map((x) => x.f));
  const nota = boas.map((x, j) => {
    const ks = new Set((x.f.match(PALAVRA) || []).filter(util).map(chave));
    // Base de 1: uma frase sem palavras repetidas ainda pode ganhar pelos bônus abaixo.
    let s = 1;
    for (const k of ks) s += (uni.get(k) || 1) - 1;
    s /= Math.sqrt(x.f.split(/\s+/).length);
    if (/\s(?:é|são|significa|consiste|chama-se|define-se)\s/.test(x.f)) s *= 1.6;
    if (/^(?:ela|ele|elas|eles|isso|isto|esse|essa|este|esta)\s/i.test(x.f)) s *= 0.6; // fora do contexto, "Ela…" não diz de quem fala
    if (j === 0 || boas[j - 1].g !== x.g) s *= 1.2; // primeira frase do tópico
    return { ...x, s };
  });
  const porNota = [...nota].sort((a, b) => b.s - a.s || a.i - b.i);
  const escolhidas = new Set();
  for (const g of new Set(nota.map((x) => x.g))) {
    if (escolhidas.size >= limite) break;
    escolhidas.add(porNota.find((x) => x.g === g));
  }
  for (const x of porNota) {
    if (escolhidas.size >= limite) break;
    escolhidas.add(x);
  }
  return [...escolhidas].sort((a, b) => a.i - b.i).map((x) => x.f);
}

/** Põe em **negrito** o primeiro termo-chave de cada frase (até duas vezes por termo), para virar lacuna. */
function destaca(frase, termos, usos) {
  if (frase.includes("**")) return frase;
  const cs = [...frase];
  const k = cs.map(chaveLetra).join("");
  const letra = (c) => c !== undefined && /\p{L}/u.test(c);
  for (const t of termos) {
    if ((usos.get(t.chave) || 0) >= 2) continue;
    let de = 0;
    while (de <= k.length) {
      const p = k.indexOf(t.chave, de);
      if (p < 0) break;
      const fim = p + t.chave.length;
      if (!letra(cs[p - 1]) && !letra(cs[fim])) {
        usos.set(t.chave, (usos.get(t.chave) || 0) + 1);
        return `${cs.slice(0, p).join("")}**${cs.slice(p, fim).join("")}**${cs.slice(fim).join("")}`;
      }
      de = p + 1;
    }
  }
  return frase;
}

const dataCurta = (d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
const somaDias = (agora, n) => new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + n);
const negrito = (t) => `**${t.replace(/\*/g, "")}**`;

/**
 * Monta o material de estudo da aula.
 * @param {{texto: string, titulo?: string, origem?: string, agora?: Date}} p
 * @returns {{erro: string} | {erro: "", content: string, fonte: string, cortado: boolean, resumo: number, termos: number, perguntas: number}}
 */
export function montaMaterialDaAula({ texto, titulo = "", origem = "", agora = new Date() }) {
  let limpo = limpaTexto(texto);
  const letras = (limpo.match(/\p{L}/gu) || []).length;
  if (letras < MINIMO_LETRAS) return { erro: "O texto ficou curto demais para montar um material. Confira se o arquivo tem texto ou tire uma foto mais nítida." };
  const cortado = limpo.length > LIMITE_TEXTO;
  if (cortado) limpo = limpo.slice(0, LIMITE_TEXTO).replace(/\s+\S*$/, "");

  const bs = blocos(limpo);
  const frasesDe = (b) => b.linhas.flatMap(frasesDaLinha);
  const porBloco = bs.map(frasesDe);
  const todas = porBloco.flat();
  const termos = palavrasChave(todas, 10);
  const resumo = resumoExtrativo(todas, undefined, porBloco.flatMap((fs, g) => fs.map(() => g)));

  // Texto organizado: títulos, parágrafos e termos destacados.
  const usos = new Map();
  const fonte = bs
    .map((b) => {
      const corpo = b.linhas.map((l) => {
        const marca = /^(?:- |\d{1,2}\. )/.exec(l)?.[0] || "";
        const frs = frasesDaLinha(l).map((f) => destaca(f, termos, usos));
        return frs.length ? marca + frs.join(" ") : l;
      });
      return [b.titulo ? `### ${b.titulo}` : "", corpo.join("\n\n")].filter(Boolean).join("\n\n");
    })
    .join("\n\n");

  const definicoes = cartoesDoTexto(fonte).filter((c) => /^O que é /.test(c.frente));
  const titulos = bs.map((b) => b.titulo).filter(Boolean);
  const definidos = new Set(definicoes.map((c) => chave(c.frente.replace(/^O que é |\?$/g, ""))));

  const perguntas = [
    ...definicoes.slice(0, 5).map((c) => c.frente),
    ...titulos.slice(0, 4).map((t) => `Explique com suas palavras: ${t}.`),
    // Só termos compostos ou muito repetidos: "Defina gasto" não ajuda ninguém.
    ...termos
      .filter((t) => !definidos.has(t.chave) && (t.chave.includes(" ") || t.vezes >= 3))
      .slice(0, 3)
      .map((t) => `Defina ${negrito(t.termo)} e dê um exemplo da aula.`),
  ].slice(0, 10);

  const mapa = bs
    .filter((b) => b.titulo)
    .map((b) => {
      const doTitulo = chave(b.titulo);
      const locais = palavrasChave(frasesDe(b), 5)
        .filter((t) => !doTitulo.includes(t.chave) && !t.chave.includes(doTitulo))
        .slice(0, 3)
        .map((t) => t.termo);
      return `- ${negrito(b.titulo)}${locais.length ? `: ${locais.join(", ")}` : ""}`;
    });

  const secoes = [
    `*Montado no aparelho a partir de ${origem || "material da aula"}. Confira com o que o professor passou: a leitura de fotos pode errar letras e palavras.*`,
    "## Resumo",
    resumo.map((f) => `- ${f.replace(/\*\*/g, "")}`).join("\n"),
  ];
  if (termos.length) secoes.push("## Palavras-chave", termos.map((t) => negrito(t.termo)).join(" · "));
  if (definicoes.length) secoes.push("## Conceitos", definicoes.slice(0, 15).map((c) => `- ${negrito(c.frente.replace(/^O que é |\?$/g, ""))}: ${c.verso}`).join("\n"));
  if (mapa.length >= 2) secoes.push("## Mapa do conteúdo", `${titulo ? `${negrito(titulo)}\n\n` : ""}${mapa.join("\n")}`);
  if (perguntas.length) secoes.push("## Perguntas para treinar", "Responda sem olhar o texto. Depois confira e marque o que errou.", perguntas.map((q, i) => `${i + 1}. ${q}`).join("\n"));
  secoes.push(
    "## Plano de revisão",
    [
      "- **Hoje**: leia o resumo e responda às perguntas sem olhar o texto.",
      `- **${dataCurta(somaDias(agora, 1))}**: refaça as perguntas e o quiz dos cartões.`,
      `- **${dataCurta(somaDias(agora, 3))}**: explique o conteúdo em voz alta, como se ensinasse alguém.`,
      `- **${dataCurta(somaDias(agora, 7))}**: quiz de novo e releitura só do que errou.`,
      `- **${dataCurta(somaDias(agora, 15))}**: revisão final, de preferência antes da prova.`,
    ].join("\n")
  );

  return { erro: "", content: secoes.join("\n\n"), fonte, cortado, resumo: resumo.length, termos: termos.length, perguntas: perguntas.length };
}

/** Texto inteiro de um material (o que foi montado e, se houver, o texto da aula). */
export function textoCompleto(m) {
  return m?.fonte ? `${m.content || ""}\n\n## Texto da aula\n\n${m.fonte}` : m?.content || "";
}
