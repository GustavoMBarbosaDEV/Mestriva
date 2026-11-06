// Cabeçalho de página. acoes é HTML já montado.
import { esc } from "../util.js";

/** @param {{sobre?:string, titulo:string, descricao?:string, acoes?:string}} p */
export function cabecalho({ sobre = "", titulo, descricao = "", acoes = "" }) {
  return `<header class="flex flex-wrap items-end justify-between gap-4">
    <div>
      ${sobre ? `<p class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">${esc(sobre)}</p>` : ""}
      <h1 class="mt-2 text-2xl font-semibold leading-tight sm:text-[30px]">${esc(titulo)}</h1>
      ${descricao ? `<p class="mt-1.5 max-w-2xl text-sm text-muted-foreground">${esc(descricao)}</p>` : ""}
    </div>
    ${acoes ? `<div class="flex flex-wrap items-center gap-2">${acoes}</div>` : ""}
  </header>`;
}

export const BOTAO_PRIMARIO = "inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90";
