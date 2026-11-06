// Estado vazio. acao é HTML já montado.
import { esc } from "../util.js";
import { icone } from "../icones.js";

/** @param {{icone?:string, titulo:string, descricao?:string, acao?:string}} p */
export function vazio({ icone: nome = "", titulo, descricao = "", acao = "" }) {
  return `<div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
    ${nome ? `<span class="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">${icone(nome, "h-5 w-5 text-foreground/60")}</span>` : ""}
    <h3 class="mt-3 text-sm font-semibold">${esc(titulo)}</h3>
    ${descricao ? `<p class="mt-1 max-w-sm text-xs text-muted-foreground">${esc(descricao)}</p>` : ""}
    ${acao ? `<div class="mt-4">${acao}</div>` : ""}
  </div>`;
}
