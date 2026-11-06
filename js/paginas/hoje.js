// Hoje (painel).
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { metaTipo } from "../eventos.js";
import { parseData, formataData, contagem, diasAte } from "../datas.js";
import { abreLeitor } from "../ui/leitor.js";

const METODOS = [
  { title: "Pomodoro", text: "25 min de foco, 5 de pausa", icon: "Clock" },
  { title: "Recall ativo", text: "Testar antes de reler", icon: "Target" },
  { title: "Feynman", text: "Explicar com palavras suas", icon: "Sparkles" },
];

/** Segunda-feira 00:00 da semana. */
export function inicioDaSemana(agora = new Date()) {
  const volta = (agora.getDay() + 6) % 7;
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - volta);
}

const porData = (a, b) => parseData(a.date).getTime() - parseData(b.date).getTime();

/** Números e listas do painel (puro). */
export function resumo(dados, agora = new Date()) {
  const h = agora.getHours();
  const t = agora.getTime();
  const eventos = dados.eventos.filter((e) => parseData(e.date)).sort(porData);
  const proximaProva = eventos.find((e) => e.type === "prova" && parseData(e.date).getTime() >= t) || null;
  const desde = inicioDaSemana(agora).getTime();
  const minutos = dados.sessoes
    .filter((s) => (parseData(s.criado_em)?.getTime() ?? -1) >= desde)
    .reduce((s, x) => s + (Number(x.minutes) || 0), 0);
  const p = dados.perfil || {};
  return {
    saudacao: h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite",
    hoje: formataData(agora, "EEEE, d 'de' MMMM"),
    nome: p.display_name || "",
    linha: [p.course, p.institution, p.period ? `${p.period} período` : ""].filter(Boolean).join(" · "),
    agenda: eventos.filter((e) => parseData(e.date).getTime() >= t - 12 * 3600 * 1000).slice(0, 4),
    proximaProva,
    diasProva: proximaProva ? diasAte(proximaProva.date, agora) : null,
    ativas: dados.materias.filter((m) => m.status !== "concluida").length,
    totalMaterias: dados.materias.length,
    semana: eventos.filter((e) => { const x = parseData(e.date).getTime(); return x >= t && x <= t + 7 * 86400000; }).length,
    foco: minutos >= 60 ? `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, "0")}` : `${minutos}min`,
    materiais: [...(dados.materiais || [])].sort((a, b) => String(b.criado_em).localeCompare(String(a.criado_em))).slice(0, 3),
    agora,
  };
}

const LINK_CONTORNO = "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground/75 transition hover:border-electric/50 hover:text-foreground";
const LINK_PRIMARIO = "inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90";

function prova(r) {
  const p = r.proximaProva;
  if (!p)
    return `<section class="rise rounded-3xl border border-dashed border-border bg-card p-6 sm:p-8">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">nenhuma prova marcada</p>
      <h2 class="mt-2 text-xl font-semibold">Vamos colocar as datas no lugar?</h2>
      <p class="mt-1.5 max-w-lg text-sm text-muted-foreground">Marque provas, trabalhos e apresentações para receber contagem regressiva, lembretes e quizzes focados no conteúdo certo.</p>
      <a href="/calendario" class="mt-4 ${LINK_PRIMARIO}">${icone("Plus", "h-4 w-4 text-neon")}Adicionar compromisso</a>
    </section>`;
  const sep = `<span class="h-1 w-1 rounded-full bg-white/30"></span>`;
  const quiz = `/quiz?subject=${encodeURIComponent(p.subject || "")}&topic=${encodeURIComponent(p.title)}`;
  return `<section class="panel-ticks rise relative overflow-hidden rounded-3xl bg-ink p-6 text-white ring-1 ring-white/10 sm:p-8">
    <div class="pointer-events-none absolute inset-0 bg-grid opacity-[0.14]" aria-hidden="true"></div>
    <div class="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-electric/40 blur-3xl" aria-hidden="true"></div>
    <div class="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <div class="max-w-xl">
        <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70"><span class="h-1.5 w-1.5 rounded-full bg-neon pulse-dot"></span>${metaTipo(p.type).label} chegando</span>
        <h2 class="mt-4 font-heading text-2xl font-semibold leading-snug sm:text-[30px]">${esc(p.title)}</h2>
        <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60"><span>${formataData(p.date, "d 'de' MMMM 'às' HH:mm")}</span>${p.subject ? `${sep}<span>${esc(p.subject)}</span>` : ""}${sep}<span>${contagem(p.date, r.agora)}</span></p>
        <div class="mt-6 flex flex-wrap gap-2.5">
          <a href="${esc(quiz)}" class="inline-flex items-center gap-2 rounded-xl bg-neon px-4 py-2.5 text-sm font-semibold text-ink transition hover:brightness-105">${icone("Sparkles")}Fazer quiz da prova</a>
          <a href="/calendario" class="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10">${icone("CalendarDays")}Ver no calendário</a>
        </div>
      </div>
      <div class="flex items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5">
        <div class="text-center"><p class="font-heading text-4xl font-semibold leading-none text-neon">${String(Math.max(r.diasProva ?? 0, 0)).padStart(2, "0")}</p><p class="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">${r.diasProva === 1 ? "dia" : "dias"}</p></div>
        <div class="h-12 w-px bg-white/10"></div>
        <div class="text-center"><p class="font-heading text-4xl font-semibold leading-none">${r.ativas}</p><p class="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">matérias</p></div>
      </div>
    </div>
  </section>`;
}

