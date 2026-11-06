// Diálogos da grade: matéria (SubjectDialog), carregar grade (ImportCurriculumDialog) e arquivo (ImportFromFileDialog).
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { PERIODOS, lerGradeTexto } from "../curriculo.js";
import { campo, CLASSE_CAMPO, CLASSE_TEXTO } from "./formulario.js";
import { abreDialogo } from "./dialogo.js";
import { criaTela } from "./pagina.js";

const ERRO = (t) => (t ? `<p role="alert" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(t)}</p>` : "");
const BOTAO = "inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-50";
const opcoesPeriodo = (sel) =>
  `<option value="">Sem período</option>${PERIODOS.map((p) => `<option value="${p}"${p === sel ? " selected" : ""}>${p} período</option>`).join("")}`;

export function formDaMateria(m, periodoPadrao = "") {
  if (m) return { name: m.name || "", period: m.period || "", professor: m.professor || "", topics: m.topics || "", status: m.status || "cursando", erro: "" };
  return { name: "", period: periodoPadrao || "", professor: "", topics: "", status: "cursando", erro: "" };
}
export const validaMateria = (f) => (f.name.trim() ? "" : "Informe o nome da matéria.");
export const materiaDoForm = (f) => ({ name: f.name.trim(), period: f.period, professor: f.professor.trim(), topics: f.topics.trim(), status: f.status });

