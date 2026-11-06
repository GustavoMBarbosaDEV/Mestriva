// Servidor estático só para testar no computador.
// Endereço sem extensão (ex.: /calendario) devolve o index.html, como o Firebase Hosting fará.
// Uso: cd ferramentas && npm run serve   (ou: node servidor.mjs 5173)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/** @param {string} raiz */
export function criaServidor(raiz) {
  const base = path.resolve(raiz);
  return http.createServer((req, res) => {
    const responde = (status, corpo = "", tipo = "text/plain; charset=utf-8") => {
      res.writeHead(status, { "Content-Type": tipo, "Cache-Control": "no-store" });
      res.end(corpo);
    };
    let caminho;
    try {
      caminho = decodeURIComponent(new URL(req.url || "/", "http://x").pathname);
    } catch {
      return responde(400, "pedido inválido");
    }
    const ext = path.extname(caminho).toLowerCase();
    // Sem extensão: a página .html de mesmo nome, se existir (cleanUrls do Hosting); senão o app (index.html).
    const pagina = !ext && caminho.length > 1 ? path.resolve(base, "." + caminho.replace(/\/+$/, "") + ".html") : "";
    const alvo = ext ? path.resolve(base, "." + caminho) : pagina && pagina.startsWith(base + path.sep) && fs.existsSync(pagina) ? pagina : path.join(base, "index.html");
    if (alvo !== base && !alvo.startsWith(base + path.sep)) return responde(404, "não encontrado");
    fs.readFile(alvo, (erro, dados) => {
      if (erro) return responde(404, "não encontrado");
      responde(200, dados, TIPOS[path.extname(alvo).toLowerCase()] || "application/octet-stream");
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const porta = Number(process.argv[2]) || 5173;
  const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
  criaServidor(raiz).listen(porta, () => console.log(`Mestriva em http://localhost:${porta}`));
}
