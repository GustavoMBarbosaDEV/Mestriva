// Onboarding.
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { campo, chips, alternaChip, CLASSE_CAMPO, CLASSE_TEXTO } from "../ui/formulario.js";
import { criaTela } from "../ui/pagina.js";
import { PERIODOS } from "../curriculo.js";

export const PASSOS = [
  { title: "Sua instituição", hint: "Onde você estuda e o que cursa" },
  { title: "Sua rotina", hint: "Tempo disponível e objetivo" },
  { title: "Seu jeito de estudar", hint: "Preferências e acessibilidade" },
];
const HORAS = ["Até 5h", "5 a 10h", "10 a 20h", "Mais de 20h"];
const OBJETIVOS = ["Passar sem recuperação", "Melhorar minhas notas", "Aprender de verdade", "Equilibrar estudo e trabalho", "Me preparar para o mercado"];
const METODOS = ["Pomodoro", "Resumos", "Reler o material", "Flashcards", "Grupos de estudo", "Nenhum ainda"];
const ACESSIBILIDADE = ["Texto maior", "Alto contraste", "Fonte para dislexia", "Leitura em voz alta", "Menos animações", "Pausas frequentes"];
const TITULOS = ["Vamos começar por você.", "Como é a sua semana?", "O app se adapta a você."];
const SUBTITULOS = [
  "Esses dados personalizam seu calendário, seus materiais e seus quizzes.",
  "Com isso, montamos sugestões de rotina e lembretes realistas.",
  "Escolha o que deixa o estudo mais confortável e acessível para você.",
];

/** @param {any} perfil */
export function estadoInicial(perfil) {
  const p = perfil || {};
  return {
    passo: 0,
    salvando: false,
    erro: "",
    display_name: p.display_name || "",
    institution: p.institution || "",
    course: p.course || "",
    period: p.period || "",
    weekly_hours: p.weekly_hours || "",
    goal: p.goal || "",
    methods_used: [...(p.methods_used || [])],
    accommodations: [...(p.accommodations || [])],
    accessibility_notes: p.accessibility_notes || "",
  };
}

export function valida(e) {
  if (e.passo === 0 && (!e.display_name.trim() || !e.institution.trim() || !e.course.trim())) return "Preencha seu nome, a instituição e o curso para continuar.";
  return "";
}

export function perfilFinal(e) {
  return {
    display_name: e.display_name.trim(),
    institution: e.institution.trim(),
    course: e.course.trim(),
    period: e.period,
    weekly_hours: e.weekly_hours,
    goal: e.goal,
    methods_used: e.methods_used,
    accommodations: e.accommodations,
    accessibility_notes: e.accessibility_notes.trim(),
    onboarding_completed: true,
  };
}

/** Preferências visuais a partir do que foi marcado. */
export function a11yDasEscolhas(a11y, escolhas) {
  const a = { ...a11y };
  if (escolhas.includes("Texto maior")) a.textScale = 115;
  if (escolhas.includes("Alto contraste")) a.highContrast = true;
  if (escolhas.includes("Fonte para dislexia")) a.dyslexia = true;
  if (escolhas.includes("Menos animações")) a.reduceMotion = true;
  return a;
}

const entrada = (id, valor, placeholder, extra = "") =>
  `<input id="${id}" data-campo="${id}" value="${esc(valor)}" placeholder="${esc(placeholder)}" class="${CLASSE_CAMPO}"${extra} />`;

