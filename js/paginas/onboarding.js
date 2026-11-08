// Onboarding.
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { campo, chips, alternaChip, CLASSE_CAMPO, CLASSE_TEXTO } from "../ui/formulario.js";
import { criaTela } from "../ui/pagina.js";
import { PERIODOS } from "../curriculo.js";
import { simbolo } from "../ui/marca.js";
import { carregaFaculdades, buscaFaculdades, cursosDaFaculdade, rotuloFaculdade, pedidoDeFaculdade } from "../faculdades.js";

export const PASSOS = [
  { title: "O que você estuda", hint: "Faculdade, escola, pós ou concurso" },
  { title: "Onde você estuda", hint: "Instituição e curso" },
  { title: "Sua rotina", hint: "Tempo disponível e objetivo" },
  { title: "Seu jeito de estudar", hint: "Preferências e acessibilidade" },
];
const HORAS = ["Até 5h", "5 a 10h", "10 a 20h", "Mais de 20h"];
/** Os 6 caminhos da primeira tela. "pos" e "vestibular" se desdobram no passo seguinte. */
export const CAMINHOS = [
  { valor: "faculdade", titulo: "Faculdade", texto: "Graduação: escolha sua faculdade e seu curso.", icone: "GraduationCap" },
  { valor: "ensino_medio", titulo: "Ensino médio", texto: "1º, 2º ou 3º ano.", icone: "School" },
  { valor: "cursinho", titulo: "Cursinho", texto: "Pré-vestibular ou pré-ENEM.", icone: "BookOpen" },
  { valor: "pos", titulo: "Mestrado ou doutorado", texto: "Pós-graduação stricto sensu.", icone: "FlaskConical" },
  { valor: "concurso", titulo: "Concurso", texto: "Público ou privado.", icone: "Landmark" },
  { valor: "vestibular", titulo: "ENEM e medicina", texto: "Foco no ENEM ou no vestibular de medicina.", icone: "Stethoscope" },
];
/** Caminho da tela a partir do público guardado no perfil. */
export const caminhoDo = (publico) => (publico === "mestrado" || publico === "doutorado" ? "pos" : publico === "enem" || publico === "medicina" ? "vestibular" : publico);
const PUBLICO_DO_CAMINHO = { pos: "mestrado", vestibular: "enem" };
const ANOS = [{ value: "1º", label: "1º ano" }, { value: "2º", label: "2º ano" }, { value: "3º", label: "3º ano" }];
const OBJETIVOS = ["Passar sem recuperação", "Melhorar minhas notas", "Aprender de verdade", "Equilibrar estudo e trabalho", "Me preparar para o mercado"];
const METODOS = ["Pomodoro", "Resumos", "Reler o material", "Flashcards", "Grupos de estudo", "Nenhum ainda"];
const ACESSIBILIDADE = ["Texto maior", "Alto contraste", "Fonte para dislexia", "Leitura em voz alta", "Menos animações", "Pausas frequentes"];
const TITULOS = ["Vamos começar por você.", "Onde você estuda?", "Como é a sua semana?", "O app se adapta a você."];
const SUBTITULOS = [
  "Conta o que você estuda: o app monta o resto a partir disso.",
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
    publico: p.publico || "faculdade",
    ies: p.ies || null,
    cidade: "",
    manual: Boolean(p.institution && !p.ies),
    manualCurso: false,
    busca_fac: "",
    busca_curso: "",
    filtroFac: "",
    filtroCurso: "",
    /** @type {any} */
    dadosFac: null,
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
  const vazio = (v) => !String(v || "").trim();
  if (e.passo === 0) return vazio(e.display_name) ? "Diga como você quer ser chamado para continuar." : "";
  if (e.passo !== 1) return "";
  switch (e.publico) {
    case "faculdade": return vazio(e.institution) || vazio(e.course) ? "Escolha sua faculdade e o seu curso (ou digite, se não achar)." : "";
    case "ensino_medio": return vazio(e.institution) || !ANOS.some((a) => a.value === e.period) ? "Informe a escola e o ano em que você está." : "";
    case "cursinho": return vazio(e.institution) ? "Informe o nome do cursinho." : "";
    case "mestrado": case "doutorado": return vazio(e.institution) || vazio(e.course) ? "Informe a instituição e o programa." : "";
    case "concurso": return vazio(e.course) ? "Informe o concurso que você vai prestar." : "";
    default: return "";
  }
}

