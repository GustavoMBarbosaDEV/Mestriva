// Leitor de material (markdown seguro, ouvir, excluir)
// + "Gerar cartões" a partir das anotações do estudante. O material do banco abre só para leitura.
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { markdownParaHtml } from "../markdown.js";
import { cartoesDoTexto, lacunasDoTexto } from "../gerador.js";
import { textoCompleto } from "../aula.js";
import { abreDialogo } from "./dialogo.js";
import { botaoOuvir, fala } from "./fala.js";

export const ROTULO_TIPO = { resumo: "Resumo", guia: "Guia de revisão", mapa: "Mapa mental", revisao: "Revisão complementar", aula: "Material da aula" };

/** @param {any} m @param {boolean} [falando] @param {{somenteLeitura?: boolean, aviso?: string}} [opcoes] */
export function corpoMaterial(m, falando = false, { somenteLeitura = false, aviso = "" } = {}) {
  return `<div class="flex flex-wrap items-center justify-between gap-2 border-b border-hair pb-3">
      <div class="flex flex-wrap items-center gap-2">${botaoOuvir(falando)}${
        somenteLeitura ? "" : `<button type="button" data-acao="gerar-cartoes" class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/75 transition hover:border-electric/50 hover:text-foreground">${icone("Wand2", "h-3.5 w-3.5")}Gerar cartões</button>`
      }</div>
      ${somenteLeitura ? "" : `<button type="button" data-acao="excluir-material" class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive disabled:opacity-50">${icone("Trash2", "h-3.5 w-3.5")}Excluir</button>`}
    </div>
    ${aviso ? `<p role="status" class="mt-3 rounded-xl bg-secondary/70 px-3.5 py-2.5 text-xs">${esc(aviso)}</p>` : ""}
    <article class="study-prose mt-4">${markdownParaHtml(textoCompleto(m))}</article>`;
}

/** Salva os cartões das anotações (sem repetir os que já existem na matéria) e diz quantos criou. */
export function salvaCartoesDoMaterial(loja, material) {
  const existentes = new Set(loja.lista("cartoes").filter((c) => c.subject === (material.subject || "")).map((c) => c.frente));
  // No material da aula, os cartões saem do texto lido (o resumo montado repetiria as mesmas definições).
  const base = material.fonte || material.content || "";
  const novos = [...cartoesDoTexto(base), ...lacunasDoTexto(base)].filter((c) => !existentes.has(c.frente));
  for (const c of novos) loja.salva("cartoes", { ...c, subject: material.subject || "" });
  return novos.length;
}

/** @param {{material:any, loja:any, aoExcluir?:() => void, anuncia:(t:string)=>void, somenteLeitura?: boolean, aviso?: string}} p */
export function abreLeitor({ material, loja, aoExcluir, anuncia, somenteLeitura = false, aviso = "" }) {
  let parar = () => {};
  let falando = false;
  const corpo = () => corpoMaterial(material, falando, { somenteLeitura, aviso });
  const dlg = abreDialogo({
    titulo: material.title || "Material",
    descricao: `${ROTULO_TIPO[material.kind] || "Material"} · ${material.subject || "Estudo"}`,
    corpo: corpo(),
    classe: "max-h-[88vh] max-w-2xl overflow-y-auto rounded-2xl",
    classeTitulo: "pr-6 text-xl leading-snug",
    aoFechar: () => parar(),
  });
  const area = /** @type {HTMLElement} */ (dlg.elemento.querySelector("[data-corpo]"));
  area.addEventListener("click", (e) => {
    const el = /** @type {HTMLElement} */ (e.target).closest("[data-acao]");
    if (!el) return;
    e.stopPropagation();
    const acao = el.getAttribute("data-acao");
    if (acao === "ouvir") {
      if (falando) { parar(); falando = false; }
      else {
        falando = true;
        parar = fala(textoCompleto(material), () => { falando = false; dlg.atualiza(corpo()); });
      }
      dlg.atualiza(corpo());
    } else if (acao === "gerar-cartoes") {
      const n = salvaCartoesDoMaterial(loja, material);
      aviso = n
        ? `${n} cartões criados. Eles entram no quiz de ${material.subject || "estudo"} (a partir de 4 cartões).`
        : "Não achei definições novas. Escreva frases como “Fotossíntese é…”, “Termo: explicação” ou use **negrito** nos termos.";
      dlg.atualiza(corpo());
      anuncia(aviso);
    } else if (acao === "excluir-material") {
      loja.apaga("materiais", material.id);
      dlg.fecha();
      anuncia("Material excluído");
      aoExcluir?.();
    }
  });
  return dlg;
}
