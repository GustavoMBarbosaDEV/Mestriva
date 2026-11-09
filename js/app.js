// Início do Mestriva: preferências, dados, rotas, desenho das telas e cliques.
import { esc } from "./util.js";
import { criaLoja } from "./loja.js";
import { lePrefs, gravaPrefs, aplicaPrefs } from "./preferencias.js";
import { resolve, ligaNavegacao, navega, limpaCaminho, appInstalado, voltaSegura } from "./rotas.js";
import { configOk, iniciaNuvem, traduzErro } from "./nuvem.js";
import { criaLojaNuvem, juntaDados, temDados } from "./loja-nuvem.js";
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
import * as ajustes from "./paginas/ajustes.js";
import * as quiz from "./paginas/quiz.js";
import * as tutor from "./paginas/tutor.js";
import * as landing from "./paginas/landing.js";
import * as login from "./paginas/login.js";
import { abreSino, fechaSino, lembretes, notificaLembretes } from "./ui/sino.js";
import { abreFoco } from "./ui/foco.js";
import { mostraNovidades } from "./ui/novidades.js";
import { tiraAbertura } from "./ui/abertura.js";
import { VERSAO, NOVIDADES } from "./versao.js";

/**
 * @typedef {{render: (ctx: Ctx) => string, montar?: (raiz: HTMLElement, ctx: Ctx) => (void | (() => void))}} Pagina
 * @typedef {{loja: any, prefs: import("./preferencias.js").Prefs, usuario: {nome:string, email:string, conta: any, modo: "local"|"nuvem"},
 *   conta: any, guardaCopia: () => void,
 *   navega: typeof navega, anuncia: (t: string) => void, toast: (t: string) => void, rota: {caminho: string, titulo: string, pagina: string},
 *   mudaA11y: (a11y: import("./preferencias.js").A11y) => void}} Ctx
 */

/** Páginas reais (as que não estão aqui mostram a provisória). @type {Record<string, Pagina>} */
const PAGINAS = { "nao-encontrada": naoEncontrada, onboarding, calendar: calendario, curriculum: grade, grades: notas, study: estudar, dashboard: hoje, settings: ajustes, quiz, tutor, landing,
  login, register: login, "forgot-password": login, "reset-password": login };
const TELAS_DE_ENTRAR = ["/login", "/register", "/forgot-password", "/reset-password"];
/** Cópia dos dados do aparelho que ficaram de fora ao entrar numa conta que já tinha dados. */
const CHAVE_COPIA = "mestriva.dados.v1.antes-da-conta";

const TOAST_VIEWPORT = "pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]";
const TOAST =
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all animate-in slide-in-from-top-full sm:slide-in-from-bottom-full border bg-background text-foreground";

