// Calendário: grade do mês e próximos compromissos.
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { metaTipo } from "../eventos.js";
import { parseData, formataData, contagem, diasDoMes, chaveDia, mesmoDia, DIAS_CURTOS } from "../datas.js";
import { cabecalho, BOTAO_PRIMARIO } from "../ui/cabecalho.js";
import { criaTela } from "../ui/pagina.js";
import { abreDialogoEvento } from "../ui/dialogo-evento.js";

const BOTAO_MES = "flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground/70 transition hover:bg-secondary";

/** Eventos por dia (AAAA-MM-DD). */
function porDia(eventos) {
  const mapa = new Map();
  for (const e of eventos) {
    const d = parseData(e.date);
    if (!d) continue;
    const k = chaveDia(d);
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(e);
  }
  for (const lista of mapa.values()) lista.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return mapa;
}

/** @param {{mes: Date, dia: Date}} e @param {any[]} eventos */
export function desenhaGrade(e, eventos, agora = new Date()) {
  const mapa = porDia(eventos);
  const dias = diasDoMes(e.mes.getFullYear(), e.mes.getMonth())
    .map((d) => {
      const doDia = mapa.get(chaveDia(d)) || [];
      const sel = mesmoDia(d, e.dia);
      const hoje = mesmoDia(d, agora);
      const fora = d.getMonth() !== e.mes.getMonth();
      return `<button type="button" data-acao="dia" data-valor="${chaveDia(d)}" aria-pressed="${sel}" aria-label="${formataData(d, "d 'de' MMMM")}, ${doDia.length} compromissos" class="${cn(
        "relative flex aspect-square flex-col items-center justify-start gap-1 border-b border-r border-hair p-1.5 text-xs transition last:border-r-0 sm:p-2",
        fora ? "bg-secondary/20 text-muted-foreground/50" : "hover:bg-secondary/50",
        sel && "bg-electric/5 ring-1 ring-inset ring-electric/40"
      )}"><span class="${cn("flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium", hoje && "bg-ink text-neon", sel && !hoje && "bg-electric text-white")}">${d.getDate()}</span><span class="flex flex-wrap items-center justify-center gap-0.5">${doDia
        .slice(0, 3)
        .map((ev) => `<span class="h-1.5 w-1.5 rounded-full" style="background: ${metaTipo(ev.type).dot}"></span>`)
        .join("")}</span></button>`;
    })
    .join("");

  const doDiaSel = mapa.get(chaveDia(e.dia)) || [];
  const lista = doDiaSel.length
    ? `<ul class="mt-2 space-y-1.5">${doDiaSel
        .map((ev) => `<li><button type="button" data-acao="abrir" data-id="${esc(ev.id)}" class="flex w-full items-center gap-2.5 rounded-lg border border-hair px-2.5 py-2 text-left transition hover:border-electric/40"><span class="h-1.5 w-1.5 shrink-0 rounded-full" style="background: ${metaTipo(ev.type).dot}"></span><span class="min-w-0 flex-1 truncate text-xs font-medium">${esc(ev.title)}</span><span class="font-mono text-[10px] text-muted-foreground">${formataData(ev.date, "HH:mm")}</span></button></li>`)
        .join("")}</ul>`
    : `<p class="mt-2 text-xs text-muted-foreground">Nada marcado neste dia.</p>`;

  return `<section class="min-w-0 overflow-hidden panel">
    <div class="flex items-center justify-between border-b border-hair px-4 py-3">
      <h2 class="font-heading text-sm font-semibold capitalize">${formataData(e.mes, "MMMM yyyy")}</h2>
      <div class="flex items-center gap-1">
        <button type="button" data-acao="mes" data-valor="-1" class="${BOTAO_MES}" aria-label="Mês anterior">${icone("ChevronLeft")}</button>
        <button type="button" data-acao="mes" data-valor="0" class="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-foreground/70 transition hover:bg-secondary">Hoje</button>
        <button type="button" data-acao="mes" data-valor="1" class="${BOTAO_MES}" aria-label="Próximo mês">${icone("ChevronRight")}</button>
      </div>
    </div>
    <div class="grid grid-cols-7 border-b border-hair bg-secondary/40">${DIAS_CURTOS.map((d) => `<div class="py-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">${d}</div>`).join("")}</div>
    <div class="grid grid-cols-7">${dias}</div>
    <div class="p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">${formataData(e.dia, "d 'de' MMMM")}</h3>
        <button type="button" data-acao="novo" class="inline-flex items-center gap-1 text-[11px] font-medium text-electric">${icone("Plus", "h-3 w-3")}Adicionar</button>
      </div>
      ${lista}
    </div>
  </section>`;
}

