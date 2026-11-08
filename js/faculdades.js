// Faculdades e cursos de graduação (conteudo/faculdades.json, gerado dos microdados do INEP por
// ferramentas/monta-faculdades.mjs). Busca pura (testada) + carregamento sob demanda.
import { normalizaNome } from "./conteudo.js";
import { CONTATO } from "./ui/marca.js";

/** @type {Promise<any>|null} */
let dados = null;

/** {versao, fonte, cursos: string[], faculdades: [{id, nome, sigla, uf, cidade, tipo, cursos: number[]}]}; vazio se não carregar. */
export function carregaFaculdades() {
  if (!dados) {
    dados = fetch("/conteudo/faculdades.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("faculdades"))))
      .catch(() => { dados = null; return { versao: 1, cursos: [], faculdades: [] }; });
  }
  return dados;
}

const textoDe = (f) => normalizaNome(`${f.sigla} ${f.nome} ${f.cidade} ${f.uf} ${f.tipo}`);

/**
 * Faculdades que batem com o termo (todas as palavras), as mais prováveis primeiro:
 * sigla igual, depois sigla ou nome começando pelo termo, depois o resto em ordem alfabética.
 */
export function buscaFaculdades(d, termo, limite = 8) {
  const alvo = normalizaNome(termo);
  if (!alvo) return [];
  const palavras = alvo.split(" ");
  const nota = (f) => {
    const sigla = normalizaNome(f.sigla);
    if (sigla === alvo) return 0;
    if (sigla.startsWith(alvo) || normalizaNome(f.nome).startsWith(alvo)) return 1;
    return 2;
  };
  return (d?.faculdades || [])
    .filter((f) => { const t = textoDe(f); return palavras.every((p) => t.includes(p)); })
    .map((f) => [nota(f), f])
    .sort((a, b) => a[0] - b[0] || a[1].nome.localeCompare(b[1].nome, "pt"))
    .slice(0, limite)
    .map(([, f]) => f);
}

/** Nomes dos cursos da faculdade (os com mais alunos primeiro), filtrados pelo termo. */
export function cursosDaFaculdade(d, faculdade, termo = "", limite = 12) {
  if (!faculdade) return [];
  const palavras = normalizaNome(termo).split(" ").filter(Boolean);
  return faculdade.cursos
    .map((i) => d.cursos[i])
    .filter((c) => c && palavras.every((p) => normalizaNome(c).includes(p)))
    .slice(0, limite);
}

/** "UFJF · Juiz de Fora/MG" */
export const rotuloFaculdade = (f) => `${f.sigla ? `${f.sigla} · ` : ""}${f.cidade}/${f.uf}`;

/** E-mail já preenchido pedindo para incluir a faculdade ou o curso. */
export function pedidoDeFaculdade({ faculdade = "", cidade = "", curso = "" }, contato = CONTATO) {
  const assunto = `Incluir no Mestriva: ${faculdade || curso || "faculdade"}`.slice(0, 120);
  const texto = `Olá! Não achei minha faculdade ou meu curso no Mestriva.\n\nFaculdade: ${faculdade}\nCidade/estado: ${cidade}\nCurso: ${curso}\n`;
  return `mailto:${contato}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`;
}
