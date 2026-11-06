// Grade curricular.
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { corDaMateria, agrupaPorPeriodo, lerGradeTexto } from "../curriculo.js";
import { achaNoBanco } from "../conteudo.js";
import { carregaIndice } from "../banco.js";
import { textoDoPdf, textoDaFoto, materiasDoTextoExtraido } from "../importar.js";
import { cabecalho, BOTAO_PRIMARIO } from "../ui/cabecalho.js";
import { vazio } from "../ui/vazio.js";
import { criaTela } from "../ui/pagina.js";
import { abreDialogoMateria, abreDialogoImportar, abreDialogoArquivo } from "../ui/dialogo-materia.js";

const BOTAO_CONTORNO =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground/75 transition hover:border-electric/50 hover:text-foreground";

/** Matérias a importar a partir do texto colado. */
export function materiasDoTexto(texto, periodoPadrao) {
  return lerGradeTexto(texto).map((m, i) => ({ name: m.name, period: m.period || periodoPadrao, status: "cursando", order: i + 1 }));
}

function cartao(m, indice) {
  const feita = m.status === "concluida";
  return `<article class="group relative overflow-hidden panel p-4 transition hover:border-electric/40 hover:shadow-sm">
    <span class="absolute inset-y-0 left-0 w-1" style="background: ${m.color || corDaMateria(m.name)}" aria-hidden="true"></span>
    <div class="flex items-start justify-between gap-2 pl-2">
      <div class="min-w-0">
        <h3 class="${cn("truncate text-sm font-semibold", feita && "text-foreground/50")}">${esc(m.name)}</h3>
        <p class="mt-0.5 truncate text-[11px] text-muted-foreground">${esc(m.professor || "Professor não informado")}</p>
      </div>
      <button type="button" data-acao="editar" data-id="${esc(m.id)}" class="rounded-lg p-1.5 text-muted-foreground opacity-0 transition hover:bg-secondary hover:text-foreground focus:opacity-100 group-hover:opacity-100" aria-label="Editar ${esc(m.name)}">${icone("Pencil", "h-3.5 w-3.5")}</button>
    </div>
    ${(m.banco || achaNoBanco(m.name, indice)) ? `<p class="mt-1.5 pl-2"><span class="inline-flex items-center gap-1 rounded-full bg-electric/10 px-2 py-0.5 text-[10px] font-medium text-electric">${icone("BookMarked", "h-3 w-3")}Conteúdo pronto</span></p>` : ""}
    ${m.topics ? `<p class="mt-2 line-clamp-2 pl-2 text-[11px] leading-relaxed text-muted-foreground">${esc(m.topics)}</p>` : ""}
    <button type="button" data-acao="situacao" data-id="${esc(m.id)}" aria-pressed="${feita}" class="${cn(
      "mt-3 ml-2 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide transition",
      feita ? "bg-[#EFFBF3] text-[#027A48]" : "bg-secondary text-foreground/60 hover:bg-secondary/70"
    )}">${feita ? "concluída" : "cursando"}</button>
  </article>`;
}

/** @param {any[]} materias */
export function desenha(materias, indice = { materias: [] }) {
  const acoes = `<button type="button" data-acao="arquivo" class="${BOTAO_CONTORNO}">${icone("FileUp")}Enviar PDF ou foto</button>
    <button type="button" data-acao="importar" class="${BOTAO_CONTORNO}">${icone("Upload")}Carregar grade</button>
    <button type="button" data-acao="nova" class="${BOTAO_PRIMARIO}">${icone("Plus", "h-4 w-4 text-neon")}Nova matéria</button>`;
  const corpo = materias.length
    ? `<div class="space-y-8">${agrupaPorPeriodo(materias)
        .map(
          (g) => `<section>
        <div class="mb-3 flex items-center gap-3">
          <h2 class="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">${esc(g.period.includes("Sem") ? g.period : `${g.period} período`)}</h2>
          <span class="h-px flex-1 bg-hair"></span>
          <span class="font-mono text-[10px] text-muted-foreground">${g.items.length}</span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">${g.items.map((m) => cartao(m, indice)).join("")}</div>
      </section>`
        )
        .join("")}</div>`
    : vazio({
        icone: "GraduationCap",
        titulo: "Sua grade ainda está vazia",
        descricao: "Cole a lista de matérias do curso ou adicione uma por uma. Leva menos de dois minutos.",
        acao: `<div class="flex flex-wrap justify-center gap-2">
          <button type="button" data-acao="importar" class="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">${icone("Upload", "h-4 w-4 text-neon")}Carregar grade curricular</button>
          <button type="button" data-acao="nova" class="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/75">${icone("Plus")}Adicionar matéria</button>
        </div>`,
      });
  return `<div class="space-y-6">
    ${cabecalho({
      sobre: "grade curricular",
      titulo: "O que você estuda",
      descricao: "Cadastre as matérias do seu curso na ordem em que são dadas. O app usa isso para organizar o calendário, os materiais e os quizzes.",
      acoes,
    })}
    ${corpo}
  </div>`;
}

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha(ctx.loja.lista("materias"))}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const tela = criaTela(area, {
    estado: { indice: { materias: [] } },
    desenha: (e) => desenha(ctx.loja.lista("materias"), e.indice),
    acoes: {
      nova(_el, _e, t) { abreDialogoMateria({ loja: ctx.loja, materia: null, aoSalvar: () => t.pinta(), anuncia: ctx.anuncia }); },
      editar(el, _e, t) {
        const m = ctx.loja.pega("materias", el.dataset.id);
        if (m) abreDialogoMateria({ loja: ctx.loja, materia: m, periodo: m.period, aoSalvar: () => t.pinta(), anuncia: ctx.anuncia });
      },
      situacao(el, _e, t) {
        const m = ctx.loja.pega("materias", el.dataset.id);
        if (!m) return;
        m.status = m.status === "concluida" ? "cursando" : "concluida";
        ctx.loja.salva("materias", m);
        t.pinta();
        ctx.anuncia(`${m.name}: ${m.status === "concluida" ? "concluída" : "cursando"}`);
      },
      importar(_el, _e, t) { abreDialogoImportar({ loja: ctx.loja, aoSalvar: () => t.pinta(), anuncia: ctx.anuncia, materiasDoTexto }); },
      arquivo(_el, _e, t) { abreDialogoArquivo({ loja: ctx.loja, aoSalvar: () => t.pinta(), anuncia: ctx.anuncia, lePdf: textoDoPdf, leFoto: textoDaFoto, extrai: materiasDoTextoExtraido }); },
    },
  });
  carregaIndice().then((indice) => { tela.estado.indice = indice; tela.pinta(); });
  return () => tela.destroi();
}
