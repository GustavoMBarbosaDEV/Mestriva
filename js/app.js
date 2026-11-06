// Início do Mestriva: preferências, dados, rotas, desenho das telas e cliques.
import { esc } from "./util.js";
import { criaLoja } from "./loja.js";
import { lePrefs, gravaPrefs, aplicaPrefs } from "./preferencias.js";
import { resolve, ligaNavegacao, navega, limpaCaminho } from "./rotas.js";
import { abreDialogo, fechaDialogos } from "./ui/dialogo.js";
import { corpoAcessibilidade, aplicaAcaoA11y } from "./ui/acessibilidade.js";
import { casca } from "./ui/casca.js";
import { ligaAtualizacao, primeiroVisivel } from "./atualizacao.js";
import * as provisoria from "./paginas/provisoria.js";
import * as naoEncontrada from "./paginas/nao-encontrada.js";
import * as onboarding from "./paginas/onboarding.js";
import * as calendario from "./paginas/calendario.js";
import * as grade from "./paginas/grade.js";
import * as notas from "./paginas/notas.js";
import * as estudar from "./paginas/estudar.js";
import * as hoje from "./paginas/hoje.js";
import { abreFoco } from "./ui/foco.js";

/**
 * @typedef {{render: (ctx: Ctx) => string, montar?: (raiz: HTMLElement, ctx: Ctx) => (void | (() => void))}} Pagina
 * @typedef {{loja: ReturnType<typeof criaLoja>, prefs: import("./preferencias.js").Prefs, usuario: {nome:string, email:string},
 *   navega: typeof navega, anuncia: (t: string) => void, toast: (t: string) => void, rota: {caminho: string, titulo: string, pagina: string},
 *   mudaA11y: (a11y: import("./preferencias.js").A11y) => void}} Ctx
 */

/** Páginas reais (as que não estão aqui mostram a provisória). @type {Record<string, Pagina>} */
const PAGINAS = { "nao-encontrada": naoEncontrada, onboarding, calendar: calendario, curriculum: grade, grades: notas, study: estudar, dashboard: hoje };

const TOAST_VIEWPORT = "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]";
const TOAST =
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all animate-in slide-in-from-top-full sm:slide-in-from-bottom-full border bg-background text-foreground";

