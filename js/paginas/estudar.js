// Estudar: o estudante monta o próprio material
// (anotações em markdown); o banco de resumos e o gerador de cartões chegam no plano 4.
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { parseData, contagem } from "../datas.js";
import { cabecalho } from "../ui/cabecalho.js";
import { vazio } from "../ui/vazio.js";
import { campo, CLASSE_CAMPO, CLASSE_TEXTO } from "../ui/formulario.js";
import { criaTela } from "../ui/pagina.js";
import { desenhaPomodoro, montaPomodoro, pomodoroInicial } from "../ui/pomodoro.js";
import { abreLeitor, ROTULO_TIPO } from "../ui/leitor.js";
import { botaoDitar, temDitado, dita } from "../ui/fala.js";

const TIPOS = [
  { value: "resumo", label: "Resumo estruturado" },
  { value: "guia", label: "Guia com perguntas" },
  { value: "mapa", label: "Mapa mental" },
];
const BOTAO_CONTORNO =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground/75 transition hover:border-electric/50 hover:text-foreground";

export const formMaterial = () => ({ subject: "", kind: "resumo", topic: "", content: "", erro: "", ouvindo: false });

export function validaMaterial(f) {
  if (!f.subject.trim() || !f.topic.trim()) return "Escolha a matéria e diga qual conteúdo você quer estudar.";
  if (!f.content.trim()) return "Escreva ou cole suas anotações para salvar o material.";
  return "";
}

/** Próxima prova futura. */
export function proximaProva(eventos, agora = new Date()) {
  return eventos
    .filter((e) => e.type === "prova" && (parseData(e.date)?.getTime() ?? -1) >= agora.getTime())
    .sort((a, b) => parseData(a.date).getTime() - parseData(b.date).getTime())[0] || null;
}

function formulario(f, materias) {
  const ativa = materias.find((m) => m.name === f.subject);
  return `<section class="relative overflow-hidden panel p-5">
    <div class="pointer-events-none absolute inset-0 bg-grid-light opacity-60" aria-hidden="true"></div>
    <div class="relative">
      <div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">${icone("Wand2", "h-4 w-4 text-neon")}</span><h2 class="text-sm font-semibold">Montar material de estudo</h2></div>
      <p class="mt-1.5 text-xs text-muted-foreground">Escolha a matéria, o conteúdo e o formato, e escreva ou cole suas anotações. O material fica salvo aqui para reler, ouvir e revisar.</p>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        ${campo({ rotulo: "Matéria", para: "study-subject", conteudo: `<select id="study-subject" data-campo="subject" class="${CLASSE_CAMPO}"><option value="">Selecione a matéria</option>${materias.map((m) => `<option value="${esc(m.name)}"${m.name === f.subject ? " selected" : ""}>${esc(m.name)}</option>`).join("")}</select>` })}
        ${campo({ rotulo: "Formato", para: "study-kind", conteudo: `<select id="study-kind" data-campo="kind" class="${CLASSE_CAMPO}">${TIPOS.map((t) => `<option value="${t.value}"${t.value === f.kind ? " selected" : ""}>${t.label}</option>`).join("")}</select>` })}
      </div>
      <div class="mt-3">${campo({
        rotulo: "Conteúdo",
        para: "study-topic",
        dica: ativa?.topics ? `Na sua grade: ${ativa.topics}` : "Ex: regra da cadeia, cinemática, sociologia clássica…",
        conteudo: `<div class="flex items-start gap-2"><input id="study-topic" data-campo="topic" value="${esc(f.topic)}" placeholder="Ex: derivadas parciais e plano tangente" class="${CLASSE_CAMPO}" />${botaoDitar(f.ouvindo, temDitado())}</div>`,
      })}</div>
      <div class="mt-3">${campo({ rotulo: "Suas anotações", para: "study-content", dica: "Use # para títulos e - para listas, se quiser.", conteudo: `<textarea id="study-content" data-campo="content" rows="6" placeholder="Cole o texto da aula, o resumo do livro ou o que você lembra do conteúdo." class="${CLASSE_TEXTO}">${esc(f.content)}</textarea>` })}</div>
      ${f.erro ? `<p role="alert" class="mt-3 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(f.erro)}</p>` : ""}
      <button type="button" data-acao="salvar" class="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60">${icone("Sparkles", "h-4 w-4 text-neon")}Salvar material</button>
    </div>
  </section>`;
}

function listaMateriais(materiais) {
  const corpo = materiais.length
    ? `<ul class="space-y-2">${materiais
        .map(
          (m) => `<li><button type="button" data-acao="abrir" data-id="${esc(m.id)}" class="flex w-full items-center gap-3 rounded-xl border border-hair bg-card px-4 py-3 text-left transition hover:border-electric/40 hover:shadow-sm">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">${icone("BookOpen", "h-4 w-4 text-electric")}</span>
          <span class="min-w-0 flex-1"><span class="block truncate text-[13px] font-medium">${esc(m.title)}</span><span class="mt-0.5 block truncate text-[11px] text-muted-foreground">${esc(m.subject || "Estudo")} · ${esc(ROTULO_TIPO[m.kind] || m.kind || "resumo")}</span></span>
          ${icone("ArrowRight", "h-4 w-4 shrink-0 text-muted-foreground/60")}
        </button></li>`
        )
        .join("")}</ul>`
    : vazio({ icone: "BookMarked", titulo: "Nenhum material ainda", descricao: "Monte o primeiro resumo acima — ele fica salvo aqui para reler, ouvir e revisar." });
  return `<section><div class="mb-3 flex items-center justify-between"><h2 class="text-sm font-semibold">Seus materiais</h2><span class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">${materiais.length} salvos</span></div>${corpo}</section>`;
}

