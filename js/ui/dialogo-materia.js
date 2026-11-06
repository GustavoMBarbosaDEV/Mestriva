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

/** Corpo do diálogo "Importar grade por arquivo" (lendo no aparelho). */
export function corpoArquivo(e) {
  const zona = `<label class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-8 text-center transition hover:border-electric/50">
      <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-card">${icone("FileUp", "h-5 w-5 text-electric")}</span>
      <span class="mt-3 text-sm font-medium">Escolher o PDF ou a foto da grade</span>
      <span class="mt-1 text-[11px] text-muted-foreground">PDF, JPG, PNG ou WEBP · até 10 MB · lido no seu aparelho, nada é enviado</span>
      <input type="file" accept="application/pdf,.pdf,image/jpeg,image/png,image/webp" data-arquivo-grade class="sr-only" />
    </label>`;
  const lendo = `<p role="status" class="flex items-center gap-2 text-xs text-muted-foreground">${icone("Loader2", "h-3.5 w-3.5 animate-spin")}Lendo o arquivo no seu aparelho…<span data-progresso>${e.progresso ? ` ${Math.round(e.progresso * 100)}%` : ""}</span></p>${e.foto ? `<p class="text-[11px] text-muted-foreground">Na primeira foto o app baixa o leitor de texto (uns 10 MB); depois ele fica guardado no aparelho.</p>` : ""}`;
  const n = e.itens.length;
  const lista = `<div>
      <div class="mb-2 flex items-center justify-between"><p class="text-xs font-semibold">${n} matéria${n === 1 ? "" : "s"} encontrada${n === 1 ? "" : "s"}</p><span class="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">confira antes de salvar</span></div>
      <ul class="max-h-56 space-y-1.5 overflow-y-auto pr-1">${e.itens
        .map((m, i) => `<li class="flex items-center gap-2 rounded-lg border border-hair px-3 py-2"><span class="min-w-0 flex-1"><span class="block truncate text-[13px] font-medium">${esc(m.name)}</span><span class="block truncate text-[11px] text-muted-foreground">${esc([m.period ? `${m.period} período` : "Sem período", m.professor].filter(Boolean).join(" · "))}</span></span><button type="button" data-acao="remover" data-valor="${i}" class="rounded-lg p-1.5 text-muted-foreground transition hover:text-destructive" aria-label="Remover ${esc(m.name)}">${icone("Trash2", "h-3.5 w-3.5")}</button></li>`)
        .join("")}</ul>
    </div>
    <div class="flex justify-end gap-2">
      <button type="button" data-acao="outro" class="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/70 transition hover:bg-secondary">Escolher outro</button>
      <button type="button" data-acao="salvar-arquivo"${n ? "" : " disabled"} class="${BOTAO}">${icone("Upload", "h-4 w-4 text-neon")}Salvar ${n} matéria${n === 1 ? "" : "s"}</button>
    </div>`;
  return `<div class="space-y-4">${e.fase === "conferir" ? lista : e.fase === "lendo" ? lendo : zona}${ERRO(e.erro)}<p class="text-[11px] leading-relaxed text-muted-foreground">Foto com sombra, tremida ou torta pode sair com erros — confira a lista antes de salvar. Se não der certo, use "Carregar grade" e cole a lista.</p></div>`;
}

/** Importar a grade por PDF (texto lido no aparelho com pdf.js). @param {{loja:any, aoSalvar:()=>void, anuncia:(t:string)=>void, lePdf:(f: File) => Promise<string>, leFoto:(f: File, p: (n: number) => void) => Promise<string>, extrai:(t: string) => any[]}} p */
export function abreDialogoArquivo({ loja, aoSalvar, anuncia, lePdf, leFoto, extrai }) {
  const dlg = abreDialogo({
    titulo: "Importar grade por arquivo",
    descricao: "Envie o PDF ou uma foto da grade e o app separa as matérias para você conferir.",
    corpo: "",
    classe: "max-h-[88vh] max-w-lg overflow-y-auto rounded-2xl",
    classeTitulo: "text-xl",
  });
  const area = /** @type {HTMLElement} */ (dlg.elemento.querySelector("[data-corpo]"));
  const tela = criaTela(area, {
    estado: { fase: "escolher", erro: "", itens: [] },
    desenha: corpoArquivo,
    acoes: {
      remover(el, e, t) { e.itens.splice(Number(el.dataset.valor), 1); t.pinta(); },
      outro(_el, e, t) { Object.assign(e, { fase: "escolher", erro: "", itens: [] }); t.pinta(); },
      "salvar-arquivo"(_el, e) {
        const base = Date.now();
        e.itens.forEach((m, i) => loja.salva("materias", { name: m.name, period: m.period, professor: m.professor, status: "cursando", order: base + i }));
        dlg.fecha();
        anuncia(`${e.itens.length} matérias importadas`);
        aoSalvar();
      },
    },
  });
  area.addEventListener("change", async (ev) => {
    const input = /** @type {HTMLInputElement} */ (ev.target);
    if (!input.matches("[data-arquivo-grade]") || !input.files?.[0]) return;
    const f = input.files[0];
    const e = tela.estado;
    if (f.size > 10 * 1024 * 1024) { e.erro = "O arquivo passa de 10 MB. Tente um PDF menor."; tela.pinta(); return; }
    const pdf = /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name);
    const foto = /^image\/(jpeg|png|webp)$/i.test(f.type);
    if (!pdf && !foto) { e.erro = "Envie um PDF ou uma foto (JPG, PNG ou WEBP)."; tela.pinta(); return; }
    Object.assign(e, { fase: "lendo", erro: "", foto, progresso: 0 });
    tela.pinta();
    try {
      const texto = pdf
        ? await lePdf(f)
        : await leFoto(f, (p) => {
            e.progresso = p;
            const s = area.querySelector("[data-progresso]");
            if (s) s.textContent = ` ${Math.round(p * 100)}%`;
          });
      const itens = extrai(texto);
      if (!itens.length) Object.assign(e, { fase: "escolher", erro: "Não encontrei matérias nesse arquivo. Tente uma foto mais nítida, de frente e com boa luz, ou use “Carregar grade” e cole a lista." });
      else Object.assign(e, { fase: "conferir", itens });
    } catch {
      Object.assign(e, { fase: "escolher", erro: "Não consegui ler esse arquivo. Tente outro ou cole a lista em “Carregar grade”." });
    }
    tela.pinta();
    anuncia(e.fase === "conferir" ? `${e.itens.length} matérias encontradas. Confira antes de salvar.` : e.erro);
  });
}
