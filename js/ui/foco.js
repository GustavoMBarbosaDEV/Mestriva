// Modo foco (tela cheia com o próximo prazo e o Pomodoro).
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { metaTipo, futuros } from "../eventos.js";
import { contagem } from "../datas.js";
import { montaPomodoro } from "./pomodoro.js";

/** Conteúdo do modo foco (o Pomodoro entra em [data-pomodoro]). @param {any|null} proximo */
export function desenhaFoco(proximo, agora = new Date()) {
  const sub = proximo
    ? `<p class="mt-1.5 text-sm text-muted-foreground">${metaTipo(proximo.type).label}${proximo.subject ? ` · ${esc(proximo.subject)}` : ""} · ${contagem(proximo.date, agora)}</p>`
    : `<p class="mt-1.5 text-sm text-muted-foreground">Sem prazos próximos. Use o ciclo abaixo para revisar algo que já estudou.</p>`;
  const link = (href, ic, texto) =>
    `<a href="${href}" data-sair class="flex items-center justify-between rounded-xl border border-hair bg-card px-4 py-3 text-sm font-medium transition hover:border-electric/40"><span class="inline-flex items-center gap-2">${icone(ic, "h-4 w-4 text-electric")}${texto}</span>${icone("ArrowRight", "h-4 w-4 text-muted-foreground")}</a>`;
  return `<div class="mx-auto flex min-h-full w-full max-w-lg flex-col px-5 py-8">
    <div class="flex items-center justify-between">
      <span class="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">${icone("Focus", "h-3 w-3")}modo foco</span>
      <button type="button" data-sair class="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground/70 transition hover:bg-secondary">${icone("X", "h-3.5 w-3.5")}Sair</button>
    </div>
    <div class="mt-10 text-center">
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">uma tarefa por vez</p>
      <h1 class="mt-2 text-2xl font-semibold leading-snug">${proximo ? esc(proximo.title) : "Escolha um conteúdo e comece"}</h1>
      ${sub}
    </div>
    <div class="mt-8" data-pomodoro></div>
    <div class="mt-6 space-y-2.5">${link("/quiz", "Sparkles", "Fazer um quiz rápido")}${link("/calendario", "CalendarDays", "Conferir prazos")}</div>
    <p class="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">Tudo o que não importa agora está fora da tela de propósito.</p>
  </div>`;
}

/** @param {{loja:any, anuncia:(t:string)=>void}} ctx */
export function abreFoco(ctx) {
  const quemAbriu = /** @type {HTMLElement|null} */ (document.activeElement);
  const camada = document.createElement("div");
  camada.className = "fixed inset-0 z-50 overflow-y-auto bg-background";
  camada.setAttribute("role", "dialog");
  camada.setAttribute("aria-modal", "true");
  camada.setAttribute("aria-label", "Modo foco");
  camada.innerHTML = desenhaFoco(futuros(ctx.loja.lista("eventos"))[0] || null);
  document.body.appendChild(camada);
  const antes = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const pararPomodoro = montaPomodoro(/** @type {HTMLElement} */ (camada.querySelector("[data-pomodoro]")), ctx);
  const tecla = (/** @type {KeyboardEvent} */ e) => { if (e.key === "Escape") fecha(); };
  function fecha() {
    pararPomodoro();
    document.removeEventListener("keydown", tecla);
    camada.remove();
    document.body.style.overflow = antes;
    if (quemAbriu && document.contains(quemAbriu)) quemAbriu.focus();
  }
  camada.addEventListener("click", (e) => {
    const el = /** @type {HTMLElement} */ (e.target).closest("[data-sair]");
    if (!el) return;
    if (el.tagName === "BUTTON") e.preventDefault();
    fecha();
  });
  document.addEventListener("keydown", tecla);
  /** @type {HTMLElement|null} */ (camada.querySelector("[data-sair]"))?.focus();
  ctx.anuncia("Modo foco ligado");
  return { fecha };
}
