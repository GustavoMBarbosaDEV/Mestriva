// Motor das telas: estado local, redesenho da área da página e eventos por delegação.
// Campos com data-campo atualizam estado[campo] sem redesenhar (o foco e o texto não se perdem).

/**
 * @template E
 * @param {HTMLElement} raiz elemento que recebe o HTML da tela (normalmente [data-pagina])
 * @param {{estado: E, desenha: (estado: E) => string,
 *   acoes?: Record<string, (el: HTMLElement, estado: E, tela: any) => void>,
 *   aoDigitar?: (campo: string, valor: any, estado: E) => void,
 *   aoEnviar?: Record<string, (form: HTMLFormElement, estado: E, tela: any) => void>}} p
 */
export function criaTela(raiz, { estado, desenha, acoes = {}, aoDigitar, aoEnviar = {} }) {
  const valorDe = (/** @type {any} */ el) => (el.type === "checkbox" ? el.checked : el.type === "number" ? (el.value === "" ? "" : Number(el.value)) : el.value);

  const tela = {
    estado,
    pinta() {
      const ativo = /** @type {HTMLElement|null} */ (document.activeElement);
      const chave = ativo && raiz.contains(ativo) ? ativo.id || ativo.dataset.campo || [ativo.dataset.acao, ativo.dataset.valor, ativo.dataset.id].join("|") : "";
      const sel = ativo && "selectionStart" in ativo ? [/** @type {any} */ (ativo).selectionStart, /** @type {any} */ (ativo).selectionEnd] : null;
      raiz.innerHTML = desenha(tela.estado);
      if (!chave) return;
      const novo = /** @type {HTMLElement[]} */ ([...raiz.querySelectorAll("[id],[data-campo],[data-acao]")]).find(
        (el) => el.id === chave || el.dataset.campo === chave || [el.dataset.acao, el.dataset.valor, el.dataset.id].join("|") === chave
      );
      if (novo) {
        novo.focus({ preventScroll: true });
        if (sel && "setSelectionRange" in novo) {
          try { /** @type {any} */ (novo).setSelectionRange(sel[0], sel[1]); } catch { /* campos sem seleção */ }
        }
      }
    },
    destroi() {
      raiz.removeEventListener("click", clique);
      raiz.removeEventListener("input", digita);
      raiz.removeEventListener("change", digita);
      raiz.removeEventListener("submit", envia);
    },
  };

  const clique = (/** @type {MouseEvent} */ e) => {
    const el = /** @type {HTMLElement|null} */ (/** @type {HTMLElement} */ (e.target).closest?.("[data-acao]"));
    if (!el || !raiz.contains(el)) return;
    const fn = acoes[el.dataset.acao || ""];
    if (!fn) return;
    e.preventDefault();
    e.stopPropagation();
    fn(el, tela.estado, tela);
  };
  const digita = (/** @type {Event} */ e) => {
    const el = /** @type {any} */ (e.target);
    const campo = el?.dataset?.campo;
    if (!campo) return;
    /** @type {any} */ (tela.estado)[campo] = valorDe(el);
    aoDigitar?.(campo, valorDe(el), tela.estado);
  };
  const envia = (/** @type {SubmitEvent} */ e) => {
    const form = /** @type {HTMLFormElement} */ (e.target);
    const fn = aoEnviar[form.dataset.enviar || ""];
    if (!fn) return;
    e.preventDefault();
    fn(form, tela.estado, tela);
  };
  raiz.addEventListener("click", clique);
  raiz.addEventListener("input", digita);
  raiz.addEventListener("change", digita);
  raiz.addEventListener("submit", envia);
  tela.pinta();
  return tela;
}