export function iniciar() {
  const raizHtml = document.documentElement;
  const app = /** @type {HTMLElement} */ (document.getElementById("app"));
  let prefs = lePrefs();
  aplicaPrefs(prefs, raizHtml);
  const loja = criaLoja();
  /** @type {null | (() => void)} */
  let limpeza = null;
  /** @type {null | {fecha: () => void, atualiza: (html: string) => void}} */
  let dialogoA11y = null;
  let primeiroDesenho = true;

  const anuncia = (/** @type {string} */ texto) => {
    const alvo = document.getElementById("anuncios");
    if (!alvo) return;
    alvo.textContent = "";
    setTimeout(() => (alvo.textContent = texto), 30);
  };

  function toast(/** @type {string} */ texto) {
    let vp = document.getElementById("toasts");
    if (!vp) {
      vp = document.createElement("ol");
      vp.id = "toasts";
      vp.className = TOAST_VIEWPORT;
      document.body.appendChild(vp);
    }
    const li = document.createElement("li");
    li.className = TOAST;
    li.setAttribute("role", "status");
    li.innerHTML = `<div class="text-sm opacity-90">${esc(texto)}</div>`;
    vp.appendChild(li);
    setTimeout(() => li.remove(), 6000);
  }

  const usuario = () => ({ nome: loja.perfil().display_name, email: "" });
  // Modo local: sem conta, o estudante está sempre "logado" no aparelho (o plano 3 liga o Firebase).
  const estadoAcesso = () => ({ logado: true, perfilCompleto: loja.perfil().onboarding_completed });

  function desenha(/** @type {string} */ caminhoCompleto) {
    const caminho = limpaCaminho(caminhoCompleto);
    const r = resolve(caminhoCompleto, estadoAcesso());
    if (r.redireciona) {
      navega(r.redireciona, { substitui: true });
      return;
    }
    fechaDialogos();
    dialogoA11y = null;
    if (limpeza) limpeza();
    limpeza = null;

    const rota = r.rota ? { ...r.rota } : { caminho, titulo: "Página não encontrada", pagina: r.pagina, tipo: "publica" };
    rota.caminho = caminho;
    /** @type {Ctx} */
    const ctx = {
      loja, prefs, usuario: usuario(), navega, anuncia, toast, rota,
      mudaA11y: (/** @type {import("./preferencias.js").A11y} */ a11y) => mudaPrefs({ ...prefs, a11y }),
    };
    const pagina = /** @type {Pagina} */ (PAGINAS[r.pagina] || provisoria);
    const conteudo = pagina.render(ctx);
    app.innerHTML = rota.tipo === "protegida" ? casca({ caminho, usuario: ctx.usuario, tema: prefs.tema, conteudo }) : conteudo;
    document.title = r.pagina === "landing" ? rota.titulo : `${rota.titulo} · Mestriva`;
    const resto = pagina.montar?.(app, ctx);
    if (typeof resto === "function") limpeza = resto;

    if (!primeiroDesenho) {
      window.scrollTo(0, 0);
      const alvo = /** @type {HTMLElement|null} */ (app.querySelector("#conteudo") || app.querySelector("h1"));
      if (alvo) {
        if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
        alvo.focus({ preventScroll: true });
      }
      anuncia(rota.titulo);
    }
    primeiroDesenho = false;
  }

  function mudaPrefs(/** @type {import("./preferencias.js").Prefs} */ novas) {
    prefs = novas;
    gravaPrefs(prefs);
    aplicaPrefs(prefs, raizHtml);
  }

  /** @type {Record<string, (el: HTMLElement) => void>} */
  const ACOES = {
    "alterna-tema"() {
      mudaPrefs({ ...prefs, tema: prefs.tema === "dark" ? "light" : "dark" });
      redesenha();
      anuncia(prefs.tema === "dark" ? "Tema escuro ligado" : "Tema claro ligado");
    },
    "abre-acessibilidade"() {
      dialogoA11y = abreDialogo({
        titulo: "Acessibilidade",
        descricao: "Ajuste a leitura do app do seu jeito. As preferências ficam salvas neste dispositivo.",
        corpo: corpoAcessibilidade(prefs.a11y),
        classe: "max-h-[88vh] max-w-md overflow-y-auto rounded-2xl",
        classeTitulo: "font-heading text-xl",
        aoFechar: () => (dialogoA11y = null),
      });
    },
    foco() {
      abreFoco({ loja, anuncia });
    },
    sair() {
      navega("/bem-vindo");
    },
  };
  for (const acao of ["a11y-texto", "a11y-cor", "a11y-alterna", "a11y-restaura"]) {
    ACOES[acao] = (el) => {
      mudaPrefs({ ...prefs, a11y: aplicaAcaoA11y(prefs.a11y, acao, { ...el.dataset }) });
      dialogoA11y?.atualiza(corpoAcessibilidade(prefs.a11y));
    };
  }

  function redesenha() {
    const y = window.scrollY;
    const foco = /** @type {HTMLElement|null} */ (document.activeElement);
    const chave = foco?.dataset?.acao;
    primeiroDesenho = true;
    desenha(location.pathname + location.search);
    window.scrollTo(0, y);
    if (chave) primeiroVisivel(/** @type {NodeListOf<HTMLElement>} */ (app.querySelectorAll(`[data-acao="${CSS.escape(chave)}"]`)))?.focus();
  }

  document.addEventListener("click", (e) => {
    const el = /** @type {HTMLElement|null} */ (/** @type {HTMLElement} */ (e.target).closest?.("[data-acao]"));
    if (!el) return;
    const fn = ACOES[el.dataset.acao || ""];
    if (!fn) return;
    e.preventDefault();
    fn(el);
  });

  ligaNavegacao(desenha);
  desenha(location.pathname + location.search);
  let avisou = false;
  const avisaArmazenamento = () => {
    if (!loja.aviso || avisou) return;
    avisou = true;
    toast(loja.aviso);
    anuncia(loja.aviso);
  };
  avisaArmazenamento();
  loja.assina(avisaArmazenamento);
  ligaAtualizacao({ anuncia });
  return { loja, desenha };
}

if (typeof document !== "undefined") iniciar();