/** Curso guardado quando o caminho já diz o que é. */
const CURSO_FIXO = { ensino_medio: "Ensino médio", enem: "ENEM", medicina: "Vestibular de medicina" };

export function perfilFinal(e) {
  return {
    display_name: e.display_name.trim(),
    publico: e.publico,
    ies: e.publico === "faculdade" && !e.manual ? e.ies : null,
    institution: e.institution.trim(),
    course: CURSO_FIXO[e.publico] || e.course.trim(),
    period: e.publico === "faculdade" || e.publico === "ensino_medio" ? e.period : "",
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

const BOTAO_LINK = "inline-flex items-center gap-1.5 text-xs font-medium text-electric hover:underline";
const ITEM_LISTA = "flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm transition hover:border-electric/50";

function cartoesCaminho(e) {
  const atual = caminhoDo(e.publico);
  return `<div class="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="O que você estuda">${CAMINHOS.map((c) => {
    const sim = c.valor === atual;
    return `<button type="button" role="radio" aria-checked="${sim}" data-acao="caminho" data-valor="${c.valor}" class="${cn(
      "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition",
      sim ? "border-ink bg-ink text-white" : "border-border bg-card hover:border-electric/50"
    )}">
      <span class="${cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", sim ? "bg-white/10 text-neon" : "bg-secondary text-foreground/70")}">${icone(c.icone, "h-4 w-4")}</span>
      <span><span class="block text-sm font-semibold">${c.titulo}</span><span class="${cn("mt-0.5 block text-xs", sim ? "text-white/60" : "text-muted-foreground")}">${c.texto}</span></span>
    </button>`;
  }).join("")}</div>`;
}

/** Resultados da busca de faculdade (só esta parte muda enquanto a pessoa digita). */
export function listaFaculdades(e) {
  if (!e.dadosFac) return `<p class="text-xs text-muted-foreground">Carregando a lista de faculdades…</p>`;
  if (!e.filtroFac.trim()) return `<p class="text-xs text-muted-foreground">Digite o nome, a sigla ou a cidade. Ex.: UFMG, PUC Minas, Juiz de Fora.</p>`;
  const achadas = buscaFaculdades(e.dadosFac, e.filtroFac);
  if (!achadas.length) return `<p class="rounded-xl bg-secondary px-3.5 py-3 text-sm text-foreground/70">Nenhuma faculdade com esse nome na nossa lista.</p>`;
  return `<ul class="space-y-2" aria-label="Faculdades encontradas">${achadas.map((f) => `<li><button type="button" data-acao="escolhe-fac" data-valor="${f.id}" class="${ITEM_LISTA}">
    <span class="min-w-0"><span class="block truncate font-medium">${esc(f.nome)}</span><span class="block truncate text-[11px] text-muted-foreground">${esc(rotuloFaculdade(f))}</span></span>
  </button></li>`).join("")}</ul>`;
}

/** Cursos da faculdade escolhida, filtrados pelo que a pessoa digita. */
export function listaCursos(e) {
  const fac = e.dadosFac?.faculdades.find((f) => f.id === e.ies);
  const cursos = cursosDaFaculdade(e.dadosFac, fac, e.filtroCurso);
  if (!cursos.length) return `<p class="rounded-xl bg-secondary px-3.5 py-3 text-sm text-foreground/70">Nenhum curso com esse nome nesta faculdade.</p>`;
  return `<ul class="grid gap-2 sm:grid-cols-2" aria-label="Cursos">${cursos.map((c) => `<li><button type="button" data-acao="escolhe-curso" data-valor="${esc(c)}" class="${ITEM_LISTA}"><span class="truncate">${esc(c)}</span></button></li>`).join("")}</ul>`;
}

