// Gera os ícones do app em icons/ (quadrado ink com o "M" neon, como o logo da casca).
// Uso: cd ferramentas && npm run icones-png
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const destino = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "icons");
fs.mkdirSync(destino, { recursive: true });

const INK = "#0b1220";
const NEON = "#c6ff4f";
// Símbolo do Mestriva (js/ui/marca.js) em escala 512: "M" que sobe com o ponto no topo.
const ELETRICO = "#3b5bff";

const svg = ({ cantos = true, escala = 1 } = {}) => {
  const t = (1 - escala) * 256;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="${cantos ? 113 : 0}" fill="${INK}"/><g transform="translate(${t} ${t}) scale(${escala * 8})"><path d="M16 48V28l14 14 18-18v24" fill="none" stroke="${NEON}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="14.5" r="3.8" fill="${ELETRICO}"/></g></svg>`;
};

const gera = (nome, tamanho, opcoes) => sharp(Buffer.from(svg(opcoes))).resize(tamanho, tamanho).png().toFile(path.join(destino, nome));

await gera("icon-192.png", 192);
await gera("icon-512.png", 512);
await gera("maskable-512.png", 512, { cantos: false, escala: 0.8 });
await gera("apple-touch-icon.png", 180, { cantos: false });
fs.writeFileSync(path.join(destino, "favicon.svg"), svg());
console.log("icons/ gerados");
