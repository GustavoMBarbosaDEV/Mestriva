// Entrar no Mestriva (mesmo jeito do Monetra): Google, Microsoft, e-mail e senha, link por e-mail e "Testar sem conta".
// Serve /login, /register (aba Criar conta), /forgot-password e /reset-password (pedir link de nova senha).
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { simbolo } from "../ui/marca.js";
import { campo, CLASSE_CAMPO } from "../ui/formulario.js";
import { criaTela } from "../ui/pagina.js";
import { navegadorDeApp } from "../nuvem.js";

const BOTAO_PROVEDOR =
  "flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-electric/50 hover:bg-secondary/60 disabled:opacity-60";
const BOTAO_PRINCIPAL =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60";
const LINK = "font-medium text-electric underline-offset-4 hover:underline";

/** @param {string} pagina @param {{email?: string, linkPendente?: boolean}} [extra] */
export function estadoLogin(pagina, { email = "", linkPendente = false } = {}) {
  const esqueci = pagina === "forgot-password" || pagina === "reset-password";
  return {
    aba: pagina === "register" ? "criar" : "entrar",
    modo: linkPendente ? "concluir" : esqueci ? "esqueci" : "senha",
    email,
    senha: "",
    ver: false,
    ocupado: "",
    erro: "",
    ok: "",
  };
}

const TITULOS = {
  senha: { entrar: ["Entrar no Mestriva", "Seus estudos em qualquer aparelho, salvos na sua conta."], criar: ["Criar sua conta", "Grátis, sem anúncios. Seus dados ficam só com você."] },
  link: ["Entrar sem senha", "Mandamos um link para o seu e-mail. É só tocar nele para entrar."],
  esqueci: ["Esqueci a senha", "Digite o e-mail da conta: mandamos um link para criar uma senha nova."],
  concluir: ["Confirme seu e-mail", "Você abriu o link em outro aparelho. Digite o e-mail para onde ele foi enviado."],
};

