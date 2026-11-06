// Importar a grade a partir de um PDF ou de uma foto, lendo tudo no próprio aparelho (nada é enviado).
// PDF: pdf.js (vendor/pdfjs-*). Foto: reconhecimento de texto no aparelho (vendor/tesseract-*), carregado só quando usado.
import { normalizaNome } from "./conteudo.js";

const PDFJS = "/vendor/pdfjs-6.4.299";

/** Junta os pedaços de texto de uma página do PDF em linhas, pela posição vertical. */
export function linhasDosItens(itens) {
  const linhas = [];
  for (const it of itens) {
    if (!it.str || !it.str.trim()) continue;
    const y = it.transform[5];
    const x = it.transform[4];
    let l = linhas.find((ln) => Math.abs(ln.y - y) <= 2);
    if (!l) { l = { y, partes: [] }; linhas.push(l); }
    l.partes.push({ x, s: it.str.trim() });
  }
  return linhas.sort((a, b) => b.y - a.y).map((l) => l.partes.sort((a, b) => a.x - b.x).map((p) => p.s).join(" "));
}

const CABECALHO = /^(codigo|cod|disciplinas?|componentes?( curriculares?)?|carga|ch|creditos?|cr|total|pre requisitos?|co requisitos?|universidade|instituto|faculdade|centro|curso|matriz|grade|departamento|campus|optativas?|eletivas?|obrigatorias?|nucleo|eixo|hora|semestral|anual|legenda|pagina|coordenacao|reitoria|ementa|semestre letivo|assinatura|aprovad[oa])\b/;
const PERIODO_ANTES = /^(\d{1,2})\s*(?:o|º|°)?\s*(?:periodo|semestre|ano|modulo|etapa|serie|termo)\b/;
const PERIODO_DEPOIS = /^(?:periodo|semestre|modulo|etapa|termo)\s*(\d{1,2})\b/;
const ROMANO = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10 };
const PERIODO_ROMANO = /^([ivx]{1,4})o?\s*(?:periodo|semestre|ano|modulo|etapa|termo)\b/;
const ORDINAIS = ["primeir", "segund", "terceir", "quart", "quint", "sext", "setim", "oitav", "non", "decim"];
const PERIODO_EXTENSO = /^(primeir|segund|terceir|quart|quint|sext|setim|oitav|non|decim)[oa]\s+(?:periodo|semestre|ano|modulo|etapa|termo)\b/;
// Código de disciplina (MAT101, CIV-210, ENG 1001), mas não número romano seguido de carga ("Cálculo II 60").
const CODIGO = "(?!(?:I{1,3}|IV|VI{0,3}|IX|X)\\b)[A-ZÇ]{2,6}\\s?-?\\d{2,5}[A-Z]?";
const SO_CODIGOS = new RegExp(`^(?:${CODIGO}[\\s,;/]*)+$`);
const CODIGOS_NO_FIM = new RegExp(`(?:[\\s,;/]+${CODIGO})+\\s*$`);

/** Período escrito como "2º Período", "Período 2", "IIº Semestre" ou "Segundo Semestre". */
function periodoDaLinha(n) {
  const p = PERIODO_ANTES.exec(n) || PERIODO_DEPOIS.exec(n);
  if (p) return Number(p[1]);
  const r = PERIODO_ROMANO.exec(n);
  if (r && ROMANO[r[1]]) return ROMANO[r[1]];
  const e = PERIODO_EXTENSO.exec(n);
  if (e) return ORDINAIS.indexOf(e[1]) + 1;
  return 0;
}
const SEM_PERIODO = /^(optativas?|eletivas?|disciplinas optativas|componentes optativos)\b/;

/**
 * Matérias encontradas no texto de uma grade (PDF ou foto), para o estudante conferir antes de salvar.
 * @param {string} texto
 * @returns {{name:string, period:string, professor:string}[]}
 */