function cartaoProva(p, agora) {
  if (!p) return "";
  const quiz = `/quiz?subject=${encodeURIComponent(p.subject || "")}&topic=${encodeURIComponent(p.title)}`;
  return `<section class="relative overflow-hidden rounded-2xl bg-ink p-5 text-white">
    <div class="pointer-events-none absolute inset-0 bg-grid opacity-10" aria-hidden="true"></div>
    <div class="relative">
      <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/70"><span class="h-1.5 w-1.5 rounded-full bg-neon pulse-dot"></span>próxima prova</span>
      <h2 class="mt-3 font-heading text-lg font-semibold leading-snug">${esc(p.title)}</h2>
      <p class="mt-1 text-xs text-white/60">${esc(p.subject || "Sem matéria")} · ${contagem(p.date, agora)}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <a href="${esc(quiz)}" class="inline-flex items-center gap-1.5 rounded-xl bg-neon px-3.5 py-2 text-xs font-semibold text-ink transition hover:brightness-105">${icone("Sparkles", "h-3.5 w-3.5")}Fazer quiz</a>
        <button type="button" data-acao="usar-prova" class="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-3.5 py-2 text-xs font-medium text-white/85 transition hover:bg-white/10">Montar material</button>
      </div>
    </div>
  </section>`;
}

const METODOS = `<section class="panel p-5">
  <h2 class="text-sm font-semibold">Métodos que funcionam</h2>
  <ul class="mt-3 space-y-2.5 text-xs text-muted-foreground">
    <li><span class="font-medium text-foreground">Recall ativo</span> — feche o material e escreva o que lembra. O esforço de lembrar é o que fixa.</li>
    <li><span class="font-medium text-foreground">Repetição espaçada</span> — revise em 1, 3, 7 e 15 dias em vez de tudo na véspera.</li>
    <li><span class="font-medium text-foreground">Feynman</span> — explique em voz alta como se ensinasse alguém. Onde travar, é onde falta base.</li>
  </ul>
  <a href="/tutor" class="mt-3 inline-flex items-center gap-1 text-xs font-medium text-electric">Montar um plano com o tutor ${icone("ArrowRight", "h-3.5 w-3.5")}</a>
</section>`;

