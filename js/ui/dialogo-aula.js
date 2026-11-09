// Material da aula: o estudante envia o PDF do professor ou fotos do quadro, o app lê no aparelho,
// mostra o texto para conferir e monta resumo, palavras-chave, conceitos, mapa, perguntas, cartões e plano de revisão.
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { campo, CLASSE_CAMPO, CLASSE_TEXTO } from "./formulario.js";
import { abreDialogo } from "./dialogo.js";
import { criaTela } from "./pagina.js";
import { montaMaterialDaAula, LIMITE_TEXTO } from "../aula.js";

const ERRO = (t) => (t ? `<p role="alert" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(t)}</p>` : "");
const BOTAO = "inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-50";
const CONTORNO = "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/75 transition hover:bg-secondary";
const ACEITA = "application/pdf,.pdf,image/jpeg,image/png,image/webp";
export const MAX_ARQUIVOS = 10;
export const MAX_MB = 20;

export const estadoAula = (subject = "") => ({ fase: "escolher", erro: "", aviso: "", progresso: 0, rotulo: "", foto: false, texto: "", titulo: "", subject, origens: [] });

/** Diz de onde veio o texto ("2 fotos do quadro e o PDF Aula 3"), para a nota no começo do material. */
export function descreveOrigem(origens) {
  const fotos = origens.filter((o) => o.tipo === "foto").length;
  const pdfs = origens.filter((o) => o.tipo === "pdf").map((o) => o.nome.replace(/\.pdf$/i, ""));
  const partes = [];
  if (fotos) partes.push(fotos === 1 ? "1 foto do quadro" : `${fotos} fotos do quadro`);
  if (pdfs.length === 1) partes.push(`o PDF “${pdfs[0]}”`);
  else if (pdfs.length > 1) partes.push(`${pdfs.length} PDFs`);
  return partes.length > 1 ? `${partes.slice(0, -1).join(", ")} e ${partes.at(-1)}` : partes[0] || "texto colado";
}

/** Separa os arquivos escolhidos em PDFs e fotos, e diz o que não dá para ler. */
export function separaArquivos(lista) {
  const pdfs = [];
  const fotos = [];
  let erro = "";
  for (const f of [...lista].slice(0, MAX_ARQUIVOS)) {
    if (f.size > MAX_MB * 1024 * 1024) { erro = `“${f.name}” passa de ${MAX_MB} MB e ficou de fora.`; continue; }
    if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) pdfs.push(f);
    else if (/^image\//i.test(f.type)) fotos.push(f);
    else erro = `“${f.name}” não é PDF nem foto e ficou de fora.`;
  }
  if (lista.length > MAX_ARQUIVOS) erro = `Escolha até ${MAX_ARQUIVOS} arquivos por vez; os outros ficaram de fora.`;
  return { pdfs, fotos, erro };
}

function botaoArquivo(texto, iconeNome, extra = "") {
  return `<label class="${CONTORNO}">${icone(iconeNome, "h-4 w-4")}${texto}<input type="file" accept="${ACEITA}" multiple data-arquivo-aula class="sr-only" ${extra}/></label>`;
}

const DICAS = `<details class="rounded-xl border border-hair px-3.5 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
  <summary class="cursor-pointer font-medium text-foreground/80">Dicas para a foto do quadro sair legível</summary>
  <ul class="mt-2 list-disc space-y-1 pl-4">
    <li>Fotografe de frente, com o quadro ocupando a foto toda, sem reflexo de luz.</li>
    <li>Letra de forma é lida bem melhor que letra cursiva. Desenhos e fórmulas não viram texto.</li>
    <li>Uma foto por parte do quadro funciona melhor que uma foto de longe.</li>
    <li>Tudo é lido no seu aparelho; as fotos não são guardadas nem enviadas.</li>
  </ul>
</details>`;