/** Futuros (com 12 h de tolerância), no máximo 8 — como o UpcomingEvents. */
export function contagemRegressiva(eventos, agora = new Date()) {
  const limite = agora.getTime() - 12 * 3600 * 1000;
  return eventos
    .filter((ev) => {
      const d = parseData(ev.date);
      return d && d.getTime() >= limite;
    })
    .sort((a, b) => parseData(a.date).getTime() - parseData(b.date).getTime())
    .slice(0, 8);
}

export function desenhaContagem(eventos, agora = new Date()) {
  const lista = contagemRegressiva(eventos, agora);
  const corpo = lista.length
    ? `<ul class="divide-y divide-hair">${lista
        .map((ev) => {
          const m = metaTipo(ev.type);
          return `<li><button type="button" data-acao="abrir" data-id="${esc(ev.id)}" class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-secondary/40">
            <span class="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg text-[10px] font-semibold uppercase leading-none" style="background: ${m.dot}14; color: ${m.dot}"><span class="text-sm">${formataData(ev.date, "d")}</span><span class="mt-0.5 font-mono text-[9px]">${formataData(ev.date, "MMM")}</span></span>
            <span class="min-w-0 flex-1"><span class="block truncate text-[13px] font-medium">${esc(ev.title)}</span><span class="mt-0.5 block text-[11px] text-muted-foreground">${m.label} · ${formataData(ev.date, "HH:mm")} · ${contagem(ev.date, agora)}</span></span>
            ${icone("ChevronRight", "h-4 w-4 shrink-0 text-muted-foreground/60")}
          </button></li>`;
        })
        .join("")}</ul>`
    : `<div class="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center"><p class="text-xs text-muted-foreground">Nenhum compromisso futuro registrado.</p><button type="button" data-acao="novo" class="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-[11px] font-medium text-foreground/70 transition hover:border-electric/50">${icone("Plus", "h-3 w-3")}Adicionar o primeiro</button></div>`;
  return `<section class="flex min-w-0 flex-col panel">
    <div class="flex items-center justify-between border-b border-hair px-4 py-3"><h2 class="text-sm font-semibold">Contagem regressiva</h2>${icone("CalendarDays", "h-4 w-4 text-muted-foreground")}</div>
    ${corpo}
  </section>`;
}

function desenha(e, eventos) {
  return `<div class="space-y-6">
    ${cabecalho({
      sobre: formataData(e.mes, "MMMM yyyy"),
      titulo: "Calendário acadêmico",
      descricao: "Provas, trabalhos, apresentações e palestras com contagem regressiva para você não ser pego de surpresa.",
      acoes: `<button type="button" data-acao="novo" class="${BOTAO_PRIMARIO}">${icone("Plus", "h-4 w-4 text-neon")}Novo compromisso</button>`,
    })}
    <div class="grid gap-5 lg:grid-cols-[1.4fr_1fr]">${desenhaGrade(e, eventos)}${desenhaContagem(eventos)}</div>
  </div>`;
}

const estadoInicial = () => {
  const hoje = new Date();
  return { mes: new Date(hoje.getFullYear(), hoje.getMonth(), 1), dia: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) };
};

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha(estadoInicial(), ctx.loja.lista("eventos"))}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const abre = (evento, t) =>
    abreDialogoEvento({ loja: ctx.loja, evento, dataPadrao: chaveDia(t.estado.dia), anuncia: ctx.anuncia, aoSalvar: () => t.pinta() });
  const tela = criaTela(area, {
    estado: estadoInicial(),
    desenha: (e) => desenha(e, ctx.loja.lista("eventos")),
    acoes: {
      mes(el, e, t) {
        const passo = Number(el.dataset.valor);
        const hoje = new Date();
        e.mes = passo === 0 ? new Date(hoje.getFullYear(), hoje.getMonth(), 1) : new Date(e.mes.getFullYear(), e.mes.getMonth() + passo, 1);
        if (passo === 0) e.dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        t.pinta();
        ctx.anuncia(formataData(e.mes, "MMMM yyyy"));
      },
      dia(el, e, t) {
        const [a, m, d] = String(el.dataset.valor).split("-").map(Number);
        e.dia = new Date(a, m - 1, d);
        if (e.dia.getMonth() !== e.mes.getMonth()) e.mes = new Date(a, m - 1, 1);
        t.pinta();
      },
      novo(_el, _e, t) { abre(null, t); },
      abrir(el, e, t) {
        const ev = ctx.loja.pega("eventos", el.dataset.id);
        if (!ev) return;
        const d = parseData(ev.date);
        if (d) e.dia = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        abre(ev, t);
      },
    },
  });
  return () => tela.destroi();
}
