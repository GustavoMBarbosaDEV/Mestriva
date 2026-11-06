// Campos de formulário (campo com rótulo, grupo de chips e a classe dos inputs).
import { esc, cn } from "../util.js";

export const CLASSE_CAMPO =
  "h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/10";
export const CLASSE_TEXTO =
  "w-full rounded-xl border border-input bg-card px-3.5 py-3 text-sm outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/10";

/** FormField. conteudo é HTML já montado. @param {{rotulo?:string, para?:string, dica?:string, erro?:string, conteudo?:string, classe?:string}} p */
export function campo({ rotulo = "", para = "", dica = "", erro = "", conteudo = "", classe = "" }) {
  return `<div class="${cn("space-y-1.5", esc(classe))}">${
    rotulo ? `<label${para ? ` for="${esc(para)}"` : ""} class="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs font-medium text-foreground/80">${esc(rotulo)}</label>` : ""
  }${conteudo}${
    erro ? `<p class="text-[11px] font-medium text-destructive">${esc(erro)}</p>` : dica ? `<p class="text-[11px] text-muted-foreground">${esc(dica)}</p>` : ""
  }</div>`;
}

/**
 * ChipGroup. Cada botão leva data-acao, data-nome (campo do estado) e data-valor.
 * @param {{opcoes:(string|{value:string,label:string})[], valor:string|string[], multiplo?:boolean, acao:string, nome:string, rotulo?:string}} p
 */
export function chips({ opcoes, valor, multiplo = false, acao, nome, rotulo = "" }) {
  const lista = opcoes.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const ativo = (v) => (multiplo ? Array.isArray(valor) && valor.includes(v) : valor === v);
  return `<div class="flex flex-wrap gap-2" role="${multiplo ? "group" : "radiogroup"}"${rotulo ? ` aria-label="${esc(rotulo)}"` : ""}>${lista
    .map((o) => {
      const sim = ativo(o.value);
      return `<button type="button" role="${multiplo ? "checkbox" : "radio"}" aria-checked="${sim}" data-acao="${esc(acao)}" data-nome="${esc(nome)}" data-valor="${esc(o.value)}" class="${cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition",
        sim ? "border-ink bg-ink text-white" : "border-border bg-card text-foreground/70 hover:border-electric/50 hover:text-foreground"
      )}">${esc(o.label)}</button>`;
    })
    .join("")}</div>`;
}

/** Alterna um valor numa lista (chip múltiplo) ou troca o valor (chip único). */
export function alternaChip(atual, valor, multiplo) {
  if (!multiplo) return valor;
  const lista = Array.isArray(atual) ? atual : [];
  return lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor];
}