export function iniciar() {
  const raizHtml = document.documentElement;
  const app = /** @type {HTMLElement} */ (document.getElementById("app"));
  let prefs = lePrefs();
  aplicaPrefs(prefs, raizHtml);
  const cfg = /** @type {any} */ (window).FIREBASE_CONFIG;
  // Sem a configuração do Firebase, o app roda no modo local: sem conta, dados só no aparelho.
  const nuvemLigada = configOk(cfg);
  const lojaLocal = criaLoja();
  /** @type {any} */
  let loja = lojaLocal;
  /** @type {any} conta do Firebase (funções de entrar, sair…) */
  let conta = null;
  /** @type {any} quem entrou (resumoUsuario) */
  let quem = null;
  /** Já sabemos se há alguém logado? (no modo local, sempre) */
  let pronto = !nuvemLigada;
  /** @type {(() => void)[]} */
  let desligaOuvintes = [];
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
    setTimeout(() => {
      li.remove();
      if (vp && !vp.children.length) vp.remove();
    }, 6000);
  }

  const usuario = () => ({ nome: loja.perfil().display_name || quem?.nome || "", email: quem?.email || "", conta: quem, modo: /** @type {"local"|"nuvem"} */ (nuvemLigada ? "nuvem" : "local") });
  // Modo local: sem conta, o estudante está sempre "logado" no aparelho. Com o Firebase, precisa entrar.
  const estadoAcesso = () => ({ logado: !nuvemLigada || (!!quem && !!loja.nuvem), perfilCompleto: loja.perfil().onboarding_completed, apresentacao: !appInstalado() });

  function desenha(/** @type {string} */ caminhoCompleto) {
    // Enquanto a conta carrega, a abertura continua na tela.
    if (!pronto) return;
    const caminho = limpaCaminho(caminhoCompleto);
    const r = resolve(caminhoCompleto, estadoAcesso());
    if (r.redireciona) {
      navega(r.redireciona, { substitui: true });
      return;
    }
    fechaDialogos();
    fechaSino();
    dialogoA11y = null;
    if (limpeza) limpeza();
    limpeza = null;

    const rota = r.rota ? { ...r.rota } : { caminho, titulo: "Página não encontrada", pagina: r.pagina, tipo: "publica" };
    rota.caminho = caminho;
    /** @type {Ctx} */
    const ctx = {
      loja, prefs, usuario: usuario(), navega, anuncia, toast, rota, conta, guardaCopia: () => guardaCopia(lojaLocal.dados()),
      mudaA11y: (/** @type {import("./preferencias.js").A11y} */ a11y) => mudaPrefs({ ...prefs, a11y }),
    };
    const pagina = /** @type {Pagina} */ (PAGINAS[r.pagina] || provisoria);
    const conteudo = pagina.render(ctx);
    app.innerHTML = rota.tipo === "protegida" ? casca({ caminho, usuario: ctx.usuario, tema: prefs.tema, conteudo, lembretes: lembretes(loja.lista("eventos")).length }) : conteudo;
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
    sino(el) {
      // Tocar de novo no sino fecha o painel.
      if (el.getAttribute("aria-expanded") === "true") fechaSino();
      else abreSino(el, loja.lista("eventos"));
    },
    foco() {
      abreFoco({ loja, anuncia });
    },
    sair() {
      if (!conta) {
        navega("/bem-vindo");
        return;
      }
      const sai = () => conta.sair().then(() => navega("/bem-vindo", { substitui: true })).catch((/** @type {any} */ e) => toast(traduzErro(e) || "Não deu para sair agora."));
      if (!quem || !quem.anonimo) {
        sai();
        return;
      }
      // Modo teste: sem conta, sair perde tudo. Pergunta antes.
      const dlg = abreDialogo({
        titulo: "Sair do modo teste?",
        descricao: "Sem conta, o que você fez no modo teste se perde ao sair. Para guardar, crie sua conta em Ajustes (leva um minuto e nada se perde).",
        corpo: `<div class="flex flex-wrap justify-end gap-2 pt-2"><button type="button" data-ir class="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-secondary">Criar minha conta</button><button type="button" data-sim class="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground">Sair e perder os dados</button></div>`,
        classe: "max-w-md rounded-2xl",
      });
      dlg.elemento.addEventListener("click", (e) => {
        const alvo = /** @type {HTMLElement} */ (e.target);
        if (alvo.closest("[data-ir]")) { dlg.fecha(); navega("/ajustes"); }
        if (alvo.closest("[data-sim]")) { dlg.fecha(); sai(); }
      });
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

  let avisou = false;
  const avisaArmazenamento = () => {
    if (!loja.aviso || avisou) return;
    avisou = true;
    toast(loja.aviso);
    anuncia(loja.aviso);
  };
  /** Mudança vinda de outro aparelho: redesenha, a não ser que a pessoa esteja digitando ou com uma janela aberta. */
  const mudouFora = () => {
    const ativo = document.activeElement;
    const digitando = !!ativo && /^(INPUT|TEXTAREA|SELECT)$/.test(ativo.tagName);
    if (!digitando && !document.querySelector("[role=dialog]")) redesenha();
  };
  function ligaOuvintes() {
    for (const d of desligaOuvintes) d();
    avisou = false;
    desligaOuvintes = [loja.assina(avisaArmazenamento)];
    if (loja.assinaFora) desligaOuvintes.push(loja.assinaFora(mudouFora));
    avisaArmazenamento();
  }

  /** Guarda uma cópia dos dados do aparelho (para não sumirem quando ficam de fora da conta). @param {any} dados */
  function guardaCopia(dados) {
    try {
      if (temDados(dados)) localStorage.setItem(CHAVE_COPIA, JSON.stringify(dados));
    } catch { /* sem espaço: segue sem a cópia */ }
  }

  /** A conta já tinha dados e o aparelho também: pergunta o que fazer. @returns {Promise<"juntar"|"conta"|"depois">} */
  function perguntaJuntar() {
    return new Promise((ok) => {
      /** @type {"juntar"|"conta"|"depois"} */
      let escolha = "depois";
      const dlg = abreDialogo({
        titulo: "Juntar com o que está neste aparelho?",
        descricao: "Sua conta já tem dados, e este aparelho também tem matérias, notas ou materiais de antes de você entrar.",
        corpo: `<div class="space-y-2 pt-2">
          <button type="button" data-escolha="juntar" class="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white">Juntar tudo na conta (recomendado)</button>
          <button type="button" data-escolha="conta" class="w-full rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground/80 transition hover:bg-secondary">Ficar só com o que já está na conta</button>
          <p class="pt-1 text-[11px] leading-relaxed text-muted-foreground">Nada se perde: na segunda opção, guardamos neste aparelho uma cópia do que estava aqui.</p>
        </div>`,
        classe: "max-w-md rounded-2xl",
        aoFechar: () => ok(escolha),
      });
      dlg.elemento.addEventListener("click", (e) => {
        const b = /** @type {HTMLElement|null} */ (/** @type {HTMLElement} */ (e.target).closest("[data-escolha]"));
        if (!b) return;
        escolha = /** @type {any} */ (b.dataset.escolha);
        dlg.fecha();
      });
    });
  }

  /** Leva para a conta o que foi feito no aparelho antes de entrar. @param {any} nuvem */
  async function levaDadosDoAparelho(nuvem) {
    const local = lojaLocal.dados();
    // Sem internet, a conta parece vazia (só o cache): deixa para a próxima vez, para não sobrescrever nada.
    if (!temDados(local) || !nuvem.doServidor) return;
    const vazia = !temDados(nuvem.dados());
    const escolha = vazia ? "juntar" : await perguntaJuntar();
    if (escolha === "depois") return;
    if (escolha === "conta") guardaCopia(local);
    else {
      nuvem.gravaTudo(vazia ? local : juntaDados(nuvem.dados(), local))
        .then(() => toast(vazia ? "Pronto: o que estava neste aparelho agora está na sua conta." : "Pronto: juntamos tudo na sua conta."))
        .catch(() => toast("Não deu para levar tudo para a conta agora. Confira a internet: o envio continua quando ela voltar."));
      redesenha();
    }
    lojaLocal.limpa();
  }

  /** Troca a loja quando alguém entra ou sai. @param {any} u */
  async function trocaConta(u) {
    const uid = u ? u.uid : null;
    if (uid && loja.nuvem && loja.uid === uid) {
      quem = u; // mesma conta: só mudou o e-mail confirmado, um provedor novo…
    } else {
      if (loja.nuvem) loja.para();
      loja = lojaLocal;
      quem = u;
      if (uid) {
        try {
          const c = await pConta;
          const { F, db } = await c.firestore();
          const nova = await criaLojaNuvem({ F, db, uid }).carrega();
          loja = nova;
          mostra();
          await levaDadosDoAparelho(nova);
          return;
        } catch (e) {
          console.warn("conta", e);
          const t = traduzErro(e);
          toast(t.startsWith("Não foi possível") ? "Não deu para abrir seus dados agora. Confira a internet e tente de novo." : t);
        }
      }
    }
    mostra();
  }

  /** Desenha a tela certa para quem está (ou não) logado; depois do login, volta para onde a pessoa ia. */
  function mostra() {
    ligaOuvintes();
    const comecando = !pronto;
    pronto = true;
    const c = limpaCaminho(location.pathname);
    if (quem && loja.nuvem && TELAS_DE_ENTRAR.includes(c)) navega(voltaSegura(new URLSearchParams(location.search).get("volta")), { substitui: true });
    else redesenha();
    if (comecando) aoFicarPronto();
  }

  function aoFicarPronto() {
    tiraAbertura();
    notificaLembretes(lembretes(loja.lista("eventos")));
    if (loja.perfil().onboarding_completed) mostraNovidades(VERSAO, NOVIDADES);
  }

  /** @type {Promise<any>} */
  let pConta = Promise.resolve(null);
  let fila = Promise.resolve();
  if (nuvemLigada) {
    pConta = iniciaNuvem({
      cfg,
      appCheckKey: /** @type {any} */ (window).APPCHECK_SITE_KEY || "",
      aoMudar: (u) => { fila = fila.then(() => trocaConta(u)).catch((e) => console.warn(e)); },
      aoLogin: (t) => { toast(t); anuncia(t); },
      aoErro: (t) => { toast(t); anuncia(t); },
    }).then((c) => (conta = c));
    pConta.catch((e) => {
      // Sem o SDK (sem internet na primeira vez): a tela de login mostra o aviso para recarregar.
      console.warn("firebase", e);
      if (!pronto) {
        pronto = true;
        redesenha();
        aoFicarPronto();
      }
    });
  }

  ligaNavegacao(desenha);
  desenha(location.pathname + location.search);
  if (pronto) {
    ligaOuvintes();
    aoFicarPronto();
  }
  ligaAtualizacao({ anuncia });
  return { loja, desenha };

}

if (typeof document !== "undefined") iniciar();