export function desenha(e) {
  const passos = PASSOS.map((item, i) => `<li class="flex gap-3">
      <span class="${cn(
        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
        i < e.passo ? "border-neon bg-neon text-ink" : i === e.passo ? "border-white/40 bg-white/10 text-white" : "border-white/15 text-white/35"
      )}">${i < e.passo ? icone("Check", "h-3.5 w-3.5") : i + 1}</span>
      <span><span class="${cn("block text-sm font-medium", i <= e.passo ? "text-white" : "text-white/40")}">${item.title}</span><span class="block text-xs text-white/40">${item.hint}</span></span>
    </li>`).join("");

  let corpo = "";
  if (e.passo === 0) {
    corpo = [
      campo({ rotulo: "Como você quer ser chamado", para: "display_name", conteudo: entrada("display_name", e.display_name, "Seu primeiro nome", ' autocomplete="given-name"') }),
      campo({ rotulo: "Instituição de ensino", para: "institution", conteudo: entrada("institution", e.institution, "Ex: Universidade Federal do Paraná") }),
      campo({ rotulo: "Curso", para: "course", conteudo: entrada("course", e.course, "Ex: Ciência da Computação") }),
      campo({
        rotulo: "Período atual",
        dica: "Usamos para ordenar sua grade curricular.",
        conteudo: `<div class="flex flex-wrap gap-2">${PERIODOS.map(
          (p) => `<button type="button" data-acao="periodo" data-valor="${p}" aria-pressed="${e.period === p}" class="${cn(
            "h-10 w-12 rounded-xl border text-sm font-medium transition",
            e.period === p ? "border-ink bg-ink text-white" : "border-input bg-card text-foreground/70 hover:border-electric/50"
          )}">${p}</button>`
        ).join("")}</div>`,
      }),
    ].join("");
  } else if (e.passo === 1) {
    corpo = [
      campo({ rotulo: "Horas de estudo por semana", conteudo: chips({ opcoes: HORAS, valor: e.weekly_hours, acao: "chip", nome: "weekly_hours" }) }),
      campo({ rotulo: "Seu objetivo principal neste semestre", conteudo: chips({ opcoes: OBJETIVOS, valor: e.goal, acao: "chip", nome: "goal" }) }),
      campo({ rotulo: "O que você já usa para estudar", dica: "Pode marcar mais de uma opção.", conteudo: chips({ opcoes: METODOS, valor: e.methods_used, multiplo: true, acao: "chip-multi", nome: "methods_used" }) }),
    ].join("");
  } else {
    corpo = [
      campo({ rotulo: "Recursos de acessibilidade", dica: "Aplicamos automaticamente as preferências visuais que você marcar aqui.", conteudo: chips({ opcoes: ACESSIBILIDADE, valor: e.accommodations, multiplo: true, acao: "chip-multi", nome: "accommodations" }) }),
      campo({
        rotulo: "Algo que devemos saber?",
        para: "accessibility_notes",
        dica: "TDAH, baixa visão, dislexia, ansiedade em provas… o tutor adapta as dicas.",
        conteudo: `<textarea id="accessibility_notes" data-campo="accessibility_notes" rows="4" placeholder="Opcional" class="${CLASSE_TEXTO}">${esc(e.accessibility_notes)}</textarea>`,
      }),
    ].join("");
  }

  const ultimo = e.passo === PASSOS.length - 1;
  return `<div class="grid min-h-screen bg-background lg:grid-cols-[0.85fr_1fr]">
  <aside class="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex">
    <div class="pointer-events-none absolute inset-0 bg-grid opacity-[0.13]"></div>
    <div class="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-electric/30 blur-3xl"></div>
    <div class="relative">
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 font-heading text-lg font-bold text-neon">M</span>
        <span><span class="block font-heading text-lg font-semibold leading-none">Mestriva</span><span class="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">estudo com método</span></span>
      </div>
      <h2 class="mt-14 max-w-sm font-heading text-[34px] font-semibold leading-[1.15]">Um plano de estudos que conhece a sua faculdade.</h2>
      <p class="mt-4 max-w-sm text-sm leading-relaxed text-white/60">Sua grade curricular, seu calendário de provas e um banco de quiz, resumos e revisões para estudar o que você realmente precisa aprender.</p>
    </div>
    <ol class="relative space-y-5">${passos}</ol>
  </aside>
  <main class="flex flex-col px-5 py-8 sm:px-10 lg:py-14">
    <div class="mx-auto w-full max-w-xl">
      <div class="flex items-center justify-between lg:hidden">
        <span class="font-heading text-lg font-semibold">Mestriva</span>
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">passo ${e.passo + 1} de ${PASSOS.length}</span>
      </div>
      <div class="mt-6 lg:mt-0">
        <div class="h-1 w-full overflow-hidden rounded-full bg-secondary"><div class="h-full rounded-full bg-ink transition-all duration-500" style="width: ${((e.passo + 1) / PASSOS.length) * 100}%"></div></div>
        <p class="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-electric">${PASSOS[e.passo].title}</p>
        <h1 class="mt-2 text-[26px] font-semibold leading-tight sm:text-[30px]">${TITULOS[e.passo]}</h1>
        <p class="mt-2 text-sm text-muted-foreground">${SUBTITULOS[e.passo]}</p>
      </div>
      <div class="mt-8 space-y-5">
        ${corpo}
        ${e.erro ? `<p role="alert" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(e.erro)}</p>` : ""}
      </div>
      <div class="mt-8 flex items-center justify-between gap-3">
        <button type="button" data-acao="voltar"${e.passo === 0 ? " disabled" : ""} class="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/70 transition hover:text-foreground disabled:opacity-40">${icone("ArrowLeft")}Voltar</button>
        ${
          ultimo
            ? `<button type="button" data-acao="concluir"${e.salvando ? " disabled" : ""} class="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60">${e.salvando ? icone("Loader2", "h-4 w-4 animate-spin text-neon") : icone("Check", "h-4 w-4 text-neon")}${e.salvando ? "Criando seu espaço…" : "Começar a estudar"}</button>`
            : `<button type="button" data-acao="avancar" class="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90">Continuar${icone("ArrowRight", "h-4 w-4 text-neon")}</button>`
        }
      </div>
      <p class="mt-6 text-[11px] leading-relaxed text-muted-foreground">Seus dados ficam com você e só você tem acesso. Você pode ajustar tudo depois em Ajustes.</p>
    </div>
  </main>
</div>`;
}

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha(estadoInicial(ctx.loja.perfil()))}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const tela = criaTela(area, {
    estado: estadoInicial(ctx.loja.perfil()),
    desenha,
    acoes: {
      periodo(el, e, t) { e.period = el.dataset.valor; t.pinta(); },
      chip(el, e, t) { e[el.dataset.nome] = el.dataset.valor; t.pinta(); },
      "chip-multi"(el, e, t) { e[el.dataset.nome] = alternaChip(e[el.dataset.nome], el.dataset.valor, true); t.pinta(); },
      voltar(_el, e, t) { e.passo = Math.max(0, e.passo - 1); e.erro = ""; t.pinta(); area.querySelector("h1")?.focus?.(); },
      avancar(_el, e, t) {
        e.erro = valida(e);
        if (!e.erro) e.passo = Math.min(e.passo + 1, PASSOS.length - 1);
        t.pinta();
        if (!e.erro) ctx.anuncia(`Passo ${e.passo + 1} de ${PASSOS.length}: ${PASSOS[e.passo].title}`);
      },
      concluir(_el, e, t) {
        e.salvando = true;
        t.pinta();
        ctx.loja.salvaPerfil(perfilFinal(e));
        ctx.mudaA11y(a11yDasEscolhas(ctx.prefs.a11y, e.accommodations));
        ctx.navega("/", { substitui: true });
      },
    },
  });
  return () => tela.destroi();
}
