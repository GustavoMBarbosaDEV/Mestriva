// Pomodoro. O tempo é calculado pelo relógio real (não atrasa com a aba em segundo plano).
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { criaTela } from "./pagina.js";

export const FOCO = 25 * 60;
export const PAUSA = 5 * 60;

export function relogio(total) {
  const t = Math.max(total, 0);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** @typedef {{fase:"foco"|"pausa", restante:number, rodando:boolean, ciclos:number, inicio:number, base:number}} Pomodoro */

/** @returns {Pomodoro} */
export const pomodoroInicial = () => ({ fase: "foco", restante: FOCO, rodando: false, ciclos: 0, inicio: 0, base: FOCO });

/** Inicia ou pausa. @param {Pomodoro} p @param {number} agora ms @returns {Pomodoro} */
export function alterna(p, agora) {
  if (p.rodando) return { ...tique(p, agora).estado, rodando: false };
  return { ...p, rodando: true, inicio: agora, base: p.restante };
}

/** Avança o tempo. @param {Pomodoro} p @param {number} agora @returns {{estado: Pomodoro, concluiuFoco: boolean}} */
export function tique(p, agora) {
  if (!p.rodando) return { estado: p, concluiuFoco: false };
  const restante = p.base - Math.floor((agora - p.inicio) / 1000);
  if (restante > 0) return { estado: { ...p, restante }, concluiuFoco: false };
  if (p.fase === "foco") return { estado: { ...p, fase: "pausa", restante: PAUSA, base: PAUSA, rodando: false, ciclos: p.ciclos + 1 }, concluiuFoco: true };
  return { estado: { ...p, fase: "foco", restante: FOCO, base: FOCO, rodando: false }, concluiuFoco: false };
}

/** @param {Pomodoro} p @returns {Pomodoro} */
export const reinicia = (p) => ({ ...p, rodando: false, restante: p.fase === "foco" ? FOCO : PAUSA, base: p.fase === "foco" ? FOCO : PAUSA });
/** @param {Pomodoro} p @returns {Pomodoro} */
export const pula = (p) => {
  const fase = /** @type {"foco"|"pausa"} */ (p.fase === "foco" ? "pausa" : "foco");
  const t = fase === "foco" ? FOCO : PAUSA;
  return { ...p, rodando: false, fase, restante: t, base: t };
};

const CIRC = 2 * Math.PI * 52;

/** @param {Pomodoro} p @param {{id:string,name:string}[]} materias @param {string} materia */
export function desenhaPomodoro(p, materias, materia) {
  const total = p.fase === "foco" ? FOCO : PAUSA;
  const progresso = 1 - p.restante / total;
  return `<section class="panel p-5">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold">Modo Pomodoro</h2>
      <span class="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-foreground/60">${p.ciclos} ciclo${p.ciclos === 1 ? "" : "s"}</span>
    </div>
    <div class="mt-4 flex flex-col items-center">
      <div class="relative h-32 w-32">
        <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#E6E9EF" stroke-width="8"></circle>
          <circle data-anel cx="60" cy="60" r="52" fill="none" stroke="${p.fase === "foco" ? "#0B1220" : "#12B76A"}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC * progresso}" style="transition: stroke-dashoffset 1s linear"></circle>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span data-relogio class="font-mono text-2xl font-medium tabular-nums" role="timer" aria-live="off">${relogio(p.restante)}</span>
          <span class="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">${p.fase === "foco" ? "foco" : "pausa"}</span>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-2">
        <button type="button" data-acao="pomo-alterna" class="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-ink/90">${icone(p.rodando ? "Pause" : "Play", "h-3.5 w-3.5 text-neon")}${p.rodando ? "Pausar" : "Iniciar"}</button>
        <button type="button" data-acao="pomo-reinicia" class="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground/70 transition hover:bg-secondary" aria-label="Reiniciar cronômetro">${icone("RotateCcw", "h-3.5 w-3.5")}</button>
        <button type="button" data-acao="pomo-pula" class="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground/70 transition hover:bg-secondary" aria-label="Pular etapa">${icone("SkipForward", "h-3.5 w-3.5")}</button>
      </div>
    </div>
    <label for="pomodoro-subject" class="mt-5 block text-[11px] font-medium text-muted-foreground">Matéria desta sessão</label>
    <select id="pomodoro-subject" data-campo="materia" class="mt-1.5 h-10 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none transition focus:border-electric">
      <option value="">Sem matéria específica</option>
      ${materias.map((m) => `<option value="${esc(m.name)}"${m.name === materia ? " selected" : ""}>${esc(m.name)}</option>`).join("")}
    </select>
    <p class="mt-3 text-[11px] leading-relaxed text-muted-foreground">Estude 25 minutos sem interrupções e descanse 5. Ao final de cada ciclo, a sessão é registrada no seu progresso.</p>
  </section>`;
}

/**
 * Monta um Pomodoro dentro de area. Grava a sessão (25 min) ao terminar cada foco.
 * @param {HTMLElement} area @param {{loja:any, anuncia:(t:string)=>void}} ctx
 */
export function montaPomodoro(area, ctx) {
  const materias = ctx.loja.lista("materias");
  const tela = criaTela(area, {
    estado: { p: pomodoroInicial(), materia: "" },
    desenha: (e) => desenhaPomodoro(e.p, materias, e.materia),
    acoes: {
      "pomo-alterna"(_el, e, t) { e.p = alterna(e.p, Date.now()); t.pinta(); ctx.anuncia(e.p.rodando ? "Cronômetro iniciado" : "Cronômetro pausado"); },
      "pomo-reinicia"(_el, e, t) { e.p = reinicia(e.p); t.pinta(); },
      "pomo-pula"(_el, e, t) { e.p = pula(e.p); t.pinta(); ctx.anuncia(e.p.fase === "foco" ? "Hora de focar" : "Hora da pausa"); },
    },
  });
  const id = setInterval(() => {
    const e = tela.estado;
    if (!e.p.rodando) return;
    const r = tique(e.p, Date.now());
    const trocou = r.estado.fase !== e.p.fase;
    e.p = r.estado;
    if (r.concluiuFoco) {
      ctx.loja.salva("sessoes", { subject: e.materia, method: "pomodoro", minutes: 25 });
      ctx.anuncia("Ciclo concluído. Hora da pausa.");
    } else if (trocou) ctx.anuncia("Pausa terminada. Hora de focar.");
    if (trocou) { tela.pinta(); return; }
    const rel = area.querySelector("[data-relogio]");
    if (rel) rel.textContent = relogio(e.p.restante);
    const anel = area.querySelector("[data-anel]");
    if (anel) anel.setAttribute("stroke-dashoffset", String(CIRC * (1 - e.p.restante / (e.p.fase === "foco" ? FOCO : PAUSA))));
  }, 500);
  return () => { clearInterval(id); tela.destroi(); };
}
