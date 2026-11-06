// Landing (/bem-vindo).
// Os textos que prometiam IA agora descrevem o que o app faz de verdade (banco, revisão e tutor no aparelho).
import { icone } from "../icones.js";
import { botaoAcessibilidade, botaoTema } from "../ui/acessibilidade.js";

const RECURSOS = [
  { icon: "Upload", title: "Grade em dois minutos", text: "Cole a lista de matérias do curso e o app organiza tudo por período." },
  { icon: "CalendarDays", title: "Calendário com lembretes", text: "Provas, trabalhos e palestras com contagem regressiva." },
  { icon: "Sparkles", title: "Quiz da próxima prova", text: "Questões com explicação, e as que você erra voltam antes da prova." },
  { icon: "BookOpen", title: "Resumos prontos e seus", text: "Material do banco do Mestriva e as suas anotações, para reler ou ouvir." },
  { icon: "ClipboardCheck", title: "Nota vira revisão", text: "Conte o que errou e receba uma revisão focada exatamente nessas lacunas." },
  { icon: "Palette", title: "Seu jeito de ler", text: "Alto contraste, fonte para dislexia, filtros para daltonismo e voz." },
];
const ACESSO = [
  "Leitura em voz alta dos materiais",
  "Ditado por voz nas perguntas e buscas",
  "Modo foco para TDAH, com uma tarefa por vez",
  "Filtros para protanopia, deuteranopia e tritanopia",
];
const LINHAS = [
  { icon: "CalendarDays", label: "Prova de Física", meta: "amanhã, 08:00" },
  { icon: "ClipboardCheck", label: "Relatório de Sociologia", meta: "em 3 dias" },
  { icon: "Mic", label: "Ditar uma pergunta", meta: "voz para texto" },
];
const ATRASO = ["rise-1", "rise-2", "rise-3", "", "", ""];

