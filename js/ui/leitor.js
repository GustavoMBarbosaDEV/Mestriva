// Leitor de material (markdown seguro, ouvir, excluir).
import { icone } from "../icones.js";
import { markdownParaHtml } from "../markdown.js";
import { abreDialogo } from "./dialogo.js";
import { botaoOuvir, fala } from "./fala.js";

export const ROTULO_TIPO = { resumo: "Resumo", guia: "Guia de revisão", mapa: "Mapa mental", revisao: "Revisão complementar" };

export function corpoMaterial(m, falando = false) {
  return `<div class="flex flex-wrap items-center justify-between gap-2 border-b border-hair pb-3">
      ${botaoOuvir(falando)}
      <button type="button" data-acao="excluir-material" class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive disabled:opacity-50">${icone("Trash2", "h-3.5 w-3.5")}Excluir</button>
    </div>
    <article class="study-prose mt-4">${markdownParaHtml(m.content || "")}</article>`;
}

/** @param {{material:any, loja:any, aoExcluir?:() => void, anuncia:(t:string)=>void}} p */
export function abreLeitor({ material, loja, aoExcluir, anuncia }) {
  let parar = () => {};
  let falando = false;
  const dlg = abreDialogo({
    titulo: material.title || "Material",
    descricao: `${ROTULO_TIPO[material.kind] || "Material"} · ${material.subject || "Estudo"}`,
    corpo: corpoMaterial(material),
    classe: "max-h-[88vh] max-w-2xl overflow-y-auto rounded-2xl",
    classeTitulo: "pr-6 text-xl leading-snug",
    aoFechar: () => parar(),
  });
  const area = /** @type {HTMLElement} */ (dlg.elemento.querySelector("[data-corpo]"));
  area.addEventListener("click", (e) => {
    const el = /** @type {HTMLElement} */ (e.target).closest("[data-acao]");
    if (!el) return;
    e.stopPropagation();
    if (el.getAttribute("data-acao") === "ouvir") {
      if (falando) { parar(); falando = false; }
      else {
        falando = true;
        parar = fala(material.content || "", () => { falando = false; dlg.atualiza(corpoMaterial(material, false)); });
      }
      dlg.atualiza(corpoMaterial(material, falando));
    } else if (el.getAttribute("data-acao") === "excluir-material") {
      loja.apaga("materiais", material.id);
      dlg.fecha();
      anuncia("Material excluído");
      aoExcluir?.();
    }
  });
  return dlg;
}