/** @param {ReturnType<typeof estadoLogin>} e @param {{semConta?: boolean, ua?: string}} [op] */
export function desenhaLogin(e, { semConta = false, ua = "" } = {}) {
  const [titulo, sub] = e.modo === "senha" ? TITULOS.senha[e.aba] : TITULOS[e.modo];
  const ocupado = !!e.ocupado;
  const dis = ocupado ? " disabled" : "";
  const giro = (qual) => (e.ocupado === qual ? icone("Loader2", "h-4 w-4 animate-spin") : "");
  const abas = e.modo === "senha"
    ? `<div role="tablist" aria-label="Entrar ou criar conta" class="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">${[["entrar", "Entrar"], ["criar", "Criar conta"]]
        .map(([v, r]) => `<button type="button" role="tab" aria-selected="${e.aba === v}" data-acao="aba" data-valor="${v}" class="${cn("h-10 rounded-lg text-sm font-semibold transition", e.aba === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}">${r}</button>`)
        .join("")}</div>`
    : `<button type="button" data-acao="modo" data-valor="senha" class="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground">${icone("ArrowLeft", "h-3.5 w-3.5")}Voltar</button>`;
  const avisoApp = navegadorDeApp(ua)
    ? `<p role="note" class="mt-5 flex gap-2 rounded-xl border border-[#F79009]/40 bg-[#F79009]/10 px-3.5 py-3 text-xs leading-relaxed">${icone("AlertTriangle", "mt-0.5 h-4 w-4 shrink-0 text-[#B54708]")}<span>Você abriu o Mestriva dentro de outro app. O Google não deixa entrar por aqui: toque nos três pontinhos e escolha <b>Abrir no navegador</b> (Chrome ou Safari). E-mail e senha funcionam normalmente.</span></p>`
    : "";
  const provedores = e.modo === "senha"
    ? `<div class="mt-5 space-y-2.5">
        <button type="button" data-acao="provedor" data-valor="google" class="${BOTAO_PROVEDOR}"${dis}>${giro("google") || icone("Google", "h-5 w-5")}Continuar com o Google</button>
        <button type="button" data-acao="provedor" data-valor="microsoft" class="${BOTAO_PROVEDOR}"${dis}>${giro("microsoft") || icone("Microsoft", "h-5 w-5")}Continuar com a Microsoft</button>
      </div>
      <div class="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground" aria-hidden="true"><span class="h-px flex-1 bg-border"></span>ou com e-mail<span class="h-px flex-1 bg-border"></span></div>`
    : `<div class="mt-5"></div>`;
  const senha = e.modo === "senha"
    ? campo({
        rotulo: "Senha",
        para: "login-senha",
        dica: e.aba === "criar" ? "Pelo menos 8 caracteres, com letras e números." : "",
        conteudo: `<div class="relative"><input id="login-senha" data-campo="senha" type="${e.ver ? "text" : "password"}" value="${esc(e.senha)}" autocomplete="${e.aba === "criar" ? "new-password" : "current-password"}" required minlength="${e.aba === "criar" ? 8 : 1}" class="${CLASSE_CAMPO} pr-12" /><button type="button" data-acao="ver" aria-pressed="${e.ver}" aria-label="${e.ver ? "Esconder a senha" : "Mostrar a senha"}" class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground">${icone(e.ver ? "EyeOff" : "Eye", "h-4 w-4")}</button></div>`,
      })
    : "";
  const textoBotao = { senha: e.aba === "criar" ? "Criar conta" : "Entrar", link: "Mandar o link", esqueci: "Mandar o link de nova senha", concluir: "Entrar" }[e.modo];
  const links = e.modo === "senha"
    ? `<div class="mt-4 flex flex-col items-center gap-2 text-xs">
        ${e.aba === "entrar" ? `<button type="button" data-acao="modo" data-valor="esqueci" class="${LINK}">Esqueci a senha</button>` : ""}
        <button type="button" data-acao="modo" data-valor="link" class="${LINK} inline-flex items-center gap-1.5">${icone("Mail", "h-3.5 w-3.5")}Entrar sem senha, por link no e-mail</button>
      </div>`
    : "";
  const teste = e.modo === "senha" && !semConta
    ? `<div class="mt-6 border-t border-border pt-5 text-center">
        <button type="button" data-acao="testar" class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-secondary hover:text-foreground"${dis}>${giro("testar") || icone("Play", "h-4 w-4 text-electric")}Testar sem criar conta</button>
        <p class="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">Use à vontade e crie a conta depois em Ajustes, sem perder nada.</p>
      </div>`
    : "";
  return `<main id="conteudo" class="flex min-h-screen items-start justify-center px-4 py-10 sm:items-center">
    <div class="w-full max-w-md">
      <a href="/bem-vindo" class="mb-6 inline-flex items-center gap-2.5" aria-label="Mestriva, página inicial">${simbolo("h-9 w-9")}<span class="font-heading text-lg font-semibold">Mestriva</span></a>
      <section class="panel p-6 sm:p-8">
        <h1 class="font-heading text-2xl font-semibold leading-tight">${esc(titulo)}</h1>
        <p class="mt-2 text-sm text-muted-foreground">${esc(sub)}</p>
        ${avisoApp}
        ${abas}
        ${provedores}
        <form data-enviar="email" class="space-y-4" novalidate>
          ${campo({ rotulo: "E-mail", para: "login-email", conteudo: `<input id="login-email" data-campo="email" type="email" inputmode="email" autocomplete="email" value="${esc(e.email)}" required class="${CLASSE_CAMPO}" />` })}
          ${senha}
          ${e.erro ? `<p role="alert" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(e.erro)}</p>` : ""}
          ${e.ok ? `<p role="status" class="rounded-xl bg-[#027A48]/10 px-3.5 py-2.5 text-xs font-medium text-[#027A48] dark:text-[#6CE9A6]">${esc(e.ok)}</p>` : ""}
          <button type="submit" class="${BOTAO_PRINCIPAL}"${dis}>${giro("email") || icone(e.modo === "senha" ? (e.aba === "criar" ? "UserPlus" : "LogIn") : "Send", "h-4 w-4 text-neon")}${esc(textoBotao)}</button>
        </form>
        ${links}
        ${teste}
      </section>
      <p class="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">Ao entrar, você aceita os <a href="/termos.html" data-externo class="underline underline-offset-2 hover:text-foreground">termos de uso</a> e a <a href="/privacidade.html" data-externo class="underline underline-offset-2 hover:text-foreground">política de privacidade</a>. Dúvidas? <a href="/faq.html" data-externo class="underline underline-offset-2 hover:text-foreground">Perguntas frequentes</a>.</p>
    </div>
  </main>`;
}

