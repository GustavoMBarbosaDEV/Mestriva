// Quiz. As questões vêm do banco do Mestriva e dos cartões do estudante (sem IA).
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { cabecalho } from "../ui/cabecalho.js";
import { campo, CLASSE_CAMPO } from "../ui/formulario.js";
import { criaTela } from "../ui/pagina.js";
import { abreLeitor } from "../ui/leitor.js";
import { carregaIndice, carregaMateria } from "../banco.js";
import { achaNoBanco, montaQuiz, embaralhaAlternativas, registraResposta, revisaoDosErros, topicosCitados } from "../conteudo.js";
import { questoesDoEstudante } from "../gerador.js";
import { markdownParaHtml } from "../markdown.js";

import { CONTATO } from "../ui/marca.js";
const BOTAO_CONTORNO = "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground/75 transition hover:border-electric/50 hover:text-foreground";

/**
 * Se o texto citar um tópico da matéria, fica só com as questões dele. O nome da matéria (e apelidos, e o nome
 * na grade) não conta: "P1 de Cálculo I" não pode virar "só Integrais e Teorema Fundamental do Cálculo".
 */
export function filtraPorTopico(questoes, materia, texto, outrosNomes = []) {
  if (!materia) return questoes;
  const ignorar = [materia.nome, ...(materia.apelidos || []), ...outrosNomes];
  const ids = new Set(topicosCitados(texto, { materias: [materia] }, ignorar).map((t) => t.topico));
  return ids.size ? questoes.filter((q) => ids.has(q.topico)) : questoes;
}

/** "banco:<id>" vira a matéria da grade ligada a esse id, se houver (link do tutor). */
export function resolveMateria(valor, opcoes) {
  if (!String(valor).startsWith("banco:")) return valor;
  const id = String(valor).slice(6);
  return opcoes.find((o) => o.banco === id && !o.valor.startsWith("banco:"))?.valor || valor;
}

export function mensagemResultado(acertos, total) {
  if (acertos === total) return "Gabaritou. Agora revise em 3 dias para manter na memória.";
  if (total - acertos > 3) return "Muitos pontos em aberto: vale montar a revisão dos erros antes da prova.";
  return "Bom resultado. A revisão dos erros fecha as lacunas rapidinho.";
}