/** Corpo do diálogo, para cada fase. @param {ReturnType<typeof estadoAula>} e @param {{name:string}[]} materias */
export function corpoAula(e, materias = []) {
  if (e.fase === "lendo") {
    return `<div class="space-y-3" aria-busy="true">
      <p role="status" class="flex items-center gap-2 text-sm text-muted-foreground">${icone("Loader2", "h-4 w-4 animate-spin")}<span data-rotulo>${esc(e.rotulo || "Lendo no seu aparelho…")}</span><span data-progresso>${e.progresso ? ` ${Math.round(e.progresso * 100)}%` : ""}</span></p>
      ${e.foto ? `<p class="text-[11px] text-muted-foreground">Na primeira foto o app baixa o leitor de texto (uns 10 MB), que fica guardado no aparelho. Cada foto leva alguns segundos.</p>` : ""}
    </div>`;
  }
  if (e.fase === "revisar") {
    const n = e.texto.length;
    return `<div class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-2">
        ${campo({ rotulo: "Matéria", para: "aula-subject", conteudo: `<input id="aula-subject" data-campo="subject" list="aula-subjects" value="${esc(e.subject)}" placeholder="Ex: Fisiologia" class="${CLASSE_CAMPO}" /><datalist id="aula-subjects">${materias.map((m) => `<option value="${esc(m.name)}"></option>`).join("")}</datalist>` })}
        ${campo({ rotulo: "Assunto da aula", para: "aula-titulo", conteudo: `<input id="aula-titulo" data-campo="titulo" value="${esc(e.titulo)}" placeholder="Ex: Membrana plasmática" class="${CLASSE_CAMPO}" />` })}
      </div>
      ${campo({
        rotulo: "Texto lido",
        para: "aula-texto",
        dica: `Corrija o que saiu errado antes de montar. Linhas curtas sem ponto final viram títulos.${n > LIMITE_TEXTO ? ` Só os primeiros ${LIMITE_TEXTO / 1000} mil caracteres entram no material.` : ""}`,
        conteudo: `<textarea id="aula-texto" data-campo="texto" rows="10" placeholder="Cole ou digite aqui o conteúdo da aula." class="${CLASSE_TEXTO} font-mono text-[12px]">${esc(e.texto)}</textarea>`,
      })}
      ${e.aviso ? `<p role="status" class="rounded-xl bg-secondary/70 px-3.5 py-2.5 text-xs">${esc(e.aviso)}</p>` : ""}${ERRO(e.erro)}
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap gap-2">${botaoArquivo("Juntar mais", "FileUp")}<button type="button" data-acao="recomecar" class="rounded-xl px-3 py-2.5 text-xs font-medium text-muted-foreground transition hover:text-destructive">Começar de novo</button></div>
        <button type="button" data-acao="montar" class="${BOTAO}">${icone("Wand2", "h-4 w-4 text-neon")}Montar material de estudo</button>
      </div>
      <p class="text-[11px] leading-relaxed text-muted-foreground">O app monta resumo, palavras-chave, conceitos, mapa do conteúdo, perguntas, plano de revisão e os cartões do quiz, tudo a partir deste texto. Ele não inventa nada que não esteja aqui.</p>
    </div>`;
  }
  return `<div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-center transition hover:border-electric/50">
        <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-card">${icone("FileUp", "h-5 w-5 text-electric")}</span>
        <span class="mt-3 text-sm font-medium">PDF ou fotos da aula</span>
        <span class="mt-1 text-[11px] text-muted-foreground">Slides, apostila, foto do caderno · até ${MAX_ARQUIVOS} arquivos</span>
        <input type="file" accept="${ACEITA}" multiple data-arquivo-aula class="sr-only" />
      </label>
      <label class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-center transition hover:border-electric/50">
        <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-card">${icone("Camera", "h-5 w-5 text-electric")}</span>
        <span class="mt-3 text-sm font-medium">Tirar foto do quadro</span>
        <span class="mt-1 text-[11px] text-muted-foreground">Abre a câmera no celular</span>
        <input type="file" accept="image/*" capture="environment" data-arquivo-aula class="sr-only" />
      </label>
    </div>
    ${ERRO(e.erro)}
    <button type="button" data-acao="colar" class="text-xs font-medium text-electric">Prefiro colar ou digitar o texto</button>
    ${DICAS}
  </div>`;
}

/**
 * @param {{loja:any, anuncia:(t:string)=>void, materias:{name:string}[], subject?:string,
 *   lePdf:(f: File, p: (n:number)=>void) => Promise<{texto:string, escaneado:boolean}>,
 *   leImagens:(fs: Blob[], p: (n:number)=>void) => Promise<string>, prepara?:(f: File) => Promise<Blob>,
 *   aoMontar:(material:any) => void}} p
 */
