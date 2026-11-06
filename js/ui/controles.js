// Controles pequenos (botão, selo, cartão, interruptor) com as classes do sistema visual.
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";

// Interruptor: usa data-[estado=...]
const SWITCH =
  "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[estado=checked]:bg-primary data-[estado=unchecked]:bg-input";
const POLEGAR =
  "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[estado=checked]:translate-x-4 data-[estado=unchecked]:translate-x-0";
const LABEL = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

/** @param {{id:string, marcado:boolean, acao:string, rotulo:string, dados?:Record<string,string>}} p */
export function switchHtml({ id, marcado, acao, rotulo, dados = {} }) {
  const estado = marcado ? "checked" : "unchecked";
  const extras = Object.entries(dados).map(([k, v]) => ` data-${esc(k)}="${esc(v)}"`).join("");
  return `<button type="button" role="switch" id="${esc(id)}" aria-checked="${marcado}" aria-label="${esc(rotulo)}" data-acao="${esc(acao)}" data-estado="${estado}"${extras} class="${SWITCH}"><span data-estado="${estado}" class="${POLEGAR}"></span></button>`;
}

/** @param {{para:string, texto:string, classe?:string}} p */
export function labelHtml({ para, texto, classe = "" }) {
  return `<label for="${esc(para)}" class="${cn(LABEL, esc(classe))}">${esc(texto)}</label>`;
}

/** @param {{acao?:string, href?:string, rotulo:string, icone:string, classe?:string, classeIcone?:string}} p */
export function botaoIcone({ acao, href, rotulo, icone: nome, classe = "", classeIcone = "h-4 w-4" }) {
  const svg = icone(nome, classeIcone);
  if (href) return `<a href="${esc(href)}" class="${esc(classe)}" aria-label="${esc(rotulo)}" title="${esc(rotulo)}">${svg}</a>`;
  return `<button type="button" data-acao="${esc(acao || "")}" class="${esc(classe)}" aria-label="${esc(rotulo)}" title="${esc(rotulo)}">${svg}</button>`;
}
