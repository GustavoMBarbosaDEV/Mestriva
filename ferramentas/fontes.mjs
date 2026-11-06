// Copia as fontes do Mestriva para fonts/ e escreve css/fontes.css.
// Só latin e latin-ext, só os pesos usados e só woff2: as fontes ficam no próprio site (sem Google Fonts).
// Uso: cd ferramentas && npm run fontes
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.join(aqui, "..");

const FAMILIAS = [
  { pacote: "space-grotesk", pesos: [400, 500, 600, 700] },
  { pacote: "inter", pesos: [300, 400, 500, 600] },
  { pacote: "jetbrains-mono", pesos: [400, 500] },
  { pacote: "atkinson-hyperlegible", pesos: [400, 700] },
];
const SUBCONJUNTOS = ["latin-ext", "latin"];

let css = "/* Gerado por ferramentas/fontes.mjs — não edite à mão. */\n";
fs.rmSync(path.join(raiz, "fonts"), { recursive: true, force: true });

for (const { pacote, pesos } of FAMILIAS) {
  const dirPacote = path.join(aqui, "node_modules", "@fontsource", pacote);
  const versao = JSON.parse(fs.readFileSync(path.join(dirPacote, "package.json"), "utf8")).version;
  const destino = `fonts/${pacote}-${versao}`;
  fs.mkdirSync(path.join(raiz, destino), { recursive: true });
  for (const peso of pesos) {
    const fonte = fs.readFileSync(path.join(dirPacote, `${peso}.css`), "utf8");
    const blocos = fonte.match(/@font-face\s*\{[^}]*\}/g) || [];
    for (const sub of SUBCONJUNTOS) {
      const nome = `${pacote}-${sub}-${peso}-normal.woff2`;
      const bloco = blocos.find((b) => b.includes(`/${nome})`));
      if (!bloco) throw new Error(`não achei ${nome}`);
      fs.copyFileSync(path.join(dirPacote, "files", nome), path.join(raiz, destino, nome));
      css += bloco.replace(/src:[^;]*;/, `src: url("/${destino}/${nome}") format("woff2");`) + "\n";
    }
  }
}

fs.mkdirSync(path.join(raiz, "css"), { recursive: true });
fs.writeFileSync(path.join(raiz, "css", "fontes.css"), css);
console.log("fontes copiadas e css/fontes.css escrito");