export function linkReportar(q) {
  const assunto = `Erro na questão ${q.id} do Mestriva`;
  const corpo = `Questão ${q.id}:\n${q.pergunta}\n\nO que está errado:\n`;
  return `mailto:${CONTATO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

/** Matérias da grade (ligadas ao banco quando o nome bate) e as do banco que não estão na grade. */
export function opcoesMateria(materiasGrade, indice) {
  const lista = materiasGrade.map((m) => ({ valor: m.name, rotulo: m.name, banco: m.banco || achaNoBanco(m.name, indice) }));
  const usados = new Set(lista.map((o) => o.banco).filter(Boolean));
  for (const b of indice?.materias || []) if (!usados.has(b.id)) lista.push({ valor: `banco:${b.id}`, rotulo: b.nome, banco: b.id });
  return lista;
}

const QTDS = [
  { v: 5, t: "5 questões · revisão rápida" },
  { v: 8, t: "8 questões · equilíbrio" },
  { v: 12, t: "12 questões · simulado" },
];

export function desenhaConfig(e, opcoes) {
  const daGrade = opcoes.filter((o) => !o.valor.startsWith("banco:"));
  const doBanco = opcoes.filter((o) => o.valor.startsWith("banco:"));
  const opt = (o) => `<option value="${esc(o.valor)}"${o.valor === e.materia ? " selected" : ""}>${esc(o.rotulo)}${o.banco && !o.valor.startsWith("banco:") ? " · banco do Mestriva" : ""}</option>`;
  return `<section class="mx-auto max-w-2xl panel p-6">
    <div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">${icone("Sparkles", "h-4 w-4 text-neon")}</span><h2 class="text-sm font-semibold">Configurar quiz</h2></div>
    <div class="mt-5 space-y-4">
      ${campo({
        rotulo: "Matéria",
        para: "quiz-subject",
        dica: "As matérias com questões prontas aparecem com “banco do Mestriva”. Nas outras, o quiz usa os cartões das suas anotações.",
        conteudo: `<select id="quiz-subject" data-campo="materia" class="${CLASSE_CAMPO}"><option value="">Selecione a matéria</option>${daGrade.length ? `<optgroup label="Sua grade">${daGrade.map(opt).join("")}</optgroup>` : ""}${doBanco.length ? `<optgroup label="Banco do Mestriva">${doBanco.map(opt).join("")}</optgroup>` : ""}</select>`,
      })}
      ${campo({ rotulo: "Conteúdo da prova", para: "quiz-topic", dica: "Opcional. Se citar um tópico (ex: derivadas), o quiz fica só nele.", conteudo: `<input id="quiz-topic" data-campo="topico" value="${esc(e.topico)}" placeholder="Ex: derivadas parciais, plano tangente e gradiente" class="${CLASSE_CAMPO}" />` })}
      ${campo({ rotulo: "Quantidade de questões", para: "quiz-count", conteudo: `<select id="quiz-count" data-campo="qtd" class="${CLASSE_CAMPO}">${QTDS.map((q) => `<option value="${q.v}"${Number(e.qtd) === q.v ? " selected" : ""}>${q.t}</option>`).join("")}</select>` })}
      ${e.erro ? `<p role="alert" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(e.erro)}</p>` : ""}
      <button type="button" data-acao="montar" class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90">${icone("Sparkles", "h-4 w-4 text-neon")}Montar quiz</button>
    </div>
  </section>`;
}

export function desenhaQuestao(e) {
  const q = e.questoes[e.i];
  const total = e.questoes.length;
  const resposta = e.respostas[e.i];
  const opcoes = q.opcoes
    .map((o, i) => {
      const sel = resposta === i;
      const certa = q.correta === i;
      const mostra = e.revelada && (sel || certa);
      return `<button type="button" data-acao="responde" data-valor="${i}"${e.revelada ? " disabled" : ""} aria-pressed="${sel}" class="${cn(
        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[13px] leading-relaxed transition",
        mostra ? (certa ? "border-[#12B76A] bg-[#EFFBF3] text-foreground dark:bg-[#12B76A]/15" : "border-destructive/50 bg-destructive/5 text-foreground") : sel ? "border-ink bg-secondary/70 dark:border-foreground" : "border-border bg-card hover:border-electric/50"
      )}"><span class="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground">${String.fromCharCode(65 + i)}</span><span class="flex-1 [overflow-wrap:anywhere]">${esc(o)}</span>${mostra && certa ? icone("CheckCircle2", "mt-0.5 h-4 w-4 shrink-0 text-[#12B76A]") : ""}${mostra && !certa ? icone("XCircle", "mt-0.5 h-4 w-4 shrink-0 text-destructive") : ""}</button>`;
    })
    .join("");
  return `<section class="mx-auto max-w-2xl">
    <div class="mb-3 flex items-center justify-between gap-3"><span class="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">questão ${e.i + 1} de ${total}</span><span class="truncate rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-foreground/60">${esc(e.titulo || "quiz")}</span></div>
    <div class="h-1.5 w-full overflow-hidden rounded-full bg-secondary"><div class="h-full rounded-full bg-ink transition-all duration-500 dark:bg-foreground" style="width: ${((e.i + 1) / total) * 100}%"></div></div>
    <div class="mt-4 panel p-6">
      <div role="heading" aria-level="2" class="study-prose quiz-enunciado text-[15px] font-medium leading-relaxed [overflow-wrap:anywhere]">${markdownParaHtml(q.pergunta)}</div>
      <div class="mt-5 space-y-2.5" role="group" aria-label="Alternativas">${opcoes}</div>
      ${e.revelada ? `<div class="mt-4 rounded-xl bg-secondary/70 p-4" role="status"><p class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Por que essa é a resposta</p><div class="study-prose quiz-enunciado mt-1.5 text-[13px] leading-relaxed">${markdownParaHtml(q.explicacao)}</div>${q.origem === "banco" ? `<a href="${esc(linkReportar(q))}" data-externo class="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground underline-offset-2 hover:underline">${icone("AlertTriangle", "h-3 w-3")}Reportar erro nesta questão</a>` : ""}</div>` : ""}
      <div class="mt-5 flex items-center justify-between gap-3">
        <button type="button" data-acao="revelar"${resposta == null || e.revelada ? " disabled" : ""} class="rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-foreground/75 transition hover:bg-secondary disabled:opacity-40">Ver explicação</button>
        <button type="button" data-acao="confirmar"${resposta == null ? " disabled" : ""} class="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-40">${e.i === total - 1 ? "Ver resultado" : "Próxima questão"}${icone("ArrowRight", "h-4 w-4 text-neon")}</button>
      </div>
    </div>
  </section>`;
}

