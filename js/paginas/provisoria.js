// Página temporária: some no plano 2, quando cada tela real chegar.
import { esc } from "../util.js";

/** @param {{rota?: {titulo?: string}}} ctx */
export function render(ctx) {
  return `<section class="panel p-6 sm:p-8">
    <p class="mono-label">Mestriva</p>
    <h1 class="mt-2 text-[28px] font-semibold leading-tight">${esc(ctx.rota?.titulo || "")}</h1>
    <p class="mt-3 text-sm text-muted-foreground">Esta tela chega na próxima etapa.</p>
  </section>`;
}
