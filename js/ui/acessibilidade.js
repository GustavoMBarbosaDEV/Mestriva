// Menu de acessibilidade e botão de tema.
import { esc, cn } from "../util.js";
import { icone } from "../icones.js";
import { PADRAO_A11Y, FILTROS_COR } from "../preferencias.js";
import { switchHtml, labelHtml } from "./controles.js";

const TOGGLES = [
  { key: "highContrast", label: "Alto contraste", hint: "Texto mais escuro e bordas reforçadas" },
  { key: "dyslexia", label: "Fonte para dislexia", hint: "Atkinson Hyperlegible, letras mais distintas" },
  { key: "spacious", label: "Espaçamento de leitura", hint: "Mais respiro entre linhas e palavras" },
  { key: "reduceMotion", label: "Reduzir animações", hint: "Desativa movimentos e transições" },
];

const COLOR_VISION = [
  { value: "none", label: "Sem filtro" },
  { value: "protanopia", label: "Protanopia" },
  { value: "deuteranopia", label: "Deuteranopia" },
  { value: "tritanopia", label: "Tritanopia" },
];

const BOTAO_BASE =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground/75 transition hover:border-electric/50 hover:text-foreground";

/** @param {{compacto?: boolean, classe?: string}} p */
export function botaoAcessibilidade({ compacto = false, classe = "" } = {}) {
  return `<button type="button" data-acao="abre-acessibilidade" class="${cn(BOTAO_BASE, "px-3 py-2", compacto && "h-9 w-9 justify-center px-0", esc(classe))}" aria-label="Abrir opções de acessibilidade">${icone("Accessibility")}${compacto ? "" : "Acessibilidade"}</button>`;
}

/** @param {"light"|"dark"} tema @param {{compacto?: boolean, classe?: string}} p */
export function botaoTema(tema, { compacto = false, classe = "" } = {}) {
  const escuro = tema === "dark";
  return `<button type="button" data-acao="alterna-tema" aria-pressed="${escuro}" aria-label="${escuro ? "Ativar tema claro" : "Ativar tema escuro"}" title="${escuro ? "Tema claro" : "Tema escuro"}" class="${cn(BOTAO_BASE, compacto ? "h-9 w-9 justify-center" : "px-3 py-2", esc(classe))}">${icone(escuro ? "Sun" : "Moon")}${compacto ? "" : escuro ? "Tema claro" : "Tema escuro"}</button>`;
}

const BOTAO_TEXTO = "h-10 flex-1 rounded-xl border border-border text-sm font-medium transition hover:bg-secondary";

/** Conteúdo do diálogo de acessibilidade. @param {import("../preferencias.js").A11y} a11y */
export function corpoAcessibilidade(a11y) {
  const filtros = COLOR_VISION.map((o) => {
    const ativo = (a11y.colorVision || "none") === o.value;
    return `<button type="button" role="radio" aria-checked="${ativo}" data-acao="a11y-cor" data-valor="${o.value}" class="${cn(
      "rounded-xl border px-3 py-2 text-xs font-medium transition",
      ativo ? "border-ink bg-ink text-white" : "border-border bg-card text-foreground/70 hover:border-electric/50"
    )}">${o.label}</button>`;
  }).join("");
  const toggles = TOGGLES.map(
    (t) => `<div class="flex items-start justify-between gap-4">
        <div>${labelHtml({ para: "a11y-" + t.key, texto: t.label, classe: "text-sm font-medium" })}<p class="mt-0.5 text-xs text-muted-foreground">${t.hint}</p></div>
        ${switchHtml({ id: "a11y-" + t.key, marcado: Boolean(a11y[t.key]), acao: "a11y-alterna", rotulo: t.label, dados: { chave: t.key } })}
      </div>`
  ).join("");
  return `<div class="space-y-5 pt-1">
    <div>
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm font-medium leading-none">Tamanho do texto</span>
        <span class="font-mono text-xs text-muted-foreground">${Number(a11y.textScale)}%</span>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" data-acao="a11y-texto" data-valor="-5" class="${BOTAO_TEXTO}" aria-label="Diminuir tamanho do texto">A−</button>
        <button type="button" data-acao="a11y-texto" data-valor="0" class="${BOTAO_TEXTO}">Padrão</button>
        <button type="button" data-acao="a11y-texto" data-valor="5" class="${BOTAO_TEXTO}" aria-label="Aumentar tamanho do texto">A+</button>
      </div>
    </div>
    <div>
      <span class="text-sm font-medium leading-none">Filtro para daltonismo</span>
      <p class="mt-0.5 text-xs text-muted-foreground">Reajusta as cores do app para melhorar a distinção entre tons.</p>
      <div class="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Filtro para daltonismo">${filtros}</div>
    </div>
    <div class="space-y-3">${toggles}</div>
    <button type="button" data-acao="a11y-restaura" class="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground">${icone("RotateCcw", "h-3.5 w-3.5")}Restaurar padrões</button>
  </div>`;
}

/**
 * Novo estado depois de uma ação do menu (puro).
 * @param {import("../preferencias.js").A11y} a11y @param {string} acao @param {Record<string,string|undefined>} dados
 */
export function aplicaAcaoA11y(a11y, acao, dados) {
  const a = { ...a11y };
  if (acao === "a11y-texto") {
    const passo = Number(dados.valor) || 0;
    a.textScale = passo === 0 ? 100 : Math.min(145, Math.max(85, a.textScale + passo));
  } else if (acao === "a11y-alterna") {
    if (TOGGLES.some((t) => t.key === dados.chave)) a[dados.chave] = !a[dados.chave];
  } else if (acao === "a11y-cor") {
    a.colorVision = FILTROS_COR.includes(dados.valor) ? dados.valor : "none";
  } else if (acao === "a11y-restaura") {
    return { ...PADRAO_A11Y };
  }
  return a;
}
