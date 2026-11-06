// Casca do app: menu lateral no computador, cabeçalho e barra inferior no celular.
import { esc, cn, iniciais } from "../util.js";
import { icone } from "../icones.js";
import { botaoAcessibilidade, botaoTema } from "./acessibilidade.js";

export const NAV = [
  { to: "/", label: "Hoje", icon: "LayoutDashboard" },
  { to: "/calendario", label: "Calendário", icon: "CalendarDays" },
  { to: "/grade", label: "Grade curricular", icon: "GraduationCap" },
  { to: "/estudar", label: "Estudar", icon: "BookOpen" },
  { to: "/notas", label: "Notas", icon: "ClipboardCheck" },
  { to: "/tutor", label: "Tutor", icon: "Sparkles" },
];
const MOBILE_NAV = [NAV[0], NAV[1], NAV[3], NAV[4], NAV[5]];

const ICON_BUTTON =
  "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground/70 transition hover:border-electric/50 hover:text-foreground";
const SINO =
  "relative inline-flex items-center justify-center rounded-xl border border-border bg-card text-foreground/70 transition hover:border-electric/50 hover:text-foreground h-9 w-9";

/** @param {string} to @param {string} caminho */
const ativo = (to, caminho) => (to === "/" ? caminho === "/" : caminho === to || caminho.startsWith(to + "/"));
const atual = (sim) => (sim ? ' aria-current="page"' : "");

/** Botão do sino (o plano 2 liga os lembretes). @param {number} [qtd] */
export function botaoSino(qtd = 0) {
  return `<div class="relative"><button type="button" data-acao="sino" aria-expanded="false" aria-label="Lembretes: ${Number(qtd)} nos próximos 7 dias" class="${SINO}">${icone("Bell")}${
    qtd > 0 ? `<span class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-electric px-1 font-mono text-[9px] font-semibold text-white">${Number(qtd)}</span>` : ""
  }</button></div>`;
}

/**
 * @param {{caminho:string, usuario:{nome:string, email:string}, tema:"light"|"dark", conteudo:string, lembretes?:number}} p
 * conteudo é HTML já montado pela página (que escapa os próprios dados).
 */
export function casca({ caminho, usuario, tema, conteudo, lembretes = 0 }) {
  const lateral = NAV.map((item) => {
    const sim = ativo(item.to, caminho);
    return `<a href="${item.to}"${atual(sim)} class="${cn(
      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
      sim ? "bg-ink text-white shadow-sm" : "text-foreground/65 hover:bg-secondary hover:text-foreground"
    )}">${icone(item.icon, cn("h-[18px] w-[18px]", sim && "text-neon"))}${item.label}</a>`;
  }).join("");

  const celular = MOBILE_NAV.map((item) => {
    const sim = ativo(item.to, caminho);
    return `<a href="${item.to}"${atual(sim)} class="${cn(
      "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
      sim ? "text-foreground" : "text-muted-foreground"
    )}"><span class="${cn("flex h-8 w-8 items-center justify-center rounded-lg transition", sim ? "bg-ink text-neon" : "text-muted-foreground")}">${icone(item.icon)}</span>${item.label.replace(" curricular", "")}</a>`;
  }).join("");

  return `<div class="relative min-h-screen bg-background">
  <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <div class="absolute inset-0 bg-grid-light opacity-50 dark:opacity-0"></div>
    <div class="absolute -top-48 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-electric/[0.06] blur-3xl"></div>
    <div class="absolute bottom-[-16rem] left-[10%] h-[28rem] w-[28rem] rounded-full bg-[#7c5cff]/[0.05] blur-3xl"></div>
  </div>
  <a href="#conteudo" data-externo class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white">Pular para o conteúdo</a>

  <aside class="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-hair bg-card/70 px-4 py-6 backdrop-blur-xl lg:flex">
    <a href="/" class="flex items-center gap-3 px-2">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-heading text-lg font-bold text-neon">M</span>
      <span>
        <span class="block font-heading text-[17px] font-semibold leading-none">Mestriva</span>
        <span class="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">estudo com método</span>
      </span>
    </a>
    <nav class="mt-8 flex flex-1 flex-col gap-1" aria-label="Navegação principal">${lateral}</nav>
    <div class="mt-6 space-y-2 border-t border-hair pt-4">
      ${botaoAcessibilidade({ compacto: false, classe: "w-full justify-center" })}
      <div class="grid grid-cols-4 gap-1.5">
        ${botaoSino(lembretes)}
        ${botaoTema(tema, { compacto: true })}
        <button type="button" data-acao="foco" class="${ICON_BUTTON}" aria-label="Entrar no modo foco" title="Modo foco">${icone("Focus")}</button>
        <a href="/ajustes" class="${ICON_BUTTON}" aria-label="Ajustes da conta">${icone("Settings")}</a>
      </div>
      <div class="flex items-center gap-3 rounded-xl bg-secondary/70 px-3 py-2.5">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">${esc(iniciais(usuario.nome, usuario.email))}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-xs font-medium">${esc(usuario.nome || "Estudante")}</span>
          <span class="block truncate text-[11px] text-muted-foreground">${esc(usuario.email)}</span>
        </span>
        <button type="button" data-acao="sair" class="text-muted-foreground transition hover:text-destructive" aria-label="Sair da conta">${icone("LogOut")}</button>
      </div>
    </div>
  </aside>

  <header class="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-hair bg-card/85 px-4 py-3 backdrop-blur-xl lg:hidden">
    <a href="/" class="flex min-w-0 items-center gap-2.5">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink font-heading text-sm font-bold text-neon">M</span>
      <span class="truncate font-heading text-base font-semibold">Mestriva</span>
    </a>
    <div class="flex shrink-0 items-center gap-1.5">
      ${botaoSino(lembretes)}
      ${botaoTema(tema, { compacto: true })}
      ${botaoAcessibilidade({ compacto: true })}
      <a href="/ajustes" class="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground/70" aria-label="Ajustes da conta">${icone("Settings")}</a>
    </div>
  </header>

  <main id="conteudo" tabindex="-1" class="relative z-10 outline-none lg:pl-[264px]">
    <div class="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
      <div class="pagina-entra">
${conteudo}
      </div>
    </div>
  </main>

  <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-hair bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Navegação principal">
    <div class="mx-auto flex max-w-lg items-stretch justify-between px-2">${celular}</div>
  </nav>
</div>`;
}