export function materiasDoTextoExtraido(texto) {
  const saida = [];
  const vistos = new Set();
  let periodo = "";
  for (const bruta of String(texto || "").split(/\r?\n/)) {
    const linha = bruta.replace(/\s+/g, " ").trim();
    if (!linha) continue;
    const n = normalizaNome(linha.replace(/º|°/g, "o"));
    const numero = periodoDaLinha(n);
    if (numero) { periodo = `${numero}º`; continue; }
    if (SO_CODIGOS.test(linha)) continue; // linha só com códigos (pré-requisitos)
    if (SEM_PERIODO.test(n)) { periodo = ""; continue; }
    if (CABECALHO.test(n)) continue;

    let resto = linha;
    let professor = "";
    const prof = /\bProf(?:\.|essora?|a\.)?\s+(.+)$/i.exec(resto);
    if (prof) {
      professor = prof[1].replace(/[\s\d.,;:()hH-]+$/, "").trim().slice(0, 120);
      resto = resto.slice(0, prof.index);
    }
    resto = resto
      .replace(/^[A-ZÇ]{2,6}\s?-?\d{2,5}[A-Z]?\b\s*[-–—:]?\s*/, "") // código da disciplina (MAT101, CIV-210)
      .replace(/^\d{1,3}\s*[-–—.)]?\s+(?=[A-Za-zÀ-ÿ])/, "") // numeração "1 - " ou "1 "
      .replace(/\(\s*\d+\s*(?:h|horas?|cr|creditos?|créditos?)?\s*\)/gi, ""); // (60h)
    // O fim da linha pode ter, em qualquer ordem: traço de pré-requisito vazio, códigos de pré-requisito, carga e créditos.
    for (let antes = ""; antes !== resto; ) {
      antes = resto;
      resto = resto
        .replace(/[\s\-–—:;,.]+$/, "")
        .replace(CODIGOS_NO_FIM, "")
        .replace(/(?:\s+\d+(?:[.,]\d+)?\s*(?:h|horas?|cr|creditos?|créditos?)?)+\s*$/i, "")
        .trim();
    }
    const letras = (resto.match(/[A-Za-zÀ-ÿ]/g) || []).length;
    if (letras < 3 || resto.length > 90 || !/[A-Za-zÀ-ÿ]{3,}/.test(resto)) continue;
    const chave = normalizaNome(resto);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push({ name: resto.slice(0, 120), period: periodo, professor });
  }
  return saida.slice(0, 80);
}

/** Texto de um PDF (todas as páginas), no aparelho. @param {File} arquivo */
export async function textoDoPdf(arquivo) {
  const pdfjs = await import(`${PDFJS}/pdf.min.mjs`);
  pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS}/pdf.worker.min.mjs`;
  const tarefa = pdfjs.getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()), isEvalSupported: false });
  const doc = await tarefa.promise;
  const linhas = [];
  for (let i = 1; i <= Math.min(doc.numPages, 30); i += 1) {
    const pagina = await doc.getPage(i);
    const conteudo = await pagina.getTextContent();
    linhas.push(...linhasDosItens(conteudo.items));
  }
  await tarefa.destroy();
  return linhas.join("\n");
}

const TESS = "/vendor/tesseract-7.0.0";

/**
 * Texto de uma foto da grade, reconhecido no aparelho (Tesseract). Na primeira vez baixa uns 10 MB
 * (motor e português), que ficam guardados no aparelho. @param {File} arquivo @param {(p: number) => void} [progresso] 0–1
 */
export async function textoDaFoto(arquivo, progresso = () => {}) {
  const mod = await import(`${TESS}/tesseract.esm.min.js`);
  const createWorker = mod.createWorker || mod.default?.createWorker;
  const worker = await createWorker("por", 1, {
    workerPath: `${TESS}/worker.min.js`,
    corePath: `${TESS}/core`,
    langPath: `${TESS}/lang`,
    workerBlobURL: false,
    gzip: true,
    logger: (m) => { if (m.status === "recognizing text") progresso(m.progress || 0); },
  });
  try {
    const { data } = await worker.recognize(arquivo);
    return data.text || "";
  } finally {
    await worker.terminate();
  }
}