const escolhido = (titulo, detalhe, acao) => `<div class="flex items-center justify-between gap-3 rounded-xl border border-ink/15 bg-secondary/60 px-3.5 py-3">
  <span class="min-w-0"><span class="block truncate text-sm font-semibold">${esc(titulo)}</span>${detalhe ? `<span class="block truncate text-[11px] text-muted-foreground">${esc(detalhe)}</span>` : ""}</span>
  <button type="button" data-acao="${acao}" class="shrink-0 text-xs font-medium text-electric hover:underline">Trocar</button>
</div>`;

const botoesPeriodo = (e, opcoes, rotulo) => `<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="${rotulo}">${opcoes.map((o) => {
  const p = typeof o === "string" ? { value: o, label: o } : o;
  return `<button type="button" role="radio" data-acao="periodo" data-valor="${p.value}" aria-checked="${e.period === p.value}" class="${cn(
    "h-10 min-w-12 rounded-xl border px-3 text-sm font-medium transition",
    e.period === p.value ? "border-ink bg-ink text-white" : "border-input bg-card text-foreground/70 hover:border-electric/50"
  )}">${p.label}</button>`;
}).join("")}</div>`;

function passoFaculdade(e) {
  const partes = [];
  if (e.manual) {
    partes.push(
      campo({ rotulo: "Faculdade", para: "institution", conteudo: entrada("institution", e.institution, "Nome da faculdade") }),
      campo({ rotulo: "Cidade e estado", para: "cidade", conteudo: entrada("cidade", e.cidade, "Ex: Juiz de Fora/MG") }),
      campo({ rotulo: "Curso", para: "course", conteudo: entrada("course", e.course, "Ex: Ciência da Computação") }),
      `<div class="flex flex-wrap items-center justify-between gap-3 text-xs">
        <a href="${esc(pedidoDeFaculdade({ faculdade: e.institution, cidade: e.cidade, curso: e.course }))}" data-pedido class="${BOTAO_LINK}">${icone("Mail", "h-3.5 w-3.5")}Pedir para incluir minha faculdade</a>
        <button type="button" data-acao="lista-fac" class="font-medium text-muted-foreground hover:text-foreground">Procurar na lista</button>
      </div>`
    );
  } else if (!e.ies) {
    partes.push(
      campo({ rotulo: "Sua faculdade", para: "busca_fac", conteudo: `<input id="busca_fac" type="search" data-campo="busca_fac" value="${esc(e.busca_fac)}" placeholder="Nome, sigla ou cidade" autocomplete="off" class="${CLASSE_CAMPO}" />` }),
      `<div data-lista-fac aria-live="polite">${listaFaculdades(e)}</div>`,
      `<button type="button" data-acao="manual" class="${BOTAO_LINK}">Não achei minha faculdade</button>`
    );
  } else {
    const fac = e.dadosFac?.faculdades.find((f) => f.id === e.ies);
    partes.push(campo({ rotulo: "Sua faculdade", conteudo: escolhido(e.institution, fac ? rotuloFaculdade(fac) : "", "troca-fac") }));
    if (e.course && !e.manualCurso) partes.push(campo({ rotulo: "Curso", conteudo: escolhido(e.course, "", "troca-curso") }));
    else if (e.manualCurso) {
      partes.push(
        campo({ rotulo: "Curso", para: "course", conteudo: entrada("course", e.course, "Nome do seu curso") }),
        `<a href="${esc(pedidoDeFaculdade({ faculdade: e.institution, curso: e.course }))}" data-pedido class="${BOTAO_LINK}">${icone("Mail", "h-3.5 w-3.5")}Pedir para incluir este curso</a>`
      );
    } else {
      partes.push(
        campo({ rotulo: "Seu curso", para: "busca_curso", conteudo: `<input id="busca_curso" type="search" data-campo="busca_curso" value="${esc(e.busca_curso)}" placeholder="Filtrar cursos" autocomplete="off" class="${CLASSE_CAMPO}" />` }),
        `<div data-lista-curso aria-live="polite">${listaCursos(e)}</div>`,
        `<button type="button" data-acao="manual-curso" class="${BOTAO_LINK}">Meu curso não está na lista</button>`
      );
    }
  }
  partes.push(campo({ rotulo: "Período atual", dica: "Usamos para ordenar sua grade curricular.", conteudo: botoesPeriodo(e, PERIODOS, "Período atual") }));
  return partes.join("");
}

/** Passo 2: muda conforme o caminho escolhido no passo 1. */
export function passoInstituicao(e) {
  switch (e.publico) {
    case "faculdade":
      return passoFaculdade(e);
    case "ensino_medio":
      return [
        campo({ rotulo: "Em que ano você está", conteudo: botoesPeriodo(e, ANOS, "Ano do ensino médio") }),
        campo({ rotulo: "Nome da escola", para: "institution", conteudo: entrada("institution", e.institution, "Ex: Escola Estadual Tiradentes") }),
        `<p class="rounded-xl bg-secondary px-3.5 py-3 text-xs text-foreground/70">Em breve: as matérias do seu ano entram sozinhas na grade, pela base nacional do ensino médio.</p>`,
      ].join("");
    case "cursinho":
      return [
        campo({ rotulo: "Nome do cursinho", para: "institution", conteudo: entrada("institution", e.institution, "Ex: Bernoulli, Poliedro, Anglo") }),
        campo({ rotulo: "Para qual prova você se prepara", para: "course", conteudo: entrada("course", e.course, "Ex: ENEM, Fuvest, Unicamp") }),
      ].join("");
    case "mestrado":
    case "doutorado":
      return [
        campo({ rotulo: "Nível", conteudo: chips({ opcoes: [{ value: "mestrado", label: "Mestrado" }, { value: "doutorado", label: "Doutorado" }], valor: e.publico, acao: "publico", nome: "publico", rotulo: "Nível" }) }),
        campo({ rotulo: "Instituição", para: "institution", conteudo: entrada("institution", e.institution, "Ex: UFMG") }),
        campo({ rotulo: "Programa ou área", para: "course", conteudo: entrada("course", e.course, "Ex: Programa de Pós-Graduação em Educação") }),
      ].join("");
    case "concurso":
      return [
        campo({ rotulo: "Concurso que você vai prestar", para: "course", conteudo: entrada("course", e.course, "Ex: INSS, Banco do Brasil, Polícia Federal") }),
        campo({ rotulo: "Banca (se souber)", para: "institution", conteudo: entrada("institution", e.institution, "Ex: Cebraspe, FGV, Vunesp") }),
        `<p class="rounded-xl bg-secondary px-3.5 py-3 text-xs text-foreground/70">Em breve: envie o edital em PDF e o app mostra as matérias e os tópicos para estudar.</p>`,
      ].join("");
    default:
      return [
        campo({ rotulo: "Seu foco", conteudo: chips({ opcoes: [{ value: "enem", label: "ENEM" }, { value: "medicina", label: "Vestibular de medicina" }], valor: e.publico, acao: "publico", nome: "publico", rotulo: "Seu foco" }) }),
        campo({ rotulo: "Escola ou cursinho (opcional)", para: "institution", conteudo: entrada("institution", e.institution, "Onde você estuda") }),
      ].join("");
  }
}

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
      campo({ rotulo: "O que você estuda", conteudo: cartoesCaminho(e) }),
    ].join("");
  } else if (e.passo === 1) {
    corpo = passoInstituicao(e);
  } else if (e.passo === 2) {
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
        ${simbolo("h-10 w-10 rounded-xl ring-1 ring-white/15")}
        <span><span class="block font-heading text-lg font-semibold leading-none">Mestriva</span><span class="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">estudo com método</span></span>
      </div>
      <h2 class="mt-14 max-w-sm font-heading text-[34px] font-semibold leading-[1.15]">Um plano de estudos que conhece a sua faculdade.</h2>
      <p class="mt-4 max-w-sm text-sm leading-relaxed text-white/60">Sua grade curricular, seu calendário de provas e um banco de quiz, resumos e revisões para estudar o que você realmente precisa aprender.</p>
    </div>
    <ol class="relative space-y-5">${passos}</ol>
  </aside>
  <main class="flex min-w-0 flex-col px-5 py-8 sm:px-10 lg:py-14">
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
    // Busca: só a lista muda enquanto a pessoa digita (redesenhar tudo no "change" do blur tiraria o botão de baixo do clique).
    aoDigitar(campo, valor, e) {
      if (campo === "busca_fac" && valor !== e.filtroFac) {
        e.filtroFac = valor;
        const lista = area.querySelector("[data-lista-fac]");
        if (lista) lista.innerHTML = listaFaculdades(e);
      } else if (campo === "busca_curso" && valor !== e.filtroCurso) {
        e.filtroCurso = valor;
        const lista = area.querySelector("[data-lista-curso]");
        if (lista) lista.innerHTML = listaCursos(e);
      } else if (["institution", "course", "cidade"].includes(campo)) {
        const pedido = /** @type {HTMLAnchorElement|null} */ (area.querySelector("[data-pedido]"));
        if (pedido) pedido.href = pedidoDeFaculdade({ faculdade: e.institution, cidade: e.cidade, curso: e.course });
      }
    },
    acoes: {
      caminho(el, e, t) {
        const v = el.dataset.valor || "faculdade";
        if (caminhoDo(e.publico) !== v) e.publico = PUBLICO_DO_CAMINHO[v] || v;
        t.pinta();
      },
      publico(el, e, t) { e.publico = el.dataset.valor || e.publico; t.pinta(); },
      "escolhe-fac"(el, e, t) {
        const f = e.dadosFac?.faculdades.find((x) => x.id === Number(el.dataset.valor));
        if (!f) return;
        Object.assign(e, { ies: f.id, institution: f.sigla ? `${f.nome} (${f.sigla})` : f.nome, course: "", manualCurso: false, busca_curso: "", filtroCurso: "", erro: "" });
        t.pinta();
        /** @type {HTMLElement|null} */ (area.querySelector("#busca_curso"))?.focus();
        ctx.anuncia(`${f.nome} escolhida. Agora escolha o curso.`);
      },
      "troca-fac"(_el, e, t) {
        Object.assign(e, { ies: null, institution: "", course: "", manualCurso: false });
        t.pinta();
        /** @type {HTMLElement|null} */ (area.querySelector("#busca_fac"))?.focus();
      },
      "escolhe-curso"(el, e, t) { e.course = el.dataset.valor || ""; e.erro = ""; t.pinta(); ctx.anuncia(`Curso: ${e.course}`); },
      "troca-curso"(_el, e, t) { e.course = ""; e.manualCurso = false; t.pinta(); /** @type {HTMLElement|null} */ (area.querySelector("#busca_curso"))?.focus(); },
      manual(_el, e, t) {
        Object.assign(e, { manual: true, ies: null, institution: e.busca_fac.trim(), course: "" });
        t.pinta();
        /** @type {HTMLElement|null} */ (area.querySelector("#institution"))?.focus();
      },
      "manual-curso"(_el, e, t) { e.manualCurso = true; e.course = e.busca_curso.trim(); t.pinta(); /** @type {HTMLElement|null} */ (area.querySelector("#course"))?.focus(); },
      "lista-fac"(_el, e, t) { Object.assign(e, { manual: false, ies: null, institution: "", course: "" }); t.pinta(); },
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
  carregaFaculdades().then((d) => {
    tela.estado.dadosFac = d;
    const lista = area.querySelector("[data-lista-fac]");
    if (lista) lista.innerHTML = listaFaculdades(tela.estado);
    else if (tela.estado.passo === 1 && tela.estado.publico === "faculdade") tela.pinta();
  });
  return () => tela.destroi();
}
