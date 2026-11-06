// Gera conteudo/indice.json a partir dos arquivos de matéria (assim o índice nunca fica diferente dos arquivos).
// Uso: node ferramentas/monta-indice.mjs
// Matéria nova: crie conteudo/<id>.json e acrescente aqui a área e os apelidos (nomes alternativos usados nas grades).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizaNome } from "../js/conteudo.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "conteudo");

/** @type {Record<string, {area: string, apelidos: string[]}>} */
export const EXTRA = {
  "calculo-1": {
    "area": "Exatas",
    "apelidos": [
      "Cálculo 1",
      "Cálculo Diferencial e Integral I",
      "Cálculo A"
    ]
  },
  "algebra-linear": {
    "area": "Exatas",
    "apelidos": [
      "Álgebra Linear I",
      "Álgebra Linear e Geometria Analítica",
      "Introdução à Álgebra Linear"
    ]
  },
  "estatistica": {
    "area": "Exatas",
    "apelidos": [
      "Estatística Básica",
      "Probabilidade e Estatística",
      "Estatística Aplicada",
      "Bioestatística"
    ]
  },
  "fisica-1": {
    "area": "Exatas",
    "apelidos": [
      "Física 1",
      "Física Geral I",
      "Mecânica Clássica"
    ]
  },
  "quimica-geral": {
    "area": "Exatas",
    "apelidos": [
      "Química Geral I",
      "Química Básica",
      "Química Fundamental"
    ]
  },
  "algoritmos-programacao": {
    "area": "Exatas",
    "apelidos": [
      "Algoritmos",
      "Lógica de Programação",
      "Introdução à Programação",
      "Programação I"
    ]
  },
  "biologia-celular": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Biologia Celular e Molecular",
      "Citologia",
      "Biologia Celular e Tecidual"
    ]
  },
  "anatomia-humana": {
    "area": "Biológicas e Saúde",
    "apelidos": [
      "Anatomia Sistêmica",
      "Anatomia Humana Básica",
      "Anatomia Geral"
    ]
  },
  "metodologia-cientifica": {
    "area": "Multidisciplinar",
    "apelidos": [
      "Metodologia da Pesquisa",
      "Metodologia do Trabalho Científico",
      "Iniciação Científica",
      "Metodologia da Pesquisa Científica"
    ]
  },
  "introducao-economia": { "area": "Negócios", "apelidos": ["Economia I", "Fundamentos de Economia", "Economia Geral", "Introdução à Teoria Econômica"] },
  "contabilidade-introdutoria": { "area": "Negócios", "apelidos": ["Contabilidade Geral", "Contabilidade Básica", "Contabilidade I", "Fundamentos de Contabilidade"] },
  "teoria-geral-administracao": { "area": "Negócios", "apelidos": ["TGA", "Introdução à Administração", "Fundamentos da Administração", "Teorias da Administração"] },
  "portugues-redacao": { "area": "Letras", "apelidos": ["Leitura e Produção de Textos", "Comunicação e Expressão", "Língua Portuguesa", "Produção Textual"] },
  "introducao-direito": { "area": "Direito", "apelidos": ["IED", "Introdução ao Direito", "Teoria Geral do Direito"] },
  "direito-constitucional": { "area": "Direito", "apelidos": ["Direito Constitucional I", "Teoria da Constituição"] }
};

const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "indice.json").sort();
const materias = arquivos.map((f) => {
  const m = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const extra = EXTRA[m.id] || { area: "Geral", apelidos: [] };
  // Descarta apelido que, normalizado, é igual ao nome ou a outro apelido ("Cálculo 1" = "Cálculo I").
  const vistos = new Set([normalizaNome(m.nome)]);
  const apelidos = extra.apelidos.filter((a) => !vistos.has(normalizaNome(a)) && vistos.add(normalizaNome(a)));
  return { id: m.id, nome: m.nome, apelidos, area: extra.area, topicos: m.topicos.map((t) => ({ id: t.id, nome: t.nome })) };
});
fs.writeFileSync(path.join(dir, "indice.json"), JSON.stringify({ versao: 1, materias }, null, 2) + "\n");
console.log(`conteudo/indice.json: ${materias.length} matérias`);