export function desenha(f, materias, materiais, prova, pomodoro, agora = new Date()) {
  return `<div class="space-y-6">
    ${cabecalho({
      sobre: "estudar",
      titulo: "Seu material, do seu jeito",
      descricao: "Monte resumos e guias com as suas anotações, ouça em voz alta e estude com o Pomodoro — tudo salvo com você.",
      acoes: `<button type="button" data-acao="foco" class="${BOTAO_CONTORNO}">${icone("Sparkles")}Modo foco</button>`,
    })}
    <div class="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <div class="space-y-5"><div data-form>${formulario(f, materias)}</div>${listaMateriais(materiais)}</div>
      <div class="space-y-5">${cartaoProva(prova, agora)}<div data-pomodoro>${desenhaPomodoro(pomodoro, materias, "")}</div>${METODOS}</div>
    </div>
  </div>`;
}

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha(formMaterial(), ctx.loja.lista("materias"), ctx.loja.lista("materiais"), proximaProva(ctx.loja.lista("eventos")), pomodoroInicial())}</div>`;
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const pagina = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  const materias = ctx.loja.lista("materias");
  let pararDitado = () => {};
  const form = criaTela(/** @type {HTMLElement} */ (pagina.querySelector("[data-form]")), {
    estado: formMaterial(),
    desenha: (f) => formulario(f, materias),
    aoDigitar(campoNome, _v, _f) {
      if (campoNome === "subject") form.pinta();
    },
    acoes: {
      salvar(_el, f, t) {
        f.erro = validaMaterial(f);
        if (f.erro) { t.pinta(); return; }
        ctx.loja.salva("materiais", { title: f.topic.trim(), subject: f.subject, topic: f.topic.trim(), kind: f.kind, content: f.content });
        Object.assign(f, { ...formMaterial(), subject: f.subject, kind: f.kind });
        t.pinta();
        redesenhaLista();
        ctx.anuncia("Material salvo");
      },
      ditar(_el, f, t) {
        if (f.ouvindo) { pararDitado(); f.ouvindo = false; t.pinta(); return; }
        f.ouvindo = true;
        t.pinta();
        pararDitado = dita((texto) => { f.topic = `${f.topic} ${texto}`.trim(); }, () => { f.ouvindo = false; t.pinta(); });
      },
    },
  });
  const pararPomodoro = montaPomodoro(/** @type {HTMLElement} */ (pagina.querySelector("[data-pomodoro]")), ctx);

  function redesenhaLista() {
    const sec = pagina.querySelector("[data-form]")?.nextElementSibling;
    if (sec) sec.outerHTML = listaMateriais(ctx.loja.lista("materiais"));
  }
  const clique = (/** @type {MouseEvent} */ e) => {
    const el = /** @type {HTMLElement|null} */ (/** @type {HTMLElement} */ (e.target).closest("[data-acao]"));
    if (!el) return;
    const acao = el.dataset.acao;
    if (acao === "abrir") {
      const m = ctx.loja.pega("materiais", el.dataset.id);
      if (m) abreLeitor({ material: m, loja: ctx.loja, anuncia: ctx.anuncia, aoExcluir: redesenhaLista });
    } else if (acao === "usar-prova") {
      const p = proximaProva(ctx.loja.lista("eventos"));
      if (!p) return;
      form.estado.subject = p.subject || form.estado.subject;
      form.estado.topic = p.title;
      form.pinta();
      /** @type {HTMLElement|null} */ (pagina.querySelector("#study-content"))?.focus();
    } else return;
    e.preventDefault();
  };
  pagina.addEventListener("click", clique);
  return () => { pagina.removeEventListener("click", clique); pararDitado(); pararPomodoro(); form.destroi(); };
}
