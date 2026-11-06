// Tutor. Responde por regras no próprio aparelho (js/tutor.js), com o banco do Mestriva.
// A IA embutida do Chrome (LanguageModel) ainda não aceita português; quando aceitar, pode responder o que as regras não entendem.
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { markdownParaHtml } from "../markdown.js";
import { cabecalho } from "../ui/cabecalho.js";
import { criaTela } from "../ui/pagina.js";
import { botaoOuvir, botaoDitar, temDitado, dita, fala } from "../ui/fala.js";
import { carregaIndice, carregaMateria } from "../banco.js";
import { responde, SUGESTOES } from "../tutor.js";

export const BOAS_VINDAS = {
  papel: "tutor",
  texto: "Oi! Sou seu tutor no Mestriva. Respondo aqui mesmo no seu aparelho: explico métodos como Pomodoro, recall ativo e repetição espaçada, monto um plano para a sua semana, calculo médias e abro o resumo dos conteúdos do banco. Por onde começamos?",
};
export const NAO_ENTENDI =
  "Ainda não sei responder isso. Tente perguntar sobre um **método de estudo** (Pomodoro, recall ativo, Feynman), **o que você tem essa semana**, **sua média** ou **quanto precisa tirar**, ou peça para eu **explicar um conteúdo** (ex.: \"explique derivadas\").";

const BOTAO_CONTORNO = "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground/75 transition hover:border-electric/50 hover:text-foreground";

function bolha(m, i) {
  const meu = m.papel === "estudante";
  const acoes = (m.acoes || []).map((a) => `<a href="${esc(a.href)}" class="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-[11px] font-medium text-electric ring-1 ring-hair transition hover:ring-electric/40">${esc(a.rotulo)}${icone("ArrowRight", "h-3 w-3")}</a>`).join("");
  return `<div class="${cn("flex", meu ? "justify-end" : "justify-start")}">
    <div class="${cn("max-w-[88%] rounded-2xl px-4 py-3", meu ? "rounded-br-sm bg-ink text-white" : "rounded-bl-sm border border-hair bg-secondary/50")}">
      ${meu ? `<p class="text-[13px] leading-relaxed [overflow-wrap:anywhere]">${esc(m.texto)}</p>` : `<div class="study-prose quiz-enunciado text-[13px]">${markdownParaHtml(m.texto)}</div>`}
      ${acoes ? `<div class="mt-2.5 flex flex-wrap gap-1.5">${acoes}</div>` : ""}
      ${!meu && i > 0 ? `<div class="mt-2" data-ouvir="${i}">${botaoOuvir(false, "Ouvir resposta")}</div>` : ""}
    </div>
  </div>`;
}

export function desenha(e, materias, perfil) {
  return `<div class="space-y-6">
    ${cabecalho({
      sobre: "tutor",
      titulo: "Estudar também é método",
      descricao: "Pergunte sobre métodos de estudo, peça um plano para a semana ou a explicação de um conteúdo. O tutor conhece sua agenda e suas notas — e tudo fica no seu aparelho.",
      acoes: `<button type="button" data-acao="nova" class="${BOTAO_CONTORNO}">${icone("RotateCcw")}Nova conversa</button>`,
    })}
    <div class="grid gap-5 lg:grid-cols-[1fr_280px]">
      <section class="flex h-[calc(100vh-260px)] min-h-[440px] min-w-0 flex-col overflow-hidden panel">
        <div class="flex items-center justify-between gap-3 border-b border-hair px-4 py-3">
          <div class="flex min-w-0 items-center gap-2">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink">${icone("Sparkles", "h-4 w-4 text-neon")}</span>
            <div class="min-w-0"><p class="text-[13px] font-semibold leading-none">Tutor Mestriva</p><p class="mt-1 truncate text-[10px] text-muted-foreground">${e.materia ? `Contexto: ${esc(e.materia)}` : "Contexto geral"}</p></div>
          </div>
          <select data-campo="materia" aria-label="Matéria de contexto" class="h-9 max-w-[150px] rounded-lg border border-input bg-card px-2 text-[11px] outline-none focus:border-electric">
            <option value="">Sem matéria</option>
            ${materias.map((m) => `<option value="${esc(m.name)}"${m.name === e.materia ? " selected" : ""}>${esc(m.name)}</option>`).join("")}
          </select>
        </div>
        <div data-conversa class="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
          ${e.mensagens.map(bolha).join("")}
          ${e.pensando ? `<div class="flex items-center gap-2 text-xs text-muted-foreground" role="status">${icone("Loader2", "h-3.5 w-3.5 animate-spin")}Buscando no conteúdo…</div>` : ""}
        </div>
        <div class="border-t border-hair p-3">
          <form data-enviar="pergunta" class="flex items-end gap-2">
            <label for="tutor-input" class="sr-only">Sua mensagem</label>
            <textarea id="tutor-input" data-campo="entrada" rows="1" maxlength="300" placeholder="Pergunte algo sobre o conteúdo ou sobre como estudar…" class="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-card px-3.5 py-3 text-sm outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/10">${esc(e.entrada)}</textarea>
            ${botaoDitar(Boolean(e.ouvindo), temDitado())}
            <button type="submit" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition hover:bg-ink/90 disabled:opacity-40" aria-label="Enviar mensagem">${icone("Send", "h-4 w-4 text-neon")}</button>
          </form>
        </div>
      </section>
      <aside class="min-w-0 space-y-3">
        <h2 class="text-sm font-semibold">Comece por aqui</h2>
        <div class="space-y-2">${SUGESTOES.map((s) => `<button type="button" data-acao="sugestao" data-valor="${esc(s)}" class="w-full rounded-xl border border-hair bg-card px-3.5 py-3 text-left text-[12px] leading-snug text-foreground/75 transition hover:border-electric/40 hover:text-foreground disabled:opacity-50">${esc(s)}</button>`).join("")}</div>
        ${perfil?.accessibility_notes ? `<div class="rounded-xl bg-secondary/70 p-3.5"><p class="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">O tutor sabe que</p><p class="mt-1.5 text-[11px] leading-relaxed text-foreground/75">${esc(perfil.accessibility_notes)}</p></div>` : ""}
      </aside>
    </div>
  </div>`;
}