const semLogin = `<main id="conteudo" class="flex min-h-screen items-center justify-center px-4 py-10"><section class="panel w-full max-w-md p-6 sm:p-8">
  <h1 class="font-heading text-2xl font-semibold">Não deu para abrir o login</h1>
  <p class="mt-2 text-sm text-muted-foreground">Confira a internet e recarregue a página. Seus dados continuam guardados.</p>
  <button type="button" data-acao="recarregar" class="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white">${icone("RefreshCw", "h-4 w-4 text-neon")}Recarregar</button>
</section></main>`;

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${ctx.conta ? "" : semLogin}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const conta = ctx.conta;
  if (!conta) {
    const recarrega = (/** @type {Event} */ ev) => { if (/** @type {HTMLElement} */ (ev.target).closest("[data-acao=recarregar]")) location.reload(); };
    area.addEventListener("click", recarrega);
    return () => area.removeEventListener("click", recarrega);
  }
  const ua = navigator.userAgent;
  let vivo = true;
  /** Roda uma ação da conta mostrando o carregando e a mensagem de erro (ou de sucesso). */
  async function faz(tela, qual, fn) {
    const e = tela.estado;
    if (e.ocupado) return;
    e.ocupado = qual;
    e.erro = "";
    e.ok = "";
    tela.pinta();
    try {
      const msg = await fn();
      if (!vivo) return;
      if (typeof msg === "string" && msg) { e.ok = msg; ctx.anuncia(msg); }
    } catch (err) {
      if (!vivo) return;
      e.erro = (err && err.message) || "";
      if (e.erro) ctx.anuncia(e.erro);
    }
    if (!vivo) return;
    e.ocupado = "";
    tela.pinta();
  }
  const tela = criaTela(area, {
    estado: estadoLogin(ctx.rota.pagina, { linkPendente: conta.linkPendente() }),
    desenha: (e) => desenhaLogin(e, { ua }),
    acoes: {
      aba(el, e, t) { e.aba = el.dataset.valor || "entrar"; e.erro = ""; e.ok = ""; t.pinta(); },
      modo(el, e, t) { e.modo = el.dataset.valor || "senha"; e.erro = ""; e.ok = ""; t.pinta(); },
      ver(_el, e, t) { e.ver = !e.ver; t.pinta(); },
      provedor(el, _e, t) { faz(t, el.dataset.valor, () => conta.entrarCom(el.dataset.valor)); },
      testar(_el, _e, t) { faz(t, "testar", () => conta.testarSemConta()); },
    },
    aoEnviar: {
      email(_form, e, t) {
        const email = String(e.email || "").trim();
        if (e.modo === "link") faz(t, "email", () => conta.enviarLink(email));
        else if (e.modo === "esqueci") faz(t, "email", () => conta.esqueciSenha(email));
        else if (e.modo === "concluir") faz(t, "email", async () => { if (!(await conta.concluiLink(email))) throw new Error("Digite o e-mail para onde o link foi enviado."); });
        else faz(t, "email", () => conta.entrarEmail({ email, senha: e.senha, novo: e.aba === "criar" }));
      },
    },
  });
  return () => { vivo = false; tela.destroi(); };
}
