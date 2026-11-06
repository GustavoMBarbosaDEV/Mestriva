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
// "M" geométrico desenhado em caminho (não depende da fonte instalada).
const M = "M148 372V140h58l50 100 50-100h58v232h-52V232l-42 84h-28l-42-84v140z";

const svg = ({ cantos = true, escala = 1 } = {}) => {
  const t = (1 - escala) * 256;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="${cantos ? 113 : 0}" fill="${INK}"/><path transform="translate(${t} ${t}) scale(${escala})" d="${M}" fill="${NEON}"/></svg>`;
};

const gera = (nome, tamanho, opcoes) => sharp(Buffer.from(svg(opcoes))).resize(tamanho, tamanho).png().toFile(path.join(destino, nome));

await gera("icon-192.png", 192);
await gera("icon-512.png", 512);
await gera("maskable-512.png", 512, { cantos: false, escala: 0.8 });
await gera("apple-touch-icon.png", 180, { cantos: false });
fs.writeFileSync(path.join(destino, "favicon.svg"), svg());
console.log("icons/ gerados");
