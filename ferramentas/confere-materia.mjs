// Confere um arquivo de matéria do banco com as mesmas regras do teste.
// Uso: node ferramentas/confere-materia.mjs conteudo/calculo-1.json
import fs from "node:fs";
import { validaMateriaBanco } from "../js/conteudo.js";

let falhou = false;
for (const arq of process.argv.slice(2)) {
  let m;
  try {
    m = JSON.parse(fs.readFileSync(arq, "utf8"));
  } catch (e) {
    console.error(`${arq}: JSON inválido — ${e.message}`);
    falhou = true;
    continue;
  }
  const erros = validaMateriaBanco(m);
  if ((m.questoes || []).length < 25) erros.push(`só ${(m.questoes || []).length} questões (mínimo 25)`);
  for (const q of m.questoes || []) if (!String(q.id).startsWith(`${m.id}-`)) erros.push(`id fora do padrão: ${q.id}`);
  const corretas = [0, 1, 2, 3].map((i) => (m.questoes || []).filter((q) => q.correta === i).length);
  if (Math.max(...corretas) > (m.questoes || []).length * 0.45) erros.push(`gabarito concentrado demais: ${corretas.join("/")}`);
  if (erros.length) {
    falhou = true;
    console.error(`${arq}:\n  - ${erros.join("\n  - ")}`);
  } else {
    console.log(`${arq}: ok (${m.questoes.length} questões, ${m.topicos.length} tópicos, gabarito ${corretas.join("/")})`);
  }
}
process.exit(falhou ? 1 : 0);