export function desenhaResultado(e) {
  const total = e.questoes.length;
  const acertos = e.questoes.filter((q, i) => e.respostas[i] === q.correta).length;
  const erradas = total - acertos;
  const lista = e.questoes
    .map((q, i) => {
      const ok = e.respostas[i] === q.correta;
      return `<div class="rounded-xl border border-hair bg-card p-4"><div class="flex items-start gap-2.5">${ok ? icone("CheckCircle2", "mt-0.5 h-4 w-4 shrink-0 text-[#12B76A]") : icone("XCircle", "mt-0.5 h-4 w-4 shrink-0 text-destructive")}<div class="min-w-0"><div class="study-prose quiz-enunciado text-[13px] font-medium leading-snug [overflow-wrap:anywhere]">${markdownParaHtml(q.pergunta)}</div><p class="mt-1 text-[11px] text-muted-foreground">Correta: ${esc(q.opcoes[q.correta])}</p><div class="study-prose quiz-enunciado mt-1.5 text-[11px] leading-relaxed text-foreground/70">${markdownParaHtml(q.explicacao)}</div></div></div></div>`;
    })
    .join("");
  return `<section class="mx-auto max-w-2xl space-y-4">
    <div class="rounded-2xl bg-ink p-6 text-white">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">resultado</p>
      <div class="mt-3 flex items-end gap-3"><span class="font-heading text-5xl font-semibold leading-none text-neon">${Math.round((acertos / total) * 100)}%</span><span class="pb-1 text-sm text-white/60">${acertos} de ${total} corretas</span></div>
      <p class="mt-3 max-w-md text-sm text-white/70">${mensagemResultado(acertos, total)}</p>
      ${erradas ? `<button type="button" data-acao="revisar" class="mt-4 inline-flex items-center gap-2 rounded-xl bg-neon px-4 py-2.5 text-xs font-semibold text-ink transition hover:brightness-105 disabled:opacity-60">${icone("Sparkles", "h-3.5 w-3.5")}Revisar meus erros</button>` : ""}
    </div>
    <div class="space-y-2">${lista}</div>
    <div class="flex flex-wrap items-center justify-between gap-3 panel p-4">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">${icone("Circle", "h-3 w-3")}As questões erradas voltam nos próximos quizzes</div>
      <div class="flex gap-2"><a href="/estudar" class="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground/75 transition hover:bg-secondary">${icone("ArrowLeft", "h-3.5 w-3.5")}Estudar</a><button type="button" data-acao="novo" class="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white">${icone("RefreshCw", "h-3.5 w-3.5 text-neon")}Novo quiz</button></div>
    </div>
  </section>`;
}

function desenha(e, opcoes) {
  const corpo = e.fase === "rodando" ? desenhaQuestao(e) : e.fase === "resultado" ? desenhaResultado(e) : e.fase === "carregando"
    ? `<section class="mx-auto flex max-w-2xl flex-col items-center justify-center panel px-6 py-16 text-center">${icone("Loader2", "h-7 w-7 animate-spin text-electric")}<p role="status" class="mt-4 text-sm font-medium">Montando as questões…</p></section>`
    : desenhaConfig(e, opcoes);
  return `<div class="space-y-6">
    ${cabecalho({
      sobre: "quiz",
      titulo: "Teste antes da prova",
      descricao: "Questões de múltipla escolha sobre o conteúdo da sua próxima avaliação, com explicação de cada resposta.",
      acoes: e.fase !== "config" ? `<button type="button" data-acao="novo" class="${BOTAO_CONTORNO}">${icone("RefreshCw")}Novo quiz</button>` : "",
    })}
    ${corpo}
  </div>`;
}

