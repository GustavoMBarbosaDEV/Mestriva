// Landing (/bem-vindo): a apresentação de quem ainda não instalou o app (mesma estrutura da do Monetra,
// com o visual do Mestriva): selo com a versão, título animado, painel com parallax, números,
// recursos alternados, acessibilidade, quem faz, perguntas, contato, chamada final e barra fixa no celular.
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { botaoAcessibilidade, botaoTema } from "../ui/acessibilidade.js";
import { simbolo, AUTOR, CONTATO, LINK_APK } from "../ui/marca.js";
import { VERSAO } from "../versao.js";

/** @typedef {{versao:string, inicio:string, android:boolean, apk:string}} Opcoes */

const RECURSOS = [
  { icon: "Upload", title: "Grade em dois minutos", text: "Cole a lista, mande o PDF ou uma foto da grade e o app organiza tudo por período." },
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
const NUMEROS = [
  { n: 0, t: "reais por mês: é grátis" },
  { n: 82, t: "matérias com conteúdo pronto" },
  { n: 2460, t: "questões explicadas" },
  { n: 2, t: "temas, claro e escuro" },
];
/** Perguntas da landing (a página /faq.html tem estas e mais algumas). */
export const FAQ = [
  ["O Mestriva é grátis?", "Sim. Não tem plano pago, anúncio nem cartão de crédito. Você usa tudo de graça."],
  ["Onde ficam os meus dados?", "Com conta, na sua conta, protegida para só você ver, e com uma cópia no aparelho para funcionar sem internet. Testando sem conta, ficam só neste aparelho. Nada é vendido nem usado para propaganda. Em Ajustes você baixa um backup, restaura, apaga tudo ou exclui a conta."],
  ["Funciona sem internet?", "Sim. Depois da primeira abertura, o app e o banco de conteúdo ficam guardados no aparelho, e você estuda mesmo offline."],
  ["Serve para o meu curso?", "Sim. A grade, o calendário, as notas e as suas anotações funcionam em qualquer curso. O banco pronto já tem 82 matérias comuns a muitos cursos e cresce a cada versão."],
  ["Como instalo no celular?", "Abra o site no navegador do celular e toque em \"Adicionar à tela inicial\" (ou \"Instalar app\"). Ele abre como um app, em tela cheia."],
  ["Encontrei um erro numa questão. E agora?", "Toque em \"Reportar erro nesta questão\" no quiz, ou escreva para o e-mail de contato. Toda mensagem é lida."],
];
const ATRASO = ["rise-1", "rise-2", "rise-3", "", "", ""];

/** Título com cada palavra entrando em sequência (--i dá o atraso). @param {string} frase @param {string} destaque @param {number} [inicio] */
export function palavrasAnimadas(frase, destaque, inicio = 0) {
  return frase
    .split(" ")
    .map((w, i) => {
      const m = /^(.*?)([.,!?]?)$/.exec(w) || ["", w, ""];
      const miolo = destaque && m[1].toLowerCase() === destaque.toLowerCase() ? `<span class="shimmer-text text-electric">${esc(m[1])}</span>${esc(m[2])}` : esc(w);
      return `<span class="palavra" style="--i:${i + inicio}">${miolo}</span>`;
    })
    .join(" ");
}

/** @param {Opcoes} op */
const botaoApk = (op) =>
  op.android && op.apk
    ? `<a href="${esc(op.apk)}" data-externo class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-electric underline-offset-4 hover:underline">${icone("Download", "h-4 w-4")}Baixar o app para Android</a>`
    : "";

/** @param {Opcoes} op @param {string} [extra] */
const botoes = (op, extra = "") => `<div class="${extra} flex flex-wrap items-center gap-3">
  <a href="${esc(op.inicio)}" class="group inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(11,18,32,0.9)] transition hover:-translate-y-0.5 hover:bg-ink/90">Começar grátis${icone("ArrowRight", "h-4 w-4 text-neon transition group-hover:translate-x-0.5")}</a>
  <a href="/login" class="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-5 py-3.5 text-sm font-medium text-foreground/80 backdrop-blur transition hover:-translate-y-0.5 hover:border-electric/50">Já tenho conta</a>
</div>`;

/** @param {Opcoes} op */
function heroi(op) {
  const barra = (/** @type {string} */ label, /** @type {string} */ value, /** @type {string} */ w) => `<div class="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[11px]"><div class="flex items-center justify-between"><span class="text-white/55">${label}</span><span class="font-medium text-white/90">${value}</span></div><div class="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true"><span class="block h-full rounded-full bg-gradient-to-r from-neon/80 to-electric ${w}"></span></div></div>`;
  return `<section class="relative isolate overflow-hidden" data-topo>
    <div class="aurora" aria-hidden="true"><span class="a1"></span><span class="a2"></span><span class="a3"></span></div>
    <div class="pointer-events-none absolute inset-0 bg-grid-light opacity-60" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" aria-hidden="true"></div>
    <div class="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:py-24">
      <div class="min-w-0">
        <span class="rise inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur"><span class="h-1.5 w-1.5 rounded-full bg-electric pulse-dot"></span>Grátis · <span class="hidden sm:inline">celular e computador · </span>versão ${esc(op.versao)}</span>
        <h1 class="mt-5 font-heading text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-[62px]">${palavrasAnimadas("Estude com método.", "")}<br />${palavrasAnimadas("Chegue na prova sabendo.", "sabendo", 3)}</h1>
        <p class="rise rise-2 mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">O Mestriva organiza sua grade curricular, acompanha cada prazo e transforma o conteúdo da próxima prova em quiz, resumos e revisões — no seu ritmo, com acessibilidade de verdade e com seus dados só com você.</p>
        ${botoes(op, "rise rise-3 mt-8")}
        ${botaoApk(op)}
        <ul class="rise rise-3 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-foreground/75">${["Sem anúncios", "Seus dados só seus", "Funciona sem internet"].map((c) => `<li class="inline-flex items-center gap-1.5">${icone("Check", "h-4 w-4 text-electric")}${c}</li>`).join("")}</ul>
        <p class="rise rise-3 mt-4 flex items-center gap-2 text-[11px] text-muted-foreground"><span class="h-px w-6 shrink-0 bg-electric/50" aria-hidden="true"></span><span>Ao começar, você lê e decide se aceita a <a href="/privacidade.html" data-externo class="underline underline-offset-2 hover:text-foreground">política de privacidade</a> e os <a href="/termos.html" data-externo class="underline underline-offset-2 hover:text-foreground">termos de uso</a>.</span></p>
      </div>
      <div class="rise rise-2 relative min-w-0">
        <div class="parallax" data-parallax>
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
              <div class="mt-5 flex flex-wrap items-center gap-2"><span class="inline-flex items-center gap-1.5 rounded-lg bg-neon px-3 py-1.5 text-[11px] font-semibold text-ink">${icone("Sparkles", "h-3 w-3")}Revisar agora</span><span class="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[11px] text-white/70">${icone("Bell", "h-3 w-3")}Lembrete ativo</span></div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </section>`;
}

const numeros = () => `<section class="mx-auto max-w-6xl px-4 pt-4 sm:px-6"><div class="revela panel grid grid-cols-2 divide-hair lg:grid-cols-4">${NUMEROS.map(
  (x) => `<div class="min-w-0 p-5 text-center sm:p-6"><b class="block font-heading text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl" data-conta="${x.n}">${x.n.toLocaleString("pt-BR")}</b><span class="mt-1 block text-xs text-muted-foreground">${x.t}</span></div>`
).join("")}</div></section>`;

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

/** Recurso em destaque, com texto e imagem trocando de lado a cada um. */
const destaque = (/** @type {string} */ ic, /** @type {string} */ olho, /** @type {string} */ tit, /** @type {string} */ txt, /** @type {string} */ visual, /** @type {boolean} */ inverte) => `<section class="revela grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
  <div class="min-w-0${inverte ? " lg:order-2" : ""}"><p class="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-electric">${icone(ic, "h-3.5 w-3.5")}${olho}</p><h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]">${tit}</h2><p class="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">${txt}</p></div>
  <div class="min-w-0">${visual}</div>
</section>`;

function destaques() {
  const periodos = [["1º período", ["Cálculo I", "Introdução à Programação", "Metodologia Científica"]], ["2º período", ["Cálculo II", "Estrutura de Dados"]]];
  const grade = `<div class="panel p-5"><p class="mono-label">grade curricular</p>${periodos.map(([p, ms]) => `<div class="mt-3"><p class="text-[11px] font-semibold text-foreground/70">${p}</p><div class="mt-1.5 flex flex-wrap gap-1.5">${/** @type {string[]} */ (ms).map((m) => `<span class="rounded-lg border border-hair bg-secondary/60 px-2.5 py-1 text-[11px]">${m}</span>`).join("")}</div></div>`).join("")}<p class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-electric">${icone("CheckCircle2", "h-3 w-3")}conteúdo pronto</p></div>`;
  const prazos = [...LINHAS.slice(0, 2), { icon: "Target", label: "Seminário de Ética", meta: "em 9 dias" }];
  const agenda = `<div class="panel space-y-2 p-5">${prazos.map((l) => `<div class="flex items-center gap-2.5 rounded-xl border border-hair bg-card px-3 py-2.5"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/70">${icone(l.icon, "h-4 w-4 text-electric")}</span><span class="min-w-0 flex-1"><span class="block truncate text-[13px] font-medium">${l.label}</span><span class="block text-[11px] text-muted-foreground">${l.meta}</span></span>${icone("Bell", "h-4 w-4 shrink-0 text-muted-foreground")}</div>`).join("")}</div>`;
  const opcoes = [["2x", true], ["x", false], ["2", false]];
  const quiz = `<div class="panel p-5"><p class="mono-label">quiz · cálculo i</p><p class="mt-2 text-sm font-medium">Qual é a derivada de x²?</p><div class="mt-3 space-y-1.5">${opcoes.map(([o, ok]) => `<div class="flex items-center justify-between rounded-xl border px-3 py-2 text-[13px] ${ok ? "border-electric/50 bg-electric/[0.07]" : "border-hair"}"><span>${o}</span>${ok ? icone("Check", "h-4 w-4 text-electric") : ""}</div>`).join("")}</div><p class="mt-3 text-[11px] leading-relaxed text-muted-foreground">Pela regra da potência, o expoente desce e diminui um: 2·x¹ = 2x. As que você errar voltam em 1, 3, 7 e 15 dias.</p></div>`;
  const cadeado = `<div class="panel-ticks relative flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10"><div class="pointer-events-none absolute inset-0 bg-grid opacity-[0.1]" aria-hidden="true"></div><span class="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05]">${icone("ShieldCheck", "h-8 w-8 text-neon")}</span></div>`;
  return `<div class="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-16 sm:px-6">
    ${destaque("GraduationCap", "grade sem digitar", "A grade do curso pronta em minutos", "Cole a lista, mande o PDF ou tire uma foto da grade. O app lê tudo no próprio aparelho, separa as matérias por período e liga cada uma ao conteúdo pronto do banco.", grade, false)}
    ${destaque("CalendarDays", "nenhum prazo perdido", "Provas e trabalhos com contagem regressiva", "O calendário mostra o que vem pela frente e o sino avisa dos compromissos dos próximos 7 dias, com notificação do navegador se você quiser.", agenda, true)}
    ${destaque("Sparkles", "estudo que fixa", "Quiz com explicação e repetição espaçada", "2.460 questões explicadas nas matérias do banco, mais cartões feitos das suas anotações. O que você erra volta antes da prova.", quiz, false)}
    ${destaque("Lock", "privado por padrão", "Seus dados são seus", "Só você vê o que guarda: sem anúncio, sem venda de dados, sem rastreio. Você baixa um backup, apaga tudo ou exclui a conta quando quiser.", cadeado, true)}
  </div>`;
}

/** @param {{foco:boolean}} e @param {"light"|"dark"} tema */
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

const quemFaz = () => `<section class="mx-auto max-w-3xl px-4 pb-16 sm:px-6"><div class="revela panel flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
  <picture class="shrink-0"><source srcset="/img/equipe-gustavo.webp" type="image/webp" /><img src="/img/equipe-gustavo.jpg" alt="${esc(AUTOR)}, criador do Mestriva, sorrindo" width="120" height="120" loading="lazy" decoding="async" class="h-[120px] w-[120px] rounded-3xl object-cover ring-4 ring-electric/25" /></picture>
  <div class="min-w-0"><p class="mono-label">quem faz</p><h2 class="mt-2 text-2xl font-semibold tracking-tight">Quem faz o Mestriva</h2><p class="mt-2 text-sm leading-relaxed text-muted-foreground"><b class="font-semibold text-foreground">${esc(AUTOR)}</b> faz o Mestriva e deixou grátis para todo estudante. Cada sugestão que chega por e-mail é lida e ajuda a decidir o que vem na próxima versão.</p></div>
</div></section>`;

const perguntas = () => `<section class="mx-auto max-w-3xl px-4 pb-16 sm:px-6" id="faq"><div class="revela">
  <p class="mono-label">dúvidas</p><h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Perguntas frequentes</h2>
  <div class="mt-6 space-y-2">${FAQ.map(([q, a]) => `<details class="group panel px-5 py-1"><summary class="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold">${esc(q)}${icone("ChevronRight", "h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-90")}</summary><p class="pb-4 text-sm leading-relaxed text-muted-foreground">${esc(a)}</p></details>`).join("")}</div>
  <p class="mt-4 text-sm"><a href="/faq.html" data-externo class="font-medium text-electric underline-offset-4 hover:underline">Ver todas as perguntas</a></p>
</div></section>`;

const contato = () => `<section class="mx-auto max-w-3xl px-4 pb-16 sm:px-6" id="contato"><div class="revela">
  <p class="mono-label">contato</p><h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Fale com a gente</h2>
  <p class="mt-2 text-sm text-muted-foreground">Dúvida, sugestão ou erro numa questão? Escreva para o e-mail abaixo: toda mensagem é lida.</p>
  <a href="mailto:${esc(CONTATO)}" data-externo class="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition hover:border-electric/50 [overflow-wrap:anywhere]">${icone("Mail", "h-4 w-4 shrink-0 text-electric")}${esc(CONTATO)}</a>
</div></section>`;

/** @param {Opcoes} op */
const chamada = (op) => `<section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6"><div class="revela"><div class="panel-ticks relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center text-white ring-1 ring-white/10 sm:px-12">
  <div class="pointer-events-none absolute inset-0 bg-grid opacity-[0.1]" aria-hidden="true"></div>
  <div class="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-electric/35 blur-3xl" aria-hidden="true"></div>
  <div class="relative">
    <span class="mx-auto block w-fit">${simbolo("h-14 w-14 rounded-2xl ring-1 ring-white/15")}</span>
    <h2 class="mt-5 font-heading text-2xl font-semibold tracking-tight sm:text-[32px]">Seu próximo semestre pode ser diferente.</h2>
    <p class="mx-auto mt-2.5 max-w-xl text-sm text-white/60">Cadastre sua grade, marque as provas e comece a estudar com um plano que cabe na sua rotina. Leva dois minutos.</p>
    <div class="mt-7 flex flex-wrap items-center justify-center gap-3">
      <a href="${esc(op.inicio)}" class="group inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-3.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:brightness-105">Começar agora${icone("ArrowRight", "h-4 w-4 transition group-hover:translate-x-0.5")}</a>
      <a href="/login" class="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-medium text-white/85 transition hover:-translate-y-0.5 hover:border-white/40">Já tenho conta</a>
    </div>
    ${botaoApk(op).replace("text-electric", "text-neon")}
  </div>
</div></div></section>`;

/**
 * @param {{foco:boolean}} e @param {"light"|"dark"} tema
 * @param {Partial<Opcoes>} [opcoes]
 */
export function desenha(e, tema, opcoes = {}) {
  /** @type {Opcoes} */
  const op = { versao: VERSAO, inicio: "/onboarding", android: false, apk: LINK_APK, ...opcoes };
  return `<div class="min-h-screen bg-background pb-20 sm:pb-0">
    <header class="sticky top-0 z-30 border-b border-hair bg-background/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <a href="/bem-vindo" class="flex min-w-0 items-center gap-2.5">${simbolo("h-9 w-9")}<span class="min-w-0"><span class="block font-heading text-[15px] font-semibold leading-none">Mestriva</span><span class="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">estudo com método</span></span></a>
        <div class="flex shrink-0 items-center gap-1.5">
          ${botaoTema(tema, { compacto: true })}${botaoAcessibilidade({ compacto: true })}
          <a href="/login" class="hidden rounded-xl px-3 py-2 text-sm font-medium text-foreground/75 transition hover:text-foreground sm:block">Entrar</a>
          <a href="${esc(op.inicio)}" class="group hidden items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 min-[380px]:inline-flex">Começar${icone("ArrowRight", "h-3.5 w-3.5 text-neon transition group-hover:translate-x-0.5")}</a>
        </div>
      </div>
    </header>
    <main>${heroi(op)}${numeros()}${recursos()}${destaques()}${acessibilidade(e, tema)}${quemFaz()}${perguntas()}${contato()}${chamada(op)}</main>
    <footer class="border-t border-hair py-8">
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-[12px] text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
        <span class="inline-flex items-center gap-2">${simbolo("h-6 w-6")}<span class="font-heading font-semibold text-foreground">Mestriva</span><span>· estudo com método</span></span>
        <nav class="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Rodapé"><a href="/faq.html" data-externo class="hover:text-foreground">Perguntas frequentes</a><a href="/privacidade.html" data-externo class="hover:text-foreground">Privacidade</a><a href="/termos.html" data-externo class="hover:text-foreground">Termos de uso</a>${op.apk ? `<a href="${esc(op.apk)}" data-externo class="hover:text-foreground">Baixar para Android</a>` : ""}<a href="mailto:${esc(CONTATO)}" data-externo class="hover:text-foreground">Contato</a></nav>
        <span>Feito por ${esc(AUTOR)}</span>
      </div>
    </footer>
    <div data-barra-fixa class="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-hair bg-background/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:hidden">
      <a href="${esc(op.inicio)}" class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white">Começar grátis${icone("ArrowRight", "h-4 w-4 text-neon")}</a>
      ${op.android && op.apk ? `<a href="${esc(op.apk)}" data-externo class="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium">${icone("Download", "h-4 w-4")}Baixar app</a>` : ""}
    </div>
  </div>`;
}

/** Sem animação: preferência do sistema ou "menos animação" do menu de acessibilidade. */
export const semMovimento = () =>
  document.documentElement.classList.contains("a11y-motion") || !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** @param {any} ctx */
function opcoesDe(ctx) {
  return {
    inicio: ctx.usuario?.modo === "nuvem" && !ctx.usuario?.conta ? "/register" : ctx.loja?.perfil?.().onboarding_completed ? "/" : "/onboarding",
    android: typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent),
  };
}

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha({ foco: false }, ctx.prefs.tema, opcoesDe(ctx))}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const e = { foco: false };
  const clique = (/** @type {MouseEvent} */ ev) => {
    const el = /** @type {HTMLElement} */ (ev.target).closest('[data-acao="demo-foco"]');
    if (!el) return;
    e.foco = !e.foco;
    area.innerHTML = desenha(e, ctx.prefs.tema, opcoesDe(ctx));
    area.querySelectorAll(".revela").forEach((x) => x.classList.add("visivel"));
    /** @type {HTMLElement|null} */ (area.querySelector('[data-acao="demo-foco"]'))?.focus();
  };
  area.addEventListener("click", clique);

  // Números contam do zero até o valor quando aparecem.
  const conta = (/** @type {Element} */ bloco) => {
    bloco.querySelectorAll("[data-conta]").forEach((b) => {
      const alvo = Number(/** @type {HTMLElement} */ (b).dataset.conta) || 0;
      if (!alvo) return;
      const t0 = performance.now();
      const passo = (/** @type {number} */ t) => {
        const p = Math.min(1, (t - t0) / 1200);
        b.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3))).toLocaleString("pt-BR");
        if (p < 1) requestAnimationFrame(passo);
      };
      b.textContent = "0";
      requestAnimationFrame(passo);
    });
  };

  /** @type {IntersectionObserver|null} */
  let obs = null;
  document.documentElement.classList.add("com-revela");
  if (semMovimento() || !("IntersectionObserver" in window)) {
    area.querySelectorAll(".revela").forEach((x) => x.classList.add("visivel"));
  } else {
    obs = new IntersectionObserver((entradas) => {
      for (const en of entradas) if (en.isIntersecting) { en.target.classList.add("visivel"); conta(en.target); obs?.unobserve(en.target); }
    }, { threshold: 0.15 });
    area.querySelectorAll(".revela:not(.visivel)").forEach((x) => obs?.observe(x));
  }

  // Parallax do painel do topo: endireita e desce um pouco conforme a página rola.
  let quadro = 0;
  const rola = () => {
    if (quadro) return;
    quadro = requestAnimationFrame(() => {
      quadro = 0;
      const par = /** @type {HTMLElement|null} */ (area.querySelector("[data-parallax]"));
      const topo = /** @type {HTMLElement|null} */ (area.querySelector("[data-topo]"));
      if (!par || !topo) return;
      if (semMovimento()) { par.style.transform = ""; return; }
      const r = topo.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      par.style.transform = `translateY(${(p * 60).toFixed(1)}px) rotate(${(-3 + p * 3).toFixed(2)}deg)`;
    });
  };
  window.addEventListener("scroll", rola, { passive: true });
  rola();
  return () => {
    obs?.disconnect();
    area.removeEventListener("click", clique);
    window.removeEventListener("scroll", rola);
    if (quadro) cancelAnimationFrame(quadro);
  };
}
