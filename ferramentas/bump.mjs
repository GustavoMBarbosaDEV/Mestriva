// Troca a versão do app nos lugares que dependem dela.
// Uso: cd ferramentas && npm run bump -- 0.2.0
//   js/versao.js  export const VERSAO = "X.Y.Z";
//   sw.js         const V = "X.Y.Z";   (nome do cache)
//   index.html    ?v=X.Y.Z em style.css, boot.css, pre.js e js/app.js
// NOVIDADES (js/versao.js) e CHANGELOG.md continuam à mão.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = process.env.MESTRIVA_RAIZ || path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const nova = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(nova || "")) {
  console.error("Uso: npm run bump -- X.Y.Z");
  process.exit(1);
}

function troca(arquivo, trocas) {
  const f = path.join(raiz, arquivo);
  let t = fs.readFileSync(f, "utf8");
  for (const [re, novo, esperado] of trocas) {
    const n = (t.match(re) || []).length;
    if (n !== esperado) {
      console.error(`${arquivo}: esperava ${esperado} ocorrência(s) de ${re}, achei ${n}. Nada foi alterado.`);
      process.exit(1);
    }
    t = t.replace(re, novo);
  }
  return () => fs.writeFileSync(f, t);
}

const COM_V = ["style.css", "boot.css", "pre.js", "js/app.js"];
const gravar = [
  troca(path.join("js", "versao.js"), [[/export const VERSAO = "\d+\.\d+\.\d+";/g, `export const VERSAO = "${nova}";`, 1]]),
  troca("sw.js", [[/const V = "\d+\.\d+\.\d+";/g, `const V = "${nova}";`, 1]]),
  troca("index.html", COM_V.map((a) => [new RegExp(`((?:href|src)="/${a.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")})\\?v=[0-9.]+"`, "g"), `$1?v=${nova}"`, 1])),
  ...["privacidade.html", "termos.html", "faq.html"].filter((p) => fs.existsSync(path.join(raiz, p))).map((p) =>
    troca(p, ["style.css", "pre.js"].map((a) => [new RegExp(`((?:href|src)="/${a.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")})\\?v=[0-9.]+"`, "g"), `$1?v=${nova}"`, 1]))
  ),
];
gravar.forEach((g) => g());
console.log(`Versão ${nova}. Falta escrever NOVIDADES em js/versao.js e a entrada no CHANGELOG.md.`);
