// Markdown seguro para o material de estudo: escapa tudo primeiro e só então aplica a formatação.
import { esc } from "./util.js";

function inline(t) {
  return t
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

const celulas = (linha) => linha.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => inline(c.trim()));

/** @param {string} md */
export function markdownParaHtml(md) {
  const linhas = esc(String(md || "").replace(/\r\n?/g, "\n")).split("\n");
  const saida = [];
  let i = 0;
  while (i < linhas.length) {
    const l = linhas[i];
    if (!l.trim()) { i += 1; continue; }
    if (/^\s*```/.test(l)) {
      const codigo = [];
      i += 1;
      while (i < linhas.length && !/^\s*```/.test(linhas[i])) { codigo.push(linhas[i]); i += 1; }
      i += 1;
      saida.push(`<pre><code>${codigo.join("\n")}</code></pre>`);
      continue;
    }
    const t = /^(#{1,3})\s+(.*)$/.exec(l);
    if (t) { saida.push(`<h${t[1].length}>${inline(t[2])}</h${t[1].length}>`); i += 1; continue; }
    if (/^\s*\|.*\|\s*$/.test(l) && /^\s*\|?\s*:?-{3,}/.test(linhas[i + 1] || "")) {
      const cab = celulas(l).map((c) => `<th>${c}</th>`).join("");
      i += 2;
      const corpo = [];
      while (i < linhas.length && /^\s*\|.*\|\s*$/.test(linhas[i])) { corpo.push(`<tr>${celulas(linhas[i]).map((c) => `<td>${c}</td>`).join("")}</tr>`); i += 1; }
      saida.push(`<table><thead><tr>${cab}</tr></thead><tbody>${corpo.join("")}</tbody></table>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l)) {
      const ordenada = /^\s*\d+[.)]\s+/.test(l);
      const re = ordenada ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*]\s+(.*)$/;
      const itens = [];
      while (i < linhas.length && re.test(linhas[i])) { itens.push(`<li>${inline(re.exec(linhas[i])[1])}</li>`); i += 1; }
      saida.push(`<${ordenada ? "ol" : "ul"}>${itens.join("")}</${ordenada ? "ol" : "ul"}>`);
      continue;
    }
    if (/^&gt;\s?/.test(l)) {
      const partes = [];
      while (i < linhas.length && /^&gt;\s?/.test(linhas[i])) { partes.push(linhas[i].replace(/^&gt;\s?/, "")); i += 1; }
      saida.push(`<blockquote>${inline(partes.join(" "))}</blockquote>`);
      continue;
    }
    const par = [];
    while (i < linhas.length && linhas[i].trim() && !/^(#{1,3})\s|^\s*[-*]\s+|^\s*\d+[.)]\s+|^&gt;|^\s*```/.test(linhas[i])) { par.push(linhas[i]); i += 1; }
    if (par.length) saida.push(`<p>${inline(par.join(" "))}</p>`);
    else i += 1;
  }
  return saida.join("\n");
}