function heroi() {
  const barra = (label, value, w) => `<div class="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[11px]"><div class="flex items-center justify-between"><span class="text-white/55">${label}</span><span class="font-medium text-white/90">${value}</span></div><div class="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true"><span class="block h-full rounded-full bg-gradient-to-r from-neon/80 to-electric ${w}"></span></div></div>`;
  return `<section class="relative isolate overflow-hidden">
    <div class="aurora" aria-hidden="true"><span class="a1"></span><span class="a2"></span><span class="a3"></span></div>
    <div class="pointer-events-none absolute inset-0 bg-grid-light opacity-60" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" aria-hidden="true"></div>
    <div class="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:py-24">
      <div>
        <span class="rise inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur"><span class="h-1.5 w-1.5 rounded-full bg-electric pulse-dot"></span>feito para universitários</span>
        <h1 class="rise rise-1 mt-5 font-heading text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-[62px]">Estude com método.<br />Chegue na prova <span class="shimmer-text text-electric">sabendo</span>.</h1>
        <p class="rise rise-2 mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">O Mestriva organiza sua grade curricular, acompanha cada prazo e transforma o conteúdo da próxima prova em quiz, resumos e revisões — no seu ritmo, com acessibilidade de verdade e com seus dados só com você.</p>
        <div class="rise rise-3 mt-8 flex flex-wrap items-center gap-3">
          <a href="/register" class="group inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(11,18,32,0.9)] transition hover:-translate-y-0.5 hover:bg-ink/90">Criar minha conta grátis${icone("ArrowRight", "h-4 w-4 text-neon transition group-hover:translate-x-0.5")}</a>
          <a href="/login" class="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-5 py-3.5 text-sm font-medium text-foreground/80 backdrop-blur transition hover:-translate-y-0.5 hover:border-electric/50">Já tenho conta</a>
        </div>
        <p class="rise rise-3 mt-5 flex items-center gap-2 text-[11px] text-muted-foreground"><span class="h-px w-6 bg-electric/50" aria-hidden="true"></span>Sem cartão e sem anúncios. Você começa respondendo um questionário de 2 minutos.</p>
      </div>
      <div class="rise rise-2 relative">
        <div class="absolute -inset-6 -z-10 rounded-[36px] bg-electric/[0.12] blur-3xl" aria-hidden="true"></div>
        <div class="float-slow relative overflow-hidden rounded-3xl bg-ink p-1 shadow-[0_40px_80px_-40px_rgba(11,18,32,0.75)] ring-1 ring-white/10">
          <div class="absolute inset-x-0 top-0 flex h-9 items-center gap-1.5 px-4" aria-hidden="true"><span class="h-1.5 w-1.5 rounded-full bg-white/25"></span><span class="h-1.5 w-1.5 rounded-full bg-white/20"></span><span class="h-1.5 w-1.5 rounded-full bg-neon/70"></span><span class="ml-auto font-mono text-[8px] uppercase tracking-[0.22em] text-white/30">mestriva · painel</span></div>
          <div class="scanline relative mt-9 overflow-hidden rounded-[20px] p-6 text-white">
            <div class="pointer-events-none absolute inset-0 bg-grid opacity-[0.1]" aria-hidden="true"></div>
            <div class="relative">
              <div class="flex items-center justify-between"><span class="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">próxima prova</span><span class="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/60">em 4 dias</span></div>
              <h2 class="mt-3 font-heading text-[22px] font-semibold leading-snug">Cálculo II — Derivadas parciais</h2>
              <p class="mt-1.5 text-xs text-white/50">12 de novembro · 19:00 · Prof. Helena</p>
              <div class="mt-6 space-y-2">${barra("Quiz pronto", "8 questões", "w-[86%]")}${barra("Material", "Resumo + revisão", "w-[62%]")}${barra("Foco", "3 ciclos hoje", "w-[74%]")}</div>
              <div class="mt-5 flex items-center gap-2"><span class="inline-flex items-center gap-1.5 rounded-lg bg-neon px-3 py-1.5 text-[11px] font-semibold text-ink">${icone("Sparkles", "h-3 w-3")}Revisar agora</span><span class="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[11px] text-white/70">${icone("Bell", "h-3 w-3")}Lembrete ativo</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function recursos() {
  return `<section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
    <div class="revela flex flex-wrap items-end justify-between gap-3"><div><p class="mono-label">recursos</p><h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Tudo em um só lugar</h2></div><p class="max-w-sm text-sm text-muted-foreground">Nada de cinco apps diferentes para organizar o semestre.</p></div>
    <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">${RECURSOS.map(
      (r, i) => `<div class="revela ${ATRASO[i % 3]}"><article class="panel panel-interactive panel-sheen group h-full p-5">
        <div class="flex items-start justify-between"><span class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-hair bg-secondary/70">${icone(r.icon, "h-4 w-4 text-electric")}</span><span class="font-mono text-[10px] tracking-[0.16em] text-muted-foreground/60">${String(i + 1).padStart(2, "0")}</span></div>
        <h3 class="mt-4 text-sm font-semibold">${r.title}</h3><p class="mt-1.5 text-xs leading-relaxed text-muted-foreground">${r.text}</p>
        <div class="mt-4 h-px w-full bg-gradient-to-r from-electric/40 via-hair to-transparent" aria-hidden="true"></div>
      </article></div>`
    ).join("")}</div>
  </section>`;
}

function acessibilidade(e, tema) {
  const demo = e.foco
    ? `<div class="panel-ticks relative mt-4 overflow-hidden rounded-xl bg-ink p-6 text-center text-white ring-1 ring-white/10"><div class="pointer-events-none absolute inset-0 bg-grid opacity-[0.1]" aria-hidden="true"></div><div class="relative"><p class="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">foco</p><p class="mt-2 font-mono text-[42px] font-medium tabular-nums leading-none text-neon">25:00</p><p class="mt-3 text-[11px] text-white/55">Uma tarefa. Sem distração.</p></div></div>`
    : `<div class="mt-4 space-y-2">${LINHAS.map((l) => `<div class="panel-interactive flex items-center gap-2.5 rounded-xl border border-hair bg-card px-3 py-2.5"><span class="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/70">${icone(l.icon, "h-3.5 w-3.5 text-electric")}</span><span class="min-w-0 flex-1"><span class="block truncate text-[12px] font-medium">${l.label}</span><span class="block text-[10px] text-muted-foreground">${l.meta}</span></span></div>`).join("")}</div>`;
  return `<section class="mx-auto max-w-6xl px-4 pb-16 sm:px-6"><div class="revela"><div class="panel panel-ticks grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_1fr] lg:items-center">
    <div>
      <p class="mono-label text-electric">acessibilidade</p>
      <h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]">Feito para funcionar com você</h2>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">Acessibilidade não é um extra escondido no menu: está no caminho de quem precisa. Ajuste texto, contraste, cores e voz em segundos — e o app lembra das suas escolhas.</p>
      <ul class="mt-5 space-y-2.5">${ACESSO.map((a) => `<li class="flex items-start gap-2.5 text-[13px] text-foreground/80"><span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric" aria-hidden="true"></span>${a}</li>`).join("")}</ul>
      <div class="mt-6 flex flex-wrap items-center gap-2">${botaoAcessibilidade({ compacto: false })}${botaoTema(tema, { compacto: false })}</div>
    </div>
    <div class="relative rounded-2xl border border-hair bg-secondary/40 p-5">
      <div class="flex items-center justify-between"><span class="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">${icone("Focus", "h-3.5 w-3.5")}modo foco</span><button type="button" data-acao="demo-foco" aria-pressed="${e.foco}" class="rounded-lg border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-foreground/70 transition hover:border-electric/50">${e.foco ? "Mostrar normal" : "Visualizar"}</button></div>
      ${demo}
      <p class="mt-4 text-[11px] leading-relaxed text-muted-foreground">${tema === "dark" ? "Tema escuro ativo — bom para estudar à noite." : "Tema claro ativo — alterne quando quiser."}</p>
    </div>
  </div></div></section>`;
}

const CHAMADA = `<section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6"><div class="revela"><div class="panel-ticks relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center text-white ring-1 ring-white/10 sm:px-12">
  <div class="pointer-events-none absolute inset-0 bg-grid opacity-[0.1]" aria-hidden="true"></div>
  <div class="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-electric/35 blur-3xl" aria-hidden="true"></div>
  <div class="relative">
    <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05]">${icone("GraduationCap", "h-6 w-6 text-neon")}</span>
    <h2 class="mt-5 font-heading text-2xl font-semibold tracking-tight sm:text-[32px]">Seu próximo semestre pode ser diferente.</h2>
    <p class="mx-auto mt-2.5 max-w-xl text-sm text-white/60">Cadastre sua grade, marque as provas e comece a estudar com um plano que cabe na sua rotina.</p>
    <a href="/register" class="group mt-7 inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-3.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:brightness-105">Começar agora${icone("ArrowRight", "h-4 w-4 transition group-hover:translate-x-0.5")}</a>
  </div>
