// Marca do Mestriva: o símbolo é um "M" que sobe para a direita (progresso) com um ponto no topo
// (a meta alcançada, e o "i" de mestrIva). Guia completo em IDENTIDADE.md.
import { esc } from "../util.js";

export const CORES = {
  tinta: "#0b1220", // fundo do símbolo e cor principal do texto
  lima: "#c6ff4f", // traço do M e destaques
  eletrico: "#3b5bff", // ponto e ações (no tema escuro: #6f88ff)
  eletricoEscuro: "#6f88ff",
};

const TRACO = "M16 48V28l14 14 18-18v24";

/** SVG do símbolo para páginas estáticas e ícones (sem classes do Tailwind). */
export const SIMBOLO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${CORES.tinta}"/><path d="${TRACO}" fill="none" stroke="${CORES.lima}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="14.5" r="3.8" fill="${CORES.eletrico}"/></svg>`;

/** Símbolo para as telas (no tema escuro ganha um contorno sutil e o ponto mais claro). @param {string} [classe] */
export function simbolo(classe = "h-10 w-10") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="${esc(classe)} shrink-0" aria-hidden="true" focusable="false"><rect width="64" height="64" rx="16" fill="${CORES.tinta}" class="dark:stroke-white/10" stroke-width="2"/><path d="${TRACO}" fill="none" stroke="${CORES.lima}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="14.5" r="3.8" fill="${CORES.eletrico}" class="dark:fill-[#6f88ff]"/></svg>`;
}

/** Quem faz o app e o e-mail de contato (o mesmo das páginas de privacidade e termos). */
export const AUTOR = "Gustavo M Barbosa";
export const CONTATO = "monetra.app26@gmail.com";
/** Endereço do APK para Android. Vazio enquanto não existe: a landing esconde o botão de baixar. */
export const LINK_APK = "";
