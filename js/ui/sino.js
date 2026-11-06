// Sino de lembretes.
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { metaTipo } from "../eventos.js";
import { parseData, contagem, hojeISO } from "../datas.js";

export const CHAVE_ALERTA = "mestriva.notifications.enabled";

/** Futuros até 7 dias à frente (por horário), em ordem. */
export function lembretes(eventos, agora = new Date()) {
  const t = agora.getTime();
  return eventos
    .filter((e) => {
      const x = parseData(e.date)?.getTime();
      return x !== undefined && x >= t && x - t <= 7 * 86400000;
    })
    .sort((a, b) => parseData(a.date).getTime() - parseData(b.date).getTime());
}

/** Conteúdo do painel do sino. permissao: "granted"|"denied"|"default"|"unsupported". */
export function desenhaLembretes(lista, permissao, ativado, agora = new Date()) {
  const itens = lista.length
    ? `<ul class="max-h-64 divide-y divide-hair overflow-y-auto">${lista
        .map((e) => {
          const m = metaTipo(e.type);
          return `<li class="flex items-start gap-2.5 px-4 py-2.5"><span class="mt-1 h-2 w-2 shrink-0 rounded-full" style="background: ${m.dot}" aria-hidden="true"></span><div class="min-w-0"><p class="truncate text-xs font-medium">${esc(e.title)}</p><p class="mt-0.5 text-[11px] text-muted-foreground">${m.label} · ${contagem(e.date, agora)}</p></div></li>`;
        })
        .join("")}</ul>`
    : `<p class="px-4 py-5 text-xs text-muted-foreground">Nenhum compromisso nos próximos 7 dias. Adicione provas e entregas no calendário.</p>`;
  const rodape =
    permissao === "granted" && ativado
      ? `<p class="flex items-center gap-1.5 text-[11px] font-medium text-[#027A48]">${icone("Check", "h-3.5 w-3.5")}Notificações do navegador ativas</p>`
      : permissao === "unsupported"
        ? `<p class="text-[11px] text-muted-foreground">Este navegador não suporta notificações. Os lembretes ficam aqui no app.</p>`
        : `<button type="button" data-ativar class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-ink/90">${icone("BellRing", "h-3.5 w-3.5 text-neon")}Ativar notificações no navegador</button>`;
  return `<div class="flex items-center justify-between border-b border-hair px-4 py-3"><p class="text-[13px] font-semibold">Lembretes</p><span class="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">7 dias</span></div>
    ${itens}
    <div class="border-t border-hair p-3">${rodape}<a href="/calendario" data-fechar-sino class="mt-2 block text-center text-[11px] font-medium text-electric">Abrir calendário</a></div>`;
}

const permissaoAtual = () => ("Notification" in window ? Notification.permission : "unsupported");
const ativado = () => { try { return localStorage.getItem(CHAVE_ALERTA) === "true"; } catch { return false; } };

/** Avisa uma vez por dia dos 3 primeiros lembretes, se o estudante ativou. */
export function notificaLembretes(lista) {
  if (permissaoAtual() !== "granted" || !ativado()) return;
  const hoje = hojeISO();
  for (const e of lista.slice(0, 3)) {
    const chave = `mestriva.notified.${e.id}`;
    try {
      if (localStorage.getItem(chave) === hoje) continue;
      new Notification(`${metaTipo(e.type).label}: ${e.title}`, { body: `${contagem(e.date)}${e.subject ? ` · ${e.subject}` : ""}`, tag: chave });
      localStorage.setItem(chave, hoje);
    } catch {
      /* sem notificação neste aparelho */
    }
  }
}

/** Abre o painel junto ao botão. @param {HTMLElement} botao @param {any[]} eventos */
export function abreSino(botao, eventos) {
  fechaSino();
  const lista = lembretes(eventos);
  const caixa = botao.parentElement;
  if (!caixa) return;
  botao.setAttribute("aria-expanded", "true");
  const painel = document.createElement("div");
  // No celular abre fixo abaixo do cabeçalho; no computador, acima do botão no menu lateral.
  painel.className = "fixed inset-x-4 top-[4.25rem] z-50 overflow-hidden panel shadow-xl lg:absolute lg:inset-x-auto lg:top-auto lg:left-0 lg:bottom-full lg:mb-2 lg:w-[300px]";
  painel.dataset.sinoPainel = "";
  const pinta = () => (painel.innerHTML = desenhaLembretes(lista, permissaoAtual(), ativado()));
  pinta();
  caixa.append(painel);
  const tecla = (/** @type {KeyboardEvent} */ e) => { if (e.key === "Escape") { fechaSino(); botao.focus(); } };
  document.addEventListener("keydown", tecla);
  // Toque fora do painel fecha (sem fundo fixo: o cabeçalho e o menu têm backdrop-blur, que prende elementos fixed dentro deles).
  const fora = (/** @type {PointerEvent} */ e) => {
    const alvo = /** @type {Node} */ (e.target);
    if (!painel.contains(alvo) && !botao.contains(alvo)) fechaSino();
  };
  setTimeout(() => document.addEventListener("pointerdown", fora, true), 0);
  painel.addEventListener("click", async (e) => {
    const alvo = /** @type {HTMLElement} */ (e.target);
    if (alvo.closest("[data-fechar-sino]")) fechaSino();
    if (alvo.closest("[data-ativar]") && "Notification" in window) {
      const r = await Notification.requestPermission();
      if (r === "granted") {
        try { localStorage.setItem(CHAVE_ALERTA, "true"); } catch { /* sem armazenamento */ }
        try { new Notification("Lembretes ativados", { body: "Você vai ser avisado quando uma prova ou entrega estiver chegando." }); } catch { /* ok */ }
      }
      pinta();
    }
  });
  fechaSino = () => {
    document.removeEventListener("keydown", tecla);
    document.removeEventListener("pointerdown", fora, true);
    painel.remove();
    botao.setAttribute("aria-expanded", "false");
    fechaSino = () => {};
  };
  /** @type {HTMLElement|null} */ (painel.querySelector("button, a"))?.focus();
}

export let fechaSino = () => {};
