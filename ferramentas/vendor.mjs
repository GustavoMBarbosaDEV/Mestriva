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

// Tesseract (reconhecimento de texto em foto, no aparelho): js, worker, motor (as 3 variantes lstm) e o português.
const tess = versao("tesseract.js");
const dt = path.join(raiz, "vendor", `tesseract-${tess}`);
fs.mkdirSync(path.join(dt, "core"), { recursive: true });
fs.mkdirSync(path.join(dt, "lang"), { recursive: true });
for (const f of ["tesseract.esm.min.js", "worker.min.js"]) fs.copyFileSync(path.join(aqui, "node_modules", "tesseract.js", "dist", f), path.join(dt, f));
for (const f of ["tesseract-core-lstm.wasm.js", "tesseract-core-simd-lstm.wasm.js", "tesseract-core-relaxedsimd-lstm.wasm.js"]) fs.copyFileSync(path.join(aqui, "node_modules", "tesseract.js-core", f), path.join(dt, "core", f));
fs.copyFileSync(path.join(aqui, "node_modules", "@tesseract.js-data", "por", "4.0.0", "por.traineddata.gz"), path.join(dt, "lang", "por.traineddata.gz"));
fs.copyFileSync(path.join(aqui, "node_modules", "tesseract.js", "LICENSE.md"), path.join(dt, "LICENSE.md"));
console.log(`vendor/tesseract-${tess} pronto`);