</div></div></section>`;

export function desenha(e, tema) {
  return `<div class="min-h-screen bg-background">
    <header class="sticky top-0 z-30 border-b border-hair bg-background/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <a href="/bem-vindo" class="flex min-w-0 items-center gap-2.5"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink font-heading text-base font-bold text-neon">M</span><span class="min-w-0"><span class="block font-heading text-[15px] font-semibold leading-none">Mestriva</span><span class="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">estudo com método</span></span></a>
        <div class="flex shrink-0 items-center gap-1.5">
          ${botaoTema(tema, { compacto: true })}${botaoAcessibilidade({ compacto: true })}
          <a href="/login" class="hidden rounded-xl px-3 py-2 text-sm font-medium text-foreground/75 transition hover:text-foreground sm:block">Entrar</a>
          <a href="/register" class="group inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90">Criar conta${icone("ArrowRight", "h-3.5 w-3.5 text-neon transition group-hover:translate-x-0.5")}</a>
        </div>
      </div>
    </header>
    <main>${heroi()}${recursos()}${acessibilidade(e, tema)}${CHAMADA}</main>
    <footer class="border-t border-hair py-6">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-[11px] text-muted-foreground sm:px-6">
        <span class="inline-flex items-center gap-2">${icone("Moon", "h-3.5 w-3.5")}Mestriva · estudo com método</span>
        <span class="inline-flex flex-wrap items-center gap-3"><a href="/privacidade" data-externo class="hover:text-foreground">Privacidade</a><a href="/termos" data-externo class="hover:text-foreground">Termos</a><span>Feito para quem estuda de verdade.</span></span>
      </div>
    </footer>
  </div>`;
}

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha({ foco: false }, ctx.prefs.tema)}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const e = { foco: false };
  const clique = (/** @type {MouseEvent} */ ev) => {
    const el = /** @type {HTMLElement} */ (ev.target).closest('[data-acao="demo-foco"]');
    if (!el) return;
    e.foco = !e.foco;
    area.innerHTML = desenha(e, ctx.prefs.tema);
    revela();
    /** @type {HTMLElement|null} */ (area.querySelector('[data-acao="demo-foco"]'))?.focus();
  };
  area.addEventListener("click", clique);
  /** @type {IntersectionObserver|null} */
  let obs = null;
  function revela() {
    obs?.disconnect();
    if (!("IntersectionObserver" in window)) { area.querySelectorAll(".revela").forEach((x) => x.classList.add("visivel")); return; }
    obs = new IntersectionObserver((entradas) => {
      for (const en of entradas) if (en.isIntersecting) { en.target.classList.add("visivel"); obs?.unobserve(en.target); }
    }, { threshold: 0.15 });
    area.querySelectorAll(".revela:not(.visivel)").forEach((x) => obs?.observe(x));
  }
  document.documentElement.classList.add("com-revela");
  revela();
  return () => { obs?.disconnect(); area.removeEventListener("click", clique); };
}
