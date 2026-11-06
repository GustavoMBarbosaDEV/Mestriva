// Diálogo de compromisso.
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { TIPOS_EVENTO } from "../eventos.js";
import { hojeISO } from "../datas.js";
import { campo, CLASSE_CAMPO, CLASSE_TEXTO } from "./formulario.js";
import { abreDialogo } from "./dialogo.js";
import { criaTela } from "./pagina.js";

/** @param {any|null} evento @param {string} dataPadrao AAAA-MM-DD */
export function formDoEvento(evento, dataPadrao) {
  if (evento) {
    const [d, h] = String(evento.date || "").split("T");
    return { title: evento.title || "", type: evento.type || "prova", date: d || "", time: (h || "09:00").slice(0, 5), subject: evento.subject || "", notes: evento.notes || "", erro: "" };
  }
  return { title: "", type: "prova", date: dataPadrao || hojeISO(), time: "09:00", subject: "", notes: "", erro: "" };
}

export function validaEvento(f) {
  if (!f.title.trim()) return "Dê um nome para o compromisso.";
  if (!f.date) return "Escolha a data.";
  return "";
}

export function eventoDoForm(f) {
  return { title: f.title.trim(), type: f.type, date: `${f.date}T${f.time || "09:00"}`, subject: f.subject, notes: f.notes.trim() };
}

/** @param {ReturnType<typeof formDoEvento>} f @param {{id:string,name:string}[]} materias @param {boolean} editando */
export function corpoEvento(f, materias, editando) {
  const tipos = TIPOS_EVENTO.map(
    (t) => `<button type="button" data-acao="tipo" data-valor="${t.value}" aria-pressed="${f.type === t.value}" class="${cn(
      "rounded-full border px-3 py-1.5 text-[13px] font-medium transition",
      f.type === t.value ? "border-ink bg-ink text-white" : "border-border bg-card text-foreground/70 hover:border-electric/50"
    )}">${t.label}</button>`
  ).join("");
  const opcoes = materias.map((m) => `<option value="${esc(m.name)}"${m.name === f.subject ? " selected" : ""}>${esc(m.name)}</option>`).join("");
  return `<div class="space-y-4">
    ${campo({ rotulo: "Título", para: "event-title", conteudo: `<input id="event-title" data-campo="title" value="${esc(f.title)}" placeholder="Ex: Prova de Cálculo II" class="${CLASSE_CAMPO}" />` })}
    <div><p class="mb-1.5 text-xs font-medium text-foreground/80">Tipo</p><div class="flex flex-wrap gap-2">${tipos}</div></div>
    <div class="grid gap-4 sm:grid-cols-2">
      ${campo({ rotulo: "Data", para: "event-date", conteudo: `<input id="event-date" data-campo="date" type="date" value="${esc(f.date)}" class="${CLASSE_CAMPO}" />` })}
      ${campo({ rotulo: "Hora", para: "event-time", conteudo: `<input id="event-time" data-campo="time" type="time" value="${esc(f.time)}" class="${CLASSE_CAMPO}" />` })}
    </div>
    ${campo({
      rotulo: "Matéria",
      para: "event-subject",
      dica: "Opcional — liga o compromisso ao material e ao quiz da matéria.",
      conteudo: `<select id="event-subject" data-campo="subject" class="${CLASSE_CAMPO}"><option value="">Sem matéria específica</option>${opcoes}</select>`,
    })}
    ${campo({ rotulo: "Observações", para: "event-notes", conteudo: `<textarea id="event-notes" data-campo="notes" rows="3" placeholder="Conteúdo, sala, professor…" class="${CLASSE_TEXTO}">${esc(f.notes)}</textarea>` })}
    ${f.erro ? `<p role="alert" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(f.erro)}</p>` : ""}
    <div class="flex items-center justify-between gap-3 pt-1">
      ${editando ? `<button type="button" data-acao="excluir" class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive">${icone("Trash2", "h-3.5 w-3.5")}Excluir</button>` : "<span></span>"}
      <button type="button" data-acao="salvar" class="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60">Salvar</button>
    </div>
  </div>`;
}

/**
 * Abre o diálogo de criar/editar compromisso.
 * @param {{loja:any, evento:any|null, dataPadrao:string, aoSalvar:() => void, anuncia:(t:string)=>void}} p
 */
export function abreDialogoEvento({ loja, evento, dataPadrao, aoSalvar, anuncia }) {
  const materias = loja.lista("materias");
  const editando = Boolean(evento?.id);
  const dlg = abreDialogo({
    titulo: editando ? "Editar compromisso" : "Novo compromisso",
    descricao: "Provas, trabalhos, apresentações e palestras aparecem no seu calendário com contagem regressiva.",
    corpo: "",
    classe: "max-h-[92vh] max-w-lg overflow-y-auto rounded-2xl",
    classeTitulo: "text-xl",
  });
  const area = /** @type {HTMLElement} */ (dlg.elemento.querySelector("[data-corpo]"));
  const tela = criaTela(area, {
    estado: formDoEvento(evento, dataPadrao),
    desenha: (f) => corpoEvento(f, materias, editando),
    acoes: {
      tipo(el, f, t) { f.type = el.dataset.valor; t.pinta(); },
      salvar(_el, f, t) {
        f.erro = validaEvento(f);
        if (f.erro) { t.pinta(); return; }
        const dados = eventoDoForm(f);
        loja.salva("eventos", editando ? { ...evento, ...dados } : { ...dados, done: false });
        dlg.fecha();
        anuncia(editando ? "Compromisso atualizado" : "Compromisso criado");
        aoSalvar();
      },
      excluir() {
        loja.apaga("eventos", evento.id);
        dlg.fecha();
        anuncia("Compromisso excluído");
        aoSalvar();
      },
    },
  });
  /** @type {HTMLElement|null} */ (area.querySelector("#event-title"))?.focus();
  return { fecha: () => { tela.destroi(); dlg.fecha(); } };
}