export function abreDialogoAula({ loja, anuncia, materias, subject = "", lePdf, leImagens, prepara = async (f) => f, aoMontar }) {
  const dlg = abreDialogo({
    titulo: "Material da aula",
    descricao: "Envie o PDF do professor ou fotos do quadro. O app lê no seu aparelho e monta o material para você estudar.",
    corpo: "",
    classe: "max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl",
    classeTitulo: "text-xl",
  });
  const area = /** @type {HTMLElement} */ (dlg.elemento.querySelector("[data-corpo]"));
  const tela = criaTela(area, {
    estado: estadoAula(subject),
    desenha: (e) => corpoAula(e, materias),
    acoes: {
      colar(_el, e, t) { Object.assign(e, { fase: "revisar", erro: "" }); t.pinta(); /** @type {HTMLElement|null} */ (area.querySelector("#aula-texto"))?.focus(); },
      recomecar(_el, e, t) { Object.assign(e, estadoAula(e.subject)); t.pinta(); },
      montar(_el, e, t) {
        const r = /** @type {any} */ (montaMaterialDaAula({ texto: e.texto, titulo: e.titulo.trim(), origem: descreveOrigem(e.origens) }));
        if (r.erro) { e.erro = r.erro; t.pinta(); anuncia(r.erro); return; }
        const titulo = e.titulo.trim() || `Aula de ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
        const salvo = loja.salva("materiais", { title: titulo, subject: e.subject.trim(), topic: titulo, kind: "aula", content: r.content, fonte: r.fonte });
        dlg.fecha();
        aoMontar({ ...salvo, cortado: r.cortado });
      },
    },
  });

  const mostra = (rotulo, p) => {
    const e = tela.estado;
    e.rotulo = rotulo;
    e.progresso = p;
    const r = area.querySelector("[data-rotulo]");
    const s = area.querySelector("[data-progresso]");
    if (r) r.textContent = rotulo;
    if (s) s.textContent = p ? ` ${Math.round(p * 100)}%` : "";
  };

  area.addEventListener("change", async (ev) => {
    const input = /** @type {HTMLInputElement} */ (ev.target);
    if (!input.matches("[data-arquivo-aula]") || !input.files?.length) return;
    const { pdfs, fotos, erro } = separaArquivos(input.files);
    const e = tela.estado;
    if (!pdfs.length && !fotos.length) { e.erro = erro || "Escolha um PDF ou uma foto."; tela.pinta(); return; }
    const antes = e.fase === "revisar" ? e.texto : "";
    Object.assign(e, { fase: "lendo", erro: "", aviso: "", foto: fotos.length > 0, progresso: 0, rotulo: "" });
    tela.pinta();
    const partes = [];
    const avisos = erro ? [erro] : [];
    try {
      for (const [i, f] of pdfs.entries()) {
        const r = await lePdf(f, (p) => mostra(`Lendo o PDF ${pdfs.length > 1 ? `${i + 1} de ${pdfs.length}` : ""}…`.replace(" …", "…"), p));
        if (r.escaneado) avisos.push(`“${f.name}” é escaneado: as páginas foram lidas como fotos, confira o texto.`);
        if (r.texto.trim()) { partes.push(r.texto); e.origens.push({ tipo: "pdf", nome: f.name }); }
        else avisos.push(`Não achei texto em “${f.name}”.`);
      }
      if (fotos.length) {
        mostra("Preparando as fotos…", 0);
        const prontas = [];
        for (const f of fotos) prontas.push(await prepara(f));
        const texto = await leImagens(prontas, (p) => mostra(fotos.length > 1 ? `Lendo foto ${Math.min(fotos.length, Math.floor(p * fotos.length) + 1)} de ${fotos.length}…` : "Lendo a foto…", p));
        if (texto.trim()) { partes.push(texto); fotos.forEach((f) => e.origens.push({ tipo: "foto", nome: f.name })); }
        else avisos.push("As fotos não tinham texto legível.");
      }
    } catch {
      avisos.push("Não consegui ler um dos arquivos. Tente outro ou cole o texto.");
    }
    const juntos = [antes, ...partes].filter((t) => t.trim()).join("\n\n");
    if (!juntos.trim()) Object.assign(e, { fase: antes ? "revisar" : "escolher", erro: avisos.join(" ") || "Não encontrei texto. Tente uma foto mais nítida, de frente e com boa luz." });
    else Object.assign(e, { fase: "revisar", texto: juntos, erro: "", aviso: avisos.join(" ") });
    if (!e.titulo) e.titulo = sugereTitulo(juntos);
    tela.pinta();
    anuncia(e.fase === "revisar" ? "Texto lido. Confira e corrija antes de montar o material." : e.erro);
  });
  return tela;
}

/** Primeira linha que parece um título (curta, com letras), para sugerir o assunto. */
export function sugereTitulo(texto) {
  for (const bruta of String(texto).split(/\r?\n/)) {
    const l = bruta.replace(/^[#\-*\d.)\s]+/, "").trim();
    if (l.length >= 4 && l.length <= 70 && /\p{L}{3,}/u.test(l) && !/[.;:,]$/.test(l)) return l;
  }
  return "";
}