const ATRASOS = ["rise-1", "rise-2", "rise-3"];

export function desenha(r) {
  const indicadores = [
    { label: "Matérias em curso", value: r.ativas, suffix: "ativas", icon: "BookOpen" },
    { label: "Próximos 7 dias", value: r.semana, suffix: "compromissos", icon: "ClipboardCheck" },
    { label: "Foco nesta semana", value: r.foco, suffix: "", icon: "Clock" },
  ]
    .map(
      (s, i) => `<div class="rise panel p-5 ${ATRASOS[i]}">
      <div class="flex items-center justify-between"><p class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">${s.label}</p>${icone(s.icon, "h-4 w-4 text-muted-foreground")}</div>
      <p class="mt-3 font-heading text-2xl font-semibold">${esc(s.value)}${s.suffix ? `<span class="ml-1.5 text-xs font-normal text-muted-foreground">${s.suffix}</span>` : ""}</p>
    </div>`
    )
    .join("");

  const agenda = r.agenda.length
    ? `<ul class="divide-y divide-hair">${r.agenda
        .map((e) => {
          const m = metaTipo(e.type);
          return `<li class="flex items-center gap-3 px-5 py-3.5"><span class="shrink-0 rounded-lg px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${m.chip}">${m.label}</span><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">${esc(e.title)}</p><p class="mt-0.5 text-xs text-muted-foreground">${esc(e.subject || "Geral")} · ${formataData(e.date, "d MMM 'às' HH:mm")}</p></div><span class="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">${contagem(e.date, r.agora)}</span></li>`;
        })
        .join("")}</ul>`
    : `<div class="px-5 py-8 text-center"><p class="text-xs text-muted-foreground">Nada marcado por aqui ainda.</p><a href="/calendario" class="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-[11px] font-medium text-foreground/70 transition hover:border-electric/50">${icone("Plus", "h-3 w-3")}Adicionar compromisso</a></div>`;

  const materiais = r.materiais.length
    ? `<div class="mt-4 space-y-2.5">${r.materiais
        .map((m) => `<button type="button" data-acao="material" data-id="${esc(m.id)}" class="flex w-full items-start gap-3 rounded-xl bg-secondary/60 p-3 text-left transition hover:bg-secondary"><span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card">${icone("BookOpen", "h-3.5 w-3.5 text-electric")}</span><span class="min-w-0"><span class="block truncate text-[13px] font-medium">${esc(m.title)}</span><span class="block text-[11px] text-muted-foreground">${esc(m.subject || "Estudo")} · ${formataData(m.criado_em, "d MMM")}</span></span></button>`)
        .join("")}</div>`
    : `<p class="mt-3 text-xs leading-relaxed text-muted-foreground">Nenhum material ainda. Monte um resumo em Estudar e ele aparece aqui.</p>`;

  const lateral = r.totalMaterias
    ? `<section class="panel panel-interactive p-5"><h2 class="text-sm font-semibold">Foco agora</h2><p class="mt-1 text-xs text-muted-foreground">Um ciclo de 25 minutos rende mais que duas horas relendo.</p><a href="/estudar" class="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-ink/90">${icone("Clock", "h-3.5 w-3.5 text-neon")}Iniciar Pomodoro</a></section>`
    : `<section class="panel panel-interactive p-5"><h2 class="text-sm font-semibold">Comece pela sua grade</h2><p class="mt-1 text-xs leading-relaxed text-muted-foreground">Com a grade curricular cadastrada, o app sabe o que você estuda e em que ordem.</p><a href="/grade" class="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-ink/90">${icone("Upload", "h-3.5 w-3.5 text-neon")}Carregar grade curricular</a></section>`;

  return `<div class="space-y-7">
    <header class="rise flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">${r.hoje}</p>
        <h1 class="mt-2 text-[28px] font-semibold leading-tight sm:text-[34px]">${r.saudacao}${r.nome ? `, ${esc(r.nome)}.` : "."}</h1>
        <p class="mt-1.5 text-sm text-muted-foreground">${esc(r.linha || "Complete seu perfil em Ajustes")}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <a href="/estudar" class="${LINK_CONTORNO}">${icone("BookOpen")}Estudar agora</a>
        <a href="/calendario" class="${LINK_PRIMARIO}">${icone("Plus", "h-4 w-4 text-neon")}Novo compromisso</a>
      </div>
    </header>
    ${prova(r)}
    <section class="grid gap-3 sm:grid-cols-3">${indicadores}</section>
    <div class="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <section class="panel"><div class="flex items-center justify-between border-b border-hair px-5 py-4"><h2 class="text-sm font-semibold">Próximos na sua agenda</h2><a href="/calendario" class="text-xs font-medium text-electric">Ver tudo</a></div>${agenda}</section>
      <div class="space-y-5">
        <section class="panel p-5"><div class="flex items-center justify-between"><h2 class="text-sm font-semibold">Continuar estudando</h2><a href="/estudar" class="text-xs font-medium text-electric">Estudar</a></div>${materiais}</section>
        ${lateral}
      </div>
    </div>
    <section>
      <div class="mb-3 flex items-center justify-between"><h2 class="text-sm font-semibold">Métodos de estudo</h2><a href="/tutor" class="inline-flex items-center gap-1 text-xs font-medium text-electric">Perguntar ao tutor ${icone("ArrowRight", "h-3.5 w-3.5")}</a></div>
      <div class="grid gap-3 sm:grid-cols-3">${METODOS.map((m) => `<a href="/tutor" class="group flex items-center gap-3 panel p-4 transition hover:border-electric/40 hover:shadow-sm"><span class="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">${icone(m.icon, "h-4 w-4 text-ink dark:text-foreground")}</span><span><span class="block text-[13px] font-semibold">${m.title}</span><span class="block text-[11px] text-muted-foreground">${m.text}</span></span></a>`).join("")}</div>
    </section>
    ${r.totalMaterias ? `<p class="flex items-center gap-2 text-[11px] text-muted-foreground">${icone("GraduationCap", "h-3.5 w-3.5")}${r.totalMaterias} matérias na sua grade · ${r.ativas} em curso</p>` : ""}
  </div>`;
}

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha(resumo(ctx.loja.dados()))}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const clique = (/** @type {MouseEvent} */ e) => {
    const el = /** @type {HTMLElement|null} */ (/** @type {HTMLElement} */ (e.target).closest('[data-acao="material"]'));
    if (!el) return;
    e.preventDefault();
    const m = ctx.loja.pega("materiais", el.dataset.id);
    if (m) abreLeitor({ material: m, loja: ctx.loja, anuncia: ctx.anuncia, aoExcluir: () => (area.innerHTML = desenha(resumo(ctx.loja.dados()))) });
  };
  area.addEventListener("click", clique);
  return () => area.removeEventListener("click", clique);
}
