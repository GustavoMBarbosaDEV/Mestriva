// Monta dist/ para o Firebase Hosting a partir de uma lista fixa (nada fora dela é publicado).
// Uso: cd ferramentas && npm run build
// 1) Regera o style.css e falha se ele mudar (o CSS commitado precisa estar em dia).
// 2) Copia a lista, minifica JS/CSS com esbuild (um arquivo por vez; os módulos continuam módulos).
// 3) Confere que as versões batem em js/versao.js, sw.js e index.html.
import { transform } from "esbuild";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.join(aqui, "..");
const dist = path.join(raiz, "dist");

const ARQUIVOS = ["index.html", "pre.js", "boot.css", "style.css", "firebase-config.js", "manifest.webmanifest", "sw.js"];
const PASTAS = ["js", "icons", "fonts"];

const cssAntes = fs.readFileSync(path.join(raiz, "style.css"), "utf8");
execSync("npx tailwindcss -c tailwind.config.cjs -i ../css/entrada.css -o ../style.css", { cwd: aqui, stdio: "ignore" });
if (fs.readFileSync(path.join(raiz, "style.css"), "utf8") !== cssAntes) {
  console.error("O style.css estava desatualizado e foi regerado. Confira e faça o commit antes de publicar.");
  process.exit(1);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
for (const a of ARQUIVOS) {
  if (!fs.existsSync(path.join(raiz, a))) {
    console.error("Falta o arquivo:", a);
    process.exit(1);
  }
  fs.copyFileSync(path.join(raiz, a), path.join(dist, a));
}
for (const p of PASTAS) fs.cpSync(path.join(raiz, p), path.join(dist, p), { recursive: true });

const lista = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? lista(path.join(d, e.name)) : [path.join(d, e.name)]));
let antes = 0;
let depois = 0;
for (const f of lista(dist)) {
  const ext = path.extname(f);
  if (ext !== ".js" && ext !== ".css") continue;
  const texto = fs.readFileSync(f, "utf8");
  const modulo = f.startsWith(path.join(dist, "js") + path.sep);
  const r = await transform(texto, {
    loader: ext === ".css" ? "css" : "js",
    minify: true,
    charset: "utf8",
    legalComments: "none",
    ...(ext === ".js" ? { target: "es2020", format: modulo ? "esm" : undefined } : {}),
  });
  for (const w of r.warnings) console.warn(`${path.relative(dist, f)}: ${w.text}`);
  fs.writeFileSync(f, r.code);
  antes += Buffer.byteLength(texto);
  depois += Buffer.byteLength(r.code);
}

const v = /export const VERSAO = "([0-9.]+)";/.exec(fs.readFileSync(path.join(raiz, "js", "versao.js"), "utf8"))[1];
const idx = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(raiz, "sw.js"), "utf8");
const faltaV = ["style.css", "boot.css", "pre.js", "js/app.js"].filter((a) => !idx.includes(`/${a}?v=${v}"`));
if (faltaV.length || !sw.includes(`const V = "${v}"`)) {
  console.error(`Versões desencontradas (js/versao.js ${v}). Rode: npm run bump -- ${v}`, faltaV);
  process.exit(1);
}

const total = lista(dist).reduce((s, f) => s + fs.statSync(f).size, 0);
console.log(`dist/ pronta (versão ${v}): ${Math.round(total / 1024)} KiB no total; JS/CSS minificados ${Math.round(antes / 1024)} → ${Math.round(depois / 1024)} KiB.`);
