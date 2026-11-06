// Notas. "Gerar conteúdo complementar" monta a revisão no aparelho.
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { formataData, hojeISO } from "../datas.js";
import { cabecalho } from "../ui/cabecalho.js";
import { vazio } from "../ui/vazio.js";
import { campo, CLASSE_CAMPO, CLASSE_TEXTO } from "../ui/formulario.js";
import { criaTela } from "../ui/pagina.js";

export const formInicial = (agora = new Date()) => ({ subject: "", activity: "", value: "", max_value: "10", wrong_topics: "", date: hojeISO(agora), erro: "" });

export function validaNota(f) {
  return !String(f.subject).trim() || !String(f.activity).trim() || f.value === "" || f.value === null ? "Informe a matéria, a atividade e a nota." : "";
}

export function notaDoForm(f) {
  return {
    subject: String(f.subject).trim(),
    activity: String(f.activity).trim(),
    value: Number(f.value),
    max_value: Number(f.max_value) || 10,
    wrong_topics: String(f.wrong_topics).trim(),
    date: f.date,
  };
}

export const numeroBr = (n) => String(n).replace(".", ",");

export function tomDaNota(n) {
  const pct = Number(n.max_value) ? Math.round((Number(n.value) / Number(n.max_value)) * 100) : 0;
  return pct >= 70 ? "bg-[#EFFBF3] text-[#027A48]" : pct >= 50 ? "bg-[#FFF7E6] text-[#B54708]" : "bg-[#FFEDED] text-[#B42318]";
}

/** Média geral (uma casa, vírgula). */
export function mediaGeral(notas) {
  const validas = notas.filter((n) => Number(n.max_value) > 0 && typeof n.value === "number");
  if (!validas.length) return null;
  const pct = validas.reduce((s, n) => s + n.value / n.max_value, 0) / validas.length;
  return numeroBr((pct * 10).toFixed(1));
}

function item(n) {
  return `<li class="rounded-xl border border-hair bg-card p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-[13px] font-semibold">${esc(n.activity)}</p>
        <p class="mt-0.5 text-[11px] text-muted-foreground">${esc(n.subject)} · ${n.date ? formataData(n.date, "d MMM yyyy") : "sem data"}</p>
      </div>
      <span class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${tomDaNota(n)}">${esc(numeroBr(n.value ?? "—"))}/${esc(numeroBr(n.max_value || 10))}</span>
    </div>
    ${n.wrong_topics ? `<p class="mt-2 rounded-lg bg-secondary/60 px-3 py-2 text-[11px] leading-relaxed text-foreground/70"><span class="font-medium text-foreground">Erros: </span>${esc(n.wrong_topics)}</p>` : ""}
    <div class="mt-3 flex items-center justify-between gap-2">
      <button type="button" data-acao="revisao" data-id="${esc(n.id)}" class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-electric transition hover:underline disabled:opacity-60">${icone("Sparkles", "h-3.5 w-3.5")}Gerar conteúdo complementar</button>
      <button type="button" data-acao="excluir" data-id="${esc(n.id)}" class="rounded-lg p-1.5 text-muted-foreground transition hover:text-destructive" aria-label="Excluir ${esc(n.activity)}">${icone("Trash2", "h-3.5 w-3.5")}</button>
    </div>
  </li>`;
}