const estadoInicial = () => {
  const p = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
  return { fase: "config", materia: p.get("subject") || "", topico: p.get("topic") || "", qtd: 8, erro: "", questoes: [], i: 0, respostas: [], revelada: false, titulo: "", materiaBanco: null };
};

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha(estadoInicial(), opcoesMateria(ctx.loja.lista("materias"), { materias: [] }))}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  let opcoes = opcoesMateria(ctx.loja.lista("materias"), { materias: [] });
  let indiceAtual = { materias: [] };
  const tela = criaTela(area, {
    estado: estadoInicial(),
    desenha: (e) => desenha(e, opcoes),
    acoes: {
      async montar(_el, e, t) {
        e.materia = resolveMateria(e.materia, opcoes);
        const op = opcoes.find((o) => o.valor === e.materia);
        if (!e.materia || !op) { e.erro = "Escolha a matéria do quiz."; t.pinta(); return; }
        e.fase = "carregando";
        t.pinta();
        const materia = op.banco ? await carregaMateria(op.banco) : null;
        const nome = materia?.nome || op.rotulo;
        const nomeIndice = indiceAtual.materias.find((x) => x.id === op.banco);
        const doBanco = filtraPorTopico((materia?.questoes || []).map((q) => ({ ...q, origem: "banco" })), materia && { ...materia, apelidos: nomeIndice?.apelidos || [] }, e.topico, [op.rotulo]);
        const cartoes = ctx.loja.lista("cartoes").filter((c) => c.subject === op.rotulo || c.subject === nome);
        const doEstudante = questoesDoEstudante(cartoes);
        const escolhidas = montaQuiz({ questoes: [...doBanco, ...doEstudante], qtd: Number(e.qtd) || 8, erros: ctx.loja.erros() });
        if (!escolhidas.length) {
          Object.assign(e, { fase: "config", erro: "Ainda não há questões desta matéria. Em Estudar, salve suas anotações e gere cartões — com 4 ou mais, o quiz já funciona." });
          t.pinta();
          return;
        }
        Object.assign(e, { fase: "rodando", erro: "", questoes: escolhidas.map((q) => embaralhaAlternativas(q)), i: 0, respostas: escolhidas.map(() => null), revelada: false, titulo: nome, materiaBanco: materia });
        t.pinta();
        ctx.anuncia(`Quiz com ${escolhidas.length} questões. Questão 1.`);
      },
      responde(el, e, t) {
        if (e.revelada) return;
        e.respostas[e.i] = Number(el.dataset.valor);
        t.pinta();
      },
      revelar(_el, e, t) {
        if (e.respostas[e.i] == null) return;
        e.revelada = true;
        t.pinta();
        const q = e.questoes[e.i];
        ctx.anuncia(e.respostas[e.i] === q.correta ? "Resposta certa." : `Resposta errada. A certa é ${q.opcoes[q.correta]}.`);
      },
      confirmar(_el, e, t) {
        if (e.respostas[e.i] == null) return;
        if (e.i < e.questoes.length - 1) {
          e.i += 1;
          e.revelada = false;
          t.pinta();
          ctx.anuncia(`Questão ${e.i + 1} de ${e.questoes.length}`);
          return;
        }
        let erros = ctx.loja.erros();
        e.questoes.forEach((q, i) => (erros = registraResposta(erros, q.id, e.respostas[i] === q.correta)));
        ctx.loja.salvaErros(erros);
        const acertos = e.questoes.filter((q, i) => e.respostas[i] === q.correta).length;
        ctx.loja.salva("tentativas", {
          quiz_title: e.titulo,
          subject: e.titulo,
          score: acertos,
          total: e.questoes.length,
          wrong_topics: e.questoes.filter((q, i) => e.respostas[i] !== q.correta).map((q) => q.pergunta.slice(0, 160)),
        });
        e.fase = "resultado";
        t.pinta();
        ctx.anuncia(`Resultado: ${acertos} de ${e.questoes.length} corretas.`);
      },
      revisar(_el, e) {
        // Salva a revisão uma vez só por quiz; os cliques seguintes reabrem a mesma.
        let salvo = e.revisaoId ? ctx.loja.pega("materiais", e.revisaoId) : null;
        if (!salvo) {
          const erradas = e.questoes.filter((q, i) => e.respostas[i] !== q.correta);
          const conteudo = revisaoDosErros({ materia: e.materiaBanco, erradas, texto: "" });
          salvo = ctx.loja.salva("materiais", { title: `Revisão: ${e.titulo}`, subject: e.titulo, topic: e.topico, kind: "revisao", content: conteudo });
          e.revisaoId = salvo.id;
        }
        abreLeitor({ material: salvo, loja: ctx.loja, anuncia: ctx.anuncia });
      },
      novo(_el, e, t) {
        Object.assign(e, { ...estadoInicial(), materia: e.materia, topico: "" });
        t.pinta();
      },
    },
  });
  carregaIndice().then((indice) => {
    opcoes = opcoesMateria(ctx.loja.lista("materias"), indice);
    indiceAtual = indice;
    tela.estado.materia = resolveMateria(tela.estado.materia, opcoes);
    if (tela.estado.fase === "config") tela.pinta();
  });
  return () => tela.destroi();
}
