// Novidades da versão: mostradas uma vez, só para quem já usava uma versão anterior (padrão do Monetra).
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { abreDialogo } from "./dialogo.js";

const CHAVE = "mestriva.versao.vista";

/** @param {string|null} vista @param {string} atual @param {string[]} novidades */
export const deveMostrarNovidades = (vista, atual, novidades) => Boolean(vista) && vista !== atual && novidades.length > 0;

/** @param {string[]} novidades */
export function corpoNovidades(novidades) {
  return `<ul class="space-y-2.5">${novidades
    .map((n) => `<li class="flex items-start gap-2.5 text-sm"><span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink">${icone("Check", "h-3 w-3 text-neon")}</span><span>${esc(n)}</span></li>`)
    .join("")}</ul>
  <div class="mt-5 flex justify-end"><button type="button" data-fechar class="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90">Entendi</button></div>`;
}

/** @param {string} versao @param {string[]} novidades */
export function mostraNovidades(versao, novidades) {
  let vista = null;
  try { vista = localStorage.getItem(CHAVE); localStorage.setItem(CHAVE, versao); } catch { return; }
  if (!deveMostrarNovidades(vista, versao, novidades)) return;
  abreDialogo({ titulo: `Novidades da versão ${versao}`, corpo: corpoNovidades(novidades), classe: "max-w-md rounded-2xl", classeTitulo: "text-xl" });
}