export function desenha(f, notas, materias) {
  const media = mediaGeral(notas);
  const lista = notas.length
    ? `<ul class="space-y-2.5">${notas.map(item).join("")}</ul>`
    : vazio({ icone: "ClipboardCheck", titulo: "Nenhuma nota lançada", descricao: "Depois de receber uma correção, registre a nota e o que errou para transformar o erro em estudo." });
  return `<div class="space-y-6">
    ${cabecalho({
      sobre: "notas e revisão",
      titulo: "O que a nota não conta",
      descricao: "Lance suas notas, registre o que errou e receba um conteúdo complementar focado exatamente nessas lacunas.",
      acoes: media ? `<div class="rounded-xl border border-hair bg-card px-4 py-2.5"><p class="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">média geral</p><p class="mt-0.5 font-heading text-lg font-semibold leading-none">${media}</p></div>` : "",
    })}
    <div class="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      <form data-enviar="nota" class="space-y-4 panel p-5" novalidate>
        <div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">${icone("Plus", "h-4 w-4 text-neon")}</span><h2 class="text-sm font-semibold">Lançar resultado</h2></div>
        ${campo({ rotulo: "Matéria", para: "grade-subject", conteudo: `<input id="grade-subject" data-campo="subject" list="grade-subjects" value="${esc(f.subject)}" placeholder="Ex: Cálculo II" class="${CLASSE_CAMPO}" /><datalist id="grade-subjects">${materias.map((m) => `<option value="${esc(m.name)}"></option>`).join("")}</datalist>` })}
        ${campo({ rotulo: "Atividade", para: "grade-activity", conteudo: `<input id="grade-activity" data-campo="activity" value="${esc(f.activity)}" placeholder="Ex: P2 / Trabalho em grupo" class="${CLASSE_CAMPO}" />` })}
        <div class="grid grid-cols-2 gap-3">
          ${campo({ rotulo: "Nota", para: "grade-value", conteudo: `<input id="grade-value" data-campo="value" type="number" step="0.1" min="0" inputmode="decimal" value="${esc(f.value)}" class="${CLASSE_CAMPO}" />` })}
          ${campo({ rotulo: "Nota máxima", para: "grade-max", conteudo: `<input id="grade-max" data-campo="max_value" type="number" step="0.5" min="1" inputmode="decimal" value="${esc(f.max_value)}" class="${CLASSE_CAMPO}" />` })}
        </div>
        ${campo({ rotulo: "O que você errou", para: "grade-wrong", dica: "Seja específico: é isso que o app usa para montar a revisão.", conteudo: `<textarea id="grade-wrong" data-campo="wrong_topics" rows="4" placeholder="Ex: confundi derivada parcial com direcional e errei a regra da cadeia" class="${CLASSE_TEXTO}">${esc(f.wrong_topics)}</textarea>` })}
        ${campo({ rotulo: "Data", para: "grade-date", conteudo: `<input id="grade-date" data-campo="date" type="date" value="${esc(f.date)}" class="${CLASSE_CAMPO}" />` })}
        ${f.erro ? `<p role="alert" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(f.erro)}</p>` : ""}
        <button type="submit" class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60">Salvar resultado</button>
      </form>
      <div class="space-y-3">
        <div class="flex items-center justify-between"><h2 class="text-sm font-semibold">Seus lançamentos</h2><span class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">${notas.length} registros</span></div>
        ${lista}
      </div>
    </div>
  </div>`;
}

const ordenadas = (loja) => loja.lista("notas").sort((a, b) => String(b.date).localeCompare(String(a.date)));

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha(formInicial(), ordenadas(ctx.loja), ctx.loja.lista("materias"))}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const tela = criaTela(area, {
    estado: formInicial(),
    desenha: (f) => desenha(f, ordenadas(ctx.loja), ctx.loja.lista("materias")),
    aoEnviar: {
      nota(_form, f, t) {
        f.erro = validaNota(f);
        if (!f.erro) {
          ctx.loja.salva("notas", notaDoForm(f));
          Object.assign(f, { ...formInicial(), subject: f.subject });
          ctx.anuncia("Resultado salvo");
        }
        t.pinta();
      },
    },
    acoes: {
      excluir(el, _f, t) {
        ctx.loja.apaga("notas", el.dataset.id);
        t.pinta();
        ctx.anuncia("Nota excluída");
      },
      revisao() {
        ctx.toast("A revisão do que você errou chega na próxima etapa.");
      },
    },
  });
  return () => tela.destroi();
}
