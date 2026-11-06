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

// Imagem de compartilhamento (WhatsApp, redes): 1200×630, símbolo, nome e assinatura.
const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs><radialGradient id="g" cx="0.78" cy="0.12" r="0.9"><stop offset="0" stop-color="${ELETRICO}" stop-opacity="0.45"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="${INK}"/><rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(110 175) scale(4.4)"><rect width="64" height="64" rx="16" fill="#111a2e" stroke="#ffffff" stroke-opacity="0.12"/><path d="M16 48V28l14 14 18-18v24" fill="none" stroke="${NEON}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="14.5" r="3.8" fill="#6f88ff"/></g>
  <text x="440" y="300" font-family="Space Grotesk, Segoe UI, Arial, sans-serif" font-size="104" font-weight="700" fill="#ffffff" letter-spacing="-3">Mestriva</text>
  <text x="444" y="370" font-family="Segoe UI, Arial, sans-serif" font-size="36" fill="#ffffff" fill-opacity="0.72">Estude com método.</text>
  <text x="444" y="416" font-family="Segoe UI, Arial, sans-serif" font-size="36" fill="#ffffff" fill-opacity="0.72">Chegue na prova sabendo.</text>
  <text x="444" y="480" font-family="Consolas, monospace" font-size="24" fill="${NEON}" letter-spacing="4">GRÁTIS · SEM ANÚNCIOS · SEUS DADOS SÓ SEUS</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(path.join(destino, "og-mestriva.png"));
console.log("icons/ gerados");