export function corpoMateria(f, editando) {
  return `<div class="space-y-4">
    ${campo({ rotulo: "Nome da matéria", para: "subject-name", conteudo: `<input id="subject-name" data-campo="name" value="${esc(f.name)}" placeholder="Ex: Cálculo II" class="${CLASSE_CAMPO}" />` })}
    <div class="grid gap-4 sm:grid-cols-2">
      ${campo({ rotulo: "Período", para: "subject-period", conteudo: `<select id="subject-period" data-campo="period" class="${CLASSE_CAMPO}">${opcoesPeriodo(f.period)}</select>` })}
      ${campo({ rotulo: "Situação", para: "subject-status", conteudo: `<select id="subject-status" data-campo="status" class="${CLASSE_CAMPO}"><option value="cursando"${f.status === "cursando" ? " selected" : ""}>Cursando</option><option value="concluida"${f.status === "concluida" ? " selected" : ""}>Concluída</option></select>` })}
    </div>
    ${campo({ rotulo: "Professor", para: "subject-professor", conteudo: `<input id="subject-professor" data-campo="professor" value="${esc(f.professor)}" placeholder="Opcional" class="${CLASSE_CAMPO}" />` })}
    ${campo({ rotulo: "Conteúdos principais", para: "subject-topics", dica: "Separe por vírgulas. Usamos isso para sugerir temas de estudo.", conteudo: `<textarea id="subject-topics" data-campo="topics" rows="3" placeholder="Derivadas parciais, gradiente, regra da cadeia" class="${CLASSE_TEXTO}">${esc(f.topics)}</textarea>` })}
    ${ERRO(f.erro)}
    <div class="flex items-center justify-between gap-3 pt-1">
      ${editando ? `<button type="button" data-acao="excluir" class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive">${icone("Trash2", "h-3.5 w-3.5")}Excluir</button>` : "<span></span>"}
      <button type="button" data-acao="salvar" class="${BOTAO}">Salvar matéria</button>
    </div>
  </div>`;
}

/** @param {{loja:any, materia:any|null, periodo?:string, aoSalvar:()=>void, anuncia:(t:string)=>void}} p */
export function abreDialogoMateria({ loja, materia, periodo = "", aoSalvar, anuncia }) {
  const editando = Boolean(materia?.id);
  const dlg = abreDialogo({
    titulo: editando ? "Editar matéria" : "Nova matéria",
    descricao: "A grade curricular define a ordem das matérias e liga cada uma ao material e ao quiz certos.",
    corpo: "",
    classe: "max-h-[92vh] max-w-lg overflow-y-auto rounded-2xl",
    classeTitulo: "text-xl",
  });
  const area = /** @type {HTMLElement} */ (dlg.elemento.querySelector("[data-corpo]"));
  criaTela(area, {
    estado: formDaMateria(materia, periodo),
    desenha: (f) => corpoMateria(f, editando),
    acoes: {
      salvar(_el, f, t) {
        f.erro = validaMateria(f);
        if (f.erro) { t.pinta(); return; }
        loja.salva("materias", editando ? { ...materia, ...materiaDoForm(f) } : { ...materiaDoForm(f), order: Date.now() });
        dlg.fecha();
        anuncia(editando ? "Matéria atualizada" : "Matéria adicionada");
        aoSalvar();
      },
      excluir() {
        loja.apaga("materias", materia.id);
        dlg.fecha();
        anuncia("Matéria excluída");
        aoSalvar();
      },
    },
  });
  /** @type {HTMLElement|null} */ (area.querySelector("#subject-name"))?.focus();
}

const EXEMPLO = "1º - Cálculo I\n1º - Introdução à Programação\n2º - Cálculo II\n2º - Estrutura de Dados\n3º - Física II";

/** @param {{loja:any, aoSalvar:()=>void, anuncia:(t:string)=>void, materiasDoTexto:(t:string, p:string)=>any[]}} p */
export function abreDialogoImportar({ loja, aoSalvar, anuncia, materiasDoTexto }) {
  const dlg = abreDialogo({
    titulo: "Carregar grade curricular",
    descricao: "Cole a lista de matérias do seu curso, uma por linha. Se quiser definir o período, use o formato 2º - Nome da matéria.",
    corpo: "",
    classe: "max-h-[92vh] max-w-lg overflow-y-auto rounded-2xl",
    classeTitulo: "text-xl",
  });
  const area = /** @type {HTMLElement} */ (dlg.elemento.querySelector("[data-corpo]"));
  const contagem = (n) => `${n} matéria${n === 1 ? "" : "s"} reconhecida${n === 1 ? "" : "s"}.`;
  const tela = criaTela(area, {
    estado: { texto: "", periodo: "", erro: "" },
    desenha: (f) => {
      const n = lerGradeTexto(f.texto).length;
      return `<div class="space-y-4">
        ${campo({ rotulo: "Matérias", para: "import-text", dica: contagem(n), conteudo: `<textarea id="import-text" data-campo="texto" rows="8" placeholder="${esc(EXEMPLO)}" class="w-full rounded-xl border border-input bg-card px-3.5 py-3 font-mono text-xs outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/10">${esc(f.texto)}</textarea>` })}
        ${campo({ rotulo: "Período padrão", para: "import-period", dica: "Usado nas linhas que não informam o período.", conteudo: `<select id="import-period" data-campo="periodo" class="${CLASSE_CAMPO}">${opcoesPeriodo(f.periodo)}</select>` })}
        ${ERRO(f.erro)}
        <div class="flex justify-end"><button type="button" data-acao="importar" class="${BOTAO}"${n ? "" : " disabled"}>Importar grade</button></div>
      </div>`;
    },
    aoDigitar(campoNome, _v, f) {
      if (campoNome !== "texto") return;
      const n = lerGradeTexto(f.texto).length;
      const dica = area.querySelector("#import-text + p");
      if (dica) dica.textContent = contagem(n);
      const b = /** @type {HTMLButtonElement|null} */ (area.querySelector('[data-acao="importar"]'));
      if (b) b.disabled = !n;
    },
    acoes: {
      importar(_el, f, t) {
        const itens = materiasDoTexto(f.texto, f.periodo);
        if (!itens.length) { f.erro = "Adicione pelo menos uma matéria."; t.pinta(); return; }
        const base = Date.now();
        itens.forEach((m, i) => loja.salva("materias", { ...m, order: base + i }));
        dlg.fecha();
        anuncia(`${itens.length} matérias importadas`);
        aoSalvar();
      },
    },
  });
  /** @type {HTMLElement|null} */ (area.querySelector("#import-text"))?.focus();
  return tela;
}

/** Importar por PDF ou foto: chega no plano 6 (leitura no próprio aparelho). */
export function abreDialogoArquivo() {
  abreDialogo({
    titulo: "Importar grade por arquivo",
    descricao: "Envie o PDF ou uma foto da grade e o app separa as matérias para você conferir.",
    corpo: `<div class="space-y-4">
      <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-8 text-center">
        <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-card">${icone("FileUp", "h-5 w-5 text-electric")}</span>
        <span class="mt-3 text-sm font-medium">Chega na próxima etapa</span>
        <span class="mt-1 text-[11px] text-muted-foreground">A leitura do arquivo vai acontecer no seu aparelho, sem enviar nada para fora. Por enquanto, use "Carregar grade" e cole a lista.</span>
      </div>
    </div>`,
    classe: "max-h-[88vh] max-w-lg overflow-y-auto rounded-2xl",
    classeTitulo: "text-xl",
  });
}
