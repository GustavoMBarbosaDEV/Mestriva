// Gera conteudo/indice.json a partir dos arquivos de matéria (assim o índice nunca fica diferente dos arquivos).
// Uso: node ferramentas/monta-indice.mjs
// Matéria nova: crie conteudo/<id>.json e acrescente aqui a área e os apelidos (nomes alternativos usados nas grades).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "conteudo");

/** @type {Record<string, {area: string, apelidos: string[]}>} */
export const EXTRA = {};

const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "indice.json").sort();
const materias = arquivos.map((f) => {
  const m = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const extra = EXTRA[m.id] || { area: "Geral", apelidos: [] };
  return { id: m.id, nome: m.nome, apelidos: extra.apelidos, area: extra.area, topicos: m.topicos.map((t) => ({ id: t.id, nome: t.nome })) };
});
fs.writeFileSync(path.join(dir, "indice.json"), JSON.stringify({ versao: 1, materias }, null, 2) + "\n");
console.log(`conteudo/indice.json: ${materias.length} matérias`);
