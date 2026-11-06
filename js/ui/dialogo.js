// Diálogo acessível (foco preso, Esc, clique fora).
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";

const OVERLAY = "fixed inset-0 z-50 bg-black/80 animate-in fade-in-0";
const CONTEUDO =
  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg";
const FECHAR =
  "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** @type {{fecha: () => void}[]} */
const abertos = [];
let contador = 0;

/**
 * @param {{titulo:string, descricao?:string, corpo:string, classe?:string, classeTitulo?:string, aoFechar?:() => void}} p
 * corpo é HTML já escapado por quem chama.
 */
export function abreDialogo({ titulo, descricao = "", corpo, classe = "", classeTitulo = "", aoFechar }) {
  const id = "dlg-" + ++contador;
  const quemAbriu = /** @type {HTMLElement|null} */ (document.activeElement);
  const camada = document.createElement("div");
  camada.innerHTML = `<div class="${OVERLAY}" data-overlay></div>
    <div role="dialog" aria-modal="true" aria-labelledby="${id}-t"${descricao ? ` aria-describedby="${id}-d"` : ""} class="${cn(CONTEUDO, esc(classe))}">
      <div class="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 id="${id}-t" class="${cn("text-lg font-semibold leading-none tracking-tight", esc(classeTitulo))}">${esc(titulo)}</h2>
        ${descricao ? `<p id="${id}-d" class="text-sm text-muted-foreground">${esc(descricao)}</p>` : ""}
      </div>
      <div data-corpo>${corpo}</div>
      <button type="button" data-fechar class="${FECHAR}">${icone("X")}<span class="sr-only">Fechar</span></button>
    </div>`;
  document.body.appendChild(camada);
  const caixa = /** @type {HTMLElement} */ (camada.querySelector('[role="dialog"]'));
  const rolagemAntes = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const teclas = (/** @type {KeyboardEvent} */ e) => {
    if (abertos[abertos.length - 1] !== controle) return;
    if (e.key === "Escape") {
      e.preventDefault();
      controle.fecha();
    } else if (e.key === "Tab") {
      const itens = /** @type {HTMLElement[]} */ ([...caixa.querySelectorAll(FOCAVEIS)]);
      if (!itens.length) return;
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      if (e.shiftKey && (document.activeElement === primeiro || !caixa.contains(document.activeElement))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !caixa.contains(document.activeElement))) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  };
  camada.addEventListener("click", (e) => {
    const alvo = /** @type {HTMLElement} */ (e.target);
    if (alvo.closest("[data-fechar]") || alvo.hasAttribute("data-overlay")) controle.fecha();
  });
  document.addEventListener("keydown", teclas, true);

  let fechado = false;
  const controle = {
    elemento: caixa,
    /** Troca o corpo mantendo o foco no mesmo controle (por id ou data-acao + data-valor/chave). */
    atualiza(/** @type {string} */ html) {
      const ativo = /** @type {HTMLElement|null} */ (document.activeElement);
      const chave = ativo && caixa.contains(ativo) ? ativo.id || [ativo.dataset.acao, ativo.dataset.valor, ativo.dataset.chave].join("|") : "";
      /** @type {HTMLElement} */ (caixa.querySelector("[data-corpo]")).innerHTML = html;
      if (!chave) return;
      const novo = /** @type {HTMLElement[]} */ ([...caixa.querySelectorAll("[data-acao],[id]")]).find(
        (el) => el.id === chave || [el.dataset.acao, el.dataset.valor, el.dataset.chave].join("|") === chave
      );
      novo?.focus();
    },
    fecha() {
      if (fechado) return;
      fechado = true;
      document.removeEventListener("keydown", teclas, true);
      camada.remove();
      abertos.splice(abertos.indexOf(controle), 1);
      if (!abertos.length) document.body.style.overflow = rolagemAntes;
      if (quemAbriu && document.contains(quemAbriu)) quemAbriu.focus();
      aoFechar?.();
    },
  };
  abertos.push(controle);
  const primeiro = /** @type {HTMLElement|null} */ (caixa.querySelector(FOCAVEIS));
  (primeiro || caixa).focus();
  return controle;
}

/** Fecha todos os diálogos (troca de rota). */
export function fechaDialogos() {
  while (abertos.length) abertos[abertos.length - 1].fecha();
}
