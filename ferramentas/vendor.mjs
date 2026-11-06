// Copia para vendor/ as bibliotecas carregadas sob demanda pelo app (a versão no nome da pasta evita misturar caches).
// Uso: cd ferramentas && npm run vendor
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.join(aqui, "..");
const versao = (p) => JSON.parse(fs.readFileSync(path.join(aqui, "node_modules", p, "package.json"), "utf8")).version;

const pdfjs = versao("pdfjs-dist");
const destino = path.join(raiz, "vendor", `pdfjs-${pdfjs}`);
fs.mkdirSync(destino, { recursive: true });
for (const f of ["pdf.min.mjs", "pdf.worker.min.mjs"]) fs.copyFileSync(path.join(aqui, "node_modules", "pdfjs-dist", "legacy", "build", f), path.join(destino, f));
fs.copyFileSync(path.join(aqui, "node_modules", "pdfjs-dist", "LICENSE"), path.join(destino, "LICENSE"));
console.log(`vendor/pdfjs-${pdfjs} pronto`);