const estadoInicial = () => ({ mensagens: [BOAS_VINDAS], materia: "", entrada: "", pensando: false, ouvindo: false });

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha(estadoInicial(), ctx.loja.lista("materias"), ctx.loja.perfil())}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const materias = ctx.loja.lista("materias");
  const carregadas = {};
  let pararFala = () => {};
  let pararDitado = () => {};

  const rola = () => { const c = area.querySelector("[data-conversa]"); if (c) c.scrollTop = c.scrollHeight; };

  async function pergunta(texto, t) {
    const q = String(texto || "").trim().slice(0, 300);
    if (!q || t.estado.pensando) return;
    const e = t.estado;
    e.mensagens.push({ papel: "estudante", texto: q });
    e.entrada = "";
    e.pensando = true;
    t.pinta();
    rola();
    const d = ctx.loja.dados();
    const indice = await carregaIndice();
    const contexto = () => ({ perfil: d.perfil, materias: d.materias, eventos: d.eventos, notas: d.notas, indice, carregadas });
    const comMateria = e.materia ? `${q} ${e.materia}` : q;
    let r = responde(q, contexto());
    if (r?.precisaCarregar) {
      carregadas[r.precisaCarregar] = await carregaMateria(r.precisaCarregar);
      r = responde(q, contexto());
    }
    if (!r && e.materia) r = responde(comMateria, contexto());
    if (r?.precisaCarregar) {
      carregadas[r.precisaCarregar] = await carregaMateria(r.precisaCarregar);
      r = responde(comMateria, contexto());
    }
    let resposta = r && r.texto ? { papel: "tutor", texto: r.texto, acoes: r.acoes } : null;
    if (!resposta) resposta = { papel: "tutor", texto: NAO_ENTENDI, acoes: [] };
    e.mensagens.push(resposta);
    e.pensando = false;
    t.pinta();
    rola();
    ctx.anuncia("O tutor respondeu.");
  }

  const tela = criaTela(area, {
    estado: estadoInicial(),
    desenha: (e) => desenha(e, materias, ctx.loja.perfil()),
    aoEnviar: { pergunta: (_f, e, t) => pergunta(e.entrada, t) },
    acoes: {
      sugestao(el, _e, t) { pergunta(el.dataset.valor, t); },
      nova(_el, e, t) { pararFala(); Object.assign(e, estadoInicial(), { materia: e.materia }); t.pinta(); },
      ditar(_el, e, t) {
        if (e.ouvindo) { pararDitado(); e.ouvindo = false; t.pinta(); return; }
        e.ouvindo = true;
        t.pinta();
        pararDitado = dita((texto) => { e.entrada = `${e.entrada} ${texto}`.trim(); }, () => { e.ouvindo = false; t.pinta(); });
      },
    },
  });

  // Enter envia, Shift+Enter quebra linha.
  const tecla = (/** @type {KeyboardEvent} */ ev) => {
    const alvo = /** @type {HTMLElement} */ (ev.target);
    if (alvo.id === "tutor-input" && ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      pergunta(tela.estado.entrada, tela);
    }
  };
  // Ouvir uma resposta (botão dentro de cada bolha do tutor).
  const ouvir = (/** @type {MouseEvent} */ ev) => {
    const caixa = /** @type {HTMLElement|null} */ (/** @type {HTMLElement} */ (ev.target).closest("[data-ouvir]"));
    if (!caixa) return;
    ev.preventDefault();
    ev.stopPropagation();
    const i = Number(caixa.dataset.ouvir);
    const b = caixa.querySelector("button");
    if (b?.getAttribute("aria-pressed") === "true") { pararFala(); caixa.innerHTML = botaoOuvir(false, "Ouvir resposta"); return; }
    pararFala();
    caixa.innerHTML = botaoOuvir(true, "Ouvir resposta");
    pararFala = fala(tela.estado.mensagens[i]?.texto || "", () => { caixa.innerHTML = botaoOuvir(false, "Ouvir resposta"); });
  };
  area.addEventListener("keydown", tecla);
  area.addEventListener("click", ouvir, true);
  return () => { pararFala(); pararDitado(); area.removeEventListener("keydown", tecla); area.removeEventListener("click", ouvir, true); tela.destroi(); };
}
