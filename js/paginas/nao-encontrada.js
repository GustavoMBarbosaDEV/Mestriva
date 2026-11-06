// Página não encontrada, com as cores do tema.
import { esc } from "../util.js";
import { icone } from "../icones.js";

/** @param {{rota?: {caminho?: string}}} ctx */
export function render(ctx) {
  const pagina = String(ctx.rota?.caminho || "").replace(/^\//, "");
  return `<div class="min-h-screen flex items-center justify-center p-6 bg-background">
  <div class="max-w-md w-full">
    <div class="text-center space-y-6">
      <div class="space-y-2">
        <h1 class="text-7xl font-light text-muted-foreground/50">404</h1>
        <div class="h-0.5 w-16 bg-border mx-auto"></div>
      </div>
      <div class="space-y-3">
        <h2 class="text-2xl font-medium text-foreground">Página não encontrada</h2>
        <p class="text-muted-foreground leading-relaxed">O endereço <span class="font-medium text-foreground">"${esc(pagina)}"</span> não existe no Mestriva.</p>
      </div>
      <div class="pt-6">
        <a href="/" class="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring">${icone("ArrowLeft", "w-4 h-4 mr-2")}Voltar ao início</a>
      </div>
    </div>
  </div>
</div>`;
}
